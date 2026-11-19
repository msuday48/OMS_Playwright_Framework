
import type { Locator, Page } from '@playwright/test';

import type { OmsPageServices } from './pageServices';

export class LoginPage {

    private readonly emailInput: Locator;
    private readonly passwordInput: Locator;
    private readonly locationDropdown: Locator;
    private readonly loginButton: Locator;
    private readonly homepage_oms_logo: Locator;
    private readonly noticepopup: Locator;
    private readonly securityPopupOk: Locator;

    private readonly authenticatedUserMenu: Locator;
    private readonly authenticatedLogoutLink: Locator;
    private readonly authenticatedNavbar: Locator;

    private readonly dependencies: OmsPageServices;

    constructor(private readonly page: Page, dependencies: OmsPageServices) {
        this.dependencies = dependencies;

        // Locators
        this.emailInput = page.locator(
            "//form[@id='userLoginform']//input[@id='userId']"
        );

        this.passwordInput = page.locator(
            "//form[@id='userLoginform']//input[@name='userPassword']"
        );

        this.locationDropdown = page.locator(
            "//form[@id='userLoginform']//select[@id='location']"
        );

        this.loginButton = page.locator(
            "//div[@id='userLogin']//button[1]"
        );

        this.homepage_oms_logo = page.locator(
            "(//h4[normalize-space()='Jobs Dashboard'])[1]"
        );

        this.noticepopup = page.locator(
            "(//button[normalize-space()='Remind later'])[1]"
        );

        this.securityPopupOk = page.locator(
            "//button[@data-bb-handler='ok']"
        );

        // Authenticated markers
        this.authenticatedUserMenu = page.locator(
            "//a[contains(@class,'user-action')] | " +
            "//li[contains(@class,'user-profile')] | " +
            "//a[contains(@class,'dropdown-toggle') and " +
            "(contains(.,'Logout') or contains(@href,'logout') or .//img)]"
        );

        this.authenticatedLogoutLink = page.locator(
            "//a[contains(@onclick,'logout') or contains(@href,'logout') or normalize-space()='Logout']"
        );

        this.authenticatedNavbar = page.locator(
            "//div[contains(@class,'navbar-header')] | " +
            "//nav[contains(@class,'navbar')] | " +
            "//ul[contains(@class,'navbar-nav')]"
        );
    }

    // =========================================================================
    // LOGIN
    // =========================================================================

    async login(): Promise<void> {

        await this.dependencies.uiActions.waitForLoadState(
            'load',
            { timeout: 10_000 }
        );

        if (await this.isDisplayed(this.securityPopupOk, 1)) {

            this.dependencies.logger.info(
                'Dismissing security popup before login'
            );

            await this.securityPopupOk.evaluate(
                element => (element as HTMLElement).click()
            );
        }

        // Values are loaded by dotenv in playwright.config.ts.
        // Original Java keys: emailid, password, location.

        const emailId = process.env.emailid;
        const password = process.env.password;

        if (!emailId?.trim() || !password?.trim()) {

            this.dependencies.logger.error(
                `CREDENTIALS NOT INJECTED: emailid.present=${Boolean(emailId?.trim())} password.present=${Boolean(password?.trim())}`
            );

            throw new Error(
                'CREDENTIALS NOT INJECTED: Credentials were not provided by the environment configuration - login cannot proceed.'
            );
        }

        const location = process.env.location || 'Sydney';

        await this.selectLoginLocation(location);

        await this.dependencies.uiActions.fill(
            this.emailInput,
            emailId
        );

        await this.dependencies.uiActions.fill(
            this.passwordInput,
            password
        );

        await this.dependencies.uiActions.click(
            this.loginButton
        );
    }

    // =========================================================================
    // SELECT LOGIN LOCATION
    // =========================================================================

