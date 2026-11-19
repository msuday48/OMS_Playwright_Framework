import { randomInt } from 'node:crypto';
import type { Locator, Page } from '@playwright/test';
import { xpathLiteral } from '../../utils/xpath';
import type { OmsPageServices } from '../common/pageServices';
import type { ModuleConfig } from '../Modules/ModuleConfig/ModuleConfig';
import type { ModuleExecutionContext } from '../Modules/ModuleConfig/ModuleExecutionContext';

/**
 * Playwright conversion of the Selenium CreateJob class.
 * XPath selectors and business workflow order are retained.
 *
 * Locator conventions:
 *  - xp()        : first match (Selenium findElement behaviour; avoids strict-mode errors)
 *  - xpVisible() : first VISIBLE match. Used for modal/bootbox buttons and autocomplete menus,
 *                  because OMS leaves closed/fading modals and hidden jQuery UI menus in the DOM,
 *                  so a plain XPath matches several.
 *
 * Selenium -> Playwright behaviour notes:
 *  - Selenium sendKeys() fires real key events; Playwright fill() does NOT. Inputs that react to
 *    key events (jQuery UI autocomplete, "type to shortlist" lists) must use pressSequentially().
 *
 * Job Schedule notes (TS_005 step 7):
 *  - Job Schedule is an INLINE panel (#jobScheduleDiv), not a modal. The assignee control is a
 *    bootstrap-multiselect dropdown, closed by clicking outside it (or Escape).
 *  - Row 1 assignees can be pre-selected by OMS, so selection is idempotent (never toggles off).
 *  - Row 2 fields are readonly / pointer-events:none until its start date is picked.
 */
export class CreateJob {
    protected readonly page: Page;
    protected readonly deps: OmsPageServices;
    private readonly l: Record<string, Locator>;

