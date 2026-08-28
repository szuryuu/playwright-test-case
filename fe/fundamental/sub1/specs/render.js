const { colors, REQUIRED_NOTES } = require("../../../../utils");

module.exports = async function runRender(page, report) {
  try {
    console.log(
      `${colors.cyan}> Testing Criteria 1: Render 15 Notes...${colors.reset}`,
    );

    let foundCount = 0;
    for (const note of REQUIRED_NOTES) {
      const titleVisible = await page
        .getByText(note.title, { exact: false })
        .first()
        .isVisible();
      const bodyVisible = await page
        .getByText(note.body, { exact: false })
        .first()
        .isVisible();
      if (titleVisible && bodyVisible) foundCount++;
    }

    if (foundCount === 15) {
      report.mandatory["Criteria 1: Render 15 Notes (Title & Body)"] = true;
    } else {
      console.error(
        `${colors.red}  [-] Only ${foundCount}/15 dummy notes detected.${colors.reset}`,
      );
    }
  } catch (e) {
    console.error(
      `${colors.red}> [FAIL] Criteria 1 crashed: ${e.message.split("\n")[0]}${colors.reset}`,
    );
  }
};
