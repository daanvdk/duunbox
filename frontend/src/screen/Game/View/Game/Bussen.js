import React from 'react';
import styled from 'styled-components';
import { Form, Group, Card, Icon } from '../../../../component';
import { range } from '../../../../helpers';
import theme from '../../../../theme';

const StyledGroup = styled(Group)`
    background-color: ${theme.bgColor};
    border-radius: 0.5em;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding-top: 0.25em;
    > label {
        font-weight: bold;
        > i {
            font-size: 0.7em;
            position: relative;
            top: -0.15em;
            margin-right: 0.33em;
        }
    }
    ${({ active }) => active ? `` : `
        opacity: 0.5;
        transform: scale(0.95);
    `}
    transition: opacity 1000ms ease, transform 1000ms ease;
`;

const Container = styled.div`
    width: 100%;
    min-height: 100%;
    background-color: ${theme.bgColorN1};
    padding: 1em;
`;

const CardContainer = styled.div`
    margin-top: -0.5em;
    padding: 0.5em;
    display: flex;
    > img {
        margin: 0.5em;
    }
`;

export default function Bussen({ game }) {
    return (
        <Container>
            <Form>
                {game.players.map(({ name: player, self }) => (
                    <StyledGroup
                        key={player}
                        label={
                            <React.Fragment>
                                {self && <Icon name="user" />}
                                {player}
                            </React.Fragment>
                        }
                        active={player === game.state.turn}
                    >
                        <CardContainer>
                            {range(4).map((i) => (
                                <Card key={i} card={
                                    i < game.state.hands[player].length
                                    ? game.state.hands[player][i]
                                    : 'back'
                                } />
                            ))}
                        </CardContainer>
                    </StyledGroup>
                ))}
            </Form>
        </Container>
    );
}
