const SUPABASE_URL =
    "https://fmwmgoxjmcvsmfbcpfsj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ZJR2Z6gOfNO5rFhZb-RWwg_qvyY2b9Y";

const BUCKET = "imagens";


/* =========================================
   ELEMENTOS
========================================= */

const form = document.getElementById("formPrato");

const listaPratos =
    document.getElementById("listaPratos");

const botaoAdicionar =
    document.getElementById("botaoAdicionar");

const inputImagem =
    document.getElementById("imagem");


/* =========================================
   CARREGAR PRATOS
========================================= */

async function carregarPratos() {

    listaPratos.innerHTML =
        `<p class="carregando">
            Carregando pratos...
        </p>`;

    try {

        const resposta = await fetch(

            `${SUPABASE_URL}/rest/v1/prato?select=*&order=id.asc`,

            {
                method: "GET",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`
                }
            }

        );


        if (!resposta.ok) {

            const erro =
                await resposta.text();

            throw new Error(
                `Erro ${resposta.status}: ${erro}`
            );

        }


        const pratos =
            await resposta.json();


        console.log(
            "Pratos encontrados:",
            pratos
        );


        mostrarPratos(pratos);

    }

    catch (erro) {

        console.error(
            "Erro ao carregar pratos:",
            erro
        );

        listaPratos.innerHTML =
            `<p>
                Erro ao carregar os pratos.
            </p>`;

    }

}


/* =========================================
   MOSTRAR PRATOS
========================================= */

function mostrarPratos(pratos) {

    listaPratos.innerHTML = "";


    if (!pratos.length) {

        listaPratos.innerHTML =
            `<p>Nenhum prato cadastrado.</p>`;

        return;

    }


    pratos.forEach(prato => {

        const card =
            document.createElement("article");

        card.className = "prato";


        const imagem =
            prato.imagem ||
            "https://via.placeholder.com/500x300?text=Sem+imagem";


        const preco =
            Number(prato.preco || 0);


        card.innerHTML = `

            <img
                class="prato-imagem"
                src="${imagem}"
                alt="${prato.nome || "Prato"}"
            >

            <div class="prato-info">

                <h3>
                    ${prato.nome || "Sem nome"}
                </h3>

                <p>
                    ${prato.descricao || "Sem descrição"}
                </p>

                <span class="prato-categoria">
                    ${prato.categoria || "Sem categoria"}
                </span>

                <span class="prato-preco">
                    R$ ${preco
                        .toFixed(2)
                        .replace(".", ",")}
                </span>


                <!-- BOTÃO EXCLUIR -->

                <button
                    class="botao-excluir"
                    type="button"
                >
                    🗑️ Excluir prato
                </button>

            </div>

        `;


        /* =====================================
           EVENTO DO BOTÃO EXCLUIR
        ===================================== */

        const botaoExcluir =
            card.querySelector(".botao-excluir");


        botaoExcluir.addEventListener(
            "click",

            function () {

                excluirPrato(
                    prato.id,
                    prato.nome
                );

            }

        );


        listaPratos.appendChild(card);

    });

}


/* =========================================
   EXCLUIR PRATO
========================================= */

async function excluirPrato(id, nome) {

    const confirmar =
        confirm(
            `Tem certeza que deseja excluir "${nome}"?`
        );


    if (!confirmar) {

        return;

    }


    try {

        console.log(
            "Excluindo prato:",
            id
        );


        const resposta =
            await fetch(

                `${SUPABASE_URL}/rest/v1/prato?id=eq.${id}`,

                {

                    method: "DELETE",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Prefer":
                            "return=representation"

                    }

                }

            );


        if (!resposta.ok) {

            const erro =
                await resposta.text();


            throw new Error(

                `Erro ao excluir (${resposta.status}): ${erro}`

            );

        }


        console.log(
            "Prato excluído com sucesso!"
        );


        alert(
            `"${nome}" foi excluído com sucesso!`
        );


        /* =====================================
           ATUALIZAR LISTA
        ===================================== */

        await carregarPratos();

    }

    catch (erro) {

        console.error(
            "Erro ao excluir prato:",
            erro
        );


        alert(

            "Não foi possível excluir o prato.\n\n" +
            erro.message

        );

    }

}


/* =========================================
   ENVIAR IMAGEM PARA SUPABASE STORAGE
========================================= */

async function enviarImagem(arquivo) {

    console.log(
        "Enviando imagem:",
        arquivo.name
    );


    const extensao =
        arquivo.name
            .split(".")
            .pop();


    const nomeArquivo =
        `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${extensao}`;


    const caminho =
        `pratos/${nomeArquivo}`;


    console.log(
        "Caminho:",
        caminho
    );


    const resposta = await fetch(

        `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${caminho}`,

        {
            method: "POST",

            headers: {
                "apikey": SUPABASE_KEY,

                "Authorization":
                    `Bearer ${SUPABASE_KEY}`,

                "Content-Type":
                    arquivo.type
            },

            body: arquivo
        }

    );


    if (!resposta.ok) {

        const erro =
            await resposta.text();

        throw new Error(
            `Erro no upload (${resposta.status}): ${erro}`
        );

    }


    console.log(
        "Imagem enviada com sucesso!"
    );


    return (
        `${SUPABASE_URL}` +
        `/storage/v1/object/public/` +
        `${BUCKET}/${caminho}`
    );

}


/* =========================================
   ADICIONAR PRATO
========================================= */

form.addEventListener(
    "submit",

    async function (evento) {

        evento.preventDefault();


        const nome =
            document
                .getElementById("nome")
                .value
                .trim();


        const descricao =
            document
                .getElementById("descricao")
                .value
                .trim();


        const preco =
            Number(
                document
                    .getElementById("preco")
                    .value
            );


        const categoria =
            document
                .getElementById("categoria")
                .value;


        const arquivo =
            inputImagem.files[0];


        /* VALIDAÇÕES */

        if (!nome) {

            alert(
                "Digite o nome do prato."
            );

            return;

        }


        if (
            isNaN(preco) ||
            preco < 0
        ) {

            alert(
                "Digite um preço válido."
            );

            return;

        }


        if (!categoria) {

            alert(
                "Escolha uma categoria."
            );

            return;

        }


        if (!arquivo) {

            alert(
                "Escolha uma imagem."
            );

            return;

        }


        if (
            !arquivo.type.startsWith("image/")
        ) {

            alert(
                "O arquivo selecionado não é uma imagem."
            );

            return;

        }


        try {

            botaoAdicionar.disabled = true;


            /* =====================================
               UPLOAD DA IMAGEM
            ===================================== */

            botaoAdicionar.textContent =
                "Enviando imagem...";


            const urlImagem =
                await enviarImagem(arquivo);


            console.log(
                "URL da imagem:",
                urlImagem
            );


            /* =====================================
               SALVAR NO BANCO
            ===================================== */

            botaoAdicionar.textContent =
                "Salvando prato...";


            const dados = {

                nome: nome,

                descricao: descricao,

                preco: preco,

                categoria: categoria,

                imagem: urlImagem

            };


            const resposta = await fetch(

                `${SUPABASE_URL}/rest/v1/prato`,

                {
                    method: "POST",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Content-Type":
                            "application/json",

                        "Prefer":
                            "return=representation"

                    },

                    body:
                        JSON.stringify(dados)

                }

            );


            if (!resposta.ok) {

                const erro =
                    await resposta.text();

                throw new Error(
                    `Erro ao salvar (${resposta.status}): ${erro}`
                );

            }


            const pratoSalvo =
                await resposta.json();


            console.log(
                "Prato salvo:",
                pratoSalvo
            );


            alert(
                "Prato adicionado com sucesso!"
            );


            /* LIMPAR FORMULÁRIO */

            form.reset();


            /* ATUALIZAR LISTA */

            await carregarPratos();


        }

        catch (erro) {

            console.error(
                "ERRO COMPLETO:",
                erro
            );


            alert(

                "Não foi possível adicionar o prato.\n\n" +
                erro.message

            );

        }

        finally {

            botaoAdicionar.disabled = false;

            botaoAdicionar.textContent =
                "+ Adicionar prato";

        }

    }

);


/* =========================================
   INICIAR
========================================= */

carregarPratos();
