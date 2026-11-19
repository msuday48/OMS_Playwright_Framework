# Playwright MCP Context — OMS Automation Framework

> **Project-specific source of truth for AI-assisted development in this OMS Playwright + TypeScript repository.**
>
> This document describes the architecture that exists in the supplied `OMS_Framework` repository. It is not a generic Playwright starter template. AI agents must inspect the current repository before changing it and must preserve its established conventions unless the user explicitly requests an architectural change.

---

## Document purpose and authority

This file defines **HOW to work inside this OMS automation framework**. The user's task, test scenario, acceptance criteria, and supplied application evidence define **WHAT to implement**.

Use this file with Playwright MCP, Playwright Test, Playwright CLI, GitHub Copilot, Claude Code, Codex, and other coding agents.

The framework contains three automation layers:

- **Web UI automation** for the OMS web application.
- **API automation** using Playwright's API request capabilities.
- **Database automation support** through a database adapter abstraction. The current repository does not yet provide a working database adapter fixture.

The repository also contains examples and support for OpenCart/FakeStore test scenarios. Do not assume every existing test or environment variable is OMS-specific. Preserve those tests unless the user asks to change them.

### Source-of-truth order

When instructions conflict, use this order:

1. The user's explicit request and acceptance criteria.
2. The actual implementation currently present in the repository.
3. This context document.
4. General Playwright best practices.

Never silently replace a working project convention with a generic template. If the repository and this document disagree, inspect the code, explain the discrepancy, and update this document only when the user asks for it or when the task explicitly includes maintaining the context file.

---

# 1. Mandatory AI-agent workflow

Before writing or modifying code, agents MUST:

1. Inspect the repository tree and identify the relevant test, page class, page manager, fixture, utility, configuration, and test-data files.
2. Read the relevant implementation completely enough to understand its callers and dependencies.
3. Identify whether the requested operation already exists in `UIActionUtils`, `APIActionUtils`, `DBActionUtils`, `FileUtility`, `EnvUtility`, assertion helpers, or a page object.
4. Reuse existing components and naming conventions.
5. Inspect the live application or API when locators, page behavior, endpoint behavior, or expected responses are not established by source evidence.
6. Make the smallest change that satisfies the task.
7. Update dependent types, fixture wiring, page managers, tests, and documentation where required.
8. Run the narrowest relevant test or TypeScript validation available.
9. Report what changed, what was verified, and any environment limitation.

Do not generate a new test, page class, manager, fixture, utility, route, schema, or configuration file before checking for an existing equivalent.

## 1.1 No invented implementation details

Do not invent:

- OMS page names, menu paths, module codes, workflows, locators, button labels, or application behavior.
- Environment keys, module-specific tracking keys, credentials, URLs, or test data.
- API endpoints, request payloads, response fields, or expected status codes.
- Database type, adapter implementation, collection/table names, or query semantics.
- Existing utility methods, fixture names, class names, or folder structure.

When information is missing, state exactly what must be inspected or supplied. Do not fill gaps with plausible guesses.

## 1.2 Preserve the current architecture

The current Web architecture is **Page Objects + section Page Managers + shared fixture-provided services**. It is not a mandatory one-page-object-per-fixture design.

The current UI interaction layer is a substantial custom `UIActionUtils` abstraction built on Playwright. Use it for established reusable operations and diagnostics, while retaining access to native Playwright APIs for operations that do not need a wrapper.

Do not create a second action framework, duplicate wait utilities, or a new dependency-injection system.

---

# 2. Verified framework technology and configuration

The supplied repository currently declares:

| Concern | Current implementation |
|---|---|
| Runtime language | TypeScript |
| Test runner | `@playwright/test` |
| TypeScript mode | `strict: true` |
| Playwright package | `^1.64.1` in `package.json` |
| Node module target | `Node16` |
| TypeScript target | `ES2022` |
| Web architecture | Page Objects + section Page Managers |
| UI fixture | `fixtures/uiFixture.ts` |
| API fixture | `fixtures/apiFixture.ts` |
| DB fixture | `fixtures/dbFixture.ts` |
| UI actions | `utils/actions/UIActionUtils.ts` |
| API actions | `utils/actions/APIActionUtils.ts` |
| DB actions | `utils/actions/DBActionUtils.ts` |
| Assertions | `utils/assertion.ts` |
| Logging | Winston through `utils/Logger.ts` |
| Exceptions | `utils/ExceptionUtility.ts` |
| File and environment operations | `utils/FileUtility.ts`, `utils/envUtility.ts` |
| Test data | Faker, JSON, CSV, Excel, and files under `testdata/` |
| API schema validation | AJV and JSON schemas under `api/schemas/` |
| Custom reporting | `utils/CustomReporter.ts` |
| Standard browser reporting | Playwright list reporter plus custom reporter |
| CI | Jenkins pipeline |
| Container execution | Dockerfile and Docker Compose |

Use `package.json`, `package-lock.json`, `playwright.config.ts`, and `tsconfig.json` as the authoritative configuration files. Do not upgrade dependencies or alter configuration unless the task requires it.

---

# 3. Actual repository structure

The following is the relevant source structure in the supplied repository. Generated output folders and `node_modules` are intentionally omitted.

