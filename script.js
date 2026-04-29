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

function mudarAba(evento, nome) {
    var itens = document.querySelectorAll(".lista-menu li");
    for (var i = 0; i < itens.length; i++) {
        itens[i].classList.remove("ativo");
    }
    evento.currentTarget.classList.add("ativo");

    if (nome !== "dashboard") {
        alert("Página '" + nome + "' em construção.");
    }
}

function abrirMenuUsuario() {
    var sair = confirm("Deseja sair do sistema?");
    if (sair) {
        window.location.href = "index.html";
    }
}

var entregas = [
    {
        nome: "Jean Estan",
        endereco: "Rua Peder, Novo Riacho. 32321-490",
        valor: "R$230,00 (R$10,00)"
    },
    {
        nome: "Leda",
        endereco: "Rua das Petunias, Osasco. 32176-324",
        valor: "R$130,00 (R$10,00)"
    },
    {
        nome: "Pedro Ass",
        endereco: "Rua Luciano Hulk, Eldorado. 32345-234",
        valor: "R$50,00 (R$5,50)"
    }
];

function carregarEntregas() {
    var corpoTabela = document.getElementById("listaEntregas");
    if (!corpoTabela) {
        return;
    }

    var html = "";
    for (var i = 0; i < entregas.length; i++) {
        html += "<tr>";
        html += "<td><div class='celula-entregador'><div class='foto-pessoa'>&#128100;</div>" + entregas[i].nome + "</div></td>";
        html += "<td>" + entregas[i].endereco + "</td>";
        html += "<td>" + entregas[i].valor + "</td>";
        html += "</tr>";
    }

    corpoTabela.innerHTML = html;
}
