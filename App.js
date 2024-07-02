const { createElement: e, useEffect, useState, useRef } = React;
const a = window.reactCache || (window.reactCache = {});

function copy(src, to) {
    for (let i = 0; i < src.length; i++)
        for (let j = 0; j < src[i].length; j++)
            to[i][j] = src[i][j];
}

function getImg(src) {
    return new Promise(r => {
        let img = new Image();
        img.onload = () => r(img);
        img.src = src;
        if (src.length > 100) document.body.prepend(img);
    })
}

const BLOCK_IMG = await getImg("./TETRIS3.png");
console.log(window.block = BLOCK_IMG)

const pressed = Object.create(null);

const INFINITE = 0;
const EXTENDED = 1;
const CLASSIC = 2;

const MODE = EXTENDED;

const QUEUE_SIZE = 5;

const vecs = [
    [ 0,  0], // 0
    [ 1,  0], // 1
    [-1,  0], // 2
    [ 1, -1], // 3
    [-1, -1], // 4
    [ 0,  2], // 5
    [ 1,  2], // 6
    [-1,  2], // 7
    [-1,  1], // 8
    [ 0,  1], // 9
    [ 1,  1], // 10
    [ 2,  0], // 11
    [-2,  1], // 12
    [ 0, -1], // 13
    [ 0, -2], // 14
    [-2,  0], // 15
];
const JLSTZ_OFFSETS = [[],[],[],[],[]];
JLSTZ_OFFSETS[0][0] = vecs[0];
JLSTZ_OFFSETS[0][1] = vecs[0];
JLSTZ_OFFSETS[0][2] = vecs[0];
JLSTZ_OFFSETS[0][3] = vecs[0];

JLSTZ_OFFSETS[1][0] = vecs[0];
JLSTZ_OFFSETS[1][1] = vecs[1];
JLSTZ_OFFSETS[1][2] = vecs[0];
JLSTZ_OFFSETS[1][3] = vecs[2];

JLSTZ_OFFSETS[2][0] = vecs[0];
JLSTZ_OFFSETS[2][1] = vecs[3];
JLSTZ_OFFSETS[2][2] = vecs[0];
JLSTZ_OFFSETS[2][3] = vecs[4];

JLSTZ_OFFSETS[3][0] = vecs[0];
JLSTZ_OFFSETS[3][1] = vecs[5];
JLSTZ_OFFSETS[3][2] = vecs[0];
JLSTZ_OFFSETS[3][3] = vecs[5];

JLSTZ_OFFSETS[4][0] = vecs[0];
JLSTZ_OFFSETS[4][1] = vecs[6];
JLSTZ_OFFSETS[4][2] = vecs[0];
JLSTZ_OFFSETS[4][3] = vecs[7];

const I_OFFSETS = [[],[],[],[],[]];
I_OFFSETS[0][0] = vecs[0];
I_OFFSETS[0][1] = vecs[2];
I_OFFSETS[0][2] = vecs[8];
I_OFFSETS[0][3] = vecs[9];

I_OFFSETS[1][0] = vecs[2];
I_OFFSETS[1][1] = vecs[0];
I_OFFSETS[1][2] = vecs[10];
I_OFFSETS[1][3] = vecs[9];

I_OFFSETS[2][0] = vecs[11];
I_OFFSETS[2][1] = vecs[0];
I_OFFSETS[2][2] = vecs[12];
I_OFFSETS[2][3] = vecs[9];

I_OFFSETS[3][0] = vecs[2];
I_OFFSETS[3][1] = vecs[9];
I_OFFSETS[3][2] = vecs[1];
I_OFFSETS[3][3] = vecs[13];

I_OFFSETS[4][0] = vecs[11];
I_OFFSETS[4][1] = vecs[14];
I_OFFSETS[4][2] = vecs[15];
I_OFFSETS[4][3] = vecs[5];

const O_OFFSETS = [[],[],[],[],[]];
O_OFFSETS[0][0] = vecs[0];
O_OFFSETS[0][1] = vecs[13];
O_OFFSETS[0][2] = vecs[4];
O_OFFSETS[0][3] = vecs[2];

class QueueItem {
    val;
    next;
    constructor(val) {
        this.val = val;
    }
}

