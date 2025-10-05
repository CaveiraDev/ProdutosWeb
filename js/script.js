 const API_URL = 'https://localhost:7019/Produtos';
 const urlGetAll = API_URL + "/ObtenhaTodos";
 const urlGetById = API_URL +  "/ObtenhaPorID/"
 const urlPost = API_URL + "/Crie"
 const urlPut = API_URL + "/Atualize/"
 const urlDelete = API_URL + "/Remova/"

const btnCadastrar = document.getElementById('btn-cadastrar');
const btnEditar = document.getElementById('btn-Editar');
const btnCancelar = document.getElementById('btn-Cancelar');
const form = document.getElementById('produto-form');
const tbody = document.getElementById('produtos-tbody');
const btnAtualizar = document.getElementById('btn-atualizar');
const modalExclusao = document.getElementById('modal-delete');
const btnFecharModalExclusao = document.getElementById('btn-cancel-delete');
const btnConfirmarExclusao = document.getElementById('btn-confirm-delete');
const modalAviso = document.getElementById('modal-aviso');
const btnAvisoFechar = document.getElementById('btn-aviso-fechar');


let produtos = [];

document.addEventListener('DOMContentLoaded', async () => {
    fecharModalExclusao()
    produtos = await fetchProdutos(urlGetAll);
    adicionarProdutoTabela(produtos);
});

btnCadastrar.addEventListener('click', async (e) => {
    
    const produto = getFormData();
    if (!produto) return;

    produtos.push(produto);
    adicionarProdutoTabela(produtos);
    form.reset();
})

btnAtualizar.addEventListener('click', async () => {
    produtos = await fetchProdutos(urlGetAll);
    adicionarProdutoTabela(produtos);
})

btnFecharModalExclusao.addEventListener('click', () => {
   fecharModalExclusao();
})

btnConfirmarExclusao.addEventListener('click', async () => {
    let rowEditando = tbody.querySelector(".edit-row");
    if (rowEditando) {
        const id = rowEditando.cells[0].innerText;
        debugger
       await fetchProdutos(urlDelete + id, 'DELETE');
       fecharModalExclusao();
       abrirModalAviso("Produto excluído com sucesso!");
    }
})

function fecharModalExclusao() {
    modalExclusao.classList.add("d-none")
    let rowEditando = tbody.querySelector(".edit-row");
    desmarcarRowEditando(rowEditando)
}

function abrirModalExclusao(id, event) { 
    modalExclusao.classList.remove("d-none")
    let rowEditando = event.closest("tr");
    marcarRowEditando(rowEditando);
}

function abrirModalAviso(mensagem) {
    const campoMsg = document.getElementById('modal-mensagem');
    campoMsg.innerText = mensagem;
    modalAviso.classList.remove("d-none");
}

btnAvisoFechar.addEventListener('click', () => {
    modalAviso.classList.add("d-none");
});

function marcarRowEditando(row){ row && row.classList.add("edit-row");}

function desmarcarRowEditando(row){ row && row.classList.remove("edit-row");}

function editarProduto(id, event) {
    let rowEditando = event.closest("tr");
    if (contemProdutoEmEdicao(rowEditando)) {
        alert("Finalize a edição atual antes de editar outro produto.");
        return;
    }
    
    marcarRowEditando(rowEditando);

    let produtoEdit = produtos.find(p => p.id === id);
    preecherFormulario(produtoEdit);
}

function contemProdutoEmEdicao(rowEditando) {
    const linhas = document.querySelectorAll('#produtos-tbody tr');
    
    for (const linha of linhas) {
        if (linha !== rowEditando && linha.classList.contains('edit-row')) {
            return true;
        }
    }
    
    return false;
}

function preecherFormulario(produto) {
    if (!produto) return;
    alternarModoFormulario('editar', produto);
    focarFormulario();
}

 
function focarFormulario() {
    const section = document.querySelector(".form-section");
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    section.classList.add("destaque");

    setTimeout(() => {
        section.classList.remove("destaque");
    }, 2000);
}

function alternarModoFormulario(modo, produto = null) {
    const ehCadastrar = modo === 'cadastrar';
    
    if (ehCadastrar) {
        form.reset();
    } else {
        nome.value = produto.nome;
        categoria.value = produto.categoria;
        preco.value = produto.preco;
        quantidade.value = produto.quantidade;
        produtoEmEdicao = produto.id;
    }
    
    document.getElementById("form-title").innerText = 
        ehCadastrar ? "Cadastrar Novo Produto" : "Editar Produto";
    
    btnCadastrar.style.display = ehCadastrar ? "inline-block" : "none";
    btnEditar.style.display = ehCadastrar ? "none" : "inline-block";
    btnCancelar.style.display = ehCadastrar ? "none" : "inline-block";

    
    if (!ehCadastrar) nome.focus();
}

btnCancelar.addEventListener('click', () => {
    alternarModoFormulario('cadastrar');
    let rowEditando = tbody.querySelector(".edit-row");
    desmarcarRowEditando(rowEditando)
});

function validarFormulario() {

}
function getFormData() {
    const nome = document.getElementById('nome').value.trim();
    const categoria = document.getElementById('categoria').value.trim();
    const preco = parseFloat(document.getElementById('preco').value) || 0;
    const quantidade = parseInt(document.getElementById('quantidade').value) || 0;

    const data = {
        nome,
        categoria,
        preco,
        quantidade,
        disponivel: quantidade > 0,
        data: new Date()
    };

    return data;
}

async function fetchProdutos(url, method = 'GET', data = null) {
    const config = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };

    if (data) config.body = JSON.stringify(data);

    const response = await fetch(url, config);
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.mensagem || `Erro ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
}

function adicionarProdutoTabela(produtos) {
    tbody.innerHTML = '';  
    produtos.forEach(produto => {
        const tr = document.createElement('tr');
        

        tr.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${produto.categoria}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>${produto.disponivel ? 'Sim' : 'Não'}</td>
            <td>${formatarData(produto.data)}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-warning" onclick="editarProduto(${produto.id},this)" title="Editar produto">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger" onclick="abrirModalExclusao(${produto.id},this)" title="Excluir produto">
                        🗑️ Excluir
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);

    })

}   

function formatarData(data) {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
}