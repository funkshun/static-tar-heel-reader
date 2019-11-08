"""Generate core of static thr

Experiment with allowing variable base
"""

from gzip import open as gzip_open
from json import load as json_load, dump as json_dump
from mako.template import Template
from mako import exceptions
from os import makedirs
import os.path as osp
from itertools import groupby as itertools_groupby
from shutil import copyfileobj
from re import findall as regex_findall, IGNORECASE
from requests import Session
from nltk.stem.porter import PorterStemmer
from spellchecker import SpellChecker
from contractions import fix as contractions_fix
from pandas import DataFrame
import myArgs
from math import ceil, log
from sqlitedict import SqliteDict
from copypage import CopyPage

args = myArgs.Parse(
    base=16,
    Nselect=100,
    minPages=6,
    maxPages=20,
    out=str,
    query="",
    hasCat=True,
    hasAudience=True,
    lang="en",
    minAppearances=2,
    minWordsPerBook=8,
    maxWordsPerBook=100,
    images="/archives/tarheelreader/production",
    books="data/books.json.gz",
)

cp = CopyPage()

# get all the books
books = json_load(gzip_open(args.books, "rt", encoding="utf-8"))


def render(template, view):
    """Render a template with traceback"""
    try:
        html = Template(template).render(**view)
    except Exception:
        print(exceptions.text_error_template().render())
        raise
    return html


def matchesQuery(book, query):
    """True if the query occurs in the book"""
    return (
        query in book["author"]
        or query in book["title"]
        or any(query in page["text"] for page in book["pages"])
    )


# get the books that qualify
books = [
    book
    for book in books
    # is the specified language (English default)
    if book["language"] == args.lang
    # satisfies the query if any
    and (not args.query or matchesQuery(book, args.query))
    # is categorized
    and (not args.hasCat or len(book["categories"]) > 0)
    # has an audience
    and (not args.hasAudience or book["audience"] in "EC")
    # has enough pages or is reviewed
    and ((args.minPages < len(book["pages"]) < args.maxPages) or book["reviewed"])
]

print('Number of books that qualify: ', len(books))

# break into reviewed and unreviewed
reviewed = [book for book in books if book["reviewed"]][: args.Nselect]
unreviewed = [book for book in books if not book["reviewed"]][: args.Nselect]
# reviewed books come first
selected = reviewed + unreviewed

# activate the spell checkers
spell = SpellChecker()


def getWords(book, stemmer):
    """Return words from the book

    replace contractions
    check spelling
    stem
    """
    words = []
    for page in book["pages"]:
        text = contractions_fix(page["text"])
        text = text.replace("'", "")
        words += [
            stemmer.stem(word).lower()
            for word in regex_findall(r"[a-z]+", text, flags=IGNORECASE)
            if spell.known(words=[word])
        ]
    return set(words)


stemmer = PorterStemmer()

index = []
for book in selected:
    slug = book["slug"]
    words = getWords(book, stemmer)
    for word in words:
        index.append((word, slug))
    for category in book["categories"]:
        index.append((category.upper(), slug))
    if book["audience"] == "C":
        index.append(("CAUTION", slug))


index = DataFrame(index, columns=['word', 'slug'])

print(f'(Words, Slugs): {index.shape}')

# repeat because dropping some might change inclusion of others
slug_set = set(index.slug.unique())
word_set = set(index.word.unique())
i = 0
while True:
    # drop the words that only occur a few times
    booksPerWord = index.groupby("word").slug.count()
    index = index[index.word.isin(
        booksPerWord[booksPerWord > args.minAppearances].index)]

    # drop the books that have too few or too many words
    wordsPerBook = index.groupby("slug").word.count()
    rightSize = (wordsPerBook >= args.minWordsPerBook) & (
        wordsPerBook < args.maxWordsPerBook)
    index = index[index.slug.isin(wordsPerBook[rightSize].index)]

    new_slug_set = set(index.slug.unique())
    new_word_set = set(index.word.unique())
    if len(new_slug_set) == len(slug_set) and len(new_word_set) == len(word_set):
        break
    slug_set = new_slug_set
    word_set = new_word_set

# make the index from words to slugs
wordToSlugs = index.groupby("word").slug.apply(list)
slugs = index.slug.unique()

# only keep the selected books for the rest of the processing
books = [book for book in books if book["slug"] in slugs]
Nbooks = len(books)
Dbooks = int(ceil(log(Nbooks, args.base)))

print(f'Parsed out some books! Now have {Nbooks}, or {Dbooks} (in base {args.base})')

# count the pictures
pictures = set()
for book in books:
    for page in book["pages"]:
        pictures.add(page["url"])
Npictures = len(pictures)
Dpictures = int(ceil(log(Npictures, args.base)))

print(f'Number of pictures: {Npictures}, or {Dpictures} (in base {args.base})')

OUT = args.out
CONTENT = osp.join(OUT, "content")


def make_pageid(i):
    """return the fragment for the page"""
    return f"p{i}"


# these must be in collation order
encoding = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"


def encode(value, digits):
    """Encode an integer into a string"""
    r = []
    base = args.base
    for _ in range(digits):
        r.append(encoding[value % base])
        value //= base
    return "".join(r[::-1])


# map slugs to ids
bookmap = {}


