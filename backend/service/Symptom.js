const aiHelper = require("../helper/aihelper");
const prisma = require("../db/prisma");
const SymptomValidator = require("../helper/validators");
const SymptomNormalizer = require("../helper/normalizers");

class SymptomService {
  async analyzeSymptoms({ userId, text, medicalUser }) {
    try {
      console.log(`[SymptomService] Analyzing for user ${userId}`);

      const validation = SymptomValidator.validateComplaint(text);
      if (!validation.valid) {
        throw new Error(`Invalid complaint: ${validation.error}`);
      }

      const userIdValidation = SymptomValidator.validateUserId(userId);
      if (!userIdValidation.valid) {
        throw new Error(`Invalid user ID: ${userIdValidation.error}`);
      }

      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!userExists) {
        throw new Error(`User ${userId} not found`);
      }

      console.log(`[SymptomService] Extracting symptoms from text`);
      const extracted = await aiHelper.extractSymptoms(text);

      if (!extracted?.symptoms || !Array.isArray(extracted.symptoms)) {
        throw new Error("AI extraction failed to return symptoms array");
      }

      const symptomsValidation = SymptomValidator.validateSymptomsArray(
        extracted.symptoms
      );
      if (!symptomsValidation.valid) {
        throw new Error(
          `Extracted symptoms invalid: ${symptomsValidation.error}`
        );
      }

      const userContext = {
        age: medicalUser.dateOfBirth
          ? aiHelper.calculateAge(medicalUser.dateOfBirth)
          : null,
        gender: medicalUser.gender || null,
        height: medicalUser.medicalProfile?.heightCm || null,
        weight: medicalUser.medicalProfile?.weightKg || null,
        bloodType: medicalUser.medicalProfile?.bloodType || null,
        conditions: SymptomNormalizer.normalizeJsonArray(
          medicalUser.medicalProfile?.conditions,
          "conditions"
        ),
        allergies: SymptomNormalizer.normalizeJsonArray(
          medicalUser.medicalProfile?.allergies,
          "allergies"
        ),
        medications: SymptomNormalizer.normalizeJsonArray(
          medicalUser.medicalProfile?.medications,
          "medications"
        ),
        timestamp: new Date().toISOString(),
      };

      console.log(
        `[SymptomService] Classifying ${symptomsValidation.count} symptoms`
      );
      const analysis = await aiHelper.classifySymptoms(
        symptomsValidation.data,
        extracted.durationDays,
        userContext
      );

      if (!analysis || typeof analysis !== "object") {
        throw new Error("AI analysis returned invalid response");
      }

      const normalizedAnalysis = {
        triageLevel: SymptomNormalizer.normalizeEnum(
          analysis.triageLevel,
          ["LOW", "MEDIUM", "HIGH", "EMERGENCY"],
          "LOW",
          "triageLevel"
        ),
        riskLevel: SymptomNormalizer.normalizeEnum(
          analysis.riskLevel,
          ["LOW", "MODERATE", "HIGH"],
          "LOW",
          "riskLevel"
        ),
        confidence: SymptomNormalizer.normalizeConfidence(analysis.confidence),
        likelyConditions: SymptomNormalizer.normalizeJsonArray(
          analysis.likelyConditions,
          "likelyConditions"
        ).slice(0, 5), // Limit to 5 conditions
        immediateAction: analysis.immediateAction
          ? String(analysis.immediateAction).substring(0, 500)
          : null,
        recommendedSpecialist: SymptomNormalizer.normalizeJsonArray(
          analysis.recommendedSpecialist,
          "recommendedSpecialist"
        ).slice(0, 3), // Limit to 3 specialists
        warningSigns: SymptomNormalizer.normalizeJsonArray(
          analysis.warningSigns,
          "warningSigns"
        ).slice(0, 10), // Limit to 10 warning signs
        homeCareAdvice: SymptomNormalizer.normalizeJsonArray(
          analysis.homeCareAdvice,
          "homeCareAdvice"
        ).slice(0, 8), // Limit to 8 advice items
        followUpTiming: SymptomNormalizer.normalizeEnum(
          analysis.followUpTiming,
          ["ASAP", "WITHIN_24H", "WITHIN_48H", "WITHIN_1WEEK", "MONITOR_ONLY"],
          "MONITOR_ONLY",
          "followUpTiming"
        ),
        shouldSeeDoctor: Boolean(analysis.shouldSeeDoctor),
      };

      // 7. VALIDATE REQUIRED FIELDS
      if (!normalizedAnalysis.triageLevel) {
        throw new Error("Triage level is required");
      }

      // 8. PERSIST TO DATABASE
      console.log(`[SymptomService] Creating symptom check record`);
      const symptomRecord = await prisma.symptomCheck.create({
        data: {
          userId,
          complaint: validation.data.substring(0, 1000), // Ensure within DB limit
          symptoms: symptomsValidation.data,
          durationDays: SymptomNormalizer.normalizeDuration(
            extracted.durationDays
          ),
          severityHint: SymptomNormalizer.normalizeSeverity(
            extracted.severityHint
          ),

          // AI Analysis
          triageLevel: normalizedAnalysis.triageLevel,
          riskLevel: normalizedAnalysis.riskLevel,
          confidence: normalizedAnalysis.confidence,

          // Detailed Analysis
          likelyConditions: normalizedAnalysis.likelyConditions,
          immediateAction: normalizedAnalysis.immediateAction,
          recommendedSpecialist: normalizedAnalysis.recommendedSpecialist,
          warningSigns: normalizedAnalysis.warningSigns,
          homeCareAdvice: normalizedAnalysis.homeCareAdvice,
          followUpTiming: normalizedAnalysis.followUpTiming,
          shouldSeeDoctor: normalizedAnalysis.shouldSeeDoctor,

          aiModelUsed: "gemini-2.5-flash",
        },
      });

      // 9. EMERGENCY NOTIFICATION (if needed)
      if (
        symptomRecord.triageLevel === "HIGH" ||
        symptomRecord.triageLevel === "EMERGENCY"
      ) {
        console.log(
          `[SymptomService] Creating emergency notification for ${userId}`
        );

        await prisma.notification.create({
          data: {
            userId,
            type: "HEALTH_ALERT",
            title: `🚨 Peringatan Kesehatan: ${this.getTriageLabel(
              symptomRecord.triageLevel
            )}`,
            message: this.generateEmergencyMessage(symptomRecord),
            data: {
              symptomCheckId: symptomRecord.id,
              triageLevel: symptomRecord.triageLevel,
              immediateAction: symptomRecord.immediateAction,
              timestamp: new Date().toISOString(),
            },
            isRead: false,
            isActionable: true,
          },
        });
      }

      // 10. RETURN RESPONSE
      return {
        success: true,
        data: {
          recordId: symptomRecord.id,
          symptoms: symptomRecord.symptoms,
          severityHint: symptomRecord.severityHint,
          triageLevel: symptomRecord.triageLevel,
          triageLabel: this.getTriageLabel(symptomRecord.triageLevel),
          riskLevel: symptomRecord.riskLevel,
          immediateAction: symptomRecord.immediateAction,
          shouldSeeDoctor: symptomRecord.shouldSeeDoctor,
          followUpTiming: symptomRecord.followUpTiming,
          followUpLabel: this.getFollowUpLabel(symptomRecord.followUpTiming),
          createdAt: symptomRecord.createdAt,
        },
        fullAnalysis: normalizedAnalysis,
      };
    } catch (error) {
      console.error("[SymptomService] Analyze error:", error.message);

      // Log error to database for monitoring
      await this.logError(userId, error, { action: "analyzeSymptoms" });

      throw new Error(`Failed to analyze symptoms: ${error.message}`);
    }
  }

  /**
   * =========================
   * HELPER METHODS
   * =========================
   */
  getTriageLabel(triageLevel) {
    const labels = {
      LOW: "Rendah",
      MEDIUM: "Sedang",
      HIGH: "Tinggi",
      EMERGENCY: "Darurat",
    };
    return labels[triageLevel] || triageLevel;
  }

  getFollowUpLabel(followUpTiming) {
    const labels = {
      ASAP: "Segera",
      WITHIN_24H: "Dalam 24 jam",
      WITHIN_48H: "Dalam 48 jam",
      WITHIN_1WEEK: "Dalam 1 minggu",
      MONITOR_ONLY: "Pantau saja",
    };
    return labels[followUpTiming] || followUpTiming;
  }

  generateEmergencyMessage(record) {
    const baseMessage = "Kondisi memerlukan perhatian medis segera.";

    if (record.immediateAction) {
      return `${baseMessage} ${record.immediateAction}`;
    }

    const actions = {
      HIGH: "Segera hubungi dokter atau kunjungi klinik terdekat.",
      EMERGENCY: "🚨 SEGERA KE IGD TERDEKAT atau telepon 118/119!",
    };

    return `${baseMessage} ${
      actions[record.triageLevel] || "Segera konsultasikan dengan dokter."
    }`;
  }

  async logError(userId, error, context = {}) {
    try {
      await prisma.symptomCheck.create({
        data: {
          userId,
          complaint: `ERROR: ${context.action || "unknown"}`,
          symptoms: ["system_error"],
          triageLevel: "LOW",
          riskLevel: "LOW",
          immediateAction: "Contact support",
          shouldSeeDoctor: false,
          aiModelUsed: "error_logger",
          warningSigns: [`Error: ${error.message.substring(0, 200)}`],
        },
      });
    } catch (logError) {
      console.error("[SymptomService] Failed to log error:", logError);
    }
  }

  /**
   * =========================
   * HISTORY (ENHANCED)
   * =========================
   */
  async getHistory(userId, limit = 20) {
    try {
      // Validate input
      const userIdValidation = SymptomValidator.validateUserId(userId);
      if (!userIdValidation.valid) {
        throw new Error(`Invalid user ID: ${userIdValidation.error}`);
      }

      const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

      // Fetch history with pagination
      const history = await prisma.symptomCheck.findMany({
        where: {
          userId: userIdValidation.data,
          // Exclude error logs
          complaint: { not: { startsWith: "ERROR:" } },
        },
        orderBy: { createdAt: "desc" },
        take: parsedLimit,
        select: {
          id: true,
          complaint: true,
          symptoms: true,
          severityHint: true,
          durationDays: true,
          triageLevel: true,
          riskLevel: true,
          shouldSeeDoctor: true,
          immediateAction: true,
          followUpTiming: true,
          createdAt: true,
        },
      });

      // Format response
      const formattedHistory = history.map((record) => ({
        id: record.id,
        complaint:
          record.complaint.substring(0, 100) +
          (record.complaint.length > 100 ? "..." : ""),
        symptoms: Array.isArray(record.symptoms)
          ? record.symptoms.slice(0, 3)
          : [],
        severity: record.severityHint || "UNKNOWN",
        durationDays: record.durationDays,
        triageLevel: record.triageLevel,
        triageLabel: this.getTriageLabel(record.triageLevel),
        riskLevel: record.riskLevel,
        shouldSeeDoctor: record.shouldSeeDoctor,
        immediateAction: record.immediateAction
          ? record.immediateAction.substring(0, 80) +
            (record.immediateAction.length > 80 ? "..." : "")
          : null,
        followUpTiming: record.followUpTiming,
        followUpLabel: this.getFollowUpLabel(record.followUpTiming),
        createdAt: record.createdAt,
        dateFormatted: record.createdAt.toLocaleDateString("id-ID"),
      }));

      return {
        success: true,
        data: formattedHistory,
        count: formattedHistory.length,
        limit: parsedLimit,
        hasMore: formattedHistory.length === parsedLimit,
      };
    } catch (error) {
      console.error("[SymptomService] Get history error:", error.message);
      throw new Error(`Failed to get history: ${error.message}`);
    }
  }

  /**
   * =========================
   * ANALYTICS (ENHANCED)
   * =========================
   */
  async getAnalytics(userId, days = 30) {
    try {
      // Validate input
      const userIdValidation = SymptomValidator.validateUserId(userId);
      if (!userIdValidation.valid) {
        throw new Error(`Invalid user ID: ${userIdValidation.error}`);
      }

      const parsedDays = Math.min(Math.max(parseInt(days) || 30, 1), 365);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parsedDays);
      startDate.setHours(0, 0, 0, 0);

      // Fetch data with time range
      const checks = await prisma.symptomCheck.findMany({
        where: {
          userId: userIdValidation.data,
          createdAt: { gte: startDate },
          // Exclude error logs and manual tracking
          complaint: {
            not: {
              in: ["Manual symptom tracking", "EMERGENCY CHECK"],
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      if (checks.length === 0) {
        return {
          success: true,
          data: {
            period: `${parsedDays} hari`,
            totalChecks: 0,
            message: "Tidak ada data gejala dalam periode ini",
          },
        };
      }

      // Calculate statistics
      const stats = {
        totalChecks: checks.length,
        byTriageLevel: {},
        byRiskLevel: {},
        bySeverityHint: {},
        byFollowUpTiming: {},
        shouldSeeDoctorCount: 0,
        symptomFrequency: {},
        dailyCount: {},
        mostCommonSymptoms: [],
        triageTrend: [],
      };

      // Process each check
      checks.forEach((check, index) => {
        // Count by category
        stats.byTriageLevel[check.triageLevel] =
          (stats.byTriageLevel[check.triageLevel] || 0) + 1;

        stats.byRiskLevel[check.riskLevel] =
          (stats.byRiskLevel[check.riskLevel] || 0) + 1;

        if (check.severityHint) {
          stats.bySeverityHint[check.severityHint] =
            (stats.bySeverityHint[check.severityHint] || 0) + 1;
        }

        stats.byFollowUpTiming[check.followUpTiming] =
          (stats.byFollowUpTiming[check.followUpTiming] || 0) + 1;

        if (check.shouldSeeDoctor) stats.shouldSeeDoctorCount++;

        // Count symptoms
        if (Array.isArray(check.symptoms)) {
          check.symptoms.forEach((symptom) => {
            const normalized = symptom.trim().toLowerCase();
            stats.symptomFrequency[normalized] =
              (stats.symptomFrequency[normalized] || 0) + 1;
          });
        }

        // Daily count for chart
        const dateKey = check.createdAt.toISOString().split("T")[0];
        stats.dailyCount[dateKey] = (stats.dailyCount[dateKey] || 0) + 1;

        // Triage trend (last 10 checks)
        if (index >= checks.length - 10) {
          stats.triageTrend.push({
            date: check.createdAt,
            triageLevel: check.triageLevel,
            riskLevel: check.riskLevel,
          });
        }
      });

      // Calculate percentages
      const calculatePercentage = (count) =>
        parseFloat(((count / stats.totalChecks) * 100).toFixed(1));

      stats.byTriageLevelPercent = {};
      Object.keys(stats.byTriageLevel).forEach((key) => {
        stats.byTriageLevelPercent[key] = calculatePercentage(
          stats.byTriageLevel[key]
        );
      });

      stats.shouldSeeDoctorPercent = calculatePercentage(
        stats.shouldSeeDoctorCount
      );

      // Get top symptoms
      stats.mostCommonSymptoms = Object.entries(stats.symptomFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([symptom, count]) => ({
          symptom: this.capitalizeFirst(symptom),
          count,
          percentage: calculatePercentage(count),
        }));

      // Format daily count for chart
      stats.dailyChart = Object.entries(stats.dailyCount)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, count]) => ({ date, count }));

      // Summary insights
      stats.insights = this.generateInsights(stats);

      return {
        success: true,
        data: {
          period: `${parsedDays} hari`,
          dateRange: {
            start: startDate.toISOString().split("T")[0],
            end: new Date().toISOString().split("T")[0],
          },
          summary: {
            totalChecks: stats.totalChecks,
            averageChecksPerDay: parseFloat(
              (stats.totalChecks / parsedDays).toFixed(1)
            ),
            shouldSeeDoctorCount: stats.shouldSeeDoctorCount,
            shouldSeeDoctorPercent: stats.shouldSeeDoctorPercent,
          },
          distribution: {
            triageLevel: stats.byTriageLevel,
            triageLevelPercent: stats.byTriageLevelPercent,
            riskLevel: stats.byRiskLevel,
            severityHint: stats.bySeverityHint,
            followUpTiming: stats.byFollowUpTiming,
          },
          symptoms: {
            mostCommon: stats.mostCommonSymptoms,
            totalUniqueSymptoms: Object.keys(stats.symptomFrequency).length,
          },
          charts: {
            dailyCount: stats.dailyChart,
            triageTrend: stats.triageTrend,
          },
          insights: stats.insights,
        },
      };
    } catch (error) {
      console.error("[SymptomService] Get analytics error:", error.message);
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }

  /**
   * =========================
   * UTILITY METHODS
   * =========================
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  generateInsights(stats) {
    const insights = [];

    // High triage insight
    const highTriageCount =
      (stats.byTriageLevel["HIGH"] || 0) +
      (stats.byTriageLevel["EMERGENCY"] || 0);

    if (highTriageCount > 0) {
      insights.push({
        type: "warning",
        message: `${highTriageCount} gejala dengan tingkat prioritas tinggi ditemukan`,
      });
    }

    // Doctor visit insight
    if (stats.shouldSeeDoctorCount > 0) {
      insights.push({
        type: "recommendation",
        message: `${stats.shouldSeeDoctorCount} gejala direkomendasikan untuk diperiksakan ke dokter`,
      });
    }

    // Frequency insight
    if (stats.totalChecks > parsedDays * 0.7) {
      // More than 70% of days
      insights.push({
        type: "notice",
        message:
          "Gejala dilaporkan hampir setiap hari, pertimbangkan konsultasi rutin",
      });
    }

    // Most common symptom insight
    if (stats.mostCommonSymptoms.length > 0) {
      const topSymptom = stats.mostCommonSymptoms[0];
      if (topSymptom.percentage > 30) {
        // Appears in >30% of checks
        insights.push({
          type: "pattern",
          message: `"${topSymptom.symptom}" muncul dalam ${topSymptom.percentage}% laporan`,
        });
      }
    }

    return insights;
  }

  /**
   * =========================
   * SINGLE RECORD (ENHANCED)
   * =========================
   */
  async getRecord(userId, recordId) {
    try {
      // Validate inputs
      const userIdValidation = SymptomValidator.validateUserId(userId);
      if (!userIdValidation.valid) {
        throw new Error(`Invalid user ID: ${userIdValidation.error}`);
      }

      if (!recordId || typeof recordId !== "string") {
        throw new Error("Record ID harus berupa string");
      }

      // Fetch record with user verification
      const record = await prisma.symptomCheck.findFirst({
        where: {
          id: recordId,
          userId: userIdValidation.data,
        },
      });

      if (!record) {
        throw new Error("Record tidak ditemukan atau tidak memiliki akses");
      }

      // Format response
      const formattedRecord = {
        id: record.id,
        userId: record.userId,
        complaint: record.complaint,
        symptoms: Array.isArray(record.symptoms) ? record.symptoms : [],
        durationDays: record.durationDays,
        severityHint: record.severityHint,
        severityLabel: record.severityHint
          ? this.getSeverityLabel(record.severityHint)
          : "Tidak diketahui",

        // AI Analysis
        triageLevel: record.triageLevel,
        triageLabel: this.getTriageLabel(record.triageLevel),
        riskLevel: record.riskLevel,
        confidence: record.confidence
          ? `${Math.round(record.confidence * 100)}%`
          : null,

        // Detailed Analysis
        likelyConditions: Array.isArray(record.likelyConditions)
          ? record.likelyConditions
          : [],
        immediateAction: record.immediateAction,
        recommendedSpecialist: Array.isArray(record.recommendedSpecialist)
          ? record.recommendedSpecialist
          : [],
        warningSigns: Array.isArray(record.warningSigns)
          ? record.warningSigns
          : [],
        homeCareAdvice: Array.isArray(record.homeCareAdvice)
          ? record.homeCareAdvice
          : [],
        followUpTiming: record.followUpTiming,
        followUpLabel: this.getFollowUpLabel(record.followUpTiming),
        shouldSeeDoctor: record.shouldSeeDoctor,

        // Metadata
        aiModelUsed: record.aiModelUsed,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        timeSince: this.getTimeSince(record.createdAt),
      };

      return {
        success: true,
        data: formattedRecord,
      };
    } catch (error) {
      console.error("[SymptomService] Get record error:", error.message);
      throw new Error(`Failed to get record: ${error.message}`);
    }
  }

  getSeverityLabel(severity) {
    const labels = {
      MILD: "Ringan",
      MODERATE: "Sedang",
      SEVERE: "Parah",
    };
    return labels[severity] || severity;
  }

  getTimeSince(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 30) return `${diffDays} hari yang lalu`;
    return `${Math.floor(diffDays / 30)} bulan yang lalu`;
  }

  /**
   * =========================
   * MANUAL TRACKING (ENHANCED)
   * =========================
   */
  async trackSymptom(userId, data) {
    try {
      // Validate inputs
      const userIdValidation = SymptomValidator.validateUserId(userId);
      if (!userIdValidation.valid) {
        throw new Error(`Invalid user ID: ${userIdValidation.error}`);
      }

      const dataValidation = SymptomValidator.validateSymptomData(data);
      if (!dataValidation.valid) {
        throw new Error(
          `Invalid symptom data: ${dataValidation.errors.join(", ")}`
        );
      }

      const validatedData = dataValidation.validated;

      // Create symptom check with proper normalization
      const symptomCheck = await prisma.symptomCheck.create({
        data: {
          userId: userIdValidation.data,
          complaint:
            validatedData.notes || `Manual tracking: ${validatedData.symptom}`,
          symptoms: [validatedData.symptom],
          durationDays: validatedData.durationDays,
          severityHint: SymptomNormalizer.normalizeSeverity(
            validatedData.severity
          ),

          // Set default values for manual tracking
          triageLevel: "LOW",
          riskLevel: "LOW",
          confidence: 0.5,

          likelyConditions: [],
          immediateAction: "Pantau gejala dan catat perkembangannya",
          recommendedSpecialist: ["Dokter Umum"],
          warningSigns: [
            "Gejala memburuk",
            "Muncul gejala baru",
            "Demam tinggi (>38°C)",
            "Sulit bernapas",
          ],
          homeCareAdvice: [
            "Istirahat yang cukup",
            "Minum air putih yang banyak",
            "Makan makanan bergizi",
            "Catat perkembangan gejala",
          ],
          followUpTiming:
            validatedData.severity === "SEVERE" ? "WITHIN_48H" : "MONITOR_ONLY",
          shouldSeeDoctor: validatedData.severity === "SEVERE",

          aiModelUsed: "manual_tracking",
        },
      });

      return {
        success: true,
        data: {
          recordId: symptomCheck.id,
          symptom: validatedData.symptom,
          severity: validatedData.severity,
          severityLabel: this.getSeverityLabel(
            SymptomNormalizer.normalizeSeverity(validatedData.severity)
          ),
          durationDays: validatedData.durationDays,
          notes: validatedData.notes,
          followUpTiming: symptomCheck.followUpTiming,
          followUpLabel: this.getFollowUpLabel(symptomCheck.followUpTiming),
          shouldSeeDoctor: symptomCheck.shouldSeeDoctor,
          trackedAt: symptomCheck.createdAt,
          advice: symptomCheck.homeCareAdvice,
        },
        message: "Gejala berhasil dicatat",
      };
    } catch (error) {
      console.error("[SymptomService] Track symptom error:", error.message);
      throw new Error(`Failed to track symptom: ${error.message}`);
    }
  }
}

module.exports = new SymptomService();
