"use strict";

if (typeof Proxy == "undefined") {
    throw new Error("This browser doesn't support Proxy");
}

class CcApi extends HTMLElement {
  constructor() {
    super();

    this.opencount = 0;

    this.ssetimeout = 0;

    this.instanceObjects = {};

    this.callbacknames = [];

    var that = this;

    this.plugins = new Proxy({}, {
      get(target1, name1, receiver1) {
        if (!Reflect.has(target1, name1)) {
          Reflect.set(target1, name1, new Proxy({}, {
            get(target2, name2, receiver2) {
              if (!Reflect.has(target2, name2)) {
                Reflect.set(target2, name2, (...params) => {
                  var headers = {
                    'Content-Type': 'application/json'
                  };
                  if (that.authorizationBearer) {
                    headers["Authorization"] = "Bearer " + that.authorizationBearer;
                  }
                  if (that.authorizationBasic) {
                    headers["Authorization"] = "Basic " + that.authorizationBasic;
                  }
                  return fetch(that._src + "/" + name1 + "/" + name2,  {
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
                        throw response.headers.get("X-Exception").escapeXml();
                      } else {
                        throw 'Network response was not ok';
                      }
                    }
                    return response.json();
                  });
                }, receiver2);
              }
              return Reflect.get(target2, name2, receiver2);
            },
          })
          , receiver1);
        }
        return Reflect.get(target1, name1, receiver1);
      },
    });

    this.callbacks = new Proxy({}, {
      set(target, name, receiver) {
        that.callbacknames.push(name);
        target[name] = receiver;
        return true;
      },
    });
  }

  set src(src) {
    this._src = src;
    this.opencount = 0;
    this.updateEventConnection();
  }

  updateEventConnection() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    var oldAuthorizationBearer = this.authorizationBearer;

    var url = this._src + "/sse/connection";
    if (this.authorizationBearer) {
      url += "?bearer=" + this.authorizationBearer;
    }

    this.eventSource = new EventSource(url);
    this.eventSource.onopen = (event) => {
      this.opencount++;
      this.registerFunctions();
    };

    this.eventSource.onerror = (event) => {
      if (this.opencount == 0 && oldAuthorizationBearer == this.authorizationBearer) {
        return;
      }
      setTimeout(() => {
        this.updateEventConnection();
      }, 1000);
    };

    this.eventSource.onmessage = (event) => {
      this.restartcheck();
      var x = JSON.parse(event.data);
      if (x.customevent > 0) {
        if (this.instanceObjects[x.customevent]) {
          this.instanceObjects[x.customevent].__callEventHandlers(x.event, x.detail);
        }
      }
      if (this.callbacks[x.fnname]) {
        this.callbacks[x.fnname].apply (null, x.params);
      }
    };
    this.restartcheck();
  }

  restartcheck() {
    if (this.ssechecktimeout) {
      clearTimeout(this.ssechecktimeout);
    }
    if (this.ssetimeout > 0) {
      this.ssechecktimeout = setTimeout(() => {
        console.error("SSE timeout!!!");
        this.updateEventConnection();
      }, this.ssetimeout);
    }
  }

  registerFunctions() {
    var headers = {
      'Content-Type': 'application/json'
    };

    if (this.authorizationBearer) {
      headers["Authorization"] = "Bearer " + this.authorizationBearer;
    }
    if (this.authorizationBasic) {
      headers["Authorization"] = "Basic " + this.authorizationBasic;
    }

    fetch(this._src + "/sse/register",  {
      method: 'POST',
      mode: 'cors',
      headers,
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
      try {
        this.eventSource.close();
      } catch (e) {
      }
    }
  }
}

window.customElements.define("cc-api", CcApi);
