# React Integration Testing Guide

## Testing with Context

### 1. Basic Context Testing

```jsx
// ThemeContext.jsx
export const ThemeContext = React.createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("light");

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// ThemeConsumer.jsx
const ThemeConsumer = () => {
    const { theme, setTheme } = useContext(ThemeContext);

    return (
        <div>
            <div>Current theme: {theme}</div>
            <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
                Toggle Theme
            </button>
        </div>
    );
};

// ThemeConsumer.test.jsx
describe("ThemeConsumer with Context", () => {
    test("toggles theme correctly", () => {
        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>
        );

        // Check initial theme
        expect(screen.getByText("Current theme: light")).toBeInTheDocument();

        // Toggle theme
        fireEvent.click(screen.getByText("Toggle Theme"));
        expect(screen.getByText("Current theme: dark")).toBeInTheDocument();
    });
});
```

### 2. Custom Test Wrapper for Context

```jsx
// test-utils.jsx
const AllTheProviders = ({ children }) => {
    return (
        <ThemeProvider>
            <UserProvider>
                <SettingsProvider>{children}</SettingsProvider>
            </UserProvider>
        </ThemeProvider>
    );
};

const customRender = (ui, options) =>
    render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Component.test.jsx
import { render } from "./test-utils";

test("component with multiple contexts", () => {
    render(<MyComponent />);
    // Your tests here
});
```

### 3. Testing Context with Initial Values

```jsx
// UserContext.test.jsx
describe("Component with UserContext", () => {
    const customRender = (ui, providerProps) => {
        return render(
            <UserContext.Provider value={providerProps}>
                {ui}
            </UserContext.Provider>
        );
    };

    test("renders user data from context", () => {
        const providerProps = {
            user: { name: "John", role: "admin" },
            updateUser: jest.fn(),
        };

        customRender(<UserProfile />, providerProps);
        expect(screen.getByText("John")).toBeInTheDocument();
        expect(screen.getByText("admin")).toBeInTheDocument();
    });
});
```

## Testing Redux Components

### 1. Testing Connected Components

```jsx
// userSlice.js
import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        data: null,
        loading: false,
        error: null,
    },
    reducers: {
        fetchUserStart: (state) => {
            state.loading = true;
        },
        fetchUserSuccess: (state, action) => {
            state.loading = false;
            state.data = action.payload;
        },
        fetchUserError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

// UserProfile.jsx
const UserProfile = () => {
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((state) => state.user);

    const fetchUser = () => {
        dispatch(fetchUserStart());
        fetch("/api/user")
            .then((res) => res.json())
            .then((data) => dispatch(fetchUserSuccess(data)))
            .catch((err) => dispatch(fetchUserError(err.message)));
    };

    return (
        <div>
            <button onClick={fetchUser}>Load User</button>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}
            {data && <div>Welcome, {data.name}</div>}
        </div>
    );
};

// UserProfile.test.jsx
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import userReducer from "./userSlice";

describe("UserProfile with Redux", () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                user: userReducer,
            },
        });
    });

    const renderWithRedux = (component) => {
        return render(<Provider store={store}>{component}</Provider>);
    };

    test("loads and displays user data", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({ name: "John Doe" }),
        });

        renderWithRedux(<UserProfile />);

        fireEvent.click(screen.getByText("Load User"));

        // Check loading state
        expect(screen.getByText("Loading...")).toBeInTheDocument();

        // Check data
        await waitFor(() => {
            expect(screen.getByText("Welcome, John Doe")).toBeInTheDocument();
        });
    });
});
```

### 2. Testing Redux Actions and Thunks

```jsx
// userThunks.js
export const fetchUser = () => async (dispatch) => {
    dispatch(fetchUserStart());
    try {
        const response = await fetch("/api/user");
        const data = await response.json();
        dispatch(fetchUserSuccess(data));
    } catch (error) {
        dispatch(fetchUserError(error.message));
    }
};

// userThunks.test.js
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const mockStore = configureMockStore([thunk]);

describe("User Thunks", () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            user: {
                data: null,
                loading: false,
                error: null,
            },
        });

        global.fetch = jest.fn();
    });

    test("fetchUser success scenario", async () => {
        const mockUser = { name: "John Doe" };
        global.fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockUser),
        });

        await store.dispatch(fetchUser());
        const actions = store.getActions();

        expect(actions[0].type).toBe("user/fetchUserStart");
        expect(actions[1].type).toBe("user/fetchUserSuccess");
        expect(actions[1].payload).toEqual(mockUser);
    });
});
```

## Mocking Dependencies

### 1. Mocking API Services

```jsx
// api.js
export const userApi = {
    getUser: () => fetch("/api/user").then((res) => res.json()),
    updateUser: (data) =>
        fetch("/api/user", {
            method: "PUT",
            body: JSON.stringify(data),
        }).then((res) => res.json()),
};

// UserManager.jsx
const UserManager = () => {
    const [user, setUser] = useState(null);

    const loadUser = async () => {
        const data = await userApi.getUser();
        setUser(data);
    };

    return (
        <div>
            <button onClick={loadUser}>Load User</button>
            {user && <div>{user.name}</div>}
        </div>
    );
};

// UserManager.test.jsx
jest.mock("./api", () => ({
    userApi: {
        getUser: jest.fn(),
        updateUser: jest.fn(),
    },
}));

import { userApi } from "./api";

describe("UserManager", () => {
    test("loads user data from API", async () => {
        userApi.getUser.mockResolvedValueOnce({ name: "John Doe" });

        render(<UserManager />);
        fireEvent.click(screen.getByText("Load User"));

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });
    });
});
```

### 2. Mocking Custom Hooks

```jsx
// useAuth.js
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const login = async (credentials) => {
        // Authentication logic
    };
    return { user, login };
};

// LoginForm.jsx
const LoginForm = () => {
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login({
            username: e.target.username.value,
            password: e.target.password.value,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="username" />
            <input name="password" type="password" />
            <button type="submit">Login</button>
        </form>
    );
};

// LoginForm.test.jsx
jest.mock("./useAuth", () => ({
    useAuth: () => ({
        login: jest.fn().mockResolvedValue(undefined),
        user: null,
    }),
}));

describe("LoginForm", () => {
    test("submits credentials correctly", async () => {
        const { useAuth } = require("./useAuth");
        const mockLogin = useAuth().login;

        render(<LoginForm />);

        fireEvent.change(screen.getByRole("textbox"), {
            target: { value: "testuser" },
        });
        fireEvent.change(screen.getByRole("password"), {
            target: { value: "testpass" },
        });
        fireEvent.submit(screen.getByRole("form"));

        expect(mockLogin).toHaveBeenCalledWith({
            username: "testuser",
            password: "testpass",
        });
    });
});
```

## Best Practices

1. **Testing Integration Points:**

    - Test how components interact with context and store
    - Verify data flow between components
    - Check error handling across boundaries

2. **Mocking Strategies:**

    - Mock at the right level (service vs network)
    - Use jest.mock for module-level mocking
    - Consider partial mocks when appropriate

3. **Redux Testing Tips:**

    - Test connected components with a real store
    - Use middleware for complex scenarios
    - Test action creators and reducers separately

4. **Context Testing Tips:**
    - Create reusable test wrappers
    - Test context updates
    - Verify consumer behavior

Remember: Focus on testing the integration points and data flow rather than implementation details.
