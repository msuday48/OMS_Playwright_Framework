
import { expect, type Locator, type Page } from '@playwright/test';

import { RandomDataUtil } from '../../../utils/dataGenerator';
import { xpathLiteral } from '../../../utils/xpath';
import type { OmsPageServices } from '../../common/pageServices';
import type { ModuleConfig } from '../../Modules/ModuleConfig/ModuleConfig';
import type { ModuleExecutionContext } from '../../Modules/ModuleConfig/ModuleExecutionContext';

interface ProcedureForm {
    procedureNumber: Locator;
    procedureName: Locator;
    publicationDate: Locator;
    reviewFrequency: Locator;
    nextReviewDate: Locator;
    notifyTo: Locator;
    notifyToEmail: Locator;
    optionalNotifyTo: Locator;
    escalateTo: Locator;
    select2Search: Locator;
    reminderFrequency: Locator;
    escalatePeriod: Locator;
    instructions: Locator;
    processStandardToggle: Locator;
    processStandardSearch: Locator;
    branchToggle: Locator;
    sydneyCheckbox: Locator;
    usersSelect: Locator;
    usersToggle: Locator;
    usersDropdown: Locator;
    documentUpload: Locator;
    understoodPopup: Locator;
    saveButton: Locator;
}

export class ProceduresPage {

    private readonly page: Page;
    private readonly deps: OmsPageServices;

    private readonly newProcedureButton: Locator;
    private readonly createdProcedureSearch: Locator;
    private readonly searchButton: Locator;

    private activeModule?: ModuleConfig;

    constructor(page: Page, deps: OmsPageServices) {

        this.page = page;
        this.deps = deps;

        this.newProcedureButton = page.locator(
            "//button[@id='btn-new']",
        );

        this.createdProcedureSearch = page.locator(
            "//form[@id='testProcedureSearch']//input[@id='search_name']",
        );

        this.searchButton = page.locator(
            "//form[@id='testProcedureSearch']//button[@type='submit' and @data-original-title='Search']",
        );
    }

    // =========================================================
    // MODULE CONFIGURATION
    // =========================================================

    private randomNumeric(length: number): string {
        return RandomDataUtil.getNumericString(length);
    }

    private getCurrentModule(
        moduleContext?: ModuleExecutionContext,
    ): ModuleConfig {

        const module = moduleContext?.require() ?? this.activeModule;

        if (!module) {
            throw new Error(
                'No active OMS module found. Pass ModuleExecutionContext to procedureCreation() first.',
            );
        }

        this.activeModule = module;

        return module;
    }

    // =========================================================
    // PROCEDURE FORM LOCATORS
    // =========================================================

