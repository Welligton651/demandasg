var chartExpedienteInstance = null;
var chartSetoresInstance = null;

function renderDashboardCharts() {
    if (typeof demandas === 'undefined') return;

    var manha = 0, tarde = 0;
    demandas.forEach(d => {
        const hora = parseInt(d.horario.split(':')[0]);
        if (hora >= 6 && hora < 12) manha++;
        else tarde++; 
    });

    const ctxExp = document.getElementById('chartExpediente');
    if (ctxExp) {
        if (chartExpedienteInstance) chartExpedienteInstance.destroy();
        chartExpedienteInstance = new Chart(ctxExp, {
            type: 'doughnut',
            data: {
                labels: ['Manhã', 'Tarde/Noite'],
                datasets: [{
                    data: [manha, tarde],
                    backgroundColor: ['#f59e0b', '#8b5cf6'], 
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                },
                cutout: '70%'
            }
        });
    }

    const setorCount = {};
    demandas.forEach(d => {
        const s = d.setor || 'Não informado';
        setorCount[s] = (setorCount[s] || 0) + 1;
    });

    const setoresSorted = Object.keys(setorCount).sort((a, b) => setorCount[b] - setorCount[a]);
    const labels = setoresSorted.slice(0, 10); 
    const data = labels.map(l => setorCount[l]);

    const ctxSet = document.getElementById('chartSetores');
    if (ctxSet) {
        if (chartSetoresInstance) chartSetoresInstance.destroy();
        chartSetoresInstance = new Chart(ctxSet, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Demandas',
                    data: data,
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', 
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { display: false } }
                }
            }
        });
    }
}

function updateDashboard() {
    if (typeof demandas === 'undefined') return;

    const hoje = new Date().toISOString().split('T')[0];
    const demandasHoje = demandas.filter(d => d.dataDemanda === hoje);

    var elTotal = document.getElementById('totalDemandas');
    if(elTotal) elTotal.textContent = demandasHoje.length;
    
    var elConc = document.getElementById('concluidas');
    if(elConc) elConc.textContent = demandasHoje.filter(d => d.status === 'Concluída').length;
    
    var elPend = document.getElementById('pendentes');
    if(elPend) elPend.textContent = demandasHoje.filter(d => d.status === 'Pendente').length;

    const totalHistoricoEl = document.getElementById('totalHistorico');
    if (totalHistoricoEl) {
        totalHistoricoEl.textContent = demandas.filter(d => d.status === 'Concluída').length;
    }

    if (typeof atualizarFiltrosRelatorio === 'function') atualizarFiltrosRelatorio();
    renderDashboardCharts();

    const container = document.getElementById('demandasRecentes');
    if (!container) return;
    if (demandas.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma demanda cadastrada ainda</p>';
    } else {
        const recentes = demandas.slice(-5).reverse();
        container.innerHTML = recentes.map(demanda => {
            const motorista = (typeof motoristas !== 'undefined') ? motoristas.find(m => m.nome === demanda.nomeMotorista) : null;
            let dataFormatada = demanda.dataDemanda;
            if(typeof formatarDataBrasil === 'function') dataFormatada = formatarDataBrasil(demanda.dataDemanda);
            
            return `
            <div class="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md text-white hover:shadow-lg transition-shadow border border-white/10">
                <div class="flex-1">
                    <div class="flex items-center space-x-3">
                        <span class="text-sm font-bold text-white">${demanda.solicitante}</span>
                        <span class="text-xs text-indigo-200 px-2 py-0.5 bg-black/20 rounded-full">${demanda.setor}</span>
                    </div>
                    <div class="mt-2 text-sm text-indigo-50 font-medium">
                        ${demanda.partida} <span class="text-indigo-300">→</span> ${demanda.destino}
                    </div>
                    <div class="mt-1 text-xs text-indigo-200 flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        ${dataFormatada} às ${demanda.horario}
                    </div>
                    ${demanda.nomeMotorista ? `
                        <div class="mt-2 flex items-center space-x-2">
                            ${motorista && motorista.foto ? 
                                `<img class="h-6 w-6 rounded-full object-cover ring-2 ring-white/20" src="${motorista.foto}" alt="${demanda.nomeMotorista}">` :
                                `<div class="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                </div>`
                            }
                            <span class="text-xs text-indigo-100 font-medium">${demanda.nomeMotorista}</span>
                        </div>
                    ` : ''}
                    <div class="mt-2 text-[11px] text-indigo-100/80 font-medium border-t border-white/10 pt-2 flex items-center flex-wrap gap-2">
                        <span>👤 Cadastrado por: ${demanda.cadastradoPor || 'Sistema'}</span>
                        ${demanda.concluidoPor ? `<span class="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">✅ Concluído por: ${demanda.concluidoPor}</span>` : ''}
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-3 py-1.5 text-xs font-bold rounded-full bg-white/10 text-white border border-white/20 shadow-sm backdrop-blur-sm">
                        ${demanda.status}
                    </span>
                </div>
            </div>`;
        }).join('');
    }
}