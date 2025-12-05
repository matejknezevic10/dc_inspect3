import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, CheckSquare, Plus, Navigation, Fuel, Utensils, Clock, Search, Trash2, Save, ArrowLeft, Briefcase, ExternalLink, TrendingDown, Coffee, Globe, FileText, CheckCircle, Loader, Printer, Download, Camera, Image as ImageIcon, X, MoreVertical, GripHorizontal, Search as SearchIcon, AlertTriangle, LayoutDashboard, Archive, Undo
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
    // HIER DEINE DATEN EINTRAGEN
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
    moveToPending: "Prebaci u tijek", moveToDone: "Završi (Arhiviraj)", restore: "Vrati u proces", moveToIncoming: "Vrati u nove",
    reportTitle: "Service Bericht", addPhoto: "Dodaj sliku", 
    labelCustomer: "Ime Klijenta", labelDate: "Datum", labelTime: "Vrijeme", labelCity: "Grad", labelAddress: "Adresa", labelRequest: "Opis", labelCategory: "Kategorija",
    save: "Spremi", delete: "Obriši", downloadPdf: "PDF", downloadDoc: "Word",
    navStart: "Pokreni Navigaciju", gasButton: "Traži benzinske (GPS)", logisticsTitle: "Logistika", foodTitle: "Hrana", gasTitle: "Gorivo", gasDesc: "Cijene u blizini", confirmDelete: "Obrisati?",
    catInspection: "Inspekcija", catConsulting: "Savjetovanje", catEmergency: "Hitno",
    reportNotesPlaceholder: "- Kvar na ventilu...", generateBtn: "Kreiraj Izvještaj", reportResultLabel: "Pregled Izvještaja"
  },
  en: {
    appTitle: "DC INSPECT", subtitle: "Mobile Assistant", newAppointment: "New Task",
    navDashboard: "Dashboard", navArchive: "Archive (Done)",
    colIncoming: "INCOMING", colPending: "PENDING", colDone: "ARCHIVE / DONE",
    emptyInbox: "No new tasks.", emptyPending: "Nothing pending.", emptyArchive: "Archive is empty.",
    moveToPending: "Start Working", moveToDone: "Complete & Archive", restore: "Restore", moveToIncoming: "Move to Incoming",
    reportTitle: "Service Report", addPhoto: "Add Photo",
    labelCustomer: "Customer", labelDate: "Date", labelTime: "Time", labelCity: "City", labelAddress: "Address", labelRequest: "Request", labelCategory: "Category",
    save: "Save", delete: "Delete", downloadPdf: "PDF", downloadDoc: "Word",
    navStart: "Start Navigation", gasButton: "Search Gas Stations (GPS)", logisticsTitle: "Logistics", foodTitle: "Food", gasTitle: "Fuel", gasDesc: "Prices nearby", confirmDelete: "Delete?",
    catInspection: "Inspection", catConsulting: "Consulting", catEmergency: "Emergency",
    reportNotesPlaceholder: "- Valve broken...", generateBtn: "Generate Report", reportResultLabel: "Report Preview"
  }
};

// ... Helpers ...
const safeOpen = (url) => { if(!url) return; const w = window.open(url, '_blank'); if(!w || w.closed) { window.location.href = url; } };
const compressImage = (file) => new Promise((resolve) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = (e) => { const img = new Image(); img.src = e.target.result; img.onload = () => { const cvs = document.createElement('canvas'); const max = 1000; let w = img.width, h = img.height; if(w>h){if(w>max){h*=max/w;w=max;}}else{if(h>max){w*=max/h;h=max;}} cvs.width=w; cvs.height=h; const ctx = cvs.getContext('2d'); ctx.drawImage(img,0,0,w,h); resolve(cvs.toDataURL('image/jpeg', 0.6)); } } });
const downloadAsWord = (c,f,i=[]) => { let h=`<html><body><div style="font-family:Arial;white-space:pre-wrap;">${c}</div>${i.map(u=>`<p><img src="${u}" width="400"/></p>`).join('')}</body></html>`; const b=new Blob(['\ufeff',h],{type:'application/msword'}); const u=URL.createObjectURL(b); const l=document.createElement('a'); l.href=u; l.download=`${f}.doc`; document.body.appendChild(l); l.click(); document.body.removeChild(l); };
const printAsPdf = (c,i=[]) => { const w=window.open('','_blank'); if(w){w.document.write(`<html><head><style>body{font-family:Arial;padding:20px;white-space:pre-wrap}img{max-width:100%;max-height:300px;margin:10px}</style></head><body><div>${c}</div><div>${i.map(u=>`<img src="${u}"/>`).join('')}</div></body></html>`); w.document.close(); setTimeout(()=>w.print(),500);} };
const generateReportText = (n,c,d,cat,l) => { const ds=new Date(d).toLocaleDateString(); return l==='hr' ? `IZVJEŠTAJ\nKlijent: ${c}\nDatum: ${ds}\nKategorija: ${cat}\n\nNALAZI I RADOVI:\n${n}` : `REPORT\nClient: ${c}\nDate: ${ds}\nCategory: ${cat}\n\nFINDINGS:\n${n}`; };
const generateRouteRestaurants = (city, lang) => { return [ { name: "Highway Rest Stop A1", type: "Rest Stop", dist: "On Route" }, { name: `Grill House ${city}`, type: "Local Food", dist: "2 min detour" }, { name: "Coffee & Drive", type: "Snack", dist: "On Route" } ]; };

