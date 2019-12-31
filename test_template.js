//MIT License - Copyright (c) 2019 Picorims and Mischa

//TEMPLATE

function Template() {

    new Background(
        {
            id: "background",
            layer: 0,
            background: "url('https://s1.qwant.com/thumbr/0x380/b/3/e0305e2ad2553f13cb419a5f602563dcd6e5dd57256ff747f8fa345a69727e/319089-drawing-sky-clouds.jpg?u=https%3A%2F%2Fwallup.net%2Fwp-content%2Fuploads%2F2016%2F04%2F10%2F319089-drawing-sky-clouds.jpg&q=0&b=1&p=0&a=1')",
            //background: "radial-gradient(circle, rgba(193,229,255,1) 0%, rgba(126,212,255,1) 64%, rgba(22,172,246,1) 100%)",
            size: "100%",
        }
    );

    new Text(
        {
            id: "title",
            layer: 100,
            x: 385,
            y: 50,
            width: 500,
            height: 100,
            rotation: 0,
            type: "any",
            text: "TheFatRat & Anjulie",
            font_size: 30,
            color: "#fff",
            text_shadow: "0px 0px 5px #fff",
        }
    );

    new Text(
        {
            id: "subtitle",
            layer: 100,
            x: 385,
            y: 100,
            width: 500,
            height: 100,
            rotation: 0,
            type: "any",
            text: "Close To The Sun",
            font_size: 50,
            color: "#fff",
            text_shadow: "0px 0px 5px #fff",
        }
    );

    new Image(
        {
            id: "sun",
            layer: 50,
            x: 540,
            y: 260,
            width: 200,
            height: 200,
            rotation: 0,
            background: "radial-gradient(circle, rgba(255,255,139,1) 0%, rgba(255,255,135,1) 35%, rgba(255,255,172,1) 100%)",
            size: "",
            border_radius: "100px",
            box_shadow: "rgb(253, 253, 186) 0px 0px 100px",
        }
    );

    new Visualizer(
        {
            id: "sun-rays",
            layer: 45,
            x: 390,
            y: 110,
            width: 500,
            height: 500,
            rotation: 0,
            radius: 100,
            type: "circular",
            points_count: 50,
            analyser_range: [100, 500],
            color: "rgb(255, 255, 121)",
            bar_thickness: 2,
            border_radius: "1px",
            box_shadow: "0px 0px 2px #ffff0c",
        }
    );

    new ParticleFlow(
        {
            id: "particle_flow",
            layer: 5,
            x: 0,
            y: 0,
            width: 1280,
            height: 720,
            particle_radius_range: [1, 2],
            type: "radial",
            center: {
                x: 640,
                y: 360,
            },
            particle_direction: 0,
            max_spawn_probability: 0.4,
            color: "#f6f6f6",
        }
    );

    new Image(
        {
            id: "ground",
            layer: 40,
            x: 0,
            y: 650,
            width: 1280,
            height: 70,
            rotation: 0,
            background: "linear-gradient(0deg, rgb(44, 167, 35) 0%, rgb(36, 225, 48) 64%, rgb(38, 255, 62) 100%)",
            size: "",
            border_radius: "",
            box_shadow: "",
        }
    );

    new Visualizer(
        {
            id: "hills",
            layer: 40,
            x: -100,
            y: 600,
            width: 1480,
            height: 50,
            rotation: 0,
            radius: 0,
            type: "straight-wave",
            points_count: 20,
            analyser_range: [0, 200],
            color: "rgb(38, 255, 62)",
            bar_thickness: 0,
            border_radius: "",
            box_shadow: "",
        }
    );

    new Timer(
        {
            id: "timer",
            layer: 50,
            x: 100,
            y: 690,
            width: 1080,
            height: 10,
            rotation: 0,
            type: "bar",
            color: "rgb(126, 251, 115)",
            border_to_bar_space: 2,
            border_thickness: 2,
            border_radius: "10px",
            box_shadow: "0px 0px 2px rgb(126, 251, 115)",
        }
    );

    new Text(
        {
            id: "time",
            layer: 60,
            x: 545,
            y: 660,
            width: 200,
            height: 50,
            rotation: 0,
            type: "time",
            text: "",
            font_size: 20,
            color: "rgb(194, 255, 188)",
            text_shadow: "0px 0px 2px rgb(194, 255, 188)",
        }
    );

}