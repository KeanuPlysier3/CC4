let $canvas = document.querySelector("canvas");
let username = localStorage.getItem("username") || "player1";
let context = $canvas.getContext('2d');
let img;

const width = 600;
const height = 600;

const init = () => {
    setupCanvas();
    img = new Image();
    img.src = "ASSETS/Images/trophee.png";
    img.width = "150%";
    img.addEventListener('load', () => { renderImage(img); drawName(username); });




}

const drawName = (username) => { //draws name on top of the image 
    context.fillStyle = "white";
    context.textAlign = "center";
    context.font = "48px helvetica"
    context.fillText(username, 300, 470);


}

const renderImage = (img) => {//draws image on canvas
    context.drawImage(img, 0, 0);
}

const setupCanvas = () => {

    // Set display size (css pixels). 

    $canvas.style.width = `${width}px`;

    $canvas.style.height = `${height}px`;



    // Set actual size in memory (scaled to account for extra pixel density). 

    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas. 

    // const scale = 1 // Change to 1 on retina screens to see blurry canvas. 

    $canvas.width = Math.floor(width * scale);

    $canvas.height = Math.floor(height * scale);



    // Normalize coordinate system to use CSS pixels. 

    context.scale(scale, scale);

}

init();