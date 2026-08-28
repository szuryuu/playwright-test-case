const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const { colors, runCommand } = require("../../../../utils");

const ANIM_LIBS = ["animejs", "gsap", "aos", "framer-motion", "motion"];

module.exports = function runStatic(targetDir, report) {
  console.log(`${colors.cyan}> Static Environment Analysis...${colors.reset}`);

  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

    if (pkg.scripts && pkg.scripts["start-dev"] && pkg.scripts["build"]) {
      console.log(
        `${colors.green}  [PASS] Strict rubric check: "start-dev" and "build" scripts exist.${colors.reset}`,
      );
    } else {
      console.log(
        `${colors.red}  [FAIL] Strict rubric check: Missing "start-dev" or "build" script in package.json.${colors.reset}`,
      );
    }

    if (
      pkg.devDependencies &&
      (pkg.devDependencies.webpack || pkg.devDependencies["webpack-dev-server"])
    ) {
      report.mandatory["Criteria 3: Webpack Bundler & Dev Server Configured"] = true;
    }

    const hasPrettierDep = pkg.devDependencies && pkg.devDependencies.prettier;
    const hasPrettierRc =
      fs.existsSync(path.join(targetDir, ".prettierrc")) ||
      fs.existsSync(path.join(targetDir, ".prettierrc.json"));
    if (hasPrettierDep && hasPrettierRc) {
      report.optional["Suggestion 4: Prettier Formatter Configured"] = true;
    }

    let foundLib = null;
    if (pkg.dependencies) foundLib = ANIM_LIBS.find((lib) => pkg.dependencies[lib]);
    if (!foundLib && pkg.devDependencies) foundLib = ANIM_LIBS.find((lib) => pkg.devDependencies[lib]);

    if (foundLib) {
      report.optional["Suggestion 3: Animation"] =
        `INFO: ${foundLib} detected in package.json`;
    } else {
      try {
        const grepCmd = `grep -rnE --include="*.css" --include="*.js" --include="*.html" --exclude-dir="node_modules" --exclude-dir="dist" "transition:|@keyframes|transform:" . | head -n 1`;
        const cssGrep = execSync(grepCmd, { cwd: targetDir, encoding: "utf8" }).trim();
        if (cssGrep) {
          const parts = cssGrep.split(":");
          const file = parts[0].replace("./", "");
          let keyword = "animation/transition";
          if (cssGrep.includes("transition:")) keyword = "transition";
          else if (cssGrep.includes("@keyframes")) keyword = "@keyframes";
          else if (cssGrep.includes("transform:")) keyword = "transform";
          report.optional["Suggestion 3: Animation"] =
            `INFO: ${keyword} detected in ${file}`;
        }
      } catch (e) {}
    }
  }

  try {
    const grepCmd = `grep -r --exclude-dir="node_modules" --exclude-dir="dist" "fetch(" . || echo "NOT_FOUND"`;
    const fetchCheck = execSync(grepCmd, { cwd: targetDir, encoding: "utf8" });
    if (!fetchCheck.includes("NOT_FOUND")) {
      report.mandatory["Criteria 4: Fetch API Implementation"] = true;
    }
  } catch (e) {}

  console.log(`${colors.cyan}> Compiling production build...${colors.reset}`);
  const installResult = runCommand("npm install", targetDir);
  if (!installResult) {
    console.log(
      `${colors.yellow}  [!] npm install reported warnings or errors. Proceeding anyway...${colors.reset}`,
    );
  }

  const buildResult = runCommand("npm run build", targetDir);
  if (!buildResult) {
    console.error(
      `${colors.red}  [-] FATAL: Criteria 3 production compilation failed.${colors.reset}`,
    );
    report.mandatory["Criteria 3: Webpack Bundler & Dev Server Configured"] = false;
  }

  return { buildOk: buildResult };
};
