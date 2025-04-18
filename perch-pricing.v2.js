// SCRIPT VERSION 2.3.4 // 
// LAST UDPATE 18th of April 2025 //

"use strict";

(() => {
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
    let planName =
      getElement(planCardWrapper, "[pp='plan-name']")?.innerText.trim() || "";
    if (!planName) throw new Error("could not find plan name");

    let priceByQuantity = new Map();
    getElements(planCardWrapper, "[data-pp-quantity]").forEach((element) => {
      let quantity = Number(element.getAttribute("data-pp-quantity"));
      let price = Number(element.getAttribute("data-pp-price"));
      priceByQuantity.set(quantity, price);
    });

    return { planName, priceByQuantity };
  }

  // Function to calculate the total price of the selected hardware items
  function calculateHardwarePrice(element, priceType) {
    return getElements(element, "[pp='hardware-item']")
      .filter((item) => {
        let checkbox = item.querySelector("input[type='checkbox']");
        return checkbox ? checkbox.checked : false;
      })
      .reduce((total, item) => {
        let priceText =
          getElement(
            item,
            priceType === "cash"
              ? "[pp='hardware-price-cash']"
              : "[pp='hardware-price-haas']"
          )?.innerText.trim() || "";
        let price = Number(
          removePrefix(priceText, "$").trim().replace(/,/g, "")
        );
        return total + price;
      }, 0);
  }

  const PROFESSIONAL_PLAN = "Professional";
  const MAX_QUANTITY = 10;
  const DEFAULT_COUNTRY = "United States (US)";
  const SELECTION_NULL = "selection-null";
  const PREFIX = "pp";
  const HIGHLIGHT_CLASS = "cc-highlighted";
  const ACTIVE_CLASS = "cc-active";
  const select = (selector) => `[${PREFIX}='${selector}']`;
  const section1 = getElement(document.body, select("section-1"));
  const section2 = getElement(document.body, select("section-2"));
  const preloader = getElement(document.body, select("preloader"));
  const quantityCounter = getElement(document.body, select("quantity-counter"));
  const quantityButtons = getElements(
    section2,
    select("quantity-counter-button")
  );
  const quantityDisplays = getElements(section2, select("quantity-display"));
  const selectedPlanDisplays = getElements(
    section2,
    select("selected-plan-display")
  );
  const planCardWrappers = getElements(section2, select("plan-card-wrapper"));
  const planRadioButtons = planCardWrappers.flatMap((wrapper) =>
    getElements(wrapper, "input[type='radio']")
  );
  const emailSource = getElement(section1, select("email-source"));
  const emailTarget = getElement(section2, select("email-target"));
  const pricingQuoteTabs = getElement(section2, select("pricing-quote-tabs"));
  // Removed tab menu reference as we no longer use tabs
  // const tabMenu = pricingQuoteTabs.querySelector(".w-tab-menu");
  const cashUpfrontCost = section2.querySelector(select("cash-upfront-cost"));
  const cashRecurringAnnualCost = section2.querySelector(
    select("cash-recurring-annual-cost")
  );
  const cashYear1Total = section2.querySelector(select("cash-year-1-total"));
  const cashTotalCost = section2.querySelector(select("grand-total-cost-cash"));
  const haasRecurringAnnualCost = section2.querySelector(
    select("haas-recurring-annual-cost")
  );
  const haasTotalCost = section2.querySelector(select("grand-total-cost-haas"));
  const customPricingTags = document.querySelectorAll(
    '[pp="custom-pricing-tag"]'
  );
  // Set custom pricing tags to use flex display instead of block
  customPricingTags.forEach((element) => {
    element.style.display = "none"; // Initially hidden
  });
  
  const costSummaryWraps = getElements(section2, select("cost-summary-wrap"));
  const customPricingTooltipsQuantity = document.querySelectorAll(
    '[pp="custom-pricing-tooltip-quantity"]'
  );
  customPricingTooltipsQuantity.forEach((element) => {
    element.style.display = "none";
  });
  const customPricingTooltipsPlan = document.querySelectorAll(
    '[pp="custom-pricing-tooltip-plan"'
  );
  const countrySelect = getElement(section1, select("country-select"));
  const usStateSelect = getElement(section1, select("us-state-select"));
  const perchUseSelect = getElement(section1, select("use-select"));
  console.log(perchUseSelect);

  countrySelect.value = DEFAULT_COUNTRY;
  usStateSelect.value = "Alabama";
  disableSubmitButton();

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
      disableNextButton();
    } else if (
      countrySelect.value === DEFAULT_COUNTRY &&
      usStateSelect.value != SELECTION_NULL
    ) {
      enableNextButton();
    }
  });

  perchUseSelect.addEventListener("change", () => {
    if (perchUseSelect.value === SELECTION_NULL) {
      disableSubmitButton();
    } else {
      enableSubmitButton();
    }
  });

  getElements(section2, "[fs-accordion-element='content']").forEach(
    async (content) => {
      await delay(500);
      let group = content.closest("[fs-accordion-element='group']");
      let active = group?.getAttribute("fs-accordion-active");
      if (active && content.classList.contains(active)) {
        content.style.maxHeight = "none";
      }
    }
  );

  if (!location.search.includes("show-both-forms")) {
    section2.style.display = "none";
  }

  section1.addEventListener("submit", async (event) => {
    event.preventDefault();
    preloader.style.display = "flex";
    section1.style.display = "none";
    section2.style.display = "block";
    hidePricing();
    window.scrollTo(0, 0);
    await delay(2500);
    preloader.style.display = "none";
    emailTarget.value = emailSource.value;
  });

  const hardwareToggleButtons = getElements(section2, ".c-toggle__button");
  hardwareToggleButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      if (button.hasAttribute("readonly")) {
        event.preventDefault();
        return;
      }

      let hardwareItem = button.closest(select("hardware-item"));
      let hardwareName = hardwareItem?.querySelector(select("hardware-name"));
      let hardwareNameText = hardwareName?.innerText || "";
      let hardwareNameWrapper = hardwareItem.querySelector(".c-toggle__text");
      button.checked
        ? hardwareNameWrapper.classList.add("cc-active")
        : hardwareNameWrapper.classList.remove("cc-active");

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

  quantityButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      await delay(0);
      let quantity = quantityCounter.value;
      quantityDisplays.forEach((display) => (display.innerText = quantity));
      updatePricing();
    });
  });

  planRadioButtons.forEach((radioButton) => {
    let planCardWrapper = radioButton.closest(select("plan-card-wrapper"));
    if (planCardWrapper) {
      if (radioButton.value === PROFESSIONAL_PLAN) {
        radioButton.checked = true;
        highlightPlanCard(planCardWrapper);
        selectedPlanDisplays.forEach(
          (display) => (display.innerText = radioButton.value)
        );
      }

      radioButton.addEventListener("change", () => {
        highlightPlanCard(planCardWrapper);
        selectedPlanDisplays.forEach(
          (display) => (display.innerText = radioButton.value)
        );
        scrollToPricing();
      });
    }
  });

  // Modified function to properly handle tier card selection
  function highlightPlanCard(planCardWrapper) {
    // First, reset all selection tags on all plan cards
    planCardWrappers.forEach((wrapper) => {
      // Find the selection tag in this wrapper
      const selectTag = wrapper.querySelector('.pricing_tier_select_tag');
      if (selectTag) {
        // Remove both highlight and active classes
        selectTag.classList.remove(HIGHLIGHT_CLASS, ACTIVE_CLASS);
      }
      
      // Also reset other elements that might have highlight classes
      wrapper.querySelectorAll('.pricing_tier_top, .pricing_tier_middle, .pricing_tier_bottom').forEach(element => {
        element.classList.remove(HIGHLIGHT_CLASS, ACTIVE_CLASS);
      });
    });

    // Now highlight only the selected plan card's selection tag
    const selectedSelectTag = planCardWrapper.querySelector('.pricing_tier_select_tag');
    if (selectedSelectTag) {
      // Add both highlight and active classes to the selected card's tag
      selectedSelectTag.classList.add(HIGHLIGHT_CLASS, ACTIVE_CLASS);
    }
    
    // Also highlight other elements in the selected card if needed
    planCardWrapper.querySelectorAll('.pricing_tier_top, .pricing_tier_middle, .pricing_tier_bottom').forEach(element => {
      element.classList.add(HIGHLIGHT_CLASS, ACTIVE_CLASS);
    });
  }

  hardwareToggleButtons.forEach((button) => {
    button.addEventListener("click", updatePricing);
  });

  // Removed tab menu event listener as we no longer use tabs
  // tabMenu?.addEventListener("click", updatePricing);
  planRadioButtons.forEach((radioButton) => {
    radioButton.addEventListener("change", updatePricing);
  });

  function updatePricing() {
    if (!pricingQuoteTabs) return;

    let selectedPlan = getCheckedRadioValue(
      section2,
      "desired_subscription_plans"
    );

    if (selectedPlan !== "Standard") {
      showError("plan");
      return;
    }

    let quantity = Number(quantityDisplays[0].innerText);
    if (quantity > MAX_QUANTITY) {
      showError("quantity");
      return;
    }

    hideError();

    let selectedPlanCardWrapper = document
      .querySelector(`input[type='radio'][value='${selectedPlan}']`)
      .closest(select("plan-card-wrapper"));
    if (!selectedPlanCardWrapper)
      throw new Error("no selected plan card wrapper");

    let hardwarePriceHaas = calculateHardwarePrice(section2, "haas") * quantity;
    // Still calculate cash price for internal use, but we won't display it
    let hardwarePriceCash = calculateHardwarePrice(section2, "cash") * quantity;
    let softwareCost = getPlanDetails(
      selectedPlanCardWrapper
    ).priceByQuantity.get(quantity);
    if (!softwareCost) throw new Error("no software cost found");

    let totalHaas = softwareCost + hardwarePriceHaas;
    let totalCash = softwareCost + hardwarePriceCash;

    // Keep both checks to maintain existing business rules
    if (totalHaas > 15000 || totalCash > 15000) {
      showError("quantity");
      return;
    }

    // Hide cash/upfront elements by setting them to empty strings
    // We keep these lines to avoid breaking the code, but they won't be visible in UI
    if (cashUpfrontCost) cashUpfrontCost.innerText = "";
    if (cashRecurringAnnualCost) cashRecurringAnnualCost.innerText = "";
    if (cashYear1Total) cashYear1Total.innerText = "";
    if (cashTotalCost) cashTotalCost.innerText = "";
    
    // Only show HaaS pricing as per client request
    if (haasRecurringAnnualCost) {
      haasRecurringAnnualCost.innerText = formatCurrency(
        softwareCost + hardwarePriceHaas
      );
    }
    
    if (haasTotalCost) {
      haasTotalCost.innerText = formatCurrency(softwareCost + hardwarePriceHaas);
    }
  }

  function showError(type) {
    costSummaryWraps.forEach((wrap) => (wrap.style.display = "none"));
    customPricingTags.forEach((element) => {
      element.style.display = "flex"; // Use flex instead of block
    });
    hidePricing();

    if (type === "plan") {
      customPricingTooltipsPlan.forEach((element) => {
        element.style.display = "block";
      });
      customPricingTooltipsQuantity.forEach((element) => {
        element.style.display = "none";
      });
    } else if (type === "quantity") {
      customPricingTooltipsPlan.forEach((element) => {
        element.style.display = "none";
      });
      customPricingTooltipsQuantity.forEach((element) => {
        element.style.display = "block";
      });
    }
  }

  function hideError() {
    costSummaryWraps.forEach((wrap) => (wrap.style.display = "block"));
    customPricingTags.forEach((element) => {
      element.style.display = "none";
    });
  }

  function hidePricing() {
    // Hide cash/upfront elements by setting them to empty strings
    if (cashUpfrontCost) cashUpfrontCost.innerText = "";
    if (cashRecurringAnnualCost) cashRecurringAnnualCost.innerText = "";
    if (cashYear1Total) cashYear1Total.innerText = "";
    if (cashTotalCost) cashTotalCost.innerText = "";
    
    // Only reset HaaS pricing elements
    if (haasRecurringAnnualCost) haasRecurringAnnualCost.innerText = "";
    if (haasTotalCost) haasTotalCost.innerText = "";
  }

  function scrollToPricing() {
    let element = document.getElementById("quote");
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function disableNextButton(step) {
    let nextButton = document.querySelectorAll('button[data-form="next-btn"]')[
      step
    ];
    if (nextButton) {
      nextButton.style.pointerEvents = "none";
      nextButton.style.opacity = "0.5";
      nextButton.classList.add("disabled");
    }
  }

  function enableNextButton(step) {
    let nextButton = document.querySelectorAll('button[data-form="next-btn"]')[
      step
    ];
    if (nextButton) {
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
    // Get all FAQ containers
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
})();
