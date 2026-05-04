// ==UserScript==
// @name         Movidesk - deixar conversa full
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Ferramenta de deixar o chat tela full.
// @match        *://*.movidesk.com/*
// @updateURL    https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-fullscreen.user.js
// @downloadURL  https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-fullscreen.user.js
// ==/UserScript==

(function() {
    'use strict';
    document.addEventListener('keydown', function(e) {
        if (e.altKey && (e.key === 'f' || e.key === 'F')) {
            e.preventDefault(); e.stopPropagation();
            toggleFullScreen();
        }
    });


    function toggleFullScreen() {
        const numeroTicket = ticketAtual();
        let sidebar = document.querySelector(`#tab-pane${numeroTicket} #ticket-sidebar`);
        let chat = document.querySelector(`#tab-pane${numeroTicket} div.col-md-9`);

        if (chat.style.width != "100%") {
            chat.style.width = "100%";
            sidebar.classList.add("hidden");
        } else {
            chat.style.width = "75%";
            sidebar.classList.remove("hidden");
        }
    }

    // =========================
    // 🌐 DOM / INTERAÇÃO
    // =========================

    function ticketAtual() {
        let id = getUrlId();

        if (!id) {
            const abaAtiva = document.querySelector('ul.ui-tabs-nav li.ui-tabs-active a, ul.nav-tabs li.active a');
            if (abaAtiva) {
                const match = abaAtiva.innerText.match(/(\d{6,})/);
                if (match) id = match[0];
            }
        }

        if (!id) {
            const matchTitle = document.title.match(/(\d{6,})/);
            if (matchTitle) id = matchTitle[0];
        }

        return id;
    }

    function getUrlId() {
        const parts = window.location.href.split('/');
        const lastPart = parts[parts.length - 1].split('?')[0];

        if (!isNaN(lastPart)) return lastPart;

        const match = window.location.href.match(/(\d{6,})/);
        return match ? match[0] : null;
    }
})();
