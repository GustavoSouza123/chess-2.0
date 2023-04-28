const c = (e) => document.querySelector(e);
const cs = (e) => document.querySelectorAll(e);

const board = c('.board');
var lightColor = "#a16f5a";
var darkColor = "#ecd3b8";

/* gerar espaços no tabuleiro */
var i = 0;
for(var file = 8; file > 0; file--) {
    for(var rank = 1; rank <= 8; rank++) {
        let letter = (rank==1)?'a':(rank==2)?'b':(rank==3)?'c':(rank==4)?'d':(rank==5)?'e':(rank==6)?'f':(rank==7)?'g':'h';
        board.innerHTML += `<div id="sq-${8 * (file - 1) + (rank - 1)}" class="square ${letter+file}"></div>`;
        let isLightSquare = (file + rank) % 2 == 0;
        let color = (isLightSquare) ? lightColor : darkColor;
        cs('.square')[i].style.backgroundColor = color;
        i++;
    }
}

/* selecionar quadrados e peças */
const sq = (id) => c(`.sq-${id}`);
const square = cs('.square');
const piece = (id) => cs('.square')[id].firstChild;


/* Forsyth-Edwards Notation (FEN) */

function FEN(notation) {
	let startStr = notation;
    let startArr = startStr.split("");

    let arrStartFile = [0,8,16,24,32,40,48,56];
    let idStartFile = 0;
    let currentId = arrStartFile[idStartFile];

    function nextFile() {
        idStartFile++;
        currentId = arrStartFile[idStartFile]-1;
    }

    for(i = 0; i < startArr.length; i++) {
        if(startArr[i] == '/') {
            nextFile();
        } else if(!isNaN(startArr[i])) {
            // square[currentId].innerHTML = startArr[i];
            currentId += parseInt(startArr[i])-1;
        } else {
            if(startArr[i] == startArr[i].toUpperCase()) {
                startArr[i] = startArr[i].toLowerCase();
                startArr[i] = "w" + startArr[i];
            } else {
                startArr[i] = "b" + startArr[i];
            }
            square[currentId].innerHTML += `<img id="${startArr[i]}${square[currentId].id.slice(3)}" class="piece ${square[currentId].classList[1]}" src="media/${startArr[i]}.png" draggable="true" />`;
            /*square[currentId].innerHTML = startArr[i];*/
        }
        currentId++;
    }
}

FEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");


/* mover peças */

/********************************************************************/

// gerar coordenadas em números
function genNumCoords(coord) {
    let rank = coord[0];
    let file = coord[1];
    rank = (rank=='a')?1:(rank=='b')?2:(rank=='c')?3:(rank=='d')?4:(rank=='e')?5:(rank=='f')?6:(rank=='g')?7:8;
    return rank + file;
}

// gerar coordenadas em letra e número
function genLetterCoords(coord) {
    let rank = coord[0];
    let file = coord[1];
    rank = (rank==1)?'a':(rank==2)?'b':(rank==3)?'c':(rank==4)?'d':(rank==5)?'e':(rank==6)?'f':(rank==7)?'g':'h';
    return rank + file;
}

// tirar background dos quadrados (movimentos legais)
function cleanLegalMoves() {
	for(j = 0; j < square.length; j++) {
		square[j].classList.remove('bg_red');
	}
}

// tirar background dos quadrados (movimento)
function cleanMove() {
	for(j = 0; j < square.length; j++) {
        square[j].classList.remove('bg_move');
	}
}

// colocar background nos quadrados de origem e destino após o movimento
function moved(el1, el2) {
    c(`.square.${el1}`).classList.add('bg_move');
    c(`.square.${el2}`).classList.add('bg_move');
}

// gerar movimentos legais

let legalMoves = [];
let whitePiecesMoves = [[0,0,0,0,0,0,0,0],[0,0],[0,0],[0,0],0,0]; // p,r,n,b,q,k
let blackPiecesMoves = [[0,0,0,0,0,0,0,0],[0,0],[0,0],[0,0],0,0]; // p,r,n,b,q,k

