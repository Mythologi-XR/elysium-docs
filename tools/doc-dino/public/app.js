// ─── State ───
let treeData = null;
let localeStatus = new Set(); // relative paths that have translations for the active locale
let draggedItem = null;
let draggedType = null; // 'page' or 'category'
let draggedCat = null; // category the dragged page belongs to
let dropIndicator = null; // the visible drop line element
let currentDropTarget = null; // { li, position: 'before'|'after' }

// ─── SSE ───
const evtSource = new EventSource('/api/events');
const statusEl = document.getElementById('status');

const WIFI_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M1.5 9.288a15 15 0 0 1 21 0"/></svg>';
const WIFI_OFF_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M2 2l20 20"/><path d="M10.127 12.859A10 10 0 0 1 19 12.859"/><path d="M6.733 9.288A15 15 0 0 1 22.5 9.288"/></svg>';

evtSource.onopen = () => {
  statusEl.innerHTML = WIFI_ICON + t('connected');
  statusEl.className = 'status connected';
};
evtSource.addEventListener('tree-updated', () => loadTree());
evtSource.onerror = () => {
  statusEl.innerHTML = WIFI_OFF_ICON + t('disconnected');
  statusEl.className = 'status';
};

// ─── Language Switcher ───
const langSwitcher = document.getElementById('lang-switcher');
const langCode = document.getElementById('lang-code');

function updateLangSwitcher() {
  const loc = SUPPORTED_LOCALES.find(l => l.code === getLocale()) || SUPPORTED_LOCALES[0];
  langCode.textContent = loc.short;
  langSwitcher.title = loc.label;
}

langSwitcher.addEventListener('click', async () => {
  const available = SUPPORTED_LOCALES.filter(l => TRANSLATIONS[l.code]);
  const idx = available.findIndex(l => l.code === getLocale());
  const next = available[(idx + 1) % available.length];
  setLocale(next.code);
  updateLangSwitcher();
  await fetchLocaleStatus();
  renderTree();
  // Update status text
  if (statusEl.classList.contains('connected')) {
    statusEl.innerHTML = WIFI_ICON + t('connected');
  } else {
    statusEl.innerHTML = WIFI_OFF_ICON + t('disconnected');
  }
});

updateLangSwitcher();

// ─── Locale Status ───
async function fetchLocaleStatus() {
  const locale = getLocale();
  if (locale === 'en') { localeStatus = new Set(); return; }
  const res = await fetch(`/api/locale-status?locale=${locale}`);
  const data = await res.json();
  localeStatus = new Set(data.translated || []);
}

// ─── Tree Loading ───
async function loadTree() {
  const [treeRes] = await Promise.all([
    fetch('/api/tree'),
    fetchLocaleStatus(),
  ]);
  treeData = await treeRes.json();
  renderTree();
}

function renderTree() {
  const container = document.getElementById('tree-container');
  container.innerHTML = '';

  // "New Category" button at top of tree
  const newCatBtn = document.createElement('button');
  newCatBtn.className = 'new-cat-btn';
  newCatBtn.innerHTML = '+ ' + t('newCategory');
  newCatBtn.addEventListener('click', () => openCreateCategoryModal());
  container.appendChild(newCatBtn);

  if (!treeData?.categories?.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = t('noDocs');
    container.appendChild(empty);
  } else {
    for (const cat of treeData.categories) {
      container.appendChild(renderCategory(cat, false));
    }
  }
  renderSidebar();
}

// ─── Sidebar ───
const sidebar = document.getElementById('sidebar');
const sidebarTree = document.getElementById('sidebar-tree');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarToggleFloat = document.getElementById('sidebar-toggle-float');

sidebarToggle.addEventListener('click', () => sidebar.classList.add('collapsed'));
sidebarToggleFloat.addEventListener('click', () => sidebar.classList.remove('collapsed'));

function renderSidebar() {
  sidebarTree.innerHTML = '';
  if (!treeData?.categories?.length) return;
  for (const cat of treeData.categories) {
    sidebarTree.appendChild(renderSidebarCategory(cat, false));
  }
}

