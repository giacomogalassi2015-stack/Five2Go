console.log("✅ 1. data-logic.js caricato (Sanitized)");

// 1. CONFIGURAZIONE SUPABASE
const SUPABASE_URL = 'https://ydrpicezcwtfwdqpihsb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkcnBpY2V6Y3d0ZndkcXBpaHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTQzMDAsImV4cCI6MjA4MzYzMDMwMH0.c89-gAZ8Pgp5Seq89BYRraTG-qqmP03LUCl1KqG9bOg';

// RENDIAMO SUPABASE GLOBALE
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- MODIFICA: INIZIALIZZAZIONE CACHE ---
window.appCache = {};

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

// 4. DIZIONARIO TESTI (Full Version - Aggiornato)
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
        welcome_app_name: "5 Terre Guide", welcome_desc: "La tua guida essenziale per esplorare le Cinque Terre."
    },
    en: {
        loading: "Loading...", error: "Error", no_results: "No results found.",
        home_title: "Welcome", nav_villages: "Villages", nav_food: "Food", nav_outdoor: "Outdoor", nav_services: "Services",
        menu_prod: "Products", menu_rest: "Restaurants", menu_trail: "Trails", menu_beach: "Beaches", 
        menu_trans: "Transport", menu_num: "Useful Numbers", menu_pharm: "Pharmacies", menu_map: "Maps", menu_monu: "Attractions",menu_wine: "Wines",
        footer_rights: "All rights reserved.",
        filter_title: "Filter by", filter_all: "All", show_results: "Show Results", 
        filter_cat: "Category", filter_village: "Village",
        wine_type: "Type", wine_grapes: "Grapes", wine_pairings: "Pairings", wine_deg: "Alcohol",
        label_curiosity: "Curiosity", desc_missing: "Description not available.",
        btn_details: "See Details", btn_download_gpx: "Download GPX file", 
        gpx_missing: "GPS track not found",
        map_route_title: "Route Map", map_zoom_hint: "Use two fingers to zoom",
        plan_trip: "Plan Trip", departure: "DEPARTURE", arrival: "ARRIVAL", 
        date_trip: "DATE", time_trip: "TIME", find_times: "FIND TIMES",
        next_runs: "NEXT RUNS", next_departure: "NEXT DEPARTURE",
        select_placeholder: "Select...", select_start: "-- Select Departure --",
        bus_searching: "Searching...", bus_no_conn: "No connection", 
        bus_no_dest: "No destination", bus_not_found: "No runs found",
        bus_try_change: "Try changing time.", 
        badge_holiday: "📅 HOLIDAY", badge_weekday: "🏢 WEEKDAY",
        label_warning: "WARNING",
        how_to_ticket: "HOW TO BUY TICKETS",
        show_map: "SHOW MAP", hide_map: "HIDE MAP",
        map_hint: "Tap markers to set Departure/Arrival",
        train_cta: "TIMETABLE & TICKETS",
        train_desc: "The train is the fastest way. Frequent runs every 15-20 mins between villages.",
        avg_times: "Avg Times", between_villages: "Between Villages", check_site: "Buy and check times on the official site",
        ideal_for: "Best for",
        welcome_app_name: "5 Terre Guide", welcome_desc: "Your essential guide to exploring Cinque Terre."
    },
    fr: {
        loading: "Chargement...", error: "Erreur", no_results: "Aucun résultat.",
        home_title: "Bienvenue", nav_villages: "Villages", nav_food: "Nourriture", nav_outdoor: "Plein Air", nav_services: "Services",
        menu_prod: "Produits", menu_rest: "Restaurants", menu_trail: "Sentiers", menu_beach: "Plages", menu_wine: "Vins",
        menu_trans: "Transport", menu_num: "Numéros", menu_pharm: "Pharmacies", menu_map: "Cartes", menu_monu: "Attractions",
        footer_rights: "Tous droits réservés.",
        filter_title: "Filtrer par", filter_all: "Tous", show_results: "Voir Résultats", 
        filter_cat: "Catégorie", filter_village: "Village",
        wine_type: "Type", wine_grapes: "Raisins", wine_pairings: "Accords", wine_deg: "Alcool",
        label_curiosity: "Curiosité", desc_missing: "Description non disponible.",
        btn_details: "Voir Détails", btn_download_gpx: "Télécharger GPX", 
        gpx_missing: "Trace GPS non trouvée",
        map_route_title: "Carte itinéraire", map_zoom_hint: "Utilisez deux doigts pour zoomer",
        plan_trip: "Planifier", departure: "DÉPART", arrival: "ARRIVÉE", 
        date_trip: "DATE", time_trip: "HEURE", find_times: "CHERCHER",
        next_runs: "PROCHAINS DÉPARTS", next_departure: "PROCHAIN DÉPART",
        select_placeholder: "Sélectionner...", select_start: "-- Choisir Départ --",
        bus_searching: "Recherche...", bus_no_conn: "Aucune connexion", 
        bus_no_dest: "Aucune destination", bus_not_found: "Aucun trajet trouvé",
        bus_try_change: "Essayez de changer l'heure.", 
        badge_holiday: "📅 FÉRIÉ", badge_weekday: "🏢 SEMAINE",
        label_warning: "ATTENTION",
        how_to_ticket: "COMMENT ACHETER UN BILLET",
        show_map: "AFFICHER CARTE", hide_map: "MASQUER CARTE",
        map_hint: "Touchez les marqueurs pour définir Départ/Arrivée",
        train_cta: "HORAIRES & BILLETS",
        train_desc: "Le train est le moyen le plus rapide. Passages fréquents toutes les 15-20 min.",
        avg_times: "Temps Moyens", between_villages: "Entre Villages", check_site: "Achetez et vérifiez les horaires sur le site officiel",
        ideal_for: "Idéal pour",
        welcome_app_name: "5 Terre Guide", welcome_desc: "Votre guide essentiel pour explorer les Cinque Terre."
    },
    de: {
        loading: "Laden...", error: "Fehler", no_results: "Keine Ergebnisse.",
        home_title: "Willkommen", nav_villages: "Dörfer", nav_food: "Essen", nav_outdoor: "Outdoor", nav_services: "Dienste",
        menu_prod: "Produkte", menu_rest: "Restaurants", menu_trail: "Wanderwege", menu_beach: "Strände", menu_wine: "Weine",
        menu_trans: "Transport", menu_num: "Nummern", menu_pharm: "Apotheken", menu_map: "Karten", menu_monu: "Attraktionen",
        footer_rights: "Alle Rechte vorbehalten.",
        filter_title: "Filtern nach", filter_all: "Alle", show_results: "Ergebnisse anzeigen", 
        filter_cat: "Kategorie", filter_village: "Dorf",
        wine_type: "Typ", wine_grapes: "Trauben", wine_pairings: "Paarungen", wine_deg: "Alkohol",
        label_curiosity: "Kuriosität", desc_missing: "Beschreibung nicht verfügbar.",
        btn_details: "Details ansehen", btn_download_gpx: "GPX herunterladen", 
        gpx_missing: "GPS-Track nicht gefunden",
        map_route_title: "Routenkarte", map_zoom_hint: "Mit zwei Fingern zoomen",
        plan_trip: "Planen", departure: "ABFAHRT", arrival: "ANKUNFT", 
        date_trip: "DATUM", time_trip: "ZEIT", find_times: "SUCHEN",
        next_runs: "NÄCHSTE FAHRTEN", next_departure: "NÄCHSTE ABFAHRT",
        select_placeholder: "Wählen...", select_start: "-- Abfahrt wählen --",
        bus_searching: "Suche...", bus_no_conn: "Keine Verbindung", 
        bus_no_dest: "Kein Ziel", bus_not_found: "Keine Fahrten gefunden",
        bus_try_change: "Versuchen Sie eine andere Zeit.", 
        badge_holiday: "📅 FEIERTAG", badge_weekday: "🏢 WERKTAG",
        label_warning: "ACHTUNG",
        how_to_ticket: "TICKET KAUFEN",
        show_map: "KARTE ANZEIGEN", hide_map: "KARTE AUSBLENDEN",
        map_hint: "Tippen Sie auf Marker für Start/Ziel",
        train_cta: "FAHRPLÄNE & TICKETS",
        train_desc: "Der Zug ist am schnellsten. Häufige Fahrten alle 15-20 Min.",
        avg_times: "Durchschn. Zeit", between_villages: "Zwischen Dörfern", check_site: "Kaufen und prüfen Sie Zeiten auf der offiziellen Seite",
        ideal_for: "Ideal für",
        welcome_app_name: "5 Terre Guide", welcome_desc: "Ihr wesentlicher Reiseführer für die Cinque Terre."
    },
    es: {
        loading: "Cargando...", error: "Error", no_results: "Sin resultados.",
        home_title: "Bienvenido", nav_villages: "Pueblos", nav_food: "Comida", nav_outdoor: "Aire Libre", nav_services: "Servicios",
        menu_prod: "Productos", menu_rest: "Restaurantes", menu_trail: "Senderos", menu_beach: "Playas", menu_wine: "Vinos",
        menu_trans: "Transporte", menu_num: "Números", menu_pharm: "Farmacias", menu_map: "Mapas", menu_monu: "Atracciones",
        footer_rights: "Todos los derechos reservados.",
        filter_title: "Filtrar por", filter_all: "Todos", show_results: "Mostrar Resultados", 
        filter_cat: "Categoría", filter_village: "Pueblo",
        wine_type: "Tipo", wine_grapes: "Uvas", wine_pairings: "Maridaje", wine_deg: "Alcohol",
        label_curiosity: "Curiosidad", desc_missing: "Descripción no disponible.",
        btn_details: "Ver Detalles", btn_download_gpx: "Descargar GPX", 
        gpx_missing: "Ruta GPS no encontrada",
        map_route_title: "Mapa de Ruta", map_zoom_hint: "Usa dos dedos para hacer zoom",
        plan_trip: "Planificar", departure: "SALIDA", arrival: "LLEGADA", 
        date_trip: "FECHA", time_trip: "HORA", find_times: "BUSCAR",
        next_runs: "PRÓXIMAS SALIDAS", next_departure: "PRÓXIMA SALIDA",
        select_placeholder: "Seleccionar...", select_start: "-- Seleccionar Salida --",
        bus_searching: "Buscando...", bus_no_conn: "Sin conexión", 
        bus_no_dest: "Sin destino", bus_not_found: "No se encontraron viajes",
        bus_try_change: "Prueba a cambiar la hora.", 
        badge_holiday: "📅 FESTIVO", badge_weekday: "🏢 LABORAL",
        label_warning: "ATENCIÓN",
        how_to_ticket: "CÓMO COMPRAR BOLETO",
        show_map: "MOSTRAR MAPA", hide_map: "OCULTAR MAPA",
        map_hint: "Toca marcadores para configurar Salida/Llegada",
        train_cta: "HORARIOS Y BOLETOS",
        train_desc: "El tren es el medio más rápido. Frecuencia cada 15-20 min.",
        avg_times: "Tiempos Promedio", between_villages: "Entre Pueblos", check_site: "Compra y consulta horarios en el sitio oficial",
        ideal_for: "Ideal para",
        welcome_app_name: "5 Terre Guide", welcome_desc: "Tu guía esencial para explorar Cinque Terre."
    },
    zh: {
        loading: "加载中...", error: "错误", no_results: "无结果",
        home_title: "欢迎", nav_villages: "村庄", nav_food: "美食", nav_outdoor: "户外", nav_services: "服务",
        menu_prod: "产品", menu_rest: "餐厅", menu_trail: "步道", menu_beach: "海滩", 
        menu_trans: "交通", menu_num: "常用号码", menu_pharm: "药房", menu_map: "地图", menu_monu: "景点",
        footer_rights: "版权所有。",
        filter_title: "筛选", filter_all: "全部", show_results: "显示结果", 
        filter_cat: "类别", filter_village: "村庄",
        wine_type: "类型", wine_grapes: "葡萄", wine_pairings: "搭配", wine_deg: "酒精度",
        label_curiosity: "趣闻", desc_missing: "暂无描述。",
        btn_details: "查看详情", btn_download_gpx: "下载 GPX", 
        gpx_missing: "未找到 GPS 轨迹",
        map_route_title: "路线图", map_zoom_hint: "使用双指缩放",
        plan_trip: "行程规划", departure: "出发", arrival: "到达", 
        date_trip: "日期", time_trip: "时间", find_times: "查询",
        next_runs: "后续班次", next_departure: "下一班",
        select_placeholder: "选择...", select_start: "-- 选择出发地 --",
        bus_searching: "搜索中...", bus_no_conn: "无连接", 
        bus_no_dest: "无目的地", bus_not_found: "未找到班次",
        bus_try_change: "尝试更改时间。", 
        badge_holiday: "📅 节假日", badge_weekday: "🏢 工作日",
        label_warning: "注意",
        how_to_ticket: "如何购票",
        show_map: "显示地图", hide_map: "隐藏地图",
        map_hint: "点击标记设置出发/到达",
        train_cta: "时刻表和购票",
        train_desc: "火车是最快的方式。每15-20分钟一班。",
        avg_times: "平均时间", between_villages: "村庄之间", check_site: "在官网购买并查看时刻表",
        ideal_for: "适合",
        welcome_app_name: "5 Terre Guide", welcome_desc: "探索五渔村的必备指南。"
    }
};
const FERRY_STOPS = [
    { id: 'levanto', label: 'Levanto' },
    { id: 'monterosso', label: 'Monterosso' },
    { id: 'vernazza', label: 'Vernazza' },
    { id: 'corniglia', label: 'Corniglia' },
    { id: 'manarola', label: 'Manarola' },
    { id: 'riomaggiore', label: 'Riomaggiore' },
    { id: 'portovenere', label: 'Portovenere' },
    { id: 'la spezia', label: 'La Spezia' },
    { id: 'lerici', label: 'Lerici' }
];

