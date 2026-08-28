/* =========================================
   CONFIGURAÇÃO SUPABASE
========================================= */

const SUPABASE_URL = "https://fmwmgoxjmcvsmfbcpfsj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ZJR2Z6gOfNO5rFhZb-RWwg_qvyY2b9Y";


/* =========================================
   ELEMENTOS
========================================= */

const listaPratosAdmin =
    document.getElementById("listaPratosAdmin");

const novoPrato =
    document.getElementById("novoPrato");

const areaFormulario =
    document.getElementById("areaFormulario");

const tituloFormulario =
    document.getElementById("tituloFormulario");

const pratoId =
    document.getElementById("pratoId");

const nome =
    document.getElementById("nome");

const descricao =
    document.getElementById("descricao");

const preco =
    document.getElementById("preco");

const categoria =
    document.getElementById("categoria");

const imagem =
    document.getElementById("imagem");

const salvarPrato =
    document.getElementById("salvarPrato");

const cancelarEdicao =
    document.getElementById("cancelarEdicao");


/* =========================================
   CARREGAR PRATOS
========================================= */

async function carregarPratos() {

    listaPratosAdmin.innerHTML =
        "<p>Carregando pratos...</p>";

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

            throw new Error(erro);

        }


        const pratos =
            await resposta.json();


        mostrarPratos(pratos);

    }

    catch (erro) {

        console.error(
            "Erro ao carregar pratos:",
            erro
        );

        listaPratosAdmin.innerHTML = `
            <p>
                Erro ao carregar os pratos.
            </p>
        `;

    }

}


/* =========================================
   MOSTRAR PRATOS
========================================= */

function mostrarPratos(pratos) {

    listaPratosAdmin.innerHTML = "";


    if (pratos.length === 0) {

        listaPratosAdmin.innerHTML = `
            <p>
                Nenhum prato cadastrado.
            </p>
        `;

        return;

    }


    pratos.forEach(prato => {

        const card =
            document.createElement("div");

        card.classList.add("admin-card");


        const valor =
            Number(prato.preco || 0);


        card.innerHTML = `

            <div class="admin-imagem">

                <img
                    src="${prato.imagem || ""}"
                    alt="${prato.nome || "Prato"}"
                >

            </div>


            <div class="admin-info">

                <h3>
                    ${prato.nome || "Sem nome"}
                </h3>

                <p>
                    ${prato.descricao || ""}
                </p>

                <span class="admin-categoria">
                    ${prato.categoria || "Sem categoria"}
                </span>

                <strong>
                    R$ ${valor
                        .toFixed(2)
                        .replace(".", ",")}
                </strong>

            </div>


            <div class="admin-acoes">

                <button
                    class="editar"
                    data-id="${prato.id}"
                >
                    Editar
                </button>

                <button
                    class="excluir"
                    data-id="${prato.id}"
                >
                    Excluir
                </button>

            </div>

        `;


        /* =====================================
           BOTÃO EDITAR
        ===================================== */

        card
            .querySelector(".editar")
            .addEventListener("click", () => {

                abrirEdicao(prato);

            });


        /* =====================================
           BOTÃO EXCLUIR
        ===================================== */

        card
            .querySelector(".excluir")
            .addEventListener("click", () => {

                excluirPrato(prato.id);

            });


        listaPratosAdmin.appendChild(card);

    });

}


/* =========================================
   ABRIR FORMULÁRIO NOVO
========================================= */

novoPrato.addEventListener("click", () => {

    limparFormulario();

    tituloFormulario.textContent =
        "Novo prato";

    areaFormulario.classList.remove(
        "escondido"
    );

});


/* =========================================
   ABRIR EDIÇÃO
========================================= */

function abrirEdicao(prato) {

    tituloFormulario.textContent =
        "Editar prato";


    pratoId.value =
        prato.id;

    nome.value =
        prato.nome || "";

    descricao.value =
        prato.descricao || "";

    preco.value =
        prato.preco || "";

    categoria.value =
        prato.categoria || "";

    imagem.value =
        prato.imagem || "";


    areaFormulario.classList.remove(
        "escondido"
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================
   SALVAR PRATO
========================================= */

salvarPrato.addEventListener(
    "click",
    async () => {

        const dados = {

            nome:
                nome.value.trim(),

            descricao:
                descricao.value.trim(),

            preco:
                Number(preco.value),

            categoria:
                categoria.value,

            imagem:
                imagem.value.trim()

        };


        /* VALIDAÇÃO */

        if (!dados.nome) {

            alert(
                "Digite o nome do prato."
            );

            return;

        }


        if (
            !preco.value ||
            dados.preco < 0
        ) {

            alert(
                "Digite um preço válido."
            );

            return;

        }


        try {

            salvarPrato.disabled = true;

            salvarPrato.textContent =
                "Salvando...";


            /* =================================
               EDITAR
            ================================= */

            if (pratoId.value) {

                const resposta =
                    await fetch(

                        `${SUPABASE_URL}/rest/v1/prato?id=eq.${pratoId.value}`,

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
                                JSON.stringify(
                                    dados
                                )

                        }

                    );


                if (!resposta.ok) {

                    throw new Error(
                        await resposta.text()
                    );

                }


                alert(
                    "Prato atualizado com sucesso!"
                );

            }


            /* =================================
               NOVO PRATO
            ================================= */

            else {

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

                    throw new Error(
                        await resposta.text()
                    );

                }


                alert(
                    "Prato adicionado com sucesso!"
                );

            }


            limparFormulario();


            areaFormulario.classList.add(
                "escondido"
            );


            carregarPratos();

        }

        catch (erro) {

            console.error(
                "Erro ao salvar:",
                erro
            );

            alert(
                "Erro ao salvar o prato. Veja o console."
            );

        }

        finally {

            salvarPrato.disabled = false;

            salvarPrato.textContent =
                "Salvar prato";

        }

    }
);


/* =========================================
   EXCLUIR PRATO
========================================= */

async function excluirPrato(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este prato?"
        );


    if (!confirmar) {

        return;

    }


    try {

        const resposta =
            await fetch(

                `${SUPABASE_URL}/rest/v1/prato?id=eq.${id}`,

                {

                    method: "DELETE",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`

                    }

                }

            );


        if (!resposta.ok) {

            throw new Error(
                await resposta.text()
            );

        }


        alert(
            "Prato excluído com sucesso!"
        );


        carregarPratos();

    }

    catch (erro) {

        console.error(
            "Erro ao excluir:",
            erro
        );

        alert(
            "Erro ao excluir o prato."
        );

    }

}


/* =========================================
   CANCELAR
========================================= */

cancelarEdicao.addEventListener(
    "click",
    () => {

        limparFormulario();

        areaFormulario.classList.add(
            "escondido"
        );

    }
);


/* =========================================
   LIMPAR FORMULÁRIO
========================================= */

function limparFormulario() {

    pratoId.value = "";

    nome.value = "";

    descricao.value = "";

    preco.value = "";

    categoria.value = "";

    imagem.value = "";

}


/* =========================================
   INICIAR
========================================= */

carregarPratos();
