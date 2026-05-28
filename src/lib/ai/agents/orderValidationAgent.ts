import { getCartTool } from "../tools/cartTools";
import { checkGroupCartConflicts } from "./groupCoordinatorAgent";
import { getLLM } from "../gemini";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedWaitTime: number; // minutes
}

/**
 * Validates the table cart against strict kitchen constraints and business rules.
 */
export async function validateSharedOrder(sessionId: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let estimatedWaitTime = 15; // default wait

  try {
    const cart = await getCartTool(sessionId);
    const cartItems = cart.items;

    // 1. Empty Cart Check
    if (cartItems.length === 0) {
      return {
        isValid: false,
        errors: ["Your table's shared cart is currently empty. Please add some delectable dishes before placing an order!"],
        warnings: [],
        estimatedWaitTime: 0,
      };
    }

    // 2. Kitchen Quantity Constraints (typo protections)
    let totalQuantity = 0;
    const maxSingleItemQty = 10;
    const maxTotalItems = 30;

    // Gather preparation times
    const prepTimes: number[] = [];

    for (const item of cartItems) {
      totalQuantity += item.quantity;
      prepTimes.push(item.menuItem.prepTime || 15);

      // Check stock availability
      if (!item.menuItem.available) {
        errors.push(`"${item.menuItem.name}" is temporarily out of stock. Please remove it from the cart to proceed.`);
      }

      // Check single item bounds
      if (item.quantity > maxSingleItemQty) {
        errors.push(`Quantity for "${item.menuItem.name}" exceeds the limit of ${maxSingleItemQty} per table. Please adjust to prevent kitchen overload.`);
      }
    }

    // Check total cart quantity bounds
    if (totalQuantity > maxTotalItems) {
      errors.push(`Total items in your cart (${totalQuantity}) exceed the group limit of ${maxTotalItems}. Please narrow down your choices.`);
    }

    // 3. Estimate Wait Time dynamically based on the longest dish prep time
    if (prepTimes.length > 0) {
      const maxPrep = Math.max(...prepTimes);
      estimatedWaitTime = maxPrep + 5; // adding a buffer for assembly
    }

    // 4. Run Group Allergen Conflict checks
    const conflictReview = await checkGroupCartConflicts(sessionId);
    if (conflictReview.conflictDetected) {
      if (conflictReview.conflictType === "allergen_alert") {
        warnings.push(
          `Allergen conflict detected: ${conflictReview.warningMessage} Please verify with your guests before placing this order.`
        );
      } else if (conflictReview.conflictType === "diet_mismatch") {
        warnings.push(conflictReview.warningMessage);
      }
    }

    // 5. Final check
    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      estimatedWaitTime,
    };
  } catch (error: any) {
    console.error("❌ Error in order validation agent:", error);
    return {
      isValid: false,
      errors: ["Failed to validate your order due to a system check interruption. Please try again."],
      warnings: [],
      estimatedWaitTime: 15,
    };
  }
}
