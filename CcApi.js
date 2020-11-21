"use strict";
if (typeof Proxy == "undefined") {
    throw new Error("This browser doesn't support Proxy");
}

class CcApi extends HTMLElement {
  constructor() {
    super();
    var that = this;
    this.methods = new Proxy({}, {
      get(target, name, receiver) {
        if (!Reflect.has(target, name)) {
          Reflect.set(target, name, (...params) => {
            return fetch(that._src + "/method/" + name,  {
              method: 'POST',
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json'
              },
              cache: 'no-cache',
              credentials: 'same-origin',
              body: JSON.stringify(params)
            })
            .then((response) => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              response.json()
            });
          }, receiver);
        }
        return Reflect.get(target, name, receiver);
      },
    });
  }

  set src(src) {
    this._src = src;
  }

  connectedCallback() {
    this._src = this.getAttribute("src") || this._src;
/*    fetch(src + "/api.json",  {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
    })
    .then((response) => response.json())
    .then((json) => {
      for(var name in json) {
        this.methods[name] = (...params) => {
          return fetch(src + "/method/" + name,  {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
            cache: 'no-cache',
            credentials: 'same-origin',
            body: JSON.stringify(params)
          })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            response.json()
          });
        };
      }
    })
    .catch(() => {});
    */
  }

  disconnectedCallback() {
  }
}

window.customElements.define("cc-api", CcApi);
