import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
    type BrowserContext,
    type ConsoleMessage,
    type Dialog,
    type Download,
    type FileChooser,
    type Frame,
    type FrameLocator,
    type Locator,
    type Page,
    type Request,
    type Response,
    type Route
} from '@playwright/test';
import { expect } from '../assertion';
import { UIException } from '../ExceptionUtility';
import type { FileUtility } from '../FileUtility';
import type { Logger } from '../Logger';
import {
    type ActionExecutionContext,
    captureActionSource,
    errorMessageLine,
    errorStack,
    formatLocator,
    formatSourceFrame,
    formatSourceLocation,
    isPointerInterceptionError,
    reasonForError
} from './ActionDiagnostics';

export type LocatorClickOptions = Parameters<Locator['click']>[0];
export type LocatorFillOptions = Parameters<Locator['fill']>[1];
export type LocatorPressOptions = Parameters<Locator['press']>[1];
export type LocatorHoverOptions = Parameters<Locator['hover']>[0];
export type LocatorTapOptions = Parameters<Locator['tap']>[0];
export type LocatorWaitForOptions = Parameters<Locator['waitFor']>[0];
export type LocatorScreenshotOptions = Parameters<Locator['screenshot']>[0];
export type PageGotoOptions = Parameters<Page['goto']>[1];
export type PageWaitForURLOptions = Parameters<Page['waitForURL']>[1];
export type PageWaitForLoadStateOptions = Parameters<Page['waitForLoadState']>[1];

export type DialogAction = 'accept' | 'dismiss';
export type UrlMatcher = string | RegExp | ((url: URL) => boolean);
export type ResponseMatcher = string | RegExp | ((response: Response) => boolean | Promise<boolean>);
export type RequestMatcher = string | RegExp | ((request: Request) => boolean | Promise<boolean>);
export type RouteHandler = (route: Route, request: Request) => void | Promise<void>;

export interface UIActionUtilsOptions {
    page: Page;
    context: BrowserContext;
    logger?: Logger;
    fileUtils?: FileUtility;
    defaultTimeout?: number;
}

interface ActionExecutionOptions {
    elementName?: string;
    readOnly?: boolean;
    logSuccess?: boolean;
}

interface LocatorActionExecutionOptions<T> extends ActionExecutionOptions {
    interceptFallback?: (locator: Locator) => Promise<T>;
    interceptFallbackLabel?: string;
}

export interface ClickPosition {
    x: number;
    y: number;
}

export interface DropdownOption {
    index: number;
    label: string;
    value: string;
    disabled: boolean;
    selected: boolean;
}

export interface SelectDateOptions {
    calendar: CalendarLocators;
    date: string | Date;
    input?: Locator;
    maxNavigations?: number;
}

export interface CalendarLocators {
    root?: Locator;
    monthLabel?: Locator;
    yearLabel?: Locator;
    nextButton?: Locator;
    previousButton?: Locator;
    day?: (day: number) => Locator;
    todayButton?: Locator;
}

export interface MockResponseOptions {
    status?: number;
    headers?: Record<string, string>;
    body?: string | Buffer;
    json?: unknown;
    contentType?: string;
}

export interface WaitUntilOptions {
    timeout?: number;
    interval?: number;
    message?: string;
}

export interface HighlightOptions {
    color?: string;
    width?: string;
    duration?: number;
}

type PageEventMap = {
    close: Page;
    console: ConsoleMessage;
    crash: Page;
    dialog: Dialog;
    domcontentloaded: Page;
    download: Download;
    filechooser: FileChooser;
    load: Page;
    pageerror: Error;
    popup: Page;
    request: Request;
    requestfailed: Request;
    response: Response;
    frameattached: Frame;
    framedetached: Frame;
    framenavigated: Frame;
    websocket: unknown;
};

type ContextEventMap = {
    close: BrowserContext;
    page: Page;
    request: Request;
    requestfailed: Request;
    requestfinished: Request;
    response: Response;
    weberror: unknown;
};

export class UIActionUtils {
    private readonly page: Page;
    private activePage: Page;
    private readonly context: BrowserContext;
    private readonly logger?: Logger;
    private readonly fileUtils?: FileUtility;
    private readonly defaultTimeout: number;
    private readonly pageListenerWrappers = new WeakMap<object, Array<{ event: keyof PageEventMap; wrapped: (payload: unknown) => void }>>();
    private readonly contextListenerWrappers = new WeakMap<object, Array<{ event: keyof ContextEventMap; wrapped: (payload: unknown) => void }>>();

    constructor(options: UIActionUtilsOptions) {
        this.page = options.page;
        this.activePage = options.page;
        this.context = options.context;
        this.logger = options.logger;
        this.fileUtils = options.fileUtils;
        this.defaultTimeout = options.defaultTimeout ?? 30_000;
    }

    // =========================================================================
    // CLICK ACTIONS
    // =========================================================================

    public click(locator: Locator, options?: LocatorClickOptions, elementName?: string): Promise<void> {
        return this.locatorAction('click', locator, (loc) => loc.click(options), { elementName });
    }

    public clickUsingJS(locator: Locator, elementName?: string): Promise<void> {
        return this.locatorAction('clickUsingJS', locator, (loc) =>
            loc.evaluate((element) => {
                (element as HTMLElement).click();
            }), { elementName }
        );
    }

    public clickWithDomFallback(locator: Locator, options?: LocatorClickOptions, elementName?: string): Promise<void> {
        return this.locatorAction('click', locator, (loc) => loc.click(options), {
            elementName,
            interceptFallback: async (loc) => {
                await loc.evaluate((element) => (element as HTMLElement).click());
            },
            interceptFallbackLabel: 'DOM click fallback.'
        });
    }

    public clickAtPosition(locator: Locator, position: ClickPosition, options?: LocatorClickOptions, elementName?: string): Promise<void> {
        return this.locatorAction('clickAtPosition', locator, (loc) => loc.click({ ...options, position }), { elementName });
    }

    public doubleClick(locator: Locator, options?: LocatorClickOptions, elementName?: string): Promise<void> {
        return this.locatorAction('doubleClick', locator, (loc) => loc.dblclick(options), { elementName });
    }

    public rightClick(locator: Locator, options?: LocatorClickOptions, elementName?: string): Promise<void> {
        return this.locatorAction('rightClick', locator, (loc) => loc.click({ ...options, button: 'right' }), { elementName });
    }

    public middleClick(locator: Locator, options?: LocatorClickOptions, elementName?: string): Promise<void> {
        return this.locatorAction('middleClick', locator, (loc) => loc.click({ ...options, button: 'middle' }), { elementName });
    }

    public tap(locator: Locator, options?: LocatorTapOptions, elementName?: string): Promise<void> {
        return this.locatorAction('tap', locator, (loc) => loc.tap(options), { elementName });
    }

    public async clickAndHold(locator: Locator, elementName?: string): Promise<void> {
        return this.locatorAction('clickAndHold', locator, async (loc) => {
            await loc.scrollIntoViewIfNeeded();
            const box = await loc.boundingBox();
            if (!box) throw new UIException('clickAndHold failed: element has no bounding box.');
            const mouse = loc.page().mouse;
            await mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await mouse.down();
        }, { elementName });
    }

    public releaseMouse(): Promise<void> {
        return this.action('releaseMouse', () => this.activePage.mouse.up(), { elementName: 'Mouse button' });
    }

    public hover(locator: Locator, options?: LocatorHoverOptions, elementName?: string): Promise<void> {
        return this.locatorAction('hover', locator, (loc) => loc.hover(options), { elementName });
    }

    public async hoverAndClick(hoverLocator: Locator, clickLocator: Locator): Promise<void> {
        await this.hover(hoverLocator);
        await this.click(clickLocator);
    }

    // =========================================================================
    // TEXT INPUT ACTIONS
    // =========================================================================

    public fill(locator: Locator, value: string, options?: LocatorFillOptions, elementName?: string): Promise<void> {
        return this.locatorAction('fill', locator, (loc) => loc.fill(value, options), { elementName });
    }

    public typeSequentially(locator: Locator, value: string, options?: Parameters<Locator['pressSequentially']>[1], elementName?: string): Promise<void> {
        return this.locatorAction('typeSequentially', locator, (loc) => loc.pressSequentially(value, options), { elementName });
    }

    public typeText(locator: Locator, value: string, options?: Parameters<Locator['pressSequentially']>[1], elementName?: string): Promise<void> {
        return this.typeSequentially(locator, value, options, elementName);
    }

