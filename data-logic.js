console.log("✅ 1. data-logic.js caricato (con Calendario Italia)");

// 1. CONFIGURAZIONE SUPABASE
const SUPABASE_URL = 'https://ydrpicezcwtfwdqpihsb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkcnBpY2V6Y3d0ZndkcXBpaHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTQzMDAsImV4cCI6MjA4MzYzMDMwMH0.c89-gAZ8Pgp5Seq89BYRraTG-qqmP03LUCl1KqG9bOg';

// RENDIAMO SUPABASE GLOBALE
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CLOUDINARY_CLOUD_NAME = 'dkg0jfady'; 
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;

// 2. VARIABILI GLOBALI
window.mapsToInit = [];
window.tempTransportData = [];
window.tempAttractionsData = [];
window.currentLang = localStorage.getItem('app_lang') || 'it';
window.currentViewName = 'home'; 

// 3. CONFIGURAZIONE LINGUE
window.AVAILABLE_LANGS = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
];

// 4. DIZIONARIO TESTI
const UI_TEXT = {
    it: {
        loading: "Caricamento...", error: "Errore",
        home_title: "Benvenuto", food_title: "Cibo & Sapori", outdoor_title: "Outdoor & Cultura", services_title: "Servizi", maps_title: "Mappe",
        nav_villages: "Home", nav_food: "Cibo", nav_outdoor: "Outdoor", nav_services: "Servizi",
        menu_prod: "Prodotti", menu_rest: "Ristoranti", menu_trail: "Sentieri", menu_beach: "Spiagge", menu_trans: "Trasporti", menu_num: "Numeri Utili", menu_pharm: "Farmacie", menu_map: "Mappe", menu_monu: "Cultura",
        btn_call: "Chiama", btn_map: "Mappa", btn_info: "Info", btn_website: "Sito Web", btn_hours: "Orari", btn_toll: "Pedaggio", btn_position: "Posizione",
        ideal_for: "Ideale per", no_results: "Nessun risultato.", visit_time: "min", curiosity: "Curiosità", coverage: "Copertura", pharmacy_tag: "FARMACIA",
        map_loaded: "Mappa caricata",
        welcome_app_name: "5 Terre Guide",
        welcome_desc: "La tua guida essenziale per esplorare le Cinque Terre. Scopri sentieri, spiagge, cultura e sapori locali.",
        welcome_start: "Inizia a Esplorare"
    },
    en: {
        loading: "Loading...", error: "Error",
        home_title: "Welcome", food_title: "Food & Flavors", outdoor_title: "Outdoor & Culture", services_title: "Services", maps_title: "Maps",
        nav_villages: "Home", nav_food: "Food", nav_outdoor: "Outdoor", nav_services: "Services",
        menu_prod: "Products", menu_rest: "Restaurants", menu_trail: "Trails", menu_beach: "Beaches", menu_trans: "Transport", menu_num: "Useful Numbers", menu_pharm: "Pharmacies", menu_map: "Maps", menu_monu: "Culture",
        btn_call: "Call", btn_map: "Map", btn_info: "Info", btn_website: "Website", btn_hours: "Hours", btn_toll: "Toll", btn_position: "Location",
        ideal_for: "Best for", no_results: "No results found.", visit_time: "min", curiosity: "Curiosity", coverage: "Coverage", pharmacy_tag: "PHARMACY",
        map_loaded: "Map loaded",
        welcome_app_name: "5 Terre Guide",
        welcome_desc: "Your essential guide to exploring Cinque Terre. Discover trails, beaches, culture, and local flavors.",
        welcome_start: "Start Exploring"
    },
    es: {
        loading: "Cargando...", error: "Error",
        home_title: "Bienvenido", food_title: "Comida y Sabores", outdoor_title: "Aire Libre y Cultura", services_title: "Servicios", maps_title: "Mapas",
        nav_villages: "Inicio", nav_food: "Comida", nav_outdoor: "Aire Libre", nav_services: "Servicios",
        menu_prod: "Productos", menu_rest: "Restaurantes", menu_trail: "Senderos", menu_beach: "Playas", menu_trans: "Transporte", menu_num: "Números", menu_pharm: "Farmacias", menu_map: "Mapas", menu_monu: "Cultura",
        btn_call: "Llamar", btn_map: "Mapa", btn_info: "Info", btn_website: "Sitio Web", btn_hours: "Horario", btn_toll: "Peaje", btn_position: "Posición",
        ideal_for: "Ideal para", no_results: "Sin resultados.", visit_time: "min", curiosity: "Curiosidad", coverage: "Cobertura", pharmacy_tag: "FARMACIA",
        map_loaded: "Mapa cargado",
        welcome_app_name: "5 Terre Guide",
        welcome_desc: "Tu guía esencial para explorar Cinque Terre. Descubre senderos, playas, cultura y sabores.",
        welcome_start: "Empezar"
    },
    fr: {
        loading: "Chargement...", error: "Erreur",
        home_title: "Bienvenue", food_title: "Gastronomie", outdoor_title: "Plein Air & Culture", services_title: "Services", maps_title: "Cartes",
        nav_villages: "Accueil", nav_food: "Nourriture", nav_outdoor: "Plein Air", nav_services: "Services",
        menu_prod: "Produits", menu_rest: "Restaurants", menu_trail: "Sentiers", menu_beach: "Plages", menu_trans: "Transport", menu_num: "Numéros", menu_pharm: "Pharmacies", menu_map: "Cartes", menu_monu: "Culture",
        btn_call: "Appeler", btn_map: "Carte", btn_info: "Info", btn_website: "Site Web", btn_hours: "Horaires", btn_toll: "Péage", btn_position: "Position",
        ideal_for: "Idéal pour", no_results: "Aucun résultat.", visit_time: "min", curiosity: "Curiosité", coverage: "Couverture", pharmacy_tag: "PHARMACIE",
        map_loaded: "Carte chargée",
        welcome_app_name: "5 Terre Guide",
        welcome_desc: "Votre guide essentiel pour explorer les Cinque Terre. Découvrez sentiers, plages, culture et saveurs.",
        welcome_start: "Commencer"
    },
    de: {
        loading: "Laden...", error: "Fehler",
        home_title: "Willkommen", food_title: "Essen & Genuss", outdoor_title: "Outdoor & Kultur", services_title: "Dienste", maps_title: "Karten",
        nav_villages: "Start", nav_food: "Essen", nav_outdoor: "Outdoor", nav_services: "Dienste",
        menu_prod: "Produkte", menu_rest: "Restaurants", menu_trail: "Wanderwege", menu_beach: "Strände", menu_trans: "Transport", menu_num: "Nummern", menu_pharm: "Apotheken", menu_map: "Karten", menu_monu: "Kultur",
        btn_call: "Anrufen", btn_map: "Karte", btn_info: "Info", btn_website: "Webseite", btn_hours: "Öffnungszeiten", btn_toll: "Maut", btn_position: "Standort",
        ideal_for: "Ideal für", no_results: "Keine Ergebnisse.", visit_time: "min", curiosity: "Kuriosität", coverage: "Abdeckung", pharmacy_tag: "APOTHEKE",
        map_loaded: "Karte geladen",
        welcome_app_name: "5 Terre Guide",
        welcome_desc: "Ihr wesentlicher Reiseführer für die Cinque Terre. Entdecken Sie Wanderwege, Strände, Kultur und Geschmack.",
        welcome_start: "Starten"
    },
    zh: {
        loading: "加载中...", error: "错误",
        home_title: "欢迎", food_title: "美食与风味", outdoor_title: "户外与文化", services_title: "服务", maps_title: "地图",
        nav_villages: "首页", nav_food: "食物", nav_outdoor: "户外", nav_services: "服务",
        menu_prod: "产品", menu_rest: "餐厅", menu_trail: "步道", menu_beach: "海滩", menu_trans: "交通", menu_num: "常用号码", menu_pharm: "药房", menu_map: "地图", menu_monu: "文化",
        btn_call: "致电", btn_map: "地图", btn_info: "信息", btn_website: "网站", btn_hours: "时间", btn_toll: "通行费", btn_position: "位置",
        ideal_for: "适合", no_results: "无结果", visit_time: "分", curiosity: "趣闻", coverage: "覆盖范围", pharmacy_tag: "药房",
        map_loaded: "地图已加载",
        welcome_app_name: "5 Terre Guide",
        welcome_desc: "探索五渔村的必备指南。发现步道、海滩、文化和当地风味。",
        welcome_start: "开始探索"
    }
};

