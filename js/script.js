 const API_URL = 'https://localhost:7019/Produtos';
 const urlGetAll = API_URL + "/ObtenhaTodos";
 const urlGetById = API_URL +  "/ObtenhaPorID/"
 const urlPost = API_URL + "/Crie"
 const urlPut = API_URL + "/Atualize/"
 const urlDelete = API_URL + "/Remova/"

const btnCadastrar = document.getElementById('btn-cadastrar');
const btnCancel = document.getElementById('btn-cancelar');
const form = document.getElementById('produto-form');
const tbody = document.getElementById('produtos-tbody');
const btnAtualizar = document.getElementById('btn-atualizar');
const modalExclusao = document.getElementById('modal-delete');
const btnFecharModalExclusao = document.getElementById('btn-cancel-delete');



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

function marcarRowEditando(row){ row && row.classList.add("edit-row");}
function desmarcarRowEditando(row){ row && row.classList.remove("edit-row");}

function editarProduto(id, event) {
    let rowEditando = event.closest("tr");
    marcarRowEditando(rowEditando);
}
 

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

async function fetchProdutos(url, data = undefined) {

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao buscar produtos');
        const produtos = await response.json();
        return produtos;
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao buscar produtos');
        return [];
    }
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