    private form(page: Page): ProcedureForm {

        const processStandardGroup = page.locator(
            "//form[@id='testProcedureForm']//select[@id='testMethodType']/following-sibling::div[contains(concat(' ', normalize-space(@class), ' '), ' btn-group ')]",
        );

        const branchGroup = page.locator(
            "//form[@id='testProcedureForm']//select[@id='branch']/following-sibling::div[contains(@class,'btn-group')]",
        );

        const usersSelect = page.locator(
            "//form[@id='testProcedureForm']//select[@id='procedureAlertUser' and @multiple]",
        );

        const usersGroup = usersSelect.locator(
            "xpath=following-sibling::div[contains(@class,'btn-group')]",
        );

        return {

            procedureNumber: page.locator(
                "//form[@id='testProcedureForm']//input[@id='name']",
            ),

            procedureName: page.locator(
                "//form[@id='testProcedureForm']//input[@id='description']",
            ),

            publicationDate: page.locator(
                "//form[@id='testProcedureForm']//input[@id='datePublication']",
            ),

            reviewFrequency: page.locator(
                "//form[@id='testProcedureForm']//select[@id='nominalLifePeriod']",
            ),

            nextReviewDate: page.locator(
                "//form[@id='testProcedureForm']//input[@id='nextReviewDate']",
            ),

            notifyTo: page.locator(
                "//form[@id='testProcedureForm']//input[@id='notifyTo']",
            ),

            notifyToEmail: page.locator(
                "//ul[contains(@class,'ui-autocomplete') and not(contains(@style,'display: none'))]//li[.//*[contains(normalize-space(.),'tech1')]]",
            ),

            optionalNotifyTo: page.locator(
                "//form[@id='testProcedureForm']//select[@id='optionalNotifyTo']/following-sibling::span[contains(@class,'select2-container')]",
            ),

            escalateTo: page.locator(
                "//form[@id='testProcedureForm']//select[@id='escalateToUser']/following-sibling::span[contains(@class,'select2-container')]",
            ),

            select2Search: page.locator(
                "//span[contains(@class,'select2-container--open')]//input[contains(@class,'select2-search__field')]",
            ),

            reminderFrequency: page.locator(
                "//form[@id='testProcedureForm']//select[@id='reminderFrequency']",
            ),

            escalatePeriod: page.locator(
                "//form[@id='testProcedureForm']//select[@id='escalatePeriod']",
            ),

            instructions: page.locator(
                "//form[@id='testProcedureForm']//textarea[@id='eventDescription']",
            ),

            processStandardToggle: processStandardGroup.locator(
                'button.multiselect.dropdown-toggle',
            ),

            processStandardSearch: processStandardGroup.locator(
                'input.multiselect-search',
            ),

            branchToggle: branchGroup.locator(
                'button.multiselect.dropdown-toggle',
            ),

            sydneyCheckbox: branchGroup.locator(
                "xpath=.//ul[contains(@class,'multiselect-container')]//label[normalize-space(.)='Sydney']//input[@type='checkbox']",
            ),

            usersSelect,

            usersToggle: usersGroup.locator(
                'button.multiselect.dropdown-toggle',
            ),

            usersDropdown: usersGroup.locator(
                'ul.multiselect-container.dropdown-menu',
            ),

            documentUpload: page.locator(
                "//form[@id='testProcedureForm']//input[@id='document' and @type='file']",
            ),

            understoodPopup: page.locator(
                "//div[contains(@class,'bootbox')]//button[normalize-space()='Understood']",
            ),

            saveButton: page.locator(
                "//form[@id='testProcedureForm']//button[@id='btn-save']",
            ),
        };
    }

    // =========================================================
    // OPEN PROCEDURE CREATION CHILD WINDOW
    // =========================================================

    private async openProcedureForm(): Promise<{
        page: Page;
        form: ProcedureForm;
    }> {

        const [childPage] = await Promise.all([

            this.page.context().waitForEvent('page'),

            this.newProcedureButton.click(),

        ]);

        await childPage.waitForLoadState('domcontentloaded');

        await expect(childPage).toHaveTitle(
            /Create or edit Procedure/,
        );

        this.deps.logger.info(
            '[PROCEDURE] Procedure creation window opened successfully.',
        );

        return {
            page: childPage,
            form: this.form(childPage),
        };
    }

    // =========================================================
    // DATE PICKER
    // =========================================================

    private async selectDate(
        childPage: Page,
        field: Locator,
        month: string,
        year: string,
        day: string,
    ): Promise<void> {

        await field.click();

        const calendar = childPage.locator(
            '#ui-datepicker-div:visible',
        );

        await expect(calendar).toBeVisible();

        await calendar.locator(
            'select.ui-datepicker-month',
        ).selectOption({
            label: month,
        });

        await calendar.locator(
            'select.ui-datepicker-year',
        ).selectOption(year);

        await calendar.getByRole(
            'link',
            {
                name: day,
                exact: true,
            },
        ).click();

        await expect(calendar).toBeHidden();
    }

    // =========================================================
    // PROCESS STANDARD MULTISELECT
    // =========================================================