    public clear(locator: Locator, options?: LocatorFillOptions, elementName?: string): Promise<void> {
        return this.locatorAction('clear', locator, (loc) => loc.clear(options), { elementName });
    }

    public async appendText(locator: Locator, value: string, elementName?: string): Promise<void> {
        return this.locatorAction('appendText', locator, async (loc) => {
            await loc.focus();
            await loc.press('End');
            await loc.pressSequentially(value);
        }, { elementName });
    }

    public press(locator: Locator, key: string, options?: LocatorPressOptions, elementName?: string): Promise<void> {
        return this.locatorAction(`press(${key})`, locator, (loc) => loc.press(key, options), { elementName });
    }

    public focus(locator: Locator, elementName?: string): Promise<void> {
        return this.locatorAction('focus', locator, (loc) => loc.focus(), { elementName });
    }

    public blur(locator: Locator, elementName?: string): Promise<void> {
        return this.locatorAction('blur', locator, (loc) => loc.blur(), { elementName });
    }

    public selectText(locator: Locator, elementName?: string): Promise<void> {
        return this.locatorAction('selectText', locator, (loc) => loc.selectText(), { elementName });
    }

    // =========================================================================
    // CHECKBOX AND RADIO ACTIONS
    // =========================================================================

    public check(locator: Locator, options?: Parameters<Locator['check']>[0], elementName?: string): Promise<void> {
        return this.locatorAction('check', locator, (loc) => loc.check(options), { elementName });
    }

    public uncheck(locator: Locator, options?: Parameters<Locator['uncheck']>[0], elementName?: string): Promise<void> {
        return this.locatorAction('uncheck', locator, (loc) => loc.uncheck(options), { elementName });
    }

    public setChecked(locator: Locator, checked: boolean, options?: Parameters<Locator['setChecked']>[1], elementName?: string): Promise<void> {
        return this.locatorAction('setChecked', locator, (loc) => loc.setChecked(checked, options), { elementName });
    }

    public async toggleCheckbox(locator: Locator): Promise<void> {
        if (await locator.isChecked()) {
            await this.uncheck(locator);
        } else {
            await this.check(locator);
        }
    }

    // =========================================================================
    // KEYBOARD ACTIONS
    // =========================================================================

    public pressKey(locator: Locator, key: string): Promise<void> {
        return this.press(locator, key);
    }

    public pressKeyGlobally(key: string, elementName?: string): Promise<void> {
        return this.action(`pressKeyGlobally(${key})`, () => this.activePage.keyboard.press(key), { elementName: elementName ?? 'Keyboard' });
    }

    public async pressKeyChord(locator: Locator, ...keys: string[]): Promise<void> {
        await this.focus(locator);
        await this.pressKeyChordGlobally(...keys);
    }

    public async pressKeyChordGlobally(...keys: string[]): Promise<void> {
        if (keys.length === 0) throw new UIException('pressKeyChord requires at least one key.');

        const modifiers = keys.slice(0, -1);
        const finalKey = keys[keys.length - 1];
        try {
            for (const modifier of modifiers) await this.activePage.keyboard.down(modifier);
            await this.activePage.keyboard.press(finalKey);
        } finally {
            for (const modifier of [...modifiers].reverse()) await this.activePage.keyboard.up(modifier);
        }
        this.logger?.debug(`UI action: pressKeyChord(${keys.join('+')})`);
    }

    public keyboardDown(key: string, elementName?: string): Promise<void> {
        return this.action(`keyboardDown(${key})`, () => this.activePage.keyboard.down(key), { elementName: elementName ?? 'Keyboard' });
    }

    public keyboardUp(key: string, elementName?: string): Promise<void> {
        return this.action(`keyboardUp(${key})`, () => this.activePage.keyboard.up(key), { elementName: elementName ?? 'Keyboard' });
    }

    public keyboardType(text: string, options?: Parameters<Locator['pressSequentially']>[1], elementName?: string): Promise<void> {
        return this.action('keyboardType', () => this.activePage.keyboard.type(text, options), { elementName: elementName ?? 'Keyboard' });
    }

    public keyboardInsertText(text: string, elementName?: string): Promise<void> {
        return this.action('keyboardInsertText', () => this.activePage.keyboard.insertText(text), { elementName: elementName ?? 'Keyboard' });
    }

    public pressSequentially(locator: Locator, text: string, options?: Parameters<Locator['pressSequentially']>[1]): Promise<void> {
        return this.typeSequentially(locator, text, options);
    }

    // =========================================================================
    // MOUSE ACTIONS
    // =========================================================================

    public mouseMove(x: number, y: number, options?: Parameters<Page['mouse']['move']>[2], elementName?: string): Promise<void> {
        return this.action('mouseMove', () => this.activePage.mouse.move(x, y, options), { elementName: elementName ?? `Mouse (${x}, ${y})` });
    }

    public mouseClick(x: number, y: number, options?: Parameters<Page['mouse']['click']>[2], elementName?: string): Promise<void> {
        return this.action('mouseClick', () => this.activePage.mouse.click(x, y, options), { elementName: elementName ?? `Mouse (${x}, ${y})` });
    }

    public mouseDoubleClick(x: number, y: number, options?: Parameters<Page['mouse']['dblclick']>[2], elementName?: string): Promise<void> {
        return this.action('mouseDoubleClick', () => this.activePage.mouse.dblclick(x, y, options), { elementName: elementName ?? `Mouse (${x}, ${y})` });
    }

    public mouseDown(button: 'left' | 'right' | 'middle' = 'left', elementName?: string): Promise<void> {
        return this.action('mouseDown', () => this.activePage.mouse.down({ button }), { elementName: elementName ?? `Mouse ${button} button` });
    }

    public mouseUp(button: 'left' | 'right' | 'middle' = 'left', elementName?: string): Promise<void> {
        return this.action('mouseUp', () => this.activePage.mouse.up({ button }), { elementName: elementName ?? `Mouse ${button} button` });
    }

    public mouseWheel(deltaX: number, deltaY: number, elementName?: string): Promise<void> {
        return this.action('mouseWheel', () => this.activePage.mouse.wheel(deltaX, deltaY), { elementName: elementName ?? 'Mouse wheel' });
    }

    public dragAndDrop(source: Locator, target: Locator, options?: Parameters<Locator['dragTo']>[1], elementName?: string): Promise<void> {
        return this.locatorAction('dragAndDrop', source, (loc) => loc.dragTo(target, options), { elementName });
    }

    public async dragAndDropByOffset(locator: Locator, xOffset: number, yOffset: number, elementName?: string): Promise<void> {
        return this.locatorAction('dragAndDropByOffset', locator, async (loc) => {
            await loc.scrollIntoViewIfNeeded();
            const box = await loc.boundingBox();
            if (!box) throw new UIException('dragAndDropByOffset failed: element has no bounding box.');

            const startX = box.x + box.width / 2;
            const startY = box.y + box.height / 2;
            const mouse = loc.page().mouse;
            await mouse.move(startX, startY);
            await mouse.down();
            await mouse.move(startX + xOffset, startY + yOffset, { steps: 10 });
            await mouse.up();
        }, { elementName });
    }

    // =========================================================================
    // DROPDOWN ACTIONS
    // =========================================================================

    public selectByLabel(locator: Locator, label: string, elementName?: string): Promise<string[]> {
        return this.locatorAction('selectByLabel', locator, (loc) => loc.selectOption({ label }), { elementName });
    }

    public selectByValue(locator: Locator, value: string, elementName?: string): Promise<string[]> {
        return this.locatorAction('selectByValue', locator, (loc) => loc.selectOption({ value }), { elementName });
    }

    public selectByIndex(locator: Locator, index: number, elementName?: string): Promise<string[]> {
        return this.locatorAction('selectByIndex', locator, (loc) => loc.selectOption({ index }), { elementName });
    }

    public selectMultiple(locator: Locator, values: string[], elementName?: string): Promise<string[]> {
        return this.locatorAction('selectMultiple', locator, (loc) => loc.selectOption(values), { elementName });
    }

    public deselectAll(locator: Locator, elementName?: string): Promise<string[]> {
        return this.locatorAction('deselectAll', locator, (loc) => loc.selectOption([]), { elementName });
    }

