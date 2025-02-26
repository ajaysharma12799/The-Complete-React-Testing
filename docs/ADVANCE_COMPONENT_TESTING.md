# Advanced React Component Testing Guide

## Testing Lifecycle Methods (useEffect)

### 1. Basic useEffect Testing

```jsx
// UserStatus.jsx
const UserStatus = ({ userId }) => {
    const [status, setStatus] = useState("offline");

    useEffect(() => {
        setStatus("online");

        return () => {
            setStatus("offline");
        };
    }, []);

    return <div>User is {status}</div>;
};

// UserStatus.test.jsx
describe("UserStatus", () => {
    test("changes status on mount and unmount", () => {
        const { unmount } = render(<UserStatus />);

        // Check mount effect
        expect(screen.getByText("User is online")).toBeInTheDocument();

        // Check cleanup
        unmount();
        expect(screen.queryByText("User is online")).not.toBeInTheDocument();
    });
});
```

### 2. Testing Dependencies in useEffect

```jsx
// DataFetcher.jsx
const DataFetcher = ({ url }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            const response = await fetch(url);
            const json = await response.json();
            if (mounted) {
                setData(json);
            }
        };

        fetchData();

        return () => {
            mounted = false;
        };
    }, [url]);

    return <div>{data ? JSON.stringify(data) : "Loading..."}</div>;
};

// DataFetcher.test.jsx
describe("DataFetcher", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test("refetches when URL changes", async () => {
        const mockData1 = { id: 1 };
        const mockData2 = { id: 2 };

        global.fetch
            .mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve(mockData1),
                })
            )
            .mockImplementationOnce(() =>
                Promise.resolve({
                    json: () => Promise.resolve(mockData2),
                })
            );

        const { rerender } = render(<DataFetcher url="/api/1" />);

        // First fetch
        await waitFor(() => {
            expect(
                screen.getByText(JSON.stringify(mockData1))
            ).toBeInTheDocument();
        });

        // Change URL prop
        rerender(<DataFetcher url="/api/2" />);

        // Second fetch
        await waitFor(() => {
            expect(
                screen.getByText(JSON.stringify(mockData2))
            ).toBeInTheDocument();
        });
    });
});
```

### 3. Testing useLayoutEffect

```jsx
// Tooltip.jsx
const Tooltip = ({ text, position }) => {
    const tooltipRef = useRef(null);

    useLayoutEffect(() => {
        if (tooltipRef.current) {
            tooltipRef.current.style.position = "absolute";
            tooltipRef.current.style.top = `${position.y}px`;
            tooltipRef.current.style.left = `${position.x}px`;
        }
    }, [position]);

    return <div ref={tooltipRef}>{text}</div>;
};

// Tooltip.test.jsx
describe("Tooltip", () => {
    test("positions tooltip correctly", () => {
        render(<Tooltip text="Hello" position={{ x: 100, y: 200 }} />);

        const tooltip = screen.getByText("Hello");
        expect(tooltip).toHaveStyle({
            position: "absolute",
            top: "200px",
            left: "100px",
        });
    });
});
```

## Mocking

### 1. Mocking API Calls

```jsx
// UserProfile.jsx
const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const fetchUser = async () => {
        try {
            const response = await fetch("/api/user");
            const data = await response.json();
            setUser(data);
        } catch (err) {
            setError("Failed to fetch user");
        }
    };

    return (
        <div>
            <button onClick={fetchUser}>Load Profile</button>
            {user && <div>{user.name}</div>}
            {error && <div>{error}</div>}
        </div>
    );
};

// UserProfile.test.jsx
describe("UserProfile", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test("loads user profile successfully", async () => {
        const mockUser = { name: "John Doe" };
        global.fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockUser),
        });

        render(<UserProfile />);
        fireEvent.click(screen.getByText("Load Profile"));

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });
    });

    test("handles error state", async () => {
        global.fetch.mockRejectedValueOnce(new Error("API Error"));

        render(<UserProfile />);
        fireEvent.click(screen.getByText("Load Profile"));

        await waitFor(() => {
            expect(
                screen.getByText("Failed to fetch user")
            ).toBeInTheDocument();
        });
    });
});
```

