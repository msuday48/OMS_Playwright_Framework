/**
 * Replaces the module-registration responsibility of Java Basemoduletest.
 * Reads the selected modules from the existing .env through FileUtility.
 *
 * `.env` selector:
 *   OMS_MODULES=PVI
 *   OMS_MODULES=PVI,TANK,LSI
 *
 * This class does not create workflows or modify .env values.
 */
import type { Logger } from '../../../utils/Logger';
import type { FileUtility } from '../../../utils/FileUtility';
import { getModuleConfig, getAllModuleCodes, isModuleCode, type ModuleConfig } from './ModuleConfig';

export class ModuleSelection {
    constructor(
        private readonly fileUtils: FileUtility,
        private readonly logger?: Logger,
    ) {}

    /**
     * Strict parser for an explicitly supplied module string.
     * Preserves selection order and rejects empty tokens, invalid codes,
     * and duplicate codes (including duplicates with different casing).
     */
    public parse(rawValue: string): ModuleConfig[] {
        if (!rawValue || !rawValue.trim()) {
            throw new Error(
                'OMS_MODULES is empty. Set it in .env, for example OMS_MODULES=PVI or OMS_MODULES=PVI,TANK,LSI.',
            );
        }

        const rawTokens = rawValue.split(',');
        const codes: string[] = [];
        const seen = new Set<string>();
        const supportedCodes = getAllModuleCodes();

        for (const rawToken of rawTokens) {
            const code = rawToken.trim().toUpperCase();
            if (!code) {
                throw new Error(
                    `OMS_MODULES contains an empty module entry: "${rawValue}". Remove extra commas.`,
                );
            }

            if (!isModuleCode(code)) {
                throw new Error(
                    `Invalid OMS module "${code}". Supported module codes: ${supportedCodes.join(', ')}.`,
                );
            }

            if (seen.has(code)) {
                throw new Error(`Duplicate OMS module "${code}" in OMS_MODULES=${rawValue}.`);
            }

            seen.add(code);
            codes.push(code);
        }

        const modules = codes.map((code) => getModuleConfig(code));
        this.logger?.info(
            `[MODULES] OMS_MODULES parsed successfully: ${modules.map((module) => module.code).join(', ')} (combinedRun=${modules.length > 1})`,
        );
        return modules;
    }

    /**
     * Loads OMS_MODULES from the project .env using the current FileUtility.
     * Empty selection is allowed only so non-module UI tests (for example
     * Common/Clients tests) can share uiFixture. Module POMs call context.require(),
     * which fails with a clear message if a module was not configured.
     */
    public async resolveSelectedModules(): Promise<ModuleConfig[]> {
        const fromEnvFile = await this.fileUtils.getDynamicEnvValue('OMS_MODULES');
        const fromProcessEnvironment = this.fileUtils.getEnvValue('OMS_MODULES');
        const rawValue = fromEnvFile ?? fromProcessEnvironment;

        if (!rawValue || !rawValue.trim()) {
            this.logger?.info(
                '[MODULES] OMS_MODULES is not configured. Creating an empty module context for a non-module test.',
            );
            return [];
        }

        return this.parse(rawValue);
    }
}
