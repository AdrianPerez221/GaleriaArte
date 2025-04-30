// Variables globales
const sliderSection = document.getElementById('slider-section');
const carousel = document.querySelector('.carousel-custom');
const slides = document.querySelectorAll('.slide');
let currentActive = 0;
let lastScrollTime = 0;
const scrollDelay = 300; // Tiempo de espera para alternar entre modos de scroll (ms)
let horizontalScrollActive = true; // Indica si el scroll horizontal está activo cuando el mouse está sobre el slider

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

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeSlider();
    setupEventListeners();
    setupIntersectionObserver();
});

function initializeSlider() {
    // Configurar posición inicial
    gsap.set(carousel, { 
        scrollLeft: 0,
        overwrite: 'auto'
    });
    updateActiveSlide();
    updateInfo();
}

function setupIntersectionObserver() {
    // Observador para mostrar el slider cuando entra en la vista
    const sliderObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                sliderSection.classList.add('visible');
            } else {
                sliderSection.classList.remove('visible');
            }
        });
    }, { threshold: 0.3 });
    
    sliderObserver.observe(sliderSection);
}

// Configurar event listeners
function setupEventListeners() {
    // Evento para redimensionar ventana
    window.addEventListener('resize', () => {
        gsap.set(carousel, { scrollLeft: 0 });
        currentActive = 0;
        updateActiveSlide();
        updateInfo();
    });
    
    // Añadir botón o tecla para alternar entre scroll horizontal y vertical
    document.addEventListener('keydown', function(e) {
        // Al presionar la tecla "H" se alterna el modo de scroll
        if (e.key === 'h' || e.key === 'H') {
            horizontalScrollActive = !horizontalScrollActive;
            console.log("Modo de scroll: " + (horizontalScrollActive ? "Horizontal" : "Vertical"));
        }
    });
    
    // Manejo del evento wheel en el slider con la capacidad de cambiar entre scroll horizontal y vertical
    carousel.addEventListener('wheel', function(e) {
        // Solo manejar eventos de wheel si el mouse está sobre el carousel
        if (e.target.closest('.carousel-custom')) {
            const now = Date.now();
            
            // Si el último scroll fue hace poco, mantener el mismo modo de scroll
            if (now - lastScrollTime < scrollDelay) {
                if (horizontalScrollActive) {
                    handleHorizontalScroll(e);
                }
                // Si horizontalScrollActive es false, no hacemos nada y dejamos que ocurra el scroll vertical normal
            } else {
                // Detectar si es un scroll fuerte/continuo para cambiar de modo
                if (Math.abs(e.deltaY) > 50) {
                    // Alternar el modo de scroll
                    horizontalScrollActive = !horizontalScrollActive;
                    if (horizontalScrollActive) {
                        handleHorizontalScroll(e);
                    }
                } else if (horizontalScrollActive) {
                    // Para scrolls normales, usar el modo actual
                    handleHorizontalScroll(e);
                }
            }
            
            lastScrollTime = now;
        }
    }, { passive: false });
    
    // Añadir botones para facilitar la navegación
    const navButtons = document.createElement('div');
    navButtons.className = 'slider-nav-buttons';
    navButtons.innerHTML = `
        <button class="prev-slide">◀ Anterior</button>
        <button class="toggle-scroll">${horizontalScrollActive ? "Activar Scroll Vertical" : "Activar Scroll Horizontal"}</button>
        <button class="next-slide">Siguiente ▶</button>
    `;
    
    // Aplicar estilos a los botones
    const style = document.createElement('style');
    style.textContent = `
        .slider-nav-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            padding: 10px;
            background-color: rgba(255,255,255,0.8);
            border-radius: 5px;
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
        }
        .slider-nav-buttons button {
            padding: 5px 15px;
            background-color: #855951;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .slider-nav-buttons button:hover {
            background-color: #6b4742;
        }
    `;
    document.head.appendChild(style);
    sliderSection.appendChild(navButtons);
    
    // Manejadores de eventos para los botones
    document.querySelector('.prev-slide').addEventListener('click', () => {
        if (currentActive > 0) {
            currentActive--;
            scrollToSlide(currentActive);
        }
    });
    
    document.querySelector('.next-slide').addEventListener('click', () => {
        if (currentActive < slides.length - 1) {
            currentActive++;
            scrollToSlide(currentActive);
        }
    });
    
    document.querySelector('.toggle-scroll').addEventListener('click', () => {
        horizontalScrollActive = !horizontalScrollActive;
        document.querySelector('.toggle-scroll').textContent = 
            horizontalScrollActive ? "Activar Scroll Vertical" : "Activar Scroll Horizontal";
    });
    
    // Touch events para móviles
    let touchStartX;
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: false });

    carousel.addEventListener('touchmove', (e) => {
        if (e.target.closest('.carousel-custom')) {
            e.preventDefault();
            const touchX = e.touches[0].clientX;
            gsap.to(carousel, {
                scrollLeft: carousel.scrollLeft - (touchX - touchStartX) * 3.5,
                duration: 0.3,
                onUpdate: updateActiveSlideFromScroll
            });
            touchStartX = touchX;
        }
    }, { passive: false });
}

// Función para manejar el scroll horizontal
function handleHorizontalScroll(e) {
    e.preventDefault();
    
    const delta = e.deltaY || e.detail || e.wheelDelta;
    const currentScroll = carousel.scrollLeft;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    
    // Comprobar si estamos en los extremos
    if ((currentScroll <= 0 && delta < 0) || (currentScroll >= maxScroll && delta > 0)) {
        // Si estamos en un extremo, desactivar temporalmente el scroll horizontal
        horizontalScrollActive = false;
        setTimeout(() => {
            horizontalScrollActive = true;
        }, scrollDelay);
        return;
    }
    
    // Aplicar scroll horizontal
    gsap.to(carousel, {
        scrollLeft: currentScroll + (delta * 1.5),
        duration: 0.8,
        ease: "power2.out",
        onUpdate: updateActiveSlideFromScroll
    });
}

// Función para desplazarse a un slide específico
function scrollToSlide(index) {
    gsap.to(carousel, {
        scrollLeft: slides[index].offsetWidth * index,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
            updateActiveSlide();
            updateInfo();
        }
    });
}

// Función para actualizar el slide activo basado en scroll
function updateActiveSlideFromScroll() {
    const progress = gsap.getProperty(carousel, "scrollLeft") / slides[0].offsetWidth;
    const newIndex = Math.round(progress);
    
    if (newIndex !== currentActive) {
        currentActive = Math.min(Math.max(newIndex, 0), slides.length - 1);
        updateActiveSlide();
        updateInfo();
    }
}

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