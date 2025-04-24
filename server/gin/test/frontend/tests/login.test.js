/**
 * @jest-environment jsdom
 *
 * 🔍 TEST SUMMARY
 * -------------------------------
 * ✅ login() runs on valid click
 * ✅ Error message shows if fields are empty
 * ✅ $.ajax is called with expected config
 * ✅ Error message shown if backend responds with error (fail case)
 *
 * 🧪 These tests simulate login form behavior using jQuery in a JSDOM environment.
 * The login() function is imported directly from login.js so that coverage tools (e.g., SonarQube)
 * can track all lines within login.js during test execution.
 *
 * ⛔ These tests DO NOT:
 *    - simulate full browser redirects
 *    - test server response timing/delays
 *    - use jQuery event handlers like $('#submit').click() directly (we test login() directly)
 */

const $ = require("jquery");
global.$ = global.jQuery = $;

let login;

beforeEach(() => {
    document.body.innerHTML = `
    <form class="login-form">
      <input type="text" id="username" />
      <input type="password" id="password" />
      <input type="submit" id="submit" />
    </form>
    <div id="error-message"></div>
    <div id="rxData"></div>
  `;

    jest.resetModules(); // reset cached login.js
});

test("shows error if fields are empty", () => {
    $.ajax = jest.fn(); // stub ajax to prevent real calls
    login = require("../../../public/js/login.js");

    const mockEvent = { preventDefault: jest.fn() };
    login(mockEvent);

    expect($("#error-message").text()).toBe("Please enter both username and password.");
});

test("sends ajax on valid login", () => {
    $("#username").val("joseph");
    $("#password").val("pass");

    $.ajax = jest.fn(() => ({
        done: function (cb) {
            cb({ message: "mock success" });
            return this;
        },
        fail: function () {
            return this;
        }
    }));

    login = require("../../../public/js/login.js");

    const mockEvent = { preventDefault: jest.fn() };
    login(mockEvent);

    expect($.ajax).toHaveBeenCalledWith(expect.objectContaining({
        url: '/',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
            username: "joseph",
            inputpassword: "pass"
        }),
        xhrFields: {
            withCredentials: true
        }
    }));
});

test("shows error if backend returns 'Incorrect password'", () => {
    $("#username").val("joseph");
    $("#password").val("wrongpass");

    $.ajax = jest.fn(() => ({
        done: function () { return this; },
        fail: function (cb) {
            cb({
                status: 400,
                responseJSON: { error: "Incorrect password" }
            });
            return this;
        }
    }));

    login = require("../../../public/js/login.js");

    const mockEvent = { preventDefault: jest.fn() };
    login(mockEvent);

    expect($("#rxData").text()).toBe("Wrong password");
});

test("redirects to /dashboard on successful login", () => {
    $("#username").val("joseph");
    $("#password").val("correct");

    jest.useFakeTimers();

    // Mock $.ajax with success response
    $.ajax = jest.fn(() => ({
        done: function (cb) {
            cb({ message: "Login successful" });
            return this;
        },
        fail: function () {
            return this;
        }
    }));

    // Spy on window.location
    delete window.location;
    window.location = { href: "" };

    login = require("../../../public/js/login.js");

    const mockEvent = { preventDefault: jest.fn() };
    login(mockEvent);

    // Fast forward the setTimeout
    jest.advanceTimersByTime(500);

    expect(window.location.href).toBe("/dashboard");

    jest.useRealTimers();
});

