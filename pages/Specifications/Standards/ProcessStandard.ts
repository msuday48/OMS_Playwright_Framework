// pages/Specifications/Standards/ProcessStandard.ts
import { expect, type Locator, type Page } from '@playwright/test';

import { RandomDataUtil } from '../../../utils/dataGenerator';
import { xpathLiteral } from '../../../utils/xpath';
import type { OmsPageServices } from '../../common/pageServices';
import type { ModuleConfig } from '../../Modules/ModuleConfig/ModuleConfig';
import type { ModuleExecutionContext } from '../../Modules/ModuleConfig/ModuleExecutionContext';

export class ProcessStandard {
    private readonly page: Page;
    private readonly deps: OmsPageServices;

    private readonly newButton: Locator;
    private readonly proceedButton: Locator;
    private readonly popupYesButton: Locator;
    private readonly standardNo: Locator;
    private readonly testTechnique: Locator;
    private readonly testTechniqueOption: Locator;
    private readonly maximum75CharactersPopup: Locator;
    private readonly publicationDate: Locator;
    private readonly description: Locator;
    private readonly moduleName: Locator;
    private readonly moduleNameSearchBox: Locator;
    private readonly accreditationStdDropdown: Locator;
    private readonly document: Locator;
    private readonly saveButton: Locator;
    private readonly understoodButton: Locator;
    private readonly toastMessage: Locator;

    private readonly availableProcedureEnterBox: Locator;
    private readonly rightSideArrow: Locator;
    private readonly leftSideArrow: Locator;

    private readonly reviseProcessStandardButton: Locator;
    private readonly iAmAwareProceed: Locator;
    private readonly yesButton: Locator;
    private readonly proceedPopup: Locator;
    private readonly publicationDateNotApplicable: Locator;
    private readonly notApplicableComment: Locator;
    private readonly notApplicableSaveButton: Locator;
    private readonly addTechniqueButton: Locator;
    private readonly reviseTestTechnique: Locator;
    private readonly testTechniqueSelectAll: Locator;
    private readonly declareCheckBox: Locator;
    private readonly testTechniqueSaveButton: Locator;
    private readonly understoodPopupButton: Locator;

    private readonly createdProcessStandardSearch: Locator;
    private readonly searchButton: Locator;
    private readonly createdProcessStandard: Locator;

    private processNo?: string;
    private activeModule?: ModuleConfig;

