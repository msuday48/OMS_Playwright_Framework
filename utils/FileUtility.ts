import * as fs from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import type { Locator, Page } from '@playwright/test';
import * as xlsx from 'xlsx';
import { FileException } from './ExceptionUtility';
import type { Logger } from './Logger';

type PdfParser = (data: Buffer) => Promise<{ text: string }>;

const requireFromHere = createRequire(__filename);

export class FileUtility {
    private readonly frameworkRoot: string;
    private readonly downloadPath: string;
    private readonly testDataPath: string;
    private readonly envFilePath: string;

    constructor(private readonly logger?: Logger) 
    {
        this.frameworkRoot = process.cwd();
        this.downloadPath = path.resolve(this.frameworkRoot, 'Downloads');
        this.testDataPath = path.resolve(this.frameworkRoot, 'testdata');
        this.envFilePath = path.resolve(this.frameworkRoot, '.env');

        mkdirSync(this.downloadPath, { recursive: true });
        mkdirSync(this.testDataPath, { recursive: true });
    }

    public getFrameworkRoot(): string { return this.frameworkRoot; }
    public getDownloadPath(): string { return this.downloadPath; }
    public getTestDataPath(): string { return this.testDataPath; }
    public getEnvFilePath(): string { return this.envFilePath; }

    // ==========================================
    // ENVIRONMENT CONFIGURATION (.env)
    // ==========================================

    public getEnvValue(key: string): string | undefined {
        return process.env[key];
    }

