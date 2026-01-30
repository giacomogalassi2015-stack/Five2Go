// === RENDER PAGINA LEGALE ===
window.renderLegalPage = function() {
    const targetEl = document.getElementById('app-content');
    if (!targetEl) return;

    const curLang = window.currentLang || 'it';

    const privacyLinks = {
        it: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/privacy-policy-per-siti-web-o-e-commerce-it",
        en: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/privacy-policy-per-siti-web-o-e-commerce-en",
        es: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/privacy-policy-per-siti-web-o-e-commerce-es",
        fr: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/privacy-policy-per-siti-web-o-e-commerce-fr",
        de: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/privacy-policy-per-siti-web-o-e-commerce-de"
    };

    const cookieLinks = {
        it: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/cookie-policy-it",
        en: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/cookie-policy-en",
        es: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/cookie-policy-es",
        fr: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/cookie-policy-fr",
        de: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/cookie-policy-de"
    };

    const activePrivacy = privacyLinks[curLang] || privacyLinks['en'];
    const activeCookie = cookieLinks[curLang] || cookieLinks['en'];

    const contentText = {
        it: {
            title: "Note Legali",
            subtitle: "Termini di Utilizzo e Limitazione di Responsabilità",
            intro: "Scaricando, installando o utilizzando l'applicazione \"Five2Go\" (di seguito \"l'App\"), l'utente dichiara di aver letto, compreso e accettato integralmente le seguenti condizioni:",
            p1_title: "1. NATURA NON UFFICIALE E INDIPENDENTE",
            p1_body: "<strong>Nessuna Affiliazione:</strong> \"Five2Go\" è un progetto editoriale privato e indipendente. L'App NON rappresenta, né è affiliata, finanziata o autorizzata dall'Ente Parco Nazionale delle Cinque Terre, dalle amministrazioni comunali, da Trenitalia, dal Consorzio Marittimo Turistico o da qualsiasi altro ente istituzionale.<br><br><strong>Validità Informativa:</strong> Tutte le informazioni (mappe, orari, descrizioni) sono fornite a esclusivo scopo turistico e indicativo. Non hanno valore legale, cartografico o normativo. Per avvisi ufficiali (es. allerte meteo, chiusura sentieri), l'utente è tenuto a consultare esclusivamente i canali ufficiali.",
            p2_title: "2. ESCURSIONISMO E SICUREZZA (IMPORTANTE)",
            p2_body: "L'attività escursionistica nelle Cinque Terre presenta rischi oggettivi legati alla morfologia impervia del territorio.<br><br><strong>Assunzione del Rischio:</strong> L'utente utilizza le tracce GPX e le indicazioni dell'App a proprio esclusivo rischio e pericolo. L'Autore declina ogni responsabilità per danni fisici, materiali, smarrimenti o decessi.<br><strong>Priorità della Segnaletica:</strong> La segnaletica in loco prevale SEMPRE sulle indicazioni digitali.<br><strong>Proprietà Privata:</strong> Le tracce potrebbero attraversare fondi privati. L'utente è responsabile del rispetto della proprietà altrui e del divieto di accesso.<br><strong>Valutazione Autonoma:</strong> Spetta all'escursionista valutare se il percorso è adatto al proprio livello ed equipaggiamento.",
            p3_title: "3. DATI TECNICI E LIMITI GPS",
            p3_body: "<strong>Precisione:</strong> A causa della conformazione rocciosa, il segnale GPS può risultare impreciso. L'Autore non garantisce l'accuratezza millimetrica.<br><strong>Batteria:</strong> L'App non è uno strumento di soccorso. Considerare sempre il rischio di zone d'ombra (assenza rete).",
            p4_title: "4. TRASPORTI, ORARI E SERVIZI TERZI",
            p4_body: "Gli orari sono aggregati da fonti pubbliche e soggetti a variazioni. L'App può contenere link a siti terzi (es. acquisto biglietti). L'Autore non è un intermediario di vendita, non gestisce pagamenti e non è responsabile per errori o mancati rimborsi su piattaforme esterne.",
            p5_title: "5. PROPRIETÀ INTELLETTUALE",
            p5_body: "Codice, design, logo \"Five2Go\" e testi originali sono proprietà dell'Autore. Vietata la copia e lo scraping senza consenso.",
            p6_title: "6. LEGGE APPLICABILE",
            p6_body: "L'Autore si riserva il diritto di modificare questi termini. Per qualsiasi controversia, farà fede la versione in lingua Italiana di questo documento e sarà competente il Foro di residenza dell'Autore.",
            lbl_doc: "Documentazione",
            lbl_privacy: "Privacy Policy",
            lbl_cookie: "Cookie Policy",
            lbl_consent: "Gestisci Consenso / Revoca",
            footer_rights: "Tutti i diritti riservati.",
            last_update: "Ultimo aggiornamento: Gennaio 2026"
        },
        en: {
            title: "Legal Notes",
            subtitle: "Terms of Use and Disclaimer",
            intro: "By downloading or using \"Five2Go\", the user agrees to the following conditions:",
            p1_title: "1. NON-OFFICIAL NATURE",
            p1_body: "<strong>No Affiliation:</strong> \"Five2Go\" is a private, independent project. It is NOT affiliated with the Cinque Terre National Park, local municipalities, Trenitalia, or any official entity.<br><br><strong>Information Only:</strong> Maps and schedules are for tourist reference only and have no legal validity. For official alerts, consult official channels.",
            p2_title: "2. HIKING RISKS & SAFETY",
            p2_body: "Hiking in Cinque Terre involves risks.<br><br><strong>Assumption of Risk:</strong> Use of GPX tracks is at your own exclusive risk. The Author is not liable for injuries or damages.<br><strong>Signage Priority:</strong> On-site signage ALWAYS overrides app data.<br><strong>Private Property:</strong> Respect private land. Do not trespass.<br><strong>Self-Evaluation:</strong> Users must evaluate their own fitness and equipment.",
            p3_title: "3. TECHNICAL LIMITS",
            p3_body: "GPS signal may be inaccurate due to rocky terrain. Do not rely solely on the app for safety.",
            p4_title: "4. TRANSPORT & THIRD PARTIES",
            p4_body: "Schedules are subject to change. The Author is not responsible for external ticket purchases, refunds, or service disruptions on third-party sites.",
            p5_title: "5. INTELLECTUAL PROPERTY",
            p5_body: "Code, design, and original texts are property of the Author. Copying is prohibited.",
            p6_title: "6. APPLICABLE LAW",
            p6_body: "In case of dispute, the Italian version of this document prevails. Competent court: Author's residence.",
            lbl_doc: "Documentation",
            lbl_privacy: "Privacy Policy",
            lbl_cookie: "Cookie Policy",
            lbl_consent: "Manage Consent",
            footer_rights: "All rights reserved.",
            last_update: "Last update: January 2026"
        },
        es: {
            title: "Notas Legales",
            subtitle: "Términos de Uso y Exención de Responsabilidad",
            intro: "Al utilizar \"Five2Go\", el usuario acepta las siguientes condiciones:",
            p1_title: "1. NATURALEZA NO OFICIAL",
            p1_body: "<strong>Sin Afiliación:</strong> \"Five2Go\" es un proyecto privado. NO está afiliado al Parque Nacional Cinque Terre ni a entidades oficiales.<br><br><strong>Solo Informativo:</strong> Los mapas y horarios son solo referencia turística. Para alertas oficiales, consulte los canales oficiales.",
            p2_title: "2. SEGURIDAD Y RIESGOS",
            p2_body: "El senderismo conlleva riesgos.<br><br><strong>Asunción de Riesgo:</strong> El uso de la App es bajo su propio riesgo. El Autor no se hace responsable de daños o lesiones.<br><strong>Prioridad de Señalización:</strong> Las señales en el sitio SIEMPRE prevalecen.<br><strong>Propiedad Privada:</strong> Respete la propiedad privada.<br><strong>Autoevaluación:</strong> El usuario debe evaluar su propia capacidad y equipo.",
            p3_title: "3. LÍMITES TÉCNICOS",
            p3_body: "La señal GPS puede ser inexacta en este terreno. No confíe únicamente en la App.",
            p4_title: "4. TRANSPORTE Y TERCEROS",
            p4_body: "Los horarios pueden cambiar. El Autor no es responsable de compras de billetes o reembolsos en sitios externos.",
            p5_title: "5. PROPIEDAD INTELECTUAL",
            p5_body: "El código y diseño son propiedad del Autor. Prohibida la copia.",
            p6_title: "6. LEY APLICABLE",
            p6_body: "En caso de disputa, prevalece la versión italiana. Tribunal competente: residencia del Autor.",
            lbl_doc: "Documentación",
            lbl_privacy: "Política de Privacidad",
            lbl_cookie: "Política de Cookies",
            lbl_consent: "Gestionar Consentimiento",
            footer_rights: "Todos los derechos reservados.",
            last_update: "Última actualización: Enero 2026"
        },
        fr: {
            title: "Mentions Légales",
            subtitle: "Conditions d'Utilisation",
            intro: "En utilisant \"Five2Go\", l'utilisateur accepte les conditions suivantes :",
            p1_title: "1. NATURE NON OFFICIELLE",
            p1_body: "<strong>Pas d'Affiliation :</strong> \"Five2Go\" est un projet privé. Il n'est PAS affilié au Parc National ou aux entités officielles.<br><br><strong>Informatif :</strong> Les cartes sont à titre indicatif. Consultez les canaux officiels pour les alertes.",
            p2_title: "2. SÉCURITÉ ET RISQUES",
            p2_body: "La randonnée comporte des risques.<br><br><strong>Acceptation des Risques :</strong> L'utilisation de l'App est à vos propres risques.<br><strong>Signalisation :</strong> Les panneaux sur place prévalent TOUJOURS.<br><strong>Propriété Privée :</strong> Respectez les terrains privés.<br><strong>Auto-évaluation :</strong> L'utilisateur doit évaluer ses capacités.",
            p3_title: "3. LIMITES TECHNIQUES",
            p3_body: "Le signal GPS peut être imprécis. Ne comptez pas uniquement sur l'App.",
            p4_title: "4. TRANSPORTS ET TIERS",
            p4_body: "Les horaires peuvent changer. L'Auteur n'est pas responsable des achats de billets externes.",
            p5_title: "5. PROPRIÉTÉ INTELLECTUELLE",
            p5_body: "Code et design appartiennent à l'Auteur. Copie interdite.",
            p6_title: "6. LOI APPLICABLE",
            p6_body: "En cas de litige, la version italienne prévaut.",
            lbl_doc: "Documentation",
            lbl_privacy: "Politique de Confidentialité",
            lbl_cookie: "Politique relative aux Cookies",
            lbl_consent: "Gérer le Consentement",
            footer_rights: "Tous droits réservés.",
            last_update: "Dernière mise à jour : Janvier 2026"
        },
        de: {
            title: "Rechtliche Hinweise",
            subtitle: "Nutzungsbedingungen",
            intro: "Durch die Nutzung von \"Five2Go\" akzeptiert der Benutzer folgende Bedingungen:",
            p1_title: "1. INOFFIZIELLER CHARAKTER",
            p1_body: "<strong>Keine Zugehörigkeit:</strong> \"Five2Go\" ist ein privates Projekt und NICHT mit dem Nationalpark oder offiziellen Stellen verbunden.<br><br><strong>Nur Informativ:</strong> Karten dienen nur der Orientierung.",
            p2_title: "2. SICHERHEIT & WANDERN",
            p2_body: "Wandern birgt Risiken.<br><br><strong>Risikoübernahme:</strong> Die Nutzung erfolgt auf eigene Gefahr. Der Autor haftet nicht für Schäden.<br><strong>Beschilderung:</strong> Vor-Ort-Schilder haben IMMER Vorrang.<br><strong>Privatbesitz:</strong> Respektieren Sie Privateigentum.<br><strong>Selbsteinschätzung:</strong> Prüfen Sie Ihre Ausrüstung und Kondition.",
            p3_title: "3. TECHNISCHE GRENZEN",
            p3_body: "GPS-Signal kann ungenau sein.",
            p4_title: "4. VERKEHR & DRITTE",
            p4_body: "Fahrpläne können sich ändern. Der Autor haftet nicht für externe Ticketkäufe.",
            p5_title: "5. GEISTIGES EIGENTUM",
            p5_body: "Code und Design sind Eigentum des Autors.",
            p6_title: "6. ANWENDBARES RECHT",
            p6_body: "Im Streitfall gilt die italienische Version.",
            lbl_doc: "Dokumentation",
            lbl_privacy: "Datenschutzbestimmungen",
            lbl_cookie: "Cookie-Richtlinie",
            lbl_consent: "Einwilligung verwalten",
            footer_rights: "Alle Rechte vorbehalten.",
            last_update: "Letzte Aktualisierung: Januar 2026"
        },
        zh: {
            title: "法律声明",
            subtitle: "使用条款和免责声明",
            intro: "下载、安装或使用 \"Five2Go\"，即表示用户完全理解并接受以下条件：",
            p1_title: "1. 非官方性质",
            p1_body: "<strong>无隶属关系：</strong> \"Five2Go\" 是一个独立的私人项目。本应用不代表五渔村国家公园 (Cinque Terre National Park)、当地市政厅、意大利铁路公司 (Trenitalia) 或任何官方机构，也与其无任何关联。<br><br><strong>仅供参考：</strong> 所有信息（地图、时刻表）仅供旅游参考，不具法律效力。对于官方预警（如天气警报、道路封闭），用户务必咨询官方渠道。",
            p2_title: "2. 徒步旅行与安全 (重要)",
            p2_body: "五渔村地区的徒步旅行存在地形相关的客观风险。<br><br><strong>风险承担：</strong> 用户使用 GPX 轨迹的后果自负。作者不对任何伤害、迷路或财产损失负责。<br><strong>现场指示优先：</strong> 现场的路标和官方指示始终优先于本应用的数据。<br><strong>私人领地：</strong> 轨迹可能会经过私人土地。用户有责任尊重他人财产，请勿擅闯。<br><strong>自我评估：</strong> 用户必须自行评估其体能和装备（如合适的鞋子）是否适合路线。",
            p3_title: "3. 技术限制",
            p3_body: "<strong>GPS 精度：</strong> 由于地形崎岖，GPS 信号可能不准确。请勿完全依赖本应用进行导航。<br><strong>电池与网络：</strong> 请考虑到可能出现的网络盲区或电池耗尽的情况。",
            p4_title: "4. 交通与第三方服务",
            p4_body: "时刻表汇总自公共来源，可能会发生变化。本应用包含第三方链接（如购票）。作者不是销售中介，不对外部平台上的错误、退款失败或服务中断负责。",
            p5_title: "5. 知识产权",
            p5_body: "代码、设计、\"Five2Go\" 徽标和原创文本均为作者的专有财产。严禁复制或抓取数据。",
            p6_title: "6. 适用法律",
            p6_body: "如有争议，以本文件的意大利语版本为准。管辖法院为作者所在地的法院。",
            lbl_doc: "法律文档",
            lbl_privacy: "隐私政策",
            lbl_cookie: "Cookie 政策",
            lbl_consent: "管理 Cookie 许可",
            footer_rights: "版权所有",
            last_update: "最后更新：2026年1月"
        }
    };

    const t = contentText[curLang] || contentText['en'];

    targetEl.innerHTML = `
    <div class="header-simple-list animate-fade">
        <button class="btn-back-custom" onclick="switchView('servizi')">
            <span class="material-icons">arrow_back</span>
        </button>
        <h2>${t.title}</h2>
    </div>

    <div class="legal-container animate-fade" style="padding-bottom:80px;">
        
        <div class="legal-card" style="text-align:left; font-size:0.9rem; line-height:1.6; padding:25px;">
            <div style="text-align:center; margin-bottom:20px;">
                <h3 class="legal-logo" style="margin:0;">Five2Go</h3>
                <p style="color:#666; font-size:0.8rem; margin-top:5px;">${t.subtitle}</p>
            </div>

            <p style="font-style:italic; font-size:0.85rem; color:#555; margin-bottom:20px;">${t.intro}</p>

            <div style="margin-bottom:15px;">
                <h4 style="margin-bottom:5px; color:var(--primary-dark); font-size:0.95rem;">${t.p1_title}</h4>
                <p>${t.p1_body}</p>
            </div>
            
            <div style="margin-bottom:15px;">
                <h4 style="margin-bottom:5px; color:var(--primary-dark); font-size:0.95rem;">${t.p2_title}</h4>
                <p>${t.p2_body}</p>
            </div>

            <div style="margin-bottom:15px;">
                <h4 style="margin-bottom:5px; color:var(--primary-dark); font-size:0.95rem;">${t.p3_title}</h4>
                <p>${t.p3_body}</p>
            </div>

            <div style="margin-bottom:15px;">
                <h4 style="margin-bottom:5px; color:var(--primary-dark); font-size:0.95rem;">${t.p4_title}</h4>
                <p>${t.p4_body}</p>
            </div>

            <div style="margin-bottom:15px;">
                <h4 style="margin-bottom:5px; color:var(--primary-dark); font-size:0.95rem;">${t.p5_title}</h4>
                <p>${t.p5_body}</p>
            </div>

            <div style="margin-bottom:0;">
                <h4 style="margin-bottom:5px; color:var(--primary-dark); font-size:0.95rem;">${t.p6_title}</h4>
                <p>${t.p6_body}</p>
            </div>
        </div>

        <h3 class="legal-section-title">${t.lbl_doc}</h3>
        <div class="legal-group">
            
            <a href="${activePrivacy}" target="_blank" class="legal-row">
                <div class="legal-row-left">
                    <span class="material-icons">lock</span>
                    <span>${t.lbl_privacy} (${curLang.toUpperCase()})</span>
                </div>
                <span class="material-icons" style="color:#ccc;">chevron_right</span>
            </a>

            <a href="${activeCookie}" target="_blank" class="legal-row">
                <div class="legal-row-left">
                    <span class="material-icons">description</span>
                    <span>${t.lbl_cookie} (${curLang.toUpperCase()})</span>
                </div>
                <span class="material-icons" style="color:#ccc;">chevron_right</span>
            </a>

            <a href="javascript:void(0)" 
               onclick="document.getElementById('ghost-cookie-btn').click()"
               class="legal-row" 
               style="text-decoration: none; color: inherit;">
                
                <div class="legal-row-left">
                    <span class="material-icons">cookie</span>
                    <span>${t.lbl_consent}</span>
                </div>
                <span class="material-icons" style="color:#ccc;">settings</span>
            </a>

        <div class="legal-footer-note">
            <strong>Five2Go</strong><br>
            Email: <a href="mailto:five2go.info@gmail.com" style="color:inherit; text-decoration:underline;">five2go.info@gmail.com</a><br>
            © 2026 Five2Go. ${t.footer_rights}<br>
            <br>
            <span style="opacity:0.6;">${t.last_update}</span>
        </div>

    </div>`;
};