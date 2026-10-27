import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, X, MessageSquare, ArrowRight } from "lucide-react";

const LandingMatchModal = ({ dev, onClose }) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!dev) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // 1. Capture previously focused element to restore on close
    const previousActiveElement = document.activeElement;

    // 2. Lock body scroll and save previous overflow style
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 3. Place initial focus on close button (or first focusable element)
    const focusTimeout = setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else {
        const firstFocusable = modalRef.current?.querySelector(
          'button:not([disabled]), a[href]:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    }, 0);

    // 4. Keyboard navigation: Escape key dismissal and focus trap
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), a[href]:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimeout);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previousActiveElement && typeof previousActiveElement.focus === "function") {
        if (document.body.contains(previousActiveElement)) {
          previousActiveElement.focus();
        } else {
          document.getElementById("matching")?.focus?.();
        }
      }
    };
  }, [dev, onClose]);

  if (!dev) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative text-left"
      >
        {/* Dismissal X button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close match dialog"
          className="absolute top-5 right-5 p-1 rounded-lg text-[#a0a0a0] hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 id="modal-headline" className="text-xl sm:text-2xl font-extrabold text-[#f0f0f0] tracking-tight">
              It's a Match!
            </h2>
            <p className="text-xs font-mono text-[#a0a0a0]">
              Mutual connection with <span className="text-white font-semibold">{dev.name}</span>
            </p>
          </div>
        </div>

        {/* Matched Profile Badge */}
        <div className="rounded-xl bg-black/40 border border-white/[0.08] p-3.5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#b266ff]/20 border border-[#b266ff]/30 text-[#b266ff] font-mono font-bold text-sm flex items-center justify-center">
              {dev.initials || dev.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-[#f0f0f0]">{dev.name}</div>
              <div className="text-[11px] font-mono text-[#a0a0a0]">{dev.role}</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/20 px-2 py-0.5 rounded-md">
            {dev.compatibility}% Match
          </span>
        </div>

        {/* Mutual Interests */}
        <div className="mb-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#52525b] mb-2">
            Mutual Stack Interests
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(dev.skills || []).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-[#f0f0f0]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Mock DM Preview (3 Static Bubbles) */}
        <div className="mb-6 space-y-2.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#52525b] flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Message Preview</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-2.5 text-xs">
            {/* Bubble 1: Outgoing */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-lg rounded-tr-none px-3 py-2 bg-[#ccff00]/15 border border-[#ccff00]/30 text-[#f0f0f0]">
                Hey! Saw you're looking for a frontend partner for your mesh networking lib.
              </div>
            </div>

            {/* Bubble 2: Incoming */}
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg rounded-tl-none px-3 py-2 bg-white/5 border border-white/10 text-[#f0f0f0]">
                Exactly! I'm building in Rust + WebRTC. Want to jump in a room?
              </div>
            </div>

            {/* Bubble 3: Outgoing Code Invite */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-lg rounded-tr-none px-3 py-2 bg-[#ccff00]/15 border border-[#ccff00]/30 text-[#f0f0f0]">
                <code className="font-mono text-[11px] text-[#ccff00]">
                  octopair.room.open(&#123; stack: "Rust" &#125;)
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Controls */}
        <div className="space-y-2">
          <Link
            to="/login?mode=signup"
            className="w-full bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold text-sm py-3 px-6 rounded-xl inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.25)] transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
          >
            <span>Start Chatting</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-mono text-[#a0a0a0] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg"
          >
            Keep Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingMatchModal;
