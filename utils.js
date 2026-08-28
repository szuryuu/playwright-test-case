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

module.exports = { runCommand, printSummaryReport, colors, REQUIRED_NOTES };
