'use strict';


const TOOL_BRUSH        = 'Brush'
const TOOL_ERASER       = 'Eraser'
const TOOL_EYEDROPPER   = 'Eyedropper'
const TOOL_FILL         = 'Fill'
const TOOL_PEN          = 'Pen'
const TOOL_RULER        = 'Ruler'
const TOOL_SELECT       = 'Select'



var app = new Vue({
    el: '#app',
    data() {
        return {

            app: {
                name: 'Cross Stitch Designer',
                version: '0.15 Alpha',
                author: {
                    name: 'bmcminn',
                    link: 'https://github.com/bmcminn',
                },
                links: [
                    {
                        title: 'Github',
                        link: 'https://github.com/bmcminn/cross-stitch-designer',
                    },
                    {
                        title: 'Github',
                        link: 'https://github.com/bmcminn/cross-stitch-designer#instructions',
                    },
                    {
                        title: 'Issues',
                        link: 'https://github.com/bmcminn/cross-stitch-designer/issues',
                    },
                ]
            },

            sketch: null,

            DEBUG_MODE: false,

            // VIEW PROPS
            baseTilesize: 20,

            zoomAdjust: 0.5,
            zoomMin: 1,
            zoomMax: 5,
            zoomLevel: 3,

            grid: [],

            gridCrossSize: 5,
            gridMarginScale: 4,

            gridCenterX: 0,
            gridCenterY: 0,

            offsetX: 0,
            offsetY: 0,

            prevOffsetX: 0,
            prevOffsetY: 0,

            designViewDrawCentered: false,

            origin: 25,
            framerate: 20,
            isScrolling: false,
            selectedLayer: 0,


            currentTool: 'linestitch',

            tools: {
                linestitch: {

                }
            },

            tiles: {},


            selectedTool: null,

            tools: [
                {
                    name: TOOL_RULER,
                    icon: 'fa-ruler',
                    command: 'r',
                },
                {
                    name: TOOL_ERASER,
                    icon: 'fa-eraser',
                    command: 'e',
                    enabled: true,
                },
                {
                    name: TOOL_BRUSH,
                    icon: 'fa-paint-brush',
                    command: 'b',
                    enabled: true,
                },
                {
                    name: TOOL_PEN,
                    icon: 'fa-pen-nib',
                    command: 'p',
                },
                {
                    name: TOOL_FILL,
                    icon: 'fa-fill-drip',
                    command: 'f',
                },
                {
                    name: TOOL_EYEDROPPER,
                    icon: 'fa-eye-dropper',
                    command: 'i',
                    enabled: true,
                },
                {
                    name: TOOL_SELECT,
                    icon: 'fa-crop-alt',
                    command: 'm',
                },
            ],


            aidaCounts: [ 7, 10, 11, 12, 14, 16, 18, 22, 28 ],


            design: {
                widthInches: 0,
                heightInches: 0,
                widthMM: 0,
                heightMM: 0,
                owner: '',
                title: 'New Cross Stitch Design',
                copyright: new Date(),
            },


            settings: {
                gridBackgroundColor: '#ffffff',
                gridLineColor: '#dfdfdf',
                aidaCount: 14,
                aidaCountMin: 7,
                aidaCountMax: 28,
                gridWidth: 15,
                gridHeight: 15,
                gridSizeMin: 10,
                gridSizeMax: 130,
                gridTextColor: '#000000',
                tilesize: 12,
                tilesizeMin: 8,
                tilesizeMax: 20,
                selectedLayer: 0,
                showGrid: true,
                showCursorMarkers: true,
                showGridNumbers: true,
                showCenterCross: true,
            },


            layers: [
                {
                    title: 'green',
                    color: '#5fd12e',
                    // threadCount: 2,
                    // stitchType: 1,
                    editingtitle: false,
                    // tiles: [],
                },
                {
                    title: 'puple',
                    color: '#8080ff',
                    // threadCount: 2,
                    // stitchType: 1,
                    editingtitle: false,
                    // tiles: [],
                },
            ],
        }
    },


    computed: {
    },


    methods: {

        // ==============================
        //  P5 METHODS
        // ==============================


        setup(sk) {

            this.sketch = sk
            sk.createCanvas(10,10)
            sk.frameRate(this.framerate)

            sk.canvas.style.borderColor = this.settings.gridLineColor

            this.adjustGrid(sk)

            // document.addEventListener('contextmenu', event => {
            //     if (event.target.classList.contains('p5Canvas')) {
            //         event.preventDefault()
            //         event.stopPropagation()
            //     }
            // });

            // setupEventBindings(this)
        },


        draw(sk) {
            // sk.clear()
            sk.background('#ffffff')

            sk.translate(this.origin, this.origin)

            this.drawTiles(sk)

            this.drawGrid(sk)
            this.drawDebug(sk)

            this.drawCursor(sk)

            this.drawCenterMarker(sk)
        },


        windowresized(sk) {


            this.adjustGrid(sk)



            // sk = sk ? sk : this.sketch
            // sk?.resizeCanvas(this.settings.gridWidth * this.settings.tilesize, this.settings.gridHeight * this.settings.tilesize)

            // sk.resizeCanvas(window.innerWidth - this.origin, window.innerHeight - this.origin)
            // this.recalculateTilesize()
        },


        keypressed(sk) {

            if (sk.isComposing || sk.keyCode === 229) {
                return
            }

            let key = []

            sk.keyIsDown(sk.CONTROL)   ? key.push('ctrl') : null
            sk.keyIsDown(sk.SHIFT)  ? key.push('shift') : null
            sk.keyIsDown(sk.ALT)    ? key.push('alt') : null

            key.push(sk.key)

            key = key.join('+')

            console.debug('keydown event', sk, key)


            // if (ACTIONS[key]) { ACTIONS[key]() }


            switch(key) {
                case 'F3':  this.DEBUG_MODE = !this.DEBUG_MODE; break
                case ']':   this.nextLayer(1); break
                case '[':   this.nextLayer(-1); break

                // TODO: integrate sk.save(c, filename) to export design image
                // case 'ctrl+e':          this.export()

                case '+':   this.zoomGrid(1); break
                case '-':   this.zoomGrid(-1); break

                // case 'g':   this.showGrid = !this.showGrid; break
                // case 'ArrowLeft':   this.nudgeDesign(-1, 0); break
                // case 'ArrowUp':     this.nudgeDesign(0, -1); break
                // case 'ArrowRight':  this.nudgeDesign(1, 0); break
                // case 'ArrowDown':   this.nudgeDesign(0, 1); break
            }

            let tool = this.tools.find(el => sk.key === el.command.trim() ? el : null)

            if (tool) { this.selectedTool = tool.name }

        },


        mousepressed(sk) {

            let x = Math.floor(sk.mouseX / this.settings.tilesize) - this.gridMarginScale
            let y = Math.floor(sk.mouseY / this.settings.tilesize) - this.gridMarginScale

            let coord = `${x},${y}`

            let LEFT_CLICK  = sk.mouseButton === 'left'
            let RIGHT_CLICK = sk.mouseButton === 'right'


            if (this.selectedTool === TOOL_BRUSH && LEFT_CLICK) {
                this.tiles[coord] = [x, y, this.settings.selectedLayer]
                console.debug('Brush', x, y)
                // this.tiles[coord] = {
                //     x,
                //     y,
                //     color: this.settings.selectedLayer,
                // }
            }


            if (this.selectedTool === TOOL_ERASER && LEFT_CLICK) {
                if (this.tiles[coord]) {
                    delete this.tiles[coord]
                }
            }


            if (this.selectedTool === TOOL_EYEDROPPER && LEFT_CLICK) {
                let tile = this.tiles[coord]

                if (tile) {
                    this.settings.selectedLayer = tile[2]
                }
            }

            this.save()
        },


        mousemoved(sk) {
        },


        drawTiles(sk) {

            if (!this.tiles) { return }

            let tilesize = this.settings.tilesize

            let origin = -this.origin
            // sk.translate(this.origin, this.origin)

            sk.strokeWeight(2)
            sk.stroke(this.settings.gridLineColor)
            sk.fill(this.settings.gridBackgroundColor)
            sk.rect(0, 0, this.settings.gridWidth * this.settings.tilesize, this.settings.gridHeight * this.settings.tilesize)

            Object.keys(this.tiles).forEach((key, el) => {

                if (!this.tiles.hasOwnProperty(key)) { return }

                let [x, y, colorIndex] = this.tiles[key]

                if (x < 0 || y < 0) { return }

                sk.strokeWeight(0)

                sk.fill(this.layers[colorIndex].color)
                sk.square(Number(x) * tilesize, Number(y) * tilesize, tilesize)

            }, this)

        },


        drawTriangle(x, y, size, dir, color='#000000') {
            let sk = this.sketch

            dir = `${dir}`.trim().toLowerCase()

            // test if dir is valid
            if (!'up|right|down|left'.includes(dir)) { return }


            if ('up|left'.includes(dir)) { size *= -1 }

            // center triangle around target x,y origin
            x -= size / 2
            y -= size / 2

            sk.fill(color)

            // draw left right
            if ('left|right'.includes(dir)) {
                sk.triangle(
                    x,              y,
                    x,              y + size,
                    x + size ,      y + size / 2
                )


            // draw up/down
            } else {

                // draw triangle markers
                sk.triangle(
                    x,              y,
                    x + size,       y,
                    x + size / 2,   y + size
                )


            }


        },


        drawGrid(sk) {

            // if (!this.showGrid) { return }

            let tilesize    = this.settings.tilesize
            let tilecenter  = Math.floor(tilesize / 2)

            let xmin = 0
            let ymin = 0
            let xmax = this.settings.gridWidth * tilesize
            let ymax = this.settings.gridHeight * tilesize


            let triSize     = 12
            let triOffset   = 25

            let xCenter = this.settings.gridWidth * tilesize / 2
            let yCenter = this.settings.gridHeight * tilesize / 2


            this.drawTriangle(xCenter, 0-triOffset,         triSize, 'down')
            this.drawTriangle(xCenter, ymax + triOffset,    triSize, 'up')
            this.drawTriangle(0 - triOffset,    yCenter,    triSize, 'right')
            this.drawTriangle(xmax + triOffset, yCenter,    triSize, 'left')


            // setup text settings
            sk.fill(0,0,0,0)
            sk.textAlign(sk.CENTER)
            sk.stroke(this.settings.gridLineColor)


            // draw vertical grid lines
            for (let x = this.settings.gridWidth; x >= 0; x--) {

                let offset = 0
                let text = x

                if (x === 0) {
                    offset = 12
                    text = 1
                }

                sk.strokeWeight(1)

                if (x % 5 === 0) {
                    if (this.settings.showGridNumbers) {
                        sk.strokeWeight(0)
                        sk.fill(this.settings.gridTextColor)
                        sk.text(text, offset + (x * tilesize) - tilecenter, -5)
                        sk.text(text, offset + (x * tilesize) - tilecenter, ymax + 13)
                    }

                    sk.strokeWeight(2)
                }

                sk.line(x * tilesize, 0, x * tilesize, ymax)
            }


            // draw horizontal grid lines
            for (let y = this.settings.gridHeight; y >= 0; y--) {

                // if (y === this.settings.gridHeight) { continue }
                // if (y === 0) { continue }

                sk.strokeWeight(0.5)
                sk.textAlign(sk.CENTER)

                let offset = 5
                let text = y


                if (y === 0) {
                    text = 1
                    offset = 16
                }


                if (y % 5 === 0) {

                    if (this.settings.showGridNumbers) {
                        sk.strokeWeight(0)
                        sk.fill(this.settings.gridTextColor)

                        sk.textAlign(sk.RIGHT)
                        sk.text(text, -5,                    y * tilesize - tilecenter + offset)

                        sk.textAlign(sk.LEFT)
                        sk.text(text, 8 + xmax - tilecenter, y * tilesize - tilecenter + offset)
                    }

                    sk.strokeWeight(2)
                }

                sk.line(0, y * tilesize, xmax, y * tilesize)
            }


            // let x = Math.floor(sk.mouseX / tilesize) + 1 - this.gridMarginScale
            // let y = Math.floor(sk.mouseY / tilesize) + 1 - this.gridMarginScale

            // x = sk.constrain(x, 0, this.settings.gridWidth)
            // y = sk.constrain(y, 0, this.settings.gridHeight)

            // sk.textAlign(sk.CENTER)
            // sk.fill(this.settings.gridTextColor)
            // sk.text(`${this.selectedTool || ''} | ${x}, ${y}`, this.settings.gridWidth / 4 * tilesize, this.settings.gridHeight * tilesize + 30)
        },


        drawCursor(sk) {

            let origin = 0 - this.origin
            let tilesize    = this.settings.tilesize
            let width       = this.settings.gridWidth
            let height      = this.settings.gridHeight

            let x = origin + Math.floor(sk.mouseX / tilesize) * tilesize
            let y = origin + Math.floor(sk.mouseY / tilesize) * tilesize

            if (this.settings.showCursorMarkers) {
                sk.fill('rgba(0,0,0,0.15)')
                sk.strokeWeight(2)

                sk.square(x, 0, tilesize)
                sk.square(0, y, tilesize)
                sk.square(x, (height - 1) * tilesize,    tilesize)
                sk.square((width - 1) * tilesize,   y,                 tilesize)
            }

            sk.fill(0,0,0,0)
            sk.stroke(this.layers[this.settings.selectedLayer].color)
            sk.square(x, y, tilesize)
        },


        drawCenterMarker(sk) {
            if (!this.settings.showCenterCross) { return }

            sk.stroke(this.settings.gridTextColor)
            sk.strokeWeight(2)

            let cX = this.gridCenterX
            let cY = this.gridCenterY
            let cS = this.gridCrossSize

            sk.line(cX, cY - cS, cX, cY + cS)
            sk.line(cX - cS, cY, cX + cS, cY)

        },



        drawDebug(sk) {
            if (!this.DEBUG_MODE) { return }

            // sk.clear()

            let messages = [
                `Framerate:           ${sk.deltaTime}FPS`,
                `MouseX:              ${sk.mouseX}`,
                `MouseY:              ${sk.mouseY}`,
                `X offset:            ${this.offsetX}`,
                `Y offset:            ${this.offsetY}`,
                // `cells:               ${this.tiles.length}`,
                // `ViewOffset + MouseX: ${this.offsetX + sk.mouseX}`,
                // `ViewOffset + MouseY: ${this.offsetY + sk.mouseY}`,
                // `Zoom Level:          ${this.zoomLevel}`,
            ]

            let fontSize = 14

            sk.textFont('monospace')
            sk.textAlign(sk.LEFT, sk.CENTER)
            sk.stroke('#000')
            sk.strokeWeight(3)
            sk.textSize(fontSize)
            sk.fill(255)

            messages.forEach((el, index) => {
                sk.text(el, 10, ++index * fontSize + 10)
            })
        },



        // ==============================
        //  APP UI METHODS
        // ==============================

        newLayer() {
            let hexColor = randomHex()

            this.layers.unshift({
                title:  `Layer ${this.layers.length}`,
                color:  hexColor, // '#5fd12e',
                id:     parseInt(new Date().getTime().toString().substr(-6), 10) + this.layers.length * 100,
                // threadCount:  2,
                // stitchType:   1,
                editingtitle: false,
                icon: null,
                iconColor: getContrastYIQ(hexColor),
                // tiles: [],
            })

            this.save()
        },


        deleteLayer(index) {
            this.layers.splice(index, 1)
            this.save()
        },


        selectLayer(index) {
            this.settings.selectedLayer = index
            this.save()
        },


        nextLayer(dir) {
            this.settings.selectedLayer += dir
            this.settings.selectedLayer = this.sketch.constrain(this.settings.selectedLayer, 0, this.layers.length -1)
        },


        zoomGrid(zoom) {
            this.settings.tilesize += zoom

            this.settings.tilesize = this.sketch.constrain(this.settings.tilesize, this.settings.tilesizeMin, this.settings.tilesizeMax)
            console.debug('zoomGrid', this.settings.tilesize)

            this.adjustGrid()
        },


        nudgeDesign(x, y) {
            console.debug('nudgeDesign', x, y)
        },


        clearDesign() {
            let ans = confirm('You are about to delete your design and start over. Do you wish to continue?')

            if (ans) {
                this.tiles = {}
            }
        },



        setPageTitle(title) {
            document.title = `${title} - ${this.app.name}`
        },


        adjustGrid(sk) {

            sk = sk ? sk : this.sketch

            this.origin = this.settings.tilesize * this.gridMarginScale
            // sk.translate(this.origin, this.origin)

            // force rows and columns to numbers
            this.settings.gridHeight  = Number(this.settings.gridHeight)
            this.settings.gridWidth   = Number(this.settings.gridWidth)

            // resize canvas accordingly
            let margin  = this.origin * 2
            let width   = this.settings.gridWidth * this.settings.tilesize
            let height  = this.settings.gridHeight * this.settings.tilesize

            sk.resizeCanvas(width + margin, height + margin)

            // calc grid center
            this.gridCenterX = width / 2
            this.gridCenterY = height / 2

            // update canvas stats
            this.design.widthInches     = this.settings.gridWidth / this.settings.aidaCount
            this.design.heightInches    = this.settings.gridHeight / this.settings.aidaCount

            this.design.widthMM         = this.design.widthInches * 25.4
            this.design.heightMM        = this.design.heightInches * 25.4

            this.save()


            let designView = document.querySelector('.design-view')

            this.designViewDrawCentered = width < designView.clientWidth
        },


        save() {

            // normalize copyright date
            let design = this.design

            design.copyright = dayjs(design.copyright).format('YYYY-MM-DD')

            // invert grid text overlay colors
            this.settings.gridTextColor = getContrastYIQ(this.settings.gridBackgroundColor)


            let data = {
                layers:     this.layers,
                settings:   this.settings,
                tiles:      this.tiles,
                design,
            }

            localStorage.setItem('designdata', JSON.stringify(data))

            if (this.design.owner) {
                localStorage.setItem('copyrightOwner', this.design.owner)
            }

            this.setPageTitle(this.design.title)
            // this.compressData(data)
        },


        load() {

            // let data = window.location.hash.substr(1)
            // if (data.trim().length === 0) { return }

            let copyrightOwner = localStorage.getItem('copyrightOwner')

            if (copyrightOwner) {
                this.design.owner = copyrightOwner
            }

            let data = localStorage.getItem('designdata')

            if (!data) { return }

            data = JSON.parse(data)

            this.layers     = data.layers
            this.tiles      = data.tiles
            this.settings   = Object.assign({}, this.settings, data.settings)

            data.design.copyright = new Date(data.design.copyright)
            this.design     = data.design

            if (copyrightOwner) {
                this.design.owner = copyrightOwner
            }

            this.setPageTitle(this.design.title)

        },


        compressData(data) {
            data = compress(data)

            if (history.pushState) {
                history.pushState(null, null, `#${data}`)
            } else {
                window.location.hash = `#${data}`
            }
        },


        recalculateTilesize() {
            this.settings.tilesize = this.baseTilesize * this.zoomLevel // * (this.width / 1500)

        },


        // zoom(level) {
        //     let newZoom = this.zoomLevel + (this.zoomAdjust * level)

        //     let minZoom = 1
        //     let maxZoom = 5

        //     if (minZoom <= newZoom && newZoom <= maxZoom) {
        //         this.zoomLevel = newZoom
        //     }

        //     this.recalculateTilesize()
        // },


        // setTool(tool) {

        // },


        // addNewLayer() {

        // },


        moveLayer(index, dir) {
            let res = this.layers[index]
            this.layers.splice(index, 1)
            this.layers.splice(index + dir, 0, res)

            this.save()
        },
    },


    mounted() {
    },


    created() {

        this.load()

        document.body.classList.remove('no-js')

    },


    filters: {
        round(value, decimals=2) {
            return Number.parseFloat(value).toFixed(decimals)
        },

        datetime(datetime, format='YYYY-mm-dd') {
            datetime = datetime ? datetime : new Date()
            return dayjs(datetime).format(format)
        }
    }
})