```text
OMS_Framework/
├── .env
├── .env.example
├── .github/
│   ├── agents/
│   │   ├── playwright-test-generator.agent.md
│   │   ├── playwright-test-healer.agent.md
│   │   └── playwright-test-planner.agent.md
│   └── workflows/
│       ├── copilot-setup-steps.yml
│       └── playwright.yml
├── .vscode/
│   ├── extensions.json
│   ├── mcp.json
│   └── settings.json
├── api/
│   ├── endpoints/
│   │   └── routes.ts
│   └── schemas/
│       ├── cart_api_schema.json
│       ├── product_api_schema.json
│       └── user_api_schema.json
├── docs/
│   ├── docker_setup_and_commands.md
│   ├── Framework-Step-By-Step.md
│   └── git_github.md
├── fixtures/
│   ├── apiFixture.ts
│   ├── dbFixture.ts
│   └── uiFixture.ts
├── pages/
│   ├── Accounts/
│   │   └── AccountsPageManager.ts
│   ├── Assets/
│   │   └── AssetsPageManager.ts
│   ├── ClientCreation/
│   │   ├── ClientSearchPage.ts
│   │   ├── ClientsPageManager.ts
│   │   ├── OfflineClientCreationPage.ts
│   │   └── OnlineClientCreationPage.ts
│   ├── common/
│   │   ├── HomePage.ts
│   │   ├── LoginPage.ts
│   │   ├── MainNavigationPage.ts
│   │   └── pageServices.ts
│   ├── Home/
│   │   └── HomePageManager.ts
│   ├── JobsProcessRecords/
│   │   ├── CreateJob.ts
│   │   ├── CreatedJobSearch.ts
│   │   ├── JobsProcessRecordsPageManager.ts
│   │   └── SearchAddProcessData.ts
│   ├── MIS/
│   │   └── MISPageManager.ts
│   ├── Modules/
│   │   └── ModuleConfig/
│   │       ├── ModuleConfig.ts
│   │       ├── ModuleExecutionContext.ts
│   │       └── ModuleSelection.ts
│   └── Specifications/
│       └── Standards/
│           ├── MaterialPage.ts
│           ├── ProceduresPage.ts
│           ├── ProcessStandard.ts
│           ├── SpecificationStandardPage.ts
│           └── SpecificationsPageManager.ts
├── prompts/
│   ├── db_test_prompt.md
│   ├── fakestore_api_test_prompts.md
│   ├── opencart_web_test_prompts.md
│   └── utilitis_prompt.md
├── specs/
│   └── README.md
├── testdata/
│   ├── *.xlsx
│   ├── *.csv
│   ├── *.json
│   ├── *.pdf
│   └── other test assets
├── tests/
│   ├── api/
│   │   └── fakestore-api.spec.ts
│   ├── web/
│   │   └── JobCreation.spec.ts
│   └── seed.spec.ts
├── utils/
│   ├── actions/
│   │   ├── ActionDiagnostics.ts
│   │   ├── APIActionUtils.ts
│   │   ├── DBActionUtils.ts
│   │   └── UIActionUtils.ts
│   ├── assertion.ts
│   ├── CustomReporter.ts
│   ├── dataGenerator.ts
│   ├── DataReader.ts
│   ├── dbClient.ts
│   ├── envUtility.ts
│   ├── ExceptionUtility.ts
│   ├── FileUtility.ts
│   ├── helper.ts
│   ├── Logger.ts
│   └── xpath.ts
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── package-lock.json
├── Jenkinsfile
├── Dockerfile
├── docker-compose.yml
└── docker-entrypoint.sh
```

Other repository folders such as `allure-results/`, `custom-report/`, `reports/`, `test-results/`, `Logs/`, `Downloads/`, `_legacy/`, and `node_modules/` are generated, runtime, archived, or dependency content. Do not treat generated output as source architecture. Do not edit generated reports or logs to implement a test.

## 3.1 Where artifacts belong

| Artifact | Existing location / convention |
|---|---|
| OMS common page object | `pages/common/` |
| OMS functional page object | Existing functional section under `pages/` |
| Section Page Manager | Same section folder, named `XxxPageManager.ts` |
| Module configuration/context | `pages/Modules/ModuleConfig/` |
| Shared page services contract | `pages/common/pageServices.ts` |
| Web fixture | `fixtures/uiFixture.ts` |
| API fixture | `fixtures/apiFixture.ts` |
| DB fixture | `fixtures/dbFixture.ts` |
| UI/API/DB action abstractions | `utils/actions/` |
| Action diagnostic helpers | `utils/actions/ActionDiagnostics.ts` |
| Assertions | `utils/assertion.ts` |
| Logging | `utils/Logger.ts` |
| Exception types and handling | `utils/ExceptionUtility.ts` |
| Environment access | `utils/envUtility.ts` and `utils/FileUtility.ts` |
| File upload/download and Excel operations | `utils/FileUtility.ts` |
| Random data | `utils/dataGenerator.ts` |
| JSON/CSV/Excel reader | `utils/DataReader.ts` |
| API routes | `api/endpoints/routes.ts` |
| API schemas | `api/schemas/` |
| Test data and upload assets | `testdata/` |
| Web tests | `tests/web/` |
| API tests | `tests/api/` |
| Future DB tests | `tests/db/` only if the user asks and the DB adapter is configured |
| Project documentation | `docs/` |
| AI agent instructions | `.github/agents/` |

Do not create the generic `pages/`, `testdata/`, `api/`, or `fixtures/` layout from a template if the actual equivalent already exists.

---

# 4. High-level architecture

## 4.1 Web UI architecture

```text
tests/web/*.spec.ts
        |
        v
fixtures/uiFixture.ts
        |
        +---- shared browser context + shared page (worker-scoped session)
        |
        +---- Logger / FileUtility / UIAssertions
        |
        +---- UIActionUtils
        |
        +---- OmsPageServices
        |       |
        |       +---- uiActions
        |       +---- uiAssertions
        |       +---- logger
        |       +---- fileUtils
        |       +---- EnvUtility
        |
        +---- ModuleSelection + ModuleExecutionContext
        |
        +---- HomePageManager
        |       +---- LoginPage
        |       +---- HomePage
        |       +---- MainNavigationPage
        |
        +---- Functional Page Managers
                +---- Page Objects
                        |
                        v
                OMS Web Application
```

**Important:** The fixture owns and creates shared service instances. Page objects receive `Page` and, where implemented, `OmsPageServices`. Section managers lazily create and cache their page-object instances.

## 4.2 API architecture

```text
tests/api/*.spec.ts
        |
        +---- @playwright/test request fixture
        |
        +---- api/endpoints/routes.ts
        |
        +---- utils/dataGenerator.ts
        |
        +---- utils/DataReader.ts
        |
        +---- api/schemas/*.json + AJV
        |
        +---- optional fixtures/apiFixture.ts
        |
        +---- optional utils/actions/APIActionUtils.ts
```

The existing FakeStore API test imports `test` and `expect` directly from `@playwright/test`; it does not currently use `fixtures/apiFixture.ts` or `APIActionUtils`. Do not rewrite it to use the API fixture unless requested.

## 4.3 Database architecture and current limitation

```text
tests/db/ (not currently present)
        |
        v
fixtures/dbFixture.ts
        |
        +---- DBAssertions / AssertionHelper / FileUtility
        +---- DatabaseAdapter
        +---- DBActionUtils
```

Current implementation status:

- `fixtures/dbFixture.ts` declares a `databaseAdapter` fixture that intentionally throws because no adapter is configured.
- `DBActionUtils` uses a driver-neutral, Mongo-style collection adapter contract.
- `utils/dbClient.ts` separately contains a MySQL connection helper (`executeQuery`) using `mysql2/promise`.
- The MySQL helper is not wired into the `DatabaseAdapter` fixture.
- No `tests/db/` directory was present in the supplied repository.

Therefore, do not claim that database tests are ready to execute. Before implementing DB tests, confirm the target database and design/wire the correct adapter with explicit user approval. Do not assume that the MySQL helper can satisfy the Mongo-style collection interface.

---

# 5. Playwright native APIs vs custom UIActionUtils

This distinction is mandatory for all generated Web code.

## 5.1 Native Playwright is the underlying browser automation engine

The framework imports native types and APIs from `@playwright/test`, including `Page`, `Locator`, `BrowserContext`, and the built-in test fixtures.

