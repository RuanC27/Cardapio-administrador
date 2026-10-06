const SUPABASE_URL =
    "https://fmwmgoxjmcvsmfbcpfsj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ZJR2Z6gOfNO5rFhZb-RWwg_qvyY2b9Y";

const BUCKET = "imagens";


/* =========================================
   ELEMENTOS - PRATOS
========================================= */

const form = document.getElementById("formPrato");

const listaPratos =
    document.getElementById("listaPratos");

const botaoAdicionar =
    document.getElementById("botaoAdicionar");

const inputImagem =
    document.getElementById("imagem");


/* =========================================
   ESTADO DE EDIÇÃO
========================================= */

let pratoEmEdicao = null;


/* =========================================
   ELEMENTOS - ALERGIAS
========================================= */

const formAlergia =
    document.getElementById("formAlergia");

const listaAlergias =
    document.getElementById("listaAlergias");

const botaoAdicionarAlergia =
    document.getElementById("botaoAdicionarAlergia");

const inputImagemAlergia =
    document.getElementById("imagemAlergia");

const previewAlergiaContainer =
    document.getElementById("previewAlergiaContainer");

const previewImagemAlergia =
    document.getElementById("previewImagemAlergia");


/* =========================================
   ELEMENTOS - ALERGIAS DO PRATO
========================================= */

const listaAlergiasPrato =
    document.getElementById("listaAlergiasPrato");


/* =========================================
   CARREGAR PRATOS + ALERGIAS
========================================= */

