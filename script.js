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

    // A. SENTIERI (Raggruppati per Label)
    if (tableName === 'Sentieri') {
        const categorie = {};
        data.forEach(s => {
            const cat = s.Label || "Altri";
            if (!categorie[cat]) categorie[cat] = [];
            categorie[cat].push(s);
        });

        for (const label in categorie) {
            html += `<h3 class="macro-label">${label}</h3>`;
            categorie[label].forEach(s => {
                const pedaggioBtn = s.Pedaggio ? `<a href="${s.Pedaggio}" target="_blank" class="btn-yellow">PEDAGGIO</a>` : '';
                const safeDesc = s.Descrizione ? s.Descrizione.replace(/'/g, "\\'") : '';
                const safePaesi = s.Paesi ? s.Paesi.replace(/'/g, "\\'") : '';
                
                html += `
                    <div class="card-sentiero">
                        <div class="sentiero-header">
                            <strong>${s.Distanza || '--'}</strong>
                            <span>${s.Durata || '--'}</span>
                        </div>
                        <div class="sentiero-body" onclick="simpleAlert('${safePaesi}', '${safeDesc}')">
                            <h4>${s.Paesi}</h4>
                            <p class="difficolta">${s.Difficoltà || ''}</p>
                        </div>
                        <div class="sentiero-footer">
                            <a href="${s.Mappa}" target="_blank" class="btn-yellow">MAPPA</a>
                            ${pedaggioBtn}
                        </div>
                    </div>`;
            });
        }
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
            // Se c'è un numero, crea il bottone verde, altrimenti niente
            const callBtn = f.Numero 
                ? `<a href="tel:${f.Numero}" class="btn-pharmacy-call"><span class="material-icons" style="font-size:16px;">call</span> CHIAMA</a>` 
                : '';

            html += `
                <div class="card-pharmacy">
                    <div class="pharmacy-icon">✚</div>
                    <div class="pharmacy-info">
                        <div class="pharmacy-name">${f.Nome}</div>
                        <div class="pharmacy-address">
                            📍 ${f.Paesi} <br> 
                            <span style="font-size:0.8em; color:#999;">${f.Indirizzo || ''}</span>
                        </div>
                    </div>
                    ${callBtn}
                </div>`;
        });
    }
    // D. SPIAGGE (Paesi, Descrizione, Nome)
    else if (tableName === 'Spiagge') {
        data.forEach(s => {
            html += `
                <div class="card-generic" onclick="simpleAlert('${s.Nome.replace(/'/g, "\\'")}', '${s.Descrizione.replace(/'/g, "\\'")}')">
                    <div class="card-title">🏖️ ${s.Nome}</div>
                    <div class="card-subtitle">📍 ${s.Paesi}</div>
                    <div class="card-preview">Clicca per info</div>
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
            
            // Usiamo la classe 'card-product' e 'prod-thumb' che hai già nel CSS
            // così prendono lo stesso stile grafico dei prodotti.
            html += `
                <div class="card-product" onclick='openModal("transport", ${safeObj})'>
                    <div class="prod-info">
                        <div class="prod-title">${t.Località || t.Mezzo || 'Trasporto'}</div>
                                          </div>
                    ${t.Immagine ? `<img src="${t.Immagine}" class="prod-thumb">` : ''}
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

// Avvio app
document.addEventListener('DOMContentLoaded', () => switchView('home'));