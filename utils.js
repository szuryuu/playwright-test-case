const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function runCommand(command, cwd) {
  try {
    execSync(command, { cwd, stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

// Normalizes boolean | "PASS: ..." | "FAIL: ..." | "INFO: ..." report values
// to a single pass/fail/info verdict for both display and scoring.
function resultKind(value) {
  if (value === true) return "pass";
  if (typeof value === "string") {
    const v = value.trim().toUpperCase();
    if (v.startsWith("PASS")) return "pass";
    if (v.startsWith("FAIL")) return "fail";
    if (v.startsWith("INFO")) return "info";
  }
  return "fail";
}

function printSummaryReport(report) {
  console.log(
    `\n${colors.bold}======================================================${colors.reset}`,
  );
  console.log(`${colors.bold} FINAL AUTOMATED REVIEW SUMMARY${colors.reset}`);
  console.log(
    `${colors.bold}======================================================\n${colors.reset}`,
  );

  const hasReject = report.rejected && report.rejected.length > 0;

  if (hasReject) {
    console.log(
      `${colors.red}${colors.bold} [!] SUBMISSION REJECTED - CRITICAL FAILURES [!]${colors.reset}`,
    );
    report.rejected.forEach((reason) => {
      console.log(`${colors.red}     [-] ${reason}${colors.reset}`);
    });
    console.log("");
  }

  console.log(`${colors.bold} --- MANDATORY CRITERIA ---${colors.reset}`);
  for (const [criteria, passed] of Object.entries(report.mandatory)) {
    const kind = resultKind(passed);
    const statusText = kind === "pass" ? "[PASS]" : kind === "info" ? "[INFO]" : "[FAIL]";
    const color = kind === "pass" ? colors.green : kind === "info" ? colors.yellow : colors.red;
    const detail =
      typeof passed === "string" ? ` — ${passed.replace(/^\s*(PASS|FAIL|INFO):\s*/i, "")}` : "";
    console.log(
      `  ${color}${statusText.padEnd(6)}${colors.reset} | ${criteria}${color}${detail}${colors.reset}`,
    );
  }

  console.log(`\n${colors.bold} --- OPTIONAL SUGGESTIONS ---${colors.reset}`);
  if (report.optional && Object.keys(report.optional).length > 0) {
    for (const [criteria, passed] of Object.entries(report.optional)) {
      const kind = resultKind(passed);
      const statusText = kind === "pass" ? "[PASS]" : kind === "info" ? "[INFO]" : "[FAIL]";
      const color = kind === "pass" ? colors.green : kind === "info" ? colors.yellow : colors.red;
      const detail =
        typeof passed === "string" ? ` — ${passed.replace(/^\s*(PASS|FAIL|INFO):\s*/i, "")}` : "";
      console.log(
        `  ${color}${statusText.padEnd(6)}${colors.reset} | ${criteria}${color}${detail}${colors.reset}`,
      );
    }
  } else {
    console.log(
      `${colors.yellow}  (No optional criteria evaluated)${colors.reset}`,
    );
  }

  const m = report.mandatory;
  const isSub3 = Object.keys(m).some((k) => k.includes("Criteria 1 Basic"));
  const totalPassed = Object.values(m).filter((v) => resultKind(v) === "pass").length;
  const totalCriteria = Object.keys(m).length;
  const score = Math.round((totalPassed / totalCriteria) * 100);

  const optValues = report.optional ? Object.values(report.optional) : [];
  const optTotal = optValues.length;
  const optPassed = optValues.filter((v) => resultKind(v) === "pass").length;

  let stars = 0;
  let statusText = "";
  let statusColor = colors.red;

  if (isSub3) {
    const passedBasics =
      m["Criteria 1 Basic: Render DOM & Lists"] === true &&
      m["Criteria 2 Basic: LocalStorage & Delete"] === true &&
      m["Criteria 3 Basic: Change Type"] === true;

    if (hasReject || !passedBasics) {
      stars = 0;
      statusText = "REJECT (Kriteria dasar tidak terpenuhi / Ada fatal error)";
      statusColor = colors.red;
    } else if (totalPassed === 9) {
      stars = 5;
      statusText = "LULUS - Bintang 5 (Sempurna)";
      statusColor = colors.cyan;
    } else if (totalPassed >= 6) {
      stars = 4;
      statusText = "LULUS - Bintang 4 (Sangat Baik)";
      statusColor = colors.green;
    } else {
      stars = 3;
      statusText = "LULUS - Bintang 3 (Baik)";
      statusColor = colors.yellow;
    }
  } else {
    if (hasReject || totalPassed < totalCriteria) {
      stars = 0;
      statusText = "REJECT (Belum memenuhi standar minimum)";
      statusColor = colors.red;
    } else if (optPassed >= 3) {
      stars = 5;
      statusText = "LULUS - Bintang 5 (Sempurna)";
      statusColor = colors.cyan;
    } else if (optPassed >= 2) {
      stars = 4;
      statusText = "LULUS - Bintang 4 (Sangat Baik)";
      statusColor = colors.green;
    } else {
      stars = 3;
      statusText = "LULUS - Bintang 3 (Baik)";
      statusColor = colors.yellow;
    }
  }

  const starVisual = "⭐".repeat(stars) + "☆".repeat(5 - stars);

  console.log(`\n${colors.bold} === PREDIKSI PENILAIAN ===${colors.reset}`);
  console.log(`  Skor  : ${totalPassed} / ${totalCriteria} (${score}%)`);
  if (optTotal > 0) {
    console.log(`  Saran : ${optPassed} / ${optTotal} terpenuhi`);
  }
  console.log(`  Rating: ${statusColor}${starVisual}${colors.reset}`);
  console.log(
    `  Status: ${statusColor}${colors.bold}${statusText}${colors.reset}`,
  );

  console.log(
    `\n${colors.cyan} [*] NOTE: Visual aesthetics, animation smoothness, and code plagiarism still require human verification.${colors.reset}`,
  );
  console.log(
    `${colors.bold}======================================================\n${colors.reset}`,
  );
}

// SOURCE OF TRUTH: The exact 15 dummy notes required by Dicoding for Sub 1.
// Restored in commit after 1ae207b accidentally removed it (see git log).
const REQUIRED_NOTES = [
    { title: 'Welcome to Notes, Dimas!', body: 'Welcome to Notes! This is your first note.' },
    { title: 'Meeting Agenda', body: 'Discuss project updates and assign tasks' },
    { title: 'Shopping List', body: 'Milk, eggs, bread, fruits' },
    { title: 'Personal Goals', body: 'Read two books per month' },
    { title: 'Recipe: Spaghetti Bolognese', body: 'Ingredients: ground beef' },
    { title: 'Workout Routine', body: 'Monday: Cardio' },
    { title: 'Book Recommendations', body: '1. \'The Alchemist\'' },
    { title: 'Daily Reflections', body: 'Write down three positive things' },
    { title: 'Travel Bucket List', body: '1. Paris, France' },
    { title: 'Coding Projects', body: '1. Build a personal website' },
    { title: 'Project Deadline', body: 'Complete project tasks by the deadline' },
    { title: 'Health Checkup', body: 'Schedule a routine health checkup' },
    { title: 'Financial Goals', body: '1. Create a monthly budget' },
    { title: 'Holiday Plans', body: 'Research and plan for the upcoming holiday' },
    { title: 'Language Learning', body: 'Practice Spanish vocabulary' }
];

// --- Shared DOM audits (extracted from sub1/sub2; both inherit the same
// Sub-1 checks — see INSTRUCTION-SUB-1.md §4) ---

const TITLE_SELECTORS = [
  "note-form input",
  "#title",
  'input[name="title"]',
  'input[placeholder*="judul" i]',
  'input[placeholder*="title" i]',
  'input[type="text"]:not([placeholder*="cari" i]):not([placeholder*="search" i]):not([id*="search" i]):not([class*="search" i])',
  'input:not([type="search"]):not([id*="search" i]):not([class*="search" i]):not([placeholder*="cari" i])',
];

const BODY_SELECTORS = [
  "note-form textarea",
  "#body",
  'textarea[name="body"]',
  'textarea[placeholder*="isi" i]',
  'textarea[placeholder*="note" i]',
  "textarea",
];

const SUBMIT_SELECTORS = [
  'note-form button[type="submit"]',
  "note-form button",
  'button[type="submit"]',
  'button:has-text("Tambah")',
  'button:has-text("Simpan")',
  'button:has-text("Add")',
  'button:has-text("Submit")',
  'form button:not([type="reset"]):not([type="button"]):not(:has-text("Batal")):not(:has-text("Bersih"))',
  "form button",
];

async function tryDetectFormInputs(page) {
  // 1. Find a visible title-like input first.
  let titleInput = null;
  for (const sel of TITLE_SELECTORS) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      titleInput = el;
      break;
    }
  }
  if (!titleInput) return { titleInput: null, bodyInput: null, submitBtn: null };

  // 2. Scope body + submit to the form that owns the title input, so a
  //    search bar elsewhere on the page can't be mistaken for the note form.
  const formLoc = page.locator("form").filter({ has: titleInput });
  if ((await formLoc.count()) > 0) {
    const form = formLoc.first();
    const bodyEl = form.locator("textarea").first();
    const btn = form.locator('button[type="submit"], button').first();
    if (
      (await bodyEl.isVisible().catch(() => false)) &&
      (await btn.isVisible().catch(() => false))
    ) {
      return { titleInput, bodyInput: bodyEl, submitBtn: btn };
    }
  }

  // 3. Fallback: global selectors (form-less or unusual markup).
  for (const bodySel of BODY_SELECTORS) {
    const bodyEl = page.locator(bodySel).first();
    if (await bodyEl.isVisible().catch(() => false)) {
      for (const subSel of SUBMIT_SELECTORS) {
        const btn = page.locator(subSel).first();
        if (await btn.isVisible().catch(() => false)) {
          return { titleInput, bodyInput: bodyEl, submitBtn: btn };
        }
      }
      return { titleInput, bodyInput: bodyEl, submitBtn: null };
    }
  }
  return { titleInput, bodyInput: null, submitBtn: null };
}

// Walk a submission's source tree (excluding build/dependency dirs) and return
// every HTML/JS/CSS file path. Shared by the static-source scanners.
function collectSourceFiles(targetDir) {
  const files = [];
  if (!targetDir) return files;
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return;
    }
    for (const entry of entries) {
      if (["node_modules", ".git", "dist"].includes(entry.name)) continue;
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(html|js|mjs|cjs|jsx|ts|tsx|css)$/i.test(entry.name)) files.push(p);
    }
  };
  walk(targetDir);
  return files;
}

