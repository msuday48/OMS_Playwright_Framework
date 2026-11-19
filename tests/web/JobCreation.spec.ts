
/**
 * Test Case: Jobs and Process Records - Job Creation End-to-End Flow
 *
 * Tags: @master @end-to-end @regression
 *
 * Steps:
 * 1) TS_001 Material Creation (skipped per Selenium source)
 * 2) TS_002 Procedure Creation (single-module mode)
 * 3) TS_003 Process Standard Creation, Mapping, Revision & Search
 * 4) TS_004 Specification Standard Creation, Mapping, Revision & Search
 * 5) TS_004_Batch Combined Specifications Lifecycle
 * 6) TS_005 Job Creation, Acceptance Criteria, Mapping, Schedule & Update
 * 7) TS_006 Created Job Search & Verification
 */

import { expect, test } from '../../fixtures/uiFixture';
import { ModuleConfig } from '../../pages/Modules/ModuleConfig/ModuleConfig';
import { ModuleExecutionContext } from '../../pages/Modules/ModuleConfig/ModuleExecutionContext';
import { FileUtility } from '../../utils/FileUtility';
import { Logger } from '../../utils/Logger';

// ============================================================
// JOB DATA CONSTANTS
// ============================================================

const ADDITIONAL_EMAIL = 'Uday@gmail.com';
const FEE_PROPOSAL_NO = 'TBA12';
const PURCHASE_ORDER_NO = 'PO789';
const CLIENT_JOB_REQUEST_TEXT = 'As per attached document';
const SPECIAL_INSTRUCTIONS =
    'Please refer to the attached files for detailed instructions.';
const IMAGES_PER_PAGE = '2';
const CORRESPONDENCE_EMAIL = 'test@gmail.com';
const JOB_REQUEST_TEXT = 'As per attached document';
const PROJECT_NAME = 'Project Alpha - Steel Structure Inspection';
const IDENTIFICATION_TEXT = 'Steel Beams - Batch 42';
const JOB_SPECIAL_INSTRUCTIONS =
    'Ensure all safety protocols are followed during the inspection.';
const ACCEPTANCE_CRITERIA_TEXT = 'AMS - STD-473-Class 1';
const RECEIVED_BY_KEYWORD = 'oms';
const PROJECT_MANAGER_KEYWORD = 'lasya';
const SCHEDULE_ROW1_DURATION = '08:00';
const SCHEDULE_ASSIGNEE_NAME = 'Spandana Shetty';
const SCHEDULE_ROW2_DURATION = '10:00';
const SWMS_NUMBER = 'SWMS25-00205';

// ============================================================
// HELPERS
// ============================================================

async function storeTargetModuleProperties(
    fileUtils: FileUtility,
    config: ModuleConfig,
    logger: Logger,
): Promise<void> {
    const procedureNo =
        (await fileUtils.getDynamicEnvValue('CreatedProcedureNo')) ?? '';

    const processNo =
        (await fileUtils.getDynamicEnvValue('CreatedProcessNo')) ?? '';

    const specificationNo =
        (await fileUtils.getDynamicEnvValue('CreatedSpecificationNo')) ?? '';

    const prefix = config.code;

    if (!prefix) {
        logger.warn(
            '[JOB CREATION] Module code is empty. Module tracking values were not persisted.',
        );
        return;
    }

    await fileUtils.writeToEnvFile(
        `${prefix}CreatedProcedureNo`,
        procedureNo,
    );

    await fileUtils.writeToEnvFile(
        `${prefix}CreatedProcessNo`,
        processNo,
    );

    await fileUtils.writeToEnvFile(
        `${prefix}CreatedSpecificationNo`,
        specificationNo,
    );

    logger.info(
        `[JOB CREATION] Stored procedure, process-standard and specification-standard values for ${prefix}.`,
    );
}

// ============================================================
// COMPLETE STANDARDS LIFECYCLE FOR COMBINED MODULES
// ============================================================