Use native Playwright for:

- Types: `Page`, `Locator`, `BrowserContext`, `Frame`, `Download`, etc.
- Locator creation: `page.locator()`, `getByRole()`, `getByLabel()`, `getByText()`, `getByPlaceholder()`, `getByTestId()`.
- Locator inspection when needed: `count()`, `isVisible()`, `isEnabled()`, `getAttribute()`, `inputValue()`.
- Specialized locator operations that do not need a project wrapper.
- Native event handling, frame locators, popup handling, and other Playwright capabilities not covered by a suitable existing helper.
- Test runner, fixtures, `test.step()`, `test.describe()`, and test lifecycle.
- Native assertions through `expect` where a direct assertion is appropriate.

Examples:

```ts
await locator.check();
await locator.uncheck();
const count = await locator.count();
const value = await locator.getAttribute('value');
await expect(locator).toBeVisible();
```

## 5.2 UIActionUtils is the project's standard reusable UI interaction layer

`utils/actions/UIActionUtils.ts` is not a small wrapper containing only click and fill. It is a large framework service that centralizes common UI operations, synchronization, diagnostics, logging, error context, and several browser interaction helpers.

Page objects that receive `OmsPageServices` should normally use:

```ts
this.deps.uiActions
```

for established reusable actions, rather than reimplementing them.

Common existing methods include operations for:

- Click, double-click, right-click, hover, tap, and drag/drop.
- Fill, type, clear, press, and keyboard interaction.
- Visibility/state waiting and page-load/URL synchronization.
- Select options by label, value, or index.
- Scrolling and element interaction.
- Reading text, input values, attributes, and element state.
- Dropdown and autocomplete interactions.
- Dialog, popup, frame, and file chooser handling.
- Download-related browser actions and file integration.
- Browser/page event listeners and request/response observation.
- Screenshots, element highlighting, and diagnostic support.
- Action logging and enriched exception information.

**Do not assume a method exists just because its name sounds plausible.** Inspect `UIActionUtils.ts` and its actual public signature before calling it. Use the existing method with the correct options and return type.

Examples from the existing ProcessStandard page object:

```ts
await this.deps.uiActions.click(this.l.newButton);

await this.deps.uiActions.fill(
    this.l.standardNo,
    processStandardNo
);

await this.deps.uiActions.waitForVisible(
    this.l.availableProcedureInput,
    { timeout: 15_000 }
);

await this.deps.uiActions.selectByValue(
    this.l.accreditationStdDropdown,
    'ISO / IEC 17025 Calibration'
);
```

## 5.3 Decision rule: utility or native API?

Use this decision order:

1. Search `UIActionUtils` for an existing method that performs the required operation.
2. If the method exists and provides the needed behavior, use it.
3. If it does not exist, determine whether the operation is a simple native Playwright operation or a genuinely reusable framework-level workflow.
4. For a simple/specialized Playwright operation, use the native API directly.
5. Add or extend `UIActionUtils` only when the behavior is reusable, needs consistent diagnostics/logging/retry or synchronization policy, or is explicitly required by the task.
6. Never add a wrapper that only renames a one-line Playwright call without providing a meaningful framework benefit.

### Good examples

Use the existing utility for a common interaction:

```ts
await this.deps.uiActions.click(this.saveButton);
await this.deps.uiActions.fill(this.nameInput, name);
```

Use native Playwright for a specialized native operation when no framework helper is needed:

```ts
await this.fileInput.setInputFiles(filePath);
await this.checkbox.check();
const optionCount = await this.dropdownOption.count();
```

Use `UIAssertions` or Playwright `expect` for assertions, not action wrappers.

## 5.4 Do not duplicate Playwright behavior unnecessarily

Playwright already provides locator auto-waiting and retryable web-first assertions. Do not add fixed sleeps or repeated manual waits around every click/fill.

Use the framework's existing wait helpers when a specific OMS workflow requires them. Otherwise prefer the native Playwright operation and web-first assertion.

---

# 6. Page Object conventions

## 6.1 Responsibilities

A page object represents a page or cohesive page workflow and owns:

- Page-specific locators.
- Page-specific interaction methods.
- Page-specific navigation or workflow methods when appropriate.
- Page-specific data extraction and page-state checks.
- Calls to shared services for common interactions, file operations, logging, environment access, and assertions.

A page object should not own:

- Browser creation or browser-context lifecycle.
- Test runner setup or fixture registration.
- Cross-test orchestration.
- A duplicate generic action framework.
- Secrets or environment configuration duplicated in code.

## 6.2 Constructor conventions

The established pattern for most OMS page objects is:

```ts
import type { Locator, Page } from '@playwright/test';
import type { OmsPageServices } from '../common/pageServices';

export class ExamplePage {
    private readonly page: Page;
    private readonly deps: OmsPageServices;
    private readonly exampleInput: Locator;

    constructor(page: Page, deps: OmsPageServices) {
        this.page = page;
        this.deps = deps;

        this.exampleInput = page.locator('...verified locator...');
    }
}
```

Use the correct relative import path for the page's folder.

Some current manager placeholders (`AssetsPageManager`, `AccountsPageManager`, `MISPageManager`) currently accept only `Page` and have no functional page objects. Do not claim all managers already use `OmsPageServices`. When adding a real page object to one of these sections, inspect its dependencies and wire services consistently with the established section pattern.

## 6.3 Locator conventions

The existing OMS page objects contain many XPath locators, often retained from Selenium source. Do not blindly convert all existing locators during an unrelated task.

For new locators:

1. Inspect the live DOM and accessible semantics.
2. Prefer robust user-facing locators (`getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByTestId`) when they uniquely identify the element.
3. Use CSS or XPath when the UI does not expose a reliable semantic locator or when a verified relationship is needed.
4. Keep locators scoped to a meaningful form, dialog, row, or section when possible.
5. Avoid positional selectors and brittle long selector chains unless the DOM requires them.
6. Verify uniqueness and behavior before using the locator in a workflow.
7. Do not invent labels, attributes, IDs, or XPath expressions.

When retaining or repairing Selenium-derived XPath, validate it against the current OMS DOM and preserve its intended target.

## 6.4 Method conventions

- Use `async` methods for browser interactions.
- Give methods explicit return types (`Promise<void>`, `Promise<string>`, `Promise<boolean>`, etc.).
- Use meaningful business/workflow names that match existing page-object conventions.
- Keep locators private unless an existing page intentionally exposes a locator.
- Use shared services through `this.deps` when the class receives them.
- Keep page-specific logic in the page object, not in a generic utility.
- For multi-step workflows, use descriptive logging and contextual error handling where appropriate.
- Do not swallow errors. Log context and rethrow so Playwright marks the test as failed.
- Avoid embedding test assertions in page objects unless the existing method is explicitly an assertion/check helper. Prefer returning a value or state and asserting in the test.

