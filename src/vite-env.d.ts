/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_MAX_UPLOAD_SIZE_MB: string;
  readonly VITE_ENABLE_LOGS: string;
  readonly VITE_ENDPOINT_AUTH_SEND_CODE: string;
  readonly VITE_ENDPOINT_AUTH_VERIFY_CODE: string;
  readonly VITE_ENDPOINT_USER_PROFILE: string;
  readonly VITE_ENDPOINT_USER_UPDATE: string;
  readonly VITE_ENDPOINT_USER_UPLOAD_PHOTO: string;
  readonly VITE_ENDPOINT_AVATAR_UPLOAD: string;
  readonly VITE_ENDPOINT_AVATAR_REGENERATE: string;
  readonly VITE_ENDPOINT_AVATAR_GET: string;
  readonly VITE_ENDPOINT_DRESSES_GET_ALL: string;
  readonly VITE_ENDPOINT_DRESS_GET_BY_ID: string;
  readonly VITE_ENDPOINT_POSES_GET_ALL: string;
  readonly VITE_ENDPOINT_TRYON_GENERATE: string;
  readonly VITE_ENDPOINT_TRYON_GET_USER: string;
  readonly VITE_ENDPOINT_TRYON_DELETE: string;
  readonly VITE_ENDPOINT_TRYON_GET_BY_ID: string;
  readonly VITE_ENDPOINT_SHARE_GET: string;
  readonly VITE_ENDPOINT_APPOINTMENTS_GET_USER: string;
  readonly VITE_ENDPOINT_APPOINTMENT_BOOK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
