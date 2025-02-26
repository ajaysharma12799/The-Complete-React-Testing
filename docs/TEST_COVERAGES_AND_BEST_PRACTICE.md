# React Test Coverage and Best Practices Guide

## Measuring Test Coverage

### 1. Setting Up Coverage Reports

```json
// package.json
{
    "scripts": {
        "test": "jest",
        "test:coverage": "jest --coverage",
        "test:watch": "jest --watch",
        "test:ci": "jest --ci --coverage --reporters='default' --reporters='jest-junit'"
    },
    "jest": {
        "collectCoverageFrom": [
            "src/**/*.{js,jsx,ts,tsx}",
            "!src/**/*.d.ts",
            "!src/index.tsx",
            "!src/serviceWorker.ts"
        ],
        "coverageThreshold": {
            "global": {
                "branches": 80,
                "functions": 80,
                "lines": 80,
                "statements": 80
            }
        }
    }
}
```

### 2. Reading Coverage Reports

```bash
----------------------------------|---------|----------|---------|---------|
File                              | % Stmts | % Branch | % Funcs | % Lines |
----------------------------------|---------|----------|---------|---------|
All files                         |   85.71 |    83.33 |   83.33 |   85.71 |
 src/components/Button.tsx        |     100 |      100 |     100 |     100 |
 src/components/Form.tsx          |   83.33 |       75 |      80 |   83.33 |
----------------------------------|---------|----------|---------|---------|
```

### 3. Critical Path Testing Example

```jsx
// PaymentForm.jsx
const PaymentForm = ({ onSubmit }) => {
    const [amount, setAmount] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [error, setError] = useState("");

    const validateForm = () => {
        if (!amount || isNaN(amount)) {
            setError("Invalid amount");
            return false;
        }
        if (!cardNumber || cardNumber.length !== 16) {
            setError("Invalid card number");
            return false;
        }
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (validateForm()) {
            onSubmit({ amount, cardNumber });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
            />
            <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Card Number"
            />
            {error && <div role="alert">{error}</div>}
            <button type="submit">Pay</button>
        </form>
    );
};

// PaymentForm.test.jsx
describe("PaymentForm", () => {
    // Critical path: Successful submission
    test("submits valid payment information", () => {
        const handleSubmit = jest.fn();
        render(<PaymentForm onSubmit={handleSubmit} />);

        fireEvent.change(screen.getByPlaceholderText("Amount"), {
            target: { value: "100" },
        });
        fireEvent.change(screen.getByPlaceholderText("Card Number"), {
            target: { value: "1234567890123456" },
        });
        fireEvent.submit(screen.getByRole("form"));

        expect(handleSubmit).toHaveBeenCalledWith({
            amount: "100",
            cardNumber: "1234567890123456",
        });
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    // Edge cases
    test.each([
        ["", "1234567890123456", "Invalid amount"],
        ["abc", "1234567890123456", "Invalid amount"],
        ["100", "12345", "Invalid card number"],
    ])(
        "shows error for invalid input: %s, %s",
        (amount, card, expectedError) => {
            render(<PaymentForm onSubmit={jest.fn()} />);

            fireEvent.change(screen.getByPlaceholderText("Amount"), {
                target: { value: amount },
            });
            fireEvent.change(screen.getByPlaceholderText("Card Number"), {
                target: { value: card },
            });
            fireEvent.submit(screen.getByRole("form"));

            expect(screen.getByRole("alert")).toHaveTextContent(expectedError);
        }
    );
});
```

## Writing Clean and Maintainable Tests

### 1. Test Organization and Setup

```jsx
// UserProfile.test.jsx
describe("UserProfile", () => {
    // Shared setup
    const defaultProps = {
        user: {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
        },
        onUpdate: jest.fn(),
    };

    // Helper function for common rendering
    const renderUserProfile = (props = {}) => {
        return render(<UserProfile {...defaultProps} {...props} />);
    };

    // Reset mocks before each test
    beforeEach(() => {
        defaultProps.onUpdate.mockClear();
    });

    // Group related tests
    describe("display", () => {
        test("shows user information", () => {
            renderUserProfile();
            expect(
                screen.getByText(defaultProps.user.name)
            ).toBeInTheDocument();
            expect(
                screen.getByText(defaultProps.user.email)
            ).toBeInTheDocument();
        });
    });

    describe("interactions", () => {
        test("handles update request", () => {
            renderUserProfile();
            fireEvent.click(screen.getByText("Edit"));
            // Additional test logic
        });
    });
});
```

### 2. Custom Matchers and Utilities

