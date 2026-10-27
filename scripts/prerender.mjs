import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToString } from "react-dom/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Guard and polyfill browser globals for pure Node.js SSR execution
if (typeof globalThis.window === "undefined" || typeof window === "undefined") {
  globalThis.window = {
    location: { pathname: "/", search: "", href: "https://octopair.dev/" },
    matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
    IntersectionObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

if (typeof globalThis.document === "undefined" || typeof document === "undefined") {
  globalThis.document = {
    cookie: "",
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {} }),
  };
}

if (typeof globalThis.matchMedia === "undefined") {
  globalThis.matchMedia = globalThis.window.matchMedia;
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = globalThis.window.IntersectionObserver;
}

/**
 * Route dictionary for multi-route prerendering
 * Covers all 7 marketing paths with tailored SEO titles, meta descriptions, and SSR markup
 */
export const MARKETING_ROUTES = [
  {
    path: "/",
    outputPath: "index.html",
    title: "OctoPair — Collaborative Developer IDE & Pair Programming",
    description: "Pick a project. Pair up. Build it live. Real-time collaborative workspace for software engineers with WebRTC video, audio, and conflict-free code synchronization.",
    eyebrow: "THE MULTIPLAYER IDE FOR BUILDERS",
    headline: "Pick a project. Pair up. Build it live.",
    isRoot: true,
    subhead: "Real-time collaborative workspace for software engineers with WebRTC video, audio, and conflict-free code synchronization.",
    primaryCta: { label: "Start Pairing Free", href: "/login?mode=signup" },
    secondaryCta: { label: "Watch a Session", href: "/features/collab" },
    highlights: ["Sub-50ms Peer Sync", "Curated Project Graph", "Verified Proof of Work"],
  },
  {
    path: "/features/match",
    outputPath: "features/match/index.html",
    title: "Developer Matching & Discovery — OctoPair",
    description: "Algorithmic developer pairing scored by tech stack overlap, proof of work, and real-time compatibility scoring.",
    eyebrow: "SKILL-BASED MATCHMAKING",
    headline: "Developer Discovery & Matchmaking",
    isRoot: false,
    subhead: "Find high-signal collaborators filtered by verified tech stacks, proof of work, and real-time compatibility scoring.",
    primaryCta: { label: "Start Pairing Free", href: "/login?mode=signup" },
    secondaryCta: { label: "Explore Live Collaboration", href: "/features/collab" },
    highlights: ["Tech Stack Filtering", "Mutual Interest Radar", "Proof of Work Verification"],
  },
  {
    path: "/features/collab",
    outputPath: "features/collab/index.html",
    title: "Live Multiplayer Collaboration — OctoPair",
    description: "Sub-50ms multiplayer IDE with WebRTC audio/video mesh, operational transforms, and shared cloud terminals.",
    eyebrow: "REAL-TIME MULTIPLAYER IDE",
    headline: "Sub-50ms Live Collaboration",
    isRoot: false,
    subhead: "Multiplayer IDE with WebRTC operational transforms, shared cloud terminals, and synced previews.",
    primaryCta: { label: "Start Pairing Free", href: "/login?mode=signup" },
    secondaryCta: { label: "Explore Developer Feed", href: "/features/feed" },
    highlights: ["WebRTC P2P Mesh", "Operational Transforms", "Shared Cloud Terminals"],
  },
  {
    path: "/features/feed",
    outputPath: "features/feed/index.html",
    title: "Developer Feed & Interactive Snippets — OctoPair",
    description: "Interactive code snippets, sandboxed runtimes, and real-time Debug SOS radar for software engineers.",
    eyebrow: "SOCIAL CODE FEED",
    headline: "Interactive Code Feed & Debug SOS",
    isRoot: false,
    subhead: "Run real-time code snippets in isolated sandboxes, broadcast urgent architectural Debug SOS requests, and discover peer projects.",
    primaryCta: { label: "Start Pairing Free", href: "/login?mode=signup" },
    secondaryCta: { label: "Explore Open Projects", href: "/features/projects" },
    highlights: ["Sandboxed Iframe Runtimes", "Real-time Debug SOS", "Interactive Code Snippets"],
  },
  {
    path: "/features/projects",
    outputPath: "features/projects/index.html",
    title: "Open Developer Projects & Sprints — OctoPair",
    description: "Curated open-source codebases, project rooms, and collaborative team sprints.",
    eyebrow: "CURATED CODEBASES",
    headline: "Open Developer Projects & Sprints",
    isRoot: false,
    subhead: "Explore open engineering codebases, request to join active sprints, and ship production software in pair-programming workspaces.",
    primaryCta: { label: "Start Pairing Free", href: "/login?mode=signup" },
    secondaryCta: { label: "View Pricing Plans", href: "/pricing" },
    highlights: ["Curated Codebase Graph", "Active Team Sprints", "One-Click Pairing Rooms"],
  },
  {
    path: "/pricing",
    outputPath: "pricing/index.html",
    title: "Transparent Pricing Plans — OctoPair",
    description: "Predictable, transparent plans for individual builders and engineering teams. Free and Pro tiers.",
    eyebrow: "TRANSPARENT PRICING",
    headline: "Simple, Predictable Plans for Developers",
    isRoot: false,
    subhead: "Everything you need to pair program, run cloud terminals, and build software live.",
    primaryCta: { label: "Start Pairing Free", href: "/login?mode=signup" },
    secondaryCta: { label: "Explore Features", href: "/features/match" },
    highlights: ["Hobby Free Tier", "Pro Unlimited Mesh", "Predictable Monthly & Annual Plans"],
  },
  {
    path: "/community",
    outputPath: "community/index.html",
    title: "Global Developer Community & Telemetry — OctoPair",
    description: "Live builder telemetry, global peer-to-peer network metrics, and developer community insights.",
    eyebrow: "BUILDER NETWORK",
    headline: "Global Developer Telemetry & Community",
    isRoot: false,
    subhead: "Join thousands of software engineers pairing across the globe.",
    primaryCta: { label: "Start Pairing Free", href: "/login?mode=signup" },
    secondaryCta: { label: "Start Pairing", href: "/login?mode=signup" },
    highlights: ["Global 24/7 Timezones", "Sub-50ms P2P Mesh", "Verified Proof of Work"],
  },
];

