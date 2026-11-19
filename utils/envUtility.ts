import type { ModuleConfig } from '../pages/Modules/ModuleConfig/ModuleConfig';
import type { FileUtility } from './FileUtility';

export class EnvUtility {
    constructor(private readonly fileUtils: FileUtility) { }

    public async getEnvValue(key: string): Promise<string | undefined> {
        const fromFile = await this.fileUtils.getDynamicEnvValue(key);
        const value = fromFile ?? this.fileUtils.getEnvValue(key);
        return value?.trim() || undefined;
    }

    public async requiredEnvValue(key: string): Promise<string> {
        const value = await this.getEnvValue(key);
        if (value === undefined) {
            throw new Error(`Required .env key "${key}" is missing or empty.`);
        }
        return value;
    }

    public async getModuleEnvValue(
        module: ModuleConfig,
        suffix: string,
        fallbackKeys: string[] = [],
    ): Promise<string | undefined> {
        const keys = [
            `${module.code}${suffix}`,
            ...(module.code === 'TANK' ? [`Tank${suffix}`] : []),
            `${module.code}_${suffix}`,
            ...fallbackKeys,
        ];

        for (const key of [...new Set(keys)]) {
            const value = await this.getEnvValue(key);
            if (value !== undefined) return value;
        }
        return undefined;
    }

    public async requiredModuleEnvValue(
        module: ModuleConfig,
        suffix: string,
        fallbackKeys: string[] = [],
    ): Promise<string> {
        const value = await this.getModuleEnvValue(module, suffix, fallbackKeys);
        if (value === undefined) {
            throw new Error(
                `Required value for module ${module.code} is missing. Checked: ${[
                    `${module.code}${suffix}`,
                    ...(module.code === 'TANK' ? [`Tank${suffix}`] : []),
                    ...fallbackKeys,
                ].join(', ')}.`,
            );
        }
        return value;
    }

    public async writeModuleEnvValue(
        module: ModuleConfig,
        suffix: string,
        value: string,
    ): Promise<void> {
        await this.fileUtils.writeToEnvFile(`${module.code}${suffix}`, value);
    }
}
