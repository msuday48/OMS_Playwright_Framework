import { expect, Locator, Page } from '@playwright/test';
import type { OmsPageServices } from '../common/pageServices';

export class ClientSearchPage {
    private readonly page: Page;
    private readonly dependencies: OmsPageServices;

    private readonly enterContact: Locator;
    private readonly searchIcon: Locator;
    private readonly backButton: Locator;
    private readonly clientTableBody: Locator;
    private readonly filterAll: Locator;
    private readonly filterActive: Locator;
    private readonly filterInactive: Locator;
    private readonly dateOfSalesButton: Locator;
    private readonly filterArchived: Locator;
    private readonly contactDropdown: Locator;
    private readonly searchByNameId: Locator;
    private readonly searchByContact: Locator;
    private readonly firstNameField: Locator;
    private readonly lastNameField: Locator;
    private readonly emailField: Locator;
    private readonly makeClientActive: Locator;
    private readonly updateButton: Locator;

    constructor(page: Page, dependencies: OmsPageServices) {
        this.page = page;
        this.dependencies = dependencies;

        this.enterContact = page.locator("//input[@id='search-name' or @placeholder='Client Name']");
        this.searchIcon = page.locator("//button[@id='search' and @data-original-title='Search']");
        this.backButton = page.locator("//a[normalize-space()='Back' or contains(@class,'fa-arrow-left')]");
        this.clientTableBody = page.locator("//table[@id='clientFiltertable']//tbody");
        this.filterAll = page.locator("//a[@data-status='all' or normalize-space()='All']");
        this.filterActive = page.locator("//a[@data-status='active' or normalize-space()='Active']");
        this.filterInactive = page.locator("//a[@data-status='inactive' or normalize-space()='Inactive']");
        this.dateOfSalesButton = page.locator("//tbody/tr[1]/td[8]/div[1]/a[1]");
        this.filterArchived = page.locator("//a[@data-status='showHidden' or normalize-space()='Archived']");
        this.contactDropdown = page.locator("//button[@id='dropbtn']");
        this.searchByNameId = page.locator("//label[normalize-space()='Company name & ID']");
        this.searchByContact = page.locator("//label[normalize-space()='Client contact name & email']");
        this.firstNameField = page.locator("//input[@id='firstName']");
        this.lastNameField = page.locator("//input[@id='lastName']");
        this.emailField = page.locator("//input[@id='email' or @name='contactEmail']");
        this.makeClientActive = page.locator("//div[@class='col-sm-2']//input[@id='active']");
        this.updateButton = page.locator("//button[@id='btn-update']");
    }

    private async getEnv(key: string): Promise<string> {
        return await this.dependencies.fileUtils.getDynamicEnvValue(key) || '';
    }

    async searchClient(): Promise<void> {
        const businessName = await this.getEnv('CreatedClient');

        await this.dependencies.uiActions.waitForVisible(this.enterContact);
        await this.dependencies.uiActions.clear(this.enterContact);
        await this.dependencies.uiActions.fill(this.enterContact, businessName);
        await this.dependencies.uiActions.click(this.searchIcon);
        await this.dependencies.uiActions.waitForVisible(this.clientTableBody);
        await this.page.waitForLoadState('networkidle');
    }

    async applyFilter(filter: Locator): Promise<void> {
        await this.dependencies.uiActions.click(filter);
        await this.dependencies.uiActions.waitForVisible(this.clientTableBody);
        await this.page.waitForLoadState('networkidle');
    }

    async clearNameSearch(): Promise<void> {
        await this.dependencies.uiActions.clear(this.enterContact);
    }

    async clearContactFields(): Promise<void> {
        await this.dependencies.uiActions.clear(this.firstNameField);
        await this.dependencies.uiActions.clear(this.lastNameField);
        await this.dependencies.uiActions.clear(this.emailField);
    }

    async validateClientIfPresent(expectedClientName: string): Promise<void> {
        const cell = this.page.locator(`//table[@id='clientFiltertable']//tbody//td[normalize-space()='${expectedClientName}']`);
        if (await this.dependencies.uiActions.isVisible(cell)) {
            const actual = await cell.innerText();
            if (actual.trim() !== expectedClientName) {
                throw new Error(`Client name mismatch: expected [${expectedClientName}] but found [${actual.trim()}]`);
            }
            this.dependencies.logger.info(`✓ Client validated: ${expectedClientName}`);
        } else {
            this.dependencies.logger.info(`Client not found: ${expectedClientName}`);
        }
    }

