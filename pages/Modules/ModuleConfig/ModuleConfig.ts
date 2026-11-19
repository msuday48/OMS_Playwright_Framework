/**
 * TypeScript conversion of the Java ModuleConfig enum.
 *
 * IMPORTANT: Module codes, labels and process-standard option strings are
 * copied from the supplied Java enum. Do not normalize their wording.
 */

export interface ModuleDefinition {
    readonly moduleLabel: string;
    readonly processStandardOptions: readonly string[];
}

export const MODULE_CONFIGS = {
    MT: {
        moduleLabel: "MT - Magnetic Particle Testing",
        processStandardOptions: [
            "ASTM A105/A105M-20 (MT - colour contrast)",
            "AS 1171 - 1998 (Reconfirmed 2022) (MT - fluorescent)",
        ],
    },
    RT: {
        moduleLabel: "RT - Radiography Testing",
        processStandardOptions: [
            "AS 2177-2006 (R2016) (RT - Gamma)",
            "AS 2177-2006 (R2016) X-ray (RT - X-rays)",
        ],
    },
    UT: {
        moduleLabel: "UT - Ultrasonic Testing",
        processStandardOptions: [
            "AS 2207-2007 (R2017) (UT - weld)",
            "ISO 17640 - 2018 (UT - weld)",
        ],
    },
    PT: {
        moduleLabel: "PT - Penetrant Testing",
        processStandardOptions: [
            "AS ISO 3452.1:2021 (PT - colour contrast)",
            "AS ISO 3452.1:2021 (PT - fluorescent)",
        ],
    },
    PAUT: {
        moduleLabel: "PAUT - Phased Array Ultrasonic Testing",
        processStandardOptions: [
            "ASTM E3044/E3044M-22 (PAUT)",
        ],
    },
    ET: {
        moduleLabel: "ET - Eddy Current Testing",
        processStandardOptions: [
            "Eddy Current Testing - Manual Reporting Only (All techniques)",
        ],
    },
    VT: {
        moduleLabel: "VT - Visual Testing",
        processStandardOptions: [
            "ISO 17637 - 2019 (VT - weld test only)",
        ],
    },
    VI: {
        moduleLabel: "VI - Visual Inspection",
        processStandardOptions: [
            "AS 3978 - 2003 (R2022) (Inspection - fabrication (Visual inspection))",
        ],
    },
    HV: {
        moduleLabel: "HV - Hardness Vickers Test",
        processStandardOptions: [
            "AS 1817.1-2003 (R2017) (Vickers hardness test (ISO 6507-1:1997))",
        ],
    },
    HBW: {
        moduleLabel: "HBW - Hardness Brinell Test",
        processStandardOptions: [
            "AS 1816.1-2007 (R2017) (Brinell hardness test (ISO 6506-1:2005))",
        ],
    },
    HR: {
        moduleLabel: "HR - Hardness Rockwell Test",
        processStandardOptions: [
            "AS 1815.1-2007 (R2017) (Rockwell hardness test)",
        ],
    },
    HL: {
        moduleLabel: "HL - Hardness Leeb test",
        processStandardOptions: [
            "ASTM E956/A956M-22 (Leeb hardness test)",
        ],
    },
    TENSILE: {
        moduleLabel: "Tensile test",
        processStandardOptions: [
            "AS 1391:2020 (ISO 6892-1:2019) (Tensile test at room temperature)",
        ],
    },
    IMPACT: {
        moduleLabel: "Impact Test",
        processStandardOptions: [
            "AS 1544.2-2003 (R2017) (Impact test - CVN)",
            "ISO 148-1: 2016 (Impact test - CVN)",
        ],
    },
    CI: {
        moduleLabel: "CI - Coating Inspection",
        processStandardOptions: [
            "AS 1627.0-1997 (R2017) (Coating Inspection)",
        ],
    },
    CHEMICAL_ANALYSIS: {
        moduleLabel: "Chemical Analysis",
        processStandardOptions: [
            "ASTM E1086-14 (Chemical analysis by spark AES-OES)",
        ],
    },
    PMI: {
        moduleLabel: "PMI - Positive Material Identification",
        processStandardOptions: [
            "API RP 578: 2023 Edition 4 (PMI XRF Spectrometry)",
        ],
    },
    TOFD: {
        moduleLabel: "TOFD - Time-of-Flight Diffraction",
        processStandardOptions: [
            "ASTM E3044/E3044M-22 (TOFD)",
        ],
    },
    UTT: {
        moduleLabel: "UTT - Ultrasonic Thickness Testing",
        processStandardOptions: [
            "ISO 16809:2017(E) (UT thickness)",
        ],
    },
    RTT: {
        moduleLabel: "RTT - Radiography Testing Thickness",
        processStandardOptions: [
            "AS 2452.1 - 2004 (R2017) (Radiographic wall thickness measurement)",
        ],
    },
    LOAD: {
        moduleLabel: "Load Testing",
        processStandardOptions: [
            "Load test of products (Load test)",
        ],
    },
    PVI: {
        moduleLabel: "PVI - Pressure Vessel Inspection",
        processStandardOptions: [
            "AS 4037-1999 (R2016) Sec. 17 (Pressure test - hydrostatic)",
        ],
    },
    HYT: {
        moduleLabel: "Hydro Testing",
        processStandardOptions: [
            "AS 4037-1999 (R2016) Sec. 17 (Pressure test - hydrostatic)",
        ],
    },
    HYT_WIT: {
        moduleLabel: "Hydro Test Witnessing",
        processStandardOptions: [
            "AS 4037-1999 (R2016) (Witnessing of testing)",
        ],
    },
    VBT: {
        moduleLabel: "VBT - Vacuum bubble test",
        processStandardOptions: [
            "API STD 650-2020, 13th Edition (Sec 8.6 Vacuum bubble test)",
        ],
    },
    WS: {
        moduleLabel: "WS - Weld Supervision",
        processStandardOptions: [
            "AS/NZS 1554.1:2014 Cl.4.12.1 (Welding supervision)",
        ],
    },
    WPWQ_BEND: {
        moduleLabel: "WPWQ - Bend Testing",
        processStandardOptions: [
            "AS/NZS 2205.3.1:2020 (ISO 5173:2009) (Bend test)",
        ],
    },
    WPWQ_FRACTURE: {
        moduleLabel: "WPWQ - Fracture Testing",
        processStandardOptions: [
            "AS/NZS 2205.4.1:2019 (ISO 9017:2017) Cl 8.1 (Fracture test - nick break)",
        ],
    },
    WPWQ_FULL_TENSILE: {
        moduleLabel: "WPWQ - Full tensile testing",
        processStandardOptions: [
            "AS 2205.2.1-2003 (R2018) (Tensile test - transverse weld)",
        ],
    },
    WPWQ_HARDNESS: {
        moduleLabel: "WPWQ - Hardness Testing",
        processStandardOptions: [
            "ISO 9015.1 - 2011 (Hardness test - Vickers survey)",
        ],
    },
    WPWQ_IMPACT: {
        moduleLabel: "WPWQ - Impact Testing",
        processStandardOptions: [
            "ISO 148-1: 2016 (Impact test - CVN)",
        ],
    },
    WPWQ_MACRO: {
        moduleLabel: "WPWQ - Macro Testing",
        processStandardOptions: [
            "AS/NZS 2205.5.1:2019 (ISO 17639:2003) (Macro test - weld)",
        ],
    },
    WPWQ_RT: {
        moduleLabel: "WPWQ - Radiography Testing",
        processStandardOptions: [
            "ISO 17636.1 - 2013 - Class B - RT on WPWQ coupons (RT )",
        ],
    },
    WPWQ_TENSION: {
        moduleLabel: "WPWQ - Tension Testing",
        processStandardOptions: [
            "ISO 4136 - 2022 (Tensile test - transverse weld)",
        ],
    },
    WPWQ_VISUAL: {
        moduleLabel: "WPWQ - Visual Testing",
        processStandardOptions: [
            "ISO 17637 - 2016 ( Mech test ) (WPWQ Visual)",
        ],
    },
    WPWQ_WEB_TENSILE: {
        moduleLabel: "WPWQ - Web Tensile Testing",
        processStandardOptions: [
            "AS/NZS 3679.2:2016 Cl. 9 (Web-to-flange tensile test)",
        ],
    },
    WPWQ_REBAR: {
        moduleLabel: "WPWQ - Rebar Weld Shear Testing",
        processStandardOptions: [
            "ISO 15630-2:2019(E) (Section 7.1 Rebar weld shear test )",
        ],
    },
    CFT: {
        moduleLabel: "CFT - Cold Flattening Test",
        processStandardOptions: [
            "AS/NZS 1163-2016 (Cl.9.4.3 Cold flattening test)",
        ],
    },
    REBAR_TEN: {
        moduleLabel: "Rebar Tensile Test",
        processStandardOptions: [
            "AS/NZS 4671 Cl 7.2.2 :2019 (Clause C2 - Rebar tensile test)",
        ],
    },
    NPL: {
        moduleLabel: "NPL - Nut Proof Load Testing",
        processStandardOptions: [
            "ISO 2320 (Nut proof load test )",
        ],
    },
    OM: {
        moduleLabel: "OM - Ovality Measurement",
        processStandardOptions: [
            "AS/NZS 2885.1:2018 Cl.11.4.3 (Ovality measurement)",
        ],
    },
    LSI: {
        moduleLabel: "LSI - Lifting Systems Inspection",
        processStandardOptions: [
            "Client's requirements - Load test (Pull out test)",
        ],
    },
    HDPE_TEN: {
        moduleLabel: "HDPE-Ten - High Density Polyethylene",
        processStandardOptions: [
            "ISO 13953 : 2001 +AMD1:2020 (HDPE - Tensile test)",
        ],
    },
    PE_DECOHESION: {
        moduleLabel: "PE-Decohesion",
        processStandardOptions: [
            "ISO 13954:1997 +AMD1:2020 (HDPE - Peel Decohesion test)",
        ],
    },
    TANK: {
        moduleLabel: "TI - Tank Inspection",
        processStandardOptions: [
            "API 653:2014 (In service Inspection)",
        ],
    },
    TORQUE: {
        moduleLabel: "Torque Test",
        processStandardOptions: [
            "ASME BPVC IX-2023 (QW-192.1.3 - Torque test)",
        ],
    },
    GENERAL: {
        moduleLabel: "General Testing",
        processStandardOptions: [
            "As Per Client's Request (General)",
        ],
    },
} as const satisfies Record<string, ModuleDefinition>;