    constructor(page: Page, deps: OmsPageServices) {
        this.page = page;
        this.deps = deps;

        const xp = (selector: string): Locator => page.locator(`xpath=${selector}`).first();
        const xpVisible = (selector: string): Locator =>
            page.locator(`xpath=${selector} >> visible=true`).first();

        const l: Record<string, Locator> = {
            clientNameDropdown: xp("//span[@class='selection']//child::span[text()='Type and select a client']"),
            clientNameEnterTextDropdown: xp("//input[contains(@class,'select2-search__field') and @aria-controls='select2-clientId-results']"),
            clientNameNoResultsfound: xp("//li[contains(@class,'select2-results__message') and contains(text(),'No results')]"),
            creditLimitPopup: xpVisible("//b[contains(text(),'Credit limit exceeded')]//following::button[text()='OK']"),
            popupUnderstoodButton: xpVisible("//h4[text()='Special Instruction']//ancestor::div[@class='modal-content']//button[text()='Understood']"),
            additionalRequestCheckBox: xp("//input[@id='requestedByAdditionalCheckbox']"),
            additionalRequestEnterBox: xp("//input[@id='requestedByAdditional']"),
            CodOnlyYesButton: xp("//label[contains(normalize-space(),'COD only')]/ancestor::div[contains(@class,'row')] //label[normalize-space()='Yes']"),
            CodOnlyNoButton: xp("//label[contains(normalize-space(),'COD only')]/ancestor::div[contains(@class,'row')] //label[normalize-space()='No']"),
            codOnlyPopButton: xpVisible("//h4[normalize-space()='Please note']/ancestor::div[contains(@class,'modal-content')]//button[@data-bb-handler='understood' and normalize-space()='Understood']"),
            jobConfirmationYesButton: xp("//label[contains(normalize-space(),'Send job confirmation')]/ancestor::div[contains(@class,'row')] //label[normalize-space()='Yes']"),
            JobConfirmationNoButton: xp("//label[contains(normalize-space(),'Send job confirmation')]/ancestor::div[contains(@class,'row')] //label[normalize-space()='No']"),
            attachlimitationsYesButton: xp("//label[contains(normalize-space(),'Attach limitations with job confirmation email')]/ancestor::div[contains(@class,'row')]//label[normalize-space()='Yes']"),
            attachLimitationsNoButton: xp("//label[contains(normalize-space(),'Attach limitations with job confirmation email')]/ancestor::div[contains(@class,'row')]//label[normalize-space()='No']"),
            imagesPerPageDropdown: xp("//label[contains(normalize-space(),'Images per page on Report')]/ancestor::div[contains(@class,'row')] //select[@id='noOfImagesPerPage']"),
            certificatesWithReportsYesButton: xp("//label[contains(normalize-space(),'Include tester/inspector certificates with reports')]/ancestor::div[contains(@class,'row')] //label[normalize-space()='Yes']"),
            certificatesWithReportsNoButton: xp("//label[contains(normalize-space(),'Include tester/inspector certificates with reports')]/ancestor::div[contains(@class,'row')] //label[normalize-space()='No']"),
            clientSignatureOnRecordYesButton: xp("//label[contains(normalize-space(),'Client signature MUST on work record')]/ancestor::div[contains(@class,'row')] //label[normalize-space()='Yes']"),
            clientSignatureOnRecordNoButton: xp("//label[contains(normalize-space(),'Client signature MUST on work record')]/ancestor::div[contains(@class,'row')] //label[normalize-space()='No']"),
            clientSignatureOnReportsYesButton: xp("//label[contains(normalize-space(),'Include client signature on report')]/ancestor::div[contains(@class,'row')] //label[normalize-space()='Yes']"),
            clientSignatureOnReportsNoButton: xp("//label[contains(normalize-space(),'Include client signature on report')]/ancestor::div[contains(@class,'row')] //label[normalize-space()='No']"),
            freeProposal: xp("//label[contains(normalize-space(),'Fee proposal')]/ancestor::div[contains(@class,'row')]//input[@placeholder='Quote or Fee proposal No. or Schedule of rates']"),
            freeProsoalFileUpload: xp("//input[@type='file' and @id='qoDocument']"),
            invalidfileupload: xpVisible("//button[@data-dismiss='modal' and text()='Close']"),
            purchaseOrder: xp("//input[@name='purchaseOrder']"),
            purchaseOrderFileUpload: xp("//input[@type='file' and @id='poDocument']"),
            clientJobRequestNo: xp("//input[@id='jobRequestNo']"),
            clientJobRequestFileUpload: xp("//input[@type='file' and @id='jobRequestNoDocument']"),
            specialInstructions: xp("//label[contains(normalize-space(),'Special instructions')]/ancestor::div[contains(@class,'row')]//textarea[@placeholder='Type special instructions for this job']"),
            specialInstructionFileUpload: xp("//input[@type='file' and @id='siDocument']"),
            clientcorrespondenceemail: xp("//input[@name='clientCorrespondence']"),
            ClientCorrespondenceEmails: xp("//label[contains(normalize-space(),'Client correspondence emails')]/ancestor::div[contains(@class,'row')] //input[@name='clientCorrespondence']"),
            clientCorrespondenceEmailsFileUpload: xp("//input[@type='file' and @id='clientDocument']"),
            RequiredonCalender: xp("//span[contains(normalize-space(),'Required on (from)')]/ancestor::div[contains(@class,'row')]//input[@id='requiredByDate']"),
            recieveddate: xp("//input[@placeholder='Click to select' and @id='receivedDate']"),
            createJob: xp("//div[contains(@class,'form-row')]//child::button[@id='createJobButton']"),
            jobRequestNo: xp("//label[contains(normalize-space(), 'Client Job Request No.')]/parent::div//input[@id='jobRequestNo']"),
            // Tolerant on class and VISIBLE only, because several hidden jQuery UI autocomplete menus exist on this page.
            jobRequestEnterText: xpVisible("//ul[contains(@class,'ui-autocomplete')]//div[contains(normalize-space(),'As per attached document')]"),
            jobRequestupload: xp("//label[contains(normalize-space(),'Client Job Request No.')]/parent::div//button[contains(@class,'btn-upload-document')]"),
            jobRequestfileUpload: xp("//h4[contains(normalize-space(),'Client Job Request No.')]/ancestor::div//input[@id='jobDocument']"),
            jobrequestFileDelete: xpVisible("//h4[contains(normalize-space(),'Client Job Request No.')]/ancestor::div//button[@title='Delete document']"),
            jobRequestdownloadButton: xpVisible("//h4[contains(normalize-space(),'Client Job Request No.')]/ancestor::div//button[@title='Download document']"),
            jobRequestFileUploadPopupClose: xpVisible("//h4[contains(normalize-space(),'Client Job Request No.')]/ancestor::div//button[@id='close-documents-modal']"),
            clientCorrespondenceEmail: xp("//label[contains(normalize-space(), 'Client correspondence emails')]/parent::div//input[@name='clientCorrespondence']"),
            clientCorrespondenceupload: xp("//button[@data-type='CD' and contains(@class,'btn-upload-document')]"),
            clientCorrespondenceFileUpload: xp("//h4[contains(normalize-space(),'Client correspondence emails')]/ancestor::div//input[@id='jobDocument']"),
            clientCorrespondenceFileDownload: xpVisible("//h4[contains(normalize-space(),'Client correspondence emails')]/ancestor::div//button[@title='Download document']"),
            clientCorrespondenceFileDelete: xpVisible("//h4[contains(normalize-space(),'Client correspondence emails')]/ancestor::div//button[@title='Delete document']"),
            clientCorrespondenceCloseButton: xpVisible("//h4[contains(normalize-space(),'Client correspondence emails')]/ancestor::div//button[@id='close-documents-modal']"),
            projectName: xp("//label[contains(normalize-space(),'Project name / Items description')]/ancestor::div//textarea[@id='jobDescription']"),
            identification: xp("//label[contains(normalize-space(),'Project name / Items description')]/ancestor::div//textarea[@id='identification']"),
            identificationupload: xp("//button[@data-type='jobExcelData' and contains(@class,'btn-upload-document')]"),
            identificationFileUpload: xp("//input[@name='jobDocument']"),
            identificationFileDownloadButton: xpVisible("//div[contains(@class,'modal-content')]//p[normalize-space()='data.xlsx']/ancestor::div[contains(@class,'fileName')]/following-sibling::div//button[contains(@class,'btn-download-document')]"),
            identificationFileDelete: xpVisible("//p[normalize-space()='data.xlsx']/ancestor::div[contains(@class,'fileName')]/following-sibling::div//button[contains(@class,'btn-delete-document')]"),
            IdentificationPopupClose: xpVisible("//div[contains(@class,'modal-content')]//button[@id='close-documents-modal']"),
            jobDeatailSpecialInstructions: xp("//div[@class='input-group']//textarea[@name='specialInstructions']"),
            materialNameEnterText: xp("//input[@id='materialMaster' and @type='text']"),
            materialRightArrow: xp("//div[@class='col-sm-2']//child::i[@class='fa fa-arrow-right addItem']"),
            materialSelectedCheckBox: xp("//div[@id='toMaterial']//span[contains(normalize-space(),'Steel Grade')]"),
            requirementSpecification: xp("//input[@id='specificationsMaster']"),
            acceptanceCriteria: xp("//button[@class='multiselect dropdown-toggle btn btn-default acceptance-margin']"),
            acceptenceCriteriaEnterTextBox: xp("//div[@class='btn-group open']//input[@placeholder='Search' and @class='form-control multiselect-search']"),
            getFirstAcceptanceCriteriaCheckbox: xp("(//ul[contains(@class,'multiselect-container')]//input[@type='checkbox'])[1]/parent::label"),
            recivedByDropdown: xp("//span[@id='select2-receivedBy-container']"),
            recivedByEnterText: xp("//input[@class='select2-search__field' and @aria-controls='select2-receivedBy-results']"),
            projectmanagerdropdown: xp("//span[@id='select2-projectManager-container']"),
            projectmanagerEnterText: xp("//input[@class='select2-search__field' and @aria-controls='select2-projectManager-results']"),

            // ---- Job Schedule (inline panel, NOT a modal) ----
            jobScheduleStartDate: xp("//div[@id='jobScheduleDiv']//input[@id='startDate-1']"),
            jobScheduleEdurationHours: xp("//input[@data-bvalidator-msg-timingshhmm='Please enter duration in HH:MM format']"),
            JobAssignedTo: xp("//tr[td/input[@id='startDate-1']]//button[contains(@class,'multiselect dropdown-toggle')]"),
            jobassignedToEnterTextBox: xp("//div[contains(@class,'btn-group') and contains(@class,'open')]//input[contains(@class,'multiselect-search')]"),
            // Matches only while the multiselect is open; becomes "detached" once it closes.
            jobScheduleOpenDropdown: xp("//div[@id='jobScheduleDiv']//div[contains(@class,'responsive-multiselect') and contains(@class,'open')]"),
            // Neutral click target used to close the dropdown. Do NOT use the panel title: it collapses the panel.
            jobScheduleNeutralHeader: xp("//div[@id='jobScheduleDiv']//th[contains(normalize-space(),'To date')]"),
            jobScheduleAssignedHidden: xp("//input[@name='jobScheduleAssignedToHidden-1']"),
            jobSchedulenewRow: xp("//button[@data-original-title='Add new row']"),
            jobScheduleStartDate2: xp("//div[@id='jobScheduleDiv']//input[@id='startDate-2']"),
            jobScheduleEdurationHours2: xp("//input[@name='duration-2' and @placeholder='HH:MM']"),
            jobScheduleDeleteRow2: xp("//tr[td/input[@id='startDate-2']]//button[contains(@class,'delete-row')]"),
            jobScheduleDeleteRowPopup: xpVisible("//button[@class='btn btn-success pull-right' and @data-bb-handler='confirm']"),

            downloadButton: xp("//button[contains(normalize-space(),'Download')][@id='download']"),
            swmsButton: xp("//button[@class='btn btn-secondary' or @data-original-title='SWMS']"),
            swmsCheckBox: xp("//h5[contains(normalize-space(),'SWMS - Safe Work Method Statement')]/ancestor::div//input[@id='linkExistingSwmsCheckBox']"),
            swmsNumber: xp("//h5[contains(normalize-space(),'SWMS - Safe Work Method Statement')]/ancestor::div//input[@placeholder='SWMS number']"),
            copyExistingSwms: xp("//h5[contains(normalize-space(),'SWMS - Safe Work Method Statement')]/ancestor::div//input[@id='copyExistingSwmsCheckBox']"),
            swmsJobNumber: xp("//h5[contains(normalize-space(),'SWMS - Safe Work Method Statement')]/ancestor::div//input[@id='selectedJobNumber']"),
            swmsCancelButton: xpVisible("//h5[contains(normalize-space(),'SWMS - Safe Work Method Statement')]/ancestor::div//button[@class='btn btn-danger btn-sm']"),
            updateJob: xp("//button[contains(normalize-space(),'Update Job')][@id='next_form']"),
            toastMessage: xp("//div[@id='toast-container']//div[@class='toast-message']"),
        };
        this.l = l;
    }