    async editClient(): Promise<void> {
        const businessName = await this.getEnv('CreatedClient');

        await this.dependencies.uiActions.waitForVisible(this.enterContact);
        await this.clearNameSearch();
        await this.dependencies.uiActions.fill(this.enterContact, businessName);
        await this.searchClient();
        await this.validateClientIfPresent(businessName);

        const editBtn = this.page.locator(`//table[@id='clientFiltertable']//tbody//tr[td[contains(normalize-space(),'${businessName}')]]//button[contains(@class,'btn-edit')]`);
        await this.dependencies.uiActions.click(editBtn);
        await this.dependencies.uiActions.waitForVisible(this.backButton);
        await this.dependencies.uiActions.click(this.backButton);
    }

    async dateOfSales(): Promise<void> {
        await this.dependencies.uiActions.click(this.dateOfSalesButton);
    }

    async searchClientFull(): Promise<void> {
        const businessName = await this.getEnv('CreatedClient');

        await this.clearNameSearch();
        await this.dependencies.uiActions.fill(this.enterContact, businessName);
        await this.applyFilter(this.filterAll);
        await this.searchClient();
        await this.validateClientIfPresent(businessName);

        const firstName = await this.getEnv('FirstName');
        if (firstName && firstName !== '') {
            await this.clearContactFields();
            await this.dependencies.uiActions.fill(this.firstNameField, firstName);
            await this.applyFilter(this.filterAll);
            await this.searchClient();
            await this.validateClientIfPresent(businessName);
        }

        const lastName = await this.getEnv('LastName');
        if (lastName && lastName !== '') {
            await this.clearContactFields();
            await this.dependencies.uiActions.fill(this.lastNameField, lastName);
            await this.applyFilter(this.filterAll);
            await this.searchClient();
            await this.validateClientIfPresent(businessName);
        }

        const email = await this.getEnv('PrimaryEmail');
        if (email && email !== '') {
            await this.clearContactFields();
            await this.dependencies.uiActions.fill(this.emailField, email);
            await this.applyFilter(this.filterAll);
            await this.searchClient();
            await this.validateClientIfPresent(businessName);
        }

        await this.applyFilter(this.filterActive);

        if (!(await this.dependencies.uiActions.isChecked(this.makeClientActive))) {
            await this.dependencies.uiActions.click(this.makeClientActive);
            await this.dependencies.uiActions.click(this.updateButton);
        }

        const editBtn = this.page.locator(`//table[@id='clientFiltertable']//tbody//tr[td[contains(normalize-space(),'${businessName}')]]//button[contains(@class,'btn-edit')]`);
        await this.dependencies.uiActions.click(editBtn);
        await this.dependencies.uiActions.waitForVisible(this.makeClientActive);
        if (!(await this.dependencies.uiActions.isChecked(this.makeClientActive))) {
            await this.dependencies.uiActions.click(this.makeClientActive);
            await this.dependencies.uiActions.click(this.updateButton);
        }

        await this.dependencies.uiActions.click(editBtn);
    }

    async downloadClientDetails(): Promise<void> {
        const businessName = await this.getEnv('CreatedClient');

        await this.clearNameSearch();
        await this.dependencies.uiActions.fill(this.enterContact, businessName);
        await this.applyFilter(this.filterAll);
        await this.searchClient();
        await this.dependencies.fileUtils.cleanDownloadFolder();
        const pageContext = await this.page.context().waitForEvent('download');
        await this.dependencies.uiActions.click(
          this.page.locator('//button[contains(@class,"btn-download") or @id="download"]'),
          undefined,
          'Download client report button',
        );
        const download = await pageContext;
        const dest = await this.dependencies.fileUtils.downloadAndValidate(this.page, async () => {}, '.txt');
        this.dependencies.logger.info(`Download saved: ${dest}`);
    }

    async makeClientActiveIfNeeded(): Promise<void> {
        if (!(await this.dependencies.uiActions.isChecked(this.makeClientActive))) {
            await this.dependencies.uiActions.click(this.makeClientActive);
            await this.dependencies.uiActions.click(this.updateButton);
        }
    }
}