function genLegalMoves(pc) {
	let col = pc.id[0];
    let piece = pc.id[1];
	let numPc;
	if(pc.id.length == 3) {numPc = pc.id[2];} else {numPc = pc.id[2] + pc.id[3];}
    coords = genNumCoords(pc.parentElement.classList[1]);
    let rank = parseInt(coords[0]);
    let file = parseInt(coords[1]);

    legalMoves = [];
    if(piece == 'p') {
        if(col == 'w') {
            let front = rank.toString()+(file+1).toString(); // quadrado na frente do peão
            for(b = 8; b <= 15; b++) {
                if(numPc == b) {
                    if(c(`.square.${genLetterCoords(front)}`).firstChild == null) {
                        if(whitePiecesMoves[0][b-8] == 0) {
                            legalMoves.push(rank.toString()+(file+2).toString());
                            legalMoves.push(rank.toString()+(file+1).toString());
                        } else {
                            legalMoves.push(rank.toString()+(file+1).toString());
                        }
                    }
                }
            }

            // comer peças diagonais
            let diagonal1 = (rank+1).toString()+(file+1).toString();
            let diagonal2 = (rank-1).toString()+(file+1).toString();
            if(c(`.square.${genLetterCoords(diagonal1)}`).firstChild != null) {
                legalMoves.push(diagonal1);
            }
            if(c(`.square.${genLetterCoords(diagonal2)}`).firstChild != null) {
                legalMoves.push(diagonal2);
            }
        } else if(col == 'b') {
            let front = rank.toString()+(file-1).toString(); // quadrado na frente do peão
            for(b = 48; b <= 55; b++) {
                if(numPc == b) {
                    if(c(`.square.${genLetterCoords(front)}`).firstChild == null) {
                        if(blackPiecesMoves[0][b-48] == 0) {
                            legalMoves.push(rank.toString()+(file-2).toString());
                            legalMoves.push(rank.toString()+(file-1).toString());
                        } else {
                            legalMoves.push(rank.toString()+(file-1).toString());
                        }
                    }
                }
            }

            // comer peças diagonais
            let diagonal1 = (rank+1).toString()+(file-1).toString();
            let diagonal2 = (rank-1).toString()+(file-1).toString();
            if(c(`.square.${genLetterCoords(diagonal1)}`).firstChild != null) {
                legalMoves.push(diagonal1);
            }
            if(c(`.square.${genLetterCoords(diagonal2)}`).firstChild != null) {
                legalMoves.push(diagonal2);
            }
        }
    } else if(piece == 'r') {
        let initialRank = rank;
        let initialFile = file;

        // rank
        while(rank >= 1) {
            let side = rank.toString()+file.toString(); // quadrado do lado da torre
            if(rank != initialRank) {
                if(c(`.square.${genLetterCoords(side)}`).firstChild != null) {
                    legalMoves.push(rank.toString()+file.toString());
                    rank = 0;
                } else {
                    legalMoves.push(rank.toString()+file.toString());
                    rank--;
                }
            } else {
                rank--;
            }
        }
        rank = initialRank;
        while(rank <= 8) {
            let side = rank.toString()+file.toString(); // quadrado do lado da torre
            if(rank != initialRank) {
                if(c(`.square.${genLetterCoords(side)}`).firstChild != null) {
                    legalMoves.push(rank.toString()+file.toString());
                    rank = 9;
                } else {
                    legalMoves.push(rank.toString()+file.toString());
                    rank++;
                }
            } else {
                rank++;
            }
        }

        // file
        rank = initialRank;
        while(file >= 1) {
            let front = rank.toString()+file.toString(); // quadrado na frente da torre
            if(file != initialFile) {
                if(c(`.square.${genLetterCoords(front)}`).firstChild != null) {
                    legalMoves.push(rank.toString()+file.toString());
                    file = 0;
                } else {
                    legalMoves.push(rank.toString()+file.toString());
                    file--;
                }
            } else {
                file--;
            }
        }
        file = initialFile;
        while(file <= 8) {
            let front = rank.toString()+file.toString(); // quadrado na frente da torre
            if(file != initialFile) {
                if(c(`.square.${genLetterCoords(front)}`).firstChild != null) {
                    legalMoves.push(rank.toString()+file.toString());
                    file = 9;
                } else {
                    legalMoves.push(rank.toString()+file.toString());
                    file++;
                }
            } else {
                file++;
            }
        }
    } else if(piece == 'n') {
        let initialRank = rank;
        let initialFile = file;

        let arr1 = [1, -1, 1, -1];
        let arr2 = [2, 2, -2, -2];

        for(i = 0; i < arr1.length; i++) {
            rank = initialRank;
            file = initialFile;
            rank += arr1[i];
            file += arr2[i];

            if(rank >= 1 && rank <= 8 && file >= 1 && file <= 8) {
                legalMoves.push(rank.toString()+file.toString());
            }
        }

        for(i = 0; i < arr1.length; i++) {
            rank = initialRank;
            file = initialFile;
            rank += arr2[i];
            file += arr1[i];

            if(rank >= 1 && rank <= 8 && file >= 1 && file <= 8) {
                legalMoves.push(rank.toString()+file.toString());
            }
        }
    } else if(piece == 'b') {
        let initialRank = rank;
        let initialFile = file;
                
        // rank - top
        while(rank > 1 && file < 8) {
            rank = rank-1;
            file = file+1;
            let topLeftDiag = rank.toString()+file.toString(); // quadrado do lado da torre
            if(c(`.square.${genLetterCoords(topLeftDiag)}`).firstChild != null) {
                legalMoves.push(topLeftDiag);
                rank = 1;
            } else {
                legalMoves.push(topLeftDiag);
            }
        }
        rank = initialRank;
        file = initialFile;
        while(rank < 8 && file < 8) {
            rank = rank+1;
            file = file+1;
            let topRightDiag = rank.toString()+file.toString(); // quadrado do lado da torre
            if(c(`.square.${genLetterCoords(topRightDiag)}`).firstChild != null) {
                legalMoves.push(topRightDiag);
                rank = 8;
            } else {
                legalMoves.push(topRightDiag);
            }
        }
        rank = initialRank;
        file = initialFile;
        // rank - bottom
        while(rank > 1 && file > 1) {
            rank = rank-1;
            file = file-1;
            let bottomLeftDiag = rank.toString()+file.toString(); // quadrado do lado da torre
            if(c(`.square.${genLetterCoords(bottomLeftDiag)}`).firstChild != null) {
                legalMoves.push(bottomLeftDiag);
                rank = 1;
            } else {
                legalMoves.push(bottomLeftDiag);
            }
        }
        rank = initialRank;
        file = initialFile;
        while(rank < 8 && file > 1) {
            rank = rank+1;
            file = file-1;
            let bottomRightDiag = rank.toString()+file.toString(); // quadrado do lado da torre
            if(c(`.square.${genLetterCoords(bottomRightDiag)}`).firstChild != null) {
                legalMoves.push(bottomRightDiag);
                rank = 8;
            } else {
                legalMoves.push(bottomRightDiag);
            }
        }
    } else if(piece == 'q')  {
        let initialRank = rank;
        let initialFile = file;

        // rank
        while(rank >= 1) {
            let side = rank.toString()+file.toString(); // quadrado do lado da torre
            if(rank != initialRank) {
                if(c(`.square.${genLetterCoords(side)}`).firstChild != null) {
                    legalMoves.push(rank.toString()+file.toString());
                    rank = 0;
                } else {
                    legalMoves.push(rank.toString()+file.toString());
                    rank--;
                }
            } else {
                rank--;
            }
        }
        rank = initialRank;
        while(rank <= 8) {
            let side = rank.toString()+file.toString(); // quadrado do lado da torre
            if(rank != initialRank) {
                if(c(`.square.${genLetterCoords(side)}`).firstChild != null) {
                    legalMoves.push(rank.toString()+file.toString());
                    rank = 9;
                } else {
                    legalMoves.push(rank.toString()+file.toString());
                    rank++;
                }
            } else {
                rank++;
            }
        }

        // file
        rank = initialRank;
        while(file >= 1) {
            let front = rank.toString()+file.toString(); // quadrado na frente da torre
            if(file != initialFile) {
                if(c(`.square.${genLetterCoords(front)}`).firstChild != null) {
                    legalMoves.push(rank.toString()+file.toString());
                    file = 0;
                } else {
                    legalMoves.push(rank.toString()+file.toString());
                    file--;
                }
            } else {
                file--;
            }
        }
        file = initialFile;
        while(file <= 8) {
            let front = rank.toString()+file.toString(); // quadrado na frente da torre
            if(file != initialFile) {
                if(c(`.square.${genLetterCoords(front)}`).firstChild != null) {
                    legalMoves.push(rank.toString()+file.toString());
                    file = 9;
                } else {
                    legalMoves.push(rank.toString()+file.toString());
                    file++;
                }
            } else {
                file++;
            }
        }
            
        rank = initialRank;
        file = initialFile;
        // rank - top
        while(rank > 1 && file < 8) {
            rank = rank-1;
            file = file+1;
            let topLeftDiag = rank.toString()+file.toString(); // quadrado do lado da torre
            if(c(`.square.${genLetterCoords(topLeftDiag)}`).firstChild != null) {
                legalMoves.push(topLeftDiag);
                rank = 1;
            } else {
                legalMoves.push(topLeftDiag);
            }
        }
        rank = initialRank;
        file = initialFile;
        while(rank < 8 && file < 8) {
            rank = rank+1;
            file = file+1;
            let topRightDiag = rank.toString()+file.toString(); // quadrado do lado da torre
            if(c(`.square.${genLetterCoords(topRightDiag)}`).firstChild != null) {
                legalMoves.push(topRightDiag);
                rank = 8;
            } else {
                legalMoves.push(topRightDiag);
            }
        }
        rank = initialRank;
        file = initialFile;
        // rank - bottom
        while(rank > 1 && file > 1) {
            rank = rank-1;
            file = file-1;
            let bottomLeftDiag = rank.toString()+file.toString(); // quadrado do lado da torre
            if(c(`.square.${genLetterCoords(bottomLeftDiag)}`).firstChild != null) {
                legalMoves.push(bottomLeftDiag);
                rank = 1;
            } else {
                legalMoves.push(bottomLeftDiag);
            }
        }
        rank = initialRank;
        file = initialFile;
        while(rank < 8 && file > 1) {
            rank = rank+1;
            file = file-1;
            let bottomRightDiag = rank.toString()+file.toString(); // quadrado do lado da torre
            if(c(`.square.${genLetterCoords(bottomRightDiag)}`).firstChild != null) {
                legalMoves.push(bottomRightDiag);
                rank = 8;
            } else {
                legalMoves.push(bottomRightDiag);
            }
        }
    } else if(piece == 'k') {
        let initialRank = rank;
        let initialFile = file;

        let arr1 = [-1, 0, 1, -1, 0, 1, -1, 1];
        let arr2 = [1, 1, 1, -1, -1, -1, 0, 0];

        for(i = 0; i < arr1.length; i++) {
            rank = initialRank;
            file = initialFile;
            rank += arr1[i];
            file += arr2[i];

            if(rank >= 1 && rank <= 8 && file >= 1 && file <= 8) {
                legalMoves.push(rank.toString()+file.toString());
            }
        }

        rank = initialRank;
        file = initialFile;

        if(col == 'w') {
            if(whitePiecesMoves[5] == 0 && whitePiecesMoves[1][0] == 0) {
                legalMoves.push((rank-2).toString()+file.toString());
            }
            if(whitePiecesMoves[5] == 0 && whitePiecesMoves[1][1] == 0) {
                legalMoves.push((rank+2).toString()+file.toString());
            }
        } else if(col == 'b') {
            if(blackPiecesMoves[5] == 0 && blackPiecesMoves[1][0] == 0) {
                legalMoves.push((rank-2).toString()+file.toString());
            }
            if(blackPiecesMoves[5] == 0 && blackPiecesMoves[1][1] == 0) {
                legalMoves.push((rank+2).toString()+file.toString());
            }
        }
    }

    // mostrar movimentos legais
	cleanLegalMoves();
    for(k = 0; k < legalMoves.length; k++) {
        for(l = 0; l < square.length; l++) {
            if(square[l].classList[1] == genLetterCoords(legalMoves[k])) {
                square[l].classList.add('bg_red');
            }
        }
    }
}

