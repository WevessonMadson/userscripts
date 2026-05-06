// ==UserScript==
// @name         Movidesk - mover chat matriz
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Ferramenta de visualização para chat matriz no Movidesk.
// @match        *://*.movidesk.com/*
// @updateURL    https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-move-matriz.user.js
// @downloadURL  https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-move-matriz.user.js
// ==/UserScript==

(function() {
    'use strict';
    'use strict';

    function applyStyle() {
        const elementChat = document.querySelector(
            ".md-chat-widget-btn-wrapper[data-expanded='true']"
        );

        if (!elementChat) return;

        const icon = elementChat.querySelector(".md-chat-widget-btn-icon");
        const title = elementChat.querySelector(".md-chat-widget-btn-title");

        if (title) {
            title.style.display = "none";
        }

        if (icon) {
            icon.style.marginRight = "15px";
        }
    }

    // observa mudanças no DOM (Movidesk recria isso direto)
    const observer = new MutationObserver(applyStyle);

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // primeira execução
    applyStyle();
})();
