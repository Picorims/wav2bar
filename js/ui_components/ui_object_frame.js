//Wav2Bar - Free software for creating audio visualization (motion design) videos
//Copyright (C) 2022  Picorims <picorims.contact@gmail.com>

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.  If not, see <https://www.gnu.org/licenses/>.

import * as ui_components from "./ui_base_components.js";



export class UIObjectFrame extends ui_components.UIComponent {
    constructor(user_interface) {
        super();
        this._user_interface = user_interface;
        this._DOM_container.classList.add("object_frame");
        this._screen_x;
        this._screen_y;
        this._width;
        this._heigth;
        this._visible;

        this.setSize(0,0);
        this.setPosition(0,0);
        this.setVisible(false);
    }

    setSize(width, height) {
        this._DOM_container.style.width = width;
        this._DOM_container.style.height = height;
        this._width = width;
        this._heigth = height;
    }

    setPosition(x, y) {
        this._DOM_container.style.top = y;
        this._DOM_container.style.left = x;
        this._screen_x = x;
        this._screen_y = y;
    }

    setVisible(visible) {
        if (visible) this._DOM_container.style.display = "initial";
        else this._DOM_container.style.display = "none";
        this._visible = visible;
    }
}