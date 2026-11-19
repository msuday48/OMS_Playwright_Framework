import type { Locator, Page } from '@playwright/test';
import { xpathLiteral } from '../../utils/xpath';
import type { OmsPageServices } from '../common/pageServices';
import type { ModuleExecutionContext } from '../Modules/ModuleConfig/ModuleExecutionContext';

/** Playwright conversion of the supplied Selenium SearchAddProcessData class. */
export class SearchAddProcessData {
    protected readonly page: Page;
    protected readonly deps: OmsPageServices;
    private readonly job: Locator;
    private readonly jobnoEnterBox: Locator;
    private readonly clientSearchDropdown: Locator;
    private readonly clientSearchInput: Locator;
    private readonly clientSwaOption: Locator;
    private readonly branchDropdownBtn: Locator;
    private readonly branchAnyCheckbox: Locator;
    private readonly branchNewcastleCheckbox: Locator;
    private readonly searchButton: Locator;
    private readonly targetPviRowButton: Locator;

    constructor(page: Page, deps: OmsPageServices) {
        this.page = page;
        this.deps = deps;
        this.job = page.locator("//a[normalize-space()='Create job']");
        this.jobnoEnterBox = page.locator("//input[@placeholder='Job number']");
        this.clientSearchDropdown = page.locator("//span[@id='select2-clientId-container']");
        this.clientSearchInput = page.locator("//input[contains(@class,'select2-search__field')]");
        this.clientSwaOption = page.locator("//li[contains(@class,'select2-results__option') and normalize-space()='Swa']");
        this.branchDropdownBtn = page.locator("//select[@id='branch']/following-sibling::div//button[contains(@class,'multiselect')]");
        this.branchAnyCheckbox = page.locator("//select[@id='branch']/following-sibling::div//ul[contains(@class,'multiselect-container')]//input[@value='']");
        this.branchNewcastleCheckbox = page.locator("//select[@id='branch']/following-sibling::div//ul[contains(@class,'multiselect-container')]//input[@value='NC']");
        this.searchButton = page.locator('#next_form');
        this.targetPviRowButton = page.locator(
            "//tr[td/a[normalize-space()='CP25-0370'] and td/a[normalize-space()='Swa'] and td/a[contains(normalize-space(),'Prithvi')]]//a[normalize-space()='PVI']",
        );
    }

    private async getClient(): Promise<string> {
        return this.deps.env.requiredEnvValue('CreatedClient');
    }

    /** Same module-key preference and generic fallback as Java getJobNoFromModule(). */
    public async getJobNoFromModule(moduleContext: ModuleExecutionContext): Promise<string> {
        let jobNo: string | undefined;
        try {
            const context = moduleContext;
            if (context.isCombinedRun && context.getCombinedRunSet().length > 0) {
                const firstModule = context.getCombinedRunSet()[0];
                jobNo = await this.deps.env.getEnvValue(firstModule.code);
                this.deps.logger.info(`[Cache Sync] Fetched job number using batch context key [${firstModule.code}]: ${jobNo ?? ''}`);
            } else if (context.isRegistered()) {
                const activeModule = context.require();
                jobNo = await this.deps.env.getEnvValue(activeModule.code);
                this.deps.logger.info(`[Cache Sync] Fetched job number using active module key [${activeModule.code}]: ${jobNo ?? ''}`);
            }
        } catch (error) {
            this.deps.logger.warn('[Cache Sync] Error reading module context metadata.', {
                error: error instanceof Error ? error.message : String(error),
            });
        }

        if (!jobNo) {
            jobNo = (await this.deps.env.getEnvValue('CreatedJobNo')) ?? (await this.deps.env.getEnvValue('JobNumber'));
            this.deps.logger.info(`[Cache Sync] Target module key empty. Using fallback global property: ${jobNo ?? ''}`);
        }

        if (!jobNo) {
            throw new Error('FATAL: No valid Job Number found in .env tracking keys.');
        }
        return jobNo.trim();
    }

    private async clientSearchResult(): Promise<Locator> {
        const client = await this.getClient();
        return this.page.locator(`//span[text()=${xpathLiteral(client)}]`);
    }

    private getDynamicModuleButton(moduleContext: ModuleExecutionContext): Locator {
        const moduleName = moduleContext.require().code;
        return this.page.locator(`//a[normalize-space()=${xpathLiteral(moduleName)}]`);
    }

    public async searchJobProcessData(moduleContext: ModuleExecutionContext): Promise<void> {
        await this.deps.uiActions.waitForPageLoad(6);
        if (await this.deps.uiActions.isVisibleWithin(this.job, 1_000)) {
            await this.deps.uiActions.click(this.jobnoEnterBox);
        }

        const targetedJobNumber = await this.getJobNoFromModule(moduleContext);
        await this.deps.uiActions.fill(this.jobnoEnterBox, targetedJobNumber);
        await this.deps.uiActions.click(this.clientSearchDropdown);
        await this.deps.uiActions.fill(this.clientSearchInput, await this.getClient());
        const result = await this.clientSearchResult();
        await this.deps.uiActions.waitForVisible(result);
        await this.deps.uiActions.click(result);
        await this.deps.uiActions.click(this.searchButton);
        await this.deps.uiActions.waitForAjaxToComplete(30);
    }

    public async verifySearchResults(moduleContext: ModuleExecutionContext): Promise<void> {
        await this.deps.uiActions.click(this.getDynamicModuleButton(moduleContext));
        await this.deps.uiActions.waitForPageLoad(6);
    }

    /** Original fixed-data PVI search flow retained as supplied. */
    public async pviModuleSearch(): Promise<void> {
        await this.deps.uiActions.waitForPageLoad(10);
        await this.deps.uiActions.clear(this.jobnoEnterBox);
        await this.deps.uiActions.click(this.clientSearchDropdown);
        await this.deps.uiActions.waitForVisible(this.clientSearchInput);
        await this.deps.uiActions.fill(this.clientSearchInput, 'swa');
        await this.deps.uiActions.waitForVisible(this.clientSwaOption);
        await this.deps.uiActions.click(this.clientSwaOption);
        this.deps.logger.info("✓ Selected 'Swa' from client dropdown.");

        await this.deps.uiActions.click(this.branchDropdownBtn);
        await this.deps.uiActions.waitForVisible(this.branchAnyCheckbox);

        if (await this.deps.uiActions.isChecked(this.branchNewcastleCheckbox)) {
            await this.deps.uiActions.click(this.branchNewcastleCheckbox);
        }
        if (!(await this.deps.uiActions.isChecked(this.branchAnyCheckbox))) {
            await this.deps.uiActions.click(this.branchAnyCheckbox);
        }

        await this.deps.uiActions.click(this.branchDropdownBtn);
        this.deps.logger.info("✓ Selected 'Any' for branch filter.");
        await this.deps.uiActions.click(this.searchButton);
        await this.deps.uiActions.waitForAjaxToComplete(30);
        await this.deps.uiActions.waitForPageLoad(10);
        await this.deps.uiActions.waitForVisible(this.targetPviRowButton);
        await this.deps.uiActions.click(this.targetPviRowButton);
        this.deps.logger.info('✓ Clicked PVI button for row [CP25-0370 | Swa | Prithvi Nayak].');
        await this.deps.uiActions.waitForPageLoad(10);
    }
}
