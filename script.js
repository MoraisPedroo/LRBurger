function entrar(evento) {
    evento.preventDefault();

    var usuario = document.getElementById("usuario").value;
    var senha = document.getElementById("senha").value;

    if (usuario === "" || senha === "") {
        alert("Preencha usuário e senha.");
        return;
    }

    window.location.href = "dashboard.html";
}

function mostrarSenha() {
    var campoSenha = document.getElementById("senha");
    if (campoSenha.type === "password") {
        campoSenha.type = "text";
    } else {
        campoSenha.type = "password";
    }
}

function abrirMenuUsuario() {
    var sair = confirm("Deseja sair do sistema?");
    if (sair) {
        window.location.href = "index.html";
    }
}


function iniciarDados() {
    if (!localStorage.getItem("entregadores")) {
        var listaEntregadores = [
            { id: 1, nome: "Jean Estan", telefone: "(11) 98888-1111", veiculo: "Moto", corridas: 15, recebido: 230.00 },
            { id: 2, nome: "Leda", telefone: "(11) 97777-2222", veiculo: "Moto", corridas: 8, recebido: 130.00 },
            { id: 3, nome: "Pedro Ass", telefone: "(11) 96666-3333", veiculo: "Bicicleta", corridas: 5, recebido: 50.00 }
        ];
        localStorage.setItem("entregadores", JSON.stringify(listaEntregadores));
    }

    if (!localStorage.getItem("pedidos")) {
        var listaPedidos = [
            { id: 1, item: "X-Burger Duplo + Refrigerante", cliente: "Maria Silva", endereco: "Rua Peder, Novo Riacho. 32321-490", valor: 230.00, frete: 10.00, entregador: "Jean Estan", data: "29/04/2026", status: "Entregue" },
            { id: 2, item: "Combo Cheese Bacon", cliente: "Carlos Souza", endereco: "Rua das Petunias, Osasco. 32176-324", valor: 130.00, frete: 10.00, entregador: "Leda", data: "29/04/2026", status: "Em rota" },
            { id: 3, item: "X-Salada + Batata", cliente: "Ana Oliveira", endereco: "Rua Luciano Hulk, Eldorado. 32345-234", valor: 50.00, frete: 5.50, entregador: "Pedro Ass", data: "28/04/2026", status: "Entregue" }
        ];
        localStorage.setItem("pedidos", JSON.stringify(listaPedidos));
    }

    if (!localStorage.getItem("nomeUsuario")) {
        localStorage.setItem("nomeUsuario", "L&R Burger");
    }
}

function pegarPedidos() {
    return JSON.parse(localStorage.getItem("pedidos") || "[]");
}

function pegarEntregadores() {
    return JSON.parse(localStorage.getItem("entregadores") || "[]");
}

function salvarListaPedidos(lista) {
    localStorage.setItem("pedidos", JSON.stringify(lista));
}

function salvarListaEntregadores(lista) {
    localStorage.setItem("entregadores", JSON.stringify(lista));
}

function formatarReais(valor) {
    return "R$" + valor.toFixed(2).replace(".", ",");
}


function carregarDashboard() {
    iniciarDados();

    var titulo = document.getElementById("nomeUsuarioTitulo");
    if (titulo) {
        titulo.textContent = localStorage.getItem("nomeUsuario");
    }

    var pedidos = pegarPedidos();
    var entregadores = pegarEntregadores();

    document.getElementById("pedidosHoje").textContent = pedidos.length;
    document.getElementById("entregadoresAtivos").textContent = entregadores.length;

    var totalReceita = 0;
    for (var i = 0; i < pedidos.length; i++) {
        totalReceita = totalReceita + pedidos[i].valor;
    }
    document.getElementById("receitaHoje").textContent = formatarReais(totalReceita);

    var corpo = document.getElementById("listaEntregas");
    var html = "";
    for (var j = 0; j < pedidos.length; j++) {
        var p = pedidos[j];
        html = html + "<tr>";
        html = html + "<td><div class='celula-entregador'><div class='foto-pessoa'>&#128100;</div>" + p.entregador + "</div></td>";
        html = html + "<td>" + p.endereco + "</td>";
        html = html + "<td>" + formatarReais(p.valor) + " (" + formatarReais(p.frete) + ")</td>";
        html = html + "</tr>";
    }
    corpo.innerHTML = html;
}


