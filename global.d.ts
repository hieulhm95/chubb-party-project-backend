namespace NodeJS {
    interface ProcessEnv {
        SHEET_ID?: string;
        REDIS_URI?: string;
        GOOGLE_CREDENTIALS_FILENAME?: string;
        MAPPING_RULES?: string;
        DATABASE_URL?: string;
        PORT?: number;
        HOST?: string;
        NODE_ENV?: string;
        LOGGER_LEVEL?: string;
    }
}