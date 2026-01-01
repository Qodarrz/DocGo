const symptomService = require("../service/Symptom");
const SymptomValidator = require("../helper/validators");
const { notifyUser } = require("../helper/notif");

class SymptomController {
  // ANALYZE SYMPTOMS
  async analyze(req, res) {
    try {
      const { text } = req.body;
      const userId = req.user.id;
      const medicalUser = req.medicalUser;

      // Validate request body
      if (!text) {
        return res.status(400).json({
          success: false,
          error: "Deskripsi gejala diperlukan",
          field: "text",
        });
      }

      // Detailed validation
      const validation = SymptomValidator.validateComplaint(text);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
          field: "text",
          minLength: 5,
          maxLength: 1000,
        });
      }

      console.log(`[Controller] Analyzing symptoms for user ${userId}`);

      const result = await symptomService.analyzeSymptoms({
        userId,
        text: validation.data,
        medicalUser,
      });
      
      await notifyUser({
        userId: userId,
        event: "GEJALA_DIANALISA",
      });

      return res.json({
        success: true,
        message: "Analisis gejala berhasil",
        data: result.data,
        metadata: {
          symptomsCount: result.data.symptoms.length,
          timestamp: new Date().toISOString(),
        },
        ...(process.env.NODE_ENV === "development" && {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
          debug: result.fullAnalysis,
        }),
      });
    } catch (error) {
      console.error("[Controller] Analyze error:", error.message);

      const statusCode = error.message.includes("tidak ditemukan") ? 404 : 500;

      return res.status(statusCode).json({
        success: false,
        error: error.message || "Gagal menganalisis gejala",
        suggestion: "Periksa deskripsi gejala dan coba lagi",
      });
    }
  }

  // GET HISTORY
  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit, page } = req.query;

      // Validate limit parameter
      const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
      const parsedPage = Math.max(parseInt(page) || 1, 1);

      const result = await symptomService.getHistory(userId, parsedLimit);

      res.json({
        success: true,
        message: "Riwayat gejala berhasil diambil",
        data: result.data,
        pagination: {
          currentPage: parsedPage,
          limit: parsedLimit,
          total: result.count,
          hasMore: result.hasMore,
        },
        metadata: {
          retrievedAt: new Date().toISOString(),
          period: "all",
        },
      });
    } catch (error) {
      console.error("[Controller] Get history error:", error.message);

      res.status(500).json({
        success: false,
        error: error.message || "Gagal mengambil riwayat gejala",
        code: "HISTORY_FETCH_ERROR",
      });
    }
  }

  // GET ANALYTICS
  async getAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const { days } = req.query;

      // Validate days parameter
      const parsedDays = Math.min(Math.max(parseInt(days) || 30, 1), 365);

      const result = await symptomService.getAnalytics(userId, parsedDays);

      res.json({
        success: true,
        message: "Analitik gejala berhasil diambil",
        data: result.data,
        metadata: {
          generatedAt: new Date().toISOString(),
          dataPoints: result.data.summary.totalChecks,
        },
      });
    } catch (error) {
      console.error("[Controller] Get analytics error:", error.message);

      res.status(500).json({
        success: false,
        error: error.message || "Gagal mengambil analitik gejala",
        code: "ANALYTICS_FETCH_ERROR",
      });
    }
  }

  // GET SINGLE RECORD
  async getRecord(req, res) {
    try {
      const userId = req.user.id;
      const { recordId } = req.params;

      if (!recordId) {
        return res.status(400).json({
          success: false,
          error: "Record ID diperlukan",
          field: "recordId",
        });
      }

      const result = await symptomService.getRecord(userId, recordId);

      res.json({
        success: true,
        message: "Data gejala berhasil diambil",
        data: result.data,
        metadata: {
          retrievedAt: new Date().toISOString(),
          recordAge: result.data.timeSince,
        },
      });
    } catch (error) {
      console.error("[Controller] Get record error:", error.message);

      if (error.message.includes("tidak ditemukan")) {
        return res.status(404).json({
          success: false,
          error: "Data gejala tidak ditemukan",
          code: "RECORD_NOT_FOUND",
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || "Gagal mengambil data gejala",
        code: "RECORD_FETCH_ERROR",
      });
    }
  }

  async trackManual(req, res) {
    try {
      const userId = req.user.id;
      const { symptom, severity, durationDays, notes } = req.body;

      if (!symptom || !severity) {
        return res.status(400).json({
          success: false,
          error: "Symptom dan severity diperlukan",
          fields: ["symptom", "severity"],
          example: {
            symptom: "Demam",
            severity: "SEDANG",
            durationDays: 2,
            notes: "Demam disertai menggigil",
          },
        });
      }

      const result = await symptomService.trackSymptom(userId, {
        symptom,
        severity,
        durationDays,
        notes,
      });

      res.status(201).json({
        success: true,
        message: result.message || "Gejala berhasil dicatat",
        data: result.data,
        metadata: {
          recordedAt: new Date().toISOString(),
          trackingType: "manual",
        },
      });
    } catch (error) {
      console.error("[Controller] Track manual error:", error.message);

      if (error.message.includes("Invalid")) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: "VALIDATION_ERROR",
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || "Gagal mencatat gejala",
        code: "TRACKING_ERROR",
      });
    }
  }

  async emergencyCheck(req, res) {
    try {
      const { symptoms } = req.body;
      const userId = req.user.id;

      const validation = SymptomValidator.validateSymptomsArray(symptoms);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
          field: "symptoms",
          example: ["nyeri dada", "sesak napas", "pusing"],
        });
      }

      const EMERGENCY_SYMPTOMS = {
        critical: [
          "nyeri dada",
          "sesak napas",
          "pingsan",
          "kejang",
          "lumpuh",
          "perdarahan hebat",
          "trauma kepala",
          "tidak sadarkan diri",
        ],
        urgent: [
          "demam tinggi",
          "muntah terus",
          "diare parah",
          "nyeri perut hebat",
          "sakit kepala hebat",
        ],
      };

      const normalizedSymptoms = validation.data.map((s) => s.toLowerCase());

      let emergencyLevel = "NORMAL";
      let hasCritical = false;
      let hasUrgent = false;

      normalizedSymptoms.forEach((symptom) => {
        if (
          EMERGENCY_SYMPTOMS.critical.some((emergency) =>
            symptom.includes(emergency)
          )
        ) {
          hasCritical = true;
        }
        if (
          EMERGENCY_SYMPTOMS.urgent.some((emergency) =>
            symptom.includes(emergency)
          )
        ) {
          hasUrgent = true;
        }
      });

      let response;
      if (hasCritical) {
        emergencyLevel = "CRITICAL";
        response = {
          isEmergency: true,
          level: "CRITICAL",
          action: "🚨 SEGERA KE IGD TERDEKAT atau telepon 118/119!",
          instructions: [
            "Jangan mengemudi sendiri",
            "Hubungi ambulans (118/119)",
            "Bawa dokumen medis penting",
            "Temani pasien jangan ditinggal",
          ],
          shouldCallAmbulance: true,
          timestamp: new Date().toISOString(),
        };
      } else if (hasUrgent) {
        emergencyLevel = "URGENT";
        response = {
          isEmergency: true,
          level: "URGENT",
          action: "Segera kunjungi dokter atau klinik 24 jam",
          instructions: [
            "Kunjungi fasilitas kesehatan terdekat",
            "Hindari konsumsi makanan/minuman",
            "Catat perkembangan gejala",
            "Siapkan informasi medis",
          ],
          shouldCallAmbulance: false,
          timestamp: new Date().toISOString(),
        };
      } else {
        response = {
          isEmergency: false,
          level: "NORMAL",
          action: "Monitor gejala Anda",
          instructions: [
            "Catat perkembangan gejala",
            "Minum air putih yang cukup",
            "Istirahat yang cukup",
            "Hubungi dokter jika memburuk",
          ],
          shouldCallAmbulance: false,
          timestamp: new Date().toISOString(),
        };
      }

      if (hasCritical || hasUrgent) {
        await prisma.symptomCheck.create({
          data: {
            userId,
            complaint: `EMERGENCY CHECK - Level: ${emergencyLevel}`,
            symptoms: validation.data,
            triageLevel: hasCritical ? "EMERGENCY" : "HIGH",
            riskLevel: "HIGH",
            immediateAction: response.action,
            shouldSeeDoctor: true,
            followUpTiming: "ASAP",
            aiModelUsed: "emergency_check",
          },
        });
      }

      res.json({
        success: true,
        data: response,
        message: "Emergency check completed",
        metadata: {
          symptomsChecked: validation.count,
          emergencyLevel,
          responseTime: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("[Controller] Emergency check error:", error.message);

      res.status(500).json({
        success: false,
        error: error.message || "Gagal melakukan emergency check",
        code: "EMERGENCY_CHECK_ERROR",
      });
    }
  }

  async getDoctorRecommendations(req, res) {
    try {
      const { symptoms } = req.body;

      const validation = SymptomValidator.validateSymptomsArray(symptoms);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
          field: "symptoms",
        });
      }

      const symptomToSpecialist = {
        demam: ["Dokter Umum", "Penyakit Dalam"],
        batuk: ["Dokter Umum", "Pulmonologi", "THT"],
        pilek: ["Dokter Umum", "THT"],
        pusing: ["Dokter Umum", "Neurologi", "Penyakit Dalam"],
        lemas: ["Dokter Umum", "Penyakit Dalam"],

        "nyeri dada": ["Kardiologi", "IGD", "Dokter Umum"],
        "sesak napas": ["Pulmonologi", "IGD", "Dokter Umum"],

        "sakit kepala": ["Neurologi", "Dokter Umum"],
        "nyeri perut": ["Penyakit Dalam", "Bedah", "Dokter Umum"],
        mual: ["Penyakit Dalam", "Dokter Umum"],
        diare: ["Penyakit Dalam", "Dokter Umum"],
        "sakit tenggorokan": ["THT", "Dokter Umum"],

        "nyeri sendi": ["Reumatologi", "Orthopedi", "Dokter Umum"],
        "sakit punggung": ["Orthopedi", "Neurologi", "Dokter Umum"],

        ruam: ["Dermatologi", "Dokter Umum"],
        gatal: ["Dermatologi", "Dokter Umum"],

        cemas: ["Psikiater", "Psikolog", "Dokter Umum"],
        stres: ["Psikiater", "Psikolog", "Dokter Umum"],
      };

      const specialists = new Set();
      const matchedSymptoms = [];

      validation.data.forEach((symptom) => {
        const symptomLower = symptom.toLowerCase();

        Object.entries(symptomToSpecialist).forEach(([key, specList]) => {
          if (symptomLower.includes(key)) {
            specList.forEach((s) => specialists.add(s));
            matchedSymptoms.push(key);
          }
        });
      });

      if (specialists.size === 0) {
        specialists.add("Dokter Umum");
      }

      let urgency = "ROUTINE";
      const urgentKeywords = ["nyeri dada", "sesak napas", "pingsan", "kejang"];

      if (matchedSymptoms.some((s) => urgentKeywords.includes(s))) {
        urgency = "URGENT";
      }

      res.json({
        success: true,
        data: {
          symptoms: validation.data,
          matchedSymptoms: [...new Set(matchedSymptoms)],
          recommendedSpecialists: Array.from(specialists),
          urgency,
          recommendation: this.getRecommendationText(
            urgency,
            Array.from(specialists)
          ),
          metadata: {
            symptomsCount: validation.count,
            specialistsCount: specialists.size,
            generatedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error(
        "[Controller] Doctor recommendations error:",
        error.message
      );

      res.status(500).json({
        success: false,
        error: error.message || "Gagal mendapatkan rekomendasi dokter",
        code: "RECOMMENDATION_ERROR",
      });
    }
  }

  getRecommendationText(urgency, specialists) {
    const baseText = `Konsultasikan dengan ${specialists.join(" atau ")}`;

    const urgencyTexts = {
      URGENT: `${baseText} segera. Gejala yang dialami memerlukan penanganan cepat.`,
      ROUTINE: `${baseText}. Buat janji temu sesuai ketersediaan.`,
    };

    return urgencyTexts[urgency] || baseText;
  }
}

module.exports = new SymptomController();
