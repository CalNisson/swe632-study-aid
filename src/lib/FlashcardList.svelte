<script>
  import Flashcard from './Flashcard.svelte';
  import Deck from './Deck.svelte';
  import ImportModal from './ImportModal.svelte';

  let newQuestion = $state("");
  let newAnswer = $state("");
  let newDeckName = $state("");
  let showDeckInput = $state(false);
  let { decks, handleDeckChange, selectedDeck, addDeck, removeDeck, addFlashcard, removeFlashcard, showSuccessMessage, importDeck, handleEditDeck } = $props();
  let showImportModal = $state(false);
  let isShuffled = $state(false);
  let shuffledIndices = $state([]);
  let currentCardIndex = $state(0);
  let originalFlashcards = $state([]);

 

  function handleDeleteDeck() {
    decks.splice(selectedDeck, 1);
    selectedDeck = null;
    showSuccessMessage("Deck deleted successfully!");
  }

  function openImportModal() {
    showImportModal = true;
  }

  function closeImportModal() {
    showImportModal = false;
  }

  

  function selectDeck(deck) {
    selectedDeck = deck;
    currentCardIndex = 0;
    originalFlashcards = [...deck.flashcards];
  }

  function handleDeleteFlashcard(event) {
    const { index } = event.detail;
    if (confirm('Are you sure you want to delete this flashcard?')) {
      if (selectedDeck !== null) {
        decks[selectedDeck].flashcards.splice(index, 1);
        originalFlashcards = [...decks[selectedDeck].flashcards];
      }
    }
    showSuccessMessage("Flashcard deleted successfully!");
  }

  function shuffleCards() {
    let originalIndex = currentCardIndex;
    isShuffled = !isShuffled;

    if (isShuffled) {
      shuffleIndices();
      currentCardIndex = 0;
    } else {
      if (shuffledIndices.length > 0) {
        currentCardIndex = decks[selectedDeck].flashcards.findIndex(card => decks[selectedDeck].flashcards[shuffledIndices[originalIndex]] === decks[selectedDeck].flashcards[originalIndex]);
      }
    }
  }

  function shuffleIndices() {
    shuffledIndices = [...Array(decks[selectedDeck].flashcards.length).keys()];
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }
  }
  
  let firstCardClicked = $state(false);

  function nextCard() {
    if (isShuffled) {
      currentCardIndex++;
      if (currentCardIndex >= shuffledIndices.length) {
        shuffleIndices();
        currentCardIndex = 0;
      }
    } else {
      currentCardIndex = (currentCardIndex + 1) % decks[selectedDeck].flashcards.length;
    }
  }

  function previousCard() {
    if (isShuffled) {
      currentCardIndex--;
      if (currentCardIndex < 0) {
        shuffleIndices();
        currentCardIndex = shuffledIndices.length - 1;
      }
    } else {
      currentCardIndex = (currentCardIndex - 1 + decks[selectedDeck].flashcards.length) % decks[selectedDeck].flashcards.length;
    }
  }

  import { tick } from 'svelte';

  async function goToFirstCard() {
    if (!decks[selectedDeck] || decks[selectedDeck].flashcards.length === 0) return; 
    
    currentCardIndex = -1; // Force change detection
    await tick();
    currentCardIndex = 0;  // Now actually set it to first card
    await tick();
  }
</script>

<style>
  .flashcard-list {
    max-width: 1800px;
    min-height: 1000px;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .input-container {
    width: 800px;
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    box-sizing: border-box;
  }

  .text-input {
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    width: 100%;
    box-sizing: border-box;
  }

  .shuffle-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: -6.5rem; 
    z-index: 10;
  }

  .shuffle-button {
    margin-right: 3px;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: #fff;
    cursor: pointer;
    margin-bottom: 1rem;
  }

  .shuffle-button.shuffled {
    background-color: #ff9800; /* Highlight color */
  }

  .card-counter {
    text-align: center;
    margin-top: 1rem;
    color: #666;
  }

  .first-card-button {
    position: relative;
    left: -300px;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: none;
    border-radius: 4px;
    background-color: #28a745; /* Green color */
    color: #fff;
    cursor: pointer;
    margin-top: -3.5rem;
  }

  .first-card-button.clicked {
    background-color: darkgreen;
  }
</style>

<ImportModal show={showImportModal} on:import={importDeck} on:close={closeImportModal} />
<div class="flashcard-list">
  {#if typeof selectedDeck === "number" && selectedDeck >= 0}
    <div class="input-container">
      <input
        type="text"
        class="text-input"
        bind:value={newQuestion}
        placeholder="Enter question"
      />
      <input
        type="text"
        class="text-input"
        bind:value={newAnswer}
        placeholder="Enter answer"
      />
      <button class="px-4 py-2 text-base border-none rounded-md bg-blue-500 text-white cursor-pointer self-end" onclick={() => { addFlashcard(newQuestion, newAnswer); newQuestion = ""; newAnswer = ""; } }>Add</button>
    </div>
    <Deck
      flashcards={isShuffled ? shuffledIndices.map(index => decks[selectedDeck].flashcards[index]) : decks[selectedDeck].flashcards}
      deckName={decks[selectedDeck].name}
      showSuccessMessage={showSuccessMessage}
      on:edit={handleEditDeck}
      on:delete={() => removeDeck(selectedDeck)}
      on:importDeck={openImportModal}
      on:deleteFlashcard={handleDeleteFlashcard}
      currentCardIndex={currentCardIndex} 
    />
    {#if decks[selectedDeck].flashcards.length > 0}
      <div class="shuffle-container">
        <button class="shuffle-button" class:shuffled={isShuffled} onclick={shuffleCards}>Shuffle</button>
        <button class="first-card-button" class:clicked={firstCardClicked} onclick={goToFirstCard}>Back To First</button>
        <div class="card-counter">
        </div>
      </div>
    {/if}
  {/if}
</div>
