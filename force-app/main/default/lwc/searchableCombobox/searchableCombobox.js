import { LightningElement, track, api } from "lwc";

export default class searchableCombobox extends LightningElement {
  @track combobox = {
    label: "",
    labelforId: "combobox-label-for-id-13",
    labelId: "combobox-label-id-13",
    value: "",
    placeholder: "",
    disabled: false,
    options: [],
    searchResults: [],
    showSearchResults: false,
    closeMode: false,
    controlsId: "combobox-controls-id-13",
    inputId: "combobox-input-id-13",
    currentHighlightIndex: 0
  };

  get value() {
    return this.combobox.value;
  }

  set value(val) {
    this.combobox.value = val;
  }

  @api
  get label() {
    return this.combobox.label;
  }

  set label(value) {
    this.combobox.label = value;
  }

  @api
  get placeholder() {
    return this.combobox.placeholder;
  }
  set placeholder(value) {
    this.combobox.placeholder = value;
  }

  @api
  get options() {
    return this.combobox.options;
  }

  set options(value) {
    this.combobox.options = value;
    this.combobox.searchResults = this.sortResults(
      JSON.parse(JSON.stringify(value))
    );
  }

  @api
  get disabled() {
    return this.combobox.disabled;
  }

  set disabled(value) {
    this.combobox.disabled = value;
  }

  handleKeyDown(event) {
    if (event.keyCode === 13 || event.keyCode === 9) {
      event.preventDefault();
      event.stopPropagation();
      // select current option and collapse options

      this.combobox.value =
        this.combobox.searchResults[this.combobox.currentHighlightIndex].label;

      let container = this.template.querySelector(".slds-combobox_container");
      container.classList.add("slds-has-selection");
      // fire custom event to parent to notify value selection
      this.dispatchEvent(
        new CustomEvent("selection", {
          detail: {
            value: {
              id: this.combobox.searchResults[
                this.combobox.currentHighlightIndex
              ].value,
              value:
                this.combobox.searchResults[this.combobox.currentHighlightIndex]
                  .label
            }
          }
        })
      );
      let input = this.template.querySelector("input");
      input.focus();
      input.readOnly = true;
      this.combobox.showSearchResults = false;
      this.combobox.closeMode = true;
    } else if (event.keyCode === 38) {
      event.preventDefault();
      event.stopPropagation();
      let optionList = this.template.querySelectorAll(".slds-listbox__option");
      let oldElement = optionList[this.combobox.currentHighlightIndex];
      // if at first go to last option
      if (this.combobox.currentHighlightIndex === 0) {
        this.combobox.currentHighlightIndex =
          this.combobox.searchResults.length - 1;
      } else {
        // go to previous option
        this.combobox.currentHighlightIndex--;
      }
      let newElement = optionList[this.combobox.currentHighlightIndex];
      oldElement.classList.remove("slds-has-focus");
      newElement.classList.add("slds-has-focus");
      oldElement.setAttribute("aria-selected", "false");
      newElement.setAttribute("aria-selected", "true");
      let id = newElement.getAttribute("id");
      let input = this.template.querySelector("input");
      input.setAttribute("aria-activedescendant", id);
      let parentElem = this.template.querySelector("div[role='listbox']");
      this.scrollIntoViewIfNeeded(newElement, parentElem);
    } else if (event.keyCode === 27) {
      event.preventDefault();
      event.stopPropagation();
      // close combobox and remove focus
    } else if (event.keyCode === 40) {
      event.preventDefault();
      event.stopPropagation();
      let optionList = this.template.querySelectorAll(".slds-listbox__option");
      let oldElement = optionList[this.combobox.currentHighlightIndex];
      // if at last go to first option
      if (
        this.combobox.currentHighlightIndex ===
        this.combobox.searchResults.length - 1
      ) {
        this.combobox.currentHighlightIndex = 0;
      } else {
        // go to next option
        this.combobox.currentHighlightIndex++;
      }
      let newElement = optionList[this.combobox.currentHighlightIndex];
      oldElement.classList.remove("slds-has-focus");
      newElement.classList.add("slds-has-focus");
      oldElement.setAttribute("aria-selected", "false");
      newElement.setAttribute("aria-selected", "true");
      let id = newElement.getAttribute("id");
      let input = this.template.querySelector("input");
      input.setAttribute("aria-activedescendant", id);
      let parentElem = this.template.querySelector("div[role='listbox']");
      this.scrollIntoViewIfNeeded(newElement, parentElem);
    }
  }

  scrollIntoViewIfNeeded(element, scrollingParent) {
    if (element) {
      const parentRect = scrollingParent.getBoundingClientRect();
      const findMeRect = element.getBoundingClientRect();
      if (findMeRect.top < parentRect.top) {
        if (element.offsetTop + findMeRect.height < parentRect.height) {
          scrollingParent.scrollTop = 0;
        } else {
          scrollingParent.scrollTop = element.offsetTop;
        }
      } else if (findMeRect.bottom > parentRect.bottom) {
        scrollingParent.scrollTop += findMeRect.bottom - parentRect.bottom;
      }
    }
  }

