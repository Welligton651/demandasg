var historicoFolgas = [];

// Escuta a coleção "folgas" em tempo real no Firebase
db.collection('folgas').orderBy('dataCadastro', 'desc')
    .onSnapshot((querySnapshot) => {
        historicoFolgas = [];
        querySnapshot.forEach((doc) => {
            historicoFolgas.push({ ...doc.data(), id: doc.id });
        });
        
        // Se a aba estiver aberta, atualiza a tela automaticamente
        const abaFolgas = document.getElementById('folgas-content');
        if (abaFolgas && !abaFolgas.classList.contains('hidden')) {
            renderizarCardsFolgas();
        }
    }, (error) => {
        console.error("Erro ao carregar folgas: ", error);
    });

function renderizarCardsFolgas() {
    const container = document.getElementById('gridFolgas');
    if (!container) return;

    if (typeof motoristas === 'undefined' || motoristas.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-full">Nenhum motorista cadastrado ainda.</p>';
        return;
    }

    var html = '';

    motoristas.forEach(motorista => {
        // Filtra o histórico desse motorista específico
        const folgasDoMotorista = historicoFolgas.filter(f => f.motorista === motorista.nome);
        
        // Calcula o Saldo (Ganhos - Usos)
        var totalGanhos = 0;
        var totalUsos = 0;
        
        folgasDoMotorista.forEach(f => {
            if (f.tipo === 'ganho') totalGanhos += Number(f.quantidade);
            if (f.tipo === 'uso') totalUsos += Number(f.quantidade);
        });
        
        const saldoFinal = totalGanhos - totalUsos;
        const corSaldo = saldoFinal > 0 ? 'text-emerald-600' : (saldoFinal < 0 ? 'text-red-600' : 'text-gray-600');

        // Pega o último evento para mostrar no card
        const ultimoEvento = folgasDoMotorista.length > 0 ? folgasDoMotorista[0] : null;

        html += `
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            <div class="p-5 flex items-center space-x-4 bg-gray-50 border-b border-gray-100">
                ${motorista.foto ? 
                    `<img class="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm" src="${motorista.foto}" alt="${motorista.nome}">` :
                    `<div class="h-14 w-14 rounded-full bg-slate-300 flex items-center justify-center border-2 border-white shadow-sm"><svg class="h-7 w-7 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`
                }
                <div>
                    <h3 class="font-bold text-gray-900 text-lg">${motorista.nome}</h3>
                    <p class="text-xs text-gray-500 flex items-center mt-1">
                        Saldo Atual: <span class="font-bold text-xl ml-2 ${corSaldo}">${saldoFinal}</span> <span class="ml-1">dias</span>
                    </p>
                </div>
            </div>
            
            <div class="p-5 flex-1">
                <div class="mb-4">
                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Última Movimentação</h4>
                    ${ultimoEvento ? `
                        <div class="text-sm bg-gray-50 rounded p-2 border-l-2 ${ultimoEvento.tipo === 'ganho' ? 'border-emerald-500' : 'border-orange-500'}">
                            <div class="font-medium text-gray-800">${typeof formatarDataBrasil === 'function' ? formatarDataBrasil(ultimoEvento.dataEvento) : ultimoEvento.dataEvento} - ${ultimoEvento.tipo === 'ganho' ? '+ Ganhou' : '- Usou'}${ultimoEvento.quantidade} dia(s)</div>
                            <div class="text-xs text-gray-500 mt-1 line-clamp-1" title="${ultimoEvento.motivo}">${ultimoEvento.motivo}</div>
                        </div>
                    ` : `<p class="text-sm text-gray-400 italic">Nenhuma folga registrada.</p>`}
                </div>
            </div>
            
            <div class="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2">
                <button onclick="abrirModalFolga('${motorista.nome}', 'ganho')" class="flex items-center justify-center px-3 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-bold transition-colors">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    Add Folga
                </button>
                <button onclick="abrirModalFolga('${motorista.nome}', 'uso')" class="flex items-center justify-center px-3 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg text-sm font-bold transition-colors">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
                    Tirar Folga
                </button>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

function abrirModalFolga(nomeMotorista, tipo) {
    document.getElementById('formFolga').reset();
    
    document.getElementById('folgaMotoristaNome').value = nomeMotorista;
    document.getElementById('folgaMotoristaDisplay').value = nomeMotorista;
    document.getElementById('folgaTipo').value = tipo;
    document.getElementById('folgaData').value = new Date().toISOString().split('T')[0];

    const header = document.getElementById('modalFolgaHeader');
    const title = document.getElementById('modalFolgaTitle');
    const btn = document.getElementById('btnSalvarFolga');

    if (tipo === 'ganho') {
        header.className = 'bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4';
        title.textContent = 'Registrar Nova Folga (Ganho)';
        btn.className = 'px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium';
        btn.textContent = 'Adicionar Folga';
    } else {
        header.className = 'bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4';
        title.textContent = 'Registrar Uso de Folga';
        btn.className = 'px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium';
        btn.textContent = 'Descontar Folga';
    }

    document.getElementById('modalFolga').classList.remove('hidden');
}

function fecharModalFolga() {
    document.getElementById('modalFolga').classList.add('hidden');
}

async function salvarFolga() {
    const motorista = document.getElementById('folgaMotoristaNome').value;
    const tipo = document.getElementById('folgaTipo').value;
    const dataEvento = document.getElementById('folgaData').value;
    const quantidade = document.getElementById('folgaQuantidade').value;
    const motivo = document.getElementById('folgaMotivo').value;

    if (!dataEvento || !quantidade || !motivo) {
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Preencha todos os campos obrigatórios!', 'error');
        else alert('Preencha todos os campos obrigatórios!');
        return;
    }

    const registro = {
        motorista: motorista,
        tipo: tipo,
        dataEvento: dataEvento,
        quantidade: Number(quantidade),
        motivo: motivo,
        dataCadastro: new Date().toISOString(),
        cadastradoPor: typeof usuarioLogado !== 'undefined' ? usuarioLogado : 'Desconhecido'
    };

    try {
        const btn = document.getElementById('btnSalvarFolga');
        btn.innerHTML = 'Salvando...';
        btn.disabled = true;

        await db.collection('folgas').add(registro);
        
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Folga registrada com sucesso!', 'success');
        fecharModalFolga();
        
        btn.disabled = false;
    } catch (error) {
        console.error("Erro ao salvar folga: ", error);
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Erro ao salvar registro.', 'error');
        document.getElementById('btnSalvarFolga').disabled = false;
    }
}