// UI Components
const Card = ({children, className='', onClick}) => (<div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>{children}</div>);
const Button = ({children, onClick, variant='primary', className='', icon:Icon, ...p}) => {
  const vs = { primary: "bg-blue-600 text-white hover:bg-blue-700", secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50", success: "bg-green-600 text-white hover:bg-green-700", danger: "bg-red-50 text-red-600 hover:bg-red-100", orange: "bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100" };
  return <button onClick={onClick} className={`flex items-center justify-center px-4 py-3 rounded-lg font-bold text-sm transition-all active:scale-95 ${vs[variant]} ${className}`} {...p}>{Icon && <Icon size={18} className="mr-2"/>}{children}</button>;
};
const Input = ({label, ...p}) => (<div className="mb-3"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label><input className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" {...p}/></div>);

const KanbanColumn = ({ title, status, appointments, onClickApp, lang, onStatusChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); const id = e.dataTransfer.getData("appId"); if(id) onStatusChange(id, status); };

  return (
    <div 
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} 
        className={`flex-1 flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden h-full min-h-[150px]
        ${isDragOver?'bg-blue-50 border-blue-300 ring-2 ring-blue-100':'bg-slate-100/50 border-slate-200/60'}`}
    >
      <div className={`p-3 font-bold text-xs uppercase tracking-wider border-b border-slate-200 flex justify-between items-center ${status==='incoming'?'text-blue-600 bg-blue-50/50':status==='pending'?'text-orange-600 bg-orange-50/50':'text-green-600 bg-green-50/50'}`}>
        {title} <span className="bg-white px-2 py-0.5 rounded-full text-[10px] shadow-sm text-slate-600">{appointments.length}</span>
      </div>
      <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
        {appointments.length===0 ? <div className="text-center py-8 text-slate-300 italic text-xs">{isDragOver?'Drop here':'Empty'}</div> : appointments.map(app => (
            <div key={app.id} draggable onDragStart={(e)=>{e.dataTransfer.setData("appId",app.id);e.dataTransfer.effectAllowed="move";}} onClick={()=>onClickApp(app)} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-200 transition-all active:scale-[0.98] group relative">
              <div className="flex justify-between items-start mb-1"><h4 className="font-bold text-slate-800 text-sm">{app.customerName}</h4><span className="text-[10px] font-medium bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded">{new Date(app.date).toLocaleDateString()}</span></div>
              <div className="flex items-center text-xs text-slate-500 gap-1 mb-2"><MapPin size={10}/> {app.city} <span className="mx-1">•</span> <span>{app.category}</span></div>
              <div className="bg-slate-50 px-2 py-1.5 rounded text-[11px] text-slate-600 truncate border border-slate-100">"{app.request}"</div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filter, setFilter] = useState('');
  const [lang, setLang] = useState('hr');
  const t = translations[lang];
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [foodData, setFoodData] = useState([]);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ customerName: '', city: '', address: '', date: '', time: '', request: '', category: 'inspection', status: 'incoming', reportNotes: '', finalReport: '', todos: [], reportImages: [] });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if(!app || !auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if(!db || !user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'appointments');
    const unsubscribe = onSnapshot(q, (snap) => {
      const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      apps.sort((a,b) => new Date(a.date) - new Date(b.date));
      setAppointments(apps);
      setLoading(false);
    }, (err) => { console.error("Firestore Error:", err); });
    return () => unsubscribe();
  }, [user]);

  const saveApp = async (data) => {
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'appointments'), { 
        ...data, status: 'incoming', createdAt: serverTimestamp(), reportImages:[],
        todos: [{text: "Werkzeug 1 / Alat 1", done: false}, {text: "Werkzeug 2 / Alat 2", done: false}, {text: "Dokumente", done: false}]
    });
    setView('dashboard');
  };
  const updateApp = async (id, data) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appointments', id), data); };
  const deleteApp = async (id) => { if(confirm(t.confirmDelete)) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appointments', id)); setView('dashboard'); }};
  
  const handleUpdateStatus = (id, s) => { updateApp(id, {status: s}); if(selectedAppointment && selectedAppointment.id === id) setSelectedAppointment({...selectedAppointment, status: s}); };
  const getCategoryLabel = (k) => { const m = { 'inspection': t.catInspection, 'consulting': t.catConsulting, 'emergency': t.catEmergency }; return m[k] || k; };

  const filterFn = a => a.customerName.toLowerCase().includes(filter.toLowerCase()) || a.city.toLowerCase().includes(filter.toLowerCase());
  const incoming = appointments.filter(a => (a.status === 'incoming' || !a.status) && filterFn(a));
  const pending = appointments.filter(a => a.status === 'pending' && filterFn(a));
  const done = appointments.filter(a => a.status === 'done' && filterFn(a));

  useEffect(() => {
    if (selectedAppointment && view === 'detail') {
      setFoodData(generateRouteRestaurants(selectedAppointment.city, lang));
    }
  }, [selectedAppointment, view, lang]);

  if(loading) return <div className="h-screen flex items-center justify-center text-blue-600"><Loader className="animate-spin"/></div>;

  if(view === 'add') {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
        <div className="bg-white px-4 py-4 sticky top-0 z-20 border-b border-slate-100 flex items-center gap-3 shadow-sm">
          <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-slate-600"><ArrowLeft/></button>
          <h1 className="text-lg font-bold text-slate-800">{t.newAppointment}</h1>
        </div>
        <div className="p-4 max-w-lg mx-auto">
          <Card className="p-5">
            <Input label={t.labelCustomer} value={formData.customerName} onChange={e=>setFormData({...formData, customerName:e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
                <Input label={t.labelDate} type="date" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} />
                <Input label={t.labelTime} type="time" value={formData.time} onChange={e=>setFormData({...formData, time:e.target.value})} />
            </div>
            <Input label={t.labelCity} value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})} />
            <Input label={t.labelAddress} value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} />
            <Input label={t.labelRequest} value={formData.request} onChange={e=>setFormData({...formData, request:e.target.value})} />
            <div className="mb-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.labelCategory}</label><select className="w-full p-3 border rounded-lg bg-slate-50 text-slate-900" value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}><option value="inspection">Inspection</option><option value="consulting">Consulting</option><option value="emergency">Emergency</option></select></div>
            <Button fullWidth onClick={() => saveApp(formData)} icon={Save}>{t.save}</Button>
          </Card>
        </div>
      </div>
    );
  }

  if(view === 'detail' && selectedAppointment) {
    const a = selectedAppointment;
    // Helper to generate report from current note state (live)
    const handleReportUpdate = (noteText) => {
        const finalText = generateReportText(noteText, a.customerName, a.date, a.category, lang);
        updateApp(a.id, { reportNotes: noteText, finalReport: finalText });
        setSelectedAppointment({ ...a, reportNotes: noteText, finalReport: finalText });
    };

    return (
      <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
        <div className={`text-white px-4 pt-4 pb-16 shadow-md ${a.status==='done'?'bg-green-600':a.status==='pending'?'bg-orange-500':'bg-blue-600'}`}>
           <div className="flex justify-between items-start mb-4 max-w-4xl mx-auto w-full">
             <button onClick={() => setView('dashboard')} className="p-2 bg-white/20 rounded-lg hover:bg-white/30"><ArrowLeft size={20}/></button>
             <span className="text-xs font-bold uppercase bg-black/20 px-3 py-1 rounded-full">{a.status === 'incoming' ? t.colIncoming : a.status === 'pending' ? t.colPending : t.colDone}</span>
           </div>
           <div className="max-w-4xl mx-auto">
             <h1 className="text-2xl font-bold mb-1">{a.customerName}</h1>
             <div className="flex items-center gap-2 text-sm opacity-90"><MapPin size={14}/> {a.address}, {a.city}</div>
           </div>
        </div>

        <div className="px-4 -mt-10 relative z-10 w-full max-w-4xl mx-auto space-y-4">
           {/* STATUS BUTTONS */}
           <Card className="p-3 grid grid-cols-2 gap-3">
              {a.status === 'incoming' && <Button variant="orange" onClick={() => handleUpdateStatus(a.id, 'pending')}>{t.moveToPending}</Button>}
              {a.status === 'pending' && <Button variant="secondary" onClick={() => handleUpdateStatus(a.id, 'incoming')} icon={Undo}>{t.moveToIncoming}</Button>}
              {a.status === 'pending' && <Button variant="success" onClick={() => handleUpdateStatus(a.id, 'done')}>{t.moveToDone}</Button>}
              {a.status === 'done' && <Button variant="secondary" onClick={() => handleUpdateStatus(a.id, 'pending')} icon={Undo}>{t.restore}</Button>}
              <Button onClick={() => safeOpen(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${a.address}, ${a.city}`)}`)} icon={Navigation}>{t.navStart}</Button>
           </Card>

           <Card className="p-5 shadow-lg">
             <div className="flex gap-3 mb-4 border-b border-slate-100 pb-4"><div className="bg-blue-50 p-2.5 rounded-lg text-blue-600"><Calendar size={20} /></div><div><div className="text-xs text-slate-400 uppercase font-semibold">{t.labelDate}</div><div className="font-semibold text-slate-800">{new Date(a.date).toLocaleDateString()} - {a.time}</div></div></div>
             <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">{a.request}</p>
             <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">{getCategoryLabel(a.category)}</span>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3"><Fuel size={16} className="text-orange-500"/> {t.gasTitle}</h3>
                  <Button variant="secondary" size="small" fullWidth onClick={() => safeOpen(`https://www.google.com/maps/search/gas+stations+near+${a.city}`)}>{t.gasButton}</Button>
              </Card>
              <Card className="p-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3"><Coffee size={16} className="text-brown-500"/> {t.foodTitle}</h3>
                  <div className="space-y-2">{foodData.map((f,i)=><div key={i} className="text-xs flex justify-between p-2 bg-slate-50 rounded border border-slate-100"><span>{f.name}</span><span className="text-slate-400">{f.dist}</span></div>)}</div>
              </Card>
           </div>

           <Card className="p-0 overflow-hidden">
             <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between"><h3 className="font-bold text-slate-700 flex items-center gap-2"><CheckSquare size={18} className="text-blue-500"/> {t.tasksTitle}</h3></div>
             <div className="divide-y divide-slate-100">
               {(a.todos||[]).map((todo, idx) => (
                 <div key={idx} onClick={() => { const n=[...a.todos]; n[idx].done=!n[idx].done; updateApp(a.id, {todos: n}); setSelectedAppointment({...a, todos:n}); }} className={`p-4 flex items-center gap-3 cursor-pointer ${todo.done?'bg-slate-50/50':''}`}>
                   <div className={`w-5 h-5 rounded border flex items-center justify-center ${todo.done?'bg-green-500 border-green-500 text-white':'bg-white'}`}>{todo.done && <CheckSquare size={12}/>}</div>
                   <span className={`${todo.done?'line-through text-slate-400':''}`}>{todo.text}</span>
                 </div>
               ))}
               <div className="p-3"><input className="w-full bg-slate-50 p-2 rounded border border-slate-200 text-sm" placeholder={t.taskPlaceholder} onKeyDown={(e)=>{ if(e.key==='Enter'){ const n=[...(a.todos||[]), {text:e.target.value, done:false}]; updateApp(a.id, {todos: n}); setSelectedAppointment({...a, todos:n}); e.target.value=''; }}}/></div>
             </div>
           </Card>

           <Card className="p-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3"><FileText size={16}/> {t.reportTitle}</h3>
              <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
                 <label className="flex-shrink-0 w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50">
                    <Camera size={20}/><input type="file" className="hidden" accept="image/*" onChange={async (e) => { if(e.target.files[0]) { const b64 = await compressImage(e.target.files[0]); const n=[...(a.reportImages||[]), b64]; updateApp(a.id, {reportImages:n}); setSelectedAppointment({...a, reportImages:n}); }}}/>
                 </label>
                 {(a.reportImages||[]).map((img, i) => (<div key={i} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200"><img src={img} className="w-full h-full object-cover"/><button onClick={() => { const n = a.reportImages.filter((_, idx) => idx !== i); updateApp(a.id, {reportImages:n}); setSelectedAppointment({...a, reportImages:n}); }} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X size={10}/></button></div>))}
              </div>
              <div className="space-y-2">
                  <textarea className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm min-h-[100px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder={t.reportNotesPlaceholder} 
                    value={a.reportNotes || ''} 
                    onChange={(e) => {
                        // Optimistic typing
                        setSelectedAppointment({...a, reportNotes: e.target.value});
                    }}
                  />
                  <Button fullWidth onClick={() => handleReportUpdate(a.reportNotes || '')} icon={CheckCircle}>{t.generateBtn}</Button>
              </div>
              
              {a.finalReport && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.reportResultLabel}</label>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono whitespace-pre-wrap mb-4 max-h-40 overflow-y-auto">{a.finalReport}</div>
                      <div className="flex gap-2">
                        <Button size="small" variant="secondary" icon={Printer} onClick={() => printAsPdf(a.finalReport, a.reportImages)}>{t.downloadPdf}</Button>
                        <Button size="small" variant="secondary" icon={Download} onClick={() => downloadAsWord(a.finalReport, a.customerName, a.reportImages)}>{t.downloadDoc}</Button>
                      </div>
                  </div>
              )}
           </Card>

           <div className="pt-8 pb-4"><Button fullWidth variant="danger" icon={Trash2} onClick={() => deleteApp(a.id)}>{t.delete}</Button></div>
        </div>
      </div>
    );
  }

  // VIEW: DASHBOARD
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col h-screen overflow-hidden text-slate-900">
      <div className="bg-white px-5 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-20 flex-shrink-0">
         <div className="flex items-center gap-3"><DCLogo/><div><h1 className="text-xl font-black text-blue-900 tracking-tight">{t.appTitle}</h1><p className="text-[10px] text-slate-500 font-medium">{t.subtitle}</p></div></div>
         <div className="flex gap-2">
            <button onClick={() => setView('dashboard')} className={`p-2 rounded-lg ${view==='dashboard'?'bg-blue-50 text-blue-600':'text-slate-400'}`}><LayoutDashboard size={20}/></button>
            <button onClick={() => setView('archive')} className={`p-2 rounded-lg ${view==='archive'?'bg-blue-50 text-blue-600':'text-slate-400'}`}><Archive size={20}/></button>
            <button onClick={() => setLang(l => l==='hr'?'en':'hr')} className="px-2 bg-slate-100 rounded text-xs font-bold text-slate-500 border border-slate-200">{lang.toUpperCase()}</button>
         </div>
      </div>

      <div className="px-4 py-2 bg-white border-b border-slate-100 z-10 flex-shrink-0"><div className="relative"><SearchIcon className="absolute left-3 top-3 text-slate-400" size={16}/><input placeholder={t.searchPlaceholder} value={filter} onChange={e => setFilter(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900" /></div></div>

      <div className="flex-1 overflow-y-auto p-4 w-full">
        {view === 'archive' ? (
            <div className="max-w-3xl mx-auto space-y-3">{done.map(app => <div key={app.id} onClick={() => { setSelectedAppointment(app); setView('detail'); }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between cursor-pointer hover:border-blue-300"><span className="font-bold text-slate-700">{app.customerName}</span><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">DONE</span></div>)}</div>
        ) : (
            <>
              {/* DESKTOP VIEW */}
              {!isMobile && (
                  <div className="flex flex-row gap-4 h-full w-full">
                      <KanbanColumn title={t.colIncoming} status="incoming" appointments={incoming} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} />
                      <KanbanColumn title={t.colPending} status="pending" appointments={pending} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} />
                      <KanbanColumn title={t.colDone} status="done" appointments={done} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} />
                  </div>
              )}
              {/* MOBILE VIEW (Stacked) */}
              {isMobile && (
                  <div className="flex flex-col gap-6">
                      <KanbanColumn title={t.colIncoming} status="incoming" appointments={incoming} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} />
                      <KanbanColumn title={t.colPending} status="pending" appointments={pending} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} />
                      <KanbanColumn title={t.colDone} status="done" appointments={done} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} />
                  </div>
              )}
            </>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-30"><button onClick={() => { setFormData({ customerName: '', city: '', address: '', date: '', time: '', request: '', category: 'inspection', status: 'incoming', reportNotes: '', finalReport: '', todos: [], reportImages: [] }); setView('add'); }} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl shadow-blue-200 flex items-center justify-center transition-transform active:scale-90"><Plus size={28} /></button></div>
      <style>{`.custom-scrollbar::-webkit-scrollbar{height:4px;width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}`}</style>
    </div>
  );
}