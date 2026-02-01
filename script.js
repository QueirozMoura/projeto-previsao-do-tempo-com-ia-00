const BASE_URL = "https://projeto-previsao-do-tempo-com-ia.onrender.com";

async function clicarNoBotao() {
    const cidade = encodeURIComponent(
        document.querySelector('.input-cidade').value
    );

    const caixaMedia = document.querySelector('.caixa-media');
    const endereco = `${BASE_URL}/weather/${cidade}`;

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
        caixaMedia.innerHTML = `<p>Erro ao conectar com o servidor ❌</p>`;
    }
}

function falarVoz() {
    const reconhecimento = new window.webkitSpeechRecognition();
    reconhecimento.lang = "pt-BR";
    reconhecimento.start();

    reconhecimento.onresult = function (evento) {
        const texto = evento.results[0][0].transcript;
        document.querySelector('.input-cidade').value = texto;
        clicarNoBotao();
        reconhecimento.stop();
    };
}

async function sugestaoIA() {
    const temperatura = document.querySelector('.temperatura').textContent;
    const umidade = document.querySelector('.umidade').textContent;
    const cidade = document.querySelector('.cidade').textContent;
    const descricao = document.querySelector('.descricao');

    descricao.textContent = "🤖 Pensando na melhor roupa...";

    try {
        const resposta = await fetch(`${BASE_URL}/ia/roupa`, {
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

        descricao.textContent =
            "👕 Sugestão de roupa: " +
            dados.choices[0].message.content;
    } catch (erro) {
        descricao.textContent = "❌ Erro ao gerar sugestão de roupa";
    }
}
