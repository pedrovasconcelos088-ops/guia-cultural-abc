// 1. Token público do Mapbox
const MAPBOX_TOKEN = 'pk.eyJ1IjoicGVyZWlyYTA4OCIsImEiOiJjbXZ0Z3NncmIwMmFtMzVuOWJmNmp6OXV4In0.FU2xpr6EY_JdB28p6GSQpQ';

// Tile URLs corrigidas com /512/ no caminho
const tileClaro = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;
const tileEscuro = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/512/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;

const mapboxOptions = {
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 19
};

// 2. Coordenadas GPS Exatas (Latitude, Longitude) do Grande ABC
const rotasData = {
    santo_andre: {
        titulo: "🎭 Rota Cultural Santo André",
        descricao: "Circuito reunindo a Sabina, o Teatro Municipal no Paço e o Sesc Santo André.",
        pontos: [
            { nome: "Sabina Escola Parque do Conhecimento", lat: -23.6743, lng: -46.5422, desc: "R. Juquiá, s/n - Vila Eldizia" },
            { nome: "Teatro Municipal Flávio Florence", lat: -23.6581, lng: -46.5322, desc: "Praça IV Centenário, 01 - Centro" },
            { nome: "Sesc Santo André", lat: -23.6508, lng: -46.5428, desc: "R. Tamarutaca, 302 - Vila Guiomar" }
        ],
        cor: "#0d6efd"
    },
    sbc: {
        titulo: "🎬 Rota de Artes e Memória de São Bernardo",
        descricao: "Passagem pela Pinacoteca, Vera Cruz, Teatro Lauro Gomes e Chácara Silvestre.",
        pontos: [
            { nome: "Pinacoteca de SBC", lat: -23.6896, lng: -46.5492, desc: "R. Kara, 135 - Jardim do Mar" },
            { nome: "Cia. Cinematográfica Vera Cruz", lat: -23.6927, lng: -46.5562, desc: "Av. Lucas Nogueira Garcez, 856 - Centro" },
            { nome: "Teatro Lauro Gomes", lat: -23.6657, lng: -46.5681, desc: "R. Helena Jacquey, 171 - Rudge Ramos" },
            { nome: "Parque Chácara Silvestre", lat: -23.7083, lng: -46.5619, desc: "Av. Wallace Simonsen, 1800 - Nova Petrópolis" }
        ],
        cor: "#dc3545"
    },
    scs_diadema: {
        titulo: "🎨 Rota São Caetano & Diadema",
        descricao: "Preservação histórica da imigração e formação artística urbana.",
        pontos: [
            { nome: "Fundação Pró-Memória (SCS)", lat: -23.6186, lng: -46.5564, desc: "Av. Dr. Augusto de Toledo, 255 - Santa Paula" },
            { nome: "Teatro Paulo Machado de Carvalho (SCS)", lat: -23.6331, lng: -46.5593, desc: "Al. Conde de Porto Alegre, 840 - Santa Maria" },
            { nome: "Fábrica de Cultura de Diadema", lat: -23.6872, lng: -46.6231, desc: "R. Ver. Gustavo Sonnewend Neto, 135 - Centro" }
        ],
        cor: "#ffc107"
    }
};

// 3. Inicializa o mapa focado no Grande ABC
const map = L.map('map').setView([-23.6650, -46.5500], 12);

let tileLayerAtual = L.tileLayer(tileClaro, mapboxOptions).addTo(map);
let camadaAtual = L.layerGroup().addTo(map);

// 4. Função para Renderizar a Rota
function carregarRota(chaveRota, elementoBotao) {
    const rota = rotasData[chaveRota];
    if (!rota) return;

    if (elementoBotao) {
        const container = elementoBotao.parentElement;
        container.querySelectorAll('.btn').forEach(btn => {
            btn.classList.remove('btn-warning', 'active');
            btn.classList.add('btn-outline-warning');
        });
        elementoBotao.classList.remove('btn-outline-warning');
        elementoBotao.classList.add('btn-warning', 'active');
    }

    camadaAtual.clearLayers();

    document.getElementById('route-title').innerText = rota.titulo;
    document.getElementById('route-desc').innerText = rota.descricao;

    const stepsList = document.getElementById('route-steps');
    stepsList.innerHTML = '';

    const coordsLinha = [];

    rota.pontos.forEach((ponto, index) => {
        coordsLinha.push([ponto.lat, ponto.lng]);

        const marker = L.marker([ponto.lat, ponto.lng]).addTo(camadaAtual);
        marker.bindPopup(`<b>${index + 1}. ${ponto.nome}</b><br>${ponto.desc}`);

        const li = document.createElement('li');
        li.className = 'list-group-item bg-transparent text-body';
        li.innerHTML = `<strong>${ponto.nome}:</strong> ${ponto.desc}`;
        stepsList.appendChild(li);
    });

    const polyline = L.polyline(coordsLinha, {
        color: rota.cor,
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8'
    }).addTo(camadaAtual);

    // Atualiza dimensões do container antes de calcular o enquadramento
    map.invalidateSize();
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
}

// 5. Alternância de Tema
const btnTheme = document.getElementById('btnThemeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

function atualizarEstiloMapa(isDark) {
    map.removeLayer(tileLayerAtual);
    tileLayerAtual = L.tileLayer(isDark ? tileEscuro : tileClaro, mapboxOptions).addTo(map);
}

if (btnTheme) {
    btnTheme.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        const isDark = newTheme === 'dark';
        if (themeIcon) themeIcon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
        if (themeText) themeText.innerText = isDark ? 'Modo Claro' : 'Modo Escuro';
        
        atualizarEstiloMapa(isDark);
    });
}

// 6. Restaura preferências ao carregar
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);

    if (savedTheme === 'dark') {
        if (themeIcon) themeIcon.className = 'bi bi-sun-fill';
        if (themeText) themeText.innerText = 'Modo Claro';
        atualizarEstiloMapa(true);
    }

    const primeiroBotao = document.querySelector('.btn-group .btn');
    carregarRota('santo_andre', primeiroBotao);
});