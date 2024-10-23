import { LightningElement } from "lwc";
import US_CITIES from "@salesforce/resourceUrl/CitiesList";

export default class BirdSelection extends LightningElement {
  _categoryOptions = [];
  _birdOptions = [];
  _fullBirdList;
  _fullCountryCityList;
  _fullCountryList = [];
  _selectedCityList = [];
  selectedBird;
  selectedBirdCode;
  selectedCategory;
  selectedLatitude = 34.61;
  selectedLongitude = -86.75;
  selectedRadius = 25;
  selectedTime = 14;
  mapMarkers = [];
  noResultsMessage = false;
  birdDisabled = true;
  testValidity;

  get categoryOptions() {
    return this._categoryOptions;
  }

  set categoryOptions(value) {
    this._categoryOptions = value;
  }

  get birdOptions() {
    return this._birdOptions;
  }

  set birdOptions(value) {
    this._birdOptions = value;
  }

  get countryOptions() {
    return this._fullCountryList;
  }

  set countryOptions(value) {
    this._fullCountryList = value;
  }

  get cityOptions() {
    return this._selectedCityList;
  }

  set cityOptions(value) {
    this._selectedCityList = value;
  }

  handleBirdChange(event) {
    this.selectedBird = event.detail.value;
    this.selectedBirdCode = event.detail.value.id;
  }

  handleLocationChange(event) {
    let inputComp = this.template.querySelector("lightning-input-location");
    if (event.target.latitude.split(".")[1].length > 2) {
      inputComp.setCustomValidityForField(
        "Please enter a latitude with only 2 decimal places",
        "latitude"
      );
    } else {
      inputComp.setCustomValidityForField("", "latitude");
    }

    if (event.target.longitude.split(".")[1].length > 2) {
      inputComp.setCustomValidityForField(
        "Please enter a longitude with only 2 decimal places",
        "longitude"
      );
    } else {
      inputComp.setCustomValidityForField("", "longitude");
    }
    inputComp.reportValidity();
    this.selectedLatitude = event.target.latitude.substring(
      0,
      event.target.latitude.indexOf(".") + 3
    );
    this.selectedLongitude = event.target.longitude.substring(
      0,
      event.target.longitude.indexOf(".") + 3
    );
  }

  handleCategoryRemove(event) {
    this.birdDisabled = true;
  }

  handleBirdRemove(event) {}

  handleCountryChange(event) {
    console.log("country changed", event);
    // event.detail.value has the country name
    // event.detail.id has the country code
    let countryCode = event.detail.value.id;
  }
  handleCityChange(event) {
    console.log("city changed");
  }
  handleCountryRemove(event) {
    console.log("country removed");
  }
  handleCityRemove(event) {
    console.log("city removed");
  }

  async recentSightings(bird) {
    const url = `https://api.ebird.org/v2/data/obs/geo/recent/${bird}?lat=${this.selectedLatitude}&lng=${this.selectedLongitude}&dist=${this.selectedRadius}&back=${this.selectedTime}`;
    console.log("url:", url);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-ebirdapitoken": "stvbo0scnmac"
        }
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      console.log("json:", json);
      this.updateMapMarkers(json);
      if (json.length === 0) {
        this.noResultsMessage = true;
      } else {
        this.noResultsMessage = false;
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  updateMapMarkers(json) {
    this.mapMarkers = [];
    json.forEach((sighting) => {
      this.mapMarkers.push({
        location: {
          Latitude: sighting.lat,
          Longitude: sighting.lng
        },
        title: sighting.locName,
        description: `Date: ${new Date(sighting.obsDt).toLocaleDateString()} <br /> Time: ${new Date(sighting.obsDt).toLocaleTimeString()} <br/>
          Birds Seen: ${sighting.howMany ? sighting.howMany : "Not reported."}`
      });
    });
  }

  handleCategoryChange(event) {
    this.selectedCategory = event.detail.value.value;
    let selectedCatCode = this.categoryOptions.find(
      (cat) => cat.label === this.selectedCategory
    );

    let filteredList = this._fullBirdList.filter(
      (bird) => bird.familyCode === selectedCatCode.value
    );
    let newBirdOptions = [];
    filteredList.forEach((bird) => {
      let newBird = {};
      newBird.label = bird.comName;
      newBird.value = bird.speciesCode;
      newBirdOptions.push(newBird);
    });
    this._birdOptions = newBirdOptions;
    this.birdDisabled = false;
  }

  async connectedCallback() {
    // retrieve the list of taxonomy codes
    this.getBirdsData();
    // retrieve list of countries with cities
    this.getCitiesData();

    // let request = new XMLHttpRequest();
    // request.open("GET", US_CITIES, false);
    // request.send(null);

    // let usCities = JSON.parse(request.responseText);
  }

  async getCitiesData() {
    const url = "https://countriesnow.space/api/v0.1/countries";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();

      this._fullCountryCityList = json.data;
      console.log(this._fullCountryCityList);
      this.parseCountries(this._fullCountryCityList);
    } catch (error) {
      console.error(error.message);
    }
  }

  parseCountries(countryList) {
    this._fullCountryList = countryList.map((country) => {
      return {
        label: country.country,
        value: country.iso3
      };
    });
  }

  async getBirdsData() {
    const url = "https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json";
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-ebirdapitoken": "stvbo0scnmac"
        }
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      this.parseBirdCategories(json);
      this._fullBirdList = json;
    } catch (error) {
      console.error(error.message);
    }
  }

  parseBirdCategories(birds) {
    let categoryList = [];
    let uniqueCategoryList = [];
    birds.forEach((bird) => {
      if (
        !uniqueCategoryList.includes(bird.familyComName) &&
        bird.familyComName !== undefined
      ) {
        let newCategory = {};
        newCategory.label = bird.familyComName;
        newCategory.value = bird.familyCode;
        categoryList.push(newCategory);
        uniqueCategoryList.push(bird.familyComName);
      }
    });
    this._categoryOptions = categoryList;
  }
  async handleClick() {
    this.recentSightings(this.selectedBirdCode);
  }
}