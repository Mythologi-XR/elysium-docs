---
sidebar_position: 9
---

# Partage et confidentialité

Le Concepteur de cartes vous offre deux façons de partager vos designs et un contrôle total sur qui peut y accéder.

## Deux façons de partager

| | Aperçu local | Partage cloud |
|---|---|---|
| **Comment** | Bouton Partager dans le panneau Export | Panneau Confidentialité et partage dans la barre latérale droite |
| **Fonctionne sur tous les appareils** | Non (même navigateur uniquement) | Oui (toute personne avec le lien) |
| **Protection par mot de passe** | Non | Optionnel |
| **Expiration** | Jamais | 7, 30 ou 90 jours (ou jamais) |
| **Revendication et collaboration** | Non | Optionnel |

L'**aperçu local** est idéal pour un coup d'œil rapide sur votre propre appareil. Le **partage cloud** est ce qu'il vous faut pour envoyer des liens à d'autres personnes.

---

## Contrôles de confidentialité

Le panneau **Confidentialité et partage** (icône bouclier) dans la barre latérale droite vous permet de contrôler comment votre eCarte est accessible. Vous devez être [connecté](./your-account) avec une eCarte sauvegardée dans le cloud pour utiliser ces contrôles.

![Panneau Confidentialité et partage dans la barre latérale droite montrant quatre boutons de confidentialité — Privé, Partage activé, Autoriser les copies, Autoriser la revendication](/img/card-designer/64.png)

Quatre boutons contrôlent l'accès :

| Bouton | Par défaut | Ce qu'il fait |
|--------|-----------|--------------|
| **Privé** | Désactivé | Masque votre eCarte de la découverte publique |
| **Partage activé** | Activé | Vous permet de créer des liens de partage |
| **Autoriser les copies** | Désactivé | Permet aux destinataires de dupliquer votre eCarte et d'éditer leur propre copie |
| **Autoriser la revendication** | Désactivé | Permet aux destinataires de revendiquer la pleine propriété de votre eCarte |

Les modifications sont enregistrées automatiquement — vous verrez le bouton se mettre à jour instantanément.

---

## Créer un lien de partage cloud

Pour partager votre eCarte avec d'autres :

1. Assurez-vous que votre eCarte est [sauvegardée dans le cloud](./projects-and-cloud)
2. Ouvrez le panneau **Confidentialité et partage**
3. Assurez-vous que **Partage activé** est enclenché
4. Choisissez les paramètres de votre lien de partage :

### Protection par mot de passe

| Option | Description |
|--------|-------------|
| **Généré automatiquement** | Un mot de passe sécurisé de 9 caractères est créé pour vous |
| **Personnalisé** | Définissez votre propre mot de passe (minimum 9 caractères) |
| **Aucun** | Pas de mot de passe — toute personne avec le lien peut voir |

### Expiration

| Option | Quand cela expire |
|--------|------------------|
| **7 jours** | Une semaine après la création |
| **30 jours** | Un mois après la création |
| **90 jours** | Trois mois après la création |
| **Jamais** | Le lien reste actif indéfiniment |

5. Cliquez sur **Créer un lien de partage**

