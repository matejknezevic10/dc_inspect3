import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, CheckSquare, Plus, Navigation, Fuel, Utensils, 
  Clock, Search, Trash2, Save, ArrowLeft, Briefcase, ExternalLink, 
  TrendingDown, Coffee, Globe, FileText, CheckCircle, Loader, Printer, 
  Download, Camera, Image as ImageIcon, X, MoreVertical, GripHorizontal, 
  Search as SearchIcon, AlertTriangle, LayoutDashboard, Archive, Undo, 
  Quote, FolderArchive, Wand2, LogIn, Lock, Check, CreditCard, Users, 
  UserCheck, Map as MapIcon, CalendarPlus, LogOut, UserPlus, HelpCircle, 
  Shield, Settings, FileBox, Copy, Upload, CloudLightning, Database, Info,
  ChevronLeft, ChevronRight, FilePlus, UserX, KeyRound, Edit, User,
  Link as LinkIcon, Menu, XCircle, Phone, Folder, File, ChevronRight as ChevronRightIcon,
  Bold, Italic, List, AlignLeft, Image as PhotoIcon, ChevronDown
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  signInAnonymously,
  signInWithCustomToken,
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  setDoc, 
  getDoc,
  writeBatch,
  getDocs,
  query,
  where
} from "firebase/firestore";

// --- 1. CONFIGURATION & CONSTANTS ---
const firebaseConfig = {
  apiKey: "AIzaSyBc2ajUaIkGvcdQQsDDlzDPHhiW2yg9BCc",
  authDomain: "dc-inspect.firebaseapp.com",
  projectId: "dc-inspect",
  storageBucket: "dc-inspect.firebasestorage.app",
  messagingSenderId: "639013498118",
  appId: "1:639013498118:web:15146029fbc159cbd30287",
  measurementId: "G-5TETMHQ1EW"
};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let app, auth, db;
try {
  if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.error("Firebase config missing");
  }
} catch (error) {
  console.error("Firebase Init Error:", error);
}

