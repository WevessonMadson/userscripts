// ==UserScript==
// @name         Movidesk - respostas
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Ferramenta para automação de mensagens de atendimento.
// @match        *://*.movidesk.com/*
// @updateURL    https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-resposta.user.js
// @downloadURL  https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-resposta.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ===== CAPTURA ALT + CLIQUE =====
    document.addEventListener('click', function(e) {
        if (!e.altKey) return;

        const container = e.target.closest(".message-container");
        if (!container) return;

        e.preventDefault();
        e.stopPropagation();

        const resposta = montarResposta(container, e.target);
        escreveMensagem(resposta);
    });

    // ===== MONTA A RESPOSTA (ESTILO WHATSAPP) =====
    function montarResposta(elementoContainer, elementoClicado) {
        const usuario = elementoContainer.querySelector(".user")?.innerText.trim() || "";
        const hora = elementoContainer.querySelector(".time")?.innerText.trim() || "";

        let texto = "";

        // 👇 Se clicou em uma mensagem específica
        if (elementoClicado.classList.contains("message")) {
            texto = elementoClicado.innerText.trim();
        }
        // 👇 Se clicou na caixa (ou qualquer outro ponto dela)
        else {
            const mensagens = elementoContainer.querySelectorAll(".message");

            texto = Array.from(mensagens)
                .map(m => m.innerText.trim())
                .filter(t => t)
                .join("\n");
        }

        return `<strong>> ${usuario} - ${hora}:</strong> \n${texto} <strong><</strong>\n\n<strong>Resposta:</strong> `;
    }

    // =========================
    // 🌐 DOM / INTERAÇÃO
    // =========================

    function escreveMensagem(mensagem) {
        const numeroTicket = ticketAtual();
        const textArea = document.querySelector(`#tab-pane${numeroTicket} div.input-message.input-mv-new`);

        if (!textArea) return;

        textArea.focus();

        // MAIS SEGURO: inserir como texto
        const sucesso = document.execCommand('insertText', false, mensagem);

        if (!sucesso) {
            textArea.innerText += mensagem;
        }

        // ESSENCIAL: avisar o sistema que mudou
        textArea.dispatchEvent(new Event('input', { bubbles: true }));

        textArea.focus();
    }

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
