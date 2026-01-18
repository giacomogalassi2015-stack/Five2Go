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
        loading: "Caricamento...", error: "Errore",
        home_title: "5 Terre", food_title: "Cibo & Sapori", outdoor_title: "Outdoor", services_title: "Servizi", maps_title: "Mappe & Cultura",
        nav_villages: "Borghi", nav_food: "Cibo", nav_outdoor: "Outdoor", nav_services: "Servizi",
        menu_prod: "Prodotti", menu_rest: "Ristoranti", menu_trail: "Sentieri", menu_beach: "Spiagge", menu_trans: "Trasporti", menu_num: "Numeri Utili", menu_pharm: "Farmacie", menu_map: "Mappe", menu_monu: "Attrazioni",
        btn_call: "Chiama", btn_map: "Mappa", btn_info: "Info", btn_website: "Sito Web", btn_hours: "Orari", btn_toll: "Pedaggio", btn_position: "Posizione",
        ideal_for: "Ideale per", no_results: "Nessun risultato.", visit_time: "min", curiosity: "Curiosità", coverage: "Copertura", pharmacy_tag: "FARMACIA",
        map_loaded: "Mappa caricata"
    },
    en: {
        loading: "Loading...", error: "Error",
        home_title: "5 Lands", food_title: "Food & Flavors", outdoor_title: "Outdoor", services_title: "Services", maps_title: "Maps & Culture",
        nav_villages: "Villages", nav_food: "Food", nav_outdoor: "Outdoor", nav_services: "Services",
        menu_prod: "Products", menu_rest: "Restaurants", menu_trail: "Trails", menu_beach: "Beaches", menu_trans: "Transport", menu_num: "Useful Numbers", menu_pharm: "Pharmacies", menu_map: "Maps", menu_monu: "Attractions",
        btn_call: "Call", btn_map: "Map", btn_info: "Info", btn_website: "Website", btn_hours: "Hours", btn_toll: "Toll", btn_position: "Location",
        ideal_for: "Best for", no_results: "No results found.", visit_time: "min", curiosity: "Curiosity", coverage: "Coverage", pharmacy_tag: "PHARMACY",
        map_loaded: "Map loaded"
    },
    es: {
        loading: "Cargando...", error: "Error",
        home_title: "5 Tierras", food_title: "Comida y Sabores", outdoor_title: "Aire Libre", services_title: "Servicios", maps_title: "Mapas y Cultura",
        nav_villages: "Pueblos", nav_food: "Comida", nav_outdoor: "Aire Libre", nav_services: "Servicios",
        menu_prod: "Productos", menu_rest: "Restaurantes", menu_trail: "Senderos", menu_beach: "Playas", menu_trans: "Transporte", menu_num: "Números", menu_pharm: "Farmacias", menu_map: "Mapas", menu_monu: "Atracciones",
        btn_call: "Llamar", btn_map: "Mapa", btn_info: "Info", btn_website: "Sitio Web", btn_hours: "Horario", btn_toll: "Peaje", btn_position: "Posición",
        ideal_for: "Ideal para", no_results: "Sin resultados.", visit_time: "min", curiosity: "Curiosidad", coverage: "Cobertura", pharmacy_tag: "FARMACIA",
        map_loaded: "Mapa cargado"
    },
    fr: {
        loading: "Chargement...", error: "Erreur",
        home_title: "5 Terres", food_title: "Gastronomie", outdoor_title: "Plein Air", services_title: "Services", maps_title: "Cartes & Culture",
        nav_villages: "Villages", nav_food: "Nourriture", nav_outdoor: "Plein Air", nav_services: "Services",
        menu_prod: "Produits", menu_rest: "Restaurants", menu_trail: "Sentiers", menu_beach: "Plages", menu_trans: "Transport", menu_num: "Numéros", menu_pharm: "Pharmacies", menu_map: "Cartes", menu_monu: "Attractions",
        btn_call: "Appeler", btn_map: "Carte", btn_info: "Info", btn_website: "Site Web", btn_hours: "Horaires", btn_toll: "Péage", btn_position: "Position",
        ideal_for: "Idéal pour", no_results: "Aucun résultat.", visit_time: "min", curiosity: "Curiosité", coverage: "Couverture", pharmacy_tag: "PHARMACIE",
        map_loaded: "Carte chargée"
    },
    de: {
        loading: "Laden...", error: "Fehler",
        home_title: "5 Länder", food_title: "Essen & Genuss", outdoor_title: "Outdoor", services_title: "Dienste", maps_title: "Karten & Kultur",
        nav_villages: "Dörfer", nav_food: "Essen", nav_outdoor: "Outdoor", nav_services: "Dienste",
        menu_prod: "Produkte", menu_rest: "Restaurants", menu_trail: "Wanderwege", menu_beach: "Strände", menu_trans: "Transport", menu_num: "Nummern", menu_pharm: "Apotheken", menu_map: "Karten", menu_monu: "Attraktionen",
        btn_call: "Anrufen", btn_map: "Karte", btn_info: "Info", btn_website: "Webseite", btn_hours: "Öffnungszeiten", btn_toll: "Maut", btn_position: "Standort",
        ideal_for: "Ideal für", no_results: "Keine Ergebnisse.", visit_time: "min", curiosity: "Kuriosität", coverage: "Abdeckung", pharmacy_tag: "APOTHEKE",
        map_loaded: "Karte geladen"
    },
    zh: {
        loading: "加载中...", error: "错误",
        home_title: "五渔村", food_title: "美食与风味", outdoor_title: "户外", services_title: "服务", maps_title: "地图与文化",
        nav_villages: "村庄", nav_food: "食物", nav_outdoor: "户外", nav_services: "服务",
        menu_prod: "产品", menu_rest: "餐厅", menu_trail: "步道", menu_beach: "海滩", menu_trans: "交通", menu_num: "常用号码", menu_pharm: "药房", menu_map: "地图", menu_monu: "景点",
        btn_call: "致电", btn_map: "地图", btn_info: "信息", btn_website: "网站", btn_hours: "时间", btn_toll: "通行费", btn_position: "位置",
        ideal_for: "适合", no_results: "无结果", visit_time: "分", curiosity: "趣闻", coverage: "覆盖范围", pharmacy_tag: "药房",
        map_loaded: "地图已加载"
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

    // Calcolo Festivo
    const dateObj = new Date(dataScelta);
    const isFestivo = (dateObj.getDay() === 0); // 0 = Domenica

    // DEBUG: Stampiamo cosa mandiamo a Supabase
    console.log("🚀 INVIO A SUPABASE:", {
        p_partenza_id: partenzaId,
        p_arrivo_id: arrivoId,
        p_orario_min: oraScelta,
        p_is_festivo: isFestivo
    });

    // 2. Chiamata RPC
    const { data, error } = await window.supabaseClient.rpc('trova_bus', { 
        p_partenza_id: partenzaId, 
        p_arrivo_id: arrivoId, 
        p_orario_min: oraScelta, 
        p_is_festivo: isFestivo 
    });

    // Gestione Errori
    if (error) { 
        console.error("❌ ERRORE SQL:", error);
        nextCard.innerHTML = `<div style="color:red; text-align:center;">Errore: ${error.message}<br><small>Controlla la console per dettagli</small></div>`; 
        return; 
    }

    console.log("✅ RISPOSTA SUPABASE:", data);

    // 3. Risultati vuoti
    if (!data || data.length === 0) { 
        nextCard.innerHTML = `
            <div style="text-align:center; padding:15px; color:#c62828;">
                <span class="material-icons">event_busy</span><br>
                <strong>Nessuna corsa trovata</strong><br>
                <small>Prova a cambiare orario.</small>
            </div>`; 
        return; 
    }

    // 4. Mostra Risultati
    const primo = data[0];
    // Tronca i secondi se presenti (es. 10:00:00 -> 10:00)
    const pOra = primo.ora_partenza.slice(0,5);
    const aOra = primo.ora_arrivo.slice(0,5);

    nextCard.innerHTML = `
        <div style="font-size:0.75rem; color:#555; text-transform:uppercase; font-weight:bold;">PROSSIMA PARTENZA</div>
        <div class="bus-time-big">${pOra}</div>
        <div style="font-size:1rem; color:#333;">Arrivo: <strong>${aOra}</strong></div>
        <div style="font-size:0.8rem; color:#777; margin-top:5px;">${primo.nome_linea}</div>
    `;

    const successivi = data.slice(1);
    list.innerHTML = successivi.map(b => `
        <div class="bus-list-item">
            <span style="font-weight:bold; color:#333;">${b.ora_partenza.slice(0,5)}</span>
            <span style="color:#666;">➜ ${b.ora_arrivo.slice(0,5)}</span>
        </div>
    `).join('');
};

