var firebaseConfig = {
    apiKey: "AIzaSyDRy2CxtIQ96XQj-zLjqB6ohWVv4xeLTpo",
    authDomain: "educationsystem-b396d.firebaseapp.com",
    projectId: "educationsystem-b396d",
    storageBucket: "educationsystem-b396d.firebasestorage.app",
    messagingSenderId: "655132210720",
    appId: "1:655132210720:web:559b6e54258b1ba5dbee45",
    measurementId: "G-GN040S9TDK"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

var TEMPO_ENTREGA = 15 * 60 * 1000;

function tratarErro(erro) {
    console.error("Erro no banco:", erro);
    alert("Erro ao acessar o banco de dados:\n" + (erro.message || erro) + "\n\nVerifique se o Firestore está ativado no Firebase Console e se as regras permitem leitura/escrita.");
}


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
    var campo = document.getElementById("senha");
    if (campo.type === "password") {
        campo.type = "text";
    } else {
        campo.type = "password";
    }
}

function abrirMenuUsuario() {
    var sair = confirm("Deseja sair do sistema?");
    if (sair) {
        window.location.href = "index.html";
    }
}


function formatarReais(valor) {
    return "R$" + Number(valor).toFixed(2).replace(".", ",");
}

function dataDeHoje() {
    var hoje = new Date();
    var dia = String(hoje.getDate()).padStart(2, "0");
    var mes = String(hoje.getMonth() + 1).padStart(2, "0");
    var ano = hoje.getFullYear();
    return dia + "/" + mes + "/" + ano;
}


function iniciarDados() {
    db.collection("entregadores").get().then(function(snap) {
        if (snap.empty) {
            db.collection("entregadores").add({ nome: "Jean Estan", telefone: "(11) 98888-1111", veiculo: "Moto", corridas: 15, recebido: 230.00 });
            db.collection("entregadores").add({ nome: "Leda Bur", telefone: "(11) 97777-2222", veiculo: "Moto", corridas: 8, recebido: 130.00 });
            db.collection("entregadores").add({ nome: "Pedro Ass", telefone: "(11) 96666-3333", veiculo: "Bicicleta", corridas: 5, recebido: 50.00 });
        }
    });

    db.collection("produtos").get().then(function(snap) {
        if (snap.empty) {
            db.collection("produtos").add({ nome: "X-Burger Clássico", icone: "🍔", preco: 25.00 });
            db.collection("produtos").add({ nome: "X-Burger Duplo", icone: "🍔", preco: 35.00 });
            db.collection("produtos").add({ nome: "Pizza Mussarela", icone: "🍕", preco: 45.00 });
            db.collection("produtos").add({ nome: "Hot Dog", icone: "🌭", preco: 18.00 });
            db.collection("produtos").add({ nome: "Refrigerante", icone: "🥤", preco: 8.00 });
            db.collection("produtos").add({ nome: "Batata Frita", icone: "🍟", preco: 15.00 });
        }
    });

    db.collection("configuracoes").doc("admin").get().then(function(documento) {
        if (!documento.exists) {
            db.collection("configuracoes").doc("admin").set({
                nomeUsuario: "Leda Burger",
                numeroWhatsApp: "5511999999999"
            });
        }
    });
}


function buscarCep(input) {
    var cep = input.value.replace(/\D/g, "");
    if (cep.length !== 8) return;

    fetch("https://viacep.com.br/ws/" + cep + "/json/")
        .then(function(r) { return r.json(); })
        .then(function(dados) {
            if (dados.erro) {
                alert("CEP não encontrado.");
                return;
            }
            document.getElementById("ruaPedido").value = dados.logradouro || "";
            document.getElementById("bairroPedido").value = dados.bairro || "";
            document.getElementById("cidadePedido").value = dados.localidade || "";
            document.getElementById("estadoPedido").value = dados.uf || "";
        })
        .catch(function() {
            alert("Erro ao buscar CEP.");
        });
}


