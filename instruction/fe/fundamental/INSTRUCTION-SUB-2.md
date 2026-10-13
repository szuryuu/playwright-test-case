# Submission FE — Sub 2: Integrasi Notes App dengan RESTful API

> **Purpose of this file**: single source of truth for the `fe/fundamental/sub2/index.js`
> Playwright checker. Anything the checker asserts must trace back to a
> line in this file. Read this before touching `fe/fundamental/sub2/index.js`.

- **Class**: Belajar Fundamental Front-End Web Development (Dicoding)
- **Source**: official student brief + official reviewer guideline (both
  pasted verbatim by the project owner, condensed here)
- **Stack constraint**: pure Vanilla JS, no framework; **must** now use
  webpack; local dummy data is retired — API is the only data source
- **API**: `https://notes-api.dicoding.dev/v2` (docs at that same URL)
- **Runner**: `webpack-dev-server` via `npm run start-dev`; production via
  `npm run build`
- **Checker file**: `fe/fundamental/sub2/index.js`
- **Depends on**: Sub 1 (`submission/fe/sub-1/INSTRUCTION.md`) — Kriteria
  Wajib 1 of this submission is literally "still pass everything from
  Sub 1."
- **Depended on by**: nothing yet (sub-3's spec hasn't been supplied to
  this doc set — see TODO at bottom).

---

## 1. What the student was told to build

### Kriteria Wajib 1 — Pertahankan Kriteria Submission Sebelumnya
Everything in Sub 1 must still hold: notes list render, add-note form
(right input types), CSS Grid on the notes list, ≥3 Web Components. This
submission is **additive**, not a rewrite.

### Kriteria Wajib 2 — RESTful API sebagai Sumber Data
- Data source is **only** `https://notes-api.dicoding.dev/v2` — the dummy
  local data from Sub 1 must be fully removed.
- Must implement, against that API:
  1. Create/add a new note.
  2. Get and display the list of notes.
  3. Delete a stored note.

### Kriteria Wajib 3 — webpack sebagai Module Bundler
- Must use `html-webpack-plugin`.
- Must run in dev mode via `npm run start-dev`, using
  `webpack-dev-server`.
- Must build for production via `npm run build`.

### Kriteria Wajib 4 — Fetch API
- All async requests to the Notes API must use the Fetch API specifically.

### Kriteria Wajib 5 — Loading Indicator
- Must show a loading indicator while an HTTP request is in flight (e.g.
  during login-like/fetch waits). Suggested (not required) to build it as
  a Web Component.

### Optional / "suggestion" criteria

| # | Dicoding wording | Concrete requirement |
|---|---|---|
| 1 | Fitur Arsip Catatan | Archive/unarchive a note, per the same API's archive endpoints; archived notes shown in a separate list from active ones. |
| 2 | Feedback Saat Error | Show the user something (e.g. `alert()`, or a lib like SweetAlert2) when a request fails. |
| 3 | Efek Pergerakan Halus / Animasi | Any animation library (anime.js, motion.dev, GSAP, etc.) or custom CSS/JS animation is acceptable. |
| 4 | Prettier sebagai Code Formatter | Prettier listed as a dependency in `package.json`, **and** a `.prettierrc` config file present in the zip. |

### Star rubric

| Stars | Condition |
|---|---|
| 1 | Meets mandatory criteria but plagiarized |
| 2 | Meets mandatory criteria only, not better than the class exercise |
| 3 | Meets mandatory criteria only |
| 4 | Mandatory + ≥2 optional |
| 5 | Mandatory + ≥3 optional |

### Hard auto-reject conditions

- Any mandatory criterion fails (including any Sub-1-inherited criterion).
- Copied from another participant.
- Uses a JS framework.
- Zip includes `node_modules/`.
- No `package.json` with a dependency list.

### File delivery format

Same as Sub 1: a `.zip` of the project folder (e.g. `notes-app.zip`),
containing the front-end project only.

---

## 2. What the human reviewer actually checks

Pre-checks before scoring criteria at all:
- Confirm the zip is a real project folder, pure vanilla JS (no
  React/Vue/Angular/etc.).
- Confirm webpack is present as the bundler and `package.json` has scripts
  for both dev and production runs.

### Kriteria 1 — Pertahankan Kriteria Sebelumnya
Re-verify: notes list, add-note form, CSS Grid, Web Components (≥3) — the
exact Sub-1 checks, run against the Sub-2 codebase.

### Kriteria 2 — RESTful API
- Confirm the data source really is
  `https://notes-api.dicoding.dev/v2`.
- Confirm all three operations are wired to it: display, add, delete.

### Kriteria 3 — Webpack
- Confirm webpack is the bundler.
- Confirm `webpack-dev-server` is used.
- Confirm `npm run start-dev` works.
- Confirm `npm run build` works.
- **Reject cases**: webpack missing; `start-dev` doesn't run; `build`
  doesn't run.

### Kriteria 4 — Fetch API
- Confirm requests use `fetch`, and that it actually works end-to-end.
- **Reject cases**: not using Fetch API; Fetch usage present but broken.

### Kriteria 5 — Loading Indicator
- Confirm a loading indicator (icon, text, or otherwise) appears during
  API requests.
- **Reject case**: no loading indicator during API calls.

