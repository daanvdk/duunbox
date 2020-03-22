import React from 'react';
import GameViewScreen from '../screen/Game/View';
import GameCreateScreen from '../screen/Game/Create';

export default function GameRoute({ match }) {
    const { code } = match.params;
    if (code) {
        return <GameViewScreen code={code} />;
    } else {
        return <GameCreateScreen />
    }
}
