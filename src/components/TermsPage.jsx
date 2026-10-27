import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

const TermsPage = () => {
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
            <div className="w-10 h-10 rounded-xl bg-[#b266ff]/10 border border-[#b266ff]/25 flex items-center justify-center text-[#b266ff]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f0f0f0]">
                Terms of Service
              </h1>
              <p className="text-xs font-mono text-[#52525b] mt-1">
                Last updated: October 2026 • OctoPair Platform
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#111113] border border-white/[0.07] p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-[#a0a0a0] shadow-2xl">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#f0f0f0]">1. Acceptance of Terms</h2>
            <p>
              By accessing or using OctoPair, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#f0f0f0]">2. Code Collaboration &amp; Intellectual Property</h2>
            <p>
              You retain all ownership and copyright of code, intellectual property, and project repositories you author on OctoPair. OctoPair does not claim ownership of user-submitted source code.
            </p>
            <p>
              When collaborating in open pair-programming rooms, you agree to adhere to standard open-source licensing and not upload malicious, destructive, or copyrighted code without authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#f0f0f0]">3. Acceptable Use Policy</h2>
            <p>
              You agree not to use OctoPair to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#d4d4d8]">
              <li>Engage in harassment, hate speech, or malicious conduct against other developers.</li>
              <li>Execute denial-of-service attacks, port scans, or exploit sandbox vulnerabilities.</li>
              <li>Distribute malware, crypto-mining scripts, or automated scraping bots.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#f0f0f0]">4. Disclaimers &amp; Limitation of Liability</h2>
            <p>
              The materials and services on OctoPair are provided on an &apos;as is&apos; basis. OctoPair makes no warranties, expressed or implied, regarding uptime, zero-loss synchronization, or code compilation fitness for a particular purpose.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#f0f0f0]">5. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with standard international developer platform regulations without regard to conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
