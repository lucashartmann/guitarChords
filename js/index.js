// Inicialização das variáveis globais
const guitarNeck = document.getElementById('guitar-neck');
const canvas = document.getElementById('canvas-overlay');
const ctx = canvas.getContext('2d');
const selectedPositions = new Map();
let selectedPoints = [];

// Adicionar mapeamento de notas
const stringNotes = {
    1: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],  // Primeira corda (mais fina)
    2: ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    3: ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G'],
    4: ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'],
    5: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'],
    6: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E']   // Sexta corda (mais grossa)
};

// Posições das casas no braço (da direita para a esquerda, em porcentagem da área útil)
const fretPositions = [
    0.77,   // Casa 0 (pestana)
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
    0.74  // Casa 12
];

// Posições exatas das cordas (de cima para baixo)
const stringPositions = [
    0.66,  // E
    0.60,  // B ?
    0.53,  // G ?
    0.48,  // D ?
    0.42,  // A ?
    0.36   // E
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
    for (let i = 0; i < stringPositions.length; i++) {
        const distance = Math.abs(yPercent - stringPositions[i]);
        if (distance < minStringDistance) {
            minStringDistance = distance;
            string = i + 1;
        }
    }
    
    console.log('Detected:', { fret, string, minDistance, minStringDistance });
    
    // Verifica se o clique está dentro de uma margem aceitável
    if (fret >= 0 && fret <= 22 && string >= 1 && string <= 6) {
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

    console.log('xPercent:', xPercent, 'yPercent:', yPercent, 'Detected fret:', fret, 'Detected string:', string);
}

function drawPoint(fret, string) {
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
        const yPos = canvas.height * stringPositions[point.string - 1];
        
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
    // Limpa também o array de pontos
    selectedPoints = [];
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

    // Converter posições em um formato mais fácil de analisar
    const positions = Array.from(selectedPositions.entries()).map(([key, value]) => {
        const [string, fret] = key.split(',').map(Number);
        return { string, fret, note: value.note };
    });

    // Ordenar por corda (da mais grossa para a mais fina)
    positions.sort((a, b) => b.string - a.string);

    console.log('Posições:', positions.map(p => `Corda ${p.string}: Casa ${p.fret} (${p.note})`));

    // Encontrar a nota mais grave (provavelmente a fundamental)
    const bassNote = positions.find(p => p.string === Math.max(...positions.map(p => p.string)))?.note;
    
    // Pegar todas as notas e remover duplicatas
    const notes = [...new Set(positions.map(p => p.note))];
    console.log('Notas encontradas:', notes);
    console.log('Nota mais grave:', bassNote);

    // Calcular intervalos em relação à nota mais grave
    const intervals = notes.map(note => {
        const bassIndex = stringNotes[1].indexOf(bassNote);
        const noteIndex = stringNotes[1].indexOf(note);
        return (noteIndex - bassIndex + 12) % 12;
    }).sort((a, b) => a - b);

    // Remover duplicatas e 0 (fundamental)
    const uniqueIntervals = [...new Set(intervals)].filter(i => i !== 0);
    console.log('Intervalos encontrados:', uniqueIntervals);

    // Verificar padrões de acordes
    let chordType = '';

    // Verificar terça
    const hasMinorThird = uniqueIntervals.includes(3);
    const hasMajorThird = uniqueIntervals.includes(4);
    
    // Verificar quinta
    const hasPerfectFifth = uniqueIntervals.includes(7);
    const hasDimFifth = uniqueIntervals.includes(6);
    const hasAugFifth = uniqueIntervals.includes(8);

    // Verificar outros intervalos importantes
    const hasMinorSeventh = uniqueIntervals.includes(10);
    const hasMajorSeventh = uniqueIntervals.includes(11);

    // Determinar o tipo do acorde
    if (hasPerfectFifth && !hasMinorThird && !hasMajorThird) {
        chordType = '5'; // Power chord
    }
    else if (hasMinorThird && hasDimFifth) {
        chordType = 'dim';
    }
    else if (hasMajorThird && hasAugFifth) {
        chordType = 'aug';
    }
    else if (hasMinorThird) {
        chordType = 'm';
        if (hasMinorSeventh) chordType += '7';
    }
    else if (hasMajorThird) {
        chordType = '';
        if (hasMinorSeventh) chordType += '7';
        else if (hasMajorSeventh) chordType += 'maj7';
    }

    // Se não encontrou um padrão conhecido
    if (!bassNote) {
        document.getElementById('chord-name').textContent = 'Acorde não reconhecido';
        return;
    }

    // Verificar se tem uma nota alterada (#/b) na fundamental
    const accidental = bassNote.includes('#') ? '#' : bassNote.includes('b') ? 'b' : '';
    const rootNote = bassNote[0] + accidental;

    document.getElementById('chord-name').textContent = `${rootNote}${chordType}`;
}