## 6.5 Example based on the current ProcessStandard design

The ProcessStandard class:

- Imports `Locator` and `Page` types from `@playwright/test`.
- Defines a `ProcessStandardLocators` interface to group locator fields.
- Receives `Page` and `OmsPageServices` in its constructor.
- Creates locator instances in one locator map.
- Uses `deps.uiActions` for common interactions.
- Uses `deps.fileUtils` for upload and `.env` persistence.
- Uses `deps.env` for environment values and module-specific lookup.
- Uses `deps.logger` for structured workflow logging.
- Uses `ModuleExecutionContext` / `ModuleConfig` for the active OMS module.
- Returns created identifiers from workflow methods.

Follow this pattern when extending similar specification workflows. Do not copy its business-specific locators or field names into unrelated pages.

---

# 7. Section Page Managers

## 7.1 Purpose

A Page Manager groups page objects belonging to a functional OMS section. It is a lightweight access point, not a replacement for page objects and not a test runner.

Current examples:

- `HomePageManager`
- `JobsProcessRecordsPageManager`
- `ClientsPageManager`
- `SpecificationsPageManager`
- `AssetsPageManager`
- `AccountsPageManager`
- `MISPageManager`

## 7.2 Lazy instantiation

Functional managers use lazy getters and cache the page object instance:

```ts
private _createJobPage?: CreateJob;

get createJobPage(): CreateJob {
    return (this._createJobPage ??= new CreateJob(this.page, this.deps));
}
```

This means the page object is created only when requested and reused by that manager instance.

When adding a page object to an existing functional section:

1. Add the import to the relevant manager.
2. Add a private optional instance field.
3. Add a typed lazy getter.
4. Pass the same `Page` and shared `OmsPageServices` when that page object requires them.
5. Register or expose the manager through `uiFixture` only if it is a new manager.
6. Update the test to consume the manager through the fixture.

Do not create one fixture for every individual page object if the section manager already exposes the page object.

## 7.3 Current manager state

- `HomePageManager` lazily exposes `HomePage`, `LoginPage`, and `MainNavigationPage`.
- `JobsProcessRecordsPageManager` exposes `CreateJob`, `CreatedJobSearch`, and `SearchAddProcessData`.
- `ClientsPageManager` exposes `ClientSearchPage`, `OnlineClientCreationPage`, and `OfflineClientCreationPage`.
- `SpecificationsPageManager` exposes `MaterialPage`, `ProceduresPage`, `ProcessStandard`, and `SpecificationStandardPage`.
- `AssetsPageManager`, `AccountsPageManager`, and `MISPageManager` are currently lightweight placeholders with a `Page` constructor and no functional page-object getters.

Do not assume a manager contains additional page objects beyond those verified in its source.

---

# 8. Shared Page Services

`pages/common/pageServices.ts` defines the dependency contract consumed by OMS page objects.

Current contract:

```ts
export interface OmsPageServices {
    uiActions: UIActionUtils;
    uiAssertions: UIAssertions;
    logger: Logger;
    fileUtils: FileUtility;
    env: EnvUtility;
}
```

The `uiServices` fixture in `fixtures/uiFixture.ts` constructs this object once for the test and passes it into managers and page objects that need it.

Use the existing services rather than constructing new instances inside every page class.

### Service ownership

| Service | Implementation | Responsibility |
|---|---|---|
| `uiActions` | `UIActionUtils` | Reusable UI interactions and diagnostics |
| `uiAssertions` | `UIAssertions` | Reusable UI assertions |
| `logger` | `Logger` | Structured Winston logging |
| `fileUtils` | `FileUtility` | Upload/download, file reading/writing, environment-file operations |
| `env` | `EnvUtility` | Async environment and module-specific values |

If a new shared service is genuinely required, discuss whether it belongs in `OmsPageServices` and update the fixture construction and dependent types consistently. Do not add a service just to wrap a single page-specific operation.

---

# 9. UI fixture architecture (`fixtures/uiFixture.ts`)

This is the main entry point for OMS Web tests.

## 9.1 Fixture exports

The fixture exports:

```ts
export const test = base.extend<UIFixtures, WorkerFixtures>({ ... });
export { expect } from '../utils/assertion';
```

Web tests should import `test` from `fixtures/uiFixture.ts`. The fixture's `expect` export is available for compatibility, but tests may also use the page-specific assertion service when that is the established test style.

## 9.2 Worker-scoped shared browser session

The fixture defines a worker-scoped `sharedSession` containing:

- `context`
- `page`
- `isAuthenticated`

The default Playwright `context` and `page` fixtures are overridden to use this shared session.

The intent is Selenium-style continuity: one browser context/page is reused across tests in the worker, and the authenticated OMS session is reused. If the page is closed, the fixture creates a replacement page and resets the authentication flag.

The worker fixture closes the browser context during teardown. `PAUSE_ON_FINISH` can pause the page before the context is closed in local runs.

**Important design consequence:** tests are not isolated by a fresh browser context/page in the normal UI fixture path. They share session state and can depend on prior authentication or application state. Preserve test ordering and serial execution unless the fixture architecture is deliberately redesigned and the user approves it.

## 9.3 Authentication bootstrap

The `homePageManager` fixture:

1. Creates `HomePageManager`.
2. Checks `sharedSession.isAuthenticated`.
3. If not authenticated, navigates to `appUrl`.
4. Calls `loginPage.login()`.
5. Waits for `networkidle`.
6. Calls `homePage.handlePopups(true, null)`.
7. Marks the shared session authenticated.
8. Reuses the authenticated session for subsequent tests.

Do not add a second independent login flow to each page fixture or test. Use the established bootstrap unless the task explicitly changes authentication.

## 9.4 UI fixture services

The fixture also creates and provides:

- `uiLogger`
- `uiAssertions`
- `uiAssertionHelper`
- `fileUtils`
- `moduleContext`
- `uiActions`
- `uiServices`
- `homePageManager`
- `mainNavigationPage`
- `jobsProcessRecordsPageManager`
- `clientsPageManager`
- `specificationsPageManager`
- `assetsPageManager`
- `accountsPageManager`
- `misPageManager`
- `appUrl`

The fixture definitions are the authoritative source for exact dependency ordering and types. Inspect them before changing fixture dependencies.

## 9.5 Pause controls

`PAUSE_ON_FAILURE` and `PAUSE_ON_FINISH` are interpreted by the UI fixture. The fixture disables pause behavior when `CI` is set.

Do not add unconditional `page.pause()` calls to page objects or tests. Use the fixture's existing debug behavior.

---

# 10. OMS module configuration and execution context

The module configuration system is a core framework feature. Do not bypass it for module-dependent workflows.

