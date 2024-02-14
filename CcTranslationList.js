class CcTranslationList extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML =`
      <cc-mdc-text-field id="filtertext" type="text" label="${t9n`Filter`}" style="position: absolute;top:10px;left:10px;width:300px;"></cc-mdc-text-field>
      <cc-big-table style="position: absolute;top:75px;left:0px;width:100%;height:100%;"></cc-big-table>
    `;

    this.filtertext = this.querySelector("#filtertext");
    this.filtertext.addEventListener("change", () => {
      this.updateTable();
    })
    this.filtertext.addEventListener("input", () => {
      this.updateTable();
    })

    this.bigtable = this.querySelector("cc-big-table");

    this.translations = [];

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
              var editor = new CcTranslationEditor({_id:``, de:``, nl:``});
              var p = new CcMdcDialog().setContentElement(editor).setOkCancel("Speichern", "Abbruch").open();
              p.then((action) => {
                if (action == "ok") {
                  editor.save();
                  this.translationApi.addOrUpdateTranslation(editor.obj)
                  .then(() => {
                    this.reloadTranslations();
                  });
                } else {
                }
              });
            });
            break;
          case 1:
            colelem.innerText = "ID";
            break;
          case 2:
            colelem.innerText = "DE";
            break;
          case 3:
            colelem.innerText = "NL";
            break;
        }
      } else {
        let row = datarow.data;
        rowelem.style.backgroundColor = (uiRowIndex % 2) ? "#eee" : "#ddd";
        rowelem.style.borderBottom = "0px solid #000";
        colelem.style.backgroundColor = (uiRowIndex % 2) ? "#eee" : "#ddd";
        switch (uiColIndex) {
          case 0:
            colelem.innerHTML = `
              <i id="edit" style="cursor:pointer;font-size:17px;line-height:30px;" class="material-icons mdc-button__icon" aria-hidden="true">edit</i>&nbsp;
              <i id="delete" style="cursor:pointer;font-size:17px;line-height:30px;" class="material-icons mdc-button__icon" aria-hidden="true">delete</i>
            `;
            var editBtn = colelem.querySelector("#edit");
            editBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
              var editor = new CcTranslationEditor(row);
              var p = new CcMdcDialog().setContentElement(editor).setOkCancel("Speichern", "Abbruch").open();
              p.then((action) => {
                if (action == "ok") {
                  editor.save();
                  this.translationApi.addOrUpdateTranslation(editor.obj)
                  .then(() => {
                    this.reloadTranslations();
                  });
                } else {
                }
              });
            });

            var deleteBtn = colelem.querySelector("#delete");
            deleteBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
              var p = new CcMdcDialog().setHtml(`Translation '${row.ID}' wirklich löschen?`).setOkCancel("Ok", "Abbruch").open();
              p.then((action) => {
                if (action == "ok") {
                  this.translationApi.deleteTranslation(row._id)
                  .then(() => {
                    this.reloadTranslations();
                  });
                }
              });
            });

            break;
          case 1:
            colelem.innerText = row._id;
            break;
          case 2:
            colelem.innerText = row.de;
            break;
          case 3:
            colelem.innerText = row.nl;
            break;
        }
      }
    }
    
    this.bigtable.data = [];
    this.bigtable.data.push (new CcBigTableDataRow(false, true, 30));
    
    this.bigtable.headerDef = {
      cols : [
        new CcBigTableDataCol(false, true, 80),
        new CcBigTableDataCol(false, false, 400),
        new CcBigTableDataCol(false, false, 400),
        new CcBigTableDataCol(false, false, 400),
      ],
    };
    
    this.bigtable.fillRows ();

    this.reloadTranslations();
  }

  reloadTranslations() {
    this.translationApi.fetchTranslations()
    .then ((translations) => {
      translations.sort((a,b) => {
        var x = a._id.toLocaleLowerCase().localeCompare(b._id.toLocaleLowerCase());
        return x;
      });
      this.translations = translations;
      this.updateTable();
    });
  }

  updateTable() {
    this.bigtable.data = [];
    this.bigtable.data.push (new CcBigTableDataRow(false, true, 30));
    var filtertext = this.filtertext ? this.filtertext.value.toLocaleLowerCase() : "";
    for (var i = 0; i < this.translations.length; i++) {
      if (filtertext) {
        var found = false;
        for(var key in this.translations[i]) {
          if (this.translations[i][key] && this.translations[i][key].toLocaleLowerCase().indexOf(filtertext) >= 0) {
            found = true;
            break;
          }
        }
        if (!found) {
          continue
        }
      }
      this.bigtable.data.push (new CcBigTableDataRow(false, false, 30, this.translations[i]));
    }
    this.bigtable.fillRows ();
  }
}

window.customElements.define("cc-translation-list", CcTranslationList);
