import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, CheckSquare, Plus, Navigation, Fuel, Utensils, Clock, Search, Trash2, Save, ArrowLeft, Briefcase, ExternalLink, TrendingDown, Coffee, Globe, FileText, CheckCircle, Loader, Printer, Download, Camera, Image as ImageIcon, X, MoreVertical, GripHorizontal, Search as SearchIcon, AlertTriangle, LayoutDashboard, Archive, Undo, Quote, FolderArchive, Wand2, LogIn, Lock, Check, CreditCard, Users, UserCheck, Map as MapIcon, CalendarPlus, LogOut, UserPlus, HelpCircle, Shield
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  signInAnonymously,
  signInWithCustomToken
} from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";

// --- Firebase Configuration ---
let firebaseConfig;
try {
  if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(__firebase_config);
  } else {
    // -----------------------------------------------------------
    // HIER DEINE DATEN EINTRAGEN (aus der Firebase Console)
    // -----------------------------------------------------------
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

// --- MOCK DATA ---
const TEAM_MEMBERS = [
  { id: 'me', name: 'Ich (Admin)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { id: 'anna', name: 'Anna Müller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna' },
  { id: 'max', name: 'Max Mustermann', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
  { id: 'tom', name: 'Tom B.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom' },
];

const getRandomQuote = () => {
  const quotes = [
    "Win the day.", "We are not here to take part, we are here to take over.", "Success is not final.", "Quality means doing it right when no one is looking.", "Focus on the solution."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// --- Components ---
const DCLogo = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`rounded-lg shadow-sm flex-shrink-0 ${className}`}>
    <rect width="100" height="100" rx="20" fill="#2563EB"/>
    <path d="M25 25H45C58.8071 25 70 36.1929 70 50V50C70 63.8071 58.8071 75 45 75H25V25Z" stroke="white" strokeWidth="8"/>
    <path d="M25 25V75" stroke="white" strokeWidth="8"/>
    <path d="M65 65L80 80" stroke="white" strokeWidth="8" strokeLinecap="round"/>
    <circle cx="55" cy="50" r="15" stroke="white" strokeWidth="6" strokeOpacity="0.5"/>
    <text x="50" y="62" fontSize="35" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="sans-serif">DC</text>
  </svg>
);

const AppLogo = ({ size = "w-14 h-14", showFallback = true }) => {
  const [imgError, setImgError] = useState(false);
  if (imgError) return showFallback ? <DCLogo size={56} /> : null;
  return <img src="/logo.jpg" alt="DC Logo" className={`${size} rounded-xl object-cover shadow-sm bg-white`} onError={() => setImgError(true)} />;
};

const translations = {
  hr: {
    appTitle: "DC INSPECT", subtitle: "Mobilni Asistent",
    navDashboard: "Dashboard", navArchive: "Arhiv", navTeam: "Tim / Mapa",
    colIncoming: "NOVI", colPending: "U TIJEKU", colDone: "ZAVRŠENO", colArchived: "ARHIVIRANO",
    loginTitle: "Dobrodošli", loginBtn: "Prijavi se", registerBtn: "Registracija",
    emailLabel: "Email adresa", passLabel: "Lozinka",
    logout: "Odjava",
    save: "Spremi", delete: "Obriši", downloadPdf: "PDF", downloadDoc: "Word",
    navStart: "Pokreni Navigaciju", addToCalendar: "Dodaj u Kalendar",
    tasksTitle: "Pripreme / To-do",
    teamStatusTitle: "Status Zaposlenika", assignTo: "Dodijeljeno: ", teamMapTitle: "Lokacije Tima",
    catInspection: "Inspekcija", catConsulting: "Savjetovanje", catEmergency: "Hitno",
    reportNotesPlaceholder: "Unesite natuknice...", generateBtn: "Kreiraj Izvještaj", reportResultLabel: "Pregled Izvještaja",
    defaultTask1: "Pripremi alat", defaultTask2: "Pregledaj dokumentaciju", defaultTask3: "Ključeve", defaultTask4: "Zaštitna oprema",
    authError: "Greška pri prijavi.", demoBtn: "Probleme? Pokreni Demo (Anonimno)",
    // RESTORED LABELS
    labelCustomer: "Ime Klijenta", labelDate: "Datum", labelTime: "Vrijeme", labelCity: "Grad", labelAddress: "Adresa", labelRequest: "Opis", labelCategory: "Kategorija", labelAssign: "Dodijeli",
    gasTitle: "Gorivo", gasDesc: "Cijene u blizini", gasButton: "Traži benzinske (GPS)",
    foodTitle: "Hrana", foodSubtitle: "Preporuka rute"
  },
  en: {
    appTitle: "DC INSPECT", subtitle: "Mobile Assistant",
    navDashboard: "Dashboard", navArchive: "Archive", navTeam: "Team / Map",
    colIncoming: "INCOMING", colPending: "PENDING", colDone: "DONE", colArchived: "ARCHIVED",
    loginTitle: "Welcome Back", loginBtn: "Sign In", registerBtn: "Create Account",
    emailLabel: "Email Address", passLabel: "Password",
    logout: "Sign Out",
    save: "Save", delete: "Delete", downloadPdf: "PDF", downloadDoc: "Word",
    navStart: "Start Navigation", addToCalendar: "Add to Calendar",
    tasksTitle: "Preparation / To-do",
    teamStatusTitle: "Employee Status", assignTo: "Assigned to: ", teamMapTitle: "Team Locations",
    catInspection: "Inspection", catConsulting: "Consulting", catEmergency: "Emergency",
    reportNotesPlaceholder: "Enter keywords...", generateBtn: "Generate Report", reportResultLabel: "Report Preview",
    defaultTask1: "Prepare tools", defaultTask2: "Review docs", defaultTask3: "Check keys", defaultTask4: "Safety gear",
    authError: "Authentication failed.", demoBtn: "Trouble? Start Demo (Anonymous)",
    // RESTORED LABELS
    labelCustomer: "Customer", labelDate: "Date", labelTime: "Time", labelCity: "City", labelAddress: "Address", labelRequest: "Request", labelCategory: "Category", labelAssign: "Assign to",
    gasTitle: "Fuel", gasDesc: "Prices nearby", gasButton: "Search Gas Stations (GPS)",
    foodTitle: "Food", foodSubtitle: "Route recommendation"
  }
};

// ... Helpers ...
const safeOpen = (url) => { if(!url) return; const w = window.open(url, '_blank'); if(!w || w.closed) { window.location.href = url; } };
const compressImage = (file) => new Promise((resolve) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = (e) => { const img = new Image(); img.src = e.target.result; img.onload = () => { const cvs = document.createElement('canvas'); const max = 1000; let w = img.width, h = img.height; if(w>h){if(w>max){h*=max/w;w=max;}}else{if(h>max){w*=max/h;h=max;}} cvs.width=w; cvs.height=h; const ctx = cvs.getContext('2d'); ctx.drawImage(img,0,0,w,h); resolve(cvs.toDataURL('image/jpeg', 0.6)); } } });
const downloadAsWord = (c,f,i=[]) => { let h=`<html><body><div style="font-family:Arial;white-space:pre-wrap;">${c}</div>${i.map(u=>`<p><img src="${u}" width="400"/></p>`).join('')}</body></html>`; const b=new Blob(['\ufeff',h],{type:'application/msword'}); const u=URL.createObjectURL(b); const l=document.createElement('a'); l.href=u; l.download=`${f}.doc`; document.body.appendChild(l); l.click(); document.body.removeChild(l); };
const printAsPdf = (c,i=[]) => { const w=window.open('','_blank'); if(w){w.document.write(`<html><head><style>body{font-family:Arial;padding:20px;white-space:pre-wrap}img{max-width:100%;max-height:300px;margin:10px}</style></head><body><div>${c}</div><div>${i.map(u=>`<img src="${u}"/>`).join('')}</div></body></html>`); w.document.close(); setTimeout(()=>w.print(),500);} };
const generateReportText = (n,c,d,cat,l) => { const ds=new Date(d).toLocaleDateString(); return l==='hr' ? `IZVJEŠTAJ\nKlijent: ${c}\nDatum: ${ds}\nKategorija: ${cat}\n\nNALAZI:\n${n}` : `REPORT\nClient: ${c}\nDate: ${ds}\nCategory: ${cat}\n\nFINDINGS:\n${n}`; };
const generateRouteRestaurants = (city, lang) => { return [ { name: "Highway Rest Stop A1", type: "Rest Stop", dist: "On Route" }, { name: `Grill House ${city}`, type: "Local Food", dist: "2 min detour" }, { name: "Coffee & Drive", type: "Snack", dist: "On Route" } ]; };
const generateTimeSlots = () => { const slots = []; for (let i = 6; i <= 22; i++) { for (let j = 0; j < 60; j += 15) { const hour = i.toString().padStart(2, '0'); const minute = j.toString().padStart(2, '0'); slots.push({ value: `${hour}:${minute}`, label: `${hour}:${minute}` }); } } return slots; };
const timeOptions = generateTimeSlots();
const openGoogleCalendar = (app) => { const startDate = new Date(`${app.date}T${app.time}`); const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, ''); const details = encodeURIComponent(`Inspection: ${app.request}\nCategory: ${app.category}`); const location = encodeURIComponent(`${app.address}, ${app.city}`); const title = encodeURIComponent(`DC Inspect: ${app.customerName}`); safeOpen(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${details}&location=${location}`); };

// UI Components
const Card = ({children, className='', onClick}) => (<div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>{children}</div>);

const Button = ({children, onClick, variant='primary', className='', icon:Icon, fullWidth, ...p}) => {
  const vs = { 
      primary: "bg-blue-600 text-white hover:bg-blue-700", 
      secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50", 
      success: "bg-green-600 text-white hover:bg-green-700", 
      danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent", 
      orange: "bg-orange-500 text-white hover:bg-orange-600", // Stronger orange for text visibility
      gray: "bg-slate-200 text-slate-700 hover:bg-slate-300" 
  };
  return <button onClick={onClick} className={`flex items-center justify-center px-4 py-3 rounded-lg font-bold text-sm transition-all active:scale-95 ${vs[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} {...p}>{Icon && <Icon size={18} className="mr-2"/>}{children}</button>;
};

const Input = ({label, type="text", ...p}) => (<div className="mb-3"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label><input type={type} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" {...p}/></div>);
const Select = ({ label, options, ...props }) => ( <div className="mb-4"> <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label> <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900" {...props}> {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </select> </div> );

const KanbanColumn = ({ title, status, appointments, onClickApp, lang, onStatusChange, isMobile }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); const id = e.dataTransfer.getData("appId"); if(id) onStatusChange(id, status); };
  const containerClasses = isMobile ? `flex-1 flex flex-col rounded-2xl border border-slate-200/60 transition-all duration-200 overflow-hidden min-h-[400px]` : `flex-1 flex flex-col h-full transition-all duration-200 overflow-hidden`;
  const bgClass = isDragOver ? 'bg-blue-50' : (isMobile ? 'bg-slate-50/50' : 'bg-slate-50');

  return (
    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`${containerClasses} ${bgClass}`}>
      <div className={`p-4 font-bold text-xs uppercase tracking-wider border-b border-slate-200 flex justify-between items-center flex-shrink-0 bg-white/50 backdrop-blur-sm ${status==='incoming'?'text-blue-600':status==='pending'?'text-orange-600':'text-green-600'}`}>
        {title} <span className="bg-white px-2 py-0.5 rounded-full text-[10px] shadow-sm text-slate-600">{appointments.length}</span>
      </div>
      <div className="p-3 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
        {appointments.length===0 ? <div className="text-center py-10 text-slate-300 italic text-xs">{isDragOver?'Drop here':'Empty'}</div> : appointments.map(app => {
            const assignee = TEAM_MEMBERS.find(m => m.id === app.assignedTo) || TEAM_MEMBERS[0];
            return (
            <div key={app.id} draggable onDragStart={(e)=>{e.dataTransfer.setData("appId",app.id);e.dataTransfer.effectAllowed="move";}} onClick={()=>onClickApp(app)} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-200 transition-all active:scale-[0.98] group relative">
               <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 text-sm">{app.customerName}</h4>
                  <img src={assignee.avatar} className="w-6 h-6 rounded-full border border-slate-200" alt={assignee.name} title={assignee.name} />
              </div>
              <span className="text-[10px] font-medium bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded mb-2 inline-block">{new Date(app.date).toLocaleDateString(lang === 'hr' ? 'hr-HR' : 'en-US')}</span>
              <div className="flex items-center text-xs text-slate-500 gap-1 mb-2"><MapPin size={10}/> {app.city} <span className="mx-1">•</span> <span>{app.category}</span></div>
              <div className="bg-slate-50 px-2 py-1.5 rounded text-[11px] text-slate-600 truncate border border-slate-100">"{app.request}"</div>
            </div>
        )})}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [authMode, setAuthMode] = useState('login'); 
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authErrorCode, setAuthErrorCode] = useState('');
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [view, setView] = useState('login'); 
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filter, setFilter] = useState('');
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [foodData, setFoodData] = useState([]);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ customerName: '', city: '', address: '', date: '', time: '08:00', request: '', category: 'inspection', status: 'incoming', reportNotes: '', finalReport: '', todos: [], reportImages: [], assignedTo: 'me' });
  const [showSplash, setShowSplash] = useState(true);
  const [dailyQuote, setDailyQuote] = useState("");

  useEffect(() => { setDailyQuote(getRandomQuote()); const handleResize = () => setIsMobile(window.innerWidth < 768); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize); }, []);

  // Updated Init & Auth Effect (NO Auto-Login to avoid errors)
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!app) throw new Error("Firebase not initialized");
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token);
        } 
      } catch (err) { console.warn("Auto-login skipped:", err); }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userProfileRef = doc(db, 'artifacts', appId, 'users', u.uid, 'account', 'profile');
        const snap = await getDoc(userProfileRef);
        if (snap.exists()) { setRole(snap.data().role); } else { setRole('admin'); }
        setUser(u);
        setView('dashboard');
      } else {
        setUser(null);
        setRole(null);
        setView('login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if(!db || !user) return;
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'appointments');
    const unsubscribe = onSnapshot(q, (snap) => {
      const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      apps.sort((a,b) => new Date(a.date) - new Date(b.date));
      setAppointments(apps);
      setLoading(false);
    }, (err) => { 
        console.error("Firestore Error:", err); 
        if (err.code === 'permission-denied') {
            setErrorMsg("Permission denied. Check Firestore Security Rules.");
        }
    });
    return () => unsubscribe();
  }, [user]);

  const handleAuth = async () => {
    setLoading(true);
    setAuthError('');
    setAuthErrorCode('');
    try {
        if (authMode === 'login') {
            await signInWithEmailAndPassword(auth, authData.email, authData.password);
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
            await setDoc(doc(db, 'artifacts', appId, 'users', userCredential.user.uid, 'account', 'profile'), {
                email: authData.email,
                role: 'admin',
                joined: serverTimestamp()
            });
            setRole('admin');
        }
    } catch (e) {
        console.error(e);
        let msg = t.authError;
        setAuthErrorCode(e.code);
        if (e.code === 'auth/operation-not-allowed') msg = lang === 'en' ? "Enable Email/Pass in Firebase!" : "Aktivirajte Email/Pass u Firebaseu!";
        else if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') msg = lang === 'en' ? "Invalid email or password." : "Nevažeći email ili lozinka.";
        else if (e.code === 'auth/email-already-in-use') msg = lang === 'en' ? "Email already in use." : "Email se već koristi.";
        else if (e.code === 'auth/weak-password') msg = lang === 'en' ? "Password too weak." : "Lozinka je preslaba.";
        setAuthError(msg);
        setLoading(false);
    }
  };

  const handleDemoAuth = async () => {
      setLoading(true);
      setAuthError('');
      try {
          await signInAnonymously(auth);
          setRole('admin'); 
      } catch (e) {
          console.error("Demo Auth Error:", e);
          let msg = "Demo mode failed.";
          if (e.code === 'auth/operation-not-allowed') msg = "Enable 'Anonymous' auth in Firebase Console for Demo.";
          setAuthError(msg);
          setLoading(false);
      }
  };

  const handleLogout = async () => {
      await signOut(auth);
  };

  const saveApp = async (data) => {
    if(!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'appointments'), { 
        ...data, status: 'incoming', createdAt: serverTimestamp(), reportImages:[],
        todos: [ { text: t.defaultTask1, done: false }, { text: t.defaultTask2, done: false }, { text: t.defaultTask3, done: false }, { text: t.defaultTask4, done: false } ]
    });
    setView('dashboard');
  };
  const updateApp = async (id, data) => { if(!user) return; await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', id), data); };
  const deleteApp = async (id) => { if(!user) return; if(confirm(t.confirmDelete)) { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', id)); setView('dashboard'); }};
  const handleUpdateStatus = (id, s) => { updateApp(id, {status: s}); if(selectedAppointment && selectedAppointment.id === id) setSelectedAppointment({...selectedAppointment, status: s}); };
  const getCategoryLabel = (k) => { const m = { 'inspection': t.catInspection, 'consulting': t.catConsulting, 'emergency': t.catEmergency }; return m[k] || k; };
  const triggerStationNav = (name, city) => { safeOpen(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`); };
  const filterFn = a => a.customerName.toLowerCase().includes(filter.toLowerCase()) || a.city.toLowerCase().includes(filter.toLowerCase());
  const incoming = appointments.filter(a => (a.status === 'incoming' || !a.status) && filterFn(a));
  const pending = appointments.filter(a => a.status === 'pending' && filterFn(a));
  const done = appointments.filter(a => a.status === 'done' && filterFn(a));
  const archived = appointments.filter(a => a.status === 'archived' && filterFn(a));
  useEffect(() => { if (selectedAppointment && view === 'detail') { setFoodData(generateRouteRestaurants(selectedAppointment.city, lang)); } }, [selectedAppointment, view, lang]);

  // --- VIEWS ---
  if (showSplash) return (<div onClick={() => setShowSplash(false)} className="fixed inset-0 z-50 bg-blue-600 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-500"><div className="transform transition-transform duration-700 hover:scale-105 flex flex-col items-center"><AppLogo size="w-40 h-40" showFallback={true} /><h1 className="text-4xl font-black mt-6 mb-2 tracking-tighter">DC INSPECT</h1><div className="w-16 h-1 bg-white/30 rounded-full mb-8"></div><div className="max-w-xs text-center px-6"><Quote size={24} className="mb-2 opacity-50 mx-auto" /><p className="text-xl font-medium italic leading-relaxed opacity-90">"{dailyQuote}"</p></div></div><div className="absolute bottom-10 text-xs font-bold uppercase tracking-widest opacity-50 animate-pulse">Tap anywhere to start</div></div>);
  
  if (errorMsg) {
      return (
          <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
              <AlertTriangle className="text-red-500 w-12 h-12 mb-4" />
              <h2 className="text-xl font-bold text-red-900 mb-2">Configuration Error</h2>
              <p className="text-red-700 mb-6 bg-white p-4 rounded border border-red-200">{errorMsg}</p>
              <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded font-bold">Reload</button>
          </div>
      )
  }

  if(loading) return <div className="h-screen flex items-center justify-center text-blue-600 bg-slate-50"><Loader className="animate-spin w-8 h-8"/></div>;

  // 3. LOGIN SCREEN (UPDATED)
  if (view === 'login') {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <AppLogo size="w-24 h-24" />
              <h1 className="text-3xl font-black text-slate-900 mt-6 mb-2">DC INSPECT</h1>
              <p className="text-slate-500 mb-8 font-medium">SaaS Edition</p>
              
              <div className="w-full max-w-sm space-y-4 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800">{authMode === 'login' ? t.loginTitle : t.registerBtn}</h2>
                  {authError && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2 text-left border border-red-100"><AlertTriangle size={16} className="flex-shrink-0"/> <div><strong>Error:</strong> {authError}</div></div>}
                  
                  <div className="space-y-3">
                    <Input label={t.emailLabel} type="email" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} placeholder="name@company.com" />
                    <Input label={t.passLabel} type="password" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} placeholder="••••••••" />
                  </div>

                  <Button fullWidth onClick={handleAuth} icon={authMode === 'login' ? LogIn : UserPlus} className="h-12 text-lg shadow-lg shadow-blue-200">
                      {authMode === 'login' ? t.loginBtn : t.registerBtn}
                  </Button>
                  
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                      <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-sm text-blue-600 font-bold hover:underline w-full">
                          {authMode === 'login' ? "No account? Create one" : "Have an account? Login"}
                      </button>
                      <button onClick={handleDemoAuth} className="text-xs text-slate-400 hover:text-slate-600 w-full flex items-center justify-center gap-1"><HelpCircle size={12}/> {t.demoBtn}</button>
                  </div>
              </div>
          </div>
      );
  }

  // 4. MAIN APP (ADD)
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
                <Select label={t.labelTime} options={timeOptions} value={formData.time} onChange={e=>setFormData({...formData, time:e.target.value})} />
            </div>
            <Input label={t.labelCity} value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})} />
            <Input label={t.labelAddress} value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} />
            <Input label={t.labelRequest} value={formData.request} onChange={e=>setFormData({...formData, request:e.target.value})} />
            
            {/* Team Assignment (Only if Admin) */}
            {role === 'admin' && (
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.labelAssign}</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {TEAM_MEMBERS.map(m => (
                            <button key={m.id} onClick={() => setFormData({...formData, assignedTo: m.id})} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${formData.assignedTo === m.id ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                                <img src={m.avatar} className="w-5 h-5 rounded-full"/>
                                <span className="text-xs font-bold whitespace-nowrap">{m.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.labelCategory}</label><select className="w-full p-3 border rounded-lg bg-slate-50 text-slate-900" value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}><option value="inspection">Inspection</option><option value="consulting">Consulting</option><option value="emergency">Emergency</option></select></div>
            <Button fullWidth onClick={() => saveApp(formData)} icon={Save}>{t.save}</Button>
          </Card>
        </div>
      </div>
    );
  }

  // 5. MAIN APP (DETAIL)
  if(view === 'detail' && selectedAppointment) {
    const a = selectedAppointment;
    const handleReportUpdate = (noteText) => { const finalText = generateReportText(noteText, a.customerName, a.date, a.category, lang); updateApp(a.id, { reportNotes: noteText, finalReport: finalText }); setSelectedAppointment({ ...a, reportNotes: noteText, finalReport: finalText }); };
    const statusColor = a.status==='archived' ? 'bg-slate-500' : a.status==='done' ? 'bg-green-600' : a.status==='pending' ? 'bg-orange-500' : 'bg-blue-600';
    const statusLabel = a.status === 'incoming' ? t.colIncoming : a.status === 'pending' ? t.colPending : a.status === 'done' ? t.colDone : t.colArchived;
    const assignee = TEAM_MEMBERS.find(m => m.id === a.assignedTo) || TEAM_MEMBERS[0];

    return (
      <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
        <div className={`text-white px-4 pt-4 pb-16 shadow-md ${statusColor}`}>
           <div className="flex justify-between items-start mb-4 max-w-4xl mx-auto w-full">
             <button onClick={() => setView(a.status === 'archived' ? 'archive' : 'dashboard')} className="p-2 bg-white/20 rounded-lg hover:bg-white/30"><ArrowLeft size={20}/></button>
             <span className="text-xs font-bold uppercase bg-black/20 px-3 py-1 rounded-full">{statusLabel}</span>
           </div>
           <div className="max-w-4xl mx-auto"><h1 className="text-2xl font-bold mb-1">{a.customerName}</h1><div className="flex items-center gap-2 text-sm opacity-90"><MapPin size={14}/> {a.address}, {a.city}</div></div>
        </div>

        <div className="px-4 -mt-10 relative z-10 w-full max-w-4xl mx-auto space-y-4">
           
           {/* EDITABLE ASSIGNEE IN DETAIL VIEW */}
           <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm border border-white/50 text-xs font-medium text-slate-600">
                <div className="flex items-center justify-between mb-2">
                    <span>{t.assignTo}</span>
                    <div className="flex items-center gap-2">
                        <img src={assignee.avatar} className="w-5 h-5 rounded-full"/>
                        <span>{assignee.name}</span>
                    </div>
                </div>
                {/* Enable changing assignee if Admin */}
                {role === 'admin' && (
                    <div className="flex gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-200">
                        {TEAM_MEMBERS.map(m => (
                            <button key={m.id} onClick={() => { updateApp(a.id, { assignedTo: m.id }); setSelectedAppointment({...a, assignedTo: m.id}); }} className={`flex-shrink-0 w-8 h-8 rounded-full border-2 ${a.assignedTo === m.id ? 'border-blue-500' : 'border-transparent opacity-50'}`}>
                                <img src={m.avatar} className="w-full h-full rounded-full" title={m.name} />
                            </button>
                        ))}
                    </div>
                )}
           </div>

           <Card className="p-3 grid grid-cols-2 gap-3">
              {a.status === 'incoming' && <Button variant="orange" onClick={() => handleUpdateStatus(a.id, 'pending')}>{t.moveToPending}</Button>}
              {a.status === 'pending' && <Button variant="secondary" onClick={() => handleUpdateStatus(a.id, 'incoming')} icon={Undo}>{t.moveToIncoming}</Button>}
              {a.status === 'pending' && <Button variant="success" onClick={() => handleUpdateStatus(a.id, 'done')}>{t.moveToDone}</Button>}
              {a.status === 'done' && <Button variant="secondary" onClick={() => handleUpdateStatus(a.id, 'pending')} icon={Undo}>{t.restore}</Button>}
              {a.status === 'done' && <Button variant="gray" onClick={() => handleUpdateStatus(a.id, 'archived')} icon={FolderArchive}>{t.moveToArchived}</Button>}
              {a.status === 'archived' && <Button variant="secondary" onClick={() => handleUpdateStatus(a.id, 'done')} icon={Undo}>{t.restoreFromArchive}</Button>}
           </Card>

           <Card className="p-5 shadow-lg">
             <div className="flex gap-3 mb-4 border-b border-slate-100 pb-4"><div className="bg-blue-50 p-2.5 rounded-lg text-blue-600"><Calendar size={20} /></div><div><div className="text-xs text-slate-400 uppercase font-semibold">{t.labelDate}</div><div className="font-semibold text-slate-800">{new Date(a.date).toLocaleDateString()} - {a.time}</div></div></div>
             <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">{a.request}</p>
             <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">{getCategoryLabel(a.category)}</span>
           </Card>
           
           <Card className="p-0 overflow-hidden"><div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between"><h3 className="font-bold text-slate-700 flex items-center gap-2"><CheckSquare size={18} className="text-blue-500"/> {t.tasksTitle}</h3></div><div className="divide-y divide-slate-100">{(a.todos||[]).map((todo, idx) => (<div key={idx} onClick={() => { const n=[...a.todos]; n[idx].done=!n[idx].done; updateApp(a.id, {todos: n}); setSelectedAppointment({...a, todos:n}); }} className={`p-4 flex items-center gap-3 cursor-pointer ${todo.done?'bg-slate-50/50':''}`}><div className={`w-5 h-5 rounded border flex items-center justify-center ${todo.done?'bg-green-500 border-green-500 text-white':'bg-white'}`}>{todo.done && <CheckSquare size={12}/>}</div><span className={`${todo.done?'line-through text-slate-400':''}`}>{todo.text}</span></div>))}<div className="p-3"><input className="w-full bg-slate-50 p-2 rounded border border-slate-200 text-sm" placeholder={t.taskPlaceholder} onKeyDown={(e)=>{ if(e.key==='Enter'){ const n=[...(a.todos||[]), {text:e.target.value, done:false}]; updateApp(a.id, {todos: n}); setSelectedAppointment({...a, todos:n}); e.target.value=''; }}}/></div></div></Card>
           
           <Button onClick={() => safeOpen(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${a.address}, ${a.city}`)}`)} className="w-full shadow-md bg-blue-600 text-white py-4" icon={Navigation} variant="primary">{t.navStart}</Button>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Card className="p-4"><h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3"><Fuel size={16} className="text-orange-500"/> {t.gasTitle}</h3><p className="text-xs text-slate-500 mb-3">{t.gasDesc}</p><Button variant="secondary" size="small" fullWidth onClick={() => safeOpen(`https://www.google.com/maps/search/gas+stations+near+${a.city}`)}>{t.gasButton}</Button></Card><Card className="p-4"><h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3"><Coffee size={16} className="text-brown-500"/> {t.foodTitle}</h3><div className="space-y-2">{foodData.map((f,i)=><div key={i} className="text-xs flex justify-between p-2 bg-slate-50 rounded border border-slate-100 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => triggerStationNav(f.name, a.city)}><span>{f.name}</span><span className="text-slate-400">{f.dist}</span></div>)}</div></Card></div>
           
           <Card className="p-4"><h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3"><FileText size={16}/> {t.reportTitle}</h3><div className="flex gap-2 overflow-x-auto pb-4 mb-2"><label className="flex-shrink-0 w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50"><Camera size={20}/><input type="file" className="hidden" accept="image/*" onChange={async (e) => { if(e.target.files[0]) { const b64 = await compressImage(e.target.files[0]); const n=[...(a.reportImages||[]), b64]; updateApp(a.id, {reportImages:n}); setSelectedAppointment({...a, reportImages:n}); }}}/></label>{(a.reportImages||[]).map((img, i) => (<div key={i} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200"><img src={img} className="w-full h-full object-cover"/><button onClick={() => { const n = a.reportImages.filter((_, idx) => idx !== i); updateApp(a.id, {reportImages:n}); setSelectedAppointment({...a, reportImages:n}); }} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X size={10}/></button></div>))}</div><div className="space-y-2"><textarea className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm min-h-[100px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t.reportNotesPlaceholder} value={a.reportNotes || ''} onChange={(e) => { setSelectedAppointment({...a, reportNotes: e.target.value}); }} /><Button fullWidth onClick={() => handleReportUpdate(a.reportNotes || '')} icon={Wand2}>{t.generateBtn}</Button></div>{a.finalReport && (<div className="mt-4 pt-4 border-t border-slate-100"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.reportResultLabel}</label><div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono whitespace-pre-wrap mb-4 max-h-40 overflow-y-auto">{a.finalReport}</div><div className="flex gap-2"><Button size="small" variant="secondary" icon={Printer} onClick={() => printAsPdf(a.finalReport, a.reportImages)}>{t.downloadPdf}</Button><Button size="small" variant="secondary" icon={Download} onClick={() => downloadAsWord(a.finalReport, a.customerName, a.reportImages)}>{t.downloadDoc}</Button></div></div>)}</Card>
           <div className="pt-8 pb-4"><Button fullWidth variant="danger" icon={Trash2} onClick={() => deleteApp(a.id)}>{t.delete}</Button></div>
        </div>
      </div>
    );
  }

  // VIEW: TEAM DASHBOARD (CHEF MODE)
  if (view === 'team') {
      return (
          <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
             <div className="bg-white px-5 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3"><button onClick={() => setView('dashboard')}><ArrowLeft/></button><h1 className="text-lg font-bold">{t.navTeam}</h1></div>
             </div>
             
             <div className="p-4 max-w-4xl mx-auto space-y-6">
                <Card className="p-0 overflow-hidden relative h-64 bg-blue-50 border-blue-100">
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#2563EB 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><MapIcon size={64} className="text-blue-200" /></div>
                    {appointments.filter(a => a.status === 'pending').map((p, i) => {
                        const assignee = TEAM_MEMBERS.find(m => m.id === p.assignedTo) || TEAM_MEMBERS[0];
                        return (
                            <div key={p.id} className="absolute bg-white p-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2 animate-bounce" style={{ top: `${20 + (i*15)}%`, left: `${20 + (i*20)}%` }}>
                                <img src={assignee.avatar} className="w-6 h-6 rounded-full"/>
                                <div className="text-xs font-bold text-slate-700 whitespace-nowrap">{p.city}</div>
                            </div>
                        )
                    })}
                </Card>
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><Users size={16}/> {t.teamStatusTitle}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {TEAM_MEMBERS.map(member => {
                            const activeTask = appointments.find(p => p.assignedTo === member.id && p.status === 'pending');
                            return (
                                <Card key={member.id} className="p-4 flex items-center gap-4">
                                    <div className="relative">
                                        <img src={member.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm"/>
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${activeTask ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">{member.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            {activeTask ? ( <span className="text-green-600 font-medium flex items-center gap-1"><MapPin size={10}/> {activeTask.city}: {activeTask.category}</span> ) : ( "Available / Idle" )}
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
             </div>
          </div>
      )
  }

  // VIEW: DASHBOARD
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col h-screen overflow-hidden text-slate-900">
      <div className="bg-white px-5 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-20 flex-shrink-0">
         <div className="flex items-center gap-3">
            <AppLogo size="w-14 h-14" showFallback={true} />
            <div><h1 className="text-xl font-black text-blue-900 tracking-tight">{t.appTitle}</h1><p className="text-[10px] text-slate-500 font-medium">{t.subtitle}</p></div>
         </div>
         <div className="flex gap-2">
            <button onClick={() => setView('dashboard')} className={`p-2 rounded-lg ${view==='dashboard'?'bg-blue-50 text-blue-600':'text-slate-400'}`}><LayoutDashboard size={20}/></button>
            {role === 'admin' && (
                <button onClick={() => setView('team')} className={`p-2 rounded-lg ${view==='team'?'bg-blue-50 text-blue-600':'text-slate-400'}`} title={t.navTeam}><Users size={20}/></button>
            )}
            <button onClick={() => setView('archive')} className={`p-2 rounded-lg ${view==='archive'?'bg-blue-50 text-blue-600':'text-slate-400'}`}><Archive size={20}/></button>
            <button onClick={() => setLang(l => l==='hr'?'en':'hr')} className="px-2 bg-slate-100 rounded text-xs font-bold text-slate-500 border border-slate-200">{lang.toUpperCase()}</button>
            <button onClick={handleLogout} className="px-2 bg-red-50 rounded text-xs font-bold text-red-500 border border-red-200"><LogOut size={16}/></button>
            {/* DEBUG TOGGLE FOR ROLE (Hidden in production usually) */}
            <button onClick={() => setRole(r => r === 'admin' ? 'user' : 'admin')} className="px-2 bg-gray-100 rounded text-xs font-bold text-gray-400 border border-gray-200" title="Toggle Admin Role (Debug)"><Shield size={12}/></button>
         </div>
      </div>

      <div className="px-4 py-2 bg-white border-b border-slate-100 z-10 flex-shrink-0"><div className="relative"><SearchIcon className="absolute left-3 top-3 text-slate-400" size={16}/><input placeholder={t.searchPlaceholder} value={filter} onChange={e => setFilter(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900" /></div></div>

      <div className="flex-1 overflow-hidden relative w-full bg-slate-50">
        {view === 'archive' ? (
            <div className="max-w-3xl mx-auto space-y-3 p-4 overflow-y-auto h-full custom-scrollbar">{archived.length === 0 ? <div className="text-center py-10 text-slate-300 italic">{t.emptyArchive}</div> : archived.map(app => <div key={app.id} onClick={() => { setSelectedAppointment(app); setView('detail'); }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between cursor-pointer hover:border-blue-300"><span className="font-bold text-slate-700">{app.customerName}</span><span className="text-xs bg-slate-500 text-white px-2 py-1 rounded">{t.colArchived}</span></div>)}</div>
        ) : (
            <>
              {/* DESKTOP VIEW: Edge to Edge Columns */}
              {!isMobile && (
                  <div className="flex flex-row h-full w-full divide-x divide-slate-200">
                      <div className="flex-1 h-full p-2"><KanbanColumn title={t.colIncoming} status="incoming" appointments={incoming} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} isMobile={false} /></div>
                      <div className="flex-1 h-full p-2"><KanbanColumn title={t.colPending} status="pending" appointments={pending} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} isMobile={false} /></div>
                      <div className="flex-1 h-full p-2"><KanbanColumn title={t.colDone} status="done" appointments={done} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} isMobile={false} /></div>
                  </div>
              )}
              {/* MOBILE VIEW: Stacked with Padding */}
              {isMobile && (
                  <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full custom-scrollbar">
                      <KanbanColumn title={t.colIncoming} status="incoming" appointments={incoming} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} isMobile={true} />
                      <KanbanColumn title={t.colPending} status="pending" appointments={pending} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} isMobile={true} />
                      <KanbanColumn title={t.colDone} status="done" appointments={done} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} isMobile={true} />
                  </div>
              )}
            </>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-30">
          {/* Create Button only for Admin */}
          {role === 'admin' && (
              <button onClick={() => { setFormData({ customerName: '', city: '', address: '', date: '', time: '08:00', request: '', category: 'inspection', status: 'incoming', reportNotes: '', finalReport: '', todos: [], reportImages: [], assignedTo: 'me' }); setView('add'); }} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl shadow-blue-200 flex items-center justify-center transition-transform active:scale-90"><Plus size={28} /></button>
          )}
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar{height:4px;width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}`}</style>
    </div>
  );
}