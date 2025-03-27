function setTema(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function mudarTema() {
    const temaAtual = localStorage.getItem('theme') || 'light';
    const novoTema = temaAtual === 'light' ? 'dark' : 'light';
    setTema(novoTema);
}

const temaSalvo = localStorage.getItem('theme') || 'light';
setTema(temaSalvo); 