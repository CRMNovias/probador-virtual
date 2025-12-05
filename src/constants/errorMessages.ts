/**
 * Error messages
 * 
 * User-facing error messages in Spanish
 */

/**
 * Application error messages (Spanish)
 */
export const errorMessages = {
  // Auth errors
  AUTH_INVALID_PHONE: 'Número de teléfono no válido.',
  AUTH_SEND_CODE_FAILED: 'Error al enviar el código. Inténtalo de nuevo.',
  AUTH_INVALID_CODE: 'Código incorrecto. Inténtalo de nuevo.',
  AUTH_EXPIRED_CODE: 'El código ha expirado. Solicita uno nuevo.',
  AUTH_TOO_MANY_ATTEMPTS: 'Demasiados intentos. Intenta más tarde.',
  AUTH_SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',

  // Upload errors
  UPLOAD_FAILED: 'Error al subir la imagen. Verifica tu conexión.',
  INVALID_FILE_TYPE: 'Formato de archivo no válido. Usa JPG o PNG.',
  FILE_TOO_LARGE: 'La imagen es demasiado grande. Máximo 5MB.',
  UPLOAD_TIMEOUT: 'La subida está tardando demasiado. Verifica tu conexión.',

  // Avatar errors
  AVATAR_GENERATION_FAILED: 'Error al generar tu avatar. Inténtalo de nuevo.',
  AVATAR_GENERATION_TIMEOUT: 'La generación del avatar está tardando demasiado.',
  AVATAR_NOT_FOUND: 'No se encontró tu avatar. Por favor, crea uno nuevo.',

  // Try-On errors
  TRYON_GENERATION_FAILED: 'Error al generar la prueba virtual. Inténtalo de nuevo.',
  TRYON_GENERATION_TIMEOUT: 'La generación está tardando demasiado.',
  TRYON_DELETE_FAILED: 'Error al eliminar la imagen.',
  TRYON_NO_DRESS_SELECTED: 'Selecciona un vestido primero.',
  TRYON_NO_POSE_SELECTED: 'Selecciona una pose primero.',

  // Dress/Catalog errors
  DRESSES_LOAD_FAILED: 'Error al cargar el catálogo de vestidos.',
  DRESS_NOT_FOUND: 'Vestido no encontrado.',
  POSES_LOAD_FAILED: 'Error al cargar las poses disponibles.',

  // Appointment errors
  APPOINTMENTS_LOAD_FAILED: 'Error al cargar tus citas.',
  APPOINTMENT_BOOK_FAILED: 'Error al reservar la cita.',

  // Network errors
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  TIMEOUT_ERROR: 'La petición está tardando demasiado. Inténtalo de nuevo.',
  SERVER_ERROR: 'Error del servidor. Inténtalo más tarde.',
  SERVER_UNAVAILABLE: 'El servicio no está disponible. Inténtalo más tarde.',

  // Authorization errors
  UNAUTHORIZED: 'No autorizado. Por favor, inicia sesión.',
  FORBIDDEN: 'No tienes permiso para realizar esta acción.',
  NOT_FOUND: 'Recurso no encontrado.',

  // Generic errors
  UNKNOWN_ERROR: 'Algo salió mal. Inténtalo más tarde.',
  VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
} as const;

/**
 * Error messages by HTTP status code
 */
export const httpStatusMessages: Record<number, string> = {
  400: errorMessages.VALIDATION_ERROR,
  401: errorMessages.UNAUTHORIZED,
  403: errorMessages.FORBIDDEN,
  404: errorMessages.NOT_FOUND,
  408: errorMessages.TIMEOUT_ERROR,
  500: errorMessages.SERVER_ERROR,
  503: errorMessages.SERVER_UNAVAILABLE,
};

/**
 * Get error message for HTTP status code
 * @param statusCode - HTTP status code
 * @returns User-friendly error message in Spanish
 */
export const getHttpErrorMessage = (statusCode: number): string => {
  return httpStatusMessages[statusCode] || errorMessages.UNKNOWN_ERROR;
};
