// ─── State ───
let treeData = null;
let draggedItem = null;
let draggedType = null; // 'page' or 'category'

// ─── SSE ───
const evtSource = new EventSource('/api/events');
const statusEl = document.getElementById('status');

evtSource.onopen = () => {
  statusEl.textContent = 'Connected';
  statusEl.className = 'status connected';
};
evtSource.addEventListener('tree-updated', () => loadTree());
evtSource.onerror = () => {
  statusEl.textContent = 'Disconnected';
  statusEl.className = 'status';
};

// ─── Tree Loading ───
async function loadTree() {
  const res = await fetch('/api/tree');
  treeData = await res.json();
  renderTree();
}

function renderTree() {
  const container = document.getElementById('tree-container');
  container.innerHTML = '';
  if (!treeData?.categories?.length) {
    container.innerHTML = '<div class="empty-state">No docs found</div>';
    return;
  }
  for (const cat of treeData.categories) {
    container.appendChild(renderCategory(cat, false));
  }
}

function renderCategory(cat, isSub) {
  const el = document.createElement('div');
  el.className = isSub ? 'category subcategory' : 'category';
  el.dataset.catPath = cat.path;
  if (!isSub) {
    el.draggable = true;
    el.addEventListener('dragstart', (e) => onCatDragStart(e, cat));
    el.addEventListener('dragend', onCatDragEnd);
    el.addEventListener('dragover', (e) => onCatDragOver(e, el));
    el.addEventListener('drop', (e) => onCatDrop(e, cat));
  }

  // Header
  const header = document.createElement('div');
  header.className = 'category-header expanded';
  let collapsed = false;

  const dragHandle = document.createElement('span');
  dragHandle.className = 'cat-drag-handle';
  dragHandle.textContent = '⠿';
  if (!isSub) header.appendChild(dragHandle);

  const chevron = document.createElement('span');
  chevron.className = 'cat-chevron open';
  chevron.textContent = '▶';
  header.appendChild(chevron);

  const label = document.createElement('span');
  label.className = 'cat-label';
  label.textContent = cat.label;
  label.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    startCatLabelEdit(label, cat);
  });
  header.appendChild(label);

  // Badges
  if (cat.published === true) {
    header.appendChild(makeBadge('PUBLISHED', 'published'));
  } else if (cat.published === false) {
    header.appendChild(makeBadge('UNPUBLISHED', 'unpublished'));
  }
  if (cat.className === 'hidden') {
    header.appendChild(makeBadge('HIDDEN', 'hidden'));
  }

  // Add page button
  if (!isSub || cat.pages.length > 0 || true) {
    const addBtn = document.createElement('button');
    addBtn.className = 'cat-add-btn';
    addBtn.textContent = '+';
    addBtn.title = 'Add page';
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCreateModal(cat);
    });
    header.appendChild(addBtn);
  }

  header.addEventListener('click', () => {
    collapsed = !collapsed;
    pagesList.className = collapsed ? 'cat-pages collapsed' : 'cat-pages';
    chevron.className = collapsed ? 'cat-chevron' : 'cat-chevron open';
    header.className = collapsed ? 'category-header' : 'category-header expanded';
  });

  el.appendChild(header);

  // Pages list
  const pagesList = document.createElement('ul');
  pagesList.className = 'cat-pages';

  for (const page of cat.pages) {
    pagesList.appendChild(renderPageItem(page, cat));
  }

  // Subcategories
  for (const sub of cat.subcategories || []) {
    const subEl = renderCategory(sub, true);
    pagesList.appendChild(subEl);
  }

  el.appendChild(pagesList);
  return el;
}

