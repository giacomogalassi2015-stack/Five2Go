console.log("✅ 2. utils.js caricato");

window.utils = {

    // ============================================================
    // 1. TRADUZIONI E DATI
    // ============================================================

    // Traduce una chiave di testo (es. 'nav_food') nella lingua corrente
    t: function(key) {
        // Se UI_TEXT non è definito (config.js non caricato), ritorna la chiave
        if (typeof window.UI_TEXT === 'undefined') return key;
        
        const lang = window.currentLang || 'it';
        const dict = window.UI_TEXT[lang] || window.UI_TEXT['it'];
        return dict[key] || key;
    },

    // Recupera il valore di una colonna dal DB in base alla lingua (es. Descrizione_en)
    dbCol: function(item, colName) {
        if (!item) return '';
        const lang = window.currentLang || 'it';

        // Se italiano, cerca la colonna base
        if (lang === 'it') {
            return item[colName] || '';
        }

        // Se altra lingua, cerca colonna con suffisso (es. Descrizione_en)
        const translatedKey = `${colName}_${lang}`;
        
        // Se esiste la traduzione e non è vuota, usala. Altrimenti usa italiano (fallback)
        if (item[translatedKey] && item[translatedKey].trim() !== '') {
            return item[translatedKey];
        }
        return item[colName] || '';
    },

    // Genera URL immagini (Cloudinary o Placeholder)
    getSmartUrl: function(name, folder = '', width = 600) {
        if (!name) return 'https://via.placeholder.com/600x400?text=No+Image';
        
        // Se non c'è config per Cloudinary, ritorna placeholder
        if (typeof window.CLOUDINARY_BASE_URL === 'undefined') {
            return 'https://via.placeholder.com/600x400?text=' + encodeURIComponent(name);
        }

        const safeName = encodeURIComponent(name.trim()); 
        const folderPath = folder ? `${folder}/` : '';
        
        // Costruzione URL ottimizzato
        return `${window.CLOUDINARY_BASE_URL}/w_${width},c_fill,f_auto,q_auto:good,fl_progressive/${folderPath}${safeName}`;
    },

    // ============================================================
    // 2. HELPER HTML E SICUREZZA
    // ============================================================

    // Pulisce un oggetto JSON per poterlo passare dentro un onclick="" senza rompere l'HTML
    safeJson: function(data) {
        if (!data) return '{}';
        // encodeURIComponent è il metodo più sicuro: trasforma " in %22 così non rompe l'HTML
        return encodeURIComponent(JSON.stringify(data));
    },

    // Genera un link Google Maps corretto
    getMapLink: function(query) {
        if (!query) return '#';
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    },

    // Genera un ID univoco (utile per le mappe Leaflet multiple)
    generateId: function(prefix = 'id') {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // ============================================================
    // 3. INTERFACCIA E ANIMAZIONI
    // ============================================================

    // Mostra/Nasconde un elemento (es. Info Biglietti)
    toggleElement: function(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            const isHidden = el.style.display === 'none';
            el.style.display = isHidden ? 'block' : 'none';
        }
    },

    // Effetto Swipe tra le tab (chiamato da app.js)
    animateTransition: function(direction, callback) {
        const container = document.getElementById('sub-content');
        if(!container) { callback(); return; }

        // 1. Dissolvenza in uscita
        container.style.transition = 'transform 0.15s ease-out, opacity 0.15s ease-out';
        container.style.opacity = '0';
        container.style.transform = direction === 'left' ? 'translateX(-20px)' : 'translateX(20px)';

        setTimeout(() => {
            // 2. Esegue il cambio contenuto (callback)
            callback(); 
            
            // 3. Reset posizione immediato (invisibile)
            container.style.transition = 'none';
            container.style.transform = direction === 'left' ? 'translateX(20px)' : 'translateX(-20px)';
            
            // 4. Dissolvenza in entrata
            setTimeout(() => {
                container.style.transition = 'transform 0.15s ease-out, opacity 0.15s ease-out';
                container.style.opacity = '1';
                container.style.transform = 'translateX(0)';
            }, 10);
        }, 150);
    }
};

// ============================================================
// ALIAS GLOBALI (Retro-compatibilità)
// ============================================================
// Questo permette di usare window.t() invece di window.utils.t()
// così non devi riscrivere tutto il tuo vecchio codice in app.js
window.t = window.utils.t;
window.dbCol = window.utils.dbCol;
window.getSmartUrl = window.utils.getSmartUrl;
window.safeJson = window.utils.safeJson;
window.toggleElement = window.utils.toggleElement;