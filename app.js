const DATA = window.WEB_CALCULATOR_DATA;

const marketSelect = document.getElementById("market");
const instrumentSelect = document.getElementById("instrument");
const modelSelect = document.getElementById("model");
const priceInput = document.getElementById("price");
const lotInput = document.getElementById("lotSize");

const manualCheckbox = document.getElementById("useManualLeverage");
const manualInput = document.getElementById("manualLeverage");
const manualWrap = document.getElementById("manualLeverageWrap");

const resultBox = document.getElementById("result");
const contractSizeEl = document.getElementById("contractSize");
const conversionEl = document.getElementById("conversionFactor");
const leverageEl = document.getElementById("leverageUsed");

/* ---------- HELPERS ---------- */

function normalize(v) {
  return String(v || "").trim().toLowerCase();
}

function getInstrument() {
  return DATA.instruments.find(i => i.instrumentName === instrumentSelect.value);
}

function getModel() {
  return DATA.models.find(m => m.modelName === modelSelect.value);
}

function getConversion() {
  return DATA.conversionPrices.find(c => c.instrumentName === instrumentSelect.value);
}

/* ---------- DROPDOWN ---------- */

function populateDropdowns() {
  const market = normalize(marketSelect.value);

  instrumentSelect.innerHTML = `<option>Select instrument</option>`;
  modelSelect.innerHTML = `<option>Select model</option>`;

  DATA.instruments
    .filter(i => i.active)
    .filter(i => normalize(i.marketType) === market)
    .forEach(i => {
      instrumentSelect.innerHTML += `<option>${i.instrumentName}</option>`;
    });

  DATA.models
    .filter(m => m.active)
    .filter(m => normalize(m.marketType) === market)
    .forEach(m => {
      modelSelect.innerHTML += `<option>${m.modelName}</option>`;
    });

  updateLeverageDisplay();
}

/* ---------- LEVERAGE DISPLAY ---------- */

function updateLeverageDisplay() {
  if (manualCheckbox.checked) {
    if (!manualInput.value) {
      leverageEl.textContent = "Manual leverage not mentioned!";
    } else {
      leverageEl.textContent = manualInput.value;
    }
    return;
  }

  const model = getModel();
  if (!model) {
    leverageEl.textContent = "-";
    return;
  }

  leverageEl.textContent = model.defaultLeverage;
}

/* ---------- CALCULATION ---------- */

function calculate() {
  updateLeverageDisplay();

  const instrument = getInstrument();
  const model = getModel();
  const conversion = getConversion();

  const price = Number(priceInput.value);
  const lot = Number(lotInput.value);

  if (!instrument || !model || !price || !lot) {
    resultBox.textContent = "0.00";
    return;
  }

  const contractSize = Number(instrument.contractSize);
  const leverage = manualCheckbox.checked
    ? Number(manualInput.value || 0)
    : Number(model.defaultLeverage);

  if (!leverage) return;

  const conversionFactor = conversion
    ? Number(conversion.finalConversionFactor || 1)
    : 1;

  const margin =
    (price * contractSize * lot / leverage) * conversionFactor;

  resultBox.textContent = margin.toFixed(2);

  contractSizeEl.textContent = contractSize;
  conversionEl.textContent = conversionFactor;
}

/* ---------- EVENTS ---------- */

marketSelect.addEventListener("change", populateDropdowns);
instrumentSelect.addEventListener("change", calculate);
modelSelect.addEventListener("change", calculate);
priceInput.addEventListener("input", calculate);
lotInput.addEventListener("input", calculate);

manualCheckbox.addEventListener("change", () => {
  manualWrap.style.display = manualCheckbox.checked ? "block" : "none";
  updateLeverageDisplay();
  calculate();
});

manualInput.addEventListener("input", () => {
  updateLeverageDisplay();
  calculate();
});

/* ---------- INIT ---------- */

manualWrap.style.display = "none";
