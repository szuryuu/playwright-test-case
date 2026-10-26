const { colors, ensureFormVisible } = require("../../../../utils");

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

  // Dismiss any SweetAlert2-style modal overlay. Native window.confirm dialogs
  // are already auto-accepted by page.on("dialog"). Scope clicks to modal
  // containers only, so regular page buttons (e.g. a note card's "Hapus") are
  // never clicked by accident.
  const sweepModals = async () => {
    await page.evaluate(() => {
      document
        .querySelectorAll(
          ".swal2-container button, .swal2-popup button, [role='dialog'] button, [role='alertdialog'] button",
        )
        .forEach((btn) => {
          const rect = btn.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) btn.click();
        });
    });
    await page.waitForTimeout(800);
  };

  const forceClickHeuristic = async (keywords, excludeKeywords = []) => {
    return await page.evaluate(
      ({ keywords, excludeKeywords }) => {
        let clicked = null;
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
                clicked = {
                  tag: node.tagName.toLowerCase(),
                  id: node.id || "",
                  cls: typeof node.className === "string" ? node.className : "",
                  text: (node.textContent || "").trim().slice(0, 40),
                  aria: node.getAttribute("aria-label") || "",
                };
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

  const clickLog = (label, result) => {
    if (result) {
      const desc = `<${result.tag}${result.id ? "#" + result.id : ""}${result.cls ? "." + result.cls : ""}> "${result.text}"${result.aria ? " (aria=" + result.aria + ")" : ""}`;
      console.log(`${colors.green}    [click] ${label} -> ${desc}${colors.reset}`);
    } else {
      console.log(`${colors.red}    [click] ${label} -> NONE${colors.reset}`);
    }
  };

  // Switch the note list between active/archived views. Handles tab/button
  // controls, <select> filters, and filter buttons. Retries because controls
  // are often hidden while the app is loading (artificial API latency).
  const switchToView = async (mode) => {
    const cfg =
      mode === "archived"
        ? {
            kw: ["arsip", "archive", "diarsipkan", "tab-archive"],
            ex: ["unarchive", "batal", "kembali", "pulihkan", "kembalikan", "arsipkan", "trash", "delete", "hapus", "aktif", "active", "semua"],
          }
        : {
            kw: ["semua", "aktif", "active", "home"],
            ex: ["tab-archive", "arsip", "archive", "diarsip", "pulihkan", "hapus", "delete", "trash"],
          };

    for (let attempt = 0; attempt < 15; attempt++) {
      const btn = await forceClickHeuristic(cfg.kw, cfg.ex);
      if (btn) return { via: "button", text: btn.text };

      const sel = await page.evaluate(
        ({ mode }) => {
          for (const select of Array.from(document.querySelectorAll("select"))) {
            const options = Array.from(select.options);
            let target = null;
            if (mode === "archived") {
              target =
                options.find((o) => {
                  const h = `${o.value} ${o.textContent}`.toLowerCase();
                  return (
                    (h.includes("archiv") || h.includes("diarsip") || h.includes("arsip")) &&
                    !h.includes("aktif") &&
                    !h.includes("active") &&
                    !h.includes("semua") &&
                    !h.includes("all")
                  );
                }) || null;
            } else {
              target =
                options.find((o) => {
                  const h = `${o.value} ${o.textContent}`.toLowerCase();
                  return (
                    (h.includes("aktif") || h.includes("active")) &&
                    !h.includes("archiv") &&
                    !h.includes("diarsip")
                  );
                }) ||
                options.find((o) => {
                  const h = `${o.value} ${o.textContent}`.toLowerCase();
                  return (
                    (h.includes("semua") || h.includes("all")) &&
                    !h.includes("archiv") &&
                    !h.includes("diarsip")
                  );
                }) ||
                null;
            }
            if (target) {
              select.value = target.value;
              select.dispatchEvent(new Event("change", { bubbles: true }));
              return { value: target.value, text: target.textContent.trim() };
            }
          }
          return null;
        },
        { mode },
      );
      if (sel) return { via: "select", text: sel.text };

      await page.waitForTimeout(500);
    }
    return { via: "none" };
  };

  // Click a note card's action button (archive/delete toggle), ignoring
  // toolbar filter/view controls that also mention "archive"/"arsip".
  const clickNoteActionButton = (keywords) => {
    return page.evaluate(({ keywords }) => {
      let result = null;
      function scan(node, inCard) {
        if (result || !node || node.nodeType !== 1) return;
        const tag = node.tagName.toLowerCase();
        // `note-filter` also contains "note", but its Archive tab is a view
        // control, not an action on a note. Only descend into card/item-like
        // components and exclude supporting components.
        const isNoteCard =
          tag.includes("-") &&
          /note|item|card/.test(tag) &&
          !/filter|form|modal|header|list|archive/.test(tag);
        const inNoteCard = inCard || isNoteCard;
        const btnLike = tag === "button" || tag === "a" || node.getAttribute("role") === "button";
        if (btnLike && inNoteCard) {
          const cls = (typeof node.className === "string" ? node.className : "").toLowerCase();
          // Generated labels commonly append the note title (e.g. "Lihat
          // detail catatan Target Archive"). Do not let that title make a
          // detail button look like an archive action.
          const aria = (node.getAttribute("aria-label") || "").replace(
            /\s+(catatan|note)\b.*$/i,
            "",
          );
          const text = (
            aria +
            " " +
            (node.getAttribute("data-action") || "") +
            " " +
            (node.textContent || "") +
            " " +
            cls +
            " " +
            (node.id || "")
          ).toLowerCase();
          const rect = node.getBoundingClientRect();
          const vis =
            rect.width > 0 &&
            rect.height > 0 &&
            window.getComputedStyle(node).visibility !== "hidden";
          if (vis && keywords.some((k) => text.includes(k))) {
            node.click();
            result = {
              tag,
              aria: node.getAttribute("aria-label") || "",
              text: (node.textContent || "").trim().slice(0, 30),
            };
            return;
          }
        }
        if (node.shadowRoot) Array.from(node.shadowRoot.childNodes).forEach((c) => scan(c, inNoteCard));
        Array.from(node.children).forEach((c) => scan(c, inNoteCard));
      }
      scan(document.body, false);
      return result;
    }, { keywords });
  };

  // Click a confirm button inside a currently-open modal/backdrop/dialog.
  // Matches aria-label/title (icon-only buttons) as well as visible text.
  // Playwright locators pierce shadow DOM + slots, so this works for both
  // SweetAlert and custom <modal-card> components.
  const clickModalConfirm = async (keywords) => {
    const sels = [];
    for (const k of keywords) {
      sels.push(`button[aria-label*="${k}" i]`, `button[title*="${k}" i]`, `button:has-text("${k}")`);
    }
    const overlays = page.locator(
      'modal-card[open], .modal-backdrop.active, [role="dialog"], .swal2-container',
    );
    const count = await overlays.count();
    for (let i = 0; i < count; i++) {
      const btn = overlays.nth(i).locator(sels.join(", ")).first();
      if (await btn.isVisible().catch(() => false)) {
        const aria = await btn.getAttribute("aria-label").catch(() => "");
        console.log(`${colors.yellow}    [modal-confirm] -> "${aria || ""}"${colors.reset}`);
        await btn.click({ force: true }).catch(() => {});
        return true;
      }
    }
    return false;
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

    // A reload (purge step above) may have closed the form again; re-reveal it.
    await ensureFormVisible(page, titleInput);

    if (titleInput && bodyInput && submitBtn) {
      console.log(`${colors.cyan}> Injecting Stage 1: sabotaged payload (error handling)...${colors.reset}`);
      await titleInput.fill("Test Error Handling");
      await bodyInput.fill("Testing API failure response.");
      await submitBtn.click({ force: true });
      // Check the transient alert before dismissing it. Previously this check
      // ran after sweepModals(), so SweetAlert feedback vanished first.
      await page.waitForTimeout(300);
      const hasErrorText = await page.evaluate(() => {
        const html = document.body.innerText.toLowerCase();
        return html.includes("gagal") || html.includes("error") || html.includes("periksa koneksi");
      });
      if (state.isErrorHandled || hasErrorText) {
        report.optional["Suggestion 2: Error Feedback Handled"] = true;
      }
      await sweepModals();

      console.log(`${colors.cyan}> Injecting Stage 2: valid payload (archive)...${colors.reset}`);
      await ensureFormVisible(page, titleInput);
      await titleInput.fill(`Target Archive ${Date.now()}`);
      await bodyInput.fill("This note guarantees a target for the Archive Sniper.");
      await submitBtn.click({ force: true });
      await sweepModals();

      console.log(`${colors.cyan}> Injecting Stage 3: valid payload (delete)...${colors.reset}`);
      await ensureFormVisible(page, titleInput);
      await titleInput.fill(`Target Delete ${Date.now()}`);
      await bodyInput.fill("This note guarantees a target for the Delete Sniper.");
      await submitBtn.click({ force: true });
      await sweepModals();
    }

    console.log(`${colors.cyan}> Auto-sniper: ARCHIVE...${colors.reset}`);
    let archiveNoteBtn = null;
    for (let i = 0; i < 20 && !archiveNoteBtn; i++) {
      archiveNoteBtn = await clickNoteActionButton(["archive", "arsipkan", "arsip"]);
      if (!archiveNoteBtn) await page.waitForTimeout(1000);
    }
    clickLog("ARCHIVE", archiveNoteBtn);
    if (archiveNoteBtn) {
      for (let i = 0; i < 20 && !state.apiStats.archive; i++) {
        await page.waitForTimeout(400);
        if (state.apiStats.archive) break;
        await clickModalConfirm(["archive", "arsip", "ya", "yes", "ok"]);
      }
    }
    await sweepModals();

    console.log(`${colors.cyan}> Auto-sniper: navigate to Archived view...${colors.reset}`);
    const nav = await switchToView("archived");
    console.log(`${colors.yellow}    [view] -> ${nav.via}${nav.text ? " (" + nav.text + ")" : ""}${colors.reset}`);
    await page.waitForTimeout(2000);

    console.log(`${colors.cyan}> Auto-sniper: UNARCHIVE...${colors.reset}`);
    let unarchiveNoteBtn = null;
    for (let i = 0; i < 20 && !unarchiveNoteBtn; i++) {
      unarchiveNoteBtn = await clickNoteActionButton([
        "unarchive",
        "pulihkan",
        "kembalikan",
        "restore",
        "archive", // fallback for submissions that mislabel archived-note actions
        "arsipkan",
        "arsip",
      ]);
      if (!unarchiveNoteBtn) await page.waitForTimeout(1000);
    }
    clickLog("UNARCHIVE", unarchiveNoteBtn);
    if (unarchiveNoteBtn) {
      for (let i = 0; i < 20 && !state.apiStats.unarchive; i++) {
        await page.waitForTimeout(400);
        if (state.apiStats.unarchive) break;
        await clickModalConfirm(["unarchive", "pulihkan", "kembalikan", "restore", "ya", "yes", "ok"]);
      }
    }
    await sweepModals();

    console.log(`${colors.cyan}> Auto-sniper: back to Active view...${colors.reset}`);
    const back = await switchToView("active");
    console.log(`${colors.yellow}    [view] -> ${back.via}${back.text ? " (" + back.text + ")" : ""}${colors.reset}`);
    await page.waitForTimeout(2000);

    console.log(`${colors.cyan}> Auto-sniper: DELETE...${colors.reset}`);
    let deleteClicked = null;
    for (let i = 0; i < 20 && !deleteClicked; i++) {
      deleteClicked = await clickNoteActionButton(["delete", "hapus", "trash"]);
      if (!deleteClicked) await page.waitForTimeout(1000);
    }
    clickLog("DELETE", deleteClicked);
    if (deleteClicked) {
      for (let i = 0; i < 20 && !state.apiStats.delete; i++) {
        await page.waitForTimeout(400);
        if (state.apiStats.delete) break;
        await clickModalConfirm(["delete", "hapus", "ya", "yes", "ok", "confirm"]);
      }
    }
    await sweepModals();

    const { apiStats, loadingStats } = state;
    console.log(`${colors.yellow}    [stats] ${JSON.stringify(apiStats)}${colors.reset}`);

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