Files:

- `pages/Modules/ModuleConfig/ModuleConfig.ts`
- `pages/Modules/ModuleConfig/ModuleSelection.ts`
- `pages/Modules/ModuleConfig/ModuleExecutionContext.ts`

## 10.1 ModuleConfig

`ModuleConfig.ts` defines:

- The supported module code/type.
- The `MODULE_CONFIGS` mapping.
- Module labels.
- Module-specific process-standard options.
- Helpers such as `getModuleConfig`, `getAllModuleCodes`, and `isModuleCode`.

Use the existing configuration mapping as the source of module codes and labels. Never invent a module code or alter a label/options string without evidence and approval.

## 10.2 ModuleSelection

`ModuleSelection` reads `OMS_MODULES` through `FileUtility`.

Supported selection syntax is documented in the source:

```env
OMS_MODULES=PVI
```

or:

```env
OMS_MODULES=PVI,TANK,LSI
```

It parses comma-separated values, trims and uppercases module codes, preserves selection order, and rejects:

- Empty tokens.
- Unsupported module codes.
- Duplicate module codes.

An empty module selection is allowed for non-module tests. Module-dependent page-object methods should call `ModuleExecutionContext.require()` and fail clearly if no module is active.

## 10.3 ModuleExecutionContext

The context is instantiated by the UI fixture for each test. It:

- Holds the immutable selected module list.
- Tracks the active module.
- Exposes `modules` / `selectedModuleConfigs`.
- Exposes `isCombinedRun`.
- Supports `setActiveModule(code)`.
- Provides `require()` and `get()`.
- Provides `getCombinedRunSet()`.
- Clears/disposes itself during fixture teardown.

Do not use global mutable module state or static fields to track the active module. Use the fixture-provided `moduleContext`.

## 10.4 Module-specific environment values

`EnvUtility` supports module-specific environment keys. It checks the module-prefixed key first and then configured fallbacks.

Examples of established key patterns in the project include:

```text
PVICreatedProcedureNo
PVICreatedProcessNo
PVICreatedSpecificationNo
TANKCreatedProcedureNo
LSICreatedProcedureNo
```

The TANK path also contains a compatibility lookup for `Tank<suffix>`. The exact fallback list is supplied by the calling page object.

Use:

```ts
await this.deps.env.requiredModuleEnvValue(
    module,
    'CreatedProcedureNo',
    ['CreatedProcedureNo']
);
```

only after confirming that the requested suffix and fallback behavior match the existing implementation.

`writeModuleEnvValue()` writes the module-prefixed key. Do not hard-code one module's key into a shared module page object.

## 10.5 Combined module execution

For combined module scenarios:

- Use `moduleContext.modules` / `getCombinedRunSet()` for the selected list.
- Call `setActiveModule(module.code)` before executing a module-specific workflow.
- Use `moduleContext.require()` inside page objects that require the active module.
- Preserve the configured order.
- Keep module-specific identifiers isolated using module-prefixed environment keys.
- Do not execute independent module workflows concurrently while they share `.env` tracking values or a single UI page.

The existing `JobCreation.spec.ts` contains module-aware orchestration and should be inspected before modifying module lifecycle behavior.

---

# 11. UI action diagnostics (`ActionDiagnostics.ts`)

`utils/actions/ActionDiagnostics.ts` supports `UIActionUtils`.

It provides source-location and failure-context helpers, including:

- Action source metadata.
- Stack-frame parsing.
- Resolution of the calling page-object file/method.
- Locator formatting.
- Timeout and pointer-interception classification.
- Error-message/reason extraction.
- Stack formatting.

Do not duplicate stack parsing, caller identification, locator formatting, or action failure classification in page objects.

If action diagnostics need to change, update the existing helper and verify its integration with `UIActionUtils`. Keep the diagnostic layer separate from page-specific business logic.

---

# 12. Assertions (`utils/assertion.ts`)

The assertion module exports:

- `GenericAssertions`
- `UIAssertions`
- `APIAssertions`
- `DBAssertions`
- `AssertionHelper`
- Native Playwright `expect`

The assertion helpers are wrappers around Playwright's assertion API and support options such as custom messages, soft assertions, and timeouts where implemented.

Rules:

1. Inspect the actual class and method signature before calling an assertion helper.
2. Use Playwright's web-first assertions for locator state and text checks where suitable.
3. Use `UIAssertions` when the test or page workflow benefits from the shared assertion abstraction.
4. Do not create a second assertion library.
5. Do not put broad test expectations inside a page object. Return state/data and assert in the spec where practical.
6. API and DB assertions must reflect the actual response/result and not guessed schema.

`AssertionHelper` is a separate helper constructed with a logger in the fixtures. Inspect its methods before using it.

---

# 13. Logging (`utils/Logger.ts`)

The framework uses Winston through the custom `Logger` class. Do not replace it with `console.log` as the primary framework logger.

## 13.1 Logger creation

Use the fixture-provided logger in UI tests:

```ts
uiLogger.info('Message');
uiLogger.warn('Message');
uiLogger.error('Message');
uiLogger.debug('Message');
```

Page objects access the same instance through:

```ts
this.deps.logger.info('...');
```

The `Logger.getLogger()` factory accepts test and execution metadata, including category, test ID, project, worker, retry, module name, log directory, log level, and console/file transport options.

## 13.2 Log categories and output

The logger supports categories:

- `UI`
- `API`
- `DATABASE`
- `INTEGRATION`
- `FRAMEWORK`

The default log directory is `Logs` unless configured otherwise. Category-specific directories are created (for example, UI logs, API logs, DB logs, integration logs, and framework logs). File and console transports are controlled through logger options/environment settings.

## 13.3 Logging conventions

- Use `info` for meaningful workflow milestones.
- Use `warn` for recoverable or unexpected conditions.
- Use `error` for failures.
- Use `debug` for detailed diagnostic information.
- Use structured metadata where the logger method supports it.
- Do not log passwords, tokens, API keys, or other secrets.
- Do not create a new logger in every page object. Reuse the fixture-owned logger.
- Close loggers through fixture lifecycle; do not close a shared fixture logger from a page object.

---

# 14. Exception handling (`utils/ExceptionUtility.ts`)

The exception module defines:

- `FrameworkException`
- `UIException`
- `APIException`
- `DatabaseException`
- `FileException`
- `ValidationException`
- `ExceptionUtility`

Exceptions carry a category, optional code, context, and cause. `ExceptionUtility` can wrap errors, map a layer to a category, log a framework exception, and fail while preserving the failure.

Rules:

- Preserve the original error as the cause where applicable.
- Add meaningful operation/test/context metadata.
- Log and rethrow; do not convert a real failure into a passing result.
- Do not swallow exceptions in page objects or utilities.
- Use the existing exception classes rather than inventing a parallel hierarchy.
- Inspect current constructor options before instantiating an exception.

