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
const I18N_DIR = path.resolve(__dirname, '../../i18n');

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
    hidden: data.sidebar_class_name === 'hidden',
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

app.get('/api/locale-status', (req, res) => {
  const locale = req.query.locale;
  if (!locale || locale === 'en') return res.json({ translated: [] });
  const localeDir = path.join(I18N_DIR, locale, 'docusaurus-plugin-content-docs/current');
  if (!fs.existsSync(localeDir)) return res.json({ translated: [] });
  const results = [];
  function scan(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        scan(path.join(dir, entry.name), relPath);
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        results.push(relPath);
      }
    }
  }
  scan(localeDir, '');
  res.json({ translated: results });
});

app.get('/api/page/:path(*)/content', (req, res) => {
  try {
    const locale = req.query.locale;
    let filePath = path.join(DOCS_DIR, req.params.path);
    let isTranslated = false;

    if (locale && locale !== 'en') {
      const localePath = path.join(I18N_DIR, locale, 'docusaurus-plugin-content-docs/current', req.params.path);
      if (fs.existsSync(localePath)) {
        filePath = localePath;
        isTranslated = true;
      }
    }

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const html = marked(content);
    res.json({ frontmatter: data, html, raw: content, isTranslated });
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

app.put('/api/page/:path(*)/hidden', (req, res) => {
  try {
    const filePath = path.join(DOCS_DIR, req.params.path);
    updateFrontmatter(filePath, (data) => {
      if (req.body.hidden) {
        data.sidebar_class_name = 'hidden';
      } else {
        delete data.sidebar_class_name;
      }
    });
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

app.put('/api/category/:path(*)/hidden', (req, res) => {
  try {
    const catFile = path.join(DOCS_DIR, req.params.path, '_category_.json');
    if (!fs.existsSync(catFile)) return res.status(404).json({ error: 'Category not found' });
    const cat = JSON.parse(fs.readFileSync(catFile, 'utf-8'));
    if (req.body.hidden) {
      cat.className = 'hidden';
    } else {
      delete cat.className;
    }
    fs.writeFileSync(catFile, JSON.stringify(cat, null, 2) + '\n');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pillar/:name/published', (req, res) => {
  try {
    const flagsPath = path.join(DOCS_DIR, 'publishing/docFlags.js');
    let content = fs.readFileSync(flagsPath, 'utf-8');
    const name = req.params.name;
    const newValue = req.body.published;
    const regex = new RegExp(`('${name}':\\s*)(?:true |false)(,?)`);
    if (!regex.test(content)) return res.status(404).json({ error: `Pillar '${name}' not found in docFlags.js` });
    content = content.replace(regex, `$1${newValue ? 'true ' : 'false'}$2`);
    fs.writeFileSync(flagsPath, content);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/save-content', (req, res) => {
  try {
    const filePath = path.join(DOCS_DIR, req.body.path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(raw);
    const updated = matter.stringify(req.body.content, parsed.data);
    const tmpPath = filePath + '.tmp';
    fs.writeFileSync(tmpPath, updated);
    fs.renameSync(tmpPath, filePath);
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

app.delete('/api/page/:path(*)', (req, res) => {
  try {
    const filePath = path.join(DOCS_DIR, req.params.path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    // Safety: only allow deleting .md/.mdx files inside DOCS_DIR
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(DOCS_DIR) || !/\.(md|mdx)$/.test(resolved)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    fs.unlinkSync(resolved);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/category/create', (req, res) => {
  try {
    const { name, label, position } = req.body;
    const safeName = name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const dirPath = path.join(DOCS_DIR, safeName);
    if (fs.existsSync(dirPath)) return res.status(409).json({ error: 'Category already exists' });
    fs.mkdirSync(dirPath, { recursive: true });
    const catMeta = { label: label || safeName, position: position ?? 999 };
    fs.writeFileSync(path.join(dirPath, '_category_.json'), JSON.stringify(catMeta, null, 2) + '\n');
    res.json({ ok: true, path: safeName });
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
  console.log(`\n  🦕 Doc Dino running at http://localhost:${PORT}\n`);
  console.log(`  Watching: ${DOCS_DIR}\n`);
});
