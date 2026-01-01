class ApiUrls {
  // Base URL
  // static const String baseUrl = 'http://192.168.1.7:3000';
  // static const String baseUrl = 'http://10.113.123.15:3000';
  // static const String baseUrl = 'http://10.228.112.15:3000';
  static const String baseUrl = 'https://backendtraspac-production.up.railway.app';

  // Auth endpoints
  static const String login = 'auth/login';
  static const String register = 'auth/register';
  static const String logout = 'auth/logout';
  static const String verifyEmail = 'auth/verify';
  static const String registerDeviceToken = 'auth/register-device';
  static const String resendOtp = 'auth/resend-otp';
  static const String forgotPassword = 'auth/request-password-reset';
  static const String resetPassword = 'auth/reset-password';
  static const String checkResetToken = 'auth/check-reset-token/'; // + token

  // Profile & Medical
  static const String upsertMedicalProfile = 'me/medical-profile';
  static const String getProfile = 'me';
  static const String updateProfile = 'me';

  // Reminders & scrape
  static const String reminders = 'reminder';
  static const String scrapeYt = 'scrape/yt';

  // =========================
  // CONSULTATION ENDPOINTS
  // =========================
  static const String getUserConsultations = 'consultation/user';
  static const String createConsultation = 'consultation';
  static const String updateConsultationStatus = 'consultation'; // ATCH /:id/status
  static const String getDoctorConsultations = 'consultation/doctor';
  static const String getDoctorsList = 'consultation/doctorlist';
  static const String getDoctorSchedule = 'consultation/doctorschedule';
  static const String getPatientSummary = 'consultation'; // GET /:id/patient

  // =========================
  // CHAT ENDPOINTS
  // =========================
  static const String sendMessage = 'chat/send';
  static const String getMessages = '/chat/:chatRoomId';
}
