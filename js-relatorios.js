function atualizarFiltrosRelatorio() {
    const concluidas = demandas.filter(d => d.status === 'Concluída');
    const setores = [...new Set(concluidas.map(d => d.setor))].filter(Boolean).sort();
    const solicitantes = [...new Set(concluidas.map(d => d.solicitante))].filter(Boolean).sort();

    const selectSetor = document.getElementById('filtroSetor');
    const selectSolicitante = document.getElementById('filtroSolicitante');
    const valSetor = selectSetor?.value;
    const valSolicitante = selectSolicitante?.value;

    if (selectSetor) {
        selectSetor.innerHTML = '<option value="">Todos os Setores</option>' + 
            setores.map(s => `<option value="${s}">${s}</option>`).join('');
        if (setores.includes(valSetor)) selectSetor.value = valSetor;
    }

    if (selectSolicitante) {
        selectSolicitante.innerHTML = '<option value="">Todos os Solicitantes</option>' + 
            solicitantes.map(s => `<option value="${s}">${s}</option>`).join('');
        if (solicitantes.includes(valSolicitante)) selectSolicitante.value = valSolicitante;
    }

    atualizarContadorFiltro();
}

function atualizarContadorFiltro() {
    const total = getDemandasConcluidas().length;
    const el = document.getElementById('contadorFiltro');
    if (el) el.textContent = total;
}

function getDemandasConcluidas() {
    const turno = document.getElementById('filtroTurno')?.value || '';
    const setor = document.getElementById('filtroSetor')?.value || '';
    const solicitante = document.getElementById('filtroSolicitante')?.value || '';

    return demandas.filter(d => {
        if (d.status !== 'Concluída') return false;
        if (setor && d.setor !== setor) return false;
        if (solicitante && d.solicitante !== solicitante) return false;

        if (turno) {
            const hora = parseInt(d.horario.split(':')[0]);
            if (turno === 'manha' && (hora < 6 || hora >= 12)) return false;
            if (turno === 'tarde' && (hora < 12 || hora >= 18)) return false;
            if (turno === 'noite' && (hora >= 6 && hora < 18)) return false;
        }
        return true;
    }).sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro));
}

