// 1. CONFIGURAZIONE SUPABASE
const SUPABASE_URL = 'https://ydrpicezcwtfwdqpihsb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkcnBpY2V6Y3d0ZndkcXBpaHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTQzMDAsImV4cCI6MjA4MzYzMDMwMH0.c89-gAZ8Pgp5Seq89BYRraTG-qqmP03LUCl1KqG9bOg';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const content = document.getElementById('app-content');
const viewTitle = document.getElementById('view-title');

// ✅ HELPER PER COLONNE
function getColumnValue(row, possibleNames) {
    for (let name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null) return row[name];
    }
    return '';
}

// 2. NAVIGAZIONE E SOTTO-MENU
function createSubMenu(options) {
    let html = '<div class="sub-nav-bar">';
    options.forEach(opt => {
        html += `<button class="sub-nav-item" onclick="renderTable('${opt.table}', this)">${opt.label}</button>`;
    });
    html += '</div>';
    return html;
}

async function switchView(view, el) {
    if (!content) return;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
    
    try {
        if (view === 'home') {
            viewTitle.innerText = "5 Terre";
            await renderHome();
        } 
        else if (view === 'cibo') {
            viewTitle.innerText = "Cibo & Sapori";
            const menu = [
                { label: "🍇 Prodotti tipici", table: "Prodotti" },
                { label: "🍝 Ristoranti", table: "Ristoranti" },
                { label: "🍷 Vini", table: "Vini" }
            ];
            content.innerHTML = createSubMenu(menu) + '<div id="sub-content"></div>';
            renderTable('Prodotti', document.querySelector('.sub-nav-item'));
        }
        else if (view === 'outdoor') {
            viewTitle.innerText = "Outdoor";
            const menu = [
                { label: "🥾 Sentieri", table: "Sentieri" },
                { label: "🏖️ Spiagge", table: "Spiagge" }
            ];
            content.innerHTML = createSubMenu(menu) + '<div id="sub-content"></div>';
            renderTable('Sentieri', document.querySelector('.sub-nav-item'));
        }
        else if (view === 'servizi') {
            viewTitle.innerText = "Servizi & Utilità";
            const menu = [
                { label: "🚂 Trasporti", table: "Trasporti" },
                { label: "📞 Numeri utili", table: "Numeri_utili" },
                { label: "💊 Farmacie", table: "Farmacie" }
            ];
            content.innerHTML = createSubMenu(menu) + '<div id="sub-content"></div>';
            renderTable('Trasporti', document.querySelector('.sub-nav-item'));
        }
    } catch (err) {
        content.innerHTML = `<div style="color:red; padding:20px;">Errore: ${err.message}</div>`;
    }
}

// 3. RENDER HOME (I 5 BORGHI)
async function renderHome() {
    content.innerHTML = '<div style="padding:20px; text-align:center;">Caricamento...</div>';
    const { data, error } = await supabaseClient.from('Cinque_Terre').select('*');
    if (error) throw error;
    
    let html = '<div class="grid-container animate-fade">';
    data.forEach(v => {
        const paese = getColumnValue(v, ['Paesi', 'paesi', 'nome']);
        const immagine = getColumnValue(v, ['Immagine', 'immagine']);
        html += `
            <div class="village-card" style="background-image: url('${immagine}')" onclick="openVillageModal('${paese.replace(/'/g, "\\'")}')">
                <div class="card-title-overlay">${paese}</div>
            </div>`;
    });
    content.innerHTML = html + '</div>';
}

// 4. MODALE PAESE (HOME)
async function openVillageModal(nomePaese) {
    const modal = createModalShell();
    const { data, error } = await supabaseClient.from('Cinque_Terre').select('*').eq('Paesi', nomePaese).single();
    if (error || !data) return modal.remove();

    modal.innerHTML = `
        <div class="modal-content animate-fade">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <img src="${data.Immagine}" style="width:100%; border-radius:12px; margin-bottom:15px; max-height:220px; object-fit:cover;">
            <h2 style="margin-top:0;">${nomePaese}</h2>
            <div style="line-height:1.6; color:#333;">${data.Descrizione}</div>
        </div>`;
}

// 5. MODALE DETTAGLIO PRODOTTO (CIBO)
function openProductModal(prodData) {
    const modal = createModalShell();
    const titolo = prodData.Prodotti || "Prodotto";
    const desc = prodData.Descrizione || "Nessuna descrizione.";
    const ideale = prodData["Ideale per"] || "N/A";
    const img = getColumnValue(prodData, ['Immagine', 'immagine']);

    modal.innerHTML = `
        <div class="modal-content animate-fade">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            ${img ? `<img src="${img}" style="width:100%; border-radius:12px; margin-bottom:15px; max-height:220px; object-fit:cover;">` : ''}
            <h2 style="margin-top:0; color:#1a73e8;">${titolo}</h2>
            <p style="line-height:1.6; color:#333;">${desc}</p>
            <div style="margin-top:15px; padding-top:10px; border-top:1px solid #eee; font-weight:bold; color:#555;">
                Ideale per: <span style="font-weight:normal;">${ideale}</span>
            </div>
        </div>`;
}

function createModalShell() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = '<div class="modal-content">Caricamento...</div>';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
    return modal;
}

// 6. RENDER TABELLE UNIVERSALE
async function renderTable(tableName, btnEl) {
    const subContainer = document.getElementById('sub-content');
    if (!subContainer) return;
    document.querySelectorAll('.sub-nav-item').forEach(b => b.classList.remove('active-sub'));
    if (btnEl) btnEl.classList.add('active-sub');

    subContainer.innerHTML = '<div style="text-align:center; padding:20px;">Caricamento...</div>';
    const { data, error } = await supabaseClient.from(tableName).select('*');
    if (error) return subContainer.innerHTML = `<p>Errore: ${error.message}</p>`;

    let html = '<div class="list-container animate-fade">';
    data.forEach((row) => {
        const titolo = getColumnValue(row, ['Prodotti', 'Nome', 'Label ', 'Località', 'Paese', 'Vino']);
        const immagine = getColumnValue(row, ['Immagine', 'immagine']);
        const info = getColumnValue(row, ['Descrizione', 'Difficoltà', 'Indirizzo']);

        if (tableName === 'Prodotti') {
            const rowData = JSON.stringify(row).replace(/'/g, "&apos;");
            html += `
                <div class="card" style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; margin-bottom:10px;" onclick='openProductModal(${rowData})'>
                    <div style="font-weight:bold; font-size:1.1rem; color:#1a1a1a;">${titolo}</div>
                    ${immagine ? `<img src="${immagine}" style="width:75px; height:75px; border-radius:8px; object-fit:cover; margin-left:15px;">` : ''}
                </div>`;
        } else {
            html += `
                <div class="card" style="margin-bottom:10px;">
                    <div style="font-weight:bold; font-size:1.1rem;">${titolo}</div>
                    ${info ? `<div style="font-size:0.9rem; color:#666; margin-top:5px;">${info}</div>` : ''}
                </div>`;
        }
    });
    subContainer.innerHTML = html + '</div>';
}

document.addEventListener('DOMContentLoaded', () => switchView('home'));