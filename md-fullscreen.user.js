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
      let sidebar = document.querySelector("#ticket-sidebar");
      let chat =  document.querySelector("div.col-md-9");

      if (chat.style.width != "100%") {
        chat.style.width = "100%";
        sidebar.classList.add("hidden");
      } else {
        chat.style.width = "75%";
        sidebar.classList.remove("hidden");
      }  
    }  
})();
