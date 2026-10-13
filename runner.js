const { runSub1Tests } = require("./fe/fundamental/sub1/index");
const { runSub2Tests } = require("./fe/fundamental/sub2/index");
const { runSub3Tests } = require("./fe/beginner/sub1/index");
const { runBeJsBasicTests } = require("./be/js/basic/index");

// CLI-facing taxonomy key → internal module. The key is decoupled from
// file/module names: `fe/beginner/sub1` points at `fe/beginner/sub1/`.
const REGISTRY = {
  "fe/fundamental/sub1": { run: (dir) => runSub1Tests(dir) },
  "fe/fundamental/sub2": { run: (dir) => runSub2Tests(dir) },
  "fe/beginner/sub1": { run: (dir, username) => runSub3Tests(dir, username) },
  "be/js/basic": { run: (dir, username) => runBeJsBasicTests(dir, username) },
};

const registryKey = process.argv[2];
const targetDir = process.argv[3];
const username = process.argv[4];

if (!registryKey || !targetDir) {
  console.error("[-] [ERROR] Insufficient arguments provided to runner.js");
  process.exit(1);
}

const entry = REGISTRY[registryKey];
if (!entry) {
  console.error(
    `\x1b[31m\x1b[1m❌ [ERROR] Unrecognized pipeline: ${registryKey} (not in registry)\x1b[0m`,
  );
  process.exit(1);
}

// username is meaningful for fe/beginner/sub1 and be/js/basic; other subs
// accept-but-ignore it so a script that always appends one keeps working.
if (username && registryKey !== "fe/beginner/sub1" && registryKey !== "be/js/basic") {
  console.log(
    `\x1b[36m[i] username ignored: not applicable to ${registryKey}\x1b[0m`,
  );
}

entry.run(targetDir, username);
