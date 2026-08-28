const API_URL = "/api/pratos";
const API_IMAGENS_URL = "/api/imagens";

const listaPratos = document.getElementById("listaPratos");
const botaoNovo = document.getElementById("novoPrato");
const campoPesquisa = document.getElementById("campoPesquisa");
const mensagem = document.getElementById("mensagem");


/* =========================================
   MOSTRAR MENSAGEM
========================================= */

function mostrarMensagem(texto, tipo = "sucesso") {

    if (!mensagem) {
        alert(texto);
        return;
    }

    mensagem.textContent = texto;
    mensagem.className = tipo;

    setTimeout(() => {
        mensagem.textContent = "";
        mensagem.className = "";
    }, 4000);

}


/* =========================================
   BOTÃO NOVO PRATO
========================================= */

botaoNovo.addEventListener("click", () => {

    const card = criarCard();

    const campoNome =
        card.querySelector(".nomePrato");

    campoNome.focus();

});


/* =========================================
   CRIAR CARD
========================================= */

function criarCard(prato = null) {

    const card = document.createElement("div");

    card.classList.add("card");


    if (prato && prato.id) {
        card.dataset.id = prato.id;
    }


    /*
       Arquivo real selecionado pelo usuário.
    */

    card._arquivoImagem = null;


    /*
       Imagem que será exibida inicialmente.
    */

    const imagemAtual =
        prato && prato.imagem
            ? prato.imagem
            : "/imagens/sem-imagem.png";


    card.innerHTML = `

        <div class="imagem">

            <img
                src="${imagemAtual}"
                alt="Prato">

        </div>


        <input
            class="imagemInput"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp">


        <label>Nome</label>

        <input
            class="nomePrato"
            type="text"
            placeholder="Nome do prato"
            value="${prato ? prato.nome : ""}">


        <label>Preço</label>

        <input
            class="precoPrato"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value="${prato ? prato.preco : ""}">


        <label>Descrição</label>

        <textarea
            class="descricaoPrato"
            rows="4"
            placeholder="Descrição do prato">${prato ? prato.descricao : ""}</textarea>


        <label>Categoria</label>

        <select class="categoriaPrato">

            <option
                value="Entradas"
                ${prato && prato.categoria === "Entradas" ? "selected" : ""}>
                Entradas
            </option>

            <option
                value="Pratos Principais"
                ${prato && prato.categoria === "Pratos Principais" ? "selected" : ""}>
                Pratos Principais
            </option>

            <option
                value="Sobremesas"
                ${prato && prato.categoria === "Sobremesas" ? "selected" : ""}>
                Sobremesas
            </option>

            <option
                value="Bebidas"
                ${prato && prato.categoria === "Bebidas" ? "selected" : ""}>
                Bebidas
            </option>

        </select>


        <div class="botoes">

            <button
                type="button"
                class="salvar">

                💾 Salvar

            </button>


            <button
                type="button"
                class="excluir">

                🗑 Excluir

            </button>

        </div>

    `;


    listaPratos.appendChild(card);

    prepararCard(card);

    return card;

}


/* =========================================
   CONFIGURAR IMAGEM
========================================= */

function configurarUploadImagem(card) {

    const inputImagem =
        card.querySelector(".imagemInput");

    const imagem =
        card.querySelector(".imagem img");


    inputImagem.addEventListener("change", function () {

        const arquivo = this.files[0];


        if (!arquivo) {
            return;
        }


        /*
           Verifica se realmente é uma imagem.
        */

        if (!arquivo.type.startsWith("image/")) {

            mostrarMensagem(
                "Selecione um arquivo de imagem válido.",
                "erro"
            );

            inputImagem.value = "";

            return;
        }


        /*
           Guarda o arquivo real.

           Esse arquivo será enviado para
           o servidor quando clicar em Salvar.
        */

        card._arquivoImagem = arquivo;


        /*
           Cria apenas uma prévia local.
        */

        const leitor = new FileReader();


        leitor.onload = function (event) {

            imagem.src = event.target.result;

        };


        leitor.readAsDataURL(arquivo);

    });

}


/* =========================================
   ENVIAR IMAGEM PARA O SERVIDOR
========================================= */

async function enviarImagem(arquivo) {

    console.log("Enviando imagem:", arquivo.name);


    const dados = new FormData();

    dados.append(
        "imagem",
        arquivo,
        arquivo.name
    );


    const resposta = await fetch(
        API_IMAGENS_URL,
        {
            method: "POST",
            body: dados
        }
    );


    console.log(
        "Resposta do upload:",
        resposta.status
    );


    if (!resposta.ok) {

        let erroTexto = "";

        try {

            erroTexto =
                await resposta.text();

        } catch (erro) {
        }


        throw new Error(
            "Erro ao enviar imagem. Status: "
            + resposta.status
            + " "
            + erroTexto
        );

    }


    const resultado =
        await resposta.json();


    console.log(
        "Imagem salva:",
        resultado
    );


    if (!resultado.imagem) {

        throw new Error(
            "A API não retornou o endereço da imagem."
        );

    }


    return resultado.imagem;

}


/* =========================================
   SALVAR PRATO
========================================= */

