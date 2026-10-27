import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#f0f0f0] px-4 py-12 sm:px-6 lg:px-8 selection:bg-[#ccff00] selection:text-black">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#a0a0a0] hover:text-[#ccff00] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/25 flex items-center justify-center text-[#ccff00]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f0f0f0]">
                Privacy Policy
              </h1>
              <p className="text-xs font-mono text-[#52525b] mt-1">
                Last updated: October 2026 • OctoPair Platform
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#111113] border border-white/[0.07] p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-[#a0a0a0] shadow-2xl">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#f0f0f0]">1. Introduction</h2>
            <p>
              OctoPair (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you use our collaborative developer platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#f0f0f0]">2. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when creating an account, editing your profile, or participating in pairing sessions. This includes your name, email address, profile photo, and public technical skills.
            </p>
            <p>
              Code synchronized during peer sessions is communicated via encrypted WebRTC DataChannels between peers and is not stored permanently on central servers unless explicitly saved to your project repository.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#f0f0f0]">3. Authentication &amp; Cookies</h2>
            <p>
              We use secure, httpOnly cookies for session authentication tokens. We also use a minimal, client-readable authentication hint to ensure instantaneous redirect when visiting the root domain. We do not use third-party tracking or advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#f0f0f0]">4. Data Security</h2>
            <p>
              We implement industry-standard encryption, rate-limiting, and security controls to protect your data against unauthorized access, disclosure, alteration, or destruction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#f0f0f0]">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact our security and engineering team at security@octopair.dev.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
