import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { CreateEmbeddingResponse } from "openai/resources/embeddings.mjs";
import { z } from "zod";

export async function getEmbedding(query: string): Promise<number[]> {
  const embedding: CreateEmbeddingResponse =
    await openai_client.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      encoding_format: "float",
    });
  return embedding.data[0].embedding;
}

export const openai_client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIWithHistory {
  private messageHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  private textClient: OpenAI;
  private betaClient: OpenAI;

  constructor() {
    this.textClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.betaClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async *sendTextMessage(
    systemPrompt: string,
    content: string,
    addToHistory: boolean = true,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): AsyncGenerator<string, string, unknown> {
    if (addToHistory) {
      this.addToHistory({ role: "user", content });
    }

    const stream = await this.textClient.chat.completions.create({
      model: options.model || "gpt-4o-mini",
      messages: [
        ...this.messageHistory,
        { role: "system", content: systemPrompt },
        { role: "user", content },
      ],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        const content = chunk.choices[0].delta.content;
        fullResponse += content;
        yield content;
      }
    }

    if (addToHistory) {
      this.addToHistory({
        role: "assistant",
        content: fullResponse,
      });
    }

    return fullResponse;
  }

  async sendParsedMessage<T>(
    systemPrompt: string,
    content: string,
    zodSchema: z.ZodType<T>,
    addToHistory: boolean = true,
    options: {
      model?: (string & {}) | OpenAI.Chat.ChatModel;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<T> {
    if (addToHistory) {
      this.addToHistory({ role: "user", content });
    }

    const response = await this.betaClient.beta.chat.completions.parse({
      model: options.model || "gpt-4o-mini",
      messages: [
        ...this.messageHistory,
        { role: "system", content: systemPrompt },
        { role: "user", content },
      ],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      response_format: zodResponseFormat(zodSchema, "structured_query"),
    });

    const parsedContent: T | null = response.choices[0].message.parsed;
    if (parsedContent) {
      if (addToHistory) {
        this.addToHistory({
          role: "assistant",
          content: JSON.stringify(parsedContent),
        });
      }
      return parsedContent;
    }

    throw new Error("No response from OpenAI");
  }

  addMultipleToHistory(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
    this.messageHistory.push(...messages);
  }

  addToHistory(message: OpenAI.Chat.ChatCompletionMessageParam) {
    this.messageHistory.push(message);
  }

  getHistory() {
    return this.messageHistory;
  }
}
