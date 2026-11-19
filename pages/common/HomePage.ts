
import type { Locator, Page } from '@playwright/test';

import type { OmsPageServices } from './pageServices';

// =========================================================================
// POPUP HANDLER
// =========================================================================

interface PopupHandler {
    popup: Locator;
    close: Locator;
}

export class HomePage {

    // =========================================================================
    // DASHBOARD
    // =========================================================================

    readonly jobsDashboardHeading: Locator;

    // =========================================================================
    // POPUP MAP
    // Key   = Popup name
    // Value = Popup locator and corresponding close button
    // =========================================================================

    private readonly popupHandlers: Map<string, PopupHandler>;

    // =========================================================================
    // TIMESHEET
    // =========================================================================

    readonly timesheetPopup: Locator;
    readonly timesheetCloseButton: Locator;

    // =========================================================================
    // CHATBOT
    // =========================================================================

    readonly chatbotFrameSelector =
        "//iframe[@frameborder='0' and @title='chat widget' and starts-with(@id,'skbmt')]";

    readonly chatbotIconLocator =
        "//div[@isroundwidget='true']//div//*[name()='svg']";

    private readonly dependencies: OmsPageServices;

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    constructor(private readonly page: Page, dependencies: OmsPageServices) {
        this.dependencies = dependencies;

        // =====================================================================
        // DASHBOARD
        // =====================================================================

        this.jobsDashboardHeading = page.locator(
            "(//h4[normalize-space()='Jobs Dashboard'])[1]",
        );

        // =====================================================================
        // POPUP LOCATORS
        // Exact popup mappings from Java HomePage.java
        // =====================================================================

        const safetyBulletinPopup = page.locator(
            "//h2[@mat-dialog-title][contains(., 'revised safety bulletin has been published')]",
        );

        const safetyBulletinClose = page.locator(
            "//h2[@mat-dialog-title][contains(., 'revised safety bulletin has been published')]/ancestor::oms22-safety-bulletin-notification-dialog//mat-dialog-actions//button[contains(., 'Snooze')]",
        );

        const caparPopup = page.locator(
            "//div[contains(@class, 'title')][normalize-space()='CAPAR(s) Assigned To You']",
        );

        const caparClose = page.locator(
            "//div[contains(@class, 'title')][normalize-space()='CAPAR(s) Assigned To You']/ancestor::oms22-capar-popup-dialogue//div[contains(@class, 'actions')]//button[contains(., 'Snooze')]",
        );

        const testReportApprovalPopup = page.locator(
            "//h4[normalize-space()='Test report approval notification']",
        );

        const testReportApprovalClose = page.locator(
            "//button[@id='testerApprovalModalClose']",
        );

        const revisedPolicyPopup = page.locator(
            "//h4[normalize-space()='A new / revised policy has been implemented.']",
        );

        const revisedPolicyClose = page.locator(
            "(//button[normalize-space()='Remind later'])[1]",
        );

        const importantMessagePopup = page.locator(
            "//h4[normalize-space()='Important message']",
        );

        const importantMessageClose = page.locator(
            "//button[@id='companyInfoFooterBtn' ] [text() ='Understood']",
        );

        const newApprovalRequestPopup = page.locator(
            '//h4[text()= "New approval request received"]',
        );

        const newApprovalRequestClose = page.locator(
            "//button[@onclick='closePendingApprovalModalAndSnooze()' and text()='Close']",
        );

        const holdReportsPopup = page.locator(
            "//h4[normalize-space()='Hold reports']",
        );

        const holdReportsClose = page.locator(
            "//button[@id='rohPopUpCloseBtn']",
        );

        // Preserving the original Java popup locator.
        const newClientReminderPopup = page.locator(
            "//div[@id='bs-example-navbar-collapse-1']//div[@id='newClientReminderModal']//div[@class='modal-dialog modal-md']//div[@class='modal-content']//div//button[@id='snooze']",
        );

        // Preserving the original Java close locator.
        const newClientReminderClose = page.locator(
            "//button[@id='testerApprovalModalClose']",
        );

        const clientReleaseBannerPopup = page.locator(
            "//strong[text()='OMS upgrading with new features']",
        );

        const clientReleaseBannerClose = page.locator(
            "//button[@onclick='noticeAccepted()']",
        );

        const incompleteReportsPopup = page.locator(
            "//h4[normalize-space()='Incomplete reports']",
        );

        const incompleteReportsClose = page.locator(
            "//button[@id='roiPopUpCloseBtn']",
        );

        const requestApprovalPopup = page.locator(
            "(//div[contains(@class,'modal-content')]//h4[contains(.,'Request for approval')])[1]",
        );

        const requestApprovalClose = page.locator(
            "(//h4[contains(.,'Request for approval')]/ancestor::div[contains(@class,'modal-content')]//button[@id='snooze'])[1]",
        );

        // =====================================================================
        // POPUP MAP
        //
        // Only configured popups are checked.
        // Their order is preserved here for predictable processing.
        // =====================================================================

        this.popupHandlers = new Map<string, PopupHandler>([

            [
                'Safety Bulletin',
                {
                    popup: safetyBulletinPopup,
                    close: safetyBulletinClose,
                },
            ],

            [
                'CAPAR Assigned',
                {
                    popup: caparPopup,
                    close: caparClose,
                },
            ],

            [
                'Test Report Approval',
                {
                    popup: testReportApprovalPopup,
                    close: testReportApprovalClose,
                },
            ],

            [
                'Revised Policy',
                {
                    popup: revisedPolicyPopup,
                    close: revisedPolicyClose,
                },
            ],

            [
                'Important Message',
                {
                    popup: importantMessagePopup,
                    close: importantMessageClose,
                },
            ],

            [
                'New Approval Request',
                {
                    popup: newApprovalRequestPopup,
                    close: newApprovalRequestClose,
                },
            ],

            [
                'Hold Reports',
                {
                    popup: holdReportsPopup,
                    close: holdReportsClose,
                },
            ],

            [
                'New Client Reminder',
                {
                    popup: newClientReminderPopup,
                    close: newClientReminderClose,
                },
            ],

            [
                'Client Release Banner',
                {
                    popup: clientReleaseBannerPopup,
                    close: clientReleaseBannerClose,
                },
            ],

            [
                'Incomplete Reports',
                {
                    popup: incompleteReportsPopup,
                    close: incompleteReportsClose,
                },
            ],

            [
                'Request for Approval',
                {
                    popup: requestApprovalPopup,
                    close: requestApprovalClose,
                },
            ],
        ]);

        // =====================================================================
        // TIMESHEET
        // Separate from the popup Map.
        // =====================================================================

        this.timesheetPopup = page.locator(
            "//h4[normalize-space()='No time sheet entry found yesterday.']",
        );

        this.timesheetCloseButton = page.locator(
            "//div[@id='understoodInstructionModal']//button[1]",
        );
    }

