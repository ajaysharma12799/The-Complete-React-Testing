# React Testing Library: A Comprehensive Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Why React Testing Library?](#why-react-testing-library)
3. [Core Principles](#core-principles)
4. [Getting Started](#getting-started)
5. [Rendering Components](#rendering-components)
6. [Queries](#queries)
7. [User Events](#user-events)
8. [Async Testing](#async-testing)
9. [Best Practices](#best-practices)
10. [Common Patterns](#common-patterns)

## Introduction

React Testing Library (RTL) is a lightweight solution for testing React components. It provides utility functions on top of DOM Testing Library, encouraging better testing practices by working with actual DOM nodes rather than React component instances.

## Why React Testing Library?

RTL was created to solve several problems with traditional React testing approaches:

```javascript
// ❌ Traditional Enzyme approach (testing implementation)
expect(wrapper.state('isLoading')).toBe(true);
expect(wrapper.instance().handleClick).toBeCalled();

// ✅ RTL approach (testing behavior)
expect(screen.getByText('Loading...')).toBeInTheDocument();
expect(screen.getByRole('button')).toBeEnabled();
```

Key advantages:
- Tests resemble how users interact with your app
- Encourages accessible component design
- Tests are more maintainable and less brittle
- Focuses on behavior over implementation
- Built-in best practices

## Core Principles

1. **The more your tests resemble the way your software is used, the more confidence they can give you.**
2. **Test user behavior, not implementation details.**
3. **Find elements by accessibility markers first.**

## Getting Started

Installation:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

Basic setup:

```javascript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  test('renders successfully', () => {
    render(<YourComponent />);
    // Your tests here
  });
});
```

## Rendering Components

### Basic Rendering

```javascript
import { render, screen } from '@testing-library/react';

// Simple component render
render(<MyComponent />);

// Render with props
render(<MyComponent title="Test" />);

// Render with context
const wrapper = ({ children }) => (
  <ThemeContext.Provider value="dark">
    {children}
  </ThemeContext.Provider>
);

render(<MyComponent />, { wrapper });
```

### Cleanup

```javascript
import { cleanup } from '@testing-library/react';

// Automatically runs after each test
afterEach(cleanup);
```

## Queries

RTL provides several types of queries to find elements in the DOM:

### Query Types

1. **getBy**: Returns the matching node, throws error if not found or multiple matches
2. **queryBy**: Returns the matching node, returns null if not found
3. **findBy**: Returns a promise that resolves when element is found, for async elements
4. **getAllBy**: Returns array of all matching elements, throws if none found
5. **queryAllBy**: Returns array of all matching elements, returns empty array if none found
6. **findAllBy**: Returns a promise that resolves to array of elements

### Query Priorities (in order of preference)

1. **Accessible Queries**:
```javascript
// By Role (Most Preferred)
const button = screen.getByRole('button', { name: 'Submit' });
const heading = screen.getByRole('heading', { name: 'Welcome' });

// By Label Text
const input = screen.getByLabelText('Username');

// By Placeholder Text
const searchInput = screen.getByPlaceholderText('Search...');
```

2. **Text Content Queries**:
```javascript
// By Text
const element = screen.getByText('Hello, World');
const partialMatch = screen.getByText(/hello/i);

// By Display Value
const input = screen.getByDisplayValue('Initial value');
```

3. **Test IDs (Last Resort)**:
```javascript
const element = screen.getByTestId('submit-button');
```

### Query Examples

```javascript
// Complete example of different queries
test('form elements are accessible', () => {
  render(<SignupForm />);
  
  // By Role
  const submitButton = screen.getByRole('button', { name: /submit/i });
  const nameInput = screen.getByRole('textbox', { name: /name/i });
  
  // By Label Text
  const emailInput = screen.getByLabelText(/email address/i);
  
  // By Placeholder
  const searchInput = screen.getByPlaceholderText('Search users...');
  
  // By Text
  const heading = screen.getByText(/sign up/i);
  
  // By Test ID
  const form = screen.getByTestId('signup-form');
  
  expect(submitButton).toBeEnabled();
  expect(nameInput).toHaveValue('');
  expect(emailInput).toBeInTheDocument();
});
```

## User Events

Testing user interactions:

```javascript
import userEvent from '@testing-library/user-event';

test('submitting the form', async () => {
  // Setup user event
  const user = userEvent.setup();
  
  render(<LoginForm />);
  
  // Get form elements
  const usernameInput = screen.getByLabelText(/username/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /submit/i });
  
  // Interact with form
  await user.type(usernameInput, 'testuser');
  await user.type(passwordInput, 'password123');
  await user.click(submitButton);
  
  // Assert results
  expect(await screen.findByText(/welcome/i)).toBeInTheDocument();
});
```

## Async Testing

Testing asynchronous behavior:

```javascript
test('loads items eventually', async () => {
  render(<ItemList />);

  // Initial loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for items to load
  const items = await screen.findAllByRole('listitem');
  expect(items).toHaveLength(3);

  // Alternative way using waitFor
  await waitFor(() => {
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
```

## Best Practices

1. **Query Priority**:
```javascript
// ✅ Good: Use accessible queries
const button = screen.getByRole('button', { name: /submit/i });

// ❌ Bad: Avoid testid when accessible queries are possible
const button = screen.getByTestId('submit-button');
```

2. **Async Testing**:
```javascript
// ✅ Good: Use async/await with findBy
const element = await screen.findByText(/loaded/i);

// ❌ Bad: Don't use setTimeout in tests
setTimeout(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
}, 1000);
```

3. **Event Testing**:
```javascript
// ✅ Good: Use userEvent
await userEvent.type(input, 'text');

// ❌ Bad: Avoid fireEvent when possible
fireEvent.change(input, { target: { value: 'text' } });
```

## Common Patterns

### Testing Forms

```javascript
test('form submission', async () => {
  const handleSubmit = jest.fn();
  const user = userEvent.setup();
  
  render(<Form onSubmit={handleSubmit} />);
  
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  });
});
```

### Testing API Calls

```javascript
test('loads and displays data', async () => {
  // Mock API response
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    json: async () => ({ data: { name: 'John' } })
  });
  
  render(<UserProfile userId="123" />);
  
  // Wait for loading to complete
  expect(await screen.findByText('John')).toBeInTheDocument();
  
  // Verify API was called correctly
  expect(fetch).toHaveBeenCalledWith('/api/users/123');
});
```

### Testing Error States

```javascript
test('displays error message on API failure', async () => {
  // Mock API error
  jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));
  
  render(<UserProfile userId="123" />);
  
  // Verify error message appears
  expect(await screen.findByText(/error loading profile/i))
    .toBeInTheDocument();
});
```

Remember that RTL is constantly evolving, and new features and best practices emerge regularly. Always refer to the [official documentation](https://testing-library.com/docs/react-testing-library/intro/) for the most up-to-date information and guidance.