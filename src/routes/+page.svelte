<script>
    import { onMount } from "svelte";
    import { categoryStore, addCategory, deleteCategory } from "../stores/categoryStore";
    import { deckStore } from "../stores/deckStore";
    import { flashcardStore, addFlashcard, loadFlashcards, deleteFlashcard, importDeckFromText, importDeckFromFile } from "../stores/flashcardStore";
  
    let categories = {};
    let currentDeck = "";
    let question = "";
    let answer = "";
    let importText = "";
    let showAnswer = new Set();
    let expandedCategories = new Set();
    let flashcards = [];
  
    onMount(() => {
      const savedCategories = localStorage.getItem("categories");
      if (savedCategories) {
        categories = JSON.parse(savedCategories);
      }
    });
  
    $: flashcards = $flashcardStore;
  
    $: if (currentDeck) {
      loadFlashcards(currentDeck);
    }
  
    function toggleCategory(category) {
      const updatedSet = new Set(expandedCategories);
      if (updatedSet.has(category)) {
        updatedSet.delete(category);
      } else {
        updatedSet.add(category);
      }
      expandedCategories = updatedSet;
    }
  
    function toggleFlip(index) {
      const updatedSet = new Set(showAnswer);
      if (updatedSet.has(index)) {
        updatedSet.delete(index);
      } else {
        updatedSet.add(index);
      }
      showAnswer = updatedSet;
    }
  </script>
  
  <style>
    .container {
      display: flex;
      height: 100vh;
    }
  
    .sidebar {
      width: 300px;
      background-color: #f4f4f4;
      border-right: 1px solid #ddd;
      overflow-y: auto;
      padding: 20px;
    }
  
    .category {
      margin-bottom: 15px;
    }
  
    .category-header {
      font-weight: bold;
      cursor: pointer;
      padding: 5px 10px;
      background: #ddd;
      border-radius: 4px;
    }
  
    .deck-item {
      padding: 10px;
      margin: 5px 0;
      cursor: pointer;
      background: #fff;
      border-radius: 4px;
      transition: background 0.2s;
    }
  
    .deck-item:hover {
      background: #e0e0e0;
    }
  
    .deck-item.active {
      background: #d1ecf1;
      font-weight: bold;
    }
  
    .main {
      flex: 1;
      padding: 20px;
    }
  
    input, textarea {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  
    .flashcard {
      background: #f9f9f9;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 10px;
      cursor: pointer;
      text-align: center;
      transition: 0.3s;
    }
  
    .flashcard.flipped {
      background: #d1ecf1;
    }
  
    .actions {
      text-align: right;
    }
  
    button {
      margin: 5px;
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  
    .add-button {
      background-color: #28a745;
      color: white;
    }
  
    .delete-button {
      background-color: #dc3545;
      color: white;
    }
  </style>
  
  <div class="container">
    <div class="sidebar">
      <h2>Categories</h2>
      <button class="add-button" on:click={addCategory}>New Category</button>
      {#each Object.keys($categoryStore.categories) as category}
        <div class="category">
          <div class="category-header" on:click={() => toggleCategory(category)}>
            {category} {expandedCategories.has(category) ? "▼" : "►"}
            <button class="delete-button" on:click={(e) => { e.stopPropagation(); deleteCategory(category)}}>Delete</button>
          </div>
          {#if expandedCategories.has(category)}
            {#each $categoryStore.categories[category] as deck}
              <div
                class="deck-item {deck === currentDeck ? 'active' : ''}"
                on:click={() => (currentDeck = deck)}
              >
                {deck}
                <button class="delete-button" on:click={(e) => { e.stopPropagation(); deckStore.deleteDeck(category, deck); }}>Delete</button>
              </div>
            {/each}
            <button class="add-button" on:click={() => deckStore.addDeck(category)}>Add Deck</button>
          {/if}
        </div>
      {/each}
    </div>
  
    <div class="main">
      {#if currentDeck}
        <h2>Current Deck: {currentDeck}</h2>
        <button class="add-button" on:click={deckStore.renameDeck(currentDeck)}>Rename Deck</button>
        <div>
          <input type="text" placeholder="Enter question" bind:value={question} />
          <textarea rows="4" placeholder="Enter answer" bind:value={answer}></textarea>
          <button class="add-button" on:click={() => addFlashcard(currentDeck, question, answer)}>Add Flashcard</button>
        </div>
        <div>
          <h3>Import Flashcards</h3>
          <textarea rows="4" placeholder="Paste flashcards here (question|answer per line)" bind:value={importText}></textarea>
          <button on:click={() => importDeckFromText(currentDeck, importText)}>Import from Text</button>
          <input type="file" accept=".txt" on:change={(event) => importDeckFromFile(currentDeck, event)} />
        </div>
        <h2>Flashcards</h2>
        {#each flashcards as flashcard, index}
          <div 
            class="flashcard {showAnswer.has(index) ? 'flipped' : ''}" 
            on:click={() => toggleFlip(index)}
          >
            {#if showAnswer.has(index)}
              <p><strong>Answer:</strong> {flashcard.answer}</p>
            {:else}
              <p><strong>Question:</strong> {flashcard.question}</p>
            {/if}
            <div class="actions">
              <button class="delete-button" on:click={(e) => { e.stopPropagation(); deleteFlashcard(currentDeck, index); }}>Delete</button>
            </div>
          </div>
        {/each}
      {:else}
        <p>Please select a deck or create a new one.</p>
      {/if}
    </div>
  </div>
  