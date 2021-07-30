"use strict";

if (typeof Proxy == "undefined") {
    throw new Error("This browser doesn't support Proxy");
}

class CcDb extends HTMLElement {
  constructor() {
    super();
    this.callbacknames = [];

    var that = this;

    for(let dbmethod of ["create", "update", "delete", "read", "list"]) {
      this[dbmethod] = new Proxy({}, {
        get(target, name, receiver) {
          if (!Reflect.has(target, name)) {
            Reflect.set(target, name, (param) => {
              var headers = {
                'Content-Type': 'application/json'
              };
              if (that.authorizationBearer) {
                headers["Authorization"] = "Bearer " + that.authorizationBearer;
              }
              if (that.authorizationBasic) {
                headers["Authorization"] = "Basic " + that.authorizationBasic;
              }
              return fetch(that._src + "/" + name + "/" + dbmethod,  {
                method: 'POST',
                mode: 'cors',
                headers,
                cache: 'no-cache',
                credentials: 'same-origin',
                body: JSON.stringify(param)
              })
              .then((response) => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
              });
            }, receiver);
          }
          return Reflect.get(target, name, receiver);
        },
      });
    }
  }

  set src(src) {
    this._src = src;
  }

  connectedCallback() {
    this._src = this.getAttribute("src") || this._src;
  }

  disconnectedCallback() {
  }
}

window.customElements.define("cc-db", CcDb);