    public async getDynamicEnvValue(key: string): Promise<string | undefined> {
        if (!existsSync(this.envFilePath)) return undefined;

        const envContent = await fs.readFile(this.envFilePath, 'utf8');
        for (const line of envContent.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;

            const separator = trimmed.indexOf('=');
            const existingKey = trimmed.substring(0, separator).trim();
            if (existingKey === key) {
                return trimmed.substring(separator + 1).trim().replace(/^["']|["']$/g, '');
            }
        }
        return undefined;
    }

    public async writeToEnvFile(key: string, value: string): Promise<void> {
        const envContent = existsSync(this.envFilePath)
            ? await fs.readFile(this.envFilePath, 'utf8')
            : '';

        const lines = envContent.length > 0 ? envContent.split(/\r?\n/) : [];
        let updated = false;

        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;

            const existingKey = trimmed.substring(0, trimmed.indexOf('=')).trim();
            if (existingKey === key) {
                lines[i] = `${key}=${value}`;
                updated = true;
                break;
            }
        }

        if (!updated) {
            lines.push(`${key}=${value}`);
        }

        await fs.writeFile(this.envFilePath, `${lines.join('\n').trim()}\n`, 'utf8');
        process.env[key] = value;
        this.logger?.info(`Updated environment property: ${key}`);
    }

    // ==========================================
    // FILE UPLOAD
    // ==========================================

    public async uploadFile(locator: Locator, fileName: string): Promise<void> {
        const filePath = path.resolve(this.testDataPath, fileName);
        await this.assertReadableFile(filePath, fileName);

        await locator.setInputFiles(filePath);
        this.logger?.info(`Uploaded file: ${fileName}`, { path: filePath });
    }

    public async multipleFilesUpload(locator: Locator, fileNames: string[]): Promise<void> {
        const absolutePaths: string[] = [];
        const missingFiles: string[] = [];

        for (const name of fileNames) {
            const filePath = path.resolve(this.testDataPath, name.trim());
            if (existsSync(filePath)) {
                absolutePaths.push(filePath);
            } else {
                missingFiles.push(name);
            }
        }

        if (missingFiles.length > 0) {
            throw new FileException(`Multiple upload failed. Missing files: ${missingFiles.join(', ')}`, {
                context: { operation: 'multipleFilesUpload', metadata: { missingFiles } }
            });
        }

        await locator.setInputFiles(absolutePaths);
        this.logger?.info(`Successfully uploaded ${absolutePaths.length} files.`);
    }

    public async uploadConfiguredFiles(locator: Locator, key = 'FilesUpload'): Promise<void> {
        const configured = (await this.getDynamicEnvValue(key)) ?? this.getEnvValue(key);
        if (configured === undefined || configured.trim() === '') {
            throw new FileException(`Required .env key "${key}" is missing or empty.`, {
                context: { operation: 'uploadConfiguredFiles', metadata: { key } }
            });
        }

        const names = configured
            .split(/[;,]/)
            .map((name) => name.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);

        if (names.length === 0) {
            throw new FileException(`The .env key "${key}" does not contain any file names.`, {
                context: { operation: 'uploadConfiguredFiles', metadata: { key } }
            });
        }
        await this.multipleFilesUpload(locator, names);
    }

    // ==========================================
    // DOWNLOAD MANAGEMENT
    // ==========================================

    public async cleanDownloadFolder(): Promise<void> {
        if (!existsSync(this.downloadPath)) return;

        const entries = await fs.readdir(this.downloadPath);
        for (const entry of entries) {
            await fs.rm(path.resolve(this.downloadPath, entry), { recursive: true, force: true });
        }
        this.logger?.info('Download folder cleaned.');
    }

    public async deleteFilesByExtension(extension: string): Promise<void> {
        if (!existsSync(this.downloadPath)) return;

        const ext = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
        const entries = await fs.readdir(this.downloadPath);

        for (const entry of entries) {
            if (entry.toLowerCase().endsWith(ext)) {
                await fs.rm(path.resolve(this.downloadPath, entry), { force: true });
            }
        }
        this.logger?.info(`Deleted all files with extension: ${ext}`);
    }

    /** Returns the set of existing file names in the downloads directory before triggering a download. */
    public async getExistingFileNames(): Promise<Set<string>> {
        if (!existsSync(this.downloadPath)) {
            mkdirSync(this.downloadPath, { recursive: true });
            return new Set<string>();
        }
        const entries = await fs.readdir(this.downloadPath);
        return new Set<string>(entries);
    }

    /** Waits until a newly created file matching prefix and extension is completely downloaded (not tmp or crdownload). */
    public async waitForNewDownload(
        existingFiles: Set<string>,
        filePrefix: string,
        expectedExtension: string,
        timeoutSeconds: number
    ): Promise<string> 
    {

        const deadline = Date.now() + timeoutSeconds * 1000;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const entries = existsSync(this.downloadPath)
                ? await fs.readdir(this.downloadPath)
                : [];
            for (const name of entries) {
                if (existingFiles.has(name)) continue;
                if (name.endsWith('.crdownload') || name.endsWith('.tmp')) continue;

                const matchesPrefix = !filePrefix || filePrefix.trim().length === 0 || name.startsWith(filePrefix);
                const matchesExtension = !expectedExtension || expectedExtension.trim().length === 0 || name.endsWith(expectedExtension);

                if (matchesPrefix && matchesExtension) {
                    const filePath = path.resolve(this.downloadPath, name);
                    const stat = await fs.stat(filePath);
                    if (stat.isFile() && stat.size > 0) {
                        this.logger?.info(`New download detected: ${filePath}`);
                        return filePath;
                    }
                }
            }

            if (Date.now() > deadline) {
                throw new FileException(
                    `Timed out after ${timeoutSeconds}s waiting for new download (prefix='${filePrefix}', extension='${expectedExtension}')`,
                    { context: { operation: 'waitForNewDownload', metadata: { filePrefix, expectedExtension, timeoutSeconds } } }
                );
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }

    public async downloadAndValidate(
        page: Page,
        triggerDownload: () => Promise<void>,
        expectedExtension: string,
        timeoutMs: number = 30_000
    ): Promise<string> {
        this.logger?.info('Waiting for download to begin...');

        const downloadPromise = page.waitForEvent('download', { timeout: timeoutMs });
        await triggerDownload();
        const download = await downloadPromise;

        const originalName = download.suggestedFilename();
        const ext = expectedExtension.startsWith('.') ? expectedExtension : `.${expectedExtension}`;

        if (!originalName.toLowerCase().endsWith(ext.toLowerCase())) {
            throw new FileException(
                `Download validation failed: Expected extension ${ext}, but got ${originalName}`,
                { context: { operation: 'downloadAndValidate', metadata: { originalName, ext } } }
            );
        }

        const safeName = `${randomUUID().substring(0, 8)}_${originalName}`;
        const destPath = path.resolve(this.downloadPath, safeName);

        await download.saveAs(destPath);

        const stat = await fs.stat(destPath);
        if (stat.size === 0) {
            throw new FileException(`Downloaded file is empty (0 bytes): ${destPath}`, {
                context: { operation: 'downloadAndValidate', metadata: { destPath } }
            });
        }

        this.logger?.info(`Download successful and saved to: ${destPath}`);
        return destPath;
    }

    // ==========================================
    // CONTENT VALIDATION
    // ==========================================

    public async verifyFileContent(fileName: string, expectedText: string): Promise<boolean> {
        const filePath = path.resolve(this.downloadPath, fileName);
        if (!existsSync(filePath)) {
            throw new FileException(`Verification failed: File not found: ${filePath}`, {
                context: { operation: 'verifyFileContent', metadata: { fileName } }
            });
        }

        const ext = path.extname(fileName).toLowerCase();
        const content = await this.readFileText(filePath, ext);
        const isValid = content.includes(expectedText);

        this.logger?.info(`File content verification for '${fileName}': ${isValid ? 'PASSED' : 'FAILED'}`);
        return isValid;
    }

    public async extractPdfText(filePath: string): Promise<string> {
        if (!existsSync(filePath)) {
            throw new FileException(`PDF file not found: ${filePath}`, {
                context: { operation: 'extractPdfText', metadata: { filePath } }
            });
        }

        const dataBuffer = await fs.readFile(filePath);
        if (dataBuffer.length === 0) {
            throw new FileException(`PDF file is empty (0 bytes): ${filePath}`, {
                context: { operation: 'extractPdfText', metadata: { filePath } }
            });
        }

        const parsePdf = this.loadPdfParser();
        try {
            const pdfData = await parsePdf(dataBuffer);
            return pdfData.text;
        } catch (error) {
            throw new FileException(`Failed to extract text from PDF: ${filePath}`, {
                cause: error,
                context: { operation: 'extractPdfText', metadata: { filePath } }
            });
        }
    }

    public async readExcelContent(filePath: string): Promise<string> {
        if (!existsSync(filePath)) {
            throw new FileException(`Excel file not found: ${filePath}`, {
                context: { operation: 'readExcelContent', metadata: { filePath } }
            });
        }

        try {
            const workbook = xlsx.readFile(filePath);
            let combinedText = '';

            for (const sheetName of workbook.SheetNames) {
                const worksheet = workbook.Sheets[sheetName];
                const rows = xlsx.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, blankrows: false });
                for (const row of rows) {
                    combinedText += `${row.map((cell) => String(cell ?? '')).join(' ')} `;
                }
            }
            return combinedText;
        } catch (error) {
            throw new FileException(`Failed to read Excel file: ${filePath}`, {
                cause: error,
                context: { operation: 'readExcelContent', metadata: { filePath } }
            });
        }
    }

