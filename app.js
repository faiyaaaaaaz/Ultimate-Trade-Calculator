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

function setSelectOptions(selectElement, placeholderText, values) {
  if (!selectElement) return;

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

function getUniqueActiveMarkets() {
  const markets = (DATA.instruments || [])
    .filter((item) => item && item.active)
    .map((item) => String(item.marketType || "").trim())
    .filter(Boolean);

  return [...new Set(markets)];
}

function populateMarketOptions() {
  const markets = getUniqueActiveMarkets();
  setSelectOptions(market, "Select market", markets);
}

function populateInstrumentOptions() {
  const selectedMarket = market.value;

  if (!selectedMarket) {
    setSelectOptions(instrument, "Select instrument", []);
    return;
  }

  const instruments = (DATA.instruments || [])
    .filter((item) => item && item.active)
    .filter((item) => String(item.marketType).trim() === selectedMarket)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .map((item) => item.instrumentName);

  setSelectOptions(instrument, "Select instrument", instruments);
}

function populateModelOptions() {
  if (!model) return;

  if (manualCheck.checked) {
    setSelectOptions(model, "Select model", []);
    return;
  }

  const selectedMarket = market.value;

  if (!selectedMarket) {
    setSelectOptions(model, "Select model", []);
    return;
  }

  const models = (DATA.models || [])
    .filter((item) => item && item.active)
    .filter((item) => String(item.marketType).trim() === selectedMarket)
    .map((item) => item.modelName);

  setSelectOptions(model, "Select model", models);
}

function getSelectedInstrument() {
  return (DATA.instruments || []).find(
    (item) => item.instrumentName === instrument.value
  );
}

function getSelectedModel() {
  return (DATA.models || []).find(
    (item) => item.modelName === model.value
  );
}

function getSelectedConversion() {
  return (DATA.conversionPrices || []).find(
    (item) => item.instrumentName === instrument.value
  );
}

function updateVisibility() {
  if (manualCheck.checked) {
    if (modelGroup) modelGroup.style.display = "none";
    manualWrap.style.display = "block";
  } else {
    if (modelGroup) modelGroup.style.display = "flex";
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
  if (!helper) return;

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

  result.textContent = margin.toFixed(2);
}

function onMarketChange() {
  populateInstrumentOptions();
  populateModelOptions();
  instrument.value = "";
  if (model) model.value = "";
  calculate();
}

function onInstrumentChange() {
  calculate();
}

function onModelChange() {
  calculate();
}

function onManualToggleChange() {
  updateVisibility();
  populateModelOptions();
  if (model) model.value = "";
  calculate();
}

function initializeApp() {
  populateMarketOptions();
  updateVisibility();
  populateInstrumentOptions();
  populateModelOptions();
  updateLeverageDisplay();
  updateHelperText();
  calculate();

  market.addEventListener("change", onMarketChange);
  instrument.addEventListener("change", onInstrumentChange);
  if (model) model.addEventListener("change", onModelChange);

  price.addEventListener("input", calculate);
  lot.addEventListener("input", calculate);

  manualCheck.addEventListener("change", onManualToggleChange);
  manualInput.addEventListener("input", calculate);
}

initializeApp();