/********************************************************************/

// contabilizar movimentos das peças

function contMove(piece) {
    let col = piece.id[0];
    let pc = piece.id[1];
    let numPc;
    if(piece.id.length == 3) {numPc = piece.id[2];} else {numPc = piece.id[2] + piece.id[3];}
	
    if(col == 'w') {
        if(pc == 'p') {
			for(a = 8; a <= 15; a++) {
				if(numPc == a) {
					whitePiecesMoves[0][a-8] += 1;
				}
			}
        } else if(pc == 'r') {
            for(a = 0; a <= 7; a++) {
				if(numPc == a) {
                    let key;
                    if(a == 0) {key = 0;} else if(a == 7) {key = 1;}
					whitePiecesMoves[1][key] += 1;
				}
			}
        } else if(pc == 'n') {
            whitePiecesMoves[2] = whitePiecesMoves[2]+1;
        } else if(pc == 'b') {
            whitePiecesMoves[3] = whitePiecesMoves[3]+1;
        } else if(pc == 'q') {
            whitePiecesMoves[4] = whitePiecesMoves[4]+1;
        } else if(pc == 'k') {
            whitePiecesMoves[5] = whitePiecesMoves[5]+1;
        }
    } else if(col == 'b') {
        if(pc == 'p') {
			for(a = 48; a <= 55; a++) {
				if(numPc == a) {
					blackPiecesMoves[0][a-48] = blackPiecesMoves[0][a-48]+1;
				}
			}
        } else if(pc == 'r') {
            for(a = 56; a <= 63; a++) {
				if(numPc == a) {
                    let key;
                    if(a == 56) {key = 0;} else if(a == 63) {key = 1;}
					blackPiecesMoves[1][key] += 1;
				}
			}
        } else if(pc == 'n') {
            blackPiecesMoves[2] = blackPiecesMoves[2]+1;
        } else if(pc == 'b') {
            blackPiecesMoves[3] = blackPiecesMoves[3]+1;
        } else if(pc == 'q') {
            blackPiecesMoves[4] = blackPiecesMoves[4]+1;
        } else if(pc == 'k') {
            blackPiecesMoves[5] = blackPiecesMoves[5]+1;
        }
    }
}