function carregarListaPedidos() {
    iniciarDados();

    var pedidos = pegarPedidos();
    var corpo = document.getElementById("tabelaPedidos");
    var html = "";

    for (var i = 0; i < pedidos.length; i++) {
        var p = pedidos[i];
        var classeStatus = "status-rota";
        if (p.status === "Entregue") classeStatus = "status-entregue";
        if (p.status === "Cancelado") classeStatus = "status-cancelado";

        html = html + "<tr>";
        html = html + "<td>#" + p.id + "</td>";
        html = html + "<td>" + p.item + "</td>";
        html = html + "<td>" + p.cliente + "</td>";
        html = html + "<td>" + p.entregador + "</td>";
        html = html + "<td>" + formatarReais(p.valor) + "</td>";
        html = html + "<td>" + p.data + "</td>";
        html = html + "<td><span class='status " + classeStatus + "'>" + p.status + "</span></td>";
        html = html + "<td><button class='botao-acao' onclick='verDetalhesPedido(" + p.id + ")'>Ver</button> ";
        html = html + "<button class='botao-acao botao-vermelho' onclick='excluirPedido(" + p.id + ")'>Excluir</button></td>";
        html = html + "</tr>";
    }

    corpo.innerHTML = html;
}

function verDetalhesPedido(id) {
    var pedidos = pegarPedidos();
    var pedido = null;

    for (var i = 0; i < pedidos.length; i++) {
        if (pedidos[i].id === id) {
            pedido = pedidos[i];
        }
    }

    if (pedido === null) return;

    var conteudo = document.getElementById("conteudoDetalhes");
    conteudo.innerHTML =
        "<p><b>Pedido:</b> #" + pedido.id + "</p>" +
        "<p><b>Item:</b> " + pedido.item + "</p>" +
        "<p><b>Cliente:</b> " + pedido.cliente + "</p>" +
        "<p><b>Endereço de Entrega:</b> " + pedido.endereco + "</p>" +
        "<p><b>Valor do Pedido:</b> " + formatarReais(pedido.valor) + "</p>" +
        "<p><b>Frete:</b> " + formatarReais(pedido.frete) + "</p>" +
        "<p><b>Total:</b> " + formatarReais(pedido.valor + pedido.frete) + "</p>" +
        "<p><b>Entregador:</b> " + pedido.entregador + "</p>" +
        "<p><b>Data:</b> " + pedido.data + "</p>" +
        "<p><b>Status:</b> " + pedido.status + "</p>";

    document.getElementById("modalDetalhes").style.display = "flex";
}

function fecharModalDetalhes() {
    document.getElementById("modalDetalhes").style.display = "none";
}

function abrirNovoPedido() {
    document.getElementById("itemPedido").value = "";
    document.getElementById("clientePedido").value = "";
    document.getElementById("enderecoPedido").value = "";
    document.getElementById("valorPedido").value = "";
    document.getElementById("fretePedido").value = "";
    document.getElementById("statusPedido").value = "Em rota";

    var entregadores = pegarEntregadores();
    var seletor = document.getElementById("entregadorPedido");
    var html = "";
    for (var i = 0; i < entregadores.length; i++) {
        html = html + "<option value='" + entregadores[i].nome + "'>" + entregadores[i].nome + "</option>";
    }
    seletor.innerHTML = html;

    document.getElementById("modalPedido").style.display = "flex";
}

function fecharModalPedido() {
    document.getElementById("modalPedido").style.display = "none";
}

