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

window.addEventListener('load', async () => {
    produtos = await fetchProdutos(urlGetAll);
    adicionarProdutoTabela(produtos);
});

btnCadastrar.addEventListener('click', async (e) => {
    
    const produto = getFormData();

    if (!ehValidoFormulario())
    {
        e.preventDefault();
        return;
    } 

    await fetchProdutos(urlPost, 'POST', produto);

    setTimeout(
        abrirModalAviso("✅ Sucesso!", "Produto cadastrado com sucesso!")
    , 100);
    

    await atualizarTabela();
    form.reset();
})

btnEditar.addEventListener('click', async (e) => {
    let rowEditando = tbody.querySelector(".edit-row");
    let id = rowEditando.cells[0].innerText;
    const produto = getFormData();

    if (!ehValidoFormulario(rowEditando))
    {
        e.preventDefault();
        return;
    } 
    
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

function editarRowProduto(id, event) {
    let rowEditando = event.closest("tr");
    if (contemProdutoEmEdicao(rowEditando)) {
        abrirModalAviso("⚠️ Atenção!", "Finalize a edição atual antes de editar outro produto.");
        return;
    }
    
    marcarRowEditando(rowEditando);

    fetchProdutos(urlGetById + id, 'GET').then(data => {
        if (data) {
            preecherFormulario(data);
        }
    })
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

function ehValidoFormulario(rowEditando = null) {
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

    let produto = {
        nome: nome.value.trim(),
        categoria: categoria.value.trim()
    };

    if (jaContemProduto(produto, rowEditando)) {
        mensagem += "\nJá existe um produto com esse Nome e Categoria.";
    }

    if(mensagem !== ""){
        abrirModalAviso("⚠️ Formulário Invalido!",mensagem);
        return false;
    }

   return true;
}

function jaContemProduto(produto, rowEditando = null) {
    const linhas = document.querySelectorAll('#produtos-tbody tr');
    
    for (const linha of linhas) {
        if (linha === rowEditando) continue;
        
        const nomeLinha = linha.cells[1].textContent.trim().toLowerCase();
        const categoriaLinha = linha.cells[2].textContent.trim().toLowerCase();
        
        const nomeIgual = nomeLinha === produto.nome.toLowerCase();
        const categoriaIgual = categoriaLinha === produto.categoria.toLowerCase();
        
        if (nomeIgual && categoriaIgual) {
            return true;
        }
    }
    
    return false;
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
    try {
        const config = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (data) config.body = JSON.stringify(data);

        const response = await fetch(url, config);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            abrirModalAviso("❌ Erro!", error.mensagem || `Erro ${response.status}`);
            return null;
        }

        return response.status === 204 ? null : response.json();
        
    } catch (error) {
        abrirModalAviso("❌ Erro!", "Erro de conexão com a API");
        return null;
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
                    <button class="btn btn-warning" onclick="editarRowProduto(${produto.id},this)" title="Editar produto">
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

inputTabela.addEventListener('input', (ev) => {
    let busca = ev.target.value.trim().toLowerCase();
    
    let produtosFiltrados = produtos.filter(p => 
        p.id == busca ||
        p.nome.toLowerCase().includes(busca) ||
        p.categoria.toLowerCase().includes(busca) ||
        p.preco.toString().includes(busca)
    );
    
    adicionarProdutoTabela(produtosFiltrados);
});

function formatarData(data) {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
}

function formatarInput(event) {
    const { id, value } = event;
    let valor = value;
    
    if (id === 'quantidade') {
        valor = valor.replace(/\D/g, '').slice(0, 9);
    }
    
    event.value = valor;
}