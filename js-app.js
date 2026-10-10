var mesAtual = new Date().getMonth();
var anoAtual = new Date().getFullYear();

function criarDataBrasilia(dataString) {
    const [ano, mes, dia] = dataString.split('-');
    return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
}

function formatarDataBrasil(dataString) {
    return criarDataBrasilia(dataString).toLocaleDateString('pt-BR');
}

function formatarDataCompletaBrasil(dataString) {
    return criarDataBrasilia(dataString).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function isDataNaSemanaAtual(data) {
    const hoje = new Date();
    const dataObj = criarDataBrasilia(data);
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);

    return dataObj >= inicioSemana && dataObj <= fimSemana;
}

function getStatusColor(status) {
    switch (status) {
        case 'Pendente': return 'bg-yellow-100 text-yellow-800';
        case 'Em Andamento': return 'bg-blue-100 text-blue-800';
        case 'Concluída': return 'bg-green-100 text-green-800';
        case 'Cancelada pelo setor solicitante': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function mostrarMensagem(texto, tipo) {
    const cor = tipo === 'success' ? 'bg-green-500' : 'bg-red-500';
    const mensagem = document.createElement('div');
    mensagem.className = `fixed top-4 right-4 ${cor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300`;
    mensagem.textContent = texto;
    document.body.appendChild(mensagem);

    setTimeout(() => {
        mensagem.style.transform = 'translateX(100%)';
        setTimeout(() => mensagem.remove(), 300);
    }, 3000);
}

function updateCurrentDate() {
    const agora = new Date();
    const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const el = document.getElementById('currentDate');
    if (el) el.textContent = agora.toLocaleDateString('pt-BR', opcoes);
}

function showTab(tabName) {
    // Proteção para evitar erro caso a auditoria não carregue a tempo
    if (typeof registrarNavegacaoVisitante === 'function') {
        registrarNavegacaoVisitante(tabName);
    }

    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.add('hidden'));

    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => {
        button.classList.remove('active', 'border-primary', 'text-primary');
        button.classList.add('border-transparent', 'text-gray-500');
    });

    const targetContent = document.getElementById(tabName + '-content');
    if (targetContent) targetContent.classList.remove('hidden');

    const activeButton = document.getElementById('tab-' + tabName);
    if (activeButton) {
        activeButton.classList.add('active', 'border-primary', 'text-primary');
        activeButton.classList.remove('border-transparent', 'text-gray-500');
    }

    if (tabName === 'dashboard' && typeof updateDashboard === 'function') updateDashboard();
    else if (tabName === 'timeline' && typeof updateTimeline === 'function') updateTimeline();
    else if (tabName === 'motoristas' && typeof updateListaMotoristas === 'function') updateListaMotoristas();
    else if (tabName === 'escala' && typeof updateEscala === 'function') updateEscala();
    else if (tabName === 'calendario' && typeof updateCalendario === 'function') updateCalendario();
    else if (tabName === 'auditoria' && typeof carregarAuditoria === 'function') carregarAuditoria();
    else if (tabName === 'folgas' && typeof renderizarCardsFolgas === 'function') renderizarCardsFolgas();
}

