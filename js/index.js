const guitarNeck = document.getElementById('guitar-neck');
const canvas = document.getElementById('canvas-overlay');
const ctx = canvas.getContext('2d');
const selectedPositions = new Map();
let selectedPoints = [];

const stringNotes = {
    1: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],  // Primeira corda (mais fina)
    2: ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    3: ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G'],
    4: ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'],
    5: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'],
    6: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E']   // Sexta corda (mais grossa)
};

// Posições das casas no braço (da direita para a esquerda)
const fretPositions = [
    0.77, // Casa 0 (pestana)
    0.04, // Casa 1
    0.12, // Casa 2
    0.18, // Casa 3
    0.26, // Casa 4
    0.33, // Casa 5
    0.39, // Casa 6
    0.46, // Casa 7
    0.51, // Casa 8
    0.56, // Casa 9
    0.62, // Casa 10
    0.66, // Casa 11
    0.71,  // Casa 12
    0.75, // Casa 13
    0.794, // Casa 14 
    0.834, // Casa 15 
    0.874, // Casa 16 
    0.91, // Casa 17 
    0.94, // Casa 18 
    0.974 // Casa 19
    // 0.99, // Casa 20
    // 1.0, // Casa 21
    // 1.1 // Casa 22
];

// Posições das cordas por região do braço
const stringPositionsByRegion = {
    // Região 1 (Casas 0-3)
    region1: [
        0.66,  // E (1ª corda)
        0.60,  // B
        0.53,  // G
        0.48,  // D
        0.42,  // A
        0.36   // E (6ª corda)
    ],
    // Região 2 (Casas 4-7)
    region2: [
        0.68,  // E (1ª corda)
        0.62,  // B
        0.55,  // G
        0.485,  // D
        0.42,  // A
        0.36   // E (6ª corda)
    ],
    // Região 3 (Casas 8-12)
    region3: [
        0.72,  // E (1ª corda)
        0.65,  // B
        0.57,  // G
        0.50,  // D
        0.42,  // A
        0.35   // E (6ª corda)
    ],
    // Região 4 (Casas 13-17)
    region4: [
        0.72,  // E (1ª corda)
        0.65,  // B
        0.58,  // G
        0.50,  // D
        0.42,  // A
        0.35   // E (6ª corda)
    ],
    // Região 5 (Casas 18-22)
    region5: [
        0.74,  // E (1ª corda)
        0.66,  // B
        0.58,  // G
        0.50,  // D
        0.42,  // A
        0.35   // E (6ª corda)
    ]
};

// Função para obter a posição da corda baseada na casa
function getStringPosition(string, fret) {
    if (fret <= 3) {
        return stringPositionsByRegion.region1[string - 1];
    } else if (fret <= 7) {
        return stringPositionsByRegion.region2[string - 1];
    } else if (fret <= 12) {
        return stringPositionsByRegion.region3[string - 1];
    } else if (fret <= 17) {
        return stringPositionsByRegion.region4[string - 1];
    } else {
        return stringPositionsByRegion.region5[string - 1];
    }
}

// Aguardar o DOM e a imagem carregar completamente
document.addEventListener('DOMContentLoaded', function () {
    guitarNeck.addEventListener('load', function () {
        initializeCanvas();
    });
    if (guitarNeck.complete) {
        initializeCanvas();
    }
});

