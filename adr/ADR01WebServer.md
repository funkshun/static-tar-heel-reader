# ADR 01: Web Server

0. Summary

Users of the Static Tar Heel Reader, mostly limited to the IT employees who will set up the site for their school or organization, need a way to download the file hierarchy, containing a given subset of books and Tar Heel Reader functionality itself. This download would take the form of a zip file that these employees just have to unpack somewhere in their existing architecture. Future functionality would include extending this base by downloading additional packs and deploying them into the existing infrastructure.

1. Constraints

1. Whatever web server we use to host the download files must be accessible using the current PHP and WordPress framework of the current Tar Heel Reader.
2. Client prefers Nginx.
3. Our choice needs to be open-source and widely accepted, aiding in longevity of the project. One of our first-order principles is longevity and maintainability; the ideal is that future developers will have to do minimal upkeep of the site’s infrastructure.

2. Options
- Nginx
	- Pros:
		- Efficient at serving static resources and can be adapted to dynamic content
		- Code base written mostly by one person – more consistent
		- More lightweight – fewer resources / memory
		- Better scalability
		- Event-driven architecture – thus able to handle more simultaneous connections with low memory footprint
		- More friendly, modern configuration
		- Can also serve as a reverse proxy server
		- Advanced load balancing and caching
		- Free and open source
	- Cons:
		- Code base is written mostly by one person, so less community support
		- Less extensive list of modules
		- Less documentation
- Apache
	- Pros:
		- Greater selection of modules 
		- More widely used – larger community
		- Admin console
		- Configuration of .htaccess file
		- Better for shared hosting
		- Can be used as a reverse proxy server
	- Cons:
		- Under heavy load, consumes more RAM
		- Thread-based model, which can lead to blocking and less efficiency
		- Arcane configuration
- Apache & Nginx: Nginx in front of Apache as a reverse proxy
	- Pros:
		- Allows Nginx to handle client requests (efficiency) and serve static content (which it does best), while proxying the request for dynamic content to Apache 
	- Cons:
		- More complex to understand and set up than using either by themselves 
- LightTPD
	- Pros:
		- “Optimized for speed-critical environments while remaining standards-compliant, secure and flexible”
		- Proof-of-concept for how to handle 10,000 connections in parallel on one server
		- “The low memory footprint (compared to other web servers),  small CPU load and speed optimizations make lighttpd suitable for servers that are suffering load problems, or for serving static media separately from dynamic content.”
		- Popularity with PHP, Python, Ruby, and Lua communities
		- Super light-weight
		- Free and open source
		- Extensive list of features (see [here](https://en.wikipedia.org/wiki/Lighttpd)) 
	- Cons:
		- No built-in WSGI support
- Filezilla
	- Pros: 
		- Widely used
		- Reliable file transfer service
		- Easy, cross-platform FTP client
		- They provide a quick drag-and-drop interface for file transfers
		- Supports SSH file transfer protocols
		- Filezilla provides services from single-users to enterprise level file transfers
	- Cons: 
		- Must log on to a server
		- FTP is becoming outdated now that files can be stored on the cloud
		- Secure types are not the default
	- Why we didn’t
		- Logging onto a server provides another level of complexity that we don’t want. Instead we want to use simple zip file download links.
- Existing architecture
	- Pros:
		- We do not have to set up anything additional that would either have to be interacted with or interact with the existing Tar Heel Reader code and database
		- In this model, scripts and queries could be run that create zip files that would be accessed via a static page on the existing Tar Heel Reader
	- Cons:
		- Not as customizable or configurable
		- We are beholden to the existing WordPress set-up

3. Rationale

For now, we will stick with the existing architecture. We will setup the initial downloads page as a static page with links to zip files that can be downloaded by the user.
