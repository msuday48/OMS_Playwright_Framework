import type { Page } from '@playwright/test';

import type { OmsPageServices } from '../common/pageServices';
import { CreateJob } from './CreateJob';
import { CreatedJobSearch } from './CreatedJobSearch';
import { SearchAddProcessData } from './SearchAddProcessData';

/** Lazy access to the page objects belonging to the Jobs & process records section. */
export class JobsProcessRecordsPageManager {
    private _createJobPage?: CreateJob;
    private _createdJobSearchPage?: CreatedJobSearch;
    private _searchAddProcessDataPage?: SearchAddProcessData;

    constructor(
        private readonly page: Page,
        private readonly deps: OmsPageServices,
    ) { }

    get createJobPage(): CreateJob {
        return (this._createJobPage ??= new CreateJob(this.page, this.deps));
    }

    get createdJobSearchPage(): CreatedJobSearch {
        return (this._createdJobSearchPage ??= new CreatedJobSearch(this.page, this.deps));
    }

    get searchAddProcessDataPage(): SearchAddProcessData {
        return (this._searchAddProcessDataPage ??= new SearchAddProcessData(this.page, this.deps));
    }
}
