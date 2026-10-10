const SUPABASE_URL = "https://fmwmgoxjmcvsmfbcpfsj.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZJR2Z6gOfNO5rFhZb-RWwg_qvyY2b9Y";
const BUCKET = "imagens";

const form = document.getElementById("formPrato");
const listaPratos = document.getElementById("listaPratos");
const botaoAdicionar = document.getElementById("botaoAdicionar");
const inputImagem = document.getElementById("imagem");

const formAlergia = document.getElementById("formAlergia");
const listaAlergias = document.getElementById("listaAlergias");
const botaoAdicionarAlergia = document.getElementById("botaoAdicionarAlergia");
const inputImagemAlergia = document.getElementById("imagemAlergia");

const previewAlergiaContainer =
    document.getElementById("previewAlergiaContainer");
const previewImagemAlergia =
    document.getElementById("previewImagemAlergia");
const listaAlergiasPrato =
    document.getElementById("listaAlergiasPrato");

let pratoEmEdicao = null;


/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function headersSupabase(extra = {}) {
    return {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        ...extra
    };
}

async function verificarResposta(resposta, operacao) {
    if (!resposta.ok) {
        const erro = await resposta.text();
        throw new Error(
            `${operacao} (${resposta.status}): ${erro}`
        );
    }

    return resposta;
}

function obterCampo(id) {
    const campo = document.getElementById(id);

    if (!campo) {
        throw new Error(
            `O campo #${id} não foi encontrado no HTML.`
        );
    }

    return campo;
}

function valorCampo(id) {
    const campo = document.getElementById(id);
    return campo ? campo.value.trim() : "";
}

function definirCampo(id, valor) {
    const campo = document.getElementById(id);

    if (campo) {
        campo.value = valor ?? "";
    } else {
        console.warn(`Campo #${id} não encontrado no HTML.`);
    }
}

function formatarPreco(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "";
    }

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function mostrarErro(mensagem, erro) {
    console.error(mensagem, erro);

    alert(
        `${mensagem}\n\n${erro?.message || erro || "Erro desconhecido."}`
    );
}


/* =========================================
   UPLOAD DE IMAGENS
========================================= */

async function enviarImagem(arquivo, pasta = "pratos") {
    if (!arquivo) {
        throw new Error("Nenhuma imagem foi selecionada.");
    }

    if (!arquivo.type.startsWith("image/")) {
        throw new Error("O arquivo selecionado não é uma imagem.");
    }

    const extensao = arquivo.name.includes(".")
        ? arquivo.name.split(".").pop().toLowerCase()
        : "jpg";

    const nomeArquivo =
        `${Date.now()}-${Math.random().toString(36).slice(2)}.${extensao}`;

    const caminho = `${pasta}/${nomeArquivo}`;

    const resposta = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${caminho}`,
        {
            method: "POST",
            headers: headersSupabase({
                "Content-Type": arquivo.type
            }),
            body: arquivo
        }
    );

    await verificarResposta(resposta, "Erro ao enviar imagem");

    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${caminho}`;
}


/* =========================================
   PRÉVIA DA IMAGEM DO PRATO
========================================= */

if (inputImagem) {
    inputImagem.addEventListener("change", function () {
        const arquivo = inputImagem.files?.[0];
        const container = document.getElementById("previewContainer");
        const imagem = document.getElementById("previewImagem");

        if (!container || !imagem) return;

        if (!arquivo) {
            container.style.display = "none";
            imagem.removeAttribute("src");
            return;
        }

        if (!arquivo.type.startsWith("image/")) {
            alert("Selecione um arquivo de imagem válido.");
            inputImagem.value = "";
            container.style.display = "none";
            imagem.removeAttribute("src");
            return;
        }

        const leitor = new FileReader();

        leitor.onload = function (evento) {
            imagem.src = evento.target.result;
            container.style.display = "block";
        };

        leitor.readAsDataURL(arquivo);
    });
}


/* =========================================
   CARREGAR PRATOS
========================================= */

