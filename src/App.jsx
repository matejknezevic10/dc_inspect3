import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, CheckSquare, Plus, Navigation, Fuel, Utensils, Clock, Search, Trash2, Save, ArrowLeft, Briefcase, ExternalLink, TrendingDown, Coffee, Globe, FileText, CheckCircle, Loader, Printer, Download, Camera, Image as ImageIcon, X, MoreVertical, GripHorizontal, Search as SearchIcon, AlertTriangle, LayoutDashboard, Archive, Menu, Monitor, Smartphone
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

// --- Firebase Configuration ---
let firebaseConfig;
try {
  if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(__firebase_config);
  } else {
    firebaseConfig = {
  apiKey: "AIzaSyBc2ajUaIkGvcdQQsDDlzDPHhiW2yg9BCc",
  authDomain: "dc-inspect.firebaseapp.com",
  projectId: "dc-inspect",
  storageBucket: "dc-inspect.firebasestorage.app",
  messagingSenderId: "639013498118",
  appId: "1:639013498118:web:15146029fbc159cbd30287",
  measurementId: "G-5TETMHQ1EW"
  };
  }
} catch (e) { console.error("Config Error", e); }

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) { console.error("Firebase Init Error:", error); }

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Components ---
const DCLogo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" className="rounded-lg shadow-sm flex-shrink-0">
    <rect width="100" height="100" rx="20" fill="#2563EB"/>
    <path d="M25 25H45C58.8071 25 70 36.1929 70 50V50C70 63.8071 58.8071 75 45 75H25V25Z" stroke="white" strokeWidth="8"/>
    <path d="M25 25V75" stroke="white" strokeWidth="8"/>
    <path d="M65 65L80 80" stroke="white" strokeWidth="8" strokeLinecap="round"/>
    <circle cx="55" cy="50" r="15" stroke="white" strokeWidth="6" strokeOpacity="0.5"/>
    <text x="50" y="62" fontSize="35" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="sans-serif">DC</text>
  </svg>
);

const translations = {
  hr: {
    appTitle: "DC INSPECT", subtitle: "Mobilni Asistent", newAppointment: "Novi Termin",
    navDashboard: "Dashboard", navArchive: "Arhiv (Done)",
    colIncoming: "NOVI / INCOMING", colPending: "U TIJEKU / PENDING", colDone: "ARHIVA / DONE",
    emptyInbox: "Nema novih zadataka.", emptyPending: "Ništa nije u tijeku.", emptyArchive: "Arhiva je prazna.",
    moveToPending: "Prebaci u tijek", moveToDone: "Završi (Arhiviraj)", restore: "Vrati u proces",
    reportTitle: "Service Bericht", addPhoto: "Dodaj sliku", 
    labelCustomer: "Ime Klijenta", labelDate: "Datum", labelTime: "Vrijeme", labelCity: "Grad", labelAddress: "Adresa", labelRequest: "Opis", labelCategory: "Kategorija",
    save: "Spremi", delete: "Obriši", downloadPdf: "PDF", downloadDoc: "Word",
    mobileTabIncoming: "Novi", mobileTabPending: "U Tijeku", mobileTabDone: "Gotovo"
  },
  en: {
    appTitle: "DC INSPECT", subtitle: "Mobile Assistant", newAppointment: "New Task",
    navDashboard: "Dashboard", navArchive: "Archive (Done)",
    colIncoming: "INCOMING", colPending: "PENDING", colDone: "ARCHIVE / DONE",
    emptyInbox: "No new tasks.", emptyPending: "Nothing pending.", emptyArchive: "Archive is empty.",
    moveToPending: "Start Working", moveToDone: "Complete & Archive", restore: "Restore",
    reportTitle: "Service Report", addPhoto: "Add Photo",
    labelCustomer: "Customer", labelDate: "Date", labelTime: "Time", labelCity: "City", labelAddress: "Address", labelRequest: "Request", labelCategory: "Category",
    save: "Save", delete: "Delete", downloadPdf: "PDF", downloadDoc: "Word",
    mobileTabIncoming: "Incoming", mobileTabPending: "Pending", mobileTabDone: "Done"
  }
};

