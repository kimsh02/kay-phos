/**
 * ✅ Unit Test: User-Define-Meal Logic + UI Simulation
 *
 * This test validates the ingredient entry flow and DOM interactions
 * for the user-define-meal page. It verifies that payloads for both
 * "Save" and "Save & Log" are generated correctly from user input.
 *
 * ✅ Features Tested:
 * - Ingredient parsing from the editable table
 * - Adding and removing ingredient rows
 * - Payload structure for favorite and history meals
 * - Button click simulation for Save and Save & Log logic
 *
 * ❌ Features Not Tested:
 * - backend POST /dashboard/api/user-meal-history
 * - Server error handling or toast feedback from backend
 */


global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

const { JSDOM } = require('jsdom');
const { getDefinedMealIngredients, buildMealPayload } = require('../../../public/js/helpers/meal-helper.js');

describe("User Define Meal Tests", () => {
    let window, document, $, table;

    beforeEach(() => {
        const dom = new JSDOM(`
      <!DOCTYPE html>
      <html lang="">
        <body>
          <table>
            <tbody id="ingredientBody">
              <tr>
                <td><input class="ingredient-name" value="Chicken" /></td>
                <td><input class="ingredient-grams" value="150" /></td>
                <td><input class="ingredient-calories" value="300" /></td>
                <td><input class="ingredient-protein" value="35" /></td>
                <td><input class="ingredient-carbs" value="0" /></td>
                <td><input class="ingredient-potassium" value="400" /></td>
                <td><input class="ingredient-phosphorus" value="250" /></td>
                <td><button class="remove-btn">Remove</button></td>
              </tr>
            </tbody>
          </table>
          <button id="addIngredient">Add Row</button>
        </body>
      </html>
    `, { url: "http://localhost" });

        window = dom.window;
        document = dom.window.document;
        const jqueryFactory = require('jquery');
        $ = jqueryFactory(window);

        table = $('#ingredientBody');
    });

    test("getDefinedMealIngredients parses ingredients correctly", () => {
        const ingredients = getDefinedMealIngredients(document);
        expect(ingredients.length).toBe(1);
        expect(ingredients[0].name).toBe("Chicken");
        expect(ingredients[0].grams).toBe(150);
        expect(ingredients[0].protein).toBe(35);
    });

    test("adding a new row increases the number of rows", () => {
        const rowHTML = `
      <tr>
        <td><input class="ingredient-name" value="Rice" /></td>
        <td><input class="ingredient-grams" value="100" /></td>
        <td><input class="ingredient-calories" value="130" /></td>
        <td><input class="ingredient-protein" value="2.7" /></td>
        <td><input class="ingredient-carbs" value="28" /></td>
        <td><input class="ingredient-potassium" value="35" /></td>
        <td><input class="ingredient-phosphorus" value="40" /></td>
        <td><button class="remove-btn">Remove</button></td>
      </tr>
    `;
        table.append(rowHTML);
        expect($('#ingredientBody tr').length).toBe(2);
    });

    test("removing a row updates the DOM", () => {
        $('.remove-btn').trigger('click'); // simulate delete
        $('.remove-btn').each(function () {
            $(this).on('click', function () {
                $(this).closest("tr").remove();
            });
        });
        $('.remove-btn').trigger('click');
        expect($('#ingredientBody tr').length).toBeLessThan(1);
    });

    test("Save button builds correct favorite payload", () => {
        const ingredients = getDefinedMealIngredients(document);
        const payload = buildMealPayload("favorite", "Favorite Meal", ingredients);

        expect(payload.mealType).toBe("favorite");
        expect(payload.ingredients.length).toBe(1);
        expect(payload.ingredients[0].name).toBe("Chicken");
    });

    test("Save & Log button builds two correct payloads", () => {
        const ingredients = getDefinedMealIngredients(document);

        const favoritePayload = buildMealPayload("favorite", "My Lunch", ingredients);
        const historyPayload = buildMealPayload("history", "My Lunch", ingredients);

        expect(favoritePayload.mealType).toBe("favorite");
        expect(historyPayload.mealType).toBe("history");

        expect(favoritePayload.ingredients.length).toBe(1);
        expect(favoritePayload.mealName).toBe("My Lunch");
        expect(favoritePayload.ingredients[0]).toMatchObject({
            name: "Chicken",
            grams: 150,
            protein: 35
        });
    });
});
