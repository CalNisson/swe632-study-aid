import { writable } from 'svelte/store';
import { categoryStore } from './categoryStore';

export const deckStore = {
  addDeck(category) {
    const deckName = prompt('Enter new deck name:');
    if (deckName) {
      categoryStore.update(state => {
        if (!state.categories[category]) {
          state.categories[category] = [];
        }
        if (!state.categories[category].includes(deckName)) {
          state.categories[category].push(deckName);
          localStorage.setItem('categories', JSON.stringify(state.categories));
        }
        return state;
      });
    }
  },

  deleteDeck(category, deck) {
    if (confirm(`Are you sure you want to delete the deck "${deck}"? This action cannot be undone.`)) {
      categoryStore.update(state => {
        state.categories[category] = state.categories[category].filter(d => d !== deck);
        localStorage.removeItem(deck);
        localStorage.setItem('categories', JSON.stringify(state.categories));
        return state;
      });
    }
  },

  renameDeck(currentDeck) {
    const newName = prompt(`Enter a new name for the deck "${currentDeck}":`);
    if (newName && newName !== currentDeck) {
      categoryStore.update(state => {
        for (const category of Object.keys(state.categories)) {
          const index = state.categories[category].indexOf(currentDeck);
          if (index !== -1) {
            state.categories[category][index] = newName;
            localStorage.setItem("categories", JSON.stringify(state.categories));
            const flashcardData = localStorage.getItem(currentDeck);
            localStorage.setItem(newName, flashcardData);
            localStorage.removeItem(currentDeck);

            currentDeck = newName;
            break;
          }
        }
        return state;
      });
      return newName;
    }
    return currentDeck;
  }
};