    constructor(page: Page, deps: OmsPageServices) {
        this.page = page;
        this.deps = deps;

        // Selenium picks the FIRST match of an XPath; Playwright throws a strict-mode
        // error when several match. .first() keeps the Selenium behaviour.
        const xp = (selector: string): Locator => page.locator(`xpath=${selector}`).first();

        this.newButton = xp(`//button[@id='btn-new']`);
        this.proceedButton = xp(`//div[@id='approvalModal1']//button[@type='button'][normalize-space()='I am aware. Proceed']`);
        this.popupYesButton = xp(`//button[@class="btn btn btn-sm btn-success" or @data-bb-handler="noclose"]`);
        this.standardNo = xp(`//label[contains(normalize-space(),'Standard No.')]/ancestor::div[contains(@class,'form-group')]//input[@id='testName']`);
        this.testTechnique = xp(`//label[contains(normalize-space(),'Test technique')]/ancestor::div[contains(@class,'form-group')]//input[@id="type"]`);
        this.testTechniqueOption = xp(`//ul[@class="ui-menu ui-widget ui-widget-content ui-autocomplete ui-front"]//child::li[@class="ui-menu-item"]//div[text()="Tensile test - all weld"]`);
        this.maximum75CharactersPopup = xp(`//div[@class="modal-content"]//button[normalize-space()='OK']`);
        this.publicationDate = xp(`//label[contains(normalize-space(),'Publication Date')]/ancestor::div[contains(@class,'form-group')]//input[@id='datePublication']`);
        this.description = xp(`//label[contains(normalize-space(),'Description')]/ancestor::div[contains(@class,'form-group')]//textarea[@id='description']`);
        this.moduleName = xp(`//label[contains(normalize-space(),'Module name')]/ancestor::div[contains(@class,'form-group')]//span[@id='select2-moduleName-container']`);
        this.moduleNameSearchBox = xp(`//span[contains(@class,'select2-dropdown')]//input[contains(@class,'select2-search__field')]`);
        this.accreditationStdDropdown = xp(`//label[contains(normalize-space(), 'Accreditation standard')]//ancestor::div[@class="form-group"]//select[@id='accreditationType']`);
        this.document = xp(`//input[@id="document" and @name="document"]`);
        this.saveButton = xp(`//button[@id='btn-save']`);
        this.understoodButton = xp(`//button[@id='popupUnderstoodBtn']`);
        this.toastMessage = xp(`//div[@id="toast-container"]//div[@class="toast-message"]`);

        this.availableProcedureEnterBox = xp(`//div[@class="col-sm-offset-2 col-sm-5"]//child::input[@id='testProcedureMaster']`);
        this.rightSideArrow = xp(`//i[@class='fa fa-arrow-right addTestProcedure']`);
        this.leftSideArrow = xp(`//button[@class='btn btn-success col-sm-8 removeTestProcedure btn-sm']`);

        this.reviseProcessStandardButton = xp(`//button[@id="withdrawn"]`);
        this.iAmAwareProceed = xp(`//div[@class="modal-content"]//child::button[text()="I am aware. Proceed"]`);
        this.yesButton = xp(`//div[contains(text(),'conform with the requirements')]/ancestor::div[contains(@class,'modal-content')]//button[normalize-space()='Yes']`);
        this.proceedPopup = xp(`//div[@class="modal-content"]//button[@data-bb-handler="confirm" and text()="Proceed"]`);
        this.publicationDateNotApplicable = xp(`//input[@id="notApplicableChkBox" or @class="notApplicable"]`);
        this.notApplicableComment = xp(`//div[@id="publicationDateCommentModalFooter"]//child::input[@id="publicationDateComment" and @name="publicationDateComment"]`);
        this.notApplicableSaveButton = xp(`//div[@id="publicationDateCommentModalFooter"]//child::button[@id="savePublicationDateComment"]`);
        this.addTechniqueButton = xp(`//button[@id="addwithdrawn" and normalize-space()="Add technique / Withdrawn / Superseded / Similar"]`);
        this.reviseTestTechnique = xp(`//div[@id="createType2"]//child::button[@title="Select test technique"]//span[normalize-space()="Select test technique"]`);
        this.testTechniqueSelectAll = xp(`//ul[@class="multiselect-container dropdown-menu"]//preceding-sibling::input[@value="multiselect-all"]`);
        this.declareCheckBox = xp(`//div[@class="checkbox5 col-sm-9 col-sm-offset-3"]//preceding-sibling::input[@id="checkbox5"]`);
        this.testTechniqueSaveButton = xp(`//div[@class="form-group col-sm-offset-1"]//preceding-sibling::button[@id="btn-modalSave"]`);
        this.understoodPopupButton = xp(`//button[@id="extendUnderstoodBtn"]`);

        this.createdProcessStandardSearch = xp(`//label[text()="Process Standard"]/ancestor::div[@class="form-group col-md-3"]//input[@id="search_name"]`);
        this.searchButton = xp(`//button[@data-original-title='Search']`);
        this.createdProcessStandard = xp(`//table[@id="data_table_blue"]/tbody/tr[1]/td[1]`);
    }

    // ====================== Helpers ======================

    private randomNumeric(length: number): string {
        return RandomDataUtil.getNumericString(length);
    }

