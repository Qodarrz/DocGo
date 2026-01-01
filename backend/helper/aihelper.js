const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const INDONESIAN_ONLY_INSTRUCTION = `
PENTING:
- Gunakan HANYA bahasa Indonesia.
- DILARANG menggunakan bahasa Inggris.
- Gunakan istilah medis yang lazim digunakan di Indonesia.
- Jawaban harus profesional, jelas, dan ringkas.
- Output HARUS berupa JSON valid tanpa teks tambahan apa pun.
`;

class AIHelper {
  constructor() {
    this.provider = process.env.AI_PROVIDER || "gemini";

    if (this.provider === "gemini") {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY wajib diatur");
      }

      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });
    }

    if (this.provider === "openrouter") {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY wajib diatur");
      }

      this.openRouterClient = axios.create({
        baseURL: "https://openrouter.ai/api/v1",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      this.openRouterModel =
        process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat";
    }

    console.log(`[AIHelper] Using AI provider: ${this.provider}`);
  }

  cleanJSON(text) {
    try {
      return JSON.parse(
        text
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim()
      );
    } catch {
      throw new Error("Format respons AI tidak valid");
    }
  }

  async callGemini(prompt, temperature = 0.1) {
    const result = await this.model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${INDONESIAN_ONLY_INSTRUCTION}\n${prompt}` }],
        },
      ],
      generationConfig: { temperature },
    });

    return result.response.text();
  }

  async callOpenRouter(prompt, temperature = 0.1) {
    const response = await this.openRouterClient.post("/chat/completions", {
      model: this.openRouterModel,
      messages: [
        {
          role: "system",
          content: INDONESIAN_ONLY_INSTRUCTION,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
    });

    return response.data.choices[0].message.content;
  }

  async callAI(prompt, temperature = 0.1) {
    try {
      if (this.provider === "openrouter") {
        return await this.callOpenRouter(prompt, temperature);
      }

      return await this.callGemini(prompt, temperature);
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error("AI_RATE_LIMIT_EXCEEDED");
      }

      throw new Error("Layanan AI tidak tersedia");
    }
  }

  async extractSymptoms(text) {
    const prompt = `
Ekstrak gejala dari keluhan kesehatan berikut.

Kembalikan HANYA JSON valid dengan struktur:
{
  "symptoms": ["gejala1"],
  "durationDays": number,
  "severityHint": "mild|moderate|severe",
  "factors": [],
  "notes": ""
}

Keluhan:
"""${text}"""
`;

    const response = await this.callAI(prompt);
    return this.cleanJSON(response);
  }

  async classifySymptoms(symptoms, durationDays, userContext) {
    const prompt = `
Anda adalah asisten medis bernama DocGo.

KONTEKS:
- Usia: ${userContext.age || "-"}
- Jenis Kelamin: ${userContext.gender || "-"}
- Penyakit: ${userContext.conditions?.join(", ") || "-"}

GEJALA: ${JSON.stringify(symptoms)}
DURASI: ${durationDays || 1} hari

Kembalikan JSON valid sesuai skema triase medis.
`;

    const response = await this.callAI(prompt);
    return this.cleanJSON(response);
  }

  calculateAge(birthDate) {
    if (!birthDate) return null;
    const now = new Date();
    const dob = new Date(birthDate);
    let age = now.getFullYear() - dob.getFullYear();
    if (
      now.getMonth() < dob.getMonth() ||
      (now.getMonth() === dob.getMonth() &&
        now.getDate() < dob.getDate())
    ) {
      age--;
    }
    return age;
  }
}

module.exports = new AIHelper();
