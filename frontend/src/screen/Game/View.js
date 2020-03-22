import React, { useState, useEffect } from 'react';
import { Loader } from '../../component';
import api from '../../api';
import GameCreateView from './Create';

function useGame(code) {
    const [game, setGame] = useState({ loading: true });

    useEffect(() => {
        setGame({ loading: true });

        const refetch = () => (
            api.get(`game/${code}/`)
            .then(({ data: game }) => setGame({loading: false, game, refetch }))
            .catch((error) => setGame({ loading: false, error, refetch }))
        );

        refetch();
    }, [code]);

    return game;
}

export default function GameViewScreen({ code }) {
    const { loading, game, error, refetch } = useGame(code);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        if (error.response.status === 403) {
            return <GameCreateView defaultCode={code} afterSubmit={refetch} />;
        } else {
            return error.response.data.message;
        }
    }

    return (
        <>
            Game: {game.code}
            <ul>
                {game.players.map(({ name, self, admin }) => (
                    <li key={name}>{name}{self && ' (self)'}{admin && ' (admin)'}</li>
                ))}
            </ul>
        </>
    );
}
