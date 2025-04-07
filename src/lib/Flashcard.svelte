<script>
  import { createEventDispatcher } from 'svelte';

  let { question, answer, index, showSuccessMessage } = $props();
  let isFlipped = $state(false);
  let showMenu = $state(false);
  let isEditing = $state(false);
  let editedQuestion = $state(question);
  let editedAnswer = $state(answer);

  const dispatch = createEventDispatcher();

  function toggleMenu(e) {
    e.stopPropagation();
    showMenu = !showMenu;
  }

  function startEdit(e) {
    e.stopPropagation();
    editedQuestion = question;
    editedAnswer = answer;
    isEditing = true;
    showMenu = false;
  }

  function saveEdit(e) {
    e.preventDefault();
    if (editedQuestion.trim() && editedAnswer.trim()) {
      dispatch('editCard', {
        question: editedQuestion.trim(),
        answer: editedAnswer.trim()
      });
      isEditing = false;
    }
    showSuccessMessage("Flashcard edited successfully!");
  }

  function cancelEdit(e) {
    e.stopPropagation();
    isEditing = false;
    editedQuestion = question;
    editedAnswer = answer;
  }

  function handleCardClick() {
    if (!isEditing) {
      isFlipped = !isFlipped;
    }
  }

  function deleteCard(event) {
    event.stopPropagation();
    dispatch('deleteFlashcard', { index });
  }
</script>

<div
  class="flashcard {isFlipped ? 'flipped' : ''}"
  onclick={handleCardClick}
  onkeydown={handleCardClick}
  role="button"
  tabindex="0"
>
  {#if isEditing}
    <div class="edit-form">
      <form onsubmit={saveEdit}>
        <textarea
          class="edit-input"
          bind:value={editedQuestion}
          placeholder="Enter question"
          rows="5"
        ></textarea>
        <textarea
          class="edit-input"
          bind:value={editedAnswer}
          placeholder="Enter answer"
          rows="5"
        ></textarea>
        <div class="button-group">
          <button type="button" class="cancel-button" onclick={cancelEdit}>
            Cancel
          </button>
          <button type="submit" class="save-button">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  {:else}
    <div class="flashcard-content flashcard-front">
      <p>{question}</p>
      <div class="flip-indicator">Click to flip</div>
    </div>
    <div class="flashcard-content flashcard-back">
      <p>{answer}</p>
      <div class="flip-indicator">Click to flip</div>
    </div>
  {/if}
</div>

<div class="card-menu">
  <button type="button" class="menu-dots" onclick={toggleMenu}>⋮</button>
  {#if showMenu}
    <div class="card-menu-items">
      <button type="button" class="menu-item" onclick={startEdit}>
        ✏️ Edit
      </button>
      <button type="button" class="menu-item" onclick={deleteCard}>
        🗑️ Delete
      </button>
    </div>
  {/if}
</div>

<style>
  .flashcard {
    margin: 0.5rem auto;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #fff;
    cursor: pointer;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    position: relative;
    width: 120%;
    max-width: 800px;
    height: 400px;
    padding: 2rem;
    left: 50%;
    transform: translateX(-50%);
  }

  .flashcard.flipped {
    transform: translateX(-50%) rotateY(180deg);
  }

  .flashcard-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    box-sizing: border-box;
    transform-style: preserve-3d;
  }

  .flashcard-front p,
  .flashcard-back p {
    margin: 0;
    padding: 1rem;
    width: 100%;
    flex: 1;
    text-align: center;
    box-sizing: border-box;
    font-size: 1.5rem;
    margin-bottom: 2rem;
    pointer-events: none;
  }

  .flashcard:not(.flipped) .flashcard-front p {
    pointer-events: auto;
    overflow-y: auto;
  }

  .flashcard.flipped .flashcard-back p {
    pointer-events: auto;
    overflow-y: auto;
  }

  .flashcard.flipped .flashcard-front p,
  .flashcard:not(.flipped) .flashcard-back p {
    overflow: hidden;
  }

  .flashcard-front,
  .flashcard-back {
    width: 100%;
    height: 100%;
    position: absolute;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    pointer-events: none;
  }

  .flashcard:not(.flipped) .flashcard-front,
  .flashcard.flipped .flashcard-back {
    pointer-events: auto;
  }

  .flashcard-back {
    transform: rotateY(180deg);
  }

  .flashcard-front p::-webkit-scrollbar,
  .flashcard-back p::-webkit-scrollbar {
    width: 6px;
  }

  .flashcard-front p::-webkit-scrollbar-track,
  .flashcard-back p::-webkit-scrollbar-track {
    background: transparent;
  }

  .flashcard-front p::-webkit-scrollbar-thumb,
  .flashcard-back p::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }

  .flip-indicator {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    font-size: 1rem;
    color: #888;
    pointer-events: none;
  }

  .card-menu {
    position: fixed; /* Make it fixed */
    top: 6rem; /* Adjust as needed */
    right: 2rem; /* Adjust as needed */
    z-index: 1000; /* Ensure it's above everything */
  }

  .menu-dots {
    cursor: pointer;
    padding: 0.5rem;
    border: none;
    background: none;
    font-size: 1.5rem;
    color: #666;
    opacity: 1; /* Always visible */
  }

  .card-menu-items {
    position: absolute;
    right: 0;
    top: 100%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    min-width: 120px;
    z-index: 31;
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

  .edit-form {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    padding: 2rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    z-index: 20;
    transform: rotateY(0deg);
  }

  .edit-input {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
    min-height: 100px;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .save-button {
    padding: 0.5rem 1rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .cancel-button {
    padding: 0.5rem 1rem;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .save-button:hover {
    background-color: #45a049;
  }

  .cancel-button:hover {
    background-color: #da190b;
  }
</style>
