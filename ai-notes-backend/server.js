import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

// Завантажуємо змінні з файлу .env
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Ініціалізуємо клієнт Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/enhance', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: "Текст не надано" });
        }

        console.log("Отримано текст для покращення:", text);

        // Звертаємося до Groq (модель Llama 3)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Ти професійний редактор. Твоє завдання - виправити граматичні помилки, покращити стиль та зробити текст більш лаконічним. Поверни ТІЛЬКИ покращений текст, без жодних твоїх коментарів, привітань чи пояснень."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            model: "llama-3.1-8b-instant", // Одна з найшвидших моделей
            temperature: 0.5,
        });

        const enhancedText = chatCompletion.choices[0]?.message?.content || "";

        res.json({ enhancedText });

    } catch (error) {
        console.error("Помилка AI:", error);
        res.status(500).json({ error: "Щось пішло не так на сервері" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер успішно запущено на порту ${PORT} (Groq API)`);
});