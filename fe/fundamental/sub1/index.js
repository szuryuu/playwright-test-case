const { chromium } = require("playwright");
const { spawn } = require("child_process");
const { runCommand, resultKind, printSummaryReport, colors } = require("../../../utils");
const { buildInsightBlock, buildFailedSuggestionFeedback } = require("../../../suggestions");

const runRender = require("./specs/render");
const runForm = require("./specs/form");
const runLayout = require("./specs/layout");
const runComponents = require("./specs/components");

async function runSub1Tests(targetDir) {
  const report = {
    mandatory: {
      "Criteria 1: Render 15 Notes (Title & Body)": false,
      "Criteria 2: Add Note Form Functionality": false,
      "Criteria 3: CSS Grid Layout Detected": false,
      "Criteria 4: Web Components (Min 3)": false,
    },
    optional: {
      "Suggestion 1: Tampilan Menarik": true, // human-verified (manual visual check)
      "Suggestion 2: Realtime Form Validation": false,
      "Suggestion 3: Custom Attributes on Web Components": false,
      "Suggestion 4: Mobile Responsiveness (No Overflow)": false,
    },
  };

  console.log(
    `${colors.cyan}> Executing: npm init -y && npm install live-server${colors.reset}`,
  );
  runCommand("npm init -y && npm install live-server", targetDir);

  console.log(`${colors.cyan}> Starting live-server...${colors.reset}`);
  const serverProcess = spawn("npx live-server --port=8080 --no-browser", {
    cwd: targetDir,
    detached: true,
    shell: true,
  });
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.setDefaultTimeout(5000);
  page.setDefaultNavigationTimeout(15000);

  try {
    await page.goto("http://127.0.0.1:8080", { waitUntil: "domcontentloaded" });
    console.log(
      `${colors.cyan}> Stabilizing DOM and waiting for asynchronous renders...${colors.reset}`,
    );
    await page.waitForTimeout(2500);
    await page.waitForLoadState("networkidle");

    await runRender(page, report);
    await runForm(page, report, targetDir);
    await runComponents(page, report, targetDir);
    await runLayout(page, report, targetDir);

    printSummaryReport(report);

    const allPassed = Object.values(report.mandatory).every((v) => resultKind(v) === "pass");
    if (allPassed) {
      const feedback = buildFailedSuggestionFeedback("fe-fundamental-sub1", report.optional);
      console.log(feedback || buildInsightBlock("fe-fundamental-sub1"));
    }
  } catch (e) {
    console.error(
      `\n${colors.red}${colors.bold} [!] FATAL: Critical Pipeline Crash: ${e.message}${colors.reset}`,
    );
    process.exitCode = 1;
    printSummaryReport(report);
  } finally {
    await browser.close();
    try {
      process.kill(-serverProcess.pid, "SIGKILL");
    } catch (killError) {}

    process.exit(process.exitCode || 0);
  }
}

module.exports = { runSub1Tests };
