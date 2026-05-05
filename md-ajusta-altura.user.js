// ==UserScript==
// @name         Movidesk - ajustar altura do chat
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Ferramenta de visualização do chat que fica quebrado.
// @match        *://*.movidesk.com/*
// @updateURL    https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-ajusta-altura.user.js
// @downloadURL  https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-ajusta-altura.user.js
// ==/UserScript==

(function() {
    'use strict';
    document.addEventListener('keydown', function(e) {
        if (e.altKey && (e.key === 'a' || e.key === 'A')) {
            e.preventDefault(); e.stopPropagation();
            toogleHeightChat();
        }
    });


    function toogleHeightChat() {
        const numeroTicket = ticketAtual();
        let elementChat = document.querySelectorAll(`#tab-pane${numeroTicket} .ticket-container .tab-ticket-container .tab-ticket form .ticket-content .action-container .ticket-chat-container .chat-discussion`)[0];

        if (elementChat.style.maxHeight != "50vh") {
            elementChat.style.maxHeight = "50vh";
        } else {
            elementChat.style.maxHeight = "70vh";
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
