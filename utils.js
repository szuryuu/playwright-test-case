const { execSync } = require("child_process");

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
    console.log(
      `  ${color}${statusText.padEnd(6)}${colors.reset} | ${criteria}`,
    );
  }

  console.log(`\n${colors.bold} --- OPTIONAL SUGGESTIONS ---${colors.reset}`);
  if (report.optional && Object.keys(report.optional).length > 0) {
    for (const [criteria, passed] of Object.entries(report.optional)) {
      const kind = resultKind(passed);
      const statusText = kind === "pass" ? "[PASS]" : kind === "info" ? "[INFO]" : "[FAIL]";
      const color = kind === "pass" ? colors.green : kind === "info" ? colors.yellow : colors.red;
      console.log(
        `  ${color}${statusText.padEnd(6)}${colors.reset} | ${criteria}`,
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
    } else {
      stars = 5;
      statusText = "LULUS (Semua kriteria terpenuhi)";
      statusColor = colors.green;
    }
  }

  const starVisual = "⭐".repeat(stars) + "☆".repeat(5 - stars);

  console.log(`\n${colors.bold} === PREDIKSI PENILAIAN ===${colors.reset}`);
  console.log(`  Skor  : ${totalPassed} / ${totalCriteria} (${score}%)`);
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
  '[placeholder*="judul" i]',
  '[placeholder*="title" i]',
  'input[type="text"]:not([placeholder*="cari" i]):not([placeholder*="search" i]):not([id*="search" i]):not([class*="search" i])',
  'input:not([type="search"]):not([id*="search" i]):not([class*="search" i]):not([placeholder*="cari" i])',
];

const BODY_SELECTORS = [
  "note-form textarea",
  "#body",
  'textarea[name="body"]',
  '[placeholder*="isi" i]',
  '[placeholder*="note" i]',
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

async function detectFormInputs(page) {
  for (const sel of TITLE_SELECTORS) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      for (const bodySel of BODY_SELECTORS) {
        const bodyEl = page.locator(bodySel).first();
        if (await bodyEl.isVisible().catch(() => false)) {
          for (const subSel of SUBMIT_SELECTORS) {
            const btn = page.locator(subSel).first();
            if (await btn.isVisible().catch(() => false)) {
              return { titleInput: el, bodyInput: bodyEl, submitBtn: btn };
            }
          }
          return { titleInput: el, bodyInput: bodyEl, submitBtn: null };
        }
      }
      return { titleInput: el, bodyInput: null, submitBtn: null };
    }
  }
  return { titleInput: null, bodyInput: null, submitBtn: null };
}

async function checkRealtimeValidation(page, titleInput) {
  const hasHTML5Validation = await titleInput.evaluate((el) =>
    el.hasAttribute("required") || el.hasAttribute("minlength"),
  );

  await titleInput.fill("");
  await titleInput.type("a");
  await titleInput.evaluate((el) => el.dispatchEvent(new Event("blur")));
  await page.waitForTimeout(500);

  const isValid = await titleInput.evaluate((el) => el.validity.valid);
  const hasCustomError = await page.evaluate(() => {
    const html = document.body.innerHTML.toLowerCase();
    return (
      html.includes("tidak boleh kosong") ||
      html.includes("harus diisi") ||
      html.includes("wajib diisi") ||
      html.includes("minimal") ||
      html.includes("karakter")
    );
  });

  return hasHTML5Validation || !isValid || hasCustomError;
}

async function scanWebComponents(page) {
  return await page.evaluate(() => {
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

      if (node.shadowRoot) scanNode(node.shadowRoot);
      Array.from(node.children).forEach(scanNode);
    }
    scanNode(document.body);
    return foundGridContext;
  });
}

module.exports = {
  runCommand,
  printSummaryReport,
  colors,
  REQUIRED_NOTES,
  detectFormInputs,
  checkRealtimeValidation,
  scanWebComponents,
  detectGrid,
};
