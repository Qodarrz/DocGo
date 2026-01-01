/**
 * =========================
 * VALIDATION HELPERS
 * =========================
 */

class SymptomValidator {
  static validateComplaint(text) {
    if (!text || typeof text !== "string") {
      return { valid: false, error: "Deskripsi gejala harus berupa string" };
    }

    const trimmed = text.trim();
    
    if (trimmed.length < 5) {
      return { valid: false, error: "Deskripsi gejala minimal 5 karakter" };
    }

    if (trimmed.length > 1000) {
      return { valid: false, error: "Deskripsi gejala maksimal 1000 karakter" };
    }

    // Check for meaningful content (not just numbers/special chars)
    const wordCount = trimmed.split(/\s+/).filter(word => word.length > 1).length;
    if (wordCount < 2) {
      return { valid: false, error: "Deskripsi gejala minimal 2 kata" };
    }

    return { valid: true, data: trimmed };
  }

  static validateSymptomData(data) {
    const errors = [];

    if (!data.symptom || typeof data.symptom !== "string") {
      errors.push("Nama gejala wajib diisi");
    } else if (data.symptom.trim().length < 2) {
      errors.push("Nama gejala minimal 2 karakter");
    }

    if (!data.severity || typeof data.severity !== "string") {
      errors.push("Tingkat keparahan wajib diisi");
    } else {
      const validSeverities = ["RINGAN", "SEDANG", "PARAH", "MILD", "MODERATE", "SEVERE"];
      if (!validSeverities.includes(data.severity.toUpperCase())) {
        errors.push(`Tingkat keparahan tidak valid. Gunakan: ${validSeverities.join(", ")}`);
      }
    }

    if (data.durationDays) {
      if (typeof data.durationDays !== "number" || data.durationDays < 0 || data.durationDays > 365) {
        errors.push("Durasi gejala harus antara 0-365 hari");
      }
    }

    if (data.notes && data.notes.length > 500) {
      errors.push("Catatan maksimal 500 karakter");
    }

    return {
      valid: errors.length === 0,
      errors,
      validated: {
        symptom: data.symptom?.trim(),
        severity: data.severity?.toUpperCase(),
        durationDays: Math.max(0, parseInt(data.durationDays) || 1),
        notes: data.notes?.trim() || null
      }
    };
  }

  static validateSymptomsArray(symptoms) {
    if (!Array.isArray(symptoms)) {
      return { valid: false, error: "Symptoms harus berupa array" };
    }

    if (symptoms.length === 0) {
      return { valid: false, error: "Minimal 1 gejala diperlukan" };
    }

    if (symptoms.length > 10) {
      return { valid: false, error: "Maksimal 10 gejala" };
    }

    const invalidItems = symptoms.filter(s => 
      typeof s !== "string" || s.trim().length < 2 || s.trim().length > 100
    );

    if (invalidItems.length > 0) {
      return { 
        valid: false, 
        error: `Gejala tidak valid: ${invalidItems.slice(0, 3).join(", ")}...` 
      };
    }

    const uniqueSymptoms = [...new Set(symptoms.map(s => s.trim().toLowerCase()))];
    
    return {
      valid: true,
      data: uniqueSymptoms.map(s => s.trim()),
      count: uniqueSymptoms.length
    };
  }

  static validateUserId(userId) {
    if (!userId || typeof userId !== "string") {
      return { valid: false, error: "User ID tidak valid" };
    }

    // UUID validation pattern
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(userId)) {
      return { valid: false, error: "Format User ID tidak valid" };
    }

    return { valid: true, data: userId };
  }
}

module.exports = SymptomValidator;