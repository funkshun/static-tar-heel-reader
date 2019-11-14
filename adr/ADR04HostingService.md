# ADR 04: Hosting Service

0. Problem

The website and download files need to live somewhere so they can be accessed by the user. The existing infrastructure is built on top of WordPress using various PHP files; the client has complained in the past how WordPress has to be continually updated to “stay ahead of the bad people,” so we can either choose to find a new service or to integrate with the existing architecture.

1. Constraints

- Ideally lives in free tier
- Optimize for storage space
- Potentially easy to switch to a different one in the future should requirements change
- Ethical business practices

2. Options

- Heroku
    - Pros:
        - Has better free tier than many other cloud services 
    - Cons:
        - Heroku is technically just a wrapper on top of Amazon EC2 instances
- WordPress
    - Pros:
        - We do not need to develop or learn something new – we can plug in new functionality to the existing tech stack
        - However, this may be antithetical to part of the intent of the Static Tar Heel Reader project, making sure that the site continues past Dr. Bishop’s retirement
    - Cons:
        - We are limited to WordPress’s technologies and restrictions
        - WordPress is constantly changing to, as Dr. Bishop says, “stay ahead of bad people” – this means that the site needs more maintenance 
- Cloud Services
    - Pros
        - Multiple options (including Google Cloud, Amazon Web Services, Microsoft Azure, Digital Ocean, etc.), which have their own strengths and weaknesses 
        - Most cloud providers provide scalability based on usage, which means that if the Tar Heel Reader becomes more or less popular no one would have to manually apportion resources to it
        - Lots of options for growth with a diverse set of product offerings, including databases (NoSQL and relational), lambdas, custom virtual machines, etc.
        - We put the onus of maintaining the machines on the cloud provider, while we focus on the code itself 
        - Flexible on choice of technology stack, whether it be Node, Python, Ruby, or others
    - Cons
        - Potentially not free based on usage
        - Tiers could change in pricing, which would potentially lead to maintainability problems and having to find another solution if the current one becomes untenable
        - Each one has a slightly different way of doing things and a learning curve to get up to speed with deploying the app
- Netlify
    - Pros:
        - Free 
        - Fantastic for static sites, especially those generated from Markdown files 
    - Cons:
        - Not as much flexibility for dynamic sites with scripts like the one we want to make 
- iBiblio 
    - Pros:
        - Support the University – as the Tar Heel Reader is a project tied not only in name to the University, this relationship would allow the project priority management by people with a direct interest in its success
        - “A collection of collections” – iBiblio is made for this kind of resource
    - Cons:
        - Our team is not as familiar with this option compared to others
        - May have less control than with another cloud service provider

3. Rationale