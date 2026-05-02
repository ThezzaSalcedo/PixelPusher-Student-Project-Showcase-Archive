const NEU_LOGO_URL = "https://drive.google.com/thumbnail?id=163dNIQbB7SiwOt_XDxF9jNO3groZ8hPO&sz=w1000";

export const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#010208] flex-col gap-10">
    <div className="w-28 h-28 border border-white/5 rounded-[40px] flex items-center justify-center relative bg-white shadow-2xl">
      <img src={NEU_LOGO_URL} alt="Loading..." className="w-16 h-16 object-contain" />
    </div>
    <p className="font-black text-[10px] tracking-[0.6em] text-indigo-400 uppercase animate-pulse">
      Syncing Institutional Data
    </p>
  </div>
);