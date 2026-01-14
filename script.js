// 1. CONFIGURAZIONE SUPABASE
const SUPABASE_URL = 'https://ydrpicezcwtfwdqpihsb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkcnBpY2V6Y3d0ZndkcXBpaHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTQzMDAsImV4cCI6MjA4MzYzMDMwMH0.c89-gAZ8Pgp5Seq89BYRraTG-qqmP03LUCl1KqG9bOg';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CLOUDINARY_CLOUD_NAME = 'dkg0jfady'; 
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;
/**
 * Genera l'URL basandosi ESATTAMENTE sul nome che arriva dal Database.
 * * @param {string} name - Il nome grezzo dal DB (es. "Pesto Genovese", "Riomaggiore")
 * @param {string} folder - (Opzionale) La cartella su Cloudinary dove hai messo queste foto
 * @param {number} width - Larghezza per ottimizzazione
 */
function getSmartUrl(name, folder = '', width = 600) {
    if (!name) return 'https://via.placeholder.com/600x400?text=No+Image';

    // 1. Pulisce il nome: Cloudinary gestisce gli spazi, ma è meglio codificarli (spazio -> %20)
    // Se su Cloudinary i file si chiamano esattamente "Pesto Genovese", encodeURIComponent lo gestisce.
    // Se invece li hai rinominati "pesto_genovese", dovremmo fare .toLowerCase().replace(/ /g, '_')
    const safeName = encodeURIComponent(name); 

    // 2. Gestione Cartella: Se passi una cartella, aggiunge lo slash
    const folderPath = folder ? `${folder}/` : '';

    // 3. Costruisce l'URL
    return `${CLOUDINARY_BASE_URL}/w_${width},q_auto,f_auto,c_fill/${folderPath}${safeName}`;
}
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
        // Passiamo v.Paesi (es. "Riomaggiore") e la cartella 'borghi'
    const imgUrl = getSmartUrl(v.Paesi, '', 800); 
    
    // Escaping per il nome nel click
    const safeName = v.Paesi.replace(/'/g, "\\'");
    
    html += `
        <div class="village-card" style="background-image: url('${imgUrl}')" onclick="openModal('village', '${safeName}')">
            <div class="card-title-overlay">${v.Paesi}</div>
        </div>`;
    });// --- NUOVA 6° CARD (CHIUSURA GRIGLIA) ---
    // Uso un'immagine placeholder da Unsplash a tema mappa/esplorazione, cambiala pure con una tua.
    html += `
        <div class="village-card" style="background-image: url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')" onclick="switchView('mappe_monumenti', null)">
            <div class="card-title-overlay">Mappe & Monumenti</div>
        </div>`;
        
    content.innerHTML = html + '</div>';
}

