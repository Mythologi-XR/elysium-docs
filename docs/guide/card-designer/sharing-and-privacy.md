---
sidebar_position: 9
---

# Sharing and Privacy

The Card Designer gives you two ways to share your designs and full control over who can access them.

## Two ways to share

| | Local Preview | Cloud Share |
|---|---|---|
| **How** | Share button in the Export panel | Privacy & Sharing panel in the right sidebar |
| **Works across devices** | No (same browser only) | Yes (anyone with the link) |
| **Password protection** | No | Optional |
| **Expiry** | Never | 7, 30, or 90 days (or never) |
| **Claiming & collaboration** | No | Optional |

**Local preview** is great for a quick look on your own device. **Cloud share** is what you want for sending links to other people.

---

## Privacy controls

The **Privacy & Sharing** panel (shield icon) in the right sidebar lets you control how your eCard can be accessed. You need to be [signed in](./your-account) with a cloud-saved eCard to use these controls.

![Privacy & Sharing panel in the right sidebar showing four privacy toggles — Private, Sharing Enabled, Allow Copies, Allow Claiming](/img/card-designer/64.png)

Four toggles control access:

| Toggle | Default | What it does |
|--------|---------|-------------|
| **Private** | Off | Hides your eCard from public discovery |
| **Sharing Enabled** | On | Allows you to create share links |
| **Allow Copies** | Off | Lets recipients duplicate your eCard and edit their own copy |
| **Allow Claiming** | Off | Lets recipients claim full ownership of your eCard |

Changes save automatically — you'll see the toggle update instantly.

---

## Creating a cloud share link

To share your eCard with others:

1. Make sure your eCard is [saved to the cloud](./projects-and-cloud)
2. Open the **Privacy & Sharing** panel
3. Ensure **Sharing Enabled** is toggled on
4. Choose your share link settings:

### Password protection

| Option | Description |
|--------|-------------|
| **Auto-generated** | A secure 9-character password is created for you |
| **Custom** | Set your own password (minimum 9 characters) |
| **None** | No password — anyone with the link can view |

### Expiry

| Option | When it expires |
|--------|----------------|
| **7 days** | One week after creation |
| **30 days** | One month after creation |
| **90 days** | Three months after creation |
| **Never** | Link stays active indefinitely |

5. Click **Create Share Link**

![Share link creation form showing password mode selector (auto-generated, custom, none) and expiry dropdown (7d, 30d, 90d, never)](/img/card-designer/65.png)

---

## Managing your share links

Your active share links appear as an expandable list in the Privacy & Sharing panel. For each link you can:

- **Copy the URL** — Click the copy icon to grab the full link
- **See the expiry** — A countdown shows time remaining (e.g., "expires in 15 days")
- **View the password** — If you created the link or reset its password, the password is shown so you can share it
- **Reset the password** — Generate a new one or set a custom password (this invalidates the old password)
- **Revoke** — Permanently deactivate the link

![Share link list showing an expanded link with copyable URL, expiry countdown, password display, reset password button, and revoke button](/img/card-designer/66.png)

Newly created links automatically expand so you can easily copy the URL and password.

---

## What viewers see

When someone opens your share link, they get a full-screen 3D viewer with your card rendered exactly as you designed it:

- **3D card preview** — Full materials, lighting, and effects
- **Info bar** — Shows the card title, card type, and your creator name
- **Camera presets** — All 5 presets available (Portrait, Hero, Float, Drama, Showcase)
- **Card flip** — Viewers can flip between front and back
- **Audio** — If you attached audio, it plays automatically
- **Copy link** — Viewers can copy the share URL from the toolbar

![Cloud share player showing a 3D card preview with info bar displaying card title, type, and creator name, plus the floating toolbar](/img/card-designer/67.png)

If a viewer's device doesn't support WebGL, they'll see a static image preview instead of the 3D render.

![WebGL fallback showing a static image preview of the card when 3D rendering is not available](/img/card-designer/68.png)

:::note
The share player is read-only — viewers cannot change your design. They can only view, flip, and interact with the 3D preview.
:::

---

## Password-protected shares

For password-protected links, viewers see a password entry form before they can access the preview.

![Password verification form with a password input field and Verify button](/img/card-designer/69.png)

**Rate limiting keeps your card safe:**
- Viewers get **5 attempts** to enter the correct password
- After 5 failed attempts, access is temporarily locked with a visible countdown timer
- A "Contact the creator for assistance" message appears when locked out

![Rate limit lockout screen showing countdown timer and "Contact the creator" message after too many failed password attempts](/img/card-designer/70.png)

---

## Claiming and collaboration

If you've enabled **Allow Claiming** or **Allow Copies** in your privacy settings, viewers can do more than just look:

### Claim ownership

When **Allow Claiming** is on, viewers see a **Claim** button. Claiming:

- Transfers full ownership of the eCard to the viewer
- Generates a new password for the share link (for security)
- The original owner loses access to edit

![Claim confirmation modal with yellow warning style explaining that ownership will transfer to you](/img/card-designer/71.png)

:::caution
Claiming is a one-way transfer. Once someone claims your eCard, they become the new owner and you can no longer edit it.
:::

### Edit access (collaboration)

When **Allow Copies** is on, viewers see a **View** button that lets them request edit access. This:

- Adds them as a **collaborator** on your eCard
- Gives them the choice to **Edit Now** (opens in the Card Designer) or **Edit Later**
- You remain the owner with full control

![Edit access confirmation modal with purple style showing Edit Now and Edit Later options](/img/card-designer/72.png)

:::note
Viewers must have an [ELYSIUM account](./your-account) to claim or request edit access. If they're not signed in, the sign-in screen opens automatically — and the action picks up right where they left off after logging in.
:::

---

## Roles

The share system recognizes three roles:

| Role | Who | What they see | What they can do |
|------|-----|--------------|-----------------|
| **Owner** | You (the creator) | "Owner" badge | Full control — edit, manage shares, revoke links |
| **Collaborator** | Someone you've given edit access | "Collaborator" badge | Open and edit the eCard in the Card Designer |
| **Viewer** | Everyone else | No badge | View the preview, claim or request edit access (if enabled) |

![Share player showing the Owner badge displayed next to the creator's name in the info bar](/img/card-designer/73.png)

---

## Local preview share

The **Share** button in the Export panel and the fullscreen toolbar creates a quick local preview link. This stores your card in the browser's local storage and generates a link for instant previewing.

- Click **Share** in the Export panel or fullscreen toolbar
- Copy the link with the copy icon (a green checkmark confirms it was copied)

:::caution
Local preview links only work on the **same browser and device** where they were created. Clearing your browser data deletes them permanently. For sharing with other people, use cloud share from the Privacy & Sharing panel.
:::