function renderSidebarCategory(cat, isSub) {
  const el = document.createElement('div');
  el.className = 'sb-category';

  const header = document.createElement('div');
  header.className = isSub ? 'sb-subcat-header' : 'sb-cat-header';

  const chevron = document.createElement('span');
  chevron.className = 'sb-chevron';
  chevron.textContent = '▶';
  header.appendChild(chevron);

  const label = document.createElement('span');
  label.className = 'sb-cat-label';
  label.textContent = cat.label;
  header.appendChild(label);

  el.appendChild(header);

  const pagesList = document.createElement('ul');
  pagesList.className = 'sb-pages collapsed';

  for (const page of cat.pages) {
    const li = document.createElement('li');
    li.className = 'sb-page' + (page.draft ? ' is-draft' : '');
    li.textContent = page.title;
    li.addEventListener('click', (e) => {
      e.stopPropagation();
      scrollToElement('page-' + page.path.replace(/[^a-z0-9-]/gi, '-'));
    });
    pagesList.appendChild(li);
  }

  for (const sub of cat.subcategories || []) {
    pagesList.appendChild(renderSidebarCategory(sub, true));
  }

  el.appendChild(pagesList);

  header.addEventListener('click', () => {
    const isCollapsed = pagesList.classList.contains('collapsed');
    pagesList.classList.toggle('collapsed');
    chevron.className = isCollapsed ? 'sb-chevron open' : 'sb-chevron';
    // Also scroll to this category in main tree
    scrollToElement('cat-' + cat.path.replace(/[^a-z0-9-]/gi, '-'));
  });

  return el;
}

function scrollToElement(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const offset = rect.top + window.scrollY - window.innerHeight * 0.35;
  window.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
  // Brief highlight
  el.classList.add('scroll-highlight');
  setTimeout(() => el.classList.remove('scroll-highlight'), 1200);
}

