// ==UserScript==
// @name         Movidesk - interações automáticas
// @namespace    http://tampermonkey.net/
// @version      1.1.1
// @description  Ferramenta para automação de mensagens de atendimento.
// @match        *://*.movidesk.com/*
// @updateURL    https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-script-int-auto.user.js
// @downloadURL  https://raw.githubusercontent.com/WevessonMadson/userscripts/main/md-script-int-auto.user.js
// ==/UserScript==

(function() {
    'use strict';

    // =========================
    // 📌 CONFIG / CONSTANTES
    // =========================
    const menuPrincipal = "1- Inicio conversa\n2- Fim conversa\n3- Transferir\n4- Acesso ISL\n5- MENU Célula";
    const menuCelulas = "1- PDV\n2- ADM\n3- FISCAL\n4- CONSISTÊNCIA\n5- SERVIÇOS";
    const servicosMenu = "1- sair dos VRMaster\n2- podem usar os VR Master\n3- Atualizar PDVs";

    // =========================
    // 🚀 INIT / EVENTOS
    // =========================
    document.addEventListener('keydown', function(e) {
        if (e.altKey && (e.key === 'i' || e.key === 'I')) {
            e.preventDefault();
            e.stopPropagation();
            main();
        }
    });

    // =========================
    // 🧠 FLUXO PRINCIPAL
    // =========================
    function main() {
        const respostaMenu = exibeMenu(menuPrincipal);

        switch(respostaMenu) {
            case "1": inicioAtendimento(); break;
            case "2": finalAtendimento(); break;
            case "3": transferirAtendimento(); break;
            case "4": acessoISL(); break;
            case "5": exibeMenuCelulas(); break;
        }
    }

    // =========================
    // 📋 MENUs
    // =========================

    function exibeMenu(infoMenu) {
        return prompt(`SELECIONE A OPÇÃO:\n${infoMenu}`);
    }

    function exibeMenuCelulas() {
        const respostaMenu = exibeMenu(menuCelulas);

        switch(respostaMenu) {
            case "1":
            case "2":
            case "3":
            case "4":
                emDesenvolvimento();
                break;
            case "5": atualizacaoMenu(); break;
        }
    }

    // =========================
    // 📋 AÇÕES DOs MENUs
    // =========================

    function inicioAtendimento() {
        const resposta = prompt("1- completo\n2-só saudação");
        const hora = horaAtual();

        const saudacao = hora < 12
            ? "Bom dia!"
            : hora < 18
                ? "Boa tarde!"
                : "Boa noite!";

        switch(resposta) {
            case "1":
                escreveMensagem(`${saudacao}\nTudo bem?\nPor favor, me informa seu nome e telefone para caso de inatividade no chat.`);
                break;

            case "2":
                escreveMensagem(`${saudacao}\nTudo bem?`);
                break;
        }
    }

    function finalAtendimento() {
        const opcao = prompt("1- simples\n2- Com pedido de avaliacao");

        const hora = horaAtual();
        const diaSemana = diaSemanaAtual();

        const periodo = hora < 12
            ? "um dia abençoado."
            : `uma ${hora < 18 ? "tarde" : "noite"} abençoada.`;

        const tipoSemana = (diaSemana >= 1 && diaSemana <= 3)
            ? "uma semana abençoada"
            : "um final de semana abençoado.";

        const mensagem_avaliacao = `
<strong>Você poderia, por gentileza, realizar a avaliação do meu atendimento assim que ele for concluído? Sua opinião é muito importante para o nosso processo de melhoria contínua.</strong>

As avaliações são classificadas da seguinte forma:

<strong>0 a 7:</strong> Insatisfeito com o atendimento 😡

<strong>8 a 10:</strong> Satisfeito com o atendimento 😀

<strong>Caso queira, fique à vontade para deixar um comentário com sugestões, observações ou elogios. Seu feedback nos ajuda a evoluir e reconhecer o que está sendo feito com qualidade.</strong>`;

        if(opcao) escreveMensagem(`Tenha ${periodo}\nE desejo que você tenha ${tipoSemana}\naté mais 😊 ${opcao == "2" ? "\n" + mensagem_avaliacao : ""}`);
    }

    function transferirAtendimento() {
        const setores = ["ADM", "FISCAL", "PDV", "SERVIÇOS", "TRIBUTAÇÃO MATRIZ", "Consistência"];
        const setor = Number(prompt("SELECIONE O SETOR:\n1- ADM\n2- FISCAL\n3- PDV\n4- SERVIÇOS\n5- TRIBUTAÇÃO MATRIZ\n6- Consistência")) - 1;

        if (setores[setor]) escreveMensagem(`@${setores[setor]}:\n\nContato:`);
    }

    function acessoISL() {
        const isl = prompt("COLA O ISL AQUI");

        if(!isl) return;

        const computador = prompt("1- para servidor de APLICAÇÕES\n2- para servidor de BANCO\n3- para service MANAGER\n4- para PDV\n5- para computador qualquer");

        if(!computador) return;

        let linkIsl = "Se não tiver o ISL, pode baixar o ISL através do link: <a hfref='https://account.islonline.net/start/ISLLightClient' target='_blank'>https://account.islonline.net/start/ISLLightClient</a>";

        const mensagens = {
            "1": "servidor de aplicações (onde fica o concentrador)",
            "2": "servidor banco de dados",
            "3": "service manager",
            "4": "PDV",
            "5": "computador"
        }

        escreveMensagem(`ISL: ${isl}\n\ncoloca este código ISL no ${mensagens[computador]}\n\n${linkIsl}`);
    }

    function pdvMenu(){
        //const respostaMenu = exibeMenu(criar menu para colocar aqui);
    }

    function admMenu(){
        //const respostaMenu = exibeMenu(criar menu para colocar aqui);
    }

    function fiscalMenu(){
        //const respostaMenu = exibeMenu(criar menu para colocar aqui);
    }

    function consistenciaMenu(){
        //const respostaMenu = exibeMenu(criar menu para colocar aqui);
    }

    function atualizacaoMenu(){
        const respostaMenu = exibeMenu(servicosMenu);

        const mensagens = {
            "1": "Pede para todos sairem dos VR Master, por favor.\nE, assim que sairem, me avisa, por favor",
            "2": "Pronto, atualizou. Já podem usar os VR Master.",
            "3": "agora, por favor, atualiza os pdvs com a função 138 na tela de CAIXA LIVRE ou CAIXA FECHADO ou FECHADO PARCIAL"
        }

        if (mensagens[respostaMenu]) escreveMensagem(mensagens[respostaMenu]);
    }

    // =========================
    // 🛠️ HELPERS
    // =========================

    function horaAtual() {
        const agora = new Date();

        const horaBrasilia = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            hour12: false
        }).format(agora);

        return Number(horaBrasilia);
    }

    function diaSemanaAtual() {
        const agora = new Date();

        const dia = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            weekday: 'short'
        }).format(agora);

        const mapa = {
            dom: 0,
            seg: 1,
            ter: 2,
            qua: 3,
            qui: 4,
            sex: 5,
            sáb: 6
        };

        return mapa[dia.toLowerCase().replace(".", "")];
    }

    function emDesenvolvimento() {
        alert("Esse Menu ainda está em desenvolvimento");
    }

    // =========================
    // 🌐 DOM / INTERAÇÃO
    // =========================

    function escreveMensagem(mensagem) {
        const numeroTicket = ticketAtual();
        const textArea = document.querySelector(`#tab-pane${numeroTicket} div.input-message.input-mv-new`);

        if (!textArea) return;

        textArea.focus();

        const htmlContent = mensagem.replace(/\n/g, "<br>");

        const sucesso = document.execCommand('insertHTML', false, htmlContent);

        if (!sucesso) {
            textArea.innerHTML = htmlContent;
        }

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
