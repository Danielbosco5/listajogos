
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found in environment variables. The intelligent features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateFairPlayMessage = async (playerNames: string[]): Promise<string> => {
  if (!API_KEY) {
    return "A funcionalidade inteligente está desativada. Por favor, configure a chave da API.";
  }
  
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
