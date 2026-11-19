import { test as base } from '@playwright/test';
import { Logger } from '../utils/Logger';
import { FileUtility } from '../utils/FileUtility';
import { APIAssertions, AssertionHelper } from '../utils/assertion';
import { APIActionUtils } from '../utils/actions/APIActionUtils';

export type APIFixtures = {
    apiLogger: Logger;
    apiAssertions: APIAssertions;
    apiAssertionHelper: AssertionHelper;
    apiFileUtils: FileUtility;
    apiActions: APIActionUtils;
};

export const test = base.extend<APIFixtures>({
    apiLogger: async ({}, use, testInfo) => {
        const logger = Logger.getLogger(testInfo.title, {
            category: 'API',
            testId: testInfo.testId,
            projectName: testInfo.project.name,
            workerIndex: testInfo.workerIndex,
            retry: testInfo.retry
        });

        try {
            logger.info('================================');
            logger.info(`API TEST STARTED: ${testInfo.title}`);
            logger.info(`LOG FILE: ${logger.filePath}`);

            await use(logger);
        } finally {
            logger.info(`TEST STATUS: ${testInfo.status}`);
            logger.info(`TEST DURATION: ${testInfo.duration}ms`);
            logger.info(`API TEST FINISHED: ${testInfo.title}`);
            await logger.close();
        }
    },

    apiAssertions: async ({}, use) => {
        await use(new APIAssertions());
    },

    apiAssertionHelper: async ({ apiLogger }, use) => {
        await use(new AssertionHelper(apiLogger));
    },

    apiFileUtils: async ({ apiLogger }, use) => {
        await use(new FileUtility(apiLogger));
    },

    apiActions: async ({ request, apiLogger }, use) => {
        await use(new APIActionUtils({
            request,
            logger: apiLogger
        }));
    }
});

export { expect } from '../utils/assertion';
