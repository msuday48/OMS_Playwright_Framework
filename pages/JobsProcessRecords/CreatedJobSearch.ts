import type { Locator, Page } from '@playwright/test';
import type { OmsPageServices } from '../common/pageServices';
import type { ModuleExecutionContext } from '../Modules/ModuleConfig/ModuleExecutionContext';

/** Playwright conversion of the supplied Selenium CreatedJobSearch class. */
export class CreatedJobSearch {
    protected readonly page: Page;
    protected readonly deps: OmsPageServices;
    private readonly jobSearchEnterBox: Locator;
    private readonly searchButton: Locator;
    private readonly createdJobCell: Locator;
    private readonly tableRowTest: Locator;

    constructor(page: Page, deps: OmsPageServices) {
        this.page = page;
        this.deps = deps;
        this.jobSearchEnterBox = page.locator('//input[@name="jobNumber" and @placeholder="Job Number"]');
        this.searchButton = page.locator("//button[@id='search']//i[@class='fa fa-search']");
        this.createdJobCell = page.locator("//tr[@role='row']//td[1]");
        this.tableRowTest = page.locator('//a[@data-original-title="Test, inspection or process standards"]');
    }

    /** Matches Java behavior: first selected module in combined runs, active module otherwise. */
    private async resolveJobNumberToSearch(moduleContext: ModuleExecutionContext): Promise<string> {
        const context = moduleContext;
        if (context.isCombinedRun) {
            const firstModule = context.getCombinedRunSet()[0];
            const jobNo = await this.deps.env.getEnvValue(firstModule.code);
            if (jobNo) return jobNo;
        } else if (context.isRegistered()) {
            const activeModule = context.require();
            const jobNo = await this.deps.env.getEnvValue(activeModule.code);
            if (jobNo) return jobNo;
        }

        const fallback = await this.deps.env.getEnvValue('CreatedJobNo');
        if (!fallback) {
            throw new Error('No Job Number found for the selected module or in CreatedJobNo.');
        }
        return fallback;
    }

    public async searchCreatedJob(moduleContext: ModuleExecutionContext): Promise<void> {
        await this.deps.uiActions.waitForPageLoad(10);
        const targetJobNo = await this.resolveJobNumberToSearch(moduleContext);
        this.deps.logger.info(`Searching for mapped tracking layout string: ${targetJobNo}`);
        await this.deps.uiActions.fill(this.jobSearchEnterBox, targetJobNo);
        await this.deps.uiActions.click(this.searchButton);
    }

    public async verifyCreatedJob(moduleContext: ModuleExecutionContext): Promise<void> {
        await this.deps.uiActions.waitForPageLoad(10);
        const expectedJobNo = await this.resolveJobNumberToSearch(moduleContext);
        try {
            await this.deps.uiAssertions.assertContainsText(this.createdJobCell, expectedJobNo, { timeout: 10_000 });
        } catch {
            this.deps.logger.warn(
                `Search layout syncing exception. Current table text: ${await this.deps.uiActions.getText(this.createdJobCell)}`,
            );
        }

        const actualCreatedJobNo = (await this.deps.uiActions.getText(this.createdJobCell)).trim();
        this.deps.logger.info(`Created UI Item Resolved: ${actualCreatedJobNo}`);
        if (actualCreatedJobNo !== expectedJobNo) {
            throw new Error(
                `Verification check on generated Job matching context parameters failed. Expected "${expectedJobNo}", actual "${actualCreatedJobNo}".`,
            );
        }
    }

    public async CreatedJobTable(): Promise<void> {
        await this.deps.uiActions.click(this.tableRowTest);
        await this.deps.uiActions.waitForPageLoad(5);
    }
}
