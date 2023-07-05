//function secureListeners() {
// protect all methods, properties, getters, setters, submethods and so on deep clone object.
//}
class DistincWeakMap extends IterableWeakMap {
  _length = 0;
  set(key, obj) {
    if (IterableWeakMap.prototype.has.call(this, key)) {
      throw new Error("Used yet");
    }
    const res = IterableWeakMap.prototype.set.call(this, key, obj);
    this._length++;
    return res;
  }
  delete(key) {
    const res = IterableWeakMap.prototype.delete.call(this, key);
    this._length--;
    return res;
  }
  get length() {
    return this._length;
  }
}
const DOMSecure = (() => {
  const list = new DistincWeakMap();
  const module = {};
  module.restoreSecureElements = function () {
    console.log(list.entries());
    list.entries().forEach((s) => s.tick());
  };
  module.updateSecureElements = function () {
    list.entries().forEach((s) => s.protect());
  };
  module.SecureElements = function () {
    list.entries().forEach((s) => s.protect());
  };
  module.SecureElement = class {
    constructor(id, promise) {
      this.id = id;
      this.init = true;
      Promise.resolve(promise).then(this.protect.bind(this));
    }
    protect() {
      this.init = false;
      this.el = document.getElementById(this.id);
      this.data = this.inspect();
      if (this.init) {
        if (list.has(this.el)) {
          throw new Error("It is already secured");
        }
        list.set(this.el, this);
      }
    }
    ref() {
      const oldEl = el;
      this.el = document.getElementById(this.id);
      list.delete(oldEl);
      list.set(this.el, this);
    }
    inspect() {
      this.html = this.el.innerHTML; // dirt
      let nodes = [],
        values = [];
      let att;
      const atts = this.el.attributes;
      for (let i = 0; i < atts.length; i++) {
        att = atts[i];
        nodes.push(att.nodeName);
        values.push(att.nodeValue);
      }
      return { nodes, values };
    }
    tick() {
      let att;
      for (let i = 0; i < this.data.nodes.length; i++) {
        att = {
          nodeName: this.data.nodes[i],
          nodeValue: this.data.values[i],
        };
        this.el[att.nodeName] = att.nodeValue;
      }
      this.el.innerHTML = this.html;
    }
  };
  Element.prototype.protect = function (promise) {
    this.id = `dom_secured-${list.length}`;
    return new module.SecureElement(this.id, promise);
  };
  return module;
})();

Object.keys(DOMSecure).forEach(
  (key) => (window[key] = Object.freeze(DOMSecure[key]))
);
