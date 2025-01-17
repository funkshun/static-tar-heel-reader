/*
 * get the string from the search box
 * split it into words
 * stem them and toss any we should ignore
 * for each word
 *   fetch the index and split it into ids
 * intersect the arrays of ids
 * for each id in the intersection
 *   get the index entry
 *   add it to the page
 *   quit and remember where we are if we have enough
 */

interface Config {
  base: number; // base of the encoding used for ids
  digits: number; // number of digits in each id
  lastReviewed: string; // id of last reviewed book
  first: string; // id of first book
  last: string; // id of last book
}

// load this down below in init
let config: Config;

// persistant state
import state from "./state.js";
// porter2 stemmer
import { stem } from "./web_modules/stemr.js";

import swipe from "./swipe.js";

import { registerServiceWorker } from "./start-sw.js";

import {
  BookSet,
  BookSetModel
} from "./BookSet.js";

import speak from "./speech.js";

import { openDB, DBSchema } from "./web_modules/idb.js";

interface ICover {
  id: string;
  html: string;
}

interface CoverDB extends DBSchema {
  covers: {
    key: string;
    value: ICover;
  };
}

function getQueryTerms(): string[] {
  const searchBox = document.querySelector("#search") as HTMLInputElement;
  const query = searchBox.value.toLowerCase();
  // get all words longer than 3 characters (matches the index generation process)
  const pattern = /[a-z]{3,}/gi;
  let match;
  if (query.length && (match = query.match(pattern))) {
    // stem all the matching words from the search query
    return match.map(stem);
  } else {
    return [];
  }
}

async function getIndexForTerm(term: string): Promise<BookSet | null> {
  const resp = await fetch("content/index/" + term);

  if (resp.ok) { // i.e. if the term exists in our index
    const text = await resp.text();
    return new BookSetModel(text, config.digits, config.base);
  }

  // term is not in the index - maybe it's a substring?
  const respAll = await fetch("content/index/ALLWORDS");
  if (respAll.ok) {
    const text: string = await respAll.text();
    const words: string[] = text.split(' ');
    const substrings: string[] = words.filter(word => word.indexOf(term) >= 0);
    let result: BookSet = null;
    for (let str of substrings) {
      const respTerm = await fetch('content/index/' + str);
      const books = await respTerm.text();
      const currBook = new BookSetModel(books, config.digits, config.base);
      if (result == null) {
        result = currBook;
      } else {
        result.intersect(currBook);
      }
    }
    return result;
  }

  return null;
}

async function getBookCover(bid: string): Promise<HTMLElement | null> {
  // get the prefix of the path for this index
  const prefix =
    "content/" +
    bid
      .split("")
      .slice(0, -1) // slice everything but the last part (makes sense since getting relative path prefix)
      .join("/") +
    "/";
  const db = await openDB<CoverDB>("Covers", 1, {
    upgrade(db) {
      db.createObjectStore("covers", {
        keyPath: "id"
      });
    }
  });
  // see if we have it in the db
  const itemEntry = await db.get("covers", bid);
  let item = null;
  if (!itemEntry) {
    // fetch the index
    const resp = await fetch(prefix + "index.html");
    // get the html
    const html = await resp.text();
    // parse it
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    // cache all the items from this page
    const tx = db.transaction("covers", "readwrite");
    for (const li of doc.querySelectorAll("li")) {
      if (li.id === bid) {
        item = <HTMLElement>li;
      }
      tx.store.add({ id: li.id, html: li.outerHTML });
    }
    await tx.done;
  } else {
    const parser = new DOMParser();
    const doc = parser.parseFromString(itemEntry.html, "text/html");
    item = doc.getElementById(bid);
  }
  if (item) {
    // fix the image URL
    const img: HTMLImageElement = item.querySelector("img");
    img.setAttribute("src", prefix + img.getAttribute("src"));
    // fix the link URL
    const link: HTMLAnchorElement = item.querySelector("a");
    link.setAttribute("href", prefix + link.getAttribute("href"));
    // add the favorites indicator
    if (state.fav.bookIds.indexOf(bid) >= 0) {
      item.classList.add("F");
    }
  }
  return item;
}

let ids: BookSet;
const pages = <string[][]>[];
let page = 0;

