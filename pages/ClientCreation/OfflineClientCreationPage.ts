import type { Locator, Page } from '@playwright/test';
import type { OmsPageServices } from '../common/pageServices';

export class OfflineClientCreationPage {

    private createdClientName = '';

    private readonly newClientButton: Locator;
    private readonly newClientPopup: Locator;
    private readonly newClientPopupYesButton: Locator;
    private readonly businessName: Locator;
    private readonly chooseIndustryDropdown: Locator;
    private readonly industryDropdownOption: Locator;
    private readonly chooseCountryDropdown: Locator;
    private readonly countryDropdownOption: Locator;
    private readonly businessTypeDropdown: Locator;
    private readonly businessDropdownOption: Locator;
    private readonly businessIdNumber: Locator;
    private readonly taxIdNumber: Locator;
    private readonly accNo: Locator;
    private readonly relationshipManagerDropdown: Locator;
    private readonly relationshipDropdownOption: Locator;
    private readonly reportsConfigurationTab: Locator;
    private readonly reportNameDropdown: Locator;
    private readonly reportDropdownOption: Locator;
    private readonly reportDropdownpopupUnderstoodButton: Locator;
    private readonly workRecordYesButton: Locator;
    private readonly workRecordNoButton: Locator;
    private readonly workRecordPopupUnderstoodButton: Locator;
    private readonly reportsYesButton: Locator;
    private readonly reportsNoButton: Locator;
    private readonly reportsPopupUnderstoodButton: Locator;
    private readonly reportImages: Locator;
    private readonly reportimagesDropdownPopupUnderstoodButton: Locator;
    private readonly pdfReportsToMailYesButton: Locator;
    private readonly pdfReportsToMailNoButton: Locator;
    private readonly pdfReportsPopupUnderstoodButton: Locator;
    private readonly accountsSettingsTab: Locator;
    private readonly externalId: Locator;
    private readonly creditLimit: Locator;
    private readonly creditPeriod: Locator;
    private readonly creditDaysEffectiveDropdown: Locator;
    private readonly eomCalculation: Locator;
    private readonly invoiceInstructions: Locator;
    private readonly attachPdfToInvoiceYesButton: Locator;
    private readonly attachPdfToInvoiceNoButton: Locator;
    private readonly attachPdfInvoicePopupUnderstoodButton: Locator;
    private readonly specialInstructions: Locator;
    private readonly debtNotes: Locator;
    private readonly enableClientNoButton: Locator;
    private readonly saveButton: Locator;
    private readonly cancelButtonPopup: Locator;
    private readonly saveUnderstoodPopup: Locator;
    private readonly contactDetailsTab: Locator;
    private readonly newAddressButton: Locator;
    private readonly createNewAddressHeader: Locator;
    private readonly streetAddress: Locator;
    private readonly suburb: Locator;
    private readonly newAddressCountryDropdown: Locator;
    private readonly countryOptionIndia: Locator;
    private readonly newAddressStateDropdown: Locator;
    private readonly stateDropdownSearch: Locator;
    private readonly stateDropdownOption: Locator;
    private readonly postcode: Locator;
    private readonly newAddressSpecialInstructions: Locator;
    private readonly attachLimitationYesButton: Locator;
    private readonly attachLimitationNoButton: Locator;
    private readonly imagesPerPageDropdown: Locator;
    private readonly clientSignatureOnRecordsYesButton: Locator;
    private readonly clientSignatureOnRecordsNoButton: Locator;
    private readonly clientSignatureOnReportsYesButton: Locator;
    private readonly clientSignatureOnReportsNoButton: Locator;
    private readonly pdfReportsToEmailYesButton: Locator;
    private readonly pdfReportsToEmailNoButton: Locator;
    private readonly pdfReportsToInvoiceYesButton: Locator;
    private readonly pdfReportsToInvoiceNoButton: Locator;
    private readonly saveAddressButton: Locator;
    private readonly noAccountPopup: Locator;
    private readonly accountPopupCloseButton: Locator;
    private readonly newContactButton: Locator;
    private readonly firstName: Locator;
    private readonly lastName: Locator;
    private readonly primaryEmail: Locator;
    private readonly alternateEmail: Locator;
    private readonly phone: Locator;
    private readonly mobile: Locator;
    private readonly jobTitle: Locator;
    private readonly fax: Locator;
    private readonly limitationYesButton: Locator;
    private readonly limitationNoButton: Locator;
    private readonly receiveJobConfirmationYesButton: Locator;
    private readonly receiveJobConfirmationNoButton: Locator;
    private readonly certificatesWithReportsYesButton: Locator;
    private readonly certificatesWithReportsNoButton: Locator;
    private readonly workRecordsYesButton: Locator;
    private readonly workRecordsNoButton: Locator;
    private readonly pleasenotPopup: Locator;
    private readonly pleaseNotePopupEnterText: Locator;
    private readonly pleaseNotepopupConfirmButton: Locator;
    private readonly clientSignatureOnReportsYesButtonContact: Locator;
    private readonly clientSignatureOnReportsNoButtonContact: Locator;
    private readonly pdfReportsToEmailYesButtonContact: Locator;
    private readonly pdfReportsToEmailNoButtonContact: Locator;
    private readonly pdfReportsToInvoiceYesButtonContact: Locator;
    private readonly pdfReportsToInvoiceNoButtonContact: Locator;
    private readonly customerSurveyYesButton: Locator;
    private readonly customerSurveyNoButton: Locator;
    private readonly specialInstructionsContact: Locator;
    private readonly reportNameDropdownContact: Locator;
    private readonly reportDropdownOptionContact: Locator;
    private readonly imagesPerPageDropdownContact: Locator;
    private readonly defaultAddressCheckbox: Locator;
    private readonly saveContactButton: Locator;
    private readonly acceptClientPopup: Locator;
    private readonly acceptClientPopupButton: Locator;
    private readonly acceptClientButton: Locator;

