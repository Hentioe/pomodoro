import { createStore } from "solid-js/store";

interface GlobalState {
  update: Update | null;
}

const [globalState, setState] = createStore<GlobalState>({
  update: null,
});

function setUpdate(update: Update) {
  setState("update", update);
}

export { globalState, setUpdate };
