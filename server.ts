import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// API route for AI financial assistant
app.post('/api/ai-chat', async (req: Request, res: Response) => {
  try {
    const { message, allowance, currency, expenses, summary } = req.body;

    // Build context summary for the AI
    const currencySymbol = currency?.symbol && currency.symbol !== '₨' ? currency.symbol : 'Rs.';
    const currencyCode = currency?.code || 'NPR';
    const totalSpent = summary?.totalSpent || 0;
    const remaining = summary?.remaining || 0;
    const percentSpent = summary?.percentageSpent || 0;
    const daysLeft = summary?.daysLeftInMonth || 15;
    const categoryTotals = summary?.categoryTotals || {};

    const expenseListStr = Array.isArray(expenses) && expenses.length > 0
      ? expenses.slice(0, 30).map((e: any) => `- ${e.date}: ${e.name} (${e.category}) - ${currencySymbol}${e.amount}`).join('\n')
      : 'No expenses recorded yet.';

    const systemPrompt = `You are a friendly, encouraging, and highly practical personal financial advisor embedded in the "Allowance Planner" app.
The user is managing their personal monthly allowance in ${currencyCode} (${currencySymbol}).

CURRENT BUDGET CONTEXT:
- Monthly Allowance: ${currencySymbol}${allowance || 0} ${currencyCode}
- Total Spent So Far: ${currencySymbol}${totalSpent} (${percentSpent.toFixed(1)}% of allowance)
- Remaining Balance: ${currencySymbol}${remaining}
- Days Remaining in Current Month: ${daysLeft} days
- Spending by Category:
${Object.entries(categoryTotals).map(([cat, amt]) => `  * ${cat}: ${currencySymbol}${amt} (${totalSpent > 0 ? ((Number(amt) / totalSpent) * 100).toFixed(1) : 0}%)`).join('\n') || '  * None'}

RECENT EXPENSES:
${expenseListStr}

YOUR INSTRUCTIONS:
1. Provide short, friendly, practical, and highly actionable advice.
2. Address the user's specific prompt or question directly.
3. If they ask about overspending, pinpoint the highest category and suggest tangible cuts.
4. If they ask for budget splits, explain how the 50/30/20 rule (50% Needs, 30% Wants, 20% Savings) applies to their specific ${currencySymbol}${allowance || 0} allowance with exact numbers.
5. If they ask how to save more, offer 3-4 concrete everyday tips relevant to students or young adults (e.g. food prep, student discounts, entertainment sharing).
6. If they ask about pace, calculate if their current daily spend rate (${currencySymbol}${daysLeft > 0 && totalSpent > 0 ? (totalSpent / (30 - daysLeft || 1)).toFixed(0) : 0}/day) will exhaust their balance before the month ends.
7. Use bullet points and clear formatting. Keep the tone warm, empowering, and realistic.`;

    // 1. Check if Anthropic API key is provided
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicApiKey) {
      try {
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-7-sonnet-20250219',
            max_tokens: 1000,
            system: systemPrompt,
            messages: [{ role: 'user', content: message }],
          }),
        });

        if (anthropicRes.ok) {
          const anthropicData = (await anthropicRes.json()) as any;
          const reply = anthropicData?.content?.[0]?.text;
          if (reply) {
            return res.json({ reply, provider: 'claude' });
          }
        }
      } catch (anthropicErr) {
        console.warn('Anthropic API attempt failed, falling back to Gemini:', anthropicErr);
      }
    }

    // 2. Use Gemini API via @google/genai
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nUSER QUESTION/REQUEST: ${message}`,
              },
            ],
          },
        ],
      });

      const reply = response.text;
      if (reply) {
        return res.json({ reply, provider: 'gemini' });
      }
    }

    // 3. Fallback: if no API keys are configured, return intelligent rule-based response
    return res.json({
      reply: null,
      fallbackNeeded: true,
    });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return res.status(500).json({
      error: 'Failed to generate financial advice. Using local analysis.',
      fallbackNeeded: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Allowance Planner server running on http://0.0.0.0:${port}`);
  });
}

startServer();