function calcularDistancia(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var radLat1 = lat1 * Math.PI / 180;
    var radLat2 = lat2 * Math.PI / 180;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(radLat1) * Math.cos(radLat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}


function calcularFreteAuto() {
    var rua = document.getElementById("ruaPedido").value;
    var numero = document.getElementById("numeroPedido").value;
    var bairro = document.getElementById("bairroPedido").value;
    var cidade = document.getElementById("cidadePedido").value;
    var estado = document.getElementById("estadoPedido").value;
    var info = document.getElementById("infoFrete");

    if (!rua || !numero || !cidade) {
        info.textContent = "Preencha CEP, número e cidade para calcular o frete.";
        return;
    }

    var enderecoDestino = rua + ", " + numero + " - " + bairro + ", " + cidade + " - " + estado;
    info.textContent = "Calculando frete...";

    db.collection("configuracoes").doc("admin").get().then(function(documento) {
        if (!documento.exists) {
            info.textContent = "Cadastre a unidade em Configurações.";
            return;
        }
        var config = documento.data();
        if (!config.latUnidade || !config.lonUnidade) {
            info.textContent = "Cadastre o endereço da unidade em Configurações.";
            return;
        }
        if (!config.valorPorKm) {
            info.textContent = "Defina o valor por KM em Configurações.";
            return;
        }

        geocodificarEndereco(enderecoDestino).then(function(coords) {
            if (!coords) {
                info.textContent = "Endereço não encontrado no mapa.";
                return;
            }
            var distancia = calcularDistancia(config.latUnidade, config.lonUnidade, coords.lat, coords.lon);
            var frete = distancia * config.valorPorKm;

            document.getElementById("fretePedido").value = frete.toFixed(2);
            document.getElementById("latDestino").value = coords.lat;
            document.getElementById("lonDestino").value = coords.lon;
            info.textContent = distancia.toFixed(1) + " km de distância - frete: " + formatarReais(frete);
        });
    }).catch(tratarErro);
}


function geocodificarEndereco(endereco) {
    var url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(endereco);
    return fetch(url)
        .then(function(r) { return r.json(); })
        .then(function(dados) {
            if (dados.length === 0) return null;
            return { lat: parseFloat(dados[0].lat), lon: parseFloat(dados[0].lon) };
        })
        .catch(function() { return null; });
}


var latUnidadePronta = null;
var lonUnidadePronta = null;
var timeoutSugestoes = null;

function buscarSugestoes(input) {
    var consulta = input.value.trim();

    latUnidadePronta = null;
    lonUnidadePronta = null;

    if (consulta.length < 3) {
        document.getElementById("sugestoesEndereco").innerHTML = "";
        return;
    }

    clearTimeout(timeoutSugestoes);
    timeoutSugestoes = setTimeout(function() {
        var url = "https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=br&q=" + encodeURIComponent(consulta);
        fetch(url)
            .then(function(r) { return r.json(); })
            .then(function(dados) {
                var lista = document.getElementById("sugestoesEndereco");
                if (dados.length === 0) {
                    lista.innerHTML = "<div class='sugestao-vazia'>Nenhum resultado</div>";
                    return;
                }
                var html = "";
                for (var i = 0; i < dados.length; i++) {
                    var d = dados[i];
                    var nomeSeguro = d.display_name.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                    html = html + "<div class='sugestao' onmousedown=\"escolherSugestao('" + nomeSeguro + "', " + d.lat + ", " + d.lon + ")\">";
                    html = html + "<span class='icone-sugestao'>&#128205;</span>";
                    html = html + "<span>" + d.display_name + "</span>";
                    html = html + "</div>";
                }
                lista.innerHTML = html;
            })
            .catch(function() {
                document.getElementById("sugestoesEndereco").innerHTML = "";
            });
    }, 500);
}

function escolherSugestao(endereco, lat, lon) {
    document.getElementById("enderecoUnidade").value = endereco;
    document.getElementById("sugestoesEndereco").innerHTML = "";
    latUnidadePronta = parseFloat(lat);
    lonUnidadePronta = parseFloat(lon);
    document.getElementById("statusUnidade").textContent = "Endereço selecionado e localizado no mapa.";
}

function fecharSugestoes() {
    setTimeout(function() {
        var lista = document.getElementById("sugestoesEndereco");
        if (lista) lista.innerHTML = "";
    }, 200);
}


function atualizarNomeUsuario() {
    var titulo = document.getElementById("nomeUsuarioTitulo");
    if (!titulo) return;
    db.collection("configuracoes").doc("admin").get().then(function(documento) {
        if (documento.exists && documento.data().nomeUsuario) {
            titulo.textContent = documento.data().nomeUsuario;
        }
    });
}

function atualizarLinkWhatsApp() {
    db.collection("configuracoes").doc("admin").get().then(function(documento) {
        var numero = "5511999999999";
        if (documento.exists && documento.data().numeroWhatsApp) {
            numero = documento.data().numeroWhatsApp.replace(/\D/g, "");
        }
        var links = document.querySelectorAll(".whatsapp");
        for (var i = 0; i < links.length; i++) {
            links[i].href = "https://wa.me/" + numero;
        }
    });
}


function verificarEntregasPendentes() {
    var agora = Date.now();
    db.collection("pedidos").where("status", "==", "Em rota").get().then(function(snap) {
        snap.forEach(function(documento) {
            var p = documento.data();
            if (p.criadoEm && agora - p.criadoEm >= TEMPO_ENTREGA) {
                db.collection("pedidos").doc(documento.id).update({ status: "Entregue" });
            }
        });
    });
}


var mapaDashboard = null;
var marcadoresMapa = [];

function criarMapa() {
    var div = document.getElementById("mapa");
    if (!div) return null;
    if (mapaDashboard) return mapaDashboard;

    mapaDashboard = L.map("mapa").setView([-23.5505, -46.6333], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
    }).addTo(mapaDashboard);
    return mapaDashboard;
}

