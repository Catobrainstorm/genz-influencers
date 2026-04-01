"use client";
import { useState, useEffect, useRef } from "react";
import IconBadge from "./IconBadge";
import { createClient } from '@supabase/supabase-js';
import gsap from "gsap";

// Initialize the Vault Connector
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  person: any;
  onBack: () => void;
  onSuccess: () => void;
}

export default function VerificationChallenge({ person, onBack, onSuccess }: Props) {
  const [submissionLink, setSubmissionLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Cinematic Entrance Animation
    const tl = gsap.timeline();
    tl.fromTo(".anim-element", 
      { y: 30, opacity: 0, filter: "blur(10px)" }, 
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, stagger: 0.1, ease: "expo.out" }
    );
  }, []);

  const handleFinalize = async () => {
    // 1. Protocol Validation
    if (!submissionLink.startsWith("http")) {
      alert("Protocol Error: Please provide a valid distribution link (URL).");
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Transmit to Supabase Archive
      const { error } = await supabase
        .from('verifications')
        .insert([
          { 
            name: person.name, 
            category: person.category || "Elite Member", 
            proof_link: submissionLink,
            status: 'pending' 
          }
        ]);

      if (error) throw error;

      // 3. SUCCESS: Trigger the UI Bridge to the Pending Hub
      onSuccess();

    } catch (error: any) {
      console.error("Transmission Error:", error.message);
      alert("Connection to the registry failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-6xl flex flex-col lg:flex-row gap-16 lg:gap-24 items-center justify-center pt-10 px-6 relative pb-20">
      
      {/* ELITE NAVIGATION */}
      <button 
        onClick={onBack}
        className="anim-element absolute -top-10 left-6 group flex items-center space-x-3 outline-none z-[110] opacity-0"
      >
        <div className="w-8 h-8 border border-white/10 rounded-full flex items-center justify-center group-hover:border-[#f7961d] transition-all">
          <div className="w-2 h-2 border-l border-b border-white group-hover:border-[#f7961d] rotate-45 ml-1"></div>
        </div>
        <span className="text-[9px] tracking-[0.4em] text-white/20 group-hover:text-white uppercase transition-colors">Return to Registry</span>
      </button>

      {/* LEFT: THE INFLUENCER ICON-BADGE */}
      <div className="anim-element w-full max-w-sm opacity-0 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
        <IconBadge person={person} />
      </div>

      {/* RIGHT: THE INDUCTION PROTOCOL */}
      <div className="flex-1 space-y-12 max-w-md">
        <div className="space-y-6 text-center lg:text-left">
          <h3 className="anim-element text-5xl md:text-7xl font-display font-light uppercase text-white leading-[0.8] tracking-tighter opacity-0">
            CLAIM <br />
            <span className="italic font-black text-[#f7961d]">STATUS</span>
          </h3>
          <div className="anim-element h-[1px] w-12 bg-[#f7961d]/40 my-8 hidden lg:block opacity-0"></div>
          <p className="anim-element text-[10px] text-white/40 leading-relaxed font-light tracking-[0.4em] max-w-sm uppercase opacity-0">
            Distribute your official asset to trigger the Council audit and unlock the final sequence.
          </p>
        </div>

        {/* SOCIAL DISTRIBUTION GRID */}
        <div className="anim-element grid grid-cols-3 gap-3 border-y border-white/5 py-10 opacity-0">
           {['Instagram', 'X', 'LinkedIn', 'Facebook', 'Threads', 'TikTok'].map((platform) => (
             <button 
               key={platform}
               onClick={() => window.open(`https://${platform.toLowerCase()}.com`)} 
               className="group py-4 border border-white/5 bg-white/[0.01] hover:bg-[#f7961d] hover:text-white transition-all text-center"
             >
               <p className="text-[8px] tracking-[0.2em] text-white/30 group-hover:text-white uppercase">{platform}</p>
             </button>
           ))}
        </div>

        {/* DATA TRANSMISSION AREA */}
        <div className="anim-element space-y-8 opacity-0">
          <div className="space-y-3">
            <label className="text-[9px] tracking-[0.5em] text-white/30 uppercase block font-mono">Archive_Distribution_Link</label>
            <input 
              type="text" 
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
              placeholder="PASTE URL HERE..."
              className="w-full bg-white/[0.03] border border-white/10 p-6 text-xs text-white font-mono focus:outline-none focus:border-[#f7961d] transition-all placeholder:text-white/5"
            />
          </div>

          <button 
            onClick={handleFinalize}
            disabled={isSubmitting}
            className="w-full py-6 bg-[#f7961d] text-white text-[11px] tracking-[0.8em] font-black uppercase hover:bg-white hover:text-black transition-all duration-700 shadow-[0_0_60px_rgba(247,150,29,0.3)] disabled:opacity-50"
          >
            {isSubmitting ? "TRANSMITTING TO COUNCIL..." : "FINALIZE VERIFICATION"}
          </button>
        </div>
      </div>
    </div>
  );
}