async function carregarPratos() {
    if (!listaPratos) return;

    listaPratos.innerHTML =
        '<p class="carregando">Carregando pratos...</p>';

    try {
        const respostaPratos = await fetch(
            `${SUPABASE_URL}/rest/v1/prato?select=*&order=id.asc`,
            {
                headers: headersSupabase()
            }
        );

        await verificarResposta(respostaPratos, "Erro ao carregar pratos");

        const pratos = await respostaPratos.json();

        const respostaRelacoes = await fetch(
            `${SUPABASE_URL}/rest/v1/prato_alergia?select=*`,
            {
                headers: headersSupabase()
            }
        );

        await verificarResposta(
            respostaRelacoes,
            "Erro ao carregar relações de alergias"
        );

        const relacoes = await respostaRelacoes.json();

        const respostaAlergias = await fetch(
            `${SUPABASE_URL}/rest/v1/alergia?select=*&order=id.asc`,
            {
                headers: headersSupabase()
            }
        );

        await verificarResposta(
            respostaAlergias,
            "Erro ao carregar alergias"
        );

        const alergias = await respostaAlergias.json();

        const pratosComAlergias = pratos.map(prato => {
            const alergiasDoPrato = relacoes
                .filter(relacao =>
                    Number(relacao.prato_id) === Number(prato.id)
                )
                .map(relacao =>
                    alergias.find(alergia =>
                        Number(alergia.id) === Number(relacao.alergia_id)
                    )
                )
                .filter(Boolean);

            return {
                ...prato,
                alergias: alergiasDoPrato
            };
        });

        mostrarPratos(pratosComAlergias);

    } catch (erro) {
        mostrarErro("Não foi possível carregar os pratos.", erro);

        listaPratos.innerHTML =
            "<p>Erro ao carregar os pratos. Verifique o console.</p>";
    }
}


/* =========================================
   MOSTRAR PRATOS
========================================= */

function mostrarPratos(pratos) {
    if (!listaPratos) return;

    listaPratos.innerHTML = "";

    if (!pratos.length) {
        listaPratos.innerHTML = "<p>Nenhum prato cadastrado.</p>";
        return;
    }

    pratos.forEach(prato => {
        const card = document.createElement("article");
        card.className = "prato";

        const imagem = prato.imagem ||
            "https://via.placeholder.com/500x300?text=Sem+imagem";

        const alergiasHTML = prato.alergias?.length
            ? prato.alergias.map(alergia => `
                <div class="prato-alergia">
                    <img
                        src="${alergia.imagem || "https://via.placeholder.com/60"}"
                        alt="${alergia.nome || "Alergia"}"
                        class="prato-alergia-imagem"
                    >
                    <span>${alergia.nome || "Sem nome"}</span>
                </div>
            `).join("")
            : "<span>Nenhuma alergia cadastrada</span>";

        card.innerHTML = `
            <img
                class="prato-imagem"
                src="${imagem}"
                alt="${prato.nome || "Prato"}"
            >

            <div class="prato-info">
                <h3>${prato.nome || "Sem nome"}</h3>

                <p>${prato.descricao || "Sem descrição"}</p>

                <span class="prato-categoria">
                    ${prato.categoria || "Sem categoria"}
                </span>

                ${
                    prato.preco !== null && prato.preco !== undefined
                        ? `<span class="prato-preco">
                               ${formatarPreco(prato.preco)}
                           </span>`
                        : ""
                }

                ${
                    prato.quantidade !== null &&
                    prato.quantidade !== undefined
                        ? `<p class="prato-quantidade">
                               Quantidade disponível: ${prato.quantidade}
                           </p>`
                        : ""
                }

                <div class="prato-alergias">
                    <strong>⚠️ Alergias:</strong>
                    <div class="prato-alergias-lista">
                        ${alergiasHTML}
                    </div>
                </div>

                <div class="botoes-acoes-prato acoes-prato">
                    <button
                        class="botao-editar"
                        type="button"
                    >
                        ✏️ Editar prato
                    </button>

                    <button
                        class="botao-excluir"
                        type="button"
                    >
                        🗑️ Excluir prato
                    </button>
                </div>
            </div>
        `;

        card.querySelector(".botao-editar").addEventListener(
            "click",
            () => editarPrato(prato)
        );

        card.querySelector(".botao-excluir").addEventListener(
            "click",
            () => excluirPrato(prato.id, prato.nome)
        );

        listaPratos.appendChild(card);
    });
}


/* =========================================
   EDITAR PRATO
========================================= */