class Queue {
    head = new QueueItem();
    tail = this.head;
    size = 0;
    add(val) {
        this.size++;
        this.tail = this.tail.next = new QueueItem(val);
    }
    pop() {
        this.size--;
        this.head = this.head.next;
        return this.head.val;
    }
    peek() {
        return this.head.next?.val;
    }
    *[Symbol.iterator]() {
        let cur = this.head;
        while (cur.next) {
            yield cur.next.val;
            cur = cur.next;
        }
    }
}

class Bag {
    items;
    list = new Queue();
    n;
    constructor(items) {
        this.items = items;
        this.n = items.length;
        this.next = this.next.bind(this);
        this.nextItem = this.nextItem.bind(this);
        while (this.list.size < QUEUE_SIZE) this.list.add(this.nextItem());
    }
    next() {
        this.list.add(this.nextItem());
        return this.list.pop();
    }
    nextItem() {
        let i = Math.floor(Math.random() * this.n);
        let item = this.items[i];
        this.n--;
        if (item != this.items[this.n]) {
            this.items[i] = this.items[this.n];
            this.items[this.n] = item;
        }
        if (this.n == 0) this.n = this.items.length;
        return item;
    }
}

const mod = (n, m) => (n % m + m) % m;

class Tile {
    static rotationMatricies = [
        [vecs[13], vecs[1]],
        [vecs[9], vecs[2]],
    ]
    pos = [0, 0];
    color;
    constructor(x, y) {
        this.pos = [x, y];
    }
    rotate(origin, dir) {
        let relative = [origin[0] - this.pos[0], origin[1] - this.pos[1]];
        const rot = Tile.rotationMatricies[dir ? 0 : 1];
        let newPos = [
            rot[0][0] * relative[0] + rot[1][0] * relative[1],
            rot[0][1] * relative[0] + rot[1][1] * relative[1],
        ];
        for (let i = 0; i < 2; i++) this.pos[i] = newPos[i] + origin[i];
    }
}

