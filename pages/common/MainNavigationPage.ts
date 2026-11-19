import type { Locator, Page } from '@playwright/test';
import type { OmsPageServices } from './pageServices';

/** Header-menu navigation shared by the OMS section page managers. */
export class MainNavigationPage {
    protected readonly page: Page;
    protected readonly deps: OmsPageServices;
    private readonly jobsProcessRecordsMenu: Locator;
    private readonly createJobLink: Locator;
    private readonly searchAndProcessDataLink: Locator;
    private readonly searchJobLink: Locator;

    private readonly clientsMenu: Locator;
    private readonly customersLink: Locator;

    private readonly specificationsMenu: Locator;
    private readonly specificationsStandardsLink: Locator;
    private readonly standardsMaterialLink: Locator;
    private readonly specificationStandardsLink: Locator;
    private readonly specificationProcedureLink: Locator;
    private readonly specificationProcessStandardLink: Locator;

    private readonly assetsMenu: Locator;
    private readonly clientAssetRegisterLink: Locator;
    private readonly pressureEquipmentLink: Locator;
    private readonly tankEquipmentLink: Locator;
    private readonly lsaEquipmentLink: Locator;

    constructor(page: Page, deps: OmsPageServices) {
        this.page = page;
        this.deps = deps;

        this.jobsProcessRecordsMenu = page.locator(
            "//a[normalize-space()='Job & process records']",
        );
        this.createJobLink = page.locator(
            "//a[normalize-space()='Job & process records']//ancestor::li//a[normalize-space()='Create job']",
        );
        this.searchAndProcessDataLink = page.locator(
            '//a[@data-original-title="Search records & add test, inspection, process data"]',
        );
        this.searchJobLink = page.locator(
            "//a[normalize-space()='Search jobs']",
        );

        this.clientsMenu = page.locator(
            "//a[normalize-space()='Clients']",
        );
        this.customersLink = page.locator(
            "(//a[normalize-space()='Customers'])",
        );

        this.specificationsMenu = page.locator(
            "//a[normalize-space()='Specifications']",
        );
        this.specificationsStandardsLink = page.locator(
            "//a[normalize-space()='Standards']",
        );
        this.standardsMaterialLink = page.locator(
            "//a[normalize-space()='Materials']",
        );
        this.specificationStandardsLink = page.locator(
            "//a[normalize-space()='Specification standards']",
        );
        this.specificationProcedureLink = page.locator(
            "//a[normalize-space()='Procedures']",
        );
        this.specificationProcessStandardLink = page.locator(
            "//a[normalize-space()='Process standard']",
        );

        this.assetsMenu = page.locator(
            "//a[normalize-space()='Asset']",
        );
        this.clientAssetRegisterLink = page.locator(
            "//a[normalize-space()='Client assets register']",
        );
        this.pressureEquipmentLink = page.locator(
            "//a[normalize-space()='Pressure equipment']",
        );
        this.tankEquipmentLink = page.locator(
            "//a[normalize-space()='Tanks']",
        );
        this.lsaEquipmentLink = page.locator(
            "//a[contains(normalize-space(),'Lifting systems')]",
        );
    }

    async JobsProcessRecords(): Promise<void> {
        await this.jobsProcessRecordsMenu.click();
        await this.createJobLink.click();
    }

    async searchAndProcessData(): Promise<void> {
        await this.jobsProcessRecordsMenu.click();
        await this.searchAndProcessDataLink.click();
    }

    async searchJob(): Promise<void> {
        await this.jobsProcessRecordsMenu.click();
        await this.searchJobLink.click();
    }

    async setCustomers(): Promise<void> {
        this.deps.logger.info('[OMS NAVIGATION] Opening Clients > Customers.');
        await this.clientsMenu.click();
        await this.customersLink.click();
        this.deps.logger.info('[OMS NAVIGATION] Navigated to Customers.');
    }

    async specificationsMaterial(): Promise<void> {
        await this.specificationsMenu.click();
        await this.specificationsStandardsLink.click();
        await this.standardsMaterialLink.click();
    }

    async specificationsProcedure(): Promise<void> {
        await this.specificationsMenu.click();
        await this.specificationsStandardsLink.click();
        await this.specificationProcedureLink.click();
    }

    async specificationProcessStandard(): Promise<void> {
        await this.specificationsMenu.click();
        await this.specificationsStandardsLink.click();
        await this.specificationProcessStandardLink.click();
    }

    async specificationStandards(): Promise<void> {
        await this.specificationsMenu.click();
        await this.specificationsStandardsLink.click();
        await this.specificationStandardsLink.click();
    }

    async clientAssetRegister(): Promise<void> {
        await this.assetsMenu.click();
        await this.clientAssetRegisterLink.click();
        await this.pressureEquipmentLink.click();
    }

    async clientAssetRegisterTank(): Promise<void> {
        await this.assetsMenu.click();
        await this.clientAssetRegisterLink.click();
        await this.tankEquipmentLink.click();
    }

    async clientAssetRegisterLSA(): Promise<void> {
        await this.assetsMenu.click();
        await this.clientAssetRegisterLink.click();
        await this.lsaEquipmentLink.click();
    }
}
