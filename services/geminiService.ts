// Arquivo pode ser removido se não for mais usado

export const generateFairPlayMessage = async (playerNames: string[]): Promise<string> => {
  if (playerNames.length < 2) {
    return "Adicione pelo menos dois jogadores para gerar uma mensagem de fair play.";
  }

  const prompt = `Você é um motivador esportivo para jogos amadores. Crie uma mensagem curta (2-3 frases) e inspiradora sobre fair play, diversão e trabalho em equipe para os seguintes jogadores que vão jogar juntos: ${playerNames.join(', ')}. A mensagem deve ser positiva, amigável e em português do Brasil.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating fair play message:", error);
    return "Não foi possível gerar a mensagem no momento. Lembrem-se de jogar com respeito e se divertir!";
  }
};