// drag

let moves = [];
let delMoves = [];
let eatenPieces = [];
let totalMoves = 0;
let startPosition;

for(i = 0; i < square.length; i++) {
	if(square[i].firstChild != null) {
		square[i].addEventListener('mousedown', mouseDown);
	}
    square[i].addEventListener('dragstart', dragstart);
}

function mouseDown(e) {
	genLegalMoves(e.target);
}

function dragstart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => {
        e.target.classList.add('hide');
    }, 0);
    startPosition = e.target.parentElement.id;
    e.target.classList.remove(e.target.classList[1])
    e.target.classList.add(e.target.parentElement.classList[1]);
    genLegalMoves(e.target);
}

// drop

function block(e) {
    c(`#${startPosition}`).appendChild(c('#'+e));
}

square.forEach(square => {
    square.addEventListener('dragenter', dragEnter);
    square.addEventListener('dragover', dragOver);
    square.addEventListener('dragleave', dragLeave);
    square.addEventListener('drop', drop);
});

function dragEnter(e) {
    e.preventDefault();
    // e.target.classList.add('drag-over');
}

function dragOver(e) {
    e.preventDefault();
    // e.target.classList.add('drag-over');
}

function dragLeave(e) {
    // e.target.classList.remove('drag-over');
}

function drop(e) {
    // e.target.classList.remove('drag-over');

    let id = e.dataTransfer.getData('text/plain');
    let draggable = document.querySelector('#'+id);

    let color = draggable.id[0];

    let dropTarget;
    let imageId;

    if(e.target.id == startPosition || e.target.id[0] == draggable.id[0]) {
        block(id);
    } else {
        if(totalMoves % 2 == 0) {
            /* ********** PAREI AQUI */
            if(id[1] == 'k' && (draggable.parentElement.id[3] == 2 || draggable.parentElement.id[3] == 6)) {
                console.log('bom dia');
            }
            /* ********** */
            if(color == 'w') {
                let isLegal = false;
                for(m = 0; m < legalMoves.length; m++) {
                    let coords;
                    if(e.target.classList[0] != 'square') {
                        coords = genNumCoords(e.target.parentElement.classList[1]);
                        if(coords == legalMoves[m]) {
                            isLegal = true;
                        }
                    } else {
                        coords = genNumCoords(e.target.classList[1]);
                        if(coords == legalMoves[m]) {
                            isLegal = true;
                        }
                    }
                }

                if(isLegal) {
                    if(e.target.classList[0] != 'square') {
                        dropTarget = e.target.parentElement.classList[1];
                        imageId = e.target.id;
                        eatenPieces.push(c(`#${e.target.id}`));
                        e.target.parentElement.appendChild(draggable);
                        e.target.remove();
                        contMove(draggable);
                    } else {
                        dropTarget = e.target.classList[1];
                        e.target.appendChild(draggable);
                        contMove(draggable);
                    }
    
                    totalMoves++;
                    moves.push(draggable.id + '-' + draggable.classList[1] + '-' + dropTarget + '-' + imageId);
                    cleanLegalMoves();
                    cleanMove();
                    moved(draggable.classList[1], dropTarget);
                } else {
                    block(id);
                }
			} else {
                block(id);
            }
        } else {
            if(color == 'b') {
                let isLegal = false;
                for(m = 0; m < legalMoves.length; m++) {
                    let coords;
                    if(e.target.classList[0] != 'square') {
                        coords = genNumCoords(e.target.parentElement.classList[1]);
                        if(coords == legalMoves[m]) {
                            isLegal = true;
                        }
                    } else {
                        coords = genNumCoords(e.target.classList[1]);
                        if(coords == legalMoves[m]) {
                            isLegal = true;
                        }
                    }
                }

                if(isLegal) {
                    if(e.target.classList[0] != 'square') {
                        dropTarget = e.target.parentElement.classList[1];
                        imageId = e.target.id;
                        eatenPieces.push(c(`#${e.target.id}`));
                        e.target.parentElement.appendChild(draggable);
                        e.target.remove();
                        contMove(draggable);
                    } else {
                        dropTarget = e.target.classList[1];
                        e.target.appendChild(draggable);
                        contMove(draggable);
                    }
    
                    totalMoves++;
                    moves.push(draggable.id + '-' + draggable.classList[1] + '-' + dropTarget + '-' + imageId);
                    cleanLegalMoves();
                    cleanMove();
                    moved(draggable.classList[1], dropTarget);
                } else {
                    block(id);
                }
			} else {
                block(id);
            }
        }
    }
    
    draggable.classList.remove('hide');
}


