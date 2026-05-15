import './telemetry.js';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import logger from './logger.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Log every request
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]('HTTP request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: Date.now() - start,
    });
  });
  next();
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/enhance', async (req, res) => {
  const tracer = trace.getTracer('ai-notes-backend');

  return tracer.startActiveSpan('groq.enhance', async (span) => {
    try {
      const { text } = req.body;

      if (!text) {
        logger.warn('Missing text in request body');
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Missing text' });
        span.end();
        return res.status(400).json({ error: 'Текст не надано' });
      }

      span.setAttribute('ai.input.length', text.length);
      logger.info('AI enhance started', { textLength: text.length });

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Ти професійний редактор. Твоє завдання - виправити граматичні помилки, покращити стиль та зробити текст більш лаконічним. Поверни ТІЛЬКИ покращений текст, без жодних твоїх коментарів, привітань чи пояснень.',
          },
          { role: 'user', content: text },
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
      });

      const enhancedText = chatCompletion.choices[0]?.message?.content || '';
      span.setAttribute('ai.output.length', enhancedText.length);
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();

      logger.info('AI enhance done', { inputLength: text.length, outputLength: enhancedText.length });
      return res.json({ enhancedText });

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.end();
      logger.error('AI enhance failed', { error: error.message });
      return res.status(500).json({ error: 'Щось пішло не так на сервері' });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});