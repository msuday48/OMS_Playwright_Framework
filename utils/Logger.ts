import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';

// ======================================================
// TYPES
// ======================================================

export type LogCategory = 'UI' | 'API' | 'DATABASE' | 'INTEGRATION' | 'FRAMEWORK';

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export interface LoggerOptions {
    category?: LogCategory;
    testId?: string;
    projectName?: string;
    workerIndex?: number;
    retry?: number;
    moduleName?: string;
    logDir?: string;
    level?: LogLevel;
    console?: boolean;
    file?: boolean;
}

export type LogMetadata = Record<string, unknown>;

// ======================================================
// LOGGER CLASS
// ======================================================

export class Logger {
    private readonly internalLogger: winston.Logger;
    private readonly ownsLogger: boolean;
    private closed = false;
    public readonly filePath?: string;

    private constructor(
        logger: winston.Logger,
        filePath?: string,
        ownsLogger: boolean = true
    ) {
        this.internalLogger = logger;
        this.filePath = filePath;
        this.ownsLogger = ownsLogger;

        this.internalLogger.on('error', (error: Error) => {
            process.stderr.write(`[WINSTON ERROR] ${error.message}\n`);
        });
    }

    public static getLogger(
        testName: string,
        options: LoggerOptions = {}
    ): Logger {
        const category = options.category ?? 'UI';
        const level = this.getLogLevel(options.level ?? process.env.LOG_LEVEL);
        const enableConsole = this.getBoolean(process.env.LOG_CONSOLE, options.console ?? true, 'LOG_CONSOLE');
        const enableFile = this.getBoolean(process.env.LOG_FILE, options.file ?? true, 'LOG_FILE');

        if (!enableConsole && !enableFile) {
            throw new Error('At least one logger transport must be enabled.');
        }

        // ----------------------------------------------
        // LOG DIRECTORY (Modified for Scenario requirements)
        // ----------------------------------------------
        const logDirectory = path.resolve(
            process.cwd(),
            options.logDir ?? process.env.LOG_DIR ?? 'Logs'
        );

        const categoryFolderMap: Record<LogCategory, string> = {
            'UI': 'uiLogs',
            'API': 'apiLogs',
            'DATABASE': 'dbLogs',
            'INTEGRATION': 'integrationLogs',
            'FRAMEWORK': 'frameworkLogs'
        };

        const categoryDirectory = path.join(
            logDirectory,
            categoryFolderMap[category]
        );

        if (enableFile) {
            fs.mkdirSync(categoryDirectory, { recursive: true });
        }

        // ----------------------------------------------
        // UNIQUE LOG FILE NAME
        // ----------------------------------------------
        const safeTestName = this.sanitizeFileName(testName);
        const safeTestId = this.sanitizeFileName(options.testId ?? 'manual');
        const safeProjectName = this.sanitizeFileName(options.projectName ?? 'local');
        const worker = options.workerIndex ?? 0;
        const retry = options.retry ?? 0;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        const fileName = [
            category,
            safeTestName,
            safeTestId,
            safeProjectName,
            `worker-${worker}`,
            `retry-${retry}`,
            timestamp
        ].join('_') + '.log';

        const filePath = path.join(categoryDirectory, fileName);

        // ----------------------------------------------
        // DEFAULT METADATA
        // ----------------------------------------------
        const defaultMeta = this.sanitizeMetadata({
            testName,
            category,
            testId: options.testId ?? 'manual',
            projectName: options.projectName ?? 'local',
            workerIndex: worker,
            retry,
            moduleName: options.moduleName
        });

        // ----------------------------------------------
        // WINSTON FORMATS
        // ----------------------------------------------
        const baseFormat = winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' })
        );

        const fileFormat = winston.format.printf((info) => {
            return this.formatMessage(info);
        });

