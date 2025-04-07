<script>
    import { createEventDispatcher } from "svelte";
  
    export let show = false;  // Controls modal visibility
    let file = null;
  
    const dispatch = createEventDispatcher();
  
    function handleFileChange(event) {
      file = event.target.files[0];
    }
  
    function handleImport() {
      if (file) {
        dispatch("import", { file });
        closeModal();
      } else {
        alert("Please select a file first.");
      }
    }
  
    function closeModal() {
      dispatch("close");
    }

    function downloadTemplateFile() {
      const content = `question1 | answer1
question2 | answer2
question3 | answer3`;

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "deck_template.txt";
      a.click();

      URL.revokeObjectURL(url);
    }

  </script>
  
  <style>
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
  
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      position: relative;
      z-index: 10000;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
  
    .modal button {
      margin-top: 10px;
      padding: 8px 16px;
      cursor: pointer;
      border: 2px solid #000;
      border-radius: 4px;
    }

    input, textarea {
        width: 100%;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
  </style>
  
  {#if show}
    <div class="modal" on:click={closeModal}>
      <div class="modal-content" on:click|stopPropagation>
        <h2>Import Deck</h2>
        <input type="file" accept=".txt" on:change={handleFileChange} />
        <h3>File should be .txt with each line corresponding to a flashcard</h3>
        <h3>formatted as (without brackets):</h3>
        <h3><strong>{'{'}question{'}'} | {'{'}answer{'}'}</strong></h3>
        <button on:click={downloadTemplateFile}>Download Template</button>
        <button on:click={handleImport}>Import</button>
        <button on:click={closeModal}>Cancel</button>
      </div>
    </div>
  {/if}
  