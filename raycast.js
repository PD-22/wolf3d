function calcLineHeight(its) {
    let p = its.dst * cos(radians(pl0.ang - its.ang));
    return 90 / fov * displayHeight / p;
}

function getTxtrOff({ side, dir, x, y }) {
    if (side == 'x') {
        if (dir.x > 0) return y % 1;
        else return (displayHeight - y) % 1;
    } else if (side == 'y')
        if (dir.y < 0) return x % 1;
        else return (displayWidth - x) % 1;
}

function castRays(pos, offAng) {
    rayBuf = []
    let inc = fov / displayWidth;
    for (let ang = offAng - fov / 2; ang < offAng + fov / 2; ang += inc) {
        let its = castRay(pos, ang)
        rayBuf.unshift(its)
    }
    return rayBuf
}

function castRay(pos, ang) {
    let cell = { x: Math.floor(pos.x), y: Math.floor(pos.y) }
    let off = { x: pos.x - cell.x, y: pos.y - cell.y }
    let dir = angToDir(ang)
    let tg = abs(tan(radians(ang)))
    let ctg = 1 / tg
    let xsi = { x: pos.x - off.x + (1 + dir.x) / 2, }
    xsi.y = pos.y + abs(xsi.x - pos.x) * tg * dir.y
    let ysi = { y: pos.y - off.y + (1 + dir.y) / 2 }
    ysi.x = pos.x + abs(ysi.y - pos.y) * ctg * dir.x
    let dx = ctg * dir.x
    let dy = tg * dir.y

    while (true) {
        while (abs(pos.x - xsi.x) <= abs(pos.x - ysi.x)) {
            cell.x += dir.x
            if (worldMap[cell.y] === undefined
                || worldMap[cell.y][cell.x] != 0) {
                let ray = {
                    dst: Math.hypot(pos.x - xsi.x, pos.y - xsi.y),
                    x: xsi.x, y: xsi.y,
                    side: 'x', ang, dir,
                    val: worldMap[cell.y] != undefined
                        && worldMap[cell.y][cell.x] != undefined
                        ? worldMap[cell.y][cell.x] : 0
                };
                return {
                    ...ray, txtrOff: getTxtrOff(ray),
                    texture: wallTextures[ray.val],
                    lineHeight: calcLineHeight(ray)
                };
            }
            xsi.x += dir.x
            xsi.y += dy
        }
        while (abs(pos.y - ysi.y) <= abs(pos.y - xsi.y)) {
            cell.y += dir.y
            if (worldMap[cell.y] === undefined
                || worldMap[cell.y][cell.x] != 0) {
                let result = {
                    dst: Math.hypot(pos.x - ysi.x, pos.y - ysi.y),
                    x: ysi.x, y: ysi.y,
                    side: 'y', ang, dir,
                    val: worldMap[cell.y] != undefined
                        && worldMap[cell.y][cell.x] != undefined
                        ? worldMap[cell.y][cell.x] : 0
                }
                return {
                    ...result, txtrOff: getTxtrOff(result),
                    texture: wallTextures[result.val],
                    lineHeight: calcLineHeight(result)
                };
            }
            ysi.x += dx
            ysi.y += dir.y
        }
    }
}