function renderPageItem(page, cat) {
  const li = document.createElement('li');
  li.className = 'page-item';
  li.draggable = true;
  li.dataset.pagePath = page.path;

  li.addEventListener('dragstart', (e) => onPageDragStart(e, page));
  li.addEventListener('dragend', onPageDragEnd);
  li.addEventListener('dragover', (e) => onPageDragOver(e, li));
  li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
  li.addEventListener('drop', (e) => onPageDrop(e, page, cat));

  const dragHandle = document.createElement('span');
  dragHandle.className = 'page-drag-handle';
  dragHandle.textContent = '⠿';
  li.appendChild(dragHandle);

  const pos = document.createElement('span');
  pos.className = 'page-position';
  pos.textContent = page.sidebar_position;
  li.appendChild(pos);

  const title = document.createElement('span');
  title.className = 'page-title' + (page.draft ? ' is-draft' : '');
  title.textContent = page.title;
  title.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    startPageTitleEdit(title, page);
  });
  li.appendChild(title);

  if (page.draft) {
    const draftLabel = document.createElement('span');
    draftLabel.className = 'page-draft-label';
    draftLabel.textContent = 'DRAFT';
    li.appendChild(draftLabel);
  }

  const toggle = document.createElement('button');
  toggle.className = 'draft-toggle' + (page.draft ? '' : ' active');
  toggle.title = page.draft ? 'Set as published' : 'Set as draft';
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDraft(page);
  });
  li.appendChild(toggle);

  const filePath = document.createElement('span');
  filePath.className = 'page-path';
  filePath.textContent = page.path.split('/').pop();
  li.appendChild(filePath);

  // Click to preview (but not on drag handle, toggle, or during edit)
  li.addEventListener('click', (e) => {
    if (e.target.closest('.page-drag-handle, .draft-toggle, input')) return;
    openPreviewModal(page, cat);
  });

  return li;
}

function makeBadge(text, cls) {
  const span = document.createElement('span');
  span.className = 'cat-badge ' + cls;
  span.textContent = text;
  return span;
}

// ─── Inline Editing ───

function startPageTitleEdit(titleEl, page) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'page-title-input';
  input.value = page.title;
  titleEl.replaceWith(input);
  input.focus();
  input.select();

  const save = async () => {
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== page.title) {
      await fetch(`/api/page/${encodeURIComponent(page.path)}/title`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
    }
    loadTree();
  };

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') { input.value = page.title; input.blur(); }
  });
}

function startCatLabelEdit(labelEl, cat) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'cat-label-input';
  input.value = cat.label;
  labelEl.replaceWith(input);
  input.focus();
  input.select();

  const save = async () => {
    const newLabel = input.value.trim();
    if (newLabel && newLabel !== cat.label) {
      await fetch(`/api/category/${encodeURIComponent(cat.path)}/label`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel }),
      });
    }
    loadTree();
  };

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') { input.value = cat.label; input.blur(); }
  });
}

async function toggleDraft(page) {
  await fetch(`/api/page/${encodeURIComponent(page.path)}/draft`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draft: !page.draft }),
  });
  loadTree();
}

// ─── Page Drag & Drop ───

function onPageDragStart(e, page) {
  draggedItem = page;
  draggedType = 'page';
  e.dataTransfer.effectAllowed = 'move';
  e.target.classList.add('dragging');
}

function onPageDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  draggedItem = null;
  draggedType = null;
}

function onPageDragOver(e, li) {
  if (draggedType !== 'page') return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  li.classList.add('drag-over');
}

