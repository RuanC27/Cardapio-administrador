const SUPABASE_URL =
    "https://fmwmgoxjmcvsmfbcpfsj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ZJR2Z6gOfNO5rFhZb-RWwg_qvyY2b9Y";


const form =
    document.getElementById("formPrato");

const listaPratos =
    document.getElementById("listaPratos");

const botaoAdicionar =
    document.getElementById("botaoAdicionar");


/* =========================================
   HEADERS
========================================= */

function headers() {

    return {

        "apikey": SUPABASE_KEY,

        "Authorization":
            `Bearer ${SUPABASE_KEY}`,

        "Content-Type":
            "application/json"

    };

}


/* =========================================
   CARREGAR PRATOS
========================================= */

async function carregarPratos() {

    listaPratos.innerHTML =
        `<p class="carregando">
            Carregando pratos...
        </p>`;


    try {

        const resposta =
            await fetch(

                `${SUPABASE_URL}/rest/v1/prato?select=*&order=id.asc`,

                {

                    method: "GET",

                    headers: headers()

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
            "Erro:",
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


    if (pratos.length === 0) {

        listaPratos.innerHTML =
            `<p>
                Nenhum prato cadastrado.
            </p>`;

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

            </div>

        `;


        listaPratos.appendChild(card);

    });

}


/* =========================================
   ADICIONAR PRATO
========================================= */

form.addEventListener(
    "submit",
    async (evento) => {

        evento.preventDefault();


        const dados = {

            nome:
                document
                    .getElementById("nome")
                    .value
                    .trim(),

            descricao:
                document
                    .getElementById("descricao")
                    .value
                    .trim(),

            preco:
                Number(
                    document
                        .getElementById("preco")
                        .value
                ),

            categoria:
                document
                    .getElementById("categoria")
                    .value,

            imagem:
                document
                    .getElementById("imagem")
                    .value
                    .trim()

        };


        /* =====================================
           VALIDAÇÃO
        ===================================== */

        if (!dados.nome) {

            alert(
                "Digite o nome do prato."
            );

            return;

        }


        if (
            isNaN(dados.preco) ||
            dados.preco < 0
        ) {

            alert(
                "Digite um preço válido."
            );

            return;

        }


        if (!dados.categoria) {

            alert(
                "Escolha uma categoria."
            );

            return;

        }


        try {

            botaoAdicionar.disabled =
                true;

            botaoAdicionar.textContent =
                "Adicionando...";


            const resposta =
                await fetch(

                    `${SUPABASE_URL}/rest/v1/prato`,

                    {

                        method: "POST",

                        headers: {

                            ...headers(),

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

                throw new Error(erro);

            }


            alert(
                "Prato adicionado com sucesso!"
            );


            form.reset();


            carregarPratos();

        }

        catch (erro) {

            console.error(
                "Erro ao adicionar:",
                erro
            );

            alert(
                "Erro ao adicionar o prato:\n\n" +
                erro.message
            );

        }

        finally {

            botaoAdicionar.disabled =
                false;

            botaoAdicionar.textContent =
                "+ Adicionar prato";

        }

    }
);


/* =========================================
   INICIAR
========================================= */

carregarPratos();
