const marketEl = document.getElementById("market");
const instrumentEl = document.getElementById("instrument");
const modelEl = document.getElementById("model");
const currentPriceEl = document.getElementById("currentPrice");
const lotSizeEl = document.getElementById("lotSize");
const useManualLeverageEl = document.getElementById("useManualLeverage");
const manualLeverageEl = document.getElementById("manualLeverage");
const manualLeverageWrapEl = document.getElementById("manualLeverageWrap");

const marginResultEl = document.getElementById("marginResult");
const contractSizeViewEl = document.getElementById("contractSizeView");
const conversionFactorViewEl = document.getElementById("conversionFactorView");
const leverageUsedViewEl = document.getElementById("leverageUsedView");

function updateManualLeverageVisibility() {
  if (useManualLeverageEl.checked) {
    manualLeverageWrapEl.style.display = "flex";
  } else {
    manualLeverageWrapEl.style.display = "none";
    manualLeverageEl.value = "";
  }
}

function updateLeverageUsedText() {
  if (useManualLeverageEl.checked) {
    const manualValue = manualLeverageEl.value.trim();

    if (manualValue === "") {
      leverageUsedViewEl.textContent = "Manual leverage not mentioned!";
    } else {
      leverageUsedViewEl.textContent = manualValue;
    }
    return;
  }

  leverageUsedViewEl.textContent = "-";
}

function updateMarginPreviewOnly() {
  updateLeverageUsedText();
  contractSizeViewEl.textContent = "-";
  conversionFactorViewEl.textContent = "-";
  marginResultEl.textContent = "0.00";
}

useManualLeverageEl.addEventListener("change", () => {
  updateManualLeverageVisibility();
  updateMarginPreviewOnly();
});

manualLeverageEl.addEventListener("input", () => {
  updateMarginPreviewOnly();
});

manualLeverageEl.setAttribute("type", "number");
manualLeverageEl.setAttribute("step", "any");
manualLeverageEl.setAttribute("inputmode", "decimal");
manualLeverageEl.setAttribute("min", "0");

updateManualLeverageVisibility();
updateMarginPreviewOnly();
