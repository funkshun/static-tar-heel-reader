/* Collect state together and allow it to persist */

const version = 6; /* version of the persistent data */

class State {
  public mode: "find" | "choose" | "edit";
  public search = "";
  public reviewed = true;
  public category = "";
  public audience = "E";
  public booksPerPage = 9;
  public pageColor = "#fff";
  public textColor = "#000";
  public buttonSize = "small";
  /* favorites related values */
  public fav = {
    id: 1,
    name: "Favorites",
    bookIds: <string[]>[]
  };
  /* speech related values */
  public speech = {
    voice: "silent",
    rate: 1, // 0.1 to 10
    pitch: 1, // 0 to 2
    lang: "en-US"
  };

  constructor() {
    const state = localStorage.getItem("state");
    const stateParsed = (state && JSON.parse(state)) || {};
    if (stateParsed && stateParsed.version === version) {
      // move parsed state into this
      Object.assign(this, stateParsed);
    }
    this.persist();
  }

  public persist() {
    // clone this and object with version into a new object
    const clonedState = Object.assign({}, this, { version });
    const stateJSON = JSON.stringify(clonedState);
    localStorage.setItem("state", stateJSON);
  }
}

const state = new State();
export default state;