function renderCategory(cat, isSub) {
  const el = document.createElement('div');
  el.className = isSub ? 'category subcategory' : 'category';
  el.dataset.catPath = cat.path;
  el.id = 'cat-' + cat.path.replace(/[^a-z0-9-]/gi, '-');
  if (!isSub) {
    el.draggable = true;
    el.addEventListener('dragstart', (e) => onCatDragStart(e, cat));
    el.addEventListener('dragend', onDragEnd);
    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (draggedType === 'category' && draggedItem.path !== cat.path) {
        const rect = el.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = e.clientY < midY ? 'before' : 'after';
        showDropIndicator(el, position);
        currentDropTarget = { li: el, position, cat };
      } else if (draggedType === 'page') {
        // Page dragged over category header — allow drop into this category
        el.classList.add('drag-over-cat');
        currentDropTarget = { li: el, position: 'into', cat };
      }
    });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over-cat'));
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.remove('drag-over-cat');
      if (!currentDropTarget) return;
      if (draggedType === 'category' && draggedItem.path !== cat.path) {
        handleCatDrop(currentDropTarget.cat, currentDropTarget.position);
      } else if (draggedType === 'page' && draggedItem) {
        handlePageDropIntoCat(cat);
      }
      clearDropIndicator();
    });
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

  // Translation coverage badge (non-EN only)
  if (getLocale() !== 'en') {
    const allPages = [...(cat.pages || []), ...(cat.subcategories || []).flatMap(s => s.pages || [])];
    const translatedCount = allPages.filter(p => localeStatus.has(p.path)).length;
    const total = allPages.length;
    if (total > 0) {
      const transBadge = document.createElement('span');
      const locale = getLocale().toUpperCase();
      const allTranslated = translatedCount === total;
      transBadge.className = 'trans-badge cat-trans-badge' + (allTranslated ? ' translated' : translatedCount > 0 ? ' partial' : ' fallback');
      transBadge.textContent = allTranslated ? locale : `${locale} ${translatedCount}/${total}`;
      transBadge.title = `${translatedCount} of ${total} pages translated`;
      header.appendChild(transBadge);
    }
  }

  // Right-aligned controls group
  const catControls = document.createElement('div');
  catControls.className = 'item-controls';

  if (cat.published === true || cat.published === false) {
    const pubBtn = document.createElement('button');
    pubBtn.className = 'pub-icon-btn' + (cat.published ? ' is-published' : ' is-unpublished');
    pubBtn.innerHTML = cat.published ? ICON_PUBLISHED : ICON_UNPUBLISHED;
    pubBtn.title = cat.published ? t('clickToUnpublish') : t('clickToPublish');
    pubBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePillarPublished(cat);
    });
    catControls.appendChild(pubBtn);
  }

  const eyeBtn = makeEyeToggle(cat.className !== 'hidden', () => {
    toggleCategoryHidden(cat);
  });
  eyeBtn.addEventListener('click', (e) => e.stopPropagation());
  catControls.appendChild(eyeBtn);

  // Add page button (inside controls for alignment with page rows)
  const addBtn = document.createElement('button');
  addBtn.className = 'cat-add-btn';
  addBtn.textContent = '+';
  addBtn.title = t('addPage');
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openCreateModal(cat);
  });
  catControls.appendChild(addBtn);

  header.appendChild(catControls);

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
  li.dataset.catPath = cat.path;
  li.id = 'page-' + page.path.replace(/[^a-z0-9-]/gi, '-');

  li.addEventListener('dragstart', (e) => {
    e.stopPropagation();
    draggedItem = page;
    draggedCat = cat;
    draggedType = 'page';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', page.path);
    requestAnimationFrame(() => li.classList.add('dragging'));
  });

  li.addEventListener('dragend', (e) => {
    onDragEnd(e);
    draggedCat = null;
  });

  li.addEventListener('dragover', (e) => {
    if (draggedType !== 'page') return;
    if (draggedItem.path === page.path) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    // Cross-category: highlight target category instead of showing reorder line
    const srcDir = draggedItem.path.split('/').slice(0, -1).join('/');
    const destDir = page.path.split('/').slice(0, -1).join('/');
    if (srcDir !== destDir) {
      clearDropIndicator();
      const catEl = li.closest('.category');
      if (catEl) catEl.classList.add('drag-over-cat');
      currentDropTarget = { li: catEl, position: 'into', cat };
    } else {
      const rect = li.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const position = e.clientY < midY ? 'before' : 'after';
      showDropIndicator(li, position);
      currentDropTarget = { li, position, page, cat };
    }
  });

  li.addEventListener('dragleave', () => {
    const catEl = li.closest('.category');
    if (catEl) catEl.classList.remove('drag-over-cat');
  });

  li.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem || draggedType !== 'page' || !currentDropTarget) return;
    document.querySelectorAll('.drag-over-cat').forEach(el => el.classList.remove('drag-over-cat'));
    if (currentDropTarget.position === 'into') {
      handlePageDropIntoCat(currentDropTarget.cat);
    } else {
      handlePageDrop(currentDropTarget.page, currentDropTarget.cat, currentDropTarget.position);
    }
    clearDropIndicator();
  });

  const dragHandle = document.createElement('span');
  dragHandle.className = 'page-drag-handle';
  dragHandle.textContent = '⠿';
  li.appendChild(dragHandle);

  const pos = document.createElement('span');
  pos.className = 'page-position';
  pos.textContent = page.sidebar_position;
  li.appendChild(pos);

  const title = document.createElement('span');
  title.className = 'page-title' + (page.draft ? ' is-draft' : '') + (page.hidden ? ' is-hidden' : '');
  title.textContent = page.title;
  title.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    startPageTitleEdit(title, page);
  });
  li.appendChild(title);

  // Translation flag badge (non-EN only)
  if (getLocale() !== 'en') {
    const isTranslated = localeStatus.has(page.path);
    const flagBadge = document.createElement('span');
    const locale = getLocale().toUpperCase();
    flagBadge.className = 'trans-badge' + (isTranslated ? ' translated' : ' fallback');
    flagBadge.textContent = isTranslated ? locale : 'EN';
    flagBadge.title = isTranslated ? `Translated (${locale})` : 'EN fallback — no translation yet';
    li.appendChild(flagBadge);
  }

  // Filename label (before controls group)
  const filePath = document.createElement('span');
  filePath.className = 'page-path';
  filePath.textContent = page.path.split('/').pop();
  li.appendChild(filePath);

  // Right-aligned controls: [pub button][eye][delete]
  const pageControls = document.createElement('div');
  pageControls.className = 'item-controls';

  const toggle = document.createElement('button');
  toggle.className = 'pub-icon-btn' + (page.draft ? ' is-draft' : ' is-published');
  toggle.innerHTML = page.draft ? ICON_DRAFT : ICON_PUBLISHED;
  toggle.title = page.draft ? t('clickToSetPublished') : t('clickToSetDraft');
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDraft(page);
  });
  pageControls.appendChild(toggle);

  const eyeBtn = makeEyeToggle(!page.hidden, () => togglePageHidden(page));
  pageControls.appendChild(eyeBtn);

  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.innerHTML = ICON_DELETE;
  delBtn.title = t('deletePage');
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deletePage(page);
  });
  pageControls.appendChild(delBtn);

  li.appendChild(pageControls);

  // Click to preview (but not on drag handle, toggle, eye, or during edit)
  li.addEventListener('click', (e) => {
    if (e.target.closest('.page-drag-handle, .pub-icon-btn, .eye-toggle, .delete-btn, input')) return;
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

// Lucide icons for publication status
const ICON_PUBLISHED = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="m22 2-10 10"/><path d="m16 2h6v6"/></svg>'; // send/publish
const ICON_UNPUBLISHED = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>'; // circle-slash / unpublished
const ICON_DRAFT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.855z"/></svg>'; // pencil-line / draft

const ICON_DELETE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

const EYE_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>';

function makeEyeToggle(visible, onClick) {
  const btn = document.createElement('button');
  btn.className = 'eye-toggle' + (visible ? ' visible' : '');
  btn.innerHTML = visible ? EYE_SVG : EYE_OFF_SVG;
  btn.title = visible ? 'Hide from sidebar' : 'Show in sidebar';
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });
  return btn;
}