function updateEscala() {
    const tbody = document.getElementById('escalaTableBody');
    if (!tbody || typeof demandas === 'undefined') return;

    const demandasOrdenadas = demandas
        .filter(demanda => isDataNaSemanaAtual(demanda.dataDemanda) &&
                            demanda.status !== 'Concluída' &&
                            demanda.status !== 'Cancelada pelo setor solicitante')
        .sort((a, b) => new Date(a.dataDemanda + 'T' + a.horario) - new Date(b.dataDemanda + 'T' + b.horario));

    if (demandasOrdenadas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                    <p class="font-medium text-gray-500">Nenhuma demanda cadastrada para a semana atual</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = demandasOrdenadas.map((demanda, index) => {
        const motorista = (typeof motoristas !== 'undefined') ? motoristas.find(m => m.nome === demanda.nomeMotorista) : null;
        const dataFormatada = formatarDataBrasil(demanda.dataDemanda);
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-3 py-3 text-sm font-bold text-gray-900">${demanda.horario} <br><span class="text-xs text-gray-500">${dataFormatada}</span></td>
                <td class="px-3 py-3 text-xs font-bold text-slate-600">TR${demanda.id.toString().padStart(4, '0')}</td>
                <td class="px-3 py-3 text-sm text-gray-900 font-bold">${demanda.destino}<br><span class="text-xs font-normal text-gray-500">De: ${demanda.partida}</span></td>
                <td class="px-3 py-3 text-sm text-gray-800">${demanda.solicitante}<br><span class="text-xs text-gray-500">${demanda.setor}</span></td>
                <td class="px-3 py-3 text-xs text-gray-600">${demanda.numeroSei || '-'}</td>
                <td class="px-3 py-3 text-xs text-gray-600">${demanda.placaVeiculo || '-'}</td>
                <td class="px-3 py-3 text-sm">${demanda.nomeMotorista || '-'}</td>
                <td class="px-3 py-3">
                    <select onchange="alterarStatus('${demanda.id}', this.value)" class="text-xs font-bold border rounded p-1">
                        <option value="Pendente" ${demanda.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="Concluída" ${demanda.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                        <option value="Cancelada pelo setor solicitante" ${demanda.status === 'Cancelada pelo setor solicitante' ? 'selected' : ''}>Cancelada</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
}

function updateTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container || typeof demandas === 'undefined') return;
    
    const demandasSemana = demandas.filter(d => isDataNaSemanaAtual(d.dataDemanda) && d.status !== 'Concluída' && d.status !== 'Cancelada pelo setor solicitante');

    if (demandasSemana.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma demanda ativa nesta semana</p>';
        return;
    }

    container.innerHTML = demandasSemana.map(d => `
        <div class="p-4 rounded-lg bg-gray-50 border-l-4 border-blue-500 mb-2">
            <span class="font-bold text-gray-800">${d.horario} - ${formatarDataBrasil(d.dataDemanda)}</span>
            <p class="text-sm text-gray-600">${d.solicitante} (${d.setor}) → Destino: ${d.destino}</p>
        </div>
    `).join('');
}

function navegarMes(dir) {
    mesAtual += dir;
    if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
    else if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
    updateCalendario();
}

function updateCalendario() {
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const elMesAno = document.getElementById('mesAnoAtual');
    if (elMesAno) elMesAno.textContent = `${nomesMeses[mesAtual]} ${anoAtual}`;

    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const grid = document.getElementById('calendarioGrid');
    if (!grid) return;

    grid.innerHTML = '';
    for (let i = 0; i < primeiroDia.getDay(); i++) {
        grid.appendChild(document.createElement('div'));
    }

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
        const diaCell = document.createElement('div');
        diaCell.className = 'h-24 p-2 border border-gray-100 hover:bg-gray-50 cursor-pointer';
        diaCell.innerHTML = `<span class="font-bold text-sm text-gray-700">${d}</span>`;
        grid.appendChild(diaCell);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    setInterval(updateCurrentDate, 60000);

    const hoje = new Date().toISOString().split('T')[0];
    const dataDemandaInput = document.getElementById('dataDemanda');
    if (dataDemandaInput) {
        dataDemandaInput.min = hoje;
        dataDemandaInput.value = hoje;
        
        if (typeof verificarLimiteDemandas === 'function') {
            dataDemandaInput.addEventListener('change', verificarLimiteDemandas);
        }
    }

    const horarioInput = document.getElementById('horario');
    if (horarioInput && typeof verificarLimiteDemandas === 'function') {
        horarioInput.addEventListener('change', verificarLimiteDemandas);
    }
    
    if (typeof initializePhotoUpload === 'function') {
        initializePhotoUpload();
    }
});