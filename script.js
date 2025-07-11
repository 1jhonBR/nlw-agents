const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const aiResponse = document.getElementById("aiResponse");
const form = document.getElementById("form");

const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

// AIzaSyAauvCiKYuiePv0rscOTbVO36COOfaaKeA

const perguntarIA = async (question, game, apiKey) => {
  const model = "gemini-2.0-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const pergunta = `
    ## Especialidade
      Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
      Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas

    ## Regras
      - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
      - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo selecionado'
      - Considere a data atual ${new Date().toLocaleDateString}
      - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
      - Nunca responda itens/coisas/infos que você não tenha certeza de que exista no patch atual do respectivo jogo.

    ## Resposta
      - Economize na resposta, seja direto e responda no máximo 500 carácteres.
      - Responda em markdown
      - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
      # Pergunta do usuário: "Melhor build Rengar Jungle"
      # Resposta: "A build mais atual e mais forte é: \n\n **Itens:** \n\n Coloque os itens/Agentes/infos aqui. \n\n **Agentes:** \n\n Exemplo de agentes... E por ai vai, isso é um exemplo!

      # Se a pergunta do usuário for sobre World of Warcraft:
      # Sua resposta deve ser temática sobre o jogo, com quebras de linhas e uma formatação bonita.

      ---

      Aqui está a pergunta do usuário ${question}
  `;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: pergunta,
        },
      ],
    },
  ];

  const tools = [
    {
      google_search: {},
    },
  ];

  // Chamada API
  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      tools,
    }),
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const enviarFormulario = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  if (apiKey == "" || game == "" || question == "") {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");

  try {
    // Perguntar para a IA
    const text = await perguntarIA(question, game, apiKey);
    aiResponse.querySelector('.response-content').innerHTML =
      markdownToHTML(text);
    aiResponse.classList.remove('hidden')
  } catch (error) {
    console.log("Erro: ", error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};
form.addEventListener("submit", enviarFormulario);
