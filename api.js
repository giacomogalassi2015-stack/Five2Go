/* api.js - Logica Backend e Bus/Traghetti */

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { t, isItalianHoliday, escapeHTML } from './utils.js';

// Inizializza Supabase
export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Cache Variabili
let busStopsCache = null;

// --- BUS LOGIC ---

export const loadAllStops = async (selPartenza) => {
    if (!selPartenza) return;
    
    if (busStopsCache) {
        populateStartSelect(busStopsCache, selPartenza);
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('Fermate_bus') 
            .select('ID, NOME_FERMATA')
            .order('NOME_FERMATA');
            
        if (error) throw error;
        
        const mappedData = data.map(stop => ({
            id: stop.ID,
            nome: stop.NOME_FERMATA
        }));
        
        busStopsCache = mappedData;
        populateStartSelect(mappedData, selPartenza);
        
    } catch (err) {
        console.error("Errore caricamento fermate:", err);
        selPartenza.innerHTML = `<option>Errore caricamento</option>`;
    }
};

function populateStartSelect(data, selectEl) {
    const options = data.map(stop => `<option value="${stop.id}">${escapeHTML(stop.nome)}</option>`).join('');
    selectEl.innerHTML = `<option value="" disabled selected>${t('select_placeholder')}</option>` + options;
    selectEl.disabled = false;
}

export const filterDestinations = (startId) => {
    const selArrivo = document.getElementById('selArrivo');
    const btnSearch = document.getElementById('btnSearchBus');
    
    if (!selArrivo) return;
    
    selArrivo.innerHTML = `<option value="" disabled selected>${t('select_placeholder')}</option>`;
    selArrivo.disabled = true;

    if (btnSearch) {
        btnSearch.style.opacity = '0.5';
        btnSearch.style.pointerEvents = 'none';
    }

    try {
        const stops = busStopsCache || [];
        const validDestinations = stops.filter(s => String(s.id) !== String(startId));
        
        const options = validDestinations.map(stop => `<option value="${stop.id}">${escapeHTML(stop.nome)}</option>`).join('');
        selArrivo.insertAdjacentHTML('beforeend', options);
        
        if (validDestinations.length > 0) {
            selArrivo.disabled = false;
        }
        
        // La logica di enable search on change è gestita globalmente nel delegator in main.js

    } catch (err) {
        console.error(err);
        selArrivo.innerHTML = `<option>Errore</option>`;
    }
};

