import View from "./view.js";
import previewView from "./previewView.js";

class ResultView extends View {
  _parentElement = document.querySelector(".results");
  _successMessage = "";
  _errorMessage = "No recipes found for your search. Please try again!";

  _generateMarkup() {
    return this._data
      .map((recipe) => previewView.render(recipe, false))
      .join("");
  }
}

export default new ResultView();