    private async selectProcessStandard(
        childPage: Page,
        form: ProcedureForm,
        optionLabel: string,
    ): Promise<void> {

        if (!(await form.processStandardSearch.isVisible())) {
            await form.processStandardToggle.click();
        }

        await expect(
            form.processStandardSearch,
        ).toBeVisible();

        await form.processStandardSearch.fill(optionLabel);

        const optionCheckbox = childPage.locator(
            `//form[@id='testProcedureForm']//select[@id='testMethodType']/following-sibling::div[contains(@class,'btn-group') and contains(@class,'open')]//ul[contains(@class,'multiselect-container')]//label[normalize-space(.)=${xpathLiteral(optionLabel)}]//input[@type='checkbox']`,
        );

        await expect(optionCheckbox).toHaveCount(1);

        await expect(optionCheckbox).toBeVisible();

        if (!(await optionCheckbox.isChecked())) {
            await optionCheckbox.check();
        }

        await expect(optionCheckbox).toBeChecked();

        this.deps.logger.info(
            `[PROCEDURE] Process standard selected: ${optionLabel}`,
        );
    }

    // =========================================================
    // SELECT FIRST PROCEDURE ALERT USER
    // =========================================================

    private async selectFirstProcedureUser(
        form: ProcedureForm,
    ): Promise<void> {

        await expect(form.usersSelect).toHaveCount(1);

        await expect(form.usersToggle).toHaveCount(1);

        await expect(form.usersDropdown).toHaveCount(1);

        const firstUserOption = form.usersSelect.locator(
            'option',
        ).first();

        const userValue = await firstUserOption.getAttribute(
            'value',
        );

        const userName = (
            await firstUserOption.textContent()
        )?.trim();

        if (!userValue || !userName) {
            throw new Error(
                'First Users option does not contain a valid value and label.',
            );
        }

        if (!(await form.usersDropdown.isVisible())) {
            await form.usersToggle.click();
        }

        await expect(form.usersDropdown).toBeVisible();

        const userCheckbox = form.usersDropdown.locator(
            `xpath=.//input[@type='checkbox' and @value=${xpathLiteral(userValue)}]`,
        );

        await expect(userCheckbox).toHaveCount(1);

        await userCheckbox.scrollIntoViewIfNeeded();

        if (!(await userCheckbox.isChecked())) {
            await userCheckbox.check();
        }

        await expect(userCheckbox).toBeChecked();

        await expect(firstUserOption).toHaveJSProperty(
            'selected',
            true,
        );

        await form.usersToggle.click();

        await expect(form.usersDropdown).toBeHidden();

        this.deps.logger.info(
            `[PROCEDURE] Selected first user: ${userName}, Value: ${userValue}`,
        );
    }

    // =========================================================
    // FILL PROCEDURE FORM
    // =========================================================

