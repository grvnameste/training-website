// lib/quiz/quizData.ts

export type Question = {
  id: string
  question: string
  codeSnippet?: string
  options: string[]
  correctIndex: number
  explanation: string
  topic: string
}

export type QuizMeta = {
  id: string
  title: string
  skills: string[]
  questionsCount: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  durationMinutes: number
  estimatedPassPct: number
  description: string
  topicsCovered: string[]
}

export type QuizFeedback = {
  overallScore: number
  percentage: number
  passed: boolean
  grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Improvement'
  summary: string
  topicBreakdown: {
    topic: string
    correct: number
    total: number
    percentage: number
  }[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export const QUIZ_METADATA: Record<string, QuizMeta> = {
  q1: {
    id: 'q1',
    title: 'JavaScript Basics',
    skills: ['javascript', 'frontend'],
    questionsCount: 15,
    difficulty: 'Easy',
    durationMinutes: 15,
    estimatedPassPct: 82,
    description: 'Master core JavaScript concepts: scoping, closures, async execution, prototypes, ES6+ features, and DOM mechanics.',
    topicsCovered: ['Data Types & Equality', 'Closures & Scopes', 'Event Loop & Promises', 'Array Methods & Iteration', 'Prototypes & Objects']
  },
  q2: {
    id: 'q2',
    title: 'React & State Management',
    skills: ['react', 'redux', 'frontend'],
    questionsCount: 15,
    difficulty: 'Medium',
    durationMinutes: 20,
    estimatedPassPct: 70,
    description: 'Evaluate React component lifecycles, hooks rules (useState, useEffect, useMemo, useCallback), concurrent features, and state flow.',
    topicsCovered: ['Hook Rules & Dependencies', 'Component Rendering & Reconciliation', 'State Management Patterns', 'Memoization & Performance', 'Context & Prop Drilling']
  },
  q3: {
    id: 'q3',
    title: 'TypeScript Practical',
    skills: ['typescript', 'javascript'],
    questionsCount: 15,
    difficulty: 'Medium',
    durationMinutes: 20,
    estimatedPassPct: 75,
    description: 'Practical typing: Generics, Mapped types, Discriminated Unions, Type Narrowing, utility types, and strict compiler options.',
    topicsCovered: ['Generics & Constraints', 'Discriminated Unions', 'Utility Types (Record, Partial, Pick)', 'Type Narrowing & Guards', 'Strict Null Checks']
  },
  q4: {
    id: 'q4',
    title: 'Node.js APIs',
    skills: ['nodejs', 'backend'],
    questionsCount: 15,
    difficulty: 'Medium',
    durationMinutes: 25,
    estimatedPassPct: 68,
    description: 'Core backend engineering: Event loop phases, streams, buffer management, error handling, clustering, and asynchronous I/O.',
    topicsCovered: ['Event Loop & Libuv', 'Streams & Buffers', 'Middleware & Error Handling', 'Process & Threads', 'HTTP & REST Architecture']
  },
  q5: {
    id: 'q5',
    title: 'Mobile Automation (Appium)',
    skills: ['appium', 'automation', 'mobile'],
    questionsCount: 15,
    difficulty: 'Hard',
    durationMinutes: 25,
    estimatedPassPct: 52,
    description: 'End-to-end mobile test automation: Appium architecture, locators, gesture actions, hybrid apps, and cross-platform strategies.',
    topicsCovered: ['Appium Driver & Server', 'Mobile Locators (XPath vs Accessibility ID)', 'Gestures & TouchActions', 'Context Switching (Webview vs Native)', 'Test Synchronization & Waits']
  }
}

// Default questions per quiz
export const QUIZ_QUESTIONS: Record<string, Question[]> = {
  q1: [
    {
      id: 'q1-1',
      topic: 'Data Types & Equality',
      question: 'What will be the output of `console.log(0.1 + 0.2 === 0.3)` in JavaScript?',
      options: ['true', 'false', 'undefined', 'TypeError'],
      correctIndex: 1,
      explanation: 'In JavaScript, numbers are IEEE 754 double precision floats. 0.1 + 0.2 equals 0.30000000000000004, which is not strictly equal to 0.3.'
    },
    {
      id: 'q1-2',
      topic: 'Closures & Scopes',
      question: 'What will be logged by the following code snippet?',
      codeSnippet: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}`,
      options: ['0, 1, 2', '3, 3, 3', 'undefined, undefined, undefined', '0, 0, 0'],
      correctIndex: 1,
      explanation: '`var` declares a function-scoped or globally-scoped variable. When the timeout callbacks execute, the loop has completed and `i` equals 3.'
    },
    {
      id: 'q1-3',
      topic: 'Event Loop & Promises',
      question: 'In what order are the following numbers logged?',
      codeSnippet: `console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);`,
      options: ['1, 4, 3, 2', '1, 2, 3, 4', '1, 4, 2, 3', '1, 3, 4, 2'],
      correctIndex: 0,
      explanation: 'Synchronous code runs first (1, 4). Microtasks like Promise.then run next (3). Macrotasks like setTimeout run last (2).'
    },
    {
      id: 'q1-4',
      topic: 'Array Methods & Iteration',
      question: 'Which method creates a new array with all sub-array elements concatenated recursively up to a specified depth?',
      options: ['Array.prototype.flat()', 'Array.prototype.concat()', 'Array.prototype.reduce()', 'Array.prototype.slice()'],
      correctIndex: 0,
      explanation: '`flat()` flattens sub-arrays into a single array up to the specified depth (defaulting to 1).'
    },
    {
      id: 'q1-5',
      topic: 'Closures & Scopes',
      question: 'What is a closure in JavaScript?',
      options: [
        'A function bundled with references to its lexical environment',
        'A function that terminates the execution of a script',
        'A method that seals an object from modification',
        'An anonymous callback function that runs only once'
      ],
      correctIndex: 0,
      explanation: 'A closure is the combination of a function bundled together with references to its lexical surrounding state, allowing inner functions to access outer variables.'
    },
    {
      id: 'q1-6',
      topic: 'Prototypes & Objects',
      question: 'How do you prevent adding new properties to an object while allowing existing properties to be modified?',
      options: ['Object.preventExtensions()', 'Object.freeze()', 'Object.seal()', 'Object.lock()'],
      correctIndex: 2,
      explanation: '`Object.seal()` prevents adding new properties and marks all existing properties as non-configurable, but allows modifying existing writable values.'
    },
    {
      id: 'q1-7',
      topic: 'Data Types & Equality',
      question: 'What is the return value of `typeof null` in standard JavaScript?',
      options: ['"null"', '"undefined"', '"object"', '"boolean"'],
      correctIndex: 2,
      explanation: '`typeof null === "object"` is a legacy bug in JavaScript dating back to its first implementation, maintained for backward compatibility.'
    },
    {
      id: 'q1-8',
      topic: 'Event Loop & Promises',
      question: 'What happens when a Promise constructor throws an uncaught error inside its executor function?',
      options: [
        'The Promise rejects with the thrown error',
        'The node process crashes immediately',
        'The Promise remains permanently in a pending state',
        'The error is silently swallowed'
      ],
      correctIndex: 0,
      explanation: 'Any exception thrown inside the Promise executor automatically rejects the Promise with the exception value.'
    },
    {
      id: 'q1-9',
      topic: 'Array Methods & Iteration',
      question: 'What does `Array.prototype.reduce()` return if an empty array is passed without an initial value?',
      options: ['undefined', 'null', 'TypeError', 'Empty array []'],
      correctIndex: 2,
      explanation: 'Calling `reduce()` on an empty array without supplying an `initialValue` throws a `TypeError: Reduce of empty array with no initial value`.'
    },
    {
      id: 'q1-10',
      topic: 'Prototypes & Objects',
      question: 'Which operator checks if a property exists in an object or anywhere along its prototype chain?',
      options: ['in', 'hasOwnProperty', 'includes', 'instanceof'],
      correctIndex: 0,
      explanation: 'The `in` operator traverses the prototype chain, unlike `Object.hasOwn()` or `hasOwnProperty()`, which only inspect own properties.'
    },
    {
      id: 'q1-11',
      topic: 'Event Loop & Promises',
      question: 'What is the difference between `Promise.all()` and `Promise.allSettled()`?',
      options: [
        'Promise.all rejects immediately on the first error; allSettled waits for all to resolve or reject',
        'Promise.all is faster; allSettled is sequential',
        'Promise.allSettled returns only resolved values',
        'Promise.all cannot accept array inputs'
      ],
      correctIndex: 0,
      explanation: '`Promise.all` short-circuits upon any rejection, while `Promise.allSettled` waits until every input promise has either fulfilled or rejected.'
    },
    {
      id: 'q1-12',
      topic: 'Data Types & Equality',
      question: 'What does `NaN === NaN` evaluate to?',
      options: ['false', 'true', 'undefined', 'TypeError'],
      correctIndex: 0,
      explanation: 'In IEEE 754 and JavaScript, NaN is not equal to any value, including itself. Use `Number.isNaN()` to check for NaN.'
    },
    {
      id: 'q1-13',
      topic: 'Closures & Scopes',
      question: 'Which feature introduced block-scoped variables in modern JavaScript?',
      options: ['let and const', 'var', 'function', 'class'],
      correctIndex: 0,
      explanation: '`let` and `const` provide block scoping (within { ... }), unlike `var` which is function-scoped.'
    },
    {
      id: 'q1-14',
      topic: 'Prototypes & Objects',
      question: 'What is the modern, recommended way to check if an object has a property directly on itself?',
      options: ['Object.hasOwn(obj, prop)', 'obj.hasOwnProperty(prop)', 'prop in obj', 'obj[prop] !== undefined'],
      correctIndex: 0,
      explanation: '`Object.hasOwn()` (ES2022) is immune to overridden properties on `obj` and works even with objects created via `Object.create(null)`.'
    },
    {
      id: 'q1-15',
      topic: 'Event Loop & Promises',
      question: 'What does the `async` keyword placed before a function declaration guarantee?',
      options: [
        'The function always returns a Promise',
        'The function runs on a dedicated worker thread',
        'The function cannot throw errors',
        'The function executes synchronously'
      ],
      correctIndex: 0,
      explanation: 'An `async function` always wraps its return value in a resolved Promise, or a rejected Promise if an error is thrown.'
    }
  ],

  q2: [
    {
      id: 'q2-1',
      topic: 'Hook Rules & Dependencies',
      question: 'Why should you never call React Hooks inside loops, conditions, or nested functions?',
      options: [
        'To ensure hooks are called in the exact same order on every render',
        'To prevent infinite memory leaks in the browser',
        'Because JavaScript does not allow nested function declarations',
        'To allow the bundler to tree-shake unused hooks'
      ],
      correctIndex: 0,
      explanation: 'React relies on the call order of hooks across renders to associate state with the correct internal fiber cell.'
    },
    {
      id: 'q2-2',
      topic: 'Component Rendering & Reconciliation',
      question: 'What is the purpose of the `key` prop when rendering dynamic lists in React?',
      options: [
        'Helps React identify which items have changed, been added, or removed',
        'Sets the DOM element id attribute',
        'Encrypts the component props for security',
        'Forces the browser to re-paint the DOM immediately'
      ],
      correctIndex: 0,
      explanation: 'Keys give elements a stable identity across renders, allowing React to minimize expensive DOM mutations during reconciliation.'
    },
    {
      id: 'q2-3',
      topic: 'Memoization & Performance',
      question: 'What is the primary difference between `useMemo` and `useCallback`?',
      options: [
        'useMemo caches a computed value; useCallback caches a function definition',
        'useMemo is for components; useCallback is for custom hooks',
        'useMemo runs asynchronously; useCallback runs synchronously',
        'useCallback can only take primitive values'
      ],
      correctIndex: 0,
      explanation: '`useMemo(() => fn(), deps)` returns the memoized result of `fn`, whereas `useCallback(fn, deps)` returns the memoized function reference.'
    },
    {
      id: 'q2-4',
      topic: 'Hook Rules & Dependencies',
      question: 'What happens if a state variable used inside `useEffect` is omitted from its dependency array?',
      options: [
        'The effect closes over stale state values from the initial render',
        'React throws a compile-time fatal syntax error',
        'The effect will automatically execute on every state change',
        'The component will automatically unmount'
      ],
      correctIndex: 0,
      explanation: 'Omitting dependencies leads to stale closures, where the effect reads outdated state captured during previous renders.'
    },
    {
      id: 'q2-5',
      topic: 'Component Rendering & Reconciliation',
      question: 'When does a React component re-render by default?',
      options: [
        'Whenever its parent re-renders, its state changes, or its context updates',
        'Only when its props values have shallowly changed',
        'Only on window scroll and click events',
        'Every 16ms to match the 60fps refresh rate'
      ],
      correctIndex: 0,
      explanation: 'By default in React, whenever a parent component re-renders, all child components re-render unless memoized with React.memo.'
    },
    {
      id: 'q2-6',
      topic: 'State Management Patterns',
      question: 'What is the main benefit of the `useReducer` hook over `useState`?',
      options: [
        'Predictable state transitions for complex logic and actions',
        'Faster execution on mobile browsers',
        'Direct connection to backend REST databases',
        'Automatic local storage persistence'
      ],
      correctIndex: 0,
      explanation: '`useReducer` is preferable when managing complex state transitions that depend on previous states or when state actions are decoupled from UI logic.'
    },
    {
      id: 'q2-7',
      topic: 'Memoization & Performance',
      question: 'Which of the following is true about `React.memo`?',
      options: [
        'It wraps a component and skips rendering if its props have not shallowly changed',
        'It stores the component output permanently in local storage',
        'It replaces the need for useState in child components',
        'It only works with Class components'
      ],
      correctIndex: 0,
      explanation: '`React.memo` is a higher-order component that performs a shallow comparison of props and reuses the previous render output if props have not changed.'
    },
    {
      id: 'q2-8',
      topic: 'Context & Prop Drilling',
      question: 'What is a common performance pitfall with React Context?',
      options: [
        'All consuming components re-render whenever the context value changes',
        'Context values cannot contain objects or arrays',
        'Context can only be used once per application',
        'Context does not work in server-side rendered apps'
      ],
      correctIndex: 0,
      explanation: 'Any component that calls `useContext(MyContext)` will re-render whenever the provided value reference changes, even if it only uses a small property.'
    },
    {
      id: 'q2-9',
      topic: 'Hook Rules & Dependencies',
      question: 'When does the cleanup function returned by `useEffect` run?',
      options: [
        'Before the component unmounts and before the effect re-runs with new dependencies',
        'Only when the browser window closes',
        'Synchronously during the initial render before DOM commit',
        'Never, unless explicitly invoked by the developer'
      ],
      correctIndex: 0,
      explanation: 'The cleanup function executes prior to every subsequent execution of the effect (with new deps) and when the component unmounts.'
    },
    {
      id: 'q2-10',
      topic: 'Component Rendering & Reconciliation',
      question: 'What is the Virtual DOM in React?',
      options: [
        'A lightweight in-memory JavaScript representation of the actual DOM',
        'A browser extension required to run React code',
        'A native WebAssembly module embedded in modern browsers',
        'A CSS engine for compiling Tailwind utilities'
      ],
      correctIndex: 0,
      explanation: 'The Virtual DOM is a tree of plain JavaScript objects mimicking the DOM tree, enabling React to compute minimum diffs before updating real DOM elements.'
    },
    {
      id: 'q2-11',
      topic: 'State Management Patterns',
      question: 'Why should state in React always be treated as immutable?',
      options: [
        'React compares state by shallow reference to determine if a re-render is needed',
        'Direct mutations throw JavaScript runtime syntax errors',
        'Mutating state deletes HTML elements from the DOM',
        'Immutability is only required in TypeScript, not JavaScript'
      ],
      correctIndex: 0,
      explanation: 'Directly mutating objects keeps the same memory address reference (`prev === next`), causing React to skip updates because it detects no change.'
    },
    {
      id: 'q2-12',
      topic: 'Hook Rules & Dependencies',
      question: 'What does `useRef` return, and does updating it cause a re-render?',
      options: [
        'A mutable ref object with a `.current` property; updating it does not trigger a re-render',
        'A read-only snapshot of the DOM node; updating it triggers a render',
        'A Redux dispatcher function; updating it triggers an alert',
        'A Promise; updating it restarts the component'
      ],
      correctIndex: 0,
      explanation: '`useRef` holds a persistent mutable reference throughout the component lifecycle. Mutating `.current` does not cause React to schedule a re-render.'
    },
    {
      id: 'q2-13',
      topic: 'Component Rendering & Reconciliation',
      question: 'What is React StrictMode designed for in development?',
      options: [
        'Highlighting accidental side effects by double-invoking lifecycle methods and effects',
        'Enforcing CSS styles strictly across all viewports',
        'Preventing the developer from typing console.log',
        'Disabling all client-side JavaScript bundle optimizations'
      ],
      correctIndex: 0,
      explanation: 'StrictMode double-invokes component renders and effects in development to expose unexpected side-effects and non-idempotent code.'
    },
    {
      id: 'q2-14',
      topic: 'State Management Patterns',
      question: 'In Redux or Zustand, what is an "action" or "action creator"?',
      options: [
        'A plain JavaScript object describing what happened in the application',
        'A CSS animation triggered by user hover',
        'A database migration script executed on server startup',
        'An HTTP GET request sent directly to third-party endpoints'
      ],
      correctIndex: 0,
      explanation: 'Actions are plain JavaScript objects containing a `type` property and optional payload describing a user intent or state change.'
    },
    {
      id: 'q2-15',
      topic: 'Hook Rules & Dependencies',
      question: 'What is the difference between `useEffect` and `useLayoutEffect`?',
      options: [
        'useLayoutEffect runs synchronously immediately after DOM mutations before browser paint; useEffect runs asynchronously after paint',
        'useEffect cannot read DOM layout properties; useLayoutEffect cannot read state',
        'useLayoutEffect is only for mobile applications',
        'There is no difference; they are aliases for the same function'
      ],
      correctIndex: 0,
      explanation: '`useLayoutEffect` fires synchronously after all DOM mutations before the browser paints the screen, making it ideal for measuring DOM layout.'
    }
  ],

  q3: [
    {
      id: 'q3-1',
      topic: 'Generics & Constraints',
      question: 'How do you constrain a generic type parameter `T` to ensure it contains an `id` string property?',
      options: [
        '<T extends { id: string }>',
        '<T implements { id: string }>',
        '<T: { id: string }>',
        '<T with { id: string }>'
      ],
      correctIndex: 0,
      explanation: 'The `extends` keyword specifies a constraint on a generic type parameter in TypeScript.'
    },
    {
      id: 'q3-2',
      topic: 'Discriminated Unions',
      question: 'What makes a TypeScript union a "Discriminated Union"?',
      options: [
        'A shared literal property (discriminant tag) present in each variant',
        'A union that contains only primitive string and number types',
        'A type that cannot be assigned to any variable',
        'A union defined inside a namespace'
      ],
      correctIndex: 0,
      explanation: 'A discriminated union uses a common literal property (e.g. `type: "success" | "error"`) that TypeScript can check to narrow types in switch or if statements.'
    },
    {
      id: 'q3-3',
      topic: 'Utility Types (Record, Partial, Pick)',
      question: 'What does the utility type `Pick<T, K>` do?',
      options: [
        'Constructs a type by picking the set of properties K from T',
        'Removes properties K from type T',
        'Makes all properties in T optional',
        'Creates an array of properties K'
      ],
      correctIndex: 0,
      explanation: '`Pick<T, K>` constructs a type by extracting the specified keys `K` from type `T`.'
    },
    {
      id: 'q3-4',
      topic: 'Type Narrowing & Guards',
      question: 'Which syntax defines a custom user-defined type guard in TypeScript?',
      options: [
        'function isCat(animal: Animal): animal is Cat',
        'function isCat(animal: Animal): boolean as Cat',
        'function isCat(animal: Animal): animal == Cat',
        'function isCat(animal: Animal): type Cat'
      ],
      correctIndex: 0,
      explanation: 'A type predicate takes the form `parameterName is Type` as the return type of the guard function.'
    },
    {
      id: 'q3-5',
      topic: 'Strict Null Checks',
      question: 'What does the `never` type represent in TypeScript?',
      options: [
        'A type of values that never occur, such as a function that always throws',
        'A variable that has not been initialized yet',
        'An alias for the any type',
        'A type representing an empty object {}'
      ],
      correctIndex: 0,
      explanation: '`never` represents the return type for functions that never return (infinite loops or guaranteed throws), and exhaustive switch checks.'
    },
    {
      id: 'q3-6',
      topic: 'Utility Types (Record, Partial, Pick)',
      question: 'What is the result of `Omit<User, "password" | "token">`?',
      options: [
        'A type with all User properties except "password" and "token"',
        'A type with only "password" and "token"',
        'A type where "password" and "token" are optional',
        'A tuple containing the string values of those keys'
      ],
      correctIndex: 0,
      explanation: '`Omit<T, K>` creates a new type by removing keys `K` from `T`.'
    },
    {
      id: 'q3-7',
      topic: 'Generics & Constraints',
      question: 'What does the `keyof` operator produce when applied to an object type?',
      options: [
        'A union of the object keys as string/number literal types',
        'An array of runtime string keys',
        'The length of the object properties',
        'The prototype of the object'
      ],
      correctIndex: 0,
      explanation: '`keyof T` returns a compile-time union of all known public property names of `T`.'
    },
    {
      id: 'q3-8',
      topic: 'Type Narrowing & Guards',
      question: 'What does the `unknown` type represent in TypeScript?',
      options: [
        'A type-safe counterpart of any where any operation requires prior type narrowing',
        'A deprecated legacy type from TypeScript 1.0',
        'A type that can only store null or undefined',
        'A function parameter that cannot be passed'
      ],
      correctIndex: 0,
      explanation: '`unknown` indicates that a value could be anything, but TypeScript forbids calling methods on it without first asserting or narrowing its type.'
    },
    {
      id: 'q3-9',
      topic: 'Utility Types (Record, Partial, Pick)',
      question: 'How do you create a type representing a dictionary mapping string keys to number values?',
      options: [
        'Record<string, number>',
        'Map<string, number>',
        'Dictionary(string, number)',
        'Object<string: number>'
      ],
      correctIndex: 0,
      explanation: '`Record<K, T>` constructs an object type whose property keys are `K` and property values are `T`.'
    },
    {
      id: 'q3-10',
      topic: 'Strict Null Checks',
      question: 'What does the non-null assertion operator `!` do?',
      options: [
        'Asserts to the compiler that an expression is neither null nor undefined at compile time',
        'Converts a value to a boolean at runtime',
        'Negates the logical value of a statement',
        'Checks if a value is strictly false'
      ],
      correctIndex: 0,
      explanation: 'The postfix `!` tells TypeScript that a variable is not null or undefined, without generating any runtime JavaScript checks.'
    },
    {
      id: 'q3-11',
      topic: 'Generics & Constraints',
      question: 'What does `ReturnType<typeof myFunc>` give you in TypeScript?',
      options: [
        'The return type of the function `myFunc`',
        'The parameter list of `myFunc`',
        'The string name of `myFunc`',
        'A Promise resolving to `myFunc`'
      ],
      correctIndex: 0,
      explanation: '`ReturnType<T>` extracts the return type of a function type `T`.'
    },
    {
      id: 'q3-12',
      topic: 'Discriminated Unions',
      question: 'How does TypeScript achieve exhaustiveness checking in a switch statement on a discriminated union?',
      options: [
        'By assigning the unhandled case to a `const _exhaustive: never` variable in the default branch',
        'By throwing a runtime syntax error automatically',
        'By writing an empty default case',
        'By using the instanceof operator'
      ],
      correctIndex: 0,
      explanation: 'Assigning the value to `never` ensures that if a new variant is added to the union without a corresponding case, TypeScript raises a compile-time error.'
    },
    {
      id: 'q3-13',
      topic: 'Utility Types (Record, Partial, Pick)',
      question: 'What does `Readonly<T>` do?',
      options: [
        'Sets all properties of T to readonly, preventing re-assignment',
        'Freezes the object in runtime memory using Object.freeze',
        'Hides the properties from autocomplete',
        'Makes the object accessible only inside the current class'
      ],
      correctIndex: 0,
      explanation: '`Readonly<T>` marks all properties of type `T` as `readonly`, disallowing reassignment at compile-time.'
    },
    {
      id: 'q3-14',
      topic: 'Type Narrowing & Guards',
      question: 'What operator is used to narrow an object type by checking if a property key exists on it at runtime?',
      options: ['"prop" in obj', 'typeof obj.prop', 'obj instanceof Object', 'obj has "prop"'],
      correctIndex: 0,
      explanation: 'The JavaScript `in` operator serves as a type guard in TypeScript, narrowing the type to only variants containing that property.'
    },
    {
      id: 'q3-15',
      topic: 'Strict Null Checks',
      question: 'What compiler flag prevents accidental `any` fallback for unannotated variables?',
      options: ['noImplicitAny', 'strictNullChecks', 'strictPropertyInitialization', 'alwaysStrict'],
      correctIndex: 0,
      explanation: '`noImplicitAny` raises errors on expressions and declarations with an implied `any` type when TypeScript cannot infer it.'
    }
  ],

  q4: [
    {
      id: 'q4-1',
      topic: 'Event Loop & Libuv',
      question: 'Which component in Node.js handles asynchronous I/O and manages the thread pool?',
      options: ['libuv', 'V8 engine', 'npm', 'HttpParser'],
      correctIndex: 0,
      explanation: '`libuv` is a C library used by Node.js to provide an event loop and thread pool for asynchronous file, DNS, and network I/O.'
    },
    {
      id: 'q4-2',
      topic: 'Event Loop & Libuv',
      question: 'In which event loop phase do callbacks scheduled by `setImmediate()` execute?',
      options: ['Check phase', 'Poll phase', 'Timers phase', 'Close callbacks phase'],
      correctIndex: 0,
      explanation: '`setImmediate()` callbacks are executed in the Check phase of the Node.js event loop, immediately following the Poll phase.'
    },
    {
      id: 'q4-3',
      topic: 'Streams & Buffers',
      question: 'Why are Streams preferred over `fs.readFile()` when dealing with large files in Node.js?',
      options: [
        'Streams process data in chunks without loading the entire file into RAM',
        'Streams encrypt the file automatically',
        'Streams run on GPU cores rather than CPU cores',
        'Streams prevent race conditions on shared disks'
      ],
      correctIndex: 0,
      explanation: 'Streams allow processing chunks sequentially as they arrive, keeping memory footprint constant and low regardless of file size.'
    },
    {
      id: 'q4-4',
      topic: 'Streams & Buffers',
      question: 'What is "backpressure" in Node.js streams?',
      options: [
        'When data is written to a stream faster than the consumer can process it',
        'A socket disconnect caused by firewall restrictions',
        'A memory allocation failure in V8 heap',
        'A reverse proxy error in NGINX'
      ],
      correctIndex: 0,
      explanation: 'Backpressure occurs when the writable stream’s internal buffer exceeds `highWaterMark` because the destination consumes data slower than the source produces it.'
    },
    {
      id: 'q4-5',
      topic: 'Middleware & Error Handling',
      question: 'How does Express identify an error-handling middleware?',
      options: [
        'By having exactly 4 parameters: (err, req, res, next)',
        'By returning an Error object from the function',
        'By naming the function errorHandler',
        'By adding the @Error decorator'
      ],
      correctIndex: 0,
      explanation: 'Express inspects function arity (`fn.length === 4`). A middleware with 4 arguments is treated as an error handler.'
    },
    {
      id: 'q4-6',
      topic: 'Process & Threads',
      question: 'What is the default size of the libuv worker thread pool in Node.js?',
      options: ['4', '1', '8', '16'],
      correctIndex: 0,
      explanation: 'The default thread pool size is 4, configurable via the `UV_THREADPOOL_SIZE` environment variable up to 1024.'
    },
    {
      id: 'q4-7',
      topic: 'Event Loop & Libuv',
      question: 'What is the difference between `process.nextTick()` and `setImmediate()`?',
      options: [
        'process.nextTick fires before the event loop continues; setImmediate fires on the next check phase',
        'setImmediate runs before nextTick',
        'nextTick is only available in browser environments',
        'setImmediate runs on a background OS thread'
      ],
      correctIndex: 0,
      explanation: '`process.nextTick` queues callbacks on the microtask queue that resolves immediately after the current operation finishes, before the event loop advances.'
    },
    {
      id: 'q4-8',
      topic: 'HTTP & REST Architecture',
      question: 'Which HTTP status code is most appropriate for a REST endpoint when a requested resource is created successfully?',
      options: ['201 Created', '200 OK', '202 Accepted', '204 No Content'],
      correctIndex: 0,
      explanation: '201 Created signifies that the request has succeeded and led to the creation of a new resource.'
    },
    {
      id: 'q4-9',
      topic: 'Process & Threads',
      question: 'What module in Node.js is used to spawn multiple instances of a Node process to utilize all CPU cores?',
      options: ['cluster', 'worker_threads', 'child_process', 'v8'],
      correctIndex: 0,
      explanation: 'The `cluster` module allows creating child processes (workers) that all share server ports, taking advantage of multi-core systems.'
    },
    {
      id: 'q4-10',
      topic: 'Streams & Buffers',
      question: 'What is a Node.js `Buffer`?',
      options: [
        'A raw binary data structure allocated outside the V8 heap in memory',
        'A temporary file saved in the OS /tmp directory',
        'A string encoding helper for UTF-8 conversions only',
        'A browser cache controller'
      ],
      correctIndex: 0,
      explanation: 'Buffers represent fixed-length sequences of bytes allocated outside the V8 heap directly in physical memory, ideal for binary streams.'
    },
    {
      id: 'q4-11',
      topic: 'Middleware & Error Handling',
      question: 'What happens if an unhandled promise rejection occurs in Node.js v16+ without a handler?',
      options: [
        'The Node.js process terminates with a non-zero exit code',
        'The error is logged to stdout and execution continues normally',
        'The process enters an infinite loop',
        'The event loop clears all memory'
      ],
      correctIndex: 0,
      explanation: 'In Node.js 15+, unhandled promise rejections cause the process to terminate with exit code 1 by default (`--unhandled-rejections=throw`).'
    },
    {
      id: 'q4-12',
      topic: 'Process & Threads',
      question: 'When should `worker_threads` be used instead of `cluster` in Node.js?',
      options: [
        'For CPU-intensive JavaScript tasks that benefit from shared memory (ArrayBuffers)',
        'For scaling I/O-bound web servers',
        'For serving static files to browsers',
        'For database queries'
      ],
      correctIndex: 0,
      explanation: '`worker_threads` run isolated threads within the same process that can share memory (`SharedArrayBuffer`), ideal for heavy CPU tasks without the overhead of full processes.'
    },
    {
      id: 'q4-13',
      topic: 'HTTP & REST Architecture',
      question: 'What HTTP method is considered idempotent and used to replace an entire resource?',
      options: ['PUT', 'POST', 'PATCH', 'CONNECT'],
      correctIndex: 0,
      explanation: '`PUT` is idempotent: executing the same PUT request multiple times produces the exact same end state on the server.'
    },
    {
      id: 'q4-14',
      topic: 'Event Loop & Libuv',
      question: 'Which phase of the event loop executes timers like `setTimeout` and `setInterval`?',
      options: ['Timers phase', 'Poll phase', 'Pending callbacks phase', 'Idle/Prepare phase'],
      correctIndex: 0,
      explanation: 'The Timers phase is the first phase of the event loop where timers whose thresholds have expired are executed.'
    },
    {
      id: 'q4-15',
      topic: 'Middleware & Error Handling',
      question: 'What must you pass to `next()` in Express to skip all regular middleware and jump to the error handler?',
      options: ['An error object or truthy value: next(err)', 'next(false)', 'next("stop")', 'next(null)'],
      correctIndex: 0,
      explanation: 'Passing any argument to `next()` (except the string `"route"`) signals to Express that an error occurred, jumping immediately to error-handling middleware.'
    }
  ],

  q5: [
    {
      id: 'q5-1',
      topic: 'Appium Driver & Server',
      question: 'What protocol does Appium use under the hood to communicate between the client test scripts and the Appium server?',
      options: [
        'W3C WebDriver protocol over HTTP/REST',
        'WebSockets only',
        'Binary gRPC',
        'Custom TCP sockets'
      ],
      correctIndex: 0,
      explanation: 'Appium implements the standardized W3C WebDriver specification, sending JSON/REST HTTP commands to the Appium server.'
    },
    {
      id: 'q5-2',
      topic: 'Mobile Locators (XPath vs Accessibility ID)',
      question: 'Which locator strategy is considered the fastest and most reliable for cross-platform Appium automation?',
      options: [
        'Accessibility ID (content-desc in Android, accessibilityIdentifier in iOS)',
        'Absolute XPath',
        'Class name locator',
        'Coordinates (x, y)'
      ],
      correctIndex: 0,
      explanation: 'Accessibility ID maps cleanly on both platforms (`content-desc` on Android and `accessibilityIdentifier` on iOS) and does not break on layout changes.'
    },
    {
      id: 'q5-3',
      topic: 'Appium Driver & Server',
      question: 'Which automation engine does Appium 2.x use by default for modern Android devices?',
      options: ['UiAutomator2', 'Espresso', 'Selendroid', 'Instrumentation'],
      correctIndex: 0,
      explanation: 'The `appium-uiautomator2-driver` is the standard driver for automating Android 6.0+ devices.'
    },
    {
      id: 'q5-4',
      topic: 'Context Switching (Webview vs Native)',
      question: 'How do you automate elements inside a hybrid app’s webview using Appium?',
      options: [
        'Switch context using driver.switchContext("WEBVIEW_<name>")',
        'Appium automatically handles webviews without any context switch',
        'You must restart the app in Chrome browser',
        'Webviews cannot be automated in Appium'
      ],
      correctIndex: 0,
      explanation: 'Appium exposes contexts (`NATIVE_APP` and `WEBVIEW_*`). You switch context to the webview to use standard DOM CSS/XPath locators.'
    },
    {
      id: 'q5-5',
      topic: 'Test Synchronization & Waits',
      question: 'Why should implicit waits be avoided when using explicit waits in Appium?',
      options: [
        'Mixing implicit and explicit waits can cause unpredictable timeout delays',
        'Implicit waits crash the Appium server process',
        'Explicit waits disable screenshots on failure',
        'Appium 2 deprecated explicit waits'
      ],
      correctIndex: 0,
      explanation: 'Official WebDriver documentation explicitly warns that mixing implicit and explicit waits produces erratic timeout calculations.'
    },
    {
      id: 'q5-6',
      topic: 'Gestures & TouchActions',
      question: 'What is the modern W3C-compliant API used in Appium 2 for mobile touch gestures (swipes, pinches, taps)?',
      options: ['W3C Actions API (driver.performActions)', 'TouchAction class (deprecated)', 'GestureBuilder', 'MouseEvent API'],
      correctIndex: 0,
      explanation: 'The legacy `TouchAction` class has been deprecated in favor of the W3C Actions API (`performActions`).'
    },
    {
      id: 'q5-7',
      topic: 'Appium Driver & Server',
      question: 'Which driver is used by Appium to automate iOS devices and simulators?',
      options: ['XCUITest driver', 'UIAutomation driver', 'SafariDriver', 'KIF driver'],
      correctIndex: 0,
      explanation: 'Apple deprecated UIAutomation in iOS 10, replacing it with XCUITest, which is wrapped by `appium-xcuitest-driver`.'
    },
    {
      id: 'q5-8',
      topic: 'Mobile Locators (XPath vs Accessibility ID)',
      question: 'Why is deep relative XPath discouraged in mobile testing?',
      options: [
        'Mobile XML UI hierarchies are large, making XPath parsing slow and performance intensive',
        'XPath cannot find elements with text attributes',
        'XPath is not supported on Android devices',
        'XPath only works in webviews'
      ],
      correctIndex: 0,
      explanation: 'On mobile, Appium has to serialize the entire UI hierarchy into XML and traverse it recursively, which takes significant time compared to native locators.'
    },
    {
      id: 'q5-9',
      topic: 'Test Synchronization & Waits',
      question: 'Which explicit wait condition ensures an element is both present in the DOM and visible on screen?',
      options: [
        'ExpectedConditions.visibilityOfElementLocated',
        'ExpectedConditions.presenceOfElementLocated',
        'ExpectedConditions.elementToBeClickable',
        'Thread.sleep(5000)'
      ],
      correctIndex: 0,
      explanation: '`visibilityOfElementLocated` checks both that the element exists in the DOM/hierarchy and that its dimensions are greater than 0.'
    },
    {
      id: 'q5-10',
      topic: 'Appium Driver & Server',
      question: 'What capability in Appium prevents reinstalling and clearing app cache between test sessions?',
      options: ['noReset: true', 'fullReset: true', 'autoGrantPermissions: false', 'dontStopAppOnReset: false'],
      correctIndex: 0,
      explanation: 'Setting `noReset: true` keeps the application state, caches, and login sessions intact across test runs.'
    },
    {
      id: 'q5-11',
      topic: 'Context Switching (Webview vs Native)',
      question: 'What is required on Android to allow Appium to inspect and automate a WebView?',
      options: [
        'setWebContentsDebuggingEnabled(true) in the app source code',
        'Device rooting',
        'A custom Android ROM',
        'Installing Chrome Canary on the device'
      ],
      correctIndex: 0,
      explanation: 'Android requires `WebView.setWebContentsDebuggingEnabled(true)` in debug builds so the Chrome DevTools Protocol can connect to the webview.'
    },
    {
      id: 'q5-12',
      topic: 'Gestures & TouchActions',
      question: 'What parameters define a swipe gesture using W3C Actions?',
      options: [
        'Pointer move to start (x1, y1), pointer down, pointer move to end (x2, y2) with duration, pointer up',
        'Click at start coordinate, click at end coordinate',
        'Key press down, key press up',
        'Double tap followed by mouse drag'
      ],
      correctIndex: 0,
      explanation: 'W3C touch sequences simulate pointer movement: move to origin, pointer down, smooth interpolation to target coordinate over time, and pointer release.'
    },
    {
      id: 'q5-13',
      topic: 'Mobile Locators (XPath vs Accessibility ID)',
      question: 'In iOS XCUITest, what locator strategy uses NSPredicate queries for fast element lookups?',
      options: ['-ios predicate string', '-ios class chain', 'accessibility id', 'xpath'],
      correctIndex: 0,
      explanation: '`-ios predicate string` provides native Apple NSPredicate queries (`name == "Login" AND visible == 1`) which execute natively and quickly inside XCUITest.'
    },
    {
      id: 'q5-14',
      topic: 'Appium Driver & Server',
      question: 'What major architectural change was introduced in Appium 2.0?',
      options: [
        'Drivers and plugins are completely decoupled and installed independently via CLI (`appium driver install`)',
        'Appium removed support for iOS automation',
        'Appium only supports Python as client language',
        'Appium no longer runs on Node.js'
      ],
      correctIndex: 0,
      explanation: 'Appium 2.0 decoupled all device drivers (XCUITest, UiAutomator2) and plugins into standalone npm packages that can be installed on demand.'
    },
    {
      id: 'q5-15',
      topic: 'Test Synchronization & Waits',
      question: 'What does `driver.manage().timeouts().implicitlyWait()` do?',
      options: [
        'Polls the DOM for a specified duration whenever any element is searched before throwing NoSuchElementException',
        'Halts thread execution unconditionally for the specified milliseconds',
        'Sets the HTTP connection timeout for the test runner',
        'Waits for page load completion only'
      ],
      correctIndex: 0,
      explanation: 'Implicit wait tells the driver to poll the DOM for a given amount of time when trying to find any element if it is not immediately available.'
    }
  ]
}

// Generates dynamic questions if an unknown or custom quiz ID is requested
export function getQuizQuestions(quizId: string): Question[] {
  if (QUIZ_QUESTIONS[quizId]) {
    return QUIZ_QUESTIONS[quizId]
  }

  // Fallback dynamic questions for custom / generated quizzes
  return [
    {
      id: `${quizId}-1`,
      topic: 'Fundamentals',
      question: `Which of the following is considered an architectural best practice in modern software engineering?`,
      options: [
        'Separation of concerns and modular component design',
        'Hardcoding database credentials in frontend bundles',
        'Directly mutating global state across unrelated components',
        'Disabling unit and integration tests to increase velocity'
      ],
      correctIndex: 0,
      explanation: 'Separation of concerns ensures modularity, testability, and isolated responsibilities across layers.',
      codeSnippet: `// Example clean separation
interface UserService {
  getUser(id: string): Promise<User>;
}`
    },
    {
      id: `${quizId}-2`,
      topic: 'Architecture & Scalability',
      question: 'What is the primary advantage of idempotent operations in distributed systems and APIs?',
      options: [
        'Executing the operation multiple times produces the identical side-effect as a single execution',
        'It eliminates network bandwidth consumption completely',
        'It converts asynchronous operations to synchronous execution',
        'It allows unrestricted unauthenticated writes'
      ],
      correctIndex: 0,
      explanation: 'Idempotency guarantees that retries after network timeouts do not duplicate mutations or corrupt state.'
    },
    {
      id: `${quizId}-3`,
      topic: 'Performance Optimization',
      question: 'What technique prevents expensive functions from executing repeatedly during rapid user inputs (e.g. search bars)?',
      options: ['Debouncing / Throttling', 'Polling', 'Deep Recursion', 'Synchronous Thread Sleep'],
      correctIndex: 0,
      explanation: 'Debouncing delays function execution until a specified delay has elapsed since the last invocation.'
    },
    {
      id: `${quizId}-4`,
      topic: 'Security & Auth',
      question: 'What is the recommended practice for protecting private API keys and tokens in modern web apps?',
      options: [
        'Keep them strictly server-side in environment variables and proxy requests through secure backend routes',
        'Prefix them with NEXT_PUBLIC_ and commit to public Git repositories',
        'Store them in localStorage and send them via client URL query parameters',
        'Hardcode them in plain text in client React components'
      ],
      correctIndex: 0,
      explanation: 'Private API secrets must remain server-side and never be exposed in client bundles.'
    },
    {
      id: `${quizId}-5`,
      topic: 'Testing & Reliability',
      question: 'What is the primary goal of regression testing?',
      options: [
        'To verify that recent code changes have not adversely affected existing functional features',
        'To test database hardware load limits only',
        'To rewrite legacy components from scratch',
        'To speed up CPU clock cycles'
      ],
      correctIndex: 0,
      explanation: 'Regression testing ensures that bug fixes or new features do not introduce regressions into already working code.'
    }
  ]
}

export function getQuizMeta(quizId: string): QuizMeta {
  if (QUIZ_METADATA[quizId]) {
    return QUIZ_METADATA[quizId]
  }

  // Fallback for custom / dynamic quiz
  return {
    id: quizId,
    title: quizId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    skills: ['engineering', 'general'],
    questionsCount: 5,
    difficulty: 'Medium',
    durationMinutes: 10,
    estimatedPassPct: 75,
    description: 'Assess technical foundations, system architecture, performance optimization, and problem-solving skills.',
    topicsCovered: ['Fundamentals', 'Architecture & Scalability', 'Performance Optimization', 'Security & Auth', 'Testing & Reliability']
  }
}

// Generate automated quiz feedback based on answers
export function generateQuizFeedback(
  questions: Question[],
  answers: Record<number, number>,
  passThresholdPct = 70
): QuizFeedback {
  let correctCount = 0
  const topicStats: Record<string, { correct: number; total: number }> = {}
  const weaknessesSet = new Set<string>()
  const strengthsSet = new Set<string>()

  questions.forEach((q, idx) => {
    const topic = q.topic || 'General'
    if (!topicStats[topic]) {
      topicStats[topic] = { correct: 0, total: 0 }
    }
    topicStats[topic].total += 1

    const selected = answers[idx]
    if (selected === q.correctIndex) {
      correctCount += 1
      topicStats[topic].correct += 1
    } else {
      weaknessesSet.add(topic)
    }
  })

  // Identify strengths (topics with 100% or >=80% accuracy)
  Object.entries(topicStats).forEach(([topic, stats]) => {
    const pct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
    if (pct >= 80) {
      strengthsSet.add(topic)
      weaknessesSet.delete(topic)
    }
  })

  const total = questions.length
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const passed = percentage >= passThresholdPct

  let grade: QuizFeedback['grade'] = 'Needs Improvement'
  let summary = ''

  if (percentage >= 90) {
    grade = 'A+'
    summary = 'Outstanding mastery! You demonstrated comprehensive technical depth with virtually zero gaps.'
  } else if (percentage >= 80) {
    grade = 'A'
    summary = 'Excellent performance! You possess a solid command over the subject with only minor edge cases to polish.'
  } else if (percentage >= 70) {
    grade = 'B'
    summary = 'Good effort! You met the passing standard, though certain concepts could benefit from targeted practice.'
  } else if (percentage >= 50) {
    grade = 'C'
    summary = 'Fair understanding, but several key principles were missed. We recommend revising the core topics below.'
  } else {
    grade = 'Needs Improvement'
    summary = 'Foundational gaps identified. Review the detailed explanations and retake the assessment to solidify understanding.'
  }

  const topicBreakdown = Object.entries(topicStats).map(([topic, stats]) => ({
    topic,
    correct: stats.correct,
    total: stats.total,
    percentage: Math.round((stats.correct / stats.total) * 100)
  }))

  const strengths = Array.from(strengthsSet)
  if (strengths.length === 0 && percentage >= 60) {
    strengths.push('Solid overall problem-solving mindset and consistent baseline comprehension.')
  } else if (strengths.length === 0) {
    strengths.push('Willingness to test your knowledge and tackle challenging assessments.')
  }

  const weaknesses = Array.from(weaknessesSet)
  if (weaknesses.length === 0) {
    weaknesses.push('No significant concept weaknesses detected on this attempt.')
  }

  const recommendations: string[] = []
  if (weaknesses.length > 0 && weaknesses[0] !== 'No significant concept weaknesses detected on this attempt.') {
    weaknesses.forEach(w => {
      recommendations.push(`Reinforce conceptual clarity and practical code exercises in "${w}".`)
    })
  }
  recommendations.push('Review the detailed answer explanations below for every question to solidify your mental model.')
  if (!passed) {
    recommendations.push('Re-read the relevant course modules and retake this quiz to achieve a passing score of 70%+.')
  } else {
    recommendations.push('Advance to the next module or capstone milestone to apply these validated skills!')
  }

  return {
    overallScore: correctCount,
    percentage,
    passed,
    grade,
    summary,
    topicBreakdown,
    strengths,
    weaknesses,
    recommendations
  }
}
