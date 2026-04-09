"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import googleFormData from "../../data/google_form_data.json";
import masterRegistry from "../../data/registry.json";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiCheck, HiTrash, HiExternalLink, HiLockClosed, HiSearch, HiRefresh, 
  HiClock, HiX, HiExclamationCircle, HiUser, HiLink, HiLocationMarker, HiPhone, HiMail, HiIdentification, HiShieldCheck, HiChevronRight, HiSun, HiMoon, HiEye, HiEyeOff 
} from 'react-icons/hi';

export default function AdminNexus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Starting in Dark for high-end feel
  const [activeView, setActiveView] = useState<'main' | 'verified' | 'trash'>('main');
  const [liveRSVPs, setLiveRSVPs] = useState<any[]>([]);
  const [liveVerifications, setLiveVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  
  const [confirmingAction, setConfirmingAction] = useState<{ id: string, type: string, name: string } | null>(null);
  const [activeTimer, setActiveTimer] = useState<{ id: string, type: string, count: number } | null>(null);
  const [trashBin, setTrashBin] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const formatDriveUrl = (url: string) => {
    if (!url) return "";
    const match = url.match(/(id=|\/d\/|u\/0\/d\/|folders\/)([a-zA-Z0-9-_]+)/);
    return match && match[2] ? `https://docs.google.com/uc?export=view&id=${match[2]}` : url;
  };

  const fetchData = async () => {
    setLoading(true);
    const [rsvps, veris] = await Promise.all([
      supabase.from('rsvp_induction').select('*'),
      supabase.from('verifications').select('*')
    ]);
    setLiveRSVPs(rsvps.data || []);
    setLiveVerifications(veris.data || []);
    setLoading(false);
  };

  useEffect(() => { if (isAuthenticated) fetchData(); }, [isAuthenticated]);

  useEffect(() => {
    let interval: any;
    if (activeTimer && activeTimer.count > 0) {
      interval = setInterval(() => setActiveTimer(prev => prev ? { ...prev, count: prev.count - 1 } : null), 1000);
    } else if (activeTimer && activeTimer.count === 0) {
      executeFinalAction(activeTimer.id, activeTimer.type);
      setActiveTimer(null);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const executeFinalAction = async (id: string, type: string) => {
    const item = [...mergedData, ...trashBin].find(d => d.id === id);
    if (!item) return;

    if (type === 'delete') {
      setTrashBin(prev => [...prev, item]);
      if (selectedEntity?.id === id) setSelectedEntity(null);
      triggerNotify("ENTITY ARCHIVED");
    } else if (type === 'approve') {
      await supabase.from('verifications').upsert({ name: item.full_name, status: 'approved' }, { onConflict: 'name' });
      triggerNotify("VERIFIED"); fetchData();
    } else if (type === 'unverify') {
      await supabase.from('verifications').delete().eq('name', item.full_name);
      triggerNotify("REVERTED"); fetchData();
    } else if (type === 'purge') {
      setTrashBin(prev => prev.filter(t => t.id !== id));
      triggerNotify("PERMANENT PURGE");
    }
  };

  const mergedData = useMemo(() => {
    const statusMap: any = {};
    liveVerifications.forEach(v => { statusMap[v.name] = v.status; });
    const legacy = (googleFormData as any[] || []).filter(i => i !== null).map((item, idx) => {
      const name = (item["Full Name"] || item["Full Name_1"] || "Unknown").trim();
      return {
        id: `google-${idx}`, full_name: name, email: item["Email Address"], phone: item["Phone Number (Whatsapp enabled)"],
        location: item["Current Location (City/State)"], mode: item["Availability to attend the upcoming Smartan Culture Conference for 1000 GenZ Influencers:"],
        proof: item["Link to your social media verification post:"] || "", 
        picture: formatDriveUrl(item["Professional picture"]),
        age: item["Age Range"], gender: item["Gender"], timestamp: item["Timestamp"], 
        confirmation: item["Confirmation of Selection:"], source: 'LEGACY', status: statusMap[name] || 'pending'
      };
    });
    const current = liveRSVPs.map(item => ({
      id: `live-${item.id}`, full_name: item.full_name, email: item.email, phone: item.whatsapp_phone,
      location: item.location, mode: item.attendance_mode, proof: item.verification_link, picture: item.headshot_url,
      age: item.age_range, gender: item.gender, timestamp: item.created_at, confirmation: "Verified Live",
      source: 'LIVE', status: statusMap[item.full_name] || 'pending'
    }));
    const grouped: any = {};
    [...legacy, ...current].forEach(p => {
      if (!grouped[p.full_name]) grouped[p.full_name] = { ...p, duplicateCount: 1 };
      else grouped[p.full_name].duplicateCount += 1;
    });
    const regNames = new Set(Object.values(masterRegistry).flat().filter(p => p !== null).map((p: any) => (p["Name "] || p["Full Name"] || "").trim()));
    return Object.values(grouped).map((p: any) => ({ ...p, isRegisteredIn1000: regNames.has(p.full_name) }));
  }, [liveRSVPs, liveVerifications]);

  const displayData = useMemo(() => {
    if (activeView === 'trash') return trashBin.filter(d => d.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return mergedData.filter(d => {
      if (trashBin.some(t => t.id === d.id)) return false;
      const matches = d.full_name.toLowerCase().includes(searchQuery.toLowerCase());
      return activeView === 'verified' ? d.status === 'approved' && matches : d.status !== 'approved' && matches;
    });
  }, [activeView, mergedData, searchQuery, trashBin]);

  if (!isAuthenticated) return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-1000 ${darkMode ? 'bg-[#050B14]' : 'bg-[#FDFCF8]'}`}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-center p-12 md:p-16 rounded-[4rem] border backdrop-blur-3xl shadow-2xl transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
        <img src={darkMode ? "/images/logo-white.ico" : "/images/logo.png"} alt="Smartan House" className="h-16 w-auto mx-auto mb-10" />
        <h2 className={`text-2xl font-display font-black uppercase tracking-[0.2em] mb-10 italic ${darkMode ? 'text-white' : 'text-[#08263f]'}`}>Control <span className="text-smartan-orange">Nexus</span></h2>
        
        <form onSubmit={(e) => { e.preventDefault(); if(password === "cipher02040") setIsAuthenticated(true); else alert("Invalid Cipher"); }} className="relative group">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="ENTER CIPHER..." 
            className={`p-6 rounded-3xl outline-none focus:border-smartan-orange text-center tracking-[0.8em] font-mono w-72 text-xl transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-[#08263f]'}`} 
            value={password} onChange={e => setPassword(e.target.value)} 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-white/40 hover:text-smartan-orange' : 'text-black/40 hover:text-[#08263f]'}`}
          >
            {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
          </button>
        </form>
      </motion.div>
    </div>
  );

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-colors duration-1000 ${darkMode ? 'bg-[#050B14] text-white' : 'bg-[#FDFCF8] text-[#08263f]'}`}>
      
      {/* HEADER SECTION */}
      <header className={`px-12 py-8 border-b flex justify-between items-center z-[100] transition-all ${darkMode ? 'bg-[#050B14] border-white/10' : 'bg-[#FDFCF8] border-black/5'}`}>
        <div className="flex items-center gap-6">
          <img src={darkMode ? "/images/logo-white.ico" : "/images/logo.png"} alt="Logo" className="h-10 w-auto" />
          <div className="h-10 w-[1px] bg-current opacity-10" />
          <div>
            <h1 className="text-3xl font-display font-black uppercase italic tracking-tighter leading-none">Control <span className="text-smartan-orange">Nexus</span></h1>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 mt-1 italic">Vetting Intelligence Platform</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={toggleDarkMode} className={`p-4 rounded-2xl shadow-xl transition-all active:scale-90 ${darkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-black/5 text-[#08263f]'}`}>
            {darkMode ? <HiSun className="text-smartan-orange" size={20} /> : <HiMoon className="text-[#08263f]" size={20} />}
          </button>
          <div className={`flex p-1 rounded-2xl border transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
            {['main', 'verified', 'trash'].map(v => (
              <button key={v} onClick={() => { setActiveView(v as any); setSelectedEntity(null); }} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v ? (darkMode ? 'bg-white text-[#050B14]' : 'bg-[#08263f] text-white') : 'opacity-40 hover:opacity-100'}`}>
                {v} ({activeView === v ? displayData.length : '..'})
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: THE LIST */}
        <div className={`w-[450px] border-r flex flex-col transition-all ${darkMode ? 'bg-black/20 border-white/10' : 'bg-black/[0.02] border-black/5'}`}>
          <div className={`p-6 border-b transition-all ${darkMode ? 'border-white/10' : 'border-black/5'}`}>
            <div className="relative">
              <HiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-white/20' : 'text-black/20'}`} />
              <input className={`w-full border p-4 pl-12 rounded-xl text-xs font-bold uppercase tracking-widest outline-none transition-all ${darkMode ? 'bg-white/5 border-white/5 focus:border-smartan-orange/50 text-white' : 'bg-white border-black/10 focus:border-[#08263f] text-[#08263f]'}`} placeholder="FILTER NAME..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {displayData.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setSelectedEntity(item)}
                className={`w-full p-6 rounded-2xl border transition-all text-left flex items-center justify-between group ${selectedEntity?.id === item.id ? (darkMode ? 'bg-smartan-orange border-smartan-orange text-[#050B14]' : 'bg-[#08263f] border-[#08263f] text-white') : (darkMode ? 'bg-white/2 border-white/5 hover:bg-white/5 text-white' : 'bg-white border-black/5 hover:bg-black/5 text-[#08263f]')}`}
              >
                <div>
                  <h4 className="font-black uppercase tracking-tighter italic text-lg leading-none mb-1">{item.full_name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${selectedEntity?.id === item.id ? 'opacity-60' : 'opacity-40'}`}>{item.source}</span>
                    {item.duplicateCount > 1 && <span className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-black">!</span>}
                  </div>
                </div>
                <HiChevronRight className={`transition-transform ${selectedEntity?.id === item.id ? 'translate-x-1' : 'opacity-20'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: THE INTELLIGENCE PANEL */}
        <div className="flex-1 relative overflow-y-auto p-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedEntity ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key={selectedEntity.id} className="max-w-4xl mx-auto">
                
                <div className="flex items-start justify-between mb-12">
                   <div className="flex gap-10">
                      <div className={`w-40 h-40 rounded-[3rem] border overflow-hidden shadow-2xl flex-shrink-0 transition-all ${darkMode ? 'bg-[#08263f] border-white/10' : 'bg-white border-black/5'}`}>
                        {selectedEntity.picture ? <img src={selectedEntity.picture} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" /> : <HiUser className={`w-full h-full p-10 ${darkMode ? 'text-white/10' : 'text-black/10'}`} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                           <h2 className="text-6xl font-display font-black uppercase italic tracking-tighter leading-none">{selectedEntity.full_name}</h2>
                           <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedEntity.status === 'approved' ? 'bg-smartan-teal/10 text-smartan-teal border-smartan-teal/30' : 'bg-smartan-orange/10 text-smartan-orange border-smartan-orange/30'}`}>{selectedEntity.status}</div>
                        </div>
                        <div className="flex items-center gap-6 opacity-40">
                          <span className="text-[11px] font-black uppercase tracking-[0.5em]">{selectedEntity.source} RECORD</span>
                          <div className="w-1.5 h-1.5 bg-current opacity-20 rounded-full" />
                          <span className="text-[11px] font-black uppercase tracking-[0.5em]">{selectedEntity.timestamp}</span>
                        </div>
                      </div>
                   </div>
                </div>

                <div className={`grid grid-cols-2 gap-8 p-12 rounded-[4rem] border mb-10 transition-all ${darkMode ? 'bg-white/2 border-white/5' : 'bg-black/5 border-black/5'}`}>
                   <div className="space-y-1"><span className={`text-[10px] font-black uppercase tracking-widest block opacity-40 ${darkMode ? 'text-smartan-teal' : 'text-[#1b9a72]'}`}>Location</span><p className="text-xl font-bold uppercase italic tracking-tighter">{selectedEntity.location}</p></div>
                   <div className="space-y-1"><span className={`text-[10px] font-black uppercase tracking-widest block opacity-40 ${darkMode ? 'text-smartan-teal' : 'text-[#1b9a72]'}`}>RSVP Mode</span><p className="text-xl font-bold uppercase italic tracking-tighter text-smartan-orange">{selectedEntity.mode}</p></div>
                   <div className="space-y-1"><span className={`text-[10px] font-black uppercase tracking-widest block opacity-40 ${darkMode ? 'text-smartan-teal' : 'text-[#1b9a72]'}`}>Contact Number</span><p className="text-xl font-bold italic tracking-tighter">{selectedEntity.phone}</p></div>
                   <div className="space-y-1"><span className={`text-[10px] font-black uppercase tracking-widest block opacity-40 ${darkMode ? 'text-smartan-teal' : 'text-[#1b9a72]'}`}>Email Hash</span><p className="text-sm font-mono opacity-60">{selectedEntity.email}</p></div>
                   
                   <div className="col-span-2 pt-10 border-t border-current/5 mt-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest block mb-4 opacity-40 ${darkMode ? 'text-smartan-pink' : 'text-smartan-teal'}`}>Deep Intelligence</span>
                      <p className="text-sm font-medium opacity-80 leading-relaxed uppercase italic tracking-wider">
                        {selectedEntity.confirmation} <br/> 
                        <span className="font-black mt-2 inline-block">Segment Analysis: {selectedEntity.age} // {selectedEntity.gender}</span>
                        {!selectedEntity.isRegisteredIn1000 && <span className="text-smartan-pink block mt-4 font-black">! SECURITY WARNING: ENTITY NOT IN REGISTRY</span>}
                      </p>
                   </div>
                </div>

                <div className="flex gap-6">
                  {selectedEntity.proof && (
                    <a href={selectedEntity.proof} target="_blank" className={`flex-1 flex items-center justify-center gap-4 py-6 rounded-3xl text-[11px] font-black uppercase tracking-widest border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-smartan-orange hover:text-[#050B14]' : 'bg-white border-black/10 text-[#08263f] hover:bg-[#08263f] hover:text-white shadow-xl'}`}>Review Social Post <HiExternalLink size={20} /></a>
                  )}
                  
                  {activeTimer?.id === selectedEntity.id ? (
                     <button onClick={() => setActiveTimer(null)} className="flex-1 bg-smartan-pink py-6 rounded-3xl text-xs font-black animate-pulse flex items-center justify-center gap-4 uppercase tracking-widest text-white shadow-2xl shadow-smartan-pink/40"><HiClock size={22} /> Abort Action ({activeTimer?.count}s)</button>
                  ) : (
                    <div className="flex gap-4 flex-1">
                       <button onClick={() => setConfirmingAction({ id: selectedEntity.id, type: selectedEntity.status === 'approved' ? 'unverify' : 'approve', name: selectedEntity.full_name })} className={`flex-1 py-6 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${selectedEntity.status === 'approved' ? (darkMode ? 'bg-smartan-pink/20 text-smartan-pink border border-smartan-pink/30 hover:bg-smartan-pink hover:text-white' : 'bg-white border border-smartan-pink/40 text-smartan-pink hover:bg-smartan-pink hover:text-white') : (darkMode ? 'bg-smartan-teal text-[#050B14] hover:bg-white' : 'bg-[#1b9a72] text-white shadow-2xl hover:bg-[#08263f]')}`}>
                          {selectedEntity.status === 'approved' ? 'Revert to Main' : 'Verify Entity'}
                       </button>
                       <button onClick={() => setConfirmingAction({ id: selectedEntity.id, type: activeView === 'trash' ? 'purge' : 'delete', name: selectedEntity.full_name })} className={`p-6 rounded-3xl transition-all ${darkMode ? 'bg-white/5 border-white/5 text-white/20 hover:bg-smartan-pink hover:text-white' : 'bg-white border border-black/10 text-black/20 hover:bg-smartan-pink hover:text-white'}`}><HiTrash size={24} /></button>
                    </div>
                  )}
                </div>

              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-center opacity-10">
                <div>
                  <HiShieldCheck size={120} className="mx-auto mb-8" />
                  <p className="text-2xl font-black uppercase tracking-[1em]">Scanning Active: Select Entity</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmingAction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-xl p-8">
            <div className={`p-16 rounded-[5rem] max-w-xl w-full text-center shadow-2xl border transition-all ${darkMode ? 'bg-[#08263f] border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)]' : 'bg-white border-black/5 shadow-[0_40px_100px_rgba(0,0,0,0.1)]'}`}>
              <HiExclamationCircle className="text-smartan-orange text-[100px] mx-auto mb-10" />
              <h2 className={`text-4xl font-display font-black uppercase italic mb-6 tracking-tighter ${darkMode ? 'text-white' : 'text-[#08263f]'}`}>Confirm Signal</h2>
              <p className={`mb-12 uppercase text-[10px] tracking-[0.5em] leading-loose ${darkMode ? 'text-white/40' : 'text-black/40'}`}>Requesting {confirmingAction.type} for <br/><span className={`${darkMode ? 'text-smartan-orange' : 'text-[#08263f]'} font-bold text-xl tracking-normal`}>{confirmingAction.name}</span></p>
              <div className="flex gap-6">
                <button onClick={() => setConfirmingAction(null)} className={`flex-1 py-7 rounded-[2rem] font-black uppercase text-[11px] tracking-widest border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-black/5 border-black/10 text-[#08263f] hover:bg-black/10'}`}>Abort</button>
                <button onClick={() => { setActiveTimer({ id: confirmingAction.id, type: confirmingAction.type, count: 5 }); setConfirmingAction(null); }} className="flex-1 py-7 rounded-[2rem] bg-smartan-orange text-[#050B14] font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-smartan-orange/40 hover:scale-[1.02] active:scale-95 transition-all">Execute Signal</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{notification && <motion.div initial={{ y: -50 }} animate={{ y: 30 }} exit={{ y: -50 }} className="fixed top-0 left-1/2 -translate-x-1/2 bg-smartan-orange text-[#050B14] px-12 py-4 rounded-full font-black text-[10px] z-[500] shadow-2xl uppercase italic tracking-widest">{notification}</motion.div>}</AnimatePresence>
    </div>
  );
}