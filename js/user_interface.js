//MIT License - Copyright (c) 2020 Picorims

//USER INTERFACE PROCESS (CONTROL PANEL INCLUDED)

var tab;//all tabs
var tab_label;//all tab labels

//user interface initialization
function InitUI() {
    
    //TABS
    tab = {
        project: document.getElementById("project_tab"),
        objects: document.getElementById("objects_tab"),
        export: document.getElementById("export_tab"),
        help: document.getElementById("help_tab"),
    }



    //TAB LABELS
    tab_label = {
        project: document.getElementById("project_label"),
        objects: document.getElementById("objects_label"),
        export: document.getElementById("export_label"),
        help: document.getElementById("help_label"),
    }

    tab_label.project.onclick = function() {
        HideAnyTab();
        ShowTab(tab.project, tab_label.project);
    }
    tab_label.objects.onclick = function() {
        HideAnyTab();
        ShowTab(tab.objects, tab_label.objects);
    }
    tab_label.export.onclick = function() {
        HideAnyTab();
        ShowTab(tab.export, tab_label.export);
    }
    tab_label.help.onclick = function() {
        HideAnyTab();
        ShowTab(tab.help, tab_label.help);
    }


    

    //TABS INITIALIZATION
    HideAnyTab();
    ShowTab(tab.project, tab_label.project);

}





//hides any tab shown
function HideAnyTab() {
    for (i of Object.keys(tab) ) {
        tab[i].style.left = -1000+"px";
        tab[i].style.display = "none";
        tab_label[i].classList.remove("selected_tab");
    }
}

//show the tab given in parameter
function ShowTab(tab, tab_label) {
    tab.style.left = 0;
    tab.style.display = "initial";
    tab_label.classList.add("selected_tab");
}