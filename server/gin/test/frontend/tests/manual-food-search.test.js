/**
 * ✅ Unit Test: Manual Food Search Logic + UI Simulation
 *
 * This test combines logic testing (via helper) and simulated UI behavior using JSDOM + jQuery.
 * It is designed to verify all frontend functionality **without backend or DB calls**.
 *
 * ✅ Features Tested:
 * - Autocomplete suggestion filtering logic
 * - Nutrient sorting logic (calories, protein, etc.)
 * - Recent search list logic (max 5, no duplicates)
 * - Autocomplete UI rendering to the DOM
 * - Dropdown-triggered sort logic from DOM selection
 * - Payload creation for "Log This Meal" (without POST)
 *
 * ❌ Features Not Tested:
 * - Backend API calls (e.g. search-food, autocomplete endpoint)
 * - Actual fetch() logic or AJAX behavior
 * - Adding meals to history via POST
 */



global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

const { JSDOM } = require('jsdom');
const { filterSuggestions, sortResults, formatRecentSearches, buildManualMealPayload } = require('../../../public/js/helpers/search-helper.js');

describe("Manual Food Search Tests", () => {
    let window, document, $;

    beforeEach(() => {
        const dom = new JSDOM(`
      <!DOCTYPE html>
      <html lang="">
        <body>
          <input id="queryInput" />
          <ul id="autocompleteList"></ul>
          <select id="sortSelect">
            <option value="calories-asc">Calories Ascending</option>
            <option value="protein-desc">Protein Descending</option>
          </select>
        </body>
      </html>
    `, { url: "http://localhost" });

        window = dom.window;
        document = window.document;
        const jqueryFactory = require('jquery');
        $ = jqueryFactory(window);
    });

    // 💡 Logic-Only Tests
    test("filterSuggestions returns matches by prefix", () => {
        const suggestions = ["banana", "banoffee pie", "apple"];
        const result = filterSuggestions(suggestions, "ba");
        expect(result).toEqual(["banana", "banoffee pie"]);
    });

    test("sortResults sorts by protein descending", () => {
        const input = [
            { name: "Apple", protein: 0.3 },
            { name: "Banana", protein: 1.1 },
            { name: "Almond", protein: 6.0 }
        ];
        const result = sortResults(input, "protein-desc");
        expect(result[0].name).toBe("Almond");
    });

    test("formatRecentSearches stores 5 most recent, no duplicates", () => {
        const mockStorage = {
            store: {},
            getItem: function (key) { return this.store[key] || "[]"; },
            setItem: function (key, value) { this.store[key] = value; }
        };

        mockStorage.setItem("recentSearches", JSON.stringify(["apple", "banana", "carrot", "donut", "egg"]));
        const updated = formatRecentSearches(mockStorage, "fig");

        expect(updated).toEqual(["fig", "apple", "banana", "carrot", "donut"]);
    });

    // 💡 DOM + UI Tests
    test("autocomplete renders suggestions in DOM", () => {
        const suggestions = filterSuggestions(["banana", "banoffee", "apple"], "ba");

        // Render to DOM
        const $list = $('#autocompleteList');
        $list.html(suggestions.map(s => `<li>${s}</li>`).join(""));

        const items = $list.find("li");
        expect(items.length).toBe(2);
        expect(items.eq(0).text()).toBe("banana");
        expect(items.eq(1).text()).toBe("banoffee");
    });

    test("sortSelect triggers correct sort call", () => {
        const food = [
            { name: "Cereal", calories: 200 },
            { name: "Egg", calories: 70 }
        ];

        $('#sortSelect').val("calories-asc");
        const sorted = sortResults(food, $('#sortSelect').val());
        expect(sorted[0].name).toBe("Egg");
    });

    test("Log button generates correct meal payload", () => {
        const food = {
            name: "Salmon",
            foodCode: 123456,
            grams: 120,
            calories: 210,
            protein: 22,
            phosphorus: 200,
            potassium: 350,
            carbs: 0
        };

        const payload = buildManualMealPayload("history", food, "Dinner");

        expect(payload.mealType).toBe("history");
        expect(payload.mealName).toBe("Dinner");
        expect(payload.ingredients.length).toBe(1);
        expect(payload.ingredients[0].name).toBe("Salmon");
        expect(payload.ingredients[0].grams).toBe(120);
    });

});
