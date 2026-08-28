# Submission FE — Sub 3: Membangun Expense Tracker App

> **Purpose of this file**: single source of truth for the
> `fe/beginner/sub1/index.js` + `fe/beginner/sub1/specs/*.js` Playwright checker. Anything the
> checker asserts must trace back to a line in this file. Read this
> before touching anything under `fe/beginner/sub1/`.

- **Class**: **Belajar Membuat Front-End Web untuk Pemula** (course id
  315) — this is a **different, earlier course** than the one covering
  Sub 1/Sub 2 (Belajar Fundamental Front-End Web Development). Do not
  assume shared conventions between them.
- **Source**: official student brief (`Instruksi_Submission_...md`) +
  official Reviewer Space guideline (`Reviewer_Space.md`), both supplied
  by the project owner, condensed here.
- **App**: Personal Finance & Expense Tracker — a **starter project is
  provided** (`index.html` + skeleton), the student only writes
  `main.js`. This is unlike Sub 1/2 where the student builds HTML from
  scratch.
- **Stack constraint**: vanilla JS only, no libraries (jQuery/React/Vue
  banned), no minified JS submitted.
- **Runner**: `live-server` (checker does `npm init -y && npm install
  live-server` then spawns it — the student's zip is not expected to
  already have `node_modules` or even a `package.json` with deps; the
  checker bootstraps it).
- **Checker files**: `fe/beginner/sub1/index.js` (orchestrator), `fe/beginner/sub1/specs/reject.js`,
  `fe/beginner/sub1/specs/criteria1.js`, `fe/beginner/sub1/specs/criteria2.js`,
  `fe/beginner/sub1/specs/criteria3.js`, `fe/beginner/sub1/feedback.js` (feedback text generator).
- **Depends on**: nothing from Sub 1/Sub 2 — fully independent submission,
  independent course.
- **Scoring model is fundamentally different from Sub 1/2**: this is
  **not** pass/fail mandatory + star-boosting optionals. Every criterion
  scores **0–4 points** (Reject/Basic/Skilled/Advanced), and the final
  grade is the **average of the 3 criteria scores**. A single criterion
  scoring 0 rejects the whole submission regardless of the other two.

---

## 1. What the student was told to build

### Required data shape for every transaction object

```js
{
  id: string | number,   // suggested: +new Date()
  title: string,
  amount: number,        // must be a Number, not "2500"
  date: string,
  type: string           // 'income' | 'expense'
}
```

### Required `data-testid` structure for each rendered transaction card

```html
<div data-testid="transactionItem">
  <h3 data-testid="transactionItemTitle">Judul Transaksi</h3>
  <p data-testid="transactionItemAmount">Nominal: Rp10000</p>
  <p data-testid="transactionItemDate">Tanggal: 2030-12-01</p>
  <p data-testid="transactionItemType">Tipe: Pemasukan</p>
  <div>
    <button data-testid="transactionItemEditTypeButton">Ubah Tipe</button>
    <button data-testid="transactionItemDeleteButton">Hapus</button>
  </div>
</div>
```
Student may add classes/ids for styling, but **these `data-testid` values
are immutable** — this is the grading system's hook into the DOM.

### Other hard rules (independent of the 3 scored criteria)

- Cards must be added via `document.createElement()` — not
  `innerHTML +=` (that pattern strips previously-attached listeners, e.g.
  the delete button).
- No external JS libraries at all (this is stricter than Sub 1/2, which
  only ban *frameworks* — Sub 3 bans jQuery too).
- `data-testid` values on the **starter HTML** must not be removed or
  changed.
- `id` attributes referenced by the starter's own JS hooks
  (`incomeList`, `expenseList`, `transactionForm`, etc.) must not change.
- Existing starter HTML elements must not be deleted (student may add
  around them).
