console.log("✅ 1. data-logic.js caricato");

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
window.currentViewName = 'home'; // Tracciamento vista per header

// 3. CONFIGURAZIONE LINGUE
window.AVAILABLE_LANGS = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
];

// 4. DIZIONARIO TESTI (Full Version)
const UI_TEXT = {
    it: {
        loading: "Caricamento...", error: "Errore", no_results: "Nessun risultato.",
        // Menu & Nav
        home_title: "Benvenuto", nav_villages: "Home", nav_food: "Cibo", nav_outdoor: "Outdoor", nav_services: "Servizi",
        menu_prod: "Prodotti", menu_rest: "Ristoranti", menu_trail: "Sentieri", menu_beach: "Spiagge", 
        menu_trans: "Trasporti", menu_num: "Numeri Utili", menu_pharm: "Farmacie", menu_map: "Mappe", menu_monu: "Cultura",
        // Azioni Generiche
        btn_call: "Chiama", btn_map: "Mappa", btn_position: "Posizione", btn_website: "Sito Web",
        open_site: "Apri sito", take_me_here: "Portami qui",
        // Sentieri & Outdoor
        details_trail: "Dettagli Percorso", distance: "Distanza", duration: "Durata", level: "Livello",
        visit_time: "min visita", difficulty: "Difficoltà",
        // Ristoranti & Locali
        hours_label: "Orari", phone_label: "Telefono", no_hours: "Orari non disponibili",
        ideal_for: "Ideale per",
        // Trasporti (Bus/Treno)
        plan_trip: "Pianifica Viaggio", departure: "PARTENZA", arrival: "ARRIVO", 
        date_trip: "DATA VIAGGIO", time_trip: "ORARIO", find_times: "TROVA ORARI",
        next_runs: "CORSE SUCCESSIVE", next_departure: "PROSSIMA PARTENZA",
        select_placeholder: "Seleziona...",
        how_to_ticket: "COME ACQUISTARE IL BIGLIETTO",
        show_map: "MOSTRA MAPPA FERMATE", hide_map: "NASCONDI MAPPA FERMATE",
        map_hint: "Tocca i segnaposto per impostare Partenza/Arrivo",
        // Treno Specifico
        train_cta: "ORARI E BIGLIETTI",
        train_desc: "Il treno è il mezzo più veloce. Corse frequenti ogni 15-20 minuti tra i borghi.",
        avg_times: "Tempi Medi", between_villages: "Tra i Borghi", check_site: "Acquista e controlla gli orari sul sito ufficiale",
        // Welcome
        welcome_app_name: "5 Terre Guide",
        welcome_desc: "La tua guida essenziale per esplorare le Cinque Terre.",
        map_loaded: "Mappa caricata"
    },
    en: {
        loading: "Loading...", error: "Error", no_results: "No results found.",
        home_title: "Welcome", nav_villages: "Home", nav_food: "Food", nav_outdoor: "Outdoor", nav_services: "Services",
        menu_prod: "Products", menu_rest: "Restaurants", menu_trail: "Trails", menu_beach: "Beaches", 
        menu_trans: "Transport", menu_num: "Useful Numbers", menu_pharm: "Pharmacies", menu_map: "Maps", menu_monu: "Culture",
        btn_call: "Call", btn_map: "Map", btn_position: "Location", btn_website: "Website",
        open_site: "Open site", take_me_here: "Take me there",
        details_trail: "Trail Details", distance: "Distance", duration: "Duration", level: "Level",
        visit_time: "min visit", difficulty: "Difficulty",
        hours_label: "Hours", phone_label: "Phone", no_hours: "Hours not available",
        ideal_for: "Best for",
        plan_trip: "Plan Trip", departure: "DEPARTURE", arrival: "ARRIVAL", 
        date_trip: "DATE", time_trip: "TIME", find_times: "FIND TIMES",
        next_runs: "NEXT RUNS", next_departure: "NEXT DEPARTURE",
        select_placeholder: "Select...",
        how_to_ticket: "HOW TO BUY TICKETS",
        show_map: "SHOW STOP MAP", hide_map: "HIDE STOP MAP",
        map_hint: "Tap markers to set Departure/Arrival",
        train_cta: "TIMETABLE & TICKETS",
        train_desc: "The train is the fastest way. Frequent runs every 15-20 mins between villages.",
        avg_times: "Avg Times", between_villages: "Between Villages", check_site: "Buy and check times on the official site",
        welcome_app_name: "5 Terre Guide",
        welcome_desc: "Your essential guide to exploring Cinque Terre.",
        map_loaded: "Map loaded"
    },
    fr: {
        loading: "Chargement...", error: "Erreur", no_results: "Aucun résultat.",
        home_title: "Bienvenue", nav_villages: "Accueil", nav_food: "Nourriture", nav_outdoor: "Plein Air", nav_services: "Services",
        menu_prod: "Produits", menu_rest: "Restaurants", menu_trail: "Sentiers", menu_beach: "Plages", 
        menu_trans: "Transport", menu_num: "Numéros", menu_pharm: "Pharmacies", menu_map: "Cartes", menu_monu: "Culture",
        btn_call: "Appeler", btn_map: "Carte", btn_position: "Position", btn_website: "Site Web",
        open_site: "Ouvrir", take_me_here: "Emmenez-moi",
        details_trail: "Détails du sentier", distance: "Distance", duration: "Durée", level: "Niveau",
        visit_time: "min visite", difficulty: "Difficulté",
        hours_label: "Horaires", phone_label: "Téléphone", no_hours: "Horaires non disponibles",
        ideal_for: "Idéal pour",
        plan_trip: "Planifier", departure: "DÉPART", arrival: "ARRIVÉE", 
        date_trip: "DATE", time_trip: "HEURE", find_times: "CHERCHER",
        next_runs: "PROCHAINS DÉPARTS", next_departure: "PROCHAIN DÉPART",
        select_placeholder: "Sélectionner...",
        how_to_ticket: "COMMENT ACHETER UN BILLET",
        show_map: "AFFICHER LA CARTE", hide_map: "MASQUER LA CARTE",
        map_hint: "Touchez les marqueurs pour définir Départ/Arrivée",
        train_cta: "HORAIRES & BILLETS",
        train_desc: "Le train est le moyen le plus rapide. Passages fréquents toutes les 15-20 min.",
        avg_times: "Temps Moyens", between_villages: "Entre Villages", check_site: "Achetez et vérifiez les horaires sur le site officiel",
        welcome_app_name: "5 Terre Guide",
        welcome_desc: "Votre guide essentiel pour explorer les Cinque Terre.",
        map_loaded: "Carte chargée"
    },
    de: {
        loading: "Laden...", error: "Fehler", no_results: "Keine Ergebnisse.",
        home_title: "Willkommen", nav_villages: "Start", nav_food: "Essen", nav_outdoor: "Outdoor", nav_services: "Dienste",
        menu_prod: "Produkte", menu_rest: "Restaurants", menu_trail: "Wanderwege", menu_beach: "Strände", 
        menu_trans: "Transport", menu_num: "Nummern", menu_pharm: "Apotheken", menu_map: "Karten", menu_monu: "Kultur",
        btn_call: "Anrufen", btn_map: "Karte", btn_position: "Standort", btn_website: "Webseite",
        open_site: "Öffnen", take_me_here: "Bring mich hin",
        details_trail: "Wegbeschreibung", distance: "Distanz", duration: "Dauer", level: "Niveau",
        visit_time: "Min Besuch", difficulty: "Schwierigkeit",
        hours_label: "Öffnungszeiten", phone_label: "Telefon", no_hours: "Keine Zeiten verfügbar",
        ideal_for: "Ideal für",
        plan_trip: "Reise planen", departure: "ABFAHRT", arrival: "ANKUNFT", 
        date_trip: "DATUM", time_trip: "ZEIT", find_times: "SUCHEN",
        next_runs: "NÄCHSTE FAHRTEN", next_departure: "NÄCHSTE ABFAHRT",
        select_placeholder: "Wählen...",
        how_to_ticket: "TICKET KAUFEN",
        show_map: "KARTE ANZEIGEN", hide_map: "KARTE AUSBLENDEN",
        map_hint: "Tippen Sie auf Marker für Start/Ziel",
        train_cta: "FAHRPLÄNE & TICKETS",
        train_desc: "Der Zug ist am schnellsten. Häufige Fahrten alle 15-20 Min.",
        avg_times: "Durchschn. Zeit", between_villages: "Zwischen Dörfern", check_site: "Kaufen und prüfen Sie Zeiten auf der offiziellen Seite",
        welcome_app_name: "5 Terre Guide",
        welcome_desc: "Ihr wesentlicher Reiseführer für die Cinque Terre.",
        map_loaded: "Karte geladen"
    },
    es: {
        loading: "Cargando...", error: "Error", no_results: "Sin resultados.",
        home_title: "Bienvenido", nav_villages: "Inicio", nav_food: "Comida", nav_outdoor: "Aire Libre", nav_services: "Servicios",
        menu_prod: "Productos", menu_rest: "Restaurantes", menu_trail: "Senderos", menu_beach: "Playas", 
        menu_trans: "Transporte", menu_num: "Números", menu_pharm: "Farmacias", menu_map: "Mapas", menu_monu: "Cultura",
        btn_call: "Llamar", btn_map: "Mapa", btn_position: "Posición", btn_website: "Sitio Web",
        open_site: "Abrir sitio", take_me_here: "Llévame allí",
        details_trail: "Detalles Ruta", distance: "Distancia", duration: "Duración", level: "Nivel",
        visit_time: "min visita", difficulty: "Dificultad",
        hours_label: "Horario", phone_label: "Teléfono", no_hours: "Horario no disponible",
        ideal_for: "Ideal para",
        plan_trip: "Planificar", departure: "SALIDA", arrival: "LLEGADA", 
        date_trip: "FECHA", time_trip: "HORA", find_times: "BUSCAR",
        next_runs: "PRÓXIMAS SALIDAS", next_departure: "PRÓXIMA SALIDA",
        select_placeholder: "Seleccionar...",
        how_to_ticket: "CÓMO COMPRAR BOLETO",
        show_map: "MOSTRAR MAPA", hide_map: "OCULTAR MAPA",
        map_hint: "Toca marcadores para configurar Salida/Llegada",
        train_cta: "HORARIOS Y BOLETOS",
        train_desc: "El tren es el medio más rápido. Frecuencia cada 15-20 min.",
        avg_times: "Tiempos Promedio", between_villages: "Entre Pueblos", check_site: "Compra y consulta horarios en el sitio oficial",
        welcome_app_name: "5 Terre Guide",
        welcome_desc: "Tu guía esencial para explorar Cinque Terre.",
        map_loaded: "Mapa cargado"
    },
    zh: {
        loading: "加载中...", error: "错误", no_results: "无结果",
        home_title: "欢迎", nav_villages: "首页", nav_food: "食物", nav_outdoor: "户外", nav_services: "服务",
        menu_prod: "产品", menu_rest: "餐厅", menu_trail: "步道", menu_beach: "海滩", 
        menu_trans: "交通", menu_num: "常用号码", menu_pharm: "药房", menu_map: "地图", menu_monu: "文化",
        btn_call: "致电", btn_map: "地图", btn_position: "位置", btn_website: "网站",
        open_site: "打开网站", take_me_here: "带我去",
        details_trail: "路线详情", distance: "距离", duration: "时长", level: "难度",
        visit_time: "参观时间", difficulty: "难度",
        hours_label: "营业时间", phone_label: "电话", no_hours: "时间不可用",
        ideal_for: "适合",
        plan_trip: "行程规划", departure: "出发", arrival: "到达", 
        date_trip: "日期", time_trip: "时间", find_times: "查询时刻",
        next_runs: "后续班次", next_departure: "下一班",
        select_placeholder: "选择...",
        how_to_ticket: "如何购票",
        show_map: "显示地图", hide_map: "隐藏地图",
        map_hint: "点击标记设置出发/到达",
        train_cta: "时刻表和购票",
        train_desc: "火车是最快的方式。每15-20分钟一班。",
        avg_times: "平均时间", between_villages: "村庄之间", check_site: "在官网购买并查看时刻表",
        welcome_app_name: "5 Terre Guide",
        welcome_desc: "探索五渔村的必备指南。",
        map_loaded: "地图已加载"
    }
};

