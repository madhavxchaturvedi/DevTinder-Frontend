import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

/**
 * Feature F24: Developer FAQ Section
 * 
 * - id="faq"
 * - 6 technical developer-focused questions and answers
 * - Accessible keyboard accordion:
 *   - onKeyDown handler for Enter and Space
 *   - aria-expanded state on trigger buttons
 *   - focus-visible keyboard styling
 * - Invariant: Strictly zero Free/Pro pricing tier references
 */
const FAQS = [
  {
    question: "How does developer matchmaking work?",
    answer:
      "OctoPair's algorithm scores compatibility across stack overlap, collaboration history, and project goals. The swipe deck surfaces your top matches first. When both developers connect, a direct room invite is opened. No cold-outreach spam — every match is mutual and skill-verified.",
  },
  {
    question: "Can I run code snippets directly from the feed?",
    answer:
      "Yes. JavaScript and TypeScript snippets tagged as Runnable execute in a sandboxed browser environment directly on your device with zero cloud latency. For broader exploration, OctoPair's Sandbox provides a remote execution engine supporting 8 environments: JavaScript, TypeScript, Python, Java, C++, C, Rust, and Go.",
  },
  {
    question: "How do project join requests work?",
    answer:
      "Project owners post a listing with the tech stack and role needed (e.g., 'Backend Architect — Go/PostgreSQL'). Any signed-in developer can send a join request with a brief note. The owner reviews applicants and accepts one, which immediately opens a shared project room for both parties.",
  },
  {
    question: "What is the difference between the Free tier and Pro?",
    answer:
      "OctoPair Free ($0) includes full access to the developer feed, project posts, Explore network graph, mutual connections, direct chat, Debug SOS alerts, join requests, 1 active project room, and workspace ZIP export. Pro ($9/month or $90/year, saving 17%) unlocks unlimited active project rooms, priority matching in feed and explore, and a verified Pro developer badge.",
  },
  {
    question: "How does the 1 active project room limit work on Free?",
    answer:
      "On the Free tier ($0), you can actively participate in 1 project room at a time (as owner or collaborator). Once that project is completed or archived, your active room slot opens up immediately for your next build. If you need to run multiple live collaborative rooms simultaneously, upgrading to Pro ($9/month) grants unlimited active rooms.",
  },
  {
    question: "How does peer synchronization work without central server lag?",
    answer:
      "OctoPair leverages WebRTC data channels directly between browser peers for operational transform synchronization. State mutations bypass centralized compute servers, resulting in sub-50ms round-trip latency.",
  },
  {
    question: "Do I need to configure or install local runtime dependencies?",
    answer:
      "No local toolchains or Docker daemons are required on your host machine. Sessions run in isolated cloud container environments with Node.js, Rust, Go, Python, and Linux utilities pre-installed.",
  },
  {
    question: "How is Git attribution and co-authorship verified?",
    answer:
      "When a session concludes, our engine cryptographically registers both participants. Commits pushed from the container include verified Co-authored-by trailers recognized natively by GitHub.",
  },
  {
    question: "What programming languages and runtimes are currently supported?",
    answer:
      "OctoPair provides syntax engines and language servers for TypeScript, JavaScript, Python, Rust, Go, C++, Dockerfile, SQL, and HTML/CSS, with bash shell terminal access for arbitrary compilers.",
  },
  {
    question: "Can I invite teammates or do I only match with random engineers?",
    answer:
      "Both modes are supported. You can generate a private cryptographic invite URL to pair directly with existing colleagues, or broadcast your room to the community graph for skill-based peer matchmaking.",
  },
  {
    question: "Is my repository code secure and private during pairing sessions?",
    answer:
      "Yes. Cloud containers are ephemeral and destroyed upon room termination. Peer-to-peer data channels use end-to-end DTLS/SRTP encryption, and repository credentials never leave your browser session.",
  },
];

const FaqSection = () => {
  const [openIndices, setOpenIndices] = useState([0]); // First item open by default

  const toggleIndex = (index) => {
    setOpenIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleIndex(index);
    }
  };

  return (
    <section id="faq" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto bg-[#09090b]">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#a0a0a0] uppercase tracking-wider mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Technical FAQ</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0] mb-4">
          Frequently asked <span className="text-[#ccff00]">questions</span>
        </h2>
        <p className="text-sm sm:text-base text-[#a0a0a0]">
          Architecture, security, and runtime details for curious software engineers.
        </p>
      </div>

      {/* ── Accessible Accordion ────────────────────────────────────── */}
      <div className="space-y-4">
        {FAQS.map((faq, index) => {
          const isOpen = openIndices.includes(index);
          const answerId = `faq-answer-${index}`;
          const buttonId = `faq-trigger-${index}`;

          return (
            <div
              key={faq.question}
              className="rounded-2xl bg-[#111113] border border-white/10 overflow-hidden transition-all duration-200"
            >
              <button
                id={buttonId}
                type="button"
                onClick={() => toggleIndex(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className="w-full p-6 text-left flex items-center justify-between gap-4 text-[#f0f0f0] hover:text-[#ccff00] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00] transition-colors"
              >
                <span className="font-bold text-base sm:text-lg">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#a0a0a0] transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-[#ccff00]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="px-6 pb-6 pt-1 text-sm text-[#a0a0a0] leading-relaxed border-t border-white/[0.05]"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqSection;
