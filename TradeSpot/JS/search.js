// Perform search function
function performSearch() {
    const cardName = document.querySelector('.cardSearch').value.trim();

    if (cardName === '') {
        alert('Please enter a card name.');
        return;
    }

    // Display loading message
    const resultsContainer = document.querySelector('.resultsContainer');
    resultsContainer.innerHTML = '<p>Loading...</p>';

    // Fetch the local AllIdentifiers.json file
    fetch('../AllIdentifiers.json')
        .then(response => response.json())
        .then(data => {
            const displayedNames = [];
            const matchingCards = Object.values(data.data).filter(card => card.name.toLowerCase().includes(cardName.toLowerCase()));

            if (matchingCards.length > 0) {
                // Store the matching cards in local storage
                const storedCards = matchingCards.map(card => ({
                    name: card.name,
                    rarity: card.rarity,
                    identifiers: {
                        scryfallId: card.identifiers.scryfallId
                    },
                    setCode: card.setCode,
                    colorIdentity: card.colorIdentity,
                    finishes: card.finishes
                }));
                localStorage.setItem('storedCards', JSON.stringify(storedCards));

                // Display the matching cards
                displayCards(storedCards, [], cardName);

                // Console log the stored cards
                console.log('Storage', storedCards);
            } else {
                resultsContainer.innerHTML = '<p>No cards found with that name.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            resultsContainer.innerHTML = '<p>Error fetching data. Please try again later.</p>';
        });
}

// Get set codes
async function getSetCodes() {
    const response = await fetch('JS/setCodes.json');
    const data = await response.json();
    return data.codes; // Return the array of set codes
}

let lastExactCardName = ''; // To store the last clicked card name

// Display cards function
async function displayCards(storedCards, displayedNames, cardName) {
    const resultsContainer = document.querySelector('.resultsContainer');
    resultsContainer.innerHTML = '';

    // Get the selected sort option
    const sortOption = document.querySelector('#sortDropdown').value;

    // Load the set codes for sorting
    const setCodes = await getSetCodes();

    // Sort the cards based on the selected sort option
    switch (sortOption) {
        case 'nameAsc':
            storedCards.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'nameDesc':
            storedCards.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'releaseDateNewest':
            storedCards.sort((a, b) => {
                return setCodes.indexOf(a.setCode) - setCodes.indexOf(b.setCode);
            });
            break;
        case 'releaseDateOldest':
            storedCards.sort((a, b) => {
                return setCodes.indexOf(b.setCode) - setCodes.indexOf(a.setCode);
            });
            break;
        case 'priceMost':
            storedCards.sort((a, b) => b.price - a.price);
            break;
        case 'priceLeast':
            storedCards.sort((a, b) => a.price - b.price);
            break;
        default:
            break;
    }

    const cardNameLower = cardName.toLowerCase();

    storedCards.forEach(card => {
        const cardNameInListLower = card.name.toLowerCase();

        // Prevent displaying the same card twice
        if (displayedNames.includes(card.name)) {
            return;
        }

        // Check if the card is a match (similar or exact)
        if (cardNameInListLower.includes(cardNameLower)) {
            displayedNames.push(card.name);

            const scryfallId = card.identifiers?.scryfallId;
            if (!scryfallId || scryfallId.length < 2) {
                console.error('Invalid scryfallId for card:', card);
                return;
            }

            const imageUrl = `https://cards.scryfall.io/large/front/${scryfallId[0]}/${scryfallId[1]}/${scryfallId}.jpg`;

            const cardElement = document.createElement('div');
            cardElement.classList.add('cardResult');
            cardElement.innerHTML = `
                <img src="${imageUrl}" alt="${card.name}" class="cardImg" data-card-name="${card.name}">
            `;
            resultsContainer.appendChild(cardElement);
        }
    });

    document.querySelectorAll('.cardImg').forEach(img => {
        img.addEventListener('click', function () {
            const exactCardName = this.dataset.cardName;
            lastExactCardName = this.dataset.cardName;
            displayExactMatches(exactCardName);
        });
    });
}

// Display exact matches function
async function displayExactMatches(exactCardName) {
    const resultsContainer = document.querySelector('.resultsContainer');
    const backBtn = document.querySelector('.backBtn');
    const storedCards = JSON.parse(localStorage.getItem('storedCards'));

    resultsContainer.innerHTML = '';

    // Filter out cards from storedCards with the exact name
    const exactMatches = storedCards.filter(card => card.name.toLowerCase() === exactCardName.toLowerCase());

    // Load the set codes for sorting
    const setCodes = await getSetCodes();

    // Get the selected sorting option
    const sortOption = document.querySelector('#sortDropdown').value;

    // Sort the exactMatches array based on the selected sort option
    switch (sortOption) {
        case 'nameAsc':
            exactMatches.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'nameDesc':
            exactMatches.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'releaseDateNewest':
            exactMatches.sort((a, b) => {
                return setCodes.indexOf(a.setCode) - setCodes.indexOf(b.setCode);
            });
            break;
        case 'releaseDateOldest':
            exactMatches.sort((a, b) => {
                return setCodes.indexOf(b.setCode) - setCodes.indexOf(a.setCode);
            });
            break;
        case 'priceMost':
            exactMatches.sort((a, b) => b.price - a.price);
            break;
        case 'priceLeast':
            exactMatches.sort((a, b) => a.price - b.price);
            break;
        default:
            break;
    }

    // Display all exact matches
    exactMatches.forEach(card => {
        const scryfallId = card.identifiers?.scryfallId;
        if (!scryfallId || scryfallId.length < 2) {
            console.error('Invalid scryfallId for card:', card);
            return;
        }

        const imageUrl = `https://cards.scryfall.io/large/front/${scryfallId[0]}/${scryfallId[1]}/${scryfallId}.jpg`;

        const cardElement = document.createElement('div');
        cardElement.classList.add('cardResult');
        cardElement.innerHTML = `
            <img src="${imageUrl}" alt="${card.name}" class="cardImg">
        `;
        resultsContainer.appendChild(cardElement);
    });

    // Show the back button
    backBtn.style.display = 'inline-block';

    // Back button functionality
    backBtn.addEventListener('click', function () {
        const cardName = document.querySelector('.cardSearch').value.trim();
        displayCards(storedCards, [], cardName);
        backBtn.style.display = 'none'; // Hide the back button again
    });
}


// Set up event listeners
document.querySelector('.searchBtn').addEventListener('click', performSearch);
document.querySelector('.cardSearch').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});
// Event listener for sort dropdown change
document.querySelector('#sortDropdown').addEventListener('change', function () {
    const storedCards = JSON.parse(localStorage.getItem('storedCards'));
    const backBtn = document.querySelector('.backBtn');

    if (backBtn.style.display === 'none' || backBtn.style.display === '') {
        // If back button is hidden, display the full list of cards
        const cardName = document.querySelector('.cardSearch').value.trim();
        displayCards(storedCards, [], cardName);
    } else {
        // If back button is visible, display exact matches for the last selected card name
        displayExactMatches(lastExactCardName);
    }
});