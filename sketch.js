/* 
    fix render pixel height
*/

let width, height, mRows, mCols, cls, ratio, mapZoomed,
    rayBuf, fov, worldMap, renderMap, renderView, mapOff, drawOff, pxl,
    mx, my, ceilClr, floorClr, placeTxtrNum, pl0, pl1

function setup() {
    createMyCanvas()
    background('gray')

    worldMap = makeMap(myMap);

    // worldMap = makeMap(cellularAutomata(makeMatrix(48, 48, 0.45), 8));
    // loadTxtrs().then(ts => Player.textures = ts);
    // loadTxtrs().then(ts => wallTextures[1]=wallTextures[1] = ts[0]);
    // Player.spawnMany(5);

    pl0 = new Player(6.5, 2.5, 0)
    pl1 = new Player(8.5, 3.5, 180 - 30)
    Player.spawnMany(5);
    fov = 90
    pxl = 4
    mapZoomed = false
    fitMap()
    mapOff = getMapOff()
    drawOff = getDrawMapOff()
    ceilClr = 'lightBlue'
    floorClr = 'lightGreen'
    placeTxtrNum = 0

    renderMap = false
    renderView = true
}


function draw() {
    rayBuf = castRays(pl0.pos, pl0.ang)
    if (renderView) drawView(rayBuf);
    if (renderMap) drawMap(rayBuf);
    if (!pl0.alive) {
        fill(0, 127);
        rect(0, 0, width, height);
    }
    if (pointerLocked()) {
        pl0.update([87, 65, 83, 68])
        pl1.update([
            UP_ARROW,
            LEFT_ARROW,
            DOWN_ARROW,
            RIGHT_ARROW
        ]) // for testing
    }

    // show FPS
    fill(0, 127);
    rect(0, 0, 65, 30)
    fill('white');
    text(`FPS: ${Math.round(1000 / deltaTime)}`, 10, 20);
}

function pointerLocked() {
    return document.pointerLockElement !== null;
}


// other functions

function updateMouse() {
    mx = mouseX - mapOff.x
    my = mouseY - mapOff.y
    if (mapZoomed) {
        mx += (pl0.pos.x - mCols / 2) * cls
        my += (pl0.pos.y - mRows / 2) * cls
    }
}

function createMyCanvas() {
    ratio = window.screen.height / window.screen.width
    width = window.innerWidth
    height = width * ratio
    if (height > window.innerHeight) {
        height = window.innerHeight
        width = height / ratio
    }
    createCanvas(width, height)
}

function mouseOnMap() {
    return (
        renderMap &&
        mx > 0 && mx < mCols * cls &&
        my > 0 && my < mRows * cls
    )
}

function renderMode(opt = 1) {
    if (opt == 1) {
        renderMap = false
        requestPointerLock()
    } else if (opt == 2) {
        renderMap = true
        exitPointerLock()
    }
}


// Input functions

function mouseWheel(event) {
    let scroll = event.delta < 0
    if (scroll) cls *= 1.1
    else cls /= 1.1

    mapZoomed = cls * mCols > width || cls * mRows > height
    if (!mapZoomed) fitMap()

    mapOff = getMapOff()
    drawOff = getDrawMapOff()
    return false;
}

function setKeyNum(kc) {
    let kn = kc - 48
    if (kn < 0 || kn > wallTextures.length) {
        placeTxtrNum = 0
    } else {
        placeTxtrNum = kn
    }
}

function keyPressed(e) {
    setKeyNum(keyCode)

    if (keyCode == 70) {
        if (renderMap) {
            renderMode(1)
        } else {
            renderMode(2)
        }
    }
}

function mousePressed() {
    pl0.aim = (mouseButton == RIGHT);
    if (renderMap) {
        if (mouseOnMap()) {
            updateMouse()
            let cell = getCell(mx, my)
            placeCell(worldMap, cell, placeTxtrNum)
        } else {
            renderMode(1)
        }
    } else if (renderView) {
        if (pointerLocked()) pl0.shoot()
        renderMode(1)
    }
}

document.oncontextmenu = () => false;

function mouseReleased() { pl0.aim = false; }

function mouseMoved() {
    updateMouse()
    if (pointerLocked()) pl0.rotate()
    // for testing
    if (renderMap) {
        pl1.ang = 180 - degrees(atan2(
            pl1.pos.y * cls + drawOff.y - mouseY,
            pl1.pos.x * cls + drawOff.x - mouseX
        ))
        pl1.ang = normalAng(pl1.ang)
    }
}

function mouseDragged() {
    mouseMoved();
    if (renderMap)
        placeCell(worldMap, getCell(mx, my), placeTxtrNum)
}