// 1. CONFIGURAZIONE SUPABASE
const SUPABASE_URL = 'https://ydrpicezcwtfwdqpihsb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkcnBpY2V6Y3d0ZndkcXBpaHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTQzMDAsImV4cCI6MjA4MzYzMDMwMH0.c89-gAZ8Pgp5Seq89BYRraTG-qqmP03LUCl1KqG9bOg';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const content = document.getElementById('app-content');
const viewTitle = document.getElementById('view-title');

// 2. GESTIONE VISTE E NAVIGAZIONE
async function switchView(view, el) {
    if (!content) return;
    
    // Aggiorna stile bottoni menu in basso
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
    
    // Pulisce e mostra loader
    content.innerHTML = '<div class="loader">Caricamento...</div>';

    try {
        if (view === 'home') {
            viewTitle.innerText = "5 Terre";
            await renderHome();
        } 
        else if (view === 'cibo') {
            viewTitle.innerText = "Cibo & Sapori";
            // Vini rimosso come richiesto
            renderSubMenu([
                { label: "🍇 Prodotti", table: "Prodotti" },
                { label: "🍝 Ristoranti", table: "Ristoranti" }
            ], 'Prodotti');
        }
        else if (view === 'outdoor') {
            viewTitle.innerText = "Outdoor";
            renderSubMenu([
                { label: "🥾 Sentieri", table: "Sentieri" },
                { label: "🏖️ Spiagge", table: "Spiagge" }
            ], 'Sentieri');
        }
        else if (view === 'servizi') {
            viewTitle.innerText = "Servizi & Utilità";
            renderSubMenu([
                { label: "🚂 Trasporti", table: "Trasporti" },
                { label: "📞 Numeri", table: "Numeri_utili" },
                { label: "💊 Farmacie", table: "Farmacie" }
            ], 'Trasporti');
        }
    } catch (err) {
        console.error(err);
        content.innerHTML = `<div class="error-msg">Errore: ${err.message}</div>`;
    }
}

// 3. RENDER MENU SECONDARIO (Sotto il titolo)
function renderSubMenu(options, defaultTable) {
    let menuHtml = '<div class="sub-nav-bar">';
    options.forEach(opt => {
        // Al click ricarica la tabella specifica
        menuHtml += `<button class="sub-nav-item" onclick="loadTableData('${opt.table}', this)">${opt.label}</button>`;
    });
    menuHtml += '</div><div id="sub-content"></div>';
    content.innerHTML = menuHtml;

    // Attiva il primo bottone di default
    const firstBtn = content.querySelector('.sub-nav-item');
    if (firstBtn) loadTableData(defaultTable, firstBtn);
}

