# ADR 02: Web Technology

0. Problem

If we do not use the existing Tar Heel Reader architecture, we could choose to use a web technology or framework that allows us to create an extensible downloads page that could, in the future, be used to rearchitect Tar Heel Reader as a whole.

1. Constraints

- Should be simple, single-page (Downloads page)
- Must be easily extendable if more packs are created
- And based on future functionality like extending a THR installation (i.e. downloading more books but keeping the site structure intact)

2. Options

- React
	- Pros
		- Biggest community of any JavaScript framework
		- Codebase maintained by Facebook
		- Flexible and scalable
		- Fast rendering with Virtual DOM
		- Everything is pure JavaScript, with components rendering their UI using JSX
		- With React Hooks, now easier than ever to manage state with only functional components rather than having object-based components handling state
	- Cons
		- Requires learning JSX
		- Being too flexible in structure can be problematic
		- Community conventions still evolving
		- Everything is just JavaScript
- Angular
	- Pros
		- Large framework that provides many services and skills
		- All-in-one framework that provides many features (routing, HTTP request handling, etc.) out of the box
		- Big community, codebase maintained by Google
		- TypeScript support
		- Existing community conventions
	- Cons
		- May lack in some areas or services because it serves as a “do-all”
		- Steep learning curve
		- Verbose and complex
	- Why we did not use it
		- Our client would like to keep our product as simple as possible and Angular provides more than we need as we are trying to keep our downloads page to a single page
- Vue
	- Pros
		- Backed by Laravel and Alibaba
		- Simple syntax, short learning curve
		- Flexibility – can use TypeScript, JSX, or others
		- Fast rendering with virtual DOM
	- Cons
		- Owned by one person and maintained by small team
		- Being more flexible in structure can be problematic
- Ruby on Rails
	- Pros
		- Standard structure for web apps, all the common patterns are taken care of for you
		- External libraries (called gems)
		- Code quality (compared to PHP or Node)
		- Test automation
		- Large community
	- Cons
		- Our design team is less familiar with Ruby
		- Runtime speed (especially compared to NodeJS)
		- Boot speed
		- Documentation 
		- Multi-threading – Rails supports this though some of its IO libraries do not
- Flask
	- Pros
		- Lightweight, self-identifies as a “microframework,” introducing minimal overhead
		- Ease of use – Python is a relatively simple language, and Flask will handle the details of routing, generating pages, error codes, etc.
		- Integrates well with the Jinja templating language, which allows us to integrate Python variables, conditions, loops, and more directly into the HTML code rather than writing JavaScript or TypeScript code (though this has a limit – scripting languages still play a valuable role)
		- Can use all the capabilities of external Python modules
	- Cons
		- Have to use a tool like Supervisor, Gunicorn, etc. to keep it running
		- May not integrate well with existing technology stack and/or initial prototype 
		- To use efficiently, we must link it up to a web server for proxies and more like Apache or Nginx
		- Python as well as Flask have to be maintained for security leaks
		- This might break the requirement that the site can be stored ad infinitum; however, this may always be a risk no matter the technology
- Django
	- Pros:
		- More formally defined and structured than Flask – different functionalities are separated into “apps,” which manage their own URLs, models, templates, static files, and more and to which the broader application at large can route
		- Ease of use – Django is a mature project and Python provides a method to write code quickly 
		- Has its own templating language, which is a superset of Jinja 
		- This templating language is extensible with Python modules like `django_bootstrap4`, which introduce new tags
		- Handles security more directly than something like Flask – forms must submit a CSRF middleware token for POST requests to be accepted
		- Can be directly deployed via a WSGI server with many cloud services, including Google’s App Engine
		- Can use all the capabilities of external Python modules
	- Cons:
		- Has a full database API and integrated layer – while this is incredibly useful, it may introduce overhead that we do not need
		- The overall overhead of Django may be more complex than needed for the use case
		- Django is more suited for enterprise-level applications
		- Python as well as Django have to be maintained for security leaks
		- This might break the requirement that the site can be stored ad infinitum; however, this may always be a risk
		- May not integrate well with existing technology stack

3. Rationale

Though these are all fancy, full-stack web technologies that allow the creation of many of the modern web apps on today’s Internet, they introduce more complexity than is necessary in this semester-long project. Given unlimited resources and time, we could develop the static Tar Heel Reader and rearchitect the existing THR onto a new technology stack. However, the important part of our project in this class is to develop the static Tar Heel Reader itself; bogging ourselves down into details about the structure of the download page itself can detract from this purpose.
