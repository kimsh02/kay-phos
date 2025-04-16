/**
 * ✅ Unit Test: Dashboard Page Logic + UI Simulation
 *
 * This test focuses on DOM + logic behavior of dashboard.js.
 * Chart.js pie chart updates and welcome message are tested via mocked DOM.
 *
 * ✅ Features Tested:
 * - Welcome message displays correct name (loadWelcomeName)
 * - updatePieCharts updates DOM and Chart.js datasets
 * - initializeTotals updates charts based on mocked fetch response
 *
 * ❌ Features Not Tested:
 * - Real fetch API calls (we mock them)
 * - Backend JWT or token logic
 */

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

const { JSDOM } = require("jsdom");

describe("Dashboard Page Tests", () => {
    let document, window, potassiumChart, phosphorousChart;

    beforeEach(() => {
        const dom = new JSDOM(`
    <div class="navbar__toggle"></div>
    <div class="navbar__menu"></div>
    <div id="welcomeMessage"></div>
    <div id="potassiumTotal"></div>
    <div id="potassiumRemaining"></div>
    <div id="phosphorousTotal"></div>
    <div id="phosphorousRemaining"></div>
    <canvas id="potassiumChart"></canvas>
    <canvas id="phosphorousChart"></canvas>
  `, { url: "http://localhost" });

        window = dom.window;
        document = window.document;
        global.document = document;
        global.window = window;

        // Chart.js mocks
        potassiumChart = {
            data: { datasets: [{ data: [0, 0] }] },
            update: jest.fn()
        };
        phosphorousChart = {
            data: { datasets: [{ data: [0, 0] }] },
            update: jest.fn()
        };
        global.Chart = jest.fn((ctx, config) => {
            if (ctx.canvas.id === "potassiumChart") return potassiumChart;
            if (ctx.canvas.id === "phosphorousChart") return phosphorousChart;
            return {};
        });

        // Load functions from dashboard.js (which runs this code)
        require("../../../public/js/dashboard.js");
    });


    test("loadWelcomeName renders correct name", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            json: async () => ({ firstName: "Joey" }),
        });

        await loadWelcomeName();
        expect(document.getElementById("welcomeMessage").textContent).toContain("Joey");
    });

    test("updatePieCharts updates chart text + datasets", () => {
        updatePieCharts(1200, 300);

        expect(document.getElementById("potassiumTotal").textContent).toBe("1200");
        expect(document.getElementById("potassiumRemaining").textContent).toBe("2200");
        expect(document.getElementById("phosphorousTotal").textContent).toBe("300");
        expect(document.getElementById("phosphorousRemaining").textContent).toBe("400");

        expect(potassiumChart.update).toHaveBeenCalled();
        expect(phosphorousChart.update).toHaveBeenCalled();
    });

    test("initializeTotals handles response and updates charts", async () => {
        const today = new Date().toISOString().split("T")[0];

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ potassiumTotal: 1500, phosphorousTotal: 500 }],
        });

        await initializeTotals();

        expect(potassiumChart.data.datasets[0].data).toEqual([1500, 1900]);
        expect(phosphorousChart.data.datasets[0].data).toEqual([500, 200]);
    });
});
