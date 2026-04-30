// ==UserScript==
// @name         Movidesk - Não Avaliados
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Ferramenta de produtividade compartilhada para Movidesk.
// @author       Luiz (GustavinhoVr - Desenvolvimento proprio)
// @copyright    2026, Luiz André - Distribuído sob Licença MIT.
// @license      MIT (Uso Livre e Gratuito)
// @match        *://*.movidesk.com/*
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-nao-avaliados.user.js
// @downloadURL  https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-nao-avaliados.user.js
// ==/UserScript==

/*
 * ======================================================================================
 * 🤝 TERMOS DE USO E COMPARTILHAMENTO
 * ======================================================================================
 * SOBRE:
 * Este script foi desenvolvido para agilizar nosso dia a dia no atendimento.
 * Ele é disponibilizado gratuitamente pelo autor para uso dos colegas.
 *
 * ISENÇÃO DE RESPONSABILIDADE (DISCLAIMER):
 * 1. O software é fornecido "como está", sem garantias.
 * 2. O uso é voluntário e de total responsabilidade do usuário.
 * 3. O autor não se responsabiliza por futuras falhas no Movidesk que possam acarretar
 * o mal funcionamento do script
 *
 * Fique à vontade para usar e compartilhar e reportar bugs ou melhorias! 🚀
 * ======================================================================================
 */