function gerarTabelaRelatorio() {
    const concluidas = getDemandasConcluidas();
    let tbody = '';

    if (concluidas.length === 0) {
        tbody = '<tr><td colspan="9" style="padding: 15px; text-align: center; color: #6b7280;">Nenhuma demanda concluída encontrada com os filtros atuais.</td></tr>';
    } else {
        concluidas.forEach(d => {
            tbody += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 8px; font-size: 14px;">${formatarDataBrasil(d.dataDemanda)}</td>
                    <td style="padding: 12px 8px; font-size: 14px; font-weight: bold;">${d.horario}</td>
                    <td style="padding: 12px 8px; font-size: 14px;">${d.solicitante}<br><span style="font-size: 12px; color: #6b7280;">${d.setor}</span></td>
                    <td style="padding: 12px 8px; font-size: 14px;">${d.partida}</td>
                    <td style="padding: 12px 8px; font-size: 14px;">${d.destino}</td>
                    <td style="padding: 12px 8px; font-size: 14px; font-weight: 500;">${d.nomeMotorista || '-'}</td>
                    <td style="padding: 12px 8px; font-size: 14px;">${d.placaVeiculo || '-'}</td>
                    <td style="padding: 12px 8px; font-size: 14px;">${d.numeroSei || '-'}</td>
                    <td style="padding: 12px 8px; font-size: 14px; color: #4b5563;">
                        <span style="font-size: 11px;">Cad: ${d.cadastradoPor || '-'}</span><br>
                        <span style="font-size: 11px;">Baixa: ${d.concluidoPor || '-'}</span>
                    </td>
                </tr>
            `;
        });
    }

    return `
        <table id="tabelaRelatorio" style="width: 100%; border-collapse: collapse; font-family: ui-sans-serif, system-ui, sans-serif; text-align: left; background: white; border-radius: 8px; overflow: hidden;">
            <thead style="background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #6b7280 100%); color: white;">
                <tr>
                    <th style="padding: 15px 8px; font-size: 14px;">Data</th>
                    <th style="padding: 15px 8px; font-size: 14px;">Hora</th>
                    <th style="padding: 15px 8px; font-size: 14px;">Solicitante / Setor</th>
                    <th style="padding: 15px 8px; font-size: 14px;">Partida</th>
                    <th style="padding: 15px 8px; font-size: 14px;">Destino</th>
                    <th style="padding: 15px 8px; font-size: 14px;">Motorista</th>
                    <th style="padding: 15px 8px; font-size: 14px;">Placa</th>
                    <th style="padding: 15px 8px; font-size: 14px;">Nº SEI</th>
                    <th style="padding: 15px 8px; font-size: 14px;">Operador</th>
                </tr>
            </thead>
            <tbody>${tbody}</tbody>
        </table>
    `;
}

function gerarEstruturaPagina(titulo, botoesExtras = '', scriptExtra = '') {
    const turno = document.getElementById('filtroTurno')?.options[document.getElementById('filtroTurno')?.selectedIndex]?.text || 'Todos';
    const setor = document.getElementById('filtroSetor')?.value || 'Todos';
    const solicitante = document.getElementById('filtroSolicitante')?.value || 'Todos';

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>${titulo}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { background-color: #f3f4f6; padding: 2rem; font-family: ui-sans-serif, system-ui, sans-serif; }
                .container { max-width: 1200px; margin: 0 auto; }
                @media print {
                    .no-print { display: none !important; }
                    body { background-color: white; padding: 0; }
                    .container { max-width: 100%; box-shadow: none; border: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="bg-white p-6 rounded-t-xl border-b-4 border-purple-600 flex justify-between items-start md:items-center shadow-sm">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">TRANSPORTE & DEMANDAS - SEMCAS</h1>
                        <h2 class="text-lg text-gray-600 font-medium">${titulo}</h2>
                        <p class="text-sm text-gray-500 mt-1">Gerado em: ${new Date().toLocaleString('pt-BR')} por TransportHub</p>
                    </div>
                    <div class="no-print flex space-x-2">
                        ${botoesExtras}
                        <button onclick="window.close()" class="px-4 py-2 bg-gray-500 text-white rounded-lg">Fechar</button>
                    </div>
                </div>
                <div class="bg-purple-50 px-6 py-3 border-x border-b border-gray-200 text-sm text-purple-900 flex gap-6 font-medium">
                    <span><strong>Turno:</strong> ${turno}</span>
                    <span><strong>Setor:</strong> ${setor}</span>
                    <span><strong>Solicitante:</strong> ${solicitante}</span>
                </div>
                <div class="mt-4 shadow-lg rounded-xl overflow-hidden border border-gray-200">
                    ${gerarTabelaRelatorio()}
                </div>
            </div>
            ${scriptExtra}
        </body>
        </html>
    `;
}

function gerarRelatorioHTML() {
    const janela = window.open('', '_blank');
    const botaoImprimir = '<button onclick="window.print()" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Imprimir Relatório</button>';
    janela.document.write(gerarEstruturaPagina('Relatório de Demandas Concluídas', botaoImprimir));
    janela.document.close();
}

function gerarRelatorioPDF() {
    const janela = window.open('', '_blank');
    janela.document.write(gerarEstruturaPagina('Relatório de Demandas Concluídas (Pronto para PDF)'));
    janela.document.close();
    setTimeout(() => { janela.print(); }, 1000);
}

function gerarViewExcel() {
    const botaoExcel = `
        <button onclick="baixarExcel()" class="px-6 py-2 bg-green-600 text-white rounded-lg">Download Excel</button>
    `;
    const scriptExcel = `
        <script>
            function baixarExcel() {
                const tabela = document.getElementById('tabelaRelatorio').outerHTML;
                const htmlBase = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>' + tabela + '</body></html>';
                const blob = new Blob([htmlBase], { type: 'application/vnd.ms-excel' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'SEMCAS_Demandas_Filtradas.xls';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        </script>
    `;
    const janela = window.open('', '_blank');
    janela.document.write(gerarEstruturaPagina('Exportação Excel', botaoExcel, scriptExcel));
    janela.document.close();
}