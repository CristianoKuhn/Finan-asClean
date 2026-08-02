import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client with recommended telemetry user agent
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required on the server side.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// 1. API Endpoint for Financial AI Advisor (Secure and server-side)
app.post("/api/ai/coach", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { 
      userName, 
      activeMonth, 
      transactions, 
      accounts, 
      cards, 
      goals, 
      subscriptions, 
      investments,
      customQuestion
    } = req.body;

    // Build context prompt
    const contextPrompt = `
      Você é o Consultor Financeiro Inteligente integrado ao aplicativo "Finanças Pro", uma plataforma de gestão de finanças pessoais de nível premium.
      
      ${customQuestion 
        ? `O usuário Cristiano fez a seguinte pergunta direta: "${customQuestion}". Responda a essa pergunta diretamente de forma clara, acolhedora, amigável, com detalhes numéricos e sugestões práticas, baseando-se nos dados financeiros fornecidos.` 
        : 'Seu objetivo é analisar os dados financeiros do usuário, calcular sua saúde financeira, identificar tendências ou anomalias, emitir alertas inteligentes e dar 3 recomendações ultra-customizadas, acionáveis e realistas em formato JSON estruturado.'
      }

      Dados do Usuário:
      - Nome: ${userName || "Cristiano"}
      - Competência Selecionada: ${activeMonth || "2026-08"}

      Saldos e Contas:
      ${JSON.stringify(accounts || [], null, 2)}

      Cartões de Crédito:
      ${JSON.stringify(cards || [], null, 2)}

      Lançamentos deste Mês:
      ${JSON.stringify(transactions || [], null, 2)}

      Metas de Poupança:
      ${JSON.stringify(goals || [], null, 2)}

      Assinaturas / SaaS Ativos:
      ${JSON.stringify(subscriptions || [], null, 2)}

      Portfólio de Investimentos:
      ${JSON.stringify(investments || [], null, 2)}

      Com base nesses dados, faça uma análise profissional.
      Você deve retornar exatamente no esquema JSON abaixo. Não escreva textos explicativos antes ou depois. Retorne apenas o JSON puro válido.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contextPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["score", "summary", "recommendations", "alerts", "forecast"],
          properties: {
            score: {
              type: Type.INTEGER,
              description: "Score de saúde financeira de 0 a 100 com base em gastos, receitas e investimentos."
            },
            summary: {
              type: Type.STRING,
              description: "Resumo executivo de uma única frase sobre a situação atual."
            },
            recommendations: {
              type: Type.ARRAY,
              description: "Lista de 3 recomendações práticas ordenadas por prioridade.",
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "priority", "impactValue"],
                properties: {
                  title: { type: Type.STRING, description: "Título curto da recomendação" },
                  description: { type: Type.STRING, description: "Descrição detalhada da ação" },
                  priority: { type: Type.STRING, description: "HIGH, MEDIUM, ou LOW" },
                  impactValue: { type: Type.STRING, description: "Estimativa de impacto financeiro, ex: 'Economia de R$ 150/mês' ou 'Rendimento +R$ 300/ano'" }
                }
              }
            },
            alerts: {
              type: Type.ARRAY,
              description: "Alertas inteligentes e detecção de anomalias (ex: assinatura duplicada, compras excessivas, contas vencendo)",
              items: {
                type: Type.OBJECT,
                required: ["type", "message", "severity"],
                properties: {
                  type: { type: Type.STRING, description: "CATEGORIA, ASSINATURA, VENCIMENTO ou CAIXA" },
                  message: { type: Type.STRING, description: "Texto claro descrevendo o alerta financeiro." },
                  severity: { type: Type.STRING, description: "HIGH, WARNING, ou INFO" }
                }
              }
            },
            forecast: {
              type: Type.OBJECT,
              required: ["nextMonthBalance", "savingsRate", "safetyMarginMonths"],
              properties: {
                nextMonthBalance: { type: Type.NUMBER, description: "Previsão realista do saldo para o próximo mês." },
                savingsRate: { type: Type.INTEGER, description: "Taxa percentual de economia prevista." },
                safetyMarginMonths: { type: Type.NUMBER, description: "Margem de segurança em meses com base nas despesas atuais e reserva acumulada." }
              }
            }
          }
        }
      }
    });

    const outputText = response.text || "{}";
    res.json(JSON.parse(outputText.trim()));
  } catch (error: any) {
    console.error("Gemini server endpoint error:", error);
    res.status(500).json({ 
      error: "Falha na análise inteligente do Coach IA", 
      details: error.message || String(error)
    });
  }
});

// 2. Vite middleware injection or static file server based on environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In development mode, load Vite server
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve compiled build assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Finanças Pro Server] Running on http://localhost:${PORT} [ENV: ${process.env.NODE_ENV || "development"}]`);
  });
}

startServer();