- The greeting text in `.tracker-header__greeting` (default: **"Siswa
  Front-End"**) must be replaced with the student's real name + Dicoding
  username, format like `Budi (bdi002)`.
- Submitted JS must not be minified.

### Kriteria 1 — Memanipulasi DOM untuk Form dan Daftar Transaksi

| Level | Points | Requirement |
|---|---|---|
| Reject | 0 | App won't open / errors on load, **or** starter `data-testid`s were removed/changed, **or** greeting text still says "Siswa Front-End" |
| Basic | 2 | Submitted transactions render; income → `incomeList`, expense → `expenseList` |
| Skilled | 3 | Basic + form validation: `alert()` (or equivalent) fires and blocks save if title is empty **or** amount < Rp1 |
| Advanced | 4 | Skilled + a dashboard summary (total balance, total income, total expense) that auto-updates whenever transaction data changes |

### Kriteria 2 — Mengelola Penyimpanan Data (Web Storage API)

| Level | Points | Requirement |
|---|---|---|
| Reject | 0 | All data disappears on page refresh (localStorage not used) |
| Basic | 2 | Data saved via `localStorage` + `JSON.stringify()`, reloaded via `JSON.parse()`, matching the transaction shape above; Delete button removes the item from screen **and** from localStorage |
| Skilled | 3 | Basic + Edit works: pressing it auto-fills `#transactionForm` with the selected transaction, user can change and save, form returns to "Add" mode after |
| Advanced | 4 | Skilled + UI updates driven by a **Custom Event**: every mutation (add/delete/edit) fires `dispatchEvent()`, and a single listener re-renders the whole view in response |

### Kriteria 3 — Fitur Interaktif (Pindah Kategori dan Pencarian)

| Level | Points | Requirement |
|---|---|---|
| Reject | 0 | "Ubah Tipe" button doesn't work, **or** the page errors when search is used |
| Basic | 2 | "Ubah Tipe" correctly moves an item between income ↔ expense lists |
| Skilled | 3 | Basic + live search: list filters as the user types, matching only on title |
| Advanced | 4 | Skilled + clearing the search box restores the full list automatically |

### Final grade formula

```
Nilai Akhir = (Kriteria1 + Kriteria2 + Kriteria3) / 3
```

| Nilai Akhir | Bintang | Level |
|---|---|---|
| < 1 | Rejected | — |
| 1 – <2 | Bintang 2 | Below Basic |
| 2 – <3 | Bintang 3 | Basic (pass) |
| 3 – <4 | Bintang 4 | Skilled |
| 4 | Bintang 5 | Advanced |

To **pass**, every one of the 3 criteria must independently score **≥2**
— a single 0 anywhere is an outright reject regardless of the average.

### Auto-reject conditions (independent of the 3 criteria)

- Any mandatory criterion unmet (per the tables above).
- File delivery requirements unmet (see below).
- Uses jQuery/React/Vue/etc. for DOM manipulation.
- Submitted JS is minified.

### File delivery / intake rules

- Must be a single (non-nested) `.zip`, e.g. `expense-tracker-app.zip`.
- No GDrive/GitHub links — must use the actual file-upload feature, or
  reject and tell the student to re-submit that way.
- Must extract and open in a normal editor.
- Must actually be the Expense Tracker App project (not a stale/mismatched
  upload).

---

## 2. What the human reviewer actually checks (Reviewer Space guideline)

Tools: code editor, browser, zip extractor (**no Node.js listed** — unlike
the Sub 1/2 reviewer guideline, since Sub 3 doesn't require `npm install`
by the reviewer; the starter ships ready to open).

Pre-checks before scoring:
- Reject nested zips outright.
- Reject non-file-upload submissions (GDrive/GitHub links) with a
  suggestion to re-upload properly.
- Confirm it's actually the Expense Tracker App.
- Confirm the code isn't minified.
- Confirm it extracts and opens cleanly.

**Explicit reviewer instruction, stated verbatim in the guideline and
worth preserving exactly because it constrains reviewer discretion:**
*"Hanya ikuti alur pemeriksaan di bawah ini. Apabila semua alur
pemeriksaan terpenuhi, maka kriteria ini diterima."* — i.e. the reviewer
(human or automated) is not supposed to freelance additional checks
beyond the listed flow for each level.

The three criteria checklists mirror Section 1 above line-for-line (the
Reviewer Space doc restates the same Reject/Basic/Skilled/Advanced bullet
lists with the same thresholds and the same `data-testid` template), so
they are not duplicated again here — Section 1's tables **are** the
reviewer's checklist.

One reviewer-side detail not spelled out on the student side: the
worked example ties the **rounded final average to a Dicoding letter
grade** (E/D/C/B/A) alongside the star rating — cosmetic, doesn't change
pass/fail logic already captured above.

---

## 3. Automation mapping (what `fe/beginner/sub1/*.js` currently encodes)

Implementation state, not spec — if this drifts from Section 1, the
spec wins.

| Dicoding criterion | Report key | Verification method (file) | Status / caveats |
|---|---|---|---|
| Reject: greeting not customized | `report.rejected` (string), no dedicated key | `reject.js` — reads `.tracker-header__greeting` innerText, fails if it still includes `"Siswa Front-End"` | 🤖 Automated |
| Reject: core `data-testid`s missing | `report.rejected` (string) | `reject.js` — checks presence of `transactionForm`, `incomeList`, `expenseList` only | 🤖 Automated — **partial**: doesn't check the per-item testids (`transactionItem`, etc.) here; those are checked separately inside `criteria1.js` and pushed to `report.rejected` there instead, not blocked before continuing |
| Kriteria 1 Basic | `Criteria 1 Basic: Render DOM & Lists` | `criteria1.js` — adds an income + an expense transaction via the form, checks both `incomeList`/`expenseList` got a child, then checks the 7 card `data-testid`s exist inside `incomeList` | 🤖 Automated |
| Kriteria 1 Skilled | `Criteria 1 Skilled: Input Validation` | `criteria1.js` — tries empty title (checks `alert()` fired OR native HTML5 `checkValidity()` failed), tries amount `"0"` (same check) | 🤖 Automated — accepts either `alert()` or native HTML5 validation as satisfying the doc's `alert()` wording; reasonable, not stricter than spec |
| Kriteria 1 Advanced | `Criteria 1 Advanced: Dynamic Dashboard` | `criteria1.js` — reads `.tracker-summary` innerText, strips non-digits, checks it contains `5000000`, `50000`, and `4950000` (the exact fixture amounts used earlier in the same test) | 🤖 Automated — ⚠️ **brittle**: hardcoded fixture numbers; if formatting inserts extra digits (e.g. a stray "2030" from a date) that happen to match a substring, or if currency formatting groups digits with separators that get stripped differently, this can false-positive/negative. Also depends on `criteria1.js` running its own income/expense fixtures earlier in the *same* test — if execution order changes (`index.js` currently calls `runCriteria1` before `runCriteria3` before `runCriteria2`), this breaks |
| Kriteria 2 Basic | `Criteria 2 Basic: LocalStorage & Delete` | `criteria2.js` — checks `localStorage` (via `JSON.stringify(localStorage)`) contains both fixture titles; later re-checks after clicking Delete | 🤖 Automated — ⚠️ **known logic bug**: the post-delete branch is `if (!A && !B) {...} else if (!B \|\| !A) {...}`, both branches set the flag `true`. The second condition uses **OR**, so it evaluates true even if only *one* of the two titles was actually removed — meaning a partially-broken Delete can still pass Basic. Should almost certainly be `!B && !A` mirroring proper "fully removed" semantics, or should explicitly check only the *deleted* item's absence rather than re-deriving from both fixture titles. Flagging this — do not treat current behavior as spec. |
| Kriteria 2 Skilled | `Criteria 2 Skilled: Edit Functionality` | `criteria2.js` — clicks an edit-like button (filtered to exclude "ubah tipe"), fills a new title, submits, and asserts the **same `id`** persists in localStorage under the new title | 🤖 Automated — correctly enforces the doc's unstated-but-implied "edit must not regenerate id" requirement (also explicit in `feedback.js`'s `c2Skilled` text, so this is an intentional stricter-than-written check, not a bug) |
| Kriteria 2 Advanced | `Criteria 2 Advanced: Custom Event Dispatch` | `index.js` — monkey-patches `EventTarget.prototype.dispatchEvent` at page-init to detect any dispatched event whose `type` isn't a standard DOM event (click/input/submit/etc.) | 🤖 Automated — reasonably robust, but only fires the flag on the **first** non-standard event seen; doesn't verify a *listener* actually consumes it (spec asks for dispatch **and** a responding listener) — code only verifies the dispatch half |
| Kriteria 3 Basic | `Criteria 3 Basic: Change Type` | `criteria3.js` — clicks "Ubah Tipe" inside `expenseList`, checks `incomeList` item count increases to ≥2 | 🤖 Automated |
| Kriteria 3 Skilled | `Criteria 3 Skilled: Search Filter` | `criteria3.js` — fills `[data-testid="searchTransactionFormTitleInput"]` with a fixture title, dispatches `input`, expects exactly **1** visible card | 🤖 Automated — ⚠️ assumes a specific `data-testid` for the search input (`searchTransactionFormTitleInput`) that is **not stated anywhere in either official doc** — this is inferred from the starter project, not the brief. If the actual starter project uses a different testid, this criterion will always fail regardless of student correctness. **Verify this testid against the real starter project HTML before trusting this check.** |
| Kriteria 3 Advanced | `Criteria 3 Advanced: Empty Search Restore` | `criteria3.js` — clears the search input, expects visible count `> 1` | 🤖 Automated |

