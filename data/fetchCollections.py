from requests import Session
from gzip import open as gzip_open
from json import dump


def main():
    idx = 1
    collections = []
    with Session() as sess:
        while True:
            resp = sess.get(
                f'http://test.tarheelreader.org/collections?cpage={idx}&json=1')
            resp_json = resp.json()

            if not resp_json['has_collections']:
                break

            collections = collections + resp_json['collections']

            idx += 1
    
    slugs = [collect['slug'] for collect in collections]

    collections_map = {c['slug'] : c for c in collections}
    
    with Session() as sess:
        for slug in slugs:
            resp = sess.get(f'https://tarheelreader.org/favorites/?collection={slug}&json=1')
            resp_json = resp.json()
            
            books = resp_json['books']

            book_slugs = [b['slug'] for b in books]

            collections_map[slug]['book_slugs'] = book_slugs
    
    with gzip_open('collections.json.gz', "wt", encoding="utf-8") as fp:
        dump(collections_map, fp)
    

    


if __name__ == '__main__':
    main()