async function toggleCategoryHidden(cat) {
  const isCurrentlyHidden = cat.className === 'hidden';
  await fetch(`/api/category/${encodeURIComponent(cat.path)}/hidden`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hidden: !isCurrentlyHidden }),
  });
  loadTree();
}

async function togglePageHidden(page) {
  await fetch(`/api/page/${encodeURIComponent(page.path)}/hidden`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hidden: !page.hidden }),
  });
  loadTree();
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

async function deletePage(page) {
  if (!confirm(`Delete "${page.title}"?\n\nFile: ${page.path}\n\nThis cannot be undone.`)) return;
  await fetch(`/api/page/${page.path.split('/').map(encodeURIComponent).join('/')}`, { method: 'DELETE' });
  loadTree();
}

async function togglePillarPublished(cat) {
  await fetch(`/api/pillar/${encodeURIComponent(cat.path)}/published`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ published: !cat.published }),
  });
  loadTree();
}

// ─── Page Drag & Drop ───

function createDropIndicator() {
  const el = document.createElement('div');
  el.className = 'drop-indicator';
  return el;
}

function showDropIndicator(targetLi, position) {
  if (!dropIndicator) {
    dropIndicator = createDropIndicator();
    document.body.appendChild(dropIndicator);
  }
  const rect = targetLi.getBoundingClientRect();
  const scrollY = window.scrollY;
  dropIndicator.style.display = 'block';
  dropIndicator.style.left = rect.left + 'px';
  dropIndicator.style.width = rect.width + 'px';
  if (position === 'before') {
    dropIndicator.style.top = (rect.top + scrollY - 2) + 'px';
  } else {
    dropIndicator.style.top = (rect.bottom + scrollY - 2) + 'px';
  }
}

function clearDropIndicator() {
  if (dropIndicator) {
    dropIndicator.style.display = 'none';
  }
  currentDropTarget = null;
}