    // ====================== Data helpers ======================

    private async getClient(): Promise<string> {
        return this.deps.env.requiredEnvValue('CreatedClient');
    }

    private async getMaterialGrade(): Promise<string> {
        return this.deps.env.requiredEnvValue('CreatedMaterialGrade');
    }

    private async getRequirementSpec(moduleContext: ModuleExecutionContext): Promise<string> {
        const module = moduleContext.require();
        return this.deps.env.requiredModuleEnvValue(module, 'CreatedSpecificationNo', ['CreatedSpecificationNo']);
    }

    private async getFilesUpload(): Promise<string> {
        return this.deps.env.requiredEnvValue('FilesUpload');
    }

    private async getProcessStandard(): Promise<string> {
        return this.deps.env.requiredEnvValue('ProcessStandardNo');
    }

    private async getProcedure(): Promise<string> {
        return this.deps.env.requiredEnvValue('ProcedureNo');
    }

    // ====================== Dynamic locators ======================

    private async clientNameResultsDropdown(): Promise<Locator> {
        const client = await this.getClient();
        return this.page
            .locator(`xpath=//ul[@id='select2-clientId-results']//li[contains(text(),${xpathLiteral(client)})]`)
            .first();
    }

    /**
     * The OMS material checkbox is visually hidden by the checkbox-list styling.
     * Its containing label is the visible, clickable control (see #fromMaterial HTML).
     */
    private materialOptionLabel(grade: string): Locator {
        return this.page
            .locator(
                `xpath=(//div[@id='fromMaterial']//input[@type='checkbox' and @data-value=${xpathLiteral(grade)}]/ancestor::label[1])[1]`,
            )
            .first();
    }