class Piece {
    static create(type, x, y, grid, canvas) {
        const tiles = [new Tile(x, y), new Tile(x, y), new Tile(x, y), new Tile(x, y)];
        switch (type) {
            case "i":
                tiles[1].pos[0] -= 1;
                tiles[2].pos[0] += 2;
                tiles[3].pos[0] += 1;
                break;
            case "o":
                tiles[1].pos[0] += 1;
                tiles[2].pos[0] += 1;
                tiles[2].pos[1] -= 1;
                tiles[3].pos[1] -= 1;
                break;
            case "j":
                tiles[1].pos[0] -= 1;
                tiles[2].pos[0] -= 1;
                tiles[2].pos[1] -= 1;
                tiles[3].pos[0] += 1;
                break;
            case "l":
                tiles[1].pos[0] -= 1;
                tiles[2].pos[0] += 1;
                tiles[2].pos[1] -= 1;
                tiles[3].pos[0] += 1;
                break;
            case "s":
                tiles[1].pos[0] -= 1;
                tiles[2].pos[0] += 1;
                tiles[2].pos[1] -= 1;
                tiles[3].pos[1] -= 1;
                break;
            case "z":
                tiles[1].pos[1] -= 1;
                tiles[2].pos[0] -= 1;
                tiles[2].pos[1] -= 1;
                tiles[3].pos[0] += 1;
                break;
            case "t":
                tiles[0].color = 1;
                tiles[1].pos[0] -= 1;
                tiles[1].color = 2;
                tiles[2].pos[1] -= 1;
                tiles[2].color = 3;
                tiles[3].pos[0] += 1;
                tiles[3].color = 4;
                break;
        }
        return new Piece(type, tiles, grid, canvas);
    }
    type;
    tiles;
    rotation = 0;
    done = false;
    constructor(type, tiles, grid, canvas) {
        this.type = type;
        this.tiles = tiles;
        this.grid = grid;
        this.canvas = canvas;
    }
    rotate(dir, offset) {
        let old = this.rotation;
        this.rotation = mod(this.rotation + (dir ? 1 : -1), 4);
        for (const tile of this.tiles) tile.rotate(this.tiles[0].pos, dir);
        if (!offset) return;
        let canOffset = this.offset(old, this.rotation, dir);
        if (!canOffset) this.rotate(!dir, false);
    }
    // A  B  C  D
    // 8 10  4  3
    static tSides = [
        [vecs[8], vecs[10], vecs[4], vecs[3]],
        [vecs[10], vecs[3], vecs[8], vecs[4]],
        [vecs[3], vecs[4], vecs[10], vecs[8]],
        [vecs[4], vecs[8], vecs[3], vecs[10]],
    ];
    offset(oldRot, newRot, dir) {
        let offsetData = JLSTZ_OFFSETS;
        if (this.type == "o") offsetData = O_OFFSETS;
        if (this.type == "i") offsetData = I_OFFSETS;
        const endOffset = [0, 0];
        let offset1, offset2, i, canMove = false;
        for (i = 0; i < 5; i++) {
            offset1 = offsetData[i][oldRot];
            offset2 = offsetData[i][newRot];
            endOffset[0] = offset1[0] - offset2[0];
            endOffset[1] = -(offset1[1] - offset2[1]);
            if (this.canMove(endOffset)) {
                canMove = true;
                break;
            }
        }
        this.move(endOffset);
        this.tspin = this.minitspin = false;
        if (canMove && this.type == "t" && !(this.tspin = i == 4)) {
            const origin = this.tiles[0].pos;
            const [a, b, c, d] = Piece.tSides[this.rotation].map(
                x => this.grid[origin[1] - x[1]]?.[origin[0] + x[0]]
            ).map(x => x != 0);
            this.tspin = a && b && (c || d);
            this.minitspin = !this.tspin && c && d && (a || b);
        }
        if (this.tspin || this.minitspin) {
            this.canvas.parentElement.parentElement.animate([
                { rotate: (dir ? "" : "-") + "3deg", scale: "1.0125" },
                { rotate: "0deg", scale: "1" }
            ], {
                duration: 250
            });
        }
        return canMove;
    }
    canMove(offset) {
        for (const tile of this.tiles) {
            const pos = [tile.pos[0] + offset[0], tile.pos[1] + offset[1]];
            if (this.grid[pos[1]]?.[pos[0]] !== 0) return false;
        }
        return true;
    }
    move(offset, gravity) {
        if (this.canMove(offset)) {
            for (const tile of this.tiles) {
                tile.pos[0] += offset[0];
                tile.pos[1] += offset[1];
            }
            if (MODE == INFINITE) this.lockdown = null;
            else if (MODE == CLASSIC) {
                if (offset[1] > 0 && this.lowest > this.tiles[0].pos[1]) {
                    this.lockdown = null;
                    this.lowest = this.tiles[0].pos[1];
                }
            }
            else {
                if (offset[1] > 0 && this.lowest > this.tiles[0].pos[1])
                    this.lowest = this.tiles[0].pos[1];
                if (--this.movements > 0) this.lockdown = null;
            }
            return true;
        }
        else {
            if (gravity && typeof this.lockdown != "number") {
                this.lockdown = 30;
                this.movements = 15;
            }
            return false;
        }
    }
    merge() {
        for (const { pos: [x, y] } of this.tiles)
            this.grid[y][x] = Tetris.pieces[this.type].k;
        this.done = true;
    }
}

const SCALE = Math.floor(Math.min(innerWidth, innerHeight) / 25);
console.log(SCALE);

