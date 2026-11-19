// utils/assertion.ts

import { expect, Locator, Page, APIResponse, test } from '@playwright/test';
import type { Logger } from './Logger';

// Export native expect for fallback and advanced native usage
export { expect };

type AriaRole = Parameters<ReturnType<typeof expect<Locator>>['toHaveRole']>[0];

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface AssertionOptions {
    message?: string;
    soft?: boolean;
    timeout?: number;
    ignoreCase?: boolean;
    useInnerText?: boolean;
}

/**
 * Internal helper to resolve the correct expect instance (soft or hard)
 * and apply a custom message if provided.
 */
function buildExpect<T>(actual: T, options?: AssertionOptions) {
    if (options?.soft) {
        return expect.soft<T>(actual, options.message);
    }
    return expect<T>(actual, options?.message);
}

// ============================================================================
// 1. GENERIC ASSERTIONS (Base class shared by API and DB)
// ============================================================================

export class GenericAssertions {
    
    public assertEqual(actual: unknown, expected: unknown, options?: AssertionOptions): void {
        buildExpect(actual, options).toBe(expected);
    }

    public assertStrictEqual(actual: unknown, expected: unknown, options?: AssertionOptions): void {
        buildExpect(actual, options).toStrictEqual(expected);
    }

    public assertNotEqual(actual: unknown, expected: unknown, options?: AssertionOptions): void {
        buildExpect(actual, options).not.toBe(expected);
    }

    public assertTruthy(actual: unknown, options?: AssertionOptions): void {
        buildExpect(actual, options).toBeTruthy();
    }

    public assertFalsy(actual: unknown, options?: AssertionOptions): void {
        buildExpect(actual, options).toBeFalsy();
    }

    public assertDefined(actual: unknown, options?: AssertionOptions): void {
        buildExpect(actual, options).toBeDefined();
    }

    public assertUndefined(actual: unknown, options?: AssertionOptions): void {
        buildExpect(actual, options).toBeUndefined();
    }

    public assertNull(actual: unknown, options?: AssertionOptions): void {
        buildExpect(actual, options).toBeNull();
    }

    public assertNotNull(actual: unknown, options?: AssertionOptions): void {
        buildExpect(actual, options).not.toBeNull();
    }

    public assertInstanceOf(actual: unknown, expectedType: Function, options?: AssertionOptions): void {
        buildExpect(actual, options).toBeInstanceOf(expectedType);
    }

    public assertGreaterThan(actual: number, expected: number, options?: AssertionOptions): void {
        buildExpect(actual, options).toBeGreaterThan(expected);
    }

    public assertGreaterThanOrEqual(actual: number, expected: number, options?: AssertionOptions): void {
        buildExpect(actual, options).toBeGreaterThanOrEqual(expected);
    }

    public assertLessThan(actual: number, expected: number, options?: AssertionOptions): void {
        buildExpect(actual, options).toBeLessThan(expected);
    }

    public assertLessThanOrEqual(actual: number, expected: number, options?: AssertionOptions): void {
        buildExpect(actual, options).toBeLessThanOrEqual(expected);
    }

    public assertCloseTo(actual: number, expected: number, precision?: number, options?: AssertionOptions): void {
        buildExpect(actual, options).toBeCloseTo(expected, precision);
    }

    public assertNaN(actual: number, options?: AssertionOptions): void {
        buildExpect(actual, options).toBeNaN();
    }

    public assertContains(actual: string | unknown[], expected: unknown, options?: AssertionOptions): void {
        buildExpect(actual, options).toContain(expected);
    }

    public assertContainsEqual(actual: unknown[], expected: unknown, options?: AssertionOptions): void {
        buildExpect(actual, options).toContainEqual(expected);
    }

    public assertLength(actual: string | unknown[], expected: number, options?: AssertionOptions): void {
        buildExpect(actual, options).toHaveLength(expected);
    }

