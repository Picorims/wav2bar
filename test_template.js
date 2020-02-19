//MIT License - Copyright (c) 2020 Picorims

//TEMPLATE GEOPLEX

function Template() {

    

    new Visualizer(
        {
            id: "hills",
            layer: 40,
            x: 0,
            y: 570,
            width: 1280,
            height: 150,
            rotation: 0,
            radius: 0,
            type: "straight",
            points_count: 20,
            analyser_range: [0, 650],
            color: "#ffffff",
            bar_thickness: 3,
            border_radius: "3px",
            box_shadow: "0px 0px 2px rgba(20,20,20,0.5)",
        }
    );

}