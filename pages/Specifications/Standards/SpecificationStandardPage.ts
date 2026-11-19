// pages/Specifications/Standards/SpecificationStandardPage.ts
import { expect, type Locator, type Page } from '@playwright/test';

import { RandomDataUtil } from '../../../utils/dataGenerator';
import { xpathLiteral } from '../../../utils/xpath';
import type { OmsPageServices } from '../../common/pageServices';
import type { ModuleConfig } from '../../Modules/ModuleConfig/ModuleConfig';
import type { ModuleExecutionContext } from '../../Modules/ModuleConfig/ModuleExecutionContext';

export class SpecificationStandardPage {
    private readonly page: Page;
    private readonly deps: OmsPageServices;

    private readonly newButton: Locator;
    private readonly popupYesButton: Locator;
    private readonly specificationNumber: Locator;
    private readonly publicationDate: Locator;
    private readonly classCategory: Locator;
    private readonly description: Locator;
    private readonly fileUpload: Locator;
    private readonly saveButton: Locator;
    private readonly toastMessage: Locator;

    private readonly availableProcessStandardEnterBox: Locator;
    private readonly rightSideArrow: Locator;
    private readonly leftSideArrow: Locator;

    private readonly reviseButton: Locator;
    private readonly yesButton: Locator;
    private readonly publicationDateNotApplicable: Locator;
    private readonly notApplicableComment: Locator;
    private readonly notApplicableSaveButton: Locator;
    private readonly addClassWithdraw: Locator;
    private readonly classCategorySection: Locator;
    private readonly testTechniqueSelectAll: Locator;
    private readonly testTechniqueSaveButton: Locator;
    private readonly linkProcessStandard: Locator;

    private readonly createdSpecificationSearch: Locator;
    private readonly searchButton: Locator;
    private readonly createdSpecification: Locator;

    private specificationNo?: string;
    private activeModule?: ModuleConfig;

    constructor(page: Page, deps: OmsPageServices) {
        this.page = page;
        this.deps = deps;

        // Same XPaths as the Selenium class. Selenium uses the FIRST match;
        // Playwright throws on multiple matches, so .first() keeps that behaviour.
        const xp = (selector: string): Locator => page.locator(`xpath=${selector}`).first();

        this.newButton = xp(`//div[@class='form-group col-sm-2 btn-group']//child::button[@id='btn-new']`);
        this.popupYesButton = xp(`//div[@class='modal-content']//child::button[normalize-space()='Yes']`);
        this.specificationNumber = xp(`//label[contains(normalize-space(),'Specification Number')]//ancestor::div[@class="form-group"]//input[@id='testName']`);
        this.publicationDate = xp(`//label[contains(normalize-space(),'Publication date ')]//ancestor::div[@class="form-group"]//input[@id='datePublication']`);
        this.classCategory = xp(`//label[contains(normalize-space(),'Class/Category/Section')]//ancestor::div[@class="form-group"]//input[@id='categoryName']`);
        this.description = xp(`//label[contains(normalize-space(),'Description')]//ancestor::div[@class="form-group"]//textarea[@id='description']`);
        this.fileUpload = xp(`//input[@id="myfileNew" and @name="myfileNew"]`);
        // Selenium's `button[data-original-title=...]` was missing the @, so only the class branch ever matched.
        this.saveButton = xp(`//button[@data-original-title="Save Specification standard" or @class="btn btn-success btn-save btn-sm"]`);
        this.toastMessage = xp(`//div[@id="toast-container"]//div[@class="toast-message"]`);

        this.availableProcessStandardEnterBox = xp(`//div[@class="col-sm-offset-2 col-sm-5"]//child::input[@id='specificationsMaster']`);
        this.rightSideArrow = xp(`//button[@class='btn btn-success col-sm-8 addTestMethod btn-sm']`);
        this.leftSideArrow = xp(`//button[@class='btn btn-success col-sm-8 removeTestMethod btn-sm']`);

        this.reviseButton = xp(`//button[@id="withdrawn"]`);
        this.yesButton = xp(`//div[contains(text(),'conform with the requirements')]/ancestor::div[contains(@class,'modal-content')]//button[normalize-space()='Yes']`);
        this.publicationDateNotApplicable = xp(`//input[@id="notApplicableChkBox" or @class="notApplicable"]`);
        this.notApplicableComment = xp(`//div[@id="publicationDateCommentModalFooter"]//child::input[@id="publicationDateComment" and @name="publicationDateComment"]`);
        this.notApplicableSaveButton = xp(`//div[@id="publicationDateCommentModalFooter"]//child::button[@id="savePublicationDateComment"]`);
        this.addClassWithdraw = xp(`//button[@id="addwithdrawn" and @class="btn btn-sm btn-addwithdrawn"]`);
        this.classCategorySection = xp(`//button[@title="Select class/category/section"]`);
        this.testTechniqueSelectAll = xp(`//ul[@class="multiselect-container dropdown-menu"]//preceding-sibling::input[@value="multiselect-all"]`);
        this.testTechniqueSaveButton = xp(`//div[@class="form-group col-sm-offset-1"]//preceding-sibling::button[@id="btn-modalSave"]`);
        // The CSS 'button.btn.btn-sm.btn-success' in the old Playwright code matched many buttons;
        // the exact-class XPath is what Selenium used.
        this.linkProcessStandard = xp(`//button[@class="btn btn-sm btn-success"]`);

        this.createdSpecificationSearch = xp(`//input[@id='search_testName']`);
        this.searchButton = xp(`//button[@data-original-title='Search']`);
        this.createdSpecification = xp(`//table[@id="data_table_blue"]/tbody/tr[1]/td[1]`);
    }

