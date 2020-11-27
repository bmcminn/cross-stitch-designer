# Cross Stitch Designer

> `version: v0.14.0 Alpha`

_**PLEASE NOTE:** This application is in super early alpha and will be undergoing massive changes as the overall design is designed and refined and implemented. You have been warned ;P_

A web app for designing simple cross stitch patterns and sharing them with your friends.


## How to use:

1. [Open the app!](https://bmcminn.github.io/cross-stitch-designer/)
1. Design
1. ...
1. Profit?!


### Hotkeys

- `left mouse click` - paint a cell with the selected layer
- `shift` - toggle `tile delete` function, use `left mouse click` to delete colors in grid
- `[` and `]` - select the next/previous layer color to design with
- `+` - zoom in the design
- `-` - zoom out the design


#### Coming soon

- Arrow keys - nudge whole design up, right, down, left, respectively (not avaialable)


### Sidebar Tools

#### Document Information:

Open this panel to edit your:

- Design title
- Design owner name
- Design Copyright date


#### Document Setup

Open this panel to edit your:

- design width/height
- Aida count
- Aida cloth color
- grid lines color


#### UI Settins

Open this menu to:

- adjust your UI zoom
- show/hide grid edge cursor markers
- show/hide row/column numbers, show/hide design center marker


#### Layers

Use the "New Layer +" button to add a new color to your design

Use the "Clear design" button to delete your design and start from scratch. _A confirmation prompt will display before deleting your work._

Each layer has a color button on the left side you can click to edit the layers color

- click a layer to select it and start designing with that color
- Double click the layer name to change the layer title
- Use the delete button to remove that layer from your design


_**NOTE:** editing your layers colors after drawing your design will change the color of all cells draw in the document to that point._


## Sharing your designs!

Currently working on a URL based design sharing strategy, but for now if you would like to share your design elsewhere, you can right click the grid and choose "save as" or "copy image" to download your design.


## Made with:

- `vue.js 2+` - https://vuejs.org/
- `vue-p5` - https://github.com/Kinrany/vue-p5
- `p5.js` - https://p5js.org/
- `day.js` - https://day.js.org/
- `lz-string` - https://github.com/pieroxy/lz-string/
- Fontawesome `v5.1` - https://fontawesome.com/icons?d=gallery&s=solid&m=free
