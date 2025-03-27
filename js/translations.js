const traducoes = {
    pt: {
        chordNotRecognized: 'Acorde não reconhecido',
        or: 'ou',
        title: 'Identificador de Acordes'
    },
    en: {
        chordNotRecognized: 'Chord not recognized',
        or: 'or',
        title: 'Guitar Chord Finder'
    }
};

let idiomaAtual = 'pt'; 

function setIdioma(lang) {
    idiomaAtual = lang;
    atualizaTraducoes();
}

function t(key) {
    return traducoes[idiomaAtual][key] || key;
}

function atualizaTraducoes() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    document.title = t('title');
} 