### Saran 1 — Arsip
- Confirm each note item has an action to archive/unarchive it.
- Confirm archived notes live in a visually separate list from active
  notes.

### Saran 2 — Error Feedback
- Confirm the app surfaces failures to the user, including at minimum:
  the API endpoint being unreachable, and other error cases generally.

### Saran 3 — Animasi
- Confirm an animation effect exists and doesn't hurt UX.
- **Using an animation library → Approved** (explicitly allowed, not
  penalized as "using a framework").

### Saran 4 — Prettier
- Confirm `package.json` lists Prettier as a dependency.
- Confirm a `.prettierrc` or `.prettierrc.json` file is present.
- **Reject cases for this suggestion specifically**: no Prettier config
  file included; or a *different* formatter library used instead of
  Prettier.

### Star rubric (reviewer-side copy)

| Nilai | Ketentuan |
|---|---|
| 1 | Plagiarism |
| 2 | Mandatory only, not better than class exercise |
| 3 | Mandatory only |
| 4 | Mandatory + ≥2 suggestions |
| 5 | Mandatory + ≥3 suggestions |

---

## 3. Automation mapping (what `fe/fundamental/sub2/index.js` currently encodes)

Implementation state, not spec — if this drifts from Sections 1–2, the
spec wins.

| Dicoding criterion | `fe/fundamental/sub2/index.js` report key | Verification method | Status |
|---|---|---|---|
| Kriteria 1 → sub-check: form | `Criteria 1.1: Inherited Sub 1 Form Functionality` | Fill/submit + input tag-type check (reuses Sub-1-style logic, incl. static source scan + button-click reveal for hidden forms) | 🤖 Automated |
| Kriteria 1 → sub-check: Web Components | `Criteria 1.2: Inherited Sub 1 Web Components (Min 3)` | Recursive custom-tag scan | 🤖 Automated |
| Kriteria 1 → sub-check: CSS Grid | `Criteria 1.3: Inherited Sub 1 CSS Grid Layout` | Computed style extraction | 🤖 Automated |
| Kriteria 2 (REST API CRUD) | `Criteria 2: REST API Integrated (GET, POST, DELETE)` | Network interceptor watching `notes-api.dicoding.dev/v2/notes` for GET/POST/DELETE | 🤖 Hybrid — delete is manually clicked per `project_overview.md` |
| Kriteria 3 (webpack) | `Criteria 3: Webpack Bundler & Dev Server Configured` | `package.json` parse for `start-dev`/`build` scripts **+ actually runs `npm run build`** and checks exit code | 🤖 Automated — this is a hard gate; a build failure force-fails this criterion regardless of the scripts existing |
| Kriteria 4 (Fetch API) | `Criteria 4: Fetch API Implementation` | Static `grep` over `src/` for `fetch(` usage | 🤖 Automated — static only, doesn't confirm it *works*, unlike what the reviewer guideline asks |
| Kriteria 5 (loading indicator) | `Criteria 5: Loading Indicator Rendered` | Network throttling (2s delay) + DOM text/element scan while request is pending | 🤖 Automated |
| Saran 1 (archive) | `Suggestion 1: Archive & Unarchive Implementation` | Network interceptor watching for `POST /archive`-style calls | 🤖 Hybrid — manual click required |
| Saran 2 (error feedback) | `Suggestion 2: Error Feedback Handled` | Forced network abort (simulated 500) + alert/DOM scan for error text | 🤖 Automated |
| Saran 3 (animation) | `Suggestion 3: Animation` | Runtime Playwright check (`document.getAnimations()` + hover-triggered CSS transition) → `PASS` when motion is observed; falls back to static `package.json` lib scan / keyword grep → `INFO` | 🤖 Automated |
| Saran 4 (Prettier) | `Suggestion 4: Prettier Formatter Configured` | Filesystem scan for `.prettierrc` | 🤖 Automated — confirm it also checks `package.json` devDependencies per the reviewer guideline, not just the config file |

**Runtime setup specifics baked into `fe/fundamental/sub2/index.js`:**
- Spawns the dev server via `npm run start-dev -- --port 8080`.
- Before each API-dependent test run, it cleans state by fetching
  `/v2/notes` and `/v2/notes/archived` and deleting everything returned,
  so tests start from an empty account — **if the live API's response
  shape changes, this cleanup silently breaks and can leave stale data
  polluting the next run.**

---

## 4. Known coupling risk (why this file exists)

`fe/fundamental/sub2/index.js`'s `Criteria 1.1 / 1.2 / 1.3` are a second implementation of the
exact same checks as `fe/fundamental/sub1/index.js`'s Kriteria 2/3/4. This is very likely
**the actual bug**: a fix applied to one file's selector/Shadow-DOM/Grid
logic (during Sub-3 work) and not mirrored in the other. Recommended fix
direction: extract the shared DOM/Shadow-DOM/Grid/Web-Component assertions
into `utils.js` as pure functions, and have both `fe/fundamental/sub1/index.js` and `fe/fundamental/sub2/index.js`
call the same implementation, so this can't silently diverge again.

## TODO
- `submission/fe/sub-3/INSTRUCTION.md` still needs the actual Dicoding
  student brief + reviewer guideline text for Submission 3 — not supplied
  yet. Don't fabricate criteria for it; ask for the source docs first.
