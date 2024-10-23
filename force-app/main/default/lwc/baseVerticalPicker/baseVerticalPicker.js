import { LightningElement, api, track } from "lwc";

export default class BaseVerticalPicker extends LightningElement {
  @track _items;
  @api
  set items(value) {
    // need a better clone method
    this._items = JSON.parse(JSON.stringify(value));
  }
  get items() {
    return this._items;
  }

  @api headerLabel;
  @api type;

  computedVariant;
  @api
  set variant(value) {
    switch (value) {
      case "small":
        this.computedVariant = "slds-visual-picker slds-visual-picker_small";
        break;
      case "medium":
        this.computedVariant = "slds-visual-picker slds-visual-picker_medium";
        break;
      case "large":
        this.computedVariant = "slds-visual-picker slds-visual-picker_large";
        break;
      case "vertical":
        this.computedVariant = "slds-visual-picker slds-visual-picker_vertical";
        break;
      default:
        this.computedVariant = "slds-visual-picker slds-visual-picker_medium";
        break;
    }
  }
  get variant() {
    return this.computedVariant;
  }

  selectionComp;
  @api
  set name(value) {
    // dynamic import of component name
    import(value)
      .then(({ default: ctor }) => {
        this.selectionComp = ctor;
      })
      .catch((err) => console.error("Error importing component", err));
  }
  get name() {
    return this.selectionComp;
  }

  handleClick(event) {
    // find which items were previously selected if applicable and turn them off
    if (this.type === "radio") {
      this._items.forEach((item) => {
        if (item.key === +event.target.value) {
          item.checked = !item.checked;
        } else if (item.checked === true) {
          item.checked = false;
        }
      });
    } else {
      this._items[+event.target.value].checked =
        !this._items[+event.target.value].checked;
    }
    // send event to parent to let it know which item was selected
  }
}