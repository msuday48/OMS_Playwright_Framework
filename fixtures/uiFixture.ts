
import { test as base, type BrowserContext, type Page } from '@playwright/test';

import { Logger } from '../utils/Logger';
import { FileUtility } from '../utils/FileUtility';
import { UIAssertions, AssertionHelper } from '../utils/assertion';
import { UIActionUtils } from '../utils/actions/UIActionUtils';

import { ModuleSelection } from '../pages/Modules/ModuleConfig/ModuleSelection';
import { ModuleExecutionContext } from '../pages/Modules/ModuleConfig/ModuleExecutionContext';
import { HomePageManager } from '../pages/Home/HomePageManager';
import { JobsProcessRecordsPageManager } from '../pages/JobsProcessRecords/JobsProcessRecordsPageManager';
import { ClientsPageManager } from '../pages/ClientCreation/ClientsPageManager';
import { SpecificationsPageManager } from '../pages/Specifications/Standards/SpecificationsPageManager';
import { AssetsPageManager } from '../pages/Assets/AssetsPageManager';
import { AccountsPageManager } from '../pages/Accounts/AccountsPageManager';
import { MISPageManager } from '../pages/MIS/MISPageManager';

import { MainNavigationPage } from '../pages/common/MainNavigationPage';
import type { OmsPageServices } from '../pages/common/pageServices';
import { EnvUtility } from '../utils/envUtility';

// =========================================================================
// UI FIXTURE TYPES
// =========================================================================

export type UIFixtures = {
    appUrl: string;
    uiLogger: Logger;
    uiAssertions: UIAssertions;
    uiAssertionHelper: AssertionHelper;
    fileUtils: FileUtility;
    uiActions: UIActionUtils;
    uiServices: OmsPageServices;
    mainNavigationPage: MainNavigationPage;
    homePageManager: HomePageManager;
    jobsProcessRecordsPageManager: JobsProcessRecordsPageManager;
    clientsPageManager: ClientsPageManager;
    specificationsPageManager: SpecificationsPageManager;
    assetsPageManager: AssetsPageManager;
    accountsPageManager: AccountsPageManager;
    misPageManager: MISPageManager;
  
    moduleContext: ModuleExecutionContext;
};

type WorkerFixtures = {
    sharedSession: {
        context: BrowserContext;
        page: Page;
        isAuthenticated: boolean;
    };
};

// =========================================================================
// UI FIXTURE IMPLEMENTATION
// =========================================================================

const flagEnabled = (name: string): boolean => {
    if (process.env.CI) return false;
    const value = process.env[name]?.trim().toLowerCase();
    return value !== 'false' && value !== '0';
};

const pauseOnFailure = flagEnabled('PAUSE_ON_FAILURE');
const pauseOnFinish = flagEnabled('PAUSE_ON_FINISH');