    private readonly dependencies: OmsPageServices;

    constructor(private readonly page: Page, dependencies: OmsPageServices) {
        this.dependencies = dependencies;

        this.newClientButton = page.locator("//button[@class=\"btn btn-warning createNewClient btn-sm\"]//strong[normalize-space()='New Client']");
        this.newClientPopup = page.locator("//div[@class='bootbox modal fade bootbox-confirm in']//div[@class='modal-content']");
        this.newClientPopupYesButton = page.locator("//button[@class='btn btn btn-sm btn-success pull-right' and text()='Yes']");
        this.businessName = page.locator("//label[contains(normalize-space(),'Entity / Business name')]/following-sibling::div//input[@id='name']");
        this.chooseIndustryDropdown = page.locator("//span[@class=\"select2-selection__rendered\"]/span[text()=\"Choose industry type\"]");
        this.industryDropdownOption = page.locator("//li[starts-with(normalize-space(.), 'Oil And Gas Refinery')]");
        this.chooseCountryDropdown = page.locator("//span[@id=\"select2-clientCountry-container\"]/span[text()=\"Choose country\"]");
        this.countryDropdownOption = page.locator("//li[text()=\"Australia\"]");
        this.businessTypeDropdown = page.locator("(//span[@id='select2-businessType-container'])[last()]");
        this.businessDropdownOption = page.locator("//ul[@id='select2-businessType-results']//li[text()='Pty Ltd']");
        this.businessIdNumber = page.locator("//input[@id='abnNumber']");
        this.taxIdNumber = page.locator("//input[@id='taxIdNumber']");
        this.accNo = page.locator("//input[@id='acnNumber']");
        this.relationshipManagerDropdown = page.locator("//span[@id='select2-customerRelationshipManagerId-container']/span[text()='Choose user type']");
        this.relationshipDropdownOption = page.locator("//li[text()=\"UDAY MS\"]");
        this.reportsConfigurationTab = page.locator("//a[text()=\"Reports related Configuration\"]");
        this.reportNameDropdown = page.locator("//label[@for='extraIdentifierInReport']/*[@class='glyphicon glyphicon-menu-down']");
        this.reportDropdownOption = page.locator("//li[@class=\"ui-menu-item\"]//div[normalize-space()='Client company name only']");
        this.reportDropdownpopupUnderstoodButton = page.locator("//p[contains(text(),'Changing the value of \"Extra identifier in Report Name\"')]//ancestor::div[@class=\"modal-content\"]//button[text()=\"Understood\"]");
        this.workRecordYesButton = page.locator("#includeClientSignatureOnWorkRecordYES");
        this.workRecordNoButton = page.locator("#includeClientSignatureOnWorkRecordNO");
        this.workRecordPopupUnderstoodButton = page.locator("//p[contains(text(),'Changing the value of \"Include client signature on')]//ancestor::div[@class=\"modal-content\"]//button[text()=\"Understood\"]");
        this.reportsYesButton = page.locator("#includeClientSignatureYES");
        this.reportsNoButton = page.locator("#includeClientSignatureNO");
        this.reportsPopupUnderstoodButton = page.locator("//p[contains(text(),'Changing the value of \"Include client signature on reports\"')]//ancestor::div[@class=\"modal-content\"]//button[text()=\"Understood\"]");
        this.reportImages = page.locator("//div[@class='row configRow']//select[@id='noOfImagesPerPage']");
        this.reportimagesDropdownPopupUnderstoodButton = page.locator("//p[contains(text(),'Changing the value of \"Images per page on Report\"')]//ancestor::div[@class=\"modal-content\"]//button[text()=\"Understood\"]");
        this.pdfReportsToMailYesButton = page.locator("#attachPdfReportEmailYES");
        this.pdfReportsToMailNoButton = page.locator("#attachPdfReportEmailNO");
        this.pdfReportsPopupUnderstoodButton = page.locator("//span[contains(text(),'Attach PDF to reports email')]/ancestor::div[@class='modal-content']//button[@data-bb-handler='understood']");
        this.accountsSettingsTab = page.locator("//a[@data-parent='#accordionAccounts']");
        this.externalId = page.locator("//input[@id='cardId']");
        this.creditLimit = page.locator("//input[@id='creditLimit']");
        this.creditPeriod = page.locator("//input[@id='creditPeriodNC']");
        this.creditDaysEffectiveDropdown = page.locator("//select[@id='creditDaysEffectiveFrom']");
        this.eomCalculation = page.locator("//input[@id='cutOffDate']");
        this.invoiceInstructions = page.locator("//textarea[@id='invoiceInstructions']");
        this.attachPdfToInvoiceYesButton = page.locator("#attachPdfInvoiceEmailYES");
        this.attachPdfToInvoiceNoButton = page.locator("#attachPdfInvoiceEmailNO");
        this.attachPdfInvoicePopupUnderstoodButton = page.locator("//p[contains(text(),'Changing the value of \"Attach PDF to invoice email\"')]//ancestor::div[@class=\"modal-content\"]//button[text()=\"Understood\"]");
        this.specialInstructions = page.locator("//label[contains(text(),'Debt Notes')]/parent::div/preceding-sibling::div//textarea[@id='specialInstructions']");
        this.debtNotes = page.locator("//textarea[@id='debtNotes']");
        this.enableClientNoButton = page.locator("#clientPortalEnabledNO");
        this.saveButton = page.locator("//button[@id='btn-save-crt']");
        this.cancelButtonPopup = page.locator("//button[@data-bb-handler='cancel']");
        this.saveUnderstoodPopup = page.locator("//button[@data-bb-handler='confirm' and text()=\"Understood\"]");
        this.contactDetailsTab = page.locator("//a[normalize-space()='Address/Contact details']");
        this.newAddressButton = page.locator("//button[normalize-space()='New Address']");
        this.createNewAddressHeader = page.locator("//h4[@id='header-title' and text()='Create New Address']");
        this.streetAddress = page.locator("//input[@id='streetAddress']");
        this.suburb = page.locator("//input[@id='suburb']");
        this.newAddressCountryDropdown = page.locator("//span[@id='select2-country-container']");
        this.countryOptionIndia = page.locator("//ul[@id='select2-country-results']//li[text()='India']");
        this.newAddressStateDropdown = page.locator("//span[@id='select2-state-container']");
        this.stateDropdownSearch = page.locator("input.select2-search__field");
        this.stateDropdownOption = page.locator("//li[contains(@id,'Karnataka')]");
        this.postcode = page.locator("//input[@id='postCode' and @name=\"postCode\"]");
        this.newAddressSpecialInstructions = page.locator("//div[@class='col-sm-9']//textarea[@id='specialInstructions']");
        this.attachLimitationYesButton = page.locator("//label[contains(text(),'Special Instructions')]/parent::div/following-sibling::div//label[contains(text(),'Attach limitations with job confirmation email')]/following-sibling::div//input[@value='yes']");
        this.attachLimitationNoButton = page.locator("//label[contains(text(),'Special Instructions')]/parent::div/following-sibling::div//label[contains(text(),'Attach limitations with job confirmation email')]/following-sibling::div//input[@value='no']");
        this.imagesPerPageDropdown = page.locator("//div[@class='form-group']//select[@id='noOfImagesPerPage']");
        this.clientSignatureOnRecordsYesButton = page.locator("//input[@id='includeClientSignatureOnWorkRecordYES' and @name='includeClientSignatureOnWorkRecordAddressLevel']");
        this.clientSignatureOnRecordsNoButton = page.locator("//input[@id='includeClientSignatureOnWorkRecordNO' and @name='includeClientSignatureOnWorkRecordAddressLevel']");
        this.clientSignatureOnReportsYesButton = page.locator("//input[@id=\"includeClientSignatureYES\" and @name=\"includeSignatureAddressLevel\"]");
        this.clientSignatureOnReportsNoButton = page.locator("//input[@id=\"includeClientSignatureNO\" and @name=\"includeSignatureAddressLevel\"]");
        this.pdfReportsToEmailYesButton = page.locator("//input[@id=\"attachPdfReportEmailYES\" and @name=\"attachPdfReportEmailAddressLevel\"]");
        this.pdfReportsToEmailNoButton = page.locator("//input[@id=\"attachPdfReportEmailNO\" and @name=\"attachPdfReportEmailAddressLevel\"]");
        this.pdfReportsToInvoiceYesButton = page.locator("//input[@name='attachPdfInvoiceEmailAddressLevel' and @value='yes']/parent::label");
        this.pdfReportsToInvoiceNoButton = page.locator("//input[@name='attachPdfInvoiceEmailAddressLevel' and @value='no']/parent::label");
        this.saveAddressButton = page.locator("//button[@id='btn-save']");
        this.noAccountPopup = page.locator("//span[@id='headerTextNoAccContact']");
        this.accountPopupCloseButton = page.locator("//span[normalize-space()=\"No account contact\"]//ancestor::div[@class=\"modal-content\"]//button[@class=\"close\"]");
        this.newContactButton = page.locator("//div[@class=\"col-sm-6\"]//button[@class=\"btn btn-warning pull-right mt-15 btn-new btn-sm\"]");
        this.firstName = page.locator("//input[@id='firstName']");
        this.lastName = page.locator("//input[@id='lastName']");
        this.primaryEmail = page.locator("//input[@id='primaryEmail']");
        this.alternateEmail = page.locator("//input[@id='alternateEmail']");
        this.phone = page.locator("//input[@id='phone']");
        this.mobile = page.locator("//input[@id='mobile']");
        this.jobTitle = page.locator("//input[@id='jobTitle']");
        this.fax = page.locator("//input[@id='fax']");
        this.limitationYesButton = page.locator("//label[normalize-space()='Fax']/ancestor::div[contains(@class,'form-group')]/following-sibling::div//label[contains(normalize-space(),'Attach limitations with job confirmation email')]/following-sibling::div//label[normalize-space()='Yes']");
        this.limitationNoButton = page.locator("//label[normalize-space()='Fax']/ancestor::div[contains(@class,'form-group')]/following-sibling::div//label[contains(normalize-space(),'Attach limitations with job confirmation email')]/following-sibling::div//label[normalize-space()='No']");
        this.receiveJobConfirmationYesButton = page.locator("//label[contains(normalize-space(),'Receive job confirmation')]/following-sibling::div//label[normalize-space()='Yes']");
        this.receiveJobConfirmationNoButton = page.locator("//label[text()=\"Include client signature on reports\"]/following-sibling::div//input[@name=\"includeSignatureContactlevel\" and @value=\"no\"]");
        this.certificatesWithReportsYesButton = page.locator("//input[@name='attachTestPersonnelsCertificate' and @value='yes']");
        this.certificatesWithReportsNoButton = page.locator("//input[@name='attachTestPersonnelsCertificate' and @value='no']");
        this.workRecordsYesButton = page.locator("//label[contains(text(), \"Client signature MUST on work record\")]/following-sibling::div//input[@name=\"includeClientSignatureOnWorkRecordContactlevel\" and @value=\"yes\"]");
        this.workRecordsNoButton = page.locator("//label[contains(text(), \"Client signature MUST on work record\")]/following-sibling::div//input[@name=\"includeClientSignatureOnWorkRecordContactlevel\" and @value=\"no\"]");
        this.pleasenotPopup = page.locator("//*[contains(text(),'PDF with the report email.')]/following::button[normalize-space()='Understood']");
        this.pleaseNotePopupEnterText = page.locator("//input[@id=\"fieldChangeReason\"]");
        this.pleaseNotepopupConfirmButton = page.locator("//button[@id=\"fieldChangeReasonSubmit\"]");
        this.clientSignatureOnReportsYesButtonContact = page.locator("//label[text()=\"Include client signature on reports\"]/following-sibling::div//input[@name=\"includeSignatureContactlevel\" and @value=\"yes\"]");
        this.clientSignatureOnReportsNoButtonContact = page.locator("//label[text()=\"Include client signature on reports\"]/following-sibling::div//input[@name=\"includeSignatureContactlevel\" and @value=\"no\"]");
        this.pdfReportsToEmailYesButtonContact = page.locator("(//label[contains(normalize-space(),'Attach PDF to reports email')]/following-sibling::div//label[normalize-space()='Yes'])[2]");
        this.pdfReportsToEmailNoButtonContact = page.locator("(//label[contains(normalize-space(),'Attach PDF to reports email')]/following-sibling::div//label[normalize-space()='No'])[2]");
        this.pdfReportsToInvoiceYesButtonContact = page.locator("(//label[contains(normalize-space(),'Attach PDF to invoice email')]/following-sibling::div//label[normalize-space()='Yes'])[2]");
        this.pdfReportsToInvoiceNoButtonContact = page.locator("(//label[contains(normalize-space(),'Attach PDF to invoice email')]/following-sibling::div//label[normalize-space()='No'])[2]");
        this.customerSurveyYesButton = page.locator("//label[text()=\"Customer survey email?\"]/following-sibling::div//input[@name=\"customerSurveyEmail\" and @value=\"yes\"]");
        this.customerSurveyNoButton = page.locator("//label[text()=\"Customer survey email?\"]/following-sibling::div//input[@name=\"customerSurveyEmail\" and @value=\"no\"]");
        this.specialInstructionsContact = page.locator("//div[@class='col-sm-8']//textarea[@id='specialInstructions']");
        this.reportNameDropdownContact = page.locator("//input[@id='extraIdentifierInReportForModal']");
        this.reportDropdownOptionContact = page.locator("//div[@class=\"ui-menu-item-wrapper\" and text()=\"Client company name only\"]");
        this.imagesPerPageDropdownContact = page.locator("//select[@id='noOfImagesPerPage']");
        this.defaultAddressCheckbox = page.locator("//label[@class='checkbox']//input[@id='defaultEntry']");
        this.saveContactButton = page.locator("//button[@id='btn-save']");
        this.acceptClientPopup = page.locator("//h4[@class=\"modal-title\"]//ancestor::div[@class=\"modal-content\"]//span[@id=\"headerTextNoAccContact\"]");
        this.acceptClientPopupButton = page.locator("//div[@class=\"modal-body\"]//ancestor::div[@class=\"modal-content\"]//a[@id=\"btn-acceptNoAccContact\"]");
        this.acceptClientButton = page.locator("//button[@id=\"btn-accept\" and normalize-space(.)=\"Accept Client\"]");
    }