function limparMarcadores() {
    for (var i = 0; i < marcadoresMapa.length; i++) {
        mapaDashboard.removeLayer(marcadoresMapa[i]);
    }
    marcadoresMapa = [];
}


var intervaloIniciado = false;

function carregarDashboard() {
    iniciarDados();
    atualizarNomeUsuario();
    atualizarLinkWhatsApp();
    verificarEntregasPendentes();

    if (!intervaloIniciado) {
        intervaloIniciado = true;
        setInterval(function() {
            verificarEntregasPendentes();
        }, 30000);
    }

    db.collection("pedidos").get().then(function(snap) {
        var pedidos = [];
        snap.forEach(function(documento) {
            var p = documento.data();
            p.id = documento.id;
            pedidos.push(p);
        });

        document.getElementById("pedidosHoje").textContent = pedidos.length;

        var totalReceita = 0;
        for (var i = 0; i < pedidos.length; i++) {
            totalReceita = totalReceita + pedidos[i].valor;
        }
        document.getElementById("receitaHoje").textContent = formatarReais(totalReceita);

        var emRota = [];
        for (var j = 0; j < pedidos.length; j++) {
            if (pedidos[j].status === "Em rota") {
                emRota.push(pedidos[j]);
            }
        }

        var html = "";
        if (emRota.length === 0) {
            html = "<tr><td colspan='3' class='vazio'>Sem entregas em rota no momento.</td></tr>";
        } else {
            for (var k = 0; k < emRota.length; k++) {
                var p = emRota[k];
                html = html + "<tr>";
                html = html + "<td><div class='celula-entregador'><div class='foto-pessoa'>&#128100;</div>" + p.entregador + "</div></td>";
                html = html + "<td>" + p.endereco + "</td>";
                html = html + "<td>" + formatarReais(p.valor) + " (" + formatarReais(p.frete) + ")</td>";
                html = html + "</tr>";
            }
        }
        document.getElementById("listaEntregas").innerHTML = html;

        var mapa = criarMapa();
        if (mapa) {
            limparMarcadores();
            adicionarPinoUnidade(mapa);
            var pontos = [];
            for (var m = 0; m < pedidos.length; m++) {
                var pe = pedidos[m];
                if (pe.lat && pe.lon) {
                    var corStatus = "#f39c12";
                    if (pe.status === "Entregue") corStatus = "#27ae60";
                    if (pe.status === "Cancelado") corStatus = "#e74c3c";

                    var icone = L.divIcon({
                        className: "pino-mapa",
                        html: "<div class='pino-bolinha' style='background:" + corStatus + "'></div>",
                        iconSize: [22, 22]
                    });

                    var marcador = L.marker([pe.lat, pe.lon], { icon: icone }).addTo(mapa);
                    marcador.bindPopup("<b>" + pe.cliente + "</b><br>" + pe.endereco + "<br>" + formatarReais(pe.valor) + "<br><b>Status:</b> " + pe.status);
                    marcadoresMapa.push(marcador);
                    pontos.push([pe.lat, pe.lon]);
                }
            }
            if (pontos.length > 0) {
                mapa.fitBounds(pontos, { padding: [30, 30], maxZoom: 14 });
            }
        }
    });

    db.collection("entregadores").get().then(function(snap) {
        document.getElementById("entregadoresAtivos").textContent = snap.size;
    }).catch(tratarErro);
}


function carregarListaPedidos() {
    iniciarDados();
    atualizarLinkWhatsApp();
    verificarEntregasPendentes();

    db.collection("pedidos").get().then(function(snap) {
        var pedidos = [];
        snap.forEach(function(documento) {
            var p = documento.data();
            p.id = documento.id;
            pedidos.push(p);
        });

        pedidos.sort(function(a, b) {
            return (b.criadoEm || 0) - (a.criadoEm || 0);
        });

        var corpo = document.getElementById("tabelaPedidos");
        var html = "";

        if (pedidos.length === 0) {
            html = "<tr><td colspan='8' class='vazio'>Nenhum pedido cadastrado ainda.</td></tr>";
        } else {
            for (var i = 0; i < pedidos.length; i++) {
                var p = pedidos[i];
                var classeStatus = "status-rota";
                if (p.status === "Entregue") classeStatus = "status-entregue";
                if (p.status === "Cancelado") classeStatus = "status-cancelado";

                html = html + "<tr>";
                html = html + "<td>#" + p.id.substring(0, 5) + "</td>";
                html = html + "<td>" + p.item + "</td>";
                html = html + "<td>" + p.cliente + "</td>";
                html = html + "<td>" + p.entregador + "</td>";
                html = html + "<td>" + formatarReais(p.valor) + "</td>";
                html = html + "<td>" + p.data + "</td>";
                html = html + "<td><span class='status " + classeStatus + "'>" + p.status + "</span></td>";
                html = html + "<td>";
                html = html + "<button class='botao-acao' onclick=\"verDetalhesPedido('" + p.id + "')\">Ver</button> ";
                html = html + "<button class='botao-acao botao-vermelho' onclick=\"excluirPedido('" + p.id + "')\">Excluir</button>";
                html = html + "</td>";
                html = html + "</tr>";
            }
        }

        corpo.innerHTML = html;
    });
}