---

# 15. File operations (`utils/FileUtility.ts`)

`FileUtility` is a shared framework utility. It currently handles several responsibilities:

- Resolving the framework root.
- Managing `Downloads/` and `testdata/`.
- Reading/writing dynamic `.env` values.
- Reading process environment values.
- Updating `.env` values and `process.env`.
- Single and multiple file upload.
- Uploading files configured through an environment key.
- Cleaning download output.
- Detecting new downloads.
- Download and extension validation.
- Excel/file processing and other file helpers implemented in the class.

Use `deps.fileUtils` inside page objects rather than implementing new filesystem or upload/download logic.

### File handling rules

- Verify a test asset exists under `testdata/` before using it.
- Use the exact filename supplied by the task or verified in the repository.
- Use `uploadFile()` / `multipleFilesUpload()` for the existing upload workflow.
- Use the existing download helpers where their behavior matches the requirement.
- Do not write generated output into source folders.
- Do not delete unrelated files from `Downloads/`, `testdata/`, or report folders.
- Be careful when modifying `.env`: it may contain persistent module/job tracking data used by later tests.
- Never print secret environment values in logs or final responses.

---

# 16. Environment configuration (`.env`, `.env.example`, `EnvUtility`)

## 16.1 Two distinct environment access paths

The project has both:

- `FileUtility`, which can read `.env` dynamically and update `.env`.
- `EnvUtility`, which provides asynchronous `getEnvValue`, `requiredEnvValue`, module-specific lookup, and module-specific writing.

Prefer `EnvUtility` for page-object configuration access through `deps.env`. Use `FileUtility` for file operations and explicit persistence operations.

## 16.2 Verified configuration discrepancy

The supplied `playwright.config.ts` reads the application URL from:

```ts
process.env.url_local
```

and throws if it is missing.

The supplied `.env.example` instead documents `WEB_APP_URL`. This is a repository discrepancy. Do not silently rename either key or add a fallback in an unrelated task. If changing URL configuration, update the config, `.env.example`, and relevant documentation together after confirming the intended canonical key.

The `.env` file in the repository contains application credentials and test/runtime values. Never reproduce its values in generated documentation, source code, logs, or chat responses. Use `.env.example` for safe configuration documentation, but still inspect it before assuming a key is current.

## 16.3 Existing environment key families

The supplied environment files demonstrate these kinds of keys:

- Application environment and application URL.
- Login credentials and location.
- File upload names.
- Client, material, procedure, process-standard, specification-standard, and job data.
- Created entity identifiers.
- `OMS_MODULES`.
- Module-prefixed procedure/process/specification identifiers.
- Module record numbers and asset identifiers.
- API base URL and FakeStore test IDs/filters.
- DB connection placeholders.
- Logger controls.
- Browser pause controls.

Only use a key after verifying its exact spelling in `.env`, `.env.example`, or the calling code. Key casing matters.

## 16.4 Environment rules

- Do not hard-code credentials, tokens, secrets, or environment-specific URLs.
- Do not replace module-specific keys with one global key when multiple modules run.
- Use the existing `EnvUtility` / `FileUtility` methods.
- Keep `.env.example` safe of real credentials.
- Do not commit or print `.env` secrets.
- Avoid modifying `.env` just to make a local test pass unless the test explicitly needs that state change.

---

# 17. Test data and data readers

## 17.1 Random data (`utils/dataGenerator.ts`)

The project uses `@faker-js/faker` through `RandomDataUtil`.

The class provides static generators for person/contact information, location, date/time, commerce, numbers, numeric strings, alphabetic strings, and other helpers present in the source.

Use the existing generator when random data is appropriate. Inspect the actual method name and return type. Do not call Faker directly in every page object when a suitable `RandomDataUtil` method already exists.

## 17.2 Data reader (`utils/DataReader.ts`)

`DataProvider` currently provides static methods to read:

- JSON
- CSV
- Excel

Use it for external test data. Do not create a second JSON/CSV/XLSX reader without a demonstrated gap.

## 17.3 Fixed data (`utils/helper.ts`)

`utils/helper.ts` contains fixed/shared test-data helpers. Inspect it before introducing constants or another fixed-data class.

## 17.4 Test assets (`testdata/`)

The repository includes CSV, JSON, Excel, PDF, and image assets. Use the actual asset paths and names. Do not assume every file in `testdata/` belongs to the OMS workflow currently being modified.

For Excel workflows, inspect the existing `FileUtility` and `DataProvider` capabilities before adding a new workbook dependency or reader.

---

# 18. Web test conventions (`tests/web/`)

## 18.1 Existing Web test

The supplied repository contains:

- `tests/web/JobCreation.spec.ts`

It is an OMS end-to-end job creation and related lifecycle test. It uses `test` from `fixtures/uiFixture.ts` and consumes the fixture-provided module context, navigation, section managers, file utility, and logger.

Do not replace its workflow with a generic example. Read the full spec and relevant page objects before modifying it.

## 18.2 Imports and fixture use

OMS Web tests should use the custom UI fixture:

```ts
import { test } from '../../fixtures/uiFixture';
```

Import `expect` from the fixture if the test uses the fixture's re-export, or follow the existing assertion convention in the test file. Do not import `test` from `@playwright/test` for an OMS UI test that needs the custom UI fixtures.

Destructure only required fixture values:

```ts
test('OMS workflow', async ({
    moduleContext,
    mainNavigationPage,
    specificationsPageManager,
    uiLogger,
}) => {
    // workflow
});
```

Use the actual exported fixture names from `UIFixtures`. Do not invent fixture names.

## 18.3 Test structure

- Use `test.describe` and `test.step()` for meaningful workflow stages.
- Preserve `test.describe.serial` where shared OMS state and `.env` identifiers make test order important.
- Keep business test orchestration in the spec and page interactions in page objects.
- Use section managers to access page objects.
- Use `moduleContext` for module selection and combined-run logic.
- Use the fixture logger rather than relying on `console.log`.
- Add assertions that validate actual business outcomes; do not assert only that an action did not throw.
- Avoid fixed `waitForTimeout()` sleeps. Use Playwright auto-waiting or a verified helper.
- Keep test data in existing utilities/environment/testdata where appropriate.
- Do not put secrets in test constants.

## 18.4 Test orchestration vs page-object responsibilities

A Web spec may coordinate a multi-page, multi-module business workflow. A page object should implement page-specific interactions and reusable page workflows.

For example, a spec may choose the active module and sequence procedure creation, process-standard creation/revision, specification-standard creation/revision, and job creation. The individual page objects should own the page locators and page operations.

Do not move the entire test lifecycle into one oversized page object, and do not place long locator/action sequences directly in the spec.