    private materialCheckbox(grade: string): Locator {
        return this.page
            .locator(
                `xpath=(//div[@id='fromMaterial']//input[@type='checkbox' and @data-value=${xpathLiteral(grade)}])[1]`,
            )
            .first();
    }

    /** The selected material is rendered in the right-hand #toMaterial list. */
    private selectedMaterialOption(grade: string): Locator {
        return this.page
            .locator(
                `xpath=//div[@id='toMaterial']//span[contains(normalize-space(),${xpathLiteral(grade)})]`,
            )
            .first();
    }

    private dynamicSpan(containerId: string, value: string): Locator {
        return this.page
            .locator(`xpath=//div[@id='${containerId}']//div[contains(@data-value,${xpathLiteral(value)})]//span`)
            .first();
    }

    /** Assignee label inside the currently OPEN Job Schedule multiselect. Name is not hardcoded. */
    private assigneeLabel(name: string): Locator {
        return this.page
            .locator(
                `xpath=//div[contains(@class,'responsive-multiselect') and contains(@class,'open')]//label[contains(@class,'checkbox')][contains(normalize-space(),${xpathLiteral(name)})]`,
            )
            .first();
    }

    public randomgmail(): string {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const randomLetters = Array.from({ length: 5 }, () => alphabet[randomInt(alphabet.length)]).join('');
        const randomDigits = randomInt(0, 1000).toString().padStart(3, '0');
        return `${randomLetters}${randomDigits}@gmail.com`;
    }

    private randomNumber(): string {
        return randomInt(0, 1000).toString().padStart(3, '0');
    }

    // ====================== Interaction helpers ======================

    /**
     * Click "Understood" on the bootbox "Please note" popup and WAIT until it is gone.
     * Without the wait, the closing modal is still in the DOM when the next "Please note"
     * popup opens, which caused a strict-mode violation.
     */
    private async acknowledgeCodPopup(): Promise<void> {
        await this.deps.uiActions.waitForVisible(this.l.codOnlyPopButton);
        await this.deps.uiActions.click(this.l.codOnlyPopButton);
        await this.deps.uiActions.waitForHidden(this.l.codOnlyPopButton);
    }

    /**
     * Type key-by-key into "type to shortlist" inputs. These lists filter on key events,
     * which fill() does not fire.
     */
    private async typeToFilter(input: Locator, text: string): Promise<void> {
        await input.click();
        await input.fill('');
        await input.pressSequentially(text, { delay: 30 });
    }

    /**
     * jQuery UI autocomplete (e.g. Client Job Request No.).
     * Types key-by-key, waits for the visible suggestion and clicks it. If the menu does not
     * appear, falls back to ArrowDown + Enter on the input.
     */
    private async pickAutocompleteSuggestion(input: Locator, text: string, suggestion: Locator): Promise<void> {
        await input.click();
        await input.fill('');
        await input.pressSequentially(text, { delay: 30 });

        const menuShown = await suggestion
            .waitFor({ state: 'visible', timeout: 5_000 })
            .then(() => true)
            .catch(() => false);

        if (menuShown) {
            await this.deps.uiActions.click(suggestion);
            return;
        }

        this.deps.logger.warn(`Autocomplete menu did not appear for "${text}"; using keyboard fallback.`);
        await input.press('ArrowDown');
        await input.press('Enter');
    }

    /** Select2: wait for results to load, then press Enter on the highlighted option. */
    private async pressEnterOnSelect2(searchBox: Locator): Promise<void> {
        await this.page
            .locator('xpath=//li[contains(@class,"loading-results")] >> visible=true')
            .first()
            .waitFor({ state: 'hidden', timeout: 5_000 })
            .catch(() => undefined);
        await this.page
            .locator('xpath=//li[contains(@class,"select2-results__option--highlighted")] >> visible=true')
            .first()
            .waitFor({ state: 'visible', timeout: 5_000 })
            .catch(() => undefined);
        await searchBox.press('Enter');
    }

    private async closeInvalidFilePopup(): Promise<void> {
        await this.deps.fileUtils.uploadFile(this.l.freeProsoalFileUpload, 'Non_destructive_testing_business.txt');
        await this.deps.uiActions.clickUsingJS(this.l.invalidfileupload);
    }

    /**
     * Select an assignee in the open Job Schedule multiselect ONLY if not already selected.
     * OMS may pre-select users, and a blind click would toggle them off.
     */
    private async ensureAssigneeSelected(name: string): Promise<void> {
        const label = this.assigneeLabel(name);
        await label.waitFor({ state: 'visible', timeout: 10_000 });

        const checkbox = label.locator('xpath=.//input[@type="checkbox"]');
        if (!(await checkbox.isChecked())) {
            await label.click();
        }
        if (!(await checkbox.isChecked())) {
            throw new Error(`Assignee not selected in Job Schedule: ${name}`);
        }
        this.deps.logger.info(`[JOB SCHEDULE] Assignee selected: ${name}`);
    }