function verDetalhesPedido(id) {
    db.collection("pedidos").doc(id).get().then(function(documento) {
        if (!documento.exists) return;
        var p = documento.data();

        var tempoRestante = "";
        if (p.status === "Em rota" && p.criadoEm) {
            var restante = TEMPO_ENTREGA - (Date.now() - p.criadoEm);
            if (restante > 0) {
                var minutos = Math.ceil(restante / 60000);
                tempoRestante = "<p><b>Tempo estimado:</b> " + minutos + " min</p>";
            }
        }

        var conteudo = document.getElementById("conteudoDetalhes");
        conteudo.innerHTML =
            "<p><b>Pedido:</b> #" + id.substring(0, 5) + "</p>" +
            "<p><b>Item:</b> " + p.item + "</p>" +
            "<p><b>Cliente:</b> " + p.cliente + "</p>" +
            "<p><b>CEP:</b> " + (p.cep || "-") + "</p>" +
            "<p><b>Endereço:</b> " + p.endereco + "</p>" +
            "<p><b>Valor:</b> " + formatarReais(p.valor) + "</p>" +
            "<p><b>Frete:</b> " + formatarReais(p.frete) + "</p>" +
            "<p><b>Total:</b> " + formatarReais(p.valor + p.frete) + "</p>" +
            "<p><b>Entregador:</b> " + p.entregador + "</p>" +
            "<p><b>Data:</b> " + p.data + "</p>" +
            "<p><b>Status:</b> " + p.status + "</p>" +
            tempoRestante;

        document.getElementById("modalDetalhes").style.display = "flex";
    });
}

function fecharModalDetalhes() {
    document.getElementById("modalDetalhes").style.display = "none";
}

var produtosSelecionados = [];

