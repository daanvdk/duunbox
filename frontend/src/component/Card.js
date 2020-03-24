import React from 'react';

import BACK from 'svg-cards/png/2x/back.png';
import SPADES_2 from 'svg-cards/png/2x/spade_2.png';
import DIAMONDS_2 from 'svg-cards/png/2x/diamond_2.png';
import CLUBS_2 from 'svg-cards/png/2x/club_2.png';
import HEARTS_2 from 'svg-cards/png/2x/heart_2.png';
import SPADES_3 from 'svg-cards/png/2x/spade_3.png';
import DIAMONDS_3 from 'svg-cards/png/2x/diamond_3.png';
import CLUBS_3 from 'svg-cards/png/2x/club_3.png';
import HEARTS_3 from 'svg-cards/png/2x/heart_3.png';
import SPADES_4 from 'svg-cards/png/2x/spade_4.png';
import DIAMONDS_4 from 'svg-cards/png/2x/diamond_4.png';
import CLUBS_4 from 'svg-cards/png/2x/club_4.png';
import HEARTS_4 from 'svg-cards/png/2x/heart_4.png';
import SPADES_5 from 'svg-cards/png/2x/spade_5.png';
import DIAMONDS_5 from 'svg-cards/png/2x/diamond_5.png';
import CLUBS_5 from 'svg-cards/png/2x/club_5.png';
import HEARTS_5 from 'svg-cards/png/2x/heart_5.png';
import SPADES_6 from 'svg-cards/png/2x/spade_6.png';
import DIAMONDS_6 from 'svg-cards/png/2x/diamond_6.png';
import CLUBS_6 from 'svg-cards/png/2x/club_6.png';
import HEARTS_6 from 'svg-cards/png/2x/heart_6.png';
import SPADES_7 from 'svg-cards/png/2x/spade_7.png';
import DIAMONDS_7 from 'svg-cards/png/2x/diamond_7.png';
import CLUBS_7 from 'svg-cards/png/2x/club_7.png';
import HEARTS_7 from 'svg-cards/png/2x/heart_7.png';
import SPADES_8 from 'svg-cards/png/2x/spade_8.png';
import DIAMONDS_8 from 'svg-cards/png/2x/diamond_8.png';
import CLUBS_8 from 'svg-cards/png/2x/club_8.png';
import HEARTS_8 from 'svg-cards/png/2x/heart_8.png';
import SPADES_9 from 'svg-cards/png/2x/spade_9.png';
import DIAMONDS_9 from 'svg-cards/png/2x/diamond_9.png';
import CLUBS_9 from 'svg-cards/png/2x/club_9.png';
import HEARTS_9 from 'svg-cards/png/2x/heart_9.png';
import SPADES_10 from 'svg-cards/png/2x/spade_10.png';
import DIAMONDS_10 from 'svg-cards/png/2x/diamond_10.png';
import CLUBS_10 from 'svg-cards/png/2x/club_10.png';
import HEARTS_10 from 'svg-cards/png/2x/heart_10.png';
import SPADES_JACK from 'svg-cards/png/2x/spade_jack.png';
import DIAMONDS_JACK from 'svg-cards/png/2x/diamond_jack.png';
import CLUBS_JACK from 'svg-cards/png/2x/club_jack.png';
import HEARTS_JACK from 'svg-cards/png/2x/heart_jack.png';
import SPADES_QUEEN from 'svg-cards/png/2x/spade_queen.png';
import DIAMONDS_QUEEN from 'svg-cards/png/2x/diamond_queen.png';
import CLUBS_QUEEN from 'svg-cards/png/2x/club_queen.png';
import HEARTS_QUEEN from 'svg-cards/png/2x/heart_queen.png';
import SPADES_KING from 'svg-cards/png/2x/spade_king.png';
import DIAMONDS_KING from 'svg-cards/png/2x/diamond_king.png';
import CLUBS_KING from 'svg-cards/png/2x/club_king.png';
import HEARTS_KING from 'svg-cards/png/2x/heart_king.png';
import SPADES_ACE from 'svg-cards/png/2x/spade_1.png';
import DIAMONDS_ACE from 'svg-cards/png/2x/diamond_1.png';
import CLUBS_ACE from 'svg-cards/png/2x/club_1.png';
import HEARTS_ACE from 'svg-cards/png/2x/heart_1.png';
import JOKER_RED from 'svg-cards/png/2x/joker_red.png';
import JOKER_BLACK from 'svg-cards/png/2x/joker_black.png';

const CARDS = {
    'back': BACK,
    'spades 2': SPADES_2,
    'diamonds 2': DIAMONDS_2,
    'clubs 2': CLUBS_2,
    'hearts 2': HEARTS_2,
    'spades 3': SPADES_3,
    'diamonds 3': DIAMONDS_3,
    'clubs 3': CLUBS_3,
    'hearts 3': HEARTS_3,
    'spades 4': SPADES_4,
    'diamonds 4': DIAMONDS_4,
    'clubs 4': CLUBS_4,
    'hearts 4': HEARTS_4,
    'spades 5': SPADES_5,
    'diamonds 5': DIAMONDS_5,
    'clubs 5': CLUBS_5,
    'hearts 5': HEARTS_5,
    'spades 6': SPADES_6,
    'diamonds 6': DIAMONDS_6,
    'clubs 6': CLUBS_6,
    'hearts 6': HEARTS_6,
    'spades 7': SPADES_7,
    'diamonds 7': DIAMONDS_7,
    'clubs 7': CLUBS_7,
    'hearts 7': HEARTS_7,
    'spades 8': SPADES_8,
    'diamonds 8': DIAMONDS_8,
    'clubs 8': CLUBS_8,
    'hearts 8': HEARTS_8,
    'spades 9': SPADES_9,
    'diamonds 9': DIAMONDS_9,
    'clubs 9': CLUBS_9,
    'hearts 9': HEARTS_9,
    'spades 10': SPADES_10,
    'diamonds 10': DIAMONDS_10,
    'clubs 10': CLUBS_10,
    'hearts 10': HEARTS_10,
    'spades jack': SPADES_JACK,
    'diamonds jack': DIAMONDS_JACK,
    'clubs jack': CLUBS_JACK,
    'hearts jack': HEARTS_JACK,
    'spades queen': SPADES_QUEEN,
    'diamonds queen': DIAMONDS_QUEEN,
    'clubs queen': CLUBS_QUEEN,
    'hearts queen': HEARTS_QUEEN,
    'spades king': SPADES_KING,
    'diamonds king': DIAMONDS_KING,
    'clubs king': CLUBS_KING,
    'hearts king': HEARTS_KING,
    'spades ace': SPADES_ACE,
    'diamonds ace': DIAMONDS_ACE,
    'clubs ace': CLUBS_ACE,
    'hearts ace': HEARTS_ACE,
    'joker red': JOKER_RED,
    'joker black': JOKER_BLACK,
};

export default function Card({ card, ...props }) {
    if (typeof card !== 'string') {
        card = `${card.suit} ${card.rank}`;
    }
    return <img src={CARDS[card]} alt={card} {...props} />;
}