![Formulaire de création de lien de partage montrant le sélecteur de mode de mot de passe (auto-généré, personnalisé, aucun) et le menu déroulant d'expiration (7j, 30j, 90j, jamais)](/img/card-designer/65.png)

---

## Gérer vos liens de partage

Vos liens de partage actifs apparaissent sous forme de liste extensible dans le panneau Confidentialité et partage. Pour chaque lien, vous pouvez :

- **Copier l'URL** — Cliquez sur l'icône de copie pour récupérer le lien complet
- **Voir l'expiration** — Un compte à rebours affiche le temps restant (par ex. "expire dans 15 jours")
- **Voir le mot de passe** — Si vous avez créé le lien ou réinitialisé son mot de passe, le mot de passe est affiché pour que vous puissiez le partager
- **Réinitialiser le mot de passe** — Générez un nouveau mot de passe ou définissez-en un personnalisé (cela invalide l'ancien mot de passe)
- **Révoquer** — Désactivez définitivement le lien

![Liste de liens de partage montrant un lien développé avec l'URL copiable, le compte à rebours d'expiration, l'affichage du mot de passe, le bouton de réinitialisation du mot de passe et le bouton de révocation](/img/card-designer/66.png)

Les liens nouvellement créés se développent automatiquement pour que vous puissiez facilement copier l'URL et le mot de passe.

---

## Ce que voient les spectateurs

Lorsqu'une personne ouvre votre lien de partage, elle obtient une visionneuse 3D plein écran avec votre carte rendue exactement telle que vous l'avez conçue :

- **Aperçu 3D de la carte** — Matériaux, éclairage et effets complets
- **Barre d'info** — Affiche le titre de la carte, le type de carte et votre nom de créateur
- **Préréglages de caméra** — Les 5 préréglages disponibles (Portrait, Héro, Flottant, Dramatique, Vitrine)
- **Retournement de la carte** — Les spectateurs peuvent passer du recto au verso
- **Audio** — Si vous avez associé de l'audio, il se joue automatiquement
- **Copier le lien** — Les spectateurs peuvent copier l'URL de partage depuis la barre d'outils

![Lecteur de partage cloud montrant un aperçu 3D de la carte avec une barre d'info affichant le titre, le type et le nom du créateur, plus la barre d'outils flottante](/img/card-designer/67.png)

Si l'appareil d'un spectateur ne prend pas en charge WebGL, il verra un aperçu d'image statique au lieu du rendu 3D.

![Solution de repli WebGL montrant un aperçu d'image statique de la carte lorsque le rendu 3D n'est pas disponible](/img/card-designer/68.png)

:::note
Le lecteur de partage est en lecture seule — les spectateurs ne peuvent pas modifier votre design. Ils peuvent uniquement voir, retourner et interagir avec l'aperçu 3D.
:::

---

## Partages protégés par mot de passe

Pour les liens protégés par mot de passe, les spectateurs voient un formulaire de saisie de mot de passe avant d'accéder à l'aperçu.

![Formulaire de vérification du mot de passe avec un champ de saisie et un bouton Vérifier](/img/card-designer/69.png)

**La limitation du débit protège votre carte :**
- Les spectateurs ont **5 tentatives** pour saisir le bon mot de passe
- Après 5 tentatives échouées, l'accès est temporairement bloqué avec un compte à rebours visible
- Un message "Contactez le créateur pour obtenir de l'aide" apparaît en cas de blocage

![Écran de blocage par limitation du débit montrant un compte à rebours et le message "Contactez le créateur" après trop de tentatives de mot de passe échouées](/img/card-designer/70.png)

---

## Revendication et collaboration

Si vous avez activé **Autoriser la revendication** ou **Autoriser les copies** dans vos paramètres de confidentialité, les spectateurs peuvent faire plus que regarder :

### Revendiquer la propriété

Lorsque **Autoriser la revendication** est activé, les spectateurs voient un bouton **Revendiquer**. La revendication :

- Transfère la pleine propriété de l'eCarte au spectateur
- Génère un nouveau mot de passe pour le lien de partage (pour la sécurité)
- Le propriétaire d'origine perd l'accès à l'édition

![Modal de confirmation de revendication avec un style d'avertissement jaune expliquant que la propriété vous sera transférée](/img/card-designer/71.png)

:::caution
La revendication est un transfert unidirectionnel. Une fois que quelqu'un revendique votre eCarte, il en devient le nouveau propriétaire et vous ne pouvez plus la modifier.
:::

### Accès en édition (collaboration)

Lorsque **Autoriser les copies** est activé, les spectateurs voient un bouton **Voir** qui leur permet de demander un accès en édition. Cela :

- Les ajoute en tant que **collaborateur** sur votre eCarte
- Leur offre le choix d'**Éditer maintenant** (ouvre dans le Concepteur de cartes) ou d'**Éditer plus tard**
- Vous restez le propriétaire avec le contrôle total

![Modal de confirmation d'accès en édition avec un style violet montrant les options Éditer maintenant et Éditer plus tard](/img/card-designer/72.png)

:::note
Les spectateurs doivent avoir un [compte ELYSIUM](./your-account) pour revendiquer ou demander un accès en édition. S'ils ne sont pas connectés, l'écran de connexion s'ouvre automatiquement — et l'action reprend exactement là où elle s'était arrêtée après la connexion.
:::

---

## Rôles

Le système de partage reconnaît trois rôles :

| Rôle | Qui | Ce qu'il voit | Ce qu'il peut faire |
|------|-----|--------------|---------------------|
| **Propriétaire** | Vous (le créateur) | Badge "Propriétaire" | Contrôle total — édition, gestion des partages, révocation des liens |
| **Collaborateur** | Quelqu'un à qui vous avez accordé l'accès en édition | Badge "Collaborateur" | Ouvrir et éditer l'eCarte dans le Concepteur de cartes |
| **Spectateur** | Tout le monde | Pas de badge | Voir l'aperçu, revendiquer ou demander un accès en édition (si activé) |

![Lecteur de partage montrant le badge Propriétaire affiché à côté du nom du créateur dans la barre d'info](/img/card-designer/73.png)

---

## Partage en aperçu local

Le bouton **Partager** dans le panneau Export et la barre d'outils plein écran crée un lien d'aperçu local rapide. Cela stocke votre carte dans le stockage local du navigateur et génère un lien pour une prévisualisation instantanée.

- Cliquez sur **Partager** dans le panneau Export ou dans la barre d'outils plein écran
- Copiez le lien avec l'icône de copie (une coche verte confirme qu'il a été copié)

:::caution
Les liens d'aperçu local ne fonctionnent que sur le **même navigateur et appareil** où ils ont été créés. Vider les données de votre navigateur les supprime définitivement. Pour partager avec d'autres personnes, utilisez le partage cloud depuis le panneau Confidentialité et partage.
:::