function editarPrato(prato) {
    if (!prato || prato.id === undefined || prato.id === null) {
        alert("Não foi possível identificar o prato para edição.");
        return;
    }

    pratoEmEdicao = prato;

    const campos = {
        nome: prato.nome,
        descricao: prato.descricao,
        categoria: prato.categoria,
        preco: prato.preco,
        quantidade: prato.quantidade,
        preco_pequeno: prato.preco_pequeno,
        preco_medio: prato.preco_medio,
        preco_grande: prato.preco_grande
    };

    Object.entries(campos).forEach(([id, valor]) => {
        definirCampo(id, valor);
    });

    const previewContainer = document.getElementById("previewContainer");
    const previewImagem = document.getElementById("previewImagem");

    if (previewContainer && previewImagem) {
        if (prato.imagem) {
            previewImagem.src = prato.imagem;
            previewContainer.style.display = "block";
        } else {
            previewImagem.removeAttribute("src");
            previewContainer.style.display = "none";
        }
    }

    document.querySelectorAll('input[name="alergiasPrato"]')
        .forEach(checkbox => {
            checkbox.checked = Boolean(
                prato.alergias?.some(
                    alergia => Number(alergia.id) === Number(checkbox.value)
                )
            );
        });

    if (form) {
        form.classList.add("modo-edicao");
        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    if (botaoAdicionar) {
        botaoAdicionar.textContent = "💾 Salvar alterações";
        botaoAdicionar.classList.add("modo-edicao");
    }

    let botaoCancelar = document.getElementById("botaoCancelarEdicao");

    if (!botaoCancelar && botaoAdicionar) {
        botaoCancelar = document.createElement("button");
        botaoCancelar.id = "botaoCancelarEdicao";
        botaoCancelar.type = "button";
        botaoCancelar.textContent = "✖ Cancelar edição";

        botaoAdicionar.insertAdjacentElement("afterend", botaoCancelar);

        botaoCancelar.addEventListener("click", cancelarEdicao);
    }

    if (botaoCancelar) {
        botaoCancelar.style.display = "inline-block";
    }
}


/* =========================================
   CANCELAR EDIÇÃO
========================================= */

function cancelarEdicao() {
    pratoEmEdicao = null;

    if (form) {
        form.reset();
        form.classList.remove("modo-edicao");
    }

    if (botaoAdicionar) {
        botaoAdicionar.disabled = false;
        botaoAdicionar.textContent = "+ Adicionar prato";
        botaoAdicionar.classList.remove("modo-edicao");
    }

    const previewContainer = document.getElementById("previewContainer");
    const previewImagem = document.getElementById("previewImagem");

    if (previewContainer) {
        previewContainer.style.display = "none";
    }

    if (previewImagem) {
        previewImagem.removeAttribute("src");
    }

    document.querySelectorAll('input[name="alergiasPrato"]')
        .forEach(checkbox => {
            checkbox.checked = false;
        });

    const botaoCancelar = document.getElementById("botaoCancelarEdicao");

    if (botaoCancelar) {
        botaoCancelar.style.display = "none";
    }
}


/* =========================================
   ATUALIZAR PRATO
========================================= */

async function atualizarPrato(id, dados) {
    const resposta = await fetch(
        `${SUPABASE_URL}/rest/v1/prato?id=eq.${encodeURIComponent(id)}`,
        {
            method: "PATCH",
            headers: headersSupabase({
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }),
            body: JSON.stringify(dados)
        }
    );

    await verificarResposta(resposta, "Erro ao atualizar prato");

    return resposta.json();
}


/* =========================================
   EXCLUIR PRATO
========================================= */

async function excluirPrato(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
        return;
    }

    try {
        const resposta = await fetch(
            `${SUPABASE_URL}/rest/v1/prato?id=eq.${encodeURIComponent(id)}`,
            {
                method: "DELETE",
                headers: headersSupabase({
                    "Prefer": "return=representation"
                })
            }
        );

        await verificarResposta(resposta, "Erro ao excluir prato");

        alert(`"${nome}" foi excluído com sucesso!`);
        await carregarPratos();

    } catch (erro) {
        mostrarErro("Não foi possível excluir o prato.", erro);
    }
}


