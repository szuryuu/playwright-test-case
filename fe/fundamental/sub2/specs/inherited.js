const {
  colors,
  detectFormInputs,
  scanWebComponents,
  detectGrid,
} = require("../../../../utils");

module.exports = async function runInherited(page, report, targetDir) {
  try {
    console.log(
      `${colors.cyan}> Verifying inherited Submission 1 criteria...${colors.reset}`,
    );

    const { titleInput, bodyInput, submitBtn } = await detectFormInputs(page, targetDir);

    if (titleInput && bodyInput && submitBtn) {
      const titleTag = await titleInput.evaluate((el) => el.tagName.toLowerCase());
      const bodyTag = await bodyInput.evaluate((el) => el.tagName.toLowerCase());

      if (titleTag === "input" && bodyTag === "textarea") {
        report.mandatory["Criteria 1.1: Inherited Sub 1 Form Functionality"] = true;
      } else {
        report.mandatory["Criteria 1.1: Inherited Sub 1 Form Functionality"] =
          `FAIL: Tag tidak sesuai (<${titleTag}> & <${bodyTag}>)`;
      }
    } else {
      report.mandatory["Criteria 1.1: Inherited Sub 1 Form Functionality"] =
        "FAIL: Input/Textarea/Submit button tidak terdeteksi";
    }

    const { tags } = await scanWebComponents(page, targetDir);
    if (tags.length >= 3) {
      report.mandatory["Criteria 1.2: Inherited Sub 1 Web Components (Min 3)"] =
        `PASS: Found ${tags.join(", ")}`;
    } else {
      report.mandatory["Criteria 1.2: Inherited Sub 1 Web Components (Min 3)"] =
        `FAIL: Only found ${tags.length} (${tags.join(", ") || "None"})`;
    }

    const gridInfo = await detectGrid(page);
    if (gridInfo) {
      report.mandatory["Criteria 1.3: Inherited Sub 1 CSS Grid Layout"] =
        `PASS: Applied on ${gridInfo}`;
    } else {
      report.mandatory["Criteria 1.3: Inherited Sub 1 CSS Grid Layout"] =
        "FAIL: List is not using CSS Grid";
    }

    return { titleInput, bodyInput, submitBtn };
  } catch (e) {
    console.error(
      `${colors.red}> [FAIL] Inherited criteria crashed: ${e.message.split("\n")[0]}${colors.reset}`,
    );
    return { titleInput: null, bodyInput: null, submitBtn: null };
  }
};