    // =========================================================================
    // POPUP HANDLING
    // =========================================================================

    /**
     * Java equivalent:
     *
     * handlePopups(true, null)
     *   Close all visible configured popups.
     *
     * handlePopups(true, 'Hold Reports')
     *   Keep Hold Reports open and close all other visible popups.
     *
     * handlePopups(false, null)
     *   Do not close any popup. Log visible popups as ignored.
     *
     * handlePopups(false, 'Hold Reports')
     *   Do not close any popup. Keep target open if visible and
     *   leave every other visible popup open too.
     *
     * Each Map entry is checked exactly once.
     * Missing popup = skip and move to next entry.
     * No retry loop.
     */
    async handlePopups(
        shouldClose: boolean,
        targetPopupName: string | null = null,
    ): Promise<void> {

        this.dependencies.logger.info(
            `[OMS POPUPS] Starting popup handling. shouldClose=${shouldClose}, target=${targetPopupName ?? 'null'}`,
        );

        // Iterate through every configured Map entry.
        for (const [popupName, handler] of this.popupHandlers) {

            try {

                // =============================================================
                // 1. CHECK WHETHER POPUP IS DISPLAYED
                // =============================================================

                const isDisplayed = await handler.popup.isVisible();

                // If popup is absent, skip it immediately.
                // Do not retry or wait for it to appear.
                if (!isDisplayed) {
                    continue;
                }

                this.dependencies.logger.info(
                    `[OMS POPUPS] Popup detected: ${popupName}`,
                );

                // =============================================================
                // 2. TARGET POPUP CONDITION
                // =============================================================

                // Keep the target popup open when it matches the Map key.
                if (targetPopupName !== null && popupName === targetPopupName) {

                    this.dependencies.logger.info(
                        `[OMS POPUPS] Keeping target popup open: ${popupName}`,
                    );

                    continue;
                }

                // =============================================================
                // 3. SHOULD CLOSE = TRUE
                // =============================================================

                if (shouldClose) {

                    await this.closePopup(
                        popupName,
                        handler.close,
                        handler.popup,
                    );
                }

                // =============================================================
                // 4. SHOULD CLOSE = FALSE
                // =============================================================

                else {

                    this.dependencies.logger.info(
                        `[OMS POPUPS] Popup visible but ignoring close: ${popupName}`,
                    );
                }

            } catch (error) {

                // Log this popup failure and continue to the next Map entry.
                // Do not retry the missing or failed popup.
                const message =
                    error instanceof Error
                        ? error.message
                        : String(error);

                this.dependencies.logger.warn(
                    `[OMS POPUPS] Error handling popup "${popupName}": ${message}`,
                );

                continue;
            }
        }

        this.dependencies.logger.info(
            '[OMS POPUPS] Popup handling completed.',
        );
    }