/* =========================================
   CARREGAR ALERGIAS PARA O FORMULÁRIO
========================================= */

async function carregarAlergiasParaPrato() {
    if (!listaAlergiasPrato) return;

    listaAlergiasPrato.innerHTML =
        '<p class="carregando">Carregando alergias...</p>';

    try {
        const resposta = await fetch(
            `${SUPABASE_URL}/rest/v1/alergia?select=*&order=id.asc`,
            {
                headers: headersSupabase()
            }
        );

        await verificarResposta(resposta, "Erro ao carregar alergias");

        const alergias = await resposta.json();
        mostrarAlergiasParaPrato(alergias);

    } catch (erro) {
        mostrarErro("Não foi possível carregar as alergias do prato.", erro);
        listaAlergiasPrato.innerHTML =
            "<p>Erro ao carregar as alergias.</p>";
    }
}

function mostrarAlergiasParaPrato(alergias) {
    if (!listaAlergiasPrato) return;

    listaAlergiasPrato.innerHTML = "";

    if (!alergias.length) {
        listaAlergiasPrato.innerHTML =
            "<p>Nenhuma alergia cadastrada.</p>";
        return;
    }

    alergias.forEach(alergia => {
        const opcao = document.createElement("label");
        opcao.className = "alergia-opcao";

        const imagem = alergia.imagem ||
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

        listaAlergiasPrato.appendChild(opcao);
    });
}


/* =========================================
   SALVAR RELAÇÕES DE ALERGIAS DO PRATO
========================================= */

async function salvarAlergiasDoPrato(pratoId, editar = false) {
    const alergiasSelecionadas = Array.from(
        document.querySelectorAll(
            'input[name="alergiasPrato"]:checked'
        )
    ).map(checkbox => Number(checkbox.value));

    if (editar) {
        const respostaDelete = await fetch(
            `${SUPABASE_URL}/rest/v1/prato_alergia?prato_id=eq.${encodeURIComponent(pratoId)}`,
            {
                method: "DELETE",
                headers: headersSupabase({
                    "Prefer": "return=minimal"
                })
            }
        );

        await verificarResposta(
            respostaDelete,
            "Erro ao remover as relações antigas de alergias"
        );
    }

    if (!alergiasSelecionadas.length) return;

    const relacoes = alergiasSelecionadas.map(alergiaId => ({
        prato_id: Number(pratoId),
        alergia_id: alergiaId
    }));

    const resposta = await fetch(
        `${SUPABASE_URL}/rest/v1/prato_alergia`,
        {
            method: "POST",
            headers: headersSupabase({
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            }),
            body: JSON.stringify(relacoes)
        }
    );

    await verificarResposta(
        resposta,
        "Erro ao salvar as alergias do prato"
    );
}


/* =========================================
   ADICIONAR OU EDITAR PRATO
========================================= */

