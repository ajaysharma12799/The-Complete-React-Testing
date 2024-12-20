import { fireEvent, render, screen } from "@testing-library/react";
import Input from "./Input";
import App from "../../../App";

describe("Input Component Test Cases", () => {
    test("Input Component Visible in Document", () => {
        render(<Input />);
        const isInputTagPresent = screen.getByTitle("custom-input");
        expect(isInputTagPresent).toBeInTheDocument();
    });

    test("Input Component has all Specific Attributes", () => {
        render(<Input />);

        const inputTag = screen.getByRole("textbox");

        const isTypeAttributeVisible =
            screen.getByPlaceholderText("Enter Something");
        expect(isTypeAttributeVisible).toBeInTheDocument();

        // Check for Type and Placeholder attributes
        expect(inputTag).toHaveAttribute("type", "text");
        expect(inputTag).toHaveAttribute("placeholder", "Enter Something");
    });

    test("Input Component onChange Event", () => {
        render(<App />);
        const inputTag = screen.getByRole("textbox");
        fireEvent.change(inputTag, { target: { value: "abc" } });
        expect(inputTag.value).toBe("abc");
    });
});
