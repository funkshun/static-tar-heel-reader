const load_collections = async () => {
    const resp = await fetch('collections/ALL');
    if (resp.ok) {
        const text: string = await resp.text();
        const items = text.split(' ');
        const collections = document.getElementById('collections');
        for (let item of items) {
            const [slug, title] = item.split(',');
            // const entry = document.createElement('li');

            const link = document.createElement('a');
            link.setAttribute('href', 'collections/' + slug + '.html');
            link.appendChild(document.createTextNode(title.split('-').join(' ')));

            // entry.appendChild(link);

            collections.appendChild(link);
        }
    }
}

const init = async () => {
    load_collections();
}

window.addEventListener('load', init);