---

# 19. API testing

## 19.1 Existing API architecture

Current API-related files include:

- `api/endpoints/routes.ts`
- `api/schemas/*.json`
- `fixtures/apiFixture.ts`
- `utils/actions/APIActionUtils.ts`
- `tests/api/fakestore-api.spec.ts`
- `utils/dataGenerator.ts`
- `utils/DataReader.ts`
- `utils/assertion.ts`

The existing route file contains FakeStore API routes. Do not add OMS endpoints there unless the task supplies or verifies those endpoints. Do not confuse FakeStore sample API tests with OMS backend API coverage.

## 19.2 API test imports

The current `tests/api/fakestore-api.spec.ts` imports:

```ts
import { test, expect } from '@playwright/test';
```

This is intentional in the current code. API tests can use Playwright's built-in `request` fixture directly.

`fixtures/apiFixture.ts` is an optional custom fixture that provides:

- `apiLogger`
- `apiAssertions`
- `apiAssertionHelper`
- `apiFileUtils`
- `apiActions`

Use it when the test requires those services and when doing so is consistent with nearby tests. Do not migrate existing API tests without a task requirement.

## 19.3 Routes

Add or modify routes in `api/endpoints/routes.ts` only after verifying the endpoint and route parameter names. Reuse existing constants. Follow the current `Routes` object style.

Do not invent API paths or assume that a browser URL is an API endpoint.

## 19.4 APIActionUtils

`APIActionUtils` wraps Playwright's `APIRequestContext` and provides HTTP methods (`get`, `post`, `put`, `patch`, `delete`, `head`, `fetch`) plus response helpers and logging.

Use it when the API test architecture needs the framework's standard API action logging. Direct use of Playwright's `request` fixture remains valid and is already used by the existing FakeStore spec.

Do not build a second HTTP client abstraction.

## 19.5 API schemas

AJV is present and JSON schemas exist under `api/schemas/`. A schema must match a real API request/response payload. Inspect actual responses or API documentation before changing schemas.

Do not add fields, mark fields required, or change data types based on guesses.

---

# 20. Database testing

The repository has DB support code but it is not fully integrated.

- `fixtures/dbFixture.ts` defines DB-related fixtures and currently throws when `databaseAdapter` is requested.
- `DBActionUtils` operates through a `DatabaseAdapter` interface with collection-style methods.
- `utils/dbClient.ts` uses `mysql2/promise` and exposes `executeQuery(sql, params?)`.
- There is no current `tests/db/` directory in the supplied project tree.

Before creating a DB test:

1. Confirm the target DB engine and connection requirements.
2. Confirm whether the intended DB abstraction is SQL/MySQL or a document/collection adapter.
3. Inspect the required schema/table/collection and test data.
4. Decide with the user whether to wire the MySQL helper or implement an adapter compatible with `DBActionUtils`.
5. Add tests only after the fixture can provide a real connection/adapter.
6. Ensure connections are closed safely and test data cleanup is appropriate.

Never claim DB tests passed when the adapter fixture still throws. Do not invent SQL tables or Mongo collections.

---

# 21. Assertions, validation, and expected results

- Assertions must be based on the test scenario and verified application/API behavior.
- Prefer Playwright web-first assertions for UI locators.
- Use the project's `UIAssertions`, `APIAssertions`, or `DBAssertions` where appropriate.
- Use AJV for schema validation when the task requires schema checks and the schema is grounded in actual payloads.
- Separate page actions from test-level business assertions.
- Include helpful assertion messages for important business outcomes.
- Do not weaken an assertion merely to make a failing test pass.
- Do not catch and suppress assertion errors.

---

# 22. Logging and failure diagnostics

For failures:

1. Read the full error and stack trace.
2. Identify the failing test step and page-object method.
3. Inspect the relevant locator and live DOM.
4. Inspect `UIActionUtils` diagnostics and the action's caller metadata.
5. Determine whether the failure is caused by locator mismatch, overlay/interception, timing, application response, test data, module context, environment, or fixture lifecycle.
6. Fix the root cause only.
7. Re-run the narrowest reproducible test.
8. Re-run dependent tests if a shared utility, fixture, or page manager changed.

Do not introduce arbitrary waits, force-clicks, JavaScript DOM clicks, retries, or catch-and-ignore blocks as the first response to a failure. Use them only when the application behavior and existing framework design justify them.

---

# 23. Playwright configuration and test execution

## 23.1 Current `playwright.config.ts`

The supplied config currently sets:

- `testDir: "./tests"`
- `fullyParallel: false`
- `workers: 1`
- Retry count based on `CI`
- A list reporter and `utils/CustomReporter.ts`
- Base URL from `url_local`
- Trace on first retry
- Screenshot only on failure
- Video retained on failure
- `headless: false`
- Viewport 1280 × 720
- `ignoreHTTPSErrors: true`
- Geolocation permission
- A `chromium` project that excludes `tests/web/JobCreation.spec.ts`
- An `oms-jobs` project that matches `tests/web/JobCreation.spec.ts`

The single worker is important because OMS tests share a browser session and update shared `.env` tracking values. Do not enable parallel execution without redesigning and validating those shared-state dependencies.

The configuration currently sets `headless: false`; do not assume CI runs headless merely because `CI` is set. Inspect the active config and command-line flags.

## 23.2 Existing npm scripts

Use the scripts defined in `package.json`, currently including:

- `test:api`
- `test:web`
- `test:master`
- `test:sanity`
- `test:regression`
- `test:e2e`
- `test:datadriven`
- `test:master:headed`
- `test:sanity:debug`

Before adding or changing scripts, inspect the actual `package.json`.

## 23.3 Validation commands

Use the narrowest relevant command first. Examples:

```bash
npx playwright test tests/web/JobCreation.spec.ts --project=oms-jobs
npx playwright test tests/api/fakestore-api.spec.ts
npx playwright test --grep @master
npx tsc --noEmit
```

Only run a command if the environment and dependencies are available. Report whether it actually ran and its result. Do not claim tests passed based only on static inspection.

---

# 24. Reporting and runtime output

The framework has:

- `utils/CustomReporter.ts` for a custom HTML report.
- Playwright trace, screenshot, and video settings in `playwright.config.ts`.
- Winston log output under `Logs/` (or configured log directory).
- Runtime/report directories such as `reports/`, `custom-report/`, `allure-results/`, `allure-report/`, and `test-results/`.

Do not manually edit generated reports to change test behavior. Do not commit generated artifacts unless the repository's workflow explicitly requires them.

When troubleshooting a failure, inspect the relevant report, trace, screenshot, video, and log rather than guessing.

---

# 25. Jenkins and Docker execution

The repository contains:

