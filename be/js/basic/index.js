const { colors } = require("../../../utils");
const { buildInsightBlock } = require("../../../suggestions");
const verifyUsername = require("./specs/username");
const { runNode, read } = require("./specs/check");

async function runBeJsBasicTests(targetDir, username) {
  const report = {
    rejected: [],
    mandatory: {
      "01-writing-comments (manual, username)": "FAIL",
      "02-code-style": "FAIL",
      "03-writing-test": "FAIL",
    },
    optional: {
      "optional-04-oop": "FAIL",
      "optional-05-recursive": "FAIL",
      "optional-06-full-coverage-testing": "FAIL",
      "optional-07-real-world-scenario": "FAIL",
    },
  };

  // --- 01: writing-comments (manual, username) ---
  await verifyUsername(targetDir, report, username);

  // --- 02: code-style ---
  console.log(`${colors.cyan}> 02-code-style: run + static style checks...${colors.reset}`);
  {
    const r = runNode(targetDir, "02-code-style/index.js");
    const src = read(targetDir, "02-code-style/index.js");
    const problems = [];
    if (src === null) {
      problems.push("index.js missing");
    } else {
      const lines = src.split("\n");
      if (lines.some((l) => l.includes("\t"))) problems.push("tab indentation");
      // Indentation unit = smallest non-zero leading-space width.
      const indents = lines
        .map((l) => /^ +/.exec(l)?.[0].length || 0)
        .filter((n) => n > 0);
      const unit = indents.length ? Math.min(...indents) : 0;
      if (unit !== 0 && unit % 2 !== 0) problems.push(`${unit}-space indentation unit (expected 2)`);
      // `let` for a never-reassigned variable. Ponytail: flags any non-loop
      // `let`; a hand-rolled scope analysis is out of scope — ESLint would
      // do this precisely if false positives ever matter.
      lines.forEach((l) => {
        if (/\blet\b/.test(l) && !/\bfor\s*\(/.test(l)) {
          problems.push(`let used (prefer const): ${l.trim()}`);
        }
      });
    }
    const stdoutOk = r.ok && r.stdout.includes("book-1");
    const styleOk = problems.length === 0;
    const pass = stdoutOk && styleOk;
    report.mandatory["02-code-style"] = pass ? "PASS" : `FAIL: ${problems.join("; ") || "stdout mismatch"}`;
    console.log(
      `${pass ? colors.green : colors.red}  ${pass ? "[PASS]" : "[FAIL]"} 02-code-style${pass ? "" : " — " + (problems.join("; ") || "stdout mismatch")}${colors.reset}`,
    );
  }

  // --- 03: writing-test ---
  console.log(`${colors.cyan}> 03-writing-test: node --test ...${colors.reset}`);
  {
    const r = runNode(targetDir, "--test 03-writing-test/index.test.js");
    const passMatch = /pass\s+(\d+)/.exec(r.stdout);
    const failMatch = /fail\s+(\d+)/.exec(r.stdout);
    const pass = r.ok && passMatch && Number(passMatch[1]) >= 1 && failMatch && Number(failMatch[1]) === 0;
    report.mandatory["03-writing-test"] = pass ? "PASS" : "FAIL";
    console.log(
      `${pass ? colors.green : colors.red}  ${pass ? "[PASS]" : "[FAIL]"} 03-writing-test (pass=${passMatch?.[1] ?? "?"}, fail=${failMatch?.[1] ?? "?"})${colors.reset}`,
    );
  }

  // --- optional 04: oop ---
  console.log(`${colors.cyan}> optional-04-oop: node main.js ...${colors.reset}`);
  {
    const r = runNode(targetDir, "optional-04-oop/main.js");
    const pass =
      r.ok &&
      r.stdout.includes("ID: 1, Name: Laptop, Quantity: 8, Price: 950") &&
      r.stdout.includes("Inventory after removal:") &&
      !r.stdout.slice(r.stdout.lastIndexOf("Inventory after removal:")).includes("Mouse");
    report.optional["optional-04-oop"] = pass ? "PASS" : "FAIL";
    console.log(`${pass ? colors.green : colors.red}  ${pass ? "[PASS]" : "[FAIL]"} optional-04-oop${colors.reset}`);
  }

  // --- optional 05: recursive ---
  console.log(`${colors.cyan}> optional-05-recursive: node main.js ...${colors.reset}`);
  {
    const r = runNode(targetDir, "optional-05-recursive/main.js");
    const factorialSrc = read(targetDir, "optional-05-recursive/factorial.js") || "";
    const fibSrc = read(targetDir, "optional-05-recursive/fibonacci.js") || "";
    const selfCall = (s, name) => new RegExp(`\\b${name}\\s*\\(`).test(s);
    const factorialOk = r.stdout.includes("120");
    const fibOk = r.stdout.includes("55") && r.stdout.includes("34");
    const recursive = selfCall(factorialSrc, "factorial") && selfCall(fibSrc, "fibonacci");
    const pass = r.ok && factorialOk && fibOk && recursive;
    report.optional["optional-05-recursive"] = pass ? "PASS" : "FAIL";
    console.log(`${pass ? colors.green : colors.red}  ${pass ? "[PASS]" : "[FAIL]"} optional-05-recursive${colors.reset}`);
  }

  // --- optional 06: full-coverage-testing ---
  console.log(`${colors.cyan}> optional-06-full-coverage-testing: node --test --experimental-test-coverage ...${colors.reset}`);
  {
    const testSrc = read(targetDir, "optional-06-full-coverage-testing/index.test.js");
    const hasRealTest = testSrc !== null && /\btest\s*\(/.test(testSrc) && /assert/.test(testSrc);
    const r = runNode(
      targetDir,
      "--test --experimental-test-coverage optional-06-full-coverage-testing/index.test.js",
    );
    const lineCov = /index\.js\s*\|\s*(\d+(?:\.\d+)?)\s*\|/.exec(r.stdout)?.[1];
    const cov100 = lineCov === "100" || lineCov === "100.00";
    const pass = r.ok && hasRealTest && cov100;
    report.optional["optional-06-full-coverage-testing"] = pass
      ? "PASS"
      : `FAIL: ${!hasRealTest ? "no real test/assert" : `line coverage ${lineCov ?? "?"}%`}`;
    console.log(
      `${pass ? colors.green : colors.red}  ${pass ? "[PASS]" : "[FAIL]"} optional-06-full-coverage-testing (test=${hasRealTest}, line=${lineCov ?? "?"}%)${colors.reset}`,
    );
  }

  // --- optional 07: real-world-scenario ---
  console.log(`${colors.cyan}> optional-07-real-world-scenario: node main.js ...${colors.reset}`);
  {
    const r = runNode(targetDir, "optional-07-real-world-scenario/main.js");
    const revenue = /25000/.test(r.stdout);
    const pass = r.ok && revenue;
    report.optional["optional-07-real-world-scenario"] = pass ? "PASS" : "FAIL";
    console.log(`${pass ? colors.green : colors.red}  ${pass ? "[PASS]" : "[FAIL]"} optional-07-real-world-scenario${colors.reset}`);
  }

  printSummary(report);
  process.exitCode = report.rejected.length > 0 || anyMandatoryFail(report) ? 1 : 0;
}

function anyMandatoryFail(report) {
  return Object.values(report.mandatory).some((v) => !String(v).startsWith("PASS"));
}

function printSummary(report) {
  console.log(`\n${colors.bold}======================================================${colors.reset}`);
  console.log(`${colors.bold} FINAL AUTOMATED REVIEW SUMMARY — BE/JS/BASIC${colors.reset}`);
  console.log(`${colors.bold}======================================================\n${colors.reset}`);

  if (report.rejected.length > 0) {
    console.log(`${colors.red}${colors.bold} [!] SUBMISSION REJECTED - CRITICAL FAILURES [!]${colors.reset}`);
    report.rejected.forEach((reason) => console.log(`${colors.red}     [-] ${reason}${colors.reset}`));
    console.log("");
  }

  console.log(`${colors.bold} --- MANDATORY (50 pts, any fail = reject) ---${colors.reset}`);
  let mandatoryPass = 0;
  for (const [k, v] of Object.entries(report.mandatory)) {
    const ok = String(v).startsWith("PASS");
    if (ok) mandatoryPass++;
    console.log(`  ${ok ? colors.green : colors.red}${ok ? "[PASS]" : "[FAIL]"}${colors.reset} | ${k}${ok ? "" : " — " + v}`);
  }

  console.log(`\n${colors.bold} --- OPTIONAL (points) ---${colors.reset}`);
  const optionalWeights = {
    "optional-04-oop": 10,
    "optional-05-recursive": 10,
    "optional-06-full-coverage-testing": 10,
    "optional-07-real-world-scenario": 20,
  };
  let optionalPoints = 0;
  for (const [k, v] of Object.entries(report.optional)) {
    const ok = String(v).startsWith("PASS");
    if (ok) optionalPoints += optionalWeights[k] || 0;
    console.log(`  ${ok ? colors.green : colors.red}${ok ? "[PASS]" : "[FAIL]"}${colors.reset} | ${k}${ok ? "" : " — " + v}`);
  }

  const rejected = report.rejected.length > 0 || mandatoryPass < 3;
  const total = rejected ? 0 : Math.round(50 + optionalPoints);

  let rating;
  if (rejected) rating = "REJECT";
  else if (total >= 90) rating = "5";
  else if (total >= 80) rating = "4";
  else if (total >= 70) rating = "3";
  else if (total >= 60) rating = "2";
  else rating = "1";

  console.log(`\n${colors.bold} === HASIL ===${colors.reset}`);
  console.log(`  Poin : ${total} / 100${rejected ? " (rejected)" : ""}`);
  console.log(`  Rating: ${rejected ? colors.red : colors.green}${colors.bold}${rating}${colors.reset}`);
  if (!rejected) {
    console.log(buildInsightBlock("be-js-basic"));
  }
  console.log(`${colors.bold}======================================================\n${colors.reset}`);
}

module.exports = { runBeJsBasicTests };