function salvarPedido(evento) {
    evento.preventDefault();

    var item = document.getElementById("itemPedido").value;
    var cliente = document.getElementById("clientePedido").value;
    var endereco = document.getElementById("enderecoPedido").value;
    var valor = parseFloat(document.getElementById("valorPedido").value);
    var frete = parseFloat(document.getElementById("fretePedido").value);
    var entregador = document.getElementById("entregadorPedido").value;
    var status = document.getElementById("statusPedido").value;

    var pedidos = pegarPedidos();
    var novoId = 1;
    for (var i = 0; i < pedidos.length; i++) {
        if (pedidos[i].id >= novoId) {
            novoId = pedidos[i].id + 1;
        }
    }

    var hoje = new Date();
    var dia = String(hoje.getDate()).padStart(2, "0");
    var mes = String(hoje.getMonth() + 1).padStart(2, "0");
    var ano = hoje.getFullYear();
    var dataAtual = dia + "/" + mes + "/" + ano;

    pedidos.push({
        id: novoId,
        item: item,
        cliente: cliente,
        endereco: endereco,
        valor: valor,
        frete: frete,
        entregador: entregador,
        data: dataAtual,
        status: status
    });

    salvarListaPedidos(pedidos);
    fecharModalPedido();
    carregarListaPedidos();
    alert("Pedido cadastrado!");
}

function excluirPedido(id) {
    var confirmar = confirm("Deseja excluir este pedido?");
    if (!confirmar) return;

    var pedidos = pegarPedidos();
    var novaLista = [];
    for (var i = 0; i < pedidos.length; i++) {
        if (pedidos[i].id !== id) {
            novaLista.push(pedidos[i]);
        }
    }
    salvarListaPedidos(novaLista);
    carregarListaPedidos();
}


function carregarListaEntregadores() {
    iniciarDados();

    var entregadores = pegarEntregadores();
    var corpo = document.getElementById("tabelaEntregadores");
    var html = "";

    for (var i = 0; i < entregadores.length; i++) {
        var e = entregadores[i];
        html = html + "<tr>";
        html = html + "<td><div class='celula-entregador'><div class='foto-pessoa'>&#128100;</div>" + e.nome + "</div></td>";
        html = html + "<td>" + e.telefone + "</td>";
        html = html + "<td>" + e.veiculo + "</td>";
        html = html + "<td>" + e.corridas + "</td>";
        html = html + "<td>" + formatarReais(e.recebido) + "</td>";
        html = html + "<td>";
        html = html + "<button class='botao-acao' onclick='verDetalhesEntregador(" + e.id + ")'>Detalhes</button> ";
        html = html + "<button class='botao-acao' onclick='editarEntregador(" + e.id + ")'>Editar</button> ";
        html = html + "<button class='botao-acao botao-vermelho' onclick='excluirEntregador(" + e.id + ")'>Excluir</button>";
        html = html + "</td>";
        html = html + "</tr>";
    }

    corpo.innerHTML = html;
}

function abrirCadastroEntregador() {
    document.getElementById("tituloFormulario").textContent = "Cadastrar Entregador";
    document.getElementById("idEntregador").value = "";
    document.getElementById("nomeEntregador").value = "";
    document.getElementById("telefoneEntregador").value = "";
    document.getElementById("veiculoEntregador").value = "Moto";
    document.getElementById("corridasEntregador").value = "0";
    document.getElementById("recebidoEntregador").value = "0";
    document.getElementById("modalEntregador").style.display = "flex";
}

function editarEntregador(id) {
    var entregadores = pegarEntregadores();
    var e = null;
    for (var i = 0; i < entregadores.length; i++) {
        if (entregadores[i].id === id) {
            e = entregadores[i];
        }
    }
    if (e === null) return;

    document.getElementById("tituloFormulario").textContent = "Editar Entregador";
    document.getElementById("idEntregador").value = e.id;
    document.getElementById("nomeEntregador").value = e.nome;
    document.getElementById("telefoneEntregador").value = e.telefone;
    document.getElementById("veiculoEntregador").value = e.veiculo;
    document.getElementById("corridasEntregador").value = e.corridas;
    document.getElementById("recebidoEntregador").value = e.recebido;
    document.getElementById("modalEntregador").style.display = "flex";
}

