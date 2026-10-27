import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    failedTests++;
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

async function run() {
  console.log("=== Starting OctoPairLogo.jsx Empirical Verification ===\n");

  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  const module = await vite.ssrLoadModule("./src/components/brand/OctoPairLogo.jsx");

  // 1. Module Exports
  assert(typeof module.OctoPairLogo === "function", "Named export OctoPairLogo is a function");
  assert(typeof module.default === "function", "Default export is a function");
  assert(module.OctoPairLogo === module.default, "Named and default exports reference the exact same component");

  const Logo = module.OctoPairLogo;

  // 2. Default render without title
  {
    const html = renderToStaticMarkup(React.createElement(Logo));
    console.log("Rendered (no title):", html);

    assert(html.startsWith("<svg"), "Renders an SVG root element");
    assert(html.includes('aria-hidden="true"'), 'Has aria-hidden="true" when title is absent');
    assert(!html.includes('role="img"'), 'Does NOT have role="img" when title is absent');
    assert(!html.includes('aria-label'), 'Does NOT have aria-label when title is absent');
    assert(html.includes('viewBox="3 6 60 60"'), 'Has exact viewBox="3 6 60 60"');
    assert(html.includes('fill="none"'), 'Has fill="none"');
    assert(html.includes('stroke="currentColor"'), 'Has stroke="currentColor"');
    assert(html.includes('stroke-width="6.5"'), 'Has stroke-width="6.5" (or strokeWidth)');
    assert(html.includes('stroke-linecap="round"'), 'Has stroke-linecap="round"');
    assert(html.includes('stroke-linejoin="round"'), 'Has stroke-linejoin="round"');
    assert(html.includes('class="h-7 w-auto"'), 'Has default className="h-7 w-auto"');
    assert(!html.includes("filter"), "Contains no filter attributes");
    assert(!html.includes("drop-shadow"), "Contains no drop-shadow in styles or classes");
    assert(!html.includes("<filter"), "Contains no <filter> child elements");
  }

  // 3. Render with title="OctoPair"
  {
    const html = renderToStaticMarkup(React.createElement(Logo, { title: "OctoPair" }));
    console.log("Rendered (title='OctoPair'):", html);

    assert(html.includes('role="img"'), 'Has role="img" when title="OctoPair"');
    assert(html.includes('aria-label="OctoPair"'), 'Has aria-label="OctoPair" when title="OctoPair"');
    assert(!html.includes('aria-hidden="true"'), 'Does NOT have aria-hidden="true" when title is present');
  }

  // 4. Edge cases with title
  {
    // Empty title
    const htmlEmpty = renderToStaticMarkup(React.createElement(Logo, { title: "" }));
    assert(htmlEmpty.includes('aria-hidden="true"'), 'Empty title="" falls back to aria-hidden="true"');
    assert(!htmlEmpty.includes('role="img"'), 'Empty title="" does not have role="img"');

    // Title with special characters / quotes
    const htmlSpecial = renderToStaticMarkup(React.createElement(Logo, { title: 'OctoPair "Brand" <Test>' }));
    assert(htmlSpecial.includes('role="img"'), 'Title with special characters sets role="img"');
    assert(htmlSpecial.includes('aria-label="OctoPair &quot;Brand&quot; &lt;Test&gt;"'), 'Title special characters properly escaped in aria-label');
  }

  // 5. Custom props & class forwarding
  {
    const htmlCustom = renderToStaticMarkup(React.createElement(Logo, {
      className: "w-12 h-12 text-[#ccff00]",
      id: "header-logo",
      "data-testid": "octopair-logo",
      style: { opacity: 0.9 },
    }));

    assert(htmlCustom.includes('class="w-12 h-12 text-[#ccff00]"'), "Custom className overrides default");
    assert(htmlCustom.includes('id="header-logo"'), "id prop forwarded");
    assert(htmlCustom.includes('data-testid="octopair-logo"'), "data-testid prop forwarded");
    assert(htmlCustom.includes('style="opacity:0.9"'), "style prop forwarded");
  }

  // 6. Geometry precision verification
  {
    const html = renderToStaticMarkup(React.createElement(Logo));
    
    // First circle: cx="24" cy="28" r="14"
    assert(html.includes('<circle cx="24" cy="28" r="14"'), 'Contains circle cx="24" cy="28" r="14"');

    // Arc path: d="M 29.5 19 A 14 14 0 1 1 29.5 37"
    assert(html.includes('d="M 29.5 19 A 14 14 0 1 1 29.5 37"'), 'Contains arc path d="M 29.5 19 A 14 14 0 1 1 29.5 37"');

    // Tentacle path: d="M 40 42 v 5.5 c 0 6 6 10 12 7.5 c 2.5 -1.2 3.2 -4 0 -4.5" stroke-width="6"
    assert(html.includes('d="M 40 42 v 5.5 c 0 6 6 10 12 7.5 c 2.5 -1.2 3.2 -4 0 -4.5"'), 'Contains tentacle path');
    assert(html.includes('stroke-width="6"'), 'Tentacle has stroke-width="6" override');
  }

  await vite.close();

  console.log(`\n=== OctoPairLogo.jsx Results: ${passedTests}/${totalTests} Passed, ${failedTests} Failed ===\n`);
  if (failedTests > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
