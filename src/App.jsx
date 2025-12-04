import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  MapPin, 
  CheckSquare, 
  Plus, 
  Navigation, 
  Fuel, 
  Utensils, 
  Clock, 
  Search, 
  Trash2, 
  Save, 
  ArrowLeft,
  Briefcase,
  ExternalLink,
  TrendingDown,
  Coffee,
  Globe,
  FileText,
  CheckCircle,
  Loader,
  Printer,
  Download,
  Camera,
  Image as ImageIcon,
  X,
  MoreVertical,
  GripHorizontal,
  Search as SearchIcon
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp
} from "firebase/firestore";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBc2ajUaIkGvcdQQsDDlzDPHhiW2yg9BCc",
  authDomain: "dc-inspect.firebaseapp.com",
  projectId: "dc-inspect",
  storageBucket: "dc-inspect.firebasestorage.app",
  messagingSenderId: "639013498118",
  appId: "1:639013498118:web:15146029fbc159cbd30287",
  measurementId: "G-5TETMHQ1EW"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- LOGO COMPONENT ---
const DCLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-xl shadow-sm">
    <rect width="100" height="100" rx="20" fill="#2563EB"/>
    <path d="M25 25H45C58.8071 25 70 36.1929 70 50V50C70 63.8071 58.8071 75 45 75H25V25Z" stroke="white" strokeWidth="8"/>
    <path d="M25 25V75" stroke="white" strokeWidth="8"/>
    <path d="M65 65L80 80" stroke="white" strokeWidth="8" strokeLinecap="round"/>
    <circle cx="55" cy="50" r="15" stroke="white" strokeWidth="6" strokeOpacity="0.5"/>
    <text x="50" y="62" fontSize="35" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="sans-serif">DC</text>
  </svg>
);

