import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';
import Scrollbars from 'react-custom-scrollbars';
import styled from 'styled-components';
import theme from './theme';
import { Loader, Toasts } from './component';

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
    padding: 1rem;
`;

function App() {
    return (
        <Container>
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
        </Container>
    );
}

export default App;
