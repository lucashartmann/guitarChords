const bracoGuitarra = document.getElementById('guitar-neck');
const canvas = document.getElementById('canvas-overlay');
const ctx = canvas.getContext('2d');
const posicoesSelecionadas = new Map();
let pontosSelecionados = [];

const notasCorda = {
    1: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'],  // Primeira corda (mais fina)
    2: ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'],
    3: ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F'],
    4: ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'],
    5: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G'],
    6: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D']   // Sexta corda (mais grossa)
};

// Posições das casas no braço (da direita para a esquerda)
const posicoesCasas = [
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

const posicoesCordasPorRegiao = {
    // Região 1 (Casas 0-3)
    regiao1: [
        0.66,  // E (1ª corda)
        0.60,  // B
        0.53,  // G
        0.48,  // D
        0.42,  // A
        0.36   // E (6ª corda)
    ],
    // Região 2 (Casas 4-7)
    regiao2: [
        0.68,  // E (1ª corda)
        0.62,  // B
        0.55,  // G
        0.485,  // D
        0.42,  // A
        0.36   // E (6ª corda)
    ],
    // Região 3 (Casas 8-12)
    regiao3: [
        0.72,  // E (1ª corda)
        0.65,  // B
        0.57,  // G
        0.50,  // D
        0.42,  // A
        0.35   // E (6ª corda)
    ],
    // Região 4 (Casas 13-17)
    regiao4: [
        0.72,  // E (1ª corda)
        0.65,  // B
        0.58,  // G
        0.50,  // D
        0.42,  // A
        0.35   // E (6ª corda)
    ],
    // Região 5 (Casas 18-22)
    regiao5: [
        0.74,  // E (1ª corda)
        0.66,  // B
        0.58,  // G
        0.50,  // D
        0.42,  // A
        0.35   // E (6ª corda)
    ]
};

function getPosicaoCorda(corda, fret) {
    if (fret <= 3) {
        return posicoesCordasPorRegiao.regiao1[corda - 1];
    } else if (fret <= 7) {
        return posicoesCordasPorRegiao.regiao2[corda - 1];
    } else if (fret <= 12) {
        return posicoesCordasPorRegiao.regiao3[corda - 1];
    } else if (fret <= 17) {
        return posicoesCordasPorRegiao.regiao4[corda - 1];
    } else {
        return posicoesCordasPorRegiao.regiao5[corda - 1];
    }
}

document.addEventListener('DOMContentLoaded', function () {
    bracoGuitarra.addEventListener('load', function () {
        inicializaCanvas();
    });
    if (bracoGuitarra.complete) {
        inicializaCanvas();
    }
});

function inicializaCanvas() {
    canvas.width = 490;
    canvas.height = 128;
    canvas.addEventListener('click', handleClick);
}

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Define a área útil do braço (excluindo o headstock)
    const neckStartX = 0;   
    const neckWidth = 450;  
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    // Se o clique for antes do início do braço, ignora
    if (canvasX < neckStartX) {
        return;
    }
    // Se o clique for depois do fim do braço, ignora
    if (canvasX > neckStartX + neckWidth) {
        return;
    }
    if (canvasX > 450) { 
        // console.log('Click on guitar hand, ignoring');
        return;
    }
    const xPercent = (canvasX - neckStartX) / neckWidth;
    const yPercent = canvasY / canvas.height;
    /* 
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
    */
    let fret = -1;
    let minDistancia = Infinity;
    let distancias = [];
    for (let i = 1; i < posicoesCasas.length; i++) {
        const distancia = Math.abs(xPercent - (1 - posicoesCasas[i]));
        distancias.push({ fret: i, posicao: posicoesCasas[i], distancia });
        // console.log(`Checking fret ${i}: posicao ${posicoesCasas[i]}, distancia ${distancia}`);
        if (distancia < minDistancia && distancia < 0.06) {
            minDistancia = distancia;
            fret = i;
        }
    }
    // console.log('All distancias:', distancias.sort((a, b) => a.distancia - b.distancia));
    if (fret === -1) {
        for (let i = 0; i < posicoesCasas.length; i++) {
            const distancia = Math.abs(xPercent - (1 - posicoesCasas[i]));
            if (distancia < minDistancia) {
                minDistancia = distancia;
                fret = i;
            }
        }
    }
    let corda = -1;
    let minDistanciaCorda = Infinity;
    for (let i = 1; i <= 6; i++) {  
        const cordaPos = getPosicaoCorda(i, fret);
        const distancia = Math.abs(yPercent - cordaPos);
        /* console.log(`Checking corda ${i}:`, {
            cordaPos,
            distancia,
            yPercent
        });
        */
        if (distancia < minDistanciaCorda) {
            minDistanciaCorda = distancia;
            corda = i;
        }
    }
    if (minDistanciaCorda > 0.1) { 
        corda = -1;
    }
    /*
    console.log('corda detection:', {
        corda,
        minDistanciaCorda,
        yPercent
    });
    */
    if (fret >= 0 && fret <= 22 && corda >= 1 && corda <= 6) {
        const posicaoKey = `${corda}-${fret}`;
        const nota = notasCorda[corda][fret];
        if (posicoesSelecionadas.has(posicaoKey)) {
            posicoesSelecionadas.delete(posicaoKey);
        } else {
            posicoesSelecionadas.set(posicaoKey, { nota, corda, fret });
        }
        limparCanvas();
        redesenharTodosPontos();
        identificaAcorde();
    }
    // console.log('xPercent:', xPercent, 'yPercent:', yPercent, 'Detected fret:', fret, 'Detected corda:', corda);
}

