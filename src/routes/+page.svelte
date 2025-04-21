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
  
  function selectDeck(deck) {
    // Check for a valid deck
    if (!decks[deck]) return;
    isShuffled = false;
    shuffledIndices = 
  
    // Set the new selected deck
    selectedDeck = deck;
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

  // New function for the plus button implementation
  function addNewDeck() {
    if (newDeckName.trim() !== "") {
      const newDeck = { name: newDeckName, flashcards: [] };
      decks = [...decks, newDeck];
      handleDeckChange(decks.length - 1);  // Notify parent component and open new deck
      showSuccessMessage(`Deck "${newDeckName}" created successfully!`);
      newDeckName = "";
      showDeckInput = false;
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
<div class="flex flex-col w-1/4 bg-gray-500 p-4 gap-2">
  <!-- this div shows our clickable decks -->
  <div class="h-4/8 bg-gray-700 rounded-2xl overflow-auto p-4">
    <div class="flex items-center justify-center bg-cyan-900 border-2 border-black text-white rounded-md text-3xl p-4 shadow-lg">
      Active Decks:
    </div>

    <div class="p-2">
      <Menu {decks} {handleDeckChange} {selectedDeck}/> 
      
      <!-- Add the plus button/input field here -->
      <div class="mt-3 flex items-center">
        {#if showDeckInput}
          <div class="flex w-full bg-cyan-600 border-2 border-black rounded-md p-2 text-white">
            <input
              type="text"
              class="flex-grow bg-transparent border-none text-white placeholder-gray-300 focus:outline-none"
              bind:value={newDeckName}
              placeholder="Enter deck name"
              onkeydown={(e) => e.key === 'Enter' && addNewDeck()}
              autofocus
            />
            <button 
              class="ml-2 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center text-white"
              onclick={addNewDeck}
            >
              +
            </button>
          </div>
        {:else}
          <button 
            class="w-full bg-cyan-600 border-2 border-black rounded-md p-3 text-white flex items-center justify-center"
            onclick={() => showDeckInput = true}
          >
            <span class="text-3xl">+</span>
            <span class="ml-2">Add New Deck</span>
          </button>
        {/if}
      </div>
    </div>
    
    {#if decks.length === 0 && !showDeckInput}
      <div class="p-4 text-center text-white bg-cyan-900 border-2 border-black rounded-md text-3xl shadow-lg w-auto h-auto mt-3">
        You have not made any decks. Click on "Add Deck" to get started!
      </div>
    {/if}
  </div>
  
  <!-- this div shows flashcard previews for the selected deck -->
  <div class=" flex flex-col gap-1 h-4/8 bg-gray-700 rounded-2xl p-4 overflow-auto">
    {#if decks.length == 0}
      <div class="p-4 text-center text-white bg-cyan-900 border-2 border-black rounded-md text-3xl shadow-lg w-auto h-auto">
        Make a deck and see previews of your flashcards here!
      </div>
    {:else if decks.length > 0 && decks[selectedDeck].flashcards.length == 0}
      <div class="flex items-center justify-center bg-cyan-900 border-2 border-black text-white rounded-md text-3xl p-4 shadow-lg">
        There are no flashcards in this deck!
      </div>
    {:else}
      <div class="p-4 text-center text-white bg-cyan-900 border-2 border-black rounded-md text-3xl shadow-lg w-auto h-auto">
        Flashcard previews:
      </div>
      {#each decks[selectedDeck].flashcards as flashcard, i}
        <div class="p-4 text-center text-white scale-90 bg-cyan-600 border-2 border-black rounded-md text-3xl shadow-lg min-h-20 truncate w-auto cursor-pointer"
          onclick={() => {
            decks[selectedDeck].currentCardIndex = i;
          }}
        >
          Q: {flashcard.question}
        </div>
      {/each}
    {/if}
  </div>
</div>
        
  <!-- This div is column 2 - displays actual flashcards -->
  <div class="flex-col w-3/4 bg-gray-400 p-4">
      <div class="flex justify-center bg-gray-700 p-6 gap-4">
        <!-- {#if showDeckInput}
        <input
          type="text"
          class="text-input bg-gray-100 rounded-md p-2"
          bind:value={newDeckName}
          placeholder="Enter deck name"
        />
        <button class="px-4 py-2 text-base border-none rounded-md bg-blue-500 text-white cursor-pointer self-end" onclick={() => { addDeck(newDeckName); newDeckName = ""; showDeckInput = false;} }>Save Deck</button>
        {:else}
          <button class="px-4 py-2 text-base border-none rounded-md bg-blue-500 text-white cursor-pointer self-end" onclick={() => showDeckInput = true}>Add Deck</button>
        {/if} -->
      </div>
      <div class="flex justify-center grow bg-gray-400 p-4">
        <FlashcardList {decks} {handleDeckChange} {selectedDeck} {addDeck} {addFlashcard} {showSuccessMessage} {importDeck} {removeDeck} {removeFlashcard} {handleEditDeck} currentCardIndex={decks[selectedDeck]?.currentCardIndex}/>
      </div>
      <Toast message={toastMessage} show={showToast} />
  </div>
</main>