function initializeCanvas() {
    // Define o tamanho do canvas para 490x128 (tamanho do braço da guitarra)
    canvas.width = 490;
    canvas.height = 128;
    // Adicionar evento de clique apenas no canvas
    canvas.addEventListener('click', handleClick);
}

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    // Ajusta as coordenadas para serem relativas ao canvas
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Define a área útil do braço (excluindo o headstock)
    const neckStartX = 0;   // Começa do início do canvas
    const neckWidth = 450;  // Usa mais largura para alcançar todas as casas
    // Converte para coordenadas relativas ao canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    // Se o clique for antes do início do braço, ignora
    if (canvasX < neckStartX) {
        return;
    }
    // Se o clique for depois do fim do braço útil, ignora
    if (canvasX > neckStartX + neckWidth) {
        return;
    }
    // Se o clique for muito à direita (na mão da guitarra), ignora
    if (canvasX > 450) { // Limite máximo
        console.log('Click on guitar hand, ignoring');
        return;
    }
    // Normaliza as coordenadas considerando apenas a área útil do braço
    const xPercent = (canvasX - neckStartX) / neckWidth;
    const yPercent = canvasY / canvas.height;
    console.log('Click raw:', {
        x, y,
        canvasX, canvasY,
        neckStartX,
        neckWidth,
        xPercent,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        rectWidth: rect.width,
        rectHeight: rect.height,
        yPercent
    });
    let fret = -1;
    let minDistance = Infinity;
    let distances = [];
    // Encontra a casa mais próxima do clique
    for (let i = 1; i < fretPositions.length; i++) {
        const distance = Math.abs(xPercent - (1 - fretPositions[i]));
        distances.push({ fret: i, position: fretPositions[i], distance });
        console.log(`Checking fret ${i}: position ${fretPositions[i]}, distance ${distance}`);
        if (distance < minDistance && distance < 0.06) {
            minDistance = distance;
            fret = i;
        }
    }
    console.log('All distances:', distances.sort((a, b) => a.distance - b.distance));
    // Se nenhuma casa foi encontrada dentro do limite, encontre a mais próxima
    if (fret === -1) {
        for (let i = 0; i < fretPositions.length; i++) {
            const distance = Math.abs(xPercent - (1 - fretPositions[i]));
            if (distance < minDistance) {
                minDistance = distance;
                fret = i;
            }
        }
    }
    // Verificação da corda
    let string = -1;
    let minStringDistance = Infinity;
    // Encontra a corda mais próxima do clique
    for (let i = 1; i <= 6; i++) {  // Mudamos de 0 para 1 e <= 6
        const stringPos = getStringPosition(i, fret);
        const distance = Math.abs(yPercent - stringPos);

        console.log(`Checking string ${i}:`, {
            stringPos,
            distance,
            yPercent
        });

        if (distance < minStringDistance) {
            minStringDistance = distance;
            string = i;
        }
    }
    // Adiciona uma verificação de distância máxima aceitável
    if (minStringDistance > 0.1) { // Ajuste esse valor conforme necessário
        string = -1;
    }
    console.log('String detection:', {
        string,
        minStringDistance,
        yPercent
    });
    // Verifica se o clique está dentro de uma margem aceitável
    if (fret >= 0 && fret <= 22 && string >= 1 && string <= 6) {
        const positionKey = `${string}-${fret}`;
        const note = stringNotes[string][fret];
        if (selectedPositions.has(positionKey)) {
            selectedPositions.delete(positionKey);
        } else {
            selectedPositions.set(positionKey, { note, string, fret });
        }
        clearCanvas();
        redrawAllPoints();
        identifyChord();
    }
    console.log('xPercent:', xPercent, 'yPercent:', yPercent, 'Detected fret:', fret, 'Detected string:', string);
}