async function handlePageDrop(targetPage, targetCat, position) {
  if (!draggedItem || draggedItem.path === targetPage.path) return;

  const srcDir = draggedItem.path.split('/').slice(0, -1).join('/');
  const destDir = targetPage.path.split('/').slice(0, -1).join('/');
  const sameCat = srcDir === destDir;

  if (sameCat) {
    // Reorder within same category
    const pages = [...targetCat.pages].filter(p => p.path !== draggedItem.path);
    const targetIdx = pages.findIndex(p => p.path === targetPage.path);
    const insertIdx = position === 'before' ? targetIdx : targetIdx + 1;
    pages.splice(insertIdx, 0, { ...draggedItem });
    const reorder = pages.map((p, i) => ({ path: p.path, position: i + 1 }));
    await fetch('/api/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages: reorder }),
    });
  } else {
    // Move to different category
    const newPosition = position === 'before' ? targetPage.sidebar_position : targetPage.sidebar_position + 1;
    await fetch(`/api/page/${encodeURIComponent(draggedItem.path)}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: destDir, position: newPosition }),
    });
  }

  loadTree();
}

// ─── Category Drag & Drop ───

function onCatDragStart(e, cat) {
  draggedItem = cat;
  draggedType = 'category';
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', cat.path);
  requestAnimationFrame(() => e.target.classList.add('dragging'));
}

function onDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.drag-over-cat').forEach(el => el.classList.remove('drag-over-cat'));
  clearDropIndicator();
  draggedItem = null;
  draggedType = null;
}

async function handleCatDrop(targetCat, position) {
  if (!draggedItem || draggedItem.path === targetCat.path) return;
  // Collect all categories and compute new order
  const cats = [...treeData.categories].filter(c => c.path !== draggedItem.path);
  const targetIdx = cats.findIndex(c => c.path === targetCat.path);
  const insertIdx = position === 'before' ? targetIdx : targetIdx + 1;
  cats.splice(insertIdx, 0, draggedItem);
  // Update all positions
  const updates = cats.map((c, i) =>
    fetch(`/api/category/${encodeURIComponent(c.path)}/position`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: i + 1 }),
    })
  );
  await Promise.all(updates);
  loadTree();
}

async function handlePageDropIntoCat(targetCat) {
  if (!draggedItem) return;
  const destDir = targetCat.path;
  const newPosition = (targetCat.pages?.length || 0) + 1;
  await fetch(`/api/page/${encodeURIComponent(draggedItem.path)}/move`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: destDir, position: newPosition }),
  });
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
const modalEditBtn = document.getElementById('modal-edit');
const modalDeleteBtn = document.getElementById('modal-delete');
const modalDraftBadge = document.getElementById('modal-draft-badge');
const modalEyeToggle = document.getElementById('modal-eye-toggle');

let previewPages = [];
let previewIndex = 0;
let isEditing = false;
let editorRawContent = ''; // raw markdown loaded from server
let editorDirty = false;

async function openPreviewModal(page, cat) {
  previewPages = [...cat.pages];
  previewIndex = previewPages.findIndex(p => p.path === page.path);
  if (previewIndex === -1) previewIndex = 0;
  isEditing = false;
  editorDirty = false;
  modalEditBtn.classList.remove('active');

  await showPreviewPage();
  previewModal.classList.add('open');
}

async function showPreviewPage() {
  const page = previewPages[previewIndex];
  modalTitle.textContent = page.title;
  modalBody.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px">${t('loading')}</div>`;

  const locale = getLocale();
  const res = await fetch(`/api/page/${encodeURIComponent(page.path)}/content?locale=${locale}`);
  const data = await res.json();
  editorRawContent = data.raw || '';

  // Show path + translation status in subtitle
  const localeName = locale !== 'en' ? ` · ${locale.toUpperCase()} ${data.isTranslated ? '✓' : '(EN fallback)'}` : '';
  modalSubtitle.textContent = page.path + localeName;
  modalSubtitle.className = 'modal-subtitle' + (locale !== 'en' && !data.isTranslated ? ' fallback-notice' : '');

  if (isEditing) {
    renderEditor();
  } else {
    modalBody.innerHTML = data.html || `<p style="color:var(--text-muted)">${t('noContent')}</p>`;
  }

  // Dots
  modalDots.innerHTML = '';
  for (let i = 0; i < previewPages.length; i++) {
    const dot = document.createElement('span');
    dot.className = 'step-dot' + (i === previewIndex ? ' active' : i < previewIndex ? ' visited' : '');
    dot.addEventListener('click', async () => {
      await saveIfDirty();
      previewIndex = i;
      showPreviewPage();
    });
    modalDots.appendChild(dot);
  }

  // Visibility & draft controls
  updateModalEyeToggle(page);
  updateModalDraftBadge(page);

  modalPrev.disabled = previewIndex === 0;
  modalNext.disabled = previewIndex === previewPages.length - 1;
  modalNext.textContent = previewIndex === previewPages.length - 1 ? t('done') : t('next');
}

function updateModalEyeToggle(page) {
  const visible = !page.hidden;
  modalEyeToggle.className = 'eye-toggle' + (visible ? ' visible' : '');
  modalEyeToggle.innerHTML = visible ? EYE_SVG : EYE_OFF_SVG;
  modalEyeToggle.title = visible ? 'Hide from sidebar' : 'Show in sidebar';
}

modalEyeToggle.addEventListener('click', async () => {
  const page = previewPages[previewIndex];
  await fetch(`/api/page/${encodeURIComponent(page.path)}/hidden`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hidden: !page.hidden }),
  });
  page.hidden = !page.hidden;
  updateModalEyeToggle(page);
});

