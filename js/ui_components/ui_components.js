//MIT License - Copyright (c) 2020-2021 Picorims

//base class for creating UI components. A base component is a div that can contain other stuff.
export class UIComponent {
    constructor() {
        this._DOM_container = document.createElement("div");
    }
    // Getters
    get DOM_container() {
        return this._DOM_container;
    }
}

//grid of buttons to interact with
export class UIButtonGrid extends UIComponent {
    constructor(rows, columns) {
        super();
        this._rows = rows;
        this._columns = columns;

        //Setup grid
        this._buttons = [];
        this._DOM_container.style.display = "grid";
        this._DOM_container.style.gridTemplateRows = `repeat(${this._rows}, 1fr)`; //1fr = proportionally
        this._DOM_container.style.gridTemplateColumns = `repeat(${this._columns}, 1fr)`; //1fr = proportionally

        for (let i = 0; i < this._rows; i++) {
            let row = [];
            //create the row
            for (let j = 0; j < this._columns; j++) {
                let button = document.createElement("button");
                this._DOM_container.appendChild(button);
                row.push(button);
            }
            //add the row to the list of rows
            this._buttons.push(row);
        }
    }
    get rows() {return this._rows;}
    get columns() {return this._columns;}
    getButton(row, column) {return this._buttons[row][column]}
}