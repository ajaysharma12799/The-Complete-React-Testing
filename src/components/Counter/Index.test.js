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