    public getDropdownOptions(locator: Locator, elementName?: string): Promise<DropdownOption[]> {
        return this.locatorAction('getDropdownOptions', locator, (loc) => loc.evaluate((element) => {
            const select = element as HTMLSelectElement;
            return Array.from(select.options).map((option, index) => ({
                index,
                label: option.label,
                value: option.value,
                disabled: option.disabled,
                selected: option.selected
            }));
        }), { elementName });
    }

    public async getSelectedOption(locator: Locator, elementName?: string): Promise<string | null> {
        return this.locatorAction('getSelectedOption', locator, (loc) => loc.evaluate((element) => {
            const select = element as HTMLSelectElement;
            return select.selectedOptions.length > 0 ? select.selectedOptions[0].label : null;
        }), { elementName });
    }

    public async getSelectedOptions(locator: Locator, elementName?: string): Promise<string[]> {
        return this.locatorAction('getSelectedOptions', locator, (loc) => loc.evaluate((element) => {
            const select = element as HTMLSelectElement;
            return Array.from(select.selectedOptions).map((option) => option.label);
        }), { elementName });
    }

    public isMultipleSelect(locator: Locator, elementName?: string): Promise<boolean> {
        return this.locatorAction('isMultipleSelect', locator, (loc) => loc.evaluate((element) => (element as HTMLSelectElement).multiple), { elementName });
    }

    public async openCustomDropdown(locator: Locator): Promise<void> {
        await this.click(locator);
    }

    public async selectCustomDropdownOption(dropdownLocator: Locator, optionLocator: Locator, expectedText: string): Promise<void> {
        await this.click(dropdownLocator);
        const option = optionLocator.filter({ hasText: new RegExp(this.escapeRegExp(expectedText), 'i') }).first();
        await option.waitFor({ state: 'visible', timeout: this.defaultTimeout });
        await this.click(option);
    }

    public async selectCustomDropdownByText(dropdownLocator: Locator, optionsLocator: Locator, expectedText: string): Promise<void> {
        await this.click(dropdownLocator);
        const option = optionsLocator.getByText(expectedText, { exact: false }).first();
        await option.waitFor({ state: 'visible', timeout: this.defaultTimeout });
        await this.click(option);
    }

    public async selectCustomDropdownMultiple(dropdownLocator: Locator, optionsLocator: Locator, expectedTexts: string[]): Promise<void> {
        for (const expectedText of expectedTexts) {
            const option = optionsLocator.getByText(expectedText, { exact: false }).first();
            if (!(await option.isVisible())) {
                await this.click(dropdownLocator);
            }
            await option.waitFor({ state: 'visible', timeout: this.defaultTimeout });
            await this.click(option);
        }
    }

    // =========================================================================
    // AUTOCOMPLETE AND SUGGESTIONS
    // =========================================================================

    public async selectAutoSuggestion(
        inputLocator: Locator,
        searchText: string,
        suggestionLocator: Locator,
        expectedOption: string,
        options?: { timeout?: number }
    ): Promise<void> {
        const timeout = options?.timeout ?? this.defaultTimeout;
        await this.fill(inputLocator, searchText);

        const suggestion = suggestionLocator
            .filter({ hasText: new RegExp(this.escapeRegExp(expectedOption), 'i') })
            .first();

        await suggestion.waitFor({ state: 'visible', timeout });
        await this.click(suggestion);
    }

    // =========================================================================
    // CALENDAR AND DATE-PICKER ACTIONS
    // =========================================================================

    public async selectDateInput(locator: Locator, date: string | Date): Promise<void> {
        await this.fill(locator, this.toDateInputValue(date));
    }

    public async selectDateFromCalendar(options: SelectDateOptions): Promise<void> {
        const target = this.parseDate(options.date);
        const calendar = options.calendar;

        if (options.input) {
            await this.click(options.input);
        }

        const canNavigate = calendar.monthLabel && calendar.yearLabel && calendar.nextButton && calendar.previousButton;
        if (canNavigate) {
            const maxNavigations = options.maxNavigations ?? 24;
            for (let attempt = 0; attempt < maxNavigations; attempt++) {
                const current = await this.readCurrentMonthYear(calendar);
                const currentIndex = current.year * 12 + current.month;
                const targetIndex = target.getFullYear() * 12 + target.getMonth();
                if (currentIndex === targetIndex) break;

                const navigationButton = targetIndex > currentIndex ? calendar.nextButton! : calendar.previousButton!;
                await this.click(navigationButton);
                await this.activePage.waitForTimeout(150);
            }
        }

        const day = calendar.day
            ? calendar.day(target.getDate())
            : this.activePage.getByRole('gridcell', { name: String(target.getDate()), exact: true });

        await this.click(day.first());
    }

    public async selectDateRange(options: { start: SelectDateOptions; end: SelectDateOptions }): Promise<void> {
        await this.selectDateFromCalendar(options.start);
        await this.selectDateFromCalendar(options.end);
    }

    public selectMonth(locator: Locator, month: string | number, elementName?: string): Promise<string[]> {
        return this.locatorAction('selectMonth', locator, (loc) => loc.selectOption(typeof month === 'number' ? { index: month } : { label: month }), { elementName });
    }

    public selectYear(locator: Locator, year: string | number, elementName?: string): Promise<string[]> {
        return this.locatorAction('selectYear', locator, (loc) => loc.selectOption({ label: String(year) }), { elementName });
    }

    public async selectToday(calendar: CalendarLocators): Promise<void> {
        if (calendar.todayButton) {
            await this.click(calendar.todayButton);
            return;
        }

        const today = new Date();
        const day = calendar.day
            ? calendar.day(today.getDate())
            : this.activePage.getByRole('gridcell', { name: String(today.getDate()), exact: true });
        await this.click(day.first());
    }

    // =========================================================================
    // ELEMENT INFORMATION AND STATE
    // =========================================================================

    public getText(locator: Locator, elementName?: string): Promise<string> {
        return this.locatorAction('getText', locator, (loc) => loc.innerText(), { elementName });
    }

    public getInnerText(locator: Locator, elementName?: string): Promise<string> {
        return this.getText(locator, elementName);
    }

    public getTextContent(locator: Locator, elementName?: string): Promise<string | null> {
        return this.locatorAction('getTextContent', locator, (loc) => loc.textContent(), { elementName });
    }

    public getInputValue(locator: Locator, elementName?: string): Promise<string> {
        return this.locatorAction('getInputValue', locator, (loc) => loc.inputValue(), { elementName });
    }

    public getAttribute(locator: Locator, attribute: string, elementName?: string): Promise<string | null> {
        return this.locatorAction('getAttribute', locator, (loc) => loc.getAttribute(attribute), { elementName });
    }

    public getCssValue(locator: Locator, property: string, elementName?: string): Promise<string> {
        return this.locatorAction('getCssValue', locator, (loc) => loc.evaluate((element, cssProperty) => {
            return window.getComputedStyle(element).getPropertyValue(cssProperty);
        }, property), { elementName });
    }

    public getTagName(locator: Locator, elementName?: string): Promise<string> {
        return this.locatorAction('getTagName', locator, (loc) => loc.evaluate((element) => element.tagName.toLowerCase()), { elementName });
    }

    public getElementCount(locator: Locator): Promise<number> {
        return this.action('getElementCount', () => locator.count(), { readOnly: true });
    }

    public getElementBoundingBox(locator: Locator, elementName?: string): ReturnType<Locator['boundingBox']> {
        return this.locatorAction('getElementBoundingBox', locator, (loc) => loc.boundingBox(), { elementName });
    }

