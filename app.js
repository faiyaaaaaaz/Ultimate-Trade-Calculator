const DATA = window.WEB_CALCULATOR_DATA || {
  instruments: [],
  models: [],
  conversionPrices: []
};

const market = document.getElementById("market");
const instrument = document.getElementById("instrument");
const model = document.getElementById("model");
const modelGroup = document.getElementById("modelGroup");

const price = document.getElementById("price");
const lot = document.getElementById("lotSize");

const manualCheck = document.getElementById("useManualLeverage");
const manualInput = document.getElementById("manualLeverage");
const manualWrap = document.getElementById("manualLeverageWrap");

const result = document.getElementById("result");
const contractSizeEl = document.getElementById("contractSize");
const conversionEl = document.getElementById("conversionFactor");
const leverageEl = document.getElementById("leverageUsed");
const helper = document.getElementById("helperBox");

function formatMoney(value) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function setOptions(selectElement, placeholderText, values) {
  selectElement.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = placeholderText;
  selectElement.appendChild(placeholder);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
  });
}

function populateInstrument() {
  if (!market.value) {
    setOptions(instrument, "Select instrument", []);
    return;
  }

  const instrumentList = DATA.instruments
    .filter((item) => item.active && item.marketType === market.value)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .map((item) => item.instrumentName);

  setOptions(instrument, "Select instrument", instrumentList);
}

function populateModel() {
  if (manualCheck.checked) {
    setOptions(model, "Select model", []);
    return;
  }

  if (!market.value) {
    setOptions(model, "Select model", []);
    return;
  }

  const modelList = DATA.models
    .filter((item) => item.active && item.marketType === market.value)
    .map((item) => item.modelName);

  setOptions(model, "Select model", modelList);
}

function getSelectedInstrument() {
  return DATA.instruments.find(
    (item) => item.instrumentName === instrument.value
  );
}

function getSelectedModel() {
  return DATA.models.find(
    (item) => item.modelName === model.value
  );
}

function getSelectedConversion() {
  return DATA.conversionPrices.find(
    (item) => item.instrumentName === instrument.value
  );
}

function updateVisibility() {
  if (manualCheck.checked) {
    modelGroup.style.display = "none";
    manualWrap.style.display = "flex";
  } else {
    modelGroup.style.display = "";
    manualWrap.style.display = "none";
    manualInput.value = "";
  }
}

function updateLeverageDisplay() {
  if (manualCheck.checked) {
    if (!manualInput.value) {
      leverageEl.textContent = "Manual leverage not mentioned!";
    } else {
      leverageEl.textContent = manualInput.value;
    }
    return;
  }

  const selectedModel = getSelectedModel();

  if (!selectedModel) {
    leverageEl.textContent = "-";
    return;
  }

  leverageEl.textContent = selectedModel.defaultLeverage;
}

function updateHelperText() {
  if (!market.value) {
    helper.textContent = "Select a market to begin.";
    return;
  }

  if (!instrument.value) {
    helper.textContent = "Now choose an instrument.";
    return;
  }

  if (manualCheck.checked && !manualInput.value) {
    helper.textContent = "Enter manual leverage to proceed.";
    return;
  }

  if (!manualCheck.checked && !model.value) {
    helper.textContent = "Now choose a model.";
    return;
  }

  if (!price.value) {
    helper.textContent = "Enter the current price.";
    return;
  }

  if (!lot.value) {
    helper.textContent = "Enter the lot size.";
    return;
  }

  helper.textContent = "All required inputs are ready.";
}

function calculate() {
  updateLeverageDisplay();
  updateHelperText();

  const selectedInstrument = getSelectedInstrument();
  const selectedModel = getSelectedModel();
  const selectedConversion = getSelectedConversion();

  const priceValue = Number(price.value);
  const lotValue = Number(lot.value);

  contractSizeEl.textContent = "-";
  conversionEl.textContent = "-";
  result.textContent = "0.00";

  if (!selectedInstrument) return;

  contractSizeEl.textContent = selectedInstrument.contractSize;

  const conversionFactor = selectedConversion
    ? Number(selectedConversion.finalConversionFactor || 1)
    : 1;

  conversionEl.textContent = conversionFactor;

  let leverageValue = 0;

  if (manualCheck.checked) {
    leverageValue = Number(manualInput.value || 0);
  } else {
    if (!selectedModel) return;
    leverageValue = Number(selectedModel.defaultLeverage || 0);
  }

  if (!priceValue || !lotValue || !leverageValue) return;

  const margin =
    (priceValue * Number(selectedInstrument.contractSize) * lotValue / leverageValue) *
    conversionFactor;

  result.textContent = formatMoney(margin);
}

function onMarketChange() {
  populateInstrument();
  populateModel();
  instrument.value = "";
  model.value = "";
  calculate();
}

function onManualToggleChange() {
  updateVisibility();
  populateModel();
  model.value = "";
  calculate();
}

function initializeApp() {
  updateVisibility();
  populateInstrument();
  populateModel();
  calculate();

  market.addEventListener("change", onMarketChange);
  instrument.addEventListener("change", calculate);
  model.addEventListener("change", calculate);
  price.addEventListener("input", calculate);
  lot.addEventListener("input", calculate);
  manualCheck.addEventListener("change", onManualToggleChange);
  manualInput.addEventListener("input", calculate);
}

initializeApp();
