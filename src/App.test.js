import { configure, render, screen } from "@testing-library/react";
import App from "./App";

configure({
    testIdAttribute: "id",
});

beforeAll(() => {
    console.log("This Codeblock will run before all testcases");
});

beforeEach(() => {
    console.log("This Codeblock will run before each testcase");
});

describe("App Component Test Suites", () => {
    test("App Rendering", () => {
        render(<App />);
        const screenText = screen.getByText(/Learn React/i);
        expect(screenText).toBeInTheDocument();
    });

    test("Testing Component with testid", () => {
        render(<App />);
        const screenText = screen.getByTestId("testid-1");
        expect(screenText).toBeInTheDocument();
    });
});

afterAll(() => {
    console.log("This Codeblock will run after all testcases");
});

afterEach(() => {
    console.log("This Codeblock will run after each testcase");
});

/**
 * Hooks in React Testing Library (RTL):
 *
 * 1. **beforeAll** and **beforeEach**:
 *    - These hooks are used to configure the environment or set up data before running the test cases.
 *    - Examples include initializing mock data, setting up a database, or rendering components.
 *
 * 2. **afterAll** and **afterEach**:
 *    - These hooks are used to clean up the environment or data after running the test cases.
 *    - Examples include clearing the database, resetting mocks, or cleaning up the DOM.
 *
 * **Key Notes:**
 * - Use **beforeAll** and **afterAll** for actions that need to run once for all test cases.
 * - Use **beforeEach** and **afterEach** for actions that need to run before or after each individual test case.
 */

