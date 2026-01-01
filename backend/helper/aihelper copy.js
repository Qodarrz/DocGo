const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Instruksi global wajib
 * Semua respons AI HARUS berbahasa Indonesia
 */
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
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY wajib diatur pada environment variables");
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      // model: "gemini-2.5-flash"
      model: "gemini-2.5-flash-lite"
    });
  }

  /**
   * Membersihkan dan parsing JSON dari respons AI
   */
  cleanJSON(text) {
    try {
      return JSON.parse(
        text
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim()
      );
    } catch (error) {
      console.error("Gagal parsing JSON dari AI:", text);
      throw new Error("Format respons AI tidak valid");
    }
  }

  /**
   * Panggilan utama ke Gemini API
   */
  async callGemini(prompt, temperature = 0.1) {
    try {
      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${INDONESIAN_ONLY_INSTRUCTION}\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature
        }
      });

      return result.response.text();
    } catch (error) {
      console.error("Kesalahan Gemini API:", error);
      throw new Error("Layanan AI tidak tersedia");
    }
  }

  /**
   * Ekstraksi gejala dari teks keluhan pengguna
   */
  async extractSymptoms(text) {
    const prompt = `
Ekstrak gejala dari keluhan kesehatan berikut.

Kembalikan HANYA JSON valid dengan struktur:
{
  "symptoms": ["gejala1", "gejala2"],
  "durationDays": number,
  "severityHint": "mild|moderate|severe",
  "factors": ["faktor1", "faktor2"],
  "notes": "string"
}

Keluhan pengguna:
"""${text}"""
`;

    const response = await this.callGemini(prompt);
    return this.cleanJSON(response);
  }

  /**
   * Klasifikasi dan analisis triase medis
   */
  async classifySymptoms(symptoms, durationDays, userContext) {
    const prompt = `
Anda adalah asisten medis bernama DocGo.

Analisis triase medis berdasarkan data berikut.

KONTEKS PASIEN:
- Usia: ${userContext.age || "Tidak disebutkan"}
- Jenis Kelamin: ${userContext.gender || "Tidak disebutkan"}
- Penyakit Penyerta: ${userContext.conditions?.join(", ") || "Tidak ada"}
- Alergi: ${userContext.allergies?.join(", ") || "Tidak ada"}

GEJALA: ${JSON.stringify(symptoms)}
DURASI: ${durationDays || 1} hari

Kembalikan HANYA JSON valid dengan struktur:
{
  "triageLevel": "LOW|MEDIUM|HIGH|EMERGENCY",
  "riskLevel": "LOW|MODERATE|HIGH",
  "confidence": 0.0-1.0,
  "likelyConditions": [
    { "condition": "nama kondisi", "probability": 0.0-1.0 }
  ],
  "immediateAction": "string",
  "recommendedSpecialist": ["nama spesialis"],
  "warningSigns": ["tanda bahaya"],
  "homeCareAdvice": ["saran perawatan"],
  "followUpTiming": "ASAP|WITHIN_24H|WITHIN_48H|WITHIN_1WEEK|MONITOR_ONLY",
  "shouldSeeDoctor": true/false
}
`;
    const response = await this.callGemini(prompt);
    const analysis = this.cleanJSON(response);

    /**
     * Override darurat jika ditemukan gejala kritis
     */
    const EMERGENCY_SYMPTOMS = [
      "nyeri dada",
      "sesak napas",
      "pingsan",
      "kejang",
      "lumpuh",
      "perdarahan hebat",
      "trauma kepala"
    ];

    const hasEmergency = symptoms.some(symptom =>
      EMERGENCY_SYMPTOMS.some(emergency =>
        symptom.toLowerCase().includes(emergency)
      )
    );

    if (hasEmergency) {
      analysis.triageLevel = "EMERGENCY";
      analysis.riskLevel = "HIGH";
      analysis.immediateAction =
        "Segera menuju IGD terdekat atau hubungi layanan darurat medis (118).";
      analysis.shouldSeeDoctor = true;
      analysis.followUpTiming = "ASAP";
    }

    return analysis;
  }

  /**
   * Hitung usia dari tanggal lahir
   */
  calculateAge(birthDate) {
    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }
}

module.exports = new AIHelper();
