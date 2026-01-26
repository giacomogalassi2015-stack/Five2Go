import { supabaseClient } from './supabaseClient.js';
import { t, isItalianHoliday } from '../utils.js';
import { state } from './state.js';
import { initBusMap } from './mapLogic.js';
import { FERRY_STOPS } from './config.js';

// 1. CARICAMENTO INIZIALE (Fermate e Mappa)
export async function loadAllStops() {
    const selPart = document.getElementById('selPartenza');
    if(!selPart) return;

    if (!state.cachedStops) {
        const { data, error } = await supabaseClient
            .from('Fermate_bus')
            .select('ID, NOME_FERMATA, LAT, LONG') 
            .order('NOME_FERMATA', { ascending: true });
        
        if (error) { console.error("Errore fermate:", error); return; }
        state.cachedStops = data;
    }

    const options = state.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
    selPart.innerHTML = `<option value="" disabled selected>${t('select_placeholder')}</option>` + options;

    // Inizializza mappa (importata da mapLogic)
    initBusMap(state.cachedStops);
}

// 2. FILTRO DESTINAZIONI
export async function filterDestinations(startId) {
    const selArr = document.getElementById('selArrivo');
    const btnSearch = document.getElementById('btnSearchBus');
    
    if(!startId || !selArr) return;

    selArr.innerHTML = `<option>${t('bus_searching')}</option>`;
    selArr.disabled = true;
    btnSearch.style.opacity = '0.5';
    btnSearch.style.pointerEvents = 'none';

    try {
        const { data: corsePassanti } = await supabaseClient
            .from('Orari_bus')
            .select('ID_CORSA')
            .eq('ID_FERMATA', startId);
        
        const runIds = corsePassanti.map(c => c.ID_CORSA);
        
        if (runIds.length === 0) {
            selArr.innerHTML = `<option disabled>${t('bus_no_conn')}</option>`;
            return;
        }

        const { data: fermateCollegate } = await supabaseClient
            .from('Orari_bus')
            .select('ID_FERMATA')
            .in('ID_CORSA', runIds);

        const destIds = [...new Set(fermateCollegate.map(x => x.ID_FERMATA))].filter(id => id != startId);

        let validDestinations = [];
        if (state.cachedStops) {
            validDestinations = state.cachedStops.filter(s => destIds.includes(s.ID));
        }

        if (validDestinations.length > 0) {
            validDestinations.sort((a, b) => a.NOME_FERMATA.localeCompare(b.NOME_FERMATA));
            selArr.innerHTML = `<option value="" disabled selected>${t('select_placeholder')}</option>` + 
                               validDestinations.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
            selArr.disabled = false;
            btnSearch.style.opacity = '1';
            btnSearch.style.pointerEvents = 'auto';
        } else {
            selArr.innerHTML = `<option disabled>${t('bus_no_dest')}</option>`;
        }
    } catch (err) {
        console.error(err);
        selArr.innerHTML = `<option>${t('error')}</option>`;
    }
}