// --- Translations ---
const translations = {
  hr: {
    appTitle: "DC INSPECT",
    subtitle: "Tvoj mobilni asistent",
    newAppointment: "Novi Termin",
    backToList: "NATRAG NA KANBAN",
    overview: "KANBAN PLOČA",
    save: "Spremi Termin",
    delete: "Obriši Termin",
    today: "Danas",
    noAppointments: "Prazno",
    searchPlaceholder: "Pretraži klijenta ili grad...",
    
    // Status / Kanban
    colIncoming: "NOVI / INCOMING",
    colPending: "U TIJEKU / PENDING",
    colDone: "ZAVRŠENO / DONE",
    markAs: "Premjesti u",

    // Report
    reportTitle: "Service Bericht",
    reportNotesLabel: "Bilješke / Nalazi (Stichworte)",
    reportNotesPlaceholder: "- Kvar na ventilu...",
    generateBtn: "Ažuriraj Izvještaj",
    reportResultLabel: "Pregled Izvještaja",
    downloadPdf: "PDF / Ispis",
    downloadDoc: "Word (.doc)",
    photosTitle: "Fotografije & Prilozi",
    addPhoto: "Dodaj sliku",
    
    // Form Labels
    labelCustomer: "Ime Klijenta",
    labelDate: "Datum",
    labelTime: "Vrijeme",
    labelCity: "Grad / Mjesto",
    labelAddress: "Točna Adresa (za GPS)",
    labelRequest: "Zahtjev / Bilješka",
    labelCategory: "Kategorija",
    
    // Details
    daysAgo: "Prošlo",
    daysToday: "DANAS",
    daysFuture: (d) => `Za ${d} dana`,
    navStart: "Pokreni Navigaciju",
    
    // Logistics
    logisticsTitle: "Logistika & Putovanje",
    gasTitle: "Najjeftinije Gorivo",
    gasDesc: "Pronađi cijene goriva u svojoj blizini.",
    gasButton: "Traži benzinske (GPS)",
    foodTitle: "Hrana na putu",
    foodSubtitle: "Preporuka rute",
    
    // Tasks
    tasksTitle: "Zadaci",
    taskPlaceholder: "+ Novi zadatak",
    defaultTask1: "Pripremi dokumentaciju",
    defaultTask2: "Provjeri rutu",
    defaultTask3: "Uzmi alat 1",
    defaultTask4: "Uzmi alat 2",
    
    // Categories
    catInspection: "Inspekcija",
    catConsulting: "Savjetovanje",
    catEmergency: "Hitno",

    // Confirmations
    confirmDelete: "Jeste li sigurni da želite obrisati ovaj termin?",
    confirmNav: "Pregled blokira otvaranje. Želite li ipak otvoriti karte?",
    locError: "Lokacija nije dostupna. Koristim opću pretragu."
  },
  en: {
    appTitle: "DC INSPECT",
    subtitle: "Your mobile assistant",
    newAppointment: "New Appointment",
    backToList: "BACK TO KANBAN",
    overview: "KANBAN BOARD",
    save: "Save Appointment",
    delete: "Delete Appointment",
    today: "Today",
    noAppointments: "Empty",
    searchPlaceholder: "Search client or city...",
    
    // Status / Kanban
    colIncoming: "INCOMING",
    colPending: "PENDING",
    colDone: "DONE",
    markAs: "Move to",

    // Report
    reportTitle: "Service Report",
    reportNotesLabel: "Findings / Notes (Keywords)",
    reportNotesPlaceholder: "- Valve broken...",
    generateBtn: "Update Report",
    reportResultLabel: "Report Preview",
    downloadPdf: "PDF / Print",
    downloadDoc: "Word (.doc)",
    photosTitle: "Photos & Attachments",
    addPhoto: "Add Photo",

    // Form Labels
    labelCustomer: "Customer Name",
    labelDate: "Date",
    labelTime: "Time",
    labelCity: "City / Place",
    labelAddress: "Exact Address (for GPS)",
    labelRequest: "Request / Note",
    labelCategory: "Category",
    
    // Details
    daysAgo: "Past",
    daysToday: "TODAY",
    daysFuture: (d) => `In ${d} days`,
    navStart: "Start Navigation",
    
    // Logistics
    logisticsTitle: "Logistics & Travel",
    gasTitle: "Cheap Fuel",
    gasDesc: "Find fuel prices near your current location.",
    gasButton: "Search Gas Stations (GPS)",
    foodTitle: "Food on route",
    foodSubtitle: "Route recommendation",
    
    // Tasks
    tasksTitle: "Tasks",
    taskPlaceholder: "+ New task",
    defaultTask1: "Prepare documentation",
    defaultTask2: "Check route",
    defaultTask3: "Take tool 1",
    defaultTask4: "Take tool 2",
    
    // Categories
    catInspection: "Inspection",
    catConsulting: "Consulting",
    catEmergency: "Emergency",

    // Confirmations
    confirmDelete: "Are you sure you want to delete this appointment?",
    confirmNav: "Preview blocks opening. Do you want to open maps anyway?",
    locError: "Location not available. Using generic search."
  }
};

// --- Fake Data Generators ---
const generateRouteRestaurants = (city, lang) => {
  const t = lang === 'hr' ? {
    restStop: "Odmorište",
    local: "Domaće",
    snack: "Užina",
    onRoute: "Na putu",
    detour: "2 min s rute"
  } : {
    restStop: "Rest Stop",
    local: "Local Food",
    snack: "Snack",
    onRoute: "On route",
    detour: "2 min detour"
  };

  return [
    { name: "Highway Rest Stop A1", type: t.restStop, rating: 4.2, dist: t.onRoute },
    { name: `Grill House ${city}`, type: t.local, rating: 4.7, dist: t.detour },
    { name: "Coffee & Drive", type: t.snack, rating: 3.9, dist: t.onRoute }
  ];
};

// --- Utilities ---
const safeOpen = (url, confirmMsg) => {
  if (!url) return;
  const newWindow = window.open(url, '_blank');
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    const confirmNav = confirm(confirmMsg || "Open Maps?");
    if (confirmNav) {
        window.location.href = url;
    }
  }
};

// Image Compression Utility
const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Max dimensions
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to JPEG 0.7 quality
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
    });
};

