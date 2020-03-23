import React, { useContext } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';
import Scrollbars from 'react-custom-scrollbars';
import styled from 'styled-components';
import theme from './theme';
import { Loader, Toasts, Language } from './component';
import { LANGUAGES, LanguageContext } from './component/Language';

function route(path) {
    return Loadable({
        loader() {
            return import(`./route/${path}`);
        },
        loading: Loader,
        delay: 300,
    });
}

const Game = route('Game');

const Container = styled.div`
    height: 100%;
    background-color: ${theme.bgColor};
    color: ${theme.textColor};
`;

const Wrapper = styled.div`
    height: 100%;
    padding: 1rem;
`;

const LanguageButtonContainer = styled.div`
    position: absolute;
    z-index: 5;
    top: 1em;
    right: 1em;
    background-color: #FFF;
    border-radius: 0.5em;
`;

const LanguageButton = styled.button`
    background: unset;
    border: unset;
    outline: unset;
    padding: 0.33em 0.5em;
    font-weight: bold;
    color: ${({ active }) => active ? theme.primaryColor : theme.textColor};
    cursor: pointer;
    text-transform: uppercase;

    transition: color 300ms ease;

    border-left: 1px solid ${theme.bgColorN2};
    &:first-child {
        border-left-width: 0;
    }
`;

function LanguageSwitcher() {
    const [currentLang, setCurrentLang] = useContext(LanguageContext);
    return (
        <LanguageButtonContainer>
            {LANGUAGES.map((lang) => (
                <LanguageButton
                    key={lang}
                    active={lang === currentLang}
                    onClick={() => setCurrentLang(lang)}
                >
                    {lang}
                </LanguageButton>
            ))}
        </LanguageButtonContainer>
    );
}

function App() {
    return (
        <Container>
            <Language>
                <LanguageSwitcher />
                <Toasts>
                    <Scrollbars>
                        <Wrapper>
                            <BrowserRouter>
                                <Switch>
                                    <Route exact
                                        path="/:code?"
                                        render={(props) => <Game {...props} />}
                                    />
                                </Switch>
                            </BrowserRouter>
                        </Wrapper>
                    </Scrollbars>
                </Toasts>
            </Language>
        </Container>
    );
}

export default App;