(function() {
    'use strict';

    // =================================================================
    // 1. CONFIGURAÇÕES E CONSTANTES
    // =================================================================
    const DIAS_ATRAS = 30;
    const STORAGE_KEY_FILTER = "movidesk_auto_filter_pending";
    const STORAGE_KEY_TICKET = "movidesk_current_ticket_id";

    const COR_DESTAQUE = "#d4edda";
    const COR_IGNORADO = "#f8f9fa";

    // --- LISTA NEGRA (FILTRO DE EXCLUSÃO) ---
    const PALAVRAS_IGNORADAS = [
        "inatividade",
        "reclamacao",
        "reclamação",
        "desistencia",
        "desistência"
    ];

    // --- TEXTO PADRÃO: CABEÇALHO ---
    const MENSAGEM_CABEÇALHO = `Aproveitando o atendimento verificamos em nossa base de dados que existem tickets anteriores que não foram avaliados, se possível, poderia avaliar esses tickets pendente e nos ajudar a melhorar nossos atendimentos e lhe atender cada vez melhor?

só clicar ou copiar link colocando no seu navegador, que vai direcionar diretamente para o ticket
`;

    // --- TEXTO PADRÃO: RODAPÉ ---
    const MENSAGEM_RODAPE = `
0 a 7: Insatisfeito com o atendimento ❌

8 a 10: Satisfeito com o atendimento ✅`;

    let idsCopiados = new Set();
    let pintorAtivo = null;
    let notificationTimer = null;

    console.log("📘 Movidesk V1: Script Carregado.");

    iniciarSentinela();

    // =================================================================
    // 2. ESCUTA DE TECLAS (ATALHOS) - TUTORIAL DE CONFIGURAÇÃO
    // =================================================================
    /* 📝 COMO MUDAR OS ATALHOS?
       -------------------------------------------------------------
       Caso precise alterar as teclas, edite as linhas abaixo (dentro dos 'if').

       1. PARA MUDAR A LETRA:
          Onde estiver: (e.key === 'c' || e.key === 'C')
          Troque por:   (e.key === 'x' || e.key === 'X') -> Para usar a tecla X.

       2. PARA MUDAR DE 'ALT' PARA 'CTRL':
          Onde estiver: e.altKey
          Troque por:   e.ctrlKey

       EXEMPLO PRÁTICO (Mudar de Alt+C para Ctrl+J):
       if (e.ctrlKey && (e.key === 'j' || e.key === 'J')) { ... }
    */

    document.addEventListener('keydown', function(e) {

        // --- ATALHO DE CÓPIA E RETORNO (PADRÃO: ALT + C) ---
        if (e.altKey && (e.key === 'c' || e.key === 'C')) {
            e.preventDefault(); e.stopPropagation();
            memorizarTicketAtual();
            setTimeout(iniciarFluxoFiltro, 50);
            setTimeout(() => {
                e.preventDefault(); e.stopPropagation();
                executarCopiaEVoltar();
            }, 6000)
        }

        // --- ATALHO DE NAVEGAÇÃO PARA CLIENTE (PADRÃO: ALT + Q) ---
        if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
            e.preventDefault(); e.stopPropagation();
            memorizarTicketAtual();
            setTimeout(iniciarFluxoFiltro, 50);
        }
    });

    // =================================================================
    // 3. FUNÇÃO DE PREENCHIMENTO DO CHAT (HTML RICO)
    // =================================================================
    function tentarPreencherChat(textoFinal) {
        console.log("✍ Inserindo mensagem formatada no chat...");

        const inputs = document.querySelectorAll('div[contenteditable="true"], textarea');
        let chatInput = null;

        for (let el of inputs) {
            if (isVisible(el)) {
                const rect = el.getBoundingClientRect();
                if (rect.top > window.innerHeight * 0.4) {
                    chatInput = el;
                    break;
                }
            }
        }

        if (chatInput) {
            notificar("📝 Escrevendo...", "#17a2b8");
            chatInput.focus();
            chatInput.click();

            let htmlContent = textoFinal.replace(/\n/g, '<br>');

            htmlContent = htmlContent.replace(
                /(https?:\/\/[^\s<]+)/g,
                '<a href="$1" target="_blank" style="color: #0056b3; text-decoration: underline;">$1</a>'
            );

            const sucesso = document.execCommand('insertHTML', false, htmlContent);

            if (!sucesso) {
                if (chatInput.tagName === 'TEXTAREA') {
                    chatInput.value = textoFinal;
                } else {
                    chatInput.innerHTML = htmlContent;
                }
            }

            ['input', 'change', 'keydown', 'keyup'].forEach(evtName => {
                chatInput.dispatchEvent(new Event(evtName, { bubbles: true }));
            });
            chatInput.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', keyCode: 32, bubbles: true }));

            notificar("✅ Mensagem pronta!", "#28a745");
        } else {
            notificar("⚠️ Chat não encontrado. (Tente colar manualmente)", "#ffc107");
        }
    }

    // =================================================================
    // 4. LÓGICA PRINCIPAL DE CÓPIA
    // =================================================================
    function executarCopiaEVoltar() {
        let registros = [];
        idsCopiados.clear();

        const grids = document.querySelectorAll('.slick-viewport');
        for(let g of grids) {
            if(isVisible(g) && g.offsetHeight > 50) {
                registros = g.getElementsByClassName("ui-widget-content slick-row");
                break;
            }
        }
        if (!registros || registros.length === 0) {
            registros = document.getElementsByClassName("ui-widget-content slick-row");
        }

        let linksAcumulados = "";
        let count = 0;
        let ignorados = 0;

        for (let registro of registros) {
            if (!isVisible(registro)) continue;

            const textoLinha = registro.innerText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            const deveIgnorar = PALAVRAS_IGNORADAS.some(palavra => {
                 const palavraLimpa = palavra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                 return textoLinha.includes(palavraLimpa);
            });

            if (deveIgnorar) {
                registro.style.opacity = "0.5";
                registro.style.backgroundColor = COR_IGNORADO;
                ignorados++;
                continue;
            }

            if (registro.children[1] && registro.children[1].children[0]) {
                const idTicket = registro.children[1].children[0].innerText.trim();
                if (idTicket && !isNaN(idTicket)) {
                    linksAcumulados += `https://vrsoftware.movidesk.com/Ticket/Edit/${idTicket}\n`;
                    idsCopiados.add(idTicket);
                    count++;
                }
            }
        }

        // --- LÓGICA DE DECISÃO E RETORNO ---
        if (linksAcumulados) {
            const textoFinal = linksAcumulados + '\n' + MENSAGEM_CABEÇALHO + MENSAGEM_RODAPE;

            copiarParaClipboard(textoFinal);
            iniciarPintor();
            notificar(`✅ ${count} Coletados! Voltando...`, "#28a745");

            voltarParaTicket();

            setTimeout(() => {
                tentarPreencherChat(textoFinal);
            }, 1200);

        }
        else if (ignorados > 0) {
            notificar(`⚠️ Apenas tickets ignorados (${ignorados}). Voltando...`, "#ffc107");
            setTimeout(voltarParaTicket, 800);
        }
        else {
            notificar("⚠️ Nenhum ticket encontrado. Voltando...", "#ffc107");
            setTimeout(voltarParaTicket, 800);
        }
    }

    // =================================================================
    // 5. FUNÇÕES DE INTERFACE (UI)
    // =================================================================
    function notificar(texto, cor) {
        const existente = document.getElementById("movidesk-custom-toast");
        if (existente) existente.remove();

        const div = document.createElement("div");
        div.id = "movidesk-custom-toast";
        div.style.cssText = `position: fixed; top: 70px; right: 20px; background: ${cor}; color: white; padding: 10px 20px; border-radius: 6px; z-index: 9999999; font-family: 'Segoe UI', Arial; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); animation: fadeIn 0.2s ease-out; pointer-events: none;`;
        div.innerText = texto;
        document.body.appendChild(div);

        if (!document.getElementById("movidesk-toast-style")) {
            const style = document.createElement('style');
            style.id = "movidesk-toast-style";
            style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`;
            document.head.appendChild(style);
        }

        if (notificationTimer) clearTimeout(notificationTimer);
        notificationTimer = setTimeout(() => {
            if (div) {
                div.style.transition = "opacity 0.3s";
                div.style.opacity = "0";
                setTimeout(() => div.remove(), 300);
            }
        }, 2500);
    }

    function iniciarPintor() {
        if (pintorAtivo) return;
        pintorAtivo = setInterval(() => {
            if (idsCopiados.size === 0) return;
            const linhas = document.getElementsByClassName("ui-widget-content slick-row");
            for (let linha of linhas) {
                if (linha.children[1] && linha.children[1].children[0]) {
                    const idTexto = linha.children[1].children[0].innerText.trim();
                    if (idsCopiados.has(idTexto) && linha.style.backgroundColor !== COR_DESTAQUE) {
                        linha.style.transition = "background-color 0.2s";
                        linha.style.backgroundColor = COR_DESTAQUE;
                    }
                }
            }
        }, 300);
    }

    // =================================================================
    // 6. FUNÇÕES DE NAVEGAÇÃO E MEMÓRIA
    // =================================================================
    function voltarParaTicket() {
        const idTicket = sessionStorage.getItem(STORAGE_KEY_TICKET);
        if (!idTicket) return;

        const todosElementos = document.body.getElementsByTagName("*");
        let alvo = null;

        for (let el of todosElementos) {
            if (!isVisible(el)) continue;
            const rect = el.getBoundingClientRect();
            if (rect.top > 150) continue;

            if (el.innerText && el.innerText.includes(idTicket)) {
                const temFilhoComTexto = Array.from(el.children).some(child => child.innerText.includes(idTicket));
                if (!temFilhoComTexto) {
                     alvo = el;
                     if (el.tagName === 'A') break;
                }
            }
        }
        if (alvo) cliqueEmCascata(alvo);
    }

    function cliqueEmCascata(elemento) {
        if (!elemento) return;
        const bordaOriginal = elemento.style.border;
        elemento.style.border = "2px solid red";
        setTimeout(() => { elemento.style.border = bordaOriginal; }, 500);

        let atuais = [elemento];
        let atual = elemento;
        for (let i = 0; i < 4; i++) {
            if (atual.parentElement) {
                atual = atual.parentElement;
                atuais.push(atual);
            }
        }
        atuais.forEach((el, index) => {
            setTimeout(() => {
                if (el.click) el.click();
                const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
                el.dispatchEvent(evt);
            }, index * 50);
        });
    }

    function memorizarTicketAtual() {
        let id = getUrlId();
        if (!id) {
            const abaAtiva = document.querySelector('ul.ui-tabs-nav li.ui-tabs-active a, ul.nav-tabs li.active a');
            if (abaAtiva) { const match = abaAtiva.innerText.match(/(\d{6,})/); if (match) id = match[0]; }
        }
        if (!id) { const matchTitle = document.title.match(/(\d{6,})/); if (matchTitle) id = matchTitle[0]; }

        if (id) {
            sessionStorage.setItem(STORAGE_KEY_TICKET, id);
            return true;
        }
        return false;
    }

    function iniciarSentinela() {
        setInterval(() => {
            if (sessionStorage.getItem(STORAGE_KEY_FILTER) === "true") {
                const searchInput = encontrarInputBusca();
                if (searchInput) {
                    sessionStorage.removeItem(STORAGE_KEY_FILTER);
                    aplicarTextoFiltro(searchInput);
                    notificar("✅ Filtro aplicado!", "#28a745");
                }
            }
        }, 600);
    }

    function iniciarFluxoFiltro() {
        try {
            const searchInput = encontrarInputBusca();
            if (searchInput) {
                aplicarTextoFiltro(searchInput);
            } else {
                sessionStorage.setItem(STORAGE_KEY_FILTER, "true");
                navegarParaCliente();
            }
        } catch (err) { console.error(err); }
    }

    function navegarParaCliente() {
        let elementoAlvo = null;
        const containers = document.querySelectorAll('.breadcrumb, .page-header, #main-header, h1');
        let todosLinksTopo = [];

        containers.forEach(container => {
            if (isVisible(container)) {
                const links = container.querySelectorAll('a');
                links.forEach(l => { if (isVisible(l) && l.innerText.trim().length > 1) todosLinksTopo.push(l); });
            }
        });

        if (todosLinksTopo.length > 0) {
            let ultimoLink = todosLinksTopo[todosLinksTopo.length - 1];
            if (/^\d+$/.test(ultimoLink.innerText.trim())) {
                if (todosLinksTopo.length > 1) elementoAlvo = todosLinksTopo[todosLinksTopo.length - 2];
                else elementoAlvo = ultimoLink;
            } else elementoAlvo = ultimoLink;
        }

        if (!elementoAlvo) {
            const sidebar = document.querySelector('aside, .sidebar, .panel');
            if (sidebar) {
                const inputSolicitante = sidebar.querySelector('input');
                if (inputSolicitante) {
                    const linksSidebar = sidebar.querySelectorAll('a');
                    for (let l of linksSidebar) {
                        if (isVisible(l) && (inputSolicitante.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_FOLLOWING)) {
                             const txt = l.innerText.trim();
                             if (txt.length > 2 && !txt.includes("Buscar") && !txt.includes("Alterar") && !l.href.includes("mailto")) {
                                 elementoAlvo = l;
                                 break;
                             }
                        }
                    }
                }
            }
        }
        if (elementoAlvo) {
            notificar(`✈️ Indo para: ${elementoAlvo.innerText.trim()}`, "#17a2b8");
            elementoAlvo.click();
        } else {
            notificar("⚠️ Link cliente não encontrado.", "#ffc107");
        }
    }

    // =================================================================
    // 7. HELPERS (FUNÇÕES UTILITÁRIAS)
    // =================================================================

    function encontrarInputBusca() {
        const urlId = getUrlId();
        if (urlId) {
            const activeTab = document.querySelector(`div[data-id="${urlId}"]`);
            if (activeTab) {
                const inputs = activeTab.querySelectorAll('input');
                for (let el of inputs) {
                    const place = (el.placeholder || "").toLowerCase();
                    if (isVisible(el) && (place.includes("pesquisar") || place.includes("digite"))) return el;
                }
            }
        }
        const allInputs = document.querySelectorAll('input[type="text"], input[type="search"]');
        for (let el of allInputs) {
            const place = (el.placeholder || "").toLowerCase();
            if (isVisible(el) && (place.includes("pesquisar") || place.includes("digite"))) {
                if (!el.closest('#chat-widget-container')) return el;
            }
        }
        return null;
    }

    function aplicarTextoFiltro(searchInput) {
        const hoje = new Date();
        const passado = new Date();
        passado.setDate(hoje.getDate() - DIAS_ATRAS);
        const dataFim = formatarData(hoje);
        const dataInicio = formatarData(passado);

        const filtro = `StartCreatedDate:{${dataInicio}} EndCreatedDate:{${dataFim}} ShowOnlyWithSatisfactionSurveyResponse:{False}`;

        searchInput.focus();
        searchInput.value = filtro;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));

        setTimeout(() => {
            const keyConfig = { bubbles: true, cancelable: true, keyCode: 13, key: 'Enter', code: 'Enter', which: 13 };
            searchInput.dispatchEvent(new KeyboardEvent('keydown', keyConfig));
            searchInput.dispatchEvent(new KeyboardEvent('keypress', keyConfig));
            searchInput.dispatchEvent(new KeyboardEvent('keyup', keyConfig));

            const parent = searchInput.parentNode;
            const btnLupa = parent.querySelector('.icon-search, .fa-search') || searchInput.nextElementSibling;
            if (btnLupa && isVisible(btnLupa)) btnLupa.click();
        }, 300);
    }

    function getUrlId() {
        const parts = window.location.href.split('/');
        const lastPart = parts[parts.length - 1].split('?')[0];
        if(!isNaN(lastPart)) return lastPart;
        const match = window.location.href.match(/(\d{6,})/);
        return match ? match[0] : null;
    }

    function isVisible(elem) {
        if (!elem) return false;
        return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length ) && window.getComputedStyle(elem).visibility !== 'hidden';
    }

    function formatarData(date) {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    }

    function copiarParaClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
})();
