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
        prato.preco !== null &&
        prato.preco !== undefined
            ? Number(prato.preco)
            : null;


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


            ${preco !== null ? `

                <span class="prato-preco">

                    R$ ${preco
                        .toFixed(2)
                        .replace(".", ",")}

                </span>

            ` : ""}


            ${prato.quantidade !== null &&
            prato.quantidade !== undefined ? `

                <p class="prato-quantidade">

                    Quantidade disponível:
                    ${prato.quantidade}

                </p>

            ` : ""}


            ${prato.preco_pequeno !== null ||
            prato.preco_medio !== null ||
            prato.preco_grande !== null ? `

                <div class="precos-tamanho">

                    <strong>
                        Preços por tamanho:
                    </strong>

                    ${prato.preco_pequeno !== null &&
                    prato.preco_pequeno !== undefined ? `

                        <span>
                            Pequeno:
                            R$ ${Number(prato.preco_pequeno)
                                .toFixed(2)
                                .replace(".", ",")}
                        </span>

                    ` : ""}


                    ${prato.preco_medio !== null &&
                    prato.preco_medio !== undefined ? `

                        <span>
                            Médio:
                            R$ ${Number(prato.preco_medio)
                                .toFixed(2)
                                .replace(".", ",")}
                        </span>

                    ` : ""}


                    ${prato.preco_grande !== null &&
                    prato.preco_grande !== undefined ? `

                        <span>
                            Grande:
                            R$ ${Number(prato.preco_grande)
                                .toFixed(2)
                                .replace(".", ",")}
                        </span>

                    ` : ""}

                </div>

            ` : ""}


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


    /* =====================================
       NOVOS CAMPOS OPCIONAIS
    ===================================== */

    const precoValor =
        document
            .getElementById("preco")
            .value;


    const quantidadeValor =
        document
            .getElementById("quantidade")
            .value;


    const precoPequenoValor =
        document
            .getElementById("preco_pequeno")
            .value;


    const precoMedioValor =
        document
            .getElementById("preco_medio")
            .value;


    const precoGrandeValor =
        document
            .getElementById("preco_grande")
            .value;


    /* Se estiver vazio, envia NULL */

    const preco =
        precoValor === ""
            ? null
            : Number(precoValor);


    const quantidade =
        quantidadeValor === ""
            ? null
            : Number(quantidadeValor);


    const preco_pequeno =
        precoPequenoValor === ""
            ? null
            : Number(precoPequenoValor);


    const preco_medio =
        precoMedioValor === ""
            ? null
            : Number(precoMedioValor);


    const preco_grande =
        precoGrandeValor === ""
            ? null
            : Number(precoGrandeValor);


    const categoria =
        document
            .getElementById("categoria")
            .value;


    const arquivo =
        inputImagem.files[0];


    /* =====================================
       VALIDAÇÕES
    ===================================== */

    if (!nome) {

        alert(
            "Digite o nome do prato."
        );

        return;

    }


    /* PREÇO NORMAL É OPCIONAL */

    if (
        preco !== null &&
        (
            isNaN(preco) ||
            preco < 0
        )
    ) {

        alert(
            "Digite um preço válido."
        );

        return;

    }


    /* QUANTIDADE É OPCIONAL */

    if (
        quantidade !== null &&
        (
            isNaN(quantidade) ||
            quantidade < 0 ||
            !Number.isInteger(quantidade)
        )
    ) {

        alert(
            "Digite uma quantidade válida."
        );

        return;

    }


    /* PREÇOS POR TAMANHO */

    if (
        preco_pequeno !== null &&
        (
            isNaN(preco_pequeno) ||
            preco_pequeno < 0
        )
    ) {

        alert(
            "Digite um preço pequeno válido."
        );

        return;

    }


    if (
        preco_medio !== null &&
        (
            isNaN(preco_medio) ||
            preco_medio < 0
        )
    ) {

        alert(
            "Digite um preço médio válido."
        );

        return;

    }


    if (
        preco_grande !== null &&
        (
            isNaN(preco_grande) ||
            preco_grande < 0
        )
    ) {

        alert(
            "Digite um preço grande válido."
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


    /* =====================================
       VALIDAR SE EXISTE ALGUM PREÇO
    ===================================== */

    if (

        preco === null &&

        preco_pequeno === null &&

        preco_medio === null &&

        preco_grande === null

    ) {

        alert(
            "Digite um preço normal ou pelo menos um preço por tamanho."
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

            imagem: urlImagem,

            quantidade: quantidade,

            preco_pequeno: preco_pequeno,

            preco_medio: preco_medio,

            preco_grande: preco_grande

        };


        console.log(
            "Dados enviados:",
            dados
        );


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