    public assertProperty(actual: object, property: string, expected?: unknown, options?: AssertionOptions): void {
        if (expected !== undefined) {
            buildExpect(actual, options).toHaveProperty(property, expected);
        } else {
            buildExpect(actual, options).toHaveProperty(property);
        }
    }

    public assertMatch(actual: string, expected: RegExp, options?: AssertionOptions): void {
        buildExpect(actual, options).toMatch(expected);
    }

    public assertMatchObject(actual: object, expected: Record<string, unknown> | unknown[], options?: AssertionOptions): void {
        buildExpect(actual, options).toMatchObject(expected);
    }

    public assertThrows(callback: () => unknown, expectedError?: RegExp | Function, options?: AssertionOptions): void {
        if (expectedError) {
            buildExpect(callback, options).toThrow(expectedError);
        } else {
            buildExpect(callback, options).toThrow();
        }
    }
}

// ============================================================================
// 2. UI ASSERTIONS
// ============================================================================

export class UIAssertions extends GenericAssertions {

    // --- Element State Assertions ---


    public async assertAttached(locator: Locator, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toBeAttached({ timeout: options?.timeout });
    }

    public async assertChecked(locator: Locator, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toBeChecked({ timeout: options?.timeout });
    }

    public async assertDisabled(locator: Locator, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toBeDisabled({ timeout: options?.timeout });
    }

    public async assertEditable(locator: Locator, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toBeEditable({ timeout: options?.timeout });
    }

    public async assertEmpty(locator: Locator, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toBeEmpty({ timeout: options?.timeout });
    }

    public async assertEnabled(locator: Locator, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toBeEnabled({ timeout: options?.timeout });
    }

    public async assertFocused(locator: Locator, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toBeFocused({ timeout: options?.timeout });
    }

    public async assertHidden(locator: Locator, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toBeHidden({ timeout: options?.timeout });
    }

    public async assertInViewport(locator: Locator, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toBeInViewport({ timeout: options?.timeout });
    }

    public async assertVisible(locator: Locator, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toBeVisible({ timeout: options?.timeout });
    }

    // --- Text Assertions ---

    public async assertText(locator: Locator, expected: string | RegExp | Array<string | RegExp>, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toHaveText(expected, { 
            timeout: options?.timeout,
            ignoreCase: options?.ignoreCase,
            useInnerText: options?.useInnerText
        });
    }

    public async assertContainsText(locator: Locator, expected: string | RegExp | Array<string | RegExp>, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toContainText(expected, { 
            timeout: options?.timeout,
            ignoreCase: options?.ignoreCase,
            useInnerText: options?.useInnerText
        });
    }

    // --- Attribute & Property Assertions ---

    public async assertAttribute(locator: Locator, name: string, expected: string | RegExp, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toHaveAttribute(name, expected, { timeout: options?.timeout, ignoreCase: options?.ignoreCase });
    }

    public async assertClass(locator: Locator, expected: string | RegExp | Array<string | RegExp>, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toHaveClass(expected, { timeout: options?.timeout });
    }

    public async assertClassContains(locator: Locator, expected: string | RegExp | Array<string | RegExp>, options?: AssertionOptions): Promise<void> {
        if (typeof expected === 'string') {
            await buildExpect(locator, options).toContainClass(expected, { timeout: options?.timeout });
            return;
        }

        await buildExpect(locator, options).toHaveClass(expected, { timeout: options?.timeout });
    }

    public async assertCount(locator: Locator, expected: number, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toHaveCount(expected, { timeout: options?.timeout });
    }

    public async assertCSS(locator: Locator, property: string, expected: string | RegExp, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toHaveCSS(property, expected, { timeout: options?.timeout });
    }

    public async assertId(locator: Locator, expected: string | RegExp, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toHaveId(expected, { timeout: options?.timeout });
    }

    public async assertJSProperty(locator: Locator, property: string, expected: unknown, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toHaveJSProperty(property, expected, { timeout: options?.timeout });
    }