function desenharPonto(fret, corda) {
    if (pontosSelecionados.some(point => point.fret === fret && point.corda === corda)) {
        return; 
    }
    pontosSelecionados.push({ fret, corda });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const neckStartX = 0;
    const neckWidth = 450;
    for (const point of pontosSelecionados) {
        const xPos = neckStartX + (neckWidth * (1 - posicoesCasas[point.fret]));
        const yPos = canvas.height * getPosicaoCorda(point.corda, point.fret);
        const maxSize = 4; 
        const minSize = 2; 
        const size = maxSize - ((maxSize - minSize) * (point.fret / 22));
        ctx.beginPath();
        ctx.arc(xPos, yPos, size, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
        /*
         console.log('Drawing point:', {
            fret: point.fret,
            corda: point.corda,
            x: xPos,
            y: yPos,
            size,
            canvasWidth: canvas.width,
        }); 
        */
    }
}

function limparCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pontosSelecionados = [];
}

function redesenharTodosPontos() {
    posicoesSelecionadas.forEach((_, key) => {
        const [corda, fret] = key.split('-').map(Number);
        desenharPonto(fret, corda);
    });
}

function formatarNomeAcorde(root, type) {
    const notasEquivalentes = {
        'A#': 'Bb',
        'C#': 'Db',
        'D#': 'Eb',
        'F#': 'Gb',
        'G#': 'Ab'
    };
    // Se for um power chord
    if (type === '5 ou m') {
        if (notasEquivalentes[root]) {
            return `${root} ${t('or')} ${notasEquivalentes[root]}5 ${t('or')} ${root}m`;
        }
        return `${root}5 ${t('or')} ${root}m`;
    }
    // Para acordes normais
    if (notasEquivalentes[root]) {
        return type ? `${root} ${t('or')} ${notasEquivalentes[root]}${type}` :
            `${root} ${t('or')} ${notasEquivalentes[root]}`;
    }
    return `${root}${type}`; 
}

function identificaAcorde() {
    console.log(posicoesSelecionadas);
    console.log('[DEBUG] Iniciando identificação do acorde...');
    const posicoes = parsePosicoes(posicoesSelecionadas);
    console.log('[DEBUG] Posições parseadas:', posicoes);
    const bassNota = findBassNota(posicoes);
    console.log('[DEBUG] Nota mais grave (baixo):', bassNota);
    const notas = getCordasUnicas(posicoes);
    console.log('[DEBUG] Notas únicas:', notas);
    if (!bassNota) {
        console.log('[ERROR] Nota mais grave não encontrada');
        document.getElementById('chord-name').textContent = t('chordNotRecognized');
        return;
    }
    const notaRaiz = bassNota || notas[0]; // Use a nota mais grave ou a primeira nota
    console.log('[DEBUG] Nota fundamental:', notaRaiz);
    const intervalos = calculaintervalosPorRaiz(notaRaiz, notas);
    console.log('[DEBUG] intervalos calculados:', intervalos);
    const tipoAcorde = determinaTipoAcorde(intervalos);
    console.log('[DEBUG] Tipo do acorde:', tipoAcorde);
    const isMenor = identificaAcordeMenor(posicoes);
    console.log('[DEBUG] É um acorde menor?', isMenor);
    if (tipoAcorde === 'not_recognized') {
        document.getElementById('chord-name').textContent = t('chordNotRecognized');
        return;
    }
    const nomeAcorde = formatarNomeAcorde(notaRaiz, tipoAcorde);
    document.getElementById('chord-name').textContent = nomeAcorde;
    console.log('[INFO] Nome do acorde identificado:', nomeAcorde);
}

