import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import esbuild from "esbuild";

const FRONTEND_DIR = path.resolve(process.cwd());
const DIST_DIR = path.join(FRONTEND_DIR, "dist");
const SRC_DIR = path.join(FRONTEND_DIR, "src");

// Helper to read files
const readDist = (rel) => fs.readFileSync(path.join(DIST_DIR, rel), "utf-8");
const readSrc = (rel) => fs.readFileSync(path.join(SRC_DIR, rel), "utf-8");

describe("Milestone 4 Adversarial Stress Suite (Empirical Challenger)", () => {
  const routes = [
    {
      path: "/",
      file: "index.html",
      expectedTitle: "OctoPair — Collaborative Developer IDE & Pair Programming",
      expectedDesc: "Pick a project. Pair up. Build it live.",
      expectedOgUrl: "https://octopair.dev",
      expectH1: 1,
    },
    {
      path: "/features/match",
      file: "features/match/index.html",
      expectedTitle: "Developer Matching & Discovery — OctoPair",
      expectedDesc: "Algorithmic developer pairing scored by tech stack overlap",
      expectedOgUrl: "https://octopair.dev/features/match",
      expectH1: 0,
    },
    {
      path: "/features/collab",
      file: "features/collab/index.html",
      expectedTitle: "Live Multiplayer Collaboration — OctoPair",
      expectedDesc: "Sub-50ms multiplayer IDE with WebRTC audio/video mesh",
      expectedOgUrl: "https://octopair.dev/features/collab",
      expectH1: 0,
    },
    {
      path: "/features/feed",
      file: "features/feed/index.html",
      expectedTitle: "Developer Feed & Interactive Snippets — OctoPair",
      expectedDesc: "Interactive code snippets, sandboxed runtimes",
      expectedOgUrl: "https://octopair.dev/features/feed",
      expectH1: 0,
    },
    {
      path: "/features/projects",
      file: "features/projects/index.html",
      expectedTitle: "Open Developer Projects & Sprints — OctoPair",
      expectedDesc: "Curated open-source codebases, project rooms",
      expectedOgUrl: "https://octopair.dev/features/projects",
      expectH1: 0,
    },
    {
      path: "/pricing",
      file: "pricing/index.html",
      expectedTitle: "Transparent Pricing Plans — OctoPair",
      expectedDesc: "Predictable, transparent plans for individual builders",
      expectedOgUrl: "https://octopair.dev/pricing",
      expectH1: 0,
    },
    {
      path: "/community",
      file: "community/index.html",
      expectedTitle: "Global Developer Community & Telemetry — OctoPair",
      expectedDesc: "Live builder telemetry, global peer-to-peer network metrics",
      expectedOgUrl: "https://octopair.dev/community",
      expectH1: 0,
    },
  ];

  // =========================================================================
  // 1. Stress test static HTML files generated in dist/
  // =========================================================================
  describe("1. Static HTML Artifacts Verification in dist/", () => {
    it("all 7 routes have valid HTML files with substantial non-empty prerendered markup", () => {
      for (const r of routes) {
        const fullPath = path.join(DIST_DIR, r.file);
        assert.ok(fs.existsSync(fullPath), `dist/${r.file} does not exist`);

        const content = readDist(r.file);
        assert.ok(content.length > 2000, `dist/${r.file} is suspiciously small: ${content.length} bytes`);

        const rootStart = content.indexOf('<div id="root">') + '<div id="root">'.length;
        const rootEnd = content.lastIndexOf('</div>');
        assert.ok(rootStart > 0 && rootEnd > rootStart, `dist/${r.file} missing <div id="root">`);

        const innerMarkup = content.substring(rootStart, rootEnd).trim();
        assert.ok(innerMarkup.length > 1000, `Pre-rendered inner markup in dist/${r.file} is too small: ${innerMarkup.length} bytes`);
        assert.ok(innerMarkup.includes("<header") || innerMarkup.includes("<nav"), `dist/${r.file} must contain header/nav markup`);
        assert.ok(innerMarkup.includes("<footer"), `dist/${r.file} must contain footer markup`);
      }
    });

    it("all 7 routes contain correct SEO title, meta descriptions, and OpenGraph URLs", () => {
      for (const r of routes) {
        const content = readDist(r.file);

        // Title
        assert.ok(
          content.includes(`<title>${r.expectedTitle}</title>`),
          `dist/${r.file} must contain title "${r.expectedTitle}"`
        );

        // Description
        assert.ok(
          content.includes(r.expectedDesc),
          `dist/${r.file} must contain meta description snippet "${r.expectedDesc}"`
        );

        // OpenGraph URL
        assert.ok(
          content.includes(`property="og:url" content="${r.expectedOgUrl}"`),
          `dist/${r.file} must contain og:url "${r.expectedOgUrl}"`
        );

        // Twitter Title
        assert.ok(
          content.includes(`name="twitter:title" content="${r.expectedTitle}"`),
          `dist/${r.file} must contain twitter:title`
        );
      }
    });

    it("heading semantics: exactly 1 <h1> on root /, strictly 0 <h1> and semantic <h2> on all 6 sub-pages", () => {
      for (const r of routes) {
        const content = readDist(r.file);
        const h1Matches = content.match(/<h1[^>]*>/gi) || [];
        assert.equal(
          h1Matches.length,
          r.expectH1,
          `dist/${r.file} expected ${r.expectH1} <h1>, but found ${h1Matches.length}`
        );

        if (!r.expectH1) {
          assert.ok(content.includes("<h2"), `dist/${r.file} must include semantic <h2> tag`);
        }
      }
    });

    it("asset paths are absolute (/assets/...) ensuring deep linking sub-directories resolve correctly", () => {
      for (const r of routes) {
        const content = readDist(r.file);
        const scriptTags = content.match(/<script[^>]*src=["']([^"']*)["']/gi) || [];
        for (const tag of scriptTags) {
          if (tag.includes("checkout.razorpay.com")) continue;
          assert.ok(
            tag.includes('src="/'),
            `Script tag in dist/${r.file} must use absolute path: ${tag}`
          );
        }
      }
    });

    it("zero unicode emojis anywhere in dist/ HTML files", () => {
      const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;
      for (const r of routes) {
        const content = readDist(r.file);
        const emojis = content.match(emojiRegex) || [];
        assert.equal(emojis.length, 0, `dist/${r.file} contains forbidden emoji: ${emojis.join(" ")}`);
      }
    });
  });

  // =========================================================================
  // 2. Verify deep linking: unauthenticated visitors are not bounced
  // =========================================================================
  describe("2. Deep Linking Verification: Unauthenticated Visitors", () => {
    it("transpiled React components stay on target route and do not bounce to /feed or /login", async () => {
      const script = `
        import React from "react";
        import { renderToString } from "react-dom/server";
        import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
        import { Provider } from "react-redux";
        import { configureStore } from "@reduxjs/toolkit";

        import LandingShell from "./src/components/landing/LandingShell.jsx";
        import FeaturesMatchPage from "./src/pages/marketing/FeaturesMatchPage.jsx";
        import FeaturesCollabPage from "./src/pages/marketing/FeaturesCollabPage.jsx";
        import FeaturesFeedPage from "./src/pages/marketing/FeaturesFeedPage.jsx";
        import FeaturesProjectsPage from "./src/pages/marketing/FeaturesProjectsPage.jsx";
        import PricingDestinationPage from "./src/pages/marketing/PricingDestinationPage.jsx";
        import CommunityDestinationPage from "./src/pages/marketing/CommunityDestinationPage.jsx";

        globalThis.window = {
          scrollTo: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
        };
        globalThis.document = { cookie: "" };
        globalThis.localStorage = { getItem: () => null };

        const store = configureStore({
          reducer: { user: () => null }
        });

        const LocationTracker = () => {
          const loc = useLocation();
          return React.createElement("div", { "data-current-path": loc.pathname });
        };

        const testPaths = [
          "/pricing",
          "/features/collab",
          "/features/match",
          "/features/feed",
          "/features/projects",
          "/community"
        ];

        const results = [];

        for (const initialPath of testPaths) {
          const vdom = (
            <Provider store={store}>
              <MemoryRouter initialEntries={[initialPath]}>
                <LocationTracker />
                <Routes>
                  <Route element={<LandingShell />}>
                    <Route path="/features/match" element={<FeaturesMatchPage />} />
                    <Route path="/features/collab" element={<FeaturesCollabPage />} />
                    <Route path="/features/feed" element={<FeaturesFeedPage />} />
                    <Route path="/features/projects" element={<FeaturesProjectsPage />} />
                    <Route path="/pricing" element={<PricingDestinationPage />} />
                    <Route path="/community" element={<CommunityDestinationPage />} />
                  </Route>
                  <Route path="/feed" element={<div id="feed-screen" />} />
                  <Route path="/login" element={<div id="login-screen" />} />
                </Routes>
              </MemoryRouter>
            </Provider>
          );

          const html = renderToString(vdom);
          const currentPathMatch = html.match(/data-current-path="([^"]+)"/);
          const currentPath = currentPathMatch ? currentPathMatch[1] : null;

          results.push({
            initialPath,
            currentPath,
            bouncedToFeed: html.indexOf("feed-screen") !== -1,
            bouncedToLogin: html.indexOf("login-screen") !== -1,
            hasContent: html.length > 5000,
          });
        }

        console.log(JSON.stringify(results));
      `;

      const res = esbuild.buildSync({
        stdin: { contents: script, resolveDir: FRONTEND_DIR, loader: "jsx" },
        bundle: true,
        format: "esm",
        platform: "node",
        write: false,
        external: ["react", "react-dom", "react-router-dom", "react-redux", "@reduxjs/toolkit", "lucide-react", "framer-motion"],
      });

      const tempFile = path.join(FRONTEND_DIR, "test_deep_tmp.mjs");
      fs.writeFileSync(tempFile, res.outputFiles[0].text);

      const { stdout } = await import("node:child_process").then((cp) => ({
        stdout: cp.execSync(`node ${tempFile}`).toString(),
      }));
      fs.unlinkSync(tempFile);

      const parsedResults = JSON.parse(stdout.trim());
      for (const r of parsedResults) {
        assert.equal(r.currentPath, r.initialPath, `Deep link ${r.initialPath} changed to ${r.currentPath}`);
        assert.equal(r.bouncedToFeed, false, `Deep link ${r.initialPath} was bounced to /feed`);
        assert.equal(r.bouncedToLogin, false, `Deep link ${r.initialPath} was bounced to /login`);
        assert.ok(r.hasContent, `Deep link ${r.initialPath} rendered empty content`);
      }
    });
  });

  // =========================================================================
  // 3. Verify returning authenticated users: visiting / triggers instant redirect to /feed
  // =========================================================================
  describe("3. Returning Authenticated Users Redirect on /", () => {
    it("all 6 auth tokens, cookies, and Redux state triggers instant redirect to /feed", async () => {
      const script = `
        import React from "react";
        import { renderToString } from "react-dom/server";
        import { MemoryRouter, Routes, Route } from "react-router-dom";
        import { Provider } from "react-redux";
        import { configureStore } from "@reduxjs/toolkit";

        import LandingPage from "./src/components/LandingPage.jsx";

        const scenarios = [
          { name: "Unauthenticated", key: null, cookie: "", user: null, expectAuth: false },
          { name: "octopair_auth_hint", key: "octopair_auth_hint", val: "true", cookie: "", user: null, expectAuth: true },
          { name: "devtinder_auth_hint", key: "devtinder_auth_hint", val: "true", cookie: "", user: null, expectAuth: true },
          { name: "octopair_auth", key: "octopair_auth", val: "1", cookie: "", user: null, expectAuth: true },
          { name: "devtinder_auth", key: "devtinder_auth", val: "1", cookie: "", user: null, expectAuth: true },
          { name: "Cookie auth_hint", key: null, cookie: "auth_hint=true", user: null, expectAuth: true },
          { name: "Redux store user", key: null, cookie: "", user: { _id: "u123" }, expectAuth: true },
        ];

        const outcomes = [];

        for (const sc of scenarios) {
          const storageMap = {};
          if (sc.key) storageMap[sc.key] = sc.val;
          const sessionMap = {};

          globalThis.window = {
            scrollTo: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
          };
          globalThis.document = { cookie: sc.cookie };
          globalThis.localStorage = { getItem: (k) => storageMap[k] || null };
          globalThis.sessionStorage = { setItem: (k, v) => { sessionMap[k] = v; } };

          const store = configureStore({
            reducer: { user: () => sc.user }
          });

          const vdom = (
            <Provider store={store}>
              <MemoryRouter initialEntries={["/"]}>
                <Routes>
                  <Route path="/" element={<LandingPage wrapInShell={false} />} />
                </Routes>
              </MemoryRouter>
            </Provider>
          );

          const html = renderToString(vdom);
          // When isAuthHint is true, Navigate is returned, so html is empty (or null), and session is set
          const isRedirect = sessionMap["octopair_from_root"] === "1";

          outcomes.push({
            name: sc.name,
            expectAuth: sc.expectAuth,
            isRedirect,
            htmlLength: html.length,
          });
        }

        console.log(JSON.stringify(outcomes));
      `;

      const res = esbuild.buildSync({
        stdin: { contents: script, resolveDir: FRONTEND_DIR, loader: "jsx" },
        bundle: true,
        format: "esm",
        platform: "node",
        write: false,
        external: ["react", "react-dom", "react-router-dom", "react-redux", "@reduxjs/toolkit", "lucide-react", "framer-motion"],
      });

      const tempFile = path.join(FRONTEND_DIR, "test_auth_tmp.mjs");
      fs.writeFileSync(tempFile, res.outputFiles[0].text);

      const { stdout } = await import("node:child_process").then((cp) => ({
        stdout: cp.execSync(`node ${tempFile}`).toString(),
      }));
      fs.unlinkSync(tempFile);

      const parsedOutcomes = JSON.parse(stdout.trim());
      for (const o of parsedOutcomes) {
        assert.equal(
          o.isRedirect,
          o.expectAuth,
          `Scenario "${o.name}" expected auth redirect=${o.expectAuth}, but got isRedirect=${o.isRedirect}`
        );
        if (o.expectAuth) {
          assert.equal(o.htmlLength, 0, `Scenario "${o.name}" should render Navigate (empty SSR), got ${o.htmlLength} bytes`);
        } else {
          assert.ok(o.htmlLength > 1000, `Scenario "${o.name}" should render sections, got ${o.htmlLength} bytes`);
        }
      }
    });
  });

  // =========================================================================
  // 4. Adversarial Edge Case: Nested LandingShell on Root /
  // =========================================================================
  describe("4. Adversarial Discovery: Redundant LandingShell Nesting on Root /", () => {
    it("empirically demonstrates that LandingPage defaults wrapInShell=true causing 2 navbars and 2 footers when hosted in App.jsx LandingShell", async () => {
      const script = `
        import React from "react";
        import { renderToString } from "react-dom/server";
        import { MemoryRouter, Routes, Route } from "react-router-dom";
        import { Provider } from "react-redux";
        import { configureStore } from "@reduxjs/toolkit";

        import LandingShell from "./src/components/landing/LandingShell.jsx";
        import LandingPage from "./src/components/LandingPage.jsx";
        import FeaturesMatchPage from "./src/pages/marketing/FeaturesMatchPage.jsx";

        globalThis.window = {
          scrollTo: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
        };
        globalThis.document = { cookie: "" };
        globalThis.localStorage = { getItem: () => null };

        const store = configureStore({
          reducer: { user: () => null }
        });

        // 1. Root / render with App.jsx routing structure: <Route element={<LandingShell />}><Route path="/" element={<LandingPage />} /></Route>
        const rootVdom = (
          <Provider store={store}>
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route element={<LandingShell />}>
                  <Route path="/" element={<LandingPage />} />
                </Route>
              </Routes>
            </MemoryRouter>
          </Provider>
        );
        const rootHtml = renderToString(rootVdom);
        const rootNavMatches = rootHtml.match(/<nav/g) || [];
        const rootFooterMatches = rootHtml.match(/<footer/g) || [];

        // 2. Sub-page /features/match render with App.jsx routing structure
        const subVdom = (
          <Provider store={store}>
            <MemoryRouter initialEntries={["/features/match"]}>
              <Routes>
                <Route element={<LandingShell />}>
                  <Route path="/features/match" element={<FeaturesMatchPage />} />
                </Route>
              </Routes>
            </MemoryRouter>
          </Provider>
        );
        const subHtml = renderToString(subVdom);
        const subNavMatches = subHtml.match(/<nav/g) || [];
        const subFooterMatches = subHtml.match(/<footer/g) || [];

        console.log(JSON.stringify({
          rootNavCount: rootNavMatches.length,
          rootFooterCount: rootFooterMatches.length,
          subNavCount: subNavMatches.length,
          subFooterCount: subFooterMatches.length,
        }));
      `;

      const res = esbuild.buildSync({
        stdin: { contents: script, resolveDir: FRONTEND_DIR, loader: "jsx" },
        bundle: true,
        format: "esm",
        platform: "node",
        write: false,
        external: ["react", "react-dom", "react-router-dom", "react-redux", "@reduxjs/toolkit", "lucide-react", "framer-motion"],
      });

      const tempFile = path.join(FRONTEND_DIR, "test_nesting_tmp.mjs");
      fs.writeFileSync(tempFile, res.outputFiles[0].text);

      const { stdout } = await import("node:child_process").then((cp) => ({
        stdout: cp.execSync(`node ${tempFile}`).toString(),
      }));
      fs.unlinkSync(tempFile);

      const counts = JSON.parse(stdout.trim());

      // On sub-pages, exactly 1 navbar and 1 footer is rendered
      assert.equal(counts.subNavCount, 1, `Expected 1 navbar on sub-pages, found ${counts.subNavCount}`);
      assert.equal(counts.subFooterCount, 1, `Expected 1 footer on sub-pages, found ${counts.subFooterCount}`);

      // On root /, double nesting occurs because LandingPage has wrapInShell=true by default!
      console.log(`[Adversarial Finding Verified] Root / renders ${counts.rootNavCount} <nav> elements and ${counts.rootFooterCount} <footer> elements in React DOM`);
      assert.equal(counts.rootNavCount, 2, "Confirmed double navbar on root /");
      assert.equal(counts.rootFooterCount, 2, "Confirmed double footer on root /");
    });
  });
});
