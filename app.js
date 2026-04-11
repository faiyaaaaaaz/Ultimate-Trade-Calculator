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

/* ---------- MARKET (FIXED HARD) ---------- */
function populateMarket() {
  const markets = ["Currency", "Commodity", "Indice", "Crypto"];

  market.innerHTML = `<option value="">Select market</option>`;

  markets.forEach(m => {
    market.innerHTML += `<option value="${m}">${m}</option>`;
  });
}

/* ---------- INSTRUMENT ---------- */
function populateInstrument() {
  instrument.innerHTML = `<option>Select instrument</option>`;

  DATA.instruments.forEach(i => {
    if (i.active && i.marketType === market.value) {
      instrument.innerHTML += `<option>${i.instrumentName}</option>`;
    }
  });
}

/* ---------- MODEL ---------- */
function populateModel() {
  model.innerHTML = `<option>Select model</option>`;

  if (manualCheck.checked) return;

  DATA.models.forEach(m => {
    if (m.active && m.marketType === market.value) {
      model.innerHTML += `<option>${m.modelName}</option>`;
    }
  });
}

/* ---------- LEVERAGE ---------- */
function updateLeverage() {
  if (manualCheck.checked) {
    modelGroup.style.display = "none";

    if (!manualInput.value) {
      leverageEl.textContent = "Manual leverage not mentioned!";
      helper.textContent = "Enter manual leverage to proceed.";
    } else {
      leverageEl.textContent = manualInput.value;
      helper.textContent = "Manual leverage applied.";
    }
    return;
  }

  modelGroup.style.display = "flex";

  const selectedModel = DATA.models.find(m => m.modelName === model.value);

  if (!selectedModel) {
    leverageEl.textContent = "-";
    return;
  }

  leverageEl.textContent = selectedModel.defaultLeverage;
}

/* ---------- CALC ---------- */
function calculate() {
  updateLeverage();

  const inst = DATA.instruments.find(i => i.instrumentName === instrument.value);
  const mod = DATA.models.find(m => m.modelName === model.value);

  if (!inst || (!manualCheck.checked && !mod) || !price.value || !lot.value) {
    result.textContent = "0.00";
    return;
  }

  const leverage = manualCheck.checked
    ? Number(manualInput.value || 0)
    : Number(mod.defaultLeverage);

  if (!leverage) return;

  const conversion = DATA.conversionPrices.find(c => c.instrumentName === inst.instrumentName);

  const conversionFactor = conversion
    ? Number(conversion.finalConversionFactor || 1)
    : 1;

  const margin =
    (price.value * inst.contractSize * lot.value / leverage) * conversionFactor;

  result.textContent = Number(margin).toFixed(2);

  contractSizeEl.textContent = inst.contractSize;
  conversionEl.textContent = conversionFactor;
}

/* ---------- EVENTS ---------- */
market.addEventListener("change", () => {
  populateInstrument();
  populateModel();
  calculate();
});

instrument.addEventListener("change", calculate);
model.addEventListener("change", calculate);
price.addEventListener("input", calculate);
lot.addEventListener("input", calculate);

manualCheck.addEventListener("change", () => {
  manualWrap.style.display = manualCheck.checked ? "block" : "none";
  populateModel();
  calculate();
});

manualInput.addEventListener("input", calculate);

/* ---------- INIT ---------- */
function init() {
  populateMarket();
  manualWrap.style.display = "none";
}

init();