  handleLostFocus(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!event.relatedTarget) {
      this.combobox.showSearchResults = false;
      let container = this.template.querySelector(".slds-combobox_container");
      container.classList.remove("slds-has-selection");
      let input = this.template.querySelector("input");
      input.classList.remove("slds-has-focus");
      return;
    }
    let classArray = [...event.relatedTarget.classList];
    if (classArray.includes("slds-dropdown")) {
      event.currentTarget.classList.add("slds-has-focus");
      return;
    }
    let input = event.currentTarget;
    input.classList.remove("slds-has-focus");
    this.combobox.showSearchResults = false;
  }

  handleGainFocus(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.combobox.closeMode) {
      this.value = "";
      this.combobox.closeMode = false;
      let input = this.template.querySelector("input");
      input.readOnly = false;
      input.classList.add("slds-input");
      input.classList.remove("hover-close-mode");
      input.classList.remove("slds-input_faux");
      let container = this.template.querySelector(".slds-combobox_container");
      container.classList.remove("slds-has-selection");
      this.combobox.searchResults = this.combobox.options;

      // send customevent letting parent know selection is removed
      this.dispatchEvent(
        new CustomEvent("removeselection", {
          detail: { value: event.currentTarget.dataset }
        })
      );
      return;
    }
    event.target.ariaExpanded = true;
    this.combobox.showSearchResults = true;

    // find first option and select it
    let firstOption = this.template.querySelector(".slds-listbox__option");
    if (!firstOption) {
      return;
    }
    firstOption.setAttribute("aria-selected", "true");
    firstOption.classList.add("slds-has-focus");
    let id = firstOption.getAttribute("id");

    let input = this.template.querySelector("input");
    input.setAttribute("aria-activedescendant", id);
    this.combobox.currentHighlightIndex = this.combobox.searchResults.findIndex(
      (option) => option.label === id.split("-")[0].trim()
    );
  }

  handleInputHover() {
    if (this.combobox.closeMode) {
      let input = this.template.querySelector("input");
      input.classList.add("hover-close-mode");
    }
  }

  handleOptionMouseHover(event) {
    // check for currently selected option and remove if necessary
    let currentOption = this.template.querySelector(".slds-has-focus");
    if (currentOption) {
      currentOption.classList.remove("slds-has-focus");
      currentOption.setAttribute("aria-selected", "false");
    }
    let id = event.currentTarget.getAttribute("id");
    event.currentTarget.classList.add("slds-has-focus");
    event.currentTarget.setAttribute("aria-selected", "true");
    let input = this.template.querySelector("input");
    input.setAttribute("aria-activedescendant", id);
    this.combobox.currentHighlightIndex = this.combobox.searchResults.findIndex(
      (option) => option.label === id.split("-")[0].trim()
    );
  }

  handleOptionMouseOut(event) {
    event.currentTarget.classList.remove("slds-has-focus");
    event.currentTarget.setAttribute("aria-selected", "false");
  }

  handleCloseButtonHover(event) {
    event.target.classList.add(".icon-hovered");
  }

  handleSelection(event) {
    this.combobox.value = event.currentTarget.dataset.value;
    let container = this.template.querySelector(".slds-combobox_container");
    container.classList.add("slds-has-selection");
    // fire custom event to parent to notify value selection
    this.dispatchEvent(
      new CustomEvent("selection", {
        detail: { value: event.currentTarget.dataset }
      })
    );
    let input = this.template.querySelector("input");
    input.classList.remove("slds-input");
    input.classList.add("slds-input_faux");
    input.readOnly = true;
    this.combobox.showSearchResults = false;
    this.combobox.closeMode = true;
  }

  handleOptionDivClick() {}

  handleInputChange(event) {
    this.combobox.value = event.target.value;
    this.searchFilter(event.target.value);
  }

  searchFilter(string) {
    this.combobox.searchResults = this.combobox.options.filter((option) =>
      option.label.toLowerCase().includes(string.toLowerCase())
    );
    this.combobox.searchResults = this.sortResults(
      this.combobox.searchResults,
      string
    );
  }

  sortResults(array, string) {
    return array
      .sort((a, b) => {
        const nameA = a.label.toLowerCase();
        const nameB = b.label.toLowerCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      })
      .sort((a, b) => {
        const nameA = a.label.toLowerCase();
        const nameB = b.label.toLowerCase();

        if (nameA.startsWith(string?.at(0))) {
          return -1;
        }
        if (nameB.startsWith(string?.at(0))) {
          return 1;
        }
        return 0;
      })
      .slice(0, 200);
  }

  handleOptionScroll(event) {}
}