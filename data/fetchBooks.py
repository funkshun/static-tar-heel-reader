"""fetch all the thr books"""
import requests
from sqlitedict import SqliteDict
import gzip
import json
import sys



def fetch_books(start=1, stop=2, search="", cat="", reviewed="", audience="", lang=""):
    books = SqliteDict("allbooks.sqlite", autocommit=True)
    with requests.Session() as s:
        for page in range(int(start), int(stop)):
            sys.stdout.write(f"Page: {page}\r")
            url = (
                "http://test.tarheelreader.org/find/"
                f"?search={search}&category={cat}&reviewed={reviewed}&audience={audience}&language={lang}&"
                f"page={page}&json=1"
            )
            resp = s.get(url)
            r = resp.json()
            for b in r["books"]:
                if b["slug"] in books:
                    continue
                if b["author"] != "DLM":
                    continue
                url = "http://test.tarheelreader.org/book-as-json/" f'?slug={b["slug"]}'
                resp = s.get(url)
                book = resp.json()
                books[b["slug"]] = book
                if not r["more"]:
                    break
    return books

def main():

    args = parse_args()
    books = fetch_books(**args)
    rows = sorted(books.values(), key=lambda b: b["ID"])
    with gzip.open(sys.argv[1], "wt", encoding="utf-8") as fp:
        json.dump(rows, fp)

def parse_args():
    args = {}
    for a in sys.argv[2:]:
        xs = a.split("=")
        if len(xs) != 2:
            sys.exit(1)
        else:
            args[xs[0]] = xs[1]

    return args

if __name__ == "__main__":
    main()
