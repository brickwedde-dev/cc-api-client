function fillLoginContent(targetdiv, api, callback, dlg) {
  var logindata = { username : "", password : ""};
  var doLogin = () => {
    api.plugins.auth.login(logindata.username, logindata.password)
    .then ((p) => {
      if (dlg) {
        dlg.close();
      }
      localStorage.setItem("sessionkey", p.sessionkey);
      callback(true);
    })
    .catch (() => {
      new CcMdcDialog().setHtml("Einloggen nicht erfolgreich.").open();
      callback(false);
    });
  };

  var focusNext = () => {
    var pw = targetdiv.querySelector("#password");
    pw.focus()
  };

  targetdiv.style.padding = "10px";
  targetdiv.innerHTML = html`
    <cc-mdc-text-field @enter="${focusNext}" .target="${$TARGET(logindata, "username")}" style="margin:10px;" label="Benutzername"></cc-mdc-text-field><br><br>
    <cc-mdc-text-field @enter="${doLogin}" id="password" .target="${$TARGET(logindata, "password")}" type="password" style="margin:10px;" label="Passwort"></cc-mdc-text-field><br><br>
    <cc-mdc-button @click="${doLogin}" style="float:right;margin:10px;" label="Einloggen" icon="open_in_browser"></cc-mdc-button>
  `;
}

function showLoginDialog (api, callback) {
  var dlg = new CcMdcDialog().setNoButtons();
  dlg.setFillContentFunction((div) => {
    fillLoginContent(div, api, callback, dlg);
  });
  dlg.open();
}