        const consoleFormat = winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.printf((info) => {
                return this.formatMessage(info);
            })
        );

        // ----------------------------------------------
        // TRANSPORTS
        // ----------------------------------------------
        const transports: winston.transport[] = [];

        if (enableConsole) {
            transports.push(new winston.transports.Console({ level, format: consoleFormat }));
        }

        if (enableFile) {
            transports.push(
                new winston.transports.File({
                    filename: filePath,
                    level,
                    format: fileFormat,
                    options: { flags: 'a' }
                })
            );
        }

        const winstonLogger = winston.createLogger({
            level,
            defaultMeta,
            format: baseFormat,
            transports,
            exitOnError: false
        });

        return new Logger(winstonLogger, enableFile ? filePath : undefined);
    }

    public info(message: string, metadata: LogMetadata = {}): void {
        this.write('info', message, metadata);
    }

    public warn(message: string, metadata: LogMetadata = {}): void {
        this.write('warn', message, metadata);
    }

    public error(message: string, metadata: LogMetadata = {}): void {
        this.write('error', message, metadata);
    }

    public debug(message: string, metadata: LogMetadata = {}): void {
        this.write('debug', message, metadata);
    }

    public logStep(message: string, metadata: LogMetadata = {}): void {
        this.info(`STEP: ${message}`, metadata);
    }

    public logException(error: unknown, message: string, metadata: LogMetadata = {}): void {
        this.error(message, {
            ...metadata,
            exception: Logger.serializeError(error)
        });
    }

    public child(metadata: LogMetadata): Logger {
        const childLogger = this.internalLogger.child(Logger.sanitizeMetadata(metadata));
        return new Logger(childLogger, this.filePath, false);
    }

    private write(level: LogLevel, message: string, metadata: LogMetadata): void {
        if (this.closed) {
            return;
        }
        const safeMessage = Logger.redactString(message);
        const safeMetadata = Logger.sanitizeMetadata(metadata);
        this.internalLogger.log(level, safeMessage, safeMetadata);
    }

    private static formatMessage(info: Record<string, unknown>): string {
        const { timestamp, level, message, testName, category, ...metadata } = info;
        const prefix = `[${String(timestamp)}] [${String(level).toUpperCase()}] [${String(category ?? 'GENERAL')}] [${String(testName ?? 'UNKNOWN TEST')}]`;
        const additionalInfo = Object.keys(metadata).length > 0 ? ` | ${this.safeStringify(metadata)}` : '';
        return `${prefix} ${String(message)}${additionalInfo}`;
    }

    private static sanitizeMetadata(metadata: LogMetadata): LogMetadata {
        return this.sanitizeValue(metadata) as LogMetadata;
    }

    private static sanitizeValue(value: unknown, key: string = '', seen: WeakSet<object> = new WeakSet()): unknown {
        const sensitiveKey = /password|passwd|secret|token|authorization|api[_-]?key|client[_-]?secret/i;
        if (sensitiveKey.test(key)) return '[REDACTED]';
        if (value === null || value === undefined) return value;
        if (typeof value === 'string') return this.redactString(value);
        if (typeof value === 'number' || typeof value === 'boolean') return value;
        if (typeof value === 'bigint') return value.toString();
        if (value instanceof Error) return this.serializeError(value);
        if (typeof value === 'function') return '[Function]';

        if (typeof value === 'object') {
            if (seen.has(value)) return '[Circular Reference]';
            seen.add(value);
            let result: unknown;
            if (Array.isArray(value)) {
                result = value.map((item) => this.sanitizeValue(item, '', seen));
            } else {
                const sanitized: LogMetadata = {};
                for (const [property, item] of Object.entries(value as Record<string, unknown>)) {
                    sanitized[property] = this.sanitizeValue(item, property, seen);
                }
                result = sanitized;
            }
            seen.delete(value);
            return result;
        }
        return String(value);
    }

    private static redactString(value: string): string {
        return value
            .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED]')
            .replace(/\b(password|passwd|token|secret|api[_-]?key|authorization)\s*[:=]\s*("[^"]*"|'[^']*'|[^\s,;&]+)/gi, '$1=[REDACTED]')
            .replace(/([?&](?:access_token|refresh_token|token|password|api_key|secret)=)[^&#\s]*/gi, '$1[REDACTED]');
    }

    private static serializeError(error: unknown, depth: number = 0): LogMetadata {
        if (depth > 5) return { message: 'Maximum error cause depth reached' };
        if (error instanceof Error) {
            const errorWithCause = error as Error & { cause?: unknown; code?: unknown; };
            const result: LogMetadata = {
                name: error.name,
                message: this.redactString(error.message),
                stack: error.stack ? this.redactString(error.stack) : undefined
            };
            if (errorWithCause.code !== undefined) result.code = errorWithCause.code;
            if (errorWithCause.cause !== undefined) result.cause = this.serializeError(errorWithCause.cause, depth + 1);
            return result;
        }
        return { name: 'UnknownError', message: this.redactString(String(error)) };
    }

    private static safeStringify(value: unknown): string {
        try {
            return JSON.stringify(this.sanitizeValue(value));
        } catch {
            return '[Unable to serialize metadata]';
        }
    }

    private static sanitizeFileName(value: string): string {
        return value.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 60) || 'Unnamed';
    }

    private static getLogLevel(value?: string): LogLevel {
        const level = (value || 'info').toLowerCase();
        const validLevels: LogLevel[] = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
        if (!validLevels.includes(level as LogLevel)) throw new Error(`Invalid LOG_LEVEL: ${level}`);
        return level as LogLevel;
    }

    private static getBoolean(envValue: string | undefined, defaultValue: boolean, key: string): boolean {
        if (envValue === undefined) return defaultValue;
        const value = envValue.toLowerCase();
        if (value === 'true') return true;
        if (value === 'false') return false;
        throw new Error(`Invalid boolean configuration: ${key}=${envValue}`);
    }

    public async close(): Promise<void> {
        if (!this.ownsLogger || this.closed) return;
        this.closed = true;
        await new Promise<void>((resolve) => {
            this.internalLogger.once('finish', resolve);
            this.internalLogger.end();
        });
    }
    
}