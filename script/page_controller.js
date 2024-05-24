import { CanvasManager } from './canvas.js';
import { deleteCanvas } from './gallery_utils.js';
import { downloadCanvas } from './gallery_utils.js';
import { openCanvas } from './gallery_utils.js';

//main page controller, sets current visible page depending on page parameter in link, uses history API
class PageController {
    constructor({pages, defaultPage, navs}) {
        this.pages = pages;
        this.defaultPage = defaultPage;
        this.currentPage = null
        this.navs = navs
        this.currentNav = null
        this.canvas = null

        this.route(window.location.href);

        window.addEventListener('popstate', e => {
            this.route(window.location.href);
        });

         window.addEventListener('click', e => {
            const element = e.target
            if (element.nodeName === 'A') {
                e.preventDefault();
                this.route(element.href);
                window.history.pushState(null, null, element.href)
            }
        });
    }

    //routes to page
    route(urlString) {
        const url = new URL(urlString)
        const page = url.searchParams.get('page')

        if (this.currentPage) {
            this.currentPage.pageHide()
        }

        const page404 = this.pages.find(p => p.key === '404')
        const pageInstanceMatched = this.pages.find(p => p.key === (page ?? this.defaultPage))
        const currentPage = pageInstanceMatched ?? page404
        
        this.drawNav()

        this.currentPage = currentPage
        this.currentPage.pageShow()
    }

    //draws nav in header, depends on if user is logged in
    drawNav(){
        if(sessionStorage.getItem('sessionID') == null){
            this.currentNav = this.navs.find(n => n.key === 'outsider')
        } else {
            this.currentNav = this.navs.find(n => n.key === 'loggedIn')
        }
        this.currentNav.navShow()
    }
}

//parent class for Navs
class Nav{
    constructor(key){
        this.key = key
        this.NavElement = document.querySelector('#nav')
    }
    
    render(){
        return ''
    }

    navShow() {
        this.NavElement.innerHTML = this.render()
    }
}

//Nav if user is logged in
class NavLoggedIn extends Nav{
    constructor(settings) {
        super(settings)
    }

    render() {
        return `
        <ul>
            <li><a id="PaintingLink" href="?page=painting" >Painting</a></li>
            <li><a id="GalleryLink" href="?page=gallery">Gallery</a></li>
            <li><a id="LogoutLink" href="?page=painting">Logout</a></li>
        </ul>
        `
    }

    navShow() {
        super.navShow()

        const logOut = document.getElementById('LogoutLink');
        
        logOut.addEventListener('click', function(event) {
                event.preventDefault();
                userController.logout();
        });

    }
}

//nav if user is not logged in
class NavOutsider extends Nav{
    constructor(settings) {
        super(settings)
    }

    render() {
        return `
        <ul>
            <li><a id="PaintingLink" href="?page=painting" >Painting</a></li>
            <li><a id="GalleryLink" href="?page=gallery">Gallery</a></li>
            <li><a id="LoginLink" href="?page=login">Login</a></li>
        </ul>
        `
    }

    navShow() {
        super.navShow()
    }
}

//parent class for pages
class Page {
    constructor(key) {
        this.pageElement = document.querySelector('#content')
        this.key = key
    }

    render() {
        return ``
    }

    pageShow() {
        this.pageElement.innerHTML = this.render()

    }

    pageHide() {
        this.pageElement.innerHTML = ''
    }
}

//page for painting using canvas
class PagePaint extends Page {
    constructor(settings) {
        super(settings)
    }

