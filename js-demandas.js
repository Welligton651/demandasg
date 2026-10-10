var demandas = [];

db.collection('demandas').orderBy('dataCadastro', 'desc')
    .onSnapshot((querySnapshot) => {
        demandas = [];
        querySnapshot.forEach((doc) => {
            demandas.push({ ...doc.data(), id: doc.id });
        });
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof updateTimeline === 'function') updateTimeline();
        if (typeof updateEscala === 'function') updateEscala();
        if (typeof updateCalendario === 'function') updateCalendario();
    }, (error) => {
        console.error("Erro ao carregar demandas: ", error);
    });

document.getElementById('demandaForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const demanda = {
        solicitante: formData.get('solicitante'),
        setor: formData.get('setor'),
        partida: formData.get('partida'),
        destino: formData.get('destino'),
        dataDemanda: formData.get('dataDemanda'),
        horario: formData.get('horario'),
        numeroSei: formData.get('numeroSei'),
        placaVeiculo: formData.get('placaVeiculo'),
        nomeMotorista: formData.get('nomeMotorista'),
        observacoes: formData.get('observacoes'),
        status: 'Pendente',
        dataCadastro: new Date().toISOString(),
        cadastradoPor: typeof usuarioLogado !== 'undefined' ? usuarioLogado : 'Desconhecido'
    };

    try {
        await db.collection('demandas').add(demanda);
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Demanda cadastrada com sucesso!', 'success');
        limparFormulario();
    } catch (error) {
        console.error("Erro ao cadastrar demanda: ", error);
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Erro ao cadastrar demanda.', 'error');
    }
});

function limparFormulario() {
    const form = document.getElementById('demandaForm');
    if (form) form.reset();
    const hoje = new Date().toISOString().split('T')[0];
    const dt = document.getElementById('dataDemanda');
    if (dt) dt.value = hoje;
}

function verificarLimiteDemandas() {
    const dataSelecionada = document.getElementById('dataDemanda')?.value;
    const horarioSelecionado = document.getElementById('horario')?.value;

    if (!dataSelecionada || !horarioSelecionado || typeof demandas === 'undefined') return;

    const demandasNesteHorario = demandas.filter(d => 
        d.dataDemanda === dataSelecionada && 
        d.horario === horarioSelecionado && 
        d.status !== 'Cancelada pelo setor solicitante'
    ).length;

    if (demandasNesteHorario >= 3) {
        mostrarAvisoLimiteDemandas(demandasNesteHorario);
    }
}

function mostrarAvisoLimiteDemandas(qtdDemandas) {
    const avisoExistente = document.getElementById('avisoLimitePopUp');
    if (avisoExistente) avisoExistente.remove();

    const aviso = document.createElement('div');
    aviso.id = 'avisoLimitePopUp';
    aviso.className = 'fixed top-6 right-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-5 py-4 rounded-xl shadow-2xl z-[200] transform transition-all duration-300 flex items-start max-w-sm border-l-4 border-yellow-700 translate-x-full';
    
    aviso.innerHTML = `
        <div class="mr-3 mt-0.5 animate-pulse">
            <svg class="w-6 h-6 text-yellow-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <div class="flex-1">
            <h4 class="font-bold text-sm text-white tracking-wide">Atenção: Horário Sobrecarregado</h4>
            <p class="text-xs mt-1 text-yellow-50 leading-relaxed">Já existem <strong>${qtdDemandas} demandas</strong> para este mesmo dia e horário. Agendar uma próxima demanda será arriscado.</p>
        </div>
        <button onclick="fecharAvisoLimite(this.parentElement)" class="ml-4 text-yellow-200 hover:text-white transition-colors focus:outline-none bg-black/10 hover:bg-black/20 rounded-full p-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    `;
    document.body.appendChild(aviso);

    setTimeout(() => { aviso.classList.remove('translate-x-full'); }, 10);
    setTimeout(() => { fecharAvisoLimite(aviso); }, 7000);
}

function fecharAvisoLimite(elemento) {
    if (elemento) {
        elemento.classList.add('translate-x-full');
        elemento.style.opacity = '0';
        setTimeout(() => { if (elemento.parentNode) elemento.remove(); }, 300);
    }
}

async function alterarStatus(id, novoStatus) {
    try {
        const updateData = { status: novoStatus };
        if (novoStatus === 'Concluída') {
            updateData.concluidoPor = typeof usuarioLogado !== 'undefined' ? usuarioLogado : 'Sistema';
        }
        await db.collection('demandas').doc(id).update(updateData);
        if(typeof mostrarMensagem === 'function') mostrarMensagem(`Status alterado para: ${novoStatus}`, 'success');
    } catch (error) {
        console.error("Erro ao alterar status: ", error);
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Erro ao alterar status.', 'error');
    }
}

