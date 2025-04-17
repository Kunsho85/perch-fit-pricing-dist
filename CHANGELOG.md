# CHANGELOG

## UPDATE V2.3 (April 18, 2025)
- Removed tab structure dependency
- Modified UI to display only Hardware as a Service (HaaS) option
- Removed Upfront Purchase option from UI as per client request
- Preserved all existing calculation rules and business logic
- Maintained custom pricing tooltips for different scenarios

### Key code changes:
- Removed tab menu references and event listeners
- Modified `updatePricing()` function to only display HaaS pricing
- Updated `hidePricing()` function to align with new structure
- Maintained internal calculations for both pricing options to preserve business rules

## UPDATE V2.2
- Patched active label for hardware item selection
- Added functionality to set active class when button is selected in hardwareToggleButtons forEach loop:
```javascript
let hardwareNameWrapper = hardwareItem.querySelector(".c-toggle__text");
button.checked
  ? hardwareNameWrapper.classList.add("cc-active")
  : hardwareNameWrapper.classList.remove("cc-active");
```

## UPDATE V2.1
- Added possibility to disable or enable next/submit buttons depending on select input values
- Added support for "required" attribute of country and state select fields

### New constants and functions:
- Added `SELECTION_NULL` to store the default value of all input select
- Added `perchUseSelect` to store the DOM element of the "use-perch" select input at the last step
- Set default value of US State to Alabama: `usStateSelect.value = "Alabama";`
- Set default state of submit button to disable: `disableSubmitButton();`

### Added functions to change states of next and submit buttons:
```javascript
function disableNextButton(step) {
  let nextButton = document.querySelectorAll('button[data-form="next-btn"]')[step];
  nextButton.style.pointerEvents = "none";
  nextButton.style.opacity = "0.5";
  nextButton.classList.add("disabled");
}

function enableNextButton(step) {
  let nextButton = document.querySelectorAll('button[data-form="next-btn"]')[step];
  nextButton.style.pointerEvents = "auto";
  nextButton.style.opacity = "1";
  nextButton.classList.remove("disabled");
}

function disableSubmitButton(){
  let submitButton = document.querySelector('[data-submit="true"]');
  submitButton.style.pointerEvents = "none";
  submitButton.style.opacity = "0.5";
  submitButton.classList.add("disabled");
}

function enableSubmitButton(){
  let submitButton = document.querySelector('[data-submit="true"]');
  submitButton.style.pointerEvents = "auto";
  submitButton.style.opacity = "1";
  submitButton.classList.remove("disabled");
}
```

### Updated event listeners:
- Country select:
```javascript
countrySelect.addEventListener("change", () => {
  countrySelect.value === DEFAULT_COUNTRY
    ? (usStateSelect.style.display = "block")
    : (usStateSelect.style.display = "none");

  if (countrySelect.value == SELECTION_NULL) {
    disableNextButton(1);
  }
  else if (countrySelect.value === DEFAULT_COUNTRY && usStateSelect.value == SELECTION_NULL) {
    disableNextButton(1);
  }
  else {
    enableNextButton(1);
  }
});
```

- US State select:
```javascript
usStateSelect.addEventListener("change", () => {
  if (countrySelect.value === DEFAULT_COUNTRY && usStateSelect.value == SELECTION_NULL) {
    disableNextButton(1);
  }
  else if (countrySelect.value === DEFAULT_COUNTRY && usStateSelect.value != SELECTION_NULL) {
    enableNextButton(1);
  }
});
```

- Perch use select:
```javascript
perchUseSelect.addEventListener("change", () => {
  if (perchUseSelect.value === SELECTION_NULL){
    disableSubmitButton(1);
  }
  else{
    enableSubmitButton(1);
  }
});
```

## UPDATE V2
- Replaced tab system with grid system for pricing results display
- Removed useless constants and functions related to the old tab system

### Script formats:
- `perch-pricing.v2.js`: Non-minified/obfuscated but commented code to help future development
- `perch-pricing.v2.min.js`: Minified and obfuscated publishable code for jsdelivr

### Changes:
- Replaced `grand-total-cost` attribute with:
  - `grand-total-cost-haas`
  - `grand-total-cost-cash`

### Removed:
```javascript
const grandTotalCost = section2.querySelector(select("grand-total-cost"));
const customPricingTooltipQuantity = section2.querySelector(select("custom-pricing-tooltip-quantity"));
const customPricingTooltipPlan = section2.querySelector(select("custom-pricing-tooltip-plan"));
function getActiveTab(element) {
  let activeTab = getElements(element, "[data-w-tab]").find(tab => tab.classList.contains("w--current"));
  return activeTab ? activeTab.getAttribute("data-w-tab").trim() : "";
}
function getActiveTabName(element) {
  return getActiveTab(element).toLowerCase();
}
```

### New constants and functions:
- Added `cashTotalCost` to store the total cost of upfront payment
- Added `haasTotalCost` to store the total cost of HaaS pricing
- Added `customPricingTooltipsQuantity` to store all tooltips about quantity error
- Added `customPricingTooltipsPlan` to store all tooltips about plan error

### New functions:
```javascript
function hidePricing(){
  cashUpfrontCost.innerText = "";
  cashRecurringAnnualCost.innerText = "";
  cashYear1Total.innerText = "";
  cashTotalCost.innerText = "";
  haasRecurringAnnualCost.innerText = "";
  haasTotalCost.innerText = "";
}

function scrollToPricing() {
  let element = document.getElementById("quote");
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
```

### Updated "updatePricing()" function:
Replaced:
```javascript
let grandTotal = activeTab === "haas" ? totalHaas : totalCash;

if (grandTotal > 15000) {
  showError("quantity");
  return;
}
grandTotalCost.innerText = formatCurrency(grandTotal);
```

With:
```javascript
cashTotalCost.innerText = formatCurrency(softwareCost + hardwarePriceCash);
haasTotalCost.innerText = formatCurrency(softwareCost + hardwarePriceHaas);
```