function updateModalDraftBadge(page) {
  modalDraftBadge.innerHTML = page.draft ? ICON_DRAFT : ICON_PUBLISHED;
  modalDraftBadge.className = 'pub-icon-btn modal-draft-badge ' + (page.draft ? 'is-draft' : 'is-published');
  modalDraftBadge.title = page.draft ? t('clickToSetPublished') : t('clickToSetDraft');
}

modalDraftBadge.addEventListener('click', async () => {
  const page = previewPages[previewIndex];
  await fetch(`/api/page/${encodeURIComponent(page.path)}/draft`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draft: !page.draft }),
  });
  page.draft = !page.draft;
  updateModalDraftBadge(page);
});

function renderEditor() {
  modalBody.innerHTML = '';
  const textarea = document.createElement('textarea');
  textarea.className = 'modal-editor';
  textarea.value = editorRawContent;
  textarea.addEventListener('input', () => {
    editorRawContent = textarea.value;
    editorDirty = true;
  });
  // Tab key inserts spaces instead of moving focus
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      editorRawContent = textarea.value;
      editorDirty = true;
    }
  });
  modalBody.appendChild(textarea);
  textarea.focus();
}

async function saveIfDirty() {
  if (!editorDirty) return;
  const page = previewPages[previewIndex];
  await fetch('/api/save-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: page.path, content: editorRawContent }),
  });
  editorDirty = false;
}

async function toggleEditMode() {
  if (isEditing) {
    // Switching from edit → preview: save first
    await saveIfDirty();
    isEditing = false;
    modalEditBtn.classList.remove('active');
    // Re-fetch to show updated rendered content
    await showPreviewPage();
  } else {
    // Switching from preview → edit
    isEditing = true;
    modalEditBtn.classList.add('active');
    renderEditor();
  }
}

modalEditBtn.addEventListener('click', toggleEditMode);

modalDeleteBtn.addEventListener('click', async () => {
  const page = previewPages[previewIndex];
  if (!confirm(`Delete "${page.title}"?\n\nFile: ${page.path}\n\nThis cannot be undone.`)) return;
  await fetch(`/api/page/${page.path.split('/').map(encodeURIComponent).join('/')}`, { method: 'DELETE' });
  closePreviewModal();
  loadTree();
});

modalPrev.addEventListener('click', async () => {
  if (previewIndex > 0) {
    await saveIfDirty();
    previewIndex--;
    showPreviewPage();
  }
});
modalNext.addEventListener('click', async () => {
  if (previewIndex < previewPages.length - 1) {
    await saveIfDirty();
    previewIndex++;
    showPreviewPage();
  } else {
    await saveIfDirty();
    closePreviewModal();
  }
});
modalClose.addEventListener('click', async () => {
  await saveIfDirty();
  closePreviewModal();
});
previewModal.addEventListener('click', async (e) => {
  if (e.target === previewModal) {
    await saveIfDirty();
    closePreviewModal();
  }
});