export const test = base.extend<UIFixtures, WorkerFixtures>({

    // =========================================================================
    // SELENIUM-STYLE PERSISTENT WORKER SESSION (ONE BROWSER ACROSS ALL TESTS)
    // =========================================================================

    sharedSession: [
        async ({ browser }, use) => {
            const context = await browser.newContext();
            const page = await context.newPage();
            const session = {
                context,
                page,
                isAuthenticated: false,
            };

            try {
                await use(session);
            } finally {
                // Pause the browser once at the end of the suite, whether tests passed or failed.
                if (pauseOnFinish && !session.page.isClosed()) {
                    await session.page.pause();
                }
                await context.close();
            }
        },
        { scope: 'worker' },
    ],

    // Route Playwright's default `context` and `page` to the persistent worker session
    context: async ({ sharedSession }, use) => {
        await use(sharedSession.context);
    },

    page: async ({ sharedSession }, use) => {
        if (sharedSession.page.isClosed()) {
            sharedSession.page = await sharedSession.context.newPage();
            sharedSession.isAuthenticated = false;
        }

        // Let the test and all other fixtures run normally using this shared page.
        await use(sharedSession.page);
    },

    // =========================================================================
    // APPLICATION URL
    // =========================================================================

    appUrl: async ({ baseURL }, use) => {

        if (!baseURL) {
            throw new Error(
                'baseURL is not configured in playwright.config.ts.'
            );
        }

        await use(baseURL);
    },

    // =========================================================================
    // WINSTON LOGGER
    // =========================================================================

    uiLogger: async ({ }, use, testInfo) => {

        const logger = Logger.getLogger(
            testInfo.title,
            {
                category: 'UI',
                testId: testInfo.testId,
                projectName: testInfo.project.name,
                workerIndex: testInfo.workerIndex,
                retry: testInfo.retry,
                moduleName: 'OMS',
            }
        );

        try {

            logger.info('================================');
            logger.info(`UI TEST STARTED: ${testInfo.title}`);

            await use(logger);

        } finally {

            logger.info(`UI TEST FINISHED: ${testInfo.title}`);

            await logger.close();
        }
    },

    // =========================================================================
    // UI ASSERTIONS
    // =========================================================================

    uiAssertions: async ({ }, use) => {

        await use(new UIAssertions());
    },

    // =========================================================================
    // ASSERTION HELPER
    // =========================================================================

    uiAssertionHelper: async ({ uiLogger }, use) => {

        await use(new AssertionHelper(uiLogger));
    },

    // =========================================================================
    // FILE UTILITY
    // =========================================================================

    fileUtils: async ({ uiLogger }, use) => {

        await use(new FileUtility(uiLogger));
    },

    // =========================================================================
    // MODULE SELECTION + TEST-SCOPED MODULE CONTEXT
    // Replaces Basemoduletest.registerModule()/deregisterModule().
    // =========================================================================

    moduleContext: async ({ fileUtils, uiLogger }, use) => {

        const selection = new ModuleSelection(fileUtils, uiLogger);

        const selectedModules =
            await selection.resolveSelectedModules();

        const context = new ModuleExecutionContext(selectedModules);

        if (selectedModules.length > 0) {

            uiLogger.info(
                `[MODULES] Registered modules: ${selectedModules.map((module) => module.code).join(',')
                } (combinedRun=${context.isCombinedRun})`
            );

            uiLogger.info(
                `[MODULES] Initial active module: ${context.require().code}`
            );
        }

        try {

            await use(context);

        } finally {

            context.clear();

            uiLogger.info(
                '[MODULES] Test-scoped module context cleared.'
            );
        }
    },

    // =========================================================================
    // UI ACTION UTILITY
    // =========================================================================

    uiActions: async (
        { page, context, uiLogger, fileUtils },
        use
    ) => {

        const actions = new UIActionUtils({
            page,
            context,
            logger: uiLogger,
            fileUtils,
        });

        await use(actions);
    },

    // =========================================================================
    // PAGE-OBJECT SERVICES (FIXTURE-OWNED INSTANCES)
    // =========================================================================

    uiServices: async (
        { uiActions, uiAssertions, uiLogger, fileUtils },
        use
    ) => {
        const services: OmsPageServices = {
            uiActions,
            uiAssertions,
            logger: uiLogger,
            fileUtils,
            env: new EnvUtility(fileUtils),
        };

        await use(services);
    },

    // =========================================================================
    // SECTION PAGE MANAGERS + OMS SESSION INITIALIZATION
    // =========================================================================

    homePageManager: async (
        {
            page,
            sharedSession,
            appUrl,
            uiLogger,
            uiServices,
        },
        use
    ) => {
        const manager = new HomePageManager(page, uiServices);

        if (!sharedSession.isAuthenticated) {
            await page.goto(appUrl, {
                waitUntil: 'domcontentloaded',
            });

            await manager.loginPage.login();

            await page.waitForLoadState('networkidle');

            await manager.homePage.handlePopups(true, null);

            sharedSession.isAuthenticated = true;
        } else {
            uiLogger.info(
                '[OMS SESSION] Reusing active authenticated browser session (Selenium-style).'
            );
        }

        await use(manager);
    },

    mainNavigationPage: async ({ homePageManager }, use) => {
        await use(homePageManager.mainNavigationPage);
    },

    jobsProcessRecordsPageManager: async (
        { page, uiServices, homePageManager: _homePageManager },
        use
    ) => {
        await use(new JobsProcessRecordsPageManager(page, uiServices));
    },

    clientsPageManager: async (
        { page, uiServices, homePageManager: _homePageManager },
        use
    ) => {
        await use(new ClientsPageManager(page, uiServices));
    },

    specificationsPageManager: async (
        { page, uiServices, homePageManager: _homePageManager },
        use
    ) => {
        await use(new SpecificationsPageManager(page, uiServices));
    },

    assetsPageManager: async (
        { page, homePageManager: _homePageManager },
        use
    ) => {
        await use(new AssetsPageManager(page));
    },

    accountsPageManager: async (
        { page, homePageManager: _homePageManager },
        use
    ) => {
        await use(new AccountsPageManager(page));
    },

    misPageManager: async (
        { page, homePageManager: _homePageManager },
        use
    ) => {
        await use(new MISPageManager(page));
    },


});

// =========================================================================
// AFTER EACH HOOK - FAILED TEST MANUAL BROWSER INSPECTION
// =========================================================================

test.afterEach(async ({ page }, testInfo) => {

    if (
        pauseOnFailure &&
        testInfo.status !== testInfo.expectedStatus &&
        !page.isClosed()
    ) {

        console.log('========================================');
        console.log('TEST EXECUTION FAILED');
        console.log(`Test Name: ${testInfo.title}`);
        console.log(`Expected Status: ${testInfo.expectedStatus}`);
        console.log(`Actual Status: ${testInfo.status}`);
        console.log('Browser paused for manual inspection.');
        console.log('You can manually scroll and inspect the page.');
        console.log('Press F8 in Playwright Inspector to resume.');
        console.log('========================================');

        await page.pause();
    }
});

// =========================================================================
// EXPECT EXPORT
// =========================================================================

export { expect } from '../utils/assertion';