// ============================================================
// UI RENDERERS - Gestisce solo la creazione dell'HTML e Grafica
// ============================================================

window.uiRenderers = {

    // --- RENDERER TRASPORTI (Async perché scarica le fermate) ---
    renderTransport: async function(item) {
        if (!item) return '<p class="error-msg">Errore dati trasporto</p>';

        const nome = window.dbCol(item, 'Nome') || window.dbCol(item, 'Località') || window.dbCol(item, 'Mezzo') || 'Trasporto';
        const desc = window.dbCol(item, 'Descrizione') || '';

        // Recupero info biglietti
        const infoSms = window.dbCol(item, 'Info_SMS');
        const infoApp = window.dbCol(item, 'Info_App');
        const infoAvvisi = window.dbCol(item, 'Info_Avvisi');
        const hasTicketInfo = infoSms || infoApp || infoAvvisi;

        // Check se è Bus
        const isBus = nome.toLowerCase().includes('bus') || nome.toLowerCase().includes('autobus') || nome.toLowerCase().includes('atc');

        let customContent = '';

        if (isBus) {
            // === LOGICA BUS ===
            // Nota: Scarichiamo le fermate qui per mantenere la logica che avevi. 
            // In futuro potrai spostare questa chiamata in data-logic.js
            const { data: fermate, error } = await window.supabaseClient
                .from('Fermate_bus')
                .select('ID, NOME_FERMATA, LAT, LONG')
                .order('NOME_FERMATA', { ascending: true });

            if (fermate && !error) {
                const now = new Date();
                const todayISO = now.toISOString().split('T')[0];
                const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                const options = fermate.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');

                // Sezione Biglietti
                let ticketSection = '';
                if (hasTicketInfo) {
                    ticketSection = `
                    <button onclick="toggleTicketInfo()" style="width:100%; margin-bottom:15px; background:#e0f7fa; color:#006064; border:1px solid #b2ebf2; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                        🎟️ COME ACQUISTARE IL BIGLIETTO ▾
                    </button>
                    <div id="ticket-info-box" style="display:none; background:#fff; padding:15px; border-radius:8px; border:1px solid #eee; margin-bottom:15px; font-size:0.9rem; color:#333; line-height:1.5;">
                        ${infoSms ? `<p style="margin-bottom:10px;"><strong>📱 SMS</strong><br>${infoSms}</p>` : ''}
                        ${infoSms && infoApp ? `<hr style="border:0; border-top:1px solid #eee; margin:10px 0;">` : ''}
                        ${infoApp ? `<p style="margin-bottom:10px;"><strong>📲 APP</strong><br>${infoApp}</p>` : ''}
                        ${infoAvvisi ? `<div style="background:#fff3cd; color:#856404; padding:10px; border-radius:6px; font-size:0.85rem; border:1px solid #ffeeba; margin-top:10px;"><strong>⚠️ ATTENZIONE:</strong> ${infoAvvisi}</div>` : ''}
                    </div>`;
                }

                // HTML BUS (Mappa + Box Ricerca)
                customContent = `
                <div class="bus-search-box animate-fade">
                    <div class="bus-title"><span class="material-icons">directions_bus</span> Pianifica Viaggio</div>
                    
                    <div id="bus-map" style="height: 280px; width: 100%; border-radius: 12px; margin-bottom: 20px; z-index: 1;"></div>
                    
                    ${ticketSection}

                    <div class="bus-inputs">
                        <div style="flex:1;">
                            <label style="font-size:0.7rem; color:#666; font-weight:bold;">PARTENZA</label>
                            <select id="selPartenza" class="bus-select"><option value="" disabled selected>Seleziona...</option>${options}</select>
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.7rem; color:#666; font-weight:bold;">ARRIVO</label>
                            <select id="selArrivo" class="bus-select"><option value="" disabled selected>Seleziona...</option>${options}</select>
                        </div>
                    </div>

                    <div class="bus-inputs">
                        <div style="flex:1;">
                            <label style="font-size:0.7rem; color:#666; font-weight:bold;">DATA VIAGGIO</label>
                            <input type="date" id="selData" class="bus-select" value="${todayISO}">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.7rem; color:#666; font-weight:bold;">ORARIO</label>
                            <input type="time" id="selOra" class="bus-select" value="${nowTime}">
                        </div>
                    </div>

                    <button onclick="eseguiRicercaBus()" class="btn-yellow" style="width:100%; font-weight:bold; margin-top:5px;">TROVA ORARI</button>
                    
                    <div id="busResultsContainer" style="display:none; margin-top:20px;">
                        <div id="nextBusCard" class="bus-result-main"></div>
                        <div style="font-size:0.8rem; font-weight:bold; color:#666; margin-top:15px;">CORSE SUCCESSIVE:</div>
                        <div id="otherBusList" class="bus-list-container"></div>
                    </div>
                </div>`;

                // Avvia la mappa dopo un breve timeout
                setTimeout(() => { window.initBusMap(fermate); }, 300);

                // *** RITORNO SOLO CONTENT (Senza Titolo/Descrizione sopra) ***
                return customContent;

            } else {
                return `<p style="color:red;">Errore caricamento fermate.</p>`;
            }

        } else {
            // === LOGICA NON BUS (Treni, Traghetti) ===
            if (hasTicketInfo) {
                customContent = `
                 <button onclick="toggleTicketInfo()" style="width:100%; margin-top:15px; background:#e0f7fa; color:#006064; border:1px solid #b2ebf2; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;">
                    🎟️ INFO BIGLIETTI
                 </button>
                 <div id="ticket-info-box" style="display:none; background:#fff; padding:15px; border-radius:8px; border:1px solid #eee; margin-top:10px;">
                    ${infoSms ? `<p><strong>SMS:</strong> ${infoSms}</p>` : ''}
                    ${infoApp ? `<p><strong>APP:</strong> ${infoApp}</p>` : ''}
                    ${infoAvvisi ? `<p style="color:#856404; background:#fff3cd; padding:5px;">${infoAvvisi}</p>` : ''}
                 </div>`;
            } else {
                customContent = `<div style="text-align:center; padding:30px; background:#f9f9f9; border-radius:12px; margin-top:20px; color:#999;">Funzione in arrivo</div>`;
            }

            // *** RITORNO STANDARD (Con Titolo e Descrizione) ***
            return `<h2>${nome}</h2><p style="color:#666;">${desc}</p>${customContent}`;
        }
    },

    // --- ALTRI RENDERERS (Copiati dalla logica originale) ---
    
    renderVillage: async function(paeseName) {
        const bigImg = window.getSmartUrl(paeseName, '', 1000);
        const { data } = await window.supabaseClient.from('Cinque_Terre').select('*').eq('Paesi', paeseName).single();
        const desc = data ? window.dbCol(data, 'Descrizione') : window.t('loading');
        return `<img src="${bigImg}" style="width:100%; border-radius:12px; height:220px; object-fit:cover;"><h2>${paeseName}</h2><p>${desc}</p>`;
    },

    renderProduct: function(payload) {
        const nome = window.dbCol(payload, 'Prodotti') || window.dbCol(payload, 'Nome');
        const desc = window.dbCol(payload, 'Descrizione');
        const ideale = window.dbCol(payload, 'Ideale per');
        const bigImg = window.getSmartUrl(payload.Prodotti || payload.Nome, 'Prodotti', 800);
        return `<img src="${bigImg}" style="width:100%; border-radius:12px; height:200px; object-fit:cover;" onerror="this.style.display='none'"><h2>${nome}</h2><p>${desc || ''}</p><hr><p><strong>${window.t('ideal_for')}:</strong> ${ideale || ''}</p>`;
    },

    renderTrail: function(payload) {
        const titolo = window.dbCol(payload, 'Paesi');
        const dist = payload.Distanza || '--';
        const dura = payload.Durata || '--';
        const desc = window.dbCol(payload, 'Descrizione') || '';
        return `<div style="padding:20px;"><h2 style="text-align:center;">${titolo}</h2><div style="display:flex; justify-content:space-between; margin:20px 0;"><div><strong>Distanza</strong><br>${dist}</div><div><strong>Tempo</strong><br>${dura}</div></div><p>${desc}</p></div>`;
    },
    
    renderRestaurant: function(item) {
        const nome = window.dbCol(item, 'Nome');
        const desc = window.dbCol(item, 'Descrizione') || '';
        const orari = item.Orari || 'Orari non disponibili';
        const telefono = item.Telefono || '';
        const web = item.SitoWeb || '';
        return `
            <h2>${nome}</h2>
            <div style="margin-bottom:15px; color:#666;">📍 ${window.dbCol(item, 'Paesi')} • ${item.Indirizzo || ''}</div>
            <p>${desc}</p>
            <hr style="margin:15px 0; border:0; border-top:1px solid #eee;">
            <div style="display:flex; flex-direction:column; gap:10px;">
                <div><strong>🕒 Orari:</strong><br>${orari}</div>
                ${telefono ? `<div><strong>📞 Telefono:</strong> <a href="tel:${telefono}">${telefono}</a></div>` : ''}
                ${web ? `<div><strong>🌐 Sito Web:</strong> <a href="${web}" target="_blank">Apri sito</a></div>` : ''}
            </div>
            <div style="margin-top:20px; text-align:center;">
                <a href="http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(nome + ' ' + window.dbCol(item, 'Paesi'))}" target="_blank" class="btn-azure" style="display:inline-block; text-decoration:none; padding:10px 20px; border-radius:20px;">Portami qui 🗺️</a>
            </div>`;
    },

    renderFarmacia: function(item) {
        return `<h2>${item.Nome}</h2><p>📍 ${item.Indirizzo}, ${item.Paesi}</p><p>📞 <a href="tel:${item.Numero}">${item.Numero}</a></p>`;
    },

    renderAttrazione: function(item) {
        const titolo = window.dbCol(item, 'Attrazioni');
        const paese = window.dbCol(item, 'Paese');
        return `<h2>${titolo}</h2><p>📍 ${paese}</p><p>${window.dbCol(item, 'Descrizione')}</p>`;
    }
};

