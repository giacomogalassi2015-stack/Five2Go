console.log("✅ 1. data-logic.js caricato (DOM Safe Mode)");

// 1. CONFIGURAZIONE SUPABASE
const SUPABASE_URL = 'https://ydrpicezcwtfwdqpihsb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkcnBpY2V6Y3d0ZndkcXBpaHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTQzMDAsImV4cCI6MjA4MzYzMDMwMH0.c89-gAZ8Pgp5Seq89BYRraTG-qqmP03LUCl1KqG9bOg';

window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// CACHE E CONFIGURAZIONE
window.appCache = {};
const CLOUDINARY_CLOUD_NAME = 'dkg0jfady'; 
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;

window.mapsToInit = [];
window.tempTransportData = [];
window.currentLang = localStorage.getItem('app_lang') || 'it';
window.currentViewName = 'home'; 

// CONFIGURAZIONE LINGUE
window.AVAILABLE_LANGS = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
];

// DIZIONARIO TESTI (Invariato)
const UI_TEXT = {
    it: {
        loading: "Caricamento...", error: "Errore", no_results: "Nessun risultato.",
        home_title: "Benvenuto", nav_villages: "Paesi", nav_food: "Cibo", nav_outdoor: "Outdoor", nav_services: "Servizi",
        menu_prod: "Prodotti", menu_rest: "Ristoranti", menu_trail: "Sentieri", menu_beach: "Spiagge", 
        menu_trans: "Trasporti", menu_num: "Numeri Utili", menu_pharm: "Farmacie", menu_map: "Mappe", menu_monu: "Attrazioni",
        menu_wine: "Vini",
        footer_rights: "Tutti i diritti riservati.",
        filter_title: "Filtra per", filter_all: "Tutti", show_results: "Mostra Risultati", 
        filter_cat: "Categoria", filter_village: "Borgo",
        wine_type: "Tipologia", wine_grapes: "Uve", wine_pairings: "Abbinamenti", wine_deg: "Gradi",
        label_curiosity: "Curiosità", desc_missing: "Descrizione non disponibile.",
        btn_details: "Vedi Dettagli", btn_download_gpx: "Scarica file GPX", 
        gpx_missing: "Traccia GPS non presente",
        map_route_title: "Mappa Percorso", map_zoom_hint: "Usa due dita per zoomare",
        plan_trip: "Pianifica Viaggio", departure: "PARTENZA", arrival: "ARRIVO", 
        date_trip: "DATA VIAGGIO", time_trip: "ORARIO", find_times: "TROVA ORARI",
        next_runs: "CORSE SUCCESSIVE", next_departure: "PROSSIMA PARTENZA",
        select_placeholder: "Seleziona...", select_start: "-- Seleziona Partenza --",
        bus_searching: "Cerco collegamenti...", bus_no_conn: "Nessun collegamento", 
        bus_no_dest: "Nessuna destinazione", bus_not_found: "Nessuna corsa trovata",
        bus_try_change: "Prova a cambiare orario.", 
        badge_holiday: "📅 FESTIVO", badge_weekday: "🏢 FERIALE",
        label_warning: "ATTENZIONE",
        how_to_ticket: "COME ACQUISTARE IL BIGLIETTO",
        show_map: "MOSTRA MAPPA", hide_map: "NASCONDI MAPPA",
        map_hint: "Tocca i segnaposto per impostare Partenza/Arrivo",
        train_cta: "ORARI E BIGLIETTI",
        train_desc: "Il treno è il mezzo più veloce. Corse frequenti ogni 15-20 minuti tra i borghi.",
        avg_times: "Tempi Medi", between_villages: "Tra i Borghi", check_site: "Acquista e controlla gli orari sul sito ufficiale",
        ideal_for: "Ideale per",
        welcome_app_name: "5 Terre Guide", welcome_desc: "La tua guida essenziale per esplorare le Cinque Terre.",
        distance: "Distanza", duration: "Durata", level: "Livello"
    },
    // ... (Le altre lingue rimangono uguali, omesse per brevità ma nel tuo file lasciale)
    en: { loading: "Loading...", error: "Error", welcome_app_name: "5 Terre Guide", footer_rights: "All rights reserved.", nav_villages: "Villages", nav_food: "Food", nav_outdoor: "Outdoor", nav_services: "Services", ideal_for: "Best for", distance: "Distance", duration: "Duration", level: "Level", btn_details: "Details", gpx_missing: "GPX Missing", btn_download_gpx: "Download GPX" } // Aggiungi qui le altre se non presenti
};
// Nota: Assicurati che nel tuo file reale ci siano tutte le lingue come prima.

