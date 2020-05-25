export class Listener {
  constructor() {
    this.callbacks = [];
  }

  add(callback) {
    this.callbacks.push(callback);
  }

  consume(...args) {
    this.callbacks.forEach(async callback => callback(...args));
    this.callbacks = [];
  }
}
