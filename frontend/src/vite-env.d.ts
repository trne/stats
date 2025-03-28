/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Add your environment variables here
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}