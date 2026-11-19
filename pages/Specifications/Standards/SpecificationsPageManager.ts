import type { Page } from '@playwright/test';

import type { OmsPageServices } from '../../common/pageServices';
import { MaterialPage } from './MaterialPage';
import { ProceduresPage } from './ProceduresPage';
import { ProcessStandard } from './ProcessStandard';
import { SpecificationStandardPage } from './SpecificationStandardPage';

/** Lazy access to the page objects belonging to the Specifications section. */
export class SpecificationsPageManager {
    private _materialPage?: MaterialPage;
    private _proceduresPage?: ProceduresPage;
    private _processStandard?: ProcessStandard;
    private _specificationStandardPage?: SpecificationStandardPage;

    constructor(
        private readonly page: Page,
        private readonly deps: OmsPageServices,
    ) { }

    get materialPage(): MaterialPage {
        return (this._materialPage ??= new MaterialPage(this.page, this.deps));
    }

    get proceduresPage(): ProceduresPage {
        return (this._proceduresPage ??= new ProceduresPage(this.page, this.deps));
    }

    get processStandard(): ProcessStandard {
        return (this._processStandard ??= new ProcessStandard(this.page, this.deps));
    }

    get processStandardPage(): ProcessStandard {
        return this.processStandard;
    }

    get specificationStandardPage(): SpecificationStandardPage {
        return (this._specificationStandardPage ??= new SpecificationStandardPage(this.page, this.deps));
    }
}