async function carregarPratos() {

    listaPratos.innerHTML =
        `<p class="carregando">
            Carregando pratos...
        </p>`;

    try {

        /* =====================================
           BUSCAR PRATOS
        ===================================== */

        const respostaPratos = await fetch(

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


        if (!respostaPratos.ok) {

            const erro =
                await respostaPratos.text();

            throw new Error(
                `Erro ao carregar pratos (${respostaPratos.status}): ${erro}`
            );

        }


        const pratos =
            await respostaPratos.json();


        console.log(
            "Pratos encontrados:",
            pratos
        );


        /* =====================================
           BUSCAR RELAÇÕES PRATO ↔ ALERGIA
        ===================================== */

        const respostaRelacoes = await fetch(

            `${SUPABASE_URL}/rest/v1/prato_alergia?select=*`,

            {
                method: "GET",

                headers: {
                    "apikey": SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`
                }
            }

        );


        if (!respostaRelacoes.ok) {

            const erro =
                await respostaRelacoes.text();

            throw new Error(
                `Erro ao carregar relações de alergias (${respostaRelacoes.status}): ${erro}`
            );

        }


        const relacoes =
            await respostaRelacoes.json();


        console.log(
            "Relações prato_alergia:",
            relacoes
        );


        /* =====================================
           BUSCAR ALERGIAS
        ===================================== */

        const respostaAlergias = await fetch(

            `${SUPABASE_URL}/rest/v1/alergia?select=*&order=id.asc`,

            {
                method: "GET",

                headers: {
                    "apikey": SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`
                }
            }

        );


        if (!respostaAlergias.ok) {

            const erro =
                await respostaAlergias.text();

            throw new Error(
                `Erro ao carregar alergias (${respostaAlergias.status}): ${erro}`
            );

        }


        const alergias =
            await respostaAlergias.json();


        console.log(
            "Alergias encontradas:",
            alergias
        );


        /* =====================================
           JUNTAR AS INFORMAÇÕES
        ===================================== */

        const pratosComAlergias =
            pratos.map(prato => {

                const relacoesDoPrato =
                    relacoes.filter(
                        relacao =>
                            Number(relacao.prato_id) ===
                            Number(prato.id)
                    );


                const alergiasDoPrato =
                    relacoesDoPrato
                        .map(relacao =>
                            alergias.find(
                                alergia =>
                                    Number(alergia.id) ===
                                    Number(relacao.alergia_id)
                            )
                        )
                        .filter(Boolean);


                return {
                    ...prato,
                    alergias: alergiasDoPrato
                };

            });


        console.log(
            "Pratos com suas alergias:",
            pratosComAlergias
        );


        mostrarPratos(pratosComAlergias);

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


                ${
                    preco !== null
                        ? `

                        <span class="prato-preco">

                            R$ ${preco
                                .toFixed(2)
                                .replace(".", ",")}

                        </span>

                        `
                        : ""
                }


                ${
                    prato.quantidade !== null &&
                    prato.quantidade !== undefined
                        ? `

                        <p class="prato-quantidade">

                            Quantidade disponível:
                            ${prato.quantidade}

                        </p>

                        `
                        : ""
                }


                ${
                    prato.alergias &&
                    prato.alergias.length
                        ? `

                            <div class="prato-alergias">

                                <strong>
                                    ⚠️ Alergias:
                                </strong>

                                <div class="prato-alergias-lista">

                                    ${prato.alergias.map(alergia => `

                                        <div class="prato-alergia">

                                            <img
                                                src="${
                                                    alergia.imagem ||
                                                    "https://via.placeholder.com/60?text=Alergia"
                                                }"
                                                alt="${
                                                    alergia.nome ||
                                                    "Alergia"
                                                }"
                                                class="prato-alergia-imagem"
                                            >

                                            <span>
                                                ${
                                                    alergia.nome ||
                                                    "Sem nome"
                                                }
                                            </span>

                                        </div>

                                    `).join("")}

                                </div>

                            </div>
                        `
                        : `
                            <div class="prato-alergias sem-alergias">

                                <strong>
                                    ⚠️ Alergias:
                                </strong>

                                <span>
                                    Nenhuma alergia cadastrada
                                </span>

                            </div>
                        `
                }


                <!-- BOTÃO EDITAR -->

                <button
                    class="botao-editar"
                    type="button"
                >
                    ✏️ Editar prato
                </button>


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
           EVENTO DO BOTÃO EDITAR
        ===================================== */

        const botaoEditar =
            card.querySelector(".botao-editar");


        botaoEditar.addEventListener(
            "click",

            function () {

                editarPrato(prato);

            }

        );


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
   EDITAR PRATO
========================================= */

function editarPrato(prato) {

    pratoEmEdicao = prato;

    console.log(
        "Editando prato:",
        prato
    );


    document.getElementById("nome").value =
        prato.nome || "";


    document.getElementById("descricao").value =
        prato.descricao || "";


    document.getElementById("categoria").value =
        prato.categoria || "";


    document.getElementById("preco").value =
        prato.preco !== null &&
        prato.preco !== undefined
            ? prato.preco
            : "";


    document.getElementById("quantidade").value =
        prato.quantidade !== null &&
        prato.quantidade !== undefined
            ? prato.quantidade
            : "";


    document.getElementById("preco_pequeno").value =
        prato.preco_pequeno !== null &&
        prato.preco_pequeno !== undefined
            ? prato.preco_pequeno
            : "";


    document.getElementById("preco_medio").value =
        prato.preco_medio !== null &&
        prato.preco_medio !== undefined
            ? prato.preco_medio
            : "";


    document.getElementById("preco_grande").value =
        prato.preco_grande !== null &&
        prato.preco_grande !== undefined
            ? prato.preco_grande
            : "";


    const previewContainer =
        document.getElementById(
            "previewContainer"
        );


    const previewImagem =
        document.getElementById(
            "previewImagem"
        );


    if (prato.imagem) {

        previewImagem.src =
            prato.imagem;

        previewContainer.style.display =
            "block";

    }


    /*
     * Selecionar os alergênicos
     * que já pertencem ao prato.
     */

    document
        .querySelectorAll(
            'input[name="alergiasPrato"]'
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    Array.isArray(
                        prato.alergias
                    ) &&
                    prato.alergias.some(
                        alergia =>
                            Number(alergia.id) ===
                            Number(checkbox.value)
                    );

            }
        );


    botaoAdicionar.textContent =
        "💾 Salvar alterações";


    let botaoCancelar =
        document.getElementById(
            "botaoCancelarEdicao"
        );


    if (!botaoCancelar) {

        botaoCancelar =
            document.createElement(
                "button"
            );


        botaoCancelar.id =
            "botaoCancelarEdicao";


        botaoCancelar.type =
            "button";


        botaoCancelar.textContent =
            "✖ Cancelar edição";


        botaoAdicionar.insertAdjacentElement(
            "afterend",
            botaoCancelar
        );


        botaoCancelar.addEventListener(
            "click",
            cancelarEdicao
        );

    }


    form.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


function cancelarEdicao() {

    pratoEmEdicao = null;


    form.reset();


    botaoAdicionar.textContent =
        "+ Adicionar prato";


    const botaoCancelar =
        document.getElementById(
            "botaoCancelarEdicao"
        );


    if (botaoCancelar) {

        botaoCancelar.remove();

    }


    const previewContainer =
        document.getElementById(
            "previewContainer"
        );


    const previewImagem =
        document.getElementById(
            "previewImagem"
        );


    if (previewContainer) {

        previewContainer.style.display =
            "none";

    }


    if (previewImagem) {

        previewImagem.src =
            "";

    }


    document
        .querySelectorAll(
            'input[name="alergiasPrato"]'
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    false;

            }
        );

}


