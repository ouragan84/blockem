const canvas = document.getElementById("blocks");
const context = canvas.getContext("2d");
const nextPieceCanvas = document.getElementById("nextPiece");
const nextPieceContext = nextPieceCanvas.getContext("2d");

context.scale(20, 20);
nextPieceContext.scale(20, 20);

function arenaSweep(){
    let rowCount = 10;
    outer: for(let y = arena.length - 1; y > 0; --y){
        for(let x = 0; x < arena[0].length; ++x){
            if(arena[y][x] === 0){
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        
        player.score += rowCount;
        rowCount += 10;
    }
}

function collide(arena, player){
    const [m, o] = [player.matrix, player.pos];
    for(let y = 0; y < m.length; ++y){
        for(let x = 0; x < m[y].length; ++x){
            if(m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0){
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h){
    const matrix = [];
    while(h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type){
    switch(type){
        case 'T':
            return [
                [0 ,0 ,0],
                [1 ,1 ,1],
                [0 ,1 ,0],
            ];
            
        case 'O':
            return [
                [2 ,2],
                [2 ,2],
            ];

        case 'L':
            return [
                [0 ,3 ,0],
                [0 ,3 ,0],
                [0 ,3 ,3],
            ];
        
        case 'J':
            return [
                [0 ,4 ,0],
                [0 ,4 ,0],
                [4 ,4 ,0],
            ];

        case 'I':
            return [
                [0 ,5 ,0 ,0],
                [0 ,5 ,0 ,0],
                [0 ,5 ,0 ,0],
                [0 ,5 ,0 ,0],
            ];
        
        case 'S':
            return [
                [0 ,6 ,6],
                [6 ,6 ,0],
                [0 ,0 ,0],
            ];

        case 'Z':
            return [
                [7 ,7 ,0],
                [0 ,7 ,7],
                [0 ,0 ,0],
            ];
    }
}

function draw(){
    //context.fillStyle = "#000";
    context.clearRect(0, 0, canvas.width, canvas.height);
    nextPieceContext.clearRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0}, false, context);
    drawMatrix(player.matrix, previewPiece(arena, player).pos, true, context);
    drawMatrix(player.matrix, player.pos, false, context);
    drawMatrix(nextPiece, {x:1, y:1}, false, nextPieceContext);
}

function drawMatrix(matrix, offset, isHollow, contID){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                contID.fillStyle = colors[value];
                contID.fillRect(x + offset.x + .05, y + offset.y + .05, .9, .9);
                if(isHollow){
                    contID.fillStyle = colors[value];
                    contID.fillRect(x + offset.x + .05, y + offset.y + .05, .9, .9);
                    //contID.fillStyle = "#000";
                    contID.clearRect(x + offset.x + .1, y + offset.y +.1, .8, .8);
                }
            }
        });
    });
}

function previewPiece(arena, player) {
    let preview = {
        pos: { x: player.pos.x, y: player.pos.y },
        matrix: player.matrix
    };
    while (!collide(arena, preview)) {
        preview.pos.y++;
    }
    preview.pos.y--;
    return preview;
}

function merge(arena, player){
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop(){
    player.pos.y++;
    if(collide(arena, player)){
        player.pos.y --;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir){
    player.pos.x += dir;
    if(collide(arena, player)){
        player.pos.x -= dir;
    }
}

let pieces = '';
let nextPiece = null;
function playerReset(){

    do{
        
        if(pieces.length === 0){
            pieces = 'ILJOTSZ';
        }

        player.matrix = nextPiece;

        let index = pieces.length * Math.random() | 0;
        nextPiece = createPiece(pieces[index]);
        pieces = pieces.slice(0, index) + pieces.slice(index + 1, pieces.length);

    }while(player.matrix === null);

    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if(collide(arena, player)){
        arena.forEach(row => row.fill(0));
        player.score = 0;
        pieces = 'ILJOTSZ';
        playerReset();
    }
}

function playerRotate(dir){
    rotate(player.matrix, dir);

    const pos = player.pos.x;
    let offset = 1;
    while(collide(arena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > player.matrix[0].length){
            rotate(player.matrix, -dir);
            return;
        }
    }
}

function rotate(matrix, dir){
    for(let y = 0; y < matrix.length; ++y){
        for(let x = 0; x < y; ++x){
            [matrix[y][x], matrix[x][y]] = [matrix[x][y], matrix[y][x]];
        }
    }
    
    if(dir > 0){
        matrix.forEach(row => row.reverse());
    }else{
        matrix.reverse();
    }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0){
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if(dropCounter > dropInterval){
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function updateScore(){
    document.getElementById('score').innerText = player.score;
}

const colors = [
    null,
    '#3037f2',//purple
    '#f7e119',//yellow
    '#ed8607',//orange
    '#0f53ff',//blue
    '#00eeff',//cyan
    '#48a822',//green
    '#e82a2a',//red
];

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};
document.addEventListener('keydown', event => {
    
    if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
    
    switch(event.keyCode){
        case 37:
            playerMove(-1);
            break;
        case 39:
            playerMove(1);
            break;
        case 40:
            playerDrop();
            break;
        case 38:
        case 81:
            playerRotate(1);
            break;
        case 87:
            playerRotate(-1);
            break;
    }
});

playerReset();
updateScore();
update();
