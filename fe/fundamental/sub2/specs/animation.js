const { colors, detectAnimation } = require("../../../../utils");

// Suggestion 3: Animation — runtime check. Overrides static.js's INFO verdict
// (library/keyword present) with a real PASS only when motion is observed.
module.exports = async function runAnimation(page, report) {
  try {
    console.log(`${colors.cyan}> Testing Suggestion 3: Animation (runtime)...${colors.reset}`);
    const { found, detail } = await detectAnimation(page);
    if (found) {
      report.optional["Suggestion 3: Animation"] = `PASS: ${detail}`;
      console.log(`${colors.green}    [anim] ${detail}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}    [anim] no runtime animation detected${colors.reset}`);
    }
  } catch (e) {
    console.error(
      `${colors.red}> [FAIL] Animation check crashed: ${e.message.split("\n")[0]}${colors.reset}`,
    );
  }
};