    public async assertRole(locator: Locator, expected: AriaRole, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toHaveRole(expected, { timeout: options?.timeout });
    }

    public async assertValue(locator: Locator, expected: string | RegExp, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toHaveValue(expected, { timeout: options?.timeout });
    }

    public async assertValues(locator: Locator, expected: Array<string | RegExp>, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toHaveValues(expected, { timeout: options?.timeout });
    }

    // --- Accessibility Assertions ---

    public async assertAccessibleDescription(locator: Locator, expected: string | RegExp, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toHaveAccessibleDescription(expected, { timeout: options?.timeout, ignoreCase: options?.ignoreCase });
    }

    public async assertAccessibleName(locator: Locator, expected: string | RegExp, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toHaveAccessibleName(expected, { timeout: options?.timeout, ignoreCase: options?.ignoreCase });
    }

    public async assertLocatorAriaSnapshot(locator: Locator, expected: string, options?: AssertionOptions): Promise<void> {
        await buildExpect(locator, options).toMatchAriaSnapshot(expected, { timeout: options?.timeout });
    }

    public async assertPageAriaSnapshot(page: Page, expected: string, options?: AssertionOptions): Promise<void> {
        await buildExpect(page, options).toMatchAriaSnapshot(expected, { timeout: options?.timeout });
    }

    // --- Screenshot Assertions ---

    public async assertLocatorScreenshot(locator: Locator, nameOrOptions?: unknown, options?: AssertionOptions): Promise<void> {
        if (typeof nameOrOptions === 'string') {
            await buildExpect(locator, options).toHaveScreenshot(nameOrOptions, { timeout: options?.timeout });
        } else {
            await buildExpect(locator, options).toHaveScreenshot({ ...(nameOrOptions as object), timeout: options?.timeout });
        }
    }

    public async assertPageScreenshot(page: Page, nameOrOptions?: unknown, options?: AssertionOptions): Promise<void> {
        if (typeof nameOrOptions === 'string') {
            await buildExpect(page, options).toHaveScreenshot(nameOrOptions, { timeout: options?.timeout });
        } else {
            await buildExpect(page, options).toHaveScreenshot({ ...(nameOrOptions as object), timeout: options?.timeout });
        }
    }

    // --- Page Assertions ---

    public async assertPageURL(page: Page, expected: string | RegExp, options?: AssertionOptions): Promise<void> {
        await buildExpect(page, options).toHaveURL(expected, { timeout: options?.timeout });
    }

    public async assertPageTitle(page: Page, expected: string | RegExp, options?: AssertionOptions): Promise<void> {
        await buildExpect(page, options).toHaveTitle(expected, { timeout: options?.timeout });
    }
}

// ============================================================================
// 3. API ASSERTIONS
// ============================================================================

export class APIAssertions extends GenericAssertions {

    public async assertResponseOK(response: APIResponse, options?: AssertionOptions): Promise<void> {
        await buildExpect(response, options).toBeOK();
    }

    public assertStatusCode(response: APIResponse, expectedStatus: number, options?: AssertionOptions): void {
        this.assertEqual(response.status(), expectedStatus, options);
    }

    public assertSuccessfulResponse(response: APIResponse, options?: AssertionOptions): void {
        const status = response.status();
        const isSuccess = status >= 200 && status < 300;
        buildExpect(isSuccess, options).toBeTruthy();
    }

    public assertClientErrorResponse(response: APIResponse, options?: AssertionOptions): void {
        const status = response.status();
        const isClientError = status >= 400 && status < 500;
        buildExpect(isClientError, options).toBeTruthy();
    }

    public assertServerErrorResponse(response: APIResponse, options?: AssertionOptions): void {
        const status = response.status();
        const isServerError = status >= 500 && status < 600;
        buildExpect(isServerError, options).toBeTruthy();
    }

    public assertResponseBody(actual: unknown, expected: Record<string, unknown> | unknown[], options?: AssertionOptions): void {
        this.assertMatchObject(actual as object, expected, options);
    }

