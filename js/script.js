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

[quantidade, preco].forEach(m => m.addEventListener('input', formatarInput(m)));

document.addEventListener('DOMContentLoaded', async () => {
    fecharModalExclusao()
    produtos = await fetchProdutos(urlGetAll);
    adicionarProdutoTabela(produtos);
});

btnCadastrar.addEventListener('click', async (e) => {
    
    const produto = getFormData();
    if (!ehValidoFormulario()) return;

    produtos.push(produto);
    adicionarProdutoTabela(produtos);
    form.reset();
})

btnEditar.addEventListener('click', async (e) => {
    let rowEditando = tbody.querySelector(".edit-row");
    let id = rowEditando.cells[0].innerText;
    const produto = getFormData();

    if (!ehValidoFormulario()) return;
    
      await fetchProdutos(urlPut + id , 'PUT', produto);
    

    alternarModoFormulario('cadastrar');
    desmarcarRowEditando(tbody.querySelector(".edit-row"))
    
    await atualizarTabela();
    abrirModalAviso("✅ Sucesso!", "Produto atualizado com sucesso!");
})


btnAtualizar.addEventListener('click', async () => {
  await atualizarTabela();
})

 async function atualizarTabela() {
    produtos = await fetchProdutos(urlGetAll);
    adicionarProdutoTabela(produtos);
}

btnFecharModalExclusao.addEventListener('click', () => {
   fecharModalExclusao();
})

btnConfirmarExclusao.addEventListener('click', async () => {
    let rowEditando = tbody.querySelector(".edit-row");
    if (rowEditando) {
        const id = rowEditando.cells[0].innerText;
       await fetchProdutos(urlDelete + id, 'DELETE');
       fecharModalExclusao();
       abrirModalAviso("✅ Sucesso!", "Produto excluído com sucesso!");
       await atualizarTabela();
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

function abrirModalAviso(titulo, mensagem) {
    const campoTitulo = document.getElementById('modal-titulo');
    campoTitulo.innerText = titulo;
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
        abrirModalAviso("⚠️ Atenção!", "Finalize a edição atual antes de editar outro produto.");
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

function ehValidoFormulario() {
    let mensagem = "";
    if (!nome.value.trim()) {
        mensagem = "O campo 'Nome' é obrigatório."
        nome.focus();
    }

    if (!categoria.value.trim()) {
        mensagem += "\n O campo 'Categoria' é obrigatório.";
        categoria.focus();
    }

    if (isNaN(preco.value) || preco.value <= 0) {
        mensagem += "\n O campo 'Preço' deve ser maior que 0.";
        preco.focus();
    }

    if (isNaN(quantidade.value) || quantidade.value <= 0) {
        mensagem += "\n O campo 'Quantidade' deve ser maior que 0.";
        quantidade.focus();
    }

    if(mensagem !== ""){
        abrirModalAviso("⚠️ Formulário Invalido!",mensagem);
        return false;
    }

   return true;
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
        
        abrirModalAviso("❌Error !!", error.mensagem || `Erro ${response.status}`);
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

function formatarInput(event) {
    const { id, value } = event;
    let valor = value;
    
    if (id === 'preco') {
        valor = valor.replace(/[^\d.,]/g, '').replace(',', '.');
        
        const partes = valor.split('.');
        if (partes.length > 2) valor = partes[0] + '.' + partes.slice(1).join('');
        
        if (partes[0].length > 9) {
            partes[0] = partes[0].slice(0, 9);
        }
        
        if (partes[1]?.length > 2) {
            partes[1] = partes[1].slice(0, 2);
        }
        
        valor = partes[1] ? partes[0] + '.' + partes[1] : partes[0];
    } 
    else if (id === 'quantidade') {
        valor = valor.replace(/\D/g, '').slice(0, 9);
    }
    
    event.value = valor;
}