async function onPageDrop(e, targetPage, cat) {
  e.preventDefault();
  e.stopPropagation();
  if (!draggedItem || draggedType !== 'page' || draggedItem.path === targetPage.path) return;

  const sameCat = draggedItem.path.split('/').slice(0, -1).join('/') ===
                  targetPage.path.split('/').slice(0, -1).join('/');

  if (sameCat) {
    // Reorder within same category
    const pages = [...cat.pages].filter(p => p.path !== draggedItem.path);
    const targetIdx = pages.findIndex(p => p.path === targetPage.path);
    pages.splice(targetIdx, 0, { ...draggedItem });
    const reorder = pages.map((p, i) => ({ path: p.path, position: i + 1 }));
    await fetch('/api/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages: reorder }),
    });
  } else {
    // Move to different category
    const targetDir = targetPage.path.split('/').slice(0, -1).join('/');
    await fetch(`/api/page/${encodeURIComponent(draggedItem.path)}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: targetDir, position: targetPage.sidebar_position }),
    });
  }

  loadTree();
}

// ─── Category Drag & Drop ───

function onCatDragStart(e, cat) {
  draggedItem = cat;
  draggedType = 'category';
  e.dataTransfer.effectAllowed = 'move';
}

function onCatDragEnd() {
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  draggedItem = null;
  draggedType = null;
}

function onCatDragOver(e, el) {
  if (draggedType !== 'category') return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

async function onCatDrop(e, targetCat) {
  e.preventDefault();
  if (!draggedItem || draggedType !== 'category' || draggedItem.path === targetCat.path) return;

  // Swap positions
  const draggedPos = draggedItem.position;
  const targetPos = targetCat.position;

  await Promise.all([
    fetch(`/api/category/${encodeURIComponent(draggedItem.path)}/position`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: targetPos }),
    }),
    fetch(`/api/category/${encodeURIComponent(targetCat.path)}/position`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: draggedPos }),
    }),
  ]);

  loadTree();
}

// ─── Preview Modal ───

const previewModal = document.getElementById('preview-modal');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalBody = document.getElementById('modal-body');
const modalDots = document.getElementById('modal-dots');
const modalPrev = document.getElementById('modal-prev');
const modalNext = document.getElementById('modal-next');
const modalClose = document.getElementById('modal-close');

let previewPages = [];
let previewIndex = 0;

async function openPreviewModal(page, cat) {
  // Collect all pages in this category for navigation
  previewPages = [...cat.pages];
  previewIndex = previewPages.findIndex(p => p.path === page.path);
  if (previewIndex === -1) previewIndex = 0;

  await showPreviewPage();
  previewModal.classList.add('open');
}

async function showPreviewPage() {
  const page = previewPages[previewIndex];
  modalTitle.textContent = page.title;
  modalSubtitle.textContent = page.path;
  modalBody.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px">Loading...</div>';

  const res = await fetch(`/api/page/${encodeURIComponent(page.path)}/content`);
  const data = await res.json();
  modalBody.innerHTML = data.html || '<p style="color:var(--text-muted)">No content</p>';

  // Dots
  modalDots.innerHTML = '';
  for (let i = 0; i < previewPages.length; i++) {
    const dot = document.createElement('span');
    dot.className = 'step-dot' + (i === previewIndex ? ' active' : i < previewIndex ? ' visited' : '');
    dot.addEventListener('click', () => { previewIndex = i; showPreviewPage(); });
    modalDots.appendChild(dot);
  }

  modalPrev.disabled = previewIndex === 0;
  modalNext.disabled = previewIndex === previewPages.length - 1;
  modalNext.textContent = previewIndex === previewPages.length - 1 ? 'Done' : 'Next →';
}

modalPrev.addEventListener('click', () => {
  if (previewIndex > 0) { previewIndex--; showPreviewPage(); }
});
modalNext.addEventListener('click', () => {
  if (previewIndex < previewPages.length - 1) { previewIndex++; showPreviewPage(); }
  else closePreviewModal();
});
modalClose.addEventListener('click', closePreviewModal);
previewModal.addEventListener('click', (e) => { if (e.target === previewModal) closePreviewModal(); });

function closePreviewModal() {
  previewModal.classList.remove('open');
}

// ─── Create Page Modal ───

const createModal = document.getElementById('create-modal');
const createTitle = document.getElementById('create-title');
const createSubtitle = document.getElementById('create-subtitle');
const createBody = document.getElementById('create-body');
const createDots = document.getElementById('create-dots');
const createPrev = document.getElementById('create-prev');
const createNext = document.getElementById('create-next');
const createClose = document.getElementById('create-close');

let createStep = 0;
let createCat = null;
let createData = { title: '', filename: '', draft: false, position: 1, content: '' };

function openCreateModal(cat) {
  createCat = cat;
  createStep = 0;
  createData = { title: '', filename: '', draft: false, position: cat.pages.length + 1, content: '' };
  createSubtitle.textContent = cat.path;
  renderCreateStep();
  createModal.classList.add('open');
}

function renderCreateStep() {
  const totalSteps = 3;
  createTitle.textContent = ['Page Details', 'Options', 'Initial Content'][createStep];

  // Dots
  createDots.innerHTML = '';
  for (let i = 0; i < totalSteps; i++) {
    const dot = document.createElement('span');
    dot.className = 'step-dot' + (i === createStep ? ' active' : i < createStep ? ' visited' : '');
    createDots.appendChild(dot);
  }

  createPrev.disabled = createStep === 0;
  createNext.textContent = createStep === totalSteps - 1 ? 'Create' : 'Next →';

  if (createStep === 0) {
    createBody.innerHTML = `
      <div class="form-group">
        <label class="form-label">Page Title</label>
        <input class="form-input" id="create-page-title" placeholder="My New Page" value="${esc(createData.title)}">
      </div>
      <div class="form-group">
        <label class="form-label">Filename</label>
        <input class="form-input" id="create-page-filename" placeholder="my-new-page" value="${esc(createData.filename)}" style="font-family:monospace">
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">.md extension added automatically</div>
      </div>
    `;
    const titleInput = document.getElementById('create-page-title');
    const filenameInput = document.getElementById('create-page-filename');
    titleInput.addEventListener('input', () => {
      createData.title = titleInput.value;
      if (!createData._filenameManual) {
        createData.filename = slugify(titleInput.value);
        filenameInput.value = createData.filename;
      }
    });
    filenameInput.addEventListener('input', () => {
      createData.filename = filenameInput.value;
      createData._filenameManual = true;
    });
    titleInput.focus();
  } else if (createStep === 1) {
    const posOptions = createCat.pages.map((p, i) =>
      `<option value="${i + 1}" ${createData.position === i + 1 ? 'selected' : ''}>Before: ${esc(p.title)}</option>`
    ).join('') + `<option value="${createCat.pages.length + 1}" ${createData.position === createCat.pages.length + 1 ? 'selected' : ''}>At end</option>`;

    createBody.innerHTML = `
      <div class="form-group">
        <label class="form-label">Position</label>
        <select class="form-select" id="create-page-position">${posOptions}</select>
      </div>
      <div class="form-group">
        <div class="toggle-row">
          <button class="draft-toggle ${createData.draft ? '' : 'active'}" id="create-page-draft"></button>
          <span class="toggle-label">${createData.draft ? 'Draft (hidden from production)' : 'Published'}</span>
        </div>
      </div>
    `;
    document.getElementById('create-page-position').addEventListener('change', (e) => {
      createData.position = parseInt(e.target.value);
    });
    document.getElementById('create-page-draft').addEventListener('click', () => {
      createData.draft = !createData.draft;
      renderCreateStep();
    });
  } else if (createStep === 2) {
    createBody.innerHTML = `
      <div class="form-group">
        <label class="form-label">Initial Content (optional)</label>
        <textarea class="form-textarea" id="create-page-content" placeholder="Enter an opening paragraph for this page...">${esc(createData.content)}</textarea>
      </div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:8px;">
        File: <code>${esc(createCat.path)}/${esc(createData.filename || 'untitled')}.md</code>
      </div>
    `;
    document.getElementById('create-page-content').addEventListener('input', (e) => {
      createData.content = e.target.value;
    });
  }
}

createPrev.addEventListener('click', () => {
  if (createStep > 0) { saveCreateStepData(); createStep--; renderCreateStep(); }
});

createNext.addEventListener('click', async () => {
  saveCreateStepData();
  if (createStep < 2) { createStep++; renderCreateStep(); }
  else await submitCreatePage();
});

createClose.addEventListener('click', () => createModal.classList.remove('open'));
createModal.addEventListener('click', (e) => { if (e.target === createModal) createModal.classList.remove('open'); });

function saveCreateStepData() {
  if (createStep === 0) {
    const t = document.getElementById('create-page-title');
    const f = document.getElementById('create-page-filename');
    if (t) createData.title = t.value;
    if (f) createData.filename = f.value;
  } else if (createStep === 1) {
    const p = document.getElementById('create-page-position');
    if (p) createData.position = parseInt(p.value);
  } else if (createStep === 2) {
    const c = document.getElementById('create-page-content');
    if (c) createData.content = c.value;
  }
}

async function submitCreatePage() {
  if (!createData.title.trim()) { alert('Page title is required'); createStep = 0; renderCreateStep(); return; }
  if (!createData.filename.trim()) createData.filename = slugify(createData.title);

  await fetch('/api/page/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: createCat.path,
      filename: createData.filename,
      title: createData.title,
      draft: createData.draft,
      position: createData.position,
      content: createData.content,
    }),
  });

  createModal.classList.remove('open');
  loadTree();
}

// ─── Keyboard Shortcuts ───

document.addEventListener('keydown', (e) => {
  if (previewModal.classList.contains('open')) {
    if (e.key === 'Escape') closePreviewModal();
    if (e.key === 'ArrowLeft' && previewIndex > 0) { previewIndex--; showPreviewPage(); }
    if (e.key === 'ArrowRight' && previewIndex < previewPages.length - 1) { previewIndex++; showPreviewPage(); }
  }
  if (createModal.classList.contains('open')) {
    if (e.key === 'Escape') createModal.classList.remove('open');
  }
});

// ─── Utils ───

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ─── Init ───
loadTree();
