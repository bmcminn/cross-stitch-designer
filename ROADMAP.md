Feature: Undo

- setup empty `undo[]` array
- setup `currentUndo` index value
- when `.save()` is called, snapshot the `tiles[]` array and unshift it onto `undo[]`; update `currentUndo = 0`
- when `ctrl+z` is fired, update `this.currentUndo += 1`; assign `this.tiles = this.undo[this.currentUndo]`
- when `ctrl+shift+z` is fired, update `this.currentUndo -= 1`; assign `this.tiles = this.undo[this.currentUndo]`

Notes:

- need a macro for `undoAction(direction)` where `direction = +-1`


=====