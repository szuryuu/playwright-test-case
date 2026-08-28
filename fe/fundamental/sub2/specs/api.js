const { colors } = require("../../../../utils");

module.exports = async function runApi(page, report, form) {
  const state = {
    apiStats: { get: false, post: false, delete: false, archive: false, unarchive: false },
    loadingStats: { get: false, post: false, delete: false, archive: false, unarchive: false },
    isErrorHandled: false,
  };
  let isErrorTestDone = false;
  let isPurging = false;

  await page.route("**/*", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes("notes-api.dicoding.dev/v2/notes")) {
      if (isPurging) return route.continue();

      let action = "get";
      if (method === "POST") {
        if (url.includes("archive") && !url.includes("unarchive")) action = "archive";
        else if (url.includes("unarchive")) action = "unarchive";
        else action = "post";
      } else if (method === "DELETE") {
        action = "delete";
      }

      if (action === "post" && !isErrorTestDone) {
        isErrorTestDone = true;
        return route.abort("failed");
      }

      state.apiStats[action] = true;

      setTimeout(async () => {
        try {
          const hasLoading = await page.evaluate(() => {
            const html = document.body.innerHTML.toLowerCase();
            const hasTextMatch =
              html.includes("loading") ||
              html.includes("tunggu") ||
              html.includes("memuat") ||
              html.includes("loader");
            const hasVisualMatch =
              document.querySelector('[class*="load" i], [class*="spin" i], [id*="load" i], [id*="spin" i]') !== null;

            let hasCustomElementMatch = false;
            const elements = document.querySelectorAll("*");
            for (const el of elements) {
              const tag = el.tagName.toLowerCase();
              if (tag.includes("-") && (tag.includes("load") || tag.includes("spin"))) {
                hasCustomElementMatch = true;
                break;
              }
            }
            return hasTextMatch || hasVisualMatch || hasCustomElementMatch;
          });
          if (hasLoading) state.loadingStats[action] = true;
        } catch (e) {}
      }, 300);

      await new Promise((r) => setTimeout(r, 1500));
      return route.continue();
    }
    route.continue();
  });

  page.on("dialog", async (dialog) => {
    state.isErrorHandled = true;
    await dialog.accept();
  });

  const sweepModals = async () => {
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const buttons = [];
        function scan(node) {
          if (!node || node.nodeType !== 1) return;
          if (
            node.tagName === "BUTTON" ||
            (node.classList &&
              (node.classList.contains("swal2-confirm") ||
                node.classList.contains("swal2-close")))
          ) {
            buttons.push(node);
          }
          if (node.shadowRoot) Array.from(node.shadowRoot.childNodes).forEach(scan);
          Array.from(node.childNodes).forEach(scan);
        }
        scan(document.body);

        buttons.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          const text = (el.textContent || "").toLowerCase().trim();
          if (
            el.matches('.swal2-confirm, .swal2-close, .btn-close, [aria-label*="close" i]') ||
            text.includes("ok") ||
            (text.includes("ya") && !text.includes("tidak")) ||
            text.includes("yes") ||
            text.includes("tutup") ||
            text.includes("hapus") ||
            text.includes("delete") ||
            text.includes("lanjut") ||
            text.includes("yakin") ||
            text.includes("setuju")
          ) {
            if (typeof el.click === "function") el.click();
          }
        });
      });
      await page.waitForTimeout(500);
    }
    await page.keyboard.press("Enter");

    await page
      .waitForFunction(
        () => {
          const swal = document.querySelector(".swal2-container");
          if (!swal) return true;
          const style = window.getComputedStyle(swal);
          return style.display === "none" || style.visibility === "hidden" || style.opacity === "0";
        },
        { timeout: 4000 },
      )
      .catch(() => {});

    await page.waitForTimeout(1000);
  };

  const forceClickHeuristic = async (keywords, excludeKeywords = []) => {
    return await page.evaluate(
      ({ keywords, excludeKeywords }) => {
        let clicked = false;
        function scan(node) {
          if (!node || node.nodeType !== 1 || clicked) return;

          const style = window.getComputedStyle(node);
          if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return;
          const rect = node.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          const tag = node.tagName.toLowerCase();
          const id = (node.id || "").toLowerCase();
          const cls = (typeof node.className === "string" ? node.className : "").toLowerCase();
          const text = (node.textContent || "").toLowerCase().trim();
          const aria = (node.getAttribute("aria-label") || "").toLowerCase();
          const title = (node.getAttribute("title") || "").toLowerCase();

          if (["body", "main", "section", "form", "note-list", "div", "note-item"].includes(tag) && text.length > 50) {
            // Ignore
          } else {
            const stringToSearch = `${tag} ${id} ${cls} ${text} ${aria} ${title}`;
            const isButtonLike =
              tag === "button" ||
              tag === "a" ||
              tag.includes("btn") ||
              cls.includes("btn") ||
              cls.includes("button") ||
              id.includes("btn") ||
              tag === "svg" ||
              cls.includes("icon") ||
              cls.includes("trash");

            if (isButtonLike) {
              const matchesKeyword = keywords.some((k) => stringToSearch.includes(k));
              const matchesExclude = excludeKeywords.some((e) => stringToSearch.includes(e));
              if (matchesKeyword && !matchesExclude) {
                node.click();
                clicked = true;
                return;
              }
            }
          }
          if (node.shadowRoot) Array.from(node.shadowRoot.childNodes).forEach(scan);
          Array.from(node.children).forEach(scan);
        }
        scan(document.body);
        return clicked;
      },
      { keywords, excludeKeywords },
    );
  };

  try {
    console.log(`${colors.cyan}> Pre-flight: wiping existing API data...${colors.reset}`);
    isPurging = true;
    await page.evaluate(async () => {
      try {
        let r = await fetch("https://notes-api.dicoding.dev/v2/notes");
        let d = await r.json();
        if (d.data) {
          for (const n of d.data) {
            await fetch(`https://notes-api.dicoding.dev/v2/notes/${n.id}`, { method: "DELETE" });
          }
        }
        r = await fetch("https://notes-api.dicoding.dev/v2/notes/archived");
        d = await r.json();
        if (d.data) {
          for (const n of d.data) {
            await fetch(`https://notes-api.dicoding.dev/v2/notes/${n.id}`, { method: "DELETE" });
          }
        }
      } catch (e) {}
    });
    isPurging = false;

    await page.reload();
    await page.waitForTimeout(4500);
    await page.waitForLoadState("networkidle");

    await page.addStyleTag({
      content:
        "#webpack-dev-server-client-overlay { display: none !important; pointer-events: none !important; z-index: -9999 !important; }",
    });
    await page.evaluate(() => {
      const killOverlay = () => {
        const overlay = document.getElementById("webpack-dev-server-client-overlay");
        if (overlay) overlay.remove();
      };
      killOverlay();
      const observer = new MutationObserver(killOverlay);
      observer.observe(document.body, { childList: true, subtree: true });
    });

    const { titleInput, bodyInput, submitBtn } = form;

    if (titleInput && bodyInput && submitBtn) {
      console.log(`${colors.cyan}> Injecting Stage 1: sabotaged payload (error handling)...${colors.reset}`);
      await titleInput.fill("Test Error Handling");
      await bodyInput.fill("Testing API failure response.");
      await submitBtn.click({ force: true });
      await sweepModals();

      if (state.isErrorHandled) {
        report.optional["Suggestion 2: Error Feedback Handled"] = true;
      } else {
        const hasErrorText = await page.evaluate(() => {
          const html = document.body.innerHTML.toLowerCase();
          return html.includes("gagal") || html.includes("error") || html.includes("periksa koneksi");
        });
        if (hasErrorText) report.optional["Suggestion 2: Error Feedback Handled"] = true;
      }

      console.log(`${colors.cyan}> Injecting Stage 2: valid payload (archive)...${colors.reset}`);
      await titleInput.fill(`Target Archive ${Date.now()}`);
      await bodyInput.fill("This note guarantees a target for the Archive Sniper.");
      await submitBtn.click({ force: true });
      await sweepModals();

      console.log(`${colors.cyan}> Injecting Stage 3: valid payload (delete)...${colors.reset}`);
      await titleInput.fill(`Target Delete ${Date.now()}`);
      await bodyInput.fill("This note guarantees a target for the Delete Sniper.");
      await submitBtn.click({ force: true });
      await sweepModals();
    }

    console.log(`${colors.cyan}> Auto-sniper: ARCHIVE...${colors.reset}`);
    const archiveClicked = await forceClickHeuristic(
      ["archive", "arsip"],
      ["unarchive", "batal", "kembali", "tab"],
    );
    if (!archiveClicked) console.log(`${colors.yellow}  [!] Could not locate Archive button.${colors.reset}`);
    await sweepModals();

    console.log(`${colors.cyan}> Auto-sniper: navigate to Archived tab...${colors.reset}`);
    await forceClickHeuristic(
      ["arsip", "archive", "tab-archive"],
      ["unarchive", "batal", "kembali", "btn", "button", "trash"],
    );
    await page.waitForTimeout(2000);

    console.log(`${colors.cyan}> Auto-sniper: UNARCHIVE...${colors.reset}`);
    const unarchiveClicked = await forceClickHeuristic(
      ["unarchive", "batal arsip", "kembali", "pindah", "inbox"],
      ["tab"],
    );
    if (!unarchiveClicked) console.log(`${colors.yellow}  [!] Could not locate Unarchive button.${colors.reset}`);
    await sweepModals();

    console.log(`${colors.cyan}> Auto-sniper: back to Active tab...${colors.reset}`);
    await forceClickHeuristic(["aktif", "active", "home"], ["tab-archive", "arsip", "archive"]);
    await page.waitForTimeout(2000);

    console.log(`${colors.cyan}> Auto-sniper: DELETE...${colors.reset}`);
    const deleteClicked = await forceClickHeuristic(["delete", "hapus", "trash"], ["tab"]);
    if (!deleteClicked) console.log(`${colors.yellow}  [!] Could not locate Delete button.${colors.reset}`);
    await sweepModals();

    const { apiStats, loadingStats } = state;

    const missingMethods = [];
    if (!apiStats.get) missingMethods.push("GET");
    if (!apiStats.post) missingMethods.push("POST");
    if (!apiStats.delete) missingMethods.push("DELETE");

    if (missingMethods.length === 0) {
      report.mandatory["Criteria 2: REST API Integrated (GET, POST, DELETE)"] = true;
    } else {
      report.mandatory["Criteria 2: REST API Integrated (GET, POST, DELETE)"] =
        `FAIL: Missing ${missingMethods.join(", ")}`;
    }

    const missingLoading = [];
    if (apiStats.get && !loadingStats.get) missingLoading.push("GET");
    if (apiStats.post && !loadingStats.post) missingLoading.push("POST");
    if (apiStats.delete && !loadingStats.delete) missingLoading.push("DELETE");
    if (apiStats.archive && !loadingStats.archive) missingLoading.push("ARCHIVE");
    if (apiStats.unarchive && !loadingStats.unarchive) missingLoading.push("UNARCHIVE");

    if (missingLoading.length === 0 && (apiStats.get || apiStats.post || apiStats.delete)) {
      report.mandatory["Criteria 5: Loading Indicator Rendered"] = true;
    } else if (missingLoading.length > 0) {
      report.mandatory["Criteria 5: Loading Indicator Rendered"] =
        `FAIL: No loading shown on ${missingLoading.join(", ")}`;
    } else {
      report.mandatory["Criteria 5: Loading Indicator Rendered"] =
        "FAIL: No API requests made to test loading";
    }

    if (apiStats.archive && apiStats.unarchive) {
      report.optional["Suggestion 1: Archive & Unarchive Implementation"] = true;
    } else if (apiStats.archive && !apiStats.unarchive) {
      console.log(`${colors.yellow}  [!] Partial: Archive worked, Unarchive not detected.${colors.reset}`);
    }

    return { missingMethods };
  } catch (e) {
    console.error(
      `${colors.red}> [FAIL] API audit crashed: ${e.message.split("\n")[0]}${colors.reset}`,
    );
    return { missingMethods: ["GET", "POST", "DELETE"] };
  }
};
