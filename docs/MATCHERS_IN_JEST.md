# Jest Matchers: A Comprehensive Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Common Matchers](#common-matchers)
3. [Truthiness Matchers](#truthiness-matchers)
4. [Number Matchers](#number-matchers)
5. [String Matchers](#string-matchers)
6. [Arrays and Iterables](#arrays-and-iterables)
7. [Objects Matchers](#objects-matchers)
8. [Exceptions](#exceptions)
9. [Promise Matchers](#promise-matchers)
10. [Mock Function Matchers](#mock-function-matchers)
11. [Snapshot Testing](#snapshot-testing)

## Introduction

Jest matchers are functions that allow you to validate different aspects of your code through assertions. Each matcher implements a different type of comparison or validation logic. This guide covers all the essential matchers available in Jest.

## Common Matchers

The most basic matchers check for equality:

```javascript
expect(value).toBe(expectedValue);
// Uses Object.is for exact equality

expect(value).toEqual(expectedValue);
// Performs a deep equality check

expect(value).not.toBe(expectedValue);
// Negates any matcher

expect(value).toStrictEqual(expectedValue);
// Very strict equality check, including undefined properties
```

## Truthiness Matchers

For checking boolean conditions and existence:

```javascript
expect(value).toBeTruthy();
// Matches anything that an if statement treats as true

expect(value).toBeFalsy();
// Matches anything that an if statement treats as false

expect(value).toBeNull();
// Matches only null

expect(value).toBeUndefined();
// Matches only undefined

expect(value).toBeDefined();
// Matches anything that is not undefined

expect(value).toBeNaN();
// Matches only NaN
```

## Number Matchers

For numerical comparisons:

```javascript
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3.5);
expect(value).toBeLessThan(5);
expect(value).toBeLessThanOrEqual(4.5);

// For floating point equality
expect(0.1 + 0.2).toBeCloseTo(0.3, 5); // 5 is precision

expect(value).toBeFinite();
expect(value).toBePositive();
expect(value).toBeNegative();
```

## String Matchers

For string validation:

```javascript
expect(string).toMatch(/pattern/);
// Matches against regular expression

expect(string).toMatch("substring");
// Contains substring

expect(string).toContain("exact string");
// Contains exact string

expect(string).toHaveLength(number);
// String has specific length

expect(string).toStartWith("prefix");
expect(string).toEndWith("suffix");
```

## Arrays and Iterables

For working with arrays and other iterable objects:

```javascript
expect(array).toContain(item);
// Array contains item

expect(array).toContainEqual(item);
// Array contains item with deep equality

expect(array).toHaveLength(number);
// Array has specific length

expect(array).toBeInstanceOf(Array);
// Checks if it's an array

expect(array).toEqual(expect.arrayContaining(["item1", "item2"]));
// Array contains all items in the sample, regardless of order
```

## Objects Matchers

For object validation:

```javascript
expect(object).toHaveProperty("path.to.property");
// Object has property at path

expect(object).toHaveProperty("path", value);
// Object has property with specific value

expect(object).toMatchObject({
    property: value,
    nested: {
        property: value,
    },
});
// Object matches partial shape

expect(object).toBeInstanceOf(Constructor);
// Object is instance of class
```

## Exceptions

For testing error handling:

```javascript
expect(() => {
    throwingFunction();
}).toThrow();
// Function throws any error

expect(() => {
    throwingFunction();
}).toThrow(Error);
// Function throws specific error type

expect(() => {
    throwingFunction();
}).toThrow("error message");
// Function throws error with specific message

expect(() => {
    throwingFunction();
}).toThrow(/error pattern/);
// Function throws error matching pattern
```

## Promise Matchers

For testing asynchronous code:

```javascript
await expect(promise).resolves.toBe(value);
// Promise resolves to value

await expect(promise).resolves.toMatchObject({
    property: value,
});
// Promise resolves to object matching shape

await expect(promise).rejects.toThrow(error);
// Promise rejects with error

await expect(promise).rejects.toThrow("error message");
// Promise rejects with specific error message
```

## Mock Function Matchers

For testing spy and mock functions:

```javascript
expect(mockFn).toHaveBeenCalled();
// Function was called

expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
// Function was called with specific arguments

expect(mockFn).toHaveBeenCalledTimes(number);
// Function was called exact number of times

expect(mockFn).toHaveBeenLastCalledWith(arg1, arg2);
// Last call was with specific arguments

expect(mockFn).toHaveReturned();
// Function returned (didn't throw)

expect(mockFn).toHaveReturnedWith(value);
// Function returned specific value
```

## Snapshot Testing

For testing against saved snapshots:

```javascript
expect(value).toMatchSnapshot();
// Matches against stored snapshot

expect(value).toMatchInlineSnapshot();
// Matches against inline snapshot

expect(value).toMatchSnapshot({
    time: expect.any(Date),
});
// Matches snapshot with dynamic properties
```

## Best Practices

1. Use `toBe()` for primitives and `toEqual()` for objects/arrays
2. Use `toStrictEqual()` when you need to be extra careful about object equality
3. Prefer specific matchers over generic ones (e.g., `toBeNull()` over `toBe(null)`)
4. Use `not` to negate matchers when testing for negative cases
5. Use `expect.extend()` to create custom matchers for specific use cases

## Example Test Suite

```javascript
describe("User authentication", () => {
    test("should login with valid credentials", async () => {
        const user = await login("username", "password");
        expect(user).toMatchObject({
            id: expect.any(Number),
            username: "username",
            isLoggedIn: true,
        });
        expect(user.loginTime).toBeInstanceOf(Date);
    });

    test("should throw error with invalid credentials", async () => {
        await expect(login("invalid", "wrong")).rejects.toThrow(
            "Invalid credentials"
        );
    });
});
```

Remember that Jest provides many more matchers and options. Always check the [official Jest documentation](https://jestjs.io/docs/expect) for the most up-to-date information and additional matchers that might be useful for your specific testing needs.
