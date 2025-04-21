<script>
  import Flashcard from './Flashcard.svelte';
  import { createEventDispatcher, tick } from 'svelte';
  
  // Fix props and state initialization
  let { 
    flashcards = [], 
    deckName = '', 
    showSuccessMessage, 
    currentCardIndex = 0 
  } = $props();
  
  let showMenu = $state(false);
  let isEditing = $state(false);
  let editedName = $state(deckName);
  let reviewingStarred = $state(false);
  let starredIndexes = $state([]);
  let starredIndex = $state(0);
  let shuffleMode = $state(false);  // Add this missing state

  const dispatch = createEventDispatcher();

  // Update the effect to properly handle deck changes
  $effect(() => {
    if (flashcards && flashcards.length > 0) {
      resetDeckView();
      shuffleMode = false;
    }
  });

  // Update resetDeckView to be more robust
  async function resetDeckView() {
    currentCardIndex = -1;
    await tick();
    currentCardIndex = 0;
    reviewingStarred = false;
    starredIndexes = [];
    starredIndex = 0;
  }

  function toggleMenu() {
    showMenu = !showMenu;
  }

  function editDeck() {
    isEditing = true;
    editedName = deckName;
    showMenu = false;
  }

  function saveDeckName() {
    if (editedName.trim()) {
      dispatch('edit', { newName: editedName.trim() });
      isEditing = false;
    }
  }

  function deleteDeck() {
    if (confirm('Are you sure you want to delete this deck and all its cards?')) {
      dispatch('delete');
    }
    showMenu = false;
  }

  function handleImportDeck(event) {
    dispatch('importDeck', event);
  }

  function deleteFlashcard(event) {
    const { index } = event.detail;
    dispatch('deleteFlashcard', { index });
  }


function reviewStarred() {
  starredIndexes = flashcards
    .map((card, index) => (card.starred ? index : -1))
    .filter(index => index !== -1);

  if (starredIndexes.length > 0) {
    reviewingStarred = true;
    starredIndex = 0;
    currentCardIndex = starredIndexes[starredIndex]; // Jump to first starred card
  } else {
    alert("No starred flashcards to review!");
  }
}
function toggleReviewStarred() {
  if (reviewingStarred) {
    // Exit starred mode
    reviewingStarred = false;
    currentCardIndex = 0; // Reset to first card in deck
  } else {
    // Enter starred mode
    starredIndexes = flashcards.map((card, index) => card.starred ? index : -1).filter(index => index !== -1);
    if (starredIndexes.length > 0) {
      reviewingStarred = true;
      starredIndex = 0;
      currentCardIndex = starredIndexes[0]; // Start at first starred card
    } else {
      alert("No starred flashcards to review!");
    }
  }
}


function nextCard() {
  if (reviewingStarred) {
    if (starredIndex < starredIndexes.length - 1) {
      starredIndex++;
      currentCardIndex = starredIndexes[starredIndex];
    }
  } else {
    if (currentCardIndex < flashcards.length - 1) {
      currentCardIndex++;
    }
  }
}

function exitReviewMode() {
  reviewingStarred = false;
  currentCardIndex = 0; // Reset to normal mode
}


  function previousCard() {
    if (currentCardIndex > 0) {
      currentCardIndex--;
    }
  }

  function handleKeydown(event) {
    if (event.key === 'ArrowRight') {
      nextCard();
    } else if (event.key === 'ArrowLeft') {
      previousCard();
    }
  }

  function handleEditCard(editedCard) {
    flashcards[currentCardIndex] = editedCard;
    dispatch('editCard', { 
      cardIndex: currentCardIndex, 
      card: editedCard 
    });
  }

   function toggleStarred() {
    flashcards[currentCardIndex].starred = !flashcards[currentCardIndex].starred;
  }


</script>

<svelte:window on:keydown={handleKeydown}/>