// // ==============================
// //   ACTIONS SETUP
// // ==============================

// // NOTE: actions are based on the concatenated event.keydown parameters in order ctrl+shift+alt+code
// // EXAMPLE: 'NumpadAdd' is the '+' key on the numpad, 'shift+alt+KeyF'
// const ACTIONS = {
//     // '0':             () => { setTool(0) },
//     // '1':             () => { setTool(1) },
//     // '2':             () => { setTool(2) },
//     'NumpadAdd':        () => { zoom(1) },
//     'NumpadSubtract':   () => { zoom(-1) },
//     'PageUp':           () => { zoom(1) },
//     'PageDown':         () => { zoom(-1) },
//     'F3':               () => { DEBUG_MODE = !DEBUG_MODE }
// }


// window.addEventListener('keydown', (e) => {

//     if (e.isComposing || e.keyCode === 229) {
//         return
//     }

//     let key = []

//     e.ctrlKey   ? key.push('ctrl') : null
//     e.shiftKey  ? key.push('shift') : null
//     e.altKey    ? key.push('alt') : null

//     key.push(e.code)

//     key = key.join('+')

//     console.debug('keydown event', key)

//     if (ACTIONS[key]) { ACTIONS[key]() }
// })



// // ==============================
// //   UI METHODS
// // ==============================

