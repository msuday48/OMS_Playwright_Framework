import type { Page } from '@playwright/test';

import type { OmsPageServices } from '../common/pageServices';
import { ClientSearchPage } from './ClientSearchPage';
import { OnlineClientCreationPage } from './OnlineClientCreationPage';
import { OfflineClientCreationPage } from './OfflineClientCreationPage';

/** Lazy access to the page objects belonging to the Clients section. */
export class ClientsPageManager {
    private _clientSearchPage?: ClientSearchPage;
    private _clientCreationPage?: OnlineClientCreationPage;
    private _offlineClientCreationPage?: OfflineClientCreationPage;

    constructor(
        private readonly page: Page,
        private readonly deps: OmsPageServices,
    ) { }

    get offlineClientCreationPage(): OfflineClientCreationPage {
        return (this._offlineClientCreationPage ??= new OfflineClientCreationPage(this.page, this.deps));
    }

    get clientSearchPage(): ClientSearchPage {
        return (this._clientSearchPage ??= new ClientSearchPage(this.page, this.deps));
    }

    get clientCreationPage(): OnlineClientCreationPage {
        return (this._clientCreationPage ??= new OnlineClientCreationPage(this.page, this.deps));
    }
}
