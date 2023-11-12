class CcTranslationEditor extends HTMLElement {
  constructor(obj) {
    super();
    this.obj = JSON.parse(JSON.stringify(obj));
  }

  setDialogContainer(dlg) {
    this.dlg = dlg;
  }

  connectedCallback() {
    this.dlg.setMaxWidth("90%");
    
    this.innerHTML =`
      <table>
        <tr><td><cc-mdc-text-field id="_id" type="text" style="margin:10px;" label="ID"></cc-mdc-text-field></td></tr>
        <tr><td><cc-mdc-text-field id="de" type="text" style="margin:10px;" label="DE"></cc-mdc-text-field></td></tr>
        <tr><td><cc-mdc-text-field id="nl" type="text" style="margin:10px;" label="NL"></cc-mdc-text-field></td></tr>
      </table>`;

    this.fields = {"_id":null, "de":null, "nl": null,};

    for(var i in this.fields) {
      this.fields[i] = this.querySelector("#" + i);
    }

    for(var i in this.fields) {
      this.fields[i].value = this.obj[i];
    }

    if (this.obj["_id"]) {
      this.fields["_id"].disabled = true;
    }
  }

  save() {
    for(var i in this.fields) {
      this.obj[i] = this.fields[i].value;
    }
  }
}

window.customElements.define("cc-translation-editor", CcTranslationEditor);