    public assertResponseEquals(actual: unknown, expected: unknown, options?: AssertionOptions): void {
        this.assertEqual(actual, expected, options);
    }

    public assertResponseContains(actual: string | unknown[], expected: unknown, options?: AssertionOptions): void {
        this.assertContains(actual, expected, options);
    }

    public assertResponseProperty(actual: object, property: string, expected?: unknown, options?: AssertionOptions): void {
        this.assertProperty(actual, property, expected, options);
    }

    public assertResponseArrayLength(actual: unknown[], expectedLength: number, options?: AssertionOptions): void {
        this.assertLength(actual, expectedLength, options);
    }

    public assertResponseNotNull(actual: unknown, options?: AssertionOptions): void {
        this.assertNotNull(actual, options);
    }

    public assertResponseTruthy(actual: unknown, options?: AssertionOptions): void {
        this.assertTruthy(actual, options);
    }

    public assertResponseFalsy(actual: unknown, options?: AssertionOptions): void {
        this.assertFalsy(actual, options);
    }
}

// ============================================================================
// 4. DB ASSERTIONS
// ============================================================================

export class DBAssertions extends GenericAssertions {

    public assertRecordNotNull(record: unknown, options?: AssertionOptions): void {
        this.assertNotNull(record, options);
    }

    public assertRecordNull(record: unknown, options?: AssertionOptions): void {
        this.assertNull(record, options);
    }

    public assertRecordDefined(record: unknown, options?: AssertionOptions): void {
        this.assertDefined(record, options);
    }

    public assertRecordUndefined(record: unknown, options?: AssertionOptions): void {
        this.assertUndefined(record, options);
    }

    public assertRecordExists(record: unknown, options?: AssertionOptions): void {
        this.assertDefined(record, options);
        this.assertNotNull(record, options);
    }

    public assertRecordEquals(actual: unknown, expected: unknown, options?: AssertionOptions): void {
        this.assertEqual(actual, expected, options);
    }

    public assertRecordMatches(actual: object, expected: Record<string, unknown> | unknown[], options?: AssertionOptions): void {
        this.assertMatchObject(actual, expected, options);
    }

    public assertRecordProperty(record: object, property: string, expected?: unknown, options?: AssertionOptions): void {
        this.assertProperty(record, property, expected, options);
    }

    public assertRecordLength(records: unknown[], expectedLength: number, options?: AssertionOptions): void {
        this.assertLength(records, expectedLength, options);
    }

    public assertCollectionLength(records: unknown[], expectedLength: number, options?: AssertionOptions): void {
        this.assertLength(records, expectedLength, options);
    }

    public assertCollectionContains(records: unknown[], expected: unknown, options?: AssertionOptions): void {
        this.assertContains(records, expected, options);
    }

    public assertCollectionContainsObject(records: unknown[], expected: object, options?: AssertionOptions): void {
        this.assertContainsEqual(records, expected, options);
    }

    public assertCollectionEmpty(records: unknown[], options?: AssertionOptions): void {
        this.assertLength(records, 0, options);
    }

    public assertCollectionNotEmpty(records: unknown[], options?: AssertionOptions): void {
        buildExpect(records.length, options).toBeGreaterThan(0);
    }
}
// ============================================================================
// 5. ASSERTION STEP HELPER
// ============================================================================

export class AssertionHelper {
    constructor(private readonly logger?: Logger) {}

    public async step<T>(name: string, action: () => T | Promise<T>): Promise<T> {
        return test.step(name, async () => {
            try {
                const result = await action();
                this.logger?.info(`Assertion passed: ${name}`);
                return result;
            } catch (error) {
                this.logger?.error(`Assertion failed: ${name}`, {
                    error: error instanceof Error
                        ? { name: error.name, message: error.message, stack: error.stack }
                        : String(error)
                });
                throw error;
            }
        });
    }
}
