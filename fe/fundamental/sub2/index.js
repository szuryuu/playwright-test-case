const { chromium } = require("playwright");
const { spawn } = require("child_process");
const { printSummaryReport, colors } = require("../../../utils");

const runStatic = require("./specs/static");
const runInherited = require("./specs/inherited");
const runApi = require("./specs/api");

async function runSub2Tests(targetDir) {
  const report = {
    mandatory: {
      "Criteria 1.1: Inherited Sub 1 Form Functionality": false,
      "Criteria 1.2: Inherited Sub 1 Web Components (Min 3)": false,
      "Criteria 1.3: Inherited Sub 1 CSS Grid Layout": false,
      "Criteria 2: REST API Integrated (GET, POST, DELETE)": false,
      "Criteria 3: Webpack Bundler & Dev Server Configured": false,
      "Criteria 4: Fetch API Implementation": false,
      "Criteria 5: Loading Indicator Rendered": false,
    },
    optional: {
      "Suggestion 1: Archive & Unarchive Implementation": false,
      "Suggestion 2: Error Feedback Handled": false,
      "Suggestion 3: Animation": false,
      "Suggestion 4: Prettier Formatter Configured": false,
    },
  };

  const { buildOk } = runStatic(targetDir, report);

  if (!buildOk) {
    console.error(
      `${colors.red}${colors.bold} [!] Production compilation failed. Cannot continue E2E.${colors.reset}`,
    );
    printSummaryReport(report);
    process.exit(1);
  }

  console.log(
    `${colors.cyan}> Initializing Webpack Dev Server (port 8080)...${colors.reset}`,
  );
  const serverProcess = spawn("npm run start-dev -- --port 8080", {
    cwd: targetDir,
    detached: true,
    shell: true,
    env: { ...process.env, PORT: "8080" },
  });

  let dynamicUrl = "http://localhost:8080";
  const urlRegex = /http:\/\/(?:localhost|127\.0\.0\.1):(\d+)/i;

  serverProcess.stdout.on("data", (data) => {
    const str = data.toString();
    process.stdout.write(`[DEV-SERVER] ${str}`);
    const match = str.match(urlRegex);
    if (match) dynamicUrl = match[0];
  });

  serverProcess.stderr.on("data", (data) => {
    const str = data.toString();
    process.stderr.write(`[DEV-SERVER ERR] ${str}`);
    const match = str.match(urlRegex);
    if (match) dynamicUrl = match[0];
  });

  await new Promise((resolve) => setTimeout(resolve, 10000));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.setDefaultTimeout(5000);
  page.setDefaultNavigationTimeout(15000);

  try {
    console.log(
      `${colors.cyan}> Navigating to ${dynamicUrl}...${colors.reset}`,
    );
    await page.goto(dynamicUrl, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    const form = await runInherited(page, report);
    const { missingMethods } = await runApi(page, report, form);

    printSummaryReport(report);

    if (missingMethods.length > 0) {
      process.exitCode = 1;
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

module.exports = { runSub2Tests };
