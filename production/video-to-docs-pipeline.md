# Video → Documentation Pipeline

> Screen recording to full documentation site — balancing automation with manual editorial control.

---

## Overview

This pipeline transforms raw screen recordings (with voiceover) into structured documentation websites. It's designed around a core principle: **AI handles extraction, humans handle editorial.** Three manual edit gates prevent AI-generated content from shipping without review.

**Use Case 1 — Design Review:** Record a screen walkthrough with voiceover critique → stop at Phase 04 → receive a structured design review document.

**Use Case 2 — Documentation Site:** Record an end-to-end app walkthrough → run full pipeline → deploy a complete documentation website with step-by-step guides, annotated screenshots, and embedded video clips.

---

## Pipeline Phases

### Phase 01 · Record & Capture `[Manual]`

**Tools:** OBS Studio (free) or built-in OS recorder; optionally Descript's built-in screen recorder for instant transcript sync.

**Process:**

- Record at 1080p minimum
- Capture system audio + mic voiceover on separate tracks if possible
- If using Descript, recording auto-links to transcript immediately

**Outputs:**

- Raw screen recording (MP4/MOV)
- Voiceover audio track

> **✋ Edit Gate:** Review your raw recording. Re-record sections if needed — this is the cheapest point to fix mistakes.

---

### Phase 02 · Transcribe & Segment `[Automated + Review]`

**Tools:**

| Tool | Use Case | Notes |
|------|----------|-------|
| **Descript** | Primary transcription & editing | Drag in video → instant transcript with timestamps. Edit video by editing text. Remove filler words with one click. Export transcript as Markdown with timecodes. ~$24/mo Pro plan. |
| **Whisper / WhisperX** | Free alternative (local or API) | OpenAI Whisper provides segment-level timestamps. WhisperX adds word-level accuracy + speaker diarization. API cost: $0.006/min. |

**Outputs:**

- Timestamped transcript (Markdown/SRT)
- Cleaned audio (filler words removed)
- Edited video (optional rough cut via Descript)

> **✋ Edit Gate:** Review and correct the transcript. Fix names, technical terms, and AI misinterpretations. This transcript becomes the foundation for all documentation.

---

### Phase 03 · AI Video Analysis `[Automated]`

**Tools:**

| Tool | Use Case | Notes |
|------|----------|-------|
| **Gemini API** | Scene-level video analysis | Upload via File API (up to 2GB, 2hr). Processes at 1 FPS with full audio. Returns structured JSON with timestamped scene descriptions, UI state changes, and navigation flow. ~$0.07/min video. |
| **PySceneDetect + FFmpeg** | Frame extraction at scene boundaries | PySceneDetect detects visual transitions (screen changes). FFmpeg extracts high-res keyframes at each boundary. Free / open source. |

**Key commands:**

```bash
# PySceneDetect — detect scenes and extract frames
scenedetect --input walkthrough.mp4 detect-adaptive list-scenes save-images

# FFmpeg — extract frames at scene changes (threshold 0.3 = 30% pixel change)
ffmpeg -i walkthrough.mp4 -vf "select=gt(scene\,0.3),scale=1920:1080" -vsync vfr frame-%04d.png

# FFmpeg — extract a specific clip by timestamp
ffmpeg -ss 00:01:30 -to 00:02:15 -i walkthrough.mp4 -c copy clip-login-flow.mp4
```

**Outputs:**

- Structured scene timeline (JSON) from Gemini
- Extracted keyframe images (PNG) at each step
- Scene boundary timestamps (CSV)

---

### Phase 04 · Content Structuring `[AI + Manual Review]`

**Tools:** Claude

**Process:** Feed Claude three inputs from previous phases:

1. The corrected transcript (Phase 02)
2. Gemini's scene analysis JSON (Phase 03)
3. The extracted screenshots (Phase 03)

Claude generates:

- Documentation outline with section hierarchy
- Step-by-step Markdown content per section
- Image references mapped to each step
- Annotation suggestions for screenshots

> **✋ Edit Gate:** This is the most important review point. Read through the generated documentation structure. Reorder sections, rewrite steps that don't match your intended flow, add context the AI missed. The structure you approve here defines the final site.

---

