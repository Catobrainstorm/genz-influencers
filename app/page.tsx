"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import SmartanScene from "./components/canvas/SmartanScene";
import SearchPortal from "./components/ui/SearchPortal";

export default function LandingPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const titleRef = useRef(null);
  const infoRef = useRef(null);
  const btnRef = useRef(null);
  const navRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    tl.fromTo(navRef.current, { opacity: 0 }, { opacity: 1, duration: 2 })
      .fromTo(titleRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 1.5 }, "-=1.5")
      .fromTo(infoRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2 }, "-=1")
      .fromTo(btnRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1 }, "-=0.8")
      .fromTo(footerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.5 }, "-=1");
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-smartan-navy text-white font-sans selection:bg-smartan-orange selection:text-smartan-navy flex flex-col">
      <SmartanScene />
      
      <SearchPortal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* 1. NAVIGATION */}
      <nav ref={navRef} className="absolute top-0 w-full z-40 p-6 md:p-10 lg:p-14 flex justify-between items-start pointer-events-none">
        <img 
          src="/images/logo.png" 
          alt="Smartan House" 
          className="h-8 md:h-12 w-auto object-contain brightness-110 pointer-events-auto cursor-pointer transition-transform hover:scale-105" 
        />
        <div className="flex flex-col items-end space-y-1 pointer-events-auto">
          <div className="w-12 md:w-16 h-[1px] bg-smartan-orange shadow-[0_0_10px_#f7961d]"></div>
          <p className="text-[7px] md:text-[9px] tracking-[0.6em] uppercase text-white/60 font-black">Established 2026</p>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative z-30 flex-grow flex flex-col justify-center px-6 sm:px-12 md:px-24 lg:px-40 py-20">
        <div className="max-w-7xl w-full mx-auto">
          
          <div ref={titleRef} className="relative mb-10 md:mb-16">
            <span className="text-[8px] md:text-[10px] tracking-[1em] uppercase text-smartan-orange mb-4 block font-display font-black">
              The Annual Roster
            </span>
            <h1 className="text-[10vw] sm:text-[8vw] md:text-7xl lg:text-8xl font-display font-light leading-[0.9] tracking-tight uppercase">
              PRESTIGIOUS <br/>
              <span className="font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-smartan-orange">1000</span> <br/>
              <span className="text-[7vw] sm:text-[6vw] md:text-5xl lg:text-6xl block">GEN-Z INFLUENCERS</span>
            </h1>
          </div>

          <div ref={infoRef} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-9 lg:col-span-8 border-l border-white/10 pl-6 md:pl-10 space-y-12">
              
              {/* REFINED STEPS WITH ENLARGED HEADERS */}
              <div className="space-y-12">
                <div className="space-y-3 group">
                  {/* ENLARGED STEP HEADER */}
                  <p className="text-2xl md:text-3xl lg:text-4xl tracking-[0.2em] text-smartan-orange uppercase font-black transition-all group-hover:tracking-[0.3em]">Step 01</p>
                  <p className="text-base sm:text-lg md:text-xl text-white font-display uppercase leading-tight tracking-wide max-w-2xl font-bold opacity-90">
                    Search the registry, claim your badge, share it online and <span className="text-smartan-orange italic">Share the link of the post.</span>
                  </p>
                </div>
                
                <div className="space-y-3 group">
                  {/* ENLARGED STEP HEADER */}
                  <p className="text-2xl md:text-3xl lg:text-4xl tracking-[0.2em] text-smartan-orange uppercase font-black transition-all group-hover:tracking-[0.3em]">Step 02</p>
                  <p className="text-base sm:text-lg md:text-xl text-white font-display uppercase leading-tight tracking-wide max-w-2xl font-bold opacity-90">
                    You use your <span className="border-b-2 border-smartan-orange/60">post link</span> to complete the rsvp
                  </p>
                </div>
              </div>
              
              <div ref={btnRef} className="pt-6">
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="group relative flex items-center space-x-6 z-50 cursor-pointer outline-none active:scale-95 transition-transform"
                >
                  <div className="relative px-12 py-6 bg-white text-black text-[10px] tracking-[0.5em] uppercase font-black transition-all duration-500 group-hover:bg-smartan-orange group-hover:text-white group-hover:shadow-[0_0_40px_rgba(247,150,29,0.4)]">
                    Get Started
                  </div>
                  <div className="w-16 h-[1px] bg-white/20 group-hover:w-24 group-hover:bg-smartan-orange transition-all duration-500"></div>
                </button>
              </div>
            </div>

            {/* BACKGROUND TEXT */}
            <div className="hidden lg:block lg:col-span-4 text-right overflow-hidden">
               <span className="text-[12vw] lg:text-[14rem] leading-none font-black opacity-[0.03] pointer-events-none select-none italic block translate-x-10 translate-y-10">
                 SCC.26
               </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOOTER */}
      <footer ref={footerRef} className="relative md:absolute bottom-0 md:bottom-10 w-full z-50 px-6 md:px-14 pb-8 md:pb-0">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 border-t border-white/5 pt-8">
          <div className="flex space-x-8 md:space-x-12 pointer-events-auto">
            {['Instagram', 'X', 'LinkedIn'].map((platform) => (
              <a key={platform} href="#" className="text-[9px] tracking-[0.4em] uppercase text-white/40 hover:text-smartan-orange transition-all duration-300 font-bold">
                {platform}
              </a>
            ))}
          </div>
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/40 font-display font-bold">
            Smartan Culture Conference <span className="text-smartan-orange mx-2">//</span> 2026
          </p>
        </div>
      </footer>

      {/* NOISE OVERLAY */}
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </main>
  );
}