// ... Helpers (safeOpen, compressImage, exports) ...
const safeOpen = (url) => { if(!url) return; const w = window.open(url, '_blank'); if(!w || w.closed) { window.location.href = url; } };
const compressImage = (file) => new Promise((resolve) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = (e) => { const img = new Image(); img.src = e.target.result; img.onload = () => { const cvs = document.createElement('canvas'); const max = 1000; let w = img.width, h = img.height; if(w>h){if(w>max){h*=max/w;w=max;}}else{if(h>max){w*=max/h;h=max;}} cvs.width=w; cvs.height=h; const ctx = cvs.getContext('2d'); ctx.drawImage(img,0,0,w,h); resolve(cvs.toDataURL('image/jpeg', 0.6)); } } });
const downloadAsWord = (c,f,i=[]) => { let h=`<html><body><div style="font-family:Arial;white-space:pre-wrap;">${c}</div>${i.map(u=>`<p><img src="${u}" width="400"/></p>`).join('')}</body></html>`; const b=new Blob(['\ufeff',h],{type:'application/msword'}); const u=URL.createObjectURL(b); const l=document.createElement('a'); l.href=u; l.download=`${f}.doc`; document.body.appendChild(l); l.click(); document.body.removeChild(l); };
const printAsPdf = (c,i=[]) => { const w=window.open('','_blank'); if(w){w.document.write(`<html><head><style>body{font-family:Arial;padding:20px;white-space:pre-wrap}img{max-width:100%;max-height:300px;margin:10px}</style></head><body><div>${c}</div><div>${i.map(u=>`<img src="${u}"/>`).join('')}</div></body></html>`); w.document.close(); setTimeout(()=>w.print(),500);} };
const generateReportText = (n,c,d,cat,l) => { const ds=new Date(d).toLocaleDateString(); return l==='hr' ? `IZVJEŠTAJ\nKlijent: ${c}\nDatum: ${ds}\nKategorija: ${cat}\n\nNALAZI:\n${n}` : `REPORT\nClient: ${c}\nDate: ${ds}\nCategory: ${cat}\n\nFINDINGS:\n${n}`; };

