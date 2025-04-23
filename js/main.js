// inicio canvas

const canvas = document.getElementById('mainCanvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let currentTool = 'pencil';
        let opacity = 1;

        // Configuración inicial
        function initCanvas() {
            const container = document.querySelector('.canvas-container');
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }

        // Herramientas de dibujo
        const tools = {
            pencil: {
                size: 5,
                draw(x, y) {
                    ctx.globalAlpha = opacity;
                    ctx.lineTo(x, y);
                    ctx.stroke();
                },
                start(x, y) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineWidth = this.size;
                }
            },

            watercolor: {
                size: 8,
                draw(x, y) {
                    ctx.globalAlpha = opacity * 0.3;
                    for(let i = 0; i < 5; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const radius = this.size * Math.random();
                        const px = x + Math.cos(angle) * radius;
                        const py = y + Math.sin(angle) * radius;
                        
                        ctx.beginPath();
                        ctx.arc(px, py, this.size/2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                },
                start() {
                    ctx.fillStyle = ctx.strokeStyle;
                }
            },

            graffiti: {
                size: 6,
                draw(x, y) {
                    ctx.globalAlpha = opacity * 0.7;
                    for(let i = 0; i < 15; i++) {
                        const spread = this.size * 2;
                        const px = x + (Math.random() - 0.5) * spread;
                        const py = y + (Math.random() - 0.5) * spread;
                        const radius = this.size * 0.3 + Math.random() * this.size * 0.2;
                        
                        ctx.beginPath();
                        ctx.arc(px, py, radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                },
                start() {
                    ctx.fillStyle = ctx.strokeStyle;
                }
            },

            bigbrush: {
                size: 50,
                draw(x, y) {
                    ctx.globalAlpha = opacity;
                    ctx.lineTo(x, y);
                    ctx.stroke();
                },
                start(x, y) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineWidth = this.size;
                }
            }
        };

        // Generar paleta de colores
        function createColorPalette() {
            const palette = document.getElementById('colorPalette');
            const colors = [];
            
            // Colores principales
            for(let h = 0; h < 360; h += 15) {
                colors.push(`hsl(${h}, 100%, 50%)`);
                colors.push(`hsl(${h}, 70%, 70%)`);
                colors.push(`hsl(${h}, 100%, 30%)`);
            }
            
            // Escala de grises
            for(let i = 0; i <= 100; i += 5) {
                colors.push(`hsl(0, 0%, ${i}%)`);
            }

            colors.forEach(color => {
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = color;
                swatch.addEventListener('click', function() {
                    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                    this.classList.add('active');
                    ctx.strokeStyle = color;
                    ctx.fillStyle = color;
                    document.getElementById('selectedColor').style.backgroundColor = color;
                });
                palette.appendChild(swatch);
            });

            // Color inicial
            const initialColor = colors[72];
            palette.children[72].classList.add('active');
            document.getElementById('selectedColor').style.backgroundColor = initialColor;
            ctx.strokeStyle = initialColor;
            ctx.fillStyle = initialColor;
        }

        // Eventos de dibujo
        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const {x, y} = getCanvasCoordinates(e);
            tools[currentTool].start(x, y);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const {x, y} = getCanvasCoordinates(e);
            tools[currentTool].draw(x, y);
        });

        canvas.addEventListener('mouseup', () => isDrawing = false);
        canvas.addEventListener('mouseout', () => isDrawing = false);

        // Control de herramientas
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTool = btn.dataset.tool;
            });
        });

        // Control de opacidad
        document.getElementById('opacity').addEventListener('input', (e) => {
            opacity = e.target.value;
        });

        // Limpiar lienzo
        function clearCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Obtener coordenadas
        function getCanvasCoordinates(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

        // Inicialización
        window.addEventListener('load', () => {
            initCanvas();
            createColorPalette();
        });
        window.addEventListener('resize', initCanvas);
// final de canvas

// funcion de las cosas 3d inicio

const modal = document.getElementById('modal');
const viewerContainer = document.getElementById('viewer');
const closeButton = document.querySelector('.close-button');
const openButtons = document.querySelectorAll('.btn-3d');
const loaderContainer = document.querySelector('.loader-container');
const errorMessage = document.querySelector('.error-message');

// Variables de Three.js
let renderer, scene, camera, controls, animationId;
let currentLoader = null;
let loadTimeout;

// Función para inicializar el visor 3D
function init3DViewer(glbUrl) {
  // Mostrar loader y resetear estados
  loaderContainer.style.display = 'flex';
  errorMessage.style.display = 'none';
  viewerContainer.style.opacity = '0';
  document.querySelector('.loader-text').textContent = 'Cargando modelo 3D...';
  
  // Cancelar carga anterior si existe
  if (currentLoader) {
    currentLoader.cancel();
  }
  
  // Limpiar escena existente
  if (renderer) {
    renderer.dispose();
    viewerContainer.innerHTML = '';
  }

  // Configuración inicial de Three.js
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
  viewerContainer.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    viewerContainer.clientWidth / viewerContainer.clientHeight,
    0.1,
    1000
  );
  camera.position.set(3, 1, 7);

  // Configuración de luces
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  // Controles de la cámara
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Cargar modelo 3D
  const loader = new THREE.GLTFLoader();
  currentLoader = loader.load(
    glbUrl,
    (gltf) => {
      // Modelo cargado correctamente
      clearTimeout(loadTimeout);
      loaderContainer.style.display = 'none';
      viewerContainer.style.opacity = '1';
      
      scene.add(gltf.scene);
      
      // Ajustar cámara al modelo
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraDistance = (maxDim / (2 * Math.tan(fov / 2))) * 1.5;
      
      camera.position.copy(center);
      camera.position.z += cameraDistance;
      camera.lookAt(center);
      controls.target.copy(center);
    },
    (xhr) => {
      // Actualizar progreso de carga
      const percent = (xhr.loaded / xhr.total * 100).toFixed(1);
      document.querySelector('.loader-text').textContent = 
        `Cargando... ${percent}%`;
    },
    (error) => {
      // Manejo de errores
      console.error('Error al cargar el modelo:', error);
      clearTimeout(loadTimeout);
      loaderContainer.style.display = 'none';
      errorMessage.textContent = '⚠️ Error al cargar el modelo. Intente nuevamente.';
      errorMessage.style.display = 'block';
      setTimeout(() => {
        errorMessage.style.display = 'none';
      }, 5000);
    }
  );

  // Animación
  function animate() {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Manejar resize de ventana
  window.addEventListener('resize', onWindowResize, false);
  
  // Timeout para carga lenta
  loadTimeout = setTimeout(() => {
    document.querySelector('.loader-text').textContent = 
      "El modelo está tardando más de lo esperado...";
  }, 10000);
}

// Función para redimensionar
function onWindowResize() {
  if (camera && renderer) {
    camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
  }
}

// Eventos para abrir modal
openButtons.forEach(btn => {
  btn.addEventListener('click', function () {
    const glbUrl = this.getAttribute('data-model');
    modal.style.display = 'flex';
    init3DViewer(glbUrl);
  });
});

// Evento para cerrar modal
closeButton.addEventListener('click', function () {
  modal.style.display = 'none';
  clearTimeout(loadTimeout);
  cancelAnimationFrame(animationId);
  
  if (renderer) {
    renderer.dispose();
    viewerContainer.innerHTML = '';
  }
  
  loaderContainer.style.display = 'none';
  errorMessage.style.display = 'none';
  window.removeEventListener('resize', onWindowResize);
});

    // final funcion de cosas 3d

    // --- Funcionalidad del carrusel ---
    const nextButtons = document.querySelectorAll('.carousel-btn.next');
    const prevButtons = document.querySelectorAll('.carousel-btn.prev');

    nextButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const carousel = btn.parentElement.querySelector('.carousel');
        carousel.scrollBy({ left: 320, behavior: 'smooth' });
      });
    });

    prevButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const carousel = btn.parentElement.querySelector('.carousel');
        carousel.scrollBy({ left: -320, behavior: 'smooth' });
      });
    });
    // final funcion carrusel
