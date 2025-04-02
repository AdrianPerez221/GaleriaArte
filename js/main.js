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
            const initialColor = colors[10];
            palette.children[10].classList.add('active');
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