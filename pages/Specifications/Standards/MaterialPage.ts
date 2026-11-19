import { randomInt } from 'node:crypto';
import type { Locator, Page } from '@playwright/test';
import type { OmsPageServices } from '../../common/pageServices';

/** Playwright conversion of the supplied Selenium MaterialPage class. */
export class MaterialPage {
    protected readonly page: Page;
    protected readonly deps: OmsPageServices;
    private readonly newMaterial: Locator;
    private readonly grade: Locator;
    private readonly toasterCancel: Locator;
    private readonly gradeCommaPopup: Locator;
    private readonly gradeLesserSymbol: Locator;
    private readonly description: Locator;
    private readonly uploadFile: Locator;
    private readonly downloadButton: Locator;
    private readonly saveMaterial: Locator;
    private readonly materialGradeSearch: Locator;
    private readonly materialDescriptionSearch: Locator;
    private readonly materialSearchButton: Locator;
    private readonly materialCreatedCell: Locator;

    constructor(page: Page, deps: OmsPageServices) {
        this.page = page;
        this.deps = deps;
        this.newMaterial = page.locator("//button[normalize-space()='New Material']");
        this.grade = page.locator('#grade');
        this.toasterCancel = page.locator("//button[contains(@class,'toast-close-button')]");
        this.gradeCommaPopup = page.locator("//button[@data-bb-handler='ok']");
        this.gradeLesserSymbol = page.locator('#btn-le');
        this.description = page.locator('#description');
        this.uploadFile = page.locator('#upfile');
        this.downloadButton = page.locator('#downloadButton');
        this.saveMaterial = page.locator('#saveMaterialButton');
        this.materialGradeSearch = page.locator('#search-grade');
        this.materialDescriptionSearch = page.locator('#search-description');
        this.materialSearchButton = page.locator("//button[@data-original-title='Search']");
        this.materialCreatedCell = page.locator("//table[@id='data_table_blue']/tbody/tr[1]/td[1]");
    }

    // Original Java method spelling retained for compatibility with existing test calls.
    public randomeNumber(): string {
        return randomInt(0, 1000).toString().padStart(3, '0');
    }

    /** Opens the modal, performs the same validation/upload/save/search workflow, and persists the grade. */
    public async materialCreation(): Promise<void> {
        const materialGradePrefix = await this.deps.env.requiredEnvValue('MaterialGrade');
        const gradeName = `${materialGradePrefix}${this.randomeNumber()}`;
        const materialDescription = 'Steel grade description 12';

        this.deps.logger.info(`Generated Grade Name: ${gradeName}`);
        await this.deps.uiActions.click(this.newMaterial);
        await this.deps.uiActions.fill(this.grade, 'Fe415');
        await this.deps.uiActions.toastWaitAndClose(this.toasterCancel);

        await this.deps.uiActions.fill(this.grade, ',');
        await this.deps.uiActions.click(this.gradeCommaPopup);
        await this.deps.uiActions.fill(this.grade, gradeName);
        await this.deps.uiActions.fill(this.description, materialDescription);

        await this.deps.fileUtils.uploadFile(this.uploadFile, 'Fe600.pdf');
        const actualDownloadedFile = await this.deps.fileUtils.downloadAndValidate(
            this.page,
            () => this.deps.uiActions.click(this.downloadButton),
            '.pdf',
        );
        if (!actualDownloadedFile) {
            throw new Error('Download failed or file was not found.');
        }
        this.deps.logger.info(`Successfully validated download: ${actualDownloadedFile}`);

        await this.deps.uiActions.click(this.saveMaterial);
        await this.deps.uiActions.waitForPageLoad(5);
        await this.deps.uiActions.fill(this.materialGradeSearch, gradeName);
        await this.deps.uiActions.fill(this.materialDescriptionSearch, materialDescription);
        await this.deps.uiActions.click(this.materialSearchButton);

        try {
            await this.deps.uiAssertions.assertContainsText(this.materialCreatedCell, gradeName, { timeout: 10_000 });
        } catch {
            this.deps.logger.warn(
                `Search table sync timed out. Current text: ${await this.deps.uiActions.getText(this.materialCreatedCell)}`,
            );
        }

        const createdMaterial = (await this.deps.uiActions.getText(this.materialCreatedCell)).trim();
        this.deps.logger.info(`Created Material Grade Found in Table: ${createdMaterial}`);
        if (createdMaterial !== gradeName) {
            throw new Error(`Material creation verification failed. Expected "${gradeName}", actual "${createdMaterial}".`);
        }

        await this.deps.fileUtils.writeToEnvFile('CreatedMaterialGrade', gradeName);
    }
}
