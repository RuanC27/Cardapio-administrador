const SUPABASE_URL =
"https://fmwmgoxjmcvsmfbcpfsj.supabase.co";

const SUPABASE_KEY =
"sb_publishable_ZJR2Z6gOfNO5rFhZb-RWwg_qvyY2b9Y";

const BUCKET = "imagens";

const form = document.getElementById("formPrato");
const listaPratos = document.getElementById("listaPratos");
const botaoAdicionar = document.getElementById("botaoAdicionar");

const inputImagem = document.getElementById("imagem");
const previewContainer = document.getElementById("previewContainer");
const previewImagem = document.getElementById("previewImagem");

console.log("ADMIN.JS CARREGADO");

/* =========================================
PRÉVIA DA IMAGEM
========================================= */

if (inputImagem) {

```
inputImagem.addEventListener("change", function () {

    const arquivo = this.files[0];

    if (!arquivo) {

        if (previewContainer) {
            previewContainer.style.display = "none";
        }

        return;
    }

    if (!arquivo.type.startsWith("image/")) {

        alert("Selecione uma imagem válida.");

        inputImagem.value = "";

        return;
    }

    const url = URL.createObjectURL(arquivo);

    if (previewImagem) {
        previewImagem.src = url;
    }

    if (previewContainer) {
        previewContainer.style.display = "block";
    }

});
```

}

/* =========================================
CARREGAR PRATOS
========================================= */

async function carregarPratos() {

```
console.log("Buscando pratos no Supabase...");

if (!listaPratos) {

    console.error("Elemento listaPratos não encontrado.");

    return;
}

listaPratos.innerHTML = `
    <p class="carregando">
        Carregando pratos...
    </p>
`;

try {

    const resposta = await fetch(
        SUPABASE_URL + "/rest/v1/prato?select=*",
        {
            method: "GET",

            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY
            }
        }
    );


    const texto = await resposta.text();

    console.log(
        "Resposta Supabase:",
        resposta.status,
        texto
    );


    if (!resposta.ok) {

        throw new Error(
            "Erro " +
            resposta.status +
            ": " +
            texto
        );
    }


    const pratos = JSON.parse(texto);

    mostrarPratos(pratos);

}

catch (erro) {

    console.error(
        "Erro ao carregar pratos:",
        erro
    );

    listaPratos.innerHTML = `
        <div class="erro">
            <p>
                Não foi possível carregar os pratos.
            </p>

            <p>
                ${erro.message}
            </p>
        </div>
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


if (!pratos || pratos.length === 0) {

    listaPratos.innerHTML = `
        <p>
            Nenhum prato cadastrado.
        </p>
    `;

    return;
}


pratos.forEach(function (prato) {

    const card =
        document.createElement("article");

    card.className = "prato";


    const imagem =
        prato.imagem ||
        "https://via.placeholder.com/500x300?text=Sem+imagem";


    const preco =
        Number(prato.preco || 0);


    const img =
        document.createElement("img");

    img.className = "prato-imagem";

    img.src = imagem;

    img.alt =
        prato.nome || "Prato";


    const info =
        document.createElement("div");

    info.className =
        "prato-info";


    const nome =
        document.createElement("h3");

    nome.textContent =
        prato.nome || "Sem nome";


    const descricao =
        document.createElement("p");

    descricao.textContent =
        prato.descricao || "Sem descrição";


    const categoria =
        document.createElement("span");

    categoria.className =
        "prato-categoria";

    categoria.textContent =
        prato.categoria || "Sem categoria";


    const valor =
        document.createElement("span");

    valor.className =
        "prato-preco";

    valor.textContent =
        "R$ " +
        preco.toFixed(2).replace(".", ",");


    info.appendChild(nome);
    info.appendChild(descricao);
    info.appendChild(categoria);
    info.appendChild(valor);


    card.appendChild(img);
    card.appendChild(info);


    listaPratos.appendChild(card);

});
```

}

/* =========================================
UPLOAD DA IMAGEM
========================================= */

async function enviarImagem(arquivo) {

```
if (!arquivo) {

    throw new Error(
        "Nenhuma imagem foi selecionada."
    );
}


console.log(
    "Enviando imagem:",
    arquivo.name
);


const extensao =
    arquivo.name
        .split(".")
        .pop()
        .toLowerCase();


const nomeArquivo =
    Date.now() +
    "-" +
    Math.random()
        .toString(36)
        .substring(2) +
    "." +
    extensao;


const caminho =
    "pratos/" +
    nomeArquivo;


const url =
    SUPABASE_URL +
    "/storage/v1/object/" +
    BUCKET +
    "/" +
    caminho;


const resposta =
    await fetch(
        url,
        {
            method: "POST",

            headers: {
                "apikey": SUPABASE_KEY,

                "Authorization":
                    "Bearer " +
                    SUPABASE_KEY,

                "Content-Type":
                    arquivo.type
            },

            body: arquivo
        }
    );


const texto =
    await resposta.text();


console.log(
    "Upload:",
    resposta.status,
    texto
);


if (!resposta.ok) {

    throw new Error(
        "Erro no upload da imagem: " +
        resposta.status +
        " - " +
        texto
    );
}


return (
    SUPABASE_URL +
    "/storage/v1/object/public/" +
    BUCKET +
    "/" +
    caminho
);
```

}

/* =========================================
ADICIONAR PRATO
========================================= */

if (form) {

```
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


            botaoAdicionar.textContent =
                "Enviando imagem...";


            const urlImagem =
                await enviarImagem(
                    arquivo
                );


            botaoAdicionar.textContent =
                "Salvando prato...";


            const dados = {

                nome: nome,

                descricao: descricao,

                preco: preco,

                categoria: categoria,

                imagem: urlImagem
            };


            const resposta =
                await fetch(
                    SUPABASE_URL +
                    "/rest/v1/prato",
                    {
                        method: "POST",

                        headers: {

                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                "Bearer " +
                                SUPABASE_KEY,

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


            const texto =
                await resposta.text();


            console.log(
                "Salvar prato:",
                resposta.status,
                texto
            );


            if (!resposta.ok) {

                throw new Error(
                    "Erro ao salvar prato: " +
                    resposta.status +
                    " - " +
                    texto
                );
            }


            alert(
                "Prato adicionado com sucesso!"
            );


            form.reset();


            if (previewImagem) {
                previewImagem.src = "";
            }


            if (previewContainer) {

                previewContainer.style.display =
                    "none";
            }


            await carregarPratos();

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
);
```

}

/* =========================================
INICIAR
========================================= */

carregarPratos();


/* =========================================
INICIAR
========================================= */

carregarPratos();