async function salvarPrato(card) {

    const botaoSalvar =
        card.querySelector(".salvar");


    const nome =
        card.querySelector(".nomePrato")
            .value
            .trim();


    const preco =
        parseFloat(
            card.querySelector(".precoPrato")
                .value
        );


    const descricao =
        card.querySelector(".descricaoPrato")
            .value
            .trim();


    const categoria =
        card.querySelector(".categoriaPrato")
            .value;


    /*
       VALIDAÇÕES
    */

    if (!nome) {

        mostrarMensagem(
            "Digite o nome do prato.",
            "erro"
        );

        return;

    }


    if (isNaN(preco)) {

        mostrarMensagem(
            "Digite um preço válido.",
            "erro"
        );

        return;

    }


    try {

        botaoSalvar.disabled = true;

        botaoSalvar.textContent =
            "Salvando...";


        let imagem =
            card.querySelector(".imagem img")
                .getAttribute("src");


        /*
           Se uma nova imagem foi escolhida,
           envia primeiro a imagem.
        */

        if (card._arquivoImagem) {

            mostrarMensagem(
                "Enviando imagem...",
                "sucesso"
            );


            imagem =
                await enviarImagem(
                    card._arquivoImagem
                );


            console.log(
                "URL recebida da API:",
                imagem
            );

        }


        /*
           Monta o objeto que será enviado
           para o banco de dados.
        */

        const prato = {

            nome: nome,

            preco: preco,

            descricao: descricao,

            categoria: categoria,

            imagem: imagem

        };


        console.log(
            "Salvando prato:",
            prato
        );


        let resposta;


        const id =
            card.dataset.id;


        /*
           NOVO PRATO
        */

        if (!id) {

            resposta =
                await fetch(
                    API_URL,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(prato)

                    }
                );

        }


        /*
           ATUALIZAR PRATO
        */

        else {

            resposta =
                await fetch(
                    `${API_URL}/${id}`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(prato)

                    }
                );

        }


        console.log(
            "Resposta do prato:",
            resposta.status
        );


        if (!resposta.ok) {

            const textoErro =
                await resposta.text();

            throw new Error(
                "Erro ao salvar prato: "
                + resposta.status
                + " "
                + textoErro
            );

        }


        const pratoSalvo =
            await resposta.json();


        /*
           Guarda o ID.
        */

        card.dataset.id =
            pratoSalvo.id;


        /*
           Atualiza a imagem usando
           o endereço oficial do servidor.
        */

        const imagemElemento =
            card.querySelector(".imagem img");


        imagemElemento.src =
            pratoSalvo.imagem;


        /*
           Remove o arquivo temporário,
           pois agora ele já está salvo.
        */

        card._arquivoImagem = null;


        mostrarMensagem(
            "Prato salvo com sucesso!",
            "sucesso"
        );


    }

    catch (erro) {

        console.error(
            "ERRO AO SALVAR:",
            erro
        );


        mostrarMensagem(
            "Não foi possível salvar o prato: "
            + erro.message,
            "erro"
        );

    }

    finally {

        botaoSalvar.disabled = false;

        botaoSalvar.textContent =
            "💾 Salvar";

    }

}


/* =========================================
   EXCLUIR PRATO
========================================= */

function configurarExcluir(card) {

    const botaoExcluir =
        card.querySelector(".excluir");


    botaoExcluir.addEventListener(
        "click",
        async () => {

            const id =
                card.dataset.id;


            /*
               Se o prato ainda não foi salvo,
               apenas remove da tela.
            */

            if (!id) {

                card.remove();

                return;

            }


            const confirmar =
                confirm(
                    "Deseja realmente excluir este prato?"
                );


            if (!confirmar) {
                return;
            }


            try {

                const resposta =
                    await fetch(
                        `${API_URL}/${id}`,
                        {
                            method: "DELETE"
                        }
                    );


                if (!resposta.ok) {

                    throw new Error(
                        "Erro HTTP: "
                        + resposta.status
                    );

                }


                card.remove();


                mostrarMensagem(
                    "Prato excluído com sucesso!",
                    "sucesso"
                );


            }

            catch (erro) {

                console.error(erro);


                mostrarMensagem(
                    "Não foi possível excluir o prato.",
                    "erro"
                );

            }

        }
    );

}


/* =========================================
   PREPARAR CARD
========================================= */

function prepararCard(card) {

    configurarUploadImagem(card);

    configurarExcluir(card);


    const botaoSalvar =
        card.querySelector(".salvar");


    botaoSalvar.addEventListener(
        "click",
        () => {

            salvarPrato(card);

        }
    );

}


/* =========================================
   CARREGAR PRATOS
========================================= */

async function carregarPratos() {

    try {

        const resposta =
            await fetch(API_URL);


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: "
                + resposta.status
            );

        }


        const pratos =
            await resposta.json();


        listaPratos.innerHTML = "";


        pratos.forEach(prato => {

            criarCard(prato);

        });


    }

    catch (erro) {

        console.error(
            "Erro ao carregar pratos:",
            erro
        );


        mostrarMensagem(
            "Não foi possível carregar os pratos.",
            "erro"
        );

    }

}


/* =========================================
   PESQUISA
========================================= */

campoPesquisa.addEventListener(
    "input",
    () => {

        const texto =
            campoPesquisa.value
                .toLowerCase()
                .trim();


        document
            .querySelectorAll(".card")
            .forEach(card => {

                const nome =
                    card
                        .querySelector(".nomePrato")
                        .value
                        .toLowerCase();


                if (nome.includes(texto)) {

                    card.style.display =
                        "block";

                }

                else {

                    card.style.display =
                        "none";

                }

            });

    }
);


/* =========================================
   INICIAR SISTEMA
========================================= */

carregarPratos();
