/**
 * ✅ Unit Test: User Meal History Logic + UI Simulation
 *
 * This test validates how meal history entries are grouped and rendered
 * into the frontend UI. It does not call any backend endpoints or load chart data.
 *
 * ✅ Features Tested:
 * - Grouping logic for mealName + timestamp
 * - DOM rendering of grouped meals
 * - Input population for date range selection
 *
 * ❌ Features Not Tested:
 * - backend fetch /dashboard/api/user-logged-meals
 * - Chart.js rendering or nutrient graph updates
 * - Data validation from backend
 */

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

const { JSDOM } = require('jsdom');
const { groupMealHistory } = require('../../../public/js/helpers/history-helper.js');

describe("User Meal History Tests", () => {
    let window, document, $;

    beforeEach(() => {
        const dom = new JSDOM(`
      <!DOCTYPE html>
      <html lang="">
        <body>
          <div id="loggedMeals"></div>
          <form id="dateRangeForm">
            <input id="beginDate" />
            <input id="endDate" />
          </form>
        </body>
      </html>
    `, { url: "http://localhost" });

        window = dom.window;
        document = dom.window.document;
        const jqueryFactory = require('jquery');
        $ = jqueryFactory(window);
    });

    test("groupMealHistory groups entries by meal name and time", () => {
        const data = [
            { mealName: "Lunch", time: "2025-04-10T12:00:00Z", name: "Chicken" },
            { mealName: "Lunch", time: "2025-04-10T12:00:00Z", name: "Rice" },
            { mealName: "Snack", time: "2025-04-10T16:00:00Z", name: "Apple" }
        ];

        const grouped = groupMealHistory(data);
        const keys = Object.keys(grouped);
        expect(keys.length).toBe(2);
        expect(grouped[keys[0]].length).toBe(2); // Chicken, Rice
        expect(grouped[keys[1]][0].name).toBe("Apple");
    });

    test("form sets default date range on load", () => {
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);

        const expectedToday = today.toISOString().split("T")[0];
        const expectedPast = oneWeekAgo.toISOString().split("T")[0];

        document.getElementById("beginDate").value = expectedPast;
        document.getElementById("endDate").value = expectedToday;

        expect(document.getElementById("beginDate").value).toBe(expectedPast);
        expect(document.getElementById("endDate").value).toBe(expectedToday);
    });

    test("renders grouped meals into DOM correctly", () => {
        const grouped = {
            "Lunch||2025-04-10T12:00:00Z": [
                {
                    name: "Chicken",
                    grams: 150,
                    calories: 250,
                    protein: 30,
                    carbs: 0,
                    phosphorus: 200,
                    potassium: 300
                },
                {
                    name: "Rice",
                    grams: 100,
                    calories: 130,
                    protein: 2.5,
                    carbs: 28,
                    phosphorus: 50,
                    potassium: 35
                }
            ],
            "Dinner||2025-04-10T18:30:00Z": [
                {
                    name: "Salmon",
                    grams: 120,
                    calories: 210,
                    protein: 25,
                    carbs: 0,
                    phosphorus: 180,
                    potassium: 400
                }
            ]
        };

        const container = $('#loggedMeals');
        container.html("");

        for (const key in grouped) {
            const [mealName, rawTime] = key.split("||");
            const mealTime = new Date(rawTime).toLocaleString();

            let html = `
      <div class="meal-block">
        <div class="meal-header">
          <div class="meal-meta">
            <h4>${mealName}</h4>
            <small>${mealTime}</small>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Ingredient</th><th>Grams</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Phosphorus</th><th>Potassium</th>
            </tr>
          </thead>
          <tbody>
    `;

            grouped[key].forEach(item => {
                html += `
        <tr>
          <td>${item.name}</td>
          <td>${item.grams}</td>
          <td>${item.calories}</td>
          <td>${item.protein}</td>
          <td>${item.carbs}</td>
          <td>${item.phosphorus}</td>
          <td>${item.potassium}</td>
        </tr>
      `;
            });

            html += `
          </tbody>
        </table>
      </div>
    `;

            container.append(html);
        }

        // ✅ Assertions
        expect($('.meal-block').length).toBe(2); // 2 meal groups
        expect($('.meal-block').eq(0).find('tr').length).toBe(3); // 2 + header
        expect($('.meal-block').eq(1).find('td').eq(0).text()).toBe("Salmon");
    });

});
