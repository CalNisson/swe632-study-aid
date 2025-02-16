import { writable } from 'svelte/store';

export const flashcardStore = writable([]);

export function loadFlashcards(currentDeck) {
  const flashcards = JSON.parse(localStorage.getItem(currentDeck)) || [];
  flashcardStore.set(flashcards);
}

export function addFlashcard(currentDeck, question, answer) {
  flashcardStore.update(flashcards => {
    if (currentDeck && question.trim() && answer.trim()) {
      const newFlashcards = [...flashcards, { question, answer, flipped: false }];
      localStorage.setItem(currentDeck, JSON.stringify(newFlashcards));
      return newFlashcards;
    }
    return flashcards;
  });
}

export function deleteFlashcard(currentDeck, index) {
    if (confirm(`Are you sure you want to delete this flashcard? This action cannot be undone.`)) {
        flashcardStore.update(flashcards => {
            const updatedFlashcards = flashcards.filter((_, i) => i !== index);
            localStorage.setItem(currentDeck, JSON.stringify(updatedFlashcards));
            return updatedFlashcards;
        });
    }
}

export function importDeckFromText(currentDeck, text) {
    flashcardStore.update(flashcards => {
        const importFlashcards = text.split("\n").map(line => {
        const [q, a] = line.split("|").map(part => part.trim());
        return q && a ? { question: q, answer: a } : null;
        }).filter(Boolean);

        const newFlashcards = [...flashcards, ...importFlashcards];
        localStorage.setItem(currentDeck, JSON.stringify(newFlashcards));
        return newFlashcards
    });
}

export function importDeckFromFile(currentDeck, event) {
    const file = event?.target?.files?.[0];
    if (!file) {
        console.error("No file selected");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      importDeckFromText(currentDeck, e.target.result);
    };
    reader.readAsText(file);
  }