# ADR 05: Distribution/BuildTools

0. Problem

Easily manage the developer codebase, allowing for build hooks, dependency management, etc.

1. Constraints

- Easy to work with
- Ideally handles TypeScript transpilation
- Compatible with chosen language

2. Options

- Webpack
    - Pros
        - Already in place in existing prototype
        - Strong management of static assets
            - This is big as we need to manage a significant number of static assets like images and the indexing files
        - Widely used
    - Cons
        - Poor documentation
        - Unintuitive configuration
        - Does not do dependency management (can be handled with npm)
- NPM
    - Pros
        - Extremely robust dependency management
        - De facto package manager for modern JS projects
        - Compatibility with a large number of build tools
        - Ubiquity partially ensures longevity
        - Can almost be a build tool with scripts
    - Cons
        - Obviously JS specific
        - Scripts provides minimal functionality compared to other options
- Brunch
    - Pros
        - Similar functionality to webpack
        - Lightweight
        - Seemingly decent documentation
        - Good support for static assets
    - Cons
        - Completely unfamiliar
- Babel
    - Pros
        - Modern compiler for next generation JavaScript, allowing backwards compatability
        - Also allows compilation of JSX into JavaScript
    - Cons
        - Not as necessary with our reliance on modern browsers and ES6 and TypeScript features

3. Rationale

We have chosen to use Webpack with NPM as a dependency manager. NPM allows us to build the project and use plenty of external dependencies. Webpack is part of the existing prototype but has also been chosen for its capability for static files.
