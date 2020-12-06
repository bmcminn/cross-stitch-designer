'use strict';


// COLOR CONSTANTS
const WHITE         = '#ffffff'
const BLACK         = '#000000'
const DEBUG_COLOR   = '#ff9900'



new Vue({
    el: '#app',
    data() {
        return {

            app: {
                name: 'Cross Stitch Designer',
                version: '0.16 Alpha',
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

            gridCrossSize: 5,
            gridMarginScale: 4,

            gridCenterX: 0,
            gridCenterY: 0,

            designViewDrawCentered: false,

            originOffset: 0,
            framerate: 20,
            isScrolling: false,

            currentTool: 'linestitch',

            isMouseDragging: false,
            ruler: [],

            tiles: {},
            lines: [],

            undolist: [],
            undolength: 20,

            templine: [],
            tempcoords: [],

            activeTool: null,

            actions: {
                'F3':   () => { this.DEBUG_MODE = !this.DEBUG_MODE },
                ']':    () => { this.nextLayer(1) },
                '[':    () => { this.nextLayer(-1) },
                '+':    () => { this.zoomGrid(1) },
                '-':    () => { this.zoomGrid(-1) },

                // TODO: integrate sk.save(c, filename) to export design image
                // case 'ctrl+e':          this.export()

                // case 'g':   this.showGrid = !this.showGrid; break
                // case 'ArrowLeft':   this.nudgeDesign(-1, 0); break
                // case 'ArrowUp':     this.nudgeDesign(0, -1); break
                // case 'ArrowRight':  this.nudgeDesign(1, 0); break
                // case 'ArrowDown':   this.nudgeDesign(0, 1); break
            },


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
                aidaCount: 14,
                aidaCountMax: 28,
                aidaCountMin: 7,
                colorCounter: 100,
                colorMap: {},
                gridBackgroundColor: WHITE,
                gridHeight: 30,
                gridLineColor: '#dfdfdf',
                gridSizeMax: 130,
                gridSizeMin: 10,
                gridTextColor: BLACK,
                gridWidth: 30,
                selectedLayer: null,
                showCenterCross: true,
                showCursorMarkers: true,
                showGrid: true,
                showGridNumbers: true,
                tilesize: 12,
                tilesizeMax: 20,
                tilesizeMin: 8,
            },



            layers: [
                {
                    color: '#5fd12e',
                    editingtitle: false,
                    id: 15,
                    isVisible: true,
                    title: 'green',
                },

                {
                    color: '#8080ff',
                    editingtitle: false,
                    id: 16,
                    isVisible: true,
                    title: 'puple',
                },
            ],


            tools: [
                {
                    name: 'Ruler',
                    icon: 'fa-ruler',
                    command: 'R',
                    enabled: true,

                    draw: (sk) => {
                        let [x,y]       = this.getMouseCoords()
                        let cursorSize  = 10
                        let ruler       = this.ruler
                        let rulerColor  = DEBUG_COLOR
                        let tileCenter  = Math.floor(this.settings.tilesize / 2)
                        let tilesize    = this.settings.tilesize

                        sk.stroke(rulerColor)
                        sk.strokeWeight(cursorSize)

                        // draw initial ruler cursor
                        sk.point(x * tilesize + tileCenter, y * tilesize + tileCenter)

                        // break early if there's nothing to show
                        if (ruler.length === 0) { return }

                        let [x1, y1, x2, y2] = ruler

                        // if x2,y2 is undefined, use mouse coords
                        x2 = x2 ?? x
                        y2 = y2 ?? y

                        let [dx, dy] = deltaXY(x1, y1, x2, y2)

                        x1 = x1 * tilesize + tileCenter
                        x2 = x2 * tilesize + tileCenter
                        y1 = y1 * tilesize + tileCenter
                        y2 = y2 * tilesize + tileCenter

                        sk.point(x1, y1)
                        sk.point(x2, y2)

                        sk.strokeWeight(Math.floor(cursorSize / 3))
                        sk.line(x1, y1, x2, y2)

                        sk.stroke(WHITE)
                        sk.strokeWeight(3)
                        sk.fill('black')
                        sk.text(`x: ${dx}, y: ${dy}`, x2, y2)
                    },

                    keyPressed: (key) => {
                        if (key === 'Escape') {
                            this.ruler = []
                            return false
                        }
                    },

                    mousePressed: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }
                        let cmd = this.getKeyCommand(`mouse_${sk.mouseButton}`)

                        let [x, y] = this.getMouseCoords()

                        this.ruler = this.ruler ?? []
                        this.ruler.push(x,y)

                        if (this.ruler.length > 4) {
                            this.ruler = []
                            this.ruler.push(x,y)
                        }


                    },

                    toolChanged: () => {
                        this.ruler = []
                    },
                },

                {
                    name: 'Eraser',
                    icon: 'fa-eraser',
                    command: 'E',
                    enabled: true,

                    draw: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }
                        this.drawCursor()
                    },

                    mouseClicked: (sk) => {
                        let cmd = this.getKeyCommand(`mouse_${sk.mouseButton}`)

                        if (!this.isCursorInbounds(false)) { return }

                        let [x, y] = this.getMouseCoords()
                        let coord = `${x},${y}`

                        if (this.tiles[coord]) { delete this.tiles[coord] }

                        this.save()

                        return false
                    },

                    mousePressed: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }
                        let cmd = this.getKeyCommand(`mouse_${sk.mouseButton}`)
                        this.isMouseDragging = true
                    },

                    mouseDragged: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }
                        if (!this.isMouseDragging) { return }

                        let [x, y] = this.getMouseCoords()
                        let coord = `${x},${y}`

                        if (this.tiles[coord]) { delete this.tiles[coord] }
                        // this.tiles[coord] = [x, y, this.settings.selectedLayer]

                        return false
                    },

                    mouseReleased: (sk) => {
                        this.isMouseDragging = false
                        this.save()
                    },

                    undo: (ctx) => {
                    },
                },

                {
                    name: 'Brush',
                    icon: 'fa-paint-brush',
                    command: 'B',
                    enabled: true,

                    draw: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }
                        this.drawCursor()
                    },

                    keyPressed: (sk) => {
                    },

                    mouseClicked: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }

                        let cmd = this.getKeyCommand(`mouse_${sk.mouseButton}`)

                        let [x, y] = this.getMouseCoords()
                        let coord = `${x},${y}`

                        this.tiles[coord] = [x, y, this.settings.selectedLayer]

                        return false
                    },

                    mousePressed: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }

                        let cmd = this.getKeyCommand(`mouse_${sk.mouseButton}`)

                        this.isMouseDragging = true
                    },

                    mouseDragged: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }
                        if (!this.isMouseDragging) { return }

                        let [x, y] = this.getMouseCoords()
                        let coord = `${x},${y}`

                        this.tiles[coord] = [x, y, this.settings.selectedLayer]

                        return false
                    },

                    mouseReleased: (sk) => {
                        this.isMouseDragging = false
                        this.save()
                    },

                    toolChanged: (sk) => {
                    },

                    undo: (ctx) => {
                    },
                },

                {
                    name: 'Pen',
                    icon: 'fa-pen-nib',
                    command: 'P',
                    enabled: true,

                    draw: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }

                        this.drawCursor()

                        this.tempcoords = this.tempcoords ?? []

                        let drawColor = this.getDrawColor()

                        this.tempcoords.forEach(el => {
                            this.drawTile({
                                x1:             el[0],
                                y1:             el[1],
                                fill:           drawColor,
                                strokeWeight:   0,
                            })
                        })

                    },

                    keyPressed: (key) => {
                        if (key === `Escape`) {
                            this.templine = []
                            this.tempcoords = []
                            return false
                        }
                    },

                    mouseMoved: () => {
                        // let cmd = this.getKeyCommand(`mouse_${sk.mouseButton}`)

                        console.debug('pen::mouseMoved')
                        this.templine = this.templine ?? []

                        if (this.templine.length < 1) { return }

                        let [mx, my] = this.getMouseCoords()
                        let [x1, y1] = this.templine

                        this.tempcoords = this.interpolateLine(x1, y1, mx, my)
                    },

                    mousePressed: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }

                        let [x, y] = this.getMouseCoords()
                        let cmd = this.getKeyCommand(`mouse_${sk.mouseButton}`)

                        this.templine = this.templine ?? []

                        this.templine.push(x,y)

                        console.debug('pen clicked', this.templine)

                        if (this.templine.length >= 4) {

                            let drawColor = this.getDrawColor()

                            this.tempcoords.forEach(el => {
                                let [x,y] = el
                                this.tiles[`${x},${y}`] = [x,y,this.settings.selectedLayer]
                            })

                            this.tempcoords = []

                            this.templine = []
                            this.templine.push(x,y)
                            // this.save()
                        }

                    },

                    toolChanged: () => {
                        this.templine = []
                    },
                },

                {
                    name: 'Fill',
                    icon: 'fa-fill-drip',
                    command: 'F',
                    enabled: true,

                    draw: (sk) => {
                        if (!this.isCursorInbounds()) { return }
                        this.drawCursor()
                    },

                    keyPressed: (sk) => {
                    },

                    mouseClicked: (sk) => {
                        if (!this.isCursorInbounds()) { return }

                        let cmd = this.getKeyCommand(`mouse_${sk.mouseButton}`)

                        let [x,y] = this.getMouseCoords()

                        let [xmin, ymin, xmax, ymax] = this.getDesignCoords()

                        let visited = {}

                        let drawColor = this.settings.selectedLayer
                        let startColor = this.tiles[`${x},${y}`]

                        startColor = startColor ? startColor[2] : 0

                        this.floodFill(x, y, visited, startColor, drawColor, xmin, ymin, xmax, ymax)

                        visited = Object.keys(visited)

                        const FILL_THRESHOLD = 5000

                        if (visited.length > FILL_THRESHOLD) {

                            let FILL_THRESHOLD_MESSAGE =
                                `Filling in more than ${FILL_THRESHOLD} stitches may lead to performance issues. Do you wish to continue?`

                            if (!window.confirm(FILL_THRESHOLD_MESSAGE)) {
                                return
                            }
                        }

                        visited.forEach(coord => {
                            let [x,y] = coord.split(',').map(el => Number(el))
                            this.tiles[coord] = [x,y,drawColor]
                        }, this)

                        this.save()
                    },

                    toolChanged: (sk) => {
                    },
                },

                {
                    name: 'Eyedropper',
                    icon: 'fa-eye-dropper',
                    command: 'I',
                    enabled: true,

                    draw: (sk) => {
                        if (!this.isCursorInbounds()) { return }
                        this.drawCursor()
                    },

                    mousePressed: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }
                        let [x, y] = this.getMouseCoords()
                        let cmd = this.getKeyCommand(`mouse_${sk.mouseButton}`)

                        let coord = `${x},${y}`

                        let tile = this.tiles[coord]

                        if (tile) {
                            this.settings.selectedLayer = tile[2]

                            this.save()
                        }
                    },
                },

                {
                    name: 'Select',
                    icon: 'fa-crop-alt',
                    command: 'S',

                    draw: (sk) => {
                    },

                    keyPressed: (sk) => {
                    },

                    mousePressed: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }
                        let cmd = this.getKeyCommand(`mouse_${sk.mouseButton}`)
                    },

                    toolChanged: (sk) => {
                    },
                },

                {
                    name: 'Line Stitch',
                    icon: 'fa-slash',
                    command: 'L',
                    enabled: false,

                    draw: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }

                        let [mx, my] = this.getMouseCoords()

                        let tilesize = this.settings.tilesize

                        this.templine = this.templine ?? []

                        sk.noCursor()
                        sk.stroke(this.layers[this.settings.selectedLayer].color)
                        sk.strokeWeight(6)
                        sk.point(mx * tilesize, my * tilesize)

                        if (this.templine.length > 0) {
                            let [x1, y1] = this.templine

                            sk.strokeWeight(3)
                            sk.stroke(this.layers[this.settings.selectedLayer].color)
                            sk.line(x1 * tilesize, y1 * tilesize, mx * tilesize, my * tilesize)
                        }
                    },

                    keyPressed: (key) => {
                        if (key === `Escape`) {
                            this.templine = []
                            return false
                        }
                    },

                    mousePressed: (sk) => {
                        if (!this.isCursorInbounds(false)) { return }

                        let [x, y] = this.getMouseCoords()
                        let cmd = this.getKeyCommand(`mouse_${sk.mouseButton}`)

                        this.templine = this.templine ?? []

                        this.templine.push(x, y)

                        if (this.templine.length >= 4) {
                            this.lines.push([...this.templine, this.settings.selectedLayer])

                            this.templine = []
                            this.templine.push(x,y)

                            this.save()
                        }
                    },

                    toolChanged: () => {
                        this.templine = []
                    },
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
        },


        draw(sk) {
            sk.clear()
            sk.background(WHITE)
            sk.cursor()
            sk.translate(this.originOffset, this.originOffset)

            this.drawTiles(sk)

            this.drawGrid(sk)

            this.drawLines(sk)

            this.drawDebug(sk)

            // this.drawRuler(sk)
            if (this.activeTool?.draw) {
                this.activeTool.draw(sk)
            }

            this.drawCenterMarker(sk)
        },


        windowresized(sk) {
            this.adjustGrid(sk)
        },


        keypressed(sk) {
            if (sk.isComposing || sk.keyCode === 229) {
                return
            }

            let res = null
            let cmd = this.getKeyCommand(sk.key)

            if (this.actions[cmd]) {
                res = this.actions[cmd]()
                if (res === false) { return false }
            }

            let tool = this.tools.find(el => sk.key === el.command.toLowerCase() ? el : null)

            this.changeActiveTool(tool)

            if (this.activeTool?.keyPressed) {
                res = this.activeTool?.keyPressed(cmd)
                if (res === false) { return false }
            }
        },


        mousepressed(sk) {
            if (this.activeTool?.mousePressed) {
                let res = this.activeTool.mousePressed(sk)
                if (res === false) { return res }
            }
        },


        mouseclicked(sk) {
            if (this.activeTool?.mouseClicked) {
                let res = this.activeTool.mouseClicked(sk)
                if (res === false) { return res }
            }
        },


        mousemoved(sk) {
            if (this.activeTool?.mouseMoved) {
                let res = this.activeTool.mouseMoved()
                if (res === false) { return res }
            }

            // if (this.activeTool?.mouseMoved) {
            //     debounce(this.activeTool.mouseMoved.bind(this), 50)

            //     // if (res === false) { return res }
            // }
        },


        mousedragged(sk) {
            if (this.activeTool?.mouseDragged) {
                let res = this.activeTool.mouseDragged(sk)
                if (res === false) { return res }
            }
        },


        mousereleased(sk) {
            if (this.activeTool?.mouseReleased) {
                let res = this.activeTool.mouseReleased(sk)
                if (res === false) { return res }
            }
        },


        // ========================================
        //  DRAW METHODS
        // ========================================

        drawTiles(sk) {

            if (!this.tiles) { return }

            // let tilesize = this.settings.tilesize

            let origin = -this.originOffset
            // sk.translate(this.originOffset, this.originOffset)

            let [xmin, ymin, xmax, ymax] = this.getDesignPixelDimensions()

            sk.strokeWeight(2)
            sk.stroke(this.settings.gridLineColor)
            sk.fill(this.settings.gridBackgroundColor)
            sk.rect(xmin, ymin, xmax, ymax)


            Object.keys(this.tiles).forEach((key, el) => {

                if (!this.tiles.hasOwnProperty(key)) { return }

                let [x1, y1, colorId] = this.tiles[key]

                if (x1 < 0 || y1 < 0) { return }

                if (!this.getDrawColorIsVisible(colorId)) { return }

                this.drawTile({
                    x1, y1,
                    fill: this.getDrawColor(colorId),
                    strokeWeight: 0,
                })

                // sk.strokeWeight(0)
                // sk.fill(this.getDrawColor(colorId))
                // sk.square(Number(x) * tilesize, Number(y) * tilesize, tilesize)

            }, this)
        },


        drawLines(sk) {

            if (!this.lines) { return }

            let tilesize = this.settings.tilesize

            sk.strokeWeight(3)

            this.lines.forEach((el, index) => {

                let [x1, y1, x2, y2, colorIndex] = el

                sk.stroke(this.layers[colorIndex].color)
                sk.line(x1 * tilesize, y1 * tilesize, x2 * tilesize, y2 * tilesize)

            })
        },


        drawTriangle(x, y, size, dir, color=BLACK) {
            let sk = this.sketch

            dir = new String(dir).trim().toLowerCase()

            // test if dir is valid
            if (!'up|right|down|left'.includes(dir)) { return }


            if ('up|left'.includes(dir)) { size *= -1 }

            // center triangle around target x,y origin
            x -= size / 2
            y -= size / 2

            sk.strokeWeight(0)
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

            let [xmin, ymin, xmax, ymax] = this.getDesignPixelDimensions()

            let gridWidth   = this.settings.gridWidth
            let gridHeight  = this.settings.gridHeight

            let triSize     = 12
            let triOffset   = 25

            let xCenter = xmax / 2
            let yCenter = ymax / 2


            this.drawTriangle(xCenter, 0-triOffset,         triSize, 'down')
            this.drawTriangle(xCenter, ymax + triOffset,    triSize, 'up')
            this.drawTriangle(0 - triOffset,    yCenter,    triSize, 'right')
            this.drawTriangle(xmax + triOffset, yCenter,    triSize, 'left')


            // setup text settings
            sk.fill(0,0,0,0)
            sk.textAlign(sk.CENTER)
            sk.stroke(this.settings.gridLineColor)


            // draw vertical grid lines
            for (let x = gridWidth; x >= 0; x--) {

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
            for (let y = gridHeight; y >= 0; y--) {

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


            // let [x, y] = this.getMouseCoords()
            // x -= 1
            // y -= 1

            // x = sk.constrain(x, 0, gridWidth)
            // y = sk.constrain(y, 0, gridHeight)

            // sk.textAlign(sk.CENTER)
            // sk.fill(this.settings.gridTextColor)
            // sk.text(`${this.activeTool?.name || ''} | ${x}, ${y}`, this.settings.gridWidth / 4 * tilesize, this.settings.gridHeight * tilesize + 30)
        },


        drawCursor() {

            let sk = this.sketch

            let origin      = 0 - this.originOffset
            let tilesize    = this.settings.tilesize
            let width       = this.settings.gridWidth
            let height      = this.settings.gridHeight

            let x = origin + Math.floor(sk.mouseX / tilesize) * tilesize
            let y = origin + Math.floor(sk.mouseY / tilesize) * tilesize



            // draw square cursor

            sk.noCursor()

            if (this.settings.showCursorMarkers) {
                sk.fill('rgba(0,0,0,0.15)')
                sk.strokeWeight(2)

                sk.square(x, 0, tilesize)
                sk.square(0, y, tilesize)
                sk.square(x, (height - 1) * tilesize,    tilesize)
                sk.square((width - 1) * tilesize,   y,                 tilesize)
            }

            sk.fill(0,0,0,0)
            sk.stroke(this.getDrawColor())
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


        interpolateLine(x0, y0, x1, y1) {

            // let [dx, dy] = deltaXY(x1, y1, x2, y2)

            let tiles = []

            if (x0 === x1 && y0 === y1) { return tiles }

            let dx = Math.abs(x1-x0)
            let sx = x0 < x1 ? 1 : -1
            let dy = -Math.abs(y1-y0)
            let sy = y0<y1 ? 1 : -1
            let err = dx+dy  /* error value e_xy */

            while (true) {  /* loop */
                tiles.push([x0, y0]);

                if (x0 == x1 && y0 == y1) { break }

                let e2 = 2 * err;

                if (e2 >= dy) { /* e_xy+e_x > 0 */
                    err += dy;
                    x0 += sx;
                }
                if (e2 <= dx) { /* e_xy+e_y < 0 */
                    err += dx;
                    y0 += sy;
                }
            }

            return tiles
        },


        drawTile(opts = {}) {

            let sk          = this.sketch
            let tilesize    = this.settings.tilesize

            const defaults = {
                x1: null,
                y1: null,
                x2: null,
                y2: null,
                fill: BLACK,
                strokeColor: BLACK,
                strokeWeight: 0,
            }

            opts = Object.assign({}, defaults, opts)

            if (!opts.x1 && !opts.y1) { return }

            sk.stroke(opts.strokeColor)
            sk.strokeWeight(opts.strokeWeight)
            sk.fill(opts.fill)

            if (opts.x2 && opts.y2) {
                sk.rect(
                    Number(opts.x1) * tilesize,
                    Number(opts.y1) * tilesize,
                    Number(opts.x2) * tilesize,
                    Number(opts.y2) * tilesize
                )
            } else {
                sk.square(
                    Number(opts.x1) * tilesize,
                    Number(opts.y1) * tilesize,
                    tilesize
                )
            }

        },



        // ========================================
        //  Coordinate helpers
        // ========================================

        /**
         * Gets the mouse coordinates relative to grid row/columns
         *
         * @return     {Array}  The mouse coordinates.
         */
        getMouseCoords() {
            let sk = this.sketch

            let x = Math.floor(sk.mouseX / this.settings.tilesize) - this.gridMarginScale
            let y = Math.floor(sk.mouseY / this.settings.tilesize) - this.gridMarginScale

            // console.debug('getMouseCoords', x, y, this.originOffset)

            return [x,y]
        },


        isCursorInbounds(inclusive = true) {
            let [mx, my]    = this.getMouseCoords()
            let [xmin, ymin, xmax, ymax] = this.getDesignCoords(inclusive)

            // console.debug('isCursorInbounds', mx, my, xmin, ymin, xmax, ymax)

            return xmin <= mx && mx <= xmax && ymin <= my && my <= ymax
        },


        getKeyCommand(key) {
            let sk = this.sketch

            if (!sk) { return }

            let command = []

            sk.keyIsDown(sk.CONTROL) ? command.push('ctrl') : null
            sk.keyIsDown(sk.SHIFT) ? command.push('shift') : null
            sk.keyIsDown(sk.ALT) ? command.push('alt') : null

            command.push(key)

            return command.join('+')
        },


        getDesignPixelDimensions(sk) {
            return [
                0,
                0,
                this.settings.gridWidth * this.settings.tilesize,
                this.settings.gridHeight * this.settings.tilesize,
            ]
        },


        /**
         * Gets the design grid coordinates.
         *
         * @return  Array<[xmin, ymin, xmax, ymax]>  The design grid coordinates.
         *
         */
        getDesignCoords(inclusive = true) {
            let width   = this.settings.gridWidth
            let height  = this.settings.gridHeight

            if (!!!inclusive) {
                width -= 1
                height -= 1
            }

            return [ 0, 0, width, height ]
        },


        changeActiveTool(tool) {

            let isSameTool = tool?.name === this.activeTool?.name
            let isToolActive = tool?.isActive

            if (!tool || isSameTool || isToolActive) { return }

            console.info('tool changed to', tool.name)

            // allow currently selected tool to cleanup after itself as needed
            if (this.activeTool?.toolChanged) {
                this.activeTool?.toolChanged()
            }

            this.activeTool = tool
        },


        // ==============================
        //  APP UI METHODS
        // ==============================

        newLayer() {
            let hexColor = randomHex()

            this.settings.colorCounter += 1

            this.layers.unshift({
                title:  `Layer ${this.layers.length}`,
                color:  hexColor, // '#5fd12e',
                id:     this.settings.colorCounter,
                // threadCount:  2,
                // stitchType:   1,
                editingtitle: false,
                icon: null,
                iconColor: getContrastYIQ(hexColor),
                // tiles: [],
            })

            this.updateColorMap()

            this.save()
        },


        deleteLayer(index) {
            if (this.layers.length - 1 < 1) { return }
            // let nextIndex = index
            this.layers.splice(index, 1)

            this.updateColorMap()

            this.save()
        },


        selectLayer(colorId) {
            this.settings.selectedLayer = colorId
            this.save()
        },


        nextLayer(direction) {
            let index = this.settings.colorMap[this.settings.selectedLayer]
            index += direction
            index = this.sketch.constrain(index, 0, this.layers.length -1)
            this.settings.selectedLayer = this.layers[index].id
            this.save()
        },


        getDrawColorIsVisible(colorId = null) {
            colorId = colorId ?? this.settings.selectedLayer
            let index = this.settings.colorMap[colorId]
            return this.layers[index].isVisible
        },


        getDrawColor(colorId = null) {
            colorId = colorId ?? this.settings.selectedLayer
            let index = this.settings.colorMap[colorId]
            return this.layers[index].color
        },


        updateColorMap() {
            this.settings.colorMap = {}

            this.layers.forEach((el, index) => {
                this.settings.colorMap[el.id] = index
            }, this)
        },


        moveLayer(index, dir) {
            let res = this.layers[index]
            this.layers.splice(index, 1)
            this.layers.splice(index + dir, 0, res)

            this.updateColorMap()

            this.save()
        },


        toggleLayerVisibility(index) {
            this.layers[index].isVisible = !this.layers[index].isVisible
        },


        zoomGrid(zoom) {
            this.settings.tilesize += zoom

            this.settings.tilesize = this.sketch.constrain(this.settings.tilesize, this.settings.tilesizeMin, this.settings.tilesizeMax)
            // console.debug('zoomGrid', this.settings.tilesize)

            this.adjustGrid()
        },


        nudgeDesign(x, y) {
            console.debug('nudgeDesign', x, y)
        },


        clearDesign() {
            let ans = confirm('You are about to delete your design and start over. Do you wish to continue?')

            if (ans) {
                this.tiles = {}
                this.lines = []
            }

            this.save()
        },


        setPageTitle(title) {
            document.title = `${title} - ${this.app.name}`
        },


        adjustGrid(sk) {

            sk = sk ? sk : this.sketch

            this.originOffset = this.settings.tilesize * this.gridMarginScale
            // sk.translate(this.originOffset, this.originOffset)

            // force rows and columns to numbers
            this.settings.gridHeight  = Number(this.settings.gridHeight)
            this.settings.gridWidth   = Number(this.settings.gridWidth)

            // resize canvas accordingly
            let margin  = this.originOffset * 2
            let width   = this.settings.gridWidth * this.settings.tilesize
            let height  = this.settings.gridHeight * this.settings.tilesize

            sk.resizeCanvas(width + margin, height + margin)

            this.gridCenterX = width / 2
            this.gridCenterY = height / 2

            this.design.widthInches     = this.settings.gridWidth / this.settings.aidaCount
            this.design.heightInches    = this.settings.gridHeight / this.settings.aidaCount

            this.design.widthMM         = this.design.widthInches * 25.4
            this.design.heightMM        = this.design.heightInches * 25.4

            this.save()

            this.designViewDrawCentered = width < document.querySelector('.design-view').clientWidth
        },



        floodFill(x, y, visited, startColor, drawColor, a, b, c, d) {
            let coord       = `${x},${y}`
            let coordColor  = this.tiles[coord]

            coordColor = coordColor ? coordColor[2] : 0

            if (x >= c || y >= d) { return }
            if (x < a || y < b) { return }
            if (visited[coord] === true) { return }
            if (coordColor !== startColor) { return }
            if (coordColor === drawColor) { return }

            visited[coord] = true

            // x-1,y-1 | x,y-1 | x+1,Y-1
            // x-1,y   | x,y   | x+1,y
            // x-1,y+1 | x,y+1 | x+1,y+1

            this.floodFill(x-1, y,   visited, startColor, drawColor, a, b, c, d)
            this.floodFill(x+1, y,   visited, startColor, drawColor, a, b, c, d)
            this.floodFill(x,   y-1, visited, startColor, drawColor, a, b, c, d)
            this.floodFill(x,   y+1, visited, startColor, drawColor, a, b, c, d)
            // floodFill(x-1, y-1, visited, n, m)
            // floodFill(x-1, y+1, visited, n, m)
            // floodFill(x+1, y-1, visited, n, m)
            // floodFill(x+1, y+1, visited, n, m)

        },




        // =============================================
        //  DATA/SESSION METHODS
        // =============================================

        save() {

            // normalize copyright date
            let design = this.design

            design.copyright = dayjs(design.copyright).format('YYYY-MM-DD')

            // invert grid text overlay layers
            this.settings.gridTextColor = getContrastYIQ(this.settings.gridBackgroundColor)


            let data = {
                layers:     this.layers,
                settings:   this.settings,
                tiles:      this.tiles,
                lines:      this.lines,
                design,
            }

            localStorage.setItem('designdata', JSON.stringify(data))

            if (this.design.owner) {
                localStorage.setItem('copyrightOwner', this.design.owner)
            }

            this.setPageTitle(this.design.title)
            // this.compressData(data)
        },


        load(data) {

            // let data = window.location.hash.substr(1)
            // if (data.trim().length === 0) { return }

            this.design = this.design || {}

            let copyrightOwner = localStorage.getItem('copyrightOwner')

            if (copyrightOwner) {
                this.design.owner = copyrightOwner
            }

            data = data ?? localStorage.getItem('designdata')

            if (!data) { return }

            data = JSON.parse(data)

            this.layers     = data.layers
            this.tiles      = data.tiles
            this.lines      = data.lines
            this.settings   = Object.assign({}, this.settings, data.settings)

            data.design.copyright = new Date(data.design.copyright)
            this.design     = data.design

            if (copyrightOwner) {
                this.design.owner = copyrightOwner
            }

            this.updateColorMap()
            this.selectLayer(this.settings.selectedLayer)
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


    },


    mounted() {

        this.load()

        this.settings.selectedLayer = this.settings.selectedLayer ?? this.layers[0]

        document.body.classList.remove('no-js')

    },


    created() {

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


function deltaXY(x1, y1, x2, y2) {
    let dx = Math.abs(x1 - x2) + 1
    let dy = Math.abs(y1 - y2) + 1

    let dl = Math.floor(Math.hypot(dx, dy))

    return [dx, dy, dl]
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

    return (yiq >= 128) ? BLACK : WHITE;
}


function isArray(array) {
    return Array.isArray(array)
}


function isString(val) {
    return typeof(val) === 'string'
}


function isEmpty(val) {
    if (val === null) { return true }

    if (isString(val) || isArray(val)) {
        return val.length > 0
    }

    return false
}
