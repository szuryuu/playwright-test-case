const { colors, scanWebComponents, scanSourceForSuggestions } = require("../../../../utils");

module.exports = async function runComponents(page, report, targetDir) {
  try {
    console.log(
      `${colors.cyan}> Testing Criteria 4: Web Components (Min 3)...${colors.reset}`,
    );

    const { tags, hasCustomAttr } = await scanWebComponents(page, targetDir);

    if (tags.length >= 3) {
      report.mandatory["Criteria 4: Web Components (Min 3)"] =
        `PASS: Found ${tags.join(", ")}`;
    } else {
      report.mandatory["Criteria 4: Web Components (Min 3)"] =
        `FAIL: Only found ${tags.length} (${tags.join(", ") || "None"})`;
    }

    const source = scanSourceForSuggestions(targetDir);
    if (source.hasCustomAttr || hasCustomAttr) {
      report.optional["Suggestion 3: Custom Attributes on Web Components"] = true;
    }
  } catch (e) {
    console.error(
      `${colors.red}> [FAIL] Criteria 4 crashed: ${e.message.split("\n")[0]}${colors.reset}`,
    );
  }
};