function parsePosicoes(posicoesSelecionadas) {
    console.log('[DEBUG] Parsing posições selecionadas...');
    return Array.from(posicoesSelecionadas.entries())
        .map(([key, value]) => {
            const [corda, fret] = key.split('-').map(Number);
            if (isNaN(corda) || isNaN(fret)) {
                // console.log(`[ERROR] Posição inválida: ${key}`);
                return null; 
            }
            return { corda, fret, nota: value.nota };
        })
        .filter(posicao => posicao !== null) 
        .sort((a, b) => b.corda - a.corda); // Ordenar da mais grave para a mais aguda
}

function findBassNota(posicoes) {
    console.log('[DEBUG] Encontrando nota mais grave...');
    const sortedPosicoes = posicoes.sort((a, b) => b.corda - a.corda);
    const notaNaCorda = {};
    posicoes.forEach(pos => {
        notaNaCorda[pos.corda] = pos.nota;
    });
    // Padrão do Dm 
    if (notaNaCorda[2] === 'D' && notaNaCorda[3] === 'A' && notaNaCorda[1] === 'F') {
        return 'D';  // Raiz do acorde Dm
    }
    if (notaNaCorda[2] === 'D' && notaNaCorda[3] === 'A' && notaNaCorda[1] === 'F#') {
        return 'D';  // Raiz do acorde D
    }
    // Padrão do Am 
    if (notaNaCorda[3] === 'A' && notaNaCorda[4] === 'E' && notaNaCorda[2] === 'C') {
        return 'A';  // Raiz do acorde Am
    }
    if (notaNaCorda[5] === 'C' && notaNaCorda[4] === 'G' &&
        (notaNaCorda[3] === 'C' || notaNaCorda[2] === 'D#')) {
        return 'C';
    }
    if (notaNaCorda[6] === 'E' ||
        (notaNaCorda[5] === 'B' && notaNaCorda[4] === 'E')) {
        return 'E';
    }
    if ((notaNaCorda[6] === 'B' && notaNaCorda[5] === 'E') ||
        (notaNaCorda[5] === 'E' && notaNaCorda[4] === 'B')) {
        return 'E';  // Raiz do acorde Em
    }
    if (notaNaCorda[1] === 'F#' && notaNaCorda[2] === 'C' && notaNaCorda[3] === 'A') {
        return 'D';  // Nota fundamental do D7
    }
    if (notaNaCorda[2] === 'C#' && notaNaCorda[3] === 'G#' && notaNaCorda[4] === 'E') {
        return 'A';  // Nota fundamental do A7M
    }
    if (notaNaCorda[4] === 'E' && notaNaCorda[3] === 'A' && notaNaCorda[2] === 'C#') {
        return 'A';  // Nota fundamental do A maior
    }
    // Caso não seja um dos acordes definidos, procura pela nota mais grave
    const raizPotencial = sortedPosicoes.find(pos => pos.corda === 6) ||  // Prioriza a corda 6
        sortedPosicoes.find(pos => pos.corda === 5) ||  
        sortedPosicoes.find(pos => pos.corda === 4) ||  
        sortedPosicoes.find(pos => pos.corda === 3) ||  
        sortedPosicoes.find(pos => pos.corda === 2);   
    // Se não encontrar, usa a nota da corda mais grave encontrada
    if (raizPotencial) {
        return raizPotencial.nota;
    }
    // Se ainda não encontrar, retorna a primeira nota encontrada
    return sortedPosicoes[0].nota;
}

function getCordasUnicas(posicoes) {
    console.log('[DEBUG] Obtendo notas únicas...');
    return [...new Set(posicoes.map(p => p.nota))];
}

