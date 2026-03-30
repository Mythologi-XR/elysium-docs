---
title: Publication et indicateurs de fonctionnalité
draft: true
---

# Publication et indicateurs de fonctionnalité — Guide

**Système d'indicateurs de fonctionnalité pour publier et dépublier des piliers et sections de documentation à votre discrétion.**

> **DOCUMENTS CONNEXES CLÉS**
> - **[docFlags.js](docFlags.js)** — Configuration maîtresse des indicateurs pour les piliers et les pages individuelles
> - **[sidebars.js](../../sidebars.js)** — Génération de la barre latérale avec filtrage par indicateur
> - **[docusaurus.config.js](../../docusaurus.config.js)** — Injection d'indicateurs dans la barre de navigation et les champs personnalisés
> - **[Composant FeatureFlag](../../src/components/FeatureFlag/index.tsx)** — Composant React pour le basculement de sections en ligne

<br>

---
> **Dernière modification :** Guide initial — documente le système d'indicateurs de fonctionnalité à trois couches pour la documentation ELYSIUM

  **v1.0.0** | *Créé le : 2026-03-28 — [voir le journal des modifications](#journal-des-modifications)*

---

## Table des matières

- [Aperçu](#aperçu)
- [Dépôts cibles](#dépôts-cibles)
- [Décisions de conception](#décisions-de-conception)
- [Architecture](#architecture)
  - [Couche de configuration des indicateurs](#couche-de-configuration-des-indicateurs)
  - [Couche de filtre de la barre latérale](#couche-de-filtre-de-la-barre-latérale)
  - [Couche de composant en ligne](#couche-de-composant-en-ligne)
- [Disposition des composants](#disposition-des-composants)
- [Plan d'implémentation](#plan-dimplémentation)
  - [Publier ou dépublier un pilier](#publier-ou-dépublier-un-pilier)
  - [Publier ou dépublier des pages individuelles](#publier-ou-dépublier-des-pages-individuelles)
  - [Afficher conditionnellement des sections dans une page](#afficher-conditionnellement-des-sections-dans-une-page)
  - [Ajouter un nouveau pilier](#ajouter-un-nouveau-pilier)
- [Référence des fichiers critiques](#référence-des-fichiers-critiques)
- [Séquence d'implémentation](#séquence-dimplémentation)
- [Stratégie de test](#stratégie-de-test)
- [Indicateurs de succès](#indicateurs-de-succès)
- [Piliers de documentation](#piliers-de-documentation)
- [Journal des modifications](#journal-des-modifications)

---

## Aperçu

Le site de documentation ELYSIUM utilise un système d'indicateurs de fonctionnalité pour contrôler quel contenu est visible par le public. Cela permet aux piliers (sections entières de documentation) et aux pages individuelles d'être activés ou désactivés sans supprimer le contenu du dépôt.

Le système fonctionne sur trois couches :

| Couche | Fichier | Objectif |
|--------|---------|---------|
| **Configuration des indicateurs** | `docs/publishing/docFlags.js` | Basculement maître pour les piliers et les pages individuelles |
| **Filtre de la barre latérale** | `sidebars.js` | Lit les indicateurs, masque les piliers non publiés de la navigation |
| **Composant en ligne** | `src/components/FeatureFlag/index.tsx` | Rend conditionnellement des sections dans n'importe quelle page MDX |

### Ce qui se passe lorsqu'un pilier est dépublié

- Sa catégorie dans la barre latérale est **supprimée** de la navigation
- Son entrée dans le menu déroulant de la barre de navigation est **supprimée**
- La page d'index du pilier a `draft: true` dans le frontmatter, elle est donc **exclue des builds de production**
- En développement local (`npm start`), **tout le contenu est toujours accessible** quel que soit les indicateurs — cela vous permet de travailler sur du contenu non publié

---

## Dépôts cibles

| Dépôt | Rôle | Périmètre |
|-------|------|---------|
| `elysium-docs` | Site de documentation | Tous les fichiers d'indicateurs de fonctionnalité, configuration de la barre latérale, configuration Docusaurus |

---

## Décisions de conception

| # | Décision | Justification |
|---|----------|-----------|
| 1 | Fichier de configuration `docFlags.js` unique | Un seul endroit pour basculer toute la visibilité — pas d'éditions de frontmatter dispersées |
| 2 | Filtrage de la barre latérale via `sidebars.js` | Docusaurus prend nativement en charge les éléments de barre latérale conditionnels ; aucun plugin personnalisé nécessaire |
| 3 | `draft: true` sur les pages d'index de piliers non publiés | Docusaurus exclut les pages brouillon des builds de production, empêchant l'accès direct via URL |
| 4 | Composant React `FeatureFlag` pour les sections en ligne | Permet un contrôle granulaire dans les pages publiées sans diviser le contenu en fichiers séparés |
| 5 | Indicateurs injectés dans `customFields` | Rend les indicateurs disponibles côté client via `useDocusaurusContext()` pour le composant React |
| 6 | Le mode développement affiche tout le contenu | Permet aux auteurs de travailler sur du contenu non publié localement sans basculer les indicateurs |

---

## Architecture

### Couche de configuration des indicateurs

Le fichier `docs/publishing/docFlags.js` exporte deux objets :

- **`pillars`** — Indicateurs booléens avec pour clé le nom du répertoire du pilier. Contrôle les sections entières de la barre latérale.
- **`pages`** — Remplacements optionnels au niveau de la page avec pour clé le chemin relatif du document (sans `.md`). Remplace l'indicateur au niveau du pilier pour des documents individuels.

Les deux sont consommés au moment de la compilation par `sidebars.js` et `docusaurus.config.js`.

### Couche de filtre de la barre latérale

`sidebars.js` utilise une fonction d'aide `pillarCategory()` qui :

1. Vérifie l'indicateur du pilier dans `docFlags.pillars`
2. Retourne `null` si l'indicateur est `false` (non publié)
3. Retourne la configuration complète de la catégorie de la barre latérale si `true` (publié)
4. Le tableau final de la barre latérale appelle `.filter(Boolean)` pour supprimer les valeurs nulles

### Couche de composant en ligne

Le composant React `<FeatureFlag>` lit les indicateurs depuis `siteConfig.customFields.featureFlags` (injecté par `docusaurus.config.js`) et rend conditionnellement ses enfants.

**Props :**

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `name` | `string` | Oui | Clé d'indicateur — correspond à une clé dans `docFlags.js` pillars |
| `children` | `ReactNode` | Oui | Contenu affiché lorsque l'indicateur est activé |
| `fallback` | `ReactNode` | Non | Contenu affiché lorsque l'indicateur est désactivé (par défaut : rien) |

---

## Disposition des composants

```
elysium-docs/
├── docs/
│   ├── publishing/
│   │   ├── docFlags.js          # Configuration maîtresse des indicateurs
│   │   └── PUBLISHING.md        # Ce fichier
│   ├── elysium-play/            # Pilier 1
│   ├── creation-app/            # Pilier 2
│   ├── portal/                  # Pilier 3
│   ├── geist-engine/            # Pilier 4
│   ├── elysium-x/               # Pilier 5
│   ├── wallet/                  # Pilier 6
│   ├── analytics/               # Pilier 7
│   ├── depin-network/           # Pilier 8
│   ├── reality-bridge/          # Pilier 9
│   ├── alpha-lab/               # Pilier 10
│   └── reference/               # Documentation de référence
├── src/
│   └── components/
│       └── FeatureFlag/
│           └── index.tsx         # Composant d'indicateur en ligne
├── sidebars.js                   # Lit docFlags, filtre la barre latérale
└── docusaurus.config.js          # Lit docFlags, injecte dans la barre de navigation + customFields
```

---

## Plan d'implémentation

### Publier ou dépublier un pilier

Modifiez `docs/publishing/docFlags.js` et définissez l'indicateur du pilier sur `true` (publié) ou `false` (masqué) :

```js
const pillars = {
  'elysium-play':     false,   // masqué de la barre latérale
  'creation-app':     false,
  'portal':           false,
  'geist-engine':     false,
  'elysium-x':        false,
  'wallet':           false,
  'analytics':        false,
  'depin-network':    false,
  'reality-bridge':   false,
  'alpha-lab':        true,    // visible dans la barre latérale
  'reference':        true,
};
```

Après avoir modifié un indicateur :

1. **Développement local** (`npm start`) — redémarrez le serveur de développement pour prendre en compte les modifications
2. **Production** (`npm run build`) — reconstruisez et déployez ; les piliers non publiés sont exclus de la navigation

### Publier ou dépublier des pages individuelles

Utilisez l'objet `pages` dans `docs/publishing/docFlags.js` pour les remplacements au niveau de la page :

```js
const pages = {
  // Publier une page spécifique même si son pilier est non publié
  'portal/dashboard': true,

  // Masquer une page spécifique même si son pilier est publié
  'alpha-lab/card-designer/tips-and-troubleshooting': false,
};
```

Les clés de page sont des chemins relatifs à `docs/` sans l'extension `.md`.

### Afficher conditionnellement des sections dans une page

Utilisez le composant `<FeatureFlag>` dans n'importe quel fichier `.mdx` :

```mdx
import FeatureFlag from '@site/src/components/FeatureFlag';

<FeatureFlag name="elysium-x">
  Ce contenu n'apparaît que lorsque l'indicateur `elysium-x` est activé.
</FeatureFlag>

<FeatureFlag name="wallet" fallback={<p>Bientôt disponible.</p>}>
  Documentation détaillée du portefeuille ici.
</FeatureFlag>
```

### Ajouter un nouveau pilier

1. Créez un répertoire sous `docs/` (par ex. `docs/new-pillar/`)
2. Ajoutez un `index.md` avec du frontmatter (incluez `draft: true` si vous commencez non publié)
3. Ajoutez un `_category_.json` avec une étiquette, une position et un slug
4. Ajoutez une entrée d'indicateur dans `docs/publishing/docFlags.js` sous `pillars`
5. Ajoutez un appel `pillarCategory()` dans `sidebars.js`
6. Ajoutez optionnellement une entrée dans la barre de navigation dans `docusaurus.config.js` en utilisant `navItemIf()`

---

## Référence des fichiers critiques

| Fichier | Action | Objectif |
|---------|--------|---------|
| `docs/publishing/docFlags.js` | Modifier | Basculer la visibilité des piliers et des pages |
| `sidebars.js` | Modifier (lors de l'ajout de piliers) | Ajouter des appels `pillarCategory()` pour les nouveaux piliers |
| `docusaurus.config.js` | Modifier (lors de l'ajout de piliers) | Ajouter des appels `navItemIf()` pour les entrées de la barre de navigation |
| `src/components/FeatureFlag/index.tsx` | Utiliser dans MDX | Importer et envelopper le contenu conditionnel |
| `docs/[pillar]/index.md` | Créer | Page d'accueil du pilier avec `draft: true` si non publié |
| `docs/[pillar]/_category_.json` | Créer | Étiquette de la barre latérale, position et slug pour le pilier |

---

## Séquence d'implémentation

| Étape | Livrable | Dépendances | Périmètre |
|-------|----------|-------------|---------|
| 1 | Créer le répertoire du pilier et `index.md` | Aucune | Nouveau répertoire + fichier |
| 2 | Créer `_category_.json` | Étape 1 | Nouveau fichier |
| 3 | Ajouter l'indicateur dans `docFlags.js` | Étape 1 | Modification d'une ligne |
| 4 | Ajouter `pillarCategory()` dans `sidebars.js` | Étape 3 | Modification d'une ligne |
| 5 | Ajouter `navItemIf()` dans `docusaurus.config.js` (optionnel) | Étape 3 | Modification d'une ligne |
| 6 | Reconstruire et vérifier | Étapes 1-5 | `npm run build` |

---

## Stratégie de test

1. **Désactiver un indicateur** — vérifier que le pilier disparaît de la barre latérale et de la barre de navigation dans un build de production (`npm run build && npm run serve`)
2. **Activer un indicateur** — vérifier que le pilier apparaît dans la barre latérale et la barre de navigation, et que toutes les pages sont accessibles
3. **Visibilité en mode développement** — lancer `npm start` et confirmer que tout le contenu (y compris non publié) est accessible pour la rédaction
4. **Remplacement au niveau de la page** — ajouter un remplacement de page dans `docFlags.js`, reconstruire et vérifier que seule cette page est affectée
5. **`<FeatureFlag>` en ligne** — ajouter le composant à une page MDX, basculer l'indicateur et vérifier que le contenu apparaît/disparaît
6. **Vérification des liens cassés** — après le basculement, lancer `npm run build` et confirmer l'absence d'erreurs de liens cassés

---

## Indicateurs de succès

| Indicateur | Cible |
|-----------|--------|
| Latence de basculement du pilier | Modification de l'indicateur + reconstruction en < 30 secondes |
| Zéro lien cassé | `npm run build` se termine sans erreurs de liens cassés |
| Complétude en mode développement | Les 10 piliers visibles dans `npm start` quel que soit les indicateurs |
| Exclusion en production | Les piliers non publiés ont zéro page dans la sortie `build/` |

---

## Piliers de documentation

| # | Pilier | Répertoire | Description |
|---|--------|-----------|-------------|
| 1 | ELYSIUM PLAY | `docs/elysium-play/` | Jeu et découverte multiplateforme |
| 2 | Application de création ELYSIUM | `docs/creation-app/` | Création RA in situ et gestion de compte |
| 3 | Portail ELYSIUM | `docs/portal/` | Application web, tableau de bord et hub de joueurs |
| 4 | Moteur GEIST | `docs/geist-engine/` | Moteur d'interaction pour la RA et au-delà |
| 5 | ELYSIUM X | `docs/elysium-x/` | Système de fidélité en libre-service lié aux réserves |
| 6 | Portefeuille ELYSIUM | `docs/wallet/` | Couche d'identité de l'écosystème (EIS-Wallet) |
| 7 | ELYSIUM Analytics | `docs/analytics/` | Analyse comportementale en temps réel pour l'IA |
| 8 | Réseau DePIN ELYSIUM | `docs/depin-network/` | Système fédéré en tant que plateforme |
| 9 | REALITY BRIDGE | `docs/reality-bridge/` | Modules d'infrastructure matérielle |
| 10 | Laboratoire ALPHA | `docs/alpha-lab/` | Fonctionnalités expérimentales et outils créatifs |

---

## Journal des modifications

| Version | Date | Auteur | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2026-03-28 | Claude | Guide initial — documente le système d'indicateurs de fonctionnalité à trois couches pour la publication de la documentation ELYSIUM |

---

*Version du document : 1.0.0*
*Dernière mise à jour : 2026-03-28*
*Statut : Implémenté*
