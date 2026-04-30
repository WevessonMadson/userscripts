// ==UserScript==
// @name         Movidesk - mover chat matriz
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Ferramenta de visualização para chat matriz no Movidesk.
// @match        *://*.movidesk.com/*
// @updateURL    https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-move-matriz.user.js
// @downloadURL  https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-move-matriz.user.js
// ==/UserScript==

(function() {
    'use strict';
    document.addEventListener('keydown', function(e) {
        if (e.altKey && (e.key === 'm' || e.key === 'M')) {
            e.preventDefault(); e.stopPropagation();
            tooglePositionChat();
        }
    });


    function tooglePositionChat() {
        let elementChat = document.querySelector(".md-chat-widget-btn-container .md-chat-widget-btn-wrapper[data-expanded='true']");

        if (elementChat.childNodes[2].style.display != "none") {
            elementChat.childNodes[2].style.display = "none";
            elementChat.childNodes[1].style.marginRight = "15px";
        } else {
            elementChat.childNodes[2].style.display = "";
            elementChat.childNodes[1].style.marginRight = "0px";
        }
    }
})();
