const SUPABASE_URL =
"https://fmwmgoxjmcvsmfbcpfsj.supabase.co";

const SUPABASE_KEY =
"sb_publishable_ZJR2Z6gOfNO5rFhZb-RWwg_qvyY2b9Y";

const BUCKET = "imagens";

/* =========================================
ELEMENTOS
========================================= */

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

inputImagem.addEventListener("change", function () {

```
const arquivo = this.files[0];

if (!arquivo) {

    previewContainer.style.display = "none";

    return;
}

const url =
    URL.createObjectURL(arquivo);

previewImagem.src = url;

previewContainer.style.display = "block";
```

});

/* =========================================
CARREGAR PRATOS DO BANCO
========================================= */

async function carregarPratos() {

```
console.log("Buscando pratos...");

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
            erro
        );

    }


    const pratos =
        await resposta.json();


    console.log(
        "Pratos encontrados:",
        pratos
    );


    mostrarPratos(
        pratos
    );

}

catch (erro) {

    console.error(
        "Erro ao carregar pratos:",
        erro
    );


    listaPratos.innerHTML = `

        <p>

            Não foi possível carregar os pratos.

        </p>

    `;

}
```

}

/* =========================================
MOSTRAR PRATOS
========================================= */

function mostrarPratos(pratos) {

```
listaPratos.innerHTML = "";


if (!pratos.length) {

    listaPratos.innerHTML = `

        <p>

            Nenhum prato cadastrado.

        </p>

    `;

    return;

}


pratos.forEach(prato => {

    const card =
        document.createElement("article");


    card.className =
        "prato";


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


    listaPratos.appendChild(
        card
    );

});
```

}

/* =========================================
UPLOAD PARA SUPABASE STORAGE
========================================= */

async function enviarImagem(arquivo) {

```
console.log(
    "Iniciando upload:",
    arquivo.name
);


/* Nome único */

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


    console.error(
        "Erro do Storage:",
        erro
    );


    throw new Error(
        `Erro no upload (${resposta.status}): ${erro}`
    );

}


console.log(
    "Upload concluído!"
);


/* URL pública */

const urlImagem =

    `${SUPABASE_URL}` +
    `/storage/v1/object/public/` +
    `${BUCKET}/${caminho}`;


return urlImagem;
```

}

/* =========================================
ADICIONAR PRATO
========================================= */

form.addEventListener(
"submit",
async function (evento) {

```
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


    /* =====================================
       VALIDAÇÃO
    ===================================== */

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


    try {

        botaoAdicionar.disabled =
            true;


        /* =================================
           UPLOAD
        ================================= */

        botaoAdicionar.textContent =
            "Enviando imagem...";


        const urlImagem =
            await enviarImagem(
                arquivo
            );


        console.log(
            "URL da imagem:",
            urlImagem
        );


        /* =================================
           SALVAR BANCO
        ================================= */

        botaoAdicionar.textContent =
            "Salvando prato...";


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


        console.log(
            "Salvando:",
            dados
        );


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
                `Erro ao salvar prato (${resposta.status}): ${erro}`
            );

        }


        console.log(
            "Prato salvo!"
        );


        /* =================================
           LIMPAR
        ================================= */

        form.reset();


        previewImagem.src =
            "";


        previewContainer.style.display =
            "none";


        alert(
            "Prato adicionado com sucesso!"
        );


        /* Atualizar lista */

        carregarPratos();

    }

    catch (erro) {

        console.error(
            "ERRO:",
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
