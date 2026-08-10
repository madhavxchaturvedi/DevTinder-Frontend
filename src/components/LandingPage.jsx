import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="w-full bg-[#f4f4f5] text-[#0a0a0a] font-sans -mt-28">
      {/* ── Hero Section (Pitch Black) ─────────────────────────── */}
      <section className="relative w-full bg-[#0a0a0a] text-white pt-48 pb-40 px-6 overflow-hidden rounded-b-[40px] md:rounded-b-[80px] border-b-4 border-[#0a0a0a]">
        <div className="mx-auto max-w-5xl text-center relative z-10 flex flex-col items-center">
          <p className="text-sm md:text-base font-bold text-gray-400 uppercase tracking-widest mb-6">
            The most comprehensive
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight mb-8">
            Developer Discovery <br />
            <span className="text-white">Platform</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-medium">
            Streamline your professional network and fortify your career by connecting with the best builders in the industry.
          </p>

          {/* Email Input Pill */}
          <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-full w-full max-w-md mx-auto shadow-[0_0_30px_rgba(204,255,0,0.15)] relative z-20">
            <input
              type="email"
              placeholder="Your work email"
              className="flex-1 bg-transparent px-6 py-3 outline-none text-[#0a0a0a] font-medium placeholder:text-gray-400 w-full"
            />
            <Link
              to="/login"
              className="w-full sm:w-auto bg-[#ccff00] text-[#0a0a0a] font-black uppercase tracking-wide px-8 py-3 rounded-full hover:bg-[#bbf000] transition-colors whitespace-nowrap border-2 border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Abstract Isometric Illustration (CSS) */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full max-w-6xl h-64 md:h-96 pointer-events-none opacity-90 flex justify-center items-end gap-10">
           {/* Left Block */}
           <div className="w-32 h-40 bg-[#ccff00] border-[6px] border-[#0a0a0a] transform -skew-y-12 translate-y-10"></div>
           {/* Center Purple Block */}
           <div className="w-64 h-64 bg-[#a855f7] border-[6px] border-[#0a0a0a] transform skew-y-12 relative z-10 shadow-[-20px_20px_0px_#000]"></div>
           {/* Right White Block */}
           <div className="w-48 h-48 bg-white border-[6px] border-[#0a0a0a] transform -skew-y-12 -translate-y-10"></div>
        </div>
      </section>

      {/* ── Logos Section ──────────────────────────────────────── */}
      <section className="py-12 border-b-2 border-[#0a0a0a] bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 grayscale">
          <h3 className="text-xl font-black font-serif italic tracking-tighter">coinbase</h3>
          <h3 className="text-xl font-black font-serif italic tracking-tighter">DocuSign</h3>
          <h3 className="text-xl font-black font-serif italic tracking-tighter">Wealthsimple</h3>
          <h3 className="text-xl font-black font-serif italic tracking-tighter">Wilson</h3>
        </div>
      </section>

      {/* ── Values / Features Grid ─────────────────────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">DevTinder Values</h2>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
            These values embody the platform's vision and dedication to creating superior developer experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="neo-card p-10 flex flex-col items-center text-center bg-[#f4f4f5]">
            <h3 className="text-2xl font-black mb-3">Collaboration</h3>
            <p className="text-sm font-medium text-gray-600 mb-10">
              Automatically capture and correlate all actions—from planning to code changes.
            </p>
            {/* Geometric art */}
            <div className="w-32 h-32 grid grid-cols-2 gap-2 transform rotate-45">
              <div className="bg-gray-300 rounded-full border-4 border-[#0a0a0a]"></div>
              <div className="bg-gray-300 rounded-full border-4 border-[#0a0a0a]"></div>
              <div className="bg-gray-300 rounded-full border-4 border-[#0a0a0a]"></div>
              <div className="bg-gray-300 rounded-full border-4 border-[#0a0a0a]"></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="neo-card p-10 flex flex-col items-center text-center bg-[#f4f4f5]">
            <h3 className="text-2xl font-black mb-3">Easy to scale</h3>
            <p className="text-sm font-medium text-gray-600 mb-10">
              Reference architectures show you how to scale high availability for installations.
            </p>
            {/* Geometric art */}
            <div className="w-32 h-32 relative">
               <div className="absolute top-0 left-0 w-12 h-12 rounded-full bg-[#a855f7] border-4 border-[#0a0a0a] shadow-[0_15px_0_rgba(0,0,0,0.1)]"></div>
               <div className="absolute top-1/2 right-0 w-12 h-12 rounded-full bg-[#ccff00] border-4 border-[#0a0a0a] shadow-[0_15px_0_rgba(0,0,0,0.1)]"></div>
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#0a0a0a] border-4 border-[#0a0a0a] shadow-[0_15px_0_rgba(0,0,0,0.1)]"></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="neo-card p-10 flex flex-col items-center text-center bg-[#f4f4f5]">
            <h3 className="text-2xl font-black mb-3">DevSecOps</h3>
            <p className="text-sm font-medium text-gray-600 mb-10">
              Use a common set of tools across teams and lifecycle stages without dependencies.
            </p>
            {/* Geometric art */}
            <div className="w-32 h-32 flex flex-col items-center justify-center gap-1">
               <div className="w-24 h-8 bg-gray-300 rounded-[50%] border-4 border-[#0a0a0a]"></div>
               <div className="w-16 h-6 bg-gray-300 rounded-[50%] border-4 border-[#0a0a0a]"></div>
               <div className="w-10 h-4 bg-gray-300 rounded-[50%] border-4 border-[#0a0a0a]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Complex Bento Grid Section ───────────────────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <h2 className="text-4xl md:text-5xl font-black max-w-md">
            View and manage end-to-end processes
          </h2>
          <p className="text-lg text-gray-600 font-medium max-w-md">
            Streamline software delivery processes through automation, enhance overall productivity, and fortify the security of your complete software supply chain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Big Graphic Card */}
          <div className="neo-card bg-[#a855f7] p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
             <div className="w-full max-w-sm bg-white rounded-xl border-4 border-[#0a0a0a] p-6 shadow-[10px_10px_0px_#0a0a0a] transform rotate-2">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-black"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-black"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-black"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded border-2 border-black w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded border-2 border-black w-1/2"></div>
                  <div className="h-4 bg-[#ccff00] rounded border-2 border-black w-5/6"></div>
                </div>
             </div>
          </div>

          {/* List Card */}
          <div className="flex flex-col justify-center gap-10 py-4">
            {[
              { title: "One tool, no chain", desc: "There are no integrations to manage, no API chokepoints to limit visibility." },
              { title: "Actionable data", desc: "A single source of insight built on a single system of work means you can speed up time." },
              { title: "Focus on value", desc: "A single application means single-click drill down into actual work items." },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center font-black flex-shrink-0 shadow-[2px_2px_0px_#ccff00]">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-xl font-black mb-2">{item.title}</h4>
                  <p className="text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
           {/* Security Card */}
           <div className="neo-card p-10 flex flex-col sm:flex-row items-center justify-between gap-8 bg-[#f4f4f5]">
              <div>
                <h3 className="text-3xl font-black mb-6">Security and Governance</h3>
                <span className="border-2 border-[#0a0a0a] rounded-full px-5 py-2 font-bold bg-white shadow-[2px_2px_0px_#0a0a0a]">Security Testing</span>
              </div>
              <div className="relative">
                <div className="w-24 h-32 border-[6px] border-[#0a0a0a] rounded-t-full bg-[#ccff00]"></div>
                <div className="w-24 h-16 border-[6px] border-[#0a0a0a] bg-[#a855f7] absolute bottom-0 left-4 shadow-[-8px_8px_0px_#000]"></div>
              </div>
           </div>

           {/* Code Block Card */}
           <div className="neo-card-dark p-10 bg-[#0a0a0a] text-white flex flex-col justify-center">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#ccff00] mb-4">Accelerate Delivery</h4>
              <p className="text-gray-400 mb-6 font-medium">Automated tasks improve efficiency and free up developers' time — without sacrificing security.</p>
              <div className="bg-[#18181b] border-2 border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 shadow-[4px_4px_0px_#a855f7]">
                <p><span className="text-[#a855f7]">const</span> <span className="text-white">match</span> = <span className="text-[#ccff00]">useDeveloper</span>();</p>
                <p className="mt-2 text-gray-500">// Connect and build</p>
                <p className="text-[#ccff00]">match.connect();</p>
              </div>
           </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-[#0a0a0a] text-white pt-24 pb-12 px-6 rounded-t-[40px] md:rounded-t-[80px]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 mb-16 border-b-2 border-white/10 pb-16">
           <div>
             <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
               <div className="w-8 h-8 bg-[#ccff00] border-2 border-white rounded-full flex items-center justify-center">
                 <div className="w-3 h-3 bg-[#a855f7] rounded-full"></div>
               </div>
               DevTinder
             </h2>
             <p className="text-gray-400 font-medium max-w-sm">
               Streamline software delivery processes through automation, enhance overall productivity, and fortify.
             </p>
           </div>
           <div>
              <div className="flex bg-[#18181b] border-2 border-white/10 rounded-full p-2 max-w-md">
                 <input type="email" placeholder="Enter your email" className="bg-transparent px-4 w-full outline-none text-white placeholder:text-gray-600 font-medium" />
                 <button className="bg-white text-[#0a0a0a] font-black p-3 rounded-full hover:bg-[#ccff00] transition-colors border-2 border-transparent hover:border-[#0a0a0a]">
                   →
                 </button>
              </div>
           </div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-500 font-medium text-sm">
           <p>© 2026 DevTinder Inc.</p>
           <div className="flex gap-6 mt-4 md:mt-0">
             <Link to="/" className="hover:text-white transition">Privacy Policy</Link>
             <Link to="/" className="hover:text-white transition">Terms of Use</Link>
             <Link to="/" className="hover:text-white transition">Cookie Preference</Link>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
