// Inicialização das variáveis globais
const guitarNeck = document.getElementById('guitar-neck');
const canvas = document.getElementById('canvas-overlay');
const ctx = canvas.getContext('2d');
const selectedPositions = new Map();

// Adicionar mapeamento de notas
const stringNotes = {
    1: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],  // Primeira corda (mais fina)
    2: ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    3: ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G'],
    4: ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'],
    5: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'],
    6: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E']   // Sexta corda (mais grossa)
};

// Mapeamento por regiões do braço
const fretPositions = {
    // Valores muito maiores para as primeiras casas
    start: [
        0.035,  // Pestana
        0.075,  // 1º traste
        0.115,  // 2º traste
        0.155   // 3º traste
    ],
    // Mantendo os valores que estavam funcionando bem
    middle: [
        0.240,  // 4º traste
        0.290,  // 5º traste
        0.335,  // 6º traste
        0.380   // 7º traste
    ],
    end: [
        0.420,  // 8º traste
        0.460,  // 9º traste
        0.495,  // 10º traste
        0.530,  // 11º traste
        0.560   // 12º traste
    ]
};

// Posições exatas das cordas
const stringPositions = [
    0.172,  // 1ª corda
    0.292,  // 2ª corda
    0.412,  // 3ª corda
    0.532,  // 4ª corda
    0.652,  // 5ª corda
    0.772   // 6ª corda
];

// Aguardar o DOM e a imagem carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    guitarNeck.addEventListener('load', function() {
        initializeCanvas();
    });
    
    if (guitarNeck.complete) {
        initializeCanvas();
    }
});

function initializeCanvas() {
    // Ajustar tamanho do canvas para corresponder à imagem
    canvas.width = guitarNeck.width;
    canvas.height = guitarNeck.height;
    
    // Adicionar evento de clique na imagem E no canvas
    guitarNeck.addEventListener('click', handleClick);
    canvas.addEventListener('click', handleClick);
    
    console.log('Canvas inicializado:', canvas.width, canvas.height); // Debug
}

function handleClick(event) {
    const rect = guitarNeck.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    
    let fret = -1;
    
    // Nova lógica de detecção baseada em intervalos
    const allFrets = [
        ...fretPositions.start,
        ...fretPositions.middle,
        ...fretPositions.end
    ];
    
    // Calcular os pontos médios entre os trastes
    for (let i = 0; i < allFrets.length - 1; i++) {
        const currentFret = allFrets[i];
        const nextFret = allFrets[i + 1];
        const midPoint = (currentFret + nextFret) / 2;
        
        // Se o clique está entre o traste atual e o próximo
        if (xPercent >= currentFret && xPercent < nextFret) {
            // Se está mais próximo do traste atual
            if (xPercent < midPoint) {
                fret = i;
            } else {
                fret = i + 1;
            }
            break;
        }
        
        // Caso especial para a pestana
        if (i === 0 && xPercent < currentFret) {
            fret = 0;
            break;
        }
    }
    
    // Verificação da corda com lógica similar
    let string = -1;
    for (let i = 0; i < stringPositions.length - 1; i++) {
        const currentString = stringPositions[i];
        const nextString = stringPositions[i + 1];
        const midPoint = (currentString + nextString) / 2;
        
        if (yPercent >= currentString && yPercent < nextString) {
            if (yPercent < midPoint) {
                string = i + 1;
            } else {
                string = i + 2;
            }
            break;
        }
        
        // Caso especial para primeira e última corda
        if (i === 0 && yPercent < currentString) {
            string = 1;
            break;
        }
        if (i === stringPositions.length - 2 && yPercent >= nextString) {
            string = 6;
            break;
        }
    }
    
    if (fret >= 0 && fret < 12 && string >= 1 && string <= 6) {
        const positionKey = `${string}-${fret}`;
        const note = stringNotes[string][fret];
        
        if (selectedPositions.has(positionKey)) {
            selectedPositions.delete(positionKey);
        } else {
            selectedPositions.set(positionKey, {note, string, fret});
        }
        
        clearCanvas();
        redrawAllPoints();
        identifyChord();
    }
}

function drawPoint(fret, string) {
    const rect = guitarNeck.getBoundingClientRect();
    let x;
    
    // Posicionamento específico para as primeiras casas
    if (fret <= 3) {
        x = rect.width * fretPositions.start[fret];
    } else if (fret <= 7) {
        x = rect.width * fretPositions.middle[fret - 4];
    } else {
        x = rect.width * fretPositions.end[fret - 8];
    }
    
    const y = rect.height * stringPositions[string - 1];
    
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function redrawAllPoints() {
    selectedPositions.forEach((_, key) => {
        const [string, fret] = key.split('-').map(Number);
        drawPoint(fret, string);
    });
}

function identifyChord() {
    if (selectedPositions.size < 3) {
        document.getElementById('chord-name').textContent = 'Selecione pelo menos 3 notas';
        return;
    }

    const notes = Array.from(selectedPositions.values()).map(pos => pos.note);
    const uniqueNotes = [...new Set(notes)].sort();
    
    // Identificação básica de acordes
    const rootNote = uniqueNotes[0];
    const hasThird = uniqueNotes.some(note => {
        const index = (stringNotes[1].indexOf(note) - stringNotes[1].indexOf(rootNote) + 12) % 12;
        return index === 4 || index === 3;
    });
    const hasFifth = uniqueNotes.some(note => {
        const index = (stringNotes[1].indexOf(note) - stringNotes[1].indexOf(rootNote) + 12) % 12;
        return index === 7;
    });
    
    let chordType = '';
    if (hasThird && hasFifth) {
        // Verificar se é maior ou menor
        const hasMinorThird = uniqueNotes.some(note => {
            const index = (stringNotes[1].indexOf(note) - stringNotes[1].indexOf(rootNote) + 12) % 12;
            return index === 3;
        });
        chordType = hasMinorThird ? 'm' : '';
    }
    
    document.getElementById('chord-name').textContent = `${rootNote}${chordType}`;
}