async function find() {
  if (state.mode === "choose" || state.mode === "edit") {
    ids = new BookSetModel(state.fav.bookIds.join(''), config.digits, config.base);
  } else {
    let terms = getQueryTerms();
    if (state.category) {
      terms.push(state.category);
      // put category before pushing AllAvailable so that if category is empty we 
      // return an empty subset intead of full list
    }
    if (state.audience == "C") {
      terms.push("CAUTION");
    }
    if (terms.length == 0) {
      terms.push("AllAvailable");
    }

    console.log('Terms: ' + terms);

    // reset page on find (in case someone enters a find while on page 2, etc.)
    page = 0;

    let tsets = await Promise.all(terms.map(getIndexForTerm));
    ids = tsets.reduce((p, c) => {
      if (!p) {
        return c;
      } else if (!c) {
        return p;
      }
      p.intersect(c);
      return p;
    });

    if (!ids) {
      ids = new BookSetModel('', config.digits, config.base);
    }

    if (state.reviewed) {
      ids.limit(config.lastReviewed);
    }
    if (state.audience == "E") {
      const caution = await getIndexForTerm("CAUTION");
      ids.difference(caution);
    }
  }

  const sortBox: HTMLSelectElement = document.getElementById('sort') as HTMLSelectElement;
  const sortValue = sortBox.options[sortBox.selectedIndex].value;

  const arrowValue = document.getElementById('arrow').getAttribute('value');

  await ids.sort(sortValue, arrowValue == '↓');

  console.log(ids);

  // clear the pages before building them again
  pages.length = 0;
  const values = ids.values;
  let curr = 0, size = state.booksPerPage;
  let currSlice;
  while ((currSlice = values.slice(curr, curr + size))) {
    if (currSlice.length == 0) break;
    pages.push(currSlice);
    curr += size;
  }

  console.log(pages);

  // displayedIds.length = 0;

  if (location.hash) {
    // if the URL is followed by a # (e.g. #p1)
    const backFrom = location.hash.slice(1);
    console.log("skipping to", backFrom);
    // configure things so we're on the page with the current book
    const size = pages.length;
    for (let i = 0; i < size; i++) {
      const index = pages[i].indexOf(backFrom);
      if (index != -1) {
        page = i;
        break;
      }
    }
  }
  return render();
}

async function render() {
  // clear the old ones from the page
  const list = document.querySelector("ul");
  let last;
  while ((last = list.lastChild)) list.removeChild(last);

  // determine where to start
  if (pages.length > 0) {
    const booksToShow = pages[page];
    const numBooks = booksToShow.length;
    for (let i = 0; i < numBooks; i++) {
      const book = await getBookCover(booksToShow[i]);
      list.appendChild(book);
    }
    state.persist();
  }

  // visibility of back and next buttons
  document.querySelector("#back").classList.toggle("hidden", page <= 0);
  document
    .querySelector("#next")
    .classList.toggle("hidden", page == pages.length - 1 || pages.length == 0);
}

function updateState(): void {
  const form: HTMLFormElement = document.querySelector("form");
  state.search = form.search.value;
  state.reviewed = form.reviewed.value == "R";
  state.category = form.category.value;
  state.audience = form.audience.value;
}

/* allow switch (keyboard) selection of books */
function moveToNext() {
  // get the currently selected if any
  let selected = document.querySelector(".selected");
  // get all the items we can select
  const selectable = document.querySelectorAll(
    "li, a#back:not(.hidden), a#next:not(.hidden)"
  );
  // assume the first
  let next = 0;
  // if was selected, unselect it and compute the index of the next one
  if (selected) {
    selected.classList.remove("selected");
    // have to do this funky thing b/c selectable does not have an indexOf method
    // essentially this calls selectable.indexOf(selected)
    next = ([].indexOf.call(selectable, selected) + 1) % selectable.length;
  }
  selected = selectable[next];
  // mark the new one selected
  selected.classList.add("selected");
  // make sure it is visible
  selected.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "nearest"
  });
  const h1 = selected.querySelector("h1");
  if (h1) {
    speak(h1.innerText);
  } else {
    speak((selected as HTMLElement).innerText);
  }
}

/* click the currently selected link */
function activateCurrent(e: KeyboardEvent) {
  const selected: HTMLAnchorElement = document.querySelector(
    ".selected a, a.selected"
  );
  if (selected) {
    e.preventDefault();
    selected.click();
  }
}