    private async selectLoginLocation(
        location: string
    ): Promise<void> {

        let optionElements: Locator[];

        try {

            optionElements = await this.locationDropdown
                .locator('option')
                .all();

        } catch (error) {

            this.dependencies.logger.warn(
                `Could not read the OMS login location dropdown (${error instanceof Error ? error.message : String(error)}) - keeping the current selection`
            );

            return;
        }

        if (optionElements.length === 0) {

            this.dependencies.logger.warn(
                'OMS login location dropdown exposed no options - keeping the current selection'
            );

            return;
        }

        let defaultIndex = -1;
        let matchIndex = -1;

        const requested = location?.trim() ?? '';

        for (let i = 0; i < optionElements.length; i++) {

            const text = await this.safeOptionText(optionElements[i]);
            const value = await this.safeOptionValue(optionElements[i]);

            if (
                defaultIndex < 0 &&
                text.length > 0 &&
                value.length > 0
            ) {
                defaultIndex = i;
            }

            if (
                matchIndex < 0 &&
                requested.length > 0 &&
                (
                    text.toLowerCase() === requested.toLowerCase() ||
                    value.toLowerCase() === requested.toLowerCase()
                )
            ) {
                matchIndex = i;
            }
        }

        const pick = matchIndex >= 0
            ? matchIndex
            : defaultIndex;

        if (matchIndex < 0) {

            this.dependencies.logger.warn(
                `Login location "${location}" is not offered by this target's dropdown - falling back to default branch`
            );
        }

        if (pick < 0) {
            return;
        }

        try {

            await this.dependencies.uiActions.selectByIndex(
                this.locationDropdown,
                pick
            );

            this.dependencies.logger.info(
                `Selected login location: ${await this.safeOptionText(optionElements[pick])}`
            );

        } catch (error) {

            this.dependencies.logger.warn(
                `Could not select the login location dropdown option: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    // =========================================================================
    // SAFE OPTION TEXT
    // =========================================================================

    private async safeOptionText(
        option: Locator
    ): Promise<string> {

        try {

            const text = await option.textContent();

            return text?.trim() ?? '';

        } catch {

            return '';
        }
    }

    // =========================================================================
    // SAFE OPTION VALUE
    // =========================================================================

    private async safeOptionValue(
        option: Locator
    ): Promise<string> {

        try {

            const value = await option.getAttribute('value');

            return value?.trim() ?? '';

        } catch {

            return '';
        }
    }

    // =========================================================================
    // CLOSE NOTICE POPUP
    // =========================================================================

    async closeNoticePopupIfPresent(): Promise<void> {

        if (await this.isDisplayed(this.noticepopup)) {

            await this.dependencies.uiActions.click(
                this.noticepopup
            );
        }
    }

    // =========================================================================
    // DATA-DRIVEN LOGIN
    // =========================================================================

    async loginDDT(
        username: string,
        password: string
    ): Promise<void> {

        await this.dependencies.uiActions.waitForLoadState(
            'load',
            { timeout: 10_000 }
        );

        if (await this.isDisplayed(this.securityPopupOk, 1)) {

            await this.securityPopupOk.evaluate(
                element => (element as HTMLElement).click()
            );
        }

        await this.dependencies.uiActions.fill(
            this.emailInput,
            username
        );

        await this.dependencies.uiActions.fill(
            this.passwordInput,
            password
        );

        await this.dependencies.uiActions.selectByLabel(
            this.locationDropdown,
            'Newcastle'
        );

        await this.dependencies.uiActions.click(
            this.loginButton
        );
    }

    // =========================================================================
    // HOMEPAGE IS DISPLAYED
    // =========================================================================

    async HomepageisDisplayed(): Promise<boolean> {

        await this.dismissBlockingDialogs();

        // 1. Primary Dashboard indicator
        if (await this.isDisplayed(this.homepage_oms_logo, 10)) {

            this.dependencies.logger.info(
                'Home page displayed after login (Jobs Dashboard found).'
            );

            return true;
        }

        // 2. Top Navigation bar / Authenticated User Header
        if (await this.isDisplayed(this.authenticatedNavbar, 5)) {

            this.dependencies.logger.info(
                'Home page displayed after login (Authenticated navbar header found).'
            );

            return true;
        }

        // 3. User Menu / Profile Icon
        if (await this.isDisplayed(this.authenticatedUserMenu, 5)) {

            this.dependencies.logger.info(
                'Home page displayed after login (Authenticated user menu found).'
            );

            return true;
        }

        // 4. Logout Trigger
        if (await this.isDisplayed(this.authenticatedLogoutLink, 3)) {

            this.dependencies.logger.info(
                'Home page displayed after login (Logout link found).'
            );

            return true;
        }

        // 5. URL Validation fallback
        try {

            const currentUrl = this.page.url();

            if (
                !currentUrl.includes('/home/login') &&
                (
                    currentUrl.includes('/testCntrl/') ||
                    currentUrl.includes('/searchJobs') ||
                    currentUrl.includes('/dashboard')
                )
            ) {

                this.dependencies.logger.info(
                    `Home page displayed after login (Authenticated landing URL verified: ${currentUrl})`
                );

                return true;
            }

        } catch {
            // Preserve Java behavior.
        }

        // 6. Rejection check: Still on login form
        if (await this.isDisplayed(this.emailInput, 3)) {

            this.dependencies.logger.error(
                'LOGIN REJECTED: browser stayed on login form after submit.'
            );

            await this.logPageState(
                'Home page not displayed after login - auth rejected, form still present'
            );

            return false;
        }

        await this.logPageState(
            'Home page not displayed after login - no authenticated marker and not on login form'
        );

        return false;
    }

    // =========================================================================
    // DISMISS BLOCKING DIALOGS
    // =========================================================================

    private async dismissBlockingDialogs(): Promise<void> {

        try {

            if (await this.isDisplayed(this.securityPopupOk, 1)) {

                await this.securityPopupOk.evaluate(
                    element => (element as HTMLElement).click()
                );

                this.dependencies.logger.info(
                    'Dismissed security dialog after login.'
                );
            }

            if (await this.isDisplayed(this.noticepopup, 1)) {

                await this.noticepopup.evaluate(
                    element => (element as HTMLElement).click()
                );

                this.dependencies.logger.info(
                    'Dismissed notice popup after login.'
                );
            }

        } catch (error) {

            this.dependencies.logger.warn(
                `Dialog dismissal skipped: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    // =========================================================================
    // LOG PAGE STATE
    // =========================================================================

    private async logPageState(
        message: string
    ): Promise<void> {

        try {

            const currentUrl = this.page.url();
            const title = await this.page.title();

            this.dependencies.logger.warn(
                `${message} - URL=${currentUrl} TITLE=${title}`
            );

        } catch (error) {

            this.dependencies.logger.warn(
                `${message} (page state unavailable: ${error instanceof Error ? error.message : String(error)})`
            );
        }
    }

    // =========================================================================
    // HOLD FOR LIVE STREAM
    // =========================================================================

    async holdForLiveStream(): Promise<void> {

        const liveStream = (
            process.env.liveStream ?? 'false'
        ).toLowerCase() === 'true';

        if (!liveStream) {
            return;
        }

        let holdSeconds = 60;

        try {

            holdSeconds = Number.parseInt(
                process.env.liveStreamHoldSeconds ?? '60',
                10
            );

        } catch {
            // Keep default.
        }

        if (holdSeconds <= 0 || !Number.isFinite(holdSeconds)) {
            return;
        }

        await this.dependencies.uiActions.waitForLoadState(
            'load',
            { timeout: 10_000 }
        );

        for (let i = 0; i < holdSeconds; i++) {

            await this.page.waitForTimeout(1_000);
        }
    }

    // =========================================================================
    // IS DISPLAYED - ACTIONDRIVER EQUIVALENT
    // =========================================================================

    private async isDisplayed(
        locator: Locator,
        timeoutSeconds = 0
    ): Promise<boolean> {

        if (timeoutSeconds <= 0) {
            return locator.isVisible();
        }

        try {

            await locator.waitFor({
                state: 'visible',
                timeout: timeoutSeconds * 1_000
            });

            return true;

        } catch {

            return false;
        }
    }
}
