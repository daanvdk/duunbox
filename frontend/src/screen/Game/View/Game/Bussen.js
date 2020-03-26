import React from 'react';
import styled from 'styled-components';
import { Card, Icon } from '../../../../component';
import { range } from '../../../../helpers';
import theme from '../../../../theme';

const Hand = styled.div`
    background-color: ${theme.bgColor};
    border-radius: 0.5em;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding-top: 0.25em; ${({ active }) => active ? `` : `
        opacity: 0.5;
        transform: scale(0.95);
    `}
    transition: opacity 1000ms ease, transform 1000ms ease;

    flex: 1 0 auto;
    margin: 0.5em;

    > label {
        font-size: 0.9rem;
        text-align: center;
        display: block;
        margin-bottom: 0.25rem;
        color: ${theme.textColorN2};
        font-weight: bold;
        > i {
            font-size: 0.7em;
            position: relative;
            top: -0.15em;
            margin-right: 0.33em;
        }
    }

    width: calc(100% - 1em);
    max-width: 600px;
    @media only screen and (min-width: 1024px) {
        width: calc(50% - 1em);
        max-width: 600px;
    }
`;

const Container = styled.div`
    width: 100%;
    min-height: 100%;
    background-color: ${theme.bgColorN1};
`;

const Hands = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    max-width: calc(1200px + 3em);
    padding: 0.5em;
    margin: 0 auto;
`;

const CardContainer = styled.div`
    margin-top: -0.5em;
    padding: 0.5em;
    display: flex;
    > img {
        width: calc(25% - 1em);
        margin: 0.5em;
    }
`;

export default function Bussen({ room }) {
    return (
        <Container>
            <Hands>
                {room.players.map(({ name: player, self }) => (
                    <Hand key={player} active={player === room.state.turn}>
                        <label>
                            {self && <Icon name="user" />}
                            {player}
                        </label>
                        <CardContainer>
                            {range(4).map((i) => (
                                <Card key={i} card={
                                    i < room.state.hands[player].length
                                    ? room.state.hands[player][i]
                                    : 'back'
                                } />
                            ))}
                        </CardContainer>
                    </Hand>
                ))}
            </Hands>
        </Container>
    );
}
