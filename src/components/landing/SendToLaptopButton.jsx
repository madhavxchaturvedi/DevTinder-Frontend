import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

/**
 * Mobile Web Share API button with clipboard copy fallback.
 * Enables mobile visitors on 375px viewports to send the current session to their laptop.
 */
const SendToLaptopButton = () => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? (window.location.origin + window.location.pathname) : "";
    const shareData = {
      title: "OctoPair - The Multiplayer IDE for Builders",
      text: "Pick a project. Pair up. Build it live on OctoPair.",
      url: url,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          await fallbackCopy(url);
        }
      }
    } else {
      await fallbackCopy(url);
    }
  };

  const fallbackCopy = async (text) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Silently catch clipboard errors
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-full text-xs font-mono text-[#a0a0a0] hover:text-[#f0f0f0] bg-[#111113] border border-white/10 hover:border-white/20 rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#ccff00]" />
          <span className="text-[#ccff00]">Link copied to clipboard!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-[#b266ff]" />
          <span>Send this link to my laptop</span>
        </>
      )}
    </button>
  );
};

export default SendToLaptopButton;
