# Development guidelines

## Table of contents
- [About this document](#about)
- [Goal](#goal)
- [Roadmap](#roadmap)
    - [Internal Goals](#internal-goals)
    - [Box of ideas](#box-of-ideas)
- [Setup](#setup)
- [Code styling](#code-styling)
- [Organizing files](#organizing-files)
- [Modules and packages structuring](#modules-structuring)
- [Architecture](#architecture)
- [About the global context](#about-the-global-context)
- [About Node integration in the renderer process](#about-node-integration)
- [Documenting](#documenting)
- [Versioning and Git](#versioning-and-git)
- [Questions or concerns ?](#questions-or-context)
- [FAQ](#faq)

<a name="about"></a>

## About this document

This document describes the goals of the project, the direction it takes and what to know when working on it. This documented should be adapted as these different points change over time.

<a name="goal"></a>

## Goal

Wav2Bar was created to have a free, open source software to create music visualization (or sound related motion graphics). This software can be used by artists, podcast authors, etc. to make a pleasant video to go with their work. The video can then be published online on social medias or on a webiste.

Wav2Bar is not designed to be a true professional video editing software full of super complex features. Instead, the goal is to have an easy to use software for someone not used to video editing. Help should be provided whenever it is needed, to guide the user as he discover the features.

The current targeted platforms are Windows and Linux (and there is work to do for better Linux support). Mac is currently not considered although it can be somewhat runable from source.

The goal is also to try considerating accessibility issues, even if the project is currently far from being able to cover all accessibility issues. Right now, the first consideration is to have a color palette that works for as many people as possible.

Backward compatibility is also an important part to consider. Upgrading to a newer version shouldn't break user data, or as least as possible. Because nobody wants to keep configuring stuff again or redo projects from scratch all the time.

<a name="roadmap"></a>

## Roadmap

<a name="internal-goals"></a>

### Internal goals
- Reduce the amount of global variables and global context code.
- Go towards object oriented code.
- Keep an eye on the DRY (Don't Repeat Yourself) principle.
- Make more canvas based rendering, less HTML based rendering.
- Try automatic tests. Possible useful resource: https://github.com/electron/electron/blob/main/docs/tutorial/automated-testing-with-a-custom-driver.md

<a name="box-of-ideas"></a>

### Box of ideas

Planned:
- **Hide/show object feature. (0.4.0)** This quality of life feature would help focusing on specific objects during design. It is not set yet if this will be saved or not.
- **Display object borders on hovering of its settings. (0.3.0)** It is not always easy to see the boundaries of an object (like particle flow objects), which doesn't help setting its size. This feature aim to fix this.
- **convert CLI command. (0.3.1)** This quick command would convert the save to a newer said version. There could also be a potential folder support to make migrations easier if you like to keep up to date saves.
- **Make object creation more intuitive (0.3.0)** (improve help, random color to distinguish the newly created object, default size per type...)
- **Keep track of last used folder in file explorer. (0.3.1)** Because always starting from home folder and doing all the clicks again is annoying!
- **New visualizers. (0.4.0 and further)** Yes. Finally. Two would be a great goal to start with. I need to experiment stuff.
- **Extend existing objects customization. (0.4.0)** That includes more options for text and particle flows.
- **favorite folders in file explorer. (0.4.1)** This can act as shortcuts.

Box of ideas for future updates:
- technical:
    - full CLI with dedicated terminal and script reading
    - better linux support (once I find the good moment to setup a Linux dev environment)
    - More accurate preview (time based instead of frame based)
    - Make FFmpeg installation easier
- customization:
    - more particle options
    - more visualizers
- quality of life
    - gradient UI
    - custom color picker
    - mouse interactions to manipulate objects
    - helper to make cool designs by picking between choices.
    - factory templates
- accessibility
    - translations
    - keyboard shortcuts

<a name="setup"></a>

## Setup

See `README.md`.

<a name="code-styling"></a>

## Code styling

### Formatting
|Type               |Formatting         |example        |
|-                  |-                  |-              |
|variable           |snake case         |`my_var`       |
|constant variable  |capital letters    |`MY_CONST`     |
|lonely function    |pascal case        |`MyFunction`   |
|class              |pascal case        |`MyClass`      |
|private field      |snake case prefixed by an underscore|`_private_field`|
|public field       |snake case         |`public_field` |
|private method     |camel case prefixed by an underscore|`_myMethod`|
|public method      |camel case         |`myMethod`     |
|get/set property   |snake case         |`my_property`  |
|module name        |snake case         |`module_name`  |

### Tabs
4 spaces.

### Blocks
```js
if (thing === 1) {

} else {

}

function Name() {

}
```

### Decorators
JSDoc decorators `/** @abstract */` and `/** @override */` are used above classes and methods as JavaScript do not support these natively, and they are important to the understanding of the codebase.

### Else
- Prefer `===` over `==`.
- Put some space between root blocks, and group them by feature. You can make visible separations by using comments if needed, for example:
```js
//#####
//TITLE
//#####

//=====
//TITLE
//=====

//Title
//-----

//etc.
```
- You can make basic type tests of the passed arguments that throw errors to limitate possibilities of unwanted data interacting with the code, and limit risks of bugs earlier in the execution. The `utils` module has pre made methods for that purpose (Some may be arguably useless but can help for readability).
 
<a name="organizing-files"></a>

## Organizing files

- **assets:** Non code dependencies (text such as translations, icons, etc.);
- **dev_utils:** Node scripts useful for Wav2Bar development and deployment;
- **docs:** documentation, UML diagrams;
- **html:** HTML code except index.html;
- **js:** JavaScript code except main.js;
- **logs:** automatic logs folder;
- **node_modules:** Node modules! ;
- **out:** Generated packages goes here;
- **temp:** Temporary files for Wav2Bar if writing access is available;
- **user:** User data storage if writing access is available, default settings;

<a name="modules-structuring"></a>

## Modules and packages structuring

Modules are grouped by theme, area or functionality. A package is represented by the following:
- a folder named after the package nam;
- a main aggregating module named after the package name, that only serves to export sub modules so they can be all imported through one single module;
- one or more submodules implementing features. Multiple functions or class can be grouped in one module if they are part of the same feature or have a very close relationship. (inheritence of a specific feature that still describe the same feature, group of utilities for the same group of usages, etc.)

JavaScript file not part of a package (i.e lying directly in the `js` folder) belongs to the global context. They share the same context together (so global variables and function definitions for example). Right now it is the main "module" at the head of all modules.

> Note: Their relationship is documented at `docs/modules.plantuml` and `docs/out/modules/modules.svg`.

<a name="architecture"></a>

## Architecture

Wav2Bar is developped in JavaScript using the Electron framework. It uses a main Node process for system actions, and a renderer process for the rest of the application. When Wav2Bar is started, the main process initiate the application, and launch the renderer process. Then, they communicate through IPCMain and IPCRenderer respectively to send messages, events and requests. There can be additional renderers for specific tasks, such as rendering for export.

The renderer process starts its execution in `index.js` through the global context. Some files of the global context are not systematically used, such as `export_*.js` that relies on specific renderers.

Each renderer process is independant from each other and can communicate through the main process.

> Note: For more information, see the Electron documenation.

Wav2Bar requires FFMpeg in order to be able to export videos. FFMpeg is manipulated through a Node layer using a dedicated library.

<a name="about-the-global-context"></a>

## About the global context

The current goal is to shrink the global context to the minimum (or remove it if it ends up possible). We should avoid by any means to create new features in the global context, add global variables, etc. If we need to add features from code existing in the global context, we should consider if it is possible to migrate it into modules beforehand. If not, we can prepare the code to be movable by making it as independant from the global context as possible.

The global context is the first entry in the program, in `index.js`, through an event listener for when the page is ready. In the global context, modules are imported dynamically and stored in `imports.package_name`.

<a name="about-node-integration"></a>

## About Node integration in the renderer process

Node integration should only be used to require Electron's IPCRenderer. All system actions and use of the Node or Electron api should have a dedicated handler in the main process.

<a name="documenting"></a>

## Documenting

Here is the list of things that should be documented:
- methods, classes, functions...
    - through comments above them, either common comments or JSDoc comments.
    - classes
        - through PlantUML diagrams. PlantUML allows to write UML diagrams by text, which is more friendly with tools like git. You can preview them and generate them through the official utility, or through extensions and plugins. VSCode's PlantUML plugin is used to generate .svg files of the diagrams in `docs/out`. There should be one diagram per module. Classes should be grouped by packages, and classes from other packages should only be named/declared (in this case links within the package are not mandatory either, but can be added if it helps for readability).
    - abstracts, overrides
        - through dedicated JSDoc tags `@abstract` and `@override`. They are important for the integrity of the codebase.
    - complex and verbose topics
        - through dedicated MarkDown files. (examples: Save format, CLI, etc.)

All the documentation is written in the `docs` folder and should be saved in git friendly, text based formats.

<a name="versioning-and-git"></a>

# Versioning and Git

`<giant_upgrade>.<major_update>.<small_update>[-beta]`.
- **giant_upgrade:** Switching development phase (beta to release, gigantic rewrite and upgrade of features). Very unlikely to increment.
- **major_update:** Update with a multiple new features and breaking changes
- **small_update:** Small feature changes that are not breaking changes, bug fixes, security patches.
- **-beta:** Beta release. All 0.x.y releases should have it as they are betas.

> Note: **Do NOT use Git LFS!** It caused many issues in the past and should not be touched or used anymore.

<a name="questions-or-concerns"></a>

## Questions or concerns ?

You can submit your concerns by opening an issue. For questions, use the discussion section, or the [Discord Server](https://discord.gg/EVGzfdP).

<a name="faq"></a>

## FAQ

(Picorims answering)

### Why using JavaScript and not TypeScript ?
The project was started when my knowledge of programming was pretty basic. I didn't know classes at the time. Now, the code when through multiple rewrites, and more time should be spent towards adding new features, so rewriting again by adapting to TypeScript is not worth the work. JavaScript is sufficient right now.

### Why not using React/Vue/Angular ?
Same as below. By the time, a custom component system has been setup using `UIComponent` and `EventMixin`, which is enough for the needs of the project.

### Why making it a desktop app ? Why not a web app ?
Here, the "server" is shipped with the application. Otherwise, it would require maintaining and hosting a server capable of handling many video exports at the same time. So it is easier and cheaper, in addition to having a better native experience.

### There are many similar apps on the Internet. Why Wav2Bar ?
When I started the project, the only truly free option I knew was SonicCandle, which was discontinued. By the time I saw some other projects exist as well. But hey, it's a good training and practice project for a student, as it covers many topics at the same time. And the more options for the end user, the better!

### Why current Linux support is not very good ?
I have to setup a Linux development environment, when I find the right moment to do it properly.

### Why not supporting MacOSX ?
Shipping to mac requires signing packages, and is generally more troublesome than shipping on other operating systems. Because right now I am the only active maintainer, I have to make choices and can't handle everything. But you can try running from source, Electron is compatible with Mac after all.