    render() {
        return `
        <section id="painting">
            <div id="painting_menu">
                <form id="PaintForm">
                    <div class="paint_form_input">
                        <label for="painting_name">Name:</label><br>
                        <input type="text" id="PaintingForm" name="painting_name" placeholder="paint1" maxlength="8" required><br>
                    </div>
                    <div class="paint_form_submit">
                        <input type="submit" value="Save">
                    </div>
                </form>
                <div id="color_button_creator">
                    <p>Drag and drop new colors!</p>
                    <div id="button_holder">
                        <div class="draggable_button" draggable="true"></div>
                    </div>
                </div>
            </div>
            <article id="painting_board">
                <div id="canvas_frame">
                    <canvas id="canvas"></canvas>
                </div>    
                <div id="color_palette">
                    <button class="color_button canvas_button"></button>
                    <button class="color_button canvas_button"></button>
                    <button class="color_button canvas_button"></button>
                    <button class="color_button canvas_button"></button>
                    <button class="color_button canvas_button"></button>
                </div>
                <div id="draw_type">
                    <button id="rubber" class="color_button canvas_button"></button>
                    <button id="brush" class="type_button canvas_button"></button>
                    <button id="pencil" class="type_button canvas_button"></button>
                    <button id="clear_painting" class="canvas_button"></button>
                </div>
            </article>
        </section>
        <aside id="color_slide_box">
            <div id="color_slide_header">
                <p>Click inside the box for extra colors!</p>
            </div>
            <svg id="color_slide" xmlns="http://www.w3.org/2000/svg"></svg>
        </aside>
        `
    }

    //if visited for first time, creates new canvas otherwise loads used canvas
    pageShow() {
        super.pageShow()
        if(this.canvas == null){
            this.canvas = new CanvasManager(10,10)
        } else {
            this.canvas.initializeCanvas()
        }

        this.canvas.initializeColorSlide()
        this.canvas.initializeColorButtonAdd()
        
        //if there is id parameter in link loads corresponding painting (user must be logged in)
        const urlParams = new URLSearchParams(window.location.search);
        const canvasId = urlParams.get('id');
        if(canvasId){
            this.canvas.loadCanvas(canvasId)
        }

        //listener for save button
        const saveCanvas = document.getElementById('PaintForm');
        saveCanvas.addEventListener('submit', (event) => {
            event.preventDefault();
            this.canvas.saveCanvas();
        });
    }
    
    pageHide(){
        super.pageHide()
    }
}


//page with gallery
class PageGallery extends Page {
    constructor(settings) {
        super(settings)
    }

    render() {
        return `
        <section id="gallery">
            <div id="gallery_header">
                <h2 id="gallery_title">Gallery of user: </h2>
            </div>
            <article id="gallery_content">
            </article>
        </section>
        `
    }

    pageShow() {
        super.pageShow()
        this.loadGallery()
    }

    pageHide() {
        super.pageHide()
    }

    loadGallery() {
        const userId = sessionStorage.getItem('sessionID');
        const gallery_title = document.getElementById('gallery_title');
        if (!userId) {
            gallery_title.textContent += "User not logged in!"
            return;
        }

        const users = JSON.parse(localStorage.getItem("users"))
        for (let i = 0; i < users.length; i++) {
            if (users[i].id == userId) {
                gallery_title.textContent += users[i].username
                break
            }
        }

        const userCanvases = JSON.parse(localStorage.getItem(userId)) || {};
        const gallery = document.getElementById('gallery_content');

        //loads all saved painting from localStorage
        for (const [canvasId, canvasData] of Object.entries(userCanvases)) {
            var item = this.createCanvas(canvasId, canvasData.name, canvasData.colorsArray);
            gallery.appendChild(item);
        }
    }

    //creates gallery item for each painting
    createCanvas(id, name, drawing) {
        const canvasFrame = document.createElement('div');
        canvasFrame.classList.add('canvas_item');

        const canvasheader = document.createElement('div');
        canvasheader.classList.add('canvas_header')

        const canvasTitle = document.createElement('h2');
        canvasTitle.classList.add('canvas_title');
        canvasTitle.textContent = name;

        //download button
        const downloadBtn = document.createElement('button');
        downloadBtn.classList.add('btn_download');
        downloadBtn.addEventListener('click', (event) => {
            const canvasItem = event.target.closest('.canvas_item');
            const canvas = canvasItem.querySelector('.canvas_painting');
            const name = canvasItem.querySelector('.canvas_title').innerHTML;
            downloadCanvas(canvas, name);
        });

        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        canvas.classList.add('canvas_painting');
        this.colorCanvas(drawing, canvas);

        const buttons = document.createElement('div');
        buttons.classList.add('buttons');

        //open button
        const openBtn = document.createElement('button');
        openBtn.classList.add('btn_open');
        openBtn.textContent = 'Open';
        openBtn.addEventListener('click', (event) => {
            const canvasItem = event.target.closest('.canvas_item');
            const canvasid = canvasItem.querySelector('.canvas_id').value;
            openCanvas(canvasid)
        });

        //delet button
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn_delete');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', (event) => {
            const canvasItem = event.target.closest('.canvas_item');
            const canvasid = canvasItem.querySelector('.canvas_id').value;
            deleteCanvas(canvasid)
        });