// 5. HELPER FUNCTIONS GLOBALI
window.t = function(key) {
    const langDict = UI_TEXT[window.currentLang] || UI_TEXT['it'];
    return langDict[key] || key;
};

window.dbCol = function(item, field) {
    if (!item) return '';
    if (window.currentLang === 'it') return item[field]; 
    const translatedField = `${field}_${window.currentLang}`; 
    return (item[translatedField] && item[translatedField].trim() !== '') ? item[translatedField] : item[field];
};

window.getSmartUrl = function(name, folder = '', width = 600) {
    if (!name) return 'https://via.placeholder.com/600x400?text=No+Image';
    const safeName = encodeURIComponent(name.trim()); 
    const folderPath = folder ? `${folder}/` : '';
    return `${CLOUDINARY_BASE_URL}/w_${width},c_fill,f_auto,q_auto:good,fl_progressive/${folderPath}${safeName}`;
};

window.shareApp = async function() {
    try {
        if (navigator.share) await navigator.share({ title: '5 Terre App', text: 'Guarda questa guida!', url: window.location.href });
        else { navigator.clipboard.writeText(window.location.href); alert("Link copiato!"); }
    } catch (err) { console.log("Errore:", err); }
};

// =========================================================
// 6. LOGICA CALENDARIO ITALIANO (Feriale/Festivo)
// =========================================================

