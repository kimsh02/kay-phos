/**
 * ✅ Unit Test: Login Input Validation + UI Simulation
 *
 * This test combines logic-only validation (via helper) and DOM simulation using JSDOM + jQuery.
 * It verifies login input behavior and UI feedback without touching any backend logic.
 *
 * ✅ Features Tested:
 * - Input validation logic: both fields required
 * - DOM behavior: setting error message on failure
 * - DOM behavior: showing success message on valid input
 * - Button click simulation triggering logic
 *
 * ❌ Features Not Tested:
 * - Backend API request to POST /
 * - Credential verification via server
 * - Redirect behavior or token/cookie handling
 */


const { JSDOM } = require('jsdom');
const { validateLogin } = require('../../../public/js/helpers/login-helper.js');

global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

describe("Login flow with DOM + helper", () => {
    let window, document, $;

    beforeEach(() => {
        const dom = new JSDOM(`
      <!DOCTYPE html>
      <html lang="">
        <body>
          <input id="username" />
          <input id="password" />
          <button id="submit">Login</button>
          <div id="error-message"></div>
          <div id="rxData"></div>
        </body>
      </html>
    `, { url: "http://localhost" });

        window = dom.window;
        document = dom.window.document;
        const jqueryFactory = require('jquery');
        $ = jqueryFactory(window);

        // Wire the DOM login behavior
        $('#submit').on('click', () => {
            const username = $('#username').val().trim();
            const password = $('#password').val().trim();
            const result = validateLogin(username, password);

            if (result.error) {
                $('#error-message').text(result.error);
            } else {
                $('#rxData').text(result.message);
            }
        });
    });

    test("validateLogin returns error if empty", () => {
        const result = validateLogin("", "");
        expect(result).toEqual({ error: "Please enter both username and password." });
    });

    test("UI shows error on empty login", () => {
        $('#username').val('');
        $('#password').val('');
        $('#submit').trigger('click');

        expect($('#error-message').text()).toBe("Please enter both username and password.");
        expect($('#rxData').text()).toBe("");
    });

    test("UI shows success on valid login", () => {
        $('#username').val('joseph');
        $('#password').val('pass');
        $('#submit').trigger('click');

        expect($('#error-message').text()).toBe("");
        expect($('#rxData').text()).toBe("Login triggered!");
    });
});
