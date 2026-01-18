console.log("✅ 1. data-logic.js caricato");

// ============================================================
// 1. INIZIALIZZAZIONE SUPABASE
// ============================================================
// Controlliamo se config.js è stato caricato correttamente
if (typeof window.SUPABASE_URL !== 'undefined' && typeof window.SUPABASE_KEY !== 'undefined') {
    window.supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
    console.log("🚀 Supabase connesso");
} else {
    console.error("❌ ERRORE: Variabili Supabase non trovate. Assicurati che config.js sia caricato PRIMA di data-logic.js");
}

// ============================================================
// 2. VARIABILI GLOBALI (Contenitori Dati)
// ============================================================
// Qui salviamo temporaneamente i dati per non doverli scaricare di nuovo
window.mapsToInit = [];
window.tempTransportData = [];
window.tempAttractionsData = [];

// ============================================================
// 3. STATO UTENTE
// ============================================================
// Recupera la lingua salvata o usa quella di default definita in config.js
window.currentLang = localStorage.getItem('app_lang') || 'it';