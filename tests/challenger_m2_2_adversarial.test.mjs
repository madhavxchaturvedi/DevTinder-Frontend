import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import React from "react";
import { renderToString } from "react-dom/server";

const FRONTEND_DIR = path.resolve(import.meta.dirname, "..");
const MARKETING_DIR = path.join(FRONTEND_DIR, "src/pages/marketing");

const SUBPAGE_FILES = [
  "FeaturesMatchPage.jsx",
  "FeaturesCollabPage.jsx",
  "FeaturesFeedPage.jsx",
  "FeaturesProjectsPage.jsx",
  "PricingDestinationPage.jsx",
  "CommunityDestinationPage.jsx",
];

/**
 * Universal component compiler using esbuild transform
 */
function compileComponent(filePath, extraRequire = {}, codeTransform = null) {
  let code = fs.readFileSync(filePath, "utf8");
  if (codeTransform) {
    code = codeTransform(code);
  }
  const transformed = esbuild.transformSync(code, { loader: "jsx", format: "cjs" });
  const fakeModule = { exports: {} };
  const fn = new Function("require", "exports", "module", transformed.code);
  const fakeRequire = (name) => {
    if (name === "react") return React;
    if (name === "react-router-dom") {
      return {
        __esModule: true,
        Link: ({ children, to, ...props }) => React.createElement("a", { href: to, ...props }, children),
        Navigate: () => null,
      };
    }
    if (name === "lucide-react") {
      return new Proxy({}, {
        get: (_, prop) => {
          if (prop === "__esModule") return true;
          return (props) => React.createElement("svg", { "data-icon": prop, ...props });
        },
      });
    }
    if (name === "framer-motion") {
      return {
        __esModule: true,
        motion: new Proxy({}, {
          get: (_, tag) => ({ children, ...props }) => React.createElement(tag, props, children),
        }),
        AnimatePresence: ({ children }) => children,
      };
    }
    // Stub landing components if imported by marketing pages
    if (name.includes("../../components/landing/")) {
      const compName = path.basename(name, path.extname(name));
      const comp = (props) => React.createElement("div", { "data-component": compName, ...props });
      return {
        __esModule: true,
        default: comp,
      };
    }
    if (extraRequire[name]) return extraRequire[name];
    return { __esModule: true };
  };
  fn(fakeRequire, fakeModule.exports, fakeModule);
  return fakeModule.exports.default || fakeModule.exports;
}

