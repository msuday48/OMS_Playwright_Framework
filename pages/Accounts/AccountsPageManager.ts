import type { Page } from '@playwright/test';

/** Page manager for the Accounts section; page objects will be added here. */
export class AccountsPageManager {
    constructor(private readonly page: Page) { }
}
