---
sidebar_position: 7
---

# Enregistrement, exportation et partage

## Enregistrer votre travail

### Sauvegarde automatique

Votre design est automatiquement enregistré dans votre navigateur à chaque modification. Si vous fermez accidentellement l'onglet, rouvrez simplement le Concepteur de cartes — votre travail vous attendra.

### Enregistrer dans un fichier

Pour une sauvegarde plus permanente, cliquez sur **Enregistrer le projet** dans la section d'export du panneau droit. Ceci télécharge un fichier `.ecard` contenant l'intégralité de votre design, y compris toutes les images et autocollants.

![Section d'export dans le panneau droit montrant les options PNG, GLB, Enregistrer le projet et Partager](/img/card-designer/37.png)

Pour le recharger plus tard, déposez simplement le fichier `.ecard` sur la page d'accueil du Concepteur de cartes ou utilisez l'option "Charger un projet enregistré" dans l'assistant de configuration.

:::caution
La sauvegarde automatique utilise le stockage local de votre navigateur. Si vous effacez les données de votre navigateur, elles seront perdues. Enregistrez dans un fichier `.ecard` ou [sauvegardez dans le cloud](./projects-and-cloud) pour conserver votre travail en sécurité.
:::

### Enregistrer dans le cloud

Si vous disposez d'un [compte ELYSIUM](./your-account), vous pouvez enregistrer vos designs dans le cloud pour y accéder depuis n'importe quel appareil. Cliquez sur **"Enregistrer sur ELYSIUM"** dans la barre latérale pour ouvrir la boîte de dialogue de sauvegarde cloud.

![Bouton Enregistrer sur ELYSIUM dans la zone d'actions de la barre latérale avec l'icône du logo ELYSIUM](/img/card-designer/74.png)

Pour plus de détails sur la sauvegarde cloud, la gestion de projets et le panneau Projets, consultez [Projets et sauvegarde cloud](./projects-and-cloud).

---

## Exporter votre carte

### En tant qu'image (PNG)

Dans la section **Export** du panneau droit, choisissez l'export **PNG** :

- Mode **Faces de carte** — Exporte l'illustration plate du recto ou du verso. Idéal pour l'impression.
- Mode **Scène 3D** — Exporte la scène 3D complète avec éclairage et effets. Idéal pour le partage en ligne.

![Export Faces de carte (illustration plate) vs export Scène 3D (rendu avec éclairage) côte à côte](/img/card-designer/38.png)

Pour une sortie de qualité d'impression, utilisez le mode **Faces de carte** à une **résolution 4x** — cela vous donne 300 DPI à la taille réelle de la carte.

![Différence de qualité entre les exports en résolution 1x et 4x](/img/card-designer/39.png)

### En tant que fichier 3D (GLB)

Choisissez l'export **GLB** pour obtenir un fichier 3D utilisable dans des expériences RA, des visionneuses 3D ou des moteurs de jeu comme Unity et Unreal.

Option **Fusionner les textures** :
- **Activé** — Aplatit toutes les couches en une seule texture par face. Idéal pour la compatibilité avec d'autres outils.
- **Désactivé** — Conserve toutes les couches comme des maillages séparés. Idéal si vous prévoyez de l'éditer ultérieurement dans ELYSIUM.

![Bouton de bascule Fusionner les textures activé/désactivé dans les paramètres d'export](/img/card-designer/41.png)

Le processus d'export comporte plusieurs phases (Préparation, Exportation, Validation, Terminé). Si la validation détecte des erreurs, elles seront listées — essayez d'activer **Fusionner les textures** pour résoudre la plupart des problèmes.

![Bouton d'export affiché à chaque phase — Préparation, Exportation, Validation, Terminé](/img/card-designer/40.png)

---

## Partager votre design

### Partage rapide (même appareil)

Cliquez sur le bouton **Partager** dans le panneau d'export pour générer un lien d'aperçu local rapide. Cela stocke votre carte dans le navigateur et vous donne un lien pour la prévisualiser.

![URL de partage affichée sous le bouton Partager avec l'icône de copie](/img/card-designer/42.png)

Cliquez sur l'icône de **copie** pour récupérer le lien et le partager où vous le souhaitez.

![Lecteur de partage public tel qu'un spectateur le voit — carte plein écran, barre d'outils, filigrane](/img/card-designer/43.png)

:::note
Les liens de partage rapide ne fonctionnent que sur le **même navigateur et appareil** où ils ont été créés. Pour le partage entre appareils avec protection par mot de passe et fonctionnalités de collaboration, consultez [Partage et confidentialité](./sharing-and-privacy).
:::

### Partage cloud

Pour partager avec n'importe qui — sur n'importe quel appareil, avec protection optionnelle par mot de passe, dates d'expiration et fonctionnalités de collaboration — utilisez le partage cloud depuis le panneau **Confidentialité et partage** dans la barre latérale droite. Consultez [Partage et confidentialité](./sharing-and-privacy) pour le guide complet.