// 5. HELPER FUNCTIONS GLOBALI

// --- FUNZIONE DI SANITIZZAZIONE AGGIUNTA ---
window.escapeHTML = function(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

window.t = function(key) {
    const langDict = UI_TEXT[window.currentLang] || UI_TEXT['it'];
    // I testi UI statici sono considerati sicuri, non li sanitizziamo qui
    return langDict[key] || key; 
};

// --- MODIFICATO: dbCol ora sanitizza automaticamente l'output ---
window.dbCol = function(item, field) {
    if (!item || !item[field]) return '';

    let value = item[field];

    if (typeof value === 'object' && value !== null) {
        value = value[window.currentLang] || value['it'] || '';
    }

    // Sanitizza SEMPRE il valore proveniente dal DB
    return window.escapeHTML(value);
};

window.getSmartUrl = function(name, folder = '', width = 600) {
    if (!name) return 'https://via.placeholder.com/600x400?text=No+Image';
    const safeName = encodeURIComponent(name.trim()); 
    const folderPath = folder ? `${folder}/` : '';
    return `${CLOUDINARY_BASE_URL}/w_${width},c_fill,f_auto,q_auto:good,fl_progressive/${folderPath}${safeName}`;
};

window.changeLanguage = function(langCode) {
    console.log("Cambio lingua a:", langCode);
    window.currentLang = langCode;
    localStorage.setItem('user_lang', langCode);
    updateStaticInterface();
    if (typeof renderCategory === 'function') {
        const currentCategory = window.currentCategory || 'attrazioni'; 
        renderCategory(currentCategory); 
    } else {
        location.reload(); 
    }
};

function updateStaticInterface() {
    const homeTitleEl = document.getElementById('home-title'); 
    if(homeTitleEl) homeTitleEl.textContent = window.t('home_title');
    const navFood = document.getElementById('nav-food');
    if(navFood) navFood.textContent = window.t('nav_food');
}

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
    
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; 
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month, day);
}

function isItalianHoliday(dateObj) {
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
}