function addIndent(string, indent) {
    return string.split('\n').map((line) => `${indent}${line}`).join('\n');
}

export default function jsonFormat(value, indent = '  ') {
    if (Array.isArray(value)) {
        let res = '[\n';
        for (const item of value) {
            res += `${addIndent(jsonFormat(item, indent), indent)},\n`;
        }
        res += ']';
        return res;
    } else if (value !== null && typeof value === 'object') {
        let res = '{\n';
        for (const [key, item] of Object.entries(value)) {
            res += `${addIndent(`${key}: ${jsonFormat(item, indent)}`, indent)},\n`;
        }
        res += '}';
        return res;
    } else {
        return JSON.stringify(value);
    }
}