// --- Export Functions ---
const downloadAsWord = (content, filename, images = []) => {
    let imgHtml = '';
    if (images && images.length > 0) {
        imgHtml = '<br><br><h3>ATTACHED PHOTOS:</h3>';
        images.forEach(img => {
            imgHtml += `<p><img src="${img}" width="300" /></p>`;
        });
    }

    const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export</title></head><body>";
    const postHtml = "</body></html>";
    const html = preHtml + `<div style="font-family: Arial; font-size: 11pt; white-space: pre-wrap;">${content}</div>` + imgHtml + postHtml;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename || 'Report'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const printAsPdf = (content, images = []) => {
    const printWindow = window.open('', '_blank');
    
    let imgHtml = '';
    if (images && images.length > 0) {
        imgHtml = '<div style="margin-top: 40px; page-break-before: auto;"><h3>FOTODOKUMENTATION</h3><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">';
        images.forEach(img => {
            imgHtml += `<div style="text-align: center;"><img src="${img}" style="max-width: 100%; max-height: 300px; border: 1px solid #ccc;" /></div>`;
        });
        imgHtml += '</div></div>';
    }

    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>Service Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                        h1 { color: #2563EB; font-size: 24px; border-bottom: 2px solid #2563EB; padding-bottom: 10px; }
                        h3 { margin-top: 20px; color: #475569; border-bottom: 1px solid #e2e8f0; }
                        .content { white-space: pre-wrap; }
                    </style>
                </head>
                <body>
                    <div class="content">${content}</div>
                    ${imgHtml}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 800);
    } else {
        alert("Please allow popups.");
    }
};

const generateReportText = (notes, customerName, date, category, lang) => {
  const dateStr = new Date(date).toLocaleDateString(lang === 'hr' ? 'hr-HR' : 'en-US');
  const lines = notes.split('\n').filter(l => l.trim() !== '');
  const findingsList = lines.map(line => {
    let cleanLine = line.replace(/^-\s*/, '').trim();
    return cleanLine.charAt(0).toUpperCase() + cleanLine.slice(1);
  });

  if (lang === 'hr') {
    return `SERVICE IZVJEŠTAJ
--------------------------------------------------
Klijent:    ${customerName}
Datum:      ${dateStr}
Kategorija: ${category.toUpperCase()}
Status:     ZAVRŠENO
--------------------------------------------------

POŠTOVANI,

Ovim putem dostavljamo izvještaj o izvršenim radovima.
Pregledom je utvrđeno sljedeće stanje:

DETALJNI NALAZI I RADOVI:
${findingsList.length > 0 ? findingsList.map(f => `• ${f}`).join('\n') : "• Nisu zabilježene posebne napomene."}

ZAKLJUČAK:
Svi navedeni radovi su uspješno izvršeni u skladu sa standardima. Sustav je testiran i pušten u redovni rad.

--------------------------------------------------
Potpis: DC Inspect
Datum: ${new Date().toLocaleDateString('hr-HR')}
`;
  } else {
    return `SERVICE REPORT
--------------------------------------------------
Client:     ${customerName}
Date:       ${dateStr}
Category:   ${category.toUpperCase()}
Status:     COMPLETED
--------------------------------------------------

DEAR CUSTOMER,

We hereby submit the report on the work performed.
Status determined:

DETAILED FINDINGS & ACTIONS:
${findingsList.length > 0 ? findingsList.map(f => `• ${f}`).join('\n') : "• No specific notes."}

CONCLUSION:
All listed tasks have been successfully completed. The system is operational.

--------------------------------------------------
Signature: DC Inspect
Date: ${new Date().toLocaleDateString('en-US')}
`;
  }
};

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, fullWidth = false, size = 'normal', ...props }) => {
  const baseStyle = "flex items-center justify-center rounded-xl font-medium transition-all active:scale-95 shadow-sm cursor-pointer select-none";
  const sizes = { small: "px-3 py-2 text-xs", normal: "px-4 py-3 text-sm" };
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 shadow-none",
    outline: "bg-transparent border border-slate-300 text-slate-600 hover:bg-slate-50"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} type="button" {...props}>
      {Icon && <Icon size={size === 'small' ? 14 : 18} className="mr-2" />}
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <input className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-shadow" {...props} />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <textarea className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-shadow min-h-[100px]" {...props} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" {...props}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- Kanban Column Component with Drag & Drop ---
const KanbanColumn = ({ title, status, appointments, onClickApp, lang, onStatusChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const appId = e.dataTransfer.getData("appId");
    if (appId) {
        onStatusChange(appId, status);
    }
  };

  return (
    <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 min-w-[300px] flex flex-col h-full rounded-2xl border transition-all duration-200 overflow-hidden
        ${isDragOver ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100' : 'bg-slate-100/50 border-slate-200/60'}`}
    >
      <div className={`p-3 font-bold text-xs uppercase tracking-wider border-b border-slate-200 flex justify-between items-center
        ${status === 'incoming' ? 'text-blue-600 bg-blue-50/50' : 
          status === 'pending' ? 'text-orange-600 bg-orange-50/50' : 
          'text-green-600 bg-green-50/50'}`}>
        {title}
        <span className="bg-white px-2 py-0.5 rounded-full text-[10px] shadow-sm text-slate-600">{appointments.length}</span>
      </div>
      
      <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
        {appointments.length === 0 ? (
          <div className="text-center py-10 text-slate-300 italic text-xs">
            {isDragOver ? 'Drop here' : 'Empty'}
          </div>
        ) : (
          appointments.map(app => (
            <div 
              key={app.id} 
              draggable
              onDragStart={(e) => {
                  e.dataTransfer.setData("appId", app.id);
                  // Optional: Effect on dragging element
                  e.dataTransfer.effectAllowed = "move";
              }}
              onClick={() => onClickApp(app)}
              className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-200 transition-all active:scale-[0.98] group relative"
            >
              <div className="absolute top-3 right-3 text-slate-300 opacity-20 group-hover:opacity-100 cursor-grab">
                  <GripHorizontal size={14} />
              </div>
              <div className="flex justify-between items-start mb-1 pr-4">
                <h4 className="font-bold text-slate-800 text-sm">{app.customerName}</h4>
              </div>
              <span className="text-[10px] font-medium bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded mb-2 inline-block">
                    {new Date(app.date).toLocaleDateString(lang === 'hr' ? 'hr-HR' : 'en-US')}
              </span>
              <div className="flex items-center text-xs text-slate-500 gap-1 mb-2">
                <MapPin size={10} /> {app.city}
                <span className="mx-1">•</span>
                <span>{app.category}</span>
              </div>
              <div className="bg-slate-50 px-2 py-1.5 rounded text-[11px] text-slate-600 truncate border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                "{app.request}"
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); 
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filter, setFilter] = useState('');
  
  // Language State 
  const [lang, setLang] = useState('hr'); 
  const t = translations[lang];

  // Live Data State
  const [foodData, setFoodData] = useState([]);
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '', city: '', address: '', date: '', time: '', 
    request: '', category: 'inspection', status: 'incoming', 
    reportNotes: '', finalReport: '', todos: [], reportImages: []
  });

  // Auth Effect
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'appointments');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort: Incoming first, then date
      apps.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
      setAppointments(apps);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Load Data when appointment is selected
  useEffect(() => {
    if (selectedAppointment && view === 'detail') {
      setFoodData([]);
      setTimeout(() => {
        setFoodData(generateRouteRestaurants(selectedAppointment.city, lang));
      }, 500);
    }
  }, [selectedAppointment, view, lang]);

  // Handlers
  const handleSave = async () => {
    if (!user || !formData.customerName || !formData.date) return;
    try {
      const colRef = collection(db, 'artifacts', appId, 'users', user.uid, 'appointments');
      await addDoc(colRef, {
        ...formData,
        status: 'incoming', 
        createdAt: serverTimestamp(),
        todos: [
          { text: t.defaultTask1, done: false },
          { text: t.defaultTask2, done: false },
          { text: t.defaultTask3, done: false },
          { text: t.defaultTask4, done: false }
        ],
        reportImages: []
      });
      setFormData({ 
        customerName: '', city: '', address: '', date: '', time: '', 
        request: '', category: 'inspection', status: 'incoming', 
        reportNotes: '', finalReport: '', todos: [], reportImages: []
      });
      setView('list');
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', id));
      if (selectedAppointment?.id === id) setView('list');
    } catch (e) { console.error(e); }
  };

  const handleUpdateStatus = async (appIdToUpdate, newStatus) => {
    // If we are dragging, we might not have 'selectedAppointment', so we use appIdToUpdate
    const id = appIdToUpdate || (selectedAppointment ? selectedAppointment.id : null);
    if (!id || !user) return;

    // Optional: Optimistic UI update for smoother drag feel
    const updatedApps = appointments.map(a => 
        a.id === id ? { ...a, status: newStatus } : a
    );
    setAppointments(updatedApps);

    // Update Detail View if open
    if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
    }
    
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', id), { status: newStatus });
    } catch (e) { console.error(e); }
  };

  // Report & Files
  const handleGenerateReport = async () => {
    if (!selectedAppointment) return;
    const report = generateReportText(
        selectedAppointment.reportNotes || "", 
        selectedAppointment.customerName, 
        selectedAppointment.date,
        selectedAppointment.category,
        lang
    );
    const updated = { ...selectedAppointment, finalReport: report };
    setSelectedAppointment(updated);
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', selectedAppointment.id), { finalReport: report });
    } catch (e) { console.error(e); }
  };

  const handleSaveNotes = async (text) => {
    if (!selectedAppointment) return;
    setSelectedAppointment({...selectedAppointment, reportNotes: text}); 
    try {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', selectedAppointment.id), { reportNotes: text });
    } catch (e) { console.error(e); }
  };

  const handleFileSelect = async (e) => {
      if (e.target.files && e.target.files[0] && selectedAppointment) {
          const file = e.target.files[0];
          const compressedBase64 = await compressImage(file);
          
          const currentImages = selectedAppointment.reportImages || [];
          const newImages = [...currentImages, compressedBase64];
          
          setSelectedAppointment({ ...selectedAppointment, reportImages: newImages });
          try {
             await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', selectedAppointment.id), { reportImages: newImages });
          } catch(err) {
              console.error(err);
              alert("Image too large or storage error.");
          }
      }
  };

  const handleRemoveImage = async (index) => {
      if (!selectedAppointment) return;
      const currentImages = selectedAppointment.reportImages || [];
      const newImages = currentImages.filter((_, i) => i !== index);
      setSelectedAppointment({ ...selectedAppointment, reportImages: newImages });
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', selectedAppointment.id), { reportImages: newImages });
       } catch(err) { console.error(err); }
  }

  // ToDos & Nav logic
  const handleToggleTodo = async (appId, idx, currentStatus) => { 
      if (!selectedAppointment) return;
      const newTodos = [...selectedAppointment.todos];
      newTodos[idx].done = !currentStatus;
      setSelectedAppointment({...selectedAppointment, todos: newTodos});
      try { await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', selectedAppointment.id), { todos: newTodos }); } catch (e) { console.error(e); }
  };
  const handleAddTodo = async (text) => {
      if (!text.trim() || !selectedAppointment) return;
      const newTodos = [...(selectedAppointment.todos || []), { text, done: false }];
      setSelectedAppointment({...selectedAppointment, todos: newTodos});
      try { await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', selectedAppointment.id), { todos: newTodos }); } catch (e) { console.error(e); }
  };
  const triggerNavigation = (address, city) => { safeOpen(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${address}, ${city}`)}`, t.confirmNav); };
  const triggerGasSearchNearMe = () => {
      if (!navigator.geolocation) { alert(t.locError); safeOpen(`https://www.google.com/maps/search/gas+stations/`, t.confirmNav); return; }
      navigator.geolocation.getCurrentPosition((position) => { safeOpen(`https://www.google.com/maps/search/gas+stations/@${position.coords.latitude},${position.coords.longitude},13z`, t.confirmNav); }, 
      (error) => { safeOpen(`https://www.google.com/maps/search/gas+stations/`, t.confirmNav); });
  };
  const triggerStationNav = (name, city) => { safeOpen(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`, t.confirmNav); };
  const toggleLanguage = () => { setLang(prev => prev === 'hr' ? 'en' : 'hr'); };
  // Helpers
  const getCategoryLabel = (catKey) => {
    const map = {
      'inspection': t.catInspection,
      'consulting': t.catConsulting,
      'emergency': t.catEmergency
    };
    return map[catKey] || catKey;
  };
  const catOptions = [ { value: 'inspection', label: t.catInspection }, { value: 'consulting', label: t.catConsulting }, { value: 'emergency', label: t.catEmergency } ];

  // Views
  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-400 font-medium">Loading DC Inspect...</div>;

  // VIEW: ADD
  if (view === 'add') {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 font-sans">
        <div className="bg-white px-4 py-4 sticky top-0 z-20 border-b border-slate-100 flex items-center gap-3 shadow-sm">
          <button onClick={() => setView('list')} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft /></button>
          <h1 className="text-lg font-bold text-slate-800">{t.newAppointment}</h1>
        </div>
        <div className="p-4 max-w-lg mx-auto">
          <Card className="p-5">
            <Input label={t.labelCustomer} placeholder="e.g. Knezevic" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <Input label={t.labelDate} type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              <Input label={t.labelTime} type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
            <Input label={t.labelCity} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            <Input label={t.labelAddress} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            <Input label={t.labelRequest} value={formData.request} onChange={e => setFormData({...formData, request: e.target.value})} />
            <Select label={t.labelCategory} options={catOptions} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            <div className="mt-6"><Button onClick={handleSave} className="w-full" icon={Save}>{t.save}</Button></div>
          </Card>
        </div>
      </div>
    );
  }

  // VIEW: DETAIL
  if (view === 'detail' && selectedAppointment) {
    const { customerName, city, address, date, time, request, category, todos, status, reportNotes, finalReport, reportImages } = selectedAppointment;
    
    return (
      <div className="min-h-screen bg-slate-50 pb-20 font-sans">
        <div className={`text-white px-4 pt-4 pb-16 relative shadow-md transition-colors ${status === 'done' ? 'bg-green-600' : status === 'pending' ? 'bg-orange-500' : 'bg-blue-600'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setView('list')} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors"><ArrowLeft /></button>
              <span className="font-semibold tracking-wide opacity-90 text-sm">{t.backToList}</span>
            </div>
            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                {status === 'incoming' ? t.colIncoming : status === 'pending' ? t.colPending : t.colDone}
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-1">{customerName}</h1>
          <div className="flex items-center gap-2 opacity-90 text-sm"><MapPin size={14} /> {city}</div>
        </div>

        <div className="px-4 -mt-10 relative z-10 max-w-lg mx-auto space-y-4">
          
          {/* Status Switcher (Keep buttons in detail view for manual override) */}
          <Card className="p-2 flex gap-2">
            <button onClick={() => handleUpdateStatus(selectedAppointment.id, 'incoming')} className={`flex-1 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-colors ${status === 'incoming' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-500'}`}>{t.colIncoming}</button>
            <button onClick={() => handleUpdateStatus(selectedAppointment.id, 'pending')} className={`flex-1 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-colors ${status === 'pending' ? 'bg-orange-100 text-orange-700' : 'hover:bg-slate-50 text-slate-500'}`}>{t.colPending}</button>
            <button onClick={() => handleUpdateStatus(selectedAppointment.id, 'done')} className={`flex-1 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-colors ${status === 'done' ? 'bg-green-100 text-green-700' : 'hover:bg-slate-50 text-slate-500'}`}>{t.colDone}</button>
          </Card>

          <Card className="p-5 shadow-lg">
             <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600"><Calendar size={20} /></div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">{t.labelDate}</div>
                    <div className="font-semibold text-slate-800">{new Date(date).toLocaleDateString(lang === 'hr' ? 'hr-HR' : 'en-US')} - {time}</div>
                  </div>
                </div>
             </div>
             <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">{request}</p>
             <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">{getCategoryLabel(category)}</span>
          </Card>

          <Button onClick={() => triggerNavigation(address || '', city)} className="w-full shadow-md bg-blue-600 text-white py-4" icon={Navigation} variant="primary">{t.navStart}</Button>

          {/* TASKS & LOGISTICS */}
           <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2"><CheckSquare size={18} className="text-blue-500"/> {t.tasksTitle}</h3>
              <span className="text-xs font-medium text-slate-400">{todos ? todos.filter(t => t.done).length : 0} / {todos ? todos.length : 0}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {todos && todos.map((todo, idx) => (
                <div key={idx} onClick={() => handleToggleTodo(appId, idx, todo.done)} className={`p-4 flex items-center gap-3 cursor-pointer ${todo.done ? 'bg-slate-50/50' : 'bg-white'}`}>
                  <div className={`w-6 h-6 rounded border flex-shrink-0 flex items-center justify-center ${todo.done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 bg-white'}`}>{todo.done && <CheckSquare size={16} />}</div>
                  <span className={`${todo.done ? 'line-through text-slate-400' : 'text-slate-700'} font-medium`}>{todo.text}</span>
                </div>
              ))}
              <div className="p-3 bg-slate-50"><input placeholder={t.taskPlaceholder} className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter') { handleAddTodo(e.target.value); e.target.value = ''; } }} /></div>
            </div>
          </Card>

          <div className="space-y-4 mt-6">
             <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase mb-2"><TrendingDown size={16} /> {t.logisticsTitle}</div>
             <Card className="overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-slate-700 flex items-center gap-2"><Fuel size={16} className="text-orange-500"/> {t.gasTitle}</h3></div>
                <div className="p-4"><p className="text-sm text-slate-500 mb-3">{t.gasDesc}</p><Button onClick={triggerGasSearchNearMe} variant="secondary" className="w-full text-sm" icon={ExternalLink}>{t.gasButton}</Button></div>
             </Card>
             <Card className="overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-slate-700 flex items-center gap-2"><Coffee size={16} className="text-brown-500"/> {t.foodTitle}</h3></div>
                <div className="divide-y divide-slate-100">
                    {foodData.map((place, idx) => (
                        <div key={idx} className="p-3 flex justify-between items-center"><div><div className="font-semibold text-slate-800 text-sm">{place.name}</div><div className="flex items-center gap-2 mt-0.5"><span className="text-xs text-slate-500 bg-slate-100 px-1.5 rounded">{place.type}</span><span className="text-xs text-blue-600 font-medium flex items-center gap-1"><Navigation size={10}/> {place.dist}</span></div></div><button onClick={() => triggerStationNav(place.name, city)} className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200"><Utensils size={14}/></button></div>
                    ))}
                </div>
             </Card>
          </div>

          {/* REPORT GENERATOR & PHOTO UPLOAD */}
          <div className="space-y-2 mt-6">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase mb-2">
                <FileText size={16} /> {t.reportTitle}
             </div>
            <Card className="p-4">
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t.photosTitle}</label>
                        <button onClick={() => fileInputRef.current.click()} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded">
                            <Camera size={14} /> {t.addPhoto}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                    </div>
                    {/* Photo Grid */}
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {reportImages && reportImages.length > 0 ? (
                            reportImages.map((img, idx) => (
                                <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                </div>
                            ))
                        ) : (
                            <div onClick={() => fileInputRef.current.click()} className="w-full h-20 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs cursor-pointer hover:bg-slate-50 hover:border-blue-200">
                                <ImageIcon size={20} className="mb-1 opacity-50"/>
                                {t.addPhoto}
                            </div>
                        )}
                    </div>
                </div>

                <TextArea label={t.reportNotesLabel} placeholder={t.reportNotesPlaceholder} value={reportNotes || ""} onChange={(e) => handleSaveNotes(e.target.value)} />
                <Button onClick={handleGenerateReport} fullWidth icon={CheckCircle} variant={finalReport ? "success" : "primary"}>
                    {t.generateBtn}
                </Button>

                {finalReport && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <label className="block text-sm font-medium text-slate-600 mb-2">{t.reportResultLabel}</label>
                        <div className="bg-slate-50 p-4 rounded-xl text-[10px] md:text-sm font-mono text-slate-700 whitespace-pre-wrap border border-slate-200 max-h-40 overflow-y-auto">
                            {finalReport}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={() => printAsPdf(finalReport, reportImages)} variant="secondary" className="flex-1 text-xs" icon={Printer} size="small">{t.downloadPdf}</Button>
                            <Button onClick={() => downloadAsWord(finalReport, `Report_${customerName}`, reportImages)} variant="secondary" className="flex-1 text-xs" icon={Download} size="small">{t.downloadDoc}</Button>
                        </div>
                    </div>
                )}
            </Card>
          </div>
          
          <div className="pt-4 pb-4"><Button variant="danger" className="w-full text-sm" icon={Trash2} onClick={() => handleDelete(selectedAppointment.id)}>{t.delete}</Button></div>
        </div>
      </div>
    );
  }

  // VIEW: KANBAN DASHBOARD
  const incomingApps = appointments.filter(a => (a.status || 'incoming') === 'incoming' && (a.customerName.toLowerCase().includes(filter.toLowerCase()) || a.city.toLowerCase().includes(filter.toLowerCase())));
  const pendingApps = appointments.filter(a => a.status === 'pending' && (a.customerName.toLowerCase().includes(filter.toLowerCase()) || a.city.toLowerCase().includes(filter.toLowerCase())));
  const doneApps = appointments.filter(a => a.status === 'done' && (a.customerName.toLowerCase().includes(filter.toLowerCase()) || a.city.toLowerCase().includes(filter.toLowerCase())));

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans flex flex-col h-screen overflow-hidden">
      <div className="bg-white px-5 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-20 bg-blue-600">
         <div className="flex items-center gap-3">
            <DCLogo />
            <div><h1 className="text-xl font-black text-white tracking-tight">{t.appTitle}</h1><p className="text-[10px] text-blue-100 font-medium">{t.subtitle}</p></div>
         </div>
         <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-2 py-1 bg-blue-500 hover:bg-blue-700 rounded-full text-[10px] font-bold text-white transition-colors border border-blue-400"><Globe size={12}/> {lang.toUpperCase()}</button>
      </div>

      <div className="px-4 py-2 bg-white border-b border-slate-100 z-10">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 text-slate-400" size={16}/>
            <input placeholder={t.searchPlaceholder} value={filter} onChange={e => setFilter(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
      </div>

      {/* KANBAN BOARD CONTAINER WITH DND PROP */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="h-full flex gap-4 min-w-[320px] md:min-w-full">
            {/* Column 1: Incoming */}
            <KanbanColumn 
                title={t.colIncoming} 
                status="incoming" 
                appointments={incomingApps} 
                onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} 
                lang={lang}
                onStatusChange={handleUpdateStatus} // New prop for DnD
            />
            {/* Column 2: Pending */}
            <KanbanColumn 
                title={t.colPending} 
                status="pending" 
                appointments={pendingApps} 
                onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} 
                lang={lang}
                onStatusChange={handleUpdateStatus} // New prop for DnD
            />
            {/* Column 3: Done */}
            <KanbanColumn 
                title={t.colDone} 
                status="done" 
                appointments={doneApps} 
                onClickApp={(app) => { setSelectedAppointment(app); setView('detail'); }} 
                lang={lang}
                onStatusChange={handleUpdateStatus} // New prop for DnD
            />
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-30"><button onClick={() => { setFormData({ customerName: '', city: '', address: '', date: '', time: '', request: '', category: 'inspection', status: 'incoming', reportNotes: '', finalReport: '', todos: [], reportImages: [] }); setView('add'); }} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl shadow-blue-200 flex items-center justify-center transition-transform active:scale-90"><Plus size={28} /></button></div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
}