export const eseguiRicercaBus = async () => {
    const selPartenza = document.getElementById('selPartenza');
    const selArrivo = document.getElementById('selArrivo');
    const selData = document.getElementById('selData');
    const selOra = document.getElementById('selOra');
    const resultsContainer = document.getElementById('busResultsContainer');
    const nextCard = document.getElementById('nextBusCard');
    const list = document.getElementById('otherBusList');

    if (!selPartenza || !selArrivo || !selData || !selOra) return;

    const partenzaId = parseInt(selPartenza.value);
    const arrivoId = parseInt(selArrivo.value);
    const dataScelta = selData.value;
    const oraScelta = selOra.value;

    if (!partenzaId || !arrivoId) return;
    if (partenzaId === arrivoId) { alert("Partenza e arrivo coincidono!"); return; }

    resultsContainer.classList.remove('d-none');
    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `
        <div style="text-align:center; padding:20px;">
            Cercando... <span class="material-icons spin">sync</span>
        </div>`;
    list.innerHTML = '';

    const dateObj = new Date(dataScelta);
    const isFestivo = isItalianHoliday(dateObj);

    const { data, error } = await supabaseClient.rpc('trova_bus', { 
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

    if (!data || data.length === 0) { 
        nextCard.innerHTML = `
        <div style="text-align:center; padding:15px; color:#c62828;">
            <span class="material-icons">event_busy</span><br>
            <strong>${t('bus_not_found')}</strong><br>
            <small>${t('bus_try_change')}</small>
        </div>`;
        return; 
    }

    const primo = data[0];
    const pOra = primo.ora_partenza.slice(0,5);
    const aOra = primo.ora_arrivo.slice(0,5);
    const badgeClass = isFestivo ? 'badge-holiday' : 'badge-weekday';
    const badgeText = isFestivo ? t('badge_holiday') : t('badge_weekday');

    nextCard.innerHTML = `
        <div style="display:flex; justifyContent:space-between; alignItems:center;">
            <div style="fontSize:0.75rem; color:#e0f7fa; textTransform:uppercase; fontWeight:bold;">${t('next_departure')}</div>
            <span class="${badgeClass}">${badgeText}</span>
        </div>
        <div class="bus-time-big">${pOra}</div>
        <div style="fontSize:1rem; color:#fff;">
            ${t('arrival')}: <strong>${aOra}</strong>
        </div>
        <div style="fontSize:0.8rem; color:#b2ebf2; marginTop:5px;">${primo.nome_linea || 'Linea Bus'}</div>
    `;

    const successivi = data.slice(1);
    
    if (successivi.length > 0) {
        list.innerHTML = successivi.map(b => `
            <div class="bus-list-item">
                <span style="fontWeight:bold; color:#333;">${b.ora_partenza.slice(0,5)}</span>
                <span style="color:#666;">➜ ${b.ora_arrivo.slice(0,5)}</span>
            </div>
        `).join('');
    } else {
        list.innerHTML = `<div style="padding:10px; color:#999; fontSize:0.9rem;">Nessun'altra corsa oggi.</div>`;
    }
};

// --- FERRY LOGIC ---

export const initFerrySearch = async () => {
    const selPartenza = document.getElementById('selPartenzaFerry');
    if (!selPartenza) return;

    const ferryPorts = [
        { id: 101, nome: 'La Spezia' },
        { id: 102, nome: 'Portovenere' },
        { id: 103, nome: 'Riomaggiore' },
        { id: 104, nome: 'Manarola' },
        { id: 105, nome: 'Corniglia' }, 
        { id: 106, nome: 'Vernazza' },
        { id: 107, nome: 'Monterosso' },
        { id: 108, nome: 'Levanto' }
    ];

    populateStartSelect(ferryPorts, selPartenza);
    // Onchange gestito via delegator
};

export const updateFerryDestinations = (startId) => {
    const selArrivo = document.getElementById('selArrivoFerry');
    const selPartenza = document.getElementById('selPartenzaFerry');
    
    // Logica duplicata ma adattata per i traghetti
    const ferryPorts = [
        { id: 101, nome: 'La Spezia' },
        { id: 102, nome: 'Portovenere' },
        { id: 103, nome: 'Riomaggiore' },
        { id: 104, nome: 'Manarola' },
        { id: 105, nome: 'Corniglia' }, 
        { id: 106, nome: 'Vernazza' },
        { id: 107, nome: 'Monterosso' },
        { id: 108, nome: 'Levanto' }
    ];

    const valid = ferryPorts.filter(p => String(p.id) !== startId);
    const options = valid.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    
    selArrivo.innerHTML = `<option value="" disabled selected>${t('select_placeholder')}</option>` + options;
    selArrivo.disabled = false;
};

export const eseguiRicercaTraghetto = async () => {
    const selPartenza = document.getElementById('selPartenzaFerry');
    const selArrivo = document.getElementById('selArrivoFerry');
    const selOra = document.getElementById('selOraFerry');
    const resultsContainer = document.getElementById('ferryResultsContainer');
    const nextCard = document.getElementById('nextFerryCard');
    const list = document.getElementById('otherFerryList');

    if (!selPartenza || !selArrivo) return;
    
    resultsContainer.classList.remove('d-none');
    resultsContainer.style.display = 'block';
    
    nextCard.innerHTML = `
        <div style="padding:20px; textAlign:center; color:white;">
            Ricerca Battelli... <span class="material-icons spin">sync</span>
        </div>`;
    list.innerHTML = '';

    const ora = selOra.value;
    
    setTimeout(() => {
        const mockData = [
            { ora_partenza: "10:00:00", ora_arrivo: "10:30:00", linea: "Linea 01 - Golfo" },
            { ora_partenza: "11:00:00", ora_arrivo: "11:30:00", linea: "Linea 01 - Golfo" },
            { ora_partenza: "14:00:00", ora_arrivo: "14:30:00", linea: "Linea 02 - Express" }
        ].filter(c => c.ora_partenza >= ora);

        if (mockData.length === 0) {
            nextCard.innerHTML = `<div style="textAlign:center; padding:15px; color:white;">${t('bus_not_found')}</div>`;
            return;
        }

        const primo = mockData[0];
        nextCard.innerHTML = `
            <div style="fontSize:0.75rem; color:#e1f5fe; textTransform:uppercase; fontWeight:bold;">${t('next_departure')}</div>
            <div class="bus-time-big">${primo.ora_partenza.slice(0,5)}</div>
            <div style="fontSize:1rem; color:#fff;">${t('arrival')}: ${primo.ora_arrivo.slice(0,5)}</div>
            <div style="fontSize:0.8rem; color:#b3e5fc; marginTop:5px;">Navigazione Golfo dei Poeti</div>
        `;

        list.innerHTML = mockData.slice(1).map(b => `
            <div class="bus-list-item">
                <span style="fontWeight:bold; color:#333;">${b.ora_partenza.slice(0,5)}</span>
                <span style="color:#666;">➜ ${b.ora_arrivo.slice(0,5)}</span>
            </div>
        `).join('');

    }, 800);
};