async function executeStandardsLifecycleForModule(
    config: ModuleConfig,
    moduleContext: ModuleExecutionContext,
    homePage: {
        specificationsProcedure(): Promise<void>;
        specificationProcessStandard(): Promise<void>;
        specificationStandards(): Promise<void>;
    },
    proceduresPage: {
        procedureCreation(
            moduleContext?: ModuleExecutionContext,
        ): Promise<string>;
    },
    processStandardPage: {
        createProcessStandard(
            moduleContext: ModuleExecutionContext,
        ): Promise<string>;
        mapProcedureToProcessStandard(
            moduleContext?: ModuleExecutionContext,
        ): Promise<void>;
        rewiseProcessStandard(
            moduleContext?: ModuleExecutionContext,
        ): Promise<string>;
        searchCreatedProcessStandard(): Promise<string>;
    },
    specificationStandardPage: {
        createSpecificationStandard(
            moduleContext?: ModuleExecutionContext,
        ): Promise<string>;
        mapProcessStandardToSpecificationStandard(
            moduleContext?: ModuleExecutionContext,
        ): Promise<void>;
        rewiseSpecificationStandard(
            moduleContext?: ModuleExecutionContext,
        ): Promise<string>;
        searchCreatedStandardSpecification(): Promise<string>;
    },
    fileUtils: FileUtility,
    logger: Logger,
): Promise<void> {

    moduleContext.setActiveModule(config.code);

    logger.info(
        `>>>> Starting standards lifecycle for module: ${config.code}`,
    );

    // ---------------- PROCEDURE CREATION ----------------

    await test.step(
        `${config.code} - Procedure Creation`,
        async () => {
            await homePage.specificationsProcedure();

            const createdProcedureNo =
                await proceduresPage.procedureCreation(moduleContext);

            expect(
                createdProcedureNo,
                `${config.code}: Procedure creation returned an empty number`,
            ).toBeTruthy();
        },
    );

    // ---------------- PROCESS STANDARD ----------------

    await test.step(
        `${config.code} - Process Standard Creation and Mapping`,
        async () => {
            await homePage.specificationProcessStandard();

            const createdProcessNo =
                await processStandardPage.createProcessStandard(
                    moduleContext,
                );

            expect(createdProcessNo).toBeTruthy();

            await processStandardPage.mapProcedureToProcessStandard(
                moduleContext,
            );

            const revisedProcessNo =
                await processStandardPage.rewiseProcessStandard(
                    moduleContext,
                );

            expect(revisedProcessNo).toBeTruthy();

            const foundProcessNo =
                await processStandardPage.searchCreatedProcessStandard();

            expect(foundProcessNo).toContain(revisedProcessNo);
        },
    );

    // ---------------- SPECIFICATION STANDARD ----------------

    await test.step(
        `${config.code} - Specification Standard Creation and Mapping`,
        async () => {
            await homePage.specificationStandards();

            const createdSpecificationNo =
                await specificationStandardPage.createSpecificationStandard(
                    moduleContext,
                );

            expect(createdSpecificationNo).toBeTruthy();

            await specificationStandardPage
                .mapProcessStandardToSpecificationStandard(
                    moduleContext,
                );

            const revisedSpecificationNo =
                await specificationStandardPage
                    .rewiseSpecificationStandard(moduleContext);

            expect(revisedSpecificationNo).toBeTruthy();

            const foundSpecificationNo =
                await specificationStandardPage
                    .searchCreatedStandardSpecification();

            expect(foundSpecificationNo).toContain(
                revisedSpecificationNo,
            );
        },
    );

    await storeTargetModuleProperties(
        fileUtils,
        config,
        logger,
    );

    logger.info(
        `<<<< Completed standards lifecycle for module: ${config.code}`,
    );
}

// ============================================================
// TEST SUITE CONFIGURATION
// ============================================================

test.describe.configure({
    mode: 'serial',
    timeout: 180_000,
});

// ============================================================
// TEST SUITE
// ============================================================