// Algoritmo di Gauss per calcolare la Pasqua
function getEasterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed per JS Date
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month, day);
}

// Verifica se è un giorno festivo in Italia
function isItalianHoliday(dateObj) {
    const d = dateObj.getDate();
    const m = dateObj.getMonth() + 1; // 1-12
    const y = dateObj.getFullYear();

    // 1. Domenica
    if (dateObj.getDay() === 0) return true;

    // 2. Festività Fisse
    const fixedHolidays = [
        "1-1",   // Capodanno
        "6-1",   // Epifania
        "25-4",  // Liberazione
        "1-5",   // Festa del Lavoro
        "2-6",   // Festa della Repubblica
        "15-8",  // Ferragosto
        "1-11",  // Ognissanti
        "8-12",  // Immacolata
        "25-12", // Natale
        "26-12"  // Santo Stefano
    ];
    if (fixedHolidays.includes(`${d}-${m}`)) return true;

    // 3. Pasquetta (Lunedì dell'Angelo) = Pasqua + 1 giorno
    const easter = getEasterDate(y);
    const pasquetta = new Date(easter);
    pasquetta.setDate(easter.getDate() + 1);

    if (d === pasquetta.getDate() && (m - 1) === pasquetta.getMonth()) return true;
    
    // (Opzionale) Patrono della Spezia 19 Marzo? 
    // Per ora teniamo le nazionali standard.
    
    return false;
}