// 4. RENDER HOME (BORGHI)
async function renderHome() {
    const { data, error } = await supabaseClient.from('Cinque_Terre').select('*');
    if (error) throw error;
    
    let html = '<div class="grid-container animate-fade">';
    data.forEach(v => {
        // Escaping per evitare errori con gli apostrofi nel nome
        const safeName = v.Paesi.replace(/'/g, "\\'");
        html += `
            <div class="village-card" style="background-image: url('${v.Immagine}')" onclick="openModal('village', '${safeName}')">
                <div class="card-title-overlay">${v.Paesi}</div>
            </div>`;
    });
    content.innerHTML = html + '</div>';
}

// 5. CARICAMENTO DATI TABELLE (MOTORE CENTRALE)
async function loadTableData(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;

    // Gestione classe active sottomenu
    document.querySelectorAll('.sub-nav-item').forEach(b => b.classList.remove('active-sub'));
    if (btnEl) btnEl.classList.add('active-sub');

    subContent.innerHTML = '<div class="loader">Caricamento dati...</div>';
    
    const { data, error } = await supabaseClient.from(tableName).select('*');
    if (error) {
        subContent.innerHTML = `<p class="error-msg">Errore: ${error.message}</p>`;
        return;
    }

    let html = '<div class="list-container animate-fade">';

    // --- LOGICA SPECIFICA PER OGNI TABELLA ---
// A. SENTIERI (Filtra per Label)
    if (tableName === 'Sentieri') {
        renderGenericFilterableView(data, 'Label', subContent, sentieroRenderer);
        return; // IMPORTANTE: Esce qui perché il render lo fa la funzione sopra
    }

    // B. SPIAGGE (Filtra per Paesi)
    else if (tableName === 'Spiagge') {
        renderGenericFilterableView(data, 'Paesi', subContent, spiaggiaRenderer);
        return; 
    }

    // B. RISTORANTI (Paesi, Nome, Indirizzo, Telefono, Tipo)
    else if (tableName === 'Ristoranti') {
        data.forEach(r => {
            html += `
                <div class="card-generic">
                    <div class="card-top">
                        <div class="card-title">${r.Nome}</div>
                        <div class="card-tag">${r.Tipo || ''}</div>
                    </div>
                    <div class="card-subtitle">📍 ${r.Paesi} - ${r.Indirizzo || ''}</div>
                    ${r.Telefono ? `<a href="tel:${r.Telefono}" class="btn-call">📞 Chiama ${r.Telefono}</a>` : ''}
                </div>`;
        });
    }

    // C. FARMACIE (Paesi, Numero, Nome, Indirizzo)
    else if (tableName === 'Farmacie') {
        data.forEach(f => {
            html += `
                <div class="card-generic">
                    <div class="card-title">💊 ${f.Nome}</div>
                    <div class="card-subtitle">📍 ${f.Paesi} - ${f.Indirizzo || ''}</div>
                    ${f.Numero ? `<a href="tel:${f.Numero}" class="btn-call">📞 ${f.Numero}</a>` : ''}
                </div>`;
        });
    }

    // E. PRODOTTI (Standard con immagine)
    else if (tableName === 'Prodotti') {
        data.forEach(p => {
            // Nota: uso p.Prodotti come nome colonna principale come da storico, o p.Nome se cambiato
            const titolo = p.Prodotti || p.Nome; 
            const safeObj = JSON.stringify(p).replace(/'/g, "&apos;");
            html += `
                <div class="card-product" onclick='openModal("product", ${safeObj})'>
                    <div class="prod-info">
                        <div class="prod-title">${titolo}</div>
                        <div class="prod-arrow">➜</div>
                    </div>
                    ${p.Immagine ? `<img src="${p.Immagine}" class="prod-thumb">` : ''}
                </div>`;
        });
    }

    // F. TRASPORTI & NUMERI UTILI (Standard)
    else if (tableName === 'Trasporti') {
        data.forEach(t => {
            const safeObj = JSON.stringify(t).replace(/'/g, "&apos;");
            html += `
                <div class="card-service-transport" onclick='openModal("transport", ${safeObj})'>
                    <img src="${t.Immagine}" class="img-service">
                    <div class="title-service">${t.Località}</div>
                </div>`;
        });
    }
    else if (tableName === 'Numeri_utili') {
        data.forEach(n => {
            html += `
                <div class="card-number-item" onclick="window.location.href='tel:${n.Numero}'">
                    <span style="font-size:1.5rem; margin-right:15px;">📞</span>
                    <div>
                        <div style="font-weight:bold;">${n.Nome}</div>
                        <div style="color:#666; font-size:0.9rem;">${n.Numero}</div>
                    </div>
                </div>`;
        });
    }

    subContent.innerHTML = html + '</div>';
}

// 6. GESTIONE MODALI (POPUP)
function simpleAlert(titolo, testo) {
    alert(`${titolo}\n\n${testo}`);
}

async function openModal(type, payload) {
    // Crea sfondo scuro
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate-fade';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

    let contentHtml = '';

    if (type === 'village') {
        const { data } = await supabaseClient.from('Cinque_Terre').select('*').eq('Paesi', payload).single();
        if (data) {
            contentHtml = `
                <img src="${data.Immagine}" style="width:100%; border-radius:12px; height:200px; object-fit:cover;">
                <h2>${data.Paesi}</h2>
                <p>${data.Descrizione}</p>`;
        }
    } 
    else if (type === 'product') {
        // Payload qui è l'oggetto intero
        contentHtml = `
            ${payload.Immagine ? `<img src="${payload.Immagine}" style="width:100%; border-radius:12px; height:200px; object-fit:cover;">` : ''}
            <h2>${payload.Prodotti || payload.Nome}</h2>
            <p>${payload.Descrizione || ''}</p>
            <hr>
            <p><strong>Ideale per:</strong> ${payload["Ideale per"] || payload.IdealePer || ''}</p>`;
    }
    else if (type === 'transport') {
        contentHtml = `
            <h2>${payload.Località}</h2>
            <p>${payload.Descrizione || ''}</p>
            <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
                ${payload["Link 1"] ? `<a href="${payload["Link 1"]}" target="_blank" class="btn-yellow" style="text-align:center;">VAI AL SITO</a>` : ''}
                ${payload["Link 2"] ? `<a href="${payload["Link 2"]}" target="_blank" class="btn-yellow" style="text-align:center;">ORARI</a>` : ''}
            </div>`;
    }

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            ${contentHtml}
        </div>`;
}
/* 7. LOGICA DI RENDERING CON FILTRO */
/**
 * 1. MOTORE GENERICO
 * Prende i dati e crea la UI con i filtri in alto e la lista sotto.
 */
function renderGenericFilterableView(allData, filterKey, container, cardRenderer) {
    // Pulisce e prepara lo scheletro
    container.innerHTML = `
        <div class="filter-bar" id="dynamic-filters"></div>
        <div class="list-container animate-fade" id="dynamic-list"></div>
    `;

    const filterBar = container.querySelector('#dynamic-filters');
    const listContainer = container.querySelector('#dynamic-list');

    // Estrae le categorie uniche (es. Paesi o Label)
    const uniqueTags = ['Tutti', ...new Set(allData.map(item => item[filterKey]))].sort();

    // Crea i bottoni
    uniqueTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'filter-chip';
        btn.innerText = tag;
        if (tag === 'Tutti') btn.classList.add('active-filter');

        btn.onclick = () => {
            // Gestione visiva bottone attivo
            filterBar.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active-filter'));
            btn.classList.add('active-filter');
            
            // Logica di filtro
            const filtered = tag === 'Tutti' 
                ? allData 
                : allData.filter(item => item[filterKey] === tag);
            
            updateList(filtered);
        };
        filterBar.appendChild(btn);
    });

    // Funzione interna per disegnare le card
    function updateList(items) {
        if (!items || items.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">Nessun risultato.</p>';
            return;
        }
        // Usa il "Renderer" specifico per trasformare l'oggetto JSON in HTML
        listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
    }

    // Primo avvio: mostra tutto
    updateList(allData);
}

/**
 * 2. TEMPLATE PER I SENTIERI
 */
const sentieroRenderer = (s) => {
    // 1. "Paracadute": Cerca la proprietà sia maiuscola che minuscola
    // Usa || (OR) per prendere quella che esiste
    const paesi = s.Paesi || s.paesi || 'Nome mancante';
    const label = s.Label || s.label || 'Nessuna cat.';  // <--- ECCO IL COLPEVOLE
    const desc = s.Descrizione || s.descrizione || '';
    const dist = s.Distanza || s.distanza || '--';
    const dur = s.Durata || s.durata || '--';
    const diff = s.Difficoltà || s.difficoltà || '';
    const mappa = s.Mappa || s.mappa || '#';
    const pedaggio = s.Pedaggio || s.pedaggio;

    // 2. Protezione apostrofi
    const safePaesi = paesi.replace(/'/g, "\\'");
    const safeDesc = desc.replace(/'/g, "\\'");

    return `
    <div class="card-sentiero">
        <div class="sentiero-header">
            <strong>${dist}</strong>
            <span>${dur}</span>
        </div>
        <div class="sentiero-body" onclick="simpleAlert('${safePaesi}', '${safeDesc}')">
            <div style="font-size:0.75rem; color:#e67e22; text-transform:uppercase;">${label}</div>
            <h4>${paesi}</h4>
            <p class="difficolta">${diff}</p>
        </div>
        <div class="sentiero-footer">
            <a href="${mappa}" target="_blank" class="btn-yellow">MAPPA</a>
            ${pedaggio ? `<a href="${pedaggio}" target="_blank" class="btn-yellow">PEDAGGIO</a>` : ''}
        </div>
    </div>`;
};

/**
 * 3. TEMPLATE PER LE SPIAGGE (Nuovo!)
 */
const spiaggiaRenderer = (s) => {
    const safeNome = s.Nome.replace(/'/g, "\\'");
    const safeDesc = s.Descrizione ? s.Descrizione.replace(/'/g, "\\'") : 'Nessuna descrizione disponibile.';

    return `
    <div class="card-generic" style="border-left: 4px solid #00bcd4;">
        <div class="card-top">
            <div class="card-title">${s.Nome}</div>
            <div class="card-tag" style="font-size:0.8rem; color:#666;">📍 ${s.Paesi}</div>
        </div>
        <div style="margin-top:10px; display:flex; gap:10px;">
             <button class="btn-yellow" onclick="simpleAlert('${safeNome}', '${safeDesc}')">INFO</button>
             ${s.Maps ? `<a href="${s.Maps}" target="_blank" class="btn-yellow">VAI</a>` : ''}
        </div>
    </div>`;
};

// Avvio app
document.addEventListener('DOMContentLoaded', () => switchView('home'));