    private async readFileText(filePath: string, ext: string): Promise<string> {
        switch (ext) {
            case '.txt':
            case '.csv':
            case '.text':
                return fs.readFile(filePath, 'utf8');
            case '.pdf':
                return this.extractPdfText(filePath);
            case '.xlsx':
            case '.xls':
                return this.readExcelContent(filePath);
            default:
                throw new FileException(`Unsupported file type for content verification: ${ext}`, {
                    context: { operation: 'readFileText', metadata: { filePath, ext } }
                });
        }
    }

    private async assertReadableFile(filePath: string, fileName: string): Promise<void> {
        if (!existsSync(filePath)) {
            throw new FileException(`Upload failed: File not found at ${filePath}`, {
                context: { operation: 'uploadFile', metadata: { fileName } }
            });
        }

        const stat = await fs.stat(filePath);
        if (!stat.isFile()) {
            throw new FileException(`Upload failed: Path is a directory, not a file: ${filePath}`, {
                context: { operation: 'uploadFile', metadata: { fileName } }
            });
        }
    }

    private loadPdfParser(): PdfParser {
        try {
            const loaded: unknown = requireFromHere('pdf-parse');
            const parser = typeof loaded === 'function'
                ? loaded
                : (loaded as { default?: unknown }).default;

            if (typeof parser !== 'function') {
                throw new Error('pdf-parse did not export a callable parser.');
            }
            return parser as PdfParser;
        } catch (error) {
            throw new FileException(
                'PDF parsing requires the optional "pdf-parse" package. Install it with: npm install pdf-parse',
                { cause: error, context: { operation: 'loadPdfParser' } }
            );
        }
    }
}