/** Union of the 47 module codes defined by the Java enum. */
export type ModuleCode = keyof typeof MODULE_CONFIGS;

/**
 * Runtime module record returned to page objects and module orchestration.
 * `name` is retained as a Java-enum compatibility alias for existing POMs
 * that previously read currentModule.name. New code should use `code`.
 */
export interface ModuleConfig extends ModuleDefinition {
    readonly code: ModuleCode;
    /** Java enum compatibility alias; new code should use `code`. */
    readonly name: ModuleCode;
}

export function isModuleCode(value: string): value is ModuleCode {
    return Object.prototype.hasOwnProperty.call(MODULE_CONFIGS, value);
}

/**
 * Enum-like runtime catalogue. It allows Java-style access such as
 * `ModuleConfig.PVI`, while preserving TypeScript's strongly typed values.
 */
export const ModuleConfig: Readonly<Record<ModuleCode, ModuleConfig>> = Object.freeze(
    Object.fromEntries(
        Object.entries(MODULE_CONFIGS).map(([rawCode, definition]) => {
            const code = rawCode as ModuleCode;
            return [code, Object.freeze({
                code,
                name: code,
                moduleLabel: definition.moduleLabel,
                processStandardOptions: Object.freeze([...definition.processStandardOptions]),
            })];
        }),
    ) as Record<ModuleCode, ModuleConfig>,
);

/** Resolves one module code into its complete configuration. */
export function getModuleConfig(value: string): ModuleConfig {
    const normalized = value.trim().toUpperCase();
    if (!isModuleCode(normalized)) {
        throw new Error(`Unsupported OMS module code "${value}".`);
    }
    return ModuleConfig[normalized];
}

/** Returns all supported module codes in the same order as the Java enum. */
export function getAllModuleCodes(): ModuleCode[] {
    return Object.keys(MODULE_CONFIGS) as ModuleCode[];
}