class Tetris {
    static colors = ["#000", "#8000ff", "#ffff00", "#ff8000", "#0000ff", "#00ffff", "#00ff00", "#ff0000"];
    static pieces = {
        t: {
            c: "#8000ff",
            k: 1,
            s: [4, 0]
        },
        o: {
            c: "#ffff00",
            k: 2,
            s: [4, 0]
        }, 
        l: {
            c: "#ff8000",
            k: 3,
            s: [4, 0]
        },
        j: {
            c: "#0000ff",
            k: 4,
            s: [4, 0]
        },
        i: {
            c: "#00ffff",
            k: 5,
            s: [4, 0]
        },
        s: {
            c: "#00ff00",
            k: 6,
            s: [4, 0]
        },
        z: {
            c: "#ff0000",
            k: 7,
            s: [4, 0]
        },
    };
    grid = Array.from({ length: 40 }, () => Array(10).fill(0));
    current;
    hold;
    canvas;
    ctx;
    // toljisz
    bag = new Bag("toljisz".split(""));
    level = 1;
    nextLevel = 10;
    lastLevel = 1;
    int = 1000;
    interval;
    cooldown = false;
    timeouts = Object.create(null);
    backtoback = 0;
    score = 0;
    combo = 0;
    constructor(canvas, score, hold, queue, queueWrapper, holdWrapper) {
        this.canvas = canvas.current;
        this.scoreDiv = score.current;
        this.queueWrapper = queueWrapper;
        this.holdWrapper = holdWrapper;
        this.canvas.width = 10 * SCALE;
        this.canvas.height = 20.5 * SCALE;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.scale(SCALE, SCALE);
        this.ctx.translate(0, -19.5);
        this.next = this.next.bind(this);
        this.draw = this.draw.bind(this);
        this.dropInt = this.dropInt.bind(this);
        this.startDrop = this.startDrop.bind(this);
        
        window.onkeydown = e => {
            if (e.code == "ArrowDown") this.startDrop(true);
            if (e.code == "ArrowLeft" && !pressed.ArrowLeft || e.code == "ArrowRight" && !pressed.ArrowRight) {
                this.current.move([e.code == "ArrowLeft" ? -1 : 1, 0]);
                pressed.auto = 0;
                this.timeouts[e.code] = setTimeout(this.autoRepeat, 150, e.code);
            }
            // if (e.code == "ControlLeft") {
            //     return this.canvas.parentElement.parentElement.animate([
            //     { rotate: "5deg", scale: "1.05" },
            //     { rotate: "0deg", scale: "1" }
            // ], {
            //     duration: 250
            // });
            // }
            pressed[e.code] = true;
        }
        window.onkeyup = e => {
            pressed[e.code] = false;
            if (e.code == "ArrowLeft" || e.code == "ArrowRight") {
                pressed.auto = 0;
                clearTimeout(this.timeouts[e.code]);
            }
        }
        
        this.holdCanvas = hold.current;
        this.holdCtx = hold.current.getContext("2d");
        this.queueCanvas = queue.current;
        this.queueCtx = queue.current.getContext("2d");
        
        this.queueCanvas.width = this.holdCanvas.width = 6 * SCALE;
        this.holdCanvas.height = 4 * SCALE;
        this.queueCanvas.height = 16 * SCALE;
        
        this.holdCtx.scale(SCALE, SCALE);
        this.holdCtx.fillStyle = "black";
        this.holdCtx.fillRect(0, 0, 6, 4);
        this.queueCtx.scale(SCALE, SCALE);
        
        this.next();
        this.dropInt();
        this.draw();
    }
    autoRepeat(key) {
        if (pressed[key]) pressed.auto = key == "ArrowLeft" ? -1 : 1;
    }
    checkLines() {
        let lines = 0;
        rows: for (let r = 0; r < this.grid.length; r++) {
            for (let c = 0; c < this.grid[r].length; c++)
                if (this.grid[r][c] == 0) continue rows;
            this.grid.unshift(this.grid.splice(r, 1)[0].fill(0));
            lines++;
        }
        if (!this.current)
            return lines > 0;
        let score = 0, backtoback = false;
        switch (lines) {
            case 0:
                if (this.current.tspin) score += 400 * this.level;
                else if (this.current.minitspin) score += 100 * this.level;
                console.log(this.score += score);
                if (this.dropped) this.canvas.parentElement.parentElement.animate([
                    { translate: "0 0%" },
                    { translate: "0 0.25%" },
                    { translate: "0 0%" },
                ], {
                    duration: 125
                });
                this.dropped = false;
                return;
            case 1:
                if (this.current.tspin) {
                    backtoback = true;
                    score += 800;
                    console.log("TSPIN SINGLE");
                } else if (this.current.minitspin) {
                    backtoback = true;
                    score += 200;
                    console.log("MINI TSPIN SINGLE");
                } else {
                    score += 100;
                    console.log("SINGLE");
                }
                break;
            case 2:
                if (this.current.tspin) {
                    backtoback = true;
                    score += 1200;
                    console.log("TSPIN DOUBLE");
                } else {
                    score += 300;
                    console.log("DOUBLE");
                }
                break;
            case 3:
                if (this.current.tspin) {
                    backtoback = true;
                    score += 1600;
                    console.log("TSPIN TRIPLE");
                } else {
                    score += 500;
                    console.log("DOUBLE");
                }
                break;
            case 4:
                console.log("TETRIS");
                backtoback = true;
                score += 800;
                break;
        }
        if (this.dropped) {
            this.canvas.parentElement.parentElement.animate([
                { translate: "0 0%" },
                { translate: "0 2.5%" },
                { translate: "0 0%" },
            ], {
                duration: 100
            });
        }
        this.dropped = false;
        score *= this.level;
        if (this.backtoback > 0) if (backtoback) {
            score += backtoback * score / 2;
            console.log(`B2B X${this.backtoback}`);
            this.backtoback++;
        } else this.backtoback = 0;
        else if (backtoback) this.backtoback = 1;
        console.log(this.score += score);
        this.nextLevel -= lines;
        if (this.nextLevel < 1) {
            this.nextLevel += 10;
            this.level++;
        }
        if (this.combo > 0) {
            console.log("COMBO x" + this.combo, " + " + this.combo * 50 * this.level);
            this.score += this.combo * 50 * this.level;
        }
        return true;
    }
    next(type) {
        if (type)
            this.current = Piece.create(type, 4, type == "i" ? 19 : 18, this.grid, this.canvas);
        else {
            if (this.checkLines()) this.combo++;
            else this.combo = 0;
            const piece = this.bag.next();
            this.current = Piece.create(piece, 4, piece == "i" ? 19 : 18, this.grid, this.canvas);
        }
        this.current.move([0, 1]);
        let ctx = this.queueCtx;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 6, 16);
        let i = 0;
        for (const piece of this.bag.list) {
            const style = this.queueWrapper.querySelector(":nth-child(" + (i + 1) + ")")?.style || {};
            ctx.fillStyle = Tetris.pieces[piece]?.c || "black";
            switch (piece) {
                case "i":
                    style.backgroundPosition = `0 0`;
                    ctx.fillRect(1, 1.5 + 3 * i, 4, 1);
                    break;
                case "o":
                    style.backgroundPosition = `0 ${SCALE * 0.5}px`;
                    ctx.fillRect(2, 1 + 3 * i, 2, 2);
                    break;
                case "t":
                    style.backgroundPosition = `${SCALE * 0.5}px ${SCALE * 0.5}px`;
                    ctx.fillRect(1.5, 2 + 3 * i, 3, 1);
                    ctx.fillRect(2.5, 1 + 3 * i, 1, 1);
                    break;
                case "j":
                    style.backgroundPosition = `${SCALE * 0.5}px ${SCALE * 0.5}px`;
                    ctx.fillRect(1.5, 2 + 3 * i, 3, 1);
                    ctx.fillRect(1.5, 1 + 3 * i, 1, 1);
                    break;
                case "l":
                    style.backgroundPosition = `${SCALE * 0.5}px ${SCALE * 0.5}px`;
                    ctx.fillRect(1.5, 2 + 3 * i, 3, 1);
                    ctx.fillRect(3.5, 1 + 3 * i, 1, 1);
                    break;
                case "s":
                    style.backgroundPosition = `${SCALE * 0.5}px ${SCALE * 0.5}px`;
                    ctx.fillRect(2.5, 1 + 3 * i, 2, 1);
                    ctx.fillRect(1.5, 2 + 3 * i, 2, 1);
                    break;
                case "z":
                    style.backgroundPosition = `${SCALE * 0.5}px ${SCALE * 0.5}px`;
                    ctx.fillRect(2.5, 2 + 3 * i, 2, 1);
                    ctx.fillRect(1.5, 1 + 3 * i, 2, 1);
                    break;
            }
            i++;
        }
    }
    startDrop(soft) {
        clearTimeout(this.interval);
        this.dropInt(soft);
    }
    dropInt(soft) {
        if (this.current.move([0, 1], true) && (soft || pressed.ArrowDown)) this.score++;
        if (this.current.done) this.next();
        if (this.level != this.lastLevel) {
            this.lastLevel = this.level;
            this.int = Math.pow(0.8 - (this.level - 1) * 0.007, this.level - 1) * 1000;
        }
        this.interval = setTimeout(this.dropInt, this.int * ((soft || pressed.ArrowDown) ? 0.05 : 1));
    }
    draw() {
        let cool = 0;
        if (pressed.ArrowUp || pressed.KeyX) {
            pressed.ArrowUp = pressed.KeyX = false;
            this.current.rotate(true, true);
        }
        if (pressed.KeyZ) {
            pressed.KeyZ = false;
            this.current.rotate(false, true);
        }
        if (pressed.auto && !this.cooldown) {
            this.current.move([pressed.auto, 0]);
            cool = this.cooldown = 1;
        }
        if (typeof this.current.lockdown == "number" && --this.current.lockdown <= 0) {
            this.current.merge();
            this.next();
            this.startDrop();
        }
        if (pressed.ShiftLeft) {
            pressed.ShiftLeft = false;
            if (!this.current.held || true) {
                let hold = this.hold;
                this.hold = this.current.type;
                this.next(hold);
                this.current.held = true;
                console.log(this.hold);
                let hCtx = this.holdCtx;
                hCtx.fillStyle = "black";
                hCtx.fillRect(0, 0, 6, 4);
                hCtx.fillStyle = Tetris.pieces[this.hold]?.c || "black";
                switch (this.hold) {
                    case "i":
                        this.holdWrapper.style.backgroundPosition = `0 ${SCALE / 2}px`;
                        hCtx.fillRect(1, 1.5, 4, 1);
                        break;
                    case "o":
                        this.holdWrapper.style.backgroundPosition = `0 0`;
                        hCtx.fillRect(2, 1, 2, 2);
                        break;
                    case "t":
                        this.holdWrapper.style.backgroundPosition = `${SCALE / 2}px 0`;
                        hCtx.fillRect(1.5, 2, 3, 1);
                        hCtx.fillRect(2.5, 1, 1, 1);
                        break;
                    case "j":
                        this.holdWrapper.style.backgroundPosition = `${SCALE / 2}px 0`;
                        hCtx.fillRect(1.5, 2, 3, 1);
                        hCtx.fillRect(1.5, 1, 1, 1);
                        break;
                    case "l":
                        this.holdWrapper.style.backgroundPosition = `${SCALE / 2}px 0`;
                        hCtx.fillRect(1.5, 2, 3, 1);
                        hCtx.fillRect(3.5, 1, 1, 1);
                        break;
                    case "s":
                        this.holdWrapper.style.backgroundPosition = `${SCALE / 2}px 0`;
                        hCtx.fillRect(2.5, 1, 2, 1);
                        hCtx.fillRect(1.5, 2, 2, 1);
                        break;
                    case "z":
                        this.holdWrapper.style.backgroundPosition = `${SCALE / 2}px 0`;
                        hCtx.fillRect(2.5, 2, 2, 1);
                        hCtx.fillRect(1.5, 1, 2, 1);
                        break;
                }
            }
        }
        let down = 1;
        while (this.current.canMove([0, down])) down++;
        down--;
        if (pressed.Space) {
            pressed.Space = false;
            this.score += down << 1;
            this.current.move([0, down]);
            this.current.merge();
            this.next();
            this.startDrop();
            this.dropped = true;
        }
        // this.ctx.fillStyle = "black";
        this.ctx.clearRect(0, 0, 10, 40);
        if (this.cooldown > 0 && !cool) this.cooldown--;
        
        // this.ctx.fillStyle = "#808080";
        // for (const tile of this.current.tiles) {
        //     this.ctx.fillRect(tile.pos[0], tile.pos[1] + down, 1, 1);
        // }
        
        for (let r = 19; r < this.grid.length; r++) {
            for (let c = 0; c < this.grid[r].length; c++) {
                if (this.grid[r][c] == 0) continue;
                this.ctx.fillStyle = Tetris.colors[this.grid[r][c]];
                this.ctx.fillRect(c, r, 1, 1);
            }
        }
        for (const tile of this.current.tiles) {
            this.ctx.fillStyle = Tetris.pieces[this.current.type].c;
            this.ctx.fillRect(tile.pos[0], tile.pos[1] + down, 1, 1);
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(tile.pos[0] + 0.125, tile.pos[1] + down + 0.125, 0.75, 0.75);
        }
        this.ctx.fillStyle = Tetris.pieces[this.current.type].c;
        for (const tile of this.current.tiles)
            this.ctx.fillRect(...tile.pos, 1, 1);
        this.scoreDiv.textContent = this.score;
        
        requestAnimationFrame(this.draw);
    }
}

