import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiZap, FiMonitor, FiCpu, FiGithub, FiBriefcase } from "react-icons/fi";

const LandingPage = () => {
  return (
    <div className="w-full bg-[#0a0a0a] text-[#e5e5e5] font-sans -mt-28">
      {/* ── Hero Section ─────────────────────────── */}
      <section className="relative w-full bg-[#0a0a0a] text-white pt-48 pb-32 px-6 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#ccff00]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#a855f7]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-5xl text-center relative z-10 flex flex-col items-center mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[#a3a3a3] text-xs font-semibold uppercase tracking-widest mb-8 inline-block backdrop-blur-sm">
              Stop coding alone
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.1] tracking-tight mb-8"
          >
            Find Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#a855f7]">
              Co-Founder
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-[#a3a3a3] max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Swipe right on great code. DevTinder connects you with the best software engineers for pair programming, open-source collaboration, and building startups.
          </motion.p>

          {/* Call to action */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mx-auto relative z-20"
          >
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 bg-[#ccff00] text-[#0a0a0a] font-bold text-lg tracking-wide px-8 py-4 rounded-2xl hover:bg-[#bbf000] transition-all shadow-lg shadow-[#ccff00]/10"
            >
              Get Started Free <span className="text-xl">→</span>
            </Link>
          </motion.div>
        </div>

        {/* Floating UI Elements (Decorative) */}
        <div className="absolute top-[60%] left-[10%] w-64 h-32 bg-[#121212] border border-white/5 rounded-2xl p-4 hidden lg:flex flex-col gap-3 shadow-2xl opacity-80 transform -rotate-6 backdrop-blur-xl">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ccff00] to-[#a855f7]" />
             <div className="h-2 w-24 bg-white/10 rounded-full" />
           </div>
           <div className="h-16 w-full bg-[#1a1a1a] rounded-lg border border-white/5" />
        </div>

        <div className="absolute top-[50%] right-[10%] w-56 h-48 bg-[#121212] border border-white/5 rounded-2xl p-4 hidden lg:flex flex-col gap-3 shadow-2xl opacity-80 transform rotate-12 backdrop-blur-xl">
           <div className="flex justify-between items-center mb-2">
             <div className="h-2 w-16 bg-[#ccff00]/50 rounded-full" />
             <div className="h-2 w-8 bg-[#a855f7]/50 rounded-full" />
           </div>
           <div className="h-8 w-full bg-[#1a1a1a] rounded-lg border border-white/5" />
           <div className="h-8 w-full bg-[#1a1a1a] rounded-lg border border-white/5" />
           <div className="h-8 w-full bg-[#1a1a1a] rounded-lg border border-white/5" />
        </div>
      </section>

      {/* ── Stack Section ──────────────────────────────────────── */}
      <section className="py-10 border-y border-white/5 bg-[#121212]/50 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center items-center gap-10 md:gap-24 opacity-40">
          <h3 className="text-xl font-bold tracking-widest uppercase text-white hover:text-[#ccff00] transition-colors cursor-default">React</h3>
          <h3 className="text-xl font-bold tracking-widest uppercase text-white hover:text-[#a855f7] transition-colors cursor-default">Node.js</h3>
          <h3 className="text-xl font-bold tracking-widest uppercase text-white hover:text-[#ccff00] transition-colors cursor-default">Python</h3>
          <h3 className="text-xl font-bold tracking-widest uppercase text-white hover:text-[#a855f7] transition-colors cursor-default">Rust</h3>
          <h3 className="text-xl font-bold tracking-widest uppercase text-white hover:text-[#ccff00] transition-colors cursor-default">Go</h3>
        </div>
      </section>

      {/* ── Values / Features Grid ─────────────────────────────── */}
      <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">The Developer Network</h2>
          <p className="text-lg text-[#a3a3a3] font-medium max-w-2xl mx-auto">
            Built by developers, for developers. Skip the noise and connect instantly with vetted builders globally.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 hover:bg-[#151515] hover:border-white/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center mb-6 text-[#ccff00] text-2xl group-hover:scale-110 transition-transform">
              <FiZap />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Pair Programming</h3>
            <p className="text-[15px] text-[#a3a3a3] leading-relaxed">
              Find developers who share your exact tech stack and are ready to tackle complex architecture problems together in real-time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 hover:bg-[#151515] hover:border-white/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center mb-6 text-[#a855f7] text-2xl group-hover:scale-110 transition-transform">
              <FiMonitor />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Startup Teams</h3>
            <p className="text-[15px] text-[#a3a3a3] leading-relaxed">
              Stop looking for technical co-founders on Reddit. Connect with verified builders who have a track record of shipping products.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 hover:bg-[#151515] hover:border-white/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400 text-2xl group-hover:scale-110 transition-transform">
              <FiCpu />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Mentorship</h3>
            <p className="text-[15px] text-[#a3a3a3] leading-relaxed">
              Level up your skills by learning from senior engineers, or give back to the community by guiding the next generation of juniors.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature Section ───────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#a855f7]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Skip the small talk. <br/>
              <span className="text-[#a855f7]">Go straight to code.</span>
            </h2>
            <p className="text-lg text-[#a3a3a3] font-medium leading-relaxed">
              Filter matches by tech stack, view their GitHub activity, and instantly connect with builders who speak your language. Our platform is designed to eliminate recruiter spam and focus entirely on engineering synergy.
            </p>
            
            <ul className="space-y-4 pt-4">
              {[
                "Instant matching based on technical skills",
                "Built-in secure chat tailored for developers",
                "Absolutely zero non-technical recruiters"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#e5e5e5] font-medium">
                  <div className="w-6 h-6 rounded-full bg-[#ccff00]/10 flex items-center justify-center border border-[#ccff00]/30 text-[#ccff00] text-xs">✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 w-full relative">
            <div className="relative w-full aspect-square md:aspect-[4/3] bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8 flex items-center justify-center">
              {/* Mockup UI inside the box */}
              <div className="w-full max-w-sm bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#121212]">
                   <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                     <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                   </div>
                   <div className="text-xs text-[#a3a3a3] font-mono">match.ts</div>
                </div>
                <div className="p-6 font-mono text-sm leading-loose">
                  <p><span className="text-[#a855f7]">import</span> {`{ Developer }`} <span className="text-[#a855f7]">from</span> <span className="text-green-400">'@dev/tinder'</span>;</p>
                  <br/>
                  <p><span className="text-[#a855f7]">const</span> <span className="text-blue-400">newMatch</span> = <span className="text-[#a855f7]">await</span> <span className="text-[#ccff00]">findPartner</span>({`{`}</p>
                  <p className="pl-4">stack: [<span className="text-green-400">'React'</span>, <span className="text-green-400">'Node'</span>],</p>
                  <p className="pl-4">experience: <span className="text-orange-400">"Senior"</span></p>
                  <p>{`}`});</p>
                  <br/>
                  <p className="text-gray-500">// Ready to build</p>
                  <p><span className="text-blue-400">newMatch</span>.<span className="text-[#ccff00]">connect</span>();</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-[#050505] text-[#a3a3a3] pt-20 pb-10 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
           <div className="md:col-span-2">
             <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">
               &lt;DevTinder /&gt;
             </h2>
             <p className="font-medium max-w-sm text-sm leading-relaxed mb-6">
               The premier network for elite software engineers, designers, and technical founders to connect and collaborate.
             </p>
             <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-[#121212] border border-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-xl font-black">X</a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#121212] border border-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-xl"><FiGithub /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#121212] border border-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-xl"><FiBriefcase /></a>
             </div>
           </div>
           
           <div>
             <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Product</h3>
             <ul className="space-y-3 text-sm font-medium">
               <li><a href="#" className="hover:text-[#ccff00] transition-colors">Features</a></li>
               <li><a href="#" className="hover:text-[#ccff00] transition-colors">Pricing</a></li>
               <li><a href="#" className="hover:text-[#ccff00] transition-colors">Showcase</a></li>
             </ul>
           </div>

           <div>
             <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Legal</h3>
             <ul className="space-y-3 text-sm font-medium">
               <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
             </ul>
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center font-medium text-xs border-t border-white/5 pt-8">
           <p>© 2026 DevTinder Inc. All rights reserved.</p>
           <div className="flex gap-2 mt-4 md:mt-0 items-center">
             <span>Designed in</span>
             <span className="text-[#a855f7] font-bold">Dark Mode</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
