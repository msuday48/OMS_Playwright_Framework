/** Escapes arbitrary text for safe use inside an XPath string literal. */
export function xpathLiteral(value: string): string {
    if (!value.includes("'")) return `'${value}'`;
    if (!value.includes('"')) return `"${value}"`;
    const parts = value.split("'");
    return `concat(${parts.map((part, index) => `${index ? `, "'", ` : ''}'${part}'`).join('')})`;
}
