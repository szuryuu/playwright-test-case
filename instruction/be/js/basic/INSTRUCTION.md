# Submission BE/JS/Basic — Evaluasi Pembelajaran Akhir (Final Assessment)

> **Purpose of this file**: single source of truth for a future
> `be/js/basic` checker. No checker exists yet for this submission in
> this repo — this file is the spec to build one against, not a
> retrofit of existing code. If/when a checker is written, add an
> "Automation mapping" section here the same way sub-1/2/3 have one, and
> keep it honest about what's actually implemented vs. spec.

- **Class**: Belajar Dasar Pemrograman JavaScript
- **Registry key (proposed)**: `be/js/basic` — `be` is a **new top-level
  group** (backend), `js` the language class, `basic` the course level.
  Other backend languages (Python, Rust, …) would add their own `be/*`
  classes. There is no browser, no DOM, no webpack here; it's plain
  Node.js scripts. Don't file this under `fe/`.
- **Source**: student brief ("Instruksi Submission: Evaluasi Pembelajaran
  Akhir") + Dicoding Reviewer Space guideline, both supplied by the
  project owner, condensed here.
- **Grading mechanism**: per the student brief, this is judged by
  **Dicoding's own autograding system** (~24h turnaround, up to 3
  business days if something's structurally wrong). The "Reviewer Space"
  doc is written as manual human-reviewer steps (open editor, run each
  command by hand) — treat it as the **spec for what the autograder
  checks**, not evidence that a human is expected to do this by hand
  every time.
- **Runtime**: Node.js only. **No `npm install`, no `package.json`
  scripts** — the brief explicitly states there's no dependency or
  runner-script setup; each task folder is run directly via `node`.
- **No web UI at all** — browser-based inspection doesn't apply to this
  submission, unlike every `fe/*` submission documented so far.

---

## 1. What the student was told to build

Deliverable is a `final-assessment/` folder (from a provided starter
project) containing 7 task subfolders, each with its own `instruksi.md`.
Three are mandatory, four are optional/bonus.

### Mandatory tasks (any failure here = outright reject, no partial credit)

#### `01-writing-comments` — manual check, not run via Node
- `index.js` must contain, as a **single-line comment** (`//`), the
  student's Dicoding **username** — this specific check is explicitly
  called out as requiring **manual verification**; it cannot be
  automated by running the program, since nothing in the file's
  *behavior* encodes the correct username. (A future checker can only
  automate the *presence of a `//` comment*, not correctness — correctness
  requires the reviewer/agent to be told the expected username, same
  situation as the Sub-3 greeting check in the `fe` group.)
- Must also contain, as a **multi-line comment** (`/* */`), this exact
  text — content, capitalization, numbering, and punctuation must match:
  ```
  Goal tahun ini:
  1. Belajar JavaScript.
  2. Menjadi Front-End atau Back-End Developer.
  ```

#### `02-code-style` — run via `node ./02-code-style/index.js`
Static style rules to check against the source:
- Semicolons on every statement.
- 2-space indentation (no tabs, no 4-space).
- `const` used wherever a variable is never reassigned.
- A space between `{ }` and inline-defined property names, e.g.
  `{ id: 'book-1', name: 'Book 1' }`.

Runtime expectation — program must run with no error and print (object
formatting may vary slightly by Node version; validate the *value*, not
exact formatting):
```
{ 'book-1': { id: 'book-1', name: 'Book 1' } }
book-1
```

#### `03-writing-test` — run via `node --test ./03-writing-test/index.test.js`
- `index.js` (contains a `sum` function) must be **untouched** by the
  student.
- `index.test.js` must import `sum` from `index.js`.
- Test runner restricted to `node:test` + `node:assert` (or `bun:test` if
  the student used Bun) — no other test framework/library.
- At least one test that calls `sum` with two numbers and asserts the
  result. More than one test is fine as long as all are relevant, have
  assertions, and all pass.
- `package.json` must be **untouched**.
- Expected output: all tests pass, e.g. `# pass 1` / `# fail 0`.

### Optional tasks (each worth points toward the star rating; failing or skipping one does *not* reject the submission — see scoring)

#### `optional-04-oop` — run via `node ./optional-04-oop/main.js`
- `Item.js`: ES6 class `Item` with `id`, `name`, `quantity`, `price`;
  method `updateDetails(name, quantity, price)`; method
  `displayDetails()` returning exactly:
  `ID: ${id}, Name: ${name}, Quantity: ${quantity}, Price: ${price}`.
- `Inventory.js`: ES6 class `Inventory` with an `items` array property;
  methods `addItem`, `removeItem(id)`, `listItems()`.
- `Item` and `Inventory` must live in separate modules, each exported
  correctly. `package.json` untouched.
- Expected `main.js` output: starts with Laptop + Mouse; Laptop's
  quantity/price change from 10/1000 to 8/950; Mouse (id 2) no longer
  appears after removal; each item printed on its own line in the format
  above.

#### `optional-05-recursive` — run via `node ./optional-05-recursive/main.js`
- `factorial.js`: recursive (has a base case, calls itself) — a
  loop-based implementation does **not** satisfy this criterion even if
  numerically correct.
- `fibonacci.js`: recursive, base case for the first element(s).
- Both exported correctly from their own modules.
- Expected: `factorial(5)` → `120`; `fibonacci(0)` → `[0]`;
  `fibonacci(1)` → `[0, 1]`; sequence to the 10th element →
  `[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55]`. Multi-line array printing by
  Node is fine as long as order/values match.

#### `optional-06-full-coverage-testing` — run via `node --test --experimental-test-coverage ./optional-06-full-coverage-testing/index.test.js`
- Must cover these exact scenarios against `sum`:
  - two non-negative numbers → correct sum
  - first arg not a number → `0`
  - second arg not a number → `0`
  - first arg negative → `0`
  - second arg negative → `0`
- Same test-module restriction as `03-writing-test`.
- `index.js` and `package.json` untouched.
- Expected: all tests pass, **and** coverage report shows 100%
  line/branch/function coverage for `index.js`. If the Node version
  doesn't support `--experimental-test-coverage`, fall back to
  `node --test` (no coverage flag) and manually verify branch coverage
  against `sum`'s actual implementation.

#### `optional-07-real-world-scenario` — run via `node ./optional-07-real-world-scenario/main.js`
- `orders.js`: `orders` array; each order has `id`, `customerName`,
  `items`, `totalPrice`, `status`; each item has `name`, `price`.
- `addOrder`: generates a unique id, computes `totalPrice` from items,
  sets initial status to `Menunggu`.
- `updateOrderStatus`: updates status by id.
- `calculateTotalRevenue`: sums `totalPrice` only for orders with status
  `Selesai`.
- `deleteOrder`: removes an order by id.
- Everything needed exported correctly. `package.json` untouched.
- Expected: Alice and Bob orders each total `25000`, initial status
  `Menunggu`; Alice → `Diproses`; Bob → `Selesai`; total revenue shown is
  `25000` (only from `Selesai` orders); after deleting Alice, only Bob
  remains; Alice's and Bob's IDs differ (IDs are random per run — don't
  assert a fixed value, just distinctness).

### All checker commands, in one place (from the brief's own summary)
```
node ./02-code-style/index.js
node --test ./03-writing-test/index.test.js
node ./optional-04-oop/main.js
node ./optional-05-recursive/main.js
node --test --experimental-test-coverage ./optional-06-full-coverage-testing/index.test.js
node ./optional-07-real-world-scenario/main.js
```
`01-writing-comments` is manual-only, never run via Node.

### Scoring — points, not stars-with-mandatory-gate like the `fe` group

This is structurally different from every `fe` submission documented so
far: it's **additive points out of 100**, not "mandatory pass + N
optional boosts star rating."

| Component | Required? | Points |
|---|---|---|
| `01-writing-comments` + `02-code-style` + `03-writing-test` (all three) | **Yes — any one failing rejects the whole submission** | 50 |
| `optional-04-oop` | No | +10 |
| `optional-05-recursive` | No | +10 |
| `optional-06-full-coverage-testing` | No | +10 |
| `optional-07-real-world-scenario` | No | +20 |
| **Max** | | **100** |

Optional points **only count if the submission wasn't rejected** — i.e.
if any mandatory task fails, optional successes are irrelevant, the
submission is rejected outright regardless of how many optional tasks
were done correctly.

### Rating from final points

| Rating | Point range |
|---|---|
| 1 | 50–59 |
| 2 | 60–69 |
| 3 | 70–79 |
| 4 | 80–89 |
| 5 | 90–100 |

(Anything below 50 isn't on this table because it means a mandatory task
failed → straight reject, no rating at all.)

---

## 2. File/folder structure rules (own auto-reject category, distinct from criteria)

These are **not** about code correctness — a submission can nail every
criterion above and still be rejected on structure alone:

- Do not rename any provided folder. A folder-name mismatch → reject.
- Do not delete any provided file. A missing file → likely reject.
- Remove irrelevant hidden folders/files before zipping: `.git`, `.idea`,
  `.code`, `__MACOSX` (macOS), `.DS_Store` (macOS). Presence of these →
  likely reject.
- **No `node_modules/` in the zip** (bloats the zip, breaks the code
  review UI).
- **No deep nesting.** Reject structure example straight from the brief:
  ```
  tugas-evaluasi-pembelajaran-akhir
  └── tugas-evaluasi-pembelajaran-akhir-master
    └── final-assessment
      ├── 01-writing-comments
      ...
  ```
  Correct structure:
  ```
  final-assessment
    ├── 01-writing-comments
    ├── 02-code-style
    ├── 03-writing-test
    ├── optional-04-oop
    ├── optional-05-recursive
    ├── optional-06-full-coverage-testing
    └── optional-07-real-world-scenario
  ```
  A checker for this submission should validate the zip unpacks directly
  to `final-assessment/<the 7 folders>` at shallow depth — not require a
  human to notice a GitHub-style `repo-master/` wrapper folder by eye.

---

## 3. Notes for whoever builds the checker

- This is the first submission in this doc set where the brief itself
  hands you **exact CLI commands and exact expected stdout strings**
  per criterion — there's very little inference required compared to
  the `fe` submissions' DOM/Shadow-DOM heuristics. A checker here can be
  close to a straightforward "run command, assert stdout" harness for
  everything except `01-writing-comments` (manual/username-dependent,
  same category as the `fe/beginner` greeting check) and the code-style
  static checks in `02-code-style` (semicolons, indentation, `const`
  usage, spacing — these need source-text linting, not just stdout
  comparison; consider actually running a configured ESLint/Prettier
  check rather than hand-rolled regex, since hand-rolled indentation/
  semicolon detection is a well-known way to generate false positives).
- `optional-06`'s coverage requirement depends on `--experimental-test-
  coverage` being supported by the Node version in the execution
  environment — pin/verify the Node version the checker runs under, or
  branch to the manual-fallback path the brief itself describes, rather
  than silently failing this criterion for CI's Node version reasons
  when the environment can't be blamed on the student.
- `optional-07`'s IDs are randomly generated per run by design — a
  checker must assert **distinctness**, not any fixed ID value. Don't
  hardcode expected IDs the way `sub1.js` hardcoded "15 notes" — that
  mistake already bit you once in this project.
- Recommend adding this submission's registry key now, even before a
  checker exists, so the CLI's "unrecognized pipeline" error is honest:
  `be/js/basic` should either resolve to a real (even stub) checker, or
  clearly say "not yet implemented" rather than "unrecognized."