// =========================================================
// 7. MOTORE DI RICERCA BUS (Cervello)
// =========================================================
window.eseguiRicercaBus = async function() {
    // 1. Lettura dati
    const selPartenza = document.getElementById('selPartenza');
    const selArrivo = document.getElementById('selArrivo');
    const selData = document.getElementById('selData');
    const selOra = document.getElementById('selOra');

    if (!selPartenza || !selArrivo || !selData || !selOra) {
        console.error("Elementi DOM non trovati.");
        return;
    }

    const partenzaId = parseInt(selPartenza.value);
    const arrivoId = parseInt(selArrivo.value);
    const dataScelta = selData.value; // formato YYYY-MM-DD
    const oraScelta = selOra.value;

    const nextCard = document.getElementById('nextBusCard');
    const list = document.getElementById('otherBusList');
    const resultsContainer = document.getElementById('busResultsContainer');

    // Validazione
    if (!partenzaId || !arrivoId) { alert("Seleziona fermate valide"); return; }
    if (partenzaId === arrivoId) { alert("Partenza e arrivo coincidono!"); return; }

    // UI Loading
    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div style="text-align:center; padding:20px;">Cercando... <span class="material-icons spin">sync</span></div>`;
    list.innerHTML = '';

    // === CALCOLO FESTIVO AVANZATO ===
    // Parsing manuale per evitare problemi di timezone
    const parts = dataScelta.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; 
    const day = parseInt(parts[2]);
    const dateObj = new Date(year, month, day);

    // Usa la funzione helper per determinare se è festivo
    const isFestivo = isItalianHoliday(dateObj);

    // 2. Chiamata RPC a Supabase
    // Nota: Passiamo p_is_festivo. Lato DB la query dovrà fare qualcosa tipo:
    // WHERE (p_is_festivo = true AND "ATTIVO_FESTIVO" = true) OR (p_is_festivo = false AND "ATTIVO_FERIALE" = true)
    const { data, error } = await window.supabaseClient.rpc('trova_bus', { 
        p_partenza_id: partenzaId, 
        p_arrivo_id: arrivoId, 
        p_orario_min: oraScelta, 
        p_is_festivo: isFestivo 
    });

    if (error) { 
        console.error("❌ ERRORE SQL:", error);
        nextCard.innerHTML = `<div style="color:red; text-align:center;">Errore: ${error.message}</div>`; 
        return; 
    }

    // Badge UI per indicare all'utente che tipo di orario sta vedendo
    const dayTypeLabel = isFestivo 
        ? `<span class="badge-holiday">📅 FESTIVO</span>` 
        : `<span class="badge-weekday">🏢 FERIALE</span>`;

    if (!data || data.length === 0) { 
        nextCard.innerHTML = `
            <div style="text-align:center; padding:15px; color:#c62828;">
                <span class="material-icons">event_busy</span><br>
                <strong>Nessuna corsa trovata</strong><br>
                <div style="margin-top:5px;">${dayTypeLabel}</div>
                <small style="display:block; margin-top:5px;">Prova a cambiare orario.</small>
            </div>`; 
        return; 
    }

    const primo = data[0];
    const pOra = primo.ora_partenza.slice(0,5);
    const aOra = primo.ora_arrivo.slice(0,5);

    nextCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <span style="font-size:0.75rem; color:#e0f7fa; text-transform:uppercase; font-weight:bold;">PROSSIMA PARTENZA</span>
            ${dayTypeLabel}
        </div>
        <div class="bus-time-big">${pOra}</div>
        <div style="font-size:1rem; color:#e0f7fa;">Arrivo: <strong>${aOra}</strong></div>
        <div style="font-size:0.8rem; color:#b2ebf2; margin-top:5px;">${primo.nome_linea || 'Linea ATC'}</div>
    `;

    const successivi = data.slice(1);
    list.innerHTML = successivi.map(b => `
        <div class="bus-list-item">
            <span style="font-weight:bold; color:#333;">${b.ora_partenza.slice(0,5)}</span>
            <span style="color:#666;">➜ ${b.ora_arrivo.slice(0,5)}</span>
        </div>
    `).join('');
};