    /**
     * Close the bootstrap-multiselect dropdown. Clicks a neutral table header cell
     * (NOT the panel title, which would collapse the panel), then falls back to Escape.
     */
    private async closeAssigneeDropdown(): Promise<void> {
        await this.l.jobScheduleNeutralHeader.click();

        const closed = await this.l.jobScheduleOpenDropdown
            .waitFor({ state: 'detached', timeout: 3_000 })
            .then(() => true)
            .catch(() => false);

        if (!closed) {
            await this.page.keyboard.press('Escape');
            await this.l.jobScheduleOpenDropdown.waitFor({ state: 'detached', timeout: 3_000 });
        }
    }

    /**
     * Selects the current date and the current time rounded down to the nearest
     * five-minute interval in the visible xdsoft datetime picker.
     */
    public async selectTodayDateAndCurrentTime(): Promise<void> {
        try {
            const activeContainer = this.page
                .locator(
                    "xpath=//div[contains(@class,'xdsoft_datetimepicker') and contains(@style,'display: block')] >> visible=true",
                )
                .first();
            await activeContainer.waitFor({ state: 'visible', timeout: 15_000 });

            const today = new Date();
            const dateXPath = `.//td[@data-date='${today.getDate()}' and @data-month='${today.getMonth()}' and @data-year='${today.getFullYear()}']`;
            const dateElement = activeContainer.locator(`xpath=${dateXPath}`).first();
            await dateElement.waitFor({ state: 'attached', timeout: 15_000 });
            await this.deps.uiActions.clickUsingJS(dateElement);
            await this.deps.uiActions.hardWait(0.5);

            const hour = today.getHours();
            const minute = Math.floor(today.getMinutes() / 5) * 5;
            const timeElement = this.page
                .locator(
                    `xpath=//div[contains(@style,'display: block')]//div[@data-hour='${hour}' and @data-minute='${minute}']`,
                )
                .first();
            await timeElement.waitFor({ state: 'attached', timeout: 15_000 });
            await timeElement.evaluate((element) => (element as HTMLElement).scrollIntoView({ block: 'center' }));
            await this.deps.uiActions.hardWait(0.2);
            await this.deps.uiActions.clickUsingJS(timeElement);
        } catch (error) {
            this.deps.logger.error('Failed to select date/time.', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw new Error('DateTime selection failed.', { cause: error });
        }
    }

    // ====================== createJobProcessRecords ======================

    public async createJobProcessRecords(
        additionalEmail: string,
        feeProposalNo: string,
        purchaseOrderNo: string,
        clientJobRequestText: string,
        specialInstructionsText: string,
        imagesPerPage: string,
        correspondenceEmail: string,
    ): Promise<void> {
        await this.deps.uiActions.click(this.l.clientNameDropdown);
        await this.deps.uiActions.fill(this.l.clientNameEnterTextDropdown, `${this.randomNumber()}@*^#`);

        if (await this.deps.uiActions.isVisibleWithin(this.l.clientNameNoResultsfound, 3_000)) {
            await this.deps.uiActions.clear(this.l.clientNameEnterTextDropdown);
            await this.deps.uiActions.fill(this.l.clientNameEnterTextDropdown, await this.getClient());
            await this.deps.uiActions.waitForAjaxToComplete(30);
            await this.deps.uiActions.click(await this.clientNameResultsDropdown());
        }

        if (await this.deps.uiActions.isVisibleWithin(this.l.creditLimitPopup, 1_000)) {
            await this.deps.uiActions.click(this.l.creditLimitPopup);
        }

        await this.deps.uiActions.clickUsingJS(this.l.popupUnderstoodButton);
        await this.deps.uiActions.click(this.l.additionalRequestCheckBox);
        await this.deps.uiActions.fill(this.l.additionalRequestEnterBox, additionalEmail);

        // COD only: each toggle opens a "Please note" popup that must fully close before the next.
        await this.deps.uiActions.click(this.l.CodOnlyYesButton);
        await this.acknowledgeCodPopup();
        await this.deps.uiActions.click(this.l.CodOnlyNoButton);
        await this.acknowledgeCodPopup();

        await this.deps.uiActions.click(this.l.JobConfirmationNoButton);
        await this.deps.uiActions.click(this.l.attachlimitationsYesButton);
        await this.deps.uiActions.click(this.l.attachLimitationsNoButton);
        await this.deps.uiActions.selectByLabel(this.l.imagesPerPageDropdown, imagesPerPage);
        await this.deps.uiActions.click(this.l.certificatesWithReportsYesButton);
        await this.deps.uiActions.click(this.l.certificatesWithReportsNoButton);
        await this.deps.uiActions.click(this.l.clientSignatureOnRecordYesButton);
        await this.deps.uiActions.click(this.l.clientSignatureOnRecordNoButton);
        await this.deps.uiActions.click(this.l.clientSignatureOnReportsYesButton);
        await this.deps.uiActions.click(this.l.clientSignatureOnReportsNoButton);
        await this.deps.uiActions.fill(this.l.freeProposal, feeProposalNo);

        await this.closeInvalidFilePopup();
        await this.deps.fileUtils.uploadConfiguredFiles(this.l.freeProsoalFileUpload);
        await this.deps.uiActions.fill(this.l.purchaseOrder, purchaseOrderNo);
        await this.deps.fileUtils.uploadConfiguredFiles(this.l.purchaseOrderFileUpload);
        await this.deps.uiActions.fill(this.l.clientJobRequestNo, clientJobRequestText);
        await this.deps.fileUtils.uploadConfiguredFiles(this.l.clientJobRequestFileUpload);
        await this.deps.uiActions.fill(this.l.specialInstructions, specialInstructionsText);
        await this.deps.fileUtils.uploadFile(this.l.specialInstructionFileUpload, 'data.xlsx');
        await this.deps.uiActions.fill(this.l.clientcorrespondenceemail, correspondenceEmail);
        //await this.deps.fileUtils.uploadConfiguredFiles(this.l.clientCorrespondenceEmailsFileUpload);
        await this.deps.uiActions.click(this.l.RequiredonCalender);
        await this.selectTodayDateAndCurrentTime();
        await this.deps.uiActions.click(this.l.recieveddate);
        await this.selectTodayDateAndCurrentTime();
        await this.deps.uiActions.click(this.l.createJob);
    }

    // ====================== captureAndSaveJobNumber ======================

    /** Captures the generated job number and records it against every selected module. */
    public async captureAndSaveJobNumber(moduleContext: ModuleExecutionContext): Promise<void> {
        try {
            const jobSpan = this.page
                .locator("xpath=//h4[starts-with(normalize-space(), 'Update Job(Project) number')]")
                .first();
            await this.deps.uiActions.waitForVisible(jobSpan);
            const jobNoText = await this.deps.uiActions.getText(jobSpan);
            if (!jobNoText.trim()) {
                throw new Error('Job container header text was null or empty.');
            }

            const match = /number\s*-\s*([A-Z0-9-]+)/.exec(jobNoText);
            if (!match) {
                throw new Error(`Regex failed to parse Job Number from string: ${jobNoText}`);
            }

            const extractedJobNo = match[1].trim();
            this.deps.logger.info(`Successfully captured Job Number: ${extractedJobNo}`);
            await this.deps.fileUtils.writeToEnvFile('CreatedJobNo', extractedJobNo);
            await this.deps.fileUtils.writeToEnvFile('JobNumber', extractedJobNo);

            const activeModules = moduleContext.modules;
            if (activeModules.length > 0) {
                this.deps.logger.info(
                    `Mapping Job Number [${extractedJobNo}] to active modules: ${activeModules.map((module) => module.code).join(', ')}`,
                );
                for (const module of activeModules) {
                    await this.deps.fileUtils.writeToEnvFile(module.code, extractedJobNo);
                }
            } else {
                this.deps.logger.warn('No specific module context was active. Only generic job tracking keys were updated.');
            }
        } catch (error) {
            this.deps.logger.error('Failed to map configuration job properties.', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw new Error('Job Number extraction/saving failed.', { cause: error });
        }
    }

    // ====================== jobAcceptanceCriteria ======================

    public async jobAcceptanceCriteria(
        jobRequestText: string,
        projectNameText: string,
        identificationText: string,
        jobSpecialInstructionsText: string,
    ): Promise<void> {
        // jQuery UI autocomplete needs real key events; fill() never opens the menu.
        await this.pickAutocompleteSuggestion(this.l.jobRequestNo, jobRequestText, this.l.jobRequestEnterText);

        await this.deps.uiActions.click(this.l.jobRequestupload);
        await this.deps.fileUtils.uploadFile(this.l.jobRequestfileUpload, 'img.png');
        await this.deps.uiActions.toastWaitAndClose(this.l.toastMessage);
        await this.deps.uiActions.click(this.l.jobrequestFileDelete);
        await this.deps.uiActions.toastWaitAndClose(this.l.toastMessage);
        await this.deps.fileUtils.uploadFile(this.l.jobRequestfileUpload, 'img.png');
        await this.deps.uiActions.click(this.l.jobRequestFileUploadPopupClose);
        await this.deps.uiActions.waitForHidden(this.l.jobRequestFileUploadPopupClose);

        await this.deps.uiActions.fill(this.l.clientCorrespondenceEmail, this.randomgmail());
        await this.deps.uiActions.click(this.l.clientCorrespondenceupload);
        await this.deps.fileUtils.uploadFile(this.l.clientCorrespondenceFileUpload, 'img.png');
        await this.deps.uiActions.toastWaitAndClose(this.l.toastMessage);
        await this.deps.uiActions.click(this.l.clientCorrespondenceFileDelete);
        await this.deps.uiActions.toastWaitAndClose(this.l.toastMessage);
        await this.deps.fileUtils.uploadFile(this.l.clientCorrespondenceFileUpload, 'img.png');
        await this.deps.uiActions.click(this.l.clientCorrespondenceCloseButton);
        await this.deps.uiActions.waitForHidden(this.l.clientCorrespondenceCloseButton);

        await this.deps.uiActions.fill(this.l.projectName, projectNameText);
        await this.deps.uiActions.fill(this.l.identification, identificationText);
        await this.deps.uiActions.click(this.l.identificationupload);
        await this.deps.fileUtils.uploadFile(this.l.identificationFileUpload, 'data.xlsx');
        await this.deps.uiActions.toastWaitAndClose(this.l.toastMessage);
        await this.deps.uiActions.waitForAttached(this.l.identificationFileDelete);
        await this.deps.uiActions.click(this.l.identificationFileDelete);
        await this.deps.uiActions.toastWaitAndClose(this.l.toastMessage);
        await this.deps.fileUtils.uploadFile(this.l.identificationFileUpload, 'FeSteel600.pdf');
        await this.deps.uiActions.toastWaitAndClose(this.l.toastMessage);
        await this.deps.uiActions.click(this.l.IdentificationPopupClose);
        await this.deps.uiActions.waitForHidden(this.l.IdentificationPopupClose);
        await this.deps.uiActions.fill(this.l.jobDeatailSpecialInstructions, jobSpecialInstructionsText);
    }

    // ====================== Material + specification mapping ======================

    /**
     * Maps Specification -> Process Standard -> Procedure in sequence.
     * OMS refreshes each dependent list asynchronously after a selection. We wait
     * for the next list and allow the UI update to settle before selecting from it.
     */
    private async linkSpecProcessAndProcedure(
        requirementSpec: string,
        processStandard: string,
        procedureNo: string,
    ): Promise<void> {
        const specNo = requirementSpec.trim();
        const processNo = processStandard.trim();
        const procedure = procedureNo.trim();

        if (!specNo || !processNo || !procedure) {
            throw new Error(
                `Cannot map Job specification: Specification="${specNo}", ProcessStandard="${processNo}", Procedure="${procedure}".`,
            );
        }

        this.deps.logger.info(
            `[JOB MAPPING] Starting Specification=${specNo}, ProcessStandard=${processNo}, Procedure=${procedure}`,
        );

        // 1. Search for the created specification (key events refresh the shortlist).
        const specificationInput = this.l.requirementSpecification;
        await specificationInput.waitFor({ state: 'visible', timeout: 15_000 });
        await this.typeToFilter(specificationInput, specNo);

        await this.page.waitForFunction(
            ({ selector, expected }) => {
                const input = document.querySelector<HTMLInputElement>(selector);
                return input?.value.trim() === expected;
            },
            { selector: '#specificationsMaster', expected: specNo },
            { timeout: 10_000 },
        );
        await this.deps.uiActions.waitForAjaxToComplete(30);

        const specificationOption = this.dynamicSpan('availableTestSpecs', specNo);
        await specificationOption.waitFor({ state: 'visible', timeout: 20_000 });
        await specificationOption.click();
        this.deps.logger.info(`[JOB MAPPING] Specification selected: ${specNo}`);

        // 2. Selecting a specification causes OMS to populate the Process Standard list.
        const processList = this.page.locator('#testMethodList');
        await processList.waitFor({ state: 'visible', timeout: 20_000 });
        await this.page.waitForTimeout(2_000);

        const processOption = this.dynamicSpan('testMethodList', processNo);
        await processOption.waitFor({ state: 'visible', timeout: 20_000 });
        await processOption.click();
        this.deps.logger.info(`[JOB MAPPING] Process Standard selected: ${processNo}`);

        // 3. Allow OMS to refresh the Procedure list, then select the created Procedure.
        await this.page.waitForTimeout(2_000);
        const procedureOption = this.dynamicSpan('availableProcedure', procedure);
        await procedureOption.waitFor({ state: 'visible', timeout: 20_000 });
        await procedureOption.click();
        this.deps.logger.info(`[JOB MAPPING] Procedure selected: ${procedure}`);

        // 4. Let OMS finish the procedure selection before the next mapping begins.
        await this.page.waitForTimeout(2_000);
        this.deps.logger.info(
            `[JOB MAPPING] Completed Specification=${specNo}, ProcessStandard=${processNo}, Procedure=${procedure}`,
        );
    }

    /**
     * Selects a material using the visible option label rather than the hidden
     * checkbox input: filter by the created value, wait for the matching option,
     * click its label, then move it to the selected panel.
     */
    private async mapMaterialGrade(materialGrade: string): Promise<void> {
        if (!materialGrade?.trim()) {
            throw new Error('CreatedMaterialGrade is empty. Cannot map material to Job.');
        }

        const grade = materialGrade.trim();

        const materialInput = this.page.locator('#materialMaster');
        await materialInput.waitFor({ state: 'visible', timeout: 15_000 });
        await materialInput.scrollIntoViewIfNeeded();
        await materialInput.click();
        await materialInput.fill('');

        // OMS filters this list from keyboard events. Type each character and wait until
        // the input contains the complete grade before checking the filtered list.
        await materialInput.pressSequentially(grade, { delay: 100 });
        await this.page.waitForFunction(
            ({ selector, expectedValue }) => {
                const input = document.querySelector<HTMLInputElement>(selector);
                return input?.value.trim() === expectedValue;
            },
            { selector: '#materialMaster', expectedValue: grade },
            { timeout: 10_000 },
        );

        // Give OMS two seconds to finish processing the entered CreatedMaterialGrade
        // and refresh the available-material checkbox list before selecting it.
        await this.page.waitForTimeout(2_000);

        const availableMaterial = this.materialOptionLabel(grade);
        const checkbox = this.materialCheckbox(grade);

        await availableMaterial.waitFor({ state: 'visible', timeout: 20_000 });
        await availableMaterial.scrollIntoViewIfNeeded();
        await availableMaterial.click();

        // The checkbox is custom-styled/hidden. Verify its state, retry the visible label once.
        await checkbox.waitFor({ state: 'attached', timeout: 5_000 });
        let isChecked = await checkbox.isChecked();
        if (!isChecked) {
            await availableMaterial.click({ force: true });
            await this.page.waitForTimeout(200);
            isChecked = await checkbox.isChecked();
        }
        if (!isChecked) {
            throw new Error(`Material option was displayed but not selected: ${grade}`);
        }

        await this.deps.uiActions.click(this.l.materialRightArrow);

        const selectedMaterial = this.selectedMaterialOption(grade);
        await selectedMaterial.waitFor({ state: 'visible', timeout: 20_000 });
        await selectedMaterial.click();
    }

    public async materialAndSpecificationMapping(moduleContext: ModuleExecutionContext): Promise<void> {
        const module = moduleContext.require();
        const materialGrade = await this.getMaterialGrade();
        const requirementSpec = await this.getRequirementSpec(moduleContext);
        const processStandard = await this.getProcessStandard();
        const procedureNo = await this.getProcedure();

        await this.mapMaterialGrade(materialGrade);

        await this.linkSpecProcessAndProcedure(requirementSpec, processStandard, procedureNo);
        this.deps.logger.info(`Mapped specification, process standard and procedure for active module ${module.code}.`);
    }

    /** Maps every module's specification/process/procedure set into the same Job. */
    public async multiModuleSpecificationMapping(moduleContext: ModuleExecutionContext): Promise<void> {
        const materialGrade = await this.getMaterialGrade();
        await this.mapMaterialGrade(materialGrade);

        const runModules = moduleContext.getCombinedRunSet();
        if (runModules.length < 2) {
            throw new Error('multiModuleSpecificationMapping requires at least two modules in OMS_MODULES.');
        }

        for (const module of runModules) {
            const reqSpec = await this.deps.env.requiredModuleEnvValue(module, 'CreatedSpecificationNo');
            const processStd = await this.deps.env.requiredModuleEnvValue(module, 'CreatedProcessNo');
            const procedureNo = await this.deps.env.requiredModuleEnvValue(module, 'CreatedProcedureNo');

            await this.linkSpecProcessAndProcedure(reqSpec, processStd, procedureNo);
            this.deps.logger.info(`Linked specification/process/procedure for module ${module.code}.`);
        }
    }

    // ====================== jobAcceptance ======================

    public async jobAcceptance(
        acceptanceCriteriaText: string,
        receivedByKeyword: string,
        projectManagerKeyword: string,
    ): Promise<void> {
        await this.deps.uiActions.click(this.l.acceptanceCriteria);
        await this.typeToFilter(this.l.acceptenceCriteriaEnterTextBox, acceptanceCriteriaText);
        await this.deps.uiActions.click(this.l.getFirstAcceptanceCriteriaCheckbox);

        await this.deps.uiActions.click(this.l.recivedByDropdown);
        await this.deps.uiActions.fill(this.l.recivedByEnterText, receivedByKeyword);
        await this.pressEnterOnSelect2(this.l.recivedByEnterText);

        await this.deps.uiActions.click(this.l.projectmanagerdropdown);
        await this.deps.uiActions.fill(this.l.projectmanagerEnterText, projectManagerKeyword);
        await this.pressEnterOnSelect2(this.l.projectmanagerEnterText);
    }

    // ====================== jobScheduleCreation ======================

    public async jobScheduleCreation(
        row1Duration: string,
        assigneeName: string,
        row2Duration: string,
    ): Promise<void> {
        // ---- Row 1: start date + duration ----
        await this.deps.uiActions.click(this.l.jobScheduleStartDate);
        await this.selectTodayDateAndCurrentTime();

        // Selenium used JavascriptExecutor to set value, then sent TAB.
        await this.l.jobScheduleEdurationHours.evaluate((element, value) => {
            const input = element as HTMLInputElement;
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }, row1Duration);
        await this.l.jobScheduleEdurationHours.press('Tab');

        // ---- Row 1: assignee (inline multiselect, not a modal) ----
        await this.deps.uiActions.click(this.l.JobAssignedTo);
        await this.typeToFilter(this.l.jobassignedToEnterTextBox, assigneeName);
        await this.ensureAssigneeSelected(assigneeName);
        await this.closeAssigneeDropdown();

        // ---- Row 2: add, fill, then delete (exercises add/delete row) ----
        await this.deps.uiActions.click(this.l.jobSchedulenewRow);
        await this.deps.uiActions.click(this.l.jobScheduleStartDate2);
        await this.selectTodayDateAndCurrentTime();

        // Row 2 duration is readonly + pointer-events:none until the start date is set.
        await this.page.waitForFunction(
            () => {
                const el = document.querySelector<HTMLInputElement>('#duration-2');
                return !!el && !el.hasAttribute('readonly');
            },
            undefined,
            { timeout: 10_000 },
        );
        await this.deps.uiActions.fill(this.l.jobScheduleEdurationHours2, row2Duration);

        await this.deps.uiActions.click(this.l.jobScheduleDeleteRow2);
        await this.deps.uiActions.click(this.l.jobScheduleDeleteRowPopup);
        await this.deps.uiActions.waitForHidden(this.l.jobScheduleDeleteRowPopup);
    }

    // ====================== SWMS / update ======================

    public async downloadJobDetailsAndSwms(swmsNo: string): Promise<void> {
        await this.deps.uiActions.click(this.l.swmsButton);
        await this.deps.uiActions.click(this.l.swmsCheckBox);
        await this.deps.uiActions.fill(this.l.swmsNumber, swmsNo);
        await this.deps.uiActions.click(this.l.copyExistingSwms);
        await this.deps.uiActions.fill(this.l.swmsJobNumber, swmsNo);
        await this.deps.uiActions.click(this.l.swmsCheckBox);
        await this.deps.uiActions.fill(this.l.swmsNumber, swmsNo);
        await this.deps.uiActions.click(this.l.swmsCancelButton);
    }

    public async jobUpdate(): Promise<void> {
        await this.deps.uiActions.click(this.l.updateJob);
    }
}