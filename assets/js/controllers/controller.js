import { MODEL_CLOSE_SECOND } from "../config.js";
import * as model from "../models/model.js";
import searchView from "../views/searchView.js";
import resultView from "../views/resultView.js";
import paginationView from "../views/PaginationView.js";
import recipeView from "../views/recipeView.js";
import addRecipeView from "../views/addRecipeView.js";
import bookmarkView from "../views/bookmarkView.js";

import "core-js/stable";
import "regenerator-runtime/runtime";

// Enable Parcel's hot module replacement (HMR) for auto refresh off
// if (module.hot) module.hot.accept();

const controlSearchResualts = async function () {
  try {
    // 1. Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2. Render spinner
    resultView.renderSpinner();

    // 3. Load search results
    await model.loadSearchResaults(query);

    // 4. Render results
    resultView.render(model.getSearchResultsPage());

    // 5. Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (error) {
    console.error(error);
    recipeView.renderMessage("error");
  }
};

const controlPagination = function (goToPage) {
  // 1. Render results
  resultView.render(model.getSearchResultsPage(goToPage));

  // 2. Render initial pagination buttons
  paginationView.render(model.state.search);
};

const controlRecipe = async function () {
  try {
    // 1. Get recipe id
    const id = window.location.hash.slice(1);
    if (!id) return;

    // 2. Render spinner
    recipeView.renderSpinner();

    // 3. Update results view to mark selected search result
    resultView.update(model.getSearchResultsPage());

    // 4. Updating bookmarks view
    bookmarkView.update(model.state.bookmarks);

    // 5. Load recipe
    await model.loadRecipe(id);

    // 6. Render recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    console.error(error);
    recipeView.renderMessage("error");
  }
};

const controlServings = function (newServings) {
  // 1. Update the recipe servings (in state)
  model.updateServings(newServings);

  // 2. Update the recipe view
  recipeView.update(model.state.recipe);
};

const controlBookmarks = function () {
  // 1. Init render bookmark
  bookmarkView.render(model.state.bookmarks);
};

const controlAddBookmark = function () {
  // 1. Add / remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2. Update the recipe view
  recipeView.update(model.state.recipe);

  // 3. Render bookmark
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // 1. Render spinner
    addRecipeView.renderSpinner();

    // 2. Upload the new recipe data
    await model.uploadReciepe(newRecipe);

    // 3. Render recipe
    recipeView.render(model.state.recipe);

    // 4. Success message
    addRecipeView.renderMessage("success");

    // 5. Render bookmark view
    bookmarkView.render(model.state.bookmarks);

    // 6. Change ID in URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // 7. close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SECOND * 1000);
  } catch (error) {
    console.error(error);
    addRecipeView.renderMessage("error", error.message);
  }
};

const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
  searchView.addHandlerSearch(controlSearchResualts);
  paginationView.addHandlerClick(controlPagination);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerUpdateServings(controlServings);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
