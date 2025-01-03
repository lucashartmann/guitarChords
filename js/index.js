// Seleção dos elementos principais
const guitarImage = document.getElementById('guitar-neck');
const canvas = document.getElementById('canvas-overlay');
const ctx = canvas.getContext('2d');

// Ajusta o tamanho do canvas para cobrir a imagem
canvas.width = guitarImage.width;
canvas.height = guitarImage.height;

// Configuração inicial
const strings = 6; // Número de cordas
const frets = 22; // Número de casas
const tuning = ["E", "A", "D", "G", "B", "E"]; // Afinação padrão
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const chords = {
    major: [0, 4, 7],        // Tônica, Terça Maior, Quinta Justa
    minor: [0, 3, 7],        // Tônica, Terça Menor, Quinta Justa
    seventh: [0, 4, 7, 10],  // Tônica, Terça Maior, Quinta Justa, Sétima Menor
    ninth: [0, 4, 7, 10, 14], // Tônica, Terça Maior, Quinta Justa, Sétima, Nona
    majorSeventh: [0, 4, 7, 11], // Tônica, Terça Maior, Quinta Justa, Sétima Maior
};

// Detectar o clique na imagem
guitarImage.addEventListener('click', (event) => {
    const rect = guitarImage.getBoundingClientRect();
    const x = event.clientX - rect.left; // Coordenada X
    const y = event.clientY - rect.top;  // Coordenada Y

    const fretWidth = rect.width / frets; // Largura de uma casa
    const stringHeight = rect.height / strings; // Altura de uma corda

    const fret = Math.floor(x / fretWidth) + 1; // Casa clicada
    const string = Math.floor(y / stringHeight) + 1; // Corda clicada

    console.log(`Casa: ${fret}, Corda: ${string}`);

    // Calcula a nota correspondente
    const noteIndex = (notes.indexOf(tuning[string - 1]) + fret) % 12;
    const selectedNote = notes[noteIndex];

    console.log(`Nota selecionada: ${selectedNote}`);

    // Exibe visualmente a área clicada
    highlightArea(fret, string, fretWidth, stringHeight);

    // Atualiza o acorde com base nas notas selecionadas
    updateChord(selectedNote);
});

// Destaca a posição clicada
function highlightArea(fret, string, fretWidth, stringHeight) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(fretWidth * (fret - 1), stringHeight * (string - 1), fretWidth, stringHeight);
}

// Atualiza o acorde detectado
const selectedNotes = [];

function updateChord(note) {
    selectedNotes.push(note);
    const uniqueNotes = [...new Set(selectedNotes)].map(n => notes.indexOf(n)).sort((a, b) => a - b);
    const intervals = uniqueNotes.map((note, index, arr) => (arr[index + 1] || arr[0] + 12) - note);

    const chordName = detectChord(uniqueNotes, intervals);
    document.getElementById("chord-name").textContent = chordName || "Unknown chord";
}

// Detecta o acorde com base nas notas selecionadas
function detectChord(uniqueNotes, intervals) {
    for (const [type, chordIntervals] of Object.entries(chords)) {
        if (isEquivalent(intervals, chordIntervals)) {
            const rootNote = notes[uniqueNotes[0]];
            return `${rootNote}${type === "major" ? "" : type}`;
        }
    }
    return "Unknown chord";
}

// Verifica se os intervalos correspondem ao acorde
function isEquivalent(intervals, chordIntervals) {
    return intervals.length === chordIntervals.length &&
        intervals.every((int, i) => int === chordIntervals[i]);
}