// 2. HELPER DOM MANIPULATION (IL CUORE DEL REFACTOR)
/**
 * Crea un elemento DOM in modo sicuro e veloce.
 * @param {string} tag - Tag HTML (es. 'div', 'button')
 * @param {Object} props - Oggetto con classi, attributi, stili o eventi
 * @param {Array|string|Node} children - Figli da appendere
 */
window.mk = function(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    
    // Gestione Proprietà
    if (props) {
        Object.entries(props).forEach(([key, val]) => {
            if (key === 'class' || key === 'className') {
                el.className = val;
            } else if (key === 'style' && typeof val === 'object') {
                Object.assign(el.style, val);
            } else if (key.startsWith('on') && typeof val === 'function') {
                // Gestione Eventi (es. onclick)
                el[key.toLowerCase()] = val;
            } else if (key === 'html') {
                // Backdoor per innerHTML solo se strettamente necessario (evitare se possibile)
                el.innerHTML = val;
            } else if (val !== null && val !== undefined) {
                el.setAttribute(key, val);
            }
        });
    }

    // Gestione Figli
    if (children) {
        const kids = Array.isArray(children) ? children : [children];
        kids.forEach(child => {
            if (child instanceof Node) {
                el.appendChild(child);
            } else if (child !== null && child !== undefined) {
                // Le stringhe vengono trattate come textContent (SICURO da XSS)
                el.appendChild(document.createTextNode(String(child)));
            }
        });
    }
    return el;
};

// HELPER FUNCTIONS GLOBALI
window.t = function(key) {
    const langDict = UI_TEXT[window.currentLang] || UI_TEXT['it'] || UI_TEXT['en'];
    return langDict[key] || key;
};

// Recupero dati sicuro (non serve più escapeHTML perché usiamo textContent, ma lo teniamo per compatibilità)
window.dbCol = function(item, field) {
    if (!item || !item[field]) return '';
    let value = item[field];
    if (typeof value === 'object' && value !== null) {
        value = value[window.currentLang] || value['it'] || '';
    }
    return String(value); // Ritorna stringa pura, il DOM renderizzerà sicuro
};

window.getSmartUrl = function(name, folder = '', width = 600) {
    if (!name) return 'https://via.placeholder.com/600x400?text=No+Image';
    const safeName = encodeURIComponent(name.trim()); 
    const folderPath = folder ? `${folder}/` : '';
    return `${CLOUDINARY_BASE_URL}/w_${width},c_fill,f_auto,q_auto:good,fl_progressive/${folderPath}${safeName}`;
};

// Easter Date Logic (Invariato)
function getEasterDate(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}

window.isItalianHoliday = function(dateObj) {
    const d = dateObj.getDate();
    const m = dateObj.getMonth() + 1; 
    const y = dateObj.getFullYear();
    if (dateObj.getDay() === 0) return true;
    const fixedHolidays = ["1-1", "6-1", "25-4", "1-5", "2-6", "15-8", "1-11", "8-12", "25-12", "26-12"];
    if (fixedHolidays.includes(`${d}-${m}`)) return true;
    const easter = getEasterDate(y);
    const pasquetta = new Date(easter);
    pasquetta.setDate(easter.getDate() + 1);
    if (d === pasquetta.getDate() && (m - 1) === pasquetta.getMonth()) return true;
    return false;
};