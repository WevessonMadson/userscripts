// ==UserScript==
// @name         VR - Exportar Licenças
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Exibe e imprime licenças do cliente no VR Gestor
// @author       Wevesson Madson
// @match        *://vrgestor.vrsoft.com.br/clientecadastro*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/WevessonMadson/userscripts/main/vg-script-licencas.user.js
// @downloadURL  https://raw.githubusercontent.com/WevessonMadson/userscripts/main/vg-script-licencas.user.js
// ==/UserScript==

(function () {
    'use strict';

    function criarBotaoFlutuante() {
        if (document.getElementById('btn-exportar-licencas')) return;

        const botao = document.createElement('button');
        botao.id = 'btn-exportar-licencas';
        botao.innerHTML = '📄';

        Object.assign(botao.style, {
            position: 'fixed',
            bottom: '70px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: '#1976d2',
            color: '#fff',
            fontSize: '28px',
            cursor: 'pointer',
            zIndex: '999999',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        });

        botao.addEventListener('click', abrirLicencas);

        document.body.appendChild(botao);
    }

    async function abrirLicencas() {

        // abre aba de licenças
        const abaLicencas = document.querySelector('a[href="#fixed-tab-chaves"]');

        if (abaLicencas) {
            abaLicencas.click();
        }

        // pequeno delay para garantir renderização
        await new Promise(r => setTimeout(r, 500));

        const painel = document.querySelector('#fixed-tab-chaves');

        if (!painel) {
            alert('Painel de licenças não encontrado.');
            return;
        }

        // pega apenas os títulos das licenças
        const licencas = [];

        painel.querySelectorAll('th.mdl-data-table__cell--non-numeric').forEach(th => {

            let texto = th.innerText
                .replace('stop_circle', '')
                .trim();

            if (
                texto &&
                !licencas.includes(texto)
            ) {
                licencas.push(texto);
            }
        });

        abrirModal(licencas);
    }

    function abrirModal(licencas) {

        // remove modal anterior
        const modalExistente = document.getElementById('modal-licencas-vr');

        if (modalExistente) {
            modalExistente.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'modal-licencas-vr';

        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            zIndex: '999999'
        });

        const modal = document.createElement('div');

        Object.assign(modal.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            maxWidth: '95%',
            maxHeight: '90%',
            overflowY: 'auto',
            background: '#fff',
            borderRadius: '10px',
            padding: '25px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.4)',
            fontFamily: 'Arial'
        });

        const tituloCliente =
            document.querySelector('#txtcnpj')?.value?.trim() + " - " + document.querySelector('#txtnomefantasia')?.value?.trim()
            || 'Cliente';

        const htmlLicencas = licencas.map(item => `
            <tr>
                <td style="
                    border:1px solid #ccc;
                    padding:10px;
                    font-size:14px;
                ">
                    ${item}
                </td>
            </tr>
        `).join('');

        modal.innerHTML = `
            <div id="area-impressao">
                <p>
                    <strong>${tituloCliente}</strong>
                </p>

                <table style="
                    width:100%;
                    border-collapse:collapse;
                    margin-top:20px;
                ">

                    <tbody>
                        ${htmlLicencas}
                    </tbody>

                </table>

            </div>

            <div style="
                display:flex;
                gap:10px;
                justify-content:flex-end;
                margin-top:20px;
            ">

                <button id="btn-imprimir-licencas"
                    style="
                        padding:10px 20px;
                        border:none;
                        background:#2e7d32;
                        color:white;
                        cursor:pointer;
                        border-radius:5px;
                    ">
                    Imprimir / Salvar PDF
                </button>

                <button id="btn-fechar-modal"
                    style="
                        padding:10px 20px;
                        border:none;
                        background:#c62828;
                        color:white;
                        cursor:pointer;
                        border-radius:5px;
                    ">
                    Fechar
                </button>

            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        document.getElementById('btn-fechar-modal')
            .addEventListener('click', () => overlay.remove());

        document.getElementById('btn-imprimir-licencas')
            .addEventListener('click', imprimirConteudo);
    }

    function imprimirConteudo() {

        const conteudo = document.getElementById('area-impressao').innerHTML;

        const janela = window.open('', '', 'width=900,height=700');

        janela.document.write(`
            <html>
                <body>
                    ${conteudo}
                </body>
            </html>
        `);

        janela.document.close();

        setTimeout(() => {
            janela.print();
        }, 500);
    }

    // aguarda carregar
    window.addEventListener('load', () => {
        criarBotaoFlutuante();
    });

})();
