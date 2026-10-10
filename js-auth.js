let usuarioLogado = '';
let nivelAcesso = null;

function entrarComoAdmin() {
    const usuario = document.getElementById('loginUsuario').value;
    const senha = document.getElementById('loginSenha').value;

    if (!usuario) {
        alert("Por favor, selecione um usuário.");
        return;
    }

    const credenciaisOcultas = {
        'JOYCE': 'MTI0NQ==',
        'WELLIGTON': 'MDIwNQ==',
        'MARCIO DAVID': 'MjAyNg=='
    };

    if (btoa(senha) === credenciaisOcultas[usuario]) {
        nivelAcesso = 'admin';
        usuarioLogado = usuario;
        iniciarSistema();
    } else {
        alert('Senha incorreta para ' + usuario + '!');
    }
}

function entrarComoVisitante() {
    let nomeInput = document.getElementById('nomeVisitante').value.trim();
    if (!nomeInput) {
        nomeInput = 'Visitante Anônimo';
    }

    nivelAcesso = 'visitante';
    usuarioLogado = nomeInput;

    iniciarSessaoVisitante(nomeInput);
    iniciarSistema();
}

function iniciarSistema() {
    const headerGreeting = document.getElementById('headerGreeting');
    if (headerGreeting) {
        headerGreeting.textContent = nivelAcesso === 'admin' 
            ? `Oi, ${usuarioLogado.split(' ')[0]} | ` 
            : `Oi, ${usuarioLogado} | `;
    }

    document.getElementById('telaLogin').style.display = 'none';
    const mainApp = document.getElementById('sistemaPrincipal');
    if (mainApp) mainApp.style.display = 'block';

    const tabAuditoria = document.getElementById('tab-auditoria');
    if (nivelAcesso === 'admin' && (usuarioLogado === 'WELLIGTON' || usuarioLogado === 'MARCIO DAVID' || usuarioLogado === 'JOYCE')) {
        if (tabAuditoria) tabAuditoria.style.display = 'inline-flex';
    } else {
        if (tabAuditoria) tabAuditoria.style.display = 'none';
    }

    if (nivelAcesso === 'visitante') {
        aplicarRestricoesVisitante();
    }
}

function aplicarRestricoesVisitante() {
    const tabCadastro = document.getElementById('tab-cadastro');
    const tabMotoristas = document.getElementById('tab-motoristas');
    if (tabCadastro) tabCadastro.style.display = 'none';
    if (tabMotoristas) tabMotoristas.style.display = 'none';

    const selectsStatus = document.querySelectorAll('select[onchange*="alterarStatus"]');
    selectsStatus.forEach(select => {
        select.disabled = true;
        select.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
    });

    const botoesAcao = document.querySelectorAll('button[onclick*="editarDemanda"], button[onclick*="excluirDemanda"], button[title*="Excluir"], button[title*="Editar"]');
    botoesAcao.forEach(btn => btn.style.display = 'none');

    const headerTitle = document.querySelector('.text-indigo-100');
    if (headerTitle && !document.getElementById('tagVisitante')) {
        headerTitle.innerHTML += ' <span id="tagVisitante" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900 shadow-sm">Modo Visitante</span>';
    }
}

const observerAcesso = new MutationObserver(() => {
    if (nivelAcesso === 'visitante') {
        aplicarRestricoesVisitante();
    }
});

const mainElement = document.querySelector('main');
if (mainElement) {
    observerAcesso.observe(mainElement, { childList: true, subtree: true });
}