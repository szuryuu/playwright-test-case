# Submission FE — Sub 1: Membangun Notes App

> **Purpose of this file**: single source of truth for the `fe/fundamental/sub1/index.js` Playwright
> checker. Anything the checker asserts must trace back to a line in this
> file. If you change `fe/fundamental/sub1/index.js`, check this file isn't now lying, and vice
> versa. Do not infer criteria from memory — read this file.

- **Class**: Belajar Fundamental Front-End Web Development (Dicoding)
- **Source**: official student brief + official reviewer guideline (both
  pasted verbatim by the project owner, condensed here)
- **Stack constraint**: pure Vanilla JS, no framework (React/Vue/Angular ⇒
  auto-reject)
- **Runner**: `live-server` (no bundler required at this stage)
- **Checker file**: `fe/fundamental/sub1/index.js`
- **Depends on**: nothing (this is the base submission)
- **Depended on by**: Sub 2 "Kriteria Wajib 1: Pertahankan Kriteria
  Submission Sebelumnya" re-runs the Web Component / Grid / Form checks from
  this stage against the Sub-2 codebase.

---

## 1. What the student was told to build

### Mandatory criteria (must all pass or the submission is rejected outright)

| # | Dicoding wording | Concrete requirement |
|---|---|---|
| 1 | Menampilkan Daftar Catatan dengan Baik | Render **all** notes from the provided dummy dataset. Every item must show its info correctly. |
| 2 | Formulir Tambah Catatan | A form with two inputs: **title** and **body**. Title must use `<input>`, body must use `<textarea>` (element type must match the field's purpose). |
| 3 | CSS Grid sebagai Metode Layouting | The **notes list** layout specifically must use CSS Grid. Other areas of the page may use Grid, Flexbox, or anything else. |
| 4 | Bangun Komponen UI dengan Web Component | At least **3** custom elements (Web Components). Any UI piece qualifies (note item, app bar, note input, etc.). |

### Optional / "suggestion" criteria (raise the star rating)

| # | Dicoding wording | Concrete requirement |
|---|---|---|
| 1 | Tampilan Menarik | Coherent color theme, no overlapping elements, readable font, sane padding/margin. **Manual/visual — not fully automatable.** |
| 2 | Realtime Validation | Form inputs validate as the user types (length, type, required, etc.), not only on submit. |
| 3 | Custom Attribute pada Custom Element | The custom element(s) must accept and actually **use** a custom attribute (not just declare it — it has to affect behavior/render). |
| 4 | Responsive di Berbagai Perangkat | Layout must not break (no overflow, no stacked/overlapping content) on mobile, tablet, and desktop viewports. |

### Star rubric (only applies if the submission is not rejected)

| Stars | Condition |
|---|---|
| 1 | Meets mandatory criteria but is plagiarized (copied another participant's project with only content swapped) |
| 2 | Meets mandatory criteria only, and is not meaningfully better than the class exercise |
| 3 | Meets mandatory criteria only |
| 4 | Meets all mandatory + at least **2** optional |
| 5 | Meets all mandatory + at least **3** optional |

### Hard auto-reject conditions (independent of the criteria above)

- Any mandatory criterion fails.
- Project is copied from another participant.
- Uses a JS framework (React/Angular/Vue/etc.) — **must be pure JS**.
- Zip includes `node_modules/`.
- `package.json` present but... (Sub 1 doesn't strictly require a
  `package.json`/dependency list the way Sub 2 does — that requirement is
  stated in the Sub 2 doc. Don't reject a Sub-1-only zip for missing
  `package.json` unless the student's project actually has npm
  dependencies it needs to declare.)

### File delivery format

- Deliverable is a `.zip` of the project folder (e.g. `notes-app.zip`),
  containing HTML/CSS/JS/assets only.

---

## 2. What the human reviewer actually checks (reviewer guideline)

Reviewer tooling (Node.js, browser, zip extractor) does: `npm install` →
run the script defined in `package.json` → inspect in browser. If the
project can't run, it's rejected with a stated reason + suggested fix — it
is **not** silently scored low.

### Kriteria 1 — Daftar Catatan
- Confirm a "notes list" component exists.
- Confirm the data shown matches the provided dummy dataset.
- Confirm each item renders its info correctly.
- **Auto-reject case**: not using the provided dummy data.

### Kriteria 2 — Formulir Tambah Catatan
- Confirm the add-note form exists.
- Confirm it has both title and body inputs.
- Confirm element types match purpose (`<input>` for title, `<textarea>`
  for body).
- **Reject cases**: form missing entirely; missing one of the two fields;
  wrong element type used.

### Kriteria 3 — CSS Grid
- Checked both in the CSS source and via DevTools "Inspect" on the live
  page.
- Grid is specifically expected on the **notes list**; other layout areas
  may use any technique.

### Kriteria 4 — Web Component
- Checked in JS source and via DevTools Inspect.
- **Using a library (e.g. Lit) to build the custom element → still
  Approved.** This is explicitly allowed, it's not "using a framework."
- Minimum 3 custom elements, or reject.

### Saran 1 — Tampilan Menarik
- Manual visual check: color theme fit, element placement, font
  readability, padding/margin.

### Saran 2 — Realtime Validation
- Confirm input validation exists (length, type, or other) that fires
  before submit, not only on submit.

### Saran 3 — Custom Attribute
- Confirm at least one custom element has a custom attribute that is
  **functionally used**, not just declared.
- **Reject case for this suggestion specifically**: custom attribute
  declared but non-functional.

### Saran 4 — Responsive
- Checked via Chrome DevTools device mode across mobile/tablet/desktop.
- **Reject/flag case**: any component breaks or isn't responsive on any of
  the three device classes.

### Star rubric (reviewer-side copy — identical intent to student-side table above)

| Nilai | Ketentuan |
|---|---|
| 1 | Plagiarism |
| 2 | Mandatory only, not better than the class exercise |
| 3 | Mandatory only |
| 4 | Mandatory + ≥2 suggestions |
| 5 | Mandatory + ≥3 suggestions |

---

## 3. Automation mapping (what `fe/fundamental/sub1/index.js` currently encodes)

This is the current implementation state, not the spec — if these diverge
from Section 1/2 above, the **spec above wins** and `fe/fundamental/sub1/index.js` has drifted.

| Dicoding criterion | `fe/fundamental/sub1/index.js` report key | Verification method | Status |
|---|---|---|---|
| Kriteria 1 (render dummy notes) | `Criteria 1: Render 15 Notes (Title & Body)` | Playwright `getByText`, pierces Shadow DOM, expects exact count of **15** | 🤖 Automated — ⚠️ hardcodes "15"; confirm the current dummy dataset still has exactly 15 items |
| Kriteria 2 (add-note form) | `Criteria 2: Add Note Form Functionality` | Fill & submit via Playwright; checks tag types of title/body inputs | 🤖 Automated |
| Kriteria 3 (CSS Grid) | `Criteria 3: CSS Grid Layout Detected` | Computed style extraction (`display: grid`) on the list container | 🤖 Automated |
| Kriteria 4 (Web Component ×3) | `Criteria 4: Web Components (Min 3)` | Recursive Shadow-DOM custom-tag scan (tag names containing `-`) | 🤖 Automated |
| Saran 1 (aesthetics) | *(not in report keys — see `project_overview.md`: 15s manual window)* | Human visual inspection | 👁️ Manual |
| Saran 2 (realtime validation) | `Suggestion 2: Realtime Form Validation` | Chromium `ValidityState` API extraction | 🤖 Automated |
| Saran 3 (custom attribute) | `Suggestion 3: Custom Attributes on Web Components` | Node attribute iterator, filters out standard HTML attrs | 🤖 Automated |
| Saran 4 (responsive) | `Suggestion 4: Mobile Responsiveness (No Overflow)` | Viewport resize to 390px + overflow check | 🤖 Automated |

**Not automated at all in `fe/fundamental/sub1/index.js`** (must stay manual, or be added):
plagiarism check, framework-ban check, `node_modules` zip check — these
are supposed to live in the **Layer 1 Golang orchestrator** (`main.go`),
per `project_overview.md` §2. Confirm they still run there; fe/fundamental/sub1/index.js should
not need to re-implement them.

---

## 4. Known coupling risk (why this file exists)

Sub 2's "maintain previous criteria" checks (`Criteria 1.1`, `1.2`, `1.3`
in `fe/fundamental/sub2/index.js`) re-run the **same DOM/Shadow-DOM/Grid logic** as this file's
Kriteria 2/3/4. If you patch a selector, a Shadow-DOM piercing strategy, or
the notes-count assumption in `fe/fundamental/sub1/index.js` to fix a Sub-1 regression, apply
the equivalent fix in `fe/fundamental/sub2/index.js` (or better: extract the shared logic into
`utils.js` and have both call it) — otherwise you'll fix Sub 1 and quietly
re-break Sub 2, which is the exact failure mode currently being debugged.
