"use client";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import registry from "../../../data/registry.json";
import IconBadge from "./IconBadge";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ─────────────────────────────────────────
   GOLD PALETTE TOKENS
───────────────────────────────────────── */
const GOLD       = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const GOLD_DIM   = "rgba(201,168,76,0.18)";
const DEEP       = "#040F1A";

/* ─────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────── */
function RitualCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      <div style={{ position:"absolute", top:"-200px", left:"-100px", width:"700px", height:"700px", borderRadius:"50%", background:"radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)" }} />
    </div>
  );
}

/**
 * GLASS CARD COMPONENT
 * Fixed: Explicitly typed to accept className for Tailwind animations
 */
interface GlassCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

function GlassCard({ children, style = {}, className = "" }: GlassCardProps) {
  return (
    <div 
      className={className}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(201,168,76,0.12)",
        backdropFilter: "blur(40px) saturate(160%)",
        WebkitBackdropFilter: "blur(40px) saturate(160%)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
        position: "relative", 
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, opacity: 0.3 }}/>
      {children}
    </div>
  );
}

export default function SearchPortal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [viewingDossier, setViewingDossier] = useState(false);
  const [inPipeline, setInPipeline] = useState(false);
  const [step, setStep] = useState(1);
  const [submissionLink, setSubmissionLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const portalRef  = useRef<HTMLDivElement>(null);
  const dossierRef = useRef<HTMLDivElement>(null);

  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfPumVQno93spWTbHiMOuc7v_vWPWLOJ0b46aBXtm3hiy4ZPA/viewform?embedded=true";

  useEffect(() => {
    if (query.length > 1) {
      const filtered = registry
        .filter((p: any) => (p["Name "] || "").toLowerCase().includes(query.toLowerCase()))
        .map((p: any) => ({ 
            name: (p["Name "] || "").trim(), 
            category: p["Industry/Sector"] || "Elite Member",
            details: p["Details"] || "Cultural Architect & Pioneer"
        }))
        .slice(0, 6);
      setResults(filtered);
    } else { 
      setResults([]); 
    }
  }, [query]);

  const handleSelect = (person: any) => {
    setSelectedPerson(person);
    setViewingDossier(true);
    setInPipeline(false);
    setTimeout(() => {
      if (dossierRef.current) gsap.fromTo(dossierRef.current, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.6 });
    }, 50);
  };

  const enterInduction = async () => {
    try {
      const { data } = await supabase.from("verifications").select("status").ilike("name", selectedPerson.name).maybeSingle();
      setStep(data ? 2 : 1);
      setViewingDossier(false);
      setInPipeline(true);
    } catch { 
      setStep(1); 
      setInPipeline(true); 
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={portalRef} className="fixed inset-0 z-[100] flex flex-col items-center pt-[5vh] pb-20 overflow-y-auto px-6 md:px-12" style={{ background: `linear-gradient(160deg, ${DEEP} 0%, #0a1e30 100%)` }}>
      <RitualCanvas />

      {/* EXIT PORTAL */}
      <button onClick={onClose} style={{ position: "fixed", top: "24px", right: "24px", zIndex: 200, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(201,168,76,0.4)" }}>Exit_Archive</span>
        <div style={{ width: "40px", height: "40px", border: "1px solid rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="10" height="10" viewBox="0 0 12 12"><line x1="1" y1="1" x2="11" y2="11" stroke={GOLD} strokeWidth="1.2"/><line x1="11" y1="1" x2="1" y2="11" stroke={GOLD} strokeWidth="1.2"/></svg>
        </div>
      </button>

      {!selectedPerson ? (
        <div className="w-full max-w-2xl mt-20 text-center relative z-10">
          <h2 style={{ fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", letterSpacing: "-0.02em" }}>IDENTIFY <em style={{ fontStyle: "italic", WebkitTextStroke: `1px ${GOLD}`, color: "transparent" }}>YOURSELF</em></h2>
          <GlassCard style={{ marginTop: "30px" }}>
            <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="SEARCH NAME..." style={{ width: "100%", background: "transparent", border: "none", padding: "24px 30px", fontSize: "22px", fontWeight: 900, color: "#fff", outline: "none", letterSpacing: "0.1em" }} />
          </GlassCard>
          <div className="mt-4 space-y-2">
            {results.map((p, i) => (
              <button key={i} onClick={() => handleSelect(p)} className="w-full flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left">
                <div>
                  <div className="text-lg font-bold uppercase">{p.name}</div>
                  <div className="text-[8px] tracking-[0.3em] uppercase opacity-30">{p.category}</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke={GOLD} strokeWidth="1.2"/></svg>
              </button>
            ))}
          </div>
        </div>
      ) : viewingDossier ? (
        <div ref={dossierRef} className="w-full max-w-md mt-20 relative z-10 text-center">
          <GlassCard style={{ padding: "60px 40px" }}>
            <p className="text-[9px] tracking-[0.8em] text-gold uppercase font-black mb-4">◈ Induction Profile ◈</p>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-2 leading-none">{selectedPerson.name}</h2>
            <p className="text-[10px] tracking-[0.3em] uppercase opacity-40 mb-10">{selectedPerson.category}</p>
            <p className="text-sm italic text-white/60 leading-relaxed mb-10">"{selectedPerson.details}"</p>
            <button onClick={enterInduction} style={{ width: "100%", padding: "20px", background: GOLD, color: DEEP, fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
              [ ENTER PORTAL ]
            </button>
          </GlassCard>
          <button onClick={() => setSelectedPerson(null)} className="mt-8 text-[9px] uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity">← Back to Search</button>
        </div>
      ) : inPipeline && (
        <div className="w-full max-w-7xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 relative z-10">
          <div className="space-y-10">
            <div>
              <p className="text-[10px] tracking-[0.6em] text-gold uppercase font-black mb-2">Induction Sequence</p>
              <h2 className="text-5xl md:text-7xl font-black uppercase text-white leading-[0.85] tracking-tighter">{selectedPerson.name}</h2>
            </div>
            <div className="flex gap-10">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black ${step >= 2 ? 'bg-green-600 border-green-600' : 'border-gold text-gold'}`}>{step >= 2 ? "✓" : "01"}</div>
                <span className={`text-[9px] uppercase tracking-widest font-bold ${step >= 1 ? 'text-white' : 'opacity-20'}`}>Asset</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black ${step === 2 ? 'border-gold text-gold' : 'border-white/10 opacity-20'}`}>02</div>
                <span className={`text-[9px] uppercase tracking-widest font-bold ${step === 2 ? 'text-white' : 'opacity-20'}`}>RSVP</span>
              </div>
            </div>
            {step === 1 ? (
              <GlassCard 
                style={{ padding: "40px" }} 
                className="animate-in fade-in slide-in-from-bottom-5 duration-700"
              >
                <p className="text-xs text-white/40 uppercase tracking-widest mb-8 leading-loose">
                  To unlock your final documentation, collect your official asset and share your distribution link below.
                </p>
                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-gold font-black">Archive_Sync_Link</label>
                  <input value={submissionLink} onChange={e => setSubmissionLink(e.target.value)} placeholder="https://..." style={{ width: "100%", padding: "18px", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(201,168,76,0.1)`, color: "white", outline: "none" }} className="focus:border-gold transition-colors" />
                  <button 
                    onClick={async () => {
                      if (!submissionLink.includes("http")) return;
                      setIsSubmitting(true);
                      await supabase.from("verifications").insert([{ name: selectedPerson.name, proof_link: submissionLink, status: "pending" }]);
                      setStep(2); 
                      setIsSubmitting(false);
                    }} 
                    style={{ width: "100%", padding: "20px", background: GOLD, color: DEEP, fontWeight: 900, cursor: "pointer", border: "none", letterSpacing: "0.4em" }}
                  >
                    {isSubmitting ? "SYNCING..." : "UNLOCK FINAL RSVP"}
                  </button>
                </div>
              </GlassCard>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div style={{ position: "relative" }}>
                   <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50px", background: "#0a1e30", zIndex: 10 }}/>
                   <GlassCard style={{ padding: 0 }}>
                      <iframe src={GOOGLE_FORM_URL} width="100%" height="700" frameBorder="0" style={{ filter: "invert(1) hue-rotate(180deg) contrast(0.9) brightness(0.9)", background: "transparent" }}>Loading RSVP...</iframe>
                   </GlassCard>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full sticky top-10">
              <GlassCard style={{ padding: "24px" }}>
                <IconBadge person={selectedPerson}/>
              </GlassCard>
              <button onClick={() => { setSelectedPerson(null); setStep(1); setInPipeline(false); setViewingDossier(false); }} className="w-full mt-6 py-4 border border-white/5 text-[9px] uppercase tracking-[0.5em] opacity-20 hover:opacity-100 transition-opacity">
                [ Terminate Session ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}