def make_bookid(slug):
    """get unique id for a book"""
    if slug not in bookmap:
        num_books = len(bookmap)
        res_encode = encode(num_books, Dbooks)
        # *list makes the file structure first_digit/second_digit/...last_digit.html
        path = osp.join(CONTENT, *list(res_encode)) + ".html"
        bookmap[slug] = (res_encode, path)
    return bookmap[slug]


# map image URL to new name
makedirs(OUT, exist_ok=True)
imagemap = SqliteDict(osp.join(OUT, "imagemap.sd"), autocommit=True)


def imgurl(url, bid, bpath, session):
    """localize and return full image url for a picture"""
    if url in imagemap:
        path = imagemap[url]
    else:
        num_pictures = len(imagemap)
        res_encode = encode(num_pictures, Dpictures)
        path = osp.join(CONTENT, *res_encode) + ".jpg"
        makedirs(osp.dirname(path), exist_ok=True)
        resp = session.get("http://tarheelreader.org" + url, stream=True)
        with open(path, 'wb') as f:
            resp.raw.decode_content = True
            copyfileobj(resp.raw, f)
        imagemap[url] = path
    return osp.relpath(path, osp.dirname(bpath))


# write the books copying the images
ndx = []
template = open("src/book.mako").read()
lastReviewed = None

book_css = osp.join(OUT, cp.copy("book.css"))
book_js = osp.join(OUT, cp.link("book.js"))

for progress, book in enumerate(books):
    bid, bpath = make_bookid(book["slug"])
    if progress % 100 == 0:
        print(f"Template making progress: {progress}, book ID {bid}, book path {bpath}")
    icons = []
    if book["audience"] == "C":
        icons.append("C")
    if book["reviewed"]:
        icons.append("R")
        lastReviewed = bid
    last = bid
    ipath = osp.join(osp.dirname(bpath), "index.html")
    sess = Session()
    ndx.append(
        dict(
            title=book["title"],
            author=book["author"],
            pages=len(book["pages"]),
            image=imgurl(book["pages"][0]["url"], bid, bpath, sess),
            icons=" ".join(icons),
            id=bid,
            link=bid[-1],
            path=ipath,
        )
    )
    view = dict(start="#" + make_pageid(1),
                title=book["title"], index=f"./#{bid}")
    pages = [
        dict(
            title=book["title"],
            author=book["author"],
            image=imgurl(book["pages"][1]["url"], bid, bpath, sess),
            id=make_pageid(1),
            back=view["index"],
            next="#" + make_pageid(2),
        )
    ]
    for i, page in enumerate(book["pages"][1:]):
        pageno = i + 2
        pages.append(
            dict(
                pageno=pageno,
                id=make_pageid(pageno),
                image=imgurl(page["url"], bid, bpath, sess),
                text=page["text"],
                back="#" + make_pageid(pageno - 1),
                next="#" + make_pageid(pageno + 1),
            )
        )
    pages[-1]["next"] = "#done"
    view["pages"] = pages
    view["bid"] = bid
    view["css"] = osp.relpath(book_css, osp.dirname(bpath))
    view["js"] = osp.relpath(book_js, osp.dirname(bpath))

    html = render(template, view)
    makedirs(osp.dirname(bpath), exist_ok=True)
    with open(bpath, "wt", encoding="utf-8") as fp:
        fp.write(html)

print("Last Reviewed", lastReviewed)

# write the index.htmls
idxtemplate = open("src/book-index.mako").read()
idxpaths = sorted(set(b["path"] for b in ndx))
start = osp.join(CONTENT, "index.html")
back = start
i = 1
for path, group in itertools_groupby(ndx, lambda v: v["path"]):
    view = dict(
        name="index",
        books=group,
        back=osp.relpath(back, osp.dirname(path)),
        next=osp.relpath(idxpaths[i] if i < len(idxpaths)
                         else start, osp.dirname(path)),
        css=osp.relpath(osp.join(OUT, "index.css"), path),
    )
    with open(path, "wt", encoding="utf-8") as fp:
        fp.write(render(idxtemplate, view))
    back = path
    i += 1

# write the word indexes
WOUT = osp.join(CONTENT, "index")
makedirs(WOUT, exist_ok=True)

for word, slugs in wordToSlugs.iteritems():
    if len(word) < 3:
        continue
    # bookmap[slug] is a tuple whose structure is (book ID, book path)
    ids = sorted([bookmap[slug][0] for slug in slugs])
    with open(osp.join(WOUT, word), "wt", encoding="utf-8") as fp:
        fp.write("".join(ids))

# make sure CAUTION exists
with open(osp.join(WOUT, "CAUTION"), "at", encoding="utf-8") as fp:
    fp.write("")

# write the AllAvailable file
with open(osp.join(WOUT, "AllAvailable"), "wt", encoding="utf-8") as fp:
    # first-last
    fp.write("%s-%s" % ("0" * Dbooks, last))

# write out a list of the images for possible prefetch...
with open(osp.join(CONTENT, "images.json"), "wt", encoding="utf-8") as fp:
    json_dump([osp.relpath(path, OUT) for path in imagemap.values()], fp)

# record parameters needed by the js
config = {
    "base": args.base,
    "digits": Dbooks,
    "first": "0" * Dbooks,
    "lastReviewed": lastReviewed,
    "last": last,
}
print (f'Configuration Parameters: {config}')
with open(osp.join(CONTENT, "config.json"), "wt") as fp:
    json_dump(config, fp)
