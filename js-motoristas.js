var motoristas = [];

db.collection('motoristas').orderBy('nome', 'asc')
    .onSnapshot((querySnapshot) => {
        motoristas = [];
        querySnapshot.forEach((doc) => {
            motoristas.push({ ...doc.data(), id: doc.id });
        });
        if (typeof updateListaMotoristas === 'function') updateListaMotoristas();
        if (typeof updateSelectMotoristas === 'function') updateSelectMotoristas();
    }, (error) => {
        console.error("Erro ao carregar motoristas: ", error);
    });

function initializePhotoUpload() {
    const fileInput = document.getElementById('fotoMotorista');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');

    if (!fileInput) return;

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewContainer.classList.remove('hidden');
                uploadPlaceholder.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
}

document.getElementById('motoristaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fileInput = document.getElementById('fotoMotorista');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            salvarMotorista(formData.get('nomeMotoristaForm'), e.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        salvarMotorista(formData.get('nomeMotoristaForm'), '');
    }
});

async function salvarMotorista(nome, foto) {
    const motorista = {
        nome: nome,
        foto: foto,
        dataCadastro: new Date().toISOString()
    };
    try {
        await db.collection('motoristas').add(motorista);
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Motorista cadastrado com sucesso!', 'success');
        limparFormularioMotorista();
    } catch (error) {
        console.error("Erro ao cadastrar motorista: ", error);
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Erro ao cadastrar motorista.', 'error');
    }
}

function limparFormularioMotorista() {
    const form = document.getElementById('motoristaForm');
    if (form) form.reset();
    document.getElementById('previewContainer')?.classList.add('hidden');
    document.getElementById('uploadPlaceholder')?.classList.remove('hidden');
}

function updateListaMotoristas() {
    const container = document.getElementById('listaMotoristas');
    if (!container) return;
    if (motoristas.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum motorista cadastrado ainda</p>';
        return;
    }
    container.innerHTML = motoristas.map(motorista => `
        <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div class="flex-shrink-0">
                ${motorista.foto ? 
                    `<img class="h-12 w-12 rounded-full object-cover" src="${motorista.foto}" alt="${motorista.nome}">` :
                    `<div class="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center"><svg class="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`
                }
            </div>
            <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900">${motorista.nome}</h4>
                <p class="text-xs text-gray-500">Cadastrado em ${new Date(motorista.dataCadastro).toLocaleDateString('pt-BR')}</p>
            </div>
            <button onclick="removerMotorista('${motorista.id}')" class="text-red-600 hover:text-red-800">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
        </div>
    `).join('');
}

function updateSelectMotoristas() {
    const select = document.getElementById('nomeMotorista');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um motorista</option>';
    motoristas.forEach(motorista => {
        const option = document.createElement('option');
        option.value = motorista.nome;
        option.textContent = motorista.nome;
        select.appendChild(option);
    });
}

async function removerMotorista(id) {
    try {
        await db.collection('motoristas').doc(id).delete();
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Motorista removido com sucesso!', 'success');
    } catch (error) {
        console.error("Erro ao remover motorista: ", error);
        if(typeof mostrarMensagem === 'function') mostrarMensagem('Erro ao remover motorista.', 'error');
    }
}