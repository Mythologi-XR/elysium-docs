const express = require('express');
const path = require('path');
const fs = require('fs');
const { glob } = require('glob');
const matter = require('gray-matter');
const chokidar = require('chokidar');
const { marked } = require('marked');

const app = express();
const PORT = 3333;
const DOCS_DIR = path.resolve(__dirname, '../../docs');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── SSE clients ───
const sseClients = new Set();

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('data: connected\n\n');
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) client.write(msg);
}

// ─── File watcher ───
let debounceTimer = null;
const watcher = chokidar.watch(
  [path.join(DOCS_DIR, '**/*.md'), path.join(DOCS_DIR, '**/*.mdx'), path.join(DOCS_DIR, '**/_category_.json')],
  { ignoreInitial: true, ignored: /node_modules/ }
);

watcher.on('all', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => broadcast('tree-updated', {}), 300);
});

// ─── Helpers ───

function readDocFlags() {
  try {
    delete require.cache[require.resolve(path.join(DOCS_DIR, 'publishing/docFlags.js'))];
    return require(path.join(DOCS_DIR, 'publishing/docFlags.js'));
  } catch {
    return { pillars: {}, pages: {} };
  }
}

function readCategory(dirPath) {
  const catFile = path.join(dirPath, '_category_.json');
  if (fs.existsSync(catFile)) {
    return JSON.parse(fs.readFileSync(catFile, 'utf-8'));
  }
  return null;
}

function readPage(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const relPath = path.relative(DOCS_DIR, filePath);
  const h1Match = content.match(/^#\s+(.+)$/m);
  return {
    path: relPath,
    title: data.title || (h1Match ? h1Match[1] : path.basename(filePath, path.extname(filePath))),
    sidebar_position: data.sidebar_position ?? 999,
    slug: data.slug || null,
    draft: data.draft || false,
    id: data.id || null,
  };
}

async function buildTree() {
  const { pillars } = readDocFlags();
  const entries = fs.readdirSync(DOCS_DIR, { withFileTypes: true });
  const categories = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = path.join(DOCS_DIR, entry.name);
    const catMeta = readCategory(dirPath);
    const dirName = entry.name;

    const cat = {
      path: dirName,
      label: catMeta?.label || dirName,
      position: catMeta?.position ?? 999,
      collapsed: catMeta?.collapsed ?? true,
      published: pillars[dirName] ?? null,
      className: catMeta?.className || null,
      pages: [],
      subcategories: [],
    };

    // Read pages in this directory
    const mdFiles = await glob('*.{md,mdx}', { cwd: dirPath });
    for (const f of mdFiles) {
      cat.pages.push(readPage(path.join(dirPath, f)));
    }
    cat.pages.sort((a, b) => a.sidebar_position - b.sidebar_position);

    // Read subdirectories (one level deep)
    const subEntries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const sub of subEntries) {
      if (!sub.isDirectory()) continue;
      const subDirPath = path.join(dirPath, sub.name);
      const subCatMeta = readCategory(subDirPath);
      const subCat = {
        path: `${dirName}/${sub.name}`,
        label: subCatMeta?.label || sub.name,
        position: subCatMeta?.position ?? 999,
        pages: [],
      };
      const subFiles = await glob('*.{md,mdx}', { cwd: subDirPath });
      for (const f of subFiles) {
        subCat.pages.push(readPage(path.join(subDirPath, f)));
      }
      subCat.pages.sort((a, b) => a.sidebar_position - b.sidebar_position);
      cat.subcategories.push(subCat);
    }
    cat.subcategories.sort((a, b) => a.position - b.position);
    categories.push(cat);
  }

  // Also pick up root-level .md files (if any)
  const rootMdFiles = await glob('*.{md,mdx}', { cwd: DOCS_DIR });
  if (rootMdFiles.length > 0) {
    const rootCat = { path: '.', label: 'Root', position: -1, pages: [], subcategories: [], published: null, className: null };
    for (const f of rootMdFiles) rootCat.pages.push(readPage(path.join(DOCS_DIR, f)));
    rootCat.pages.sort((a, b) => a.sidebar_position - b.sidebar_position);
    categories.push(rootCat);
  }

  categories.sort((a, b) => a.position - b.position);
  return { categories };
}

// ─── API Routes ───