/* =========================================
   ATUALIZAR PRATO NO SUPABASE
========================================= */

async function atualizarPrato(
    id,
    dados
) {

    const resposta =
        await fetch(

            `${SUPABASE_URL}/rest/v1/prato?id=eq.${id}`,

            {
                method: "PATCH",

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
            `Erro ao atualizar (${resposta.status}): ${erro}`
        );

    }


    return await resposta.json();

}


/* =========================================
   ATUALIZAR ALERGÊNICOS DO PRATO
========================================= */

async function atualizarAlergiasDoPrato(
    pratoId
) {

    const checkboxes =
        document.querySelectorAll(
            'input[name="alergiasPrato"]:checked'
        );


    const alergiasSelecionadas =
        Array.from(checkboxes)
            .map(
                checkbox =>
                    Number(
                        checkbox.value
                    )
            );


    console.log(
        "Novos alergênicos:",
        alergiasSelecionadas
    );


    /*
     * Primeiro remove as relações
     * antigas.
     */

    const respostaDelete =
        await fetch(

            `${SUPABASE_URL}/rest/v1/prato_alergia?prato_id=eq.${pratoId}`,

            {
                method: "DELETE",

                headers: {

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`,

                    "Prefer":
                        "return=minimal"

                }

            }

        );


    if (!respostaDelete.ok) {

        const erro =
            await respostaDelete.text();


        throw new Error(
            `Erro ao atualizar os alergênicos (${respostaDelete.status}): ${erro}`
        );

    }


    /*
     * Se nenhum alergênico foi selecionado,
     * não precisamos inserir nada.
     */

    if (!alergiasSelecionadas.length) {

        return;

    }


    const relacoes =
        alergiasSelecionadas.map(
            alergiaId => ({

                prato_id:
                    Number(pratoId),

                alergia_id:
                    Number(alergiaId)

            })
        );


    const respostaInsert =
        await fetch(

            `${SUPABASE_URL}/rest/v1/prato_alergia`,

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
                        "return=minimal"

                },

                body:
                    JSON.stringify(
                        relacoes
                    )

            }

        );


    if (!respostaInsert.ok) {

        const erro =
            await respostaInsert.text();


        throw new Error(
            `Erro ao salvar os novos alergênicos (${respostaInsert.status}): ${erro}`
        );

    }

}


/* =========================================
   EXCLUIR PRATO
========================================= */

async function excluirPrato(
    id,
    nome
) {

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
   ENVIAR IMAGEM DO PRATO
========================================= */

async function enviarImagem(
    arquivo
) {

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


    const resposta =
        await fetch(

            `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${caminho}`,

            {

                method: "POST",

                headers: {

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`,

                    "Content-Type":
                        arquivo.type

                },

                body:
                    arquivo

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
   CARREGAR ALERGIAS PARA O PRATO
========================================= */

async function carregarAlergiasParaPrato() {

    if (!listaAlergiasPrato) {

        console.warn(
            "Elemento listaAlergiasPrato não encontrado."
        );

        return;

    }


    listaAlergiasPrato.innerHTML =
        `<p class="carregando">
            Carregando alergias...
        </p>`;


    try {

        const resposta =
            await fetch(

                `${SUPABASE_URL}/rest/v1/alergia?select=*&order=id.asc`,

                {

                    method: "GET",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

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


        const alergias =
            await resposta.json();


        console.log(
            "Alergias disponíveis para o prato:",
            alergias
        );


        mostrarAlergiasParaPrato(
            alergias
        );

    }

    catch (erro) {

        console.error(
            "Erro ao carregar alergias para o prato:",
            erro
        );


        listaAlergiasPrato.innerHTML =
            `<p>
                Erro ao carregar as alergias.
            </p>`;

    }

}


/* =========================================
   MOSTRAR ALERGIAS PARA O PRATO
========================================= */

function mostrarAlergiasParaPrato(
    alergias
) {

    listaAlergiasPrato.innerHTML =
        "";


    if (!alergias.length) {

        listaAlergiasPrato.innerHTML =
            `<p>
                Nenhuma alergia cadastrada.
            </p>`;

        return;

    }


    alergias.forEach(
        alergia => {

            const opcao =
                document.createElement(
                    "label"
                );


            opcao.className =
                "alergia-opcao";


            const imagem =
                alergia.imagem ||
                "https://via.placeholder.com/100?text=Sem+imagem";


            opcao.innerHTML = `

                <input
                    type="checkbox"
                    name="alergiasPrato"
                    value="${alergia.id}"
                >

                <img
                    class="alergia-opcao-imagem"
                    src="${imagem}"
                    alt="${alergia.nome || "Alergia"}"
                >

                <span class="alergia-opcao-nome">
                    ${alergia.nome || "Sem nome"}
                </span>

            `;


            listaAlergiasPrato.appendChild(
                opcao
            );

        }
    );

}


/* =========================================
   SALVAR ALERGIAS DO PRATO
========================================= */

async function salvarAlergiasDoPrato(
    pratoId
) {

    const checkboxes =
        document.querySelectorAll(
            'input[name="alergiasPrato"]:checked'
        );


    const alergiasSelecionadas =
        Array.from(checkboxes)
            .map(
                checkbox =>
                    Number(
                        checkbox.value
                    )
            );


    console.log(
        "Alergias selecionadas:",
        alergiasSelecionadas
    );


    if (!alergiasSelecionadas.length) {

        console.log(
            "Nenhuma alergia selecionada para este prato."
        );

        return;

    }


    const relacoes =
        alergiasSelecionadas.map(
            alergiaId => ({

                prato_id:
                    Number(pratoId),

                alergia_id:
                    Number(alergiaId)

            })
        );


    console.log(
        "Relações prato_alergia:",
        relacoes
    );


    const resposta =
        await fetch(

            `${SUPABASE_URL}/rest/v1/prato_alergia`,

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
                        "return=minimal"

                },

                body:
                    JSON.stringify(
                        relacoes
                    )

            }

        );


    if (!resposta.ok) {

        const erro =
            await resposta.text();


        throw new Error(
            `Erro ao salvar as alergias do prato (${resposta.status}): ${erro}`
        );

    }


    console.log(
        "Alergias do prato salvas com sucesso!"
    );

}


/* =========================================
   ADICIONAR / EDITAR PRATO
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


        /*
         * Ao adicionar um prato, a imagem continua
         * sendo obrigatória.
         *
         * Ao editar, podemos manter a imagem atual.
         */

        if (!arquivo && !pratoEmEdicao) {

            alert(
                "Escolha uma imagem."
            );

            return;

        }


        if (
            arquivo &&
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

            botaoAdicionar.disabled =
                true;


            /* =====================================
               IMAGEM
            ===================================== */

            let urlImagem =
                pratoEmEdicao
                    ? pratoEmEdicao.imagem || null
                    : null;


            /*
             * Só faz upload se o usuário
             * escolher uma nova imagem.
             */

            if (arquivo) {

                botaoAdicionar.textContent =
                    "Enviando imagem...";


                urlImagem =
                    await enviarImagem(
                        arquivo
                    );


                console.log(
                    "URL da imagem:",
                    urlImagem
                );

            }


            /* =====================================
               DADOS DO PRATO
            ===================================== */

            const dados = {

                nome:
                    nome,

                descricao:
                    descricao,

                preco:
                    preco,

                categoria:
                    categoria,

                imagem:
                    urlImagem,

                quantidade:
                    quantidade,

                preco_pequeno:
                    preco_pequeno,

                preco_medio:
                    preco_medio,

                preco_grande:
                    preco_grande

            };


            console.log(
                "Dados enviados:",
                dados
            );


            /* =====================================
               EDITAR PRATO EXISTENTE
            ===================================== */

            if (pratoEmEdicao) {

                botaoAdicionar.textContent =
                    "Salvando alterações...";


                await atualizarPrato(
                    pratoEmEdicao.id,
                    dados
                );


                /* =====================================
                   ATUALIZAR ALERGÊNICOS
                ===================================== */

                botaoAdicionar.textContent =
                    "Salvando alergênicos...";


                await atualizarAlergiasDoPrato(
                    pratoEmEdicao.id
                );


                alert(
                    "Prato atualizado com sucesso!"
                );


                cancelarEdicao();


                await carregarPratos();


                return;

            }


            /* =====================================
               ADICIONAR NOVO PRATO
            ===================================== */

            if (!urlImagem) {

                throw new Error(
                    "A imagem do prato não foi enviada."
                );

            }


            botaoAdicionar.textContent =
                "Salvando prato...";


            const resposta =
                await fetch(

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
                            JSON.stringify(
                                dados
                            )

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


            /* =====================================
               PEGAR ID DO PRATO CRIADO
            ===================================== */

            const pratoCriado =
                Array.isArray(pratoSalvo)
                    ? pratoSalvo[0]
                    : pratoSalvo;


            if (
                !pratoCriado ||
                !pratoCriado.id
            ) {

                throw new Error(
                    "O prato foi salvo, mas o ID não foi retornado pelo Supabase."
                );

            }


            const pratoId =
                pratoCriado.id;


            console.log(
                "ID do novo prato:",
                pratoId
            );


            /* =====================================
               SALVAR ALERGÊNICOS DO PRATO
            ===================================== */

            botaoAdicionar.textContent =
                "Salvando alergênicos...";


            await salvarAlergiasDoPrato(
                pratoId
            );


            alert(
                "Prato adicionado com sucesso!"
            );


            /* =====================================
               LIMPAR FORMULÁRIO
            ===================================== */

            form.reset();


            /* =====================================
               ATUALIZAR LISTA
            ===================================== */

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

            botaoAdicionar.disabled =
                false;


            if (pratoEmEdicao) {

                botaoAdicionar.textContent =
                    "💾 Salvar alterações";

            }

            else {

                botaoAdicionar.textContent =
                    "+ Adicionar prato";

            }

        }

    }

);


/* =========================================
   PRÉVIA DA IMAGEM DO PRATO
========================================= */

inputImagem.addEventListener(
    "change",

    function () {

        const arquivo =
            inputImagem.files[0];


        if (!arquivo) {

            return;

        }


        if (
            !arquivo.type.startsWith("image/")
        ) {

            return;

        }


        const leitor =
            new FileReader();


        leitor.onload =
            function (evento) {

                const previewContainer =
                    document.getElementById(
                        "previewContainer"
                    );


                const previewImagem =
                    document.getElementById(
                        "previewImagem"
                    );


                previewImagem.src =
                    evento.target.result;


                previewContainer.style.display =
                    "block";

            };


        leitor.readAsDataURL(
            arquivo
        );

    }

);


/* =========================================
   =========================================
   GERENCIAMENTO DE ALERGIAS
   =========================================
   ========================================= */


/* =========================================
   CARREGAR ALERGIAS
========================================= */

async function carregarAlergias() {

    listaAlergias.innerHTML =
        `<p class="carregando">
            Carregando alergias...
        </p>`;

    try {

        const resposta =
            await fetch(

                `${SUPABASE_URL}/rest/v1/alergia?select=*&order=id.asc`,

                {

                    method: "GET",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

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


        const alergias =
            await resposta.json();


        console.log(
            "Alergias encontradas:",
            alergias
        );


        mostrarAlergias(
            alergias
        );


        /*
         * Atualiza também a seleção de alergias
         * disponível no formulário de pratos.
         */

        mostrarAlergiasParaPrato(
            alergias
        );

    }

    catch (erro) {

        console.error(
            "Erro ao carregar alergias:",
            erro
        );


        listaAlergias.innerHTML =
            `<p>
                Erro ao carregar as alergias.
            </p>`;


        if (listaAlergiasPrato) {

            listaAlergiasPrato.innerHTML =
                `<p>
                    Erro ao carregar as alergias.
                </p>`;

        }

    }

}


/* =========================================
   MOSTRAR ALERGIAS
========================================= */

function mostrarAlergias(
    alergias
) {

    listaAlergias.innerHTML =
        "";


    if (!alergias.length) {

        listaAlergias.innerHTML =
            `<p>
                Nenhuma alergia cadastrada.
            </p>`;

        return;

    }


    alergias.forEach(
        alergia => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "alergia";


            const imagem =
                alergia.imagem ||
                "https://via.placeholder.com/100?text=Sem+imagem";


            card.innerHTML = `

                <img
                    class="alergia-imagem"
                    src="${imagem}"
                    alt="${alergia.nome || "Alergia"}"
                >


                <span class="alergia-nome">

                    ${alergia.nome || "Sem nome"}

                </span>


                <button
                    class="botao-excluir-alergia"
                    type="button"
                >
                    🗑️ Excluir
                </button>

            `;


            const botaoExcluir =
                card.querySelector(
                    ".botao-excluir-alergia"
                );


            botaoExcluir.addEventListener(
                "click",

                function () {

                    excluirAlergia(
                        alergia.id,
                        alergia.nome
                    );

                }

            );


            listaAlergias.appendChild(
                card
            );

        }

    );

}


/* =========================================
   ENVIAR IMAGEM DA ALERGIA
========================================= */

async function enviarImagemAlergia(
    arquivo
) {

    console.log(
        "Enviando imagem da alergia:",
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
        `alergias/${nomeArquivo}`;


    console.log(
        "Caminho da imagem da alergia:",
        caminho
    );


    const resposta =
        await fetch(

            `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${caminho}`,

            {

                method: "POST",

                headers: {

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`,

                    "Content-Type":
                        arquivo.type

                },

                body:
                    arquivo

            }

        );


    if (!resposta.ok) {

        const erro =
            await resposta.text();


        throw new Error(
            `Erro no upload da alergia (${resposta.status}): ${erro}`
        );

    }


    console.log(
        "Imagem da alergia enviada com sucesso!"
    );


    return (

        `${SUPABASE_URL}` +
        `/storage/v1/object/public/` +
        `${BUCKET}/${caminho}`

    );

}


/* =========================================
   PRÉVIA DA IMAGEM DA ALERGIA
========================================= */

inputImagemAlergia.addEventListener(
    "change",

    function () {

        const arquivo =
            inputImagemAlergia.files[0];


        if (!arquivo) {

            previewAlergiaContainer.style.display =
                "none";


            previewImagemAlergia.src =
                "";


            return;

        }


        if (
            !arquivo.type.startsWith("image/")
        ) {

            alert(
                "O arquivo selecionado não é uma imagem."
            );


            inputImagemAlergia.value =
                "";


            previewAlergiaContainer.style.display =
                "none";


            previewImagemAlergia.src =
                "";


            return;

        }


        const leitor =
            new FileReader();


        leitor.onload =
            function (evento) {

                previewImagemAlergia.src =
                    evento.target.result;


                previewAlergiaContainer.style.display =
                    "flex";

            };


        leitor.readAsDataURL(
            arquivo
        );

    }

);


/* =========================================
   ADICIONAR ALERGIA
========================================= */

formAlergia.addEventListener(
    "submit",

    async function (evento) {

        evento.preventDefault();


        const nome =
            document
                .getElementById("nomeAlergia")
                .value
                .trim();


        const arquivo =
            inputImagemAlergia.files[0];


        /* =====================================
           VALIDAÇÕES
        ===================================== */

        if (!nome) {

            alert(
                "Digite o nome da alergia."
            );

            return;

        }


        if (!arquivo) {

            alert(
                "Escolha uma imagem para a alergia."
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

            botaoAdicionarAlergia.disabled =
                true;


            botaoAdicionarAlergia.textContent =
                "Enviando imagem...";


            /* =====================================
               UPLOAD
            ===================================== */

            const urlImagem =
                await enviarImagemAlergia(
                    arquivo
                );


            console.log(
                "URL da imagem da alergia:",
                urlImagem
            );


            /* =====================================
               SALVAR NA TABELA ALERGIA
            ===================================== */

            botaoAdicionarAlergia.textContent =
                "Salvando alergia...";


            const dados = {

                nome:
                    nome,

                imagem:
                    urlImagem

            };


            const resposta =
                await fetch(

                    `${SUPABASE_URL}/rest/v1/alergia`,

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
                            JSON.stringify(
                                dados
                            )

                    }

                );


            if (!resposta.ok) {

                const erro =
                    await resposta.text();


                throw new Error(
                    `Erro ao salvar alergia (${resposta.status}): ${erro}`
                );

            }


            const alergiaSalva =
                await resposta.json();


            console.log(
                "Alergia salva:",
                alergiaSalva
            );


            alert(
                "Alergia adicionada com sucesso!"
            );


            /* =====================================
               LIMPAR FORMULÁRIO
            ===================================== */

            formAlergia.reset();


            previewAlergiaContainer.style.display =
                "none";


            previewImagemAlergia.src =
                "";


            /* =====================================
               ATUALIZAR LISTAS
            ===================================== */

            await carregarAlergias();

        }

        catch (erro) {

            console.error(
                "ERRO AO ADICIONAR ALERGIA:",
                erro
            );


            alert(

                "Não foi possível adicionar a alergia.\n\n" +
                erro.message

            );

        }

        finally {

            botaoAdicionarAlergia.disabled =
                false;


            botaoAdicionarAlergia.textContent =
                "+ Adicionar alergia";

        }

    }

);


/* =========================================
   EXCLUIR ALERGIA
========================================= */

async function excluirAlergia(
    id,
    nome
) {

    const confirmar =
        confirm(
            `Tem certeza que deseja excluir "${nome}"?`
        );


    if (!confirmar) {

        return;

    }


    try {

        console.log(
            "Excluindo alergia:",
            id
        );


        const resposta =
            await fetch(

                `${SUPABASE_URL}/rest/v1/alergia?id=eq.${id}`,

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
                `Erro ao excluir alergia (${resposta.status}): ${erro}`
            );

        }


        console.log(
            "Alergia excluída com sucesso!"
        );


        alert(
            `"${nome}" foi excluída com sucesso!`
        );


        await carregarAlergias();

    }

    catch (erro) {

        console.error(
            "Erro ao excluir alergia:",
            erro
        );


        alert(

            "Não foi possível excluir a alergia.\n\n" +
            erro.message

        );

    }

}


/* =========================================
   INICIAR
========================================= */

carregarPratos();

carregarAlergias();
