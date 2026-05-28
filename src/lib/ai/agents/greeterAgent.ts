import { getPreferences, updatePreference, parseAndSavePreferences } from "./contextMemoryAgent";
import { getLLM } from "../gemini";

interface GreeterResult {
  speech: string;
  onboardingCompleted: boolean;
  nextStep?: number;
}

/**
 * Welcomes the guest and initiates/progresses a clean 2-question onboarding flow.
 * - Q1: Allergies & Dietary Restrictions
 * - Q2: Preferred Spice Level
 */
export async function runGreeterOrOnboarding(
  sessionId: string,
  userMessage?: string
): Promise<GreeterResult> {
  const preferences = await getPreferences(sessionId);

  // Case 1: Initial welcome (First message, userMessage is empty or onboarding completed not set)
  if (!userMessage || preferences.onboardingCompleted === undefined) {
    await updatePreference(sessionId, "onboardingCompleted", false);
    await updatePreference(sessionId, "onboardingStep", 1);
    
    return {
      speech: `Namaste! Welcome to Spice Garden. 🌸 I am Zara, your personal AI Dining Sommelier.

Before we explore our exquisite menu, could you share if you have any dietary preferences (such as vegetarian or vegan) or food allergies I should keep in mind?`,
      onboardingCompleted: false,
      nextStep: 1,
    };
  }

  // Case 2: Onboarding completed already. Direct to main conversational flow.
  if (preferences.onboardingCompleted === true) {
    return {
      speech: "How can I assist you with your order today? Are you looking for starters, mains, or something refreshing to drink?",
      onboardingCompleted: true,
    };
  }

  const currentStep = preferences.onboardingStep || 1;

  // Case 3: Processing Question 1 response (Diet & Allergens)
  if (currentStep === 1) {
    // Parse diet/allergens from their response and save
    const parsedPrefs = await parseAndSavePreferences(sessionId, userMessage);
    
    // Move to step 2 (Spice level)
    await updatePreference(sessionId, "onboardingStep", 2);

    let ackText = "Understood! I've updated your dietary preferences to keep your meal perfectly safe.";
    if (parsedPrefs.dietPreference === "veg") {
      ackText = "Wonderful! I've set your preference to pure Vegetarian.";
    }
    if (parsedPrefs.allergens && parsedPrefs.allergens.length > 0) {
      ackText = `I have noted down your allergens: ${parsedPrefs.allergens.join(", ")}. I will strictly exclude these from any recommendations.`;
    }

    return {
      speech: `${ackText}\n\nTo make sure we hit the perfect note, what level of spice do you prefer for your dishes? (Mild, Medium, or Hot)?`,
      onboardingCompleted: false,
      nextStep: 2,
    };
  }

  // Case 4: Processing Question 2 response (Spice level)
  if (currentStep === 2) {
    // Parse spice level
    let spiceLevel: "mild" | "medium" | "hot" = "medium";
    const msg = userMessage.toLowerCase();
    
    if (msg.includes("mild") || msg.includes("kam") || msg.includes("no spice") || msg.includes("nahi")) {
      spiceLevel = "mild";
    } else if (msg.includes("hot") || msg.includes("spicy") || msg.includes("tikha") || msg.includes("ekdum")) {
      spiceLevel = "hot";
    }

    // Save spice level and complete onboarding
    await updatePreference(sessionId, "spiceLevel", spiceLevel);
    await updatePreference(sessionId, "onboardingCompleted", true);
    await updatePreference(sessionId, "onboardingStep", 3);

    // Call Gemini to craft a warm closing greeting
    try {
      const model = getLLM("gemini-1.5-flash", 0.7);
      const prompt = `
You are Zara, the smart sommelier at Spice Garden.
The diner has completed onboarding.
Preferences set:
- Diet: ${preferences.dietPreference || "standard"}
- Spice level: ${spiceLevel}
- Allergens: ${preferences.allergens?.join(", ") || "none"}

Acknowledge their spice preference ("${spiceLevel}") warmly and let them know that their custom menu profile is now active! Ask what they are in the mood for or offer to recommend a signature dish. Keep it to 2-3 sentences.
      `;
      const response = await model.generateContent(prompt);
      const speech = response.response.text().trim();
      
      return {
        speech,
        onboardingCompleted: true,
      };
    } catch (e) {
      return {
        speech: `Excellent! I have configured your profile for a delicious ${spiceLevel} spice level. Your custom dining profile is now active, and everything I recommend will be tailored just for you! 

What flavor profiles or cuisines are you in the mood to explore first?`,
        onboardingCompleted: true,
      };
    }
  }

  return {
    speech: "How can I help you dine with us today?",
    onboardingCompleted: true,
  };
}