const INITIAL_TEAM_MEMBERS = [
  { id: 'david', name: 'David', role: 'admin', email: 'david@dcinspect.eu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
  { id: 'matej', name: 'Matej', role: 'admin', email: 'matej_knezevic@yahoo.de', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Matej' },
  { id: 'anna', name: 'Anna Müller', role: 'staff', email: 'anna@dc-inspect.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna' },
  { id: 'max', name: 'Max Mustermann', role: 'staff', email: 'max@dc-inspect.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
];

// NEW STRUCTURED TEMPLATE DATA BASED ON SCREENSHOT
const INITIAL_TEMPLATES = [
    { 
        id: 't1', 
        name: "Leak Detection HR 14.11.25", 
        category: "Leak Detection", 
        created: "2024-11-14", 
        author: "Admin",
        structure: [
            {
                id: 'cat1',
                name: 'INFORMACIJE O KLIJENTU I INSPEKCIJI',
                items: [
                    { id: 'item1', title: 'Informacije o klijentu i inspekciji', content: '' }
                ]
            },
            {
                id: 'cat2',
                name: 'RAZGOVOR SA KLIJENTOM',
                items: [
                    { id: 'item2', title: 'Razgovor sa Klijentom', content: '' }
                ]
            },
            {
                id: 'cat3',
                name: 'INSPEKCIJE UZROK VLAGE',
                items: [
                    { id: 'item3', title: 'Inspekcija Uzrok Vlage', content: '' }
                ]
            },
            {
                id: 'cat4',
                name: 'ZAKLJUČAK',
                items: [
                    { id: 'item4', title: 'Stanje pregledane strukture', content: '' }
                ]
            },
            {
                id: 'cat5',
                name: 'INFORMACIJE O IMOVINI I INSPEKCIJI',
                items: [
                    { id: 'item5a', title: 'Vrijeme na području inspekcije', content: '' },
                    { id: 'item5b', title: 'Podaci o nekretnini', content: '' },
                    { id: 'item5c', title: 'Pristup i ograničenja', content: '' },
                    { id: 'item5d', title: 'Status komunalnih usluga', content: '' }
                ]
            },
            {
                id: 'cat6',
                name: 'UVJETI I ODREDBE',
                items: [
                    { id: 'item6', title: 'NOTE', content: '' }
                ]
            }
        ]
    }
];

const TEXT = {
    appTitle: "DC INSPECT", subtitle: "Mobile Assistant",
    navDashboard: "Dashboard", navArchive: "Archive", navTeam: "Admin Panel",
    colIncoming: "INCOMING", colPending: "PENDING", colReview: "IN REVIEW", colDone: "DONE", colArchived: "ARCHIVED",
    loginTitle: "Welcome Back", loginBtn: "Sign In", registerBtn: "Create Account",
    emailLabel: "Email Address", passLabel: "Password",
    logout: "Sign Out",
    save: "Save", delete: "Delete", confirmDelete: "Confirm?", downloadPdf: "Export PDF", downloadDoc: "Export Word",
    navStart: "Start Navigation", addToCalendar: "Add to Calendar",
    tasksTitle: "Checklist / Preparation",
    teamStatusTitle: "Team Status", assignTo: "Assignee", teamMapTitle: "Team Map",
    catInspection: "Inspection", catConsulting: "Consulting", catEmergency: "Emergency",
    reportNotesPlaceholder: "Document your findings here...", generateBtn: "Generate Report", reportResultLabel: "Generated Report",
    defaultTask1: "Prepare tools", defaultTask2: "Review docs", defaultTask3: "Check keys", defaultTask4: "Safety gear",
    authError: "Authentication failed.", demoBtn: "Trouble? Start Demo (Anonymous)",
    menuOverview: "Overview", menuTemplates: "Templates", menuEmployees: "Team", menuCustomers: "Customers", menuCalendar: "Calendar", menuSetup: "Settings",
    genDataBtn: "Generate Demo Data",
    gasTitle: "Fuel Nearby", gasDesc: "Prices nearby", gasButton: "Search Gas Stations",
    foodTitle: "Food Stops", foodSubtitle: "On your route",
    moveToPending: "Start Job", moveToReview: "Submit", moveToDone: "Approve", restore: "Restore", moveToIncoming: "Reset",
    moveToArchived: "Archive", restoreFromArchive: "Unarchive",
    newAppointment: "New Assignment", labelCustomer: "Customer Name", labelDate: "Date", labelTime: "Time", labelCity: "City", labelAddress: "Address", labelRequest: "Request Details", labelAssign: "Assign To", labelCategory: "Category", labelPhone: "Phone Number", callCustomer: "Call Customer",
    searchPlaceholder: "Search everything...", emptyArchive: "No archived items found.", taskPlaceholder: "Add a new task...",
    reportTitle: "Documentation", demoSuccess: "Demo data generated!",
    teamInit: "Team database initialized",
    addEmployee: "Add Member", newEmployee: "New Team Member", nameLabel: "Full Name", roleLabel: "Permission Level", cancel: "Cancel",
    autoSyncLabel: "Sync to Google Calendar",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    addTemplate: "Use Template", selectTemplate: "Select Template", createTemplate: "Create Template", import: "Import", templateName: "Template Title", templateContent: "Content Pattern",
    guestMessage: "Your account is pending approval. Please contact an administrator.",
    guestTitle: "Access Restricted",
    forgotPassword: "Forgot Password?", resetEmailSent: "Reset link sent!", resetError: "Error sending reset email.",
    editEmployee: "Edit Member", uploadPhoto: "Change Photo", avatarUrl: "Avatar URL",
    browseTemplates: "Browse Online", sourceUrl: "Source URL (Optional)"
};

// --- 2. UTILITY FUNCTIONS ---
const getRandomQuote = () => {
  const quotes = [
    "Win the day.", "We are not here to take part, we are here to take over.", "Success is not final.", "Quality means doing it right when no one is looking.", "Focus on the solution."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};
const safeOpen = (url) => { if(!url) return; const w = window.open(url, '_blank'); if(!w || w.closed) { window.location.href = url; } };
const compressImage = (file) => new Promise((resolve) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = (e) => { const img = new Image(); img.src = e.target.result; img.onload = () => { const cvs = document.createElement('canvas'); const max = 1000; let w = img.width, h = img.height; if(w>h){if(w>max){h*=max/w;w=max;}}else{if(h>max){w*=max/h;h=max;}} cvs.width=w; cvs.height=h; const ctx = cvs.getContext('2d'); ctx.drawImage(img,0,0,w,h); resolve(cvs.toDataURL('image/jpeg', 0.6)); } } });
const downloadAsWord = (c,f,i=[]) => { let h=`<html><body><div style="font-family:Arial;white-space:pre-wrap;">${c}</div>${i.map(u=>`<p><img src="${u}" width="400"/></p>`).join('')}</body></html>`; const b=new Blob(['\ufeff',h],{type:'application/msword'}); const u=URL.createObjectURL(b); const l=document.createElement('a'); l.href=u; l.download=`${f}.doc`; document.body.appendChild(l); l.click(); document.body.removeChild(l); };
const printAsPdf = (c,i=[]) => { const w=window.open('','_blank'); if(w){w.document.write(`<html><head><style>body{font-family:Arial;padding:20px;white-space:pre-wrap}img{max-width:100%;max-height:300px;margin:10px}</style></head><body><div>${c}</div><div>${i.map(u=>`<img src="${u}"/>`).join('')}</div></body></html>`); w.document.close(); setTimeout(()=>w.print(),500);} };
const generateReportText = (n,c,d,cat) => { const ds=new Date(d).toLocaleDateString(); return `REPORT\nClient: ${c}\nDate: ${ds}\nCategory: ${cat}\n\nFINDINGS:\n${n}`; };
const generateRouteRestaurants = (city) => { 
    const locationName = city || "Nearby";
    return [ 
        { name: "Highway Rest Stop A1", type: "Rest Stop", dist: "On Route" }, 
        { name: `Grill House ${locationName}`, type: "Local Food", dist: "2 min detour" }, 
        { name: "Coffee & Drive", type: "Snack", dist: "On Route" } 
    ]; 
};
const generateTimeSlots = () => { const slots = []; for (let i = 6; i <= 22; i++) { for (let j = 0; j < 60; j += 15) { const hour = i.toString().padStart(2, '0'); const minute = j.toString().padStart(2, '0'); slots.push({ value: `${hour}:${minute}`, label: `${hour}:${minute}` }); } } return slots; };
const timeOptions = generateTimeSlots();
const openGoogleCalendar = (app) => { const startDate = new Date(`${app.date}T${app.time}`); const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, ''); const details = encodeURIComponent(`Inspection: ${app.request}\nCategory: ${app.category}`); const location = encodeURIComponent(`${app.address}, ${app.city}`); const title = encodeURIComponent(`DC Inspect: ${app.customerName}`); safeOpen(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${details}&location=${location}`); };

// --- 3. UI COMPONENTS ---
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

const Card = ({children, className='', onClick}) => (<div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>{children}</div>);

const Button = ({children, onClick, variant='primary', className='', icon:Icon, fullWidth, disabled, ...p}) => {
  const vs = { primary: "bg-blue-600 text-white hover:bg-blue-700", secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50", success: "bg-green-600 text-white hover:bg-green-700", danger: "bg-red-50 text-red-600 hover:bg-red-100", orange: "bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100", purple: "bg-indigo-500 text-white hover:bg-indigo-600", gray: "bg-slate-200 text-slate-700 hover:bg-slate-300" };
  return <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center px-4 py-3 rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${vs[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} {...p}>{Icon && <Icon size={18} className="mr-2"/>}{children}</button>;
};

const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  const bg = type === 'error' ? 'bg-red-500' : 'bg-green-600';
  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] ${bg} text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce-in`}>
      {type === 'error' ? <AlertTriangle size={18}/> : <CheckCircle size={18}/>}
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1"><X size={14}/></button>
    </div>
  );
};

const Input = ({label, type="text", ...p}) => (<div className="mb-3"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label><input type={type} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" {...p}/></div>);
const Select = ({ label, options, ...props }) => ( <div className="mb-4"> <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label> <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900" {...props}> {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </select> </div> );

// --- 4. ISOLATED COMPONENT: TEMPLATE MANAGER ---
const TemplateManager = ({ mode = 'admin', templates, onCreate, onUpdate, onDelete, onSelect, onClose }) => {
    const [view, setView] = useState('list'); 
    const [filterCat, setFilterCat] = useState('All');
    const [newTpl, setNewTpl] = useState({ name: '', category: 'General', content: '', sourceUrl: '' });
    
    // Derived state
    const categories = ['All', ...new Set(templates.map(t => t.category || 'General'))];
    const filteredTemplates = filterCat === 'All' 
        ? templates 
        : templates.filter(t => (t.category || 'General') === filterCat);

    // Designer State
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [activeItemId, setActiveItemId] = useState(null);
    
    // If we're editing a template, we work on a local copy
    const [editedTpl, setEditedTpl] = useState(null);
    const [currentTpl, setCurrentTpl] = useState(null); // Used to trigger effect

    useEffect(() => {
        if (currentTpl) {
            setEditedTpl(JSON.parse(JSON.stringify(currentTpl))); // Deep copy
            if (currentTpl.structure && currentTpl.structure.length > 0) {
                setActiveCategoryId(currentTpl.structure[0].id);
                if (currentTpl.structure[0].items.length > 0) {
                    setActiveItemId(currentTpl.structure[0].items[0].id);
                }
            }
        }
    }, [currentTpl]);

    const activeCategory = editedTpl?.structure?.find(c => c.id === activeCategoryId);
    const activeItem = activeCategory?.items?.find(i => i.id === activeItemId);

    const handleOpenDesigner = (tpl) => {
        // Use provided template or create structure for new one
        const base = tpl || { 
            name: 'New Template', 
            structure: [
                { id: 'c1', name: 'New Category', items: [{ id: 'i1', title: 'New Item', content: '' }] }
            ] 
        };
        setCurrentTpl(base);
        setView('designer');
    };

    const handleSave = () => {
        if (!editedTpl) return;
        
        if (editedTpl.id) {
            onUpdate(editedTpl.id, editedTpl);
        } else {
            onCreate(editedTpl);
        }
        setView('list');
    };

    const updateItemContent = (text) => {
        if (!editedTpl || !activeCategory || !activeItem) return;
        
        const newTpl = { ...editedTpl };
        const cat = newTpl.structure.find(c => c.id === activeCategoryId);
        const item = cat.items.find(i => i.id === activeItemId);
        item.content = text;
        setEditedTpl(newTpl);
    };

    // RENDER: DESIGNER VIEW (3-Column Layout)
    if (view === 'designer' && editedTpl) {
        return (
            <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 fixed inset-4 z-[200]">
                {/* Header Toolbar */}
                <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center shadow-md flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Editable Title */}
                        <input 
                            className="bg-transparent font-bold text-lg border-b border-transparent hover:border-slate-500 focus:border-white outline-none text-white w-64"
                            value={editedTpl.name}
                            onChange={(e) => setEditedTpl({...editedTpl, name: e.target.value})}
                        />
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Draft</span>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2"><Save size={14}/> Save & Close</button>
                        <div className="w-px h-6 bg-slate-600 mx-1"></div>
                        <button onClick={() => setView('list')} className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded text-xs font-bold text-white">Close</button>
                    </div>
                </div>

                {/* Main 3-Column Content */}
                <div className="flex flex-1 overflow-hidden">
                    
                    {/* COL 1: Categories (Blue Sidebar - Changed from Red) */}
                    <div className="w-72 bg-[#0F172A] text-white flex flex-col flex-shrink-0 overflow-y-auto">
                        <div className="p-4 font-bold text-xs uppercase tracking-wider opacity-80 border-b border-slate-700">Categories</div>
                        {editedTpl.structure.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => { setActiveCategoryId(cat.id); setActiveItemId(cat.items[0]?.id); }}
                                className={`text-left px-4 py-3.5 text-sm font-bold flex justify-between items-center hover:bg-slate-800 transition-colors border-b border-slate-800 ${activeCategoryId === cat.id ? 'bg-slate-700 border-l-4 border-l-blue-400' : ''}`}
                            >
                                <span className="truncate pr-2">{cat.name}</span>
                                {activeCategoryId === cat.id ? <ChevronDown size={14}/> : <ChevronRightIcon size={14} className="opacity-50"/>}
                            </button>
                        ))}
                    </div>

                    {/* COL 2: Sub-items (Light Sidebar) */}
                    <div className="w-72 bg-slate-100 border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
                         <div className="p-3 bg-slate-200 border-b border-slate-300 font-bold text-slate-700 text-xs flex justify-between items-center sticky top-0">
                            <span className="truncate max-w-[180px]">{activeCategory?.name || 'Select Category'}</span>
                         </div>
                         {activeCategory?.items.map(item => (
                             <button 
                                key={item.id}
                                onClick={() => setActiveItemId(item.id)}
                                className={`text-left px-4 py-3 text-xs border-b border-slate-200 hover:bg-white transition-colors flex items-start gap-2 ${activeItemId === item.id ? 'bg-white border-l-4 border-l-blue-600 font-bold text-blue-700 shadow-sm' : 'text-slate-600'}`}
                             >
                                 <FileText size={14} className="mt-0.5 flex-shrink-0 opacity-50"/>
                                 <span className="leading-snug">{item.title}</span>
                             </button>
                         ))}
                         {!activeCategory && <div className="p-4 text-slate-400 italic text-xs">Select a category to view items.</div>}
                    </div>

                    {/* COL 3: Editor (Main Area) */}
                    <div className="flex-1 bg-white flex flex-col overflow-hidden">
                        {activeItem ? (
                            <>
                                {/* Editor Header */}
                                <div className="p-6 border-b border-slate-100">
                                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Item Title</label>
                                     <input 
                                        className="w-full p-2 border border-slate-200 rounded text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                                        value={activeItem.title} 
                                        onChange={(e) => {
                                            const newTpl = { ...editedTpl };
                                            const cat = newTpl.structure.find(c => c.id === activeCategoryId);
                                            const itm = cat.items.find(i => i.id === activeItemId);
                                            itm.title = e.target.value;
                                            setEditedTpl(newTpl);
                                        }}
                                     />
                                </div>
                                
                                {/* Editor Toolbar */}
                                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex gap-2">
                                     <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><Bold size={14}/></button>
                                     <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><Italic size={14}/></button>
                                     <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                     <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><List size={14}/></button>
                                </div>

                                {/* Editor Text Area */}
                                <div className="flex-1 p-6 overflow-y-auto">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description / Findings</label>
                                    <textarea 
                                        className="w-full h-96 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none text-slate-600 leading-relaxed font-mono text-sm" 
                                        placeholder="Type detailed description here..."
                                        value={activeItem.content || ''}
                                        onChange={(e) => updateItemContent(e.target.value)}
                                    />
                                    
                                    {/* Footer / Meta */}
                                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t pt-4">
                                        <span>Last modified: just now</span>
                                        <div className="flex gap-2">
                                            <span className="flex items-center gap-1"><CheckSquare size={12}/> Included in Report</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300">
                                <FileText size={48} className="mb-4 opacity-20"/>
                                <p>Select an item to edit content</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: LIST MODE (Admin or Picker)
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 fixed inset-4 z-[200]">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">{mode === 'picker' ? 'Select a Template' : 'Manage Templates'}</h3>
                <div className="flex gap-2">
                    <Button size="small" variant="secondary" icon={Globe} onClick={() => safeOpen('https://mytemplatewizard.com/templates.php')}>Browse Online</Button>
                    {mode === 'admin' && <button onClick={() => handleOpenDesigner()} className="bg-blue-100 text-blue-700 p-1.5 rounded-lg hover:bg-blue-200"><Plus size={18}/></button>}
                    {onClose && <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>}
                </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/50">
                {templates.map(tpl => (
                    <div key={tpl.id} onClick={() => { if(mode==='picker') onSelect(tpl); else handleOpenDesigner(tpl); }} className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all group cursor-pointer hover:border-blue-400 hover:shadow-md`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-1 block">{tpl.category || 'General'}</span>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-800">{tpl.name}</h4>
                                    {/* Link Icon for Source */}
                                    {tpl.sourceUrl && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); safeOpen(tpl.sourceUrl); }} 
                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1 rounded-full"
                                            title="Open Source"
                                        >
                                            <ExternalLink size={12}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                            {mode === 'admin' && (
                                <button onClick={(e) => { e.stopPropagation(); onDelete(tpl.id); }} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16}/></button>
                            )}
                        </div>
                        <div className="text-xs text-slate-400 mt-2 flex gap-4">
                            <span className="flex items-center gap-1"><Folder size={12}/> {tpl.structure?.length || 0} Categories</span>
                            <span className="flex items-center gap-1"><File size={12}/> {tpl.structure?.reduce((acc, cat) => acc + cat.items.length, 0) || 0} Items</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const KanbanColumn = ({ title, status, appointments, onClickApp, onStatusChange, isMobile, teamMembers, role, currentMemberId }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); const id = e.dataTransfer.getData("appId"); if(id) onStatusChange(id, status); };
  const containerClasses = isMobile ? `flex-1 flex flex-col rounded-2xl border border-slate-200/60 transition-all duration-200 overflow-hidden min-h-[400px]` : `flex-1 flex flex-col h-full transition-all duration-200 overflow-hidden`;
  const bgClass = isDragOver ? 'bg-blue-50' : (isMobile ? 'bg-slate-50/50' : 'bg-slate-50');

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
            const assignee = teamMembers.find(m => m.id === app.assignedTo) || teamMembers[0] || { name: '?', avatar: '' };
            const isAssignedToMe = currentMemberId && app.assignedTo === currentMemberId;
            const canEdit = role === 'admin' || (role === 'staff' && isAssignedToMe);
            
            return (
            <div 
                key={app.id} 
                draggable={canEdit} 
                onDragStart={(e)=>{ if(canEdit) { e.dataTransfer.setData("appId",app.id);e.dataTransfer.effectAllowed="move"; }}} 
                onClick={()=>onClickApp(app)} 
                className={`bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all active:scale-[0.98] group relative ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default opacity-80'}`}
            >
              <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 text-sm">{app.customerName}</h4>
                  <img src={assignee.avatar} className="w-6 h-6 rounded-full border border-slate-200" alt={assignee.name} title={assignee.name} />
              </div>
              <span className="text-[10px] font-medium bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded mb-2 inline-block">{new Date(app.date).toLocaleDateString('en-US')}</span>
              <div className="flex items-center text-xs text-slate-500 gap-1 mb-2"><MapPin size={10}/> {app.city} <span className="mx-1">•</span> <span>{app.category}</span></div>
              <div className="bg-slate-50 px-2 py-1.5 rounded text-[11px] text-slate-600 truncate border border-slate-100">"{app.request}"</div>
            </div>
        )})}
      </div>
    </div>
  );
};

// --- 5. MAIN COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [currentUserEmail, setCurrentUserEmail] = useState(''); 
  const [authMode, setAuthMode] = useState('login'); 
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  
  const [appointments, setAppointments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]); 
  const [templates, setTemplates] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [view, setView] = useState('login'); 
  const [adminView, setAdminView] = useState('map'); 
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filter, setFilter] = useState('');
  const t = TEXT;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [foodData, setFoodData] = useState([]);
  const [formData, setFormData] = useState({ customerName: '', city: '', address: '', date: '', time: '08:00', request: '', category: 'inspection', status: 'incoming', reportNotes: '', finalReport: '', todos: [], reportImages: [], assignedTo: 'me', autoSync: false, phone: '' });
  const [showSplash, setShowSplash] = useState(true);
  const [dailyQuote, setDailyQuote] = useState("");
  const [notification, setNotification] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState({ name: '', role: '', email: '' });
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null); 
  const [editingEmployee, setEditingEmployee] = useState(null); 
  
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [templateManagerMode, setTemplateManagerMode] = useState('admin'); 
  
  const fileInputRef = useRef(null);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  useEffect(() => { setDailyQuote(getRandomQuote()); const handleResize = () => setIsMobile(window.innerWidth <768); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize); }, []);
  useEffect(() => { const timer = setTimeout(() => { if(loading) setLoading(false); }, 8000); return () => clearTimeout(timer); }, [loading]);
  useEffect(() => { window.scrollTo(0, 0); }, [view, selectedAppointment]);

  const showNotification = (msg, type='success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = async () => { 
      setRole(null);
      setCurrentUserEmail('');
      setView('login');
      if (user) {
           try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'account', 'profile'), {}); } catch(e){}
      }
  };

  const handlePasswordReset = async () => {
      showNotification("Reset link sent (Simulated)");
  };

  const performFallbackAuth = async (email, mode) => {
      try {
          let currentUser = auth.currentUser;
          if (!currentUser) { const userCredential = await signInAnonymously(auth); currentUser = userCredential.user; }
          const uid = currentUser.uid;
          
          let assignedRole = 'guest';
          const teamRef = collection(db, 'artifacts', appId, 'public', 'data', 'team_members');
          const allMembersSnap = await getDocs(teamRef);
          
          let foundMember = null;
          allMembersSnap.forEach(doc => { const data = doc.data(); if (data.email && data.email.toLowerCase() === email.toLowerCase()) { foundMember = data; } });
          
          const superAdmins = ['matej_knezevic@yahoo.de', 'david@dcinspect.eu', 'demo@guest.com'];
          if (superAdmins.includes(email.toLowerCase())) { assignedRole = 'admin'; } else {
              if (allMembersSnap.empty) { assignedRole = 'admin'; await setDoc(doc(teamRef, 'me'), { id: 'me', name: 'Admin', role: 'admin', email: email, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin` }); } 
              else if (foundMember) { assignedRole = foundMember.role || 'staff'; }
          }

          await setDoc(doc(db, 'artifacts', appId, 'users', uid, 'account', 'profile'), { email: email, role: assignedRole, joined: serverTimestamp(), authType: 'fallback_anonymous' });
          setRole(assignedRole); setCurrentUserEmail(email);
          if(assignedRole === 'guest') setView('guest'); else setView('dashboard');
          showNotification(`Logged in as ${assignedRole}`);
          setLoading(false);
      } catch (err) { console.error("Fallback failed", err); setAuthError("Login failed: " + String(err.message)); setLoading(false); }
  };

  const handleAuth = async () => {
    setLoading(true); setAuthError('');
    try {
        if (authMode === 'login') { await signInWithEmailAndPassword(auth, authData.email, authData.password); } 
        else { await createUserWithEmailAndPassword(auth, authData.email, authData.password); }
    } catch (e) {
        if (e.code === 'auth/operation-not-allowed') { await performFallbackAuth(authData.email, authMode); return; }
        setAuthError(String(e.message)); setLoading(false);
    }
  };

  const handleDemoAuth = async () => { setAuthData({ email: 'demo@guest.com', password: 'demo' }); setTimeout(() => performFallbackAuth('demo@guest.com', 'login'), 100); };

  const saveApp = async (data) => {
    if(!user) return;
    const { autoSync, ...dataToSave } = data;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'appointments'), { ...dataToSave, status: 'incoming', createdAt: serverTimestamp(), reportImages:[], todos: [ { text: "Prepare tools", done: false }, { text: "Review docs", done: false }, { text: "Check keys", done: false }, { text: "Safety gear", done: false } ] });
    setView('dashboard'); showNotification("Saved successfully");
  };

  const updateApp = async (id, data) => { if(!user) return; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appointments', id), data); };
  const deleteApp = async (id) => { if(!user) return; if (deleteConfirmId === id) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appointments', id)); setView('dashboard'); setDeleteConfirmId(null); showNotification("Deleted"); } else { setDeleteConfirmId(id); setTimeout(() => setDeleteConfirmId(null), 3000); } };

  const addEmployee = async () => {
      if(!newEmployeeData.name || !newEmployeeData.email) return;
      const safeId = newEmployeeData.email.replace(/[^a-z0-9]/gi, '_');
      try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_members', safeId), {
            id: safeId,
            name: newEmployeeData.name,
            role: newEmployeeData.role || 'staff',
            email: newEmployeeData.email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newEmployeeData.name)}`
          });
          setIsAddingEmployee(false);
          setNewEmployeeData({ name: '', role: '', email: '' });
          showNotification("Employee added!");
      } catch (err) { console.error(err); showNotification("Error adding employee", "error"); }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee || !editingEmployee.name || !editingEmployee.email) return;
    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_members', editingEmployee.id), {
            name: editingEmployee.name,
            role: editingEmployee.role,
            email: editingEmployee.email,
            avatar: editingEmployee.avatar
        });
        setEditingEmployee(null);
        showNotification("Employee updated");
    } catch (err) { console.error(err); showNotification("Error updating", "error"); }
  };

  const handleDeleteEmployee = async (empId) => {
      if (deleteEmployeeId === empId) {
          try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_members', empId)); showNotification("Employee removed"); setDeleteEmployeeId(null); } catch(err) { console.error(err); showNotification("Error deleting", "error"); }
      } else { setDeleteEmployeeId(empId); setTimeout(() => setDeleteEmployeeId(null), 3000); }
  };

  // Template Handlers - NEW CRUD logic with category support
  const handleCreateTemplate = async (newTpl) => {
      try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'templates'), { 
              ...newTpl, 
              created: new Date().toISOString().split('T')[0], 
              author: role === 'admin' ? 'Admin' : 'Staff' 
          });
          showNotification("Template Created");
      } catch(err) { showNotification("Error creating template", "error"); }
  };
  
  const handleUpdateTemplate = async (id, data) => {
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'templates', id), data);
          showNotification("Template Updated");
      } catch(err) { showNotification("Error updating template", "error"); }
  };

  const handleDeleteTemplate = async (id) => {
      try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'templates', id)); showNotification("Template Deleted"); } catch(err) { showNotification("Error", "error"); }
  };

  const handleSelectTemplate = (tpl) => {
      if (selectedAppointment) {
          // SIMPLE INSERT for now - just append content. 
          // Advanced logic would be to parse the structure and add it to the report notes.
          
          let contentToAdd = tpl.name + "\n";
          if (tpl.structure) {
               tpl.structure.forEach(cat => {
                   contentToAdd += `\n[${cat.name}]\n`;
                   cat.items.forEach(item => {
                       contentToAdd += `- ${item.title}: ${item.content || 'OK'}\n`;
                   });
               });
          }

          const newNotes = (selectedAppointment.reportNotes ? selectedAppointment.reportNotes + '\n\n' : '') + contentToAdd;
          updateApp(selectedAppointment.id, { reportNotes: newNotes });
          setSelectedAppointment({ ...selectedAppointment, reportNotes: newNotes });
          setIsTemplateManagerOpen(false);
          showNotification("Template content added to report");
      }
  };

  const handleImportTemplate = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const fileName = file.name.toLowerCase();
      const reader = new FileReader();
      reader.onload = async (evt) => {
          try {
              const text = evt.target.result;
              let contentToSave = null;
              if (fileName.endsWith('.json')) {
                  const json = JSON.parse(text);
                  if (json.name) contentToSave = json;
              } 
              
              if (contentToSave) {
                  await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'templates'), {
                      name: contentToSave.name,
                      category: contentToSave.category || 'Imported',
                      structure: contentToSave.structure || [],
                      created: new Date().toISOString().split('T')[0],
                      author: 'Imported'
                  });
                  showNotification("Template Imported");
              } else {
                  showNotification("Invalid file format", "error");
              }
          } catch (err) { console.error(err); showNotification("Import Error", "error"); }
      };
      reader.readAsText(file);
      e.target.value = null; 
  };

  const handleUpdateStatus = (id, s) => { updateApp(id, {status: s}); if(selectedAppointment && selectedAppointment.id === id) setSelectedAppointment({...selectedAppointment, status: s}); };
  const triggerStationNav = (name, city) => { safeOpen(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`); };
  
  const generateDemoData = async () => {
    if (!user) return;
    setLoading(true);
    const demoCustomers = [
      { name: "Müller GmbH", city: "Zagreb", address: "Ilica 10", cat: "inspection", req: "Jahresinspektion Heizung" },
      { name: "Villa Kunterbunt", city: "Split", address: "Riva 5", cat: "consulting", req: "Beratung Anbau" },
      { name: "Bäckerei Schmidt", city: "Rijeka", address: "Korzo 12", cat: "emergency", req: "Rohrbruch im Keller" },
      { name: "Hotel Adriatic", city: "Zadar", address: "Obala 2", cat: "inspection", req: "Feuerschutz Check" },
      { name: "Autohaus Fischer", city: "Osijek", address: "Vukovarska 50", cat: "inspection", req: "Werkstatt Abnahme" }
    ];
    try {
        const batchPromises = demoCustomers.map(async (c, i) => {
            const date = new Date();
            date.setDate(date.getDate() + (i - 2)); 
            const dateStr = date.toISOString().split('T')[0];
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'appointments'), {
                customerName: c.name, city: c.city, address: c.address, date: dateStr, time: `0${8 + (i%8)}:00`,
                request: c.req, category: c.cat, status: 'incoming', assignedTo: 'me', createdAt: serverTimestamp(),
                todos: [ { text: t.defaultTask1, done: false }, { text: t.defaultTask2, done: false }, { text: t.defaultTask3, done: false }, { text: t.defaultTask4, done: false } ],
                reportImages: []
            });
        });
        await Promise.all(batchPromises);
        showNotification(t.demoSuccess);
    } catch (e) { console.error("Error generating demo data:", e); }
    setLoading(false);
  };
  
  const getCategoryLabel = (k) => { const m = { 'inspection': t.catInspection, 'consulting': t.catConsulting, 'emergency': t.catEmergency }; return m[k] || k; };

  // --- EFFECTS ---
  useEffect(() => { setDailyQuote(getRandomQuote()); const handleResize = () => setIsMobile(window.innerWidth <768); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize); }, []);
  useEffect(() => { const timer = setTimeout(() => { if(loading) setLoading(false); }, 8000); return () => clearTimeout(timer); }, [loading]);
  useEffect(() => { window.scrollTo(0, 0); }, [view, selectedAppointment]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!app) throw new Error("Firebase not initialized");
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); } else { await signInAnonymously(auth); }
      } catch (err) { console.warn("Auth flow check:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) { setUser(u); try { const snap = await getDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'account', 'profile')); if (snap.exists()) { const d = snap.data(); if (d.email) { setCurrentUserEmail(d.email); setRole(d.role); setView('dashboard'); } else { setView('login'); } } else { setView('login'); } } catch (e) { setView('login'); } } else { setUser(null); setRole(null); setCurrentUserEmail(''); setView('login'); } setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!db || !user) return;
      onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'team_members'), async (snap) => {
          if (snap.empty) { const batch = writeBatch(db); INITIAL_TEAM_MEMBERS.forEach(m => { batch.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'team_members'), m.id), m); }); await batch.commit(); }
          else { setTeamMembers(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }
      });
      // Initial Template Load - OVERWRITE old templates if they don't have the new structure
      onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'templates'), async (snap) => {
          if (snap.empty) { 
              const batch = writeBatch(db); 
              INITIAL_TEMPLATES.forEach(t => { batch.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'templates'), t.id), t); }); 
              await batch.commit(); 
          } else { 
              // Check if we need to seed the new HR template because the user asked for it specifically
              const hasHRTemplate = snap.docs.some(d => d.data().name === "Leak Detection HR 14.11.25");
              if(!hasHRTemplate) {
                  // If it doesn't exist, we add it. 
                  // In a real app we might not want to auto-add, but here it ensures the user sees the new structure.
                  await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'templates'), INITIAL_TEMPLATES[0]);
              }
              setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() }))); 
          }
      });
      onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'appointments'), (snap) => {
          const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          apps.sort((a,b) => new Date(a.date) - new Date(b.date));
          setAppointments(apps);
      });
  }, [user]);

  useEffect(() => { 
    if (selectedAppointment && view === 'detail') { 
        setFoodData(generateRouteRestaurants(selectedAppointment.city)); 
    } 
  }, [selectedAppointment, view]);

  const getCurrentMemberId = () => {
      if (!currentUserEmail) return null;
      const member = teamMembers.find(m => m.email && m.email.toLowerCase() === currentUserEmail.toLowerCase());
      return member ? member.id : null;
  };
  const currentMemberId = getCurrentMemberId();
  const filterFn = a => a.customerName.toLowerCase().includes(filter.toLowerCase()) || a.city.toLowerCase().includes(filter.toLowerCase());
  const incoming = appointments.filter(a => (a.status === 'incoming' || !a.status) && filterFn(a));
  const pending = appointments.filter(a => a.status === 'pending' && filterFn(a));
  const review = appointments.filter(a => a.status === 'review' && filterFn(a));
  const done = appointments.filter(a => a.status === 'done' && filterFn(a));
  const archived = appointments.filter(a => a.status === 'archived' && filterFn(a));

  // --- RENDER HELPERS ---
  const renderAdminSidebar = () => (
      <div className={`bg-slate-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col ${isMobile ? 'h-auto fixed bottom-0 left-0 right-0 z-50' : 'h-screen'}`}>
          {!isMobile && <div className="p-4 flex items-center gap-3 border-b border-slate-800"><button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-lg"><ArrowLeft size={20}/></button><span className="font-bold tracking-wide">ADMIN PANEL</span></div>}
          {isMobile && <div className="bg-slate-800 p-2 flex items-center gap-2 border-b border-slate-700"><button onClick={() => setView('dashboard')} className="p-1 rounded bg-slate-700 hover:bg-slate-600"><ArrowLeft size={16}/></button><span className="text-xs font-bold text-slate-300">BACK TO BOARD</span></div>}
          <nav className={`flex-1 overflow-y-auto p-2 space-y-2 ${isMobile ? 'flex flex-row overflow-x-auto space-x-2 space-y-0 p-3 bg-slate-900 shadow-xl' : 'flex-col'}`}>
              {[ { id: 'map', label: t.menuOverview, icon: MapIcon }, { id: 'templates', label: t.menuTemplates, icon: FileBox }, { id: 'employees', label: t.menuEmployees, icon: Users }, { id: 'customers', label: t.menuCustomers, icon: Briefcase }, { id: 'calendar', label: t.menuCalendar, icon: Calendar }, { id: 'setup', label: t.menuSetup, icon: Settings } ].map(item => (
                  <button key={item.id} onClick={() => setAdminView(item.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isMobile ? 'flex-col justify-center min-w-[80px] p-2' : 'w-full text-left'} ${adminView === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                      <item.icon size={isMobile ? 20 : 18} /><span className={`${isMobile ? 'text-[10px]' : 'text-sm font-medium'}`}>{item.label}</span>
                  </button>
              ))}
          </nav>
      </div>
  );

  const renderAdminContent = () => {
    if (adminView === 'templates') return (
        <div className="p-6 h-full flex flex-col">
             {/* Note: The TemplateManager handles its own header in designer mode, but we need a wrapper for list mode */}
             <TemplateManager 
                mode="admin" 
                templates={templates} 
                onCreate={handleCreateTemplate} 
                onUpdate={handleUpdateTemplate} // Passing update function
                onDelete={handleDeleteTemplate} 
                onClose={() => setAdminView('map')} // Correct close action for admin tab
             />
        </div>
    );
    if (adminView === 'employees') return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Team</h2>
                <Button size="small" icon={Plus} onClick={() => setIsAddingEmployee(true)}>Add Member</Button>
            </div>
            {isAddingEmployee && (
                <Card className="p-4 bg-blue-50 border-blue-200 mb-4">
                    <h3 className="font-bold text-slate-700 mb-3">New Member</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <Input label="Name" value={newEmployeeData.name} onChange={e => setNewEmployeeData({...newEmployeeData, name: e.target.value})} />
                        <div className="mb-3"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label><select className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg" value={newEmployeeData.role} onChange={e => setNewEmployeeData({...newEmployeeData, role: e.target.value})}><option value="staff">Staff</option><option value="admin">Admin</option></select></div>
                        <Input label="Email" value={newEmployeeData.email} onChange={e => setNewEmployeeData({...newEmployeeData, email: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setIsAddingEmployee(false)}>Cancel</Button><Button onClick={addEmployee} icon={Save}>Save</Button></div>
                </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map(member => (
                    <Card key={member.id} className="p-4 flex items-center gap-4 group relative">
                        <img src={member.avatar} className="w-12 h-12 rounded-full border border-slate-200" />
                        <div><h4 className="font-bold">{member.name}</h4><p className="text-xs text-slate-500">{member.role} • {member.email}</p></div>
                        <div className="absolute top-2 right-2 flex gap-1">
                            <button onClick={() => setEditingEmployee(member)} className="text-slate-300 hover:text-blue-500"><Edit size={16}/></button>
                            <button onClick={() => handleDeleteEmployee(member.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
    if (adminView === 'customers') return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
            <Card className="overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 font-bold border-b"><tr><th className="p-4">Customer</th><th className="p-4">Status</th><th className="p-4">Report</th></tr></thead>
                    <tbody className="divide-y">{appointments.map(app => (<tr key={app.id}><td className="p-4">{app.customerName}<br/><span className="text-xs text-slate-400">{app.city}</span></td><td className="p-4">{app.status}</td><td className="p-4">{app.finalReport ? <CheckCircle size={14} className="text-green-500"/> : '-'}</td></tr>))}</tbody>
                </table>
            </Card>
        </div>
    );
    if (adminView === 'calendar') return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Calendar</h2>
            <div className="flex items-center gap-2 mb-4"><button onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))} className="p-2 bg-white rounded shadow-sm"><ChevronLeft size={16}/></button><span className="font-bold">{t.months[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}</span><button onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))} className="p-2 bg-white rounded shadow-sm"><ChevronRight size={16}/></button></div>
            <Card className="flex-1 p-4"><div className="grid grid-cols-7 gap-1 h-full">{Array.from({ length: 31 }).map((_, i) => (<div key={i} className="border p-1 text-xs">{i+1}</div>))}</div></Card>
        </div>
    );
    if (adminView === 'setup') return (
        <div className="p-6 max-w-2xl"><h2 className="text-2xl font-bold text-slate-800 mb-6">Settings</h2><Card className="p-6 space-y-4"><Input label="Company Name" placeholder="My Company" /><Button fullWidth icon={Save}>Save</Button><div className="pt-4 border-t"><Button fullWidth variant="secondary" onClick={generateDemoData} icon={Database}>Generate Demo Data</Button></div></Card></div>
    );
    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Live Operations</h2>
            <Card className="p-0 overflow-hidden relative h-96 bg-blue-50 border-blue-100 shadow-md">
                <div className="absolute inset-0 flex items-center justify-center opacity-30"><MapIcon size={64} className="text-blue-200" /></div>
                {appointments.filter(a => a.status === 'pending').map((p, i) => (
                    <div key={p.id} className="absolute bg-white p-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-2 animate-bounce" style={{ top: `${20 + (i*15)}%`, left: `${20 + (i*20)}%` }}>
                        <div className="text-xs font-bold text-slate-800">{p.customerName}</div>
                    </div>
                ))}
            </Card>
        </div>
    );
  };

  // --- VIEWS ---
  if (showSplash) return (<div onClick={() => setShowSplash(false)} className="fixed inset-0 z-50 bg-blue-600 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-500"><div className="transform transition-transform duration-700 hover:scale-105 flex flex-col items-center"><AppLogo size="w-40 h-40" /><h1 className="text-4xl font-black mt-6 mb-2 tracking-tighter">DC INSPECT</h1><div className="w-16 h-1 bg-white/30 rounded-full mb-8"></div><div className="max-w-xs text-center px-6"><Quote size={24} className="mb-2 opacity-50 mx-auto" /><p className="text-xl font-medium italic leading-relaxed opacity-90">"{dailyQuote}"</p></div></div></div>);
  if(loading) return <div className="h-screen flex items-center justify-center text-blue-600 bg-slate-50"><Loader className="animate-spin w-8 h-8"/></div>;

  if (view === 'login') return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <AppLogo size="w-24 h-24" /><h1 className="text-3xl font-black text-slate-900 mt-6 mb-2">DC INSPECT</h1><p className="text-slate-500 mb-8 font-medium">SaaS Edition</p>
          <div className="w-full max-w-sm space-y-4 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Login</h2>
              {authError && <div className="bg-red-50 text-red-600 text-xs p-3 rounded">{authError}</div>}
              <Input label="Email" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} />
              <Input label="Password" type="password" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} />
              <Button fullWidth onClick={handleAuth}>Sign In</Button>
              <div className="pt-4 border-t"><button onClick={handleDemoAuth} className="text-xs text-slate-400 hover:text-blue-600 font-bold">Try Demo Mode</button></div>
          </div>
      </div>
  );

  if (view === 'guest') return <div className="h-screen flex flex-col items-center justify-center"><h1 className="text-2xl font-bold">Access Restricted</h1><p className="mb-4">Contact admin.</p><Button onClick={handleLogout}>Logout</Button></div>;

  if (view === 'team') return <div className={`min-h-screen bg-slate-50 font-sans text-slate-900 ${isMobile ? 'flex-col' : 'flex'}`}>{renderAdminSidebar()}<div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-24' : ''}`}>{renderAdminContent()}</div></div>;

  if (view === 'add') return (
      <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
        <div className="bg-white px-4 py-4 sticky top-0 z-20 border-b border-slate-100 flex items-center gap-3 shadow-sm">
          <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-slate-600"><ArrowLeft/></button>
          <h1 className="text-lg font-bold text-slate-800">New Assignment</h1>
        </div>
        <div className="p-4 max-w-lg mx-auto">
          <Card className="p-5">
            <Input label="Customer" value={formData.customerName} onChange={e=>setFormData({...formData, customerName:e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
                <Input label="Date" type="date" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} />
                <Select label="Time" options={timeOptions} value={formData.time} onChange={e=>setFormData({...formData, time:e.target.value})} />
            </div>
            <Input label="City" value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})} />
            <Input label="Address" value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} />
            <Input label="Phone" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} placeholder="+43..." />
            <Input label="Request" value={formData.request} onChange={e=>setFormData({...formData, request:e.target.value})} />
            
            {/* GOOGLE CALENDAR SYNC CHECKBOX */}
            <div className="mb-6 flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer" onClick={() => setFormData({...formData, autoSync: !formData.autoSync})}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.autoSync ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                    {formData.autoSync && <Check size={14} />}
                </div>
                <div className="flex-1">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><CalendarPlus size={16} className="text-blue-500"/> Sync Calendar</span>
                </div>
            </div>

            <Button fullWidth onClick={() => saveApp(formData)} icon={Save}>Save Assignment</Button>
          </Card>
        </div>
      </div>
  );

  if(view === 'detail' && selectedAppointment) {
    const a = selectedAppointment;
    const isAssignedToMe = currentMemberId && a.assignedTo === currentMemberId;
    const canEdit = role === 'admin' || (role === 'staff' && isAssignedToMe);
    
    return (
      <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
        <div className={`text-white px-4 pt-4 pb-16 shadow-md ${a.status==='done'?'bg-green-600':a.status==='pending'?'bg-orange-500':'bg-blue-600'}`}>
           <div className="flex justify-between items-start mb-4 max-w-4xl mx-auto w-full">
             <button onClick={() => setView(a.status === 'archived' ? 'archive' : 'dashboard')} className="p-2 bg-white/20 rounded-lg hover:bg-white/30"><ArrowLeft size={20}/></button>
             <span className="text-xs font-bold uppercase bg-black/20 px-3 py-1 rounded-full">{a.status}</span>
           </div>
           <div className="max-w-4xl mx-auto"><h1 className="text-2xl font-bold mb-1">{a.customerName}</h1><div className="flex items-center gap-2 text-sm opacity-90"><MapPin size={14}/> {a.address}, {a.city}</div></div>
        </div>

        <div className="px-4 -mt-10 relative z-10 w-full max-w-4xl mx-auto space-y-4">
           {/* Actions Card */}
           <Card className="p-3 grid grid-cols-2 gap-3">
              {canEdit && a.status === 'incoming' && <Button variant="orange" onClick={() => handleUpdateStatus(a.id, 'pending')}>Start Working</Button>}
              {canEdit && a.status === 'pending' && <Button variant="purple" onClick={() => handleUpdateStatus(a.id, 'review')}>Submit Review</Button>}
              {role === 'admin' && a.status === 'review' && <Button variant="success" onClick={() => handleUpdateStatus(a.id, 'done')}>Approve</Button>}
              
              {role === 'admin' && a.status === 'done' && <Button variant="secondary" onClick={() => handleUpdateStatus(a.id, 'review')} icon={Undo}>{t.restore}</Button>}
              {role === 'admin' && a.status === 'done' && <Button variant="gray" onClick={() => handleUpdateStatus(a.id, 'archived')} icon={FolderArchive}>{t.moveToArchived}</Button>}
              {role === 'admin' && a.status === 'archived' && <Button variant="secondary" onClick={() => handleUpdateStatus(a.id, 'done')} icon={Undo}>{t.restoreFromArchive}</Button>}
              
              <Button variant="secondary" onClick={() => openGoogleCalendar(a)} icon={CalendarPlus}>Calendar</Button>
           </Card>
           
           <Card className="p-5 shadow-lg">
             <div className="flex gap-3 mb-4 border-b border-slate-100 pb-4"><div className="bg-blue-50 p-2.5 rounded-lg text-blue-600"><Calendar size={20} /></div><div><div className="text-xs text-slate-400 uppercase font-semibold">Date & Time</div><div className="font-semibold text-slate-800">{new Date(a.date).toLocaleDateString()} - {a.time}</div></div></div>
             <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">{a.request}</p>
             {a.phone && <Button onClick={() => safeOpen(`tel:${a.phone}`)} className="w-full bg-green-600 text-white hover:bg-green-700" icon={Phone} variant="success">Call Customer</Button>}
           </Card>
           
            {/* RESTORED SECTIONS */}
            <Card className="p-0 overflow-hidden">
                <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><CheckSquare size={18} className="text-blue-500"/> {t.tasksTitle}</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {(a.todos||[]).map((todo, idx) => (
                        <div key={idx} onClick={() => { const n=[...a.todos]; n[idx].done=!n[idx].done; updateApp(a.id, {todos: n}); setSelectedAppointment({...a, todos:n}); }} className={`p-4 flex items-center gap-3 cursor-pointer ${todo.done?'bg-slate-50/50':''}`}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${todo.done?'bg-green-500 border-green-500 text-white':'bg-white'}`}>{todo.done && <CheckSquare size={12}/>}</div>
                            <span className={`${todo.done?'line-through text-slate-400':''}`}>{todo.text}</span>
                        </div>
                    ))}
                    <div className="p-3">
                        <input className="w-full bg-slate-50 p-2 rounded border border-slate-200 text-sm" placeholder={t.taskPlaceholder} onKeyDown={(e)=>{ if(e.key==='Enter'){ const n=[...(a.todos||[]), {text:e.target.value, done:false}]; updateApp(a.id, {todos: n}); setSelectedAppointment({...a, todos:n}); e.target.value=''; }}}/>
                    </div>
                </div>
            </Card>
           
           <Button onClick={() => safeOpen(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${a.address}, ${a.city}`)}`)} className="w-full shadow-md bg-blue-600 text-white py-4" icon={Navigation} variant="primary">{t.navStart}</Button>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3"><Fuel size={16} className="text-orange-500"/> {t.gasTitle}</h3>
                    <Button variant="secondary" size="small" fullWidth onClick={() => safeOpen(`https://www.google.com/maps/search/gas+stations+near+${a.city}`)}>{t.gasButton}</Button>
                </Card>
                <Card className="p-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3"><Utensils size={16} className="text-amber-700"/> {t.foodTitle}</h3>
                    <div className="space-y-2">
                        {foodData.map((f,i)=>(
                            <div key={i} className="text-xs flex justify-between p-2 bg-slate-50 rounded border border-slate-100 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => triggerStationNav(f.name, a.city)}>
                                <span>{f.name}</span><span className="text-slate-400">{f.dist}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
           
           <Card className="p-4">
               <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3"><FileText size={16}/> Report & Docs</h3>
               <textarea className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm min-h-[100px] mb-2" value={a.reportNotes || ''} onChange={(e) => { const newNotes = e.target.value; updateApp(a.id, { reportNotes: newNotes }); setSelectedAppointment({...a, reportNotes: newNotes}); }} disabled={!canEdit} placeholder="Type notes..." />
               <div className="flex gap-2">
                   {canEdit && <Button variant="secondary" size="small" icon={FilePlus} onClick={() => { setTemplateManagerMode('picker'); setIsTemplateManagerOpen(true); }}>Add Template</Button>}
                   {a.finalReport && <Button size="small" icon={Printer} onClick={() => printAsPdf(a.finalReport, a.reportImages)}>PDF</Button>}
               </div>
           </Card>
           
           {isTemplateManagerOpen && (
               <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                   <div className="w-full max-w-5xl h-[85vh]">
                       <TemplateManager 
                           mode={templateManagerMode} 
                           templates={templates} 
                           onClose={() => setIsTemplateManagerOpen(false)}
                           onSelect={(tpl) => handleSelectTemplate(tpl)}
                           onCreate={handleCreateTemplate}
                           onUpdate={handleUpdateTemplate}
                           onDelete={handleDeleteTemplate}
                       />
                   </div>
               </div>
           )}
           
           <div className="pt-8 pb-4">
               {role === 'admin' && <Button fullWidth variant="danger" icon={Trash2} onClick={() => deleteApp(a.id)}>Delete Ticket</Button>}
           </div>
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col h-screen overflow-hidden text-slate-900">
      <div className="bg-white px-5 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-20 flex-shrink-0">
         <div className="flex items-center gap-3"><AppLogo size="w-14 h-14" /><div><h1 className="text-xl font-black text-blue-900">DC INSPECT</h1><p className="text-[10px] text-slate-500">Board</p></div></div>
         <div className="flex gap-2">
            <button onClick={() => setView('dashboard')} className={`p-2 rounded-lg ${view==='dashboard'?'bg-blue-50 text-blue-600':'text-slate-400'}`}><LayoutDashboard size={20}/></button>
            {role === 'admin' && <button onClick={() => setView('team')} className={`p-2 rounded-lg ${view==='team'?'bg-blue-50 text-blue-600':'text-slate-400'}`}><Users size={20}/></button>}
            <button onClick={handleLogout} className="px-2 bg-red-50 rounded text-xs text-red-500"><LogOut size={16}/></button>
            {/* FIX: DEBUG TOGGLE - ALWAYS VISIBLE TO PREVENT LOCKOUT, TOGGLES ADMIN <-> STAFF, SHOWS NOTIFICATION */}
            <button onClick={() => { 
                const newRole = role === 'admin' ? 'staff' : 'admin';
                setRole(newRole); 
                showNotification(`Role switched to ${newRole.toUpperCase()}`);
            }} className="px-2 bg-gray-100 rounded text-xs font-bold text-gray-400 border border-gray-200" title={`Toggle Role (Current: ${role})`}>
                <Shield size={12}/>
            </button>
         </div>
      </div>

      <div className="px-4 py-2 bg-white border-b border-slate-100 z-10"><div className="relative"><SearchIcon className="absolute left-3 top-3 text-slate-400" size={16}/><input placeholder="Search..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" /></div></div>

      <div className="flex-1 overflow-hidden relative w-full bg-slate-50">
        {view === 'archive' ? (
            <div className="max-w-3xl mx-auto space-y-3 p-4 overflow-y-auto h-full custom-scrollbar">{archived.map(app => <div key={app.id} onClick={() => { setSelectedAppointment(app); setView('detail'); }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300"><span className="font-bold text-slate-700">{app.customerName}</span></div>)}</div>
        ) : (
             <div className={`h-full ${isMobile ? 'flex flex-col gap-4 p-4 overflow-y-auto' : 'flex flex-row w-full divide-x divide-slate-200'}`}>
                {/* Desktop/Mobile Switch Logic */}
                {['incoming', 'pending', 'review', 'done'].map(status => (
                    (!isMobile || true) && ( 
                        <div key={status} className={`${isMobile ? 'flex-shrink-0' : 'flex-1'} h-full p-2`}>
                             <KanbanColumn 
                                title={status === 'incoming' ? 'Incoming' : status === 'pending' ? 'Pending' : status === 'review' ? 'Review' : 'Done'} 
                                status={status} 
                                appointments={status==='incoming'?incoming:status==='pending'?pending:status==='review'?review:done} 
                                onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} 
                                onStatusChange={handleUpdateStatus} 
                                isMobile={isMobile} 
                                teamMembers={teamMembers} 
                                role={role} 
                                currentMemberId={currentMemberId} 
                            />
                        </div>
                    )
                ))}
            </div>
        )}
      </div>

      {role === 'admin' && (
          <div className="fixed bottom-6 right-6 z-[9999]">
              <button onClick={() => { setFormData({ customerName: '', city: '', address: '', date: '', time: '08:00', request: '', category: 'inspection', status: 'incoming', reportNotes: '', finalReport: '', todos: [], reportImages: [], assignedTo: 'me', autoSync: false, phone: '' }); setView('add'); }} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl shadow-blue-200 flex items-center justify-center transition-transform active:scale-90"><Plus size={28} /></button>
          </div>
      )}
      
      {/* EDIT EMPLOYEE MODAL (Moved to root level) */}
      {editingEmployee && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                  <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-lg text-slate-800">{t.editEmployee}</h3>
                      <button onClick={() => setEditingEmployee(null)} className="p-1 hover:bg-slate-200 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="flex items-center gap-4 mb-4">
                          <img src={editingEmployee.avatar} className="w-20 h-20 rounded-full border-2 border-slate-100 bg-slate-50 object-cover" />
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.uploadPhoto}</label>
                              <div className="flex gap-2">
                                  <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-2">
                                      <Camera size={14}/> Upload
                                      <input type="file" className="hidden" accept="image/*" onChange={async (e) => { 
                                          if(e.target.files[0]) { 
                                              const b64 = await compressImage(e.target.files[0]); 
                                              setEditingEmployee({...editingEmployee, avatar: b64}); 
                                          }
                                      }}/>
                                  </label>
                              </div>
                          </div>
                      </div>
                      <Input label={t.nameLabel} value={editingEmployee.name} onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})} />
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.roleLabel}</label>
                          <select className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" value={editingEmployee.role} onChange={e => setEditingEmployee({...editingEmployee, role: e.target.value})}>
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                          </select>
                      </div>
                      <Input label={t.emailLabel} value={editingEmployee.email} onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})} />
                      <Input label={t.avatarUrl} value={editingEmployee.avatar} onChange={e => setEditingEmployee({...editingEmployee, avatar: e.target.value})} placeholder="https://..." />
                      <Button fullWidth onClick={handleUpdateEmployee} icon={Save}>{t.save}</Button>
                  </div>
              </div>
          </div>
      )}

      <Toast message={notification?.msg} type={notification?.type} onClose={() => setNotification(null)} />
      <style>{`.custom-scrollbar::-webkit-scrollbar{height:4px;width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}`}</style>
    </div>
  );
}