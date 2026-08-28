const { colors } = require("../../../../utils");

module.exports = async function validateReject(page, report, username) {
  let isRejected = false;

  console.log(
    `${colors.cyan}> Validating Reject Criteria: Greeting Name...${colors.reset}`,
  );
  try {
    await page.waitForSelector(".tracker-header__greeting", {
      state: "attached",
    });
    const greetingText = await page
      .locator(".tracker-header__greeting")
      .innerText();
    if (greetingText.includes("Siswa Front-End")) {
      const msg = 'Teks "Siswa Front-End" belum diganti oleh siswa.';
      console.error(`${colors.red}  [-] REJECT: ${msg}${colors.reset}`);
      report.rejected.push(msg);
      isRejected = true;
    } else if (username) {
      // Greeting was customized and an expected username was supplied:
      // verify the username is actually present (case-insensitive).
      if (greetingText.toLowerCase().includes(username.toLowerCase())) {
        console.log(
          `${colors.green}  [+] PASS: Greeting contains expected username "${username}"${colors.reset}`,
        );
      } else {
        // Distinct from the still-default rejection above: something *other*
        // than the placeholder is there, but it doesn't match the supplied
        // student — wrong data, or genuinely wrong greeting. Manual review.
        const msg = `Greeting was customized but does not contain the expected username "${username}" — verify manually (wrong student data supplied to reviewer? or student's greeting genuinely wrong?)`;
        console.error(`${colors.red}  [-] [FAIL] ${msg}${colors.reset}`);
        report.rejected.push(msg);
        isRejected = true;
      }
    } else {
      // Greeting was changed but no username was supplied to verify against:
      // identity cannot be confirmed, so reject.
      const msg = "Username tidak diberikan ke reviewer — identitas siswa tidak dapat diverifikasi.";
      console.error(`${colors.red}  [-] REJECT: ${msg}${colors.reset}`);
      report.rejected.push(msg);
      isRejected = true;
    }
  } catch (e) {
    const msg = "Elemen .tracker-header__greeting tidak ditemukan di DOM.";
    console.error(`${colors.red}  [-] REJECT: ${msg}${colors.reset}`);
    report.rejected.push(msg);
    isRejected = true;
  }

  console.log(
    `${colors.cyan}> Validating Reject Criteria: test-ids...${colors.reset}`,
  );
  const reqTestIds = ["transactionForm", "incomeList", "expenseList"];
  for (const tId of reqTestIds) {
    try {
      await page.waitForSelector(`[data-testid="${tId}"]`, {
        state: "attached",
      });
    } catch (e) {
      const msg = `Elemen krusial dengan data-testid="${tId}" tidak ditemukan.`;
      console.error(`${colors.red}  [-] REJECT: ${msg}${colors.reset}`);
      report.rejected.push(msg);
      isRejected = true;
    }
  }

  if (isRejected) {
    console.error(
      `\n${colors.yellow}  [!] WARNING: Submission contains REJECT criteria. Marking as failed but continuing E2E testing for full feedback...${colors.reset}`,
    );
    process.exitCode = 1;
  }
};