    // ====================== Helpers ======================

    private randomNumeric(length: number): string {
        return RandomDataUtil.getNumericString(length);
    }

    private getCurrentModule(moduleContext?: ModuleExecutionContext): ModuleConfig {
        const module = moduleContext?.require() ?? this.activeModule;
        if (!module) {
            throw new Error('No active OMS module found. Pass ModuleExecutionContext to the specification-standard workflow.');
        }
        this.activeModule = module;
        return module;
    }

    private async readModuleEnvValue(module: ModuleConfig, suffix: string): Promise<string> {
        return this.deps.env.requiredModuleEnvValue(module, suffix, [suffix]);
    }

    /** ActionDriver.waitForPageLoad(seconds): bounded, never fails the flow. */
    private async waitForPageLoad(seconds: number): Promise<void> {
        try {
            await this.page.waitForLoadState('load', { timeout: seconds * 1000 });
        } catch {
            this.deps.logger.info(`[SPECIFICATION STANDARD] Page 'load' not reached within ${seconds}s, continuing.`);
        }
    }

    private async isVisibleWithin(locator: Locator, timeoutMs: number): Promise<boolean> {
        try {
            await locator.waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * ActionDriver.toastWaitAndClose: if a toast appears, let it finish; if it lingers, click it away.
     * Waits for the toast to APPEAR first (the old toBeHidden() passed instantly before it showed up,
     * so the toast then covered the mapping input).
     */
    private async waitForToastToDisappear(): Promise<void> {
        if (!(await this.isVisibleWithin(this.toastMessage, 10_000))) {
            this.deps.logger.info('[SPECIFICATION STANDARD] No toast visible, continuing.');
            return;
        }
        this.deps.logger.info(`[SPECIFICATION STANDARD] Toast: ${(await this.toastMessage.innerText()).trim()}`);
        try {
            await this.toastMessage.waitFor({ state: 'hidden', timeout: 20_000 });
        } catch {
            await this.toastMessage.click({ timeout: 3_000 }).catch(() => undefined);
        }
    }

    private async getProcessStdNo(module: ModuleConfig): Promise<string> {
        const processStandardNo = (await this.readModuleEnvValue(module, 'CreatedProcessNo')).trim();
        if (!processStandardNo) {
            throw new Error(`CreatedProcessNo is empty for module ${module.code}`);
        }
        return `${processStandardNo}-Tensile test - all weld`;
    }

    private selectedProcessCheckbox(label: string): Locator {
        return this.page
            .locator(`xpath=//span[@class='list-group-item-text' and contains(normalize-space(),${xpathLiteral(label)})]`)
            .first();
    }

    /** Type key-by-key: the available list filters on key events, which fill() does not fire. */
    private async searchAvailableProcessStandard(label: string): Promise<void> {
        await this.availableProcessStandardEnterBox.click();
        await this.availableProcessStandardEnterBox.clear();
        await this.availableProcessStandardEnterBox.pressSequentially(label, { delay: 30 });
    }

    /** Search, select the option and move it to the selected list (shared by map + revise). */
    private async mapProcessStandard(label: string): Promise<void> {
        await expect(this.availableProcessStandardEnterBox).toBeVisible({ timeout: 15_000 });
        await this.searchAvailableProcessStandard(label);

        const option = this.selectedProcessCheckbox(label);
        await expect(option).toBeVisible({ timeout: 15_000 });
        await option.click();
        await this.rightSideArrow.click();
    }

    /** Select a date in the jQuery UI datepicker (30th of the given month/year). */
    private async selectPublicationDate(month: string = 'Oct', year: string = '2026'): Promise<void> {
        await this.publicationDate.click();

        const calendar = this.page.locator('#ui-datepicker-div:visible');
        await expect(calendar).toBeVisible();
        await calendar.locator('select.ui-datepicker-month').selectOption({ label: month });
        await calendar.locator('select.ui-datepicker-year').selectOption(year);
        await calendar.locator('table.ui-datepicker-calendar a').filter({ hasText: /^30$/ }).click();
        await expect(calendar).toBeHidden();
    }

    // ====================== createSpecificationStandard ======================

    async createSpecificationStandard(moduleContext?: ModuleExecutionContext): Promise<string> {
        const module = this.getCurrentModule(moduleContext);
        let currentStep = 'Initialize specification creation';
        const specNumber =
            `${await this.deps.env.requiredEnvValue('SpecificationStandardNo')}${this.randomNumeric(4)}`;

        try {
            currentStep = 'Read specification description';
            const desc = await this.deps.env.requiredEnvValue('SpecificationStandardDescription');
            this.deps.logger.info(`[SPECIFICATION STANDARD] Creating ${module.code}: ${specNumber}`);

            currentStep = 'Click New and confirm popup';
            await this.newButton.click();
            await this.popupYesButton.click();

            currentStep = 'Enter specification number';
            await this.specificationNumber.fill(specNumber);

            currentStep = 'Select publication date';
            await this.selectPublicationDate('Oct', '2026');

            currentStep = 'Enter class category and description';
            await this.classCategory.fill('Class 1');
            await this.description.fill(desc);

            currentStep = 'Upload supporting document';
            await this.deps.fileUtils.uploadFile(this.fileUpload, 'FeSteel600.pdf');

            currentStep = 'Save specification standard';
            await this.saveButton.click();

            this.deps.logger.info(`[SPECIFICATION STANDARD] Creation submitted: ${specNumber}`);
            return specNumber;
        } catch (error) {
            this.deps.logger.error(
                `[SPECIFICATION CREATION FAILURE] Module=${module.code}, Step=${currentStep}, Specification=${specNumber}, URL=${this.page.url()}, Error=${error instanceof Error ? error.message : String(error)}`
            );
            throw error;
        }
    }

    // ====================== mapProcessStandardToSpecificationStandard ======================

    async mapProcessStandardToSpecificationStandard(moduleContext?: ModuleExecutionContext): Promise<void> {
        const module = this.getCurrentModule(moduleContext);
        let currentStep = 'Initialize process-standard mapping';
        let label = '';

        try {
            this.deps.logger.info(`[SPECIFICATION MAPPING] Starting mapping for ${module.code}`);

            currentStep = 'Read CreatedProcessNo';
            label = await this.getProcessStdNo(module);
            this.deps.logger.info(`[SPECIFICATION MAPPING] Process standard: ${label}`);

            currentStep = 'Wait for page load and toast';
            await this.waitForPageLoad(5);
            await this.waitForToastToDisappear();

            currentStep = 'Search, select and move process standard';
            await this.mapProcessStandard(label);

            this.deps.logger.info(`[SPECIFICATION MAPPING] Process standard mapped successfully: ${label}`);
        } catch (error) {
            this.deps.logger.error(
                `[SPECIFICATION MAPPING FAILURE] Module=${module.code}, Step=${currentStep}, ProcessStandard=${label}, URL=${this.page.url()}, Error=${error instanceof Error ? error.message : String(error)}`
            );
            throw error;
        }
    }

    // ====================== rewiseSpecificationStandard ======================

    async rewiseSpecificationStandard(moduleContext?: ModuleExecutionContext): Promise<string> {
        const module = this.getCurrentModule(moduleContext);
        let currentStep = 'Initialize specification revision';
        let label = '';

        this.specificationNo =
            `${await this.deps.env.requiredEnvValue('SpecificationStandardNo')}${this.randomNumeric(4)}`;

        try {
            this.deps.logger.info(`[SPECIFICATION REVISION] Revising ${module.code}: ${this.specificationNo}`);

            currentStep = 'Read CreatedProcessNo';
            label = await this.getProcessStdNo(module);

            currentStep = 'Click revise and confirm';
            await this.reviseButton.click();
            await expect(this.yesButton).toBeVisible({ timeout: 10_000 });
            await this.yesButton.click();

            currentStep = 'Wait for specification number field';
            await this.waitForPageLoad(5);
            await expect(this.specificationNumber).toBeVisible({ timeout: 20_000 });

            currentStep = 'Enter revised specification number';
            await this.specificationNumber.fill(this.specificationNo);

            currentStep = 'Write CreatedSpecificationNo';
            await this.deps.fileUtils.writeToEnvFile('CreatedSpecificationNo', this.specificationNo);
            await this.deps.env.writeModuleEnvValue(module, 'CreatedSpecificationNo', this.specificationNo);

            currentStep = 'Wait for toast to clear';
            await this.waitForToastToDisappear();

            currentStep = 'Map process standard';
            await this.mapProcessStandard(label);

            // Selenium toggles the checkbox with click(), then clicks it again after saving the comment.
            currentStep = 'Publication date not applicable';
            await this.publicationDateNotApplicable.click();
            await this.notApplicableComment.fill('Publication date not applicable for this specification standard');
            await this.notApplicableSaveButton.click();
            await this.publicationDateNotApplicable.click();

            currentStep = 'Select revised publication date';
            await this.selectPublicationDate('Oct', '2026');

            currentStep = 'Add class withdrawn and select techniques';
            await this.addClassWithdraw.click();
            await this.classCategorySection.click();
            await this.testTechniqueSelectAll.click();
            await this.testTechniqueSaveButton.click();

            currentStep = 'Link process standard';
            await expect(this.linkProcessStandard).toBeVisible({ timeout: 15_000 });
            await this.linkProcessStandard.click();

            this.deps.logger.info(`[SPECIFICATION REVISION] Revision completed: ${this.specificationNo}`);
            return this.specificationNo;
        } catch (error) {
            this.deps.logger.error(
                `[SPECIFICATION REVISION FAILURE] Module=${module.code}, Step=${currentStep}, Specification=${this.specificationNo}, ProcessStandard=${label}, URL=${this.page.url()}, Error=${error instanceof Error ? error.message : String(error)}`
            );
            throw error;
        }
    }

    async reviseSpecificationStandard(moduleContext?: ModuleExecutionContext): Promise<string> {
        return this.rewiseSpecificationStandard(moduleContext);
    }

    // ====================== searchCreatedStandardSpecification ======================

    async searchCreatedStandardSpecification(): Promise<string> {
        let currentStep = 'Initialize specification search';

        try {
            if (!this.specificationNo) {
                throw new Error('Specification number not available. Execute rewiseSpecificationStandard() first.');
            }
            this.deps.logger.info(`[SPECIFICATION SEARCH] Searching: ${this.specificationNo}`);

            currentStep = 'Wait for toast and page load';
            await this.waitForToastToDisappear();
            await this.waitForPageLoad(10);

            currentStep = 'Search specification';
            await expect(this.createdSpecificationSearch).toBeVisible({ timeout: 15_000 });
            await this.createdSpecificationSearch.fill(this.specificationNo);
            await this.searchButton.click();
            await this.waitForPageLoad(10);

            // Selenium: wait up to 10s for the text, log and continue on timeout.
            currentStep = 'Verify search result';
            try {
                await expect(this.createdSpecification).toContainText(this.specificationNo, { timeout: 10_000 });
            } catch {
                this.deps.logger.info(
                    `[SPECIFICATION SEARCH] Sync timed out. Table text: ${await this.createdSpecification.textContent()}`
                );
            }

            const found = ((await this.createdSpecification.textContent()) ?? '').trim();
            this.deps.logger.info(`[SPECIFICATION SEARCH] Created Specification Standard Found in Table: ${found}`);

            // AssertionUtils.hardAssertEquals equivalent
            expect(found, 'Specification Standard creation verification failed!').toBe(this.specificationNo);
            return found;
        } catch (error) {
            this.deps.logger.error(
                `[SPECIFICATION SEARCH FAILURE] Step=${currentStep}, Specification=${this.specificationNo ?? 'NOT SET'}, URL=${this.page.url()}, Error=${error instanceof Error ? error.message : String(error)}`
            );
            throw error;
        }
    }
}
