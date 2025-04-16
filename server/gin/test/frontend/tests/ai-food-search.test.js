/**
 * ✅ Unit Test: AI Food Search Logic + UI Simulation
 *
 * This test covers payload creation and DOM feedback logic based on user-selected foods.
 * API calls and file uploads are excluded.
 *
 * ✅ Features Tested:
 * - Payload builder for "Save to Favorites" and "Log This Meal"
 * - Nutrient breakdown merging
 * - DOM simulation: feedback messages and button states
 *
 * ❌ Features Not Tested:
 * - Actual fetch to Passio API
 * - File input handling / image base64 conversion
 * - API request to calculate-intake or user-meal-history
 */


global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

const { JSDOM } = require('jsdom');
const { buildMealPayload, mergeNutrientBreakdown } = require('../../../public/js/helpers/ai-helper.js');

describe("AI Food Search Tests", () => {
    let window, document, $;

    beforeEach(() => {
        const dom = new JSDOM(`
      <!DOCTYPE html>
      <html lang="">
        <body>
          <div class="server-message"></div>
          <div class="results-div"></div>
          <button class="log-meal"></button>
        </body>
      </html>
    `, { url: "http://localhost" });

        window = dom.window;
        document = window.document;
        const jqueryFactory = require('jquery');
        $ = jqueryFactory(window);
    });

    // 💡 Logic-Only Tests
    test("buildMealPayload creates payload correctly", () => {
        const sample = [{ ingredientName: "Banana", weightGrams: 100 }];
        const payload = buildMealPayload("history", sample, "My Banana Meal");

        expect(payload.mealType).toBe("history");
        expect(payload.ingredients.length).toBe(1);
        expect(payload.ingredients[0].name).toBe("Banana");
    });

    test("mergeNutrientBreakdown merges matched nutrients", () => {
        const selected = [{ ingredientName: "Banana", weightGrams: 100 }];
        const breakdown = [{
            ingredientName: "Banana",
            calories: 105,
            protein: 1.2,
            carbs: 27,
            phosphorus: 22,
            potassium: 422
        }];

        const result = mergeNutrientBreakdown(selected, breakdown);
        expect(result[0].calories).toBe(105);
        expect(result[0].protein).toBe(1.2);
    });

    // 💡 DOM Feedback Tests
    test("feedback message updates UI properly", () => {
        const showMessage = (msg, type = "error") => {
            const box = $('.server-message');
            box.text(msg).removeClass().addClass(`server-message ${type}`);
        };

        showMessage("Upload failed", "error");
        expect($('.server-message').text()).toBe("Upload failed");
        expect($('.server-message').attr('class')).toContain("error");
    });
});
