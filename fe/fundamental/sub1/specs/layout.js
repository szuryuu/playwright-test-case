const { colors, detectGrid } = require("../../../../utils");

module.exports = async function runLayout(page, report) {
  try {
    console.log(
      `${colors.cyan}> Testing Criteria 3: CSS Grid Layout...${colors.reset}`,
    );

    const gridInfo = await detectGrid(page);
    if (gridInfo) {
      report.mandatory["Criteria 3: CSS Grid Layout Detected"] =
        `PASS: Applied on ${gridInfo}`;
    } else {
      report.mandatory["Criteria 3: CSS Grid Layout Detected"] =
        "FAIL: List is not using CSS Grid";
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    const isResponsive = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    if (isResponsive) {
      report.optional["Suggestion 4: Mobile Responsiveness (No Overflow)"] = true;
    }
  } catch (e) {
    console.error(
      `${colors.red}> [FAIL] Criteria 3 crashed: ${e.message.split("\n")[0]}${colors.reset}`,
    );
  }
};