describe("challenger_m2_2: Adversarial Stress Test Suite for M2 Sub-Pages", () => {
  const pageContents = Object.fromEntries(
    SUBPAGE_FILES.map((f) => [f, fs.readFileSync(path.join(MARKETING_DIR, f), "utf8")])
  );
  const indexContent = fs.readFileSync(path.join(MARKETING_DIR, "index.js"), "utf8");

  // ---------------------------------------------------------------------------
  // SUITE 1: Objective 1 — Fallback State Rendering & Boundary Telemetry
  // ---------------------------------------------------------------------------
  describe("Suite 1: Fallback State Rendering & Telemetry Logic", () => {
    describe("FeaturesProjectsPage (/features/projects)", () => {
      const src = pageContents["FeaturesProjectsPage.jsx"];

      it("contains robust checkShowcase logic handling empty arrays, nested data, and errors", () => {
        assert.ok(src.includes("fetch(\"/public/showcase\")"), "Must query /public/showcase");
        assert.ok(src.includes("setApiHasProjects(list.length > 0)"), "Must set apiHasProjects based on list length");
        assert.ok(src.includes("catch"), "Must catch network errors");
        assert.ok(src.includes("setApiHasProjects(false)"), "Must set apiHasProjects to false on error");
      });

      it("verifies all 6 realistic fallback showcase projects with complete engineering metadata", () => {
        assert.ok(src.includes("FALLBACK_SHOWCASE_PROJECTS"), "Must define FALLBACK_SHOWCASE_PROJECTS");
        assert.ok(src.includes("OctoMesh: WebRTC P2P Data Mesh"), "Must contain OctoMesh WebRTC mesh project");
        assert.ok(src.includes("HyperGraph: Visual AST Query Engine"), "Must contain HyperGraph AST engine");
        assert.ok(src.includes("KubePulse: Ephemeral Container Observability"), "Must contain KubePulse project");
        assert.ok(src.includes("VectorLens: Embedded HNSW Vector Index"), "Must contain VectorLens HNSW index");
        assert.ok(src.includes("AuthShield: Zero-Knowledge WebAuthn Provider"), "Must contain AuthShield project");
        assert.ok(src.includes("DiffSync: Visual Git Tree Conflict Resolver"), "Must contain DiffSync project");
      });

      it("verifies fallback project cards have required attributes: stage, commitment, roleNeeded, techStack, and pair CTA", () => {
        const ForcedFallbackComponent = compileComponent(
          path.join(MARKETING_DIR, "FeaturesProjectsPage.jsx"),
          {},
          (c) => c.replace("useState(null)", "useState(false)")
        );

        const html = renderToString(React.createElement(ForcedFallbackComponent));

        assert.ok(html.includes("Featured Open"), "Fallback section must render 'Featured Open Sprints' heading");
        assert.ok(html.includes("OctoMesh: WebRTC P2P Data Mesh"), "Must render OctoMesh card");
        assert.ok(html.includes("HyperGraph: Visual AST Query Engine"), "Must render HyperGraph card");
        assert.ok(html.includes("KubePulse: Ephemeral Container Observability"), "Must render KubePulse card");
        assert.ok(html.includes("VectorLens: Embedded HNSW Vector Index"), "Must render VectorLens card");
        assert.ok(html.includes("AuthShield: Zero-Knowledge WebAuthn Provider"), "Must render AuthShield card");
        assert.ok(html.includes("DiffSync: Visual Git Tree Conflict Resolver"), "Must render DiffSync card");
        assert.ok(html.includes("Pair on this"), "Must render 'Pair on this' CTA buttons");
        assert.ok(html.includes("/login?redirect=project"), "CTA buttons must link to /login?redirect=project");
      });

      it("verifies fallback showcase is suppressed when API returns active projects", () => {
        const ForcedSuccessComponent = compileComponent(
          path.join(MARKETING_DIR, "FeaturesProjectsPage.jsx"),
          {},
          (c) => c.replace("useState(null)", "useState(true)")
        );

        const html = renderToString(React.createElement(ForcedSuccessComponent));
        assert.ok(!html.includes("Featured Open"), "Fallback section must NOT render when apiHasProjects === true");
        assert.ok(!html.includes("OctoMesh: WebRTC P2P Data Mesh"), "Fallback cards must NOT duplicate when live API succeeds");
      });
    });

    describe("CommunityDestinationPage (/community)", () => {
      const src = pageContents["CommunityDestinationPage.jsx"];

      it("contains robust checkStats logic verifying developers threshold >= 25", () => {
        assert.ok(src.includes("fetch(\"/public/stats\")"), "Must query /public/stats");
        assert.ok(src.includes("Number(data?.developers ?? 0)"), "Must safely coerce developer count to number");
        assert.ok(src.includes("setStatsAvailable(count >= 25)"), "Must check count >= 25 threshold");
        assert.ok(src.includes("catch"), "Must catch network errors");
        assert.ok(src.includes("setStatsAvailable(false)"), "Must set statsAvailable to false on error");
      });

      it("verifies fallback telemetry stats structure and metric labels", () => {
        assert.ok(src.includes("FALLBACK_TELEMETRY_STATS"), "Must define FALLBACK_TELEMETRY_STATS");
        assert.ok(src.includes("\"1,420+\""), "Must define 1,420+ Developers");
        assert.ok(src.includes("\"380+\""), "Must define 380+ Open Projects");
        assert.ok(src.includes("\"2,850+\""), "Must define 2,850+ Completed Rooms");
      });

      it("renders fallback telemetry cards when statsAvailable is false", () => {
        const ForcedFallbackComponent = compileComponent(
          path.join(MARKETING_DIR, "CommunityDestinationPage.jsx"),
          {},
          (c) => c.replace("useState(null)", "useState(false)")
        );

        const html = renderToString(React.createElement(ForcedFallbackComponent));
        assert.ok(html.includes("Network Telemetry Snapshot"), "Must render Network Telemetry Snapshot banner");
        assert.ok(html.includes("1,420+"), "Must render 1,420+ metric");
        assert.ok(html.includes("380+"), "Must render 380+ metric");
        assert.ok(html.includes("2,850+"), "Must render 2,850+ metric");
      });

      it("suppresses fallback telemetry cards when statsAvailable is true", () => {
        const ForcedSuccessComponent = compileComponent(
          path.join(MARKETING_DIR, "CommunityDestinationPage.jsx"),
          {},
          (c) => c.replace("useState(null)", "useState(true)")
        );

        const html = renderToString(React.createElement(ForcedSuccessComponent));
        assert.ok(!html.includes("Network Telemetry Snapshot"), "Must NOT render fallback banner when live stats available");
        assert.ok(!html.includes("1,420+"), "Must NOT render fallback 1,420+ count when live stats available");
      });

      it("unconditionally renders 3 network architecture highlight cards", () => {
        const component = compileComponent(path.join(MARKETING_DIR, "CommunityDestinationPage.jsx"));
        const html = renderToString(React.createElement(component));

        assert.ok(html.includes("Sub-50ms Global P2P Mesh"), "Must render Sub-50ms Global P2P Mesh card");
        assert.ok(html.includes("Verified Proof of Work"), "Must render Verified Proof of Work card");
        assert.ok(html.includes("24/7 Builder Timezones"), "Must render 24/7 Builder Timezones card");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // SUITE 2: Objective 2 — Server-Side Rendering (SSR) Prerender Compatibility
  // ---------------------------------------------------------------------------
  describe("Suite 2: SSR & Build-time Prerender Compatibility", () => {
    for (const filename of SUBPAGE_FILES) {
      it(`renders ${filename} to string without window/document/navigator crashes in SSR`, () => {
        const filePath = path.join(MARKETING_DIR, filename);
        const Component = compileComponent(filePath);

        let html = "";
        assert.doesNotThrow(() => {
          html = renderToString(React.createElement(Component));
        }, `SSR rendering of ${filename} must not throw ReferenceError or render crashes`);

        assert.ok(html.length > 200, `${filename} SSR output must not be empty (was ${html.length} chars)`);
        assert.ok(html.includes("<h2"), `${filename} must contain semantic <h2> in SSR output`);
        assert.ok(html.includes("Back to Overview"), `${filename} must contain breadcrumb link in SSR output`);
        assert.ok(!html.includes("undefined"), `${filename} must not leak 'undefined' into SSR output`);
        assert.ok(!html.includes("NaN"), `${filename} must not leak 'NaN' into SSR output`);
      });
    }

    it("verifies zero window or document references outside useEffect across all subpages", () => {
      for (const [filename, src] of Object.entries(pageContents)) {
        assert.ok(!src.includes("window."), `${filename} must not reference window directly`);
        assert.ok(!src.includes("document."), `${filename} must not reference document directly`);
        assert.ok(!src.includes("localStorage"), `${filename} must not reference localStorage`);
        assert.ok(!src.includes("sessionStorage"), `${filename} must not reference sessionStorage`);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // SUITE 3: Objective 3 — Layout Integrity & Responsive Dimensions
  // ---------------------------------------------------------------------------
  describe("Suite 3: Layout Integrity & Responsive Dimensions", () => {
    it("enforces w-full and overflow-x-hidden on root wrapper of every subpage", () => {
      for (const [filename, src] of Object.entries(pageContents)) {
        assert.ok(
          src.includes("overflow-x-hidden"),
          `${filename} root container must enforce overflow-x-hidden to prevent 375px mobile horizontal scroll`
        );
        assert.ok(
          src.includes("w-full"),
          `${filename} root container must enforce w-full`
        );
        assert.ok(
          src.includes("bg-[#09090b]"),
          `${filename} root container must enforce void dark background #09090b`
        );
      }
    });

    it("enforces max-width constraints (max-w-7xl, max-w-5xl) and centered auto margins on all sections", () => {
      for (const [filename, src] of Object.entries(pageContents)) {
        assert.ok(
          src.includes("max-w-7xl mx-auto") || src.includes("max-w-6xl mx-auto") || src.includes("max-w-5xl mx-auto"),
          `${filename} must use responsive max-width centered container`
        );
        assert.ok(
          src.includes("px-4 sm:px-6 lg:px-8"),
          `${filename} hero section must use standard responsive padding (px-4 sm:px-6 lg:px-8)`
        );
      }
    });

    it("enforces mobile-responsive CTA sizing (w-full sm:w-auto) on hero buttons", () => {
      for (const [filename, src] of Object.entries(pageContents)) {
        assert.ok(
          src.includes("w-full sm:w-auto"),
          `${filename} must size CTA buttons to full width on mobile viewports (w-full sm:w-auto)`
        );
      }
    });

    it("enforces responsive multi-column grid layouts with mobile single-column fallback", () => {
      // FeaturesProjectsPage and CommunityDestinationPage define grid cards
      const projSrc = pageContents["FeaturesProjectsPage.jsx"];
      assert.ok(
        projSrc.includes("grid-cols-1 md:grid-cols-2 lg:grid-cols-3") || projSrc.includes("grid-cols-1 md:grid-cols-3"),
        "FeaturesProjectsPage fallback grid must collapse to 1 column on mobile (grid-cols-1)"
      );

      const commSrc = pageContents["CommunityDestinationPage.jsx"];
      assert.ok(
        commSrc.includes("grid-cols-1 md:grid-cols-3"),
        "CommunityDestinationPage grids must collapse to 1 column on mobile (grid-cols-1 md:grid-cols-3)"
      );
    });

    it("verifies ambient glow divs have max-w-full to prevent horizontal blowout", () => {
      for (const [filename, src] of Object.entries(pageContents)) {
        if (src.includes("blur-[130px]")) {
          assert.ok(
            src.includes("max-w-full"),
            `${filename} ambient glow div must include max-w-full`
          );
        }
      }
    });
  });

  // ---------------------------------------------------------------------------
  // SUITE 4: Critical Invariants & Security
  // ---------------------------------------------------------------------------
  describe("Suite 4: Critical Invariants & Security Checks", () => {
    it("Invariant: Exactly zero <h1> elements across all 6 marketing subpages (single <h1> preserved for root /)", () => {
      for (const [filename, src] of Object.entries(pageContents)) {
        assert.ok(!src.includes("<h1"), `${filename} must NOT contain <h1> tags; hero titles must be <h2>`);
      }
    });

    it("Invariant: Exactly zero emoji unicode characters across all subpages", () => {
      const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;
      for (const [filename, src] of Object.entries(pageContents)) {
        assert.ok(!emojiRegex.test(src), `${filename} must NOT contain emoji characters`);
      }
    });

    it("Invariant: Exactly zero Redux dependencies across all subpages", () => {
      for (const [filename, src] of Object.entries(pageContents)) {
        assert.ok(!src.includes("useSelector"), `${filename} must not use useSelector`);
        assert.ok(!src.includes("useDispatch"), `${filename} must not use useDispatch`);
        assert.ok(!src.includes("react-redux"), `${filename} must not import react-redux`);
      }
    });

    it("Invariant: Zero forbidden route links (/discover, /sandbox, /profile/:id)", () => {
      for (const [filename, src] of Object.entries(pageContents)) {
        assert.ok(!src.includes('"/discover"'), `${filename} must not link to /discover`);
        assert.ok(!src.includes("'/discover'"), `${filename} must not link to /discover`);
        assert.ok(!src.includes('"/sandbox"'), `${filename} must not link to /sandbox`);
        assert.ok(!src.includes("'/sandbox'"), `${filename} must not link to /sandbox`);
        assert.ok(!src.includes('"/profile/'), `${filename} must not link to /profile/:id`);
        assert.ok(!src.includes("'/profile/"), `${filename} must not link to /profile/:id`);
      }
    });

    it("Invariant: All marketing action CTAs route strictly to /login", () => {
      for (const [filename, src] of Object.entries(pageContents)) {
        assert.ok(src.includes('to="/login'), `${filename} must route conversion CTAs to /login`);
      }
    });

    it("Chained Tour Continuity: all 6 marketing pages form a closed tour loop", () => {
      assert.ok(pageContents["FeaturesMatchPage.jsx"].includes('to="/features/collab"'), "Match -> Collab");
      assert.ok(pageContents["FeaturesCollabPage.jsx"].includes('to="/features/feed"'), "Collab -> Feed");
      assert.ok(pageContents["FeaturesFeedPage.jsx"].includes('to="/features/projects"'), "Feed -> Projects");
      assert.ok(pageContents["FeaturesProjectsPage.jsx"].includes('to="/pricing"'), "Projects -> Pricing");
      assert.ok(pageContents["PricingDestinationPage.jsx"].includes('to="/community"'), "Pricing -> Community");
      assert.ok(pageContents["CommunityDestinationPage.jsx"].includes('to="/features/match"'), "Community -> Match");
    });

    it("Clean exports in index.js for both named and default exports", () => {
      for (const filename of SUBPAGE_FILES) {
        const componentName = path.basename(filename, ".jsx");
        assert.ok(
          indexContent.includes(`export { default as ${componentName} } from "./${componentName}";`),
          `index.js must export ${componentName}`
        );
        assert.ok(
          indexContent.includes(`${componentName}: () => import("./${componentName}")`),
          `index.js default export must include lazy importer for ${componentName}`
        );
      }
    });
  });
});
