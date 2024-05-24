export class CanvasManager {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.colorsArray = [];
        this.mode = 'pencil';

        this.selectedColor = null;
        this.draggableSquares = null;
        this.initializeCanvas()
    }

    //initializes canvas, if some paint was already applied, loads colors
    initializeCanvas() {
        this.colorButtons = document.querySelectorAll('.color_button');
        this.clearAllButton = document.querySelector('#clear_painting');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.initializeCanvasSize()
        if(this.colorsArray.length == 0){
            this.drawGrid();
        } else {
            this.drawColorGrid()
        }
        this.addColorButtonListeners();
        this.addCanvasClickListener();
        this.addCanvasBrushListener();
        this.addModeSwitchListeners()
        this.addClearAllButtonListener();
    }

    //initializes size of canvas
    initializeCanvasSize(){
        this.height = this.canvas.offsetHeight;
        this.size = this.height/this.cols
        this.canvas.width = this.height
        this.canvas.height = this.height


        const frame = document.getElementById('canvas_frame')
        frame.style.minHeight = `${this.height}px`;
        frame.style.minWidth = `${this.height}px`;
        this.canvas.style.height = `${this.height}px`;
        this.canvas.style.width = `${this.height}px`;
        this.canvas.style.minHeight = `${this.height}px`;
        this.canvas.style.minWidth = `${this.height}px`;
    }


    initializeColorSlide(){
        const svg = document.getElementById("color_slide");
        svg.addEventListener('click', () => {
            this.slideCreateMovingSquare(svg)
        });
    
    
        setInterval(() => {
            this.slideCreateMovingSquare(svg);
        }, 3000); 
    }

    //random color generator - takes 6 random characters from 16 and adds them to #
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    //creates sliding moving square with color
    slideCreateMovingSquare(svg) {
        const rectSize = 30;
        const svgWidth = svg.clientWidth;
        const svgHeight = svg.clientHeight;
    
        const posX = Math.random() * (svgWidth - rectSize);
        const color = this.getRandomColor();
    
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", posX);
        rect.setAttribute("y", 0);
        rect.setAttribute("width", rectSize);
        rect.setAttribute("height", rectSize);
        rect.setAttribute("fill", color);
        rect.setAttribute("cursor", "pointer");
 
        //when clicked set as selected color
        rect.addEventListener('click', () => {
            this.selectedColor = color
            this.draggableButtons.forEach(square => {
                square.style.backgroundColor = this.selectedColor;
            });
        });
    
        svg.appendChild(rect);
    
        //seconds
        const animationDuration = 10;
        const startTime = Date.now();
    
        function animate() {
            //calculating position
            const elapsedTime = (Date.now() - startTime) / 1000;
            const progress = elapsedTime / animationDuration;
            const newY = progress * (svgHeight - rectSize);
    
            rect.setAttribute("y", newY);
    
            //if at end, destroy square
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                svg.removeChild(rect);
            }
        }
    
        animate();
    }

    initializeColorButtonAdd(){
        this.draggableButtons = document.querySelectorAll('.draggable_button');
        const dropzone = document.getElementById('color_palette');
            
        this.draggableButtons.forEach(square => {
            square.style.backgroundColor = this.getRandomColor()
            square.addEventListener('dragstart', (event) => {
                const color = window.getComputedStyle(event.target).backgroundColor;
                event.dataTransfer.setData('text/plain', color);
                setTimeout(() => {
                    event.target.classList.add('hide');
                }, 0);
            });

            square.addEventListener('dragend', (event) => {
                square.classList.remove('hide');
                square.style.backgroundColor = this.getRandomColor()
            });
        });
        
        dropzone.addEventListener('dragover', (event) => {
            event.preventDefault();
        });
        
        //when drop, create new button with same background color
        dropzone.addEventListener('drop', (event) => {
            event.preventDefault();
            const color = event.dataTransfer.getData('text/plain');
            const newBtn = document.createElement('button');
            newBtn.classList.add('color_button')
            newBtn.classList.add('canvas_button')
            newBtn.style.backgroundColor = color
        
            dropzone.appendChild(newBtn)
            this.colorButtons = document.querySelectorAll('.color_button');
            this.addColorButtonListeners();
        });      
    }

    //draws grid
    drawGrid() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.ctx.strokeRect(j * this.size, i * this.size, this.size, this.size);
            }
        }
    }

    //loads colors into canvas
    drawColorGrid() {
        this.drawGrid()
        for (let i = 0; i < this.colorsArray.length; i++) {
            const item = this.colorsArray[i];
            const x = item.x;
            const y = item.y;
            const color = item.color;
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x * this.size, y * this.size, this.size, this.size);
        }
    }

    //saves used colors
    saveColorToArray(x, y, color) {
        this.colorsArray.push({ x: x, y: y, color: color });
    }

    //saves canvas into array into localStorage
    saveCanvas() {
        let name = document.getElementById('PaintingForm').value

        //saves under current user id
        const userId = sessionStorage.getItem('sessionID');
        if(userId == null){
            alert("Failed to save your painting. You need to login first!")
            return
        }
        let userCanvases = JSON.parse(localStorage.getItem(userId)) || {};
        
        const canvasId = Object.keys(userCanvases).length + 1;
        
        userCanvases[canvasId] = {
            name: name,
            colorsArray: this.colorsArray
        };
    
        localStorage.setItem(userId, JSON.stringify(userCanvases));
        alert("Painting has been saved into your gallery!")
    }

    //loads canvas from localStorage 
    loadCanvas(canvasId){
        const userId = sessionStorage.getItem('sessionID');
        const canvasName = document.getElementById('PaintingForm');
        if (!userId) {
            console.error('User is not logged in');
            return;
        }

        const userCanvases = JSON.parse(localStorage.getItem(userId)) || {};

        //sets canvas colors and loads colored canvas
        if (userCanvases[canvasId]) {
            this.colorsArray = userCanvases[canvasId].colorsArray;
            canvasName.value =  userCanvases[canvasId].name
            this.drawColorGrid()
        } else {
            console.error(`Canvas with ID ${canvasId} not found`);
        }
    }

    //adds listeners for color buttons
    addColorButtonListeners() {
        this.colorButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.colorButtons.forEach((btn) => {
                    btn.classList.remove('selected');
                });
                button.classList.add('selected');
                this.selectedColor = window.getComputedStyle(button).getPropertyValue('background-color');
            });
        });
    }

    //adds listener for canvas, clicked squere gets colored by selected color - pencil
    addCanvasClickListener() {
        this.canvas.addEventListener('click', (event) => {
            this.paint(event)
        });
    }

    //hold and draw squares under mouse cursor - brush
    addCanvasBrushListener() {
        this.canvas.addEventListener('mousedown', (event) => {
            if (event.button === 0 && this.mode === 'brush') {
                this.drawing = true;
                this.paint(event);
            }
        });

        this.canvas.addEventListener('mousemove', (event) => {
            if (this.drawing && this.mode === 'brush') {
                this.paint(event);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.drawing = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.drawing = false;
        });
    }

    //paints square for brush and pencil
    paint(event) {
        if(this.selectedColor){
            const x = Math.floor(event.offsetX / this.size);
            const y = Math.floor(event.offsetY / this.size);
            const backgroundColor = this.selectedColor;

            this.saveColorToArray(x, y, backgroundColor);

            if (backgroundColor === 'rgba(0, 0, 0, 0)') {
                this.ctx.clearRect(x * this.size, y * this.size, this.size, this.size);
                this.ctx.strokeRect(x * this.size, y * this.size, this.size, this.size);
                return;
            }
            this.ctx.fillStyle = backgroundColor;
            this.ctx.fillRect(x * this.size, y * this.size, this.size, this.size);
        }
    }

    //switcher between paint modes
    addModeSwitchListeners() {
        const pencil = document.getElementById('pencil');
        const brush = document.getElementById('brush');
        pencil.addEventListener('click', () => {
            this.mode = 'pencil';
            pencil.classList.add('selected_type')
            brush.classList.remove('selected_type')
        });

        brush.addEventListener('click', () => {
            this.mode = 'brush';
            brush.classList.add('selected_type')
            pencil.classList.remove('selected_type')
        });
    }

    //adds listener for clearing button
    addClearAllButtonListener() {
        this.clearAllButton.addEventListener('click', () => {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.ctx.clearRect(j * this.size, i * this.size, this.size, this.size);
                    this.ctx.strokeRect(j * this.size, i * this.size, this.size, this.size);
                }
            }
        });
    }

}

