// SCRIPT VERSION 2.3.1 // 
// LAST UDPATE 17th of April 2025 //

"use strict";

(() => {
  // DEBUG MODE - Set to true to enable console logging
  const DEBUG = true;
  
  function debugLog(...args) {
    if (DEBUG) {
      console.log("[Perch Debug]", ...args);
    }
  }

  // Function to get the value of the checked radio button with the given name
  function getCheckedRadioValue(element, name) {
    let checkedInput = Array.from(
      element.querySelectorAll(`input[type='radio'][name='${name}']`)
    ).find((input) => input.checked);
    return checkedInput ? checkedInput.value : null;
  }

  // Function to get all elements matching the given selector within the given element
  function getElements(element, selector) {
    return Array.from(element.querySelectorAll(selector));
  }

  // Function to get the first element matching the given selector within the given element
  function getElement(element, selector) {
    return element.querySelector(selector);
  }

  // Function to create a promise that resolves after the given delay
  async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Function to remove the given prefix from the given string, if it exists
  function removePrefix(string, prefix) {
    return string.startsWith(prefix) ? string.substring(prefix.length) : string;
  }

  // Function to compare two strings case-insensitively
  function compareStrings(string1, string2) {
    return string1.toLowerCase() === string2.toLowerCase();
  }

  // Function to format a number as a currency string
  function formatCurrency(number) {
    return `$${number.toLocaleString("en-US")}`;
  }

  // Function to get the plan name and price by quantity from the given plan card wrapper element
  function getPlanDetails(planCardWrapper) {
    debugLog("Getting plan details from", planCardWrapper);
    let planName =
      getElement(planCardWrapper, "[pp='plan-name']")?.innerText.trim() || "";
    if (!planName) {
      debugLog("Could not find plan name");
      return { planName: "", priceByQuantity: {} };
    }
    
    debugLog("Plan name:", planName);

    let priceByQuantity = {};
    let priceElements = getElements(
      planCardWrapper,
      "[data-pp-quantity][data-pp-price]"
    );
    debugLog("Price elements:", priceElements.length);
    
    priceElements.forEach((element) => {
      let quantity = parseInt(element.getAttribute("data-pp-quantity"));
      let price = parseInt(element.getAttribute("data-pp-price"));
      if (!isNaN(quantity) && !isNaN(price)) {
        priceByQuantity[quantity] = price;
        debugLog(`Price for quantity ${quantity}: ${price}`);
      }
    });

    return { planName, priceByQuantity };
  }

  // Function to get the price for the given quantity from the given price by quantity object
  function getPriceByQuantity(priceByQuantity, quantity) {
    let quantities = Object.keys(priceByQuantity)
      .map((q) => parseInt(q))
      .sort((a, b) => a - b);
    let price = 0;

    debugLog("Available quantities:", quantities);
    debugLog("Requested quantity:", quantity);

    for (let i = 0; i < quantities.length; i++) {
      if (quantity <= quantities[i]) {
        price = priceByQuantity[quantities[i]];
        debugLog(`Selected price: ${price} for quantity ${quantities[i]}`);
        break;
      }
    }

    return price;
  }

  // Function to show the error tooltip for the given error type
  function showError(errorType) {
    debugLog("Showing error:", errorType);
    
    if (errorType === "quantity") {
      customPricingTooltipsQuantity.forEach(
        (tooltip) => {
          if (tooltip) tooltip.style.display = "block";
        }
      );
      customPricingTooltipsPlan.forEach(
        (tooltip) => {
          if (tooltip) tooltip.style.display = "none";
        }
      );
    } else if (errorType === "plan") {
      customPricingTooltipsQuantity.forEach(
        (tooltip) => {
          if (tooltip) tooltip.style.display = "none";
        }
      );
      customPricingTooltipsPlan.forEach(
        (tooltip) => {
          if (tooltip) tooltip.style.display = "block";
        }
      );
    }

    customPricingTags.forEach((tag) => {
      if (tag) tag.style.display = "block";
    });
    hidePricing();
  }

  // Function to hide the error tooltips
  function hideError() {
    debugLog("Hiding errors");
    
    customPricingTooltipsQuantity.forEach(
      (tooltip) => {
        if (tooltip) tooltip.style.display = "none";
      }
    );
    customPricingTooltipsPlan.forEach(
      (tooltip) => {
        if (tooltip) tooltip.style.display = "none";
      }
    );
    customPricingTags.forEach((tag) => {
      if (tag) tag.style.display = "none";
    });
  }

  // Function to scroll to the pricing section
  function scrollToPricing() {
    let element = document.getElementById("quote");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Constants
  const ATTRIBUTE_KEY = "pp";
  const PROFESSIONAL_PLAN = "Professional";
  const CHAMPIONSHIP_PLAN = "Championship";
  const HIGHLIGHT_CLASS = "cc-active";
  const DEFAULT_COUNTRY = "United States";
  const SELECTION_NULL = "selection-null";

  // Helper function to create an attribute selector
  const select = (attributeValue) => `[${ATTRIBUTE_KEY}='${attributeValue}']`;

  debugLog("Initializing Perch Pricing Calculator v2.3.2");

  // Get the sections
  const section1 = document.querySelector(select("section-1"));
  const section2 = document.querySelector(select("section-2"));
  debugLog("Sections found:", !!section1, !!section2);
  if (!section1 || !section2) {
    debugLog("Required sections not found, exiting");
    return;
  }

  // Get the preloader
  const preloader = document.querySelector(select("preloader"));
  debugLog("Preloader found:", !!preloader);
  if (!preloader) {
    debugLog("Preloader not found, continuing anyway");
  }

  // Get the email source and target
  const emailSource = document.querySelector(select("email-source"));
  const emailTarget = document.querySelector(select("email-target"));
  debugLog("Email elements found:", !!emailSource, !!emailTarget);
  if (!emailSource || !emailTarget) {
    debugLog("Email elements not found, continuing anyway");
  }

  // Get the country and state selects
  const countrySelect = document.querySelector(select("country-select"));
  const usStateSelect = document.querySelector(select("us-state-select"));
  debugLog("Country/state selects found:", !!countrySelect, !!usStateSelect);
  if (!countrySelect || !usStateSelect) {
    debugLog("Country/state selects not found, continuing anyway");
  }

  // Get the perch use select
  const perchUseSelect = getElement(section1, select("use-select"));
  debugLog("Perch use select found:", !!perchUseSelect);
  if (!perchUseSelect) {
    debugLog("Perch use select not found, continuing anyway");
  }

  // Get the quantity counter and buttons
  const quantityCounter = document.querySelector(select("quantity-counter"));
  const quantityButtons = document.querySelectorAll(
    select("quantity-counter-button")
  );
  const quantityDisplays = document.querySelectorAll(select("quantity-display"));
  debugLog("Quantity elements found:", !!quantityCounter, quantityButtons.length, quantityDisplays.length);
  if (!quantityCounter) {
    debugLog("Quantity counter not found, continuing anyway");
  }

  // Get the plan card wrappers and radio buttons
  const planCardWrappers = document.querySelectorAll(select("plan-card-wrapper"));
  const planRadioButtons = document.querySelectorAll(
    "input[type='radio'][name='desired_subscription_plans']"
  );
  const selectedPlanDisplays = document.querySelectorAll(
    select("selected-plan-display")
  );
  debugLog("Plan elements found:", planCardWrappers.length, planRadioButtons.length, selectedPlanDisplays.length);

  // Get the pricing quote tabs
  const pricingQuoteTabs = getElement(section2, select("pricing-quote-tabs"));
  debugLog("Pricing quote tabs found:", !!pricingQuoteTabs);
  if (!pricingQuoteTabs) {
    debugLog("Pricing quote tabs not found, this may cause issues");
  }

  // Get the cost summary wrappers
  const costSummaryWraps = document.querySelectorAll(select("cost-summary-wrap"));
  debugLog("Cost summary wraps found:", costSummaryWraps.length);

  // Get the pricing elements
  const haasRecurringAnnualCost = document.querySelector(
    select("haas-recurring-annual-cost")
  );
  const haasTotalCost = document.querySelector(select("grand-total-cost-haas"));
  //const cashUpfrontCost = document.querySelector(select("cash-upfront-cost"));
  const cashRecurringAnnualCost = document.querySelector(
    select("cash-recurring-annual-cost")
  );
  const cashYear1Total = document.querySelector(select("cash-year-1-total"));
  const cashTotalCost = document.querySelector(select("grand-total-cost-cash"));
  
  debugLog("Pricing elements found:", 
    "haasRecurringAnnualCost:", !!haasRecurringAnnualCost, 
    "haasTotalCost:", !!haasTotalCost,
    //"cashUpfrontCost:", !!cashUpfrontCost,
    "cashRecurringAnnualCost:", !!cashRecurringAnnualCost,
    "cashYear1Total:", !!cashYear1Total,
    "cashTotalCost:", !!cashTotalCost
  );

  // Get the custom pricing elements
  const customPricingTags = document.querySelectorAll(select("custom-pricing-tag"));
  const customPricingTooltipsQuantity = document.querySelectorAll(
    select("custom-pricing-tooltip-quantity")
  );
  const customPricingTooltipsPlan = document.querySelectorAll(
    select("custom-pricing-tooltip-plan")
  );
  
  debugLog("Custom pricing elements found:", 
    "customPricingTags:", customPricingTags.length, 
    "customPricingTooltipsQuantity:", customPricingTooltipsQuantity.length,
    "customPricingTooltipsPlan:", customPricingTooltipsPlan.length
  );

  // Hide the custom pricing tooltips initially
  customPricingTooltipsQuantity.forEach(
    (tooltip) => {
      if (tooltip) tooltip.style.display = "none";
    }
  );
  customPricingTooltipsPlan.forEach(
    (tooltip) => {
      if (tooltip) tooltip.style.display = "none";
    }
  );

  // Set the default state of the submit button to disabled
  disableSubmitButton();

  // Set the default value of the US state select to Alabama
  if (usStateSelect) {
    usStateSelect.value = "Alabama";
  }

  // Add event listeners
  if (countrySelect && usStateSelect) {
    countrySelect.addEventListener("change", () => {
      countrySelect.value === DEFAULT_COUNTRY
        ? (usStateSelect.style.display = "block")
        : (usStateSelect.style.display = "none");

      if (countrySelect.value == SELECTION_NULL) {
        disableNextButton(1);
      } else if (
        countrySelect.value === DEFAULT_COUNTRY &&
        usStateSelect.value == SELECTION_NULL
      ) {
        disableNextButton(1);
      } else {
        enableNextButton(1);
      }
    });

    usStateSelect.addEventListener("change", () => {
      if (
        countrySelect.value === DEFAULT_COUNTRY &&
        usStateSelect.value == SELECTION_NULL
      ) {
        disableNextButton(1);
      } else if (
        countrySelect.value === DEFAULT_COUNTRY &&
        usStateSelect.value != SELECTION_NULL
      ) {
        enableNextButton(1);
      }
    });
  }

  if (perchUseSelect) {
    perchUseSelect.addEventListener("change", () => {
      if (perchUseSelect.value === SELECTION_NULL) {
        disableSubmitButton(1);
      } else {
        enableSubmitButton(1);
      }
    });
  }

  if (section1) {
    section1.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (preloader) preloader.style.display = "flex";
      section1.style.display = "none";
      section2.style.display = "block";
      hidePricing();
      window.scrollTo(0, 0);
      await delay(2500);
      if (preloader) preloader.style.display = "none";
      if (emailTarget && emailSource) emailTarget.value = emailSource.value;
    });
  }

  const hardwareToggleButtons = getElements(section2, ".c-toggle__button");
  debugLog("Hardware toggle buttons found:", hardwareToggleButtons.length);
  
  hardwareToggleButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      if (button.hasAttribute("readonly")) {
        event.preventDefault();
        return;
      }

      let hardwareItem = button.closest(select("hardware-item"));
      if (!hardwareItem) {
        debugLog("Hardware item not found for button");
        return;
      }
      
      let hardwareName = hardwareItem.querySelector(select("hardware-name"));
      let hardwareNameText = hardwareName?.innerText || "";
      let hardwareNameWrapper = hardwareItem.querySelector(".c-toggle__text");
      
      debugLog("Hardware item clicked:", hardwareNameText, "Checked:", button.checked);
      
      if (hardwareNameWrapper) {
        button.checked
          ? hardwareNameWrapper.classList.add("cc-active")
          : hardwareNameWrapper.classList.remove("cc-active");
      }

      getElements(section2, select("pricing-hardware-item"))
        .filter((item) => {
          let itemName =
            item.querySelector(select("hardware-name"))?.innerHTML || "";
          return compareStrings(itemName, hardwareNameText);
        })
        .forEach((item) => {
          button.checked
            ? item.classList.add("cc-active")
            : item.classList.remove("cc-active");
        });
    });
  });

  if (quantityButtons.length > 0 && quantityCounter) {
    quantityButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        await delay(0);
        let quantity = quantityCounter.value;
        debugLog("Quantity changed to:", quantity);
        quantityDisplays.forEach((display) => {
          if (display) display.innerText = quantity;
        });
        updatePricing();
      });
    });
  }

  if (planRadioButtons.length > 0) {
    planRadioButtons.forEach((radioButton) => {
      let planCardWrapper = radioButton.closest(select("plan-card-wrapper"));
      if (planCardWrapper) {
        if (radioButton.value === PROFESSIONAL_PLAN) {
          radioButton.checked = true;
          highlightPlanCard(planCardWrapper);
          selectedPlanDisplays.forEach(
            (display) => {
              if (display) display.innerText = radioButton.value;
            }
          );
        }

        radioButton.addEventListener("change", () => {
          debugLog("Plan changed to:", radioButton.value);
          highlightPlanCard(planCardWrapper);
          selectedPlanDisplays.forEach(
            (display) => {
              if (display) display.innerText = radioButton.value;
            }
          );
          scrollToPricing();
        });
      }
    });
  }

  function highlightPlanCard(planCardWrapper) {
    planCardWrappers.forEach((wrapper) => {
      for (let child of wrapper.children) {
        child.classList.remove(HIGHLIGHT_CLASS);
      }
    });

    for (let child of planCardWrapper.children) {
      child.classList.add(HIGHLIGHT_CLASS);
    }
  }

  hardwareToggleButtons.forEach((button) => {
    button.addEventListener("click", updatePricing);
  });
  
  planRadioButtons.forEach((radioButton) => {
    radioButton.addEventListener("change", updatePricing);
  });

  // Call updatePricing initially to set default values
  setTimeout(updatePricing, 1000);

  function updatePricing() {
    debugLog("Updating pricing");
    
    // Check if pricingQuoteTabs exists before proceeding
    if (!pricingQuoteTabs) {
      debugLog("Pricing quote tabs not found, cannot update pricing");
      return;
    }

    let selectedPlan = getCheckedRadioValue(
      section2,
      "desired_subscription_plans"
    );
    debugLog("Selected plan:", selectedPlan);

    if (selectedPlan !== "Standard") {
      debugLog("Non-standard plan selected, showing error");
      showError("plan");
      return;
    }

    let quantity = parseInt(quantityCounter ? quantityCounter.value : "1");
    debugLog("Current quantity:", quantity);
    
    let selectedPlanCardWrapper = Array.from(planCardWrappers).find(
      (wrapper) => {
        let radioButton = wrapper.querySelector(
          "input[type='radio'][name='desired_subscription_plans']"
        );
        return radioButton && radioButton.checked;
      }
    );

    if (!selectedPlanCardWrapper) {
      debugLog("No plan card wrapper found for selected plan");
      return;
    }

    let { planName, priceByQuantity } = getPlanDetails(selectedPlanCardWrapper);
    debugLog("Plan details:", planName, priceByQuantity);
    
    let softwareCost = getPriceByQuantity(priceByQuantity, quantity) * quantity;
    debugLog("Software cost:", softwareCost);

    let hardwarePriceHaas = 0;
    let hardwarePriceCash = 0;

    // Get all hardware items with pp="hardware-item"
    const hardwareItems = getElements(section2, select("hardware-item"));
    debugLog("Hardware items found:", hardwareItems.length);
    
    hardwareItems.forEach((hardwareItem) => {
      let toggleButton = hardwareItem.querySelector(".c-toggle__button");
      if (toggleButton && toggleButton.checked) {
        debugLog("Hardware item checked:", hardwareItem.querySelector(select("hardware-name"))?.innerText);
        
        let haasPrice = parseFloat(
          removePrefix(
            getElement(hardwareItem, select("hardware-price-haas"))?.innerText ||
              "0",
            "$"
          ).replace(/,/g, "")
        );
        let cashPrice = parseFloat(
          removePrefix(
            getElement(hardwareItem, select("hardware-price-cash"))?.innerText ||
              "0",
            "$"
          ).replace(/,/g, "")
        );

        debugLog("Hardware prices - HaaS:", haasPrice, "Cash:", cashPrice);
        
        hardwarePriceHaas += haasPrice * quantity;
        hardwarePriceCash += cashPrice * quantity;
      }
    });

    debugLog("Total hardware prices - HaaS:", hardwarePriceHaas, "Cash:", hardwarePriceCash);
    
    let totalHaas = softwareCost + hardwarePriceHaas;
    let totalCash = softwareCost + hardwarePriceCash;
    
    debugLog("Total costs - HaaS:", totalHaas, "Cash:", totalCash);

    if (totalHaas > 15000) {
      debugLog("Total HaaS cost exceeds 15000, showing error");
      showError("quantity");
      return;
    }

    hideError();

    // Update the pricing text
    if (haasRecurringAnnualCost) {
      debugLog("Updating haasRecurringAnnualCost to:", formatCurrency(softwareCost));
      haasRecurringAnnualCost.innerText = formatCurrency(softwareCost);
    }
    
    if (haasTotalCost) {
      debugLog("Updating haasTotalCost to:", formatCurrency(totalHaas));
      haasTotalCost.innerText = formatCurrency(totalHaas);
    }
    
    // Even though we're focusing on HaaS, we still update cash values if the elements exist
    // This ensures backward compatibility with existing HTML structure
    //if (cashUpfrontCost) {
      //debugLog("Updating cashUpfrontCost to:", formatCurrency(hardwarePriceCash));
      //cashUpfrontCost.innerText = formatCurrency(hardwarePriceCash);
    //}
    
    if (cashRecurringAnnualCost) {
      debugLog("Updating cashRecurringAnnualCost to:", formatCurrency(softwareCost));
      cashRecurringAnnualCost.innerText = formatCurrency(softwareCost);
    }
    
    if (cashYear1Total) {
      debugLog("Updating cashYear1Total to:", formatCurrency(totalCash));
      cashYear1Total.innerText = formatCurrency(totalCash);
    }
    
    if (cashTotalCost) {
      debugLog("Updating cashTotalCost to:", formatCurrency(totalCash));
      cashTotalCost.innerText = formatCurrency(totalCash);
    }
    
    debugLog("Pricing update complete");
  }

  // Function to hide pricing
  function hidePricing() {
    debugLog("Hiding pricing");
    
    // Only update elements that exist to avoid errors
    //if (cashUpfrontCost) cashUpfrontCost.innerText = "";
    if (cashRecurringAnnualCost) cashRecurringAnnualCost.innerText = "";
    if (cashYear1Total) cashYear1Total.innerText = "";
    if (cashTotalCost) cashTotalCost.innerText = "";
    if (haasRecurringAnnualCost) haasRecurringAnnualCost.innerText = "";
    if (haasTotalCost) haasTotalCost.innerText = "";
  }

  // Functions to enable/disable buttons
  function disableNextButton(step) {
    let nextButtons = document.querySelectorAll('button[data-form="next-btn"]');
    if (nextButtons.length > step) {
      let nextButton = nextButtons[step];
      nextButton.style.pointerEvents = "none";
      nextButton.style.opacity = "0.5";
      nextButton.classList.add("disabled");
    }
  }

  function enableNextButton(step) {
    let nextButtons = document.querySelectorAll('button[data-form="next-btn"]');
    if (nextButtons.length > step) {
      let nextButton = nextButtons[step];
      nextButton.style.pointerEvents = "auto";
      nextButton.style.opacity = "1";
      nextButton.classList.remove("disabled");
    }
  }

  function disableSubmitButton() {
    let submitButton = document.querySelector('[data-submit="true"]');
    if (submitButton) {
      submitButton.style.pointerEvents = "none";
      submitButton.style.opacity = "0.5";
      submitButton.classList.add("disabled");
    }
  }

  function enableSubmitButton() {
    let submitButton = document.querySelector('[data-submit="true"]');
    if (submitButton) {
      submitButton.style.pointerEvents = "auto";
      submitButton.style.opacity = "1";
      submitButton.classList.remove("disabled");
    }
  }
  
  // Fix for FAQ script error
  document.addEventListener('DOMContentLoaded', () => {
    // Override the problematic script by adding our fix first
    const faqContainers = document.querySelectorAll('.faq_wrap');
    if (faqContainers.length === 0) return; // Exit if no FAQ containers
    
    faqContainers.forEach(faqContainer => {
      const faqItems = faqContainer.querySelectorAll('.faq_item');
      if (faqItems.length > 0) {
        let firstFaqItem = faqItems[0];
        const radioButton = firstFaqItem.querySelector('input[type="radio"]');
        if (radioButton) {
          radioButton.checked = true;
        }
      }
    });
  });
  
  debugLog("Perch Pricing Calculator initialization complete");
})();