// 5. CARICAMENTO DATI TABELLE (MOTORE CENTRALE)
async function loadTableData(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;

    document.querySelectorAll('.sub-nav-item').forEach(b => b.classList.remove('active-sub'));
    if (btnEl) btnEl.classList.add('active-sub');

    subContent.innerHTML = '<div class="loader">Caricamento dati...</div>';
    
    // Gestione speciale per Mappe che non carica da DB ma mostra iframe statico
    if (tableName === 'Mappe') {
        subContent.innerHTML = `
            <div class="map-container animate-fade">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46077.56843657856!2d9.699762635905068!3d44.12658102375549!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12d4fa24b95f2231%3A0xe539c89495687708!2sParco%20Nazionale%20delle%20Cinque%20Terre!5e0!3m2!1sit!2sit!4v1709220000000!5m2!1sit!2sit" 
                width="640" 
                height="480"
                style="border:0; width:100%; height:400px; border-radius:12px;" 
                allowfullscreen="" 
                loading="lazy">
                </iframe>
                <div class="map-note" style="text-align:center; padding:10px; color:#666;">Mappa Interattiva Google</div>
            </div>`;
        return; 
    }

    const { data, error } = await supabaseClient.from(tableName).select('*');
    if (error) {
        subContent.innerHTML = `<p class="error-msg">Errore: ${error.message}</p>`;
        return;
    }

    let html = '<div class="list-container animate-fade">';

    // --- SWITCH RENDERER ---
    if (tableName === 'Sentieri') {
        renderGenericFilterableView(data, 'Label', subContent, sentieroRenderer);
        return;
    }
    else if (tableName === 'Spiagge') {
        renderGenericFilterableView(data, 'Paesi', subContent, spiaggiaRenderer);
        return; 
    }
    else if (tableName === 'Ristoranti') {
        renderGenericFilterableView(data, 'Paesi', subContent, ristoranteRenderer);
        return;
    }
    else if (tableName === 'Farmacie') {
       renderGenericFilterableView(data, 'Paesi', subContent, farmaciaRenderer);
       return;
    }
    else if (tableName === 'Attrazioni') {
       // CORREZIONE: Qui ora chiama la funzione attrazioniRenderer che ho aggiunto in fondo
       renderGenericFilterableView(data, 'Paese', subContent, attrazioniRenderer);
       return;
    }
    else if (tableName === 'Prodotti') {
        data.forEach(p => {
                        const titolo = p.Prodotti || p.Nome; 
                const imgUrl = getSmartUrl(titolo, '', 400);
                const safeObj = JSON.stringify(p).replace(/'/g, "'");
                            
                html += `
                    <div class="card-product" onclick='openModal("product", ${safeObj})'>
                        
                        <div class="prod-info">
                            <div class="prod-title">${titolo}</div>
                            <div class="prod-arrow">➜</div>
                        </div>
                        
                        <img 
                            src="${imgUrl}" 
                            class="prod-thumb" 
                            loading="lazy" 
                            alt="${titolo}"
                            onerror="this.style.display='none'"
                        >
                    </div>`;
        });
    }
    else if (tableName === 'Trasporti') {
        data.forEach(t => {// 1. Determina il nome (chiave per Cloudinary e Titolo visualizzato)
            // Se nel DB hai colonne diverse (es. 'Mezzo'), il codice cerca la prima piena.
            const nome = t.Località || t.Mezzo;

            // 2. Genera l'URL Cloudinary
            // NOTA: Assicurati che su Cloudinary le foto siano nella cartella 'trasporti'
            // o cambia il secondo parametro in '' se sono nella root.
            const imgUrl = getSmartUrl(nome, '', 400);

            // 3. Prepara l'oggetto per il modale (gestione apostrofi)
            const safeObj = JSON.stringify(t).replace(/'/g, "\\'");
            
            html += `
                <div class="card-product" onclick='openModal("transport", ${safeObj})'>
                    
                    <div class="prod-info">
                        <div class="prod-title">${nome}</div>
                    </div>

                    <img 
                        src="${imgUrl}" 
                        class="prod-thumb" 
                        loading="lazy"
                        alt="${nome}"
                        onerror="this.style.display='none'"
                    >
                </div>`;});
    } else if (tableName === 'Mappe') {
            subContent.innerHTML = `
            <div class="map-container animate-fade">
                <iframe src="https://www.google.com/maps/d/u/1/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F" 
                width="640" 
                height="480">
                </iframe>
                <div class="map-note">Mappa caricata da Supabase</div>
            </div>`;
        return; // Esce qui
    }

    // --- B. ATTRAZIONI (MONUMENTI) ---
    else if (tableName === 'Attrazioni') {
        renderGenericFilterableView(data, 'Paese', subContent, attrazioniRenderer);
        return;
    }
    else if (tableName === 'Numeri_utili') {
        data.sort((a, b) => {
            const isEmergenzaA = a.Nome.includes('112') || a.Nome.toLowerCase().includes('emergenza');
            const isEmergenzaB = b.Nome.includes('112') || b.Nome.toLowerCase().includes('emergenza');
            if (isEmergenzaA && !isEmergenzaB) return -1;
            if (!isEmergenzaA && isEmergenzaB) return 1;
            return 0;
        }); 
        renderGenericFilterableView(data, 'Comune', subContent, numeriUtiliRenderer);
        return;
    };
    
    subContent.innerHTML = html + '</div>';
}

// 6. GESTIONE MODALI (POPUP)
function simpleAlert(titolo, testo) {
    alert(`${titolo}\n\n${testo}`);
}

async function openModal(type, payload) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate-fade';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

    let contentHtml = '';

    if (type === 'village') {
        const bigImg = getSmartUrl(payload, '', 1000);
        // Recupera descrizione
        const { data } = await supabaseClient.from('Cinque_Terre').select('*').eq('Paesi', payload).single();
        const desc = data ? data.Descrizione : 'Caricamento...';
        
        contentHtml = `
            <img src="${bigImg}" style="width:100%; border-radius:12px; height:220px; object-fit:cover;">
            <h2>${payload}</h2>
            <p>${desc}</p>`;
    } 
    else if (type === 'product') {
        const nome = payload.Prodotti || payload.Nome;
        const bigImg = getSmartUrl(nome, 'prodotti', 800);
        contentHtml = `
            <img src="${bigImg}" style="width:100%; border-radius:12px; height:200px; object-fit:cover;" onerror="this.style.display='none'">
            <h2>${nome}</h2>
            <p>${payload.Descrizione || ''}</p>
            <hr>
            <p><strong>Ideale per:</strong> ${payload["Ideale per"] || payload.IdealePer || ''}</p>`;
    }
    else if (type === 'transport') {
        contentHtml = `
            <h2>${payload.Località || 'Trasporto'}</h2>
            <p>${payload.Descrizione || ''}</p>
            <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
                ${payload["Link"] ? `<a href="${payload["Link"]}" target="_blank" class="btn-yellow" style="text-align:center;">VAI AL SITO</a>` : ''}
                ${payload["Link_2"] ? `<a href="${payload["Link_2"]}" target="_blank" class="btn-yellow" style="text-align:center;">ORARI</a>` : ''}
            </div>`;
    }
    else if (type === 'attrazione') {
        contentHtml = `
            <h2>${payload.Attrazioni}</h2>
            <div style="color:#666; margin-bottom:15px; font-weight:600;">📍 ${payload.Paese}</div>
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <span class="meta-badge" style="background:#eee; padding:5px; border-radius:8px;">⏱ ${payload["Tempo Visita (min)"] || '--'} min</span>
                <span class="meta-badge" style="background:#eee; padding:5px; border-radius:8px;">${payload["Difficoltà Accesso"] || 'Accessibile'}</span>
            </div>
            <p>${payload.Descrizione || ''}</p>
            ${payload.Curiosità ? `<div class="curiosity-box" style="margin-top:10px; padding:10px; background:#f9f9f9; border-left:4px solid orange;">💡 ${payload.Curiosità}</div>` : ''}
            <div style="margin-top:20px;">
                ${payload["Icona MyMaps"] ? `<a href="${payload["Icona MyMaps"]}" target="_blank" class="btn-yellow" style="display:block; text-align:center;">VAI ALLA POSIZIONE</a>` : ''}
            </div>`;
    }
    else if (type === 'restaurant' || type === 'farmacia') {
         contentHtml = `<h2>${payload.Nome}</h2><p>${payload.Indirizzo}</p>`;
    }

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>
            ${contentHtml}
        </div>`;
}

// 7. MOTORE DI FILTRO
function renderGenericFilterableView(allData, filterKey, container, cardRenderer) {
    container.innerHTML = `
        <div class="filter-bar" id="dynamic-filters"></div>
        <div class="list-container animate-fade" id="dynamic-list"></div>
    `;

    const filterBar = container.querySelector('#dynamic-filters');
    const listContainer = container.querySelector('#dynamic-list');
    
    let tagsRaw = [...new Set(allData.map(item => item[filterKey]))].filter(x => x);
    const customOrder = ["Tutti", "Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso"];
    if (!tagsRaw.includes('Tutti')) tagsRaw.unshift('Tutti');

    const uniqueTags = tagsRaw.sort((a, b) => {
        const indexA = customOrder.indexOf(a);
        const indexB = customOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    uniqueTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'filter-chip';
        btn.innerText = tag;
        if (tag === 'Tutti') btn.classList.add('active-filter');

        btn.onclick = () => {
            filterBar.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active-filter'));
            btn.classList.add('active-filter');
            
            const filtered = tag === 'Tutti' 
                ? allData 
                : allData.filter(item => {
                    const matchTag = item[filterKey] === tag;
                    const isUniversal = item.Nome && (item.Nome.includes('112') || item.Nome.toLowerCase().includes('emergenza'));
                    return matchTag || isUniversal;
                });
            updateList(filtered);
        };
        filterBar.appendChild(btn);
    });

    function updateList(items) {
        if (!items || items.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">Nessun risultato.</p>';
            return;
        }
        listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
    }
    updateList(allData);
}

const sentieroRenderer = (s) => {
    const paesi = s.Paesi || s.paesi || 'Nome mancante';
    const label = s.Label || s.label || 'Nessuna cat.';
    const desc = s.Descrizione || s.descrizione || '';
    const safePaesi = paesi.replace(/'/g, "\\'");
    const safeDesc = desc.replace(/'/g, "\\'");

    // Cerca il link GPX
    const linkGpx = s.Gpxlink || s.gpxlink;
    // Cerca il link Google (fallback)
    const linkMappa = s.Mappa || s.mappa;

    let buttonHtml = '';

    if (linkGpx) {
        // CASO 1: C'è il GPX -> Apre mappa interna (tua richiesta)
        buttonHtml = `<button onclick="openGpxMap('${linkGpx}', '${safePaesi}')" class="btn-sentiero-small" style="cursor:pointer; background:#e3f2fd; color:#1565c0; border:1px solid #bbdefb;">VEDI MAPPA 🗺️</button>`;
    } else if (linkMappa) {
        // CASO 2: Solo link Google -> Apre nuova scheda
        buttonHtml = `<a href="${linkMappa}" target="_blank" class="btn-sentiero-small">GOOGLE MAPS</a>`;
    } else {
        buttonHtml = `<span class="btn-sentiero-small" style="opacity:0.5">NO MAPPA</span>`;
    }

    return `
    <div class="card-sentiero">
        <div class="sentiero-header">
            <strong>${s.Distanza || '--'}</strong>
            <span>${s.Durata || '--'}</span>
        </div>
        <div class="sentiero-body" onclick="simpleAlert('${safePaesi}', '${safeDesc}')">
            <div style="font-size:0.75rem; color:#e67e22; text-transform:uppercase;">${label}</div>
            <h4>${paesi}</h4>
            <p class="difficolta">${s.Difficoltà || ''}</p>
        </div>
        <div class="sentiero-footer">
            ${buttonHtml}
            ${s.Pedaggio ? `<a href="${s.Pedaggio}" target="_blank" class="btn-sentiero-small">PEDAGGIO</a>` : '<span></span>'}
        </div>
    </div>`;
};

const spiaggiaRenderer = (s) => {
    const safeNome = s.Nome.replace(/'/g, "\\'");
    const safeDesc = s.Descrizione ? s.Descrizione.replace(/'/g, "\\'") : 'Nessuna descrizione.';
    return `
    <div class="card-spiaggia">
        <div class="spiaggia-header">
            <div class="spiaggia-title">${s.Nome}</div>
            <span style="font-size:1.2rem;">🏖️</span>
        </div>
        <div class="spiaggia-location">📍 ${s.Paesi}</div>
        <div class="spiaggia-footer">
             <button class="btn-azure" onclick="simpleAlert('${safeNome}', '${safeDesc}')">INFO</button>
             ${s.Maps ? `<a href="${s.Maps}" target="_blank" class="btn-azure">MAPPA</a>` : ''}
        </div>
    </div>`;
};

const ristoranteRenderer = (r) => {
    const nome = r.Nome || r.nome;
    const fullAddress = `${r.Indirizzo}, ${r.Paesi}`;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    const safeObj = JSON.stringify(r).replace(/'/g, "'").replace(/"/g, "&quot;");

    return `
    <div class="card-list-item" onclick='openModal("restaurant", ${safeObj})'>
        <div class="item-info">
            <div class="item-header-row">
                <div class="item-title">${nome}</div>
                <div class="item-tag">${r.Tipo || 'Ristorante'}</div>
            </div>
            <div class="item-subtitle">📍 ${r.Paesi}</div>
            <div class="card-actions">
                ${r.Telefono ? `<a href="tel:${r.Telefono}" class="action-btn btn-phone" onclick="event.stopPropagation()"><span>📞</span> Chiama</a>` : ''}
                ${r.Indirizzo ? `<a href="${mapLink}" target="_blank" class="action-btn btn-map" onclick="event.stopPropagation()"><span>🗺️</span> Mappa</a>` : ''}
            </div>
        </div>
        <div class="item-arrow" style="align-self: flex-start; margin-top: 5px;">➜</div>
    </div>`;
};

const farmaciaRenderer = (f) => {
    const safeObj = JSON.stringify(f).replace(/'/g, "'").replace(/"/g, "&quot;");
    const fullAddress = `${f.Indirizzo}, ${f.Paesi}`;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

    return `
    <div class="card-list-item" onclick='openModal("farmacia", ${safeObj})'>
        <div class="item-info">
            <div class="item-header-row">
                <div class="item-title">${f.Nome}</div>
                <div class="item-tag" style="background-color:#4CAF50;">FARMACIA</div>
            </div>
            <div class="item-subtitle">📍 ${f.Paesi}</div>
            <div class="card-actions">
                ${f.Numero ? `<a href="tel:${f.Numero}" class="action-btn btn-phone" onclick="event.stopPropagation()"><span>📞</span> Chiama</a>` : ''}
                ${f.Indirizzo ? `<a href="${mapLink}" target="_blank" class="action-btn btn-map" onclick="event.stopPropagation()"><span>🗺️</span> Mappa</a>` : ''}
            </div>
        </div>
        <div class="item-arrow" style="align-self: flex-start; margin-top: 5px;">➜</div>
    </div>`;
};

const numeriUtiliRenderer = (n) => {
    return `
    <div class="card-list-item" style="cursor:default;">
        <div class="item-info">
            <div class="item-header-row">
                <div class="item-title">${n.Nome}</div>
                <div class="item-tag" style="background-color:#607d8b;">${n.Comune}</div>
            </div>
            <div class="item-subtitle" style="margin-top:6px; color:#555;"><strong>Copertura:</strong> ${n.Paesi}</div>
            <div class="card-actions">
                <a href="tel:${n.Numero}" class="action-btn btn-phone" onclick="event.stopPropagation()">
                    <span style="font-size:1.2rem; margin-right:5px;">📞</span> Chiama ${n.Numero}
                </a>
            </div>
        </div>
    </div>`;
};

// CORREZIONE: Aggiunto il renderer mancante per le Attrazioni
const attrazioniRenderer = (item) => {
    const titolo = item.Attrazioni || 'Attrazione';
    const safeObj = JSON.stringify(item).replace(/'/g, "'").replace(/"/g, "&quot;");
    const diff = item["Difficoltà Accesso"] || 'Facile';
    const diffStyle = (diff.toLowerCase().includes('alta')) ? 'background:#ffebee; color:#c62828;' : 'background:#e8f5e9; color:#2e7d32;';

    return `
    <div class="card-list-item monument-mode" onclick='openModal("attrazione", ${safeObj})'>
        <div class="item-info">
            <div class="item-header-row"><div class="item-title">${titolo}</div></div>
            <div class="item-subtitle" style="margin-bottom: 8px;">📍 ${item.Paese}</div>
            <div class="monument-meta" style="display:flex; gap:8px;">
                <span class="meta-badge" style="${diffStyle} padding:2px 8px; border-radius:4px; font-size:0.75rem;">${diff}</span>
                <span class="meta-badge badge-time" style="background:#f5f5f5; padding:2px 8px; border-radius:4px; font-size:0.75rem;">⏱ ${item["Tempo Visita (min)"] || '--'} min</span>
            </div>
        </div>
        <div class="item-arrow" style="margin-top: auto; margin-bottom: auto;">➜</div>
    </div>`;
};

// Avvio app
document.addEventListener('DOMContentLoaded', () => switchView('home'));

async function shareApp() {
    try {
        if (navigator.share) {
            await navigator.share({ title: '5 Terre App', text: 'Guarda questa guida!', url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copiato!");
        }
    } catch (err) { console.log("Errore:", err); }
}

// ZOOM BLOCK
// ==========================================
// BLOCCO ZOOM IOS (Versione Aggiornata)
// ==========================================

// 1. Impedisce il pinch-to-zoom (due dita)
document.addEventListener('touchmove', function(event) {
    if (event.scale !== 1) {
        event.preventDefault();
    }
}, { passive: false });

// 2. Impedisce il doppio tocco veloce (Double Tap Zoom)
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// 3. Impedisce il "tap" con due dita (spesso causa zoom su iOS)
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, { passive: false });

// Variabile globale per evitare conflitti mappa
let activeMap = null;

function openGpxMap(gpxUrl, titolo) {
    // 1. Controllo sicurezza link
    if (!gpxUrl) return;

    // 2. Crea il modale
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate-fade';
    // Layout della finestra mappa
    modal.innerHTML = `
        <div class="modal-content" style="height:80vh; padding:0; display:flex; flex-direction:column; overflow:hidden;">
            <div style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:white; z-index:10;">
                <h3 style="margin:0; font-size:1.1rem;">${titolo}</h3>
                <span class="close-modal" style="font-size:2rem; cursor:pointer; line-height:1;">&times;</span>
            </div>
            <div id="gpx-map-container" style="flex:1; width:100%; background:#f0f0f0;"></div>
        </div>`;
    
    document.body.appendChild(modal);

    // Funzione chiusura
    const closeModal = () => {
        if (activeMap) { activeMap.remove(); activeMap = null; } // Pulisce memoria
        modal.remove();
    };
    modal.querySelector('.close-modal').onclick = closeModal;
    modal.onclick = (e) => { if(e.target === modal) closeModal(); };

    // 3. Avvia la Mappa (con piccolo ritardo per permettere al modale di aprirsi)
    setTimeout(() => {
        if (!document.getElementById('gpx-map-container')) return;
        
        // Inizializza mappa base
        activeMap = L.map('gpx-map-container');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(activeMap);

        // Carica e disegna il file GPX
        new L.GPX(gpxUrl, {
            async: true,
            marker_options: {
                startIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png',
                endIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png',
                shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png'
            }
        }).on('loaded', function(e) {
            activeMap.fitBounds(e.target.getBounds()); // Centra la vista sul sentiero
        }).addTo(activeMap);
    }, 200);
}