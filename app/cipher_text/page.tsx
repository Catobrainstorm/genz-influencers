"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheck, HiTrash, HiExternalLink, HiEye, HiEyeOff, HiLockClosed, HiSearch, HiIdentification, HiLocationMarker, HiUserCircle, HiPhone, HiMail, HiCalendar } from 'react-icons/hi';

export default function AdminNexus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<'verifications' | 'rsvps'>('verifications');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "cipher02040") setIsAuthenticated(true);
    else triggerNotify("INVALID CIPHER ACCESS DENIED");
  };

  const fetchData = async () => {
    setLoading(true);
    const table = activeTab === 'verifications' ? 'verifications' : 'rsvp_induction';
    const { data: result, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (!error) setData(result || []);
    setLoading(false);
  };

  useEffect(() => { if (isAuthenticated) fetchData(); }, [isAuthenticated, activeTab]);

  const filteredData = data.filter(item => 
    (item.name || item.full_name)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (id: any, name: string) => {
    const { error } = await supabase.from('verifications').update({ status: 'approved' }).eq('id', id);
    if (!error) {
        triggerNotify(`${name} APPROVED`);
        fetchData();
    }
  };

  const handleDelete = async (id: any, name: string) => {
    // Note: If this fails, check your DELETE RLS policy in Supabase
    const table = activeTab === 'verifications' ? 'verifications' : 'rsvp_induction';
    const field = activeTab === 'verifications' ? 'name' : 'full_name';
    
    // Attempting surgical wipe across both tables for consistency
    const { error: err1 } = await supabase.from('verifications').delete().eq('name', name);
    const { error: err2 } = await supabase.from('rsvp_induction').delete().eq('full_name', name);

    if (!err1 && !err2) {
        triggerNotify(`${name} PURGED`);
        fetchData();
    } else {
        triggerNotify("PURGE FAILED: CHECK POLICIES");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#02060E] flex items-center justify-center font-sans px-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md text-center">
          <div className="mb-10">
            <HiLockClosed className="text-orange-500 text-5xl mx-auto mb-4" />
            <h1 className="text-white text-3xl font-black uppercase italic tracking-tighter">Nexus <span className="text-orange-500 text-sm align-top">SYS</span></h1>
          </div>
          <form onSubmit={handleLogin} className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-orange-500 text-center tracking-[0.5em]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
              {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02060E] text-white p-6 lg:p-12 font-sans selection:bg-orange-500">
      
      {/* GLOBAL NOTIFICATION */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-black px-8 py-3 rounded-full font-black text-xs tracking-widest shadow-2xl">
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="flex items-center gap-6">
            <div className="text-left">
                <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Control <span className="text-orange-500">Nexus</span></h1>
                <div className="flex items-center gap-4 mt-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">Live Intelligence</span>
                    <div className="h-px w-20 bg-white/10" />
                    <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">{data.length} Total Entities</span>
                </div>
            </div>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <button onClick={() => setActiveTab('verifications')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'verifications' ? 'bg-orange-500 text-black' : 'opacity-40 hover:opacity-100'}`}>
              VerificationDesk ({activeTab === 'verifications' ? data.length : '..'})
            </button>
            <button onClick={() => setActiveTab('rsvps')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'rsvps' ? 'bg-orange-500 text-black' : 'opacity-40 hover:opacity-100'}`}>
              RSVP_Intelligence ({activeTab === 'rsvps' ? data.length : '..'})
            </button>
          </div>
        </header>

        <div className="relative mb-10">
          <HiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text" 
            placeholder="SCAN BY NAME..." 
            className="w-full bg-white/5 border border-white/5 p-6 pl-16 rounded-3xl outline-none focus:border-orange-500/50 transition-all italic font-bold tracking-widest uppercase text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-6">
          <AnimatePresence>
            {filteredData.map((item) => (
              <motion.div layout key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] hover:border-orange-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8 group">
                
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-3xl font-black uppercase italic group-hover:text-orange-500 transition-colors">{item.name || item.full_name}</h3>
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${item.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                      {item.status || 'Pending'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase opacity-30 font-black tracking-widest flex items-center gap-1"><HiUserCircle /> Identity</span>
                        <span className="text-xs font-bold uppercase italic">{item.category || item.gender || 'Gen Z'} // {item.age_range || '18-25'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase opacity-30 font-black tracking-widest flex items-center gap-1"><HiLocationMarker /> Hub</span>
                        <span className="text-xs font-bold uppercase italic">{item.location || 'Unknown'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase opacity-30 font-black tracking-widest flex items-center gap-1"><HiIdentification /> Mode</span>
                        <span className="text-xs font-bold uppercase italic text-orange-400">{item.attendance_mode || 'Verification'}</span>
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="text-[9px] uppercase opacity-30 font-black tracking-widest flex items-center gap-1"><HiMail /> Link</span>
                        <span className="text-[10px] font-mono opacity-60 truncate">{item.email || item.proof_link}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {activeTab === 'verifications' ? (
                    <a href={item.proof_link} target="_blank" className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/10 hover:bg-blue-500 hover:text-black transition-all">
                      <HiExternalLink size={24} />
                    </a>
                  ) : (
                    <div className="flex flex-col text-right pr-4 border-r border-white/10 mr-4">
                        <span className="text-xs font-black">{item.whatsapp_phone}</span>
                        <span className="text-[9px] opacity-30 uppercase tracking-widest">Contact Hash</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {activeTab === 'verifications' && item.status !== 'approved' && (
                      <button onClick={() => handleApprove(item.id, item.name)} className="p-4 bg-green-500 text-black rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl shadow-green-500/20">
                        <HiCheck size={24} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(item.id, item.name || item.full_name)} className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                      <HiTrash size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}