test.describe(
    'Jobs and Process Records - Job Creation @master @e2e @regression',
    () => {

        // ----------------------------------------------------
        // TS_001 MATERIAL CREATION
        // ----------------------------------------------------

        test('TS_001 Material Creation', async ({ uiLogger }) => {

            await test.step(
                '1) Material Creation - skipped in Selenium source',
                async () => {
                    uiLogger.info(
                        '========== TS_001: Material Creation ==========',
                    );

                    // Preserving Selenium source execution behavior.
                    // await mainNavigationPage.specificationsMaterial();
                    // await specificationsPageManager.materialPage.materialCreation();
                },
            );
        });

        // ----------------------------------------------------
        // TS_002 PROCEDURE CREATION
        // ----------------------------------------------------

        test('TS_002 Procedure Creation', async ({
            moduleContext,
            mainNavigationPage,
            specificationsPageManager,
            fileUtils,
            uiLogger,
        }) => {

            test.skip(
                moduleContext.isCombinedRun,
                'Procedure creation is executed inside TS_004_Batch Combined Specifications Lifecycle for combined runs.',
            );

            await test.step(
                '1) Navigate to Procedures',
                async () => {
                    uiLogger.info(
                        '========== TS_002: Procedure Creation ==========',
                    );

                    await mainNavigationPage.specificationsProcedure();
                },
            );

            await test.step(
                '2) Create and verify Procedure',
                async () => {

                    const createdProcedureNo =
                        await specificationsPageManager.proceduresPage
                            .procedureCreation(moduleContext);

                    const storedProcedureNo =
                        await fileUtils.getDynamicEnvValue(
                            `${moduleContext.require().code}CreatedProcedureNo`,
                        );

                    expect(
                        createdProcedureNo,
                        'Created procedure number should not be empty',
                    ).toBeTruthy();

                    expect(
                        storedProcedureNo,
                        'Procedure number should be stored in environment properties',
                    ).toBeTruthy();

                    expect(storedProcedureNo).toContain(
                        createdProcedureNo,
                    );

                    uiLogger.info(
                        `[PROCEDURE] Successfully created and verified: ${createdProcedureNo}`,
                    );
                },
            );
        });

        // ----------------------------------------------------
        // TS_003 PROCESS STANDARD CREATION
        // ----------------------------------------------------

        test('TS_003 Process Standard Creation', async ({
            moduleContext,
            mainNavigationPage,
            specificationsPageManager,
            uiLogger,
        }) => {

            test.skip(
                moduleContext.isCombinedRun,
                'Process Standard creation is executed inside TS_004_Batch Combined Specifications Lifecycle for combined runs.',
            );

            const processStandardPage =
                specificationsPageManager.processStandardPage;

            await test.step(
                '1) Navigate to Process Standards',
                async () => {
                    uiLogger.info(
                        '========== TS_003: Process Standard Creation ==========',
                    );

                    await mainNavigationPage
                        .specificationProcessStandard();
                },
            );

            await test.step(
                '2) Create Process Standard',
                async () => {

                    const createdProcessNo =
                        await processStandardPage
                            .createProcessStandard(moduleContext);

                    expect(createdProcessNo).toBeTruthy();
                },
            );

            await test.step(
                '3) Map Procedure to Process Standard',
                async () => {

                    await processStandardPage
                        .mapProcedureToProcessStandard(moduleContext);
                },
            );

            let revisedProcessNo = '';

            await test.step(
                '4) Revise Process Standard',
                async () => {

                    revisedProcessNo =
                        await processStandardPage
                            .rewiseProcessStandard(moduleContext);

                    expect(revisedProcessNo).toBeTruthy();
                },
            );

            await test.step(
                '5) Search Created Process Standard',
                async () => {

                    const foundProcessNo =
                        await processStandardPage
                            .searchCreatedProcessStandard();

                    expect(foundProcessNo).toContain(
                        revisedProcessNo,
                    );
                },
            );
        });

        // ----------------------------------------------------
        // TS_004 SPECIFICATION STANDARD CREATION
        // ----------------------------------------------------

        test('TS_004 Specification Standard Creation', async ({
            moduleContext,
            mainNavigationPage,
            specificationsPageManager,
            uiLogger,
        }) => {

            test.skip(
                moduleContext.isCombinedRun,
                'Specification Standard creation is executed inside TS_004_Batch Combined Specifications Lifecycle for combined runs.',
            );

            const specificationStandardPage =
                specificationsPageManager.specificationStandardPage;

            await test.step(
                '1) Navigate to Specification Standards',
                async () => {

                    uiLogger.info(
                        '========== TS_004: Specification Standard Creation ==========',
                    );

                    await mainNavigationPage.specificationStandards();
                },
            );

            await test.step(
                '2) Create Specification Standard',
                async () => {

                    const createdSpecificationNo =
                        await specificationStandardPage
                            .createSpecificationStandard(moduleContext);

                    expect(createdSpecificationNo).toBeTruthy();
                },
            );

            await test.step(
                '3) Map Process Standard to Specification Standard',
                async () => {

                    await specificationStandardPage
                        .mapProcessStandardToSpecificationStandard(
                            moduleContext,
                        );
                },
            );

            await test.step(
                '4) Revise Specification Standard',
                async () => {

                    const revisedSpecificationNo =
                        await specificationStandardPage
                            .rewiseSpecificationStandard(moduleContext);

                    expect(revisedSpecificationNo).toBeTruthy();
                },
            );

            await test.step(
                '5) Search Created Specification Standard',
                async () => {

                    await specificationStandardPage
                        .searchCreatedStandardSpecification();
                },
            );
        });

        // ----------------------------------------------------
        // TS_004_BATCH COMBINED SPECIFICATIONS LIFECYCLE
        // ----------------------------------------------------

        test(
            'TS_004_Batch Combined Specifications Lifecycle',
            async ({
                moduleContext,
                mainNavigationPage,
                specificationsPageManager,
                fileUtils,
                uiLogger,
            }) => {

                test.skip(
                    !moduleContext.isCombinedRun,
                    'Batch standards lifecycle is only used for combined-module execution.',
                );

                await test.step(
                    '1) Start combined standards lifecycle loop',
                    async () => {
                        uiLogger.info(
                            '========== TS_004_Batch: Starting Pipeline Loop for Modules ==========',
                        );
                    },
                );

                for (const config of moduleContext.modules) {

                    await test.step(
                        `2) Execute complete standards lifecycle for ${config.code}`,
                        async () => {

                            await executeStandardsLifecycleForModule(
                                config,
                                moduleContext,
                                mainNavigationPage,
                                specificationsPageManager.proceduresPage,
                                specificationsPageManager.processStandardPage,
                                specificationsPageManager.specificationStandardPage,
                                fileUtils,
                                uiLogger,
                            );
                        },
                    );
                }
            },
        );

        // ----------------------------------------------------
        // TS_005 JOB CREATION
        // ----------------------------------------------------

        test('TS_005 Job Creation', async ({
            moduleContext,
            mainNavigationPage,
            jobsProcessRecordsPageManager,
            uiLogger,
        }) => {

            const isCombinedRunMode =
                moduleContext.isCombinedRun;

            const createJobPage =
                jobsProcessRecordsPageManager.createJobPage;

            await test.step(
                '1) Navigate to Jobs Process Records',
                async () => {

                    uiLogger.info(
                        '========== TS_005: Job Creation ==========',
                    );

                    await mainNavigationPage.JobsProcessRecords();
                },
            );

            await test.step(
                '2) Create Job Process Record',
                async () => {

                    await createJobPage.createJobProcessRecords(
                        ADDITIONAL_EMAIL,
                        FEE_PROPOSAL_NO,
                        PURCHASE_ORDER_NO,
                        CLIENT_JOB_REQUEST_TEXT,
                        SPECIAL_INSTRUCTIONS,
                        IMAGES_PER_PAGE,
                        CORRESPONDENCE_EMAIL,
                    );
                },
            );

            await test.step(
                '3) Capture and Save Job Number',
                async () => {

                    await createJobPage.captureAndSaveJobNumber(
                        moduleContext,
                    );
                },
            );

            await test.step(
                '4) Enter Job Acceptance Criteria',
                async () => {

                    await createJobPage.jobAcceptanceCriteria(
                        JOB_REQUEST_TEXT,
                        PROJECT_NAME,
                        IDENTIFICATION_TEXT,
                        JOB_SPECIAL_INSTRUCTIONS,
                    );
                },
            );

            await test.step(
                '5) Map Material and Specification',
                async () => {

                    if (isCombinedRunMode) {

                        await createJobPage
                            .multiModuleSpecificationMapping(
                                moduleContext,
                            );

                    } else {

                        await createJobPage
                            .materialAndSpecificationMapping(
                                moduleContext,
                            );
                    }
                },
            );

            await test.step(
                '6) Complete Job Acceptance',
                async () => {

                    await createJobPage.jobAcceptance(
                        ACCEPTANCE_CRITERIA_TEXT,
                        RECEIVED_BY_KEYWORD,
                        PROJECT_MANAGER_KEYWORD,
                    );
                },
            );

            await test.step(
                '7) Create Job Schedule',
                async () => {

                    await createJobPage.jobScheduleCreation(
                        SCHEDULE_ROW1_DURATION,
                        SCHEDULE_ASSIGNEE_NAME,
                        SCHEDULE_ROW2_DURATION,
                    );
                },
            );

            await test.step(
                '8) Download Job Details and SWMS',
                async () => {

                    await createJobPage
                        .downloadJobDetailsAndSwms(
                            SWMS_NUMBER,
                        );
                },
            );

            await test.step(
                '9) Update Job',
                async () => {

                    await createJobPage.jobUpdate();
                },
            );
        });

        // ----------------------------------------------------
        // TS_006 CREATED JOB SEARCH
        // ----------------------------------------------------

        test('TS_006 Created Job Search', async ({
            moduleContext,
            jobsProcessRecordsPageManager,
            uiLogger,
        }) => {

            const createdJobSearchPage =
                jobsProcessRecordsPageManager.createdJobSearchPage;

            await test.step(
                '1) Search Created Job',
                async () => {

                    uiLogger.info(
                        '========== TS_006: Created Job Search ==========',
                    );

                    await createdJobSearchPage
                        .searchCreatedJob(moduleContext);
                },
            );

            await test.step(
                '2) Verify Created Job',
                async () => {

                    await createdJobSearchPage
                        .verifyCreatedJob(moduleContext);
                },
            );
        });
    },
);