function identificaAcordeMenor(posicoes) {
    // Verificar se o acorde é menor baseado em notas
    const notas = posicoes.map(pos => pos.nota);
    if (notas.includes('D') && notas.includes('F#') && notas.includes('A')) {
        return false; 
    }
    if (notas.includes('E') && notas.includes('G') && notas.includes('B')) {
        return true;
    }
    if (notas.includes('F#') && notas.includes('A') && notas.includes('C')) {
        return false;
    }
    // Um acorde menor geralmente tem a terça menor
    const intervalosTerca = ['m', 'm3']; // Padrões de terça menor
    const notaRaiz = encontraNotaRaiz(notas);
    const intervalos = calculaintervalosPorRaiz(notaRaiz, notas);
    const isMenor = intervalos.includes(3); 
    return isMenor;
}

function calculaintervalosPorRaiz(notaRaiz, notas) {
    const indexRaiz = notasCorda[1].indexOf(notaRaiz); 
    console.log('Root nota:', notaRaiz, 'Root Index:', indexRaiz); 
    return notas.map(nota => {
        let indexNota = -1;
        for (let corda = 1; corda <= 6; corda++) {
            indexNota = notasCorda[corda].indexOf(nota);
            if (indexNota !== -1) {
                const intervalo = (indexNota - indexRaiz + 12) % 12; 
                console.log(`nota: ${nota}, nota Index: ${indexNota}, intervalo: ${intervalo}`); 
                return intervalo;
            }
        }
        console.log(`nota: ${nota} not found`);
        return null; 
    }).filter(intervalo => intervalo !== null); 
}

function determinaTipoAcorde(intervalos) {
    console.log('[DEBUG] Determinando tipo do acorde');
    const temRaiz = intervalos.includes(0);
    const temNona = intervalos.includes(2);
    const temTercaMenor = intervalos.includes(3);
    const temTercaMaior = intervalos.includes(4);
    const temQuintaPerfeita = intervalos.includes(7);
    const temQuintaDim = intervalos.includes(6);
    const temQuintaAug = intervalos.includes(8);
    const temSetimaMenor = intervalos.includes(10);
    const temSetimaMaior = intervalos.includes(11);
    const temSexta = intervalos.includes(9);
    const sortedintervalos = [...intervalos].sort((a, b) => a - b);
    // Verifica power chord 
    if (intervalos.length === 2 &&
        sortedintervalos.toString === [0, 7].toString()) {
        return '5 ou m';  
    }
    if (temRaiz) {
        if (temTercaMaior && temSetimaMenor && temNona) {
            return '9';
        }
        if (temTercaMaior && temSetimaMenor) {
            return '7';
        }
        if (temTercaMaior && temQuintaPerfeita) {
            if (temSexta) return '6';
            if (temSetimaMaior) return '7';
            if (temSetimaMenor) return 'm7';
            return " ";
        }
        if (temTercaMenor && temQuintaPerfeita) {
            if (temSetimaMenor) return 'm7';
            return 'm';
        }
        if (temTercaMenor && temQuintaDim) return "m";
        if (temTercaMaior && temQuintaAug) return " ";
        if (temQuintaPerfeita && !temTercaMaior && !temTercaMenor) return '5';
        if (temTercaMaior && !temQuintaPerfeita) return " ";
        if (temTercaMenor && !temQuintaPerfeita) return 'm';
        if (intervalos.includes(5) && temSexta) {
            return ''; 
        }
        if (intervalos.includes(5)) {
            return '5(9)';
        }
    }
    if (temTercaMaior && temQuintaPerfeita && temSetimaMenor) {
        return '7';
    }
    if (temTercaMaior && temQuintaPerfeita && temSetimaMaior) {
        return '7M';
    }
    console.log('[DEBUG] Acorde não identificado. intervalos:', intervalos);
    return 'not_recognized';
}

function encontraNotaRaiz(notas) {
    console.log('[DEBUG] Encontrando nota mais grave');
    return notas.reduce((lowest, nota) => {
        let lowestIndex = null;
        for (let corda = 1; corda <= 6; corda++) {
            const indexNota = notasCorda[corda].indexOf(nota);
            if (indexNota !== -1) {
                if (lowestIndex === null || indexNota < lowestIndex) {
                    lowestIndex = indexNota; 
                    lowest = nota; 
                }
            }
        }
        return lowest;
    }, null);
}

function formatNotaRaiz(bassNota) {
    console.log('[DEBUG] Formatando nota fundamental...');
    const acidental = bassNota.includes('#') ? '#' : bassNota.includes('b') ? 'b' : '';
    return bassNota[0] + acidental;
}