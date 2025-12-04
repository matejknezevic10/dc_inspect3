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


const firebaseConfig =  {
  apiKey: "AIzaSyBc2ajUaIkGvcdQQsDDlzDPHhiW2yg9BCc",
  authDomain: "dc-inspect.firebaseapp.com",
  projectId: "dc-inspect",
  storageBucket: "dc-inspect.firebasestorage.app",
  messagingSenderId: "639013498118",
  appId: "1:639013498118:web:15146029fbc159cbd30287",
  measurementId: "G-5TETMHQ1EW"
};

// Initialisierung mit Fehlerabfangung (verhindert White Screen bei falscher Config)
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase Init Error:", error);
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- LOGO COMPONENT ---
const DCLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-xl shadow-sm flex-shrink-0">
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
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
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
            imgHtml += `<p><img src="${img}" width="400" /></p>`;
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
            imgHtml += `<div style="text-align: center;"><img src="${img}" style="max-width: 100%; max-height: 300px; border: 1px solid #ccc; object-fit: contain;" /></div>`;
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
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                        }
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
    e.preventDefault(); 
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
        {appointments.length ===