// Students sometimes hide the add-note form behind a button (modal/FAB). Read
// the source first to confirm a form actually exists, then try to reveal it.
function sourceHasForm(targetDir) {
  if (!targetDir) return false;

  let hasInput = false;
  let hasTextarea = false;
  for (const file of collectSourceFiles(targetDir)) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch (e) {
      continue;
    }
    if (!hasInput) {
      hasInput = /<\s*input\b/i.test(src) || /createElement\(\s*["']input\b/i.test(src);
    }
    if (!hasTextarea) {
      hasTextarea = /<\s*textarea\b/i.test(src) || /createElement\(\s*["']textarea\b/i.test(src);
    }
    if (hasInput && hasTextarea) return true;
  }
  return false;
}

const REVEAL_KEYWORDS = ["tambah", "add", "new", "buat", "baru", "tulis", "create", "+"];

// Clicks the (skip+1)-th visible button that looks like it opens the form.
async function clickRevealButton(page, skip) {
  return await page.evaluate(
    ({ keywords, skip }) => {
      const matches = [];
      function scan(node) {
        if (!node || node.nodeType !== 1) return;
        const tag = node.tagName.toLowerCase();
        const role = (node.getAttribute("role") || "").toLowerCase();
        const cls = typeof node.className === "string" ? node.className.toLowerCase() : "";
        const isButtonLike =
          tag === "button" ||
          tag === "a" ||
          role === "button" ||
          cls.includes("btn") ||
          cls.includes("button") ||
          cls.includes("fab");
        if (isButtonLike) {
          const text = (
            (node.getAttribute("aria-label") || "") +
            " " +
            (node.textContent || "") +
            " " +
            (node.id || "") +
            " " +
            cls
          ).toLowerCase();
          const rect = node.getBoundingClientRect();
          if (
            !node.disabled &&
            node.getAttribute("aria-disabled") !== "true" &&
            rect.width > 0 &&
            rect.height > 0 &&
            keywords.some((k) => text.includes(k))
          ) {
            matches.push(node);
          }
        }
        if (node.shadowRoot) Array.from(node.shadowRoot.childNodes).forEach(scan);
        Array.from(node.children).forEach(scan);
      }
      scan(document.body);
      if (matches[skip]) {
        matches[skip].click();
        return true;
      }
      return false;
    },
    { keywords: REVEAL_KEYWORDS, skip },
  );
}

async function detectFormInputs(page, targetDir) {
  let found = await tryDetectFormInputs(page);
  if (found.titleInput || !sourceHasForm(targetDir)) return found;

  for (let i = 0; i < 6 && !found.titleInput; i++) {
    const clicked = await clickRevealButton(page, i);
    if (!clicked) break;
    await page.waitForTimeout(800);
    found = await tryDetectFormInputs(page);
  }
  return found;
}

// For the API sniper (sub2): a reload can close the form again, so re-reveal
// before injecting if the title input is no longer visible.
async function ensureFormVisible(page, titleInput) {
  if (!titleInput) return;
  const formReady = async () =>
    (await titleInput.isVisible().catch(() => false)) &&
    (await titleInput.isEditable().catch(() => false));
  if (await formReady()) return;

  // A successful submit may leave the old modal form visible-but-disabled while
  // its POST and refresh requests settle. Wait for an enabled opener, then
  // require the input to be visible and editable before the next injection.
  for (let i = 0; i < 8; i++) {
    if (await formReady()) return;
    // Retry the primary opener: it may have been disabled by the previous
    // submission and become enabled only after its refresh completes.
    await clickRevealButton(page, 0);
    await page.waitForTimeout(800);
  }
}

const VALIDATION_KEYWORDS = [
  "tidak boleh kosong",
  "harus diisi",
  "wajib diisi",
  "belum diisi",
  "minimal",
  "karakter",
  "terlalu pendek",
  "too short",
  "required",
  "tidak valid",
  "invalid",
  "harus lebih",
  "is required",
];

// Counts *visible* nodes whose text contains a validation phrase. Pre-existing
// matches (e.g. a note body that happens to contain "minimal") cancel out via
// before/after diff, so only feedback that appears while typing counts.
async function countVisibleValidationText(page) {
  return await page.evaluate((kws) => {
    let count = 0;
    function scan(node) {
      if (!node || node.nodeType !== 1) return;
      const style = window.getComputedStyle(node);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      ) return;
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const text = (node.textContent || "").toLowerCase();
      if (text.length > 0 && text.length <= 200 && kws.some((k) => text.includes(k))) {
        count++;
      }
      if (node.shadowRoot) Array.from(node.shadowRoot.childNodes).forEach(scan);
      Array.from(node.children).forEach(scan);
    }
    scan(document.body);
    return count;
  }, VALIDATION_KEYWORDS);
}

// Realtime validation must fire as-you-type (on `input`), not on blur/submit.
// The old check passed on the mere presence of `required`/`minlength`, which is
// native submit-time validation — a false positive. We now require a visible
// error message to appear while typing, with no blur or submit dispatched.
//
// We arm the validator first (valid value + blur) because a common pattern
// validates once on blur, then switches to live-on-input afterwards; without
// arming, those validators stay dormant and we'd wrongly fail them.
async function checkRealtimeValidation(page, titleInput) {
  await titleInput.fill("valid title");
  await titleInput.blur();
  await page.waitForTimeout(200);
  const before = await countVisibleValidationText(page);

  // Empty exercises "required"-style rules.
  await titleInput.fill("");
  await page.waitForTimeout(300);
  const emptyCount = await countVisibleValidationText(page);

  // One char exercises "minlength"-style rules.
  await titleInput.type("a");
  await page.waitForTimeout(300);
  const typedCount = await countVisibleValidationText(page);

  return emptyCount > before || typedCount > before;
}

function scanDefinedWebComponents(targetDir) {
  const names = new Set();
  if (!targetDir) return [];

  for (const file of collectSourceFiles(targetDir)) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch (e) {
      continue;
    }
    const re = /customElements\.define\(\s*["']([^"']+)["']/g;
    let m;
    while ((m = re.exec(src))) names.add(m[1].toLowerCase());
  }
  return Array.from(names);
}

// Static source-tree signals for the optional suggestions, used as a first-pass
// before (or alongside) the live-DOM checks. Mirrors the web-component scan:
// things set/read only in code or on conditionally-rendered nodes still count.
function scanSourceForSuggestions(targetDir) {
  const flags = { hasInputValidation: false, hasCustomAttr: false, hasMediaQuery: false };
  if (!targetDir) return flags;

  const STANDARD_ATTRS = new Set([
    "id", "class", "style", "type", "name", "value", "placeholder", "required",
    "minlength", "maxlength", "title", "href", "src", "alt", "for", "role",
    "tabindex", "hidden", "disabled", "checked", "selected", "max", "min", "step",
    "accept", "autocomplete", "autofocus", "cols", "rows", "wrap", "spellcheck",
    "contenteditable", "draggable", "lang", "dir", "slot", "part",
  ]);

  for (const file of collectSourceFiles(targetDir)) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch (e) {
      continue;
    }

    if (!flags.hasMediaQuery && /@media\b/.test(src)) flags.hasMediaQuery = true;

    if (!flags.hasCustomAttr) {
      const re = /(?:get|set)Attribute\(\s*["']([^"']+)["']/g;
      let m;
      while ((m = re.exec(src))) {
        const name = m[1].toLowerCase();
        if (
          !STANDARD_ATTRS.has(name) &&
          !name.startsWith("aria-") &&
          !name.startsWith("data-")
        ) {
          flags.hasCustomAttr = true;
          break;
        }
      }
    }

    if (!flags.hasCustomAttr) {
      // observedAttributes = ["custom", ...] or static get observedAttributes()
      const obsForms = [
        /observedAttributes\s*=\s*\[([^\]]*)\]/g,
        /get\s+observedAttributes\s*\(\s*\)\s*\{[^}]*?return\s*\[([^\]]*)\]/g,
      ];
      for (const re of obsForms) {
        let m;
        while ((m = re.exec(src))) {
          const names = m[1].match(/["']([^"']+)["']/g) || [];
          if (
            names.some((n) => {
              const name = n.replace(/["']/g, "").toLowerCase();
              return !STANDARD_ATTRS.has(name) && !name.startsWith("aria-") && !name.startsWith("data-");
            })
          ) {
            flags.hasCustomAttr = true;
            break;
          }
        }
        if (flags.hasCustomAttr) break;
      }
    }

    if (!flags.hasInputValidation) {
      const hasInputListener = /addEventListener\(\s*["']input["']/.test(src) || /\boninput\s*=/.test(src);
      const hasValidationHint =
        /(wajib diisi|tidak boleh kosong|minimal|karakter|aria-invalid|setCustomValidity|\.validity\.)/i.test(src);
      if (hasInputListener && hasValidationHint) flags.hasInputValidation = true;
    }

    if (flags.hasMediaQuery && flags.hasCustomAttr && flags.hasInputValidation) break;
  }

  return flags;
}

async function scanWebComponents(page, targetDir) {
  const live = await page.evaluate(() => {
    const customTags = new Set();
    let hasCustomAttr = false;
    const standardAttrs = [
      "id", "class", "style", "type", "name", "value", "placeholder",
      "required", "minlength", "maxlength",
    ];

    function scanNode(node) {
      if (node.tagName && node.tagName.includes("-")) {
        customTags.add(`<${node.tagName.toLowerCase()}>`);
        Array.from(node.attributes).forEach((attr) => {
          if (!standardAttrs.includes(attr.name.toLowerCase())) hasCustomAttr = true;
        });
      }
      if (node.shadowRoot) node.shadowRoot.childNodes.forEach(scanNode);
      node.childNodes.forEach(scanNode);
    }
    scanNode(document.body);
    return { tags: Array.from(customTags), hasCustomAttr };
  });

  // Merge source-defined components so conditionally-rendered ones (e.g. an
  // empty-state shown only when there are no notes) still count.
  const tags = Array.from(
    new Set([...live.tags, ...scanDefinedWebComponents(targetDir).map((n) => `<${n}>`)]),
  );
  return { tags, hasCustomAttr: live.hasCustomAttr };
}

function sourceHasGrid(targetDir) {
  for (const file of collectSourceFiles(targetDir)) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch (e) {
      continue;
    }
    if (/\bdisplay\s*:\s*(?:inline-)?grid\b/i.test(src)) return true;
  }
  return false;
}

async function detectGrid(page) {
  return await page.evaluate(() => {
    let foundGridContext = null;
    function scanNode(node) {
      if (!node || node.nodeType !== 1 || foundGridContext) return;

      const style = window.getComputedStyle(node);
      if (style.display === "grid" || style.display === "inline-grid") {
        const childTags = Array.from(node.children).map((c) => c.tagName.toLowerCase());
        const childrenCount = childTags.filter((t) => !["style", "script", "template"].includes(t)).length;
        const hasSlot = childTags.includes("slot");

        const id = (node.id || "").toLowerCase();
        const className = (typeof node.className === "string" ? node.className : "").toLowerCase();
        const tag = node.tagName.toLowerCase();

        if (tag !== "body" && tag !== "html" && tag !== "main") {
          if (
            childrenCount >= 2 || hasSlot ||
            id.includes("list") || id.includes("note") || id.includes("container") || id.includes("grid") || id.includes("card") ||
            className.includes("list") || className.includes("note") || className.includes("container") || className.includes("grid") || className.includes("card") ||
            tag.includes("list") || tag.includes("grid") || tag.includes("card")
          ) {
            let descriptor = tag;
            if (node.id) descriptor += `#${node.id}`;
            if (typeof node.className === "string" && node.className.trim() !== "") {
              descriptor += `.${node.className.trim().replace(/\s+/g, ".")}`;
            }
            foundGridContext = descriptor;
          }
        }
      }

      if (node.shadowRoot) Array.from(node.shadowRoot.children).forEach(scanNode);
      Array.from(node.children).forEach(scanNode);
    }
    scanNode(document.body);
    return foundGridContext;
  });
}

// Runtime animation detection: verifies motion actually happens, not just that
// a library/keyword is present (the static.js INFO path covers that fallback).
// 1) Counts animations already running (spinners, infinite loops, WAAPI).
// 2) Hovers an element declaring a transition/animation and confirms a real
//    :hover transition starts (sampled via document.getAnimations()).
async function detectAnimation(page) {
  const runningNow = await page.evaluate(() => {
    try {
      return document.getAnimations().filter((a) => a.playState === "running").length;
    } catch (e) {
      return 0;
    }
  });
  if (runningNow > 0) return { found: true, detail: `${runningNow} running animation(s)` };

  const candidates = page.locator(
    "button, a, [class*='card'], [class*='btn'], [class*='item'], [class*='note'], li",
  );
  const count = await candidates.count();
  for (let i = 0; i < Math.min(count, 12); i++) {
    const el = candidates.nth(i);
    if (!(await el.isVisible().catch(() => false))) continue;

    const hasFx = await el
      .evaluate((node) => {
        const s = window.getComputedStyle(node);
        const hasTransition = (s.transitionDuration || "0s").split(",").some((d) => {
          const v = d.trim();
          return v !== "0s" && v !== "0ms";
        });
        return hasTransition || (s.animationName || "none") !== "none";
      })
      .catch(() => false);
    if (!hasFx) continue;

    await el.hover({ force: true }).catch(() => {});
    let animating = false;
    for (let t = 0; t < 6 && !animating; t++) {
      animating = await page
        .evaluate(() => {
          try {
            return document.getAnimations().some((a) => a.playState === "running");
          } catch (e) {
            return false;
          }
        })
        .catch(() => false);
      if (!animating) await page.waitForTimeout(60);
    }
    await page.mouse.move(0, 0).catch(() => {});

    if (animating) {
      const tag = await el.evaluate((node) => node.tagName.toLowerCase()).catch(() => "?");
      return { found: true, detail: `hover transition on <${tag}>` };
    }
  }
  return { found: false, detail: "" };
}

module.exports = {
  runCommand,
  resultKind,
  printSummaryReport,
  colors,
  REQUIRED_NOTES,
  detectFormInputs,
  ensureFormVisible,
  checkRealtimeValidation,
  scanWebComponents,
  detectGrid,
  sourceHasGrid,
  detectAnimation,
  scanSourceForSuggestions,
};
