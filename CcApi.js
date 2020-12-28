"use strict";

if (typeof Proxy == "undefined") {
    throw new Error("This browser doesn't support Proxy");
}

class CcApi extends HTMLElement {
  constructor() {
    super();
    this.callbacknames = [];

    var that = this;

    this.methods = new Proxy({}, {
      get(target, name, receiver) {
        if (!Reflect.has(target, name)) {
          Reflect.set(target, name, (...params) => {
            var headers = {
              'Content-Type': 'application/json'
            };
            if (that.authorizationBearer) {
              headers["Authorization"] = "Bearer " + that.authorizationBearer;
            }
            if (that.authorizationBasic) {
              headers["Authorization"] = "Basic " + that.authorizationBasic;
            }
            return fetch(that._src + "/method/" + name,  {
              method: 'POST',
              mode: 'cors',
              headers,
              cache: 'no-cache',
              credentials: 'same-origin',
              body: JSON.stringify(params)
            })
            .then((response) => {
              if (!response.ok) {
                if (response.headers.has("X-Exception")) {
                  throw new Error(response.headers.get("X-Exception"));
                } else {
                  throw new Error('Network response was not ok');
                }
              }
              return response.json();
            });
          }, receiver);
        }
        return Reflect.get(target, name, receiver);
      },
    });

    this.callbacks = new Proxy({}, {
      set(target, name, receiver) {
        that.callbacknames.push(name);
        target[name] = receiver;
        that.registerFunctions();
        return true;
      },
    });
  }

  set src(src) {
    this._src = src;
    this.updateEventConnection();
  }

  updateEventConnection() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    var url = this._src + "/sse/connection";
    if (this.authorizationBearer) {
      url += "?bearer=" + this.authorizationBearer;
    }

    this.eventSource = new EventSource(url);
    this.eventSource.onmessage = (event) => {
      var x = JSON.parse(event.data);
      if (this.callbacks[x.fnname]) {
        this.callbacks[x.fnname].apply (null, x.params);
      }
    };
  }

  registerFunctions() {
    fetch(this._src + "/sse/register",  {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-cache',
      credentials: 'same-origin',
      body: JSON.stringify(this.callbacknames)
    })
    .then((response) => {
      if (!response.ok) {
        if (response.headers.has("X-Exception")) {
          throw new Error(response.headers.get("X-Exception"));
        } else {
          throw new Error('Network response was not ok');
        }
      }
      return response.json();
    });
}

  connectedCallback() {
    this._src = this.getAttribute("src") || this._src;
    this.updateEventConnection();
  }

  disconnectedCallback() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}

window.customElements.define("cc-api", CcApi);