// UI Components
const Card = ({children, className='', onClick}) => (<div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>{children}</div>);
const Button = ({children, onClick, variant='primary', className='', icon:Icon, ...p}) => {
  const vs = { primary: "bg-blue-600 text-white", secondary: "bg-white text-slate-700 border border-slate-200", success: "bg-green-600 text-white", danger: "bg-red-50 text-red-600" };
  return <button onClick={onClick} className={`flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95 ${vs[variant]} ${className}`} {...p}>{Icon && <Icon size={16} className="mr-2"/>}{children}</button>;
};
const Input = ({label, ...p}) => (<div className="mb-3"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label><input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" {...p}/></div>);

// --- APP ---
export default function App() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); // dashboard, archive, add, detail
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filter, setFilter] = useState('');
  const [lang, setLang] = useState('hr');
  const t = translations[lang];
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileTab, setMobileTab] = useState('incoming'); // incoming, pending, done

  // Resize Listener for Mobile/Desktop switch
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth & Sync Data (PUBLIC PATH for SYNC)
  useEffect(() => {
    if(!app) return;
    signInAnonymously(auth).then(u => setUser(u.user)).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if(!db) return;
    // SYNC FIX: Wir nutzen 'public/data' damit Laptop & Handy dasselbe sehen (für diesen AppId Context)
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'appointments');
    return onSnapshot(q, (snap) => {
      const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      apps.sort((a,b) => new Date(a.date) - new Date(b.date));
      setAppointments(apps);
      setLoading(false);
    });
  }, []);

  // Actions
  const saveApp = async (data) => {
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'appointments'), { ...data, status: 'incoming', createdAt: serverTimestamp(), todos:[], reportImages:[] });
    setView('dashboard');
  };
  const updateApp = async (id, data) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appointments', id), data); };
  const deleteApp = async (id) => { if(confirm(t.confirmDelete)) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appointments', id)); setView('dashboard'); }};
  
  // Filtered Lists
  const filterFn = a => a.customerName.toLowerCase().includes(filter.toLowerCase()) || a.city.toLowerCase().includes(filter.toLowerCase());
  const incoming = appointments.filter(a => (a.status === 'incoming' || !a.status) && filterFn(a));
  const pending = appointments.filter(a => a.status === 'pending' && filterFn(a));
  const done = appointments.filter(a => a.status === 'done' && filterFn(a));

  // --- SUB-VIEWS ---

  const AppointmentCard = ({ app }) => (
    <div onClick={() => { setSelectedAppointment(app); setView('detail'); }} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-3 cursor-pointer hover:border-blue-300 transition-colors active:scale-[0.98]">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-slate-800">{app.customerName}</h4>
        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">{new Date(app.date).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center text-xs text-slate-500 gap-2 mb-2">
        <span className="flex items-center gap-1"><MapPin size={10}/> {app.city}</span>
        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
        <span className="uppercase text-[10px] tracking-wider">{app.category}</span>
      </div>
      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 truncate">
        {app.request}
      </div>
    </div>
  );

  const AddView = () => {
    const [d, setD] = useState({ customerName: '', city: '', address: '', date: '', time: '', request: '', category: 'inspection' });
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center gap-3 mb-6"><button onClick={() => setView('dashboard')}><ArrowLeft/></button><h2 className="text-xl font-bold">{t.newAppointment}</h2></div>
        <Card className="p-5">
          <Input label={t.labelCustomer} value={d.customerName} onChange={e=>setD({...d, customerName:e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={t.labelDate} type="date" value={d.date} onChange={e=>setD({...d, date:e.target.value})} />
            <Input label={t.labelTime} type="time" value={d.time} onChange={e=>setD({...d, time:e.target.value})} />
          </div>
          <Input label={t.labelCity} value={d.city} onChange={e=>setD({...d, city:e.target.value})} />
          <Input label={t.labelAddress} value={d.address} onChange={e=>setD({...d, address:e.target.value})} />
          <Input label={t.labelRequest} value={d.request} onChange={e=>setD({...d, request:e.target.value})} />
          <div className="mb-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.labelCategory}</label><select className="w-full p-2 border rounded-lg bg-slate-50" value={d.category} onChange={e=>setD({...d, category:e.target.value})}><option value="inspection">Inspection</option><option value="consulting">Consulting</option><option value="emergency">Emergency</option></select></div>
          <Button fullWidth onClick={() => saveApp(d)} icon={Save}>{t.save}</Button>
        </Card>
      </div>
    )
  };

  const DetailView = () => {
    if(!selectedAppointment) return null;
    const a = selectedAppointment;
    const update = (k, v) => { const n = {...a, [k]: v}; setSelectedAppointment(n); updateApp(a.id, {[k]: v}); };
    const [note, setNote] = useState(a.reportNotes || '');
    
    return (
      <div className="max-w-2xl mx-auto p-4 pb-24">
        <div className={`p-4 rounded-xl text-white mb-6 shadow-lg ${a.status==='done'?'bg-green-600':a.status==='pending'?'bg-orange-500':'bg-blue-600'}`}>
           <div className="flex justify-between items-start mb-4">
             <button onClick={() => setView(a.status === 'done' ? 'archive' : 'dashboard')} className="p-2 bg-white/20 rounded-lg hover:bg-white/30"><ArrowLeft size={20}/></button>
             <span className="text-xs font-bold uppercase bg-black/20 px-3 py-1 rounded-full">{a.status === 'incoming' ? t.colIncoming : a.status === 'pending' ? t.colPending : t.colDone}</span>
           </div>
           <h1 className="text-2xl font-bold mb-1">{a.customerName}</h1>
           <div className="flex items-center gap-2 text-sm opacity-90"><MapPin size={14}/> {a.address}, {a.city}</div>
        </div>

        {/* STATUS ACTIONS */}
        <div className="grid grid-cols-2 gap-3 mb-6">
           {a.status !== 'pending' && <Button variant="secondary" onClick={() => update('status', 'pending')} className="bg-orange-50 border-orange-200 text-orange-700">{t.moveToPending}</Button>}
           {a.status !== 'done' && <Button variant="secondary" onClick={() => update('status', 'done')} className="bg-green-50 border-green-200 text-green-700">{t.moveToDone}</Button>}
           {a.status === 'done' && <Button variant="secondary" onClick={() => update('status', 'incoming')} className="bg-blue-50 border-blue-200 text-blue-700">{t.restore}</Button>}
           <Button onClick={() => safeOpen(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${a.address}, ${a.city}`)}`)} icon={Navigation}>{t.navStart}</Button>
        </div>

        {/* REPORT SECTION */}
        <div className="mb-6">
           <h3 className="text-sm font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><FileText size={16}/> {t.reportTitle}</h3>
           <Card className="p-4">
              <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
                 <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50">
                    <Camera size={20}/>
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                        if(e.target.files[0]) {
                            const b64 = await compressImage(e.target.files[0]);
                            update('reportImages', [...(a.reportImages||[]), b64]);
                        }
                    }}/>
                 </label>
                 {(a.reportImages||[]).map((img, i) => (
                     <div key={i} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200">
                        <img src={img} className="w-full h-full object-cover"/>
                        <button onClick={() => update('reportImages', a.reportImages.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"><X size={12}/></button>
                     </div>
                 ))}
              </div>
              <textarea className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm mb-3 min-h-[100px]" placeholder={t.reportNotesPlaceholder} value={note} onChange={e => setNote(e.target.value)} onBlur={() => update('reportNotes', note)} />
              <div className="flex gap-2">
                 <Button size="small" variant="secondary" icon={Printer} onClick={() => printAsPdf(generateReportText(note, a.customerName, a.date, a.category, lang), a.reportImages)}>{t.downloadPdf}</Button>
                 <Button size="small" variant="secondary" icon={Download} onClick={() => downloadAsWord(generateReportText(note, a.customerName, a.date, a.category, lang), a.customerName, a.reportImages)}>{t.downloadDoc}</Button>
              </div>
           </Card>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200">
            <Button fullWidth variant="danger" icon={Trash2} onClick={() => deleteApp(a.id)}>{t.delete}</Button>
        </div>
      </div>
    );
  };

  // --- RENDER MAIN ---
  if(loading) return <div className="h-screen flex items-center justify-center text-blue-600"><Loader className="animate-spin"/></div>;
  if(view === 'add') return <AddView/>;
  if(view === 'detail') return <DetailView/>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col h-screen overflow-hidden">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm z-20 flex-shrink-0">
         <div className="flex items-center gap-3">
            <DCLogo/>
            <div>
                <h1 className="text-lg font-black text-blue-900 tracking-tight leading-none">{t.appTitle}</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{view === 'dashboard' ? t.navDashboard : t.navArchive}</p>
            </div>
         </div>
         <div className="flex gap-2">
             <button onClick={() => setView('dashboard')} className={`p-2 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}><LayoutDashboard size={20}/></button>
             <button onClick={() => setView('archive')} className={`p-2 rounded-lg transition-colors ${view === 'archive' ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}><Archive size={20}/></button>
             <button onClick={() => setLang(l => l === 'hr' ? 'en' : 'hr')} className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-500 border border-slate-200">{lang.toUpperCase()}</button>
         </div>
      </div>

      {/* SEARCH BAR */}
      <div className="px-4 py-2 bg-white border-b border-slate-100 z-10 flex-shrink-0">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 text-slate-400" size={16}/>
            <input placeholder={t.searchPlaceholder} value={filter} onChange={e => setFilter(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        
        {/* ARCHIVE VIEW */}
        {view === 'archive' && (
            <div className="space-y-3 max-w-3xl mx-auto">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase mb-4"><CheckCircle size={16}/> {t.navArchive} ({done.length})</div>
                {done.length === 0 ? <div className="text-center py-20 text-slate-300 italic">{t.emptyArchive}</div> : done.map(app => <AppointmentCard key={app.id} app={app}/>)}
            </div>
        )}

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
            <>
              {/* DESKTOP: KANBAN */}
              {!isMobile && (
                  <div className="flex gap-6 h-full max-w-6xl mx-auto">
                      <div className="flex-1 bg-slate-100/50 rounded-2xl border border-slate-200/50 flex flex-col overflow-hidden">
                          <div className="p-3 bg-blue-50/50 border-b border-slate-200 text-blue-700 font-bold text-xs uppercase flex justify-between">{t.colIncoming} <span className="bg-white px-2 rounded-full shadow-sm">{incoming.length}</span></div>
                          <div className="p-3 overflow-y-auto flex-1">{incoming.map(a => <AppointmentCard key={a.id} app={a}/>)}</div>
                      </div>
                      <div className="flex-1 bg-slate-100/50 rounded-2xl border border-slate-200/50 flex flex-col overflow-hidden">
                          <div className="p-3 bg-orange-50/50 border-b border-slate-200 text-orange-700 font-bold text-xs uppercase flex justify-between">{t.colPending} <span className="bg-white px-2 rounded-full shadow-sm">{pending.length}</span></div>
                          <div className="p-3 overflow-y-auto flex-1">{pending.map(a => <AppointmentCard key={a.id} app={a}/>)}</div>
                      </div>
                  </div>
              )}

              {/* MOBILE: TABS LIST */}
              {isMobile && (
                  <div className="pb-20">
                      {/* Mobile Tabs */}
                      <div className="flex p-1 bg-slate-200 rounded-xl mb-4 sticky top-0 z-10 shadow-sm">
                          <button onClick={() => setMobileTab('incoming')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mobileTab === 'incoming' ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}>{t.mobileTabIncoming} ({incoming.length})</button>
                          <button onClick={() => setMobileTab('pending')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mobileTab === 'pending' ? 'bg-white text-orange-600 shadow' : 'text-slate-500'}`}>{t.mobileTabPending} ({pending.length})</button>
                      </div>
                      
                      <div className="space-y-3">
                          {mobileTab === 'incoming' && (incoming.length === 0 ? <div className="text-center py-10 text-slate-400 text-sm">{t.emptyInbox}</div> : incoming.map(a => <AppointmentCard key={a.id} app={a}/>))}
                          {mobileTab === 'pending' && (pending.length === 0 ? <div className="text-center py-10 text-slate-400 text-sm">{t.emptyPending}</div> : pending.map(a => <AppointmentCard key={a.id} app={a}/>))}
                      </div>
                  </div>
              )}
            </>
        )}
      </div>

      {/* FAB ADD BUTTON */}
      <div className="fixed bottom-6 right-6 z-30">
        <button onClick={() => setView('add')} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl shadow-blue-200 flex items-center justify-center transition-transform active:scale-90">
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
}