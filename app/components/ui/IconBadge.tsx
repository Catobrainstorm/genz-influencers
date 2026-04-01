"use client";
import { useEffect, useRef } from "react";

export default function IconBadge({ person }: { person: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = "/images/scc-badge.png"; 

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const name = person.name.toUpperCase().trim();
      ctx.fillStyle = "black";
      ctx.textAlign = "center";

      // --- THE DYNAMIC ALIGNMENT ENGINE ---
      const isLongName = name.length > 15;
      
      if (isLongName) {
        // LONG NAME: 2-Line Mode
        ctx.font = "bold 45px Syne, sans-serif";
        
        const words = name.split(" ");
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(" ");
        const line2 = words.slice(mid).join(" ");

        // SHIFTED UP: line1 at 350, line2 at 400
        ctx.fillText(line1, canvas.width / 2, 340); 
        ctx.fillText(line2, canvas.width / 2, 390); 
      } else {
        // SHORT NAME: 1-Line Mode
        ctx.font = "bold 70px Syne, sans-serif";
        // SHIFTED UP: Sitting at 380 for perfect vertical balance
        ctx.fillText(name, canvas.width / 2, 380); 
      }
    };
  }, [person]);

  const downloadAsset = () => {
    const link = document.createElement("a");
    link.download = `SCC_INDUCTION_${person.name.replace(/\s+/g, '_')}.png`;
    link.href = canvasRef.current?.toDataURL("image/png") || "";
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-1000 relative z-[150]">
      <div className="relative group p-1 bg-white border border-white/10 rounded-sm shadow-2xl">
        <canvas 
          ref={canvasRef} 
          className="w-full h-auto rounded-sm border border-white/5" 
        />
      </div>
      
      <button 
        onClick={downloadAsset}
        className="w-full py-5 bg-white text-black text-[11px] font-black tracking-[0.5em] uppercase hover:bg-smartan-orange hover:text-white transition-all duration-700 shadow-2xl"
      >
        Collect & Download Asset
      </button>
    </div>
  );
}