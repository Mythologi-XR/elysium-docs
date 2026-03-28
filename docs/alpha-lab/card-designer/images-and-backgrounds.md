---
sidebar_position: 3
---

# Images, Backgrounds, and Stickers

## Adding images to your card

Drag and drop images directly onto the labeled zones in the left panel:

- **Front BG** — The full background image on the front of your card
- **Front FG** — An overlay image (your logo, character art, etc.) that sits on top of the background
- **Back Face** — The image for the back of your card
- **Brand Logo** — (Loyalty cards only) Your brand logo

![Left panel showing labeled image drop zones with placeholder states](/img/card-designer/13.png)

Watch for the **purple highlight** when dragging an image over a drop zone — that means it's ready to accept your file.

![Purple highlight effect when dragging an image over a drop zone](/img/card-designer/14.png)

After uploading a foreground image, use the **offset** and **scale** sliders to position and size it exactly how you want.

![FG offset X/Y and scale sliders after uploading a foreground image](/img/card-designer/15.png)

Supported formats: JPEG, PNG, and WebP.

---

## Picking a background

The background picker in the left panel gives you several options:

![Background picker section showing type selector — Color, Gradient, HDRI, Image, Transparent](/img/card-designer/16.png)

- **Color** — A solid color with opacity control
- **Gradient** — Two-color gradient with angle and opacity
- **HDRI Preset** — Choose from Studio, Sunset, Warehouse, or Forest environments for realistic reflections

  ![Four HDRI preset thumbnails — Studio, Sunset, Warehouse, Forest](/img/card-designer/17.png)

- **HDRI Custom** — Upload your own `.hdr` or `.exr` environment file
- **Image** — Use any image as a flat backdrop
- **Transparent** — No background (useful for exporting clean cutouts)

When using an HDRI background, a **Rotation** slider lets you spin the environment around to position light sources and reflections exactly where you want them.

![Same card at two different HDRI rotation angles showing how reflections change](/img/card-designer/18.png)

---

## Adding gradients

Both card types support gradient overlays on the front and back faces. In the content editor section of the left panel:

![Gradient section showing From/To color pickers, opacity, angle, and the link/unlink toggle](/img/card-designer/19.png)

- Pick **From** and **To** colors for your gradient
- Adjust the **opacity** and **angle**
- By default, the front and back gradients are **linked** — changes to one mirror to the other. Click the chain-link icon to unlink them for independent control.
- Use the **flip** icon to mirror the back gradient horizontally

![Linked gradients (matching front/back) vs unlinked (different front/back)](/img/card-designer/20.png)

---

## Adding stickers

Want to layer extra images on your card? The **Stickers** section lets you add up to 8 custom image stickers per card.

![Stickers section with multiple stickers added, showing title, face toggle, scale, offsets, and drag handles](/img/card-designer/21.png)

For each sticker, you can control:
- Which **face** it appears on (front or back)
- Its **scale** (20% to 200%)
- Its **position** using offset sliders
- Its **layer order** using drag handles to reorder the list

Stickers sit above all other content but below the material finish, so they look naturally "printed" on the card.

![3D canvas showing a custom sticker rendered on the card face](/img/card-designer/22.png)
