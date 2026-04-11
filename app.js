// SAFE DATA LOAD (prevents crashes)
const DATA = window.WEB_CALCULATOR_DATA || {
  instruments: [],
  models: [],
  conversionPrices: []
};

console.log("DATA LOADED:", DATA);

// ELEMENTS
const market = document.getElementById("market");
const instrument = document.getElementById("instrument");
const model = document.getElementById("model");
const price = document.getElementById("price");
const lot = document.getElementById("lotSize");

const manualCheck = document.getElementById("useManualLeverage");
const manualInput = document.getElementById("manualLeverage");
const manualWrap = document.getElementById("manualLeverageWrap");

const result = document.getElementById("result");
const contractSizeEl = document.getElementById("contractSize");
const conversionEl = document.getElementById("conversionFactor");
const leverageEl = document.getElementById("leverageUsed");

// ---------- DROPDOWNS ----------

function populate() {
  const selectedMarket = market.value;

  instrument.innerHTML = `<option>Select instrument</option>`;
  model.innerHTML = `<option>Select model</option>`;

  DATA.instruments.forEach(i => {
    if (i.marketType === selectedMarket && i.active) {
      instrument.innerHTML += `<option>${i.instrumentName}</option>`;
    }
  });

  DATA.models.forEach(m => {
    if (m.marketType === selectedMarket && m.active) {
      model.innerHTML += `<option>${m.modelName}</option>`;
    }
  });
}

// ---------- LEVERAGE ----------

function updateLeverage() {
  if (manualCheck.checked) {
    if (!manualInput.value) {
      leverageEl.textContent = "Manual leverage not mentioned!";
    } else {
      leverageEl.textContent = manualInput.value;
    }
    return;
  }

  const selectedModel = DATA.models.find(m => m.modelName === model.value);

  if (!selectedModel) {
    leverageEl.textContent = "-";
    return;
  }

  leverageEl.textContent = selectedModel.defaultLeverage;
}

// ---------- CALC ----------

function calculate() {
  updateLeverage();

  const inst = DATA.instruments.find(i => i.instrumentName === instrument.value);
  const mod = DATA.models.find(m => m.modelName === model.value);

  if (!inst || !mod || !price.value || !lot.value) {
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

// ---------- EVENTS ----------

market.addEventListener("change", populate);
instrument.addEventListener("change", calculate);
model.addEventListener("change", calculate);
price.addEventListener("input", calculate);
lot.addEventListener("input", calculate);

manualCheck.addEventListener("change", () => {
  manualWrap.style.display = manualCheck.checked ? "block" : "none";
  updateLeverage();
});

manualInput.addEventListener("input", () => {
  updateLeverage();
  calculate();
});

// INIT
manualWrap.style.display = "none";