/* toggle favorite on currently selected book */
function toggleFavorite(selected: HTMLElement) {
  if (selected) {
    const bid = selected.id;
    const ndx = state.fav.bookIds.indexOf(bid);
    if (ndx >= 0) {
      state.fav.bookIds.splice(ndx, 1);
      selected.classList.remove("F");
    } else {
      state.fav.bookIds.push(bid);
      state.fav.bookIds.sort();
      selected.classList.add("F");
    }
    state.persist();
  }
}

function flip(selected: HTMLElement) {
  const value = selected.getAttribute('value');
  if (value == "↑") {
    selected.setAttribute('value', '↓');
  } else {
    selected.setAttribute('value', '↑');
  }

  ids.reverse();

  // clear the pages before building them again
  pages.length = 0;
  const values = ids.values;
  let curr = 0, size = state.booksPerPage;
  let currSlice;
  while ((currSlice = values.slice(curr, curr + size))) {
    if (currSlice.length == 0) break;
    pages.push(currSlice);
    curr += size;
  }
  render();
}

async function init() {
  /* restore page and text color */
  document.documentElement.style.setProperty("--page-color", state.pageColor);
  document.documentElement.style.setProperty("--text-color", state.textColor);
  document.body.setAttribute("data-buttonsize", state.buttonSize);

  /* fetch configuration for the content */
  config = await (await fetch("content/config.json")).json();

  /* register service worker. */
  registerServiceWorker();

  const form = document.querySelector("form");
  if (form) {
    if (state.mode !== "edit") state.mode = "find";

    /* handle searches */
    form.addEventListener("submit", e => {
      e.preventDefault();
      updateState();
      state.mode = "find";
      state.persist();
      find();
    });

    /* restore the search form values */
    form.search.value = state.search;
    form.reviewed.value = state.reviewed ? "R" : "";
    form.category.value = state.category;
    form.audience.value = state.audience;
    form.sort.value = state.sortValue;
  } else {
    state.mode = "choose";
    document.querySelector("h1.title").innerHTML = state.fav.name;
  }

  /* add listener for click on arrow */
  const arrow = document.getElementById('arrow');
  arrow.addEventListener('click', e => {
    e.preventDefault();
    flip(e.target as HTMLElement);
  });

  document.getElementById('sort').addEventListener('change', e => {
    const target = e.target as HTMLSelectElement;
    const sortValue = target.options[target.selectedIndex].value;
    state.sortValue = sortValue;
    state.persist();
  })

  /* enable stepping through pages of results */
  document.querySelector("#next").addEventListener("click", e => {
    e.preventDefault();
    (e.target as HTMLElement).classList.remove("selected");
    page += 1;
    render();
  });

  document.querySelector("#back").addEventListener("click", e => {
    e.preventDefault();
    (e.target as HTMLElement).classList.remove("selected");
    page -= 1;
    render();
  });

  /* enable swiping through results */
  swipe(direction => {
    const selector =
      direction == "right" ? "a.back:not(.hidden)" : "a.next:not(.hidden)";
    const link: HTMLAnchorElement = document.querySelector(selector);
    if (link) link.click();
  });

  /* switch control based on keys */
  window.addEventListener("keydown", e => {
    const target = e.target as HTMLElement;
    if (target.matches("input,select,button")) {
      return;
    }
    if (e.key == "ArrowRight" || e.key == "Space") {
      e.preventDefault();
      moveToNext();
    } else if (e.key == "ArrowLeft" || e.key == "Enter") {
      activateCurrent(e);
    } else if (e.key == "f" && state.mode == "find") {
      const selected: HTMLAnchorElement = document.querySelector("li.selected");
      toggleFavorite(selected);
    }
  });

  /* toggle favorite using the mouse in favorite selection mode */
  document.querySelector("#list").addEventListener("click", e => {
    const t = e.target as HTMLElement;
    if (t.matches("#list li")) {
      toggleFavorite(t);
    }
  });

  /* toggle favorite selection mode */
  const heart = document.querySelector("#heart");
  if (heart) {
    heart.addEventListener("click", () => {
      document.body.classList.toggle("hearts");
    });
  }

  find();
}

window.addEventListener("load", init);
