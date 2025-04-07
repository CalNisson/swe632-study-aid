<script>
import Deck from './Deck.svelte';
let { decks, selectedDeck, handleDeckChange } = $props();

</script>

<div>
	<div class="flex flex-col gap-2">
        {#each decks as deck, index}
          {#if index === selectedDeck}
          <div class="flex justify-center bg-cyan-800 text-white rounded-2xl text-2xl p-4 border-4 border-yellow-400 scale-105" >
            {deck.name}
          </div>  
          {:else}
            <button class="flex justify-center hover:bg-cyan-400 bg-cyan-800 text-white rounded-2xl text-2xl p-4 cursor-pointer transition-all duration-300" onclick={() => handleDeckChange(index)} >
              {deck.name}
            </button>
          {/if}
        {/each}
    </div>
</div>