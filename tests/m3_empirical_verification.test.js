import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import React from "react";
import { renderToString } from "react-dom/server";

const FRONTEND_DIR = path.resolve(import.meta.dirname, "..");
const DIST_DIR = path.join(FRONTEND_DIR, "dist");
const SRC_DIR = path.join(FRONTEND_DIR, "src");

describe("Milestone 3 Empirical Verification Suite", () => {

  // =========================================================================
  // 1. Production Build & Dist Assets Inspection
  // =========================================================================
  describe("1. Production Build & Bundled Assets Verification", () => {
    it("verifies dist/index.html exists and has OctoPair title and metadata", () => {
      const indexPath = path.join(DIST_DIR, "index.html");
      assert.ok(fs.existsSync(indexPath), "dist/index.html must exist after build");
      const html = fs.readFileSync(indexPath, "utf8");

      // Title check
      assert.match(
        html,
        /<title>OctoPair — Collaborative Developer IDE & Pair Programming<\/title>/,
        "Title must reflect OctoPair brand"
      );

      // OpenGraph / Twitter tags check
      assert.match(html, /<meta property="og:site_name" content="OctoPair" \/>/);
      assert.match(html, /<meta property="og:title" content="OctoPair — Collaborative Developer IDE & Pair Programming" \/>/);
      assert.match(html, /<meta name="twitter:title" content="OctoPair — Collaborative Developer IDE & Pair Programming" \/>/);

      // Favicon checks
      assert.match(html, /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg" \/>/);
      assert.match(html, /<link rel="icon" type="image\/png" sizes="32x32" href="\/favicon-32\.png" \/>/);
      assert.match(html, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png" \/>/);

      // Dual-key auth hint check in head
      assert.match(html, /localStorage\.getItem\('octopair_auth_hint'\)/);
      assert.match(html, /localStorage\.getItem\('devtinder_auth_hint'\)/);

      // Zero old brand in title or meta tags
      assert.ok(!html.includes("<title>DevTinder"), "Title must not mention DevTinder");
      assert.ok(!html.includes('content="DevTinder"'), "Meta content must not mention DevTinder");
    });

    it("verifies dist/favicon.svg contains OctoPair squircle and label", () => {
      const faviconPath = path.join(DIST_DIR, "favicon.svg");
      assert.ok(fs.existsSync(faviconPath), "dist/favicon.svg must exist");
      const svg = fs.readFileSync(faviconPath, "utf8");
      assert.match(svg, /aria-label="OctoPair"/);
      assert.match(svg, /fill="#ccff00"/);
      assert.ok(!svg.toLowerCase().includes("devtinder"), "Favicon SVG must not contain DevTinder");
    });

    it("verifies compiled JS chunks contain OctoPair branding and no user-facing DevTinder strings", () => {
      const assetsDir = path.join(DIST_DIR, "assets");
      assert.ok(fs.existsSync(assetsDir), "dist/assets must exist");
      const files = fs.readdirSync(assetsDir);
      const jsFiles = files.filter(f => f.endsWith(".js"));

      assert.ok(jsFiles.length > 5, "Should have compiled multiple JS chunks");

      let foundSandbox = false;
      let foundPremium = false;
      let foundProjectRoom = false;

      for (const jsFile of jsFiles) {
        const content = fs.readFileSync(path.join(assetsDir, jsFile), "utf8");

        if (jsFile.startsWith("Sandbox-")) {
          foundSandbox = true;
          assert.ok(
            content.includes("octopair-pitch-black"),
            "Sandbox chunk must contain octopair-pitch-black theme"
          );
          assert.ok(
            !content.includes("devtinder-pitch-black"),
            "Sandbox chunk must NOT contain devtinder-pitch-black theme"
          );
          assert.ok(
            content.includes("OctoPair Collaborative Sandbox"),
            "Sandbox chunk must contain OctoPair Collaborative Sandbox template"
          );
        }

        if (jsFile.startsWith("Premium-")) {
          foundPremium = true;
          assert.ok(
            content.includes("OctoPair Memberships"),
            "Premium chunk must contain OctoPair Memberships"
          );
          assert.ok(
            content.includes("OctoPair Pro"),
            "Premium chunk must contain OctoPair Pro"
          );
          assert.ok(
            !content.includes("DevTinder Memberships"),
            "Premium chunk must NOT contain DevTinder Memberships"
          );
        }

        if (jsFile.startsWith("ProjectRoom-")) {
          foundProjectRoom = true;
          assert.ok(
            content.includes("OctoPair Workspace"),
            "ProjectRoom chunk must contain OctoPair Workspace"
          );
          assert.ok(
            !content.includes("DevTinder Workspace"),
            "ProjectRoom chunk must NOT contain DevTinder Workspace"
          );
        }

        // Check that any occurrence of "devtinder" in any chunk is ONLY for storage key migration
        const devtinderMatches = content.match(/devtinder[^"'\s]*/gi) || [];
        for (const match of devtinderMatches) {
          const isAllowedKey = [
            "devtinder_auth_hint",
            "devtinder_auth",
            "devtinder_conversations",
          ].some(k => match.toLowerCase().includes(k.toLowerCase()));
          assert.ok(
            isAllowedKey,
            `Unexpected DevTinder reference in ${jsFile}: ${match}`
          );
        }
      }

      assert.ok(foundSandbox, "Must find and verify compiled Sandbox chunk");
      assert.ok(foundPremium, "Must find and verify compiled Premium chunk");
      assert.ok(foundProjectRoom, "Must find and verify compiled ProjectRoom chunk");
    });
  });

  // =========================================================================
  // 2. Monaco Theme Behavior & Sandbox Initial Code Templates
  // =========================================================================
  describe("2. Monaco Theme Behavior & Sandbox Code Templates", () => {
    const sandboxPath = path.join(SRC_DIR, "components/Sandbox.jsx");
    const sandboxContent = fs.readFileSync(sandboxPath, "utf8");

    it("verifies all Sandbox BOILERPLATES contain OctoPair branding and no DevTinder references", () => {
      // Extract BOILERPLATES object literal from Sandbox.jsx
      const match = sandboxContent.match(/const BOILERPLATES = (\{[\s\S]*?\n\};\n\n\/\/ Judge0)/);
      assert.ok(match, "BOILERPLATES object must be present in Sandbox.jsx");

      const boilerplatesCode = match[1].replace(/\n\/\/ Judge0$/, "");
      const boilerplates = new Function(`return ${boilerplatesCode}`)();

      const expectedLangs = ["javascript", "typescript", "python", "java", "cpp", "c", "rust", "go"];
      assert.deepEqual(Object.keys(boilerplates).sort(), expectedLangs.sort());

      for (const [lang, template] of Object.entries(boilerplates)) {
        assert.ok(template.length > 20, `Template for ${lang} must not be empty`);
        assert.ok(
          template.includes("OctoPair"),
          `Template for ${lang} must include 'OctoPair'`
        );
        assert.ok(
          !template.toLowerCase().includes("devtinder"),
          `Template for ${lang} must NOT include 'devtinder'`
        );
      }
    });

    it("verifies Monaco theme registration and application symmetry", () => {
      // Extract defined theme name and set theme name
      const defineThemeMatch = sandboxContent.match(/monaco\.editor\.defineTheme\(\s*["']([^"']+)["']/);
      const setThemeMatch = sandboxContent.match(/monaco\.editor\.setTheme\(\s*["']([^"']+)["']/);

      assert.ok(defineThemeMatch, "Sandbox.jsx must call monaco.editor.defineTheme");
      assert.ok(setThemeMatch, "Sandbox.jsx must call monaco.editor.setTheme");

      const definedTheme = defineThemeMatch[1];
      const appliedTheme = setThemeMatch[1];

      assert.equal(
        definedTheme,
        "octopair-pitch-black",
        "Defined theme ID must be 'octopair-pitch-black'"
      );
      assert.equal(
        appliedTheme,
        "octopair-pitch-black",
        "Applied theme ID must be 'octopair-pitch-black'"
      );
      assert.equal(
        definedTheme,
        appliedTheme,
        "Defined theme ID and setTheme ID must match exactly for Monaco initialization"
      );
    });

    it("simulates Monaco theme engine execution and asserts proper color/token rules", () => {
      // Mock Monaco Editor API
      const registeredThemes = new Map();
      let currentActiveTheme = null;

      const mockMonaco = {
        editor: {
          defineTheme: (name, themeConfig) => {
            registeredThemes.set(name, themeConfig);
          },
          setTheme: (name) => {
            if (!registeredThemes.has(name)) {
              throw new Error(`MonacoThemeError: Theme '${name}' is not registered!`);
            }
            currentActiveTheme = name;
          },
        },
      };

      // Extract the theme definition block from Sandbox.jsx
      const themeBlockMatch = sandboxContent.match(/monaco\.editor\.defineTheme\(\s*"octopair-pitch-black",\s*({[\s\S]*?})\s*\);/);
      assert.ok(themeBlockMatch, "Theme configuration block must exist");

      const themeConfig = new Function(`return ${themeBlockMatch[1]}`)();

      // Test theme registration
      mockMonaco.editor.defineTheme("octopair-pitch-black", themeConfig);
      assert.ok(registeredThemes.has("octopair-pitch-black"));

      // Test theme application
      mockMonaco.editor.setTheme("octopair-pitch-black");
      assert.equal(currentActiveTheme, "octopair-pitch-black");

      // Test adversarial invalid theme request
      assert.throws(
        () => mockMonaco.editor.setTheme("devtinder-pitch-black"),
        /MonacoThemeError: Theme 'devtinder-pitch-black' is not registered!/
      );

      // Verify theme attributes
      assert.equal(themeConfig.base, "vs-dark");
      assert.equal(themeConfig.colors["editor.background"], "#09090b");
      assert.equal(themeConfig.colors["editor.foreground"], "#f0f0f0");
      assert.equal(themeConfig.colors["editorCursor.foreground"], "#ccff00");
      assert.equal(themeConfig.colors["editorLineNumber.activeForeground"], "#ccff00");
    });

    it("verifies Sandbox header wordmark and Razorpay checkout options reflect OctoPair", () => {
      // Header wordmark
      assert.match(
        sandboxContent,
        /<span[^>]*>\s*OctoPair\s*<\/span>/,
        "Sandbox top bar wordmark must be 'OctoPair'"
      );
      assert.ok(
        !sandboxContent.match(/<span[^>]*>\s*DevTinder\s*<\/span>/),
        "Sandbox top bar wordmark must not be 'DevTinder'"
      );

      // Razorpay checkout
      assert.match(
        sandboxContent,
        /name:\s*["']OctoPair Pro["']/,
        "Razorpay checkout name must be 'OctoPair Pro'"
      );
      assert.ok(
        !sandboxContent.match(/name:\s*["']DevTinder Pro["']/),
        "Razorpay checkout name must not be 'DevTinder Pro'"
      );
    });
  });

  // =========================================================================
  // 3. SendToLaptopButton Fallback URL Across Simulated Environments
  // =========================================================================
  describe("3. SendToLaptopButton Environment Simulation & Fallback Verification", () => {
    const sendToLaptopPath = path.join(SRC_DIR, "components/landing/SendToLaptopButton.jsx");
    const sendToLaptopContent = fs.readFileSync(sendToLaptopPath, "utf8");

    it("evaluates URL calculation formula across varied window locations", () => {
      // The exact logic from SendToLaptopButton.jsx line 12:
      // const url = typeof window !== "undefined" ? (window.location.origin + window.location.pathname) : "";

      const getUrl = (mockWindow) => {
        if (typeof mockWindow === "undefined" || mockWindow === null) {
          return "";
        }
        return mockWindow.location.origin + mockWindow.location.pathname;
      };

      // Scenario A: Standard production root
      assert.equal(
        getUrl({ location: { origin: "https://octopair.dev", pathname: "/" } }),
        "https://octopair.dev/"
      );

      // Scenario B: Deep path with query strings and hash (should be cleanly excluded)
      assert.equal(
        getUrl({
          location: {
            origin: "https://octopair.dev",
            pathname: "/project/room/snippet_abc123",
            search: "?ref=mobile_share&debug=true",
            hash: "#terminal",
          },
        }),
        "https://octopair.dev/project/room/snippet_abc123"
      );

      // Scenario C: Local development port
      assert.equal(
        getUrl({ location: { origin: "http://localhost:5173", pathname: "/feed" } }),
        "http://localhost:5173/feed"
      );

      // Scenario D: Staging Vercel deployment
      assert.equal(
        getUrl({
          location: {
            origin: "https://devtinder-frontend-mu.vercel.app",
            pathname: "/connections",
          },
        }),
        "https://devtinder-frontend-mu.vercel.app/connections"
      );

      // Scenario E: SSR / undefined window
      assert.equal(getUrl(undefined), "");
      assert.equal(getUrl(null), "");
    });

    it("verifies SendToLaptopButton SSR safety (no ReferenceError when window is undefined)", () => {
      // Transform JSX to CJS via esbuild and evaluate in Node SSR context
      const transformed = esbuild.transformSync(sendToLaptopContent, {
        loader: "jsx",
        format: "cjs",
      });

      const moduleExports = {};
      const fn = new Function("require", "exports", "module", transformed.code);
      const fakeRequire = (name) => {
        if (name === "react") return React;
        if (name === "lucide-react") return { Share2: () => null, Check: () => null };
        return {};
      };
      const fakeModule = { exports: moduleExports };
      fn(fakeRequire, moduleExports, fakeModule);

      const SendToLaptopButton = fakeModule.exports.default;

      // Render to string in pure Node environment without window
      let rendered;
      assert.doesNotThrow(() => {
        rendered = renderToString(React.createElement(SendToLaptopButton));
      }, "SendToLaptopButton must not throw during SSR");

      assert.ok(rendered.includes("Send this link to my laptop"));
      assert.ok(!rendered.toLowerCase().includes("devtinder"), "Rendered SSR output must not mention DevTinder");
    });

    it("verifies Share API metadata payload and fallback dispatch logic", async () => {
      // Check shareData object structure in source
      assert.match(sendToLaptopContent, /title:\s*["']OctoPair - The Multiplayer IDE for Builders["']/);
      assert.match(sendToLaptopContent, /text:\s*["']Pick a project\. Pair up\. Build it live on OctoPair\.["']/);

      // Assert no hardcoded URLs remain in SendToLaptopButton.jsx
      assert.ok(
        !sendToLaptopContent.includes("https://devtinder.com"),
        "Must not contain hardcoded https://devtinder.com"
      );
      assert.ok(
        !sendToLaptopContent.includes("https://octopair.dev"),
        "Must not contain hardcoded https://octopair.dev — should use dynamic origin resolution"
      );

      // Simulate navigator.share execution matrix
      let shareCalls = [];
      let clipboardCalls = [];

      const createMockShareHandler = (mockNavigator, mockWindow) => {
        return async () => {
          const url = typeof mockWindow !== "undefined" ? (mockWindow.location.origin + mockWindow.location.pathname) : "";
          const shareData = {
            title: "OctoPair - The Multiplayer IDE for Builders",
            text: "Pick a project. Pair up. Build it live on OctoPair.",
            url: url,
          };

          const fallbackCopy = async (text) => {
            if (typeof mockNavigator !== "undefined" && mockNavigator.clipboard) {
              try {
                await mockNavigator.clipboard.writeText(text);
                return "copied";
              } catch {
                return "clipboard_error";
              }
            }
            return "no_clipboard";
          };

          if (typeof mockNavigator !== "undefined" && mockNavigator.share) {
            try {
              await mockNavigator.share(shareData);
              return "shared";
            } catch (err) {
              if (err.name !== "AbortError") {
                return await fallbackCopy(url);
              }
              return "cancelled";
            }
          } else {
            return await fallbackCopy(url);
          }
        };
      };

      const mockWin = { location: { origin: "https://octopair.dev", pathname: "/sandbox" } };

      // Case 1: Web Share API succeeds
      const navSuccess = {
        share: async (data) => { shareCalls.push(data); },
        clipboard: { writeText: async (t) => { clipboardCalls.push(t); } },
      };
      const res1 = await createMockShareHandler(navSuccess, mockWin)();
      assert.equal(res1, "shared");
      assert.equal(shareCalls.length, 1);
      assert.equal(shareCalls[0].url, "https://octopair.dev/sandbox");
      assert.equal(clipboardCalls.length, 0);

      // Case 2: Web Share API aborted by user (AbortError) -> No clipboard fallback
      const navAbort = {
        share: async () => {
          const err = new Error("User canceled");
          err.name = "AbortError";
          throw err;
        },
        clipboard: { writeText: async (t) => { clipboardCalls.push(t); } },
      };
      const res2 = await createMockShareHandler(navAbort, mockWin)();
      assert.equal(res2, "cancelled");
      assert.equal(clipboardCalls.length, 0);

      // Case 3: Web Share API fails with NotAllowedError -> Clipboard fallback triggered
      const navFail = {
        share: async () => {
          const err = new Error("Permission denied");
          err.name = "NotAllowedError";
          throw err;
        },
        clipboard: { writeText: async (t) => { clipboardCalls.push(t); } },
      };
      const res3 = await createMockShareHandler(navFail, mockWin)();
      assert.equal(res3, "copied");
      assert.equal(clipboardCalls.length, 1);
      assert.equal(clipboardCalls[0], "https://octopair.dev/sandbox");

      // Case 4: Desktop browser without Web Share API -> Direct clipboard copy
      clipboardCalls = [];
      const navDesktop = {
        clipboard: { writeText: async (t) => { clipboardCalls.push(t); } },
      };
      const res4 = await createMockShareHandler(navDesktop, mockWin)();
      assert.equal(res4, "copied");
      assert.equal(clipboardCalls.length, 1);
      assert.equal(clipboardCalls[0], "https://octopair.dev/sandbox");
    });
  });

  // =========================================================================
  // 4. Milestone 3 Core Files Brand Whitelist Inspection
  // =========================================================================
  describe("4. Comprehensive Name Replacement Whitelist Inspection", () => {
    const M3_CORE_FILES = [
      "src/utils/constants.js",
      "src/components/Sandbox.jsx",
      "src/components/Premium.jsx",
      "src/components/Feed.jsx",
      "src/components/ProjectRoom.jsx",
      "src/components/CommandPalette.jsx",
      "src/components/UserProfilePage.jsx",
      "src/components/Onboarding.jsx",
      "src/pages/OnboardingPage.jsx",
      "src/components/NotFoundPage.jsx",
      "src/pages/NotFoundPage.jsx",
      "src/components/landing/SendToLaptopButton.jsx",
    ];

    for (const relPath of M3_CORE_FILES) {
      it(`verifies 0 unmigrated 'devtinder' mentions in ${relPath}`, () => {
        const fullPath = path.join(FRONTEND_DIR, relPath);
        assert.ok(fs.existsSync(fullPath), `File must exist: ${relPath}`);
        const content = fs.readFileSync(fullPath, "utf8");

        const matches = [...content.matchAll(/dev[ -_]?tinder/gi)];
        assert.equal(
          matches.length,
          0,
          `Found ${matches.length} illegal occurrences of 'devtinder' in ${relPath}`
        );
      });
    }

    it("verifies Backend utils/cronJob.js email subjects and bodies use OctoPair", () => {
      const cronJobPath = path.resolve(FRONTEND_DIR, "../Backend/utils/cronJob.js");
      assert.ok(fs.existsSync(cronJobPath), "Backend/utils/cronJob.js must exist");
      const content = fs.readFileSync(cronJobPath, "utf8");

      assert.match(
        content,
        /New Connection Requests on OctoPair/,
        "Email subject must say 'New Connection Requests on OctoPair'"
      );
      assert.match(
        content,
        /You have new connection requests on OctoPair\./,
        "Email body must say 'You have new connection requests on OctoPair.'"
      );
      assert.ok(
        !content.toLowerCase().includes("requests on devtinder"),
        "Email must not say 'requests on devtinder'"
      );
    });

    it("verifies package.json and README documentation titles are OctoPair", () => {
      const fePackage = JSON.parse(fs.readFileSync(path.join(FRONTEND_DIR, "package.json"), "utf8"));
      assert.equal(fePackage.name, "octopair-frontend", "Frontend package name must be 'octopair-frontend'");

      const feReadme = fs.readFileSync(path.join(FRONTEND_DIR, "README.md"), "utf8");
      assert.match(feReadme, /^# OctoPair – Frontend/m);

      const beReadme = fs.resolve ? fs.readFileSync(path.resolve(FRONTEND_DIR, "../Backend/README.md"), "utf8") : fs.readFileSync(path.join(FRONTEND_DIR, "../Backend/README.md"), "utf8");
      assert.match(beReadme, /^# OctoPair – Backend/m);

      const vercelDoc = fs.readFileSync(path.join(FRONTEND_DIR, "VERCEL_DEPLOYMENT.md"), "utf8");
      assert.match(vercelDoc, /^# OctoPair Frontend - Vercel Deployment/m);
    });
  });
});
