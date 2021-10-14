"use strict";

if (typeof Proxy == "undefined") {
    throw new Error("This browser doesn't support Proxy");
}

class CcApi extends HTMLElement {
  constructor() {
    super();

    this.instanceObjects = {};

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
                  throw response.headers.get("X-Exception");
                } else {
                  throw 'Network response was not ok';
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
//        that.registerFunctions();
        return true;
      },
    });
  }

  fetchInstanceProperty(that, instance_no, name) {
    return new Promise((resolve, reject) => {
      var headers = {
        'Content-Type': 'application/json'
      };
      if (that.authorizationBearer) {
        headers["Authorization"] = "Bearer " + that.authorizationBearer;
      }
      if (that.authorizationBasic) {
        headers["Authorization"] = "Basic " + that.authorizationBasic;
      }
      headers["X-InstanceNo"] = instance_no;

      fetch(that._src + "/instance_get/" + name,  {
        method: 'POST',
        mode: 'cors',
        headers,
        cache: 'no-cache',
        credentials: 'same-origin',
        body: ``
      })
      .then((response) => {
        if (response.headers.has("X-PropertyType")) {
          switch (response.headers.get("X-PropertyType")) {
            case "function":
              resolve ((...params) => {
                var headers = {
                  'Content-Type': 'application/json'
                };
                if (that.authorizationBearer) {
                  headers["Authorization"] = "Bearer " + that.authorizationBearer;
                }
                if (that.authorizationBasic) {
                  headers["Authorization"] = "Basic " + that.authorizationBasic;
                }
                return new Promise((resolve3, reject3) => {
                  fetch(that._src + "/instance_call/" + name,  {
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
                        throw response.headers.get("X-Exception");
                      } else {
                        throw 'Network response was not ok';
                      }
                    }
                    resolve3(response.json());
                  })
                  .catch((e) => {
                    reject3(e);
                  });
                });
              });
            case "json":
              resolve (response.json());
          }
        } else if (response.headers.has("X-Exception")) {
          throw response.headers.get("X-Exception");
        } else {
          throw 'Network response was not ok';
        }
      });
    });

  }

  setInstanceProperty(that, instance_no, name, value) {
    return new Promise((resolve, reject) => {
      var headers = {
        'Content-Type': 'application/json'
      };
      if (that.authorizationBearer) {
        headers["Authorization"] = "Bearer " + that.authorizationBearer;
      }
      if (that.authorizationBasic) {
        headers["Authorization"] = "Basic " + that.authorizationBasic;
      }
      headers["X-InstanceNo"] = instance_no;

      fetch(that._src + "/instance_set/" + name,  {
        method: 'POST',
        mode: 'cors',
        headers,
        cache: 'no-cache',
        credentials: 'same-origin',
        body: JSON.stringify([value]),
      })
      .then((response) => {
        if (!response.ok) {
          if (response.headers.has("X-Exception")) {
            throw response.headers.get("X-Exception");
          } else {
            throw 'Network response was not ok';
          }
        }
        resolve(response.json());
      });
    });

  }

  jsonInstanceProperty(that, instance_no) {
    return new Promise((resolve, reject) => {
      var headers = {
        'Content-Type': 'application/json'
      };
      if (that.authorizationBearer) {
        headers["Authorization"] = "Bearer " + that.authorizationBearer;
      }
      if (that.authorizationBasic) {
        headers["Authorization"] = "Basic " + that.authorizationBasic;
      }
      headers["X-InstanceNo"] = instance_no;

      fetch(that._src + "/instance_json/",  {
        method: 'POST',
        mode: 'cors',
        headers,
        cache: 'no-cache',
        credentials: 'same-origin',
        body: '',
      })
      .then((response) => {
        if (!response.ok) {
          if (response.headers.has("X-Exception")) {
            throw response.headers.get("X-Exception");
          } else {
            throw 'Network response was not ok';
          }
        }
        resolve(response.json());
      });
    });

  }

  fetchInstanceMethod(that, instance_no, name) {
    return (...params) => {
      var headers = {
        'Content-Type': 'application/json'
      };
      if (that.authorizationBearer) {
        headers["Authorization"] = "Bearer " + that.authorizationBearer;
      }
      if (that.authorizationBasic) {
        headers["Authorization"] = "Basic " + that.authorizationBasic;
      }
      headers["X-InstanceNo"] = instance_no;

      return new Promise((resolve3, reject3) => {
        fetch(that._src + "/instance_call/" + name,  {
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
              throw response.headers.get("X-Exception");
            } else {
              throw 'Network response was not ok';
            }
          }
          resolve3(response.json());
        })
        .catch((e) => {
          reject3(e);
        });
      });
    };
  }

  get instantiate () {
    var that = this;
    if (!this._instanciate) {
      this._instanciate = new Proxy({}, {
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
            return new Promise((resolve, reject) => {
              fetch(that._src + "/instance_construct/" + name, {
                method: 'POST',
                mode: 'cors',
                headers,
                cache: 'no-cache',
                credentials: 'same-origin',
                body: JSON.stringify(params),
              })
              .then((response) => {
                if (response.headers.has("X-InstanceNo")) {
                  let __instance_no = response.headers.get("X-InstanceNo");
                  var eventHandlers = {};
                  var instance = {
                    call : new Proxy({}, {
                      get(target, name2, receiver) {
                        return that.fetchInstanceMethod(that, __instance_no, name2);
                      },
                    }),
                    get : new Proxy({}, {
                      get(target, name2, receiver) {
                        return that.fetchInstanceProperty(that, __instance_no, name2);
                      },
                    }),
                    set : new Proxy({}, {
                      get(target, name2, receiver) {
                        return (value) => { that.setInstanceProperty(that, __instance_no, name2, value); };
                      },
                    }),
                    json : () => {
                      return that.jsonInstanceProperty(that, __instance_no);
                    },
                    addEventHandler : (event, handler) => {
                      if (!eventHandlers[event]) {
                        eventHandlers[event] = [];
                      }
                      eventHandlers[event].push(handler);
                    },
                    removeEventHandler : (event, handler) => {
                      if (eventHandlers[event]) {
                        var index = eventHandlers[event].indexOf(handler);
                        if (index >= 0) {
                          eventHandlers[event].splice(index, 1);
                        }
                      }
                    },
                  };
                  that.instanceObjects[__instance_no] = instance;
                  Object.defineProperty(instance, "__callEventHandlers", {
                    enumerable: false,
                    writable: false,
                    value: (event, detail) => {
                      if (eventHandlers[event]) {
                        for(var h of eventHandlers[event]) {
                          try {
                            h({type : event, detail});
                          } catch (e) {
                          }
                        }
                      }
                    } 
                  });
                  resolve(instance);
                } else if (response.headers.has("X-Exception")) {
                  throw response.headers.get("X-Exception");
                } else {
                  throw 'Network response was not ok';
                }
              })
              .catch((e) => {
                reject(e);
              });
            });

            }, receiver);
          }
          return Reflect.get(target, name, receiver);
        },
      });
    }
    return this._instanciate;
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
      if (x.customevent > 0) {
        if (this.instanceObjects[x.customevent]) {
          this.instanceObjects[x.customevent].__callEventHandlers(x.event, x.detail);
        }
      }
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
