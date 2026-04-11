const DATA = window.WEB_CALCULATOR_DATA || {
  instruments: [],
  models: [],
  conversionPrices: []
};

function formatMoney(value) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatPlainNumber(value, decimals = 5) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
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

function getInstrumentByName(name) {
  return DATA.instruments.find((item) => item.instrumentName === name);
}

function getModelByName(name) {
  return DATA.models.find((item) => item.modelName === name);
}

function getConversionByInstrument(name) {
  return DATA.conversionPrices.find((item) => item.instrumentName === name);
}

function populateInstrumentSelectByMarket(selectElement, marketValue) {
  if (!marketValue) {
    setOptions(selectElement, "Select instrument", []);
    return;
  }

  const instrumentList = DATA.instruments
    .filter((item) => item.active && item.marketType === marketValue)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .map((item) => item.instrumentName);

  setOptions(selectElement, "Select instrument", instrumentList);
}

function populateModelSelectByMarket(selectElement, marketValue) {
  if (!marketValue) {
    setOptions(selectElement, "Select model", []);
    return;
  }

  const modelList = DATA.models
    .filter((item) => item.active && item.marketType === marketValue)
    .map((item) => item.modelName);

  setOptions(selectElement, "Select model", modelList);
}

/* -----------------------------------
   TAB SWITCHING
----------------------------------- */
const tabs = document.querySelectorAll(".tab");
const marginSection = document.getElementById("marginSection");
const pnlSection = document.getElementById("pnlSection");
const maxlotSection = document.getElementById("maxlotSection");
const riskSection = document.getElementById("riskSection");

function showSection(tabName) {
  marginSection.style.display = tabName === "margin" ? "block" : "none";
  pnlSection.style.display = tabName === "pnl" ? "block" : "none";
  maxlotSection.style.display = tabName === "maxlot" ? "block" : "none";
  riskSection.style.display = tabName === "risk" ? "block" : "none";

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    showSection(tab.dataset.tab);
  });
});

/* -----------------------------------
   MARGIN CALCULATOR
----------------------------------- */
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
const marginMacroText = document.getElementById("marginMacroText");
const copyMarginMacroBtn = document.getElementById("copyMarginMacroBtn");

function populateModel() {
  if (manualCheck.checked) {
    setOptions(model, "Select model", []);
    return;
  }

  populateModelSelectByMarket(model, market.value);
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
    leverageEl.textContent = manualInput.value ? manualInput.value : "Manual leverage not mentioned!";
    return;
  }

  const selectedModel = getModelByName(model.value);
  leverageEl.textContent = selectedModel ? selectedModel.defaultLeverage : "-";
}

