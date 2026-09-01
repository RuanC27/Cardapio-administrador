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
VERIFICAR ELEMENTOS
========================================= */

console.log("ADMIN.JS INICIADO");

console.log("Form:", form);
console.log("Lista:", listaPratos);
console.log("Botão:", botaoAdicionar);
console.log("Imagem:", inputImagem);

/* =========================================
PRÉVIA DA IMAGEM
========================================= */

if (inputImagem) {

```
inputImagem.addEventListener(
    "change",
    function () {

        const arquivo =
            this.files[0];


        if (!arquivo) {

            if (previewContainer) {

                previewContainer.style.display =
                    "none";

            }

            return;

        }


        if (!arquivo.type.startsWith("image/")) {

            alert(
                "Selecione um arquivo de imagem."
            );

            this.value = "";

            return;

        }


        const url =
            URL.createObjectURL(
                arquivo
            );


        if (previewImagem) {

            previewImagem.src =
                url;

        }


        if (previewContainer) {

            previewContainer.style.display =
                "block";

        }

    }
);
```

}

/* =========================================
CARREGAR PRATOS
========================================= */

async function carregarPratos() {

```
console.log(
    "Buscando pratos no Supabase..."
);


if (!listaPratos) {

    console.error(
        "Elemento listaPratos não encontrado."
    );

    return;

}


listaPratos.innerHTML = `

    <p class="carregando">

        Carregando pratos...

    </p>

`;


try {

    const url =
        SUPABASE_URL +
        "/rest/v1/prato?select=*&order=id.asc";


    console.log(
        "URL:",
        url
    );


    const resposta =
        await fetch(
            url,
            {
                method: "GET",

                headers: {

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        "Bearer " +
                        SUPABASE_KEY

                }

            }
        );


    console.log(
        "Status:",
        resposta.status
    );


    if (!resposta.ok) {

        const erro =
            await resposta.text();


        throw new Error(
            "Erro " +
            resposta.status +
            ": " +
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
        "ERRO AO CARREGAR:",
        erro
    );


    listaPratos.innerHTML = `

        <div>

            <p>

                ❌ Erro ao carregar os pratos.

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


if (!Array.isArray(pratos)) {

    listaPratos.innerHTML = `

        <p>

            Resposta inválida do Supabase.

        </p>

    `;

    return;

}


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
            "https://via.placeholder.com/500x300?text=Sem+imagem";


        const preco =
            Number(
                prato.preco || 0
            );


        const img =
            document.createElement(
                "img"
            );


        img.className =
            "prato-imagem";


        img.src =
            imagem;


        img.alt =
            prato.nome ||
            "Prato";


        const info =
            document.createElement(
                "div"
            );


        info.className =
            "prato-info";


        const nome =
            document.createElement(
                "h3"
            );


        nome.textContent =
            prato.nome ||
            "Sem nome";


        const descricao =
            document.createElement(
                "p"
            );


        descricao.textContent =
            prato.descricao ||
            "Sem descrição";


        const categoria =
            document.createElement(
                "span"
            );


        categoria.className =
            "prato-categoria";


        categoria.textContent =
            prato.categoria ||
            "Sem categoria";


        const valor =
            document.createElement(
                "span"
            );


        valor.className =
            "prato-preco";


        valor.textContent =
            "R$ " +
            preco
                .toFixed(2)
                .replace(
                    ".",
                    ","
                );


        info.appendChild(
            nome
        );

        info.appendChild(
            descricao
        );

        info.appendChild(
            categoria
        );

        info.appendChild(
            valor
        );


        card.appendChild(
            img
        );

        card.appendChild(
            info
        );


        listaPratos.appendChild(
            card
        );

    }
);
```

}

/* =========================================
ENVIAR IMAGEM PARA STORAGE
========================================= */

async function enviarImagem(
arquivo
) {

```
console.log(
    "Iniciando upload:",
    arquivo.name
);


if (!arquivo) {

    throw new Error(
        "Nenhuma imagem selecionada."
    );

}


if (!arquivo.type.startsWith("image/")) {

    throw new Error(
        "O arquivo selecionado não é uma imagem."
    );

}


/* Extensão */

let extensao =
    arquivo.name
        .split(".")
        .pop()
        .toLowerCase();


if (!extensao) {

    extensao =
        "jpg";

}


/* Nome único */

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


const urlUpload =

    SUPABASE_URL +
    "/storage/v1/object/" +
    BUCKET +
    "/" +
    caminho;


console.log(
    "URL do upload:",
    urlUpload
);


const resposta =
    await fetch(
        urlUpload,
        {

            method: "POST",

            headers: {

                "apikey":
                    SUPABASE_KEY,

                "Authorization":
                    "Bearer " +
                    SUPABASE_KEY,

                "Content-Type":
                    arquivo.type

            },

            body:
                arquivo

        }
    );


console.log(
    "Status upload:",
    resposta.status
);


if (!resposta.ok) {

    const erro =
        await resposta.text();


    console.error(
        "Erro Storage:",
        erro
    );


    throw new Error(

        "Falha no upload da imagem. " +

        "Status " +

        resposta.status +

        ": " +

        erro

    );

}


console.log(
    "Imagem enviada com sucesso!"
);


/* URL pública */

const urlPublica =

    SUPABASE_URL +

    "/storage/v1/object/public/" +

    BUCKET +

    "/" +

    caminho;


console.log(
    "URL pública:",
    urlPublica
);


return urlPublica;
```

}

/* =========================================
SALVAR PRATO NA TABELA
========================================= */

async function salvarPrato(
dados
) {

```
console.log(
    "Salvando prato:",
    dados
);


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


console.log(
    "Status banco:",
    resposta.status
);


if (!resposta.ok) {

    const erro =
        await resposta.text();


    console.error(
        "Erro banco:",
        erro
    );


    throw new Error(

        "Falha ao salvar o prato. " +

        "Status " +

        resposta.status +

        ": " +

        erro

    );

}


const resultado =
    await resposta.json();


console.log(
    "Prato salvo:",
    resultado
);


return resultado;
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


        console.log(
            "Formulário enviado."
        );


        const nome =
            document
                .getElementById(
                    "nome"
                )
                .value
                .trim();


        const descricao =
            document
                .getElementById(
                    "descricao"
                )
                .value
                .trim();


        const preco =
            Number(

                document
                    .getElementById(
                        "preco"
                    )
                    .value

            );


        const categoria =
            document
                .getElementById(
                    "categoria"
                )
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


            /* =================================
               DADOS
            ================================= */

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


            /* =================================
               BANCO
            ================================= */

            botaoAdicionar.textContent =
                "Salvando prato...";


            await salvarPrato(
                dados
            );


            /* =================================
               SUCESSO
            ================================= */

            alert(
                "Prato adicionado com sucesso!"
            );


            form.reset();


            if (previewImagem) {

                previewImagem.src =
                    "";

            }


            if (previewContainer) {

                previewContainer.style.display =
                    "none";

            }


            await carregarPratos();

        }

        catch (erro) {

            console.error(
                "ERRO AO ADICIONAR:",
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