function drawPoint(fret, string) {
    // Verifica se o ponto já existe
    if (selectedPoints.some(point => point.fret === fret && point.string === string)) {
        return; // Se já existe, não adiciona novamente
    }
    // Adiciona o novo ponto ao array
    selectedPoints.push({ fret, string });
    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Define a área útil do braço
    const neckStartX = 0;
    const neckWidth = 450;
    // Desenha todos os pontos
    for (const point of selectedPoints) {
        // Calcula a posição X baseada na posição da casa
        const xPos = neckStartX + (neckWidth * (1 - fretPositions[point.fret]));
        // Calcula a posição Y baseada na posição da corda
        const yPos = canvas.height * getStringPosition(point.string, point.fret);
        // Calcula o tamanho do ponto baseado na casa (menor conforme vai pro final)
        const maxSize = 4; // Tamanho na primeira casa
        const minSize = 2; // Tamanho na última casa
        const size = maxSize - ((maxSize - minSize) * (point.fret / 22));
        // Desenha o ponto
        ctx.beginPath();
        ctx.arc(xPos, yPos, size, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
        console.log('Drawing point:', {
            fret: point.fret,
            string: point.string,
            x: xPos,
            y: yPos,
            size,
            canvasWidth: canvas.width,
        });
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Limpa o array de pontos
    selectedPoints = [];
}

function redrawAllPoints() {
    selectedPositions.forEach((_, key) => {
        const [string, fret] = key.split('-').map(Number);
        drawPoint(fret, string);
    });
}

function identifyChord() {
    console.log(selectedPositions);
    console.log('[DEBUG] Iniciando identificação do acorde...');
    const positions = parsePositions(selectedPositions);
    console.log('[DEBUG] Posições parseadas:', positions);
    const bassNote = findBassNote(positions);
    console.log('[DEBUG] Nota mais grave (baixo):', bassNote);
    const notes = getUniqueNotes(positions);
    console.log('[DEBUG] Notas únicas:', notes);
    if (!bassNote) {
        console.log('[ERROR] Nota mais grave não encontrada');
        document.getElementById('chord-name').textContent = 'Acorde não reconhecido';
        return;
    }
    const rootNote = bassNote || notes[0]; // Use a nota mais grave ou a primeira nota
    console.log('[DEBUG] Nota fundamental:', rootNote);
    const intervals = calculateIntervalsFromRoot(rootNote, notes);
    console.log('[DEBUG] Intervalos calculados:', intervals);
    // Determinar o tipo do acorde
    const chordType = determineChordType(intervals);
    console.log('[DEBUG] Tipo do acorde:', chordType);
    // Verificar se o acorde é menor
    const isMinor = identifyMinorChord(positions);
    console.log('[DEBUG] É um acorde menor?', isMinor);
    // Se o tipo do acorde for "Acorde não reconhecido", usar essa mensagem diretamente
    if (chordType === 'Acorde não reconhecido') {
        document.getElementById('chord-name').textContent = 'Acorde não reconhecido';
        return;
    }
    // Caso contrário, montar o nome do acorde normalmente
    const chordName = `${rootNote}${chordType}`;
    const finalChordName = isMinor ? `${chordName}m` : chordName;
    document.getElementById('chord-name').textContent = finalChordName;
    console.log('[INFO] Nome do acorde identificado:', finalChordName);
}

function parsePositions(selectedPositions) {
    console.log('[DEBUG] Parsing posições selecionadas...');
    return Array.from(selectedPositions.entries())
        .map(([key, value]) => {
            // Divide a chave da posição para extrair string e fret
            const [string, fret] = key.split('-').map(Number);
            if (isNaN(string) || isNaN(fret)) {
                console.log(`[ERROR] Posição inválida: ${key}`);
                return null; // Retorna null em caso de dados inválidos
            }
            return { string, fret, note: value.note };
        })
        .filter(position => position !== null) // Filtra posições inválidas
        .sort((a, b) => b.string - a.string); // Ordenar da mais grave para a mais aguda
}

function findBassNote(positions) {
    console.log('[DEBUG] Encontrando nota mais grave...');
    // Ordena as posições por corda (da mais grossa para a mais fina)
    const sortedPositions = positions.sort((a, b) => b.string - a.string);
    // Mapeia as notas para as cordas
    const notesOnStrings = {};
    positions.forEach(pos => {
        notesOnStrings[pos.string] = pos.note;
    });
    // Padrão do Dm (se presente nas posições)
    if (notesOnStrings[2] === 'D' && notesOnStrings[3] === 'A' && notesOnStrings[1] === 'F') {
        return 'D';  // Raiz do acorde Dm
    }
    // Padrão do Am (se presente nas posições)
    if (notesOnStrings[3] === 'A' && notesOnStrings[4] === 'E' && notesOnStrings[2] === 'C') {
        return 'A';  // Raiz do acorde Am
    }
    if (notesOnStrings[5] === 'C' && notesOnStrings[4] === 'G' &&
        (notesOnStrings[3] === 'C' || notesOnStrings[2] === 'D#')) {
        return 'C';
    }
    if (notesOnStrings[6] === 'E' || 
        (notesOnStrings[5] === 'B' && notesOnStrings[4] === 'E')) {
        return 'E';
    }
    // Caso não seja um dos acordes definidos, procura pela nota mais grave
    const potentialRoot = sortedPositions.find(pos => pos.string === 6) ||  // Prioriza a corda 6
        sortedPositions.find(pos => pos.string === 5) ||  // Corda 5
        sortedPositions.find(pos => pos.string === 4) ||  // Corda 4
        sortedPositions.find(pos => pos.string === 3) ||  // Corda 3
        sortedPositions.find(pos => pos.string === 2);   // Corda 2
    // Se não encontrar, usa a nota da corda mais grave encontrada
    if (potentialRoot) {
        return potentialRoot.note;
    }
    // Se ainda não encontrar, retorna a primeira nota encontrada
    return sortedPositions[0].note;
}

function getUniqueNotes(positions) {
    console.log('[DEBUG] Obtendo notas únicas...');
    return [...new Set(positions.map(p => p.note))];
}

function identifyMinorChord(positions) {
    // Verificar se o acorde é menor baseado em notas
    const notes = positions.map(pos => pos.note);
    // Um acorde menor geralmente tem a terça menor
    // Por exemplo: se tiver C, E♭, G, então é menor
    // Vamos verificar se temos um padrão de terça menor
    const thirdIntervals = ['m', 'm3']; // Padrões de terça menor
    // Verifique os intervalos de distância das notas
    const rootNote = findRootNote(notes);
    const intervals = calculateIntervalsFromRoot(rootNote, notes);
    const isMinor = intervals.includes(3); // A presença do intervalo de terça menor é o que caracteriza um acorde menor.
    return isMinor;
}

function calculateIntervalsFromRoot(rootNote, notes) {
    const rootIndex = stringNotes[1].indexOf(rootNote); // Acessando a primeira corda
    console.log('Root Note:', rootNote, 'Root Index:', rootIndex); // Log da nota raiz e seu índice
    return notes.map(note => {
        // Encontrar a corda correspondente para cada nota
        let noteIndex = -1;
        for (let string = 1; string <= 6; string++) {
            noteIndex = stringNotes[string].indexOf(note);
            if (noteIndex !== -1) {
                // Se a nota foi encontrada, calcular o intervalo
                const interval = (noteIndex - rootIndex + 12) % 12; // Ajuste para intervalos positivos
                console.log(`Note: ${note}, Note Index: ${noteIndex}, Interval: ${interval}`); // Log da nota, seu índice e o intervalo
                return interval;
            }
        }
        console.log(`Note: ${note} not found`); 
        return null; // Retorna null se a nota não for encontrada
    }).filter(interval => interval !== null); // Filtra notas não encontradas
}

function determineChordType(intervals) {
    console.log('[DEBUG] Determinando tipo do acorde...');
    const hasRoot = intervals.includes(0);
    const hasNinth = intervals.includes(2);
    const hasMinorThird = intervals.includes(3);
    const hasMajorThird = intervals.includes(4);
    const hasPerfectFifth = intervals.includes(7);
    const hasDimFifth = intervals.includes(6);
    const hasAugFifth = intervals.includes(8);
    const hasMinorSeventh = intervals.includes(10);
    const hasMajorSeventh = intervals.includes(11);
    const hasSixth = intervals.includes(9);
    if (hasRoot) {
        if (hasMajorThird && hasPerfectFifth) {
            //if (rootNote === 'F') return 'F';
            if (hasSixth) return '6';
            if (hasMajorSeventh) return '7';
            if (hasMinorSeventh) return 'm7';
            return " ";
        }
        if (hasMinorThird && hasPerfectFifth) {
            //if (rootNote === 'F') return 'Fm';
            if (hasMinorSeventh) return 'm7';
            return 'm';
        }
        if (hasMajorThird && hasMinorSeventh && hasNinth) {
            return '9';
        }
        if (hasMinorThird && hasDimFifth) return "m";
        if (hasMajorThird && hasAugFifth) return " ";
        if (hasPerfectFifth && !hasMajorThird && !hasMinorThird) return '5';
        if (hasMajorThird && !hasPerfectFifth) return " ";
        if (hasMinorThird && !hasPerfectFifth) return 'm';
    }
    console.log('[DEBUG] Acorde não identificado. Intervalos:', intervals);
    return 'Acorde não reconhecido';
}

function findRootNote(notes) {
    console.log('[DEBUG] Encontrando nota mais grave...');
    return notes.reduce((lowest, note) => {
        let lowestIndex = null;
        for (let string = 1; string <= 6; string++) {
            const noteIndex = stringNotes[string].indexOf(note);
            if (noteIndex !== -1) {
                // Se a nota for encontrada na corda
                if (lowestIndex === null || noteIndex < lowestIndex) {
                    lowestIndex = noteIndex; // Atualiza o índice da nota mais baixa
                    lowest = note; // Atualiza a nota mais baixa
                }
            }
        }
        return lowest; 
    }, null);
}


function formatRootNote(bassNote) {
    console.log('[DEBUG] Formatando nota fundamental...');
    const accidental = bassNote.includes('#') ? '#' : bassNote.includes('b') ? 'b' : '';
    return bassNote[0] + accidental;
}