    private async getEnv(key: string): Promise<string> {
        return (await this.dependencies.fileUtils.getDynamicEnvValue(key)) || '';
    }

    private randomNumeric(length: number): string {
        let value = '';
        for (let index = 0; index < length; index++) {
            value += Math.floor(Math.random() * 10).toString();
        }
        return value;
    }

    private async clickSafe(locator: Locator, description: string): Promise<void> {
        try {
            await this.dependencies.uiActions.click(locator);
        } catch (error) {
            this.dependencies.logger.warn(
                `${description}: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    // Clicks New Client, waits for the confirmation popup and confirms Yes.
    async openNewClientModal(): Promise<void> {
        await this.dependencies.uiActions.click(this.newClientButton);
        await this.dependencies.uiActions.waitForVisible(this.newClientPopup);
        await this.dependencies.uiActions.click(this.newClientPopupYesButton);
    }

    // Generates the client name, stores it in .env, and fills business information.
    async fillBusinessInformation(): Promise<void> {
        this.createdClientName = `${await this.getEnv('BusinessName')}${this.randomNumeric(4)}`;

        await this.dependencies.uiActions.fill(this.businessName, this.createdClientName);
        await this.dependencies.fileUtils.writeToEnvFile('CreatedClient', this.createdClientName);
        this.dependencies.logger.info(`✓ Created and saved client name: ${this.createdClientName}`);

        await this.dependencies.uiActions.click(this.chooseIndustryDropdown);
        await this.dependencies.uiActions.waitForVisible(this.industryDropdownOption);
        await this.dependencies.uiActions.scrollToElement(this.industryDropdownOption);
        await this.dependencies.uiActions.click(this.industryDropdownOption);

        await this.dependencies.uiActions.waitForVisible(this.chooseCountryDropdown);
        await this.dependencies.uiActions.click(this.chooseCountryDropdown);
        await this.dependencies.uiActions.scrollToElement(this.countryDropdownOption);
        await this.dependencies.uiActions.click(this.countryDropdownOption);

        await this.dependencies.uiActions.waitForVisible(this.businessTypeDropdown);
        await this.dependencies.uiActions.click(this.businessTypeDropdown);
        await this.dependencies.uiActions.scrollToElement(this.businessDropdownOption);
        await this.dependencies.uiActions.click(this.businessDropdownOption);

        await this.dependencies.uiActions.fill(this.businessIdNumber, this.randomNumeric(3));
        await this.dependencies.uiActions.fill(this.taxIdNumber, this.randomNumeric(5));
        await this.dependencies.uiActions.fill(this.accNo, this.randomNumeric(11));

        await this.dependencies.uiActions.click(this.relationshipManagerDropdown);
        await this.dependencies.uiActions.scrollToElement(this.relationshipDropdownOption);
        await this.dependencies.uiActions.click(this.relationshipDropdownOption);
    }

    // Opens Reports Configuration and applies the same settings as Selenium.
    async configureReports(): Promise<void> {
        if (!(await this.dependencies.uiActions.isVisible(this.reportNameDropdown))) {
            await this.dependencies.uiActions.click(this.reportsConfigurationTab);
        }

        await this.dependencies.uiActions.waitForVisible(this.reportNameDropdown);
        await this.dependencies.uiActions.click(this.reportNameDropdown);
        await this.dependencies.uiActions.click(this.reportDropdownOption);
        await this.dependencies.uiActions.click(this.reportDropdownpopupUnderstoodButton);

        await this.dependencies.uiActions.click(this.workRecordYesButton);
        await this.dependencies.uiActions.click(this.workRecordPopupUnderstoodButton);
        await this.dependencies.uiActions.click(this.workRecordNoButton);
        await this.dependencies.uiActions.click(this.workRecordPopupUnderstoodButton);

        await this.dependencies.uiActions.clickUsingJS(this.reportsYesButton);
        await this.clickSafe(this.reportsPopupUnderstoodButton, 'Could not click Reports Yes Understood popup');
        await this.dependencies.uiActions.clickUsingJS(this.reportsNoButton);
        await this.clickSafe(this.reportsPopupUnderstoodButton, 'Could not click Reports No Understood popup');

        await this.dependencies.uiActions.selectByValue(this.reportImages, '4');
        await this.dependencies.uiActions.click(this.reportimagesDropdownPopupUnderstoodButton);

        await this.dependencies.uiActions.clickUsingJS(this.pdfReportsToMailYesButton);
        await this.dependencies.uiActions.click(this.pdfReportsPopupUnderstoodButton);
        await this.dependencies.uiActions.clickUsingJS(this.pdfReportsToMailNoButton);
        await this.dependencies.uiActions.click(this.pdfReportsPopupUnderstoodButton);
    }

    // Opens Accounts Settings and applies the same values and options as Selenium.
    async configureAccountSettings(): Promise<void> {
        if (!(await this.dependencies.uiActions.isVisible(this.externalId))) {
            await this.dependencies.uiActions.click(this.accountsSettingsTab);
        }

        await this.dependencies.uiActions.fill(this.externalId, this.randomNumeric(3));
        await this.dependencies.uiActions.fill(this.creditLimit, '7000');
        await this.dependencies.uiActions.fill(this.creditPeriod, '20');
        await this.dependencies.uiActions.selectByValue(this.creditDaysEffectiveDropdown, 'EOM');
        await this.dependencies.uiActions.fill(this.eomCalculation, '25');
        await this.dependencies.uiActions.fill(this.invoiceInstructions, await this.getEnv('InvoiceInstructions'));

        await this.dependencies.uiActions.clickUsingJS(this.attachPdfToInvoiceNoButton);
        await this.clickSafe(this.attachPdfInvoicePopupUnderstoodButton, 'Could not click Attach PDF to Invoice No Understood popup');
        await this.dependencies.uiActions.clickUsingJS(this.attachPdfToInvoiceYesButton);
        await this.clickSafe(this.attachPdfInvoicePopupUnderstoodButton, 'Could not click Attach PDF to Invoice Yes Understood popup');

        await this.dependencies.uiActions.fill(this.specialInstructions, await this.getEnv('SpecialInstructions'));
        await this.dependencies.uiActions.fill(this.debtNotes, await this.getEnv('DebtNotes'));
        await this.dependencies.uiActions.clickUsingJS(this.enableClientNoButton);
    }

    // Saves client details and handles the cancel and understood popups.
    async saveClientAndHandlePopups(): Promise<void> {
        this.dependencies.logger.info('Attempting to save client details...');
        await this.dependencies.uiActions.click(this.saveButton);

        if (await this.dependencies.uiActions.isVisible(this.cancelButtonPopup)) {
            this.dependencies.logger.info("'Cancel' popup appeared. Closing it.");
            await this.dependencies.uiActions.waitForVisible(this.cancelButtonPopup);
            await this.dependencies.uiActions.click(this.cancelButtonPopup);
            await this.dependencies.uiActions.waitForHidden(this.cancelButtonPopup);
            this.dependencies.logger.info('Clicking Save button again...');
            await this.dependencies.uiActions.click(this.saveButton);
        }

        try {
            await this.dependencies.uiActions.waitForVisible(this.saveUnderstoodPopup);
            this.dependencies.logger.info("'Understood' popup appeared. Confirming.");
            await this.dependencies.uiActions.click(this.saveUnderstoodPopup);
            await this.dependencies.uiActions.waitForHidden(this.saveUnderstoodPopup);
        } catch {
            this.dependencies.logger.warn('Understood popup did not appear or already closed.');
        }

        this.dependencies.logger.info(`✓ Client saved successfully: ${this.createdClientName}`);
    }

    // Navigates to Address/Contact details, fills address and saves it.
    async fillAddressDetails(): Promise<void> {
        await this.dependencies.uiActions.waitForLoadState('load', { timeout: 3_000 });
        await this.dependencies.uiActions.waitForVisible(this.contactDetailsTab);

        try {
            await this.dependencies.uiActions.click(this.contactDetailsTab);
        } catch {
            await this.dependencies.uiActions.clickUsingJS(this.contactDetailsTab);
        }

        await this.dependencies.uiActions.click(this.newAddressButton);
        await this.dependencies.uiActions.waitForVisible(this.createNewAddressHeader);

        await this.dependencies.uiActions.fill(this.streetAddress, await this.getEnv('StreetAddress'));
        await this.dependencies.uiActions.fill(this.suburb, await this.getEnv('Suburb'));

        await this.dependencies.uiActions.click(this.newAddressCountryDropdown);
        await this.dependencies.uiActions.scrollToElement(this.countryOptionIndia);
        await this.dependencies.uiActions.click(this.countryOptionIndia);
        await this.page.waitForTimeout(1_000);

        await this.dependencies.uiActions.click(this.newAddressStateDropdown);
        await this.dependencies.uiActions.fill(this.stateDropdownSearch, 'Karnataka');
        await this.dependencies.uiActions.click(this.stateDropdownOption);
        this.dependencies.logger.info('Selected State: Karnataka');

        await this.dependencies.uiActions.fill(this.postcode, await this.getEnv('PostalAddress'));
        await this.dependencies.uiActions.fill(this.newAddressSpecialInstructions, await this.getEnv('SpecialInstructions'));

        await this.dependencies.uiActions.clickUsingJS(this.attachLimitationNoButton);
        await this.dependencies.uiActions.clickUsingJS(this.attachLimitationYesButton);
        // Selenium's imagesPerPageDropdown selection is commented out; intentionally not executed.

        await this.dependencies.uiActions.click(this.clientSignatureOnRecordsYesButton);
        await this.dependencies.uiActions.clickUsingJS(this.clientSignatureOnRecordsNoButton);
        await this.dependencies.uiActions.clickUsingJS(this.clientSignatureOnReportsYesButton);
        await this.dependencies.uiActions.clickUsingJS(this.clientSignatureOnReportsNoButton);
        await this.dependencies.uiActions.clickUsingJS(this.pdfReportsToEmailYesButton);
        await this.dependencies.uiActions.clickUsingJS(this.pdfReportsToEmailNoButton);
        await this.dependencies.uiActions.clickUsingJS(this.pdfReportsToInvoiceNoButton);
        await this.dependencies.uiActions.clickUsingJS(this.pdfReportsToInvoiceYesButton);

        await this.dependencies.uiActions.click(this.saveAddressButton);
        await this.dependencies.uiActions.waitForLoadState('load', { timeout: 3_000 });

        await this.page.waitForTimeout(5_000);
        await this.dependencies.uiActions.waitForVisible(this.noAccountPopup);
        await this.dependencies.uiActions.click(this.accountPopupCloseButton);
        await this.dependencies.uiActions.waitForHidden(this.noAccountPopup);
    }

    // Fills contact details and all contact-level settings, then saves.
    async fillContactPersonDetails(): Promise<void> {
        await this.dependencies.uiActions.click(this.newContactButton);
        await this.dependencies.uiActions.fill(this.firstName, await this.getEnv('FirstName'));
        await this.dependencies.uiActions.fill(this.lastName, await this.getEnv('LastName'));
        await this.dependencies.uiActions.fill(this.primaryEmail, await this.getEnv('PrimaryEmail'));
        await this.dependencies.uiActions.fill(this.alternateEmail, await this.getEnv('AlternateEmail'));
        await this.dependencies.uiActions.fill(this.phone, this.randomNumeric(10));
        await this.dependencies.uiActions.fill(this.mobile, this.randomNumeric(10));
        await this.dependencies.uiActions.fill(this.jobTitle, await this.getEnv('JobTitle'));
        await this.dependencies.uiActions.fill(this.fax, this.randomNumeric(10));

        await this.dependencies.uiActions.clickUsingJS(this.limitationNoButton);
        await this.dependencies.uiActions.clickUsingJS(this.limitationYesButton);
        await this.dependencies.uiActions.clickUsingJS(this.receiveJobConfirmationYesButton);
        await this.dependencies.uiActions.clickUsingJS(this.receiveJobConfirmationNoButton);
        await this.dependencies.uiActions.clickUsingJS(this.certificatesWithReportsYesButton);
        await this.dependencies.uiActions.clickUsingJS(this.certificatesWithReportsNoButton);
        await this.dependencies.uiActions.clickUsingJS(this.workRecordsYesButton);
        await this.dependencies.uiActions.clickUsingJS(this.workRecordsNoButton);
        await this.dependencies.uiActions.clickUsingJS(this.clientSignatureOnReportsYesButtonContact);
        await this.dependencies.uiActions.clickUsingJS(this.clientSignatureOnReportsNoButtonContact);
        await this.dependencies.uiActions.clickUsingJS(this.pdfReportsToEmailYesButtonContact);
        await this.dependencies.uiActions.click(this.pleasenotPopup);
        await this.dependencies.uiActions.fill(this.pleaseNotePopupEnterText, 'test');
        await this.dependencies.uiActions.click(this.pleaseNotepopupConfirmButton);
        await this.dependencies.uiActions.clickUsingJS(this.pdfReportsToEmailNoButtonContact);
        await this.dependencies.uiActions.click(this.pleasenotPopup);
        await this.dependencies.uiActions.fill(this.pleaseNotePopupEnterText, 'test');
        await this.dependencies.uiActions.click(this.pleaseNotepopupConfirmButton);
        await this.dependencies.uiActions.clickUsingJS(this.pdfReportsToInvoiceNoButtonContact);
        await this.dependencies.uiActions.clickUsingJS(this.pdfReportsToInvoiceYesButtonContact);
        await this.dependencies.uiActions.clickUsingJS(this.customerSurveyNoButton);
        await this.dependencies.uiActions.clickUsingJS(this.customerSurveyYesButton);

        await this.dependencies.uiActions.fill(this.specialInstructionsContact, await this.getEnv('NewAddressSpecialInstructions'));

        // Selenium's report-name and image-count actions are commented out; intentionally not executed.
        await this.dependencies.uiActions.clickUsingJS(this.defaultAddressCheckbox);
        await this.dependencies.uiActions.click(this.saveContactButton);
    }

    // Waits for the accept-client popup, accepts the no-account-contact prompt, then accepts client.
    async acceptClient(): Promise<void> {
        await this.dependencies.uiActions.waitForAttached(this.acceptClientPopup);
        await this.dependencies.uiActions.click(this.acceptClientPopupButton);
        await this.dependencies.uiActions.click(this.acceptClientButton);
        this.dependencies.logger.info(`✓ Client accepted: ${this.createdClientName}`);
    }

    // Returns the in-memory client name generated by fillBusinessInformation.
    getCreatedClientName(): string {
        return this.createdClientName;
    }
}