app.get('/api/tree', async (req, res) => {
  try {
    const tree = await buildTree();
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/page/:path(*)/content', (req, res) => {
  try {
    const filePath = path.join(DOCS_DIR, req.params.path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const html = marked(content);
    res.json({ frontmatter: data, html, raw: content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function updateFrontmatter(filePath, updater) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(raw);
  updater(parsed.data);
  // Clean up: remove draft if false
  if (parsed.data.draft === false) delete parsed.data.draft;
  const updated = matter.stringify(parsed.content, parsed.data);
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, updated);
  fs.renameSync(tmpPath, filePath);
}

app.put('/api/page/:path(*)/position', (req, res) => {
  try {
    const filePath = path.join(DOCS_DIR, req.params.path);
    updateFrontmatter(filePath, (data) => { data.sidebar_position = req.body.position; });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/page/:path(*)/title', (req, res) => {
  try {
    const filePath = path.join(DOCS_DIR, req.params.path);
    updateFrontmatter(filePath, (data) => { data.title = req.body.title; });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/page/:path(*)/draft', (req, res) => {
  try {
    const filePath = path.join(DOCS_DIR, req.params.path);
    updateFrontmatter(filePath, (data) => { data.draft = req.body.draft; });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/page/:path(*)/move', (req, res) => {
  try {
    const srcPath = path.join(DOCS_DIR, req.params.path);
    const destDir = path.join(DOCS_DIR, req.body.category);
    const destPath = path.join(destDir, path.basename(srcPath));
    if (!fs.existsSync(destDir)) return res.status(400).json({ error: 'Destination category does not exist' });
    fs.renameSync(srcPath, destPath);
    updateFrontmatter(destPath, (data) => { data.sidebar_position = req.body.position; });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/category/:path(*)/label', (req, res) => {
  try {
    const catFile = path.join(DOCS_DIR, req.params.path, '_category_.json');
    if (!fs.existsSync(catFile)) return res.status(404).json({ error: 'Category not found' });
    const cat = JSON.parse(fs.readFileSync(catFile, 'utf-8'));
    cat.label = req.body.label;
    fs.writeFileSync(catFile, JSON.stringify(cat, null, 2) + '\n');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/category/:path(*)/position', (req, res) => {
  try {
    const catFile = path.join(DOCS_DIR, req.params.path, '_category_.json');
    if (!fs.existsSync(catFile)) return res.status(404).json({ error: 'Category not found' });
    const cat = JSON.parse(fs.readFileSync(catFile, 'utf-8'));
    cat.position = req.body.position;
    fs.writeFileSync(catFile, JSON.stringify(cat, null, 2) + '\n');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reorder', (req, res) => {
  try {
    const { pages } = req.body; // [{ path, position }]
    for (const p of pages) {
      const filePath = path.join(DOCS_DIR, p.path);
      if (fs.existsSync(filePath)) {
        updateFrontmatter(filePath, (data) => { data.sidebar_position = p.position; });
      }
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/page/create', (req, res) => {
  try {
    const { category, filename, title, draft, position, content } = req.body;
    const safeName = filename.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const filePath = path.join(DOCS_DIR, category, `${safeName}.md`);
    if (fs.existsSync(filePath)) return res.status(409).json({ error: 'File already exists' });

    const frontmatter = { sidebar_position: position, title };
    if (draft) frontmatter.draft = true;

    const body = content ? `\n# ${title}\n\n${content}\n` : `\n# ${title}\n`;
    const fileContent = matter.stringify(body, frontmatter);
    fs.writeFileSync(filePath, fileContent);

    // Bump positions of sibling pages at or after this position
    const dirPath = path.join(DOCS_DIR, category);
    const siblings = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    for (const sib of siblings) {
      const sibPath = path.join(dirPath, sib);
      if (sibPath === filePath) continue;
      const raw = fs.readFileSync(sibPath, 'utf-8');
      const parsed = matter(raw);
      if (parsed.data.sidebar_position >= position) {
        parsed.data.sidebar_position += 1;
        fs.writeFileSync(sibPath, matter.stringify(parsed.content, parsed.data));
      }
    }

    res.json({ ok: true, path: path.relative(DOCS_DIR, filePath) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ───

app.listen(PORT, () => {
  console.log(`\n  📄 Doc Organizer running at http://localhost:${PORT}\n`);
  console.log(`  Watching: ${DOCS_DIR}\n`);
});
