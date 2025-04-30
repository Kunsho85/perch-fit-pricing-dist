Perch Fit Pricing Calculator
This is the documentation for the Perch Pricing Calculator. The calculator allows users to configure their Perch hardware and subscription options to get accurate pricing information.

Version 2.3.4 Update (April 18, 2025)
In this update, we've fixed issues with tier card selection and custom pricing tag display:

Key Changes:
Fixed tier card selection to ensure only the selected plan (Professional by default) is highlighted
Improved custom pricing tag display by changing from display: block to display: flex for better layout
Added null checks for DOM elements to prevent console errors
Fixed FAQ script error that was causing console issues
Version 2.3 Update (April 12, 2025)
In this update, we've removed the tab structure and now only display the "Hardware as a Service" (HaaS) pricing option. The "Upfront Purchase" option has been removed from the UI as per client request, while maintaining all existing calculation rules and business logic.

Key Changes:
Removed tab structure dependency
Focused UI on Hardware as a Service option only
Preserved all existing calculation rules and error handling
Maintained custom pricing tooltips for different scenarios
Attributes
To connect functionality with elements, attributes are used. All elements that are relevant for the calculator functionality have such an attribute assigned to them in Webflow.

The attribute key is always "pp," as defined with this constant:

const ATTRIBUTE_KEY = "pp"
And with the helper function as (attribute selector):

const as = (attributeValue: string): string => `[${ATTRIBUTE_KEY}='${attributeValue}']`
the attribute selector string can be generated.

List of attributes
pp='preloader' This attribute marks the preloader element, which is shown after the first form is submitted.

pp='section-1' This attribute marks the first form section, which gets hidden, after the first form is submitted

pp='email-source' This attribute marks the email field which is the source of the value, that should be copied to the hidden email field in the second form.

pp='email-target' This attribute marks the hidden email field inside the second form which is the target element, where the email of the first form should be copied to.

pp='country-select' This attribute marks the country select dropdown inside the first form. (Which defaults to United States)

pp='us-state-select' This attribute marks the US state select dropdown inside the first form. It is only shown when "United States" is selected in the country-select dropdown. Otherwise it is hidden. (Which defaults to Alabama)

pp='use-select' This attribute marks the Perch Use reasons select dropdown inside the first form. (Which defaults to Please select...)

pp='section-2' This attribute marks the second form section, which is initially hidden, and is visible after the first form is submitted, and the preloader disappears.

pp='quantity-counter-button' This attribute marks the two buttons which increase/decrease the quantity counter input field.

pp='quantity-counter' This attribute marks the quantity counter input field.

pp='quantity-display' This attribute marks all fields, which should display the current quantity. (Automatically updates as the quantity changes)

pp='hardware-item' This attribute marks all the hardware items below the quantity input. Each hardware item is a wrapper which contains multiple other elements, relevant for the calculation.

pp='hardware-price-haas' This hidden element contains the haas-price of the parent hardware item. This value is later used to calculate the total price.

pp='hardware-price-cash' This hidden element contains the cash-price of the parent hardware item. This value is still used internally for calculations but not displayed in the UI.

pp='hardware-toggle-wrap' This attribute marks the element wrapping the toggle button of the parent hardware item

pp='hardware-name' This hidden element contains the name of the parent hardware item

pp='plan-card-wrapper' This attribute marks the elements which wrap a pricing plan card

pp='plan-card-selected-tag' This attribute marks the "selected" tag element of a pricing plan card

pp='plan-card-top' This attribute marks the top section of a pricing plan card

pp='plan-card-middle' This attribute marks the middle section of a pricing plan card

pp='plan-card-bottom' This attribute marks the bottom section of a pricing plan card

pp='plan-name' This attribute marks the element which displays the name of a pricing plan. This value is connected to the CMS.

pp='selected-plan-display' This attribute marks all fields, which should display the currently selected plan. (Automatically updates as the plan changes)

pp='custom-pricing-tag' This attribute marks the element tag which says "CUSTOM PRICING" in the pricing result section. As of v2.3.4, this uses flex display for better layout.

pp='custom-pricing-tooltip-plan' This attribute marks the tooltip which is shown when the reason for the custom pricing is, that a custom pricing plan has been selected.

pp='custom-pricing-tooltip-quantity' This attribute marks the tooltip which is shown when the reason for the custom pricing is, that the quantity requires custom pricing.

pp='pricing-quote-tabs' This attribute marks the container element in the pricing result section. While no longer using tabs, this attribute is still used for backward compatibility.

pp='cost-summary-wrap' This attribute marks the elements where the cost summary is displayed

pp='pricing-hardware-item' This attribute marks all the hardware items in the pricing result section. The display state of a hardware item is connected with the selection of the hardware items below the quantity counter

pp='haas-recurring-annual-cost' This attribute marks the element which displays the recurring annual cost for HaaS

pp='grand-total-cost-haas' This attribute marks the element which displays the total cost of HaaS pricing

pp='cash-upfront-cost' This attribute marks the element which displays the upfront cost (hidden in v2.3)

pp='cash-recurring-annual-cost' This attribute marks the element which displays the recurring annual cost for cash option (hidden in v2.3)

pp='cash-year-1-total' This attribute marks the element which displays the year-1 total cost for cash option (hidden in v2.3)

pp='grand-total-cost-cash' This attribute marks the element which displays the total cost of upfront/cash pricing (hidden in v2.3)

Data attributes
The data for the software pricing is rendered from the CMS into a hidden embed inside the pricing card plan.

data-pp-quantity The value of this attribute contains the quantity

data-pp-price The value of this attribute contains the price which is associated with the connected quantity.