// 5. HELPER FUNCTIONS GLOBALI
window.t = function(key) {
    const langDict = UI_TEXT[window.currentLang] || UI_TEXT['it'];
    return langDict[key] || key; // Fallback sulla chiave stessa se manca
};

window.dbCol = function(item, field) {
    if (!item || !item[field]) return '';

    let value = item[field];

    // Se Supabase restituisce il JSONB già come oggetto
    if (typeof value === 'object' && value !== null) {
        // Cerca la lingua corrente, altrimenti fallback su italiano, altrimenti stringa vuota
        return value[window.currentLang] || value['it'] || '';
    }

    // Se è ancora una stringa (es. vecchi dati o errore di parsing), la restituisce così com'è
    return value;
};

window.getSmartUrl = function(name, folder = '', width = 600) {
    if (!name) return 'https://via.placeholder.com/600x400?text=No+Image';
    const safeName = encodeURIComponent(name.trim()); 
    const folderPath = folder ? `${folder}/` : '';
    return `${CLOUDINARY_BASE_URL}/w_${width},c_fill,f_auto,q_auto:good,fl_progressive/${folderPath}${safeName}`;
};

window.changeLanguage = function(langCode) {
    console.log("Cambio lingua a:", langCode);
    
    // 1. Aggiorna la variabile globale
    window.currentLang = langCode;
    
    // (Opzionale) Salva la scelta nel browser per la prossima volta
    localStorage.setItem('user_lang', langCode);

    // 2. Aggiorna i testi statici dell'interfaccia (Titoli, Bottoni)
    updateStaticInterface();

    // 3. Ricarica la vista corrente (Forza il re-render delle card)
    // Assumo che tu abbia una funzione che renderizza la pagina, es: renderApp() o loadData()
    // Se usi una logica basata su router, ricarica la pagina corrente:
    if (typeof renderCategory === 'function') {
        // Esempio: se sei nella vista attrazioni, ricaricala
        const currentCategory = window.currentCategory || 'attrazioni'; // O la tua variabile di stato
        renderCategory(currentCategory); 
    } else {
        // Fallback brutale se non hai una funzione di render centralizzata
        location.reload(); 
    }
};

