"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { HiArrowRight, HiCheckCircle, HiCloudUpload } from 'react-icons/hi';
// ADDED: Import the supabase client we created
import { supabase } from "../../lib/supabaseClient";

export default function RSVPForm({ selectedName, verificationLink, darkMode }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [attendance, setAttendance] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [gender, setGender] = useState("");
  const [confirmedSelection, setConfirmedSelection] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // ADDED: Loading state to prevent double clicking
  const [isSubmitting, setIsSubmitting] = useState(false);

  // COLORS
  const ORANGE = "#f7961d";
  const NAVY = "#08263f";

  const inputStyles = `w-full border-b-2 bg-transparent py-4 text-[clamp(1rem,1.4vw,1.3rem)] font-bold outline-none transition-all ${
    darkMode ? 'border-white/10 focus:border-[#f7961d] text-white' : 'border-[#08263f]/10 focus:border-[#08263f] text-[#08263f]'
  }`;

  const labelStyles = `text-[clamp(10px,0.8vw,12px)] font-black uppercase tracking-[0.5em] mb-4 block ${
    darkMode ? 'text-[#f7961d]' : 'text-[#08263f]/60'
  }`;

  // ADDED: The Submission Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = "";

      // 1. UPLOAD IMAGE TO SUPABASE STORAGE
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        let { error: uploadError } = await supabase.storage
          .from('induction_headshots')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('induction_headshots').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      // 2. INSERT ALL DATA INTO SUPABASE TABLE
      const { error } = await supabase
        .from('rsvp_induction')
        .insert([
          {
            full_name: selectedName,
            email: (e.target as any).email.value,
            whatsapp_phone: (e.target as any).phone.value,
            location: (e.target as any).location.value,
            age_range: ageRange,
            gender: gender,
            attendance_mode: attendance,
            verification_link: verificationLink,
            headshot_url: imageUrl,
            is_synced_to_drive: false // For our Google Script relay
          },
        ]);

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error: any) {
      alert("Induction Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40 space-y-10 max-w-2xl mx-auto">
        <HiCheckCircle className="text-smartan-teal text-9xl mx-auto" />
        <h2 className="text-5xl font-display font-black uppercase tracking-tighter">RSVP Confirmed</h2>
        <p className="text-xl font-medium opacity-70 italic leading-relaxed">
          Your induction into the <span className="font-bold text-[#f7961d]">Prestigious 1000</span> is being processed. Check your email shortly.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto pt-40 md:pt-52 pb-40 relative z-10">
      
      {/* 1. THE FULL MANIFESTO */}
      <div className="mb-24 space-y-10">
        <h2 className="text-[clamp(2.5rem,7vw,6rem)] font-display font-black uppercase leading-[0.85] tracking-tighter">
          RSVP: <br/><span className="text-[#f7961d]">Prestigious 1000</span>
        </h2>
        
        <div className="space-y-8 max-w-4xl text-lg md:text-xl font-medium leading-relaxed opacity-90">
          <p>The Smartan Culture Conference is a gathering of Gen Z’s top 1000 influencers, brought together in a culture-shifting convergence of the stars—an assembly designed to map the next 40 years of Nigerian Gen Z culture, reshaping youth culture from street to suite with intention, clarity, and long-term vision.</p>
          <p className="font-black text-[#f7961d] uppercase tracking-widest">May 30th, 2026.</p>
          <p>On that stage, we will officially launch <strong>The Optimus Trybe</strong>: a movement dedicated to building strong, resilient communities of support and sustaining a cultural renaissance for the new face of Nigeria, powered and defined by the next generation.</p>
          <p className="italic">As part of Gen Z’s Prestigious 1000, this is your honorary invitation to join this historic moment and lend your voice to a future that will outlive us.</p>
          <p className="text-sm font-black uppercase tracking-[0.5em] text-[#ec297b] border-t border-current/10 pt-6">Please RSVP by April 25th.</p>
        </div>
      </div>

      {/* UPDATED: form now calls handleSubmit */}
      <form onSubmit={handleSubmit} className="space-y-24">
        
        {/* 2. IDENTITY FIELDS */}
        <div className="grid md:grid-cols-2 gap-x-20 gap-y-16">
          <div className="group"><label className={labelStyles}>Email Address *</label><input required name="email" type="email" placeholder="OFFICIAL@DOMAIN.COM" className={inputStyles} /></div>
          <div className="group"><label className={labelStyles}>Full Name *</label><input required name="fullname" defaultValue={selectedName} className={inputStyles} /></div>
          <div className="group"><label className={labelStyles}>WhatsApp Phone *</label><input required name="phone" type="tel" className={inputStyles} /></div>
          <div className="group"><label className={labelStyles}>Current Location *</label><input required name="location" className={inputStyles} /></div>
        </div>

        {/* 3. SELECTION: AGE RANGE & GENDER */}
        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <label className={labelStyles}>Age Range *</label>
            <div className="grid grid-cols-2 gap-3">
              {["15 - 17", "18 - 20", "21 - 22", "23 - 25"].map(r => (
                <button 
                  type="button" key={r} onClick={()=>setAgeRange(r)} 
                  style={{ 
                    backgroundColor: ageRange === r ? ORANGE : 'transparent',
                    color: ageRange === r ? '#fff' : 'inherit',
                    borderColor: ageRange === r ? ORANGE : 'rgba(0,0,0,0.1)'
                  }}
                  className="py-4 rounded-xl border-2 font-black text-xs transition-all active:scale-95"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <label className={labelStyles}>Gender *</label>
            <div className="grid grid-cols-3 gap-3">
              {["Male", "Female", "Others"].map(g => (
                <button 
                  type="button" key={g} onClick={()=>setGender(g)} 
                  style={{ 
                    backgroundColor: gender === g ? ORANGE : 'transparent',
                    color: gender === g ? '#fff' : 'inherit',
                    borderColor: gender === g ? ORANGE : 'rgba(0,0,0,0.1)'
                  }}
                  className="py-4 rounded-xl border-2 font-black text-xs transition-all active:scale-95"
                >
                  {g.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. PROFESSIONAL PICTURE */}
        <div className={`p-8 md:p-12 rounded-[2.5rem] border-2 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-2xl'}`}>
          <label className={labelStyles}>Professional Picture *</label>
          <div className="relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl">
            <input required name="picture" type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <HiCloudUpload size={40} className="mb-4 opacity-20" />
            <p className="text-sm font-bold opacity-40 uppercase tracking-widest text-center">{file ? `Asset Loaded: ${file.name}` : "Upload induction photo (Max 100MB)" }</p>
          </div>
        </div>

        {/* 5. PARTICIPATION CONFIRMATION */}
        <div className="space-y-10">
            <div className={`p-8 md:p-12 rounded-[2.5rem] border-2 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-2xl'}`}>
                <label className={labelStyles}>Confirmation of Selection *</label>
                <button 
                  type="button" 
                  onClick={() => setConfirmedSelection(!confirmedSelection)} 
                  className="flex items-center text-left gap-6 w-full group"
                >
                    <div 
                      style={{ backgroundColor: confirmedSelection ? ORANGE : 'transparent', borderColor: confirmedSelection ? ORANGE : 'currentColor' }}
                      className="min-w-[30px] h-[30px] border-2 rounded-lg flex items-center justify-center transition-all"
                    >
                        {confirmedSelection && <HiCheckCircle className="text-white" size={22} />}
                    </div>
                    <span className={`text-lg md:text-xl font-bold leading-tight ${confirmedSelection ? 'opacity-100' : 'opacity-60'}`}>
                      I confirm that I have been notified of my selection as one of the GenZ 1,000.
                    </span>
                </button>
            </div>

            <div className={`p-8 md:p-12 rounded-[2.5rem] border-2 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-2xl'}`}>
                <label className={labelStyles}>Availability to attend *</label>
                <div className="grid gap-4 mt-8">
                    {[
                        { id: "Physical", label: "I will be physically present (Highly Recommended)" },
                        { id: "Virtual", label: "I will join virtually because of distance outside Lagos" }
                    ].map((opt) => (
                        <button 
                          key={opt.id} type="button" onClick={() => setAttendance(opt.id)} 
                          style={{ 
                            backgroundColor: attendance === opt.id ? ORANGE : 'transparent',
                            color: attendance === opt.id ? '#fff' : 'inherit',
                            borderColor: attendance === opt.id ? ORANGE : 'rgba(0,0,0,0.1)'
                          }}
                          className="flex items-center gap-6 p-6 md:p-8 rounded-2xl border-2 text-left transition-all active:scale-[0.99]"
                        >
                            <div className="min-w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center" style={{ borderColor: attendance === opt.id ? '#fff' : 'currentColor' }}>
                                {attendance === opt.id && <div className="w-3 h-3 bg-white rounded-full" />}
                            </div>
                            <span className="font-black text-lg md:text-2xl tracking-tighter">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <button 
          type="submit" 
          // UPDATED: added isSubmitting check
          disabled={!confirmedSelection || !attendance || !gender || isSubmitting}
          className={`group w-full py-10 rounded-full font-black text-xl md:text-3xl transition-all shadow-2xl flex items-center justify-center gap-8 disabled:opacity-20 ${
            darkMode ? 'bg-white text-black hover:bg-[#f7961d] hover:text-white' : 'bg-[#08263f] text-white hover:bg-[#f7961d]'
          }`}
        >
          {isSubmitting ? "PROCESSING..." : "FINALIZE INDUCTION"} <HiArrowRight />
        </button>
      </form>
    </motion.div>
  );
}