    private async fillProcedureForm(
        childPage: Page,
        form: ProcedureForm,
        procedureNo: string,
        procedureName: string,
        instructions: string,
        module: ModuleConfig,
    ): Promise<void> {

        await form.procedureNumber.fill(procedureNo);

        await form.procedureName.fill(procedureName);

        // Publication date: 31-Dec-2026.
        await this.selectDate(
            childPage,
            form.publicationDate,
            'Dec',
            '2026',
            '31',
        );

        await form.reviewFrequency.selectOption('1460');

        if (await form.understoodPopup.isVisible()) {
            await form.understoodPopup.click();
        }

        // Next review date: 30-Nov-2027.
        await this.selectDate(
            childPage,
            form.nextReviewDate,
            'Nov',
            '2027',
            '30',
        );

        // Notify To.
        await form.notifyTo.click();

        await expect(form.notifyToEmail).toBeVisible();

        await form.notifyToEmail.click();

        // Optional Notify To.
        await form.optionalNotifyTo.click();

        await expect(form.select2Search).toBeVisible();

        await form.select2Search.fill('OMS Administrator');

        await form.select2Search.press('Enter');

        // Reminder frequency.
        await form.reminderFrequency.selectOption('30');

        // Instructions.
        await form.instructions.fill(instructions);

        // Escalation period.
        await form.escalatePeriod.selectOption('90');

        // Escalate To.
        await form.escalateTo.click();

        await expect(form.select2Search).toBeVisible();

        await form.select2Search.fill('Oms');

        await form.select2Search.press('Enter');

        // Module-specific process standards.
        for (const optionLabel of module.processStandardOptions) {

            await this.selectProcessStandard(
                childPage,
                form,
                optionLabel,
            );
        }

        // Close Process Standard dropdown.
        if (await form.processStandardSearch.isVisible()) {
            await form.processStandardToggle.click();
        }

        // Branch selection: Sydney.
        await expect(form.branchToggle).toBeVisible();

        await form.branchToggle.click();

        await expect(form.sydneyCheckbox).toBeVisible();

        if (!(await form.sydneyCheckbox.isChecked())) {
            await form.sydneyCheckbox.check();
        }

        await expect(form.sydneyCheckbox).toBeChecked();

        await form.branchToggle.click();

        // Select first procedure alert user.
        await this.selectFirstProcedureUser(form);

        this.deps.logger.info(
            `[PROCEDURE] All procedure form fields completed: ${procedureNo}`,
        );
    }

    // =========================================================
    // UPLOAD PROCEDURE DOCUMENT
    // =========================================================

    private async uploadProcedureDocument(
        form: ProcedureForm,
    ): Promise<void> {

        await expect(form.documentUpload).toHaveCount(1);

        await expect(form.documentUpload).toBeAttached();

        // Upload document BEFORE clicking Save.
        await this.deps.fileUtils.uploadFile(
            form.documentUpload,
            'img.png',
        );

        // Verify uploaded filename.
        const uploadedFileName = await form.documentUpload.evaluate(
            (element: HTMLInputElement) =>
                element.files?.[0]?.name ?? '',
        );

        if (uploadedFileName !== 'img.png') {

            throw new Error(
                `Document upload failed. Expected img.png, found: ${uploadedFileName || 'No file selected'}`,
            );
        }

        this.deps.logger.info(
            `[PROCEDURE] Supporting document uploaded successfully: ${uploadedFileName}`,
        );
    }

    // =========================================================
    // SAVE PROCEDURE AND WAIT FOR SUCCESS TOAST
    // =========================================================

    private async saveProcedure(
        childPage: Page,
        form: ProcedureForm,
        procedureNo: string,
    ): Promise<void> {

        await expect(form.saveButton).toHaveCount(1);

        await expect(form.saveButton).toBeVisible();

        await expect(form.saveButton).toBeEnabled();

        this.deps.logger.info(
            `[PROCEDURE] Clicking Save: ${procedureNo}`,
        );

        // Click Save.
        await form.saveButton.click();

        // Wait for OMS success toast containing procedure number.
        const successToast = childPage.getByText(
            procedureNo,
            {
                exact: false,
            },
        ).last();

        await expect(successToast).toBeVisible({
            timeout: 60_000,
        });

        this.deps.logger.info(
            `[PROCEDURE] Success toast received. Procedure created: ${procedureNo}`,
        );

        // Wait for remaining network activity to settle.
        // Toast is the primary save confirmation.
        await childPage.waitForLoadState(
            'networkidle',
            {
                timeout: 20_000,
            },
        ).catch(() => {

            this.deps.logger.warn(
                '[PROCEDURE] Network idle not reached. Success toast was already verified.',
            );

        });

        this.deps.logger.info(
            `[PROCEDURE] Save operation completed: ${procedureNo}`,
        );
    }

    // =========================================================
    // SEARCH AND VERIFY CREATED PROCEDURE
    // =========================================================

