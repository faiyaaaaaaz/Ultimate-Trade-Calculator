const DATA = window.WEB_CALCULATOR_DATA;

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

/* ---------- DROPDOWNS ---------- */

function populate() {
  instrument.innerHTML = `<option>Select instrument</option>`;
  model.innerHTML = `<option>Select model</option>`;

  DATA.instruments.forEach(i => {
    if (i.marketType === market.value && i.active) {
      instrument.innerHTML += `<option>${i.instrumentName}</option>`;
    }
  });

  DATA.models.forEach(m => {
    if (m.marketType === market.value && m.active) {
      model.innerHTML += `<option>${m.modelName}</option>`;
    }
  });

  helper.textContent = "Market selected. Now choose instrument.";
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

  modelGroup.style.display = "block";

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

market.addEventListener("change", populate);
instrument.addEventListener("change", calculate);
model.addEventListener("change", calculate);
price.addEventListener("input", calculate);
lot.addEventListener("input", calculate);

manualCheck.addEventListener("change", () => {
  manualWrap.style.display = manualCheck.checked ? "block" : "none";
  updateLeverage();
  calculate();
});

manualInput.addEventListener("input", calculate);

/* INIT */
manualWrap.style.display = "none";