function editarDemanda(id) {
    if (typeof demandas === 'undefined') return;
    const demanda = demandas.find(d => d.id === id);
    if (!demanda) {
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Demanda não encontrada!', 'error');
        return;
    }

    document.getElementById('editId').value = demanda.id;
    document.getElementById('editSolicitante').value = demanda.solicitante;
    document.getElementById('editSetor').value = demanda.setor;
    document.getElementById('editPartida').value = demanda.partida;
    document.getElementById('editDestino').value = demanda.destino;
    document.getElementById('editDataDemanda').value = demanda.dataDemanda;
    document.getElementById('editHorario').value = demanda.horario;
    document.getElementById('editNumeroSei').value = demanda.numeroSei || '';
    document.getElementById('editPlacaVeiculo').value = demanda.placaVeiculo || '';
    document.getElementById('editNomeMotorista').value = demanda.nomeMotorista || '';
    document.getElementById('editObservacoes').value = demanda.observacoes || '';

    updateSelectMotoristasEdicao();
    document.getElementById('modalEdicao').classList.remove('hidden');
}

function fecharModalEdicao() {
    document.getElementById('modalEdicao').classList.add('hidden');
    document.getElementById('formEdicao').reset();
}

function updateSelectMotoristasEdicao() {
    const select = document.getElementById('editNomeMotorista');
    const valorAtual = select.value;
    select.innerHTML = '<option value="">Selecione um motorista</option>';
    if (typeof motoristas !== 'undefined') {
        motoristas.forEach(motorista => {
            const option = document.createElement('option');
            option.value = motorista.nome;
            option.textContent = motorista.nome;
            if (motorista.nome === valorAtual) option.selected = true;
            select.appendChild(option);
        });
    }
}

async function salvarEdicao() {
    const form = document.getElementById('formEdicao');
    const formData = new FormData(form);
    
    const demandaAtualizada = {
        solicitante: formData.get('editSolicitante'),
        setor: formData.get('editSetor'),
        partida: formData.get('editPartida'),
        destino: formData.get('editDestino'),
        dataDemanda: formData.get('editDataDemanda'),
        horario: formData.get('editHorario'),
        numeroSei: formData.get('editNumeroSei'),
        placaVeiculo: formData.get('editPlacaVeiculo'),
        nomeMotorista: formData.get('editNomeMotorista'),
        observacoes: formData.get('editObservacoes')
    };

    try {
        const id = formData.get('editId');
        await db.collection('demandas').doc(id).update(demandaAtualizada);
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Demanda atualizada com sucesso!', 'success');
        fecharModalEdicao();
    } catch (error) {
        console.error("Erro ao atualizar demanda: ", error);
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Erro ao atualizar demanda.', 'error');
    }
}

async function excluirDemanda(id) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div class="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-lg">
                <div class="flex items-center space-x-3">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <div>
                        <h3 class="text-xl font-bold text-white">Confirmar Exclusão</h3>
                        <p class="text-red-100 text-sm">Esta ação não pode ser desfeita</p>
                    </div>
                </div>
            </div>
            <div class="p-6">
                <p class="text-gray-700 mb-4">Tem certeza que deseja excluir esta demanda?</p>
                <p class="text-sm text-gray-500">Todos os dados serão permanentemente removidos do sistema.</p>
            </div>
            <div class="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-4 border-t">
                <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium">Cancelar</button>
                <button onclick="confirmarExclusao('${id}', this)" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">Excluir Definitivamente</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function confirmarExclusao(id, button) {
    try {
        button.innerHTML = `Excluindo...`;
        button.disabled = true;
        await db.collection('demandas').doc(id).delete();
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Demanda excluída com sucesso!', 'success');
        button.closest('.fixed').remove();
    } catch (error) {
        console.error("Erro ao excluir demanda: ", error);
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Erro ao excluir demanda.', 'error');
        button.disabled = false;
    }
}

function compartilharWhatsApp(id) {
    if (typeof demandas === 'undefined') return;
    const demanda = demandas.find(d => d.id === id);
    if (!demanda) return;

    let dataFormatada = demanda.dataDemanda;
    if(typeof formatarDataBrasil === 'function') {
        dataFormatada = formatarDataBrasil(demanda.dataDemanda);
    }
    
    const texto = `*NOVA DEMANDA DE TRANSPORTE* 🚗\n\n*Solicitante:* ${demanda.solicitante}\n*Setor:* ${demanda.setor}\n*Data:* ${dataFormatada} às ${demanda.horario}\n*Partida:* ${demanda.partida}\n*Destino:* ${demanda.destino}\n*Motorista:* ${demanda.nomeMotorista || 'A definir'}\n*Placa:* ${demanda.placaVeiculo || 'N/A'}\n*Obs:* ${demanda.observacoes || 'Nenhuma'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}