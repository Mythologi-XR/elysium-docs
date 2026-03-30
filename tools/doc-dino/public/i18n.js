// ─── Doc Dino i18n ───

const TRANSLATIONS = {
  en: {
    connecting: 'CONNECTING...',
    connected: 'CONNECTED',
    disconnected: 'DISCONNECTED',
    noDocs: 'No docs found',
    published: 'PUBLISHED',
    unpublished: 'UNPUBLISHED',
    draft: 'DRAFT',
    addPage: 'Add page',
    hideFromSidebar: 'Hide from sidebar',
    showInSidebar: 'Show in sidebar',
    clickToUnpublish: 'Click to unpublish',
    clickToPublish: 'Click to publish',
    clickToSetDraft: 'Click to set as draft',
    clickToSetPublished: 'Click to publish',
    show: 'Show',
    hide: 'Hide',
    editContent: 'Edit content',
    loading: 'Loading...',
    noContent: 'No content',
    back: '\u2190 Back',
    next: 'Next \u2192',
    done: 'Done',
    newPage: 'New Page',
    pageTitle: 'Page Title',
    filename: 'Filename',
    filenameHint: '.md extension added automatically',
    position: 'Position',
    beforePrefix: 'Before: ',
    atEnd: 'At end',
    draftHidden: 'Draft (hidden from production)',
    initialContent: 'Initial Content (optional)',
    contentPlaceholder: 'Enter an opening paragraph for this page...',
    file: 'File:',
    create: 'Create',
    pageDetails: 'Page Details',
    options: 'Options',
    titleRequired: 'Page title is required',
    enterProjectName: 'My New Page',
    enterFilename: 'my-new-page',
  },
  fr: {
    connecting: 'CONNEXION...',
    connected: 'CONNECT\u00c9',
    disconnected: 'D\u00c9CONNECT\u00c9',
    noDocs: 'Aucun document trouv\u00e9',
    published: 'PUBLI\u00c9',
    unpublished: 'NON PUBLI\u00c9',
    draft: 'BROUILLON',
    addPage: 'Ajouter une page',
    hideFromSidebar: 'Masquer de la barre lat\u00e9rale',
    showInSidebar: 'Afficher dans la barre lat\u00e9rale',
    clickToUnpublish: 'Cliquer pour d\u00e9publier',
    clickToPublish: 'Cliquer pour publier',
    clickToSetDraft: 'Cliquer pour mettre en brouillon',
    clickToSetPublished: 'Cliquer pour publier',
    show: 'Afficher',
    hide: 'Masquer',
    editContent: 'Modifier le contenu',
    loading: 'Chargement...',
    noContent: 'Aucun contenu',
    back: '\u2190 Retour',
    next: 'Suivant \u2192',
    done: 'Termin\u00e9',
    newPage: 'Nouvelle page',
    pageTitle: 'Titre de la page',
    filename: 'Nom du fichier',
    filenameHint: 'Extension .md ajout\u00e9e automatiquement',
    position: 'Position',
    beforePrefix: 'Avant : ',
    atEnd: '\u00c0 la fin',
    draftHidden: 'Brouillon (masqu\u00e9 en production)',
    initialContent: 'Contenu initial (optionnel)',
    contentPlaceholder: 'Saisissez un paragraphe d\u2019introduction pour cette page...',
    file: 'Fichier :',
    create: 'Cr\u00e9er',
    pageDetails: 'D\u00e9tails de la page',
    options: 'Options',
    titleRequired: 'Le titre de la page est requis',
    enterProjectName: 'Ma nouvelle page',
    enterFilename: 'ma-nouvelle-page',
  },
};

let currentLocale = localStorage.getItem('doc-dino-lang') || navigator.language.split('-')[0] || 'en';
if (!TRANSLATIONS[currentLocale]) currentLocale = 'en';

function t(key) {
  return (TRANSLATIONS[currentLocale] && TRANSLATIONS[currentLocale][key]) || TRANSLATIONS.en[key] || key;
}

function setLocale(locale) {
  if (!TRANSLATIONS[locale]) return;
  currentLocale = locale;
  localStorage.setItem('doc-dino-lang', locale);
}

function getLocale() {
  return currentLocale;
}

const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629', short: 'AR' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'es', label: 'Espa\u00f1ol', short: 'ES' },
  { code: 'fa', label: '\u0641\u0627\u0631\u0633\u06cc', short: 'FA' },
  { code: 'fr', label: 'Fran\u00e7ais', short: 'FR' },
  { code: 'ja', label: '\u65e5\u672c\u8a9e', short: 'JA' },
  { code: 'ko', label: '\ud55c\uad6d\uc5b4', short: 'KO' },
  { code: 'pt', label: 'Portugu\u00eas', short: 'PT' },
  { code: 'pt-BR', label: 'Portugu\u00eas (BR)', short: 'BR' },
  { code: 'ru', label: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439', short: 'RU' },
  { code: 'zh', label: '\u4e2d\u6587', short: 'ZH' },
];
