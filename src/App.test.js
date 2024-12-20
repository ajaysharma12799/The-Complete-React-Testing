import { render, screen } from "@testing-library/react";
import App from "./App";

test("App Component", () => {
    render(<App />);
    const screenText = screen.getByText(/Learn React/i);
    expect(screenText).toBeInTheDocument();
});
