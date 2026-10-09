const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS = ["Hearts", "Diamonds", "Clubs", "Spades"];

const VALUES = {
    A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
    "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13
};

const SUIT_INFO = {
    Hearts: { symbol: "♥", color: "red" },
    Diamonds: { symbol: "♦", color: "red" },
    Clubs: { symbol: "♣", color: "black" },
    Spades: { symbol: "♠", color: "black" }
};

const HAND_SIZE = 3;
const DEAL_DELAY_MS = 250;
const gameState = {
    player1Hand: [],
    player2Hand: [],
    player1Score: 0,
    player2Score: 0,
    currentRound: 0,
    isDealing: false
};

const dom = {
    drawButton: document.getElementById("draw-button"),
    player1Score: document.getElementById("player1-score"),
    player2Score: document.getElementById("player2-score"),
    player1Cards: [
        document.getElementById("p1-card-0"),
        document.getElementById("p1-card-1"),
        document.getElementById("p1-card-2")
    ],
    player2Cards: [
        document.getElementById("p2-card-0"),
        document.getElementById("p2-card-1"),
        document.getElementById("p2-card-2")
    ]
};

function createCard(rank, suit) {
    return {
        rank: rank,
        suit: suit,
        value: VALUES[rank],
        display: rank + SUIT_INFO[suit].symbol
    };
}

function getRandomCard() {
    const randomRank = RANKS[Math.floor(Math.random() * RANKS.length)];
    const randomSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
    return createCard(randomRank, randomSuit);
}

function cardsAreEqual(cardA, cardB) {
    return cardA.rank === cardB.rank && cardA.suit === cardB.suit;
}

function handContainsCard(hand, card) {
    return hand.some(function (existingCard) {
        return cardsAreEqual(existingCard, card);
    });
}

function generateHand() {
    const hand = [];

    while (hand.length < HAND_SIZE) {
        const candidate = getRandomCard();
        if (!handContainsCard(hand, candidate)) {
            hand.push(candidate);
        }
    }

    return hand;
}

function calculateHandValue(hand) {
    return hand.reduce(function (total, card) {
        return total + card.value;
    }, 0);
}

function determineWinner(hand1, hand2) {
    const total1 = calculateHandValue(hand1);
    const total2 = calculateHandValue(hand2);

    if (total1 > total2) return "PLAYER_1";
    if (total2 > total1) return "PLAYER_2";
    return "DRAW";
}

function renderCard(cardElement, card) {
    var symbol = SUIT_INFO[card.suit].symbol;
    cardElement.innerHTML =
        '<span class="card-corner top-left">' +
        '<span class="card-rank">' + card.rank + '</span>' +
        '<span class="card-suit">' + symbol + '</span>' +
        '</span>' +
        '<span class="card-center">' + symbol + '</span>' +
        '<span class="card-corner bottom-right">' +
        '<span class="card-rank">' + card.rank + '</span>' +
        '<span class="card-suit">' + symbol + '</span>' +
        '</span>';
    cardElement.classList.remove("red", "black");
    cardElement.classList.add(SUIT_INFO[card.suit].color);
    cardElement.classList.add("dealt");
}

function clearHand(cardElements) {
    cardElements.forEach(function (cardElement) {
        cardElement.innerHTML = "";
        cardElement.classList.remove("red", "black", "dealt");
    });
}

function renderScores() {
    dom.player1Score.textContent = "Player 1: " + gameState.player1Score;
    dom.player2Score.textContent = "Player 2: " + gameState.player2Score;
}

function dealHandSequentially(hand, cardElements, onComplete) {
    let index = 0;

    function dealNextCard() {
        if (index >= hand.length) {
            onComplete();
            return;
        }

        renderCard(cardElements[index], hand[index]);
        index = index + 1;
        setTimeout(dealNextCard, DEAL_DELAY_MS);
    }

    dealNextCard();
}

function startRound() {
    gameState.isDealing = true;
    dom.drawButton.disabled = true;

    clearHand(dom.player1Cards);
    clearHand(dom.player2Cards);

    gameState.player1Hand = generateHand();
    gameState.player2Hand = generateHand();

    dealHandSequentially(gameState.player1Hand, dom.player1Cards, function () {
        dealHandSequentially(gameState.player2Hand, dom.player2Cards, finishRound);
    });
}

function finishRound() {
    const player1Total = calculateHandValue(gameState.player1Hand);
    const player2Total = calculateHandValue(gameState.player2Hand);
    const winner = determineWinner(gameState.player1Hand, gameState.player2Hand);

    if (winner === "PLAYER_1") {
        gameState.player1Score = gameState.player1Score + 1;
    } else if (winner === "PLAYER_2") {
        gameState.player2Score = gameState.player2Score + 1;
    }

    renderScores();

    gameState.currentRound = gameState.currentRound + 1;

    gameState.isDealing = false;
    dom.drawButton.disabled = false;
}

dom.drawButton.addEventListener("click", function () {
    if (!gameState.isDealing) {
        startRound();
    }
});