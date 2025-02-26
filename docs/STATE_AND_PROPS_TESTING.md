# Testing React State and Props with RTL & Jest

## Testing Props

### 1. Basic Props Testing

```jsx
// ProfileCard.jsx
const ProfileCard = ({ name, role, onEdit }) => (
    <div>
        <h2>{name}</h2>
        <p>{role}</p>
        <button onClick={onEdit}>Edit Profile</button>
    </div>
);

// ProfileCard.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";

describe("ProfileCard", () => {
    test("renders props correctly", () => {
        render(
            <ProfileCard name="John Doe" role="Developer" onEdit={() => {}} />
        );

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Developer")).toBeInTheDocument();
    });

    test("calls onEdit when button is clicked", () => {
        const mockOnEdit = jest.fn();
        render(
            <ProfileCard name="John Doe" role="Developer" onEdit={mockOnEdit} />
        );

        fireEvent.click(screen.getByText("Edit Profile"));
        expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });
});
```

### 2. Testing Props Updates

```jsx
// DynamicText.jsx
const DynamicText = ({ text, color }) => <p style={{ color }}>{text}</p>;

// DynamicText.test.jsx
describe("DynamicText", () => {
    test("updates when props change", () => {
        const { rerender } = render(<DynamicText text="Hello" color="red" />);

        expect(screen.getByText("Hello")).toHaveStyle({ color: "red" });

        // Test prop update
        rerender(<DynamicText text="Updated" color="blue" />);
        expect(screen.getByText("Updated")).toHaveStyle({ color: "blue" });
    });
});
```

### 3. Testing Required Props

```jsx
// RequiredProps.jsx
const RequiredProps = ({ title, description }) => {
    if (!title || !description) {
        throw new Error("Title and description are required");
    }
    return (
        <div>
            <h1>{title}</h1>
            <p>{description}</p>
        </div>
    );
};

// RequiredProps.test.jsx
describe("RequiredProps", () => {
    test("renders with all required props", () => {
        render(<RequiredProps title="Welcome" description="This is a test" />);

        expect(screen.getByText("Welcome")).toBeInTheDocument();
        expect(screen.getByText("This is a test")).toBeInTheDocument();
    });

    test("throws error when missing required props", () => {
        expect(() => {
            render(<RequiredProps title="Welcome" />);
        }).toThrow();
    });
});
```

## Testing State

### 1. Testing useState Hook

```jsx
// Counter.jsx
import { useState } from "react";

const Counter = () => {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(count - 1)}>Decrement</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    );
};

// Counter.test.jsx
describe("Counter", () => {
    beforeEach(() => {
        render(<Counter />);
    });

    test("starts with initial count of 0", () => {
        expect(screen.getByText("Count: 0")).toBeInTheDocument();
    });

    test("increments count", () => {
        fireEvent.click(screen.getByText("Increment"));
        expect(screen.getByText("Count: 1")).toBeInTheDocument();
    });

    test("decrements count", () => {
        fireEvent.click(screen.getByText("Decrement"));
        expect(screen.getByText("Count: -1")).toBeInTheDocument();
    });

    test("resets count", () => {
        // First increment
        fireEvent.click(screen.getByText("Increment"));
        // Then reset
        fireEvent.click(screen.getByText("Reset"));
        expect(screen.getByText("Count: 0")).toBeInTheDocument();
    });
});
```

### 2. Testing Form State

```jsx
// LoginForm.jsx
const LoginForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
            />
            <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
            />
            <button type="submit">Login</button>
        </form>
    );
};

// LoginForm.test.jsx
describe("LoginForm", () => {
    test("updates form state on input change", () => {
        const mockSubmit = jest.fn();
        render(<LoginForm onSubmit={mockSubmit} />);

        const usernameInput = screen.getByPlaceholderText("Username");
        const passwordInput = screen.getByPlaceholderText("Password");

        // Test input changes
        fireEvent.change(usernameInput, { target: { value: "testuser" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });

        expect(usernameInput.value).toBe("testuser");
        expect(passwordInput.value).toBe("password123");

        // Test form submission
        fireEvent.click(screen.getByText("Login"));
        expect(mockSubmit).toHaveBeenCalledWith({
            username: "testuser",
            password: "password123",
        });
    });
});
```

### 3. Testing Complex State Updates

```jsx
// TodoList.jsx
const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState("");

    const addTodo = () => {
        if (input.trim()) {
            setTodos([...todos, { id: Date.now(), text: input, done: false }]);
            setInput("");
        }
    };

    const toggleTodo = (id) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, done: !todo.done } : todo
            )
        );
    };

    return (
        <div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add todo"
            />
            <button onClick={addTodo}>Add</button>
            <ul>
                {todos.map((todo) => (
                    <li
                        key={todo.id}
                        onClick={() => toggleTodo(todo.id)}
                        style={{
                            textDecoration: todo.done ? "line-through" : "none",
                        }}
                    >
                        {todo.text}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// TodoList.test.jsx
describe("TodoList", () => {
    test("adds new todos", () => {
        render(<TodoList />);
        const input = screen.getByPlaceholderText("Add todo");

        // Add todo
        fireEvent.change(input, { target: { value: "Test todo" } });
        fireEvent.click(screen.getByText("Add"));

        expect(screen.getByText("Test todo")).toBeInTheDocument();
        expect(input.value).toBe(""); // Input should be cleared
    });

    test("toggles todo completion", () => {
        render(<TodoList />);

        // Add todo
        fireEvent.change(screen.getByPlaceholderText("Add todo"), {
            target: { value: "Test todo" },
        });
        fireEvent.click(screen.getByText("Add"));

        // Toggle todo
        const todoItem = screen.getByText("Test todo");
        fireEvent.click(todoItem);
        expect(todoItem).toHaveStyle({ textDecoration: "line-through" });

        // Toggle back
        fireEvent.click(todoItem);
        expect(todoItem).toHaveStyle({ textDecoration: "none" });
    });
});
```

## Key Testing Principles

1. Test behavior, not implementation
2. Use `fireEvent` or `userEvent` for state changes
3. Test both success and error cases
4. Verify state updates are reflected in the UI
5. Use mock functions for complex interactions
6. Test edge cases and boundary conditions
7. Keep tests focused and isolated

Remember: Test from the user's perspective - focus on what they see and interact with rather than internal implementation details.
