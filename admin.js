const SUPABASE_URL =
"https://fmwmgoxjmcvsmfbcpfsj.supabase.co";

const SUPABASE_KEY =
"sb_publishable_ZJR2Z6gOfNO5rFhZb-RWwg_qvyY2b9Y";

const BUCKET =
"imagens";

const form =
document.getElementById("formPrato");

const listaPratos =
document.getElementById("listaPratos");

const botaoAdicionar =
document.getElementById("botaoAdicionar");

const inputImagem =
document.getElementById("imagem");

const previewContainer =
document.getElementById("previewContainer");

const previewImagem =
document.getElementById("previewImagem");

/* =========================================
PRÉVIA DA IMAGEM
========================================= */

inputImagem.addEventListener(
"change",
() => {

```
    const arquivo =
        inputImagem.files[0];


    if (!arquivo) {

        previewContainer.style.display =
            "none";

        return;

    }


    const leitor =
        new FileReader();


    leitor.onload =
        function (evento) {

            previewImagem.src =
                evento.target.result;

            previewContainer.style.display =
                "block";

        };


    leitor.readAsDataURL(
        arquivo
    );

}
```

);

/* =========================================
HEADERS PARA API
========================================= */

function headersJSON() {

```
return {

    "apikey":
        SUPABASE_KEY,

    "Authorization":
        `Bearer ${SUPABASE_KEY}`,

    "Content-Type":
        "application/json"

};
```

}

/* =========================================
UPLOAD DA IMAGEM
========================================= */

async function enviarImagem(
arquivo
) {

```
/* Nome único para evitar imagens
   com o mesmo nome */

const nomeArquivo =
    `${Date.now()}-${arquivo.name}`
        .replace(
            /[^a-zA-Z0-9.\-_]/g,
            "-"
        );


const caminho =
    `pratos/${nomeArquivo}`;


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
                    arquivo.type || "image/jpeg"

            },

            body:
                arquivo

        }

    );


if (!resposta.ok) {

    const erro =
        await resposta.text();

    throw new Error(

        "Erro ao enviar imagem: " +
        erro

    );

}


/* URL pública da imagem */

const urlImagem =
    `${SUPABASE_URL}` +
    `/storage/v1/object/public/` +
    `${BUCKET}/${caminho}`;


return urlImagem;
```

}

/* =========================================
CARREGAR PRATOS
========================================= */

async function carregarPratos() {

```
listaPratos.innerHTML = `
    <p class="carregando">
        Carregando pratos...
    </p>
`;


try {

    const resposta =
        await fetch(

            `${SUPABASE_URL}/rest/v1/prato?select=*&order=id.asc`,

            {

                method: "GET",

                headers:
                    headersJSON()

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
        "Erro ao carregar:",
        erro
    );

    listaPratos.innerHTML = `
        <p>
            Erro ao carregar os pratos.
        </p>
    `;

}
```

}

/* =========================================
MOSTRAR PRATOS
========================================= */

function mostrarPratos(
pratos
) {

```
listaPratos.innerHTML = "";


if (pratos.length === 0) {

    listaPratos.innerHTML = `
        <p>
            Nenhum prato cadastrado.
        </p>
    `;

    return;

}


pratos.forEach(
    prato => {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "prato";


        const imagem =
            prato.imagem ||
            "";


        const preco =
            Number(
                prato.preco || 0
            );


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


        listaPratos.appendChild(
            card
        );

    }
);
```

}

/* =========================================
ADICIONAR PRATO
========================================= */

form.addEventListener(

```
"submit",

async (
    evento
) => {

    evento.preventDefault();


    const arquivo =
        inputImagem.files[0];


    if (!arquivo) {

        alert(
            "Escolha uma imagem."
        );

        return;

    }


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


    try {

        botaoAdicionar.disabled =
            true;


        botaoAdicionar.textContent =
            "Enviando imagem...";


        /* =====================================
           ENVIAR IMAGEM
        ===================================== */

        const urlImagem =
            await enviarImagem(
                arquivo
            );


        botaoAdicionar.textContent =
            "Salvando prato...";


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
                urlImagem

        };


        /* =====================================
           SALVAR NO BANCO
        ===================================== */

        const resposta =
            await fetch(

                `${SUPABASE_URL}/rest/v1/prato`,

                {

                    method:
                        "POST",

                    headers: {

                        ...headersJSON(),

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
                erro
            );

        }


        alert(
            "Prato adicionado com sucesso!"
        );


        form.reset();


        previewImagem.src =
            "";


        previewContainer.style.display =
            "none";


        carregarPratos();

    }

    catch (erro) {

        console.error(
            erro
        );


        alert(

            "Erro:\n\n" +

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
```

);

/* =========================================
INICIAR
========================================= */

carregarPratos();
