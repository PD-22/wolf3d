class Sprite {
    constructor(x, y, texture, blocking = true) {
        this.pos = { x, y };
        this.visible = true;
        this.blocking = blocking;
        this.texture = texture;
        this.id = Sprite.idCount;
        Sprite.all.push(this);
        Sprite.idCount = Sprite.all.length;
    }

    delete(thisClass = Sprite) {
        thisClass.all = thisClass.all
            .filter(s => s.id != this.id);
        Sprite.idCount = Sprite.all.length;
    }

    static idCount = 0;

    static all = []

    spriteCollision() {
        let { pos } = this;
        let { x, y } = pos;
        x -= 0.5; y -= 0.5;
        let min = { x: floor(x), y: floor(y) };
        let max = { x: ceil(x) + 1, y: ceil(y) + 1 };

        let pos0 = pos;
        Sprite.all.filter(s => s != this).forEach(sprite => {
            let { pos } = sprite;
            let { x, y } = pos;
            if (x >= min.x && y >= min.y &&
                x < max.x && y < max.y) {
                let dx = pos0.x - x;
                let dy = pos0.y - y;
                let dst = Math.hypot(dx, dy);
                let rad = sprite.rad * 2;
                if (dst < rad) {
                    if (sprite instanceof Item) sprite.pick(this);
                    if (sprite.blocking) {
                        let ang = atan2(dy, dx);
                        let dif = rad - dst;
                        this.pos.x += cos(ang) * dif;
                        this.pos.y += sin(ang) * dif;
                    }
                };
            }
        })
    }

    castRaySprt(pl0 = Player.me, rayAng = Player.me.ang, maxOff = 0.5) {
        let dx = this.pos.x - pl0.pos.x
        let dy = this.pos.y - pl0.pos.y
        let strghtDst = Math.hypot(dx, dy)

        rayAng = rayAng === undefined ? pl0.ang : normalAng(rayAng)

        let strghtAng = degrees(atan2(-dy, dx))
        strghtAng = normalAng(strghtAng)

        let txtrAng = 180 - this.ang + strghtAng
        txtrAng = normalAng(txtrAng)

        let rayStrghtAng = rayAng - strghtAng
        rayStrghtAng = normalAng(rayStrghtAng)

        let minAng = pl0.ang - fov / 2
        minAng = normalAng(minAng)

        let maxAng = pl0.ang + fov / 2
        maxAng = normalAng(maxAng)

        if (Math.abs(rayStrghtAng) > fov / 2) return

        let sOff = Math.tan(radians(rayStrghtAng)) * strghtDst

        if (Math.abs(sOff) >= maxOff) return

        let rayDst = sOff / Math.sin(radians(rayStrghtAng))

        let x = pl0.pos.x + rayDst * Math.cos(radians(rayAng))
        let y = pl0.pos.y - rayDst * Math.sin(radians(rayAng))

        let ray = {
            x, y, ang: rayAng,
            txtrOff: (0.5 - sOff),
            dst: rayDst, txtrAng,
            dir: angToDir(rayAng)
        }

        return { ...ray, lineHeight: calcLineHeight(ray) };
    }

    static randPos() {
        let spaces = copyMatrix(worldMap)
        for (let i = 0; i < spaces.length; i++) {
            for (let j = 0; j < spaces[0].length; j++) {
                let ri = Math.floor(Math.random() * spaces.length)
                let rj = Math.floor(Math.random() * spaces[0].length)
                spaces[i][j] = { i: ri, j: rj }
                spaces[ri][rj] = { i: i, j: j }
            }
        }

        for (let i = 0; i < spaces.length; i++) {
            for (let j = 0; j < spaces[0].length; j++) {
                const c = spaces[i][j]

                let taken = false;
                Sprite.all.forEach(p => {
                    let { pos } = p;
                    if (Math.floor(pos.y) == c.i &&
                        Math.floor(pos.x) == c.j) {
                        taken = true;
                        return;
                    }
                });

                if (worldMap[c.i][c.j] == 0 && !taken) {
                    return { y: 0.5 + c.i, x: 0.5 + c.j }
                }
            }
        }

        console.error('bad spawn');
        return {
            y: floor(random() * worldMap.length) + 0.5,
            x: floor(random() * worldMap[0].length) + 0.5,
        }
    }

    getAdjCells() {
        let cells = [];
        let x = Math.round(this.pos.x);
        let y = Math.round(this.pos.y);
        for (let i = -1; i <= 0; i++) {
            for (let j = -1; j <= 0; j++) {
                cells.push(getCell(x + j, y + i, false))
            }
        }
        return cells;
    }

    wallCollide(cell) {
        let cellVal = getCellVal(cell);
        let collision = this.wallCollision(cell);
        if (cellVal == 0 || collision == null) return;
        if (floor(cellVal) == doorVal && cellVal % 1 > 0.9)
            return collision.value;
        if (collision.type == 'side') {
            let axis = collision.value;
            let center = cell[axis] + 0.5
            let sign = Math.sign(this.pos[axis] - center);
            this.pos[axis] = center + sign * (0.5 + this.rad);
        } else if (collision.type == 'corner') {
            let delta = {
                x: this.pos.x - collision.value.x,
                y: this.pos.y - collision.value.y
            }
            let axis = Math.abs(delta.x) < Math.abs(delta.y) ? 'y' : 'x';
            let axis2 = axis == 'y' ? 'x' : 'y';
            this.pos[axis] =
                collision.value[axis] + Math.sign(delta[axis]) *
                Math.sqrt(this.rad ** 2 - delta[axis2] ** 2);
        }
    }

    wallCollision(cell) {
        let cellCenter = { x: cell.x + 0.5, y: cell.y + 0.5 };
        let crclDst = {
            x: Math.abs(this.pos.x - cellCenter.x),
            y: Math.abs(this.pos.y - cellCenter.y),
        };

        if (crclDst.x >= (0.5 + this.rad)) return null;
        if (crclDst.y >= (0.5 + this.rad)) return null;

        if (crclDst.x <= 0.5) return { type: 'side', value: 'y' };
        if (crclDst.y <= 0.5) return { type: 'side', value: 'x' };

        for (let i = 0; i <= 1; i++) {
            for (let j = 0; j <= 1; j++) {
                let corner = { x: cell.x + j, y: cell.y + i };
                let dst = Math.hypot(
                    Math.abs(this.pos.x - corner.x),
                    Math.abs(this.pos.y - corner.y),
                );
                if (dst <= this.rad) return { type: 'corner', value: corner };
            }
        }

        return null;
    }
}