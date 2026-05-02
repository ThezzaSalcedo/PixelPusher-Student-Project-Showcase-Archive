import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, CheckSquare, Eye, Bookmark, 
  ShieldCheck, History, BarChart3, Users, LogOut, 
  ChevronLeft, Menu, Hash, Database, Calendar, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Central Repository Data
const SAMPLE_PROJECTS = [
  { id: 1, title: "PixelPusher: A Decentralized Institutional Archive", author: "HotDevs Inc.", dept: "CICS", program: "BSIT", year: "2026", keywords: ["React", "Supabase", "KM System"] },
  { id: 2, title: "Hydro-Sense: IoT Fluid Monitoring System", author: "Engineering Team A", dept: "COE", program: "BSCE", year: "2025", keywords: ["IoT", "Hardware", "Arduino"] }
];

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedProgram, setSelectedProgram] = useState("All");

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredProjects = useMemo(() => {
    return SAMPLE_PROJECTS.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === "All" || project.dept === selectedDept;
      const matchesYear = selectedYear === "All" || project.year === selectedYear;
      const matchesProgram = selectedProgram === "All" || project.program === selectedProgram;
      return matchesSearch && matchesDept && matchesYear && matchesProgram;
    });
  }, [searchQuery, selectedDept, selectedYear, selectedProgram]);

  return (
    <div className="flex h-screen bg-[#010208] text-white overflow-hidden font-sans">
      {/* --- Reclining Admin Sidebar --- */}
      <motion.aside 
        animate={{ width: isCollapsed ? 88 : 310 }}
        className="relative border-r border-white/5 bg-slate-950/40 backdrop-blur-2xl flex flex-col z-50 shadow-2xl transition-all duration-300"
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-12 bg-orange-600 rounded-full p-1.5 border border-white/10 hover:bg-orange-500 shadow-lg z-[60]"
        >
          {isCollapsed ? <Menu size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Branding */}
        <div className={`p-8 flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20"><span className="font-black text-sm">N</span></div>
          {!isCollapsed && <span className="font-black text-xl tracking-tighter uppercase whitespace-nowrap">NEU Archive</span>}
        </div>

        {/* Profile */}
        <div className={`mx-4 p-4 rounded-[32px] bg-white/[0.03] border border-white/5 mb-6 ${isCollapsed ? 'flex justify-center px-0 bg-transparent border-none' : ''}`}>
          <div className="flex items-center gap-4">
            <img src={user?.photo} alt="P" className="w-10 h-10 rounded-xl border border-white/10 shrink-0 object-cover" />
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="font-black text-[10px] uppercase truncate tracking-wider">{user?.displayName}</p>
                <p className="text-[8px] font-black text-orange-500 uppercase italic tracking-widest">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Admin Navigation (Scrollbar Hidden) */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar scroll-smooth">
          <NavItem icon={<Database size={18} />} label="Project Repository" active collapsed={isCollapsed} />
          
          <div className="pt-4 pb-2 border-t border-white/5 mt-4">
             {!isCollapsed && <p className="px-4 text-[9px] font-black uppercase text-white/20 mb-3 tracking-[0.3em]">Governance Lab</p>}
             <NavItem icon={<CheckSquare size={18} />} label="Approval" collapsed={isCollapsed} />
             <NavItem icon={<Eye size={18} />} label="Project Preview" collapsed={isCollapsed} />
             <NavItem icon={<ShieldCheck size={18} />} label="Admin Panel" collapsed={isCollapsed} />
             <NavItem icon={<History size={18} />} label="Audit Trail" collapsed={isCollapsed} />
          </div>

          <div className="pt-4 pb-2 border-t border-white/5">
             {!isCollapsed && <p className="px-4 text-[9px] font-black uppercase text-white/20 mb-3 tracking-[0.3em]">Management</p>}
             <NavItem icon={<Users size={18} />} label="User Management" collapsed={isCollapsed} />
             <NavItem icon={<BarChart3 size={18} />} label="Report" collapsed={isCollapsed} />
             <NavItem icon={<Bookmark size={18} />} label="Bookmark" collapsed={isCollapsed} />
          </div>
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-white/5 mt-auto">
          <button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-4 rounded-2xl text-slate-500 hover:text-red-400 transition-all group`}>
            <LogOut size={18} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* --- Main Dashboard Area --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-10 pb-8 bg-gradient-to-b from-[#010208] via-[#010208] to-transparent z-40">
          <div className="max-w-6xl mx-auto space-y-8">
            <header>
              <h1 className="text-5xl font-black uppercase tracking-tighter">Admin <span className="text-orange-500 italic">Control.</span></h1>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-3">Institutional Governance & System Phase</p>
            </header>

            <div className="flex flex-col xl:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Identify research, keywords, or contributors..."
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:border-orange-500/20 transition-all text-white placeholder:text-white/10"
                />
              </div>
              <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                <FilterMenu label="Dept" icon={<Filter size={14}/>} value={selectedDept} onChange={setSelectedDept} options={['All', 'CICS', 'COE', 'CAS']} />
                <FilterMenu label="Year" icon={<Calendar size={14}/>} value={selectedYear} onChange={setSelectedYear} options={['All', '2026', '2025', '2024']} />
                <FilterMenu label="Prog" icon={<GraduationCap size={14}/>} value={selectedProgram} onChange={setSelectedProgram} options={['All', 'BSIT', 'BSCS', 'BSCE']} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 pt-0 no-scrollbar scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {filteredProjects.map((p) => <ProjectCard key={p.id} {...p} />)}
          </div>
        </div>
      </main>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

// --- Reusable Components ---
const NavItem = ({ icon, label, active = false, collapsed }: any) => (
  <button className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-5 px-5'} py-3.5 rounded-2xl transition-all group relative border border-transparent ${active ? 'bg-orange-500/10 text-orange-400 border-orange-500/10' : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'}`}>
    <div className="shrink-0">{icon}</div>
    {!collapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{label}</span>}
  </button>
);

const FilterMenu = ({ label, icon, value, onChange, options }: any) => (
  <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 hover:bg-white/[0.06] transition-all">
    <div className="text-orange-500">{icon}</div>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-white cursor-pointer">
       <option value="All" className="bg-slate-900">{label}: All</option>
       {options.filter((o: string) => o !== 'All').map((opt: string) => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
    </select>
  </div>
);

const ProjectCard = ({ title, author, dept, year, program, keywords }: any) => (
  <div className="bg-slate-950/40 border border-white/5 p-12 rounded-[48px] hover:border-orange-500/20 transition-all group relative ring-1 ring-white/5">
    <div className="flex flex-col lg:flex-row justify-between items-start gap-12 relative z-10">
      <div className="space-y-6 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-orange-500 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">{dept}</span>
          <span className="bg-white/5 text-slate-400 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5">{program}</span>
          <span className="text-white/20 text-[9px] font-black uppercase tracking-widest ml-2">{year} Edition</span>
        </div>
        <h3 className="text-4xl font-black group-hover:text-orange-400 transition-colors uppercase leading-[1.1] tracking-tighter max-w-3xl">{title}</h3>
        <p className="text-slate-400 text-sm italic">Investigator: {author}</p>
        <div className="flex flex-wrap gap-2 pt-4">
          {keywords.map((tag: string) => (
            <div key={tag} className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest bg-white/[0.02] px-4 py-2 rounded-xl border border-white/5">
              <Hash size={10} className="text-orange-500/50" /> {tag}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-end justify-between self-stretch w-full lg:w-auto">
        <div className="flex items-center gap-2 text-emerald-500 mb-8"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.3em]">Verified Archive</span></div>
        <button className="bg-white text-slate-950 px-12 py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-orange-50 transition-all shadow-2xl">View Repository</button>
      </div>
    </div>
  </div>
);