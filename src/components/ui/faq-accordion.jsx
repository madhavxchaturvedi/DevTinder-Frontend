"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_ITEMS = [
  {
    question: "How does developer matchmaking work?",
    answer:
      "DevTinder matches builders based on verified GitHub proof of work, complementary tech stack overlap (e.g. Frontend specialist seeking a Systems/Backend architect), and active project pitches. No resume fluff or recruiter spam — every connection is direct and technical.",
  },
  {
    question: "How do in-browser pairing rooms work?",
    answer:
      "Every room spins up an instant Monaco code editor with real-time peer-to-peer cursor synchronization, integrated WebRTC audio channels, and sandboxed in-browser execution. Zero local toolchains, Docker daemons, or environment configuration required.",
  },
  {
    question: "Can I connect and collaborate on my existing GitHub repos?",
    answer:
      "Yes. You can import any GitHub repository directly into a live room, edit buffers concurrently, run tests in the browser, and stage commits with automated Co-authored-by git attribution trailers.",
  },
  {
    question: "What is the difference between Starter (Free) and Pro?",
    answer:
      "Starter is $0 forever and includes full access to the developer feed, project posts, mutual connections, direct chat, Debug SOS alerts, and 1 active project room. Pro is $9/month and grants unlimited concurrent rooms, priority matching, and a verified developer badge.",
  },
  {
    question: "What programming languages and stacks are supported?",
    answer:
      "DevTinder provides built-in language servers, linting, and syntax engines for TypeScript, JavaScript, Python, Rust, Go, C++, React, Next.js, Docker, WebAssembly, and SQL.",
  },
  {
    question: "Can I pause my rooms when I am busy with my day job?",
    answer:
      "Absolutely. Side project building is flexible. You can pause any active pairing room at any time and resume right where you and your co-builder left off whenever your next sprint is ready.",
  },
];

export function FaqAccordion({
  items = DEFAULT_ITEMS,
  title = "Frequently Asked Questions",
  className,
  ...props
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleItem = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div
      id="faq"
      className={cn("w-full max-w-3xl mx-auto py-16 px-4 relative font-sans", className)}
      {...props}
    >
      {title && (
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#ccff00]">
            Everything You Need To Know
          </span>
          <h2 className="font-bold text-3xl sm:text-4xl text-white tracking-tight">
            {title}
          </h2>
        </div>
      )}

      <ul className="w-full mx-auto list-none p-0 flex flex-col border border-white/[0.08] rounded-2xl overflow-hidden bg-[#0c0c0e]/95 backdrop-blur-2xl shadow-2xl">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={index}
              className={cn(
                "w-full relative transition-all duration-300 ease-in",
                "border-b border-white/[0.08]",
                "last:border-b-0",
                isActive ? "border-b border-white/[0.15]" : ""
              )}
            >
              <button
                className={cn(
                  "flex flex-row items-center justify-start w-full min-h-[64px] py-4 relative m-0 px-4 pl-14 cursor-pointer",
                  "border-l-[6px] md:border-l-[10px] transition-colors duration-200 text-left outline-none text-base md:text-lg",
                  isActive
                    ? "border-l-[#ccff00] bg-white/[0.04] text-white font-semibold"
                    : "border-l-neutral-800 bg-transparent text-neutral-400 hover:border-l-neutral-600 hover:text-neutral-200 hover:bg-white/[0.02]"
                )}
                onClick={() => toggleItem(index)}
                aria-expanded={isActive}
              >
                {/* Plus/Minus Icon */}
                <span
                  className={cn(
                    "absolute left-4 md:left-5 top-1/2 -translate-y-1/2 transition-all duration-200 leading-none select-none",
                    isActive
                      ? "text-[32px] md:text-[40px] font-normal text-[#ccff00]"
                      : "text-[24px] md:text-[30px] font-normal text-neutral-500"
                  )}
                >
                  {isActive ? "−" : "+"}
                </span>

                <span className="pr-8 tracking-tight font-medium">{item.question}</span>

                {/* Chevron */}
                <span
                  className={cn(
                    "absolute right-6 block w-2 h-2 border-t-[2.5px] border-r-[2.5px] transition-transform duration-200 ease-in-out",
                    isActive
                      ? "rotate-[-44deg] border-[#ccff00]"
                      : "rotate-[133deg] border-neutral-500"
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out w-full",
                  "border-l-[6px] md:border-l-[10px]",
                  isActive
                    ? "grid-rows-[1fr] border-l-[#ccff00] bg-white/[0.04]"
                    : "grid-rows-[0fr] border-l-neutral-800 bg-transparent"
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-row items-start justify-start w-full px-4 pl-14 pb-6 pt-2 text-sm sm:text-base font-normal text-neutral-300 leading-relaxed">
                    <span className="opacity-90">{item.answer}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FaqAccordion;