if (form) {
    form.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        if (!botaoAdicionar) {
            alert("O botão de adicionar prato não foi encontrado.");
            return;
        }

        try {
            const nome = valorCampo("nome");
            const descricao = valorCampo("descricao");
            const categoria = valorCampo("categoria");

            const precoValor = valorCampo("preco");
            const quantidadeValor = valorCampo("quantidade");
            const precoPequenoValor = valorCampo("preco_pequeno");
            const precoMedioValor = valorCampo("preco_medio");
            const precoGrandeValor = valorCampo("preco_grande");

            const preco = precoValor === "" ? null : Number(precoValor);
            const quantidade = quantidadeValor === ""
                ? null
                : Number(quantidadeValor);

            const preco_pequeno = precoPequenoValor === ""
                ? null
                : Number(precoPequenoValor);

            const preco_medio = precoMedioValor === ""
                ? null
                : Number(precoMedioValor);

            const preco_grande = precoGrandeValor === ""
                ? null
                : Number(precoGrandeValor);

            const arquivo = inputImagem?.files?.[0] || null;

            if (!nome) {
                alert("Digite o nome do prato.");
                return;
            }

            if (!categoria) {
                alert("Escolha uma categoria.");
                return;
            }

            if (!pratoEmEdicao && !arquivo) {
                alert("Escolha uma imagem para o prato.");
                return;
            }

            if (arquivo && !arquivo.type.startsWith("image/")) {
                alert("O arquivo selecionado não é uma imagem.");
                return;
            }

            const precos = [preco, preco_pequeno, preco_medio, preco_grande];

            if (precos.every(valor => valor === null)) {
                alert(
                    "Digite um preço normal ou pelo menos um preço por tamanho."
                );
                return;
            }

            if (precos.some(valor =>
                valor !== null && (!Number.isFinite(valor) || valor < 0)
            )) {
                alert("Todos os preços preenchidos devem ser válidos e não negativos.");
                return;
            }

            if (
                quantidade !== null &&
                (!Number.isInteger(quantidade) || quantidade < 0)
            ) {
                alert("Digite uma quantidade válida, usando um número inteiro não negativo.");
                return;
            }

            botaoAdicionar.disabled = true;

            let urlImagem = pratoEmEdicao?.imagem || null;

            if (arquivo) {
                botaoAdicionar.textContent = "Enviando imagem...";
                urlImagem = await enviarImagem(arquivo, "pratos");
            }

            botaoAdicionar.textContent = pratoEmEdicao
                ? "Salvando alterações..."
                : "Salvando prato...";

            const dados = {
                nome,
                descricao,
                categoria,
                preco,
                imagem: urlImagem,
                quantidade,
                preco_pequeno,
                preco_medio,
                preco_grande
            };

            if (pratoEmEdicao) {
                const idEditado = pratoEmEdicao.id;

                await atualizarPrato(idEditado, dados);

                botaoAdicionar.textContent = "Salvando alergias...";

                await salvarAlergiasDoPrato(idEditado, true);

                alert("Prato atualizado com sucesso!");

                cancelarEdicao();
                await carregarPratos();

            } else {
                const resposta = await fetch(
                    `${SUPABASE_URL}/rest/v1/prato`,
                    {
                        method: "POST",
                        headers: headersSupabase({
                            "Content-Type": "application/json",
                            "Prefer": "return=representation"
                        }),
                        body: JSON.stringify(dados)
                    }
                );

                await verificarResposta(resposta, "Erro ao salvar prato");

                const resultado = await resposta.json();
                const pratoCriado = Array.isArray(resultado)
                    ? resultado[0]
                    : resultado;

                if (!pratoCriado?.id) {
                    throw new Error(
                        "O Supabase não retornou o ID do prato criado."
                    );
                }

                await salvarAlergiasDoPrato(pratoCriado.id, false);

                alert("Prato adicionado com sucesso!");

                form.reset();

                const previewContainer =
                    document.getElementById("previewContainer");
                const previewImagem =
                    document.getElementById("previewImagem");

                if (previewContainer) {
                    previewContainer.style.display = "none";
                }

                if (previewImagem) {
                    previewImagem.removeAttribute("src");
                }

                await carregarPratos();
            }

        } catch (erro) {
            mostrarErro(
                pratoEmEdicao
                    ? "Não foi possível atualizar o prato."
                    : "Não foi possível adicionar o prato.",
                erro
            );

        } finally {
            botaoAdicionar.disabled = false;

            botaoAdicionar.textContent = pratoEmEdicao
                ? "💾 Salvar alterações"
                : "+ Adicionar prato";
        }
    });
}


/* =========================================
   CARREGAR E MOSTRAR ALERGIAS
========================================= */

async function carregarAlergias() {
    if (!listaAlergias) return;

    listaAlergias.innerHTML =
        '<p class="carregando">Carregando alergias...</p>';

    try {
        const resposta = await fetch(
            `${SUPABASE_URL}/rest/v1/alergia?select=*&order=id.asc`,
            {
                headers: headersSupabase()
            }
        );

        await verificarResposta(resposta, "Erro ao carregar alergias");

        const alergias = await resposta.json();

        mostrarAlergias(alergias);
        mostrarAlergiasParaPrato(alergias);

    } catch (erro) {
        mostrarErro("Não foi possível carregar as alergias.", erro);
        listaAlergias.innerHTML = "<p>Erro ao carregar as alergias.</p>";
    }
}