    public async getElementDescription(locator: Locator, elementName?: string): Promise<string> {
        return this.locatorAction('getElementDescription', locator, (loc) => loc.evaluate((element) => {
            const htmlElement = element as HTMLElement;
            const id = htmlElement.id ? `#${htmlElement.id}` : '';
            const className = htmlElement.getAttribute('class');
            const classes = className ? `.${className.trim().split(/\s+/).join('.')}` : '';
            const name = htmlElement.getAttribute('name');
            const namePart = name ? `[name="${name}"]` : '';
            const text = htmlElement.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60) ?? '';
            return `${htmlElement.tagName.toLowerCase()}${id}${classes}${namePart} ${text}`.trim();
        }), { elementName });
    }

    public getAllTextContents(locator: Locator, elementName?: string): Promise<string[]> {
        return this.locatorAction('getAllTextContents', locator, (loc) => loc.allTextContents(), { elementName });
    }

    public isVisible(locator: Locator): Promise<boolean> {
        return locator.isVisible();
    }

    public isEnabled(locator: Locator): Promise<boolean> {
        return locator.isEnabled();
    }

    public isChecked(locator: Locator): Promise<boolean> {
        return locator.isChecked();
    }

    public isEditable(locator: Locator): Promise<boolean> {
        return locator.isEditable();
    }

    public async isDisabled(locator: Locator): Promise<boolean> {
        return locator.isDisabled();
    }

    public async isPresent(locator: Locator): Promise<boolean> {
        return (await locator.count()) > 0;
    }

    // =========================================================================
    // WAITS (Playwright + Selenium-style Explicit Waits)
    // =========================================================================

    public waitForVisible(locator: Locator, options?: LocatorWaitForOptions, elementName?: string): Promise<void> {
        return this.locatorAction('waitForVisible', locator, (loc) => loc.waitFor({ ...options, state: 'visible' }), { elementName });
    }

    public waitForHidden(locator: Locator, options?: LocatorWaitForOptions, elementName?: string): Promise<void> {
        return this.locatorAction('waitForHidden', locator, (loc) => loc.waitFor({ ...options, state: 'hidden' }), { elementName });
    }

    public waitForAttached(locator: Locator, options?: LocatorWaitForOptions, elementName?: string): Promise<void> {
        return this.locatorAction('waitForAttached', locator, (loc) => loc.waitFor({ ...options, state: 'attached' }), { elementName });
    }

    public waitForDetached(locator: Locator, options?: LocatorWaitForOptions, elementName?: string): Promise<void> {
        return this.locatorAction('waitForDetached', locator, (loc) => loc.waitFor({ ...options, state: 'detached' }), { elementName });
    }

    public waitForElement(locator: Locator, options?: LocatorWaitForOptions, elementName?: string): Promise<void> {
        return this.waitForVisible(locator, options, elementName);
    }

    /** Selenium-style: waits until element is visible (default 10s). */
    public async waitForElementVisible(locator: Locator, timeoutSeconds: number = 10, elementName?: string): Promise<void> {
        await this.waitForVisible(locator, { timeout: timeoutSeconds * 1000 }, elementName);
    }

    /** Selenium-style: waits until element is visible and enabled/clickable (default 10s). */
    public async waitForElementClickable(locator: Locator, timeoutSeconds: number = 10, elementName?: string): Promise<void> {
        return this.locatorAction('waitForElementClickable', locator, async (loc) => {
            const timeout = timeoutSeconds * 1000;
            await loc.waitFor({ state: 'visible', timeout });
            await expect(loc).toBeEnabled({ timeout });
        }, { elementName });
    }

    /** Selenium-style: waits until element is attached in DOM (default 10s). */
    public async waitForElementPresent(locator: Locator, timeoutSeconds: number = 10, elementName?: string): Promise<void> {
        await this.waitForAttached(locator, { timeout: timeoutSeconds * 1000 }, elementName);
    }

    /** Selenium-style: waits until element becomes hidden/invisible (default 10s). */
    public async waitForElementInvisible(locator: Locator, timeoutSeconds: number = 10, elementName?: string): Promise<void> {
        await this.waitForHidden(locator, { timeout: timeoutSeconds * 1000 }, elementName);
    }

    /** Selenium-style: waits until expected text is present inside element (default 10s). */
    public async waitForTextPresent(locator: Locator, expectedText: string, timeoutSeconds: number = 10, elementName?: string): Promise<void> {
        await this.waitForText(locator, expectedText, { timeout: timeoutSeconds * 1000 }, elementName);
    }

    /** Selenium-style: waits until document load completes (default 20s). */
    public async waitForPageToLoad(timeoutSeconds: number = 20): Promise<void> {
        await this.activePage.waitForLoadState('load', { timeout: timeoutSeconds * 1000 });
        this.logger?.info('Page loaded successfully.');
    }

    /** Selenium-style: waits for network idle and full page load (default 15s). */
    public async waitForFullPageLoad(timeoutSeconds: number = 15): Promise<void> {
        const timeout = timeoutSeconds * 1000;
        await this.activePage.waitForLoadState('networkidle', { timeout }).catch(() => undefined);
        await this.activePage.waitForLoadState('load', { timeout });
        this.logger?.info('Full page load completed.');
    }

    public waitForURL(url: string | RegExp | ((url: URL) => boolean), options?: PageWaitForURLOptions): Promise<void> {
        return this.action('waitForURL', () => this.activePage.waitForURL(url, options), { readOnly: true, elementName: 'Page URL' });
    }

    public waitForLoadState(state?: Parameters<Page['waitForLoadState']>[0], options?: PageWaitForLoadStateOptions): Promise<void> {
        return this.action('waitForLoadState', () => this.activePage.waitForLoadState(state, options), { readOnly: true, elementName: 'Page load state' });
    }

    public async waitForAjaxToComplete(timeoutSeconds: number = 15): Promise<void> {
        try {
            await this.activePage.waitForFunction(
                () => document.readyState === 'complete',
                undefined,
                { timeout: timeoutSeconds * 1000 }
            );
            await this.activePage.waitForFunction(
                () => {
                    const jq = (window as unknown as { jQuery?: { active: number } }).jQuery;
                    return !jq || jq.active === 0;
                },
                undefined,
                { timeout: timeoutSeconds * 1000 }
            );
        } catch {
            this.logger?.warn('AJAX completion wait timed out; continuing');
        }
    }

    public async waitForFunction<T>(callback: () => T, options?: { timeout?: number; polling?: number | 'raf' }): Promise<T> {
        const handle = await this.activePage.waitForFunction(callback, undefined, options);
        return handle.jsonValue() as Promise<T>;
    }

    public async waitForText(
        locator: Locator,
        expectedText: string | RegExp | Array<string | RegExp>,
        options?: { timeout?: number },
        elementName?: string
    ): Promise<void> {
        return this.locatorAction('waitForText', locator, async (loc) => {
            await expect(loc).toContainText(expectedText, { timeout: options?.timeout });
        }, { elementName });
    }

    public async waitForAttribute(
        locator: Locator,
        attribute: string,
        value: string | RegExp,
        options?: { timeout?: number },
        elementName?: string
    ): Promise<void> {
        return this.locatorAction('waitForAttribute', locator, async (loc) => {
            await expect(loc).toHaveAttribute(attribute, value, { timeout: options?.timeout });
        }, { elementName });
    }

    public waitForResponse(urlOrPredicate: ResponseMatcher, options?: { timeout?: number }): Promise<Response> {
        return this.activePage.waitForResponse(urlOrPredicate, options);
    }

    public waitForRequest(urlOrPredicate: RequestMatcher, options?: { timeout?: number }): Promise<Request> {
        return this.activePage.waitForRequest(urlOrPredicate, options);
    }

    public waitForPopup(options?: { timeout?: number }): Promise<Page>;
    public waitForPopup(page: Page, triggerAction: () => Promise<void>): Promise<Page>;
    public async waitForPopup(
        pageOrOptions?: Page | { timeout?: number },
        triggerAction?: () => Promise<void>
    ): Promise<Page> {
        if (this.isPage(pageOrOptions)) {
            if (!triggerAction) throw new UIException('waitForPopup(page, triggerAction) requires a trigger action.');
            const popupPromise = pageOrOptions.waitForEvent('popup');
            await triggerAction();
            return popupPromise;
        }
        return this.activePage.waitForEvent('popup', pageOrOptions);
    }

    public waitForNewPage(options?: { timeout?: number }): Promise<Page>;
    public waitForNewPage(context: BrowserContext, triggerAction: () => Promise<void>): Promise<Page>;
    public async waitForNewPage(
        contextOrOptions?: BrowserContext | { timeout?: number },
        triggerAction?: () => Promise<void>
    ): Promise<Page> {
        if (this.isBrowserContext(contextOrOptions)) {
            if (!triggerAction) throw new UIException('waitForNewPage(context, triggerAction) requires a trigger action.');
            const pagePromise = contextOrOptions.waitForEvent('page');
            await triggerAction();
            return pagePromise;
        }
        return this.context.waitForEvent('page', contextOrOptions);
    }

    public waitForDownload(options?: { timeout?: number }): Promise<Download> {
        return this.activePage.waitForEvent('download', options);
    }

    public waitForFileChooser(options?: { timeout?: number }): Promise<FileChooser> {
        return this.activePage.waitForEvent('filechooser', options);
    }

    public waitForEvent<T = unknown>(eventName: string, options?: { timeout?: number }): Promise<T> {
        return this.activePage.waitForEvent(eventName as never, options as never) as Promise<T>;
    }

    public async waitUntil(condition: () => boolean | Promise<boolean>, options?: WaitUntilOptions): Promise<void> {
        const timeout = options?.timeout ?? this.defaultTimeout;
        const interval = options?.interval ?? 250;
        const start = Date.now();

        while (true) {
            if (await condition()) return;
            if (Date.now() - start >= timeout) {
                throw new UIException(options?.message ?? `waitUntil timed out after ${timeout}ms.`);
            }
            await this.activePage.waitForTimeout(interval);
        }
    }

    /** Java ActionDriver.waitForPageLoad: waits document.readyState complete, swallows timeout. */
    public async waitForPageLoad(timeoutSeconds: number): Promise<void> {
        try {
            await this.activePage.waitForLoadState('load', { timeout: timeoutSeconds * 1000 });
            this.logger?.debug(`Page loaded successfully (waitForPageLoad ${timeoutSeconds}s).`);
        } catch (error) {
            this.logger?.error(`Page did not load within ${timeoutSeconds} seconds. ${errorMessageLine(error)}`);
        }
    }

    /** Java ActionDriver.hardWait: unconditional pause. */
    public async hardWait(seconds: number): Promise<void> {
        await this.activePage.waitForTimeout(seconds * 1000);
        this.logger?.debug(`Hard wait of ${seconds} seconds completed`);
    }

    /** Java ActionDriver.isDisplayed(by, seconds): visibility probe returning false instead of throwing. */
    public async isVisibleWithin(locator: Locator, timeoutMs: number): Promise<boolean> {
        try {
            await locator.waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    // =========================================================================
    // SCROLL ACTIONS
    // =========================================================================

    public scrollToElement(locator: Locator, options?: Parameters<Locator['scrollIntoViewIfNeeded']>[0], elementName?: string): Promise<void> {
        return this.locatorAction('scrollToElement', locator, (loc) => loc.scrollIntoViewIfNeeded(options), { elementName });
    }

    public scrollToTop(): Promise<void> {
        return this.action('scrollToTop', () => this.activePage.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })), { elementName: 'Window top' });
    }

    public scrollToBottom(): Promise<void> {
        return this.action('scrollToBottom', () => this.activePage.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })), { elementName: 'Window bottom' });
    }

    public scrollByPixels(x: number, y: number): Promise<void> {
        return this.action('scrollByPixels', () => this.activePage.evaluate(({ deltaX, deltaY }) => window.scrollBy(deltaX, deltaY), { deltaX: x, deltaY: y }), { elementName: `Window (${x}, ${y})` });
    }

    public scrollInsideElement(locator: Locator, x: number, y: number, elementName?: string): Promise<void> {
        return this.locatorAction('scrollInsideElement', locator, (loc) => loc.evaluate((element, offset) => element.scrollBy(offset.x, offset.y), { x, y }), { elementName });
    }

    public scrollWithMouseWheel(deltaX: number, deltaY: number): Promise<void> {
        return this.mouseWheel(deltaX, deltaY);
    }

    // =========================================================================
    // FRAMES AND IFRAMES
    // =========================================================================

    public getFrameLocator(selector: string): FrameLocator {
        return this.activePage.frameLocator(selector);
    }

    public getFrameByName(name: string): Frame {
        const frame = this.activePage.frame({ name });
        if (!frame) throw new UIException(`Frame not found by name: ${name}`);
        return frame;
    }

    public getFrameByUrl(urlOrPredicate: UrlMatcher): Frame {
        const frame = this.activePage.frame({ url: urlOrPredicate });
        if (!frame) throw new UIException('Frame not found by URL.');
        return frame;
    }

    public async getFrameByLocator(locator: Locator, elementName?: string): Promise<Frame> {
        return this.locatorAction('getFrameByLocator', locator, async (loc) => {
            const handle = await loc.elementHandle();
            const frame = await handle?.contentFrame();
            if (!frame) throw new UIException('Frame not found by locator.');
            return frame;
        }, { elementName });
    }

    // =========================================================================
    // WINDOWS, TABS AND POPUPS (Playwright + Selenium-style Window Handling)
    // =========================================================================

    /** Returns the currently active Page (equivalent to driver.getWindowHandle()). */
    public getCurrentWindow(): Page {
        return this.activePage;
    }

    /** Returns all open Pages in the browser context (equivalent to driver.getWindowHandles()). */
    public getAllWindows(): Page[] {
        return this.context.pages();
    }

    /**
     * Switches to a child window/tab whose title contains `partialTitle`
     * (equivalent to ActionDriver.switchToChildWindowByTitles).
     */
    public async switchToChildWindowByTitle(partialTitle: string, timeoutMs: number = 10_000): Promise<Page> {
        const parentPage = this.activePage;
        const deadline = Date.now() + timeoutMs;

        while (Date.now() < deadline) {
            for (const win of this.context.pages()) {
                if (win === parentPage || win.isClosed()) continue;

                await win.waitForLoadState('domcontentloaded').catch(() => undefined);
                const title = await win.title().catch(() => '');
                if (title.includes(partialTitle)) {
                    await win.bringToFront();
                    this.activePage = win;
                    this.logger?.info(`Switched to child window successfully. Title: ${title}`);
                    return win;
                }
            }
            await this.page.waitForTimeout(250);
        }

        throw new UIException(`Child window not found with title containing: "${partialTitle}"`);
    }

    /**
     * Switches to a window/tab by 0-based index
     * (equivalent to ActionDriver.switchToWindowByIndex).
     */
    public async switchToWindowByIndex(index: number): Promise<Page> {
        const pages = this.context.pages();
        if (index < 0 || index >= pages.length) {
            throw new UIException(`Window index out of bounds: ${index} (total open: ${pages.length})`);
        }
        const target = pages[index];
        await target.bringToFront();
        this.activePage = target;
        this.logger?.info(`Switched to window at index: ${index}`);
        return target;
    }

    /**
     * Closes the active child window and returns focus to `parentPage`
     * (equivalent to ActionDriver.closeChildAndReturnToParent).
     */
    public async closeChildAndReturnToParent(parentPage: Page = this.page): Promise<Page> {
        if (this.activePage !== parentPage && !this.activePage.isClosed()) {
            await this.activePage.close();
            this.logger?.info('Closed child window.');
        }
        await parentPage.bringToFront();
        this.activePage = parentPage;
        this.logger?.info('Switched back to parent window.');
        return parentPage;
    }

    /**
     * Closes all open windows/tabs except `parentPage`
     * (equivalent to ActionDriver.closeAllWindowsExcept).
     */
    public async closeAllWindowsExcept(parentPage: Page = this.page): Promise<void> {
        for (const win of this.context.pages()) {
            if (win !== parentPage && !win.isClosed()) {
                await win.close();
                this.logger?.info(`Closed window: ${win.url()}`);
            }
        }
        await parentPage.bringToFront();
        this.activePage = parentPage;
        this.logger?.info('All child windows closed, switched to parent.');
    }

    public getAllPages(context: BrowserContext = this.context): Page[] {
        return context.pages();
    }

    public getPopupTitle(popup: Page): Promise<string> {
        return popup.title();
    }

    public waitForPopupURL(popup: Page, url: string | RegExp): Promise<void> {
        return popup.waitForURL(url);
    }

    public async closePopup(popup: Page): Promise<void> {
        if (!popup.isClosed()) await popup.close();
    }

    public async closeAllPagesExcept(context: BrowserContext, pageToKeep: Page): Promise<void> {
        for (const openPage of context.pages()) {
            if (openPage !== pageToKeep && !openPage.isClosed()) {
                await openPage.close();
            }
        }
        await pageToKeep.bringToFront();
        this.activePage = pageToKeep;
    }

    public async getPageByTitle(context: BrowserContext, title: string | RegExp): Promise<Page> {
        for (const openPage of context.pages()) {
            const pageTitle = await openPage.title();
            const matches = typeof title === 'string' ? pageTitle === title : title.test(pageTitle);
            if (matches) return openPage;
        }
        throw new UIException(`Page not found by title: ${String(title)}`);
    }

    public async getPageByUrl(context: BrowserContext, url: string | RegExp): Promise<Page> {
        for (const openPage of context.pages()) {
            const pageUrl = openPage.url();
            const matches = typeof url === 'string' ? pageUrl === url : url.test(pageUrl);
            if (matches) return openPage;
        }
        throw new UIException(`Page not found by URL: ${String(url)}`);
    }

    // =========================================================================
    // ALERTS AND DIALOGS
    // =========================================================================

    public handleDialog(page: Page, action: DialogAction, promptText?: string): void {
        page.once('dialog', (dialog) => {
            void this.resolveDialog(dialog, action, promptText).catch((error: unknown) => {
                this.logger?.error('Dialog handling failed.', { error: this.errorMetadata(error) });
            });
        });
    }

    public acceptDialog(page: Page): void {
        this.handleDialog(page, 'accept');
    }

    public dismissDialog(page: Page): void {
        this.handleDialog(page, 'dismiss');
    }

    public async getDialogMessage(page: Page, triggerAction: () => Promise<void>): Promise<string> {
        const dialogPromise = page.waitForEvent('dialog');
        await triggerAction();
        const dialog = await dialogPromise;
        const message = dialog.message();
        await dialog.dismiss();
        return message;
    }

    public async acceptPrompt(page: Page, text: string, triggerAction: () => Promise<void>): Promise<void> {
        const dialogPromise = page.waitForEvent('dialog');
        await triggerAction();
        const dialog = await dialogPromise;
        await dialog.accept(text);
    }

    // =========================================================================
    // BROWSER NAVIGATION
    // =========================================================================

    public navigateToUrl(page: Page, url: string, options?: PageGotoOptions): Promise<Response | null> {
        return this.action('navigateToUrl', () => page.goto(url, options), { elementName: 'Page URL' });
    }

    public refreshPage(page: Page, options?: PageGotoOptions): Promise<Response | null> {
        return this.action('refreshPage', () => page.reload(options), { elementName: 'Page reload' });
    }

    public navigateBack(page: Page, options?: PageGotoOptions): Promise<Response | null> {
        return this.action('navigateBack', () => page.goBack(options), { elementName: 'Browser back' });
    }

    public navigateForward(page: Page, options?: PageGotoOptions): Promise<Response | null> {
        return this.action('navigateForward', () => page.goForward(options), { elementName: 'Browser forward' });
    }

    public getCurrentURL(page: Page = this.activePage): string {
        return page.url();
    }

    public getPageTitle(page: Page = this.activePage): Promise<string> {
        return page.title();
    }

    public setViewportSize(page: Page, width: number, height: number): Promise<void> {
        return page.setViewportSize({ width, height });
    }

    public getViewportSize(page: Page): { width: number; height: number } | null {
        return page.viewportSize();
    }

    public clearCookies(context: BrowserContext = this.context): Promise<void> {
        return context.clearCookies();
    }

    // =========================================================================
    // EVENTS
    // =========================================================================

    public waitForConsoleMessage(
        page: Page,
        predicate?: (message: ConsoleMessage) => boolean | Promise<boolean>,
        options?: { timeout?: number }
    ): Promise<ConsoleMessage> {
        return page.waitForEvent('console', { predicate, timeout: options?.timeout });
    }

    public waitForPageError(
        page: Page,
        predicate?: (error: Error) => boolean | Promise<boolean>,
        options?: { timeout?: number }
    ): Promise<Error> {
        return page.waitForEvent('pageerror', { predicate, timeout: options?.timeout });
    }

    public waitForPageEvent<K extends keyof PageEventMap>(
        event: K,
        options?: { timeout?: number }
    ): Promise<PageEventMap[K]> {
        return this.activePage.waitForEvent(event as never, options as never) as Promise<PageEventMap[K]>;
    }

    public waitForContextEvent<K extends keyof ContextEventMap>(
        event: K,
        options?: { timeout?: number }
    ): Promise<ContextEventMap[K]> {
        return this.context.waitForEvent(event as never, options as never) as Promise<ContextEventMap[K]>;
    }

    public registerPageEventListener<K extends keyof PageEventMap>(
        event: K,
        listener: (payload: PageEventMap[K]) => void | Promise<void>
    ): () => void {
        const wrapped = (payload: unknown): void => {
            void Promise.resolve(listener(payload as PageEventMap[K])).catch((error: unknown) => {
                this.logger?.error(`Page event listener failed: ${String(event)}`, { error: this.errorMetadata(error) });
            });
        };

        const entries = this.pageListenerWrappers.get(listener) ?? [];
        entries.push({ event, wrapped });
        this.pageListenerWrappers.set(listener, entries);
        this.activePage.on(event as never, wrapped as never);
        return () => this.removePageEventListener(event, listener);
    }

    public removePageEventListener<K extends keyof PageEventMap>(
        event: K,
        listener: (payload: PageEventMap[K]) => void | Promise<void>
    ): void {
        const entries = this.pageListenerWrappers.get(listener);
        const index = entries?.findIndex((entry) => entry.event === event) ?? -1;
        if (entries && index >= 0) {
            this.activePage.off(entries[index].event as never, entries[index].wrapped as never);
            entries.splice(index, 1);
            if (entries.length === 0) this.pageListenerWrappers.delete(listener);
            return;
        }
        this.activePage.off(event as never, listener as never);
    }

    public registerContextEventListener<K extends keyof ContextEventMap>(
        event: K,
        listener: (payload: ContextEventMap[K]) => void | Promise<void>
    ): () => void {
        const wrapped = (payload: unknown): void => {
            void Promise.resolve(listener(payload as ContextEventMap[K])).catch((error: unknown) => {
                this.logger?.error(`Context event listener failed: ${String(event)}`, { error: this.errorMetadata(error) });
            });
        };

        const entries = this.contextListenerWrappers.get(listener) ?? [];
        entries.push({ event, wrapped });
        this.contextListenerWrappers.set(listener, entries);
        this.context.on(event as never, wrapped as never);
        return () => this.removeContextEventListener(event, listener);
    }

    public removeContextEventListener<K extends keyof ContextEventMap>(
        event: K,
        listener: (payload: ContextEventMap[K]) => void | Promise<void>
    ): void {
        const entries = this.contextListenerWrappers.get(listener);
        const index = entries?.findIndex((entry) => entry.event === event) ?? -1;
        if (entries && index >= 0) {
            this.context.off(entries[index].event as never, entries[index].wrapped as never);
            entries.splice(index, 1);
            if (entries.length === 0) this.contextListenerWrappers.delete(listener);
            return;
        }
        this.context.off(event as never, listener as never);
    }

    // =========================================================================
    // NETWORK INTERCEPTION AND MOCKING
    // =========================================================================

    public async interceptRequest(page: Page, url: string | RegExp, handler: RouteHandler): Promise<() => Promise<void>> {
        await page.route(url, handler);
        this.logger?.debug(`Registered request intercept: ${String(url)}`);
        return () => page.unroute(url, handler);
    }

    public async interceptContextRequest(context: BrowserContext, url: string | RegExp, handler: RouteHandler): Promise<() => Promise<void>> {
        await context.route(url, handler);
        this.logger?.debug(`Registered context request intercept: ${String(url)}`);
        return () => context.unroute(url, handler);
    }

    public async mockResponse(page: Page, url: string | RegExp, response: MockResponseOptions): Promise<() => Promise<void>> {
        const handler: RouteHandler = async (route) => {
            const headers = { ...response.headers };
            let body = response.body;
            if (response.json !== undefined) {
                body = JSON.stringify(response.json);
                headers['content-type'] = response.contentType ?? 'application/json';
            } else if (response.contentType) {
                headers['content-type'] = response.contentType;
            }

            await route.fulfill({
                status: response.status ?? 200,
                headers,
                body
            });
        };

        await page.route(url, handler);
        return () => page.unroute(url, handler);
    }

    public async abortRequest(page: Page, url: string | RegExp, errorCode?: Parameters<Route['abort']>[0]): Promise<() => Promise<void>> {
        const handler: RouteHandler = (route) => route.abort(errorCode);
        await page.route(url, handler);
        return () => page.unroute(url, handler);
    }

    public continueRequest(route: Route, options?: Parameters<Route['continue']>[0]): Promise<void> {
        return route.continue(options);
    }

    public fulfillRoute(route: Route, response: Parameters<Route['fulfill']>[0]): Promise<void> {
        return route.fulfill(response);
    }

    public waitForApiResponse(page: Page, predicate: ResponseMatcher, options?: { timeout?: number }): Promise<Response> {
        return page.waitForResponse(predicate, options);
    }

    public async unrouteRequest(page: Page, url: string | RegExp, handler?: RouteHandler): Promise<void> {
        if (handler) {
            await page.unroute(url, handler);
        } else {
            await page.unroute(url);
        }
    }

    // =========================================================================
    // FILE CHOOSER, UPLOAD AND DOWNLOAD
    // =========================================================================

    public async uploadFile(locator: Locator, filePath: string, elementName?: string): Promise<void> {
        return this.locatorAction('uploadFile', locator, async (loc) => {
            if (this.fileUtils && !path.isAbsolute(filePath)) {
                await this.fileUtils.uploadFile(loc, filePath);
                return;
            }
            await loc.setInputFiles(filePath);
        }, { elementName });
    }

    public async uploadMultipleFiles(locator: Locator, filePaths: string[], elementName?: string): Promise<void> {
        return this.locatorAction('uploadMultipleFiles', locator, async (loc) => {
            if (this.fileUtils && filePaths.every((filePath) => !path.isAbsolute(filePath))) {
                await this.fileUtils.multipleFilesUpload(loc, filePaths);
                return;
            }
            await loc.setInputFiles(filePaths);
        }, { elementName });
    }

    public clearSelectedFiles(locator: Locator, elementName?: string): Promise<void> {
        return this.locatorAction('clearSelectedFiles', locator, (loc) => loc.setInputFiles([]), { elementName });
    }

    public async uploadThroughFileChooser(
        page: Page,
        triggerAction: () => Promise<void>,
        filePaths: string | string[]
    ): Promise<void> {
        const chooserPromise = page.waitForEvent('filechooser');
        await triggerAction();
        const chooser = await chooserPromise;
        await chooser.setFiles(filePaths);
    }

    public async downloadFile(page: Page, triggerAction: () => Promise<void>): Promise<string> {
        const downloadPromise = page.waitForEvent('download');
        await triggerAction();
        const download = await downloadPromise;

        if (!this.fileUtils) {
            const tempPath = await download.path();
            if (!tempPath) throw new UIException('Download completed but no local path is available.');
            return tempPath;
        }

        const destination = path.join(
            this.fileUtils.getDownloadPath(),
            `${randomUUID().slice(0, 8)}_${download.suggestedFilename()}`
        );
        await download.saveAs(destination);
        return destination;
    }

    // =========================================================================
    // SPECIAL OMS UI COMPONENTS
    // =========================================================================

    public async waitForToast(locator: Locator, options?: { timeout?: number }, elementName?: string): Promise<string> {
        return this.locatorAction('waitForToast', locator, async (loc) => {
            await loc.waitFor({ state: 'visible', timeout: options?.timeout ?? this.defaultTimeout });
            return loc.innerText();
        }, { elementName });
    }

    public async closeToast(closeLocator: Locator, toastLocator: Locator): Promise<void> {
        await this.click(closeLocator);
        await this.waitForHidden(toastLocator, { timeout: this.defaultTimeout });
    }

    public waitForToastToDisappear(locator: Locator, options?: { timeout?: number }): Promise<void> {
        return this.waitForHidden(locator, { timeout: options?.timeout });
    }

    /**
     * Java ActionDriver.toastWaitAndClose: wait toast visible, click it,
     * wait hidden; JS-click fallback; never throws (toast may auto-dismiss).
     */
    public async toastWaitAndClose(locator: Locator): Promise<void> {
        try {
            await locator.waitFor({ state: 'visible', timeout: 5_000 });
            await this.click(locator);
            await locator.waitFor({ state: 'hidden', timeout: 5_000 });
            this.logger?.info('Toast closed successfully.');
        } catch {
            try {
                await this.clickUsingJS(locator);
                await locator.waitFor({ state: 'hidden', timeout: 3_000 });
                this.logger?.info('Toast closed using JS and became invisible.');
            } catch {
                this.logger?.info('Toast auto-dismissed before interaction');
            }
        }
    }

    public async clickRowAction(row: Locator, action: Locator): Promise<void> {
        await this.scrollToElement(row);
        await this.click(action);
    }

    public clickButtonInRow(row: Locator, button: Locator): Promise<void> {
        return this.clickRowAction(row, button);
    }

    public async selectFromDynamicList(listLocator: Locator, expectedText: string): Promise<void> {
        const option = listLocator.getByText(expectedText, { exact: false }).first();
        await option.waitFor({ state: 'visible', timeout: this.defaultTimeout });
        await this.click(option);
    }

    public waitForModal(modalLocator: Locator, options?: { timeout?: number }): Promise<void> {
        return this.waitForVisible(modalLocator, { timeout: options?.timeout });
    }

    public async closeModal(modalLocator: Locator, closeLocator: Locator): Promise<void> {
        await this.click(closeLocator);
        await this.waitForHidden(modalLocator);
    }

    public async waitForLoaderToDisappear(loaderLocator: Locator, options?: { timeout?: number }): Promise<void> {
        await this.waitForHidden(loaderLocator, { timeout: options?.timeout ?? this.defaultTimeout });
    }

    // =========================================================================
    // DEBUG UTILITIES
    // =========================================================================

    public highlightElement(locator: Locator, options?: HighlightOptions, elementName?: string): Promise<void> {
        return this.locatorAction('highlightElement', locator, (loc) => loc.evaluate(async (element, highlight) => {
            const htmlElement = element as HTMLElement;
            const previousOutline = htmlElement.style.outline;
            htmlElement.style.outline = `${highlight.width ?? '2px'} solid ${highlight.color ?? 'red'}`;
            await new Promise((resolve) => setTimeout(resolve, highlight.duration ?? 500));
            htmlElement.style.outline = previousOutline;
        }, options ?? {}), { elementName });
    }

    public captureElementScreenshot(locator: Locator, options?: LocatorScreenshotOptions, elementName?: string): Promise<Buffer> {
        return this.locatorAction('captureElementScreenshot', locator, (loc) => loc.screenshot(options), { elementName });
    }

    public capturePageScreenshot(page: Page, options?: Parameters<Page['screenshot']>[0]): Promise<Buffer> {
        return page.screenshot(options);
    }

    public getBoundingBox(locator: Locator, elementName?: string): ReturnType<Locator['boundingBox']> {
        return this.locatorAction('getBoundingBox', locator, (loc) => loc.boundingBox(), { elementName });
    }

    public async getElementSize(locator: Locator, elementName?: string): Promise<{ width: number; height: number } | null> {
        return this.locatorAction('getElementSize', locator, async (loc) => {
            const box = await loc.boundingBox();
            return box ? { width: box.width, height: box.height } : null;
        }, { elementName });
    }

    // =========================================================================
    // INTERNAL HELPERS
    // =========================================================================

    private isPage(value: unknown): value is Page {
        return typeof value === 'object' && value !== null && 'goto' in value && 'waitForEvent' in value && !('pages' in value);
    }

    private isBrowserContext(value: unknown): value is BrowserContext {
        return typeof value === 'object' && value !== null && 'pages' in value && 'newPage' in value;
    }

    /** For non-locator actions (like pressing a keyboard key globally) */
    private async action<T>(name: string, run: () => Promise<T>, options: ActionExecutionOptions = {}): Promise<T> {
        const context = this.createActionContext(name, undefined, options);
        const logLifecycle = !context.readOnly && options.logSuccess !== false;

        if (logLifecycle) {
            this.logActionStart(context);
        }

        try {
            const result = await run();
            if (logLifecycle) {
                this.logActionPassed(context, Date.now() - context.startTime);
            }
            return result;
        } catch (error) {
            this.logActionFailure(context, error, Date.now() - context.startTime, {
                attempted: false,
                recoveryErrors: []
            });
            throw error;
        }
    }

    /**
     * Wrapper for every locator action. It applies the DOM click fallback when
     * requested and records the failure context before rethrowing the original
     * Playwright error.
     */
    private async locatorAction<T>(
        name: string,
        locator: Locator,
        run: (loc: Locator) => Promise<T>,
        options: LocatorActionExecutionOptions<T> = {}
    ): Promise<T> {
        const context = this.createActionContext(name, locator, options);
        const logLifecycle = !context.readOnly && options.logSuccess !== false;
        const originalLocator = context.locator ?? formatLocator(locator);

        if (logLifecycle) {
            this.logActionStart(context);
        }

        try {
            const result = await run(locator);
            if (logLifecycle) {
                this.logActionPassed(context, Date.now() - context.startTime);
            }
            return result;
        } catch (error) {
            let recoveryAttempted = false;
            const recoveryErrors: unknown[] = [];

            if (options.interceptFallback && isPointerInterceptionError(error)) {
                recoveryAttempted = true;
                const fallbackLabel = options.interceptFallbackLabel ?? 'DOM fallback.';
                this.logActionRetrying(context, error, reasonForError(error), fallbackLabel);

                try {
                    const result = await options.interceptFallback(locator);
                    this.logActionRecovered(
                        context,
                        originalLocator,
                        `${originalLocator} (${fallbackLabel.replace(/\.$/, '')})`,
                        fallbackLabel,
                        Date.now() - context.startTime
                    );
                    return result;
                } catch (fallbackError) {
                    recoveryErrors.push(fallbackError);
                }
            }

            this.logActionFailure(context, error, Date.now() - context.startTime, {
                attempted: recoveryAttempted,
                recoveryErrors
            });
            throw error;
        }
    }

    private createActionContext(
        actionName: string,
        locator: Locator | undefined,
        options: ActionExecutionOptions
    ): ActionExecutionContext {
        const locatorText = locator ? formatLocator(locator) : undefined;
        const readOnly = options.readOnly ?? /^(?:get|is|waitFor)/i.test(actionName);
        const actionPage = locator ? this.safeLocatorPage(locator) : undefined;

        return {
            actionName,
            elementName: options.elementName?.trim() || locatorText || actionName,
            locator: locatorText,
            source: this.logger ? captureActionSource() : {},
            startTime: Date.now(),
            readOnly,
            url: this.safeCurrentUrl(actionPage)
        };
    }

    private logActionStart(context: ActionExecutionContext): void {
        const lines = [
            '',
            '='.repeat(60),
            '[UI ACTION STARTED]',
            '='.repeat(60),
            '',
            `Action      : ${this.actionLabel(context)}`,
            `Element     : ${context.elementName}`,
            `Locator     : ${context.locator ?? 'N/A'}`,
            ...(context.source.className ? [`Page Class  : ${context.source.className}`] : []),
            '',
            '='.repeat(60),
            ''
        ];
        this.logger?.info(lines.join('\n'));
    }

    private logActionPassed(context: ActionExecutionContext, duration: number): void {
        const lines = [
            '',
            '[UI ACTION PASSED]',
            `Action      : ${this.actionLabel(context)}`,
            `Element     : ${context.elementName}`,
            `Duration    : ${duration}ms`,
            ...(context.source.className ? [`Page Class  : ${context.source.className}`] : []),
            ...(context.source.method ? [`Method      : ${context.source.method}`] : []),
            ''
        ];
        this.logger?.info(lines.join('\n'));
    }

    private logActionRetrying(
        context: ActionExecutionContext,
        error: unknown,
        reason: string,
        recovery: string
    ): void {
        const lines = [
            '',
            '='.repeat(60),
            '[UI ACTION RETRYING]',
            '='.repeat(60),
            '',
            `Action      : ${this.actionLabel(context)}`,
            `Element     : ${context.elementName}`,
            `Locator     : ${context.locator ?? 'N/A'}`,
            `Reason      : ${reason}`,
            `Recovery    : ${recovery}`,
            '',
            'Original error:',
            errorMessageLine(error),
            '',
            'Original Playwright stack trace:',
            errorStack(error),
            '',
            '='.repeat(60),
            ''
        ];
        this.logger?.warn(lines.join('\n'));
    }

    private logActionRecovered(
        context: ActionExecutionContext,
        originalLocator: string,
        recoveredLocator: string,
        recovery: string,
        duration: number
    ): void {
        const lines = [
            '',
            '='.repeat(60),
            '[UI ACTION RECOVERED]',
            '='.repeat(60),
            '',
            `Action           : ${this.actionLabel(context)}`,
            `Element          : ${context.elementName}`,
            `Original locator : ${originalLocator}`,
            `Recovered locator: ${recoveredLocator}`,
            `Recovery         : ${recovery}`,
            'Status           : SUCCESS',
            `Duration         : ${duration}ms`,
            ...(context.source.className ? [`Page Class       : ${context.source.className}`] : []),
            ...(context.source.method ? [`Method           : ${context.source.method}`] : []),
            '',
            '='.repeat(60),
            ''
        ];
        this.logger?.info(lines.join('\n'));
    }

    private logActionFailure(
        context: ActionExecutionContext,
        error: unknown,
        duration: number,
        recovery: {
            attempted: boolean;
            recoveryErrors: unknown[];
        }
    ): void {
        if (!this.logger) {
            return;
        }

        const sourceLocation = formatSourceLocation(context.source);
        const lines = [
            '',
            '='.repeat(60),
            '                    UI ACTION FAILED',
            '='.repeat(60),
            '',
            `Action       : ${this.actionLabel(context)}`,
            `Element      : ${context.elementName}`,
            `Locator      : ${context.locator ?? 'N/A'}`,
            `Page Class   : ${context.source.className ?? 'Source location unavailable'}`,
            `Method       : ${context.source.method ?? 'Source location unavailable'}`,
            `Current URL  : ${this.safeCurrentUrl()}`,
            '',
            `Duration     : ${duration}ms`,
            '',
            `Error        : ${errorMessageLine(error)}`,
            '',
            `Reason       : ${reasonForError(error)}`,
            '',
            'FAILED SOURCE:',
            '',
            formatSourceFrame(context.source),
            '',
            'ORIGINAL PLAYWRIGHT STACK TRACE:',
            '',
            errorStack(error),
            '',
            'RECOVERY:',
            '',
            `Attempted          : ${recovery.attempted ? 'YES' : 'NO'}`,
            `Original locator   : ${context.locator ?? 'N/A'}`,
            `Source location    : ${sourceLocation}`,
            `Final action status: FAILED`,
            ''
        ];

        if (recovery.recoveryErrors.length > 0) {
            recovery.recoveryErrors.forEach((recoveryError, index) => {
                lines.push(`Recovery error ${index + 1}:`);
                lines.push(errorMessageLine(recoveryError));
                lines.push('');
                lines.push(`Recovery stack ${index + 1}:`);
                lines.push(errorStack(recoveryError));
                lines.push('');
            });
        }

        lines.push('='.repeat(60));
        lines.push('');

        this.logger.error(lines.join('\n'));
    }

    private actionLabel(context: ActionExecutionContext): string {
        return context.actionName.toUpperCase();
    }

    private safeCurrentUrl(page: Page = this.activePage): string {
        try {
            if (page.isClosed()) {
                return 'URL unavailable (page closed)';
            }
            return page.url();
        } catch {
            return 'URL unavailable';
        }
    }

    private safeLocatorPage(locator: Locator): Page | undefined {
        try {
            return locator.page();
        } catch {
            return undefined;
        }
    }

    private async resolveDialog(dialog: Dialog, action: DialogAction, promptText?: string): Promise<void> {
        if (action === 'accept') {
            await dialog.accept(promptText);
            return;
        }
        await dialog.dismiss();
    }

    private parseDate(value: string | Date): Date {
        const parsed = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            throw new UIException(`Invalid date value: ${String(value)}`);
        }
        return parsed;
    }

    private toDateInputValue(value: string | Date): string {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }
        return this.parseDate(value).toISOString().slice(0, 10);
    }

    private async readCurrentMonthYear(calendar: CalendarLocators): Promise<{ month: number; year: number }> {
        const monthText = (await calendar.monthLabel?.textContent())?.trim() ?? '';
        const yearText = (await calendar.yearLabel?.textContent())?.trim() ?? '';
        const yearMatch = `${yearText} ${monthText}`.match(/\d{4}/);
        const year = yearMatch ? Number(yearMatch[0]) : new Date().getFullYear();
        const monthName = monthText.replace(/\d{4}/, '').trim();
        const parsed = new Date(`${monthName} 1, ${year}`);

        if (Number.isNaN(parsed.getTime())) {
            throw new UIException(`Unable to parse calendar month/year from: "${monthText} ${yearText}"`);
        }
        return { month: parsed.getMonth(), year: parsed.getFullYear() };
    }

    private escapeRegExp(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private errorMetadata(error: unknown): Record<string, unknown> {
        if (error instanceof Error) {
            return { name: error.name, message: error.message, stack: error.stack };
        }
        return { message: String(error) };
    }
}