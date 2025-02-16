import { writable } from 'svelte/store';

export const categoryStore = writable({
    categories: JSON.parse(localStorage.getItem("categories")) || {},
    currentCategory: null,
});

export function addCategory() {
    const categoryName = prompt("Enter new category name:");
    categoryStore.update(state => {
        if (!state.categories) {
            state.categories = {};  // Ensure categories array is initialized
        }
        if (categoryName && !state.categories[categoryName]) {
            state.categories[categoryName] = [];
            localStorage.setItem("categories", JSON.stringify(state.categories));
        }
        return state;
    });
}

export function deleteCategory(categoryName) {
    if (confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
        categoryStore.update(state => {
        if (state.categories.hasOwnProperty(categoryName)) {
            delete state.categories[categoryName];  // Remove the category from the object
            localStorage.setItem("categories", JSON.stringify(state.categories));
        }
        return state;
        });
    }
  }

export function setCurrentCategory(index) {
    categoryStore.update(state => {
        state.currentCategory = index;
        return state;
    });
}
