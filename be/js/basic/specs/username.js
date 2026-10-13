const fs = require("fs");
const path = require("path");
const { colors } = require("../../../../utils");

// 01-writing-comments: single-line // username + exact multi-line comment.
// Mirrors fe/beginner's greeting check: three distinct outcomes.
module.exports = async function verifyUsername(targetDir, report, username) {
  const file = path.join(targetDir, "01-writing-comments", "index.js");
  console.log(`${colors.cyan}> 01-writing-comments: username comment...${colors.reset}`);

  let src = null;
  try {
    src = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  } catch {
    const msg = "Elemen 01-writing-comments/index.js tidak ditemukan.";
    console.error(`${colors.red}  [-] REJECT: ${msg}${colors.reset}`);
    report.rejected.push(msg);
    return;
  }

  // Collect single-line // comments (exclude /* */ block lines).
  const singleLineComments = src
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\/\//.test(l));

  // Match username as a standalone token (regex, case-insensitive), not a
  // substring, so e.g. username "aura" doesn't falsely accept "auralia_z".
  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const commentContains = (needle) => {
    const re = new RegExp(`(?:^|[^A-Za-z0-9_])${escapeRegex(needle)}(?:[^A-Za-z0-9_]|$)`, "i");
    return singleLineComments.some((c) => re.test(c));
  };

  if (singleLineComments.length === 0) {
    const msg = 'Tidak ada komentar single-line "//" di 01-writing-comments/index.js.';
    console.error(`${colors.red}  [-] REJECT: ${msg}${colors.reset}`);
    report.rejected.push(msg);
  } else if (username) {
    if (commentContains(username)) {
      console.log(`${colors.green}  [+] PASS: Komentar single-line berisi username "${username}"${colors.reset}`);
    } else {
      const msg = `Komentar single-line tidak memuat username "${username}" — periksa manual (ditemukan: ${singleLineComments.join(" | ")}).`;
      console.error(`${colors.red}  [-] [FAIL] ${msg}${colors.reset}`);
      report.rejected.push(msg);
    }
  } else {
    const msg = `Username tidak diberikan ke reviewer — identitas tidak dapat diverifikasi (ditemukan: ${singleLineComments.join(" | ")}).`;
    console.error(`${colors.red}  [-] REJECT: ${msg}${colors.reset}`);
    report.rejected.push(msg);
  }

  const expected = [
    "Goal tahun ini:",
    "1. Belajar JavaScript.",
    "2. Menjadi Front-End atau Back-End Developer.",
  ];
  // Content/capitalization/numbering/punctuation must match; indentation
  // inside the comment block does not. Strip leading whitespace per line.
  const normalized = src.split("\n").map((l) => l.replace(/^\s+/, "")).join("\n");
  const hasMultiline = src.includes("/*") && src.includes("*/") &&
    expected.every((l) => normalized.split("\n").includes(l));
  if (!hasMultiline) {
    const msg = "Komentar multi-line (/* */) tidak sesuai teks yang diwajibkan.";
    console.error(`${colors.red}  [-] REJECT: ${msg}${colors.reset}`);
    report.rejected.push(msg);
  }

  const pass = singleLineComments.length > 0 && hasMultiline &&
    (username ? commentContains(username) : false);
  report.mandatory["01-writing-comments (manual, username)"] = pass ? "PASS" : "FAIL";
};