    private randomAlphabetic(length: number): string {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        return Array.from({ length }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    }

    private getCurrentModule(moduleContext?: ModuleExecutionContext): ModuleConfig {
        const module = moduleContext?.require() ?? this.activeModule;
        if (!module) {
            throw new Error('No active OMS module found. Pass ModuleExecutionContext first.');
        }
        this.activeModule = module;
        return module;
    }

    /** ActionDriver.waitForPageLoad(seconds): bounded, never fails the flow. */
    private async waitForPageLoad(seconds: number): Promise<void> {
        try {
            await this.page.waitForLoadState('load', { timeout: seconds * 1000 });
        } catch {
            this.deps.logger.info(`[PROCESS STANDARD] Page 'load' not reached within ${seconds}s, continuing.`);
        }
    }

    /** true if the locator becomes visible within the timeout; never throws. */
    private async isVisibleWithin(locator: Locator, timeoutMs: number): Promise<boolean> {
        try {
            await locator.waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    private selectedProcedureCheckbox(pNo: string): Locator {
        return this.page
            .locator(`xpath=//span[@class='list-group-item-text' and contains(normalize-space(),${xpathLiteral(pNo)})]`)
            .first();
    }

    private async selectPublicationDate(month: 'Dec' | 'Nov'): Promise<void> {
        await this.publicationDate.click();

        const calendar = this.page.locator('#ui-datepicker-div:visible');
        await expect(calendar).toBeVisible();
        await calendar.locator('select.ui-datepicker-month').selectOption({ label: month });
        await calendar.locator('select.ui-datepicker-year').selectOption('2026');
        await calendar.getByRole('link', { name: '30', exact: true }).click();
        await expect(calendar).toBeHidden();
    }

    private async selectModuleName(module: ModuleConfig): Promise<void> {
        this.deps.logger.info(`[PROCESS STANDARD] Selecting module: ${module.moduleLabel}`);
        await this.moduleName.click();
        await expect(this.moduleNameSearchBox).toBeVisible();
        await this.moduleNameSearchBox.fill(module.moduleLabel);
        await this.moduleNameSearchBox.press('Enter');
    }

    /** ActionDriver.toastWaitAndClose: dismiss a toast if one is showing. */
    private async closeToastIfVisible(): Promise<void> {
        if (await this.toastMessage.isVisible()) {
            await this.toastMessage.click();
        }
    }

    /** Wait for the save toast to appear and go away; click it away if it lingers. */
    private async waitForSaveToastToDisappear(): Promise<void> {
        if (!(await this.isVisibleWithin(this.toastMessage, 15_000))) {
            this.deps.logger.info('[PROCESS STANDARD] No save toast appeared, continuing.');
            return;
        }
        this.deps.logger.info(`[PROCESS STANDARD] Save toast: ${(await this.toastMessage.innerText()).trim()}`);
        try {
            await this.toastMessage.waitFor({ state: 'hidden', timeout: 30_000 });
        } catch {
            await this.closeToastIfVisible();
        }
    }

    /** Closes the "Add create similar" caution dialog if it shows up. Returns true if it was closed. */
    private async closeAddCreateSimilarCautionIfShown(): Promise<boolean> {
        const modal = this.page.locator(
            `xpath=//div[contains(@class,'modal-dialog')][.//h4[normalize-space()='Caution:'] and .//div[contains(@class,'modal-body')]//strong[contains(.,'Add create similar')]]`
        );
        if (!(await this.isVisibleWithin(modal, 5_000))) return false;

        await modal.locator('.modal-header button.close[data-dismiss="modal"]').click();
        await expect(modal).toBeHidden({ timeout: 10_000 });
        this.deps.logger.info('[PROCESS STANDARD MAPPING] Closed Add Create Similar caution dialog.');
        return true;
    }

    // ====================== createProcessStandard ======================

    async createProcessStandard(moduleContext: ModuleExecutionContext): Promise<string> {
        const module = this.getCurrentModule(moduleContext);
        const processStandardNo =
            `${await this.deps.env.requiredEnvValue('ProcessStandardNo')}${this.randomNumeric(4)}`;
        const procDescription = await this.deps.env.requiredEnvValue('ProcessStandardDescription');

        this.deps.logger.info(`[PROCESS STANDARD] Creating ${module.code} standard: ${processStandardNo}`);

        await this.newButton.click();
        await this.proceedButton.click();
        await this.popupYesButton.click();

        // 76-character entry triggers the "maximum 75 characters" popup (as in Selenium).
        // Typed key-by-key, because the OMS check is keyboard-driven and fill() fires no key events.
        await this.standardNo.click();
        await this.standardNo.pressSequentially(this.randomAlphabetic(76));
        await this.maximum75CharactersPopup.click();
        await this.standardNo.fill(processStandardNo);

        await this.testTechnique.click();
        await this.testTechniqueOption.click();

        await this.selectPublicationDate('Dec'); // 30-Dec-2026

        await this.description.fill(procDescription);
        await this.selectModuleName(module);
        await this.accreditationStdDropdown.selectOption({ value: 'ISO / IEC 17025 Calibration' });

        await this.deps.fileUtils.uploadFile(this.document, 'ENGINEERING_SERVICES.pdf');

        await this.saveButton.dblclick();
        await this.understoodButton.click();

        // Selenium's toastWaitAndClose: let the save toast finish before procedure mapping starts.
        await this.waitForSaveToastToDisappear();

        this.deps.logger.info(`[PROCESS STANDARD] Created: ${processStandardNo}`);
        return processStandardNo;
    }

    // ====================== mapProcedureToProcessStandard ======================

    async mapProcedureToProcessStandard(moduleContext?: ModuleExecutionContext): Promise<void> {
        const module = this.getCurrentModule(moduleContext);
        let currentStep = 'Initialize procedure mapping';
        let createdProcedureNo = '';

        try {
            this.deps.logger.info(`[PROCESS STANDARD MAPPING] Starting mapping for ${module.code}`);

            currentStep = 'Wait for page and toast';
            await this.waitForPageLoad(5);
            await this.closeToastIfVisible();

            currentStep = 'Wait for available procedure input';
            await expect(this.availableProcedureEnterBox).toBeVisible({ timeout: 15_000 });
            await expect(this.availableProcedureEnterBox).toBeEnabled();

            currentStep = 'Read procedure values';
            createdProcedureNo = (await this.deps.env.requiredModuleEnvValue(module, 'CreatedProcedureNo', ['CreatedProcedureNo'])).trim();
            const procedureName = (await this.deps.env.requiredEnvValue('ProcedureName')).trim();
            if (!createdProcedureNo) {
                throw new Error(`CreatedProcedureNo is empty for module ${module.code}`);
            }
            const procedureLabel = `${createdProcedureNo} - ${procedureName}`;
            this.deps.logger.info(`[PROCESS STANDARD MAPPING] Procedure: ${procedureLabel}`);

            currentStep = 'Search procedure';
            // Typed key-by-key: the Available Procedures list filters on key events,
            // which fill() does not fire (this is why the first search "did not refresh").
            await this.availableProcedureEnterBox.click();
            await this.availableProcedureEnterBox.clear();
            await this.availableProcedureEnterBox.pressSequentially(createdProcedureNo, { delay: 30 });

            const procedureOption = this.selectedProcedureCheckbox(procedureLabel);

            if (!(await this.isVisibleWithin(procedureOption, 5_000))) {
                currentStep = 'Retry search / close caution dialog';
                this.deps.logger.info(`[PROCESS STANDARD MAPPING] Option not visible yet, retrying ${createdProcedureNo}.`);
                await this.availableProcedureEnterBox.click();
                await this.closeAddCreateSimilarCautionIfShown();
            }

            currentStep = 'Wait for created procedure option';
            await expect(procedureOption).toBeVisible({ timeout: 20_000 });
            this.deps.logger.info(`[PROCESS STANDARD MAPPING] Procedure found in list: ${procedureLabel}`);

            currentStep = 'Move procedure to selected list';
            await procedureOption.click();
            await this.rightSideArrow.click();
            await procedureOption.waitFor({ state: 'attached' });

            currentStep = 'Move procedure back to available list';
            await procedureOption.click();
            await this.leftSideArrow.click();

            currentStep = 'Final procedure mapping';
            await procedureOption.click();
            await this.rightSideArrow.click();

            this.deps.logger.info('[PROCESS STANDARD MAPPING] Mapping completed successfully.');
        } catch (error) {
            this.deps.logger.error(
                `[PROCESS STANDARD MAPPING FAILURE] Step="${currentStep}", Module="${module.code}", Procedure="${createdProcedureNo}", URL="${this.page.url()}", Error="${error instanceof Error ? error.message : String(error)}"`
            );
            throw error;
        }
    }

    // ====================== rewiseProcessStandard ======================

    async rewiseProcessStandard(moduleContext?: ModuleExecutionContext): Promise<string> {
        const module = this.getCurrentModule(moduleContext);
        this.processNo =
            `${await this.deps.env.requiredEnvValue('ProcessStandardNo')}${this.randomNumeric(4)}`;

        this.deps.logger.info(`[PROCESS STANDARD REVISION] Revising ${module.code}: ${this.processNo}`);

        await this.reviseProcessStandardButton.click();
        await this.iAmAwareProceed.click();
        await this.yesButton.click();
        await this.waitForPageLoad(5);
        await expect(this.proceedPopup).toBeVisible({ timeout: 10_000 });
        await this.proceedPopup.click();
        await this.standardNo.fill(this.processNo);

        await this.deps.fileUtils.writeToEnvFile('CreatedProcessNo', this.processNo);
        await this.deps.env.writeModuleEnvValue(module, 'CreatedProcessNo', this.processNo);

        await this.mapProcedureToProcessStandard(moduleContext);

        await this.publicationDateNotApplicable.click();
        await this.notApplicableComment.fill('Publication date not applicable for this process standard');
        await this.notApplicableSaveButton.click();
        await this.publicationDateNotApplicable.click();
        await this.selectPublicationDate('Nov'); // 30-Nov-2026

        await this.addTechniqueButton.click();
        await this.reviseTestTechnique.click();
        await this.testTechniqueSelectAll.click();
        await this.declareCheckBox.click();
        await this.testTechniqueSaveButton.click();

        // Selenium: try { click } catch { ignore }. The popup appears AFTER the save,
        // so wait for it briefly instead of checking visibility instantly.
        if (await this.isVisibleWithin(this.understoodPopupButton, 5_000)) {
            await this.understoodPopupButton.click();
        }

        this.deps.logger.info(`[PROCESS STANDARD REVISION] Revision completed: ${this.processNo}`);
        return this.processNo;
    }

    async reviseProcessStandard(moduleContext?: ModuleExecutionContext): Promise<string> {
        return this.rewiseProcessStandard(moduleContext);
    }

    // ====================== searchCreatedProcessStandard ======================

    async searchCreatedProcessStandard(): Promise<string> {
        if (!this.processNo) {
            throw new Error('Process number not found. Execute rewiseProcessStandard() first.');
        }

        await this.closeToastIfVisible();
        await this.waitForPageLoad(5);
        await expect(this.createdProcessStandardSearch).toBeVisible();
        await this.createdProcessStandardSearch.fill(this.processNo);
        await this.searchButton.click();
        await this.waitForPageLoad(5);

        // Selenium: wait up to 10s for the text, log and continue on timeout.
        try {
            await expect(this.createdProcessStandard).toContainText(this.processNo, { timeout: 10_000 });
        } catch {
            this.deps.logger.info(
                `[PROCESS STANDARD SEARCH] Sync timed out. Cell: ${await this.createdProcessStandard.textContent()}`
            );
        }

        const found = ((await this.createdProcessStandard.textContent()) ?? '').trim();
        this.deps.logger.info(`[PROCESS STANDARD SEARCH] Process Standard in table: ${found}`);

        // AssertionUtils.hardAssertEquals equivalent
        expect(found, 'Process Standard creation verification failed!').toBe(this.processNo);
        return found;
    }
}