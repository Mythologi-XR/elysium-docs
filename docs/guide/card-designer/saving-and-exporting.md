---
sidebar_position: 7
---

# Saving, Exporting, and Sharing

## Saving your work

### Auto-save

Your design is automatically saved to your browser every time you make a change. If you accidentally close the tab, just reopen the Card Designer — your work will be waiting.

### Save to file

For a more permanent backup, click **Save Project** in the export section of the right panel. This downloads a `.ecard` file containing your entire design, including all images and stickers.

![Export section in the right panel showing PNG options, GLB options, Save Project, and Share buttons](/img/card-designer/37.png)

To reload it later, just drag the `.ecard` file onto the Card Designer landing page or use the "Load Saved Project" option in the setup wizard.

:::caution
Auto-save uses your browser's local storage. If you clear your browser data, it's gone. Save to a `.ecard` file or [save to the cloud](./projects-and-cloud) to keep your work safe.
:::

### Save to the cloud

If you have an [ELYSIUM account](./your-account), you can save your designs to the cloud for access from any device. Click **"Save to ELYSIUM"** in the sidebar to open the cloud save dialog.

![Save to ELYSIUM button in the sidebar actions area with the ELYSIUM logo icon](/img/card-designer/74.png)

For full details on cloud saving, project management, and the Projects panel, see [Projects and Cloud Save](./projects-and-cloud).

---

## Exporting your card

### As an image (PNG)

In the **Export** section of the right panel, choose **PNG** export:

- **Card Faces** mode — Exports the flat artwork of the front or back face. Best for printing.
- **3D Scene** mode — Exports the full 3D scene with lighting and effects. Best for sharing online.

![Card Faces export (flat artwork) vs 3D Scene export (rendered with lighting) side by side](/img/card-designer/38.png)

For print-quality output, use **Card Faces** mode at **4x resolution** — this gives you 300 DPI at the card's actual size.

![Quality difference between 1x and 4x resolution exports](/img/card-designer/39.png)

### As a 3D file (GLB)

Choose **GLB** export to get a 3D file you can use in AR experiences, 3D viewers, or game engines like Unity and Unreal.

**Bake Textures** toggle:
- **On** — Flattens all layers into a single texture per face. Best for compatibility with other tools.
- **Off** — Keeps all layers as separate meshes. Best if you plan to edit it later in ELYSIUM.

![Bake Textures on/off toggle in the export settings](/img/card-designer/41.png)

The export process has a few phases (Preparing, Exporting, Validating, Done). If validation finds errors, you'll see them listed — try enabling **Bake Textures** to resolve most issues.

![Export button shown across each phase — Preparing, Exporting, Validating, Done](/img/card-designer/40.png)

---

## Sharing your design

### Quick share (same device)

Click the **Share** button in the export panel to generate a quick local preview link. This stores your card in the browser and gives you a link to preview it.

![Share URL displayed below the Share button with the copy icon](/img/card-designer/42.png)

Click the **copy** icon to grab the link and share it wherever you like.

![Public share player as a viewer would see it — full-screen card, toolbar, watermark](/img/card-designer/43.png)

:::note
Quick share links only work on the **same browser and device** where they were created. For cross-device sharing with password protection and collaboration features, see [Sharing and Privacy](./sharing-and-privacy).
:::

### Cloud sharing

For sharing with anyone — on any device, with optional password protection, expiry dates, and collaboration features — use cloud sharing from the **Privacy & Sharing** panel in the right sidebar. See [Sharing and Privacy](./sharing-and-privacy) for the full guide.