/* voltar e avançar movimento */

function move(str, m) {
    let moveDt = m.split('-');
    let piece1 = moveDt[0];
    let square1 = moveDt[1];
    let square2 = moveDt[2];
    let piece2 = moveDt[3];

    cleanLegalMoves();
    cleanMove();

    let col = piece1[0];
    let pc = piece1[1];
    let numPc;
    if(piece1.length == 3) {numPc = piece1[2];} else {numPc = piece1[2] + piece1[3];}

    if(col == 'w') {
        if(pc == 'p') {
            let key = numPc - 8;
            whitePiecesMoves[0][key] -= 1;
        } else if(pc == 'k') {
            whitePiecesMoves[5] -= 1;
        }
    } else if(col == 'b') {
        if(pc == 'p') {
            let key = numPc - 48;
            blackPiecesMoves[0][key] -= 1;
        } else if(pc == 'k') {
            blackPiecesMoves[5] -= 1;
        }
    }

    if(str == 'p') {
        if(piece2 == 'undefined') {
            c(`div.${square1}`).appendChild(c(`#${piece1}`));
        } else {
            c(`div.${square2}`).appendChild(eatenPieces[eatenPieces.length-1]);
            c(`div.${square1}`).appendChild(c(`#${piece1}`));
            eatenPieces.pop();
        }
    } else if(str == 'n') {
        if(piece2 == 'undefined') {
            c(`div.${square2}`).appendChild(c(`#${piece1}`));
        } else {
            eatenPieces.push(c(`#${c(`div.${square2}`).firstChild.id}`));
            c(`div.${square2}`).firstChild.remove();
            c(`div.${square2}`).appendChild(c(`#${piece1}`));
        }
    }

    if(str == 'p') {
        totalMoves--;
        delMoves.push(moves[moves.length-1]);
        moves.pop();
    } else if(str == 'n') {
        totalMoves++;
        moves.push(delMoves[delMoves.length-1]);
        delMoves.pop();
    }
    
    if(moves.length == 0) {
        delMoves = [];
    }
}

c('.previous_move').addEventListener('click', () => { if(moves.length>0) {move('p', moves[moves.length-1]);} });
c('.next_move').addEventListener('click', () => { if(delMoves.length>0) {move('n', delMoves[delMoves.length-1])} });


/* bloquear movimento se a peça sair do tabuleiro */

c('body').addEventListener('dragstart', bodyDragStart);
c('body').addEventListener('dragenter', bodyDragEnter);
c('body').addEventListener('dragover', bodyDragOver);
c('body').addEventListener('drop', bodyDrop);

let draggable;

function bodyDragStart(e) {
    let id = e.dataTransfer.getData('text/plain');
    draggable = c('#'+id);
}

function bodyDragEnter(e) {
    e.preventDefault();
}

function bodyDragOver(e) {
    e.preventDefault();
}

function bodyDrop(e) {
    if(e.target.classList[0] == 'square' || e.target.classList[0] == 'piece') {

    } else {
        c(`#${startPosition}`).appendChild(draggable);
        draggable.classList.remove('hide');
    }
}