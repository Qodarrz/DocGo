class SymptomNormalizer {
  static normalizeJsonArray(value, fieldName = "data") {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value
        .filter((item) => item != null && typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return this.normalizeJsonArray(parsed, fieldName);
      } catch {
        return [value.trim()].filter((item) => item.length > 0);
      }
    }

    console.warn(`[Normalizer] Invalid ${fieldName} type:`, typeof value);
    return [];
  }

  static normalizeEnum(value, allowedValues, fallback, fieldName = "enum") {
    if (!value) return fallback;

    const stringValue = String(value).toUpperCase().trim();

    if (allowedValues.includes(stringValue)) {
      return stringValue;
    }

    const commonMappings = {
      RENDAH: "LOW",
      RINGAN: "LOW",
      SEDANG: "MEDIUM",
      TINGGI: "HIGH",
      DARURAT: "EMERGENCY",
      URGENT: "EMERGENCY",

      MODERAT: "MODERATE",
      MENENGAH: "MODERATE",
      BERAT: "HIGH",

      SEGERA: "ASAP",
      "24_JAM": "WITHIN_24H",
      "2_HARI": "WITHIN_48H",
      "1_MINGGU": "WITHIN_1WEEK",
      PEMANTAUAN: "MONITOR_ONLY",
    };

    if (commonMappings[stringValue]) {
      const mapped = commonMappings[stringValue];
      if (allowedValues.includes(mapped)) {
        console.log(
          `[Normalizer] Mapped ${fieldName}: ${stringValue} -> ${mapped}`
        );
        return mapped;
      }
    }

    console.warn(
      `[Normalizer] Invalid ${fieldName} value: ${value}, using fallback: ${fallback}`
    );
    return fallback;
  }

  static normalizeSeverity(value) {
    if (!value) return null;

    const v = String(value).toUpperCase().trim();
    const severityMap = {
      RINGAN: "MILD",
      SEDANG: "MODERATE",
      PARAH: "SEVERE",
      BERAT: "SEVERE",

      MILD: "MILD",
      MODERATE: "MODERATE",
      SEVERE: "SEVERE",

      1: "MILD",
      2: "MILD",
      3: "MILD",
      4: "MODERATE",
      5: "MODERATE",
      6: "MODERATE",
      7: "SEVERE",
      8: "SEVERE",
      9: "SEVERE",
      10: "SEVERE",
    };

    return severityMap[v] || null;
  }

  static normalizeDuration(duration) {
    if (!duration) return null;

    if (typeof duration === "number") {
      return Math.max(0, Math.min(duration, 365));
    }

    if (typeof duration === "string") {
      const patterns = [
        { regex: /(\d+)\s*hari/i, multiplier: 1 },
        { regex: /(\d+)\s*minggu/i, multiplier: 7 },
        { regex: /(\d+)\s*bulan/i, multiplier: 30 },
        { regex: /(\d+)\s*tahun/i, multiplier: 365 },
      ];

      for (const pattern of patterns) {
        const match = duration.match(pattern.regex);
        if (match) {
          const days = parseInt(match[1]) * pattern.multiplier;
          return Math.min(days, 365);
        }
      }

      const num = parseInt(duration);
      if (!isNaN(num)) {
        return Math.max(0, Math.min(num, 365));
      }
    }

    return null;
  }

  static normalizeConfidence(confidence) {
    if (confidence == null) return null;

    const num =
      typeof confidence === "number" ? confidence : parseFloat(confidence);

    if (isNaN(num)) return null;

    return Math.max(0, Math.min(1, num));
  }
}

module.exports = SymptomNormalizer;
