import { reactive } from 'vue';
import { parseData } from './render';

export default function useState({ getContext }) {
  const state = reactive({});

  const setState = data => {
    if (typeof data !== 'object' || data === null) {
      return;
    }

    Object.assign(state, parseData(data, {}, getContext()) || {});
  };
  return {
    state,
    setState,
  };
}
