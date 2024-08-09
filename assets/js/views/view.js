import icons from "url:../../images/icons.svg";

class View {
  _data;

  /**
   * Clear the content of the parent element
   * @this {object} View instance
   * @memberof View
   */
  _clear() {
    this._parentElement.innerHTML = "";
  }

  /**
   * Render the recived object to the DOM
   * @param {object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] If false, create markup string insted of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render=false
   * @this {object} View instance
   * @memberof View
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderMessage("error");

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  /**
   * Update the DOM with new data without re-rendering the entire view
   * @param {object | object[]} data The new data to be used for updating the view
   * @this {object} View instance
   * @memberof View
   */
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll("*"));
    const curElements = Array.from(this._parentElement.querySelectorAll("*"));

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // console.log(curEl, newEl.isEqualNode(curEl));

      // Updates changed TEXT
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ""
      ) {
        // console.log('💥', newEl.firstChild.nodeValue.trim());
        curEl.textContent = newEl.textContent;
      }

      // Updates changed ATTRIBUES
      if (!newEl.isEqualNode(curEl))
        Array.from(newEl.attributes).forEach((attr) =>
          curEl.setAttribute(attr.name, attr.value)
        );
    });
  }

  /**
   * Render a spinner to the DOM to indicate loading state
   * @this {object} View instance
   * @memberof View
   */
  renderSpinner() {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  /**
   * Render a message to the DOM
   * @param {string} type The type of message to be rendered ('success' or 'error')
   * @param {string} [message] The message to be displayed. If not provided, a default message is used.
   * @this {object} View instance
   * @memberof View
   */
  renderMessage(type, message) {
    let symbol, msg;
    switch (type) {
      case "success":
        symbol = "smile";
        msg = message ?? this._successMessage;
        break;
      case "error":
        symbol = "alert-triangle";
        msg = message ?? this._errorMessage;
        break;
    }

    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}.svg#icon-${symbol}"></use>
          </svg>
        </div>
        <p>${msg}</p>
      </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }
}

export default View;