        //hidden input to save painting id for later use
        const ID = document.createElement('input');
        ID.setAttribute('type', 'hidden');
        ID.setAttribute('class', 'canvas_id');
        ID.setAttribute('value', id);


        canvasheader.appendChild(canvasTitle)
        canvasheader.appendChild(downloadBtn)
        canvasFrame.appendChild(canvasheader)

        canvasFrame.appendChild(canvas);

        buttons.appendChild(ID)
        buttons.appendChild(openBtn)
        buttons.appendChild(deleteBtn)
        canvasFrame.appendChild(buttons);

        return canvasFrame
    }

    //takes created canvas and colors using localStorage data
    colorCanvas(drawing, canvas) {
        const ctx = canvas.getContext('2d');
        const squareSize = 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawing.forEach(({ x, y, color }) => {
            ctx.fillStyle = color;
            ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        });
    }
}


//page with login form
class PageLog extends Page {
    constructor(settings) {
        super(settings)
    }

    render() {
        return `
        <section id="login">
            <p>No account? Register <a href="?page=register">HERE!</a></p>
            <div class="loginbox">
                <h2>Log in:</h2>
                <form id="loginForm" onsubmit="userController.validateLoginForm(event)">
                    <div>
                        <label for="logUsername">Username:</label><br>
                        <input type="text" id="logUsername" name="username" placeholder="John123" required><br>
                    </div>
                    <div>
                        <label for="password">Password:</label><br>
                        <input type="password" id="logPassword" name="password" placeholder="Password" required><br>
                    </div>
                    <div>
                        <input type="submit" value="Log in">
                    </div>
                </form>
            </div>
        </section>
        `
    }

    pageShow() {
        super.pageShow()
    }

    pageHide() {
        super.pageHide()
    }

    onDragOver (e) {
        e.preventDefault();
    }
}

//page with register form
class PageReg extends Page {
    constructor(settings) {
        super(settings)
    }

    render() {
        return `
        <section id="register">
            <div class="loginbox">
                <h2>Sign up:</h2>
                <form id="regForm" onsubmit="userController.validateRegForm(event)">
                    <div>
                        <label for="username">Username:</label><br>
                        <input type="text" id="regUsername" name="username" placeholder="John123" required><br>
                    </div>
                    <div>
                        <label for="password">Password:</label><br>
                        <input type="password" id="regPassword" name="password" placeholder="Password" required><br>
                    </div>
                    <div>
                        <input type="submit" value="Register">
                    </div>
                </form>
            </div>
        </section>
        `
    }

    pageShow() {
        super.pageShow()
    }

    pageHide() {
        super.pageHide()
    }

    onDragOver (e) {
        e.preventDefault();
    }
}

//page for 404

class PageNotFound extends Page {
    render() {
        return `
            <div id="error404">
                <h2>Error 404 - page not found</h2>
                <p>Redirect to main page => <a href="?page=painting">Mainpage</a><p>
            </div>
        `
    }
}

new PageController({
    pages: [
        new PagePaint('painting'),
        new PageGallery('gallery'),
        new PageLog('login'),
        new PageReg('register'),
        new PageNotFound('404')
    ],
    defaultPage: 'painting',
    navs: [
        new NavLoggedIn('loggedIn'),
        new NavOutsider('outsider'),
    ]
});