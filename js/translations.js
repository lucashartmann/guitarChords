const translations = {
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

let currentLanguage = 'pt'; 

function setLanguage(lang) {
    currentLanguage = lang;
    updateTranslations();
}

function t(key) {
    return translations[currentLanguage][key] || key;
}

function updateTranslations() {
    // Atualiza todos os elementos com data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });

    // Atualiza o título da página
    document.title = t('title');
} 