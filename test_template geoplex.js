//MIT License - Copyright (c) 2019 Picorims and Mischa

//TEMPLATE GEOPLEX

function Template() {

    new Background(
        {
            id: "background",
            layer: 0,
            background: "url('https://i.pinimg.com/originals/40/20/5e/40205e68ce448fe4a79b38812434f9ed.jpg')",
            //background: "radial-gradient(circle, rgba(193,229,255,1) 0%, rgba(126,212,255,1) 64%, rgba(22,172,246,1) 100%)",
            size: "100%",
        }
    );

    new Text(
        {
            id: "title",
            layer: 100,
            x: 385,
            y: 270,
            width: 500,
            height: 100,
            rotation: 0,
            type: "any",
            text: "GEOPLEX",
            font_size: 60,
            color: "#fff",
            text_shadow: "0px 0px 10px rgb(204, 231, 244)",
        }
    );

    new Text(
        {
            id: "subtitle",
            layer: 100,
            x: 385,
            y: 340,
            width: 500,
            height: 100,
            rotation: 0,
            type: "any",
            text: "SUBVERT",
            font_size: 90,
            color: "#fff",
            text_shadow: "0px 0px 10px rgb(204, 231, 244)",
        }
    );

    new Image(
        {
            id: "horizontal-container",
            layer: 40,
            x: 0,
            y: 260,
            width: 1280,
            height: 200,
            rotation: 0,
            background: "rgba(20,20,20,0.5)",
            size: "",
            border_radius: "",
            box_shadow: "",
        }
    );

    new Visualizer(
        {
            id: "hills",
            layer: 50,
            x: -100,
            y: 650,
            width: 1480,
            height: 70,
            rotation: 0,
            radius: 0,
            type: "straight-wave",
            points_count: 50,
            analyser_range: [0, 200],
            color: "#ffffff",
            bar_thickness: 0,
            border_radius: "",
            box_shadow: "",
        }
    );

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
            points_count: 253,
            analyser_range: [0, 650],
            color: "#ffffff",
            bar_thickness: 3,
            border_radius: "3px",
            box_shadow: "0px 0px 2px rgba(20,20,20,0.5)",
        }
    );

}