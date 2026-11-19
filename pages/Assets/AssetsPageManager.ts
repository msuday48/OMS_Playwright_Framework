import type { Page } from '@playwright/test';

/** Page manager for the Assets section; page objects will be added here. */
export class AssetsPageManager {
    constructor(private readonly page: Page) { }
}
