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
    start: [
        0.005,  // Pestana (0)
        0.055,  // 1ª casa
        0.105,  // 2ª casa
        0.155   // 3ª casa
    ],
    middle: [
        0.205,  // 4ª casa
        0.255,  // 5ª casa
        0.305,  // 6ª casa
        0.355   // 7ª casa
    ],
    end: [
        0.405,  // 8ª casa
        0.455,  // 9ª casa
        0.505,  // 10ª casa
        0.555,  // 11ª casa
        0.605   // 12ª casa
    ]
};

// Posições exatas das cordas
const stringPositions = [
    0.36,  // Primeira corda (E) - ajustado
    0.41,  // Segunda corda (B) - ajustado
    0.47,  // Terceira corda (G) - ajustado
    0.52,  // Quarta corda (D) - ajustado
    0.59,  // Quinta corda (A) - ajustado
    0.65   // Sexta corda (E) - ajustado
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
    canvas.width = guitarNeck.width - 210;
    canvas.height = guitarNeck.height;
    
    // Adicionar evento de clique na imagem E no canvas
    guitarNeck.addEventListener('click', handleClick);
    canvas.addEventListener('click', handleClick);
    
    console.log('Canvas inicializado:', canvas.width, canvas.height); // Debug
}

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Ajusta a largura útil do canvas
    const usableWidth = canvas.width * 0.8;
    const xRatio = x / usableWidth;
    const yRatio = y / canvas.height;
    
    console.log('Click ratios:', {
        x: xRatio,
        y: yRatio,
        rawY: y,
        canvasHeight: canvas.height
    });
    
    const fret = findClosestFret(xRatio);
    const string = findClosestString(yRatio);
    
    console.log('Selected position:', {
        fret: fret,
        string: string
    });
    
    const positionKey = `${string}-${fret}`;
    if (selectedPositions.has(positionKey)) {
        selectedPositions.delete(positionKey);
    } else {
        const note = stringNotes[string][fret];
        selectedPositions.set(positionKey, { string, fret, note });
    }
    
    clearCanvas();
    redrawAllPoints();
    identifyChord();
}

function findClosestFret(xRatio) {
    // Valores ajustados para a nova escala
    const fretMap = [
        { min: 0.00, max: 0.10, fret: 0 },  // Pestana
        { min: 0.10, max: 0.20, fret: 1 },  // Primeira casa
        { min: 0.20, max: 0.30, fret: 2 },  // Segunda casa
        { min: 0.30, max: 0.40, fret: 3 },  // Terceira casa
        { min: 0.40, max: 0.50, fret: 4 },  // Quarta casa
        { min: 0.50, max: 0.60, fret: 5 },  // Quinta casa
        { min: 0.60, max: 0.70, fret: 6 },  // Sexta casa
        { min: 0.70, max: 0.80, fret: 7 },  // Sétima casa
        { min: 0.80, max: 0.90, fret: 8 },  // Oitava casa
        { min: 0.90, max: 1.00, fret: 9 },  // Nona casa
        { min: 1.00, max: 1.10, fret: 10 }, // Décima casa
        { min: 1.10, max: 1.20, fret: 11 }, // Décima primeira casa
        { min: 1.20, max: 1.30, fret: 12 }  // Décima segunda casa
    ];

    for (let position of fretMap) {
        if (xRatio >= position.min && xRatio < position.max) {
            return position.fret;
        }
    }
    return 0;
}

function findClosestString(yRatio) {
    let closestString = 1;
    let minDistance = Math.abs(yRatio - stringPositions[0]);
    
    for (let i = 1; i < stringPositions.length; i++) {
        const distance = Math.abs(yRatio - stringPositions[i]);
        if (distance < minDistance) {
            minDistance = distance;
            closestString = i + 1;
        }
    }
    
    console.log('String detection:', {
        yRatio: yRatio,
        selectedString: closestString
    });
    
    return closestString;
}

function drawPoint(fret, string) {
    const fretPositions = [
        0.05,  // Pestana
        0.15,  // Primeira casa
        0.25,  // Segunda casa
        0.35,  // Terceira casa
        0.45,  // Quarta casa
        0.55,  // Quinta casa
        0.65,  // Sexta casa
        0.75,  // Sétima casa
        0.85,  // Oitava casa
        0.95,  // Nona casa
        1.05,  // Décima casa
        1.15,  // Décima primeira casa
        1.25   // Décima segunda casa
    ];

    // Adiciona margem de segurança para não cortar os pontos
    const margin = 5;
    const x = Math.min(
        (canvas.width * 0.8) * fretPositions[fret],
        canvas.width - margin
    );
    const y = Math.min(
        canvas.height * stringPositions[string - 1],
        canvas.height - margin
    );
    
    console.log('Drawing point:', { fret, string, x, y });
    
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
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