### 2. Mocking External Libraries

```jsx
// Analytics.js
export const trackEvent = (eventName, data) => {
    // Third-party analytics code
};

// FeatureFlag.jsx
import { trackEvent } from "./Analytics";

const FeatureFlag = ({ feature, children }) => {
    const handleClick = () => {
        trackEvent("feature_used", { feature });
    };

    return <div onClick={handleClick}>{children}</div>;
};

// FeatureFlag.test.jsx
jest.mock("./Analytics", () => ({
    trackEvent: jest.fn(),
}));

import { trackEvent } from "./Analytics";

describe("FeatureFlag", () => {
    test("tracks feature usage", () => {
        render(
            <FeatureFlag feature="newButton">
                <button>Click me</button>
            </FeatureFlag>
        );

        fireEvent.click(screen.getByText("Click me"));

        expect(trackEvent).toHaveBeenCalledWith("feature_used", {
            feature: "newButton",
        });
    });
});
```

## Asynchronous Testing

### 1. Testing Loading States

```jsx
// AsyncList.jsx
const AsyncList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadItems = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/items");
            const data = await response.json();
            setItems(data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={loadItems}>Load Items</button>
            {loading && <div>Loading...</div>}
            <ul>
                {items.map((item) => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
};

// AsyncList.test.jsx
describe("AsyncList", () => {
    test("shows loading state and items", async () => {
        const mockItems = [
            { id: 1, name: "Item 1" },
            { id: 2, name: "Item 2" },
        ];

        global.fetch = jest.fn().mockImplementation(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        json: () => Promise.resolve(mockItems),
                    });
                }, 100);
            });
        });

        render(<AsyncList />);

        // Initial state
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();

        // Click load button
        fireEvent.click(screen.getByText("Load Items"));

        // Check loading state
        expect(screen.getByText("Loading...")).toBeInTheDocument();

        // Wait for items
        await waitFor(() => {
            expect(screen.getByText("Item 1")).toBeInTheDocument();
            expect(screen.getByText("Item 2")).toBeInTheDocument();
        });

        // Loading should be gone
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
});
```

### 2. Testing with Jest Timers

```jsx
// AutoSave.jsx
const AutoSave = ({ onSave }) => {
    const [content, setContent] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            if (content) {
                onSave(content);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [content, onSave]);

    return (
        <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing..."
        />
    );
};

// AutoSave.test.jsx
describe("AutoSave", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("saves content after delay", () => {
        const mockSave = jest.fn();
        render(<AutoSave onSave={mockSave} />);

        // Type something
        fireEvent.change(screen.getByPlaceholderText("Start typing..."), {
            target: { value: "Hello" },
        });

        // Should not save immediately
        expect(mockSave).not.toHaveBeenCalled();

        // Fast-forward timers
        jest.runAllTimers();

        // Should save after delay
        expect(mockSave).toHaveBeenCalledWith("Hello");
    });
});
```

## Best Practices and Tips

1. **Handling Cleanup:**

    - Always clean up subscriptions and event listeners
    - Use `beforeEach` and `afterEach` for test setup and teardown

2. **Mocking Best Practices:**

    - Mock at the lowest level possible
    - Restore mocks after each test
    - Use `jest.spyOn` for temporary mocks

3. **Async Testing Tips:**

    - Always use `await` with async operations
    - Handle loading and error states
    - Use `waitFor` for checking async updates
    - Consider race conditions

4. **Common Patterns:**
    - Test both success and error paths
    - Verify cleanup functions are called
    - Test boundary conditions
    - Ensure proper error handling

Remember to always test from a user's perspective and focus on behavior rather than implementation details.