// Funzione helper per aggiornare i testi fissi (Menu, Home Title, ecc.)
function updateStaticInterface() {
    // Esempio: Aggiorna il titolo della Home
    const homeTitleEl = document.getElementById('home-title'); 
    if(homeTitleEl) homeTitleEl.textContent = window.t('home_title');

    // Esempio: Aggiorna i bottoni della navbar
    // Suggerimento: Aggiungi id="nav-food" ai tuoi elementi HTML per trovarli facilmente
    const navFood = document.getElementById('nav-food');
    if(navFood) navFood.textContent = window.t('nav_food');
    
    // Aggiorna tutti gli elementi che usano window.t() al volo se necessario
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
// 6. MOTORE DI RICERCA BUS (Cervello)
// =========================================================
window.eseguiRicercaBus = async function() {
    // 1. Lettura dati
    const selPartenza = document.getElementById('selPartenza');
    const selArrivo = document.getElementById('selArrivo');
    const selData = document.getElementById('selData');
    const selOra = document.getElementById('selOra');

    if (!selPartenza || !selArrivo || !selData || !selOra) {
        console.error("Elementi DOM non trovati. Sei sicuro che il modale sia aperto?");
        return;
    }

    const partenzaId = parseInt(selPartenza.value);
    const arrivoId = parseInt(selArrivo.value);
    const dataScelta = selData.value;
    const oraScelta = selOra.value;

    // Riferimenti UI
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

    // === 3. NUOVO CODICE PER AUTOSCROLL ===
    setTimeout(() => {
        resultsContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' // Cerca di mettere l'inizio del box in alto
        });
    }, 150); // Ritardo leggero per permettere al browser di disegnare il box
};