**Other testids assumed by the checker but not present in either official
doc's text** (must be verified against the actual starter project, since
they're load-bearing for every test): `transactionFormTitleInput`,
`transactionFormAmountInput`, `transactionFormDateInput`,
`transactionFormTypeSelect`, `transactionFormSubmitButton`,
`searchTransactionFormTitleInput`. The docs only specify the *card*
template's testids explicitly — the *form* and *search* testids are
starter-project implementation details the checker had to infer. If the
starter project zip is ever regenerated/updated, re-diff these against it.

---

## 4. Known coupling risk / maintainer notes

- Sub 3 is **isolated** from Sub 1/Sub 2's shared logic — there is no
  `utils.js` cross-contamination risk here the way there is between
  `fe/fundamental/sub1/index.js`/`fe/fundamental/sub2/index.js`. If Sub 1/2 fixes broke Sub 3, the breakage is not
  structural (different course, different checker files); look instead
  at whether `utils.js`'s shared helpers (`runCommand`,
  `printSummaryReport`, `colors`) were changed in a way that affects all
  three checkers, since `fe/beginner/sub1/index.js` imports from `../../../utils`.
- Fix the Kriteria 2 Basic OR/AND bug above before relying on this
  checker for real grading — as written it can award Basic-level delete
  credit to submissions with a broken delete.
- Confirm the two unstated `data-testid`s (search input, form inputs)
  against the actual current starter project before trusting Kriteria 1
  Skilled or Kriteria 3 Skilled/Advanced results.