    private async verifyCreatedProcedure(
        procedureNo: string,
    ): Promise<string> {

        await expect(this.createdProcedureSearch).toHaveCount(1);

        await expect(this.searchButton).toHaveCount(1);

        await expect(this.createdProcedureSearch).toBeVisible();

        // Enter dynamically generated procedure number.
        await this.createdProcedureSearch.fill(procedureNo);

        this.deps.logger.info(
            `[PROCEDURE SEARCH] Searching parent Procedures Library: ${procedureNo}`,
        );

        // Wait for parent page search navigation.
        await Promise.all([

            this.page.waitForNavigation({
                waitUntil: 'load',
                timeout: 60_000,
            }),

            this.searchButton.click(),

        ]);

        // Verify first row.
        const firstProcedureRow = this.page.locator(
            '#proceduresTable tbody tr',
        ).first();

        await expect(firstProcedureRow).toBeVisible({
            timeout: 30_000,
        });

        const firstProcedureNoCell = firstProcedureRow.locator(
            'td',
        ).first();

        await expect(firstProcedureNoCell).toContainText(
            procedureNo,
            {
                timeout: 30_000,
            },
        );

        const displayedProcedureNo = (
            await firstProcedureNoCell.innerText()
        ).trim();

        this.deps.logger.info(
            `[PROCEDURE SEARCH] Verified. Expected="${procedureNo}", Displayed="${displayedProcedureNo}"`,
        );

        return procedureNo;
    }

    // =========================================================
    // MAIN PROCEDURE CREATION METHOD
    // =========================================================

    async procedureCreation(
        moduleContext?: ModuleExecutionContext,
    ): Promise<string> {

        const module = this.getCurrentModule(moduleContext);

        const procedureNo =
            `${await this.deps.env.requiredEnvValue('ProcedureNo')}${this.randomNumeric(4)}`;

        const procedureName =
            await this.deps.env.requiredEnvValue('ProcedureName');

        const instructions =
            await this.deps.env.requiredEnvValue('AnyInstructions');

        this.deps.logger.info(
            `[PROCEDURE] Starting ${module.code} procedure creation: ${procedureNo}`,
        );

        // Step 1: Open child procedure creation window.
        const {
            page: childPage,
            form,
        } = await this.openProcedureForm();

        let saveConfirmed = false;

        try {

            // Step 2: Fill procedure details.
            await this.fillProcedureForm(
                childPage,
                form,
                procedureNo,
                procedureName,
                instructions,
                module,
            );

            // Step 3: Upload supporting document BEFORE saving.
            await this.uploadProcedureDocument(form);

            // Step 4: Save and wait for success toast + network idle.
            await this.saveProcedure(
                childPage,
                form,
                procedureNo,
            );

            saveConfirmed = true;

        } finally {

            // Close child window ONLY after confirmed save.
            if (saveConfirmed && !childPage.isClosed()) {

                await childPage.close();

                this.deps.logger.info(
                    '[PROCEDURE] Child window closed after save confirmation.',
                );
            }

            // Return focus to parent page only after successful save.
            if (saveConfirmed && !this.page.isClosed()) {

                await this.page.bringToFront();

                await expect(this.createdProcedureSearch).toBeVisible({
                    timeout: 30_000,
                });

                this.deps.logger.info(
                    '[PROCEDURE] Returned to parent Procedures Library.',
                );
            }
        }

        // Step 5: Search and verify created procedure.
        const actual = await this.verifyCreatedProcedure(
            procedureNo,
        );

        // Step 6: Persist verified procedure number.
        await this.deps.fileUtils.writeToEnvFile(
            'CreatedProcedureNo',
            actual,
        );

        await this.deps.env.writeModuleEnvValue(
            module,
            'CreatedProcedureNo',
            actual,
        );

        this.deps.logger.info(
            `[PROCEDURE] Created and verified successfully: ${actual}`,
        );

        return actual;
    }
}
