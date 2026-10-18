const {
  colors,
  detectFormInputs,
  checkRealtimeValidation,
} = require("../../../../utils");

module.exports = async function runForm(page, report, targetDir) {
  try {
    console.log(
      `${colors.cyan}> Testing Criteria 2: Add Note Form Functionality...${colors.reset}`,
    );

    const { titleInput, bodyInput, submitBtn } = await detectFormInputs(page, targetDir);

    if (titleInput && bodyInput) {
      const titleTag = await titleInput.evaluate((el) => el.tagName.toLowerCase());
      const bodyTag = await bodyInput.evaluate((el) => el.tagName.toLowerCase());

      if (titleTag === "input" && bodyTag === "textarea") {
        report.mandatory["Criteria 2: Add Note Form Functionality"] = true;
      } else {
        report.mandatory["Criteria 2: Add Note Form Functionality"] =
          `FAIL: Tag tidak sesuai (Judul: <${titleTag}>, Isi: <${bodyTag}>)`;
      }
    } else {
      report.mandatory["Criteria 2: Add Note Form Functionality"] =
        "FAIL: Input/Textarea form tidak terdeteksi";
    }

    if (titleInput) {
      const valid = await checkRealtimeValidation(page, titleInput);
      if (valid) {
        report.optional["Suggestion 2: Realtime Form Validation"] = true;
      }
    }

    if (titleInput && bodyInput && submitBtn) {
      console.log(
        `${colors.cyan}> Injecting dummy note to force component rendering (e.g., <note-item>)...${colors.reset}`,
      );
      await titleInput.fill(`Test Note ${Date.now()}`);
      await bodyInput.fill("This is a test note to trigger element creation.");
      await submitBtn.click({ force: true });
      await page.waitForTimeout(1500);
    }
  } catch (e) {
    console.error(
      `${colors.red}> [FAIL] Criteria 2 crashed: ${e.message.split("\n")[0]}${colors.reset}`,
    );
  }
};