- `Jenkinsfile`
- `Dockerfile`
- `docker-compose.yml`
- `docker-entrypoint.sh`
- Docker setup documentation under `docs/`

The Jenkins pipeline supports test-suite, browser, and headed/headless parameters and archives report artifacts. The supplied pipeline includes notification configuration placeholders; do not expose or replace email addresses without a user instruction.

The Dockerfile uses a Playwright container image and installs dependencies with `npm ci`. Docker Compose mounts the project and report folders.

Before changing CI or container behavior:

1. Read the full pipeline/entrypoint and relevant docs.
2. Preserve the existing suite-selection behavior.
3. Keep Playwright package and container image versions compatible.
4. Do not copy `.env` secrets into Docker image layers.
5. Verify paths and output artifacts.
6. Do not claim cloud/AWS execution is configured unless the repository or user provides that configuration.

---

# 26. Safe code modification rules

When modifying code:

- Preserve existing public class names, method names, fixture names, and return types unless the task explicitly requests a breaking change.
- Preserve existing business workflows and Selenium-migration behavior unless asked to change them.
- Do not rename environment keys casually.
- Do not remove compatibility aliases without checking callers.
- Do not replace `UIActionUtils` calls with native Playwright indiscriminately.
- Do not replace native Playwright calls with wrappers indiscriminately.
- Do not add packages unless required and approved.
- Do not change `playwright.config.ts`, `tsconfig.json`, or `package.json` for unrelated tasks.
- Do not reformat or rewrite unrelated files.
- Update every dependent import, fixture type, page manager, test, or documentation entry when an intentional interface change is made.
- Keep TypeScript types strict; avoid introducing `any`.
- Keep credentials and sensitive runtime values out of source code and logs.

---

# 27. New page-object or workflow implementation sequence

When a new OMS workflow is requested, follow this sequence:

```text
1. Read the test prompt / user requirement
        |
2. Inspect the current test and workflow dependencies
        |
3. Inspect the live OMS page and DOM
        |
4. Find an existing page object or manager
        |
5. Add/update the page object in the correct section
        |
6. Reuse OmsPageServices and UIActionUtils
        |
7. Add a lazy getter to the section Page Manager if needed
        |
8. Add fixture wiring only if a new manager/service is required
        |
9. Reuse ModuleExecutionContext / EnvUtility where module-aware
        |
10. Update or create the Web spec using uiFixture
        |
11. Execute the narrowest test and diagnose failures
        |
12. Run type checking and dependent tests
        |
13. Summarize changed files and verification results
```

Do not create a new Page Manager for every page. Extend the existing section manager when the new page belongs to an existing functional section.

---

# 28. Test modification sequence

For an existing test:

1. Read the complete test.
2. Identify all fixture dependencies.
3. Trace every called page-object method.
4. Inspect the page manager and relevant page object.
5. Inspect shared utilities only where the behavior depends on them.
6. Make the smallest required modification.
7. Preserve test order and module selection behavior.
8. Run the exact test/project.
9. Run type checking.
10. Report any unverified behavior or blocked environment dependency.

For a new test:

1. Confirm whether it is Web, API, DB, or a combination.
2. Use the appropriate existing fixture architecture.
3. Reuse existing page objects/managers/routes/schemas/utilities.
4. Create only genuinely missing components.
5. Keep each test layer logically separate.
6. Validate the actual outcome, not only the completion of actions.

---

# 29. Mandatory completion checklist

Before finishing a coding task, verify all applicable items:

## Repository and architecture
- [ ] Relevant source files and callers were inspected.
- [ ] Existing utilities and page objects were reused where appropriate.
- [ ] No duplicate page class, manager, fixture, or utility was created.
- [ ] New files are in the correct existing folders.
- [ ] Existing page-manager and fixture conventions were preserved.

## UI implementation
- [ ] Locators were verified against the actual DOM or supplied evidence.
- [ ] Existing `UIActionUtils` methods were checked before adding wrappers.
- [ ] Native Playwright APIs are used when a custom wrapper adds no value.
- [ ] No arbitrary fixed sleeps were introduced.
- [ ] Page objects own page interactions; specs own test orchestration/assertions.
- [ ] Module-aware workflows use `ModuleExecutionContext`.

## Framework integration
- [ ] `OmsPageServices` dependencies are wired correctly.
- [ ] New page objects are exposed by the correct Page Manager.
- [ ] Fixture types and registrations are updated only when needed.
- [ ] Environment keys are exact and module-aware where required.
- [ ] Logging and exceptions use the existing framework utilities.

## Validation
- [ ] Imports and TypeScript types are correct.
- [ ] Relevant Playwright test was executed when possible.
- [ ] `npx tsc --noEmit` was run when the project setup supports it.
- [ ] Failures were diagnosed from evidence and fixed at root cause.
- [ ] No `.only`, accidental skipped tests, debug leftovers, or unrelated changes remain.
- [ ] Final response distinguishes verified results from anything not run.

---

# 30. Known repository discrepancies and limitations

These items were observed in the supplied repository and must not be hidden by generated instructions:

1. **URL environment-key mismatch:** `playwright.config.ts` reads `url_local`, while `.env.example` documents `WEB_APP_URL`.
2. **Database fixture is incomplete:** `databaseAdapter` deliberately throws because no adapter is configured.
3. **Different DB abstractions coexist:** `DBActionUtils` expects a collection-style adapter, while `dbClient.ts` contains a MySQL `executeQuery` helper. They are not currently connected.
4. **No DB test folder:** `tests/db/` was not present in the supplied source tree.
5. **Some Page Managers are placeholders:** `AssetsPageManager`, `AccountsPageManager`, and `MISPageManager` currently expose no page-object getters.
6. **API fixture is not used by the existing FakeStore spec:** that spec imports Playwright's native `test` and `expect`.
7. **The UI fixture shares a worker-scoped browser session/page:** this creates intentional session continuity and shared-state considerations.
8. **The UI configuration is headed by default:** `headless: false` is set in the current Playwright config.
9. **The test project splits the OMS job spec:** `chromium` ignores `JobCreation.spec.ts`, while `oms-jobs` targets it.

Do not automatically fix these discrepancies during unrelated tasks. Explain their impact and change them only when the task requires it.

---

# 31. Final operating principle

This is an existing OMS automation framework, not a blank Playwright project.

**Use native Playwright as the browser automation engine. Use the existing custom utilities for shared framework behavior. Use Page Objects for page-level workflows, Page Managers for functional grouping, fixtures for lifecycle and dependency creation, and the module context for module-aware execution.**

The objective is to keep the framework understandable, consistent, diagnosable, and maintainable as OMS coverage grows. Do not add abstraction for its own sake, and do not bypass an existing abstraction when it provides real shared behavior.

When uncertain, inspect the implementation and its callers before coding. State what is known, what is missing, and what must be verified.