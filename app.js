const DATA = window.WEB_CALCULATOR_DATA || {
  instruments: [],
  models: [],
  conversionPrices: []
};

function getElement(possibleIds) {
  for (const id of possibleIds) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
}

const marketSelect = getElement(["market", "marketSelect"]);
const instrumentSelect = getElement(["instrument", "instrumentSelect"]);
const modelSelect = getElement(["model", "modelSelect"]);
const manualLeverageCheckbox = getElement([
  "useManualLeverage",
  "manualLeverageToggle",
  "manualLeverageCheckbox"
]);
const manualLeverageInput = getElement([
  "manualLeverage",
  "manualLeverageInput"
]);
const manualLeverageWrap = getElement([
  "manualLeverageWrap",
  "manualLeverageGroup",
  "manualLeverageContainer"
]);
const helperBox = getElement([
  "helperInfo",
  "helperBox",
  "helperText"
]);

function isActiveItem(item) {
  return item && item.active === true;
}

function clearAndFillSelect(selectElement, placeholderText, items, valueKey, labelKey) {
  if (!selectElement) return;

  selectElement.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholderText;
  selectElement.appendChild(placeholderOption);

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item[valueKey];
    option.textContent = item[labelKey];
    selectElement.appendChild(option);
  });
}

function getSelectedMarket() {
  if (!marketSelect) return "";
  return marketSelect.value.trim();
}

function getFilteredInstruments(selectedMarket) {
  return (DATA.instruments || [])
    .filter((item) => isActiveItem(item))
    .filter((item) => item.marketType === selectedMarket)
    .sort((a, b) => {
      const aOrder = Number(a.sortOrder || 0);
      const bOrder = Number(b.sortOrder || 0);
      return aOrder - bOrder;
    });
}

function getFilteredModels(selectedMarket) {
  return (DATA.models || [])
    .filter((item) => isActiveItem(item))
    .filter((item) => item.marketType === selectedMarket)
    .sort((a, b) => {
      return String(a.modelName).localeCompare(String(b.modelName));
    });
}

function populateDropdownsByMarket() {
  const selectedMarket = getSelectedMarket();

  if (!selectedMarket) {
    clearAndFillSelect(
      instrumentSelect,
      "Select instrument",
      [],
      "instrumentName",
      "instrumentName"
    );

    clearAndFillSelect(
      modelSelect,
      "Select model",
      [],
      "modelName",
      "modelName"
    );

    updateHelperText();
    return;
  }

  const filteredInstruments = getFilteredInstruments(selectedMarket);
  const filteredModels = getFilteredModels(selectedMarket);

  clearAndFillSelect(
    instrumentSelect,
    "Select instrument",
    filteredInstruments,
    "instrumentName",
    "instrumentName"
  );

  clearAndFillSelect(
    modelSelect,
    "Select model",
    filteredModels,
    "modelName",
    "modelName"
  );

  updateHelperText();
}

function updateManualLeverageVisibility() {
  if (!manualLeverageCheckbox || !manualLeverageWrap) return;

  if (manualLeverageCheckbox.checked) {
    manualLeverageWrap.style.display = "block";
  } else {
    manualLeverageWrap.style.display = "none";
    if (manualLeverageInput) {
      manualLeverageInput.value = "";
    }
  }

  updateHelperText();
}

function updateHelperText() {
  if (!helperBox) return;

  const selectedMarket = marketSelect ? marketSelect.value : "";
  const selectedInstrument = instrumentSelect ? instrumentSelect.value : "";
  const selectedModel = modelSelect ? modelSelect.value : "";

  let helperMessage = "Select a market to load instruments and models.";

  if (selectedMarket) {
    helperMessage = `Market selected: ${selectedMarket}. Now choose an instrument and a model.`;
  }

  if (selectedMarket && selectedInstrument) {
    helperMessage = `Instrument selected: ${selectedInstrument}. Now choose a model.`;
  }

  if (selectedMarket && selectedInstrument && selectedModel) {
    helperMessage = `Ready for the next step. Instrument and model are now loaded from your exported sheet data.`;
  }

  if (manualLeverageCheckbox && manualLeverageCheckbox.checked) {
    if (manualLeverageInput && manualLeverageInput.value.trim() === "") {
      helperMessage += " Manual leverage not mentioned!";
    } else if (manualLeverageInput && manualLeverageInput.value.trim() !== "") {
      helperMessage += ` Leverage Used: ${manualLeverageInput.value.trim()}`;
    }
  }

  helperBox.textContent = helperMessage;
}

function validateSetup() {
  console.log("WEB_CALCULATOR_DATA loaded:", DATA);
  console.log("Instruments count:", (DATA.instruments || []).length);
  console.log("Models count:", (DATA.models || []).length);
  console.log("Conversion Prices count:", (DATA.conversionPrices || []).length);

  if (!marketSelect) {
    console.warn("Market dropdown not found.");
  }

  if (!instrumentSelect) {
    console.warn("Instrument dropdown not found.");
  }

  if (!modelSelect) {
    console.warn("Model dropdown not found.");
  }
}

function bindEvents() {
  if (marketSelect) {
    marketSelect.addEventListener("change", populateDropdownsByMarket);
    marketSelect.addEventListener("change", updateHelperText);
  }

  if (instrumentSelect) {
    instrumentSelect.addEventListener("change", updateHelperText);
  }

  if (modelSelect) {
    modelSelect.addEventListener("change", updateHelperText);
  }

  if (manualLeverageCheckbox) {
    manualLeverageCheckbox.addEventListener("change", updateManualLeverageVisibility);
  }

  if (manualLeverageInput) {
    manualLeverageInput.addEventListener("input", updateHelperText);
  }
}

function initializeApp() {
  validateSetup();
  bindEvents();
  populateDropdownsByMarket();
  updateManualLeverageVisibility();
  updateHelperText();
}

document.addEventListener("DOMContentLoaded", initializeApp);
