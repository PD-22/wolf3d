var width, height, mapHeight, mapWidth, cls, mapZoomed,
    rayBuf, fov, worldMap, mapVisible, viewVisible, mapOff, drawOff,
    ceilClr, floorClr, placeTxtrNum, pl0, pl1, logVisible,
    displayBuf, prevDisplayBuf, displayWidth, displayHeight, dScale,
    pixelCount, redraw, stopRender, stopDraw, animDoorList,
    mapRayNum, volume, ammo1, entDoorSide;

let debugLogs = {};

function setup() {
    entDoorSide = 'x'; // tmp

    displayWidth = 160;
    displayHeight = 90;
    makeDisplayBuf();

    createMyCanvas()
    worldMap = makeMap(myMap);
    animDoorList = [];

    // worldMap = cellularMap(48, 48, 0.45, 8);

    // pl0 = new Player(4.01, 5.01, 100.1, 4)
    pl0 = new Player(3.81, 5.01, 90.1, 4)
    // pl1 = new Player(3.51, 2.01, 0, 8)
    // Player.spawnMany(15, null, null, null, 8);
    // ammo1 = new Item(pl1.pos.x, pl1.pos.y - 2, ammo_64, 'ammo');
    // Item.spawnMany(4, ammo_64, 'ammo')

    mapZoomed = false
    fitMap()
    mapOff = getMapOff()
    drawOff = getDrawMapOff()

    fov = 90
    ceilClr = '#383838';
    floorClr = '#717171';
    placeTxtrNum = 0
    mapRayNum = 24;
    volume = getStoredVolume() ?? 5;

    redraw = stopRender = stopDraw = false;
    logVisible =
        // true
        false
    mapVisible =
        // true
        false
    viewVisible =
        true
    // false

    toggleDoor(3, 3);
}

function animDoors() {
    for (let i = 0; i < animDoorList.length; i++) {
        let door = animDoorList[i];
        let { x, y, dir } = door;

        let speed = deltaTime * 0.06 / 60
        let newVal = worldMap[y][x] + speed * dir;

        if (newVal > doorVal + 1) {
            newVal = doorVal + 0.99;
            animDoorList.shift();
            i--;
        } else if (newVal < doorVal) {
            newVal = doorVal;
            animDoorList.shift();
            i--;
        }

        worldMap[y][x] = newVal;
    }
}

function toggleDoor(x, y) {
    let cell = worldMap[y][x];
    if (floor(cell) != doorVal || animDoorList
        .some(d => d.x == x && d.y == y)) return;
    let dir;
    dir = cell % 1 > 0.5 ? -1 : 1;
    animDoorList.push({ x, y, dir });
}

function draw() {
    myLog('cast', () => rayBuf = castRays(pl0.pos, pl0.ang));

    if (viewVisible) myLog('view', () => drawView(rayBuf));
    if (mapVisible) drawMap(rayBuf);
    if (logVisible) logStats();

    pl0.update([87, 65, 83, 68, 81, 69])
    Player.animateAll();
    animDoors();

    // for testing
    pl1?.update([
        UP_ARROW,
        LEFT_ARROW,
        DOWN_ARROW,
        RIGHT_ARROW
    ])

    // log
    myLogMany({
        volume,
        ammoNum: pl0.ammoNum,
    })
}