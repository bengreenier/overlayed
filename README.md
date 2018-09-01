# overlayed 🎬🔴

![project status](https://img.shields.io/badge/Project%20Status-Alpha-red.svg)
[![GitHub release](https://img.shields.io/github/release/bengreenier/overlayed.svg)](https://github.com/bengreenier/overlayed/releases)
[![Build Status](https://travis-ci.org/bengreenier/overlayed.svg?branch=master)](https://travis-ci.org/bengreenier/overlayed)
[![Discord](https://img.shields.io/discord/393575719545864222.svg)](https://discord.gg/Vg7VMVe)

![overlayed header](./.github/header.png)

Overlayed is a tool that enables streamers to see their overlays atop their desktop. I built it to interact more seamlessly with my viewers. If you want to interact in faster, more interesting ways it may be built for you too. ❤️

## Table of contents

+ [Installation](#installation)
+ [Configuration](#configuration)
  + [Screen Layout](#screen-layout)
  + [Built-in Overlays](#built-in-overlays)
  + [Custom Overlays](#custom-overlays)
+ [Contributing](#contributing)
  + [Core](#core)
  + [Building an Overlay](#building-an-overlay)
+ [License](#license)

## Installation

Currently, This project is in Alpha status. As such, the only way to install is to clone this repository, and [Build it](#core).

## Configuration

> Note: we don't support a configuration editor today, but one is coming! ✨ 

Overlayed uses [electron-settings](https://github.com/nathanbuchar/electron-settings) under the hood, which saves settings to different locations based on your operating system. 

| Windows | Mac | Linux |
| ------- | --- | ----- |
|`%APPDATA%/overlayed/Settings`|`~/Library/Application\ Support/Overlayed/Settings`|`$XDG_CONFIG_HOME/Overlayed/Settings`|
||| or |
|||`~/.config/Overlayed/Settings`|

Learn more [in the electron-settings FAQ](https://github.com/nathanbuchar/electron-settings/wiki/FAQs#where-is-the-settings-file-saved).

### Screen Layout

Overlayed can be configured to overlay above a portion of your screen, which can be great if you don't share your entire display when streaming.

To configure the screen layout, modify the following settings:

```
{
  "overlayed": {
    "window": {
      "x": 780,
      "y": 0,
      "width": 1920,
      "height": 1080
    }
  }
}
```

+ `x` - the left-most side of the overlay region
+ `y` - the top-most side of the overlay region
+ `width` - the total width of the overlay region
+ `height` - the total height of the overlay region

### Built-In Overlays

Overlayed ships with some built-in overlays. These live [in this directory](./src/app/plugin). There are currently not configurable.

### Custom Overlays

Overlayed supports loading custom plugins from your home directory. To add custom overlays, create a folder in your home directory named `.overlayed` and a folder for each plugin inside that parent folder. For example:

```
home/
  .overlayed/
    TestPlugin/
      package.json
      TestPlugin.js
    OtherPlugin/
      package.json
      OtherPlugin.js
```

Other than installing custom plugins, you cannot currently configure values for custom plugins.

## Contributing

This project loves new contributors, but it is maintained as a side project. If you feel you aren't getting traction, please be patient!

### Core

To contribute to the core of the project (namely, this repository) you'll need the following things:

+ [Git](https://git-scm.com/)
+ [Node](https://nodejs.org/)

Then clone this repository and execute the following commands from the directory in which you cloned into (likely `overlayed`):

```
npm install
npm run build
npm start
```

These will (in order): install dependencies, build the project, start the application. Please note that this project uses [typescript](https://www.typescriptlang.org/) to build files into the `dist/` folder. As such, the `dist/` folder should not be modified by engineers, nor should it be included in PRs.

### Building an Overlay

> A more detailed walkthrough is coming soon! ✨ 

+ Create a new directory `.overlayed` in your [home directory](http://www.linfo.org/home_directory.html)
+ Create a new directory under `.overlayed` for your overlay, like `MyOverlay`
+ Run `npm init` or manually create a `package.json` file
+ Ensure `package.json` contains `name`, `version`, and `main`
+ Ensure main points to a `.js` file that has a [default export](https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export#Using_the_default_export) (or `module.exports.default = YourClass`)
+ Ensure you do not include `react` in your dependencies (it's implicit) - for development, you may choose to include it in `devDependencies`
+ Profit! Overlayed will attempt to load your plugin on start

For example:

__TestOverlay.js:__
```
export default class TestOverlay extends React.Component {
  render() {
    return <h1>Hello World</h1>
  }
}
```


__package.json:__
```
{
  "name": "test-overlay",
  "version": "0.0.1",
  "main": "TestOverlay.js"
}
```

## License

MIT