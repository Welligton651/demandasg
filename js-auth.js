var usuarioLogado = '';
var nivelAcesso = null;

function entrarComoAdmin() {
    var usuario = document.getElementById('loginUsuario').value;
    var senha = document.getElementById('loginSenha').value;

    if (!usuario) {
        alert("Por favor, selecione um usuário.");
        return;
    }

    var credenciaisOcultas = {
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
    var nomeInput = document.getElementById('nomeVisitante').value.trim();
    if (!nomeInput) {
        nomeInput = 'Visitante Anônimo';
    }

    nivelAcesso = 'visitante';
    usuarioLogado = nomeInput;

    if (typeof iniciarSessaoVisitante === 'function') {
        iniciarSessaoVisitante(nomeInput);
    }
    iniciarSistema();
}

function iniciarSistema() {
    var headerGreeting = document.getElementById('headerGreeting');
    if (headerGreeting) {
        headerGreeting.textContent = nivelAcesso === 'admin' 
            ? `Oi, ${usuarioLogado.split(' ')[0]} | ` 
            : `Oi, ${usuarioLogado} | `;
    }

    document.getElementById('telaLogin').style.display = 'none';
    var mainApp = document.getElementById('sistemaPrincipal');
    if (mainApp) mainApp.style.display = 'block';

    var tabAuditoria = document.getElementById('tab-auditoria');
    var tabFolgas = document.getElementById('tab-folgas');
    
    if (nivelAcesso === 'admin' && (usuarioLogado === 'WELLIGTON' || usuarioLogado === 'MARCIO DAVID' || usuarioLogado === 'JOYCE')) {
        if (tabAuditoria) tabAuditoria.style.display = 'inline-flex';
        if (tabFolgas) tabFolgas.style.display = 'inline-flex';
    } else {
        if (tabAuditoria) tabAuditoria.style.display = 'none';
        if (tabFolgas) tabFolgas.style.display = 'none';
    }

    if (nivelAcesso === 'visitante') {
        aplicarRestricoesVisitante();
    }
}

function aplicarRestricoesVisitante() {
    var tabCadastro = document.getElementById('tab-cadastro');
    var tabMotoristas = document.getElementById('tab-motoristas');
    if (tabCadastro) tabCadastro.style.display = 'none';
    if (tabMotoristas) tabMotoristas.style.display = 'none';

    var selectsStatus = document.querySelectorAll('select[onchange*="alterarStatus"]');
    selectsStatus.forEach(select => {
        select.disabled = true;
        select.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
    });

    var botoesAcao = document.querySelectorAll('button[onclick*="editarDemanda"], button[onclick*="excluirDemanda"], button[title*="Excluir"], button[title*="Editar"]');
    botoesAcao.forEach(btn => btn.style.display = 'none');

    var headerTitle = document.querySelector('.text-indigo-100');
    if (headerTitle && !document.getElementById('tagVisitante')) {
        headerTitle.innerHTML += ' <span id="tagVisitante" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900 shadow-sm">Modo Visitante</span>';
    }
}

var observerAcesso = new MutationObserver(() => {
    if (nivelAcesso === 'visitante') {
        aplicarRestricoesVisitante();
    }
});

var mainElement = document.querySelector('main');
if (mainElement) {
    observerAcesso.observe(mainElement, { childList: true, subtree: true });
}