// --- FUNZIONE CHE CREA LA MAPPA BUS ---
window.initBusMap = function(fermate) {
    // Coordinate centrali (Cinque Terre indicative)
    const startLat = 44.12; 
    const startLong = 9.70;
    
    // Controlla se esiste il div e se la mappa non è già inizializzata
    const mapContainer = document.getElementById('bus-map');
    if (!mapContainer) return;

    // Crea la mappa
    const map = L.map('bus-map').setView([startLat, startLong], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18
    }).addTo(map);

    // Gruppo per adattare lo zoom ai marker
    const markersGroup = new L.FeatureGroup();

    fermate.forEach(f => {
        // Salta se mancano coordinate
        if (!f.LAT || !f.LONG) return;

        // Crea icona personalizzata (opzionale, qui standard)
        const marker = L.marker([f.LAT, f.LONG]).addTo(map);
        
        // Contenuto del Popup con i due bottoni
        const popupContent = `
            <div style="text-align:center; min-width:150px;">
                <h3 style="margin:0 0 10px 0; font-size:1rem;">${f.NOME_FERMATA}</h3>
                <div style="display:flex; gap:5px; justify-content:center;">
                    <button onclick="setBusStop('selPartenza', '${f.ID}')" 
                            style="background:#4CAF50; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">
                        Partenza
                    </button>
                    <button onclick="setBusStop('selArrivo', '${f.ID}')" 
                            style="background:#F44336; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">
                        Arrivo
                    </button>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        markersGroup.addLayer(marker);
    });

    map.addLayer(markersGroup);
    
    // Adatta lo zoom per vedere tutte le fermate
    if (markersGroup.getLayers().length > 0) {
        map.fitBounds(markersGroup.getBounds(), { padding: [30, 30] });
    }
    
    // Fix rendering Leaflet dentro modali
    setTimeout(() => { map.invalidateSize(); }, 200);
};

// --- FUNZIONE CHE IMPOSTA LA SELECT QUANDO CLICCHI SULLA MAPPA ---
window.setBusStop = function(selectId, value) {
    const select = document.getElementById(selectId);
    if (select) {
        select.value = value;
        // Effetto visivo di conferma
        select.style.backgroundColor = "#fff3cd"; 
        setTimeout(() => select.style.backgroundColor = "white", 500);
    }
};