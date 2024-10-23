import { LightningElement, api } from "lwc";

export default class BaseVerticalPickerItem extends LightningElement {
  selectionComp;

  @api key;
  @api disabled;
  @api params;

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
    return this._selectionComp;
  }
}