function closePreviewModal() {
  previewModal.classList.remove('open');
  isEditing = false;
  editorDirty = false;
  modalEditBtn.classList.remove('active');
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
  createTitle.textContent = [t('pageDetails'), t('options'), t('initialContent')][createStep];

  // Dots
  createDots.innerHTML = '';
  for (let i = 0; i < totalSteps; i++) {
    const dot = document.createElement('span');
    dot.className = 'step-dot' + (i === createStep ? ' active' : i < createStep ? ' visited' : '');
    createDots.appendChild(dot);
  }

  createPrev.disabled = createStep === 0;
  createNext.textContent = createStep === totalSteps - 1 ? t('create') : t('next');

  if (createStep === 0) {
    createBody.innerHTML = `
      <div class="form-group">
        <label class="form-label">${t('pageTitle')}</label>
        <input class="form-input" id="create-page-title" placeholder="${t('enterProjectName')}" value="${esc(createData.title)}">
      </div>
      <div class="form-group">
        <label class="form-label">${t('filename')}</label>
        <input class="form-input" id="create-page-filename" placeholder="${t('enterFilename')}" value="${esc(createData.filename)}" style="font-family:monospace">
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${t('filenameHint')}</div>
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
      `<option value="${i + 1}" ${createData.position === i + 1 ? 'selected' : ''}>${t('beforePrefix')}${esc(p.title)}</option>`
    ).join('') + `<option value="${createCat.pages.length + 1}" ${createData.position === createCat.pages.length + 1 ? 'selected' : ''}>${t('atEnd')}</option>`;

    createBody.innerHTML = `
      <div class="form-group">
        <label class="form-label">${t('position')}</label>
        <select class="form-select" id="create-page-position">${posOptions}</select>
      </div>
      <div class="form-group">
        <div class="toggle-row">
          <button class="pub-icon-btn ${createData.draft ? 'is-draft' : 'is-published'}" id="create-page-draft">${createData.draft ? ICON_DRAFT : ICON_PUBLISHED}</button>
          <span class="toggle-label">${createData.draft ? t('draftHidden') : t('published')}</span>
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
        <label class="form-label">${t('initialContent')}</label>
        <textarea class="form-textarea" id="create-page-content" placeholder="${t('contentPlaceholder')}">${esc(createData.content)}</textarea>
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
  if (!createData.title.trim()) { alert(t('titleRequired')); createStep = 0; renderCreateStep(); return; }
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

// ─── Create Category Modal ───

const createCatModal = document.getElementById('create-cat-modal');
const createCatTitle = document.getElementById('create-cat-title');
const createCatBody = document.getElementById('create-cat-body');
const createCatSubmit = document.getElementById('create-cat-submit');
const createCatClose = document.getElementById('create-cat-close');

function openCreateCategoryModal() {
  createCatTitle.textContent = t('newCategory');
  createCatBody.innerHTML = `
    <div class="form-group">
      <label class="form-label">${t('categoryLabel')}</label>
      <input class="form-input" id="create-cat-label" placeholder="${t('categoryLabelPlaceholder')}">
    </div>
    <div class="form-group">
      <label class="form-label">${t('folderName')}</label>
      <input class="form-input" id="create-cat-name" placeholder="${t('folderNamePlaceholder')}" style="font-family:monospace">
      <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${t('folderNameHint')}</div>
    </div>
  `;
  createCatModal.classList.add('open');

  const labelInput = document.getElementById('create-cat-label');
  const nameInput = document.getElementById('create-cat-name');
  let nameManual = false;
  labelInput.addEventListener('input', () => {
    if (!nameManual) {
      nameInput.value = slugify(labelInput.value);
    }
  });
  nameInput.addEventListener('input', () => { nameManual = true; });
  labelInput.focus();
}

createCatSubmit.addEventListener('click', async () => {
  const label = document.getElementById('create-cat-label').value.trim();
  const name = document.getElementById('create-cat-name').value.trim() || slugify(label);
  if (!label) { alert(t('categoryLabelRequired')); return; }
  const position = (treeData?.categories?.length || 0) + 1;
  await fetch('/api/category/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, label, position }),
  });
  createCatModal.classList.remove('open');
  loadTree();
});

createCatClose.addEventListener('click', () => createCatModal.classList.remove('open'));
createCatModal.addEventListener('click', (e) => { if (e.target === createCatModal) createCatModal.classList.remove('open'); });

// ─── Keyboard Shortcuts ───

document.addEventListener('keydown', async (e) => {
  if (previewModal.classList.contains('open')) {
    // Don't hijack arrows when editing
    if (isEditing && e.target.classList.contains('modal-editor')) return;
    if (e.key === 'Escape') { await saveIfDirty(); closePreviewModal(); }
    if (e.key === 'ArrowLeft' && previewIndex > 0) { await saveIfDirty(); previewIndex--; showPreviewPage(); }
    if (e.key === 'ArrowRight' && previewIndex < previewPages.length - 1) { await saveIfDirty(); previewIndex++; showPreviewPage(); }
  }
  if (createModal.classList.contains('open')) {
    if (e.key === 'Escape') createModal.classList.remove('open');
  }
  if (createCatModal.classList.contains('open')) {
    if (e.key === 'Escape') createCatModal.classList.remove('open');
    if (e.key === 'Enter') createCatSubmit.click();
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

// ─── Global drag cleanup ───
document.addEventListener('dragover', (e) => {
  // If not over a page-item, clear the indicator
  if (!e.target.closest('.page-item')) {
    clearDropIndicator();
  }
});
document.addEventListener('drop', (e) => {
  clearDropIndicator();
});

// ─── Parallax ───
window.addEventListener('scroll', () => {
  document.documentElement.style.setProperty('--parallax-y', `${window.scrollY * -0.05}px`);
}, { passive: true });

// ─── Init ───
loadTree();
