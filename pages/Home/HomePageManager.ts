import type { Page } from '@playwright/test';

import type { OmsPageServices } from '../common/pageServices';
import { HomePage } from '../common/HomePage';
import { LoginPage } from '../common/LoginPage';
import { MainNavigationPage } from '../common/MainNavigationPage';

/** Lazy access to the home, login and main-navigation page objects. */
export class HomePageManager {
    private _homePage?: HomePage;
    private _loginPage?: LoginPage;
    private _mainNavigationPage?: MainNavigationPage;

    constructor(
        private readonly page: Page,
        private readonly deps: OmsPageServices,
    ) { }

    get homePage(): HomePage {
        return (this._homePage ??= new HomePage(this.page, this.deps));
    }

    get loginPage(): LoginPage {
        return (this._loginPage ??= new LoginPage(this.page, this.deps));
    }

    get mainNavigationPage(): MainNavigationPage {
        return (this._mainNavigationPage ??= new MainNavigationPage(this.page, this.deps));
    }
}