function updateMarginHelperText() {
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

function updateMarginMacro() {
  const selectedInstrument = getInstrumentByName(instrument.value);
  const selectedModel = getModelByName(model.value);
  const selectedConversion = getConversionByInstrument(instrument.value);

  if (!market.value || !instrument.value || !price.value || !lot.value) {
    marginMacroText.textContent = "Please complete the Margin Calculator inputs to generate the explanation text.";
    return;
  }

  if (manualCheck.checked && !manualInput.value) {
    marginMacroText.textContent = "Please enter the manual leverage to generate the explanation text.";
    return;
  }

  if (!manualCheck.checked && !model.value) {
    marginMacroText.textContent = "Please select a model to generate the explanation text.";
    return;
  }

  if (!selectedInstrument) {
    marginMacroText.textContent = "Instrument data is missing, so the explanation text cannot be generated yet.";
    return;
  }

  const priceValue = Number(price.value);
  const lotValue = Number(lot.value);
  const contractSize = Number(selectedInstrument.contractSize || 0);
  const conversionFactor = selectedConversion ? Number(selectedConversion.finalConversionFactor || 1) : 1;

  let leverageValue = 0;
  let leverageLabel = "";

  if (manualCheck.checked) {
    leverageValue = Number(manualInput.value || 0);
    leverageLabel = `manual leverage of ${manualInput.value}`;
  } else {
    leverageValue = Number(selectedModel?.defaultLeverage || 0);
    leverageLabel = `model leverage of ${selectedModel?.defaultLeverage || "-"}`;
  }

  if (!priceValue || !lotValue || !contractSize || !conversionFactor || !leverageValue) {
    marginMacroText.textContent = "Please complete the Margin Calculator inputs to generate the explanation text.";
    return;
  }

  const marginValue =
    (priceValue * contractSize * lotValue / leverageValue) * conversionFactor;

  marginMacroText.textContent =
`The estimated required margin for ${lotValue} lot(s) of ${instrument.value} at a current price of ${formatPlainNumber(priceValue, 5)} is ${formatMoney(marginValue)} USD.

This calculation uses a contract size of ${formatPlainNumber(contractSize, 2)}, a conversion factor of ${formatPlainNumber(conversionFactor, 5)}, and ${leverageLabel}.

Formula used:
Required Margin = (Price × Contract Size × Lot Size ÷ Leverage) × Conversion Factor`;
}

function calculateMargin() {
  updateLeverageDisplay();
  updateMarginHelperText();

  const selectedInstrument = getInstrumentByName(instrument.value);
  const selectedModel = getModelByName(model.value);
  const selectedConversion = getConversionByInstrument(instrument.value);

  const priceValue = Number(price.value);
  const lotValue = Number(lot.value);

  contractSizeEl.textContent = "-";
  conversionEl.textContent = "-";
  result.textContent = "0.00";

  if (!selectedInstrument) {
    updateMarginMacro();
    return;
  }

  contractSizeEl.textContent = selectedInstrument.contractSize;

  const conversionFactor = selectedConversion ? Number(selectedConversion.finalConversionFactor || 1) : 1;
  conversionEl.textContent = conversionFactor;

  let leverageValue = 0;
  if (manualCheck.checked) {
    leverageValue = Number(manualInput.value || 0);
  } else {
    if (!selectedModel) {
      updateMarginMacro();
      return;
    }
    leverageValue = Number(selectedModel.defaultLeverage || 0);
  }

  if (priceValue && lotValue && leverageValue) {
    const margin =
      (priceValue * Number(selectedInstrument.contractSize) * lotValue / leverageValue) *
      conversionFactor;

    result.textContent = formatMoney(margin);
  }

  updateMarginMacro();
}

function onMarginMarketChange() {
  populateInstrumentSelectByMarket(instrument, market.value);
  populateModel();
  instrument.value = "";
  model.value = "";
  calculateMargin();
}

function onManualToggleChange() {
  updateVisibility();
  populateModel();
  model.value = "";
  calculateMargin();
}

copyMarginMacroBtn.addEventListener("click", async () => {
  const textToCopy = marginMacroText.textContent.trim();

  if (!textToCopy) return;

  try {
    await navigator.clipboard.writeText(textToCopy);
    copyMarginMacroBtn.textContent = "Copied!";
    setTimeout(() => {
      copyMarginMacroBtn.textContent = "Copy Macro";
    }, 1400);
  } catch (error) {
    copyMarginMacroBtn.textContent = "Copy failed";
    setTimeout(() => {
      copyMarginMacroBtn.textContent = "Copy Macro";
    }, 1400);
  }
});

/* -----------------------------------
   PNL CALCULATOR
----------------------------------- */
const pnlMarket = document.getElementById("pnlMarket");
const pnlInstrument = document.getElementById("pnlInstrument");
const pnlPosition = document.getElementById("pnlPosition");
const pnlOpenPrice = document.getElementById("pnlOpenPrice");
const pnlClosePrice = document.getElementById("pnlClosePrice");
const pnlLotSize = document.getElementById("pnlLotSize");
const pnlResult = document.getElementById("pnlResult");
const pnlPips = document.getElementById("pnlPips");
const pnlMovement = document.getElementById("pnlMovement");
const pnlConversionFactor = document.getElementById("pnlConversionFactor");
const pnlHelperBox = document.getElementById("pnlHelperBox");

function updatePnlHelperText() {
  if (!pnlMarket.value) {
    pnlHelperBox.textContent = "Select a market to begin.";
    return;
  }
  if (!pnlInstrument.value) {
    pnlHelperBox.textContent = "Now choose an instrument.";
    return;
  }
  if (!pnlPosition.value) {
    pnlHelperBox.textContent = "Choose buy or sell.";
    return;
  }
  if (!pnlOpenPrice.value) {
    pnlHelperBox.textContent = "Enter the opening price.";
    return;
  }
  if (!pnlClosePrice.value) {
    pnlHelperBox.textContent = "Enter the closing price.";
    return;
  }
  if (!pnlLotSize.value) {
    pnlHelperBox.textContent = "Enter the lot size.";
    return;
  }

  pnlHelperBox.textContent = "PnL inputs are ready.";
}

function calculatePnl() {
  updatePnlHelperText();

  const selectedInstrument = getInstrumentByName(pnlInstrument.value);
  const selectedConversion = getConversionByInstrument(pnlInstrument.value);

  pnlResult.textContent = "0.00";
  pnlPips.textContent = "-";
  pnlMovement.textContent = "-";
  pnlConversionFactor.textContent = "-";

  if (!selectedInstrument || !pnlPosition.value) return;

  const openValue = Number(pnlOpenPrice.value);
  const closeValue = Number(pnlClosePrice.value);
  const lotValue = Number(pnlLotSize.value);

  if (!openValue || !closeValue || !lotValue) return;

  const conversionFactor = selectedConversion ? Number(selectedConversion.finalConversionFactor || 1) : 1;
  const rawMovement = closeValue - openValue;
  const directionMovement = pnlPosition.value === "buy" ? rawMovement : -rawMovement;
  const pipSize = Number(selectedInstrument.pipSize || 0);
  const contractSize = Number(selectedInstrument.contractSize || 0);

  if (!pipSize || !contractSize) return;

  const pipMovement = directionMovement / pipSize;
  const pnlUsd = directionMovement * contractSize * lotValue * conversionFactor;

  pnlResult.textContent = formatMoney(pnlUsd);
  pnlPips.textContent = formatPlainNumber(pipMovement, 2);
  pnlMovement.textContent = formatPlainNumber(directionMovement, 5);
  pnlConversionFactor.textContent = conversionFactor;
}

function onPnlMarketChange() {
  populateInstrumentSelectByMarket(pnlInstrument, pnlMarket.value);
  pnlInstrument.value = "";
  calculatePnl();
}

/* -----------------------------------
   ADD / REMOVE PIPS CALCULATOR
----------------------------------- */
const pipMarket = document.getElementById("pipMarket");
const pipInstrument = document.getElementById("pipInstrument");
const pipOpenPrice = document.getElementById("pipOpenPrice");
const pipAction = document.getElementById("pipAction");
const pipAmount = document.getElementById("pipAmount");
const pipResult = document.getElementById("pipResult");
const pipSizeUsed = document.getElementById("pipSizeUsed");
const pipHelperBox = document.getElementById("pipHelperBox");

function updatePipHelperText() {
  if (!pipMarket.value) {
    pipHelperBox.textContent = "Select a market to begin.";
    return;
  }
  if (!pipInstrument.value) {
    pipHelperBox.textContent = "Now choose an instrument.";
    return;
  }
  if (!pipOpenPrice.value) {
    pipHelperBox.textContent = "Enter the opening price.";
    return;
  }
  if (!pipAction.value) {
    pipHelperBox.textContent = "Choose add or remove.";
    return;
  }
  if (!pipAmount.value) {
    pipHelperBox.textContent = "Enter the pip or point amount.";
    return;
  }

  pipHelperBox.textContent = "Add / Remove Pips inputs are ready.";
}

function calculatePipPrice() {
  updatePipHelperText();

  const selectedInstrument = getInstrumentByName(pipInstrument.value);

  pipResult.textContent = "0.00";
  pipSizeUsed.textContent = "-";

  if (!selectedInstrument) return;

  const openValue = Number(pipOpenPrice.value);
  const amountValue = Number(pipAmount.value);
  const pipSize = Number(selectedInstrument.pipSize || 0);

  pipSizeUsed.textContent = pipSize;

  if (!openValue || !amountValue || !pipSize || !pipAction.value) return;

  let newPrice = openValue;
  if (pipAction.value === "add") newPrice = openValue + (amountValue * pipSize);
  if (pipAction.value === "remove") newPrice = openValue - (amountValue * pipSize);

  pipResult.textContent = formatPlainNumber(newPrice, 5);
}

function onPipMarketChange() {
  populateInstrumentSelectByMarket(pipInstrument, pipMarket.value);
  pipInstrument.value = "";
  calculatePipPrice();
}

/* -----------------------------------
   MAX LOT CALCULATOR
----------------------------------- */
const maxlotMarket = document.getElementById("maxlotMarket");
const maxlotInstrument = document.getElementById("maxlotInstrument");
const maxlotModel = document.getElementById("maxlotModel");
const maxlotModelGroup = document.getElementById("maxlotModelGroup");
const maxlotAccountSize = document.getElementById("maxlotAccountSize");
const maxlotPrice = document.getElementById("maxlotPrice");
const maxlotUseManualLeverage = document.getElementById("maxlotUseManualLeverage");
const maxlotManualLeverage = document.getElementById("maxlotManualLeverage");
const maxlotManualLeverageWrap = document.getElementById("maxlotManualLeverageWrap");
const maxlotResult = document.getElementById("maxlotResult");
const maxlotContractSize = document.getElementById("maxlotContractSize");
const maxlotConversionFactor = document.getElementById("maxlotConversionFactor");
const maxlotLeverageUsed = document.getElementById("maxlotLeverageUsed");
const maxlotHelperBox = document.getElementById("maxlotHelperBox");

function populateMaxlotModel() {
  if (maxlotUseManualLeverage.checked) {
    setOptions(maxlotModel, "Select model", []);
    return;
  }

  populateModelSelectByMarket(maxlotModel, maxlotMarket.value);
}

function updateMaxlotVisibility() {
  if (maxlotUseManualLeverage.checked) {
    maxlotModelGroup.style.display = "none";
    maxlotManualLeverageWrap.style.display = "flex";
  } else {
    maxlotModelGroup.style.display = "";
    maxlotManualLeverageWrap.style.display = "none";
    maxlotManualLeverage.value = "";
  }
}

function updateMaxlotLeverageDisplay() {
  if (maxlotUseManualLeverage.checked) {
    maxlotLeverageUsed.textContent = maxlotManualLeverage.value ? maxlotManualLeverage.value : "Manual leverage not mentioned!";
    return;
  }

  const selectedModel = getModelByName(maxlotModel.value);
  maxlotLeverageUsed.textContent = selectedModel ? selectedModel.defaultLeverage : "-";
}

function updateMaxlotHelperText() {
  if (!maxlotMarket.value) {
    maxlotHelperBox.textContent = "Select a market to begin.";
    return;
  }
  if (!maxlotInstrument.value) {
    maxlotHelperBox.textContent = "Now choose an instrument.";
    return;
  }
  if (maxlotUseManualLeverage.checked && !maxlotManualLeverage.value) {
    maxlotHelperBox.textContent = "Enter manual leverage to proceed.";
    return;
  }
  if (!maxlotUseManualLeverage.checked && !maxlotModel.value) {
    maxlotHelperBox.textContent = "Now choose a model.";
    return;
  }
  if (!maxlotAccountSize.value) {
    maxlotHelperBox.textContent = "Enter the account size.";
    return;
  }
  if (!maxlotPrice.value) {
    maxlotHelperBox.textContent = "Enter the current price.";
    return;
  }

  maxlotHelperBox.textContent = "All required inputs are ready.";
}

function calculateMaxlot() {
  updateMaxlotLeverageDisplay();
  updateMaxlotHelperText();

  const selectedInstrument = getInstrumentByName(maxlotInstrument.value);
  const selectedModel = getModelByName(maxlotModel.value);
  const selectedConversion = getConversionByInstrument(maxlotInstrument.value);

  const accountSizeValue = Number(maxlotAccountSize.value);
  const priceValue = Number(maxlotPrice.value);

  maxlotContractSize.textContent = "-";
  maxlotConversionFactor.textContent = "-";
  maxlotResult.textContent = "0.00";

  if (!selectedInstrument) return;

  maxlotContractSize.textContent = selectedInstrument.contractSize;

  const conversionFactor = selectedConversion ? Number(selectedConversion.finalConversionFactor || 1) : 1;
  maxlotConversionFactor.textContent = conversionFactor;

  let leverageValue = 0;
  if (maxlotUseManualLeverage.checked) {
    leverageValue = Number(maxlotManualLeverage.value || 0);
  } else {
    if (!selectedModel) return;
    leverageValue = Number(selectedModel.defaultLeverage || 0);
  }

  if (!accountSizeValue || !priceValue || !leverageValue) return;

  const maxLot =
    (accountSizeValue * leverageValue) /
    (priceValue * Number(selectedInstrument.contractSize) * conversionFactor);

  maxlotResult.textContent = formatPlainNumber(maxLot, 2);
}

function onMaxlotMarketChange() {
  populateInstrumentSelectByMarket(maxlotInstrument, maxlotMarket.value);
  populateMaxlotModel();
  maxlotInstrument.value = "";
  maxlotModel.value = "";
  calculateMaxlot();
}

function onMaxlotManualToggleChange() {
  updateMaxlotVisibility();
  populateMaxlotModel();
  maxlotModel.value = "";
  calculateMaxlot();
}

/* -----------------------------------
   RISK BY MONEY AND LOT
----------------------------------- */
const riskMoneyAccountBalance = document.getElementById("riskMoneyAccountBalance");
const riskMoneyMarket = document.getElementById("riskMoneyMarket");
const riskMoneyInstrument = document.getElementById("riskMoneyInstrument");
const riskMoneyPosition = document.getElementById("riskMoneyPosition");
const riskMoneyEntryPrice = document.getElementById("riskMoneyEntryPrice");
const riskMoneyLotSize = document.getElementById("riskMoneyLotSize");
const riskMoneyRisk = document.getElementById("riskMoneyRisk");
const riskMoneyReward = document.getElementById("riskMoneyReward");

const riskMoneyStopLoss = document.getElementById("riskMoneyStopLoss");
const riskMoneyTakeProfit = document.getElementById("riskMoneyTakeProfit");
const riskMoneyPipSize = document.getElementById("riskMoneyPipSize");
const riskMoneyConversionFactor = document.getElementById("riskMoneyConversionFactor");
const riskMoneyContractSize = document.getElementById("riskMoneyContractSize");
const riskMoneySlPips = document.getElementById("riskMoneySlPips");
const riskMoneyTpPips = document.getElementById("riskMoneyTpPips");
const riskMoneyHelperBox = document.getElementById("riskMoneyHelperBox");

function updateRiskMoneyHelperText() {
  if (!riskMoneyAccountBalance.value) {
    riskMoneyHelperBox.textContent = "Select an account balance to begin.";
    return;
  }
  if (!riskMoneyMarket.value) {
    riskMoneyHelperBox.textContent = "Now choose a market.";
    return;
  }
  if (!riskMoneyInstrument.value) {
    riskMoneyHelperBox.textContent = "Now choose an instrument.";
    return;
  }
  if (!riskMoneyPosition.value) {
    riskMoneyHelperBox.textContent = "Choose buy or sell.";
    return;
  }
  if (!riskMoneyEntryPrice.value) {
    riskMoneyHelperBox.textContent = "Enter the entry price.";
    return;
  }
  if (!riskMoneyLotSize.value) {
    riskMoneyHelperBox.textContent = "Enter the lot size.";
    return;
  }
  if (!riskMoneyRisk.value) {
    riskMoneyHelperBox.textContent = "Enter the risk amount.";
    return;
  }
  if (!riskMoneyReward.value) {
    riskMoneyHelperBox.textContent = "Enter the reward amount.";
    return;
  }

  riskMoneyHelperBox.textContent = "Risk by Money & Lot inputs are ready.";
}

function calculateRiskMoney() {
  updateRiskMoneyHelperText();

  const selectedInstrument = getInstrumentByName(riskMoneyInstrument.value);
  const selectedConversion = getConversionByInstrument(riskMoneyInstrument.value);

  riskMoneyStopLoss.textContent = "0.00";
  riskMoneyTakeProfit.textContent = "0.00";
  riskMoneyPipSize.textContent = "-";
  riskMoneyConversionFactor.textContent = "-";
  riskMoneyContractSize.textContent = "-";
  riskMoneySlPips.textContent = "-";
  riskMoneyTpPips.textContent = "-";

  if (!selectedInstrument || !riskMoneyPosition.value) return;

  const entryPrice = Number(riskMoneyEntryPrice.value);
  const lotSize = Number(riskMoneyLotSize.value);
  const riskAmount = Number(riskMoneyRisk.value);
  const rewardAmount = Number(riskMoneyReward.value);

  if (!entryPrice || !lotSize || !riskAmount || !rewardAmount) return;

  const pipSize = Number(selectedInstrument.pipSize || 0);
  const contractSize = Number(selectedInstrument.contractSize || 0);
  const conversionFactor = selectedConversion ? Number(selectedConversion.finalConversionFactor || 1) : 1;

  riskMoneyPipSize.textContent = pipSize;
  riskMoneyConversionFactor.textContent = conversionFactor;
  riskMoneyContractSize.textContent = contractSize;

  if (!pipSize || !contractSize || !conversionFactor) return;

  const priceRiskMove = riskAmount / (contractSize * lotSize * conversionFactor);
  const priceRewardMove = rewardAmount / (contractSize * lotSize * conversionFactor);

  let stopLoss = entryPrice;
  let takeProfit = entryPrice;

  if (riskMoneyPosition.value === "buy") {
    stopLoss = entryPrice - priceRiskMove;
    takeProfit = entryPrice + priceRewardMove;
  } else {
    stopLoss = entryPrice + priceRiskMove;
    takeProfit = entryPrice - priceRewardMove;
  }

  const slPips = Math.abs(entryPrice - stopLoss) / pipSize;
  const tpPips = Math.abs(takeProfit - entryPrice) / pipSize;

  riskMoneyStopLoss.textContent = formatPlainNumber(stopLoss, 5);
  riskMoneyTakeProfit.textContent = formatPlainNumber(takeProfit, 5);
  riskMoneySlPips.textContent = formatPlainNumber(slPips, 2);
  riskMoneyTpPips.textContent = formatPlainNumber(tpPips, 2);
}

function onRiskMoneyMarketChange() {
  populateInstrumentSelectByMarket(riskMoneyInstrument, riskMoneyMarket.value);
  riskMoneyInstrument.value = "";
  calculateRiskMoney();
}

/* -----------------------------------
   RISK BY PERCENTAGE
----------------------------------- */
const riskPercentAccountBalance = document.getElementById("riskPercentAccountBalance");
const riskPercentMarket = document.getElementById("riskPercentMarket");
const riskPercentInstrument = document.getElementById("riskPercentInstrument");
const riskPercentPosition = document.getElementById("riskPercentPosition");
const riskPercentEntryPrice = document.getElementById("riskPercentEntryPrice");
const riskPercentRiskPercent = document.getElementById("riskPercentRiskPercent");
const riskPercentRewardPercent = document.getElementById("riskPercentRewardPercent");
const riskPercentSlPips = document.getElementById("riskPercentSlPips");

const riskPercentLotSize = document.getElementById("riskPercentLotSize");
const riskPercentStopLoss = document.getElementById("riskPercentStopLoss");
const riskPercentTakeProfit = document.getElementById("riskPercentTakeProfit");
const riskPercentRiskDollar = document.getElementById("riskPercentRiskDollar");
const riskPercentRewardDollar = document.getElementById("riskPercentRewardDollar");
const riskPercentPipSize = document.getElementById("riskPercentPipSize");
const riskPercentConversionFactor = document.getElementById("riskPercentConversionFactor");
const riskPercentContractSize = document.getElementById("riskPercentContractSize");
const riskPercentHelperBox = document.getElementById("riskPercentHelperBox");

function updateRiskPercentHelperText() {
  if (!riskPercentAccountBalance.value) {
    riskPercentHelperBox.textContent = "Select an account balance to begin.";
    return;
  }
  if (!riskPercentMarket.value) {
    riskPercentHelperBox.textContent = "Now choose a market.";
    return;
  }
  if (!riskPercentInstrument.value) {
    riskPercentHelperBox.textContent = "Now choose an instrument.";
    return;
  }
  if (!riskPercentPosition.value) {
    riskPercentHelperBox.textContent = "Choose buy or sell.";
    return;
  }
  if (!riskPercentEntryPrice.value) {
    riskPercentHelperBox.textContent = "Enter the entry price.";
    return;
  }
  if (!riskPercentRiskPercent.value) {
    riskPercentHelperBox.textContent = "Enter the risk percentage.";
    return;
  }
  if (!riskPercentRewardPercent.value) {
    riskPercentHelperBox.textContent = "Enter the reward percentage.";
    return;
  }
  if (!riskPercentSlPips.value) {
    riskPercentHelperBox.textContent = "Enter the SL in pips or points.";
    return;
  }

  riskPercentHelperBox.textContent = "Risk by Percentage inputs are ready.";
}

function calculateRiskPercent() {
  updateRiskPercentHelperText();

  const selectedInstrument = getInstrumentByName(riskPercentInstrument.value);
  const selectedConversion = getConversionByInstrument(riskPercentInstrument.value);

  riskPercentLotSize.textContent = "0.00";
  riskPercentStopLoss.textContent = "0.00";
  riskPercentTakeProfit.textContent = "0.00";
  riskPercentRiskDollar.textContent = "-";
  riskPercentRewardDollar.textContent = "-";
  riskPercentPipSize.textContent = "-";
  riskPercentConversionFactor.textContent = "-";
  riskPercentContractSize.textContent = "-";

  if (!selectedInstrument || !riskPercentPosition.value) return;

  const accountBalance = Number(riskPercentAccountBalance.value);
  const entryPrice = Number(riskPercentEntryPrice.value);
  const riskPercent = Number(riskPercentRiskPercent.value);
  const rewardPercent = Number(riskPercentRewardPercent.value);
  const slPips = Number(riskPercentSlPips.value);

  if (!accountBalance || !entryPrice || !riskPercent || !rewardPercent || !slPips) return;

  const pipSize = Number(selectedInstrument.pipSize || 0);
  const contractSize = Number(selectedInstrument.contractSize || 0);
  const conversionFactor = selectedConversion ? Number(selectedConversion.finalConversionFactor || 1) : 1;

  riskPercentPipSize.textContent = pipSize;
  riskPercentConversionFactor.textContent = conversionFactor;
  riskPercentContractSize.textContent = contractSize;

  if (!pipSize || !contractSize || !conversionFactor) return;

  const riskDollar = accountBalance * (riskPercent / 100);
  const rewardDollar = accountBalance * (rewardPercent / 100);

  const lotSize = Math.abs(
    riskDollar / (conversionFactor * contractSize * pipSize * slPips)
  );

  let stopLoss = entryPrice;
  let takeProfit = entryPrice;

  if (riskPercentPosition.value === "buy") {
    stopLoss = entryPrice - (slPips * pipSize);
    takeProfit = entryPrice + (rewardDollar / (conversionFactor * contractSize * lotSize));
  } else {
    stopLoss = entryPrice + (slPips * pipSize);
    takeProfit = entryPrice - (rewardDollar / (conversionFactor * contractSize * lotSize));
  }

  riskPercentLotSize.textContent = formatPlainNumber(lotSize, 2);
  riskPercentStopLoss.textContent = formatPlainNumber(stopLoss, 5);
  riskPercentTakeProfit.textContent = formatPlainNumber(takeProfit, 5);
  riskPercentRiskDollar.textContent = formatMoney(riskDollar);
  riskPercentRewardDollar.textContent = formatMoney(rewardDollar);
}

function onRiskPercentMarketChange() {
  populateInstrumentSelectByMarket(riskPercentInstrument, riskPercentMarket.value);
  riskPercentInstrument.value = "";
  calculateRiskPercent();
}

/* -----------------------------------
   INIT
----------------------------------- */
function initializeApp() {
  showSection("margin");

  updateVisibility();
  populateInstrumentSelectByMarket(instrument, market.value);
  populateModel();
  calculateMargin();

  calculatePnl();
  calculatePipPrice();

  updateMaxlotVisibility();
  populateInstrumentSelectByMarket(maxlotInstrument, maxlotMarket.value);
  populateMaxlotModel();
  calculateMaxlot();

  calculateRiskMoney();
  calculateRiskPercent();

  market.addEventListener("change", onMarginMarketChange);
  instrument.addEventListener("change", calculateMargin);
  model.addEventListener("change", calculateMargin);
  price.addEventListener("input", calculateMargin);
  lot.addEventListener("input", calculateMargin);
  manualCheck.addEventListener("change", onManualToggleChange);
  manualInput.addEventListener("input", calculateMargin);

  pnlMarket.addEventListener("change", onPnlMarketChange);
  pnlInstrument.addEventListener("change", calculatePnl);
  pnlPosition.addEventListener("change", calculatePnl);
  pnlOpenPrice.addEventListener("input", calculatePnl);
  pnlClosePrice.addEventListener("input", calculatePnl);
  pnlLotSize.addEventListener("input", calculatePnl);

  pipMarket.addEventListener("change", onPipMarketChange);
  pipInstrument.addEventListener("change", calculatePipPrice);
  pipOpenPrice.addEventListener("input", calculatePipPrice);
  pipAction.addEventListener("change", calculatePipPrice);
  pipAmount.addEventListener("input", calculatePipPrice);

  maxlotMarket.addEventListener("change", onMaxlotMarketChange);
  maxlotInstrument.addEventListener("change", calculateMaxlot);
  maxlotModel.addEventListener("change", calculateMaxlot);
  maxlotAccountSize.addEventListener("input", calculateMaxlot);
  maxlotPrice.addEventListener("input", calculateMaxlot);
  maxlotUseManualLeverage.addEventListener("change", onMaxlotManualToggleChange);
  maxlotManualLeverage.addEventListener("input", calculateMaxlot);

  riskMoneyAccountBalance.addEventListener("change", calculateRiskMoney);
  riskMoneyMarket.addEventListener("change", onRiskMoneyMarketChange);
  riskMoneyInstrument.addEventListener("change", calculateRiskMoney);
  riskMoneyPosition.addEventListener("change", calculateRiskMoney);
  riskMoneyEntryPrice.addEventListener("input", calculateRiskMoney);
  riskMoneyLotSize.addEventListener("input", calculateRiskMoney);
  riskMoneyRisk.addEventListener("input", calculateRiskMoney);
  riskMoneyReward.addEventListener("input", calculateRiskMoney);

  riskPercentAccountBalance.addEventListener("change", calculateRiskPercent);
  riskPercentMarket.addEventListener("change", onRiskPercentMarketChange);
  riskPercentInstrument.addEventListener("change", calculateRiskPercent);
  riskPercentPosition.addEventListener("change", calculateRiskPercent);
  riskPercentEntryPrice.addEventListener("input", calculateRiskPercent);
  riskPercentRiskPercent.addEventListener("input", calculateRiskPercent);
  riskPercentRewardPercent.addEventListener("input", calculateRiskPercent);
  riskPercentSlPips.addEventListener("input", calculateRiskPercent);
}

initializeApp();