// 3. ESECUZIONE RICERCA ORARI BUS
export async function eseguiRicercaBus() {
    const selPartenza = document.getElementById('selPartenza');
    const selArrivo = document.getElementById('selArrivo');
    const selData = document.getElementById('selData');
    const selOra = document.getElementById('selOra');
    const nextCard = document.getElementById('nextBusCard');
    const list = document.getElementById('otherBusList');
    const resultsContainer = document.getElementById('busResultsContainer');

    if (!selPartenza || !selArrivo || !selData || !selOra) return;

    const partenzaId = parseInt(selPartenza.value);
    const arrivoId = parseInt(selArrivo.value);
    const dataScelta = selData.value;
    const oraScelta = selOra.value;

    if (!partenzaId || !arrivoId) return;

    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div style="text-align:center; padding:20px;">${t('loading')} <span class="material-icons spin">sync</span></div>`;
    list.innerHTML = '';

    const parts = dataScelta.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const isFestivo = isItalianHoliday(dateObj);

    const dayTypeLabel = isFestivo 
        ? `<span class="badge-holiday">${t('badge_holiday')}</span>` 
        : `<span class="badge-weekday">${t('badge_weekday')}</span>`;

    const { data, error } = await supabaseClient.rpc('trova_bus', { 
        p_partenza_id: partenzaId, 
        p_arrivo_id: arrivoId, 
        p_orario_min: oraScelta, 
        p_is_festivo: isFestivo 
    });

    if (error || !data || data.length === 0) { 
        nextCard.innerHTML = `
            <div style="text-align:center; padding:15px; color:#c62828;">
                <span class="material-icons">event_busy</span><br>
                <strong>${t('bus_not_found')}</strong><br>
                <div style="margin-top:5px;">${dayTypeLabel}</div>
                <small style="display:block; margin-top:5px;">${t('bus_try_change')}</small>
            </div>`; 
        return; 
    }

    const primo = data[0];
    nextCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <span style="font-size:0.75rem; color:#e0f7fa; text-transform:uppercase; font-weight:bold;">${t('next_departure')}</span>
            ${dayTypeLabel}
        </div>
        <div class="bus-time-big">${primo.ora_partenza.slice(0,5)}</div>
        <div style="font-size:1rem; color:#e0f7fa;">${t('arrival')}: <strong>${primo.ora_arrivo.slice(0,5)}</strong></div>
        <div style="font-size:0.8rem; color:#b2ebf2; margin-top:5px;">${primo.nome_linea || 'Linea ATC'}</div>
    `;

    const successivi = data.slice(1);
    list.innerHTML = successivi.map(b => `
        <div class="bus-list-item">
            <span style="font-weight:bold; color:#333;">${b.ora_partenza.slice(0,5)}</span>
            <span style="color:#666;">➜ ${b.ora_arrivo.slice(0,5)}</span>
        </div>
    `).join('');
    
    setTimeout(() => { resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
}

// 4. TRAGHETTI
export function initFerrySearch() {
    const selPart = document.getElementById('selPartenzaFerry');
    const selArr = document.getElementById('selArrivoFerry');
    if (!selPart || !selArr) return;

    selPart.innerHTML = `<option value="" disabled selected>${t('select_placeholder')}</option>` + 
        FERRY_STOPS.map(s => `<option value="${s.id}">${s.label}</option>`).join('');

    selPart.addEventListener('change', function() {
        const startVal = this.value;
        const destOpts = FERRY_STOPS.filter(s => s.id !== startVal);
        selArr.innerHTML = `<option value="" disabled selected>${t('select_placeholder')}</option>` + 
            destOpts.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
        selArr.disabled = false;
    });
}

export async function eseguiRicercaTraghetto() {
    const selPart = document.getElementById('selPartenzaFerry');
    const selArr = document.getElementById('selArrivoFerry');
    const selOra = document.getElementById('selOraFerry');
    const resultsContainer = document.getElementById('ferryResultsContainer');
    const nextCard = document.getElementById('nextFerryCard');
    const list = document.getElementById('otherFerryList');

    if (!selPart.value || !selArr.value || !selOra.value) return;

    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div style="text-align:center; padding:20px;">${t('loading')} <span class="material-icons spin">sync</span></div>`;
    list.innerHTML = '';

    const startCol = selPart.value; 
    const endCol = selArr.value;    
    const timeFilter = selOra.value; 

    const { data, error } = await supabaseClient
        .from('Orari_traghetti')
        .select(`id, direzione, validita, "${startCol}", "${endCol}"`); 

    if (error || !data) {
        nextCard.innerHTML = `<p style="padding:15px; text-align:center;">${t('error')}: ${error ? error.message : 'Nessun dato'}</p>`;
        return;
    }

    let validRuns = data.filter(row => {
        const tStart = row[startCol];
        const tEnd = row[endCol];
        if (!tStart || !tEnd) return false;
        if (tStart >= tEnd) return false;
        if (tStart < timeFilter) return false;
        return true;
    });

    validRuns.sort((a, b) => a[startCol].localeCompare(b[startCol]));

    if (validRuns.length === 0) {
        nextCard.innerHTML = `
            <div style="text-align:center; padding:15px; color:#c62828;">
                <span class="material-icons">directions_boat_filled</span><br>
                <strong>${t('bus_not_found')}</strong><br>
            </div>`;
        return;
    }

    const primo = validRuns[0];
    nextCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <span style="font-size:0.75rem; color:#e1f5fe; text-transform:uppercase; font-weight:bold;">${t('next_departure')}</span>
            <span class="badge-weekday" style="background:#0288D1">Navigazione</span>
        </div>
        <div class="bus-time-big">${primo[startCol].slice(0,5)}</div>
        <div style="font-size:1rem; color:#e1f5fe;">${t('arrival')}: <strong>${primo[endCol].slice(0,5)}</strong></div>
        <div style="font-size:0.75rem; color:#b3e5fc; margin-top:5px;">Direzione: ${primo.direzione || '--'}</div>
    `;
const successivi = validRuns.slice(1);
    list.innerHTML = successivi.map(run => `
        <div class="bus-list-item">
            <span style="font-weight:bold; color:#01579b;">${run[startCol].slice(0,5)}</span>
            <span style="color:#666;">➜ ${run[endCol].slice(0,5)}</span>
        </div>
    `).join('');

    setTimeout(() => { resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
}