import { test as base } from '@playwright/test';
import { Logger } from '../utils/Logger';
import { FileUtility } from '../utils/FileUtility';
import { DBAssertions, AssertionHelper } from '../utils/assertion';
import { DBActionUtils, type DatabaseAdapter } from '../utils/actions/DBActionUtils';

export type DBFixtures = {
    dbLogger: Logger;
    dbAssertions: DBAssertions;
    dbAssertionHelper: AssertionHelper;
    dbFileUtils: FileUtility;
    databaseAdapter: DatabaseAdapter;
    dbActions: DBActionUtils;
};

export const test = base.extend<DBFixtures>({
    dbLogger: async ({}, use, testInfo) => {
        const logger = Logger.getLogger(testInfo.title, {
            category: 'DATABASE',
            testId: testInfo.testId,
            projectName: testInfo.project.name,
            workerIndex: testInfo.workerIndex,
            retry: testInfo.retry
        });

        try {
            logger.info('================================');
            logger.info(`DB TEST STARTED: ${testInfo.title}`);
            logger.info(`LOG FILE: ${logger.filePath}`);

            await use(logger);
        } finally {
            logger.info(`TEST STATUS: ${testInfo.status}`);
            logger.info(`TEST DURATION: ${testInfo.duration}ms`);
            logger.info(`DB TEST FINISHED: ${testInfo.title}`);
            await logger.close();
        }
    },

    dbAssertions: async ({}, use) => {
        await use(new DBAssertions());
    },

    dbAssertionHelper: async ({ dbLogger }, use) => {
        await use(new AssertionHelper(dbLogger));
    },

    dbFileUtils: async ({ dbLogger }, use) => {
        await use(new FileUtility(dbLogger));
    },

    databaseAdapter: async ({}, use) => {
        void use;
        throw new Error(
            'No database adapter is configured. Provide a DatabaseAdapter through the DB layer before requesting dbActions.'
        );
    },

    dbActions: async ({ databaseAdapter, dbLogger }, use) => {
        await use(new DBActionUtils({
            database: databaseAdapter,
            logger: dbLogger
        }));
    }
});

export { expect } from '../utils/assertion';
