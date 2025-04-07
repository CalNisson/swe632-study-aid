<script>
  import FlashcardList from '$lib/FlashcardList.svelte';
	import Menu from '$lib/Menu.svelte';
  import Toast from '$lib/Toast.svelte';

  let decks = $state([]);
  let selectedDeck = $state(null);
  let newDeckName = $state("");
  let showDeckInput = $state(false);
  let showMenu = $state(false);

  let showToast = $state(false);
  let toastMessage = $state("");

  function showSuccessMessage(message) {
    toastMessage = message;
    showToast = true;
    
    setTimeout(() => {
      showToast = false;
    }, 3000);
  }

  function handleDeckChange(deck) {
    console.log("handling deck change in page.svelet");
    selectedDeck = deck;
    console.log("selectedDeck = " + JSON.stringify(selectedDeck, null, 2));
  }

  function addDeck(newDeckName) {
    if (newDeckName.trim() !== "") {
      const newDeck = { name: newDeckName, flashcards: [] };
      decks = [...decks, newDeck];
      handleDeckChange(decks.length - 1);  // Notify parent component of the new deck
      console.log("decks in flashcardlist = " + decks);
      showSuccessMessage(`Deck "${newDeckName}" created successfully!`);
    }
  }

  function handleEditDeck(event) {
    const { newName } = event.detail;
    // decks = decks.map(deck => 
    //   deck === selectedDeck 
    //     ? { ...deck, name: newName }
    //     : deck
    // );
    decks[selectedDeck].name = newName;
    //selectedDeck = { ...selectedDeck, name: newName };
  }

  function importDeck(event) {
    const file = event.detail.file;
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const importedFlashcards = text.split("\n").map(line => {
            const [q, a] = line.split("|").map(part => part.trim());
            return q && a ? { question: q, answer: a } : null;
        }).filter(Boolean);

        decks[selectedDeck].flashcards = [...decks[selectedDeck].flashcards, ...importedFlashcards];

    };
    reader.readAsText(file);
  }

  function removeDeck(index) {
    const removedDeck = decks.splice(index, 1);
    if (decks.length === 0) {
      selectedDeck = null;
    }   
    else {
      if (index === 0) {
        selectedDeck = 0; // Select the first deck if the first one is removed
      } else {
        selectedDeck = selectedDeck - 1; // Adjust selectedDeck index
      }
    }
    console.log("new selectedDeck = " + selectedDeck);
    showSuccessMessage(`Deck "${removedDeck[0].name}" removed successfully!`); 
  }

  function removeFlashcard(event) {
    const { index } = event.detail;
    if (confirm('Are you sure you want to delete this flashcard?')) {
      if (selectedDeck !== null) {
        decks[selectedDeck].flashcards.splice(index, 1);
        decks = [...decks];
      }
    }
    showSuccessMessage("Flashcard deleted successfully!");
  }

  function addFlashcard(newQuestion, newAnswer) {
    if (newQuestion.trim() !== "" && newAnswer.trim() !== "" && selectedDeck !== null) {
      const newCard = { question: newQuestion, answer: newAnswer };
      decks[selectedDeck].flashcards = [...decks[selectedDeck].flashcards, newCard];
      console.log("inside addFlashcard:" + JSON.stringify(selectedDeck, null, 2));
      showSuccessMessage("Flashcard added successfully!");
    }
  }

  function handleShowMenu() {
    console.log("Button clicked");
    console.log("decks =" + decks);
    showMenu = !showMenu;
}

</script>

<main class="flex w-full h-full">
  <!-- {JSON.stringify(decks, null, 2)} -->

  <!-- This div is column 1 - left side menus -->
  <div class="flex-col w-1/4 bg-gray-500 p-4">
    {#if decks.length > 0}
      <!-- <div class="flex items-center justify-center bg-cyan-800 text-white rounded-2xl text-2xl p-4">
        Active Decks
      </div> -->
      <div class="flex items-center justify-center bg-cyan-900 text-white rounded-2xl text-3xl p-8 shadow-lg">
        Active Decks:
      </div>

      <div class="p-2">
        <Menu {decks} {handleDeckChange} {selectedDeck}/> 
      </div>
    {:else}
      <div class="p-4 text-center text-white text-2xl bg-cyan-800 rounded-2xl">
        You have not made any decks. Click on "Add Deck" to get started!
      </div>
    {/if}
  </div>
        
  <!-- This div is column 2 - displays actual flashcards -->
  <div class="flex-col w-3/4 bg-gray-400 p-4">
      <div class="flex justify-center bg-gray-700 p-6 gap-4">
        {#if showDeckInput}
        <input
          type="text"
          class="text-input bg-gray-100 rounded-md p-2"
          bind:value={newDeckName}
          placeholder="Enter deck name"
        />
        <button class="px-4 py-2 text-base border-none rounded-md bg-blue-500 text-white cursor-pointer self-end" onclick={() => { addDeck(newDeckName); newDeckName = ""; showDeckInput = false;} }>Save Deck</button>
        {:else}
          <button class="px-4 py-2 text-base border-none rounded-md bg-blue-500 text-white cursor-pointer self-end" onclick={() => showDeckInput = true}>Add Deck</button>
        {/if}
      </div>
      <div class="flex justify-center grow bg-gray-400 p-4">
        <FlashcardList {decks} {handleDeckChange} {selectedDeck} {addDeck} {addFlashcard} {showSuccessMessage} {importDeck} {removeDeck} {removeFlashcard} {handleEditDeck}/>
      </div>
      <Toast message={toastMessage} show={showToast} />
  </div>
</main>