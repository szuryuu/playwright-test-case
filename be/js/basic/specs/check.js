const { execSync } = require("child_process");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

// Run `node <args>` in targetDir; returns { ok, code, stdout, stderr }.
function runNode(targetDir, nodeArgs) {
  try {
    const stdout = execSync(`node ${nodeArgs}`, {
      cwd: targetDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { ok: true, code: 0, stdout, stderr: "" };
  } catch (e) {
    return {
      ok: false,
      code: e.status,
      stdout: e.stdout ? e.stdout.toString() : "",
      stderr: e.stderr ? e.stderr.toString() : "",
    };
  }
}

function read(targetDir, rel) {
  try {
    return require("fs").readFileSync(path.join(targetDir, rel), "utf8");
  } catch {
    return null;
  }
}

module.exports = { runNode, read, colors };
