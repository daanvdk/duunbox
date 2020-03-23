import { useContext, useCallback } from 'react';
import { LanguageContext } from '../component/Language';
import translations from '../translations';

const PARAM = /\{\{(.*?)\}\}/g;

function template(string, params = {}) {
    let res = '';
    let pos = 0;

    while (true) {
        const match = PARAM.exec(string);
        if (!match) {
            break;
        }

        res += string.slice(pos, match.index);
        pos = PARAM.lastIndex;

        res += (
            params[match[1]] === undefined
            ? match[0]
            : params[match[1]].toString()
        );
    }

    res += string.slice(pos);

    return res;
}

function lookup(node, key, params = {}) {
    const parts = key.split('.');
    for (let i = 0; i < parts.length; i++) {
        if (
            node === null ||
            node === undefined ||
            typeof node !== 'object'
        ) {
            return key;
        }
        if (
            i === parts.length - 1 &&

            node[`${parts[i]}_plural`] !== null &&
            node[`${parts[i]}_plural`] !== undefined &&
            typeof node[`${parts[i]}_plural`] === 'string' &&

            params.count !== null &&
            params.count !== undefined &&
            typeof params.count === 'number' &&
            params.count !== 1
        ) {
            node = node[`${parts[i]}_plural`];
        } else {
            node = node[parts[i]];
        }
    }
    if (typeof node !== 'string') {
        return key;
    }
    return template(node, params);
}

export default function useTranslations() {
    const [lang, ] = useContext(LanguageContext);
    return useCallback((...args) => {
        console.log('translate', ...args);
        return lookup(translations[lang], ...args)
    }, [lang]);
}
