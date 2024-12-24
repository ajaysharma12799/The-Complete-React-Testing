import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Counter from "./Index";

// Shared Mock Data
let sharedMockData;

beforeAll(() => {
    console.log("Setting Shared Resources");
    sharedMockData = {
        count: 0,
    };
});

beforeEach(() => {
    console.log("Setting Resources for Test Case");
});

describe("Counter Component Test Suites", () => {
    test("Initial Render", () => {
        render(<Counter />);
        const screenText = screen.getByText(/Counter: 0/i);
        expect(screenText).toBeInTheDocument();
    });

    test("Increment Counter", () => {
        render(<Counter />);
        const button = screen.getByText(/increment/i);
        fireEvent.click(button);
        expect(screen.getByText(/Counter: 1/i)).toBeInTheDocument();
    });

    test("Decrement Counter", () => {
        render(<Counter />);
        const button = screen.getByText(/decrement/i);
        fireEvent.click(button);
        expect(screen.getByText(/Counter: -1/i)).toBeInTheDocument();
    });
});

afterEach(() => {
    console.log("Cleaning up Resources");
    cleanup();
});

afterAll(() => {
    console.log("Teardown Shared Resources");
    sharedMockData = null;
});

/**
 * React Testing Library Query Methods
 *
 * 1. **getBy** (Synchronous):
 *    - Used to find an element that **must exist** in the DOM.
 *    - Throws an error if the element is not found.
 *    - Best for elements that are guaranteed to be present immediately.
 *    - Example:
 *      ```javascript
 *      const heading = screen.getByText(/hello, ajay/i);
 *      expect(heading).toBeInTheDocument();
 *      ```
 *    - Advanced Example (with roles):
 *      ```javascript
 *      const button = screen.getByRole("button", { name: /submit/i });
 *      ```
 *
 * 2. **queryBy** (Synchronous):
 *    - Used to find an element that **might not exist** in the DOM.
 *    - Returns `null` if the element is not found (doesn't throw an error).
 *    - Best for checking the **absence** of an element.
 *    - Example:
 *      ```javascript
 *      const heading = screen.queryByText(/hello/i);
 *      expect(heading).toBeNull();
 *      ```
 *    - Advanced Example (with roles):
 *      ```javascript
 *      const nonExistentButton = screen.queryByRole("button", { name: /logout/i });
 *      expect(nonExistentButton).toBeNull();
 *      ```
 *
 * 3. **findBy** (Asynchronous):
 *    - Used to find an element that is rendered **asynchronously**.
 *    - Waits for the element to appear in the DOM (uses `waitFor` internally).
 *    - Throws an error if the element is not found within the timeout.
 *    - Best for elements rendered after a delay, such as API calls or animations.
 *    - Example:
 *      ```javascript
 *      const heading = await screen.findByText(/hello, ajay/i);
 *      expect(heading).toBeInTheDocument();
 *      ```
 *    - Advanced Example (with roles):
 *      ```javascript
 *      const button = await screen.findByRole("button", { name: /submit/i });
 *      expect(button).toBeInTheDocument();
 *      ```
 *
 * **Comparison and Use Cases:**
 * - Use `getBy` when the element **must exist** immediately.
 * - Use `queryBy` when the element **might not exist** or when checking its absence.
 * - Use `findBy` for elements that **appear asynchronously**.
 *
 * **Common Debugging Tip:**
 * - Use `screen.debug()` to print the current DOM state for troubleshooting:
 *   ```javascript
 *   screen.debug(); // Logs the rendered DOM
 *   ```
 */