    // =========================================================================
    // CLOSE POPUP
    // =========================================================================

    /**
     * Java equivalent:
     *
     * closePopup(closeLocator, popupLocator)
     *
     * Uses JavaScript DOM click, like the original Java ActionDriver.
     * Waits up to 3 seconds for the popup to disappear.
     *
     * No retries.
     */
    private async closePopup(
        popupName: string,
        closeLocator: Locator,
        popupLocator: Locator,
    ): Promise<void> {

        try {

            this.dependencies.logger.info(
                `[OMS POPUPS] Clicking close button: ${popupName}`,
            );

            // Wait for the close button to be attached.
            await closeLocator.waitFor({
                state: 'attached',
                timeout: 3_000,
            });

            // Java ActionDriver.clickUsingJS() equivalent.
            await closeLocator.evaluate((element) => {
                (element as HTMLElement).click();
            });

            // Verify popup disappears.
            await popupLocator.waitFor({
                state: 'hidden',
                timeout: 3_000,
            });

            this.dependencies.logger.info(
                `[OMS POPUPS] Closed popup successfully: ${popupName}`,
            );

        } catch (error) {

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            this.dependencies.logger.warn(
                `[OMS POPUPS] Failed to close popup "${popupName}": ${message}`,
            );

            // Match Java behavior: log warning and continue.
        }
    }

    // =========================================================================
    // POPUP VISIBILITY
    // =========================================================================

    async isPopupVisible(popupName: string): Promise<boolean> {

        const handler = this.popupHandlers.get(popupName);

        if (!handler) {
            throw new Error(
                `Unknown popup name: ${popupName}`,
            );
        }

        return handler.popup.isVisible();
    }

    // =========================================================================
    // JAVA METHOD COMPATIBILITY
    // =========================================================================

    async handlePopus(shouldClose: boolean): Promise<void> {

        await this.handlePopups(shouldClose, null);
    }

    async Popups(
        shouldClose: boolean,
        targetPopupName: string | null = null,
    ): Promise<void> {

        await this.handlePopups(
            shouldClose,
            targetPopupName,
        );
    }

    // =========================================================================
    // DASHBOARD
    // =========================================================================

    /**
     * Only waits for dashboard visibility.
     * Popup handling is a separate operation.
     */
    async waitForDashboard(timeoutMs = 15_000): Promise<void> {

        this.dependencies.logger.info(
            '[OMS SESSION] Waiting for Jobs Dashboard.',
        );

        await this.jobsDashboardHeading.waitFor({
            state: 'visible',
            timeout: timeoutMs,
        });

        this.dependencies.logger.info(
            '[OMS SESSION] Jobs Dashboard is visible.',
        );
    }

    // =========================================================================
    // TIMESHEET
    // =========================================================================

    async timesheet(): Promise<void> {

        try {

            if (await this.timesheetPopup.isVisible()) {

                await this.timesheetCloseButton.click();

                await this.timesheetPopup.waitFor({
                    state: 'hidden',
                    timeout: 3_000,
                });

                this.dependencies.logger.info(
                    '[OMS POPUPS] Timesheet popup closed successfully.',
                );

            } else {

                this.dependencies.logger.info(
                    '[OMS POPUPS] No Timesheet popup displayed.',
                );
            }

        } catch (error) {

            this.dependencies.logger.warn(
                `[OMS POPUPS] Exception handling Timesheet popup: ${error instanceof Error
                    ? error.message
                    : String(error)
                }`,
            );
        }
    }

    // =========================================================================
    // CHATBOT
    // =========================================================================

    async handleChatbotIfPresent(): Promise<void> {

        try {

            const chatFrame = this.page.frameLocator(
                this.chatbotFrameSelector,
            );

            const chatElement = chatFrame.locator(
                this.chatbotIconLocator,
            );

            await chatElement.waitFor({
                state: 'visible',
                timeout: 5_000,
            });

            this.dependencies.logger.info(
                '[OMS CHATBOT] Chat element is visible.',
            );

            await chatElement.click();

            this.dependencies.logger.info(
                '[OMS CHATBOT] Chat element clicked successfully.',
            );

        } catch (error) {

            this.dependencies.logger.warn(
                `[OMS CHATBOT] Chatbot iframe or chat element not found: ${error instanceof Error
                    ? error.message
                    : String(error)
                }`,
            );
        }
    }

}