function mostrarAlergias(alergias) {
    if (!listaAlergias) return;

    listaAlergias.innerHTML = "";

    if (!alergias.length) {
        listaAlergias.innerHTML =
            "<p>Nenhuma alergia cadastrada.</p>";
        return;
    }

    alergias.forEach(alergia => {
        const card = document.createElement("article");
        card.className = "alergia";

        const imagem = alergia.imagem ||
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

        card.querySelector(".botao-excluir-alergia")
            .addEventListener("click", () => {
                excluirAlergia(alergia.id, alergia.nome);
            });

        listaAlergias.appendChild(card);
    });
}


/* =========================================
   PRÉVIA DA IMAGEM DA ALERGIA
========================================= */

if (inputImagemAlergia) {
    inputImagemAlergia.addEventListener("change", function () {
        const arquivo = inputImagemAlergia.files?.[0];

        if (!previewAlergiaContainer || !previewImagemAlergia) {
            return;
        }

        if (!arquivo) {
            previewAlergiaContainer.style.display = "none";
            previewImagemAlergia.removeAttribute("src");
            return;
        }

        if (!arquivo.type.startsWith("image/")) {
            alert("O arquivo selecionado não é uma imagem.");
            inputImagemAlergia.value = "";
            previewAlergiaContainer.style.display = "none";
            previewImagemAlergia.removeAttribute("src");
            return;
        }

        const leitor = new FileReader();

        leitor.onload = function (evento) {
            previewImagemAlergia.src = evento.target.result;
            previewAlergiaContainer.style.display = "flex";
        };

        leitor.readAsDataURL(arquivo);
    });
}


/* =========================================
   ADICIONAR ALERGIA
========================================= */

if (formAlergia) {
    formAlergia.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        try {
            const nome = valorCampo("nomeAlergia");
            const arquivo = inputImagemAlergia?.files?.[0];

            if (!nome) {
                alert("Digite o nome da alergia.");
                return;
            }

            if (!arquivo) {
                alert("Escolha uma imagem para a alergia.");
                return;
            }

            if (!arquivo.type.startsWith("image/")) {
                alert("O arquivo selecionado não é uma imagem.");
                return;
            }

            if (botaoAdicionarAlergia) {
                botaoAdicionarAlergia.disabled = true;
                botaoAdicionarAlergia.textContent = "Enviando imagem...";
            }

            const urlImagem = await enviarImagem(arquivo, "alergias");

            if (botaoAdicionarAlergia) {
                botaoAdicionarAlergia.textContent = "Salvando alergia...";
            }

            const resposta = await fetch(
                `${SUPABASE_URL}/rest/v1/alergia`,
                {
                    method: "POST",
                    headers: headersSupabase({
                        "Content-Type": "application/json",
                        "Prefer": "return=representation"
                    }),
                    body: JSON.stringify({
                        nome,
                        imagem: urlImagem
                    })
                }
            );

            await verificarResposta(resposta, "Erro ao salvar alergia");

            alert("Alergia adicionada com sucesso!");

            formAlergia.reset();

            if (previewAlergiaContainer) {
                previewAlergiaContainer.style.display = "none";
            }

            if (previewImagemAlergia) {
                previewImagemAlergia.removeAttribute("src");
            }

            await carregarAlergias();

        } catch (erro) {
            mostrarErro("Não foi possível adicionar a alergia.", erro);

        } finally {
            if (botaoAdicionarAlergia) {
                botaoAdicionarAlergia.disabled = false;
                botaoAdicionarAlergia.textContent = "+ Adicionar alergia";
            }
        }
    });
}


/* =========================================
   EXCLUIR ALERGIA
========================================= */

async function excluirAlergia(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
        return;
    }

    try {
        const resposta = await fetch(
            `${SUPABASE_URL}/rest/v1/alergia?id=eq.${encodeURIComponent(id)}`,
            {
                method: "DELETE",
                headers: headersSupabase({
                    "Prefer": "return=representation"
                })
            }
        );

        await verificarResposta(resposta, "Erro ao excluir alergia");

        alert(`"${nome}" foi excluída com sucesso!`);

        await carregarAlergias();
        await carregarPratos();

    } catch (erro) {
        mostrarErro(
            "Não foi possível excluir a alergia. Se ela estiver associada a pratos, remova essa associação primeiro.",
            erro
        );
    }
}


/* =========================================
   INICIALIZAÇÃO
========================================= */

carregarPratos();
carregarAlergias();
