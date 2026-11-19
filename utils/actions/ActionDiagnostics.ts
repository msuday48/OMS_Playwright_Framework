import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ActionSource {
    file?: string;
    line?: number;
    column?: number;
    functionName?: string;
    className?: string;
    method?: string;
    frame?: string;
}

export interface ActionExecutionContext {
    actionName: string;
    elementName: string;
    locator?: string;
    source: ActionSource;
    startTime: number;
    readOnly: boolean;
    url: string;
}

interface ParsedStackFrame {
    functionName: string;
    file: string;
    line: number;
    column: number;
    raw: string;
}

const INTERNAL_FRAME_PATTERNS: RegExp[] = [
    /[\\/]node_modules[\\/]/i,
    /[\\/]utils[\\/]actions[\\/]/i,
    /[\\/]utils[\\/]Logger\.(?:ts|js)$/i,
    /[\\/]utils[\\/]ExceptionUtility\.(?:ts|js)$/i,
    /[\\/]utils[\\/]CustomReporter\.(?:ts|js)$/i,
    /[\\/]utils[\\/]assertion\.(?:ts|js)$/i,
    /[\\/]playwright[\\/]lib[\\/]/i
];

const STACK_FRAME_PATTERN = /^\s*at\s+(?:(.*?)\s+\()?(.+?):(\d+):(\d+)\)?\s*$/;

export function captureActionSource(stack: string = new Error().stack ?? ''): ActionSource {
    return resolveActionSource(stack);
}

export function resolveActionSource(stack: string): ActionSource {
    const frames = parseStackFrames(stack);
    const externalFrames = frames.filter((frame) => !isInternalFrame(frame.file));
    const selected = externalFrames.find((frame) => isPageObjectFile(frame.file)) ?? externalFrames[0];

    if (!selected) {
        return {};
    }

    const file = normalizeSourcePath(selected.file);
    const { className, method } = splitFunctionName(selected.functionName, file);

    return {
        file,
        line: selected.line,
        column: selected.column,
        functionName: selected.functionName || undefined,
        className,
        method,
        frame: selected.raw
    };
}

export function formatSourceLocation(source: ActionSource): string {
    if (!source.file || !source.line || !source.column) {
        return 'Source location unavailable';
    }
    return `${source.file}:${source.line}:${source.column}`;
}

export function formatSourceFrame(source: ActionSource): string {
    if (!source.file || !source.line || !source.column) {
        return 'Source location unavailable';
    }
    const functionName = [source.className, source.method].filter(Boolean).join('.') || '<anonymous>';
    return `at ${functionName}\n   (${source.file}:${source.line}:${source.column})`;
}

export function formatLocator(locator: { toString(): string }): string {
    return locator.toString().replace(/\s+/g, ' ').trim();
}

export function isTimeoutError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }
    return error.name === 'TimeoutError'
        || /Timeout\s+\d+ms exceeded/i.test(error.message)
        || /waiting for locator/i.test(error.message);
}

export function isPointerInterceptionError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }
    return /intercepts pointer events|pointer-events|another element|obscures|overlay/i.test(error.message);
}

export function errorMessageLine(error: unknown): string {
    if (!(error instanceof Error)) {
        return String(error);
    }
    return firstMeaningfulLine(error.message);
}

export function reasonForError(error: unknown): string {
    if (!(error instanceof Error)) {
        return 'Unknown error';
    }

    const message = error.message;
    if (/intercepts pointer events|pointer-events|another element|obscures|overlay/i.test(message)) {
        return 'Element could not receive pointer events. Another element intercepted the action.';
    }
    if (/not visible|element is not visible/i.test(message)) {
        return 'Element is not visible.';
    }
    if (/not stable|element is not stable/i.test(message)) {
        return 'Element is not stable.';
    }
    if (/strict mode violation/i.test(message)) {
        return 'Locator resolved to more than one element (strict mode violation).';
    }
    if (/detached from the DOM|element is not attached/i.test(message)) {
        return 'Element is detached from the DOM.';
    }
    if (isTimeoutError(error)) {
        return 'Timeout while waiting for the element action to complete.';
    }
    return errorMessageLine(error);
}

export function errorStack(error: unknown): string {
    if (error instanceof Error && error.stack) {
        return error.stack;
    }
    return '(no stack trace available)';
}

function parseStackFrames(stack: string): ParsedStackFrame[] {
    const frames: ParsedStackFrame[] = [];

    for (const line of stack.split(/\r?\n/)) {
        const match = STACK_FRAME_PATTERN.exec(line);
        if (!match) {
            continue;
        }

        frames.push({
            functionName: (match[1] ?? '').trim(),
            file: match[2].trim(),
            line: Number(match[3]),
            column: Number(match[4]),
            raw: line.trim()
        });
    }

    return frames;
}

function isInternalFrame(file: string): boolean {
    return INTERNAL_FRAME_PATTERNS.some((pattern) => pattern.test(file));
}

function isPageObjectFile(file: string): boolean {
    return /[\\/]pages[\\/]/i.test(file);
}

function normalizeSourcePath(file: string): string {
    if (file.startsWith('file://')) {
        try {
            return path.normalize(fileURLToPath(file));
        } catch {
            return file;
        }
    }

    const windowsDrivePath = /^\/([A-Za-z]:[\\/].*)$/.exec(file);
    if (windowsDrivePath) {
        return path.normalize(windowsDrivePath[1]);
    }

    return path.normalize(file);
}

function splitFunctionName(functionName: string, file: string): { className?: string; method?: string } {
    const cleaned = functionName
        .replace(/^new\s+/i, '')
        .replace(/^async\s+/i, '')
        .trim();

    if (cleaned) {
        const lastDot = cleaned.lastIndexOf('.');
        if (lastDot > 0) {
            const owner = cleaned.slice(0, lastDot).split('.').pop();
            const method = cleaned.slice(lastDot + 1);
            if (owner && method && method !== '<anonymous>') {
                return { className: owner, method };
            }
        } else if (cleaned !== '<anonymous>') {
            return { className: deriveClassNameFromFile(file), method: cleaned };
        }
    }

    return { className: deriveClassNameFromFile(file) };
}

function deriveClassNameFromFile(file: string): string | undefined {
    const baseName = path.basename(file).replace(/\.(?:ts|js|mts|cts)$/i, '');
    return baseName || undefined;
}

function firstMeaningfulLine(message: string): string {
    const line = message
        .split(/\r?\n/)
        .map((item) => item.trim())
        .find((item) => item.length > 0);
    return line ?? message;
}
