class CcSimpleAuthUserList extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML =`<cc-big-table style="position: absolute;top:0px;left:0px;width:100%;height:100%;"></cc-big-table>`;

    this.bigtable = this.querySelector("cc-big-table");

    this.users = [];

    this.bigtable.cellrenderer = (rowelem, colelem, datacol, datarow, uiRowIndex, uiColIndex) => {
      colelem.style.verticalAlign = "middle";
      colelem.style.lineHeight = "30px";
      if (uiRowIndex == 0) {
        rowelem.style.backgroundColor = "#ddd";
        rowelem.style.borderBottom = "1px solid #000";
        colelem.style.backgroundColor = "#ddd";
        switch (uiColIndex) {
          case 0:
            colelem.innerHTML = `<i id="add" style="cursor:pointer;font-size:17px;line-height:30px;" class="material-icons mdc-button__icon" aria-hidden="true">add_circle</i>`;
            var addBtn = colelem.querySelector("#add");
            addBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
              var userEditor = new CcSimpleAuthUserEditor({username:`user${this.users.length}`, forename:`Vorname${this.users.length}`, surname:`Nachname${this.users.length}`, secrettype:`password`, features:{"admin":false}});
              var p = new CcMdcDialog().setContentElement(userEditor).setOkCancel("Speichern", "Abbruch").open();
              p.then((action) => {
                if (action == "ok") {
                  userEditor.save();
                  this.authApi.addUser(userEditor.user)
                  .then(() => {
                    this.reloadUsers();
                  });
                } else {
                }
              });
            });
            break;
          case 1:
            colelem.innerText = "Benutzer";
            break;
          case 2:
            colelem.innerText = "Vorname";
            break;
          case 3:
            colelem.innerText = "Nachname";
            break;
          case 4:
            colelem.innerText = "Login-Typ";
            break;
          case 5:
            colelem.innerText = "Features";
            break;
        }
      } else {
        let row = this.users[uiRowIndex - 1];
        rowelem.style.backgroundColor = (uiRowIndex % 2) ? "#eee" : "#ddd";
        rowelem.style.borderBottom = "0px solid #000";
        colelem.style.backgroundColor = (uiRowIndex % 2) ? "#eee" : "#ddd";
        switch (uiColIndex) {
          case 0:
            colelem.innerHTML = `
              <i id="edit" style="cursor:pointer;font-size:17px;line-height:30px;" class="material-icons mdc-button__icon" aria-hidden="true">edit</i>&nbsp;
              <i id="delete" style="cursor:pointer;font-size:17px;line-height:30px;" class="material-icons mdc-button__icon" aria-hidden="true">delete</i>
              <i id="password" style="cursor:pointer;font-size:17px;line-height:30px;" class="material-icons mdc-button__icon" aria-hidden="true">vpn_key</i>
            `;
            var editBtn = colelem.querySelector("#edit");
            editBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
              var userEditor = new CcSimpleAuthUserEditor(row);
              var p = new CcMdcDialog().setContentElement(userEditor).setOkCancel("Speichern", "Abbruch").open();
              p.then((action) => {
                if (action == "ok") {
                  userEditor.save();
                  this.authApi.updateUser(userEditor.user)
                  .then(() => {
                    this.reloadUsers();
                  });
                } else {
                }
              });
            });

            var deleteBtn = colelem.querySelector("#delete");
            deleteBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
              var p = new CcMdcDialog().setHtml(`Benutzer '${row.username}' wirklich löschen?`).setOkCancel("Ok", "Abbruch").open();
              p.then((action) => {
                if (action == "ok") {
                  this.authApi.deleteUser(this.users[uiRowIndex - 1]._id)
                  .then(() => {
                    this.reloadUsers();
                  });
                }
              });
            });

            var passwordBtn = colelem.querySelector("#password");
            passwordBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
              var p = new CcMdcDialog().setHtml(`Passwort des Benutzers '${row.username}' wirklich zurücksetzen?`).setOkCancel("Ja", "Nein").open();
              p.then((action) => {
                if (action == "ok") {
                  this.authApi.resetUserPassword(row)
                  .then(() => {
                    new CcMdcDialog().setHtml("Rücksetzen erfolgreich.").open();
                  })
                  .catch(() => {
                    new CcMdcDialog().setHtml("Rücksetzen fehlgeschlagen.").open();
                  });
                } else {
                }
              });
            });
            break;
          case 1:
            colelem.innerText = row.username;
            break;
          case 2:
            colelem.innerText = row.forename;
            break;
          case 3:
            colelem.innerText = row.surname;
            break;
          case 4:
            colelem.innerText = row.secrettype;
            break;
          case 5:
            var s = "";
            for(var i in row.features) {
              if (row.features[i]) {
                switch (i) {
                  case "admin":
                    s += (s ? ", " : "") + "Admin";
                    break;
                  case "kunden":
                    s += (s ? ", " : "") + "Kunden";
                    break;
                }
              }
            }
            colelem.innerText = s;
            break;
        }
      }
    }
    
    this.bigtable.data = [];
    this.bigtable.data.push (new CcBigTableDataRow(false, true, 30));
    
    this.bigtable.headerDef = {
      cols : [
        new CcBigTableDataCol(false, true, 80),
        new CcBigTableDataCol(false, true, 100),
        new CcBigTableDataCol(false, false, 100),
        new CcBigTableDataCol(false, false, 120),
        new CcBigTableDataCol(false, false, 200),
        new CcBigTableDataCol(false, false, 100),
      ],
    };
    
    this.bigtable.fillRows ();

    this.reloadUsers();
  }

  reloadUsers() {
    this.authApi.listUsers()
    .then ((users) => {
      users.sort((a,b) => {
        var x = a.username.toLocaleLowerCase().localeCompare(b.username.toLocaleLowerCase());
        if (x != 0) {
          return x;
        }
        if (a._id < b._id) {
          return -1;
        }
        if (a._id > b._id) {
          return 1;
        }
        return 0;
      });
      this.users = users;
      this.updateTable();
    });
  }

  updateTable() {
    this.bigtable.data = [];
    this.bigtable.data.push (new CcBigTableDataRow(false, true, 30));
    for (var i = 0; i < this.users.length; i++) {
      this.bigtable.data.push (new CcBigTableDataRow(false, false, 30));
    }
    this.bigtable.fillRows ();
  }
}

window.customElements.define("ccsimpleauth-user-list", CcSimpleAuthUserList);