/**
 * Prerendered SSR Shell Component
 * Emits semantic markup conforming to the single <h1> invariant (only on root /)
 */
const RoutePrerenderShell = ({ route }) => {
  return React.createElement(
    "div",
    { className: "w-full min-h-screen bg-[#09090b] text-[#f0f0f0] font-sans selection:bg-[#ccff00] selection:text-black overflow-x-hidden flex flex-col justify-between" },
    
    // Header Navigation
    React.createElement(
      "header",
      { className: "w-full border-b border-white/[0.07] bg-[#09090b]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between" },
      React.createElement(
        "div",
        { className: "flex items-center gap-2" },
        React.createElement("a", { href: "/", className: "font-mono font-bold text-lg text-[#ccff00]" }, "<OctoPair />")
      ),
      React.createElement(
        "nav",
        { className: "hidden md:flex items-center gap-6 text-xs font-mono text-[#a0a0a0]" },
        React.createElement("a", { href: "/features/match", className: "hover:text-white transition-colors" }, "Features"),
        React.createElement("a", { href: "/pricing", className: "hover:text-white transition-colors" }, "Pricing"),
        React.createElement("a", { href: "/community", className: "hover:text-white transition-colors" }, "Community")
      ),
      React.createElement(
        "div",
        { className: "flex items-center gap-3" },
        React.createElement("a", { href: "/login", className: "text-xs font-mono text-[#a0a0a0] px-3 py-2" }, "Sign In"),
        React.createElement("a", { href: "/login?mode=signup", className: "text-xs font-mono font-bold bg-[#ccff00] text-black px-4 py-2 rounded-lg hover:bg-[#d9ff33] transition-all" }, "Start Pairing")
      )
    ),

    // Main Hero & Features Content
    React.createElement(
      "main",
      { className: "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center flex flex-col items-center" },
      
      // Breadcrumb for sub-pages
      !route.isRoot && React.createElement(
        "div",
        { className: "mb-6" },
        React.createElement(
          "a",
          { href: "/", className: "inline-flex items-center gap-2 text-xs font-mono text-[#a0a0a0] hover:text-[#f0f0f0] transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10" },
          "Back to Overview"
        )
      ),

      // Eyebrow Badge
      React.createElement(
        "div",
        { className: "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#111113] text-[#ccff00] text-xs font-mono tracking-wider mb-6 uppercase" },
        route.eyebrow
      ),

      // Semantic Heading (h1 on root, h2 on sub-pages)
      React.createElement(
        route.isRoot ? "h1" : "h2",
        { className: "text-4xl sm:text-6xl font-black tracking-tight text-[#f0f0f0] max-w-4xl leading-tight mb-6" },
        route.headline
      ),

      // Subtitle
      React.createElement(
        "p",
        { className: "text-base sm:text-lg text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed mb-10 font-normal" },
        route.subhead
      ),

      // Action CTAs
      React.createElement(
        "div",
        { className: "flex flex-col sm:flex-row items-center justify-center gap-4 mb-14" },
        React.createElement(
          "a",
          { href: route.primaryCta.href, className: "w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#ccff00] text-black font-mono font-bold hover:bg-[#d9ff33] shadow-[0_0_20px_rgba(204,255,0,0.25)] transition-all" },
          route.primaryCta.label
        ),
        React.createElement(
          "a",
          { href: route.secondaryCta.href, className: "w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#f0f0f0] transition-colors" },
          route.secondaryCta.label
        )
      ),

      // Highlights Grid
      React.createElement(
        "div",
        { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl" },
        ...(route.highlights || []).map((highlight, idx) =>
          React.createElement(
            "div",
            { key: idx, className: "p-4 rounded-xl bg-[#111113] border border-white/10 text-xs font-mono text-[#a0a0a0]" },
            highlight
          )
        )
      )
    ),

    // Footer
    React.createElement(
      "footer",
      { className: "w-full border-t border-white/[0.07] px-6 py-10 text-center flex flex-col items-center gap-3" },
      React.createElement("div", { className: "font-mono text-sm text-[#ccff00]" }, "<OctoPair />"),
      React.createElement("p", { className: "text-xs font-mono text-[#52525b]" }, "Sub-50ms Developer Pairing & Live Collaboration Engine")
    )
  );
};

/**
 * Main Prerender Execution Function
 * Iterates through MARKETING_ROUTES and outputs static HTML for all 7 routes
 */
export async function prerender() {
  const distDir = path.resolve(__dirname, "../dist");
  const distIndexPath = path.resolve(distDir, "index.html");

  if (!fs.existsSync(distIndexPath)) {
    console.log("[prerender] dist/index.html not found, skipping injection (dry run).");
    return;
  }

  // Load the pristine template output from Vite build
  let templateHtml = fs.readFileSync(distIndexPath, "utf-8");

  // Reset any previous root injection if rerun
  if (templateHtml.includes('<div id="root">')) {
    templateHtml = templateHtml.replace(/<div id="root">[\s\S]*?<\/div>/, '<div id="root"></div>');
  }

  console.log(`[prerender] Prerendering ${MARKETING_ROUTES.length} marketing routes...`);

  for (const route of MARKETING_ROUTES) {
    const renderedMarkup = renderToString(React.createElement(RoutePrerenderShell, { route }));
    const targetFile = path.resolve(distDir, route.outputPath);

    let routeHtml = templateHtml;

    // Tailor SEO title
    routeHtml = routeHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${route.title}</title>`);

    // Tailor meta description
    routeHtml = routeHtml.replace(
      /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="description" content="${route.description}" />`
    );

    // Tailor OpenGraph meta tags
    routeHtml = routeHtml.replace(
      /<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta property="og:title" content="${route.title}" />`
    );
    routeHtml = routeHtml.replace(
      /<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta property="og:description" content="${route.description}" />`
    );
    routeHtml = routeHtml.replace(
      /<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta property="og:url" content="https://octopair.dev${route.path === "/" ? "" : route.path}" />`
    );

    // Tailor Twitter meta tags
    routeHtml = routeHtml.replace(
      /<meta\s+name=["']twitter:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="twitter:title" content="${route.title}" />`
    );
    routeHtml = routeHtml.replace(
      /<meta\s+name=["']twitter:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="twitter:description" content="${route.description}" />`
    );

    // Canonical link tag
    const canonicalUrl = `https://octopair.dev${route.path === "/" ? "" : route.path}`;
    if (routeHtml.includes('<link rel="canonical"')) {
      routeHtml = routeHtml.replace(
        /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i,
        `<link rel="canonical" href="${canonicalUrl}" />`
      );
    } else {
      routeHtml = routeHtml.replace(
        /<\/head>/i,
        `    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`
      );
    }

    // Inject rendered SSR markup into #root
    routeHtml = routeHtml.replace('<div id="root"></div>', `<div id="root">${renderedMarkup}</div>`);

    // Ensure directory exists
    const dir = path.dirname(targetFile);
    fs.mkdirSync(dir, { recursive: true });

    // Write file
    fs.writeFileSync(targetFile, routeHtml, "utf-8");
    console.log(`[prerender] Generated ${route.path} -> dist/${route.outputPath}`);
  }

  console.log(`[prerender] Successfully prerendered all ${MARKETING_ROUTES.length} routes.`);
}

// Auto-run if executed as script
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  prerender().catch((err) => {
    console.error("[prerender] Error during build prerender:", err);
    process.exit(1);
  });
}
