// ==UserScript==
// @name         Movidesk - ajustar altura do chat
// @namespace    http://tampermonkey.net/
// @version      1.0.0
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
        let elementsChat = document.querySelectorAll(".ticket-container .tab-ticket-container .tab-ticket form .ticket-content .action-container .ticket-chat-container .chat-discussion");

        elementsChat.forEach(elementChat => {
            if (elementChat.style.maxHeight != "50vh") {
                elementChat.style.maxHeight = "50vh";
            } else {
                elementChat.style.maxHeight = "70vh";
            }
        });
    }
})();