function fecharModalEntregador() {
    document.getElementById("modalEntregador").style.display = "none";
}

function salvarEntregador(evento) {
    evento.preventDefault();

    var id = document.getElementById("idEntregador").value;
    var nome = document.getElementById("nomeEntregador").value;
    var telefone = document.getElementById("telefoneEntregador").value;
    var veiculo = document.getElementById("veiculoEntregador").value;
    var corridas = parseInt(document.getElementById("corridasEntregador").value) || 0;
    var recebido = parseFloat(document.getElementById("recebidoEntregador").value) || 0;

    var entregadores = pegarEntregadores();

    if (id === "") {
        var novoId = 1;
        for (var i = 0; i < entregadores.length; i++) {
            if (entregadores[i].id >= novoId) {
                novoId = entregadores[i].id + 1;
            }
        }
        entregadores.push({
            id: novoId,
            nome: nome,
            telefone: telefone,
            veiculo: veiculo,
            corridas: corridas,
            recebido: recebido
        });
        alert("Entregador cadastrado!");
    } else {
        var idNumero = parseInt(id);
        for (var j = 0; j < entregadores.length; j++) {
            if (entregadores[j].id === idNumero) {
                entregadores[j].nome = nome;
                entregadores[j].telefone = telefone;
                entregadores[j].veiculo = veiculo;
                entregadores[j].corridas = corridas;
                entregadores[j].recebido = recebido;
            }
        }
        alert("Entregador atualizado!");
    }

    salvarListaEntregadores(entregadores);
    fecharModalEntregador();
    carregarListaEntregadores();
}

function excluirEntregador(id) {
    var confirmar = confirm("Deseja excluir este entregador?");
    if (!confirmar) return;

    var entregadores = pegarEntregadores();
    var novaLista = [];
    for (var i = 0; i < entregadores.length; i++) {
        if (entregadores[i].id !== id) {
            novaLista.push(entregadores[i]);
        }
    }
    salvarListaEntregadores(novaLista);
    carregarListaEntregadores();
}

function verDetalhesEntregador(id) {
    var entregadores = pegarEntregadores();
    var e = null;
    for (var i = 0; i < entregadores.length; i++) {
        if (entregadores[i].id === id) {
            e = entregadores[i];
        }
    }
    if (e === null) return;

    var pedidos = pegarPedidos();
    var pedidosDoEntregador = 0;
    for (var j = 0; j < pedidos.length; j++) {
        if (pedidos[j].entregador === e.nome) {
            pedidosDoEntregador = pedidosDoEntregador + 1;
        }
    }

    var conteudo = document.getElementById("conteudoDetalhesEntregador");
    conteudo.innerHTML =
        "<p><b>Nome:</b> " + e.nome + "</p>" +
        "<p><b>Telefone:</b> " + e.telefone + "</p>" +
        "<p><b>Veículo:</b> " + e.veiculo + "</p>" +
        "<p><b>Corridas Realizadas:</b> " + e.corridas + "</p>" +
        "<p><b>Total Recebido:</b> " + formatarReais(e.recebido) + "</p>" +
        "<p><b>Pedidos no Sistema:</b> " + pedidosDoEntregador + "</p>";

    document.getElementById("modalDetalhesEntregador").style.display = "flex";
}

function fecharDetalhesEntregador() {
    document.getElementById("modalDetalhesEntregador").style.display = "none";
}


function carregarConfiguracoes() {
    iniciarDados();
    var campo = document.getElementById("campoNomeUsuario");
    if (campo) {
        campo.value = localStorage.getItem("nomeUsuario");
    }
}

function salvarConfiguracoes(evento) {
    evento.preventDefault();
    var nome = document.getElementById("campoNomeUsuario").value;
    if (nome === "") {
        alert("Digite um nome.");
        return;
    }
    localStorage.setItem("nomeUsuario", nome);
    alert("Nome salvo!");
}