const outline = SCALE / 20;

export default function App(props) {
    const canvas = useRef();
    const hold = useRef();
    const queue = useRef();
    const score = useRef();
    const queueWrap = useRef();
    const holdWrap = useRef();
        
    useEffect(() => {
        if (canvas.current && score.current && hold.current && queue.current && queueWrap.current && holdWrap.current) window.tetris = a.game = new Tetris(canvas, score, hold, queue, queueWrap.current, holdWrap.current);
    }, [canvas.current, score.current, hold.current, queue.current, queueWrap.current, holdWrap.current]);

    return e("div", {
            className: "tetrisWrapper",
        },
        e("div", { className: "tetris" }, 
            e("div", {
                style: {
                    position: "relative",
                    height: SCALE * 20.5 + "px"
                }
            }, e("div", {
                className: "sideWrapper",
                style: {
                    // padding: outline + "px",
                    height: SCALE * 4 + "px",
                    width: SCALE * 6 + "px",
                    position: "relative",
                    display: "flex",
                    gap: SCALE / 2 + "px",
                    // paddingBlock: SCALE / 2 + "px",
                    flexDirection: "column",
                    border: outline + "px solid white"
                }
            },
                e("div", { style: {
                    position: "absolute",
                    left: "0",
                    top: "0",
                    right: "0",
                    background: "url(./TETRIS3.png) repeat",
                    backgroundSize: SCALE + "px",
                    position: "absolute",
                    height: SCALE * 4 + "px"
                },
                ref: holdWrap }),
                e("canvas", { className: "sideCanvas", ref: hold }),
            ),
            e("div", {
                    style: {
                        position: "absolute",
                        // background: "black",
                        top: SCALE * 4 + 10 + "px",
                        left: "0",
                        right: "0",
                        bottom: "0",
                        color: "white",
                        padding: outline + "px"
                    }
                }, "pretend these are stats I haven't gotten to this yet")),
            e("div", {
                className: "gameWrapper",
                style: {
                    padding: outline + "px",
                    height: SCALE * 20.5 + "px",
                    position: "relative"
                }
            },
                e("div", { style: {
                    background: `linear-gradient(0deg, #fff ${20 * SCALE}px, #000 100%)`,
                    position: "absolute",
                    inset: outline + "px"
                } }),
                e("div", { style: {
                    background: "url(./TETRIS3.png) repeat",
                    backgroundSize: SCALE + "px",
                    backgroundPosition: "0 " + (SCALE / 2) + "px",
                    inset: outline + "px",
                    position: "absolute",
                    mixBlendMode: "multiply"
                } }),
                e("canvas", { id: "game", ref: canvas }),
            ),
            e("div", {
                className: "sideWrapper",
                style: {
                    // padding: outline + "px",
                    height: SCALE * 16 + "px",
                    width: SCALE * 6 + "px",
                    position: "relative",
                    display: "flex",
                    gap: SCALE / 2 + "px",
                    // paddingBlock: SCALE / 2 + "px",
                    flexDirection: "column",
                    border: outline + "px solid white"
                },
                ref: queueWrap
            },
                [0, 1, 2, 3, 4].map(key =>
                    e("div", { style: {
                        position: "absolute",
                        left: "0",
                        top: SCALE * (0.5 + key * 3) + "px",
                        right: "0",
                        background: "url(./TETRIS3.png) repeat",
                        backgroundSize: SCALE + "px",
                        position: "absolute",
                        height: SCALE * 3 + "px"
                    }, key })
                ),
                e("canvas", { className: "sideCanvas", ref: queue }),
            )
        ),
        e("div", { className: "score", ref: score })
    );
}