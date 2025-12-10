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
let initError = "";

try {
  // Versuch 1: Automatische Config (Preview Umgebung)
  if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(__firebase_config);
  } 
} catch (e) { console.warn("Auto-Config failed:", e); }

// Versuch 2: Manuelle Config (Lokal / Fallback)
if (!firebaseConfig) {
    // -----------------------------------------------------------
    // WICHTIG FÜR LOKALES TESTEN:
    // Ersetze diesen Block mit deinen ECHTEN Daten aus der Firebase Console!
    // (Project Settings -> General -> Your apps -> SDK setup/config)
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

let app, auth, db;
try {
  // Prüfen, ob wir nur den Platzhalter haben (dann wird Auth fehlschlagen)
  if (firebaseConfig.apiKey === "HIER_DEIN_API_KEY_EINFÜGEN" && typeof __firebase_config === 'undefined') {
     console.warn("ACHTUNG: Firebase Config sind nur Platzhalter!");
     initError = "Platzhalter-Config erkannt. Bitte echte Daten in src/App.jsx eintragen.";
  }
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) { 
    console.error("Firebase Init Error:", error); 
    initError = error.message;
}

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
    colIncoming: "NOVI", colPending: "U TIJEKU", colReview: "PREGLED", colDone: "ZAVRŠENO", colArchived: "ARHIVIRANO",
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
    menuOverview: "Pregled / Mapa", menuTemplates: "Predlošci", menuEmployees: "Zaposlenici", menuCustomers: "Kupci", menuCalendar: "Kalendar", menuSetup: "Postavke",
    genDataBtn: "Generiraj testne podatke",
    gasTitle: "Gorivo", gasDesc: "Cijene u blizini", gasButton: "Traži benzinske (GPS)",
    foodTitle: "Hrana", foodSubtitle: "Preporuka rute",
    moveToPending: "Započni", moveToReview: "Na Pregled", moveToDone: "Završi", restore: "Vrati", moveToIncoming: "Vrati u nove",
    moveToArchived: "Arhiviraj", restoreFromArchive: "Vrati u završeno"
  },
  en: {
    appTitle: "DC INSPECT", subtitle: "Mobile Assistant",
    navDashboard: "Dashboard", navArchive: "Archive", navTeam: "Admin Panel",
    colIncoming: "INCOMING", colPending: "PENDING", colReview: "IN REVIEW", colDone: "DONE", colArchived: "ARCHIVED",
    loginTitle: "Welcome Back", loginBtn: "Sign In", registerBtn: "Create Account",
    emailLabel: "Email Address", passLabel: "Password",
    logout: "Sign Out",
    save: "Save", delete: "Delete", downloadPdf: "PDF", downloadDoc: "Word",
    navStart: "Start Navigation", addToCalendar: "Add to Calendar",
    tasksTitle: "Preparation / To-do before taking over",
    teamStatusTitle: "Employee Status", assignTo: "Assigned to: ", teamMapTitle: "Team Locations",
    catInspection: "Inspection", catConsulting: "Consulting", catEmergency: "Emergency",
    reportNotesPlaceholder: "Enter keywords...", generateBtn: "Generate Report", reportResultLabel: "Report Preview",
    defaultTask1: "Prepare tools", defaultTask2: "Review docs", defaultTask3: "Check keys", defaultTask4: "Safety gear",
    authError: "Authentication failed.", demoBtn: "Trouble? Start Demo (Anonymous)",
    menuOverview: "Overview / Map", menuTemplates: "Templates", menuEmployees: "Employees", menuCustomers: "Customers", menuCalendar: "Calendar", menuSetup: "Setup",
    genDataBtn: "Generate Demo Data",
    gasTitle: "Fuel", gasDesc: "Prices nearby", gasButton: "Search Gas Stations (GPS)",
    foodTitle: "Food", foodSubtitle: "Route recommendation",
    moveToPending: "Start Working", moveToReview: "Submit for Review", moveToDone: "Complete", restore: "Restore", moveToIncoming: "Move to Incoming",
    moveToArchived: "Archive", restoreFromArchive: "Restore to Done"
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
  const vs = { primary: "bg-blue-600 text-white hover:bg-blue-700", secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50", success: "bg-green-600 text-white hover:bg-green-700", danger: "bg-red-50 text-red-600 hover:bg-red-100", orange: "bg-orange-500 text-white hover:bg-orange-600", purple: "bg-indigo-500 text-white hover:bg-indigo-600", gray: "bg-slate-200 text-slate-700 hover:bg-slate-300" };
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

  // Status Colors
  let headerColor = 'text-slate-600 bg-slate-50/50';
  if(status === 'incoming') headerColor = 'text-blue-600 bg-blue-50/50';
  else if(status === 'pending') headerColor = 'text-orange-600 bg-orange-50/50';
  else if(status === 'review') headerColor = 'text-indigo-600 bg-indigo-50/50';
  else if(status === 'done') headerColor = 'text-green-600 bg-green-50/50';

  return (
    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`${containerClasses} ${bgClass}`}>
      <div className={`p-4 font-bold text-xs uppercase tracking-wider border-b border-slate-200 flex justify-between items-center flex-shrink-0 bg-white/50 backdrop-blur-sm ${headerColor}`}>
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
  const [adminView, setAdminView] = useState('map'); 
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

  useEffect(() => { setDailyQuote(getRandomQuote()); const handleResize = () => setIsMobile(window.innerWidth <768); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize); }, []);

  // Updated Init & Auth Effect with safety checks
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!app) {
           // Fallback UI wird unten getriggert
           return; 
        }
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token);
        } 
      } catch (err) { console.warn("Auto-login skipped:", err); }
    };
    
    if (auth) {
        initAuth();
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
          if (u) {
            // Check Profile if DB is available
            if(db) {
                const userProfileRef = doc(db, 'artifacts', appId, 'users', u.uid, 'account', 'profile');
                try {
                    const snap = await getDoc(userProfileRef);
                    if (snap.exists()) { setRole(snap.data().role); } else { setRole('admin'); }
                } catch(e) { console.warn("Profile fetch error", e); setRole('admin'); }
            }
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
    } else {
        setLoading(false);
        // If auth is missing, we likely have a config error
        if(initError) setErrorMsg("Firebase Setup Error: " + initError);
    }
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
    if(!auth) { setAuthError("Firebase not connected."); return; }
    setLoading(true);
    setAuthError('');
    setAuthErrorCode('');
    try {
        if (authMode === 'login') {
            await signInWithEmailAndPassword(auth, authData.email, authData.password);
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
            if(db) {
                await setDoc(doc(db, 'artifacts', appId, 'users', userCredential.user.uid, 'account', 'profile'), {
                    email: authData.email,
                    role: 'admin',
                    joined: serverTimestamp()
                });
            }
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
      if(!auth) return;
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

  const handleLogout = async () => { if(auth) await signOut(auth); };

  const saveApp = async (data) => {
    if(!user || !db) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'appointments'), { 
        ...data, status: 'incoming', createdAt: serverTimestamp(), reportImages:[],
        todos: [ { text: t.defaultTask1, done: false }, { text: t.defaultTask2, done: false }, { text: t.defaultTask3, done: false }, { text: t.defaultTask4, done: false } ]
    });
    setView('dashboard');
  };
  const updateApp = async (id, data) => { if(!user || !db) return; await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', id), data); };
  const deleteApp = async (id) => { if(!user || !db) return; if(confirm(t.confirmDelete)) { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', id)); setView('dashboard'); }};
  const handleUpdateStatus = (id, s) => { updateApp(id, {status: s}); if(selectedAppointment && selectedAppointment.id === id) setSelectedAppointment({...selectedAppointment, status: s}); };
  const getCategoryLabel = (k) => { const m = { 'inspection': t.catInspection, 'consulting': t.catConsulting, 'emergency': t.catEmergency }; return m[k] || k; };
  const triggerStationNav = (name, city) => { safeOpen(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`); };
  const filterFn = a => a.customerName.toLowerCase().includes(filter.toLowerCase()) || a.city.toLowerCase().includes(filter.toLowerCase());
  
  const incoming = appointments.filter(a => (a.status === 'incoming' || !a.status) && filterFn(a));
  const pending = appointments.filter(a => a.status === 'pending' && filterFn(a));
  const review = appointments.filter(a => a.status === 'review' && filterFn(a));
  const done = appointments.filter(a => a.status === 'done' && filterFn(a));
  const archived = appointments.filter(a => a.status === 'archived' && filterFn(a));
  useEffect(() => { if (selectedAppointment && view === 'detail') { setFoodData(generateRouteRestaurants(selectedAppointment.city, lang)); } }, [selectedAppointment, view, lang]);

  // NEW FUNCTION: Generate Demo Data
  const generateDemoData = async () => {
    if (!user || !db) return;
    setLoading(true);
    const demoCustomers = [
      { name: "Müller GmbH", city: "Zagreb", address: "Ilica 10", cat: "inspection", req: "Jahresinspektion Heizung" },
      { name: "Villa Kunterbunt", city: "Split", address: "Riva 5", cat: "consulting", req: "Beratung Anbau" },
      { name: "Bäckerei Schmidt", city: "Rijeka", address: "Korzo 12", cat: "emergency", req: "Rohrbruch im Keller" },
      { name: "Hotel Adriatic", city: "Zadar", address: "Obala 2", cat: "inspection", req: "Feuerschutz Check" },
      { name: "Autohaus Fischer", city: "Osijek", address: "Vukovarska 50", cat: "inspection", req: "Werkstatt Abnahme" },
      { name: "Privat: Hr. Horvat", city: "Pula", address: "Arena 1", cat: "consulting", req: "Schimmelanalyse" },
      { name: "Büro Center West", city: "Zagreb", address: "Savska 100", cat: "inspection", req: "Aufzugsprüfung" },
      { name: "Kita Sonnenschein", city: "Dubrovnik", address: "Stradun 1", cat: "emergency", req: "Stromausfall" },
      { name: "Restaurant Plavi", city: "Šibenik", address: "Obala 4", cat: "inspection", req: "Hygieneinspektion" },
      { name: "Logistikzentrum", city: "Varaždin", address: "Industrija 9", cat: "inspection", req: "Lüftungsanlage" }
    ];
    const statuses = ['incoming', 'incoming', 'pending', 'pending', 'review', 'review', 'done', 'done', 'archived', 'incoming'];
    try {
        const batchPromises = demoCustomers.map(async (c, i) => {
            const randomStatus = statuses[i];
            const randomMember = TEAM_MEMBERS[i % TEAM_MEMBERS.length].id;
            const date = new Date();
            date.setDate(date.getDate() + (i - 2)); 
            const dateStr = date.toISOString().split('T')[0];
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'appointments'), {
                customerName: c.name, city: c.city, address: c.address, date: dateStr, time: `0${8 + (i%8)}:00`,
                request: c.req, category: c.cat, status: randomStatus, assignedTo: randomMember, createdAt: serverTimestamp(),
                todos: [ { text: t.defaultTask1, done: Math.random() > 0.5 }, { text: t.defaultTask2, done: Math.random() > 0.5 }, { text: t.defaultTask3, done: false }, { text: t.defaultTask4, done: false } ],
                reportImages: []
            });
        });
        await Promise.all(batchPromises);
        alert("10 Demo-Aufträge wurden erstellt!");
    } catch (e) { console.error("Error generating demo data:", e); }
    setLoading(false);
  };

  // --- ADMIN DASHBOARD RENDER HELPERS ---
  const renderAdminSidebar = () => (
      <div className={`bg-slate-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col ${isMobile ? 'h-auto' : 'h-screen'}`}>
          <div className="p-4 flex items-center gap-3 border-b border-slate-800">
              <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-lg"><ArrowLeft size={20}/></button>
              <span className="font-bold tracking-wide">ADMIN PANEL</span>
          </div>
          <nav className={`flex-1 overflow-y-auto p-4 space-y-2 ${isMobile ? 'flex flex-row overflow-x-auto space-x-2 space-y-0 pb-4' : 'flex-col'}`}>
              {[ { id: 'map', label: t.menuOverview, icon: MapIcon }, { id: 'templates', label: t.menuTemplates, icon: FileBox }, { id: 'employees', label: t.menuEmployees, icon: Users }, { id: 'customers', label: t.menuCustomers, icon: Briefcase }, { id: 'calendar', label: t.menuCalendar, icon: Calendar }, { id: 'setup', label: t.menuSetup, icon: Settings } ].map(item => (
                  <button key={item.id} onClick={() => setAdminView(item.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left ${adminView === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${isMobile ? 'flex-shrink-0 w-auto' : ''}`}>
                      <item.icon size={18} /><span className="font-medium text-sm">{item.label}</span>
                  </button>
              ))}
          </nav>
      </div>
  );

  const renderAdminContent = () => {
      switch(adminView) {
          case 'templates': return (
              <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">Templates</h2><div className="flex gap-2"><Button size="small" variant="secondary" icon={Upload}>Import</Button><Button size="small" icon={Plus}>New Template</Button></div></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{MOCK_TEMPLATES.map(tpl => (<Card key={tpl.id} className="p-4 hover:border-blue-300 cursor-pointer group"><div className="flex justify-between mb-2"><FileText className="text-blue-500" size={24}/><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button className="p-1 hover:bg-slate-100 rounded"><Copy size={14}/></button><button className="p-1 hover:bg-slate-100 rounded"><Settings size={14}/></button></div></div><h3 className="font-bold text-slate-800">{tpl.name}</h3><div className="text-xs text-slate-500 mt-2 flex justify-between"><span>{tpl.author}</span><span>{tpl.created}</span></div></Card>))}</div>
              </div>);
          case 'employees': return (
              <div className="p-6 space-y-6"><h2 className="text-2xl font-bold text-slate-800">Team & Employees</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{TEAM_MEMBERS.map(member => (<Card key={member.id} className="p-4 flex items-center gap-4"><img src={member.avatar} className="w-16 h-16 rounded-full border-2 border-slate-100"/><div className="flex-1"><h4 className="font-bold text-slate-800">{member.name}</h4><p className="text-xs text-slate-500">{member.role}</p><p className="text-xs text-blue-600 mt-1">{member.email}</p></div><button className="p-2 hover:bg-slate-50 rounded-full"><Settings size={16} className="text-slate-400"/></button></Card>))}</div></div>);
          case 'customers': return (
              <div className="p-6 space-y-6"><h2 className="text-2xl font-bold text-slate-800">Customers (CRM)</h2><Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200"><tr><th className="p-4">Customer</th><th className="p-4">Status</th><th className="p-4">Report</th><th className="p-4">Plan</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{appointments.map(app => (<tr key={app.id} className="hover:bg-slate-50"><td className="p-4 font-bold text-slate-800">{app.customerName}<br/><span className="text-xs font-normal text-slate-500">{app.city}</span></td><td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${app.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{app.status || 'Active'}</span></td><td className="p-4 text-slate-500">{app.finalReport ? <CheckCircle size={16} className="text-green-500"/> : '-'}</td><td className="p-4"><span className="text-xs bg-slate-100 px-2 py-1 rounded">Standard</span></td><td className="p-4 text-right"><button className="text-blue-600 hover:underline">View</button></td></tr>))}</tbody></table></div></Card></div>);
          case 'calendar': return (<div className="p-6 h-full flex flex-col"><h2 className="text-2xl font-bold text-slate-800 mb-6">Master Calendar</h2><div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"><div className="text-center"><Calendar size={48} className="mx-auto mb-4 opacity-50"/><p>Google Calendar Integration Active</p><Button className="mt-4" variant="secondary" icon={ExternalLink} onClick={() => safeOpen("https://calendar.google.com")}>Open Google Calendar</Button></div></div></div>);
          case 'setup': return (
                <div className="p-6 max-w-2xl"><h2 className="text-2xl font-bold text-slate-800 mb-6">System Setup</h2><Card className="p-6 space-y-6"><div><h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Company Details</h3><Input label="Company Name" placeholder="DC Inspect GmbH" /><Input label="Address" placeholder="Musterstraße 1" /><div className="grid grid-cols-2 gap-4"><Input label="VAT ID" placeholder="ATU12345678" /><Input label="Email" placeholder="office@dc-inspect.com" /></div></div><div><h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Integrations</h3><div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"><div className="flex items-center gap-3"><CloudLightning size={20} className="text-orange-500"/><span className="font-bold">n8n Automation</span></div><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">CONNECTED</span></div></div><Button fullWidth icon={Save}>Save Settings</Button>
                <div className="pt-4 border-t border-slate-100"><h3 className="font-bold text-slate-700 mb-2">Developer Tools</h3><Button fullWidth variant="secondary" icon={Database} onClick={generateDemoData}>{t.genDataBtn}</Button></div></Card></div>);
          case 'map': default: return (
                <div className="p-6 space-y-6"><h2 className="text-2xl font-bold text-slate-800">Live Operations</h2><Card className="p-0 overflow-hidden relative h-96 bg-blue-50 border-blue-100 shadow-md"><div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#2563EB 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div><div className="absolute inset-0 flex items-center justify-center pointer-events-none"><MapIcon size={64} className="text-blue-200" /></div>{appointments.filter(a => a.status === 'pending').map((p, i) => { const assignee = TEAM_MEMBERS.find(m => m.id === p.assignedTo) || TEAM_MEMBERS[0]; return (<div key={p.id} className="absolute bg-white p-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2 animate-bounce" style={{ top: `${20 + (i*15)}%`, left: `${20 + (i*20)}%` }}><img src={assignee.avatar} className="w-8 h-8 rounded-full border border-white shadow-sm"/><div><div className="text-xs font-bold text-slate-800 whitespace-nowrap">{assignee.name}</div><div className="text-[10px] text-slate-500 font-mono">{p.city}</div></div></div>) })}</Card></div>);
      }
  };

  // --- VIEWS ---
  if (showSplash) return (<div onClick={() => setShowSplash(false)} className="fixed inset-0 z-50 bg-blue-600 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-500"><div className="transform transition-transform duration-700 hover:scale-105 flex flex-col items-center"><AppLogo size="w-40 h-40" showFallback={true} /><h1 className="text-4xl font-black mt-6 mb-2 tracking-tighter">DC INSPECT</h1><div className="w-16 h-1 bg-white/30 rounded-full mb-8"></div><div className="max-w-xs text-center px-6"><Quote size={24} className="mb-2 opacity-50 mx-auto" /><p className="text-xl font-medium italic leading-relaxed opacity-90">"{dailyQuote}"</p></div></div><div className="absolute bottom-10 text-xs font-bold uppercase tracking-widest opacity-50 animate-pulse">Tap anywhere to start</div></div>);
  
  if (errorMsg) { return (<div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center"><AlertTriangle className="text-red-500 w-12 h-12 mb-4" /><h2 className="text-xl font-bold text-red-900 mb-2">Configuration Error</h2><p className="text-red-700 mb-6 bg-white p-4 rounded border border-red-200">{errorMsg}</p><button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded font-bold">Reload</button></div>) }
  if(loading) return <div className="h-screen flex items-center justify-center text-blue-600 bg-slate-50"><Loader className="animate-spin w-8 h-8"/></div>;

  // 3. LOGIN SCREEN
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
                  <Button fullWidth onClick={handleAuth} icon={authMode === 'login' ? LogIn : UserPlus} className="h-12 text-lg shadow-lg shadow-blue-200">{authMode === 'login' ? t.loginBtn : t.registerBtn}</Button>
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                      <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-sm text-blue-600 font-bold hover:underline w-full">{authMode === 'login' ? "No account? Create one" : "Have an account? Login"}</button>
                      <button onClick={handleDemoAuth} className="text-xs text-slate-400 hover:text-slate-600 w-full flex items-center justify-center gap-1"><HelpCircle size={12}/> {t.demoBtn}</button>
                  </div>
              </div>
          </div>
      );
  }

  // 4. TEAM / ADMIN DASHBOARD
  if (view === 'team') {
      return (
          <div className={`min-h-screen bg-slate-50 font-sans text-slate-900 ${isMobile ? 'flex-col' : 'flex'}`}>
              {renderAdminSidebar()}
              <div className="flex-1 overflow-y-auto">
                  {renderAdminContent()}
              </div>
          </div>
      );
  }

  // 5. MAIN APP VIEWS
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
           {role === 'admin' && (
               <div className="flex items-center justify-between bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm border border-white/50 text-xs font-medium text-slate-600"><span>{t.assignTo}</span><div className="flex items-center gap-2"><img src={assignee.avatar} className="w-5 h-5 rounded-full"/><span>{assignee.name}</span></div>
                    <div className="flex gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-200">
                        {TEAM_MEMBERS.map(m => (
                            <button key={m.id} onClick={() => { updateApp(a.id, { assignedTo: m.id }); setSelectedAppointment({...a, assignedTo: m.id}); }} className={`flex-shrink-0 w-8 h-8 rounded-full border-2 ${a.assignedTo === m.id ? 'border-blue-500' : 'border-transparent opacity-50'}`}>
                                <img src={m.avatar} className="w-full h-full rounded-full" title={m.name} />
                            </button>
                        ))}
                    </div>
               </div>
           )}
           <Card className="p-3 grid grid-cols-2 gap-3">
              {a.status === 'incoming' && <Button variant="orange" onClick={() => handleUpdateStatus(a.id, 'pending')}>{t.moveToPending}</Button>}
              {a.status === 'pending' && <Button variant="secondary" onClick={() => handleUpdateStatus(a.id, 'incoming')} icon={Undo}>{t.moveToIncoming}</Button>}
              {a.status === 'pending' && <Button variant="purple" onClick={() => handleUpdateStatus(a.id, 'review')}>{t.moveToReview}</Button>}

              {a.status === 'review' && <Button variant="secondary" onClick={() => handleUpdateStatus(a.id, 'pending')} icon={Undo}>Back to Pending</Button>}
              {a.status === 'review' && <Button variant="success" onClick={() => handleUpdateStatus(a.id, 'done')}>{t.moveToDone}</Button>}
              
              {a.status === 'done' && <Button variant="secondary" onClick={() => handleUpdateStatus(a.id, 'review')} icon={Undo}>{t.restore}</Button>}
              {a.status === 'done' && <Button variant="gray" onClick={() => handleUpdateStatus(a.id, 'archived')} icon={FolderArchive}>{t.moveToArchived}</Button>}
              {a.status === 'archived' && <Button variant="secondary" onClick={() => handleUpdateStatus(a.id, 'done')} icon={Undo}>{t.restoreFromArchive}</Button>}
              <Button variant="secondary" onClick={() => openGoogleCalendar(a)} icon={CalendarPlus}>{t.addToCalendar}</Button>
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
                      <div className="flex-1 h-full p-2"><KanbanColumn title={t.colReview} status="review" appointments={review} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} isMobile={false} /></div>
                      <div className="flex-1 h-full p-2"><KanbanColumn title={t.colDone} status="done" appointments={done} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} isMobile={false} /></div>
                  </div>
              )}
              {/* MOBILE VIEW: Stacked with Padding */}
              {isMobile && (
                  <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full custom-scrollbar">
                      <KanbanColumn title={t.colIncoming} status="incoming" appointments={incoming} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} isMobile={true} />
                      <KanbanColumn title={t.colPending} status="pending" appointments={pending} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} isMobile={true} />
                      <KanbanColumn title={t.colReview} status="review" appointments={review} onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} lang={lang} onStatusChange={handleUpdateStatus} isMobile={true} />
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