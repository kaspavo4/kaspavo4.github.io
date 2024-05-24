class Audio_controller{
    constructor(){
        this.backgroundMusic = new Audio('./static_resources/background_music.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.autoplay = true;
        this.button = document.querySelector('#music_button')
        this.volumeSlider = document.getElementById('volumeSlider');
        this.backgroundMusic.volume = this.volumeSlider.value / 100;
        this.backgroundMusic.pause();
        this.Initiliaze()
    }

    Initiliaze(){
        //Adds event listener for music button - plays or stops music
        document.addEventListener('DOMContentLoaded', () => {
            this.button.addEventListener('click', () => {
                if (this.backgroundMusic.paused) {
                    this.backgroundMusic.play();
                    this.button.innerHTML = 'Turn off';
                } else {
                    this.backgroundMusic.pause();
                    this.button.innerHTML = 'Turn on';
                }
            });
        });

        //adds listener for slider, changes volume
        document.addEventListener('DOMContentLoaded', () => {            
            volumeSlider.addEventListener('input', () => {
                this.backgroundMusic.volume = this.volumeSlider.value / 100;
            });
        });
    }
}

const audio = new Audio_controller()
