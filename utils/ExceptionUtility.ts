import type { Logger } from './Logger';

export type ExceptionCategory = 'FRAMEWORK' | 'UI' | 'API' | 'DATABASE' | 'FILE' | 'VALIDATION';

export interface ExceptionContext {
    operation?: string;
    testName?: string;
    metadata?: Record<string, unknown>;
}

export interface FrameworkExceptionOptions {
    code?: string;
    context?: ExceptionContext;
    cause?: unknown;
}

export class FrameworkException extends Error {
    public readonly category: ExceptionCategory;
    public readonly code?: string;
    public readonly context?: ExceptionContext;
    public override readonly cause?: unknown;

    constructor(message: string, category: ExceptionCategory, options: FrameworkExceptionOptions = {}) {
        super(message, options.cause === undefined ? undefined : { cause: options.cause });
        this.name = new.target.name;
        this.category = category;
        this.code = options.code;
        this.context = options.context;
        this.cause = options.cause;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, new.target);
        }
    }
}

export class UIException extends FrameworkException {
    constructor(message: string, options?: FrameworkExceptionOptions) {
        super(message, 'UI', options);
    }
}

export class APIException extends FrameworkException {
    constructor(message: string, options?: FrameworkExceptionOptions) {
        super(message, 'API', options);
    }
}

export class DatabaseException extends FrameworkException {
    constructor(message: string, options?: FrameworkExceptionOptions) {
        super(message, 'DATABASE', options);
    }
}

export class FileException extends FrameworkException {
    constructor(message: string, options?: FrameworkExceptionOptions) {
        super(message, 'FILE', options);
    }
}

export class ValidationException extends FrameworkException {
    constructor(message: string, options?: FrameworkExceptionOptions) {
        super(message, 'VALIDATION', options);
    }
}

export class ExceptionUtility {
    private static readonly categoryByLayer: Record<string, ExceptionCategory> = {
        UI: 'UI',
        API: 'API',
        DB: 'DATABASE',
        DATABASE: 'DATABASE',
        FILE: 'FILE',
        VALIDATION: 'VALIDATION',
        FRAMEWORK: 'FRAMEWORK'
    };

    public static wrap(
        error: unknown,
        category: ExceptionCategory = 'FRAMEWORK',
        context?: ExceptionContext,
        code?: string
    ): FrameworkException {
        if (error instanceof FrameworkException) {
            return error;
        }

        const message = error instanceof Error ? error.message : String(error);
        return new FrameworkException(message, category, {
            cause: error,
            context,
            code
        });
    }

    public static wrapForLayer(
        error: unknown,
        layer: string,
        context?: ExceptionContext,
        code?: string
    ): FrameworkException {
        const category = this.categoryByLayer[layer.toUpperCase()] ?? 'FRAMEWORK';
        return this.wrap(error, category, context, code);
    }

    public static log(logger: Logger | undefined, error: FrameworkException, message?: string): void {
        logger?.logException(error, message ?? error.message, {
            category: error.category,
            code: error.code,
            context: error.context
        });
    }

    /**
     * Logs the exception without swallowing it. Playwright still receives the
     * original failure and its stack trace.
     */
    public static fail(
        logger: Logger | undefined,
        error: unknown,
        category: ExceptionCategory = 'FRAMEWORK',
        context?: ExceptionContext,
        code?: string
    ): never {
        const exception = this.wrap(error, category, context, code);
        this.log(logger, exception);
        throw exception;
    }

    public static isFrameworkException(error: unknown): error is FrameworkException {
        return error instanceof FrameworkException;
    }
}
