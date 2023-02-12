class CcSimpleAuthUserEditor extends HTMLElement {
  constructor(user) {
    super();
    this.origuser = user;
    this.user = JSON.parse(JSON.stringify(user));
  }

  setDialogContainer(dlg) {
    this.dlg = dlg;
  }

  connectedCallback() {
    this.dlg.setMaxWidth("90%");
    
    this.innerHTML =`
      <table>
        <tr><td><cc-mdc-text-field id="username" type="text" style="margin:10px;" label="Benutzername"></cc-mdc-text-field></td></tr>
        <tr><td><cc-mdc-text-field id="forename" type="text" style="margin:10px;" label="Vorname"></cc-mdc-text-field></td></tr>
        <tr><td><cc-mdc-text-field id="surname" type="text" style="margin:10px;" label="Nachname"></cc-mdc-text-field></td></tr>
        <tr><td><cc-mdc-chips id="features" type="text" style="margin:10px;" label="Benutzerrollen"></cc-mdc-chips></td></tr>
      </table>`;

    this.fields = {"username":null, "forename":null, "surname": null, "features": null,};

    for(var i in this.fields) {
      this.fields[i] = this.querySelector("#" + i);
    }

    for(var i in this.fields) {
      this.fields[i].value = this.user[i];
    }

    this.fields["features"].addItem("Admin", "admin", "face");
  }

  save() {
    for(var i in this.fields) {
      this.user[i] = this.fields[i].value;
    }
  }
}

window.customElements.define("ccsimpleauth-user-editor", CcSimpleAuthUserEditor);
