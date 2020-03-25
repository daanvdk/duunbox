import { useContext, useCallback } from 'react';
import { LanguageContext } from '../component/Language';
import translations from '../translations';

const PARAM = /\{\{(.*?)\}\}/g;

const JOINERS = {
    en: (params) => (
        params.length == 1
        ? params[0]
        : `${params.slice(0, params.length - 2).join(', ')} and ${params[params.length - 1]}`
    ),
    nl: (params) => (
        params.length == 1
        ? params[0]
        : `${params.slice(0, params.length - 2).join(', ')} en ${params[params.length - 1]}`
    ),
};

function showParam(lang, param, transforms, namespace) {
    // Join arrays
    if (Array.isArray(param) && param.length > 0) {
        return JOINERS[lang](param.map((subparam) => showParam(lang, subparam, transforms, namespace)));
    }

    param = param.toString();

    for (const transform of transforms) {
        switch (transform) {
            case 'lower':
                param = param.toLowerCase();
                break;
            case 'upper':
                param = param.toUpperCase();
                break;
            case 'cap':
                if (param.length > 0) {
                    param = param.charAt(0).toUpperCase() + param.slice(1);
                }
                break;
            case 'trans':
                param = translate(lang, param, {}, namespace);
                break;
            default:
                throw new Error(`Unknown transform: ${transform}`);
        }
    }

    return param;
}

function translate(lang, key, params = {}, namespace) {
    if (namespace) {
        key = `${namespace}.${key}`;
    }

    // Lookup
    let template = translations[lang];
    const keys = key.split('.');

    for (let i = 0; i < keys.length; i++) {
        if (
            template === null ||
            template === undefined ||
            typeof template !== 'object'
        ) {
            return key;
        }
        if (
            i === keys.length - 1 &&

            template[`${keys[i]}_plural`] !== null &&
            template[`${keys[i]}_plural`] !== undefined &&
            typeof template[`${keys[i]}_plural`] === 'string' &&

            params.count !== null &&
            params.count !== undefined &&
            typeof params.count === 'number' &&
            params.count !== 1
        ) {
            template = template[`${keys[i]}_plural`];
        } else {
            template = template[keys[i]];
        }
    }

    if (typeof template !== 'string') {
        return key;
    }

    // Parse translation
    let pos = 0;
    let parts = [];

    while (true) {
        const match = PARAM.exec(template);
        if (!match) {
            break;
        }

        parts.push({ type: 'string', string: template.slice(pos, match.index) });
        pos = PARAM.lastIndex;

        const [param, ...transforms] = match[1].split('!');
        parts.push({ type: 'param', param, transforms });
    }

    parts.push({ type: 'string', string: template.slice(pos) });

    // Serialize value
    let res = '';
    for (const part of parts) {
        switch (part.type) {
            case 'string':
                res += part.string;
                break;

            case 'param':
                res += (
                    params[part.param] === undefined
                    ? `{{${part.param}}}` 
                    : showParam(lang, params[part.param], part.transforms, namespace)
                );
                break;

            default:
                throw new Error(`Unknown part type: ${part.type}`);
        }
    }
    return res;
}

export default function useTranslations() {
    const [lang, ] = useContext(LanguageContext);
    return useCallback((...args) => translate(lang, ...args), [lang]);
}
