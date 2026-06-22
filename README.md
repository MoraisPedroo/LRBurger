# L&R Burger - Plataforma de Gestão de Entregas

Sistema web para gestão de entregas de uma hamburgueria. Permite controlar pedidos, produtos do cardápio, entregadores e acompanhar as entregas em um mapa real, com cálculo automático de frete por distância.

O projeto foi feito em **HTML, CSS e JavaScript puro** (sem frameworks), usando o **Firebase Firestore** como banco de dados online. A ideia é ser simples de entender e fácil de continuar.

## Acesso online

O sistema já está publicado e pode ser acessado direto pelo navegador:

**https://lrburger.vercel.app/**

Não é preciso instalar nada para testar. Qualquer usuário e senha funcionam no login.

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Configuração do Firebase](#configuração-do-firebase)
- [Estrutura do banco de dados](#estrutura-do-banco-de-dados)
- [APIs externas usadas](#apis-externas-usadas)
- [Páginas do sistema](#páginas-do-sistema)
- [Referência das funções](#referência-das-funções)
- [Como continuar o projeto](#como-continuar-o-projeto)

---

## Funcionalidades

- **Login** com tela personalizada da marca.
- **Dashboard** com indicadores (pedidos do dia, entregadores ativos, receita) e mapa de entregas.
- **Pedidos**: histórico completo, cadastro de novo pedido escolhendo um ou vários produtos, detalhes de cada pedido e exclusão.
- **Produtos**: cadastro do cardápio com nome, preço e um ícone escolhido de uma lista (hambúrguer, pizza, etc.).
- **Entregadores**: cadastro simples (nome, telefone, veículo). As corridas e o valor recebido são preenchidos automaticamente a cada pedido.
- **Configurações**: nome da loja, número de WhatsApp, endereço da unidade (com sugestões automáticas) e valor do frete por km.
- **Busca de CEP**: ao digitar o CEP no pedido, o endereço é preenchido sozinho.
- **Frete automático**: o sistema calcula a distância entre a unidade e o cliente e multiplica pelo valor por km.
- **Mapa real**: cada pedido vira um marcador no mapa. A unidade tem um marcador diferente dos pedidos. O mapa pode ser expandido em tela cheia.
- **Simulação de entrega**: ao cadastrar um pedido, ele fica "Em rota" por 15 minutos e depois muda sozinho para "Entregue".
- **WhatsApp dinâmico**: o botão verde do WhatsApp usa o número cadastrado nas configurações.
- **Responsivo**: funciona em computador, tablet e celular.

---

## Tecnologias

| Tecnologia | Para que serve |
|------------|----------------|
| HTML5 | Estrutura das páginas |
| CSS3 | Estilo e responsividade |
| JavaScript | Lógica do sistema |
| Firebase Firestore | Banco de dados online |
| Leaflet | Mapa interativo |
| OpenStreetMap | Imagens (tiles) do mapa |
| ViaCEP | Busca de endereço pelo CEP |
| Nominatim | Converte endereço em coordenadas (latitude/longitude) |
| Google Fonts (Poppins) | Fonte do sistema |

---

## Estrutura de arquivos

```
LRBurger/
├── index.html           Tela de login
├── dashboard.html       Painel principal com indicadores e mapa
├── pedidos.html         Histórico e cadastro de pedidos
├── produtos.html        Cardápio (cadastro de produtos)
├── entregadores.html    Gestão de entregadores
├── configuracoes.html   Configurações da loja
├── style.css            Todo o estilo do sistema
├── script.js            Toda a lógica do sistema
├── logo.png             Logo da marca
├── motoboy.png          Imagem do entregador
└── README.md            Esta documentação
```

> Todo o JavaScript fica em um único arquivo (`script.js`) e todo o CSS em um único arquivo (`style.css`), compartilhados por todas as páginas.

---

## Como rodar o projeto

O sistema já está publicado na **Vercel** e pode ser usado direto pelo link, sem instalar nada:

**https://lrburger.vercel.app/**

Para rodar localmente (durante o desenvolvimento), o sistema é só de arquivos estáticos. Existem duas formas:

### Forma 1 — Abrir direto no navegador
Dê um duplo clique no `index.html`. Funciona, mas algumas APIs podem ter restrições de segurança do navegador.

### Forma 2 — Usar um servidor local (recomendado)
Se tiver o **VS Code**, instale a extensão **Live Server**, clique com o botão direito em `index.html` e escolha **"Open with Live Server"**.

Ou, se tiver **Python** instalado, abra o terminal na pasta do projeto e rode:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000` no navegador.

### Login
Qualquer usuário e senha funcionam (o login é apenas visual nesta versão). Basta preencher os dois campos e clicar em **Entrar**.

---

## Configuração do Firebase

O banco de dados usado é o **Firebase Firestore**. A configuração já está no início do `script.js`:

```javascript
var firebaseConfig = {
    apiKey: "...",
    authDomain: "educationsystem-b396d.firebaseapp.com",
    projectId: "educationsystem-b396d",
    ...
};
```

Para o banco funcionar, é preciso:

1. Acessar o [Console do Firebase](https://console.firebase.google.com/) e abrir o projeto.
2. No menu lateral, ir em **Firestore Database** e clicar em **Criar banco de dados**.
3. Escolher o **modo de teste** e uma região (ex: `southamerica-east1`).
4. Na aba **Regras**, deixar as regras liberadas para desenvolvimento:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> **Atenção:** essas regras liberam o acesso total e servem só para desenvolvimento/estudo. Em um sistema real, é necessário criar regras de segurança e usar autenticação.

Na primeira vez que o sistema é aberto, ele cria automaticamente alguns entregadores e produtos de exemplo (função `iniciarDados`).

---

## Estrutura do banco de dados

O Firestore organiza os dados em **coleções** (parecido com tabelas). O sistema usa quatro:

### `pedidos`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| item | texto | Produtos do pedido (separados por vírgula) |
| cliente | texto | Nome do cliente |
| cep | texto | CEP de entrega |
| endereco | texto | Endereço completo |
| valor | número | Valor dos produtos |
| frete | número | Valor do frete |
| entregador | texto | Nome do entregador responsável |
| data | texto | Data do pedido (dd/mm/aaaa) |
| criadoEm | número | Momento da criação (para contar os 15 minutos) |
| status | texto | "Em rota", "Entregue" ou "Cancelado" |
| lat / lon | número | Coordenadas do endereço (para o mapa) |

### `produtos`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| nome | texto | Nome do produto |
| icone | texto | Emoji escolhido (ex: 🍔) |
| preco | número | Preço do produto |

### `entregadores`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| nome | texto | Nome do entregador |
| telefone | texto | Telefone |
| veiculo | texto | Moto, Carro, Bicicleta ou A pé |
| corridas | número | Quantas entregas já fez (preenchido automaticamente) |
| recebido | número | Total recebido em frete (preenchido automaticamente) |

### `configuracoes`
Documento único com o id `admin`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| nomeUsuario | texto | Nome que aparece no painel |
| numeroWhatsApp | texto | Número usado no botão de WhatsApp |
| enderecoUnidade | texto | Endereço da loja |
| valorPorKm | número | Valor cobrado por km de frete |
| latUnidade / lonUnidade | número | Coordenadas da loja |

---

## APIs externas usadas

- **ViaCEP** (`https://viacep.com.br/ws/CEP/json/`): recebe um CEP e devolve rua, bairro, cidade e estado.
- **Nominatim / OpenStreetMap** (`https://nominatim.openstreetmap.org/search`): recebe um endereço em texto e devolve a latitude e longitude. Também é usada para as sugestões de endereço.
- **Leaflet + tiles do OpenStreetMap**: desenham o mapa interativo na tela.

Todas são gratuitas e não exigem chave de acesso.

---

## Páginas do sistema

### Login (`index.html`)
Tela de entrada com a logo e o entregador apoiado sobre o formulário. Valida se os campos foram preenchidos e leva ao dashboard.

### Dashboard (`dashboard.html`)
Mostra três cartões com números (pedidos do dia, entregadores ativos, receita), uma tabela com as entregas que estão em rota e um mapa. Clicando no mapa (ou no botão de expandir), ele abre em tela cheia mostrando todos os pedidos e a unidade.

### Pedidos (`pedidos.html`)
Lista todos os pedidos com status colorido. O botão **+ Novo Pedido** abre um formulário onde se escolhe um ou mais produtos do cardápio, digita o CEP (que preenche o endereço) e o frete é calculado sozinho. Cada pedido tem botão para ver detalhes e excluir.

### Produtos (`produtos.html`)
Mostra o cardápio em cartões. O botão **+ Cadastrar Produto** abre um formulário com nome, preço e uma grade de ícones para escolher. Permite editar e excluir produtos.

### Entregadores (`entregadores.html`)
Lista os entregadores com o número de corridas e o total recebido. O cadastro pede só nome, telefone e veículo — os valores de corridas e recebido são atualizados automaticamente quando um pedido é feito. Permite ver detalhes, editar e excluir.

### Configurações (`configuracoes.html`)
Permite mudar o nome da loja, o número de WhatsApp, o endereço da unidade (com sugestões automáticas enquanto digita) e o valor do frete por km.

---

## Referência das funções

Todas as funções estão em `script.js`. Abaixo, agrupadas por área.

### Gerais
- `tratarErro(erro)` — mostra um alerta quando algo dá errado no banco.
- `entrar(evento)` — faz o login e leva ao dashboard.
- `mostrarSenha()` — mostra ou esconde a senha no login.
- `abrirMenuUsuario()` — pergunta se deseja sair e volta ao login.
- `formatarReais(valor)` — transforma um número em texto no formato R$0,00.
- `dataDeHoje()` — devolve a data atual no formato dd/mm/aaaa.
- `iniciarDados()` — cria os dados de exemplo na primeira vez.

### Endereço e mapa
- `buscarCep(input)` — busca o endereço pelo CEP (ViaCEP).
- `calcularDistancia(lat1, lon1, lat2, lon2)` — calcula a distância em km entre dois pontos (fórmula de Haversine).
- `calcularFreteAuto()` — calcula o frete pela distância entre a unidade e o cliente.
- `geocodificarEndereco(endereco)` — converte um endereço em coordenadas (Nominatim).
- `buscarSugestoes(input)` — mostra sugestões de endereço enquanto o usuário digita.
- `escolherSugestao(endereco, lat, lon)` — preenche o endereço escolhido da lista.
- `fecharSugestoes()` — fecha a lista de sugestões.
- `criarMapa()` — cria o mapa do dashboard.
- `limparMarcadores()` — remove os marcadores antigos do mapa.
- `adicionarPinoUnidade(mapa)` — adiciona o marcador da loja no mapa.
- `abrirMapaGrande()` / `fecharMapaGrande()` / `renderizarMapaGrande()` — controlam o mapa em tela cheia.

### Dashboard
- `carregarDashboard()` — carrega os números, a tabela e o mapa.
- `atualizarNomeUsuario()` — atualiza o nome da loja no título.
- `atualizarLinkWhatsApp()` — atualiza o link do botão de WhatsApp.
- `verificarEntregasPendentes()` — verifica se algum pedido já passou dos 15 minutos e muda para "Entregue".

### Pedidos
- `carregarListaPedidos()` — mostra todos os pedidos na tabela.
- `verDetalhesPedido(id)` — abre os detalhes de um pedido.
- `fecharModalDetalhes()` — fecha a janela de detalhes.
- `abrirNovoPedido()` — abre o formulário de novo pedido.
- `alternarProduto(id, nome, preco, elemento)` — marca/desmarca um produto no pedido.
- `atualizarResumoSelecionados()` — atualiza o resumo e o valor total dos produtos escolhidos.
- `fecharModalPedido()` — fecha o formulário de pedido.
- `salvarPedido(evento)` — salva o pedido no banco e agenda a entrega para 15 minutos.
- `excluirPedido(id)` — exclui um pedido.

### Produtos
- `carregarListaProdutos()` — mostra os produtos em cartões.
- `abrirCadastroProduto()` — abre o formulário de produto.
- `escolherIcone(icone, elemento)` — escolhe o ícone do produto.
- `marcarIconeSelecionado(icone)` — destaca o ícone selecionado.
- `editarProduto(id)` — abre um produto para edição.
- `fecharModalProduto()` — fecha o formulário de produto.
- `salvarProduto(evento)` — salva ou atualiza um produto.
- `excluirProduto(id)` — exclui um produto.

### Entregadores
- `carregarListaEntregadores()` — mostra os entregadores na tabela.
- `abrirCadastroEntregador()` — abre o formulário de entregador.
- `editarEntregador(id)` — abre um entregador para edição.
- `fecharModalEntregador()` — fecha o formulário.
- `salvarEntregador(evento)` — salva ou atualiza um entregador.
- `excluirEntregador(id)` — exclui um entregador.
- `verDetalhesEntregador(id)` — mostra os detalhes e estatísticas do entregador.
- `fecharDetalhesEntregador()` — fecha a janela de detalhes.

### Configurações
- `carregarConfiguracoes()` — carrega os dados salvos.
- `salvarConfiguracoes(evento)` — salva as configurações.
- `gravarConfig(dados)` — grava os dados de configuração no banco.

---

## Como continuar o projeto

Algumas ideias de melhorias para quem for dar continuidade:

- **Login de verdade** usando o Firebase Authentication.
- **Quantidade por produto** no pedido (hoje cada produto entra uma vez).
- **Categorias de produtos** (lanches, bebidas, sobremesas).
- **Filtro e busca** na lista de pedidos.
- **Relatórios** de vendas por período.
- **Status manual** do pedido (poder marcar como cancelado, por exemplo).
- **Regras de segurança** no Firestore antes de colocar em produção.

### Padrão do código
O código foi escrito de forma simples para facilitar o entendimento:

- Funções declaradas com `function nome() { }`.
- Variáveis com `var`.
- Laços com `for` clássico.
- Acesso ao banco com `.then()`.
- Nomes em português.

Mantenha esse padrão ao adicionar coisas novas, para o projeto continuar fácil de ler.
