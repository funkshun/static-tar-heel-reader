# ADR 03: Programming Languages

0. Purpose

We need to be able to create a dynamic, progressive web app which is usable by all users, including those with various disabilities, and which is runnable on the latest modern browsers (i.e. new Edge, Chrome, Firefox, Opera). As this will be a progressive web app (see here, here, and here), it needs to be progressive, responsive, faster after initial loading, connectivity independent, app-like, fresh, safe, discoverable, re-engageable, installable, and linkable. 

1. Constraints

- Some members know languages better than the other
- Must be compatible with multiple (modern) browsers
- An initial prototype has been created which utilizes TypeScript, HTML, and CSS

2. Options

- Javascript
    - Pros:
        - Usage of modern ES6 features (e.g. arrow functions, the rest and spread operators, let and const, for…of, promises, and more) provide an exceptional array of capabilities 
        - Modern users expect a seamless browsing experience, and scripting allows pages to dynamically change data without reloading the page itself
        - We want to have the site to be easily extensible, so plain JavaScript (i.e. not minified) allows future developers or even users to give additional functionality
    - Cons:
        - Have to be cognizant of threats like cross-site scripting and CORs
        - Without using a tool like jQuery, directly interacting with the DOM can be more challenging
- TypeScript
    - Pros:
        - Just JavaScript with optional static typing, so allows everything that JavaScript does as well as additional debugging capabilities
        - Transpiles directly into JavaScript (settings can make it into non-minified JavaScript)
        - Supports definition files that can contain type information for existing JavaScript or Node libraries
    - Cons:
        - Introducing complexity by having additional features rather than vanilla JavaScript alone
        - Requires rebuilding the app
- HTML
    - Pros:
        - HTML5 adds modern features to the markup language like video and audio tags, the figure tag, web fonts, transitions, and more. 
    - Cons:
        - Cannot have conditional logic, loops, or variables directly used like a templating language can 
        - This requires scripting
- CSS
    - Pros: 
        - Separates concerns – allows styling to be distinct from the structure of the DOM itself
        - Easy changes – can change CSS rules in one place and have the styling applied to multiple pages
        - Usage of modern CSS3 introduces capabilities like grid and flex-box layouts, rounded corners, animations, shadows, and more
    - Cons:
- Python
    - Pros:
        - Python extends the features of HTML by adding templating languages which allow the usage of loops, conditionals, and variables
        - additional Python modules can extend this functionality even more
    - Cons:
        - Requires additional installation and build steps
        - The same functionalities can be performed using JavaScript, albeit not as cleanly

3. Rationale

We have chosen to create our site using HTML5, TypeScript, and CSS3. This integrates well with the existing prototype and the previous product itself. The client prefers to maintain the existing HTML while adding more content as static HTML pages.