### Phase 05 · Visual Polish & Annotation `[Manual + Tools]`

**Tools:**

| Tool | Use Case | Notes |
|------|----------|-------|
| **CleanShot X / Shottr / Snagit** | Screenshot annotation | Add numbered callouts, highlight UI elements, blur sensitive data, crop to focus areas. Faster and cleaner than automated annotation. |
| **FFmpeg** | Video clip extraction | Use scene timestamps from Phase 03 to cut precise clips. Convert to GIF or WebM for web embedding. |

**Clip conversion for web:**

```bash
# MP4 clip to GIF (for inline documentation)
ffmpeg -i clip.mp4 -vf "fps=10,scale=800:-1" -loop 0 clip.gif

# MP4 clip to WebM (smaller, better quality)
ffmpeg -i clip.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 clip.webm
```

**Outputs:**

- Annotated screenshots per documentation step
- Short video clips / GIFs for complex interactions
- Final image assets organized by section

> **✋ Edit Gate:** Review each annotated screenshot. Ensure callouts are clear, nothing sensitive is visible, and images match the text descriptions from Phase 04.

---

### Phase 06 · Documentation Site Build `[Automated + Configuration]`

**Tools:**

| Tool | Use Case | Notes |
|------|----------|-------|
| **Docusaurus** | Static site generator | React-based (matches ELYSIUM stack), MDX support, versioning built-in, Algolia search with AI assistant (v3.9+). Free / open source. |
| **Claude** | File structure generation | Generates sidebars.js config, category metadata, MDX files with image references, and custom components for video embeds. |

**Docusaurus project structure:**

```
elysium-docs/
├── docs/
│   ├── getting-started/
│   │   ├── _category_.json
│   │   ├── 01-login.mdx
│   │   ├── 02-dashboard.mdx
│   │   └── 03-first-experience.mdx
│   ├── features/
│   │   ├── _category_.json
│   │   ├── ar-lens.mdx
│   │   └── geist-engine.mdx
│   └── img/
│       ├── step-01-login.png
│       ├── step-02-dashboard.png
│       └── clips/
│           └── login-flow.webm
├── docusaurus.config.js
├── sidebars.js
└── package.json
```

**Deployment:** Vercel or Netlify (free tier available, auto-deploys from GitHub).

**Outputs:**

- Complete Docusaurus project with all pages
- Configured sidebar navigation
- Deployed documentation website

---

## Cost Summary

| Tool | Cost | Phase |
|------|------|-------|
| OBS Studio | Free | 01 |
| Descript | $24/mo (Pro) | 02 |
| Whisper API (alternative) | $0.006/min | 02 |
| Gemini API | ~$0.07/min video | 03 |
| PySceneDetect + FFmpeg | Free (open source) | 03 |
| Claude API | Per token usage | 04–06 |
| CleanShot X | $29 one-time | 05 |
| Docusaurus | Free (open source) | 06 |
| Vercel / Netlify | Free tier available | 06 |

---

## Design Principles

**Automation handles extraction, humans handle editorial.** AI transcribes, detects scenes, and drafts content — but you review the transcript (Phase 02), approve the structure (Phase 04), and polish visuals (Phase 05). Three clear edit gates prevent AI-generated content from shipping without review.

**Each phase produces portable artifacts.** Every phase outputs standard files (Markdown, JSON, PNG, CSV) that aren't locked to any specific tool. Swap Descript for Whisper, Gemini for GPT-4o, or Docusaurus for Astro without rebuilding the pipeline.

**Works for both use cases.** For design reviews (UC1), stop at Phase 04 — Claude generates a structured critique document. For full documentation sites (UC2), run the complete pipeline through Phase 06.

---

## Quick Reference: Full Pipeline Run

```
Recording (MP4)
    ↓
Descript / Whisper → Timestamped Transcript (MD)  ← ✋ Review transcript
    ↓
Gemini API → Scene Timeline (JSON)
PySceneDetect + FFmpeg → Keyframes (PNG)
    ↓
Claude → Documentation Structure (MD files)       ← ✋ Review structure
    ↓
Annotation Tools → Polished Screenshots (PNG)      ← ✋ Review visuals
    ↓
Docusaurus → Documentation Website (deployed)
```
