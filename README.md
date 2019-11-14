# Static Tar Heel Reader

The current Tarheel Reader, while popular and stable, is built on a software stack that makes longevity difficult to guarantee. This project will create a static offline version to provide a consistent experience and to make the Reader available where web apps create infrastructural or privacy concerns. Ideally, the Static Reader will allow a broader audience to access the content and enable user contributions, thereby ensuring its continued relevance.

For more information, please see our [website](https://tarheelreader.web.unc.edu).

## Getting Started

Before working with this project, please ensure that you have [NodeJS](https://nodejs.org/en/) and [Python 3](https://www.python.org/) installed on your system. As this project uses `make` for its build and run scripts, it is recommended that you work with it on a \*nix system (Windows users can use these [instructions](https://docs.microsoft.com/en-us/windows/wsl/install-win10) to install their favorite Linux system).

Next, it is recommended that you create a virtual environment (`python3 -m venv [virtual-environment-name]`) and install the Python dependencies in your virtual environment (to activate, on \*nix systems, including MacOS, run `source [virtual-environment-name]/bin/activate`) with the command `pip install -r requirements.txt`. Note that if you want to deactivate your virtual environment, starting it provides you with a script to do just that: just type `deactivate`.

To install Node dependencies, just type `npm install`. You can use the Node package manager's capabilities to upgrade and install packages as you see fit.

Finally, as long as you have `make` installed, run `make install-dev` to install the necessary global Node packages to your system.

Now that everything is installed, you can start getting to work! First, you need to get the Tar Heel Reader's books. To fetch `n` books, run the command `make fetch n`. This will get books and place them in `data/books.json.gz`. Note that the fetching may take a while!

Now that you have the books, you can now generate a subset with index terms (for searching) and HTML pages for viewing. For this purpose, run `python generate.py` (or `python3 generate.py` if you are not inside a virtual environment as demonstrated above). By default, this generates the Static Tar Heel Reader system in a folder called `dist` with 100 reviewed and 100 unreviewed books. For more information on possible command line arguments for `generate.py`, please see the file itself. These include `Nselect` for getting a bigger subset, `out` for using a different directory, `query` for generating a subset based on a query in the book, title, or author, and many more.

Now that the subset has been generated, run the command `make run-local`. You should now be able to navigate to `localhost:8000` and see the Static Tar Heel Reader!

Note that you can look in `Makefile` and see the exact commands run for its various commands if you want more control over the commands that you are using.

These instructions were last tested by Taylor Smith on 14 November 2019 on an Ubuntu distribution running on Windows Subsystem for Linux.

## More Details on Layout

A version of [Tar Heel Reader](https://tarheelreader.org) that needs no logic on the server; simply serving files will be sufficient. I fantasize that requiring very little maintenance will allow it to outlive me.

The script `generate.py` produces the pages in a hierarchy of directories. Each book is assigned an ID using a fixed number of digits in the base you specify. I'm thinking of using base 36 to avoid case sensitivity. The generated tree looks like this for a tiny set of 200 books with base 16.

```bash
./
  index.html - a welcome page
  find.html  - search for books
  *.css      - style sheets
  *.js       - javascript generated from the typescript
  content/
    config.json - info the client code needs
    0/
      index.html - list of cover pages for books at this level
      0.html     - the html for book with id 00
      1.html
      ...
      0/
  0.jpg    - image 000
  1.jpg
  ...
    1/ - same as above
    ...
    index/
      boy -- list of book ids that contain 'boy'. The content looks like:
        1A293648596E... -- boy is in 6 books each represented by 2 digits
      ...
```

I'm not convinced this layout is great; it is literally the first thing I thought of. I like that the files are distributed through the tree so that no level has too many files.

The index.html files are linked together so you can walk the collection starting from the root. This should allow search engines and users without JavaScript enabled to access the site.

I am assuming the IDs in these index files are in ascending order. Currently, I have reviewed books first followed by unreviewed in order they were created.

## Testing

To run the test suite, run the command `make test`. This runs the command `jest test --coverage`, which both runs the jest test (`*.test.ts` files) and generates a coverage report. However, note that unit testing is only one part of a broader testing framework. See [this page](http://tarheelreader.web.unc.edu/test-coverage-report/) for a more complete discussion of this site's testing.

## Deployment  

???

## Technologies Used

This project is a Progressive Web App designed for modern web browsers, but it also aims to be easily transportable across different web server architectures, operating systems, and more. As such, we do not use any fancy web frameworks like React or Angular, instead opting for a system with HTML5, CSS3, and TypeScript (utilizing modern ES6 features), which transpiles into non-minified JavaScript. For our scripts, we have chosen Python 3, which gives a massive ecosystem of packages which allow us to perform such functions as asynchronously feteching books, building HTML5 files from Mako templates, and more. For our architecture design records (ADRs), please see the folder.

## Contributing

In order to contribute to this project, merely pull this project from GitHub ([Main](https://github.com/gbishop/static-tar-heel-reader), [Fork](https://github.com/funkshun/static-tar-heel-reader)) and get to work! There are no centralized style conventions in terms of format, but developers are expected to utilize the capabilities of modern technologies (including arrow functions, asynchronous TypeScript functions, and more) in writing their code. Please always keep in mind that a first principle of this project is designing for accessibility; as such, this must always be on the mind of a developer when making any change to the frontend look and systems. Unit tests must be written for any core functional modules (such as `BookSet`). Otherwise, please follow the testing guidelines laid out [here](http://tarheelreader.web.unc.edu/test-coverage-report).  

For more background information, see our [site](http://tarheelreader.web.unc.edu)!

## Authors

- Dr. Gary Bishop ([Github](https://github.com/gbishop), [Site](https://www.cs.unc.edu/~gb/))
- [Boo Fullwood](https://github.com/funkshun)
- [Taylor Smith](https://github.com/tas12740)
- [Selina Zhang](https://github.com/selina98)

## License

Copyright 2019 University of North Carolina at Chapel Hill

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Acknowledgments

The authors of the Static Tar Heel Reader would like to thank Dr. Gary Bishop for his unwavering commitment to the Tar Heel Reader across its lifespan and to the millions of students and readers who have read its books; Michelle Farmer for her mentorship and invaluable advice and insight throughout this project; and Dr. Jeff Terrell, for his tutorship in the class COMP523 at UNC-Chapel Hill.