// // TODO: convert this over to native P5 mousePressed(), mouseDragged(), and mouseReleased() events

// function setupEventBindings(ctx) {

//     ctx = document.getElementById('defaultCanvas0')


//     ctx.addEventListener('contextmenu', (e) => {
//         e.preventDefault()
//     })


//     ctx.addEventListener('mousedown', (e) => {

//         let isRightClick = e.button === 2

//         if (isRightClick) {
//             $view.offsetX = $view.prevOffsetX
//             $view.offsetY = $view.prevOffsetY

//             $view.isScrolling = true
//         }

//     })


//     ctx.addEventListener('mousemove', (e) => {
//         if ($view.isScrolling) {
//             $view.prevOffsetX = 0
//             $view.prevOffsetY = 0

//             $view.offsetX += e.movementX
//             $view.offsetY += e.movementY

//         }
//     })


//     ctx.addEventListener('mouseup', (e) => {
//         let isRightClick = e.button === 2

//         if (isRightClick && $view.isScrolling) {

//             $view.prevOffsetX = $view.offsetX
//             $view.prevOffsetY = $view.offsetY

//             $view.isScrolling = false
//         }
//     })
// }




// ==============================
//   APP DATA METHODS
// ==============================

/**
 * @summary Compresses `GridData[]` into a URL #hash string for bookmarking and sharing
 * @return void
 */
