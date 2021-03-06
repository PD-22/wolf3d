function normalAng(ang) {
    if (ang <= -360) ang = -abs(ang) % 360;
    if (ang >= 360) ang = ang % 360;

    if (ang > 180)
        return ang % 360 - 360
    if (ang < -180)
        return ang % 360 + 360
    return ang
}

function angToDir(ang) {
    let y = Math.floor(ang / 180) % 2 ? 1 : -1
    let x = Math.floor((ang - 90) / 180) % 2 ? 1 : -1
    return { x, y }
}