var sessaoVisitanteId = null;

async function obterIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Erro ao obter IP:', error);
        return 'IP Indisponível';
    }
}

function extrairInfoNavegador(userAgent) {
    var browser = "Desconhecido";
    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Edg")) browser = "Edge";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari")) browser = "Safari";

    var os = "Desconhecido";
    if (userAgent.includes("Win")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "MacOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("like Mac")) os = "iOS";

    return `${os} - ${browser}`;
}

async function iniciarSessaoVisitante(nomeVisitante) {
    const ip = await obterIP();
    const dispositivo = extrairInfoNavegador(navigator.userAgent);
    sessaoVisitanteId = db.collection('auditoria_visitantes').doc().id;

    var historicoInicial = [`[${new Date().toLocaleTimeString('pt-BR')}] Login efetuado`];

    if (window.historicoPendente && window.historicoPendente.length > 0) {
        historicoInicial = historicoInicial.concat(window.historicoPendente);
        window.historicoPendente = [];
    }

    try {
        await db.collection('auditoria_visitantes').doc(sessaoVisitanteId).set({
            nome: nomeVisitante,
            ip: ip,
            dispositivo: dispositivo,
            userAgent: navigator.userAgent,
            dataInicio: new Date().toISOString(),
            historico: historicoInicial
        });
    } catch(e) {
        console.error("Erro ao registrar início da sessão", e);
    }
}

async function registrarNavegacaoVisitante(aba) {
    if (typeof nivelAcesso !== 'undefined' && nivelAcesso === 'visitante') {
        const registro = `[${new Date().toLocaleTimeString('pt-BR')}] Acessou: ${aba.toUpperCase()}`;

        if (!sessaoVisitanteId) {
            if (!window.historicoPendente) window.historicoPendente = [];
            window.historicoPendente.push(registro);
            return;
        }

        try {
            await db.collection('auditoria_visitantes').doc(sessaoVisitanteId).update({
                historico: firebase.firestore.FieldValue.arrayUnion(registro)
            });
        } catch(e) {
            console.error("Erro ao registrar navegação na auditoria", e);
        }
    }
}

function carregarAuditoria() {
    if (typeof nivelAcesso === 'undefined' || nivelAcesso !== 'admin') return;

    db.collection('auditoria_visitantes').orderBy('dataInicio', 'desc').limit(50)
        .onSnapshot((querySnapshot) => {
            const tbody = document.getElementById('tabelaAuditoria');
            if (querySnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="4" class="px-5 py-8 text-center text-gray-500">Nenhum acesso de visitante registrado ainda.</td></tr>';
                return;
            }

            var html = '';
            querySnapshot.forEach(doc => {
                const data = doc.data();
                const dataObj = new Date(data.dataInicio);
                const dataFormatada = dataObj.toLocaleDateString('pt-BR') + ' às ' + dataObj.toLocaleTimeString('pt-BR');
                const nomeVisitor = data.nome || 'Visitante Anônimo';
                const historicoHtml = data.historico.map(h => `<div class="text-[11px] font-medium text-gray-700 bg-gray-200/60 rounded px-2 py-1 mb-1 shadow-sm">${h}</div>`).join('');

                html += `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-5 py-4 border-b text-sm font-semibold text-gray-900 whitespace-nowrap">${dataFormatada}</td>
                        <td class="px-5 py-4 border-b">
                            <div class="font-bold text-gray-900 flex items-center">
                                <svg class="w-4 h-4 mr-1.5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                ${nomeVisitor}
                            </div>
                            <div class="text-xs text-blue-600 font-mono mt-1 tracking-wider">${data.ip}</div>
                        </td>
                        <td class="px-5 py-4 border-b text-sm text-gray-700">
                            <div class="font-bold text-gray-800 flex items-center">
                                <svg class="w-4 h-4 mr-1.5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7V7h10v6z"/></svg>
                                ${data.dispositivo}
                            </div>
                            <div class="text-[10px] text-gray-400 mt-1 truncate max-w-[200px]" title="${data.userAgent}">${data.userAgent}</div>
                        </td>
                        <td class="px-5 py-4 border-b">
                            <div class="max-h-28 overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-300">
                                ${historicoHtml}
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }, error => {
            console.error("Erro ao carregar auditoria:", error);
            document.getElementById('tabelaAuditoria').innerHTML = '<tr><td colspan="4" class="px-5 py-8 text-center text-red-500">Ocorreu um erro ao buscar os logs de auditoria.</td></tr>';
        });
}