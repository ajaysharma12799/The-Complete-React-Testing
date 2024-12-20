import { fireEvent, render, screen } from "@testing-library/react";
import App from "../../../App";

describe("Button Component Test Cases", () => {
    test("Button onClick Event", () => {
        render(<App />);
        const buttonTag = screen.getByRole("button");
        fireEvent.click(buttonTag);
        expect(
            screen.getByText("Updated Initial State Message")
        ).toBeInTheDocument();
    });
});
