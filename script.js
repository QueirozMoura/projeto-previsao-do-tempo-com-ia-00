// ================================
// FUNÇÃO PARA BUSCAR PREVISÃO
// ================================
async function clicarNoBotao() {
    const cidadeInput = document.querySelector('.input-cidade').value.trim();

    if (!cidadeInput) {
        alert("Por favor, digite uma cidade!");
        return;
    }

    const cidade = encodeURIComponent(cidadeInput);
    const caixaMedia = document.querySelector('.caixa-media');

    // URL da API online no Render
    const endereco = `https://projeto-previsao-do-tempo-com-ia.onrender.com/weather/${cidade}`;

    try {
        const respostaServidor = await fetch(endereco);
        const dados = await respostaServidor.json();

        if (!dados.main || !dados.weather) {
            caixaMedia.innerHTML = `<p>Erro ao buscar a cidade ❌</p>`;
            return;
        }

        caixaMedia.innerHTML = `
            <h2 class="cidade">${dados.name}</h2>
            <p class="temperatura">${Math.round(dados.main.temp)}°C</p>
            <p class="umidade">${dados.main.humidity}%</p>
            <button class="botao-roupa" onclick="sugestaoIA()">Sugestão de Roupa</button>
            <p class="descricao">${dados.weather[0].description}</p>
        `;
    } catch (erro) {
        console.error("Erro ao conectar com o servidor:", erro);
        caixaMedia.innerHTML = `<p>Erro ao conectar com o servidor ❌</p>`;
    }
}

// ================================
// FUNÇÃO PARA VOZ
// ================================
function falarVoz() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Seu navegador não suporta reconhecimento de voz.");
        return;
    }

    const reconhecimento = new window.webkitSpeechRecognition();
    reconhecimento.lang = "pt-BR";
    reconhecimento.start();

    reconhecimento.onresult = function (evento) {
        const texto = evento.results[0][0].transcript;
        document.querySelector('.input-cidade').value = texto;
        clicarNoBotao();
        reconhecimento.stop();
    };

    reconhecimento.onerror = function (evento) {
        console.error("Erro no reconhecimento de voz:", evento.error);
        alert("Erro no reconhecimento de voz. Tente novamente.");
        reconhecimento.stop();
    };
}

// ================================
// FUNÇÃO PARA SUGESTÃO DE ROUPA
// ================================
async function sugestaoIA() {
    const temperatura = document.querySelector('.temperatura').textContent;
    const umidade = document.querySelector('.umidade').textContent;
    const cidade = document.querySelector('.cidade').textContent;
    const descricao = document.querySelector('.descricao');

    descricao.textContent = "🤖 Pensando na melhor roupa...";

    try {
        const resposta = await fetch("https://projeto-previsao-do-tempo-com-ia.onrender.com/ia/roupa", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cidade,
                temperatura,
                umidade
            })
        });

        const dados = await resposta.json();

        if (dados.choices && dados.choices[0] && dados.choices[0].message) {
            descricao.textContent =
                "👕 Sugestão de roupa: " +
                dados.choices[0].message.content;
        } else {
            descricao.textContent = "❌ Não foi possível gerar a sugestão da IA";
        }
    } catch (erro) {
        console.error("Erro ao chamar a IA:", erro);
        descricao.textContent = "❌ Erro ao gerar sugestão de roupa";
    }
}
