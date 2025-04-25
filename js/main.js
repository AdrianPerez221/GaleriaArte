// Variables globales
let isSliderActive = false;
const sliderSection = document.getElementById('slider-section');
const sliderObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            sliderSection.classList.add('visible');
            activateSlider();
        } else {
            deactivateSlider();
        }
    });
}, { threshold: 0.5 });



// Datos de los artistas
const artistas = [
    {
        nombre: "Vincent van Gogh",
        años: "(1853 - 1890)",
        texto1: "Pintor neerlandés, figura clave del <span class='resaltado'>postimpresionismo</span>. Conocido por su uso dramático del color y pinceladas expresivas.",
        texto2: "Obras destacadas: <span class='resaltado'>La noche estrellada</span>, <span class='resaltado'>Los girasoles</span> y <span class='resaltado'>Autorretratos</span>."
    },
    {
        nombre: "Frida Kahlo",
        años: "(1907 - 1954)",
        texto1: "Artista mexicana reconocida por sus <span class='resaltado'>autorretratos</span> y su estilo único que combina elementos del realismo mágico.",
        texto2: "Obras destacadas: <span class='resaltado'>Las dos Fridas</span>, <span class='resaltado'>La columna rota</span> y <span class='resaltado'>Viva la vida</span>."
    },
    {
        nombre: "Pablo Picasso",
        años: "(1881 - 1973)",
        texto1: "Creador del <span class='resaltado'>cubismo</span> junto con Georges Braque. Uno de los artistas más influyentes del siglo XX.",
        texto2: "Obras destacadas: <span class='resaltado'>Guernica</span>, <span class='resaltado'>Las señoritas de Avignon</span> y <span class='resaltado'>El viejo guitarrista ciego</span>."
    }
];

// Elementos del DOM
const carousel = document.querySelector('.carousel-custom');
const slides = document.querySelectorAll('.slide');
let currentActive = 0;


// Inicialización
gsap.set(carousel, { scrollLeft: 0 }); 
updateActiveSlide();
updateInfo();

window.addEventListener('resize', () => {
    gsap.set(carousel, { scrollLeft: 0 });
    currentActive = 0;
    updateActiveSlide();
    updateInfo();
});
document.addEventListener('DOMContentLoaded', () => {
    sliderObserver.observe(sliderSection);
    initializeSlider();
});

function initializeSlider() {
    gsap.set(carousel, { 
        scrollLeft: 0,
        overwrite: 'auto'
    });
    updateActiveSlide();
    updateInfo();
}

function activateSlider() {
    isSliderActive = true;
    gsap.to(carousel, {
        scrollLeft: 0,
        duration: 0.1,
        overwrite: true
    });
    carousel.style.overflowX = 'auto';
}

function deactivateSlider() {
    isSliderActive = false;
    carousel.style.overflowX = 'hidden';
}

// Scroll con rueda del ratón
window.addEventListener('wheel', (e) => {
    if(!isSliderActive) return;
    
    e.preventDefault();
    
    const delta = e.deltaY * 1.5;
    const currentScroll = carousel.scrollLeft;
    const target = currentScroll + delta;
    
    gsap.to(carousel, {
        scrollLeft: target,
        duration: 1.2,
        ease: "power3.out",
        momentum: delta * 0.6,
        onUpdate: () => {
            const progress = gsap.getProperty(carousel, "scrollLeft") / slides[0].offsetWidth;
            const newIndex = Math.round(progress);
            
            if(newIndex !== currentActive) {
                currentActive = Math.min(Math.max(newIndex, 0), slides.length - 1);
                updateActiveSlide();
                updateInfo();
            }
        }
    });
}, { passive: false });

// Touch events para móviles
let touchStartX;
carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
}, { passive: false });

carousel.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    gsap.to(carousel, {
        scrollLeft: carousel.scrollLeft - (touchX - touchStartX) * 3.5,
        duration: 0.3,
        onUpdate: () => {
            const newIndex = Math.round(carousel.scrollLeft / slides[0].offsetWidth);
            if (newIndex !== currentActive) {
                currentActive = newIndex;
                updateActiveSlide();
                updateInfo();
            }
        }
    });
    touchStartX = touchX;
}, { passive: false });

// Funciones auxiliares
function updateActiveSlide() {
    document.querySelectorAll('.foto-artista img').forEach((img, index) => {
        if (index === currentActive) {
            img.classList.add('mostrando');
            gsap.to(img, { opacity: 1, duration: 0.5 });
        } else {
            img.classList.remove('mostrando');
            gsap.to(img, { opacity: 0, duration: 0.5 });
        }
    });
}

function updateInfo() {
    const infoElement = document.getElementById(`info-${currentActive}`);
    if (infoElement) {
        infoElement.innerHTML = `
            <h1 class="nombre-artista">${artistas[currentActive].nombre}
                <span class="fechas-artista">${artistas[currentActive].años}</span>
            </h1>
            <p class="texto-info">${artistas[currentActive].texto1}</p>
            <p class="texto-info">${artistas[currentActive].texto2}</p>
        `;
    }
}