<style>
  .deck {
    max-width: 800px;
    width: 100%;
    margin: 0.5rem auto;
    padding-top: 0.5rem;
    padding-bottom: 1rem;
    padding-left: 4rem;
    padding-right: 4rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    box-sizing: border-box;
    z-index: 1;
  }

  .deck-title {
    font-size: 1.5rem;
    color: #333;
    text-align: left;
    padding: 1rem 1;
    margin: 0 0 2rem 0;
    font-weight: bold;
    border-bottom: 2px solid #ccc;
    display: block; /* Ensure block-level display */
    width: 100%; /* Full width */
    background-color: #f9f9f9; /* Match deck background */
  }


  .deck-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .menu-container {
    position: relative;
  }

  .menu-dots {
    cursor: pointer;
    padding: 0.5rem;
    border: none;
    background: none;
    font-size: 1.5rem;
    color: #666;
    transition: color 0.2s;
  }

  .menu-dots:hover {
    color: #333;
  }

  .menu {
    position: absolute;
    right: 0;
    top: 100%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 10;
    min-width: 120px;
  }

  .menu-item {
    padding: 0.5rem 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
  }

  .menu-item:hover {
    background-color: #f0f0f0;
  }

  .deck:hover .menu-dots {
    opacity: 1;
  }

  .edit-container {
    display: flex;
    gap: 1rem;
    align-items: center;
    width: 100%;
  }

  .edit-input {
    flex: 1;
    padding: 0.5rem;
    font-size: 1.5rem;
    border: 2px solid #ccc;
    border-radius: 4px;
    background-color: white;
  }

  .save-button {
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  .save-button:hover {
    background-color: #45a049;
  }

  .navigation-buttons {
    margin-left: -17px;
    display: flex;
    justify-content: center;
    gap: 100px;
    width: 100%;
    margin-top: 1rem;
  }

  .nav-button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .review-starred-button {
  position: absolute;
  top: 500px; /* Adjust vertically */
  right: 20px; /* Move it closer or further from other buttons */
}


  .nav-button:hover {
    background-color: #0056b3;
  }

  .nav-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .card-counter {
    text-align: center;
    margin-top: 1rem;
    color: #666;
  }
  .star-button {
  position: absolute;
  top: 103px; /* Adjust this to move it up/down */
  right: 60px; /* Move it closer/further from the menu dots */
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: gold;
  z-index: 10; /* Keep it above other elements */
}

.star-button:hover {
  color: orange;
}






</style>

<div class="deck">
  <div class="deck-header">
    {#if isEditing}
      <div class="edit-container">
        <input
          type="text"
          bind:value={editedName}
          class="edit-input"
          placeholder="Enter deck name"
          onkeydown={(e) => e.key === 'Enter' && saveDeckName()}
        />
        <button class="save-button" onclick={saveDeckName}>Save</button>
      </div>
    {:else}
      <h2 class="deck-title">{deckName || 'Untitled'}</h2>
      <div class="menu-container">
       
        
        <button class="menu-dots" onclick={toggleMenu}>⋮</button>
        {#if showMenu}
          <div class="menu" 
               onmouseleave={() => showMenu = false}
               role="menu"
               tabindex="0">
            <button class="menu-item" onclick={editDeck} role="menuitem" tabindex="0" onkeydown={(e) => e.key === 'Enter' && editDeck()}>
              ✏️ Edit
            </button>
            <button class="menu-item" onclick={handleImportDeck} role="menuitem" tabindex="0" onkeydown={(e) => e.key === 'Enter' && handleImportDeck(e)}>
              📤 Import
            </button>
            <button class="menu-item" onclick={deleteDeck} role="menuitem" tabindex="0" onkeydown={(e) => e.key === 'Enter' && deleteDeck()}>
              🗑️ Delete
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  {#if flashcards && flashcards.length > 0}
    <button class="star-button" onclick={toggleStarred}>
      {flashcards[currentCardIndex]?.starred ? '⭐' : '☆'}
    </button>
    
    <Flashcard 
      question={flashcards[currentCardIndex]?.question || ''} 
      answer={flashcards[currentCardIndex]?.answer || ''}
      index={currentCardIndex} 
      {showSuccessMessage}
      on:editCard={({ detail }) => handleEditCard(detail)}
      on:deleteFlashcard={deleteFlashcard}
    />
    
    <div class="navigation-buttons">
      <button 
        class="nav-button" 
        onclick={previousCard} 
        disabled={currentCardIndex === 0}
      >
        Previous
      </button>
      <button 
      class="nav-button" 
      onclick={nextCard} 
      disabled={reviewingStarred 
        ? starredIndex >= starredIndexes.length - 1 
        : currentCardIndex === flashcards.length - 1}
    >
      Next
    </button>
    <button 
    class="nav-button review-starred-button" 
    onclick={toggleReviewStarred} 
    style="background-color: {reviewingStarred ? 'red' : '#007bff'}"
  >
    {reviewingStarred ? "Exit Review" : "Review Starred"}
  </button>
  
    </div>
    <div class="card-counter">
      Card {currentCardIndex + 1} of {flashcards.length}
    </div>
  {:else}
    <p>No flashcards in this deck yet.</p>
  {/if}
</div>