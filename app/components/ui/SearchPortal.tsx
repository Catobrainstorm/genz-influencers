"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import registry from "../../../data/registry.json";
import RSVPForm from "./RSVPForm";
import { HiArrowRight, HiDownload, HiArrowLeft, HiMoon, HiSun, HiCheckCircle } from 'react-icons/hi';
import { supabase } from "../../lib/supabaseClient";

export default function SearchPortal({ isOpen, onClose, darkMode, toggleDarkMode }: any) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [step, setStep] = useState(1); 
  const [verificationLink, setVerificationLink] = useState("");
  const [approvedNames, setApprovedNames] = useState<string[]>([]); // Tracking approved influencers
  const badgeRef = useRef<HTMLDivElement>(null);

  // FETCH APPROVED NAMES FROM SUPABASE
  useEffect(() => {
    const fetchApproved = async () => {
      const { data, error } = await supabase
        .from('verifications')
        .select('name')
        .eq('status', 'approved');
      
      if (!error && data) {
        setApprovedNames(data.map(item => item.name));
      }
    };
    if (isOpen) fetchApproved();
  }, [isOpen]);

  useEffect(() => {
    const completeArray = (registry as any)["Complete "] || [];
    const formResponses = (registry as any)["Form Responses 1"] || [];
    const combinedData = [...completeArray, ...formResponses];

    if (query.length > 1) {
      const filtered = combinedData.filter((p: any) => {
        if (!p) return false;
        const name = p["Name "] || p["Full Name"] || p["Name"] || p["name"];
        return name && typeof name === 'string' && name.toLowerCase().includes(query.toLowerCase());
      }).map((p: any) => ({ 
        name: (p["Name "] || p["Full Name"] || p["Name"] || p["name"] || "").toString().trim() 
      }));

      const uniqueNames = new Set();
      const distinctResults = filtered.filter(p => {
        if (!p.name || uniqueNames.has(p.name)) return false;
        uniqueNames.add(p.name);
        return true;
      }).slice(0, 5);

      setResults(distinctResults);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleDownload = async () => {
    if (badgeRef.current) {
      const canvas = await html2canvas(badgeRef.current, { backgroundColor: null, useCORS: true, scale: 4 });
      const link = document.createElement("a");
      link.download = `SCC_${selectedPerson?.name?.replace(/\s+/g, '')}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const handleBack = () => {
    if (step === 1) onClose();
    else setStep(step - 1);
  };

  const handleSaveVerification = async () => {
    if (verificationLink.includes("http")) {
      try {
        const { error } = await supabase
          .from('verifications')
          .insert([
            {
              name: selectedPerson.name,
              proof_link: verificationLink,
              status: 'pending'
            },
          ]);

        if (error) throw error;
        setStep(5);
      } catch (error: any) {
        console.error("Error saving verification:", error.message);
        setStep(5);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 35, stiffness: 220 }}
        className={`fixed inset-0 z-[9999] overflow-y-auto font-sans transition-colors duration-1000 ${darkMode ? 'bg-[#050B14] text-white' : 'bg-[#FDFCF8] text-[#08263f]'}`}
      >
        <header className="fixed top-0 inset-x-0 h-24 md:h-32 px-6 md:px-12 lg:px-20 flex items-center justify-between z-[10000]">
          <div className="flex items-center">
             <img 
               src={darkMode ? "/images/logo-white.ico" : "/images/logo.png"} 
               alt="The Smartan House" 
               className="h-8 md:h-12 lg:h-14 w-auto object-contain transition-all duration-500"
             />
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
             <button 
                onClick={toggleDarkMode}
                className={`p-3 md:p-4 rounded-2xl shadow-xl transition-all active:scale-90 pointer-events-auto ${darkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-black/5 text-[#08263f]'}`}
             >
                {darkMode ? <HiSun className="text-smartan-orange" size={20} /> : <HiMoon className="text-[#08263f]" size={20} />}
             </button>

             <button 
               onClick={handleBack} 
               className={`group flex items-center gap-3 md:gap-4 p-2 md:p-3 pr-4 md:pr-6 rounded-2xl transition-all duration-500 active:scale-90 pointer-events-auto ${
                 darkMode 
                 ? 'bg-[#050B14]/80 backdrop-blur-md border border-white/10 text-white shadow-2xl' 
                 : 'bg-white/90 backdrop-blur-md border border-black/5 text-[#08263f] shadow-xl'
               }`}
             >
               <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl transition-all duration-500 ${
                 darkMode ? 'bg-white/5 group-hover:bg-smartan-orange' : 'bg-black/5 group-hover:bg-[#08263f] group-hover:text-white'
               }`}>
                 <HiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
               </div>
               <div className="hidden sm:flex flex-col items-start text-left">
                 <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] transition-all ${darkMode ? 'text-smartan-orange/80' : 'text-smartan-teal'}`}>Return</span>
                 <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.1em] whitespace-nowrap">Previous Step</span>
               </div>
             </button>
          </div>
        </header>

        <div className="container mx-auto px-6 md:px-20 lg:px-32 min-h-screen flex items-center pt-32 pb-24 md:pt-48 md:pb-40 relative">
          
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-4xl">
              <div className="flex items-center gap-3 mb-8">
                 <div className={`h-[1px] w-12 ${darkMode ? 'bg-smartan-pink' : 'bg-smartan-teal'}`} />
                 <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${darkMode ? 'text-smartan-pink' : 'text-smartan-teal'}`}>Step 01 // Search</span>
              </div>
              <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] font-display font-black leading-[0.9] tracking-tighter uppercase mb-8 text-left">
                Identify <br/> 
                <span className="text-transparent italic" style={{ WebkitTextStroke: darkMode ? '1.2px white' : '1.5px #08263f' }}>Yourself</span>
              </h2>
              <div className="relative max-w-2xl">
                <input 
                  autoFocus type="text" value={query} onChange={e=>setQuery(e.target.value)} 
                  placeholder="TYPE YOUR NAME..." 
                  className={`w-full border-b-2 bg-transparent py-4 md:py-8 text-xl md:text-4xl font-black outline-none transition-all placeholder:opacity-20 text-left ${darkMode ? 'border-white/10 focus:border-smartan-orange' : 'border-[#08263f]/10 focus:border-[#08263f]'}`} 
                />
              </div>
              <div className="grid gap-4 mt-10 max-w-xl text-left">
                {results.map((p, i) => {
                  const isApproved = approvedNames.includes(p.name);
                  return (
                    <button 
                      key={i} 
                      disabled={isApproved}
                      onClick={() => { setSelectedPerson(p); setStep(2); }} 
                      className={`w-full flex justify-between items-center p-5 md:p-8 rounded-3xl border-2 transition-all group active:scale-[0.98] ${
                        isApproved ? 'opacity-40 cursor-not-allowed border-white/5' : 
                        darkMode ? 'bg-white/5 border-white/5 hover:border-smartan-orange' : 'bg-white border-black/5 hover:border-[#08263f] shadow-2xl'
                      }`}
                    >
                      <span className={`text-lg md:text-xl font-black uppercase tracking-tight ${isApproved ? 'line-through' : ''}`}>
                        {p.name}
                      </span>
                      {isApproved ? (
                        <HiCheckCircle className="text-green-500" size={24} />
                      ) : (
                        <HiArrowRight className="text-smartan-orange group-hover:translate-x-2 transition-transform" size={24} />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-4xl text-left">
              <div className="flex items-center gap-3 mb-8">
                 <div className="h-[1px] w-12 bg-smartan-teal" />
                 <span className="text-smartan-teal text-[10px] font-black uppercase tracking-[0.4em]">Identity Verified</span>
              </div>
              <h2 className="text-[clamp(3rem,8vw,7rem)] font-display font-black leading-none tracking-tighter uppercase mb-8">{selectedPerson?.name}</h2>
              <p className="text-xl md:text-4xl font-display font-bold opacity-60 uppercase tracking-tighter mb-12 max-w-2xl leading-tight">
                You are one of the <span className="text-smartan-orange italic">Prestigious 1000</span> Gen-Z Influencers.
              </p>
              <button onClick={() => setStep(3)} className={`px-12 py-7 rounded-full font-black text-xl md:text-2xl transition-all shadow-2xl active:scale-95 ${darkMode ? 'bg-white text-black hover:bg-smartan-orange hover:text-white' : 'bg-[#08263f] text-white hover:bg-smartan-orange'}`}>
                GENERATE MY ASSET
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-6xl">
               <div className="flex items-center gap-3 mb-8">
                 <div className="h-[1px] w-12 bg-smartan-orange" />
                 <span className="text-smartan-orange text-[10px] font-black uppercase tracking-[0.4em]">Step 02 // Asset Mission</span>
              </div>
               <div className="grid lg:grid-cols-2 gap-16 md:gap-32 items-center">
                  <div ref={badgeRef} className="relative aspect-square max-w-[500px] mx-auto lg:mx-0 shadow-[0_50px_100px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden bg-white">
                    <img src="/images/scc-badge.png" className="w-full h-full object-contain" alt="SCC Badge" />
                    <div className="absolute inset-x-0 top-[25.5%] flex items-center justify-center px-12 text-center">
                       <span className={`font-display font-black text-black uppercase tracking-tighter leading-[0.85] ${selectedPerson?.name?.length > 20 ? 'text-xl' : 'text-3xl'}`}>
                         {selectedPerson?.name}
                       </span>
                    </div>
                  </div>
                  <div className="space-y-10 text-left">
                    <h4 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-tight">Your Asset <br/> is Ready</h4>
                    <p className="text-lg md:text-2xl font-medium opacity-80 italic leading-relaxed">
                        1. <span className="font-black text-smartan-orange">Download</span> your badge below. <br/>
                        2. <span className="font-black text-smartan-orange">Post</span> it on <span className="font-bold underline">X, Instagram, LinkedIn, or Facebook</span>. <br/>
                        3. <span className="font-black text-smartan-orange">Copy the Link</span> of that post. <br/>
                        4. Click "I Have Posted It" to complete your RSVP.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t-2 border-current/10">
                      <button onClick={handleDownload} className="w-full flex items-center justify-center gap-4 bg-smartan-orange text-[#08263f] py-7 rounded-3xl font-black text-lg hover:scale-[1.02] transition-all shadow-xl">
                        <HiDownload size={24}/> <span className="uppercase leading-none">Download <br/>Badge</span>
                      </button>
                      <button onClick={() => setStep(4)} className={`w-full py-7 rounded-3xl border-2 font-black text-lg transition-all ${darkMode ? 'border-white hover:bg-white hover:text-black' : 'border-[#08263f]'}`}>
                        I HAVE POSTED IT
                      </button>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full max-w-4xl space-y-12">
               <div className="flex items-center gap-3 mb-12">
                 <div className="h-[1px] w-12 bg-smartan-pink" />
                 <span className="text-smartan-pink text-[10px] font-black uppercase tracking-[0.4em]">Step 03 // Verification Link</span>
              </div>
               <h2 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.8] text-left">Paste <br/> <span className="italic opacity-30">The Link</span></h2>
               <div className="space-y-12 max-w-3xl">
                  <input 
                    value={verificationLink} 
                    onChange={e=>setVerificationLink(e.target.value)} 
                    placeholder="PASTE LINK (HTTPS://...)" 
                    className={`w-full border-b-2 bg-transparent py-8 text-2xl md:text-5xl font-black outline-none transition-all ${darkMode ? 'border-white/10 focus:border-smartan-pink text-white' : 'border-[#08263f]/10 focus:border-smartan-teal text-[#08263f]'}`} 
                  />
                  <button onClick={handleSaveVerification} className={`px-16 py-8 rounded-full font-black text-xl md:text-2xl transition-all shadow-2xl active:scale-95 ${darkMode ? 'bg-white text-black hover:bg-smartan-orange hover:text-white' : 'bg-[#08263f] text-white hover:bg-smartan-orange'}`}>
                    CONTINUE TO RSVP
                  </button>
               </div>
            </motion.div>
          )}

          {step === 5 && selectedPerson && (
            <div className="w-full max-w-5xl">
              <RSVPForm selectedName={selectedPerson.name} verificationLink={verificationLink} darkMode={darkMode} />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}