function abrirNovoPedido() {
    produtosSelecionados = [];
    document.getElementById("clientePedido").value = "";
    document.getElementById("cepPedido").value = "";
    document.getElementById("ruaPedido").value = "";
    document.getElementById("numeroPedido").value = "";
    document.getElementById("bairroPedido").value = "";
    document.getElementById("cidadePedido").value = "";
    document.getElementById("estadoPedido").value = "";
    document.getElementById("valorPedido").value = "0,00";
    document.getElementById("fretePedido").value = "";

    db.collection("produtos").get().then(function(snap) {
        var lista = document.getElementById("listaProdutosSelecionar");
        var html = "";
        if (snap.empty) {
            html = "<p class='vazio'>Cadastre produtos antes de criar pedidos.</p>";
        } else {
            snap.forEach(function(documento) {
                var p = documento.data();
                var id = documento.id;
                var nomeSeguro = p.nome.replace(/'/g, "\\'");
                html = html + "<div class='item-selecao' onclick=\"alternarProduto('" + id + "', '" + nomeSeguro + "', " + p.preco + ", this)\">";
                html = html + "<div class='icone-item'>" + p.icone + "</div>";
                html = html + "<div class='info-item'>";
                html = html + "<p class='nome-item'>" + p.nome + "</p>";
                html = html + "<p class='preco-item'>" + formatarReais(p.preco) + "</p>";
                html = html + "</div>";
                html = html + "<div class='check-item'>&#10003;</div>";
                html = html + "</div>";
            });
        }
        lista.innerHTML = html;
        atualizarResumoSelecionados();
    });

    db.collection("entregadores").get().then(function(snap) {
        var seletor = document.getElementById("entregadorPedido");
        var html = "";
        snap.forEach(function(documento) {
            var e = documento.data();
            html = html + "<option value='" + e.nome + "'>" + e.nome + "</option>";
        });
        seletor.innerHTML = html;
    });

    document.getElementById("modalPedido").style.display = "flex";
}

function alternarProduto(id, nome, preco, elemento) {
    var indice = -1;
    for (var i = 0; i < produtosSelecionados.length; i++) {
        if (produtosSelecionados[i].id === id) {
            indice = i;
        }
    }

    if (indice >= 0) {
        produtosSelecionados.splice(indice, 1);
        elemento.classList.remove("selecionado");
    } else {
        produtosSelecionados.push({ id: id, nome: nome, preco: preco });
        elemento.classList.add("selecionado");
    }

    atualizarResumoSelecionados();
}

function atualizarResumoSelecionados() {
    var total = 0;
    var nomes = [];
    for (var i = 0; i < produtosSelecionados.length; i++) {
        total = total + produtosSelecionados[i].preco;
        nomes.push(produtosSelecionados[i].nome);
    }

    var resumo = document.getElementById("resumoSelecionados");
    if (produtosSelecionados.length === 0) {
        resumo.textContent = "Nenhum produto selecionado";
    } else {
        resumo.textContent = produtosSelecionados.length + " item(s): " + nomes.join(", ");
    }

    document.getElementById("valorPedido").value = total.toFixed(2);
}

function fecharModalPedido() {
    document.getElementById("modalPedido").style.display = "none";
}

function salvarPedido(evento) {
    evento.preventDefault();

    if (produtosSelecionados.length === 0) {
        alert("Selecione pelo menos um produto.");
        return;
    }

    var nomesItens = [];
    for (var i = 0; i < produtosSelecionados.length; i++) {
        nomesItens.push(produtosSelecionados[i].nome);
    }
    var item = nomesItens.join(", ");

    var cliente = document.getElementById("clientePedido").value;
    var cep = document.getElementById("cepPedido").value;
    var rua = document.getElementById("ruaPedido").value;
    var numero = document.getElementById("numeroPedido").value;
    var bairro = document.getElementById("bairroPedido").value;
    var cidade = document.getElementById("cidadePedido").value;
    var estado = document.getElementById("estadoPedido").value;
    var valor = parseFloat(document.getElementById("valorPedido").value);
    var frete = parseFloat(document.getElementById("fretePedido").value);
    var entregador = document.getElementById("entregadorPedido").value;

    var enderecoCompleto = rua + ", " + numero + " - " + bairro + ", " + cidade + " - " + estado + ", " + cep;
    var latPronta = parseFloat(document.getElementById("latDestino").value);
    var lonPronta = parseFloat(document.getElementById("lonDestino").value);

    var botao = evento.target.querySelector("button[type=submit]");
    botao.disabled = true;
    botao.textContent = "Salvando...";

    function gravarPedido(coords) {
        var novoPedido = {
            item: item,
            cliente: cliente,
            cep: cep,
            endereco: enderecoCompleto,
            valor: valor,
            frete: frete,
            entregador: entregador,
            data: dataDeHoje(),
            criadoEm: Date.now(),
            status: "Em rota",
            lat: coords ? coords.lat : null,
            lon: coords ? coords.lon : null
        };

        db.collection("pedidos").add(novoPedido).then(function(documento) {
            var idCriado = documento.id;
            setTimeout(function() {
                db.collection("pedidos").doc(idCriado).update({ status: "Entregue" }).catch(tratarErro);
            }, TEMPO_ENTREGA);

            db.collection("entregadores").where("nome", "==", entregador).get().then(function(snap) {
                snap.forEach(function(docEntregador) {
                    var dados = docEntregador.data();
                    db.collection("entregadores").doc(docEntregador.id).update({
                        corridas: (dados.corridas || 0) + 1,
                        recebido: (dados.recebido || 0) + frete
                    }).catch(tratarErro);
                });
            }).catch(tratarErro);

            botao.disabled = false;
            botao.textContent = "Salvar";
            fecharModalPedido();
            carregarListaPedidos();
            alert("Pedido cadastrado! Será entregue automaticamente em 15 minutos.");
        }).catch(function(erro) {
            botao.disabled = false;
            botao.textContent = "Salvar";
            tratarErro(erro);
        });
    }

    if (latPronta && lonPronta) {
        gravarPedido({ lat: latPronta, lon: lonPronta });
    } else {
        geocodificarEndereco(enderecoCompleto).then(gravarPedido);
    }
}

function excluirPedido(id) {
    var confirmar = confirm("Deseja excluir este pedido?");
    if (!confirmar) return;
    db.collection("pedidos").doc(id).delete().then(function() {
        carregarListaPedidos();
    }).catch(tratarErro);
}


function carregarListaEntregadores() {
    iniciarDados();
    atualizarLinkWhatsApp();

    db.collection("entregadores").get().then(function(snap) {
        var corpo = document.getElementById("tabelaEntregadores");
        var html = "";

        if (snap.empty) {
            html = "<tr><td colspan='6' class='vazio'>Nenhum entregador cadastrado.</td></tr>";
        } else {
            snap.forEach(function(documento) {
                var e = documento.data();
                var id = documento.id;
                html = html + "<tr>";
                html = html + "<td><div class='celula-entregador'><div class='foto-pessoa'>&#128100;</div>" + e.nome + "</div></td>";
                html = html + "<td>" + e.telefone + "</td>";
                html = html + "<td>" + e.veiculo + "</td>";
                html = html + "<td>" + (e.corridas || 0) + "</td>";
                html = html + "<td>" + formatarReais(e.recebido || 0) + "</td>";
                html = html + "<td>";
                html = html + "<button class='botao-acao' onclick=\"verDetalhesEntregador('" + id + "')\">Detalhes</button> ";
                html = html + "<button class='botao-acao' onclick=\"editarEntregador('" + id + "')\">Editar</button> ";
                html = html + "<button class='botao-acao botao-vermelho' onclick=\"excluirEntregador('" + id + "')\">Excluir</button>";
                html = html + "</td>";
                html = html + "</tr>";
            });
        }

        corpo.innerHTML = html;
    });
}

function abrirCadastroEntregador() {
    document.getElementById("tituloFormulario").textContent = "Cadastrar Entregador";
    document.getElementById("idEntregador").value = "";
    document.getElementById("nomeEntregador").value = "";
    document.getElementById("telefoneEntregador").value = "";
    document.getElementById("veiculoEntregador").value = "Moto";
    document.getElementById("modalEntregador").style.display = "flex";
}

function editarEntregador(id) {
    db.collection("entregadores").doc(id).get().then(function(documento) {
        if (!documento.exists) return;
        var e = documento.data();
        document.getElementById("tituloFormulario").textContent = "Editar Entregador";
        document.getElementById("idEntregador").value = id;
        document.getElementById("nomeEntregador").value = e.nome;
        document.getElementById("telefoneEntregador").value = e.telefone;
        document.getElementById("veiculoEntregador").value = e.veiculo;
        document.getElementById("modalEntregador").style.display = "flex";
    }).catch(tratarErro);
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

    var dados = {
        nome: nome,
        telefone: telefone,
        veiculo: veiculo
    };

    if (id === "") {
        dados.corridas = 0;
        dados.recebido = 0;
        db.collection("entregadores").add(dados).then(function() {
            fecharModalEntregador();
            carregarListaEntregadores();
            alert("Entregador cadastrado!");
        }).catch(tratarErro);
    } else {
        db.collection("entregadores").doc(id).update(dados).then(function() {
            fecharModalEntregador();
            carregarListaEntregadores();
            alert("Entregador atualizado!");
        }).catch(tratarErro);
    }
}

function excluirEntregador(id) {
    var confirmar = confirm("Deseja excluir este entregador?");
    if (!confirmar) return;
    db.collection("entregadores").doc(id).delete().then(function() {
        carregarListaEntregadores();
    }).catch(tratarErro);
}

function verDetalhesEntregador(id) {
    db.collection("entregadores").doc(id).get().then(function(documento) {
        if (!documento.exists) return;
        var e = documento.data();

        db.collection("pedidos").where("entregador", "==", e.nome).get().then(function(snap) {
            var totalPedidos = 0;
            var entregues = 0;
            var emRota = 0;

            snap.forEach(function(doc) {
                totalPedidos = totalPedidos + 1;
                if (doc.data().status === "Entregue") entregues = entregues + 1;
                if (doc.data().status === "Em rota") emRota = emRota + 1;
            });

            var conteudo = document.getElementById("conteudoDetalhesEntregador");
            conteudo.innerHTML =
                "<p><b>Nome:</b> " + e.nome + "</p>" +
                "<p><b>Telefone:</b> " + e.telefone + "</p>" +
                "<p><b>Veículo:</b> " + e.veiculo + "</p>" +
                "<p><b>Corridas Realizadas:</b> " + (e.corridas || 0) + "</p>" +
                "<p><b>Total Recebido:</b> " + formatarReais(e.recebido || 0) + "</p>" +
                "<hr style='margin:10px 0; border:none; border-top:1px solid #eee;'>" +
                "<p><b>Pedidos no Sistema:</b> " + totalPedidos + "</p>" +
                "<p><b>Entregues:</b> " + entregues + "</p>" +
                "<p><b>Em Rota:</b> " + emRota + "</p>";

            document.getElementById("modalDetalhesEntregador").style.display = "flex";
        });
    });
}

function fecharDetalhesEntregador() {
    document.getElementById("modalDetalhesEntregador").style.display = "none";
}


function carregarConfiguracoes() {
    iniciarDados();
    atualizarLinkWhatsApp();

    db.collection("configuracoes").doc("admin").get().then(function(documento) {
        if (documento.exists) {
            var dados = documento.data();
            document.getElementById("campoNomeUsuario").value = dados.nomeUsuario || "";
            document.getElementById("campoWhatsApp").value = dados.numeroWhatsApp || "";
            document.getElementById("enderecoUnidade").value = dados.enderecoUnidade || "";
            document.getElementById("valorPorKm").value = dados.valorPorKm || "";

            var status = document.getElementById("statusUnidade");
            if (dados.latUnidade && dados.lonUnidade) {
                status.textContent = "Unidade localizada no mapa em " + dados.latUnidade.toFixed(4) + ", " + dados.lonUnidade.toFixed(4);
            } else {
                status.textContent = "Coloque o endereço completo da loja para calcular o frete.";
            }
        }
    }).catch(tratarErro);
}

function salvarConfiguracoes(evento) {
    evento.preventDefault();
    var nome = document.getElementById("campoNomeUsuario").value;
    var whatsapp = document.getElementById("campoWhatsApp").value.replace(/\D/g, "");
    var endereco = document.getElementById("enderecoUnidade").value;
    var valorKm = parseFloat(document.getElementById("valorPorKm").value) || 0;

    if (nome === "") {
        alert("Digite um nome.");
        return;
    }

    var dados = {
        nomeUsuario: nome,
        numeroWhatsApp: whatsapp,
        enderecoUnidade: endereco,
        valorPorKm: valorKm
    };

    var status = document.getElementById("statusUnidade");

    if (latUnidadePronta && lonUnidadePronta) {
        dados.latUnidade = latUnidadePronta;
        dados.lonUnidade = lonUnidadePronta;
        gravarConfig(dados);
    } else if (endereco) {
        status.textContent = "Localizando endereço da unidade...";
        geocodificarEndereco(endereco).then(function(coords) {
            if (coords) {
                dados.latUnidade = coords.lat;
                dados.lonUnidade = coords.lon;
            }
            gravarConfig(dados);
        });
    } else {
        gravarConfig(dados);
    }
}

function gravarConfig(dados) {
    db.collection("configuracoes").doc("admin").set(dados, { merge: true }).then(function() {
        alert("Configurações salvas!");
        atualizarLinkWhatsApp();
        carregarConfiguracoes();
    }).catch(tratarErro);
}


function carregarLogin() {
    atualizarLinkWhatsApp();
}


function carregarListaProdutos() {
    iniciarDados();
    atualizarLinkWhatsApp();

    db.collection("produtos").get().then(function(snap) {
        var lista = document.getElementById("listaProdutos");
        var html = "";

        if (snap.empty) {
            html = "<p class='vazio'>Nenhum produto cadastrado.</p>";
        } else {
            snap.forEach(function(documento) {
                var p = documento.data();
                var id = documento.id;
                html = html + "<div class='card-produto'>";
                html = html + "<div class='icone-produto'>" + p.icone + "</div>";
                html = html + "<p class='nome-produto'>" + p.nome + "</p>";
                html = html + "<p class='preco-produto'>" + formatarReais(p.preco) + "</p>";
                html = html + "<div class='acoes-produto'>";
                html = html + "<button class='botao-acao' onclick=\"editarProduto('" + id + "')\">Editar</button> ";
                html = html + "<button class='botao-acao botao-vermelho' onclick=\"excluirProduto('" + id + "')\">Excluir</button>";
                html = html + "</div>";
                html = html + "</div>";
            });
        }

        lista.innerHTML = html;
    });
}

function abrirCadastroProduto() {
    document.getElementById("tituloFormularioProduto").textContent = "Cadastrar Produto";
    document.getElementById("idProduto").value = "";
    document.getElementById("nomeProduto").value = "";
    document.getElementById("precoProduto").value = "";
    document.getElementById("iconeProduto").value = "🍔";
    marcarIconeSelecionado("🍔");
    document.getElementById("modalProduto").style.display = "flex";
}

function escolherIcone(icone, elemento) {
    document.getElementById("iconeProduto").value = icone;
    var opcoes = document.querySelectorAll(".icone-opcao");
    for (var i = 0; i < opcoes.length; i++) {
        opcoes[i].classList.remove("selecionado");
    }
    elemento.classList.add("selecionado");
}

function marcarIconeSelecionado(icone) {
    var opcoes = document.querySelectorAll(".icone-opcao");
    for (var i = 0; i < opcoes.length; i++) {
        if (opcoes[i].textContent.trim() === icone) {
            opcoes[i].classList.add("selecionado");
        } else {
            opcoes[i].classList.remove("selecionado");
        }
    }
}

function editarProduto(id) {
    db.collection("produtos").doc(id).get().then(function(documento) {
        if (!documento.exists) return;
        var p = documento.data();
        document.getElementById("tituloFormularioProduto").textContent = "Editar Produto";
        document.getElementById("idProduto").value = id;
        document.getElementById("nomeProduto").value = p.nome;
        document.getElementById("precoProduto").value = p.preco;
        document.getElementById("iconeProduto").value = p.icone;
        marcarIconeSelecionado(p.icone);
        document.getElementById("modalProduto").style.display = "flex";
    });
}

function fecharModalProduto() {
    document.getElementById("modalProduto").style.display = "none";
}

function salvarProduto(evento) {
    evento.preventDefault();

    var id = document.getElementById("idProduto").value;
    var nome = document.getElementById("nomeProduto").value;
    var icone = document.getElementById("iconeProduto").value;
    var preco = parseFloat(document.getElementById("precoProduto").value);

    if (icone === "") {
        alert("Escolha um ícone para o produto.");
        return;
    }

    var dados = { nome: nome, icone: icone, preco: preco };

    if (id === "") {
        db.collection("produtos").add(dados).then(function() {
            fecharModalProduto();
            carregarListaProdutos();
            alert("Produto cadastrado!");
        }).catch(tratarErro);
    } else {
        db.collection("produtos").doc(id).update(dados).then(function() {
            fecharModalProduto();
            carregarListaProdutos();
            alert("Produto atualizado!");
        }).catch(tratarErro);
    }
}

function excluirProduto(id) {
    var confirmar = confirm("Deseja excluir este produto?");
    if (!confirmar) return;
    db.collection("produtos").doc(id).delete().then(function() {
        carregarListaProdutos();
    }).catch(tratarErro);
}


function adicionarPinoUnidade(mapa) {
    db.collection("configuracoes").doc("admin").get().then(function(documento) {
        if (!documento.exists) return;
        var dados = documento.data();
        if (!dados.latUnidade || !dados.lonUnidade) return;

        var iconeUnidade = L.divIcon({
            className: "pino-mapa",
            html: "<div class='pino-unidade'>🏪</div>",
            iconSize: [46, 54],
            iconAnchor: [23, 54]
        });

        var marcador = L.marker([dados.latUnidade, dados.lonUnidade], { icon: iconeUnidade }).addTo(mapa);
        marcador.bindPopup("<b>Unidade L&R Burger</b><br>" + (dados.enderecoUnidade || ""));
        marcadoresMapa.push(marcador);
    });
}


var mapaGrandeInstance = null;
var marcadoresGrande = [];

function abrirMapaGrande() {
    document.getElementById("modalMapaGrande").style.display = "flex";
    setTimeout(renderizarMapaGrande, 200);
}

function fecharMapaGrande() {
    document.getElementById("modalMapaGrande").style.display = "none";
}

function renderizarMapaGrande() {
    if (!mapaGrandeInstance) {
        mapaGrandeInstance = L.map("mapaGrande").setView([-23.5505, -46.6333], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap"
        }).addTo(mapaGrandeInstance);
    } else {
        mapaGrandeInstance.invalidateSize();
        for (var i = 0; i < marcadoresGrande.length; i++) {
            mapaGrandeInstance.removeLayer(marcadoresGrande[i]);
        }
        marcadoresGrande = [];
    }

    db.collection("configuracoes").doc("admin").get().then(function(documento) {
        if (documento.exists && documento.data().latUnidade) {
            var u = documento.data();
            var iconeUnidade = L.divIcon({
                className: "pino-mapa",
                html: "<div class='pino-unidade'>🏪</div>",
                iconSize: [46, 54],
                iconAnchor: [23, 54]
            });
            var marcador = L.marker([u.latUnidade, u.lonUnidade], { icon: iconeUnidade }).addTo(mapaGrandeInstance);
            marcador.bindPopup("<b>Unidade L&R Burger</b><br>" + (u.enderecoUnidade || ""));
            marcadoresGrande.push(marcador);
        }
    });

    db.collection("pedidos").get().then(function(snap) {
        var pontos = [];
        snap.forEach(function(documento) {
            var p = documento.data();
            if (!p.lat || !p.lon) return;

            var cor = "#f39c12";
            if (p.status === "Entregue") cor = "#27ae60";
            if (p.status === "Cancelado") cor = "#e74c3c";

            var icone = L.divIcon({
                className: "pino-mapa",
                html: "<div class='pino-bolinha' style='background:" + cor + "'></div>",
                iconSize: [22, 22]
            });

            var marcador = L.marker([p.lat, p.lon], { icon: icone }).addTo(mapaGrandeInstance);
            marcador.bindPopup(
                "<div class='popup-pedido'>" +
                "<b>" + p.cliente + "</b><br>" +
                "<b>Item:</b> " + p.item + "<br>" +
                "<b>Endereço:</b> " + p.endereco + "<br>" +
                "<b>Valor:</b> " + formatarReais(p.valor) + "<br>" +
                "<b>Frete:</b> " + formatarReais(p.frete) + "<br>" +
                "<b>Entregador:</b> " + p.entregador + "<br>" +
                "<b>Status:</b> " + p.status +
                "</div>"
            );
            marcadoresGrande.push(marcador);
            pontos.push([p.lat, p.lon]);
        });

        if (pontos.length > 0) {
            mapaGrandeInstance.fitBounds(pontos, { padding: [50, 50], maxZoom: 14 });
        }
    }).catch(tratarErro);
}