```jsx
// test-utils.js
import { expect } from "@jest/globals";

// Custom matcher
expect.extend({
    toBeValidEmail(received) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const pass = emailRegex.test(received);
        return {
            pass,
            message: () => `expected ${received} to be a valid email`,
        };
    },
});

// Reusable test utilities
export const fillForm = async (fields) => {
    for (const [placeholder, value] of Object.entries(fields)) {
        fireEvent.change(screen.getByPlaceholderText(placeholder), {
            target: { value },
        });
    }
};

// Example usage in tests
test("validates email format", () => {
    const email = "test@example.com";
    expect(email).toBeValidEmail();
});

test("fills form fields", async () => {
    render(<RegistrationForm />);
    await fillForm({
        Email: "test@example.com",
        Password: "password123",
    });
});
```

### 3. Avoiding Test Duplication

```jsx
// Bad Example (Duplicated Setup)
test("shows error for invalid email", () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "invalid" },
    });
    fireEvent.submit(screen.getByRole("form"));
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
});

test("shows error for empty password", () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "test@example.com" },
    });
    fireEvent.submit(screen.getByRole("form"));
    expect(screen.getByRole("alert")).toHaveTextContent("Password required");
});

// Good Example (Reusable Setup)
describe("LoginForm Validation", () => {
    const renderAndSubmitForm = ({ email, password }) => {
        render(<LoginForm />);

        if (email) {
            fireEvent.change(screen.getByLabelText("Email"), {
                target: { value: email },
            });
        }

        if (password) {
            fireEvent.change(screen.getByLabelText("Password"), {
                target: { value: password },
            });
        }

        fireEvent.submit(screen.getByRole("form"));
    };

    test.each([
        [{ email: "invalid" }, "Invalid email"],
        [{ email: "test@example.com" }, "Password required"],
        [{ password: "123" }, "Email required"],
    ])("shows error for invalid input: %o", (input, expectedError) => {
        renderAndSubmitForm(input);
        expect(screen.getByRole("alert")).toHaveTextContent(expectedError);
    });
});
```

## Best Practices

### 1. Focus on User Behavior

```jsx
// Bad: Testing implementation details
test("updates internal state", () => {
    const { result } = renderHook(() => useState(""));
    act(() => {
        result.current[1]("new value");
    });
    expect(result.current[0]).toBe("new value");
});

// Good: Testing user behavior
test("updates displayed value when user types", () => {
    render(<InputField />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "new value" } });
    expect(input).toHaveValue("new value");
});
```

### 2. Test Coverage Strategies

```jsx
// Component with multiple paths
const SubmitButton = ({ isLoading, isValid, onClick }) => {
    if (isLoading) {
        return <button disabled>Loading...</button>;
    }

    if (!isValid) {
        return <button disabled>Invalid</button>;
    }

    return <button onClick={onClick}>Submit</button>;
};

// Comprehensive test coverage
describe("SubmitButton", () => {
    test.each([
        [true, true, "Loading...", true],
        [false, false, "Invalid", true],
        [false, true, "Submit", false],
    ])(
        "renders correctly when loading=%p and valid=%p",
        (isLoading, isValid, expectedText, expectedDisabled) => {
            render(
                <SubmitButton
                    isLoading={isLoading}
                    isValid={isValid}
                    onClick={jest.fn()}
                />
            );

            const button = screen.getByRole("button");
            expect(button).toHaveTextContent(expectedText);
            if (expectedDisabled) {
                expect(button).toBeDisabled();
            } else {
                expect(button).toBeEnabled();
            }
        }
    );
});
```

### 3. Testing Error Boundaries

```jsx
// ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return <div>Something went wrong</div>;
        }
        return this.props.children;
    }
}

// ErrorBoundary.test.jsx
describe("ErrorBoundary", () => {
    beforeEach(() => {
        // Suppress console.error for expected errors
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    test("renders fallback UI when child throws", () => {
        const ThrowError = () => {
            throw new Error("Test error");
        };

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
});
```

## Additional Tips

1. **Coverage Goals:**

    - Aim for 80%+ coverage but focus on quality over quantity
    - Identify critical paths that need 100% coverage
    - Don't obsess over covering trivial code

2. **Test Organization:**

    - Group related tests using describe blocks
    - Use clear, descriptive test names
    - Keep test files close to their components

3. **Maintenance:**

    - Regular updates to test suites
    - Remove obsolete tests
    - Keep dependencies updated
    - Use TypeScript for better type coverage

4. **Common Pitfalls to Avoid:**
    - Over-relying on snapshot tests
    - Testing implementation details
    - Duplicating test setup
    - Ignoring edge cases

Remember: The goal is to have confidence in your code, not to achieve arbitrary coverage numbers.
