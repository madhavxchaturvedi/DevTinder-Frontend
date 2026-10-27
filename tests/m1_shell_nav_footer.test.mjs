import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const FRONTEND_DIR = path.resolve(process.cwd(), "src");
const LANDING_DIR = path.join(FRONTEND_DIR, "components/landing");

const readLanding = (file) => fs.readFileSync(path.join(LANDING_DIR, file), "utf-8");

describe("Milestone 1 — Navigation & Multi-Page Layout Shell", () => {
  const shellSrc = readLanding("LandingShell.jsx");
  const navSrc = readLanding("LandingNav.jsx");
  const footerSrc = readLanding("LandingFooter.jsx");

  const files = [
    { name: "LandingShell.jsx", src: shellSrc },
    { name: "LandingNav.jsx", src: navSrc },
    { name: "LandingFooter.jsx", src: footerSrc },
  ];

  it("Invariant: Exactly zero <h1> elements across M1 components", () => {
    for (const { name, src } of files) {
      assert.ok(!src.includes("<h1"), `${name} must not contain any <h1> tags`);
    }
  });

  it("Invariant: Exactly zero emojis across M1 components", () => {
    const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;
    for (const { name, src } of files) {
      assert.ok(!emojiRegex.test(src), `${name} must not contain emoji characters`);
    }
  });

  it("Invariant: Exactly zero Redux dependencies in M1 components", () => {
    for (const { name, src } of files) {
      assert.ok(!src.includes("useSelector"), `${name} must not use useSelector`);
      assert.ok(!src.includes("useDispatch"), `${name} must not use useDispatch`);
      assert.ok(!src.includes("react-redux"), `${name} must not import from react-redux`);
    }
  });

  it("Invariant: Zero forbidden route links (/discover, /sandbox, /profile/:id)", () => {
    for (const { name, src } of files) {
      assert.ok(!src.includes('"/discover"'), `${name} must not link to /discover`);
      assert.ok(!src.includes('"/sandbox"'), `${name} must not link to /sandbox`);
      assert.ok(!src.includes('"/profile/'), `${name} must not link to /profile/:id`);
    }
  });

  describe("LandingShell.jsx Specification", () => {
    it("wraps LandingNav, Outlet/children, and LandingFooter", () => {
      assert.ok(shellSrc.includes("<LandingNav"), "LandingShell must render LandingNav");
      assert.ok(shellSrc.includes("<LandingFooter"), "LandingShell must render LandingFooter");
      assert.ok(shellSrc.includes("<Outlet />") || shellSrc.includes("<Outlet"), "LandingShell must render Outlet");
      assert.ok(shellSrc.includes("children"), "LandingShell must support children prop");
    });

    it("restores scroll position to (0, 0) on pathname change", () => {
      assert.ok(shellSrc.includes("useLocation"), "LandingShell must use useLocation");
      assert.ok(shellSrc.includes("window.scrollTo"), "LandingShell must invoke window.scrollTo");
      assert.ok(shellSrc.includes("top: 0"), "LandingShell must scroll to top: 0");
      assert.ok(shellSrc.includes("pathname"), "LandingShell must trigger on pathname changes");
    });

    it("applies dark void theme and overflow containment classes", () => {
      assert.ok(shellSrc.includes("bg-[#09090b]"), "LandingShell must use bg-[#09090b]");
      assert.ok(shellSrc.includes("text-[#f0f0f0]"), "LandingShell must use text-[#f0f0f0]");
      assert.ok(shellSrc.includes("selection:bg-[#ccff00]"), "LandingShell must style selection");
      assert.ok(shellSrc.includes("overflow-x-hidden"), "LandingShell must enforce overflow-x-hidden");
    });
  });

  describe("LandingNav.jsx Specification", () => {
    it("defines 4 rich feature dropdown cards with canonical paths and accents", () => {
      assert.ok(navSrc.includes("/features/match"), "Must link to /features/match");
      assert.ok(navSrc.includes("/features/collab"), "Must link to /features/collab");
      assert.ok(navSrc.includes("/features/feed"), "Must link to /features/feed");
      assert.ok(navSrc.includes("/features/projects"), "Must link to /features/projects");

      assert.ok(navSrc.includes("Swipe & Match"), "Must include 'Swipe & Match'");
      assert.ok(navSrc.includes("Live Room"), "Must include 'Live Room'");
      assert.ok(navSrc.includes("Developer Feed"), "Must include 'Developer Feed'");
      assert.ok(navSrc.includes("Open Projects"), "Must include 'Open Projects'");

      assert.ok(navSrc.includes("Sparkles"), "Must use Sparkles icon");
      assert.ok(navSrc.includes("Terminal"), "Must use Terminal icon");
      assert.ok(navSrc.includes("Code2"), "Must use Code2 icon");
      assert.ok(navSrc.includes("FolderGit2"), "Must use FolderGit2 icon");

      assert.ok(navSrc.includes("#b266ff"), "Must include purple accent #b266ff");
      assert.ok(navSrc.includes("#ccff00"), "Must include lime accent #ccff00");
    });

    it("supports dropdown toggle, click-outside and Escape key dismissal", () => {
      assert.ok(navSrc.includes("aria-haspopup"), "Features button must have aria-haspopup");
      assert.ok(navSrc.includes("aria-expanded"), "Features button must have aria-expanded");
      assert.ok(navSrc.includes("Escape"), "Must dismiss dropdown on Escape key");
      assert.ok(navSrc.includes("mousedown") || navSrc.includes("pointerdown"), "Must listen for outside clicks");
      assert.ok(navSrc.includes("startsWith(\"/features\")"), "Must indicate active state for /features routes");
    });

    it("renders direct top-level links to Pricing and Community", () => {
      assert.ok(navSrc.includes('to="/pricing"'), "Must have direct link to /pricing");
      assert.ok(navSrc.includes('to="/community"'), "Must have direct link to /community");
    });

    it("renders responsive mobile drawer for < 768px viewports", () => {
      assert.ok(navSrc.includes("md:hidden"), "Mobile drawer must be md:hidden");
      assert.ok(navSrc.includes("mobileMenuOpen"), "Must maintain mobileMenuOpen state");
      assert.ok(navSrc.includes("Menu"), "Must import Menu icon from lucide-react");
      assert.ok(navSrc.includes("X"), "Must import X icon from lucide-react");
    });

    it("renders brand logo linking to root /", () => {
      assert.ok(navSrc.includes("<OctoPairLogo"), "Must render unboxed OctoPairLogo");
      assert.ok(navSrc.includes('to="/"'), "Brand logo must link to /");
      assert.ok(navSrc.includes("OctoPair"), "Must include 'OctoPair' text");
    });

    it("renders Sign In and Start Pairing CTAs", () => {
      assert.ok(navSrc.includes('to="/login"'), "Must link to /login for Sign In");
      assert.ok(navSrc.includes('to="/login?mode=signup"'), "Must link to /login?mode=signup for Start Pairing");
      assert.ok(navSrc.includes("Start Pairing"), "Must label button 'Start Pairing'");
    });
  });

  describe("LandingFooter.jsx Specification", () => {
    it("renders all canonical product routes", () => {
      assert.ok(footerSrc.includes('to="/features/match"'), "Footer must link to /features/match");
      assert.ok(footerSrc.includes('to="/features/collab"'), "Footer must link to /features/collab");
      assert.ok(footerSrc.includes('to="/features/feed"'), "Footer must link to /features/feed");
      assert.ok(footerSrc.includes('to="/features/projects"'), "Footer must link to /features/projects");
      assert.ok(footerSrc.includes('to="/pricing"'), "Footer must link to /pricing");
      assert.ok(footerSrc.includes('to="/pricing#faq"'), "Footer must link to /pricing#faq");
      assert.ok(footerSrc.includes('to="/community"'), "Footer must link to /community");
    });

    it("renders legal and auth links", () => {
      assert.ok(footerSrc.includes('to="/privacy"'), "Footer must link to /privacy");
      assert.ok(footerSrc.includes('to="/terms"'), "Footer must link to /terms");
      assert.ok(footerSrc.includes('to="/login"'), "Footer must link to /login");
      assert.ok(footerSrc.includes('to="/login?mode=signup"'), "Footer must link to /login?mode=signup");
      assert.ok(footerSrc.includes("Start Pairing"), "Must include 'Start Pairing'");
    });

    it("retains external socials and brand logo", () => {
      assert.ok(footerSrc.includes("https://github.com"), "Footer must retain GitHub link");
      assert.ok(footerSrc.includes("https://x.com"), "Footer must retain X link");
      assert.ok(footerSrc.includes("https://discord.com"), "Footer must retain Discord link");
      assert.ok(footerSrc.includes("<OctoPairLogo"), "Footer must retain OctoPairLogo");
    });

    it("retains giant clipped <OctoPair /> code tag and drifting cursors", () => {
      assert.ok(footerSrc.includes("&lt;OctoPair /&gt;"), "Footer must retain clipped code text");
      assert.ok(footerSrc.includes("Alex"), "Footer must retain Alex cursor");
      assert.ok(footerSrc.includes("Elena"), "Footer must retain Elena cursor");
      assert.ok(footerSrc.includes("translate-y-[20%]"), "Footer must retain 20% vertical clip");
    });
  });
});
