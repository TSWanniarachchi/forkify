import { API_URL, API_KEY, RESULT_PER_PAGE } from "../config.js";
import { AJAX } from "../helpers.js";

/**
 * Application state management object
 * @typedef {Object} State
 * @property {Object} search - Search related data.
 * @property {string} search.query - The current search query.
 * @property {Array<Object>} search.results - The list of search results.
 * @property {number} search.page - The current page number.
 * @property {number} search.resultsPerPage - The number of results per page.
 * @property {Object} recipe - The current recipe.
 * @property {Array<Object>} bookmarks - The list of bookmarked recipes.
 */
const state = {
  search: {
    query: "",
    results: [],
    page: 1,
    resultsPerPage: RESULT_PER_PAGE,
  },
  recipe: {},
  bookmarks: [],
};

/**
 * Creates a recipe object from the API response data.
 * @param {Object} data - The API response data.
 * @returns {Object} The formatted recipe object.
 */
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

/**
 * Loads search results based on the query and updates the state.
 * @async
 * @param {string} query The search query.
 * @throws Will throw an error if the request fails.
 */
const loadSearchResaults = async function (query) {
  try {
    state.search.query = query;
    state.search.page = 1;

    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);

    state.search.results = data.data.recipes.map((recipe) => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }),
      };
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Gets search results for the specified page.
 * @param {number} [page=state.search.page] The page number.
 * @returns {Object[]} The search results for the specified page.
 */
const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; // 0;
  const end = page * state.search.resultsPerPage; // 9 ;

  return state.search.results.slice(start, end);
};

/**
 * Loads a recipe by ID and updates the state.
 * @async
 * @param {string} id The ID of the recipe.
 * @throws Will throw an error if the request fails.
 */
const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some((bookmark) => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates the servings for the current recipe.
 * @param {number} newServings The new number of servings.
 */
const updateServings = function (newServings) {
  const oldServings = state.recipe.servings;

  state.recipe.ingredients.forEach((ingredient) => {
    ingredient.quantity = (ingredient.quantity / oldServings) * newServings;
  });
  state.recipe.servings = newServings;
};

/**
 * Adds a recipe to the bookmarks and updates the state.
 * @param {Object} recipe The recipe to be bookmarked.
 */
const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark
  if (state.recipe.id === recipe.id) state.recipe.bookmarked = true;

  persistBookmark();
};

/**
 * Deletes a bookmark by ID and updates the state.
 * @param {string} id The ID of the recipe to be unbookmarked.
 */
const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex((recipe) => recipe.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current reciope as NOT bookmark
  if (state.recipe.id === id) state.recipe.bookmarked = false;

  persistBookmark();
};

/**
 * Persists bookmarks to local storage.
 */
const persistBookmark = function () {
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};

/**
 * Clears all bookmarks from local storage.
 */
const clearBookmark = function () {
  localStorage.clear("bookmarks");
};
// clearBookmark();

/**
 * Initializes the application by loading bookmarks from local storage.
 */
const init = function () {
  const storage = localStorage.getItem("bookmarks");
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

/**
 * Uploads a new recipe and updates the state.
 * @async
 * @param {Object} newRecipe The new recipe to be uploaded.
 * @throws Will throw an error if the request fails.
 */
const uploadReciepe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter((entry) => entry[0].includes("ingredient") && entry[1] !== "")
      .map((ing) => {
        const ingArr = ing[1].split(",").map((el) => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            "Wrong ingredient format! Please use the correct format :)"
          );

        const [quantity, unit, description] = ingArr;
        return { quantity: quantity || null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};

export {
  state,
  loadSearchResaults,
  getSearchResultsPage,
  loadRecipe,
  updateServings,
  addBookmark,
  deleteBookmark,
  uploadReciepe,
};
