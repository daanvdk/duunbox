import React, { useState, createContext } from 'react';

export const LanguageContext = createContext();

export const LANGUAGES = ['en', 'nl'];
const DEFAULT = 'en';

export default function Language({ children }) {
    const [lang, setLang] = useState(() => {
        let lang = localStorage.getItem('language');
        if (
            lang === null &&
            LANGUAGES.includes(navigator.language.slice(0, 2))
        ) {
            lang = navigator.language.slice(0, 2);
        }
        return lang || DEFAULT;
    });

    return (
        <LanguageContext.Provider value={[lang, (lang) => {
            localStorage.setItem('language', lang);
            setLang(lang);
        }]}>
            {children}
        </LanguageContext.Provider>
    );
}
