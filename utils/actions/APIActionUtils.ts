import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Logger } from '../Logger';

export type APIRequestOptions = Parameters<APIRequestContext['get']>[1];
export type APIFetchOptions = Parameters<APIRequestContext['fetch']>[1];

export interface APIActionUtilsOptions {
    request: APIRequestContext;
    logger?: Logger;
}

export class APIActionUtils {
    private readonly request: APIRequestContext;
    private readonly logger?: Logger;

    constructor(options: APIActionUtilsOptions) {
        this.request = options.request;
        this.logger = options.logger;
    }

    // =========================================================================
    // HTTP METHODS
    // =========================================================================

    public get(url: string, options?: APIRequestOptions): Promise<APIResponse> {
        return this.action('GET', url, () => this.request.get(url, options));
    }

    public post(url: string, options?: APIRequestOptions): Promise<APIResponse> {
        return this.action('POST', url, () => this.request.post(url, options));
    }

    public put(url: string, options?: APIRequestOptions): Promise<APIResponse> {
        return this.action('PUT', url, () => this.request.put(url, options));
    }

    public patch(url: string, options?: APIRequestOptions): Promise<APIResponse> {
        return this.action('PATCH', url, () => this.request.patch(url, options));
    }

    public delete(url: string, options?: APIRequestOptions): Promise<APIResponse> {
        return this.action('DELETE', url, () => this.request.delete(url, options));
    }

    public head(url: string, options?: APIRequestOptions): Promise<APIResponse> {
        return this.action('HEAD', url, () => this.request.head(url, options));
    }

    public fetch(urlOrRequest: Parameters<APIRequestContext['fetch']>[0], options?: APIFetchOptions): Promise<APIResponse> {
        const target = typeof urlOrRequest === 'string' ? urlOrRequest : urlOrRequest.url();
        return this.action('FETCH', target, () => this.request.fetch(urlOrRequest, options));
    }

    // =========================================================================
    // RESPONSE UTILITIES
    // =========================================================================

    public getResponseStatus(response: APIResponse): number {
        return response.status();
    }

    public isResponseOK(response: APIResponse): boolean {
        return response.ok();
    }

    public getResponseHeaders(response: APIResponse): Record<string, string> {
        return response.headers();
    }

    public getResponseText(response: APIResponse): Promise<string> {
        return response.text();
    }

    public getResponseJson<T = unknown>(response: APIResponse): Promise<T> {
        return response.json() as Promise<T>;
    }

    public getResponseBody(response: APIResponse): Promise<Buffer> {
        return response.body();
    }

    public getResponseBodyBuffer(response: APIResponse): Promise<Buffer> {
        return response.body();
    }

    private async action<T>(method: string, url: string, run: () => Promise<T>): Promise<T> {
        try {
            const result = await run();
            this.logger?.debug(`API action: ${method} ${url}`);
            return result;
        } catch (error) {
            this.logger?.error(`API action failed: ${method} ${url}`, { error: this.errorMetadata(error) });
            throw error;
        }
    }

    private errorMetadata(error: unknown): Record<string, unknown> {
        if (error instanceof Error) {
            return { name: error.name, message: error.message, stack: error.stack };
        }
        return { message: String(error) };
    }
}
