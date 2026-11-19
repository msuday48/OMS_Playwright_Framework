/**
 * Test-scoped replacement for Java ModuleContext.
 *
 * Unlike Java ThreadLocal state, this class is instantiated once per
 * Playwright test fixture and shared through UiDependencies. It keeps the
 * complete selected module list while allowing the active module to change.
 */
import type { ModuleCode, ModuleConfig } from './ModuleConfig';

export class ModuleExecutionContext {
    private readonly selectedModules: readonly ModuleConfig[];
    private activeModuleCode?: ModuleCode;
    private disposed = false;

    constructor(modules: readonly ModuleConfig[]) {
        const copiedModules = [...modules];
        const seen = new Set<ModuleCode>();

        for (const module of copiedModules) {
            if (seen.has(module.code)) {
                throw new Error(`Duplicate module "${module.code}" supplied to ModuleExecutionContext.`);
            }
            seen.add(module.code);
        }

        this.selectedModules = Object.freeze(copiedModules);
        this.activeModuleCode = copiedModules[0]?.code;
    }

    /** Complete selected list; it does not change when activeModule changes. */
    public get modules(): readonly ModuleConfig[] {
        return this.selectedModules;
    }

    /** Compatibility alias for callers that prefer the explicit name. */
    public get selectedModuleConfigs(): readonly ModuleConfig[] {
        return this.selectedModules;
    }

    /** True only when more than one module was selected in .env. */
    public get isCombinedRun(): boolean {
        return this.selectedModules.length > 1;
    }

    /** Currently active module, or undefined when none is configured. */
    public get activeModule(): ModuleConfig | undefined {
        this.ensureNotDisposed();
        return this.selectedModules.find((module) => module.code === this.activeModuleCode);
    }

    /** Sets the active module without changing the full selected list. */
    public setActiveModule(code: ModuleCode): void {
        this.ensureNotDisposed();
        const selected = this.selectedModules.some((module) => module.code === code);
        if (!selected) {
            throw new Error(
                `Cannot activate module "${code}" because it is not in OMS_MODULES (${this.selectedModules.map((module) => module.code).join(', ') || 'empty'}).`,
            );
        }
        this.activeModuleCode = code;
    }

    /** Java ModuleContext.require() equivalent. */
    public require(): ModuleConfig {
        this.ensureNotDisposed();
        const current = this.activeModule;
        if (!current) {
            throw new Error(
                'No active OMS module is configured. Set OMS_MODULES in .env, for example OMS_MODULES=PVI.',
            );
        }
        return current;
    }

    /** Java ModuleContext.get() equivalent. */
    public get(): ModuleConfig | undefined {
        if (this.disposed) return undefined;
        return this.activeModule;
    }

    /** Java ModuleContext.getCombinedRunSet() equivalent. */
    public getCombinedRunSet(): readonly ModuleConfig[] {
        this.ensureNotDisposed();
        return this.selectedModules;
    }

    /** Java ModuleContext.isRegistered() equivalent. */
    public isRegistered(): boolean {
        return !this.disposed && this.activeModuleCode !== undefined;
    }

    /**
     * Fixture teardown equivalent to Java ModuleContext.clear().
     * The context is test-scoped; disposing it prevents accidental reuse.
     */
    public clear(): void {
        this.activeModuleCode = undefined;
        this.disposed = true;
    }

    private ensureNotDisposed(): void {
        if (this.disposed) {
            throw new Error('ModuleExecutionContext has been cleared during fixture teardown.');
        }
    }
}
