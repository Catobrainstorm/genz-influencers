"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowRight, HiMoon, HiSun } from 'react-icons/hi';
import SearchPortal from './components/ui/SearchPortal';

export default function LandingPage() {
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  // FIXED: Initialized to true so Dark Mode is the default state
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Unified toggle function
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <main className={`min-h-screen transition-colors duration-1000 overflow-hidden font-sans cursor-default selection:bg-smartan-orange/30 ${darkMode ? 'bg-[#050B14] text-white' : 'bg-[#FDFCF8] text-[#08263f]'}`}>
      
      {/* 1. GLOBAL BACKGROUND WATERMARK */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <h2 className={`text-[22vw] font-display font-black leading-none uppercase tracking-tighter opacity-[0.03] transition-all duration-1000 ${darkMode ? 'text-white' : 'text-[#f7961d]'}`}>
          SMARTAN
        </h2>
      </div>

      {/* 2. GLASSMORPHIC MASTER HEADER (z-[500]) */}
      <nav className="fixed top-0 left-0 w-full z-[500] px-[5%] py-6 md:py-10 flex justify-between items-center transition-all duration-500 border-b border-white/10 backdrop-blur-xl bg-white/2 shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="pointer-events-auto">
          <img 
            src={darkMode ? "/images/logo-white.ico" : "/images/logo.png"} 
            alt="Smartan House" 
            className="h-10 md:h-14 lg:h-16 w-auto object-contain transition-all duration-500" 
          />
        </motion.div>
        
        <div className="flex items-center gap-6 pointer-events-auto">
          <button 
            onClick={toggleDarkMode}
            className={`p-3 md:p-4 rounded-2xl border transition-all shadow-xl active:scale-90 ${
              darkMode 
              ? 'border-smartan-orange/30 bg-smartan-orange/10 text-smartan-orange' 
              : 'border-black/5 bg-white/80 text-[#08263f]'
            }`}
          >
            {darkMode ? <HiSun size={24} /> : <HiMoon size={24} />}
          </button>
        </div>
      </nav>

      {/* 3. MAIN EDITORIAL SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center px-[8%] py-32 z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-[1600px] gap-12 lg:gap-32 items-center mx-auto">
          
          {/* LEFT SIDE: SEAMLESS IMAGE (No Card, No Border) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative w-full max-w-[600px] mx-auto lg:mx-0 flex items-center justify-center"
          >
            <img 
              src="/images/main.webp" 
              alt="Induction Visual" 
              className={`w-full h-auto object-contain transition-all duration-700 ${darkMode ? 'opacity-80 grayscale brightness-90' : 'opacity-100'}`}
            />
          </motion.div>

          {/* RIGHT SIDE: THE COMMANDS */}
          <div className="space-y-12 lg:space-y-20">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-10"
            >
              {/* LABEL */}
              <div className="mb-4">
                <span className={`tracking-[0.5em] uppercase text-[clamp(10px,1vw,12px)] font-black py-2 inline-block border-b-2 transition-all ${darkMode ? 'text-smartan-orange border-smartan-orange/40' : 'text-[#f7961d] border-[#f7961d]/20'}`}>
                  The Annual Roster
                </span>
              </div>

              {/* STEP 01 */}
              <div className="space-y-4 relative group">
                <div className={`absolute -left-8 top-0 w-1 h-full rounded-full transition-all group-hover:w-2 ${darkMode ? 'bg-smartan-pink' : 'bg-smartan-teal'}`} />
                <p className={`text-[clamp(10px,1vw,11px)] font-black uppercase tracking-[0.4em] ${darkMode ? 'text-smartan-pink' : 'text-smartan-teal'}`}>Step 01</p>
                <p className="text-[clamp(1.5rem,3vw,3rem)] font-display font-black leading-[1.1] tracking-tighter">
                  Search the registry, claim your badge, share it online and <span className={`italic ${darkMode ? 'text-smartan-teal' : 'text-smartan-pink'}`}>copy the link of the post.</span>
                </p>
              </div>

              {/* STEP 02 */}
              <div className="space-y-4 group relative">
                <div className={`absolute -left-8 top-0 w-1 h-full rounded-full transition-all group-hover:w-2 ${darkMode ? 'bg-smartan-teal' : 'bg-smartan-orange'}`} />
                <p className={`text-[clamp(10px,1vw,11px)] font-black uppercase tracking-[0.4em] ${darkMode ? 'text-smartan-teal' : 'text-smartan-orange'}`}>Step 02</p>
                <p className="text-[clamp(1.5rem,3vw,3rem)] font-display font-black leading-[1.1] tracking-tighter">
                  Then use your <span className="underline decoration-smartan-orange decoration-4 underline-offset-8">post link</span> to complete the RSVP.
                </p>
              </div>

              {/* CALL TO ACTION */}
              <div className="pt-6">
                <button 
                  onClick={() => setIsPortalOpen(true)}
                  className={`group w-full md:w-auto px-[clamp(2rem,5vw,4rem)] py-[clamp(1rem,2vw,2rem)] rounded-full font-black text-[clamp(1.1rem,1.5vw,1.5rem)] transition-all shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-center gap-6 active:scale-95 ${darkMode ? 'bg-white text-[#050B14] hover:bg-smartan-orange' : 'bg-[#08263f] text-white hover:bg-smartan-orange'}`}
                >
                  GET STARTED
                  <HiArrowRight className="group-hover:translate-x-3 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 4. PIN-SHARP FOOTER */}
        <div className="fixed bottom-10 left-[5%] flex items-center gap-6 transition-all z-50 pointer-events-none">
            <div className="flex gap-2">
              {['#f7961d', '#ec297b', '#1b9a72', '#08263f'].map((color) => (
                <div key={color} style={{ backgroundColor: color }} className="w-2 h-2 md:w-3 md:h-3 rounded-full shadow-lg" />
              ))}
            </div>
            <p className={`text-[10px] font-black uppercase tracking-[0.6em] transition-opacity duration-1000 ${darkMode ? 'text-white opacity-20' : 'text-[#08263f] opacity-30'}`}>Induction Portal // 2026</p>
        </div>
      </section>

      {/* Portal with default Dark Mode props passed */}
      <SearchPortal 
        isOpen={isPortalOpen} 
        onClose={() => setIsPortalOpen(false)} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
      />
    </main>
  );
}