function compress(data) {
    // return LZString.compress(JSON.stringify(data))
    return lzwCompress.pack(data)
}


/**
 * @summary Decompresses URL #hash and hydrates `GridData[]`
 * @return {array<Tile>} A collection of `Tile()` objects
 */
function decompress(data) {
    return lzwCompress.unpack(data.split(','))
}


function queryStringEncode(obj) {
    let queryString = []

    Object.keys(obj).forEach((el, key) => {
        if (el.toString) {
            el = el.toString()
        }

        queryString.push(`${key}=${el}`)
    })

    return '?' + queryString.join('&')
}


function debounce(func, wait, immediate) {
    var timeout
    return function() {
        var context = this, args = arguments
        var later = function() {
            timeout = null
            if (!immediate) func.apply(context, args)
        }
        var callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) func.apply(context, args)
    }
}


function indexToXY(index, width, height) {
    if (index > width * height) { return [ null, null ] }

    let x = index % width
    let y = Math.floor(index / width)

    return [x, y]
}


function xyToIndex(x, y, width, height) {
    let index = x + (y * width)
    if (index > width * height) { return null }
    return index
}


function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)]
}


/**
 * Paul Irish's random hex color code generator
 * @sauce: https://www.paulirish.com/2009/random-hex-color-code-snippets/
 * @return {string} A random hex color string
 */
function randomHex() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16)
}


/**
 * Gets the contrast yiq.
 *
 * @sauce: https://gomakethings.com/dynamically-changing-the-text-color-based-on-background-color-contrast-with-vanilla-js/
 * @param      {string}   hexcolor  The hexcolor
 * @return     {boolean}  The contrast yiq.
 */
function getContrastYIQ(hexcolor){
    // If a leading # is provided, remove it
    if (hexcolor.slice(0, 1) === '#') {
        hexcolor = hexcolor.slice(1);
    }

    // If a three-character hexcode, make six-character
    if (hexcolor.length === 3) {
        hexcolor = hexcolor.split('').map(function (hex) {
            return hex + hex;
        }).join('');
    }

    // Convert to RGB value
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);

    // Get YIQ ratio
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (yiq >= 128) ? '#000000' : '#ffffff';
}

