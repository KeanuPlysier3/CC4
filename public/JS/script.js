
let score = 0; //current scrore

let $scoreboard; //different boards on screen
let $targetscore;
let $shotclock;

let $btn1; //two point button 
let $btn2; //threepoint button

let $three;  //different stat elements in the nav
let $two;
let $xp;
let $speed;

let three; //stored values of stats
let two;
let speed;
let xp;

let $upgradeThree; //shop buttons
let $upgradeTwo;
let $upgradeSpeed;

let $form; //popup with form
let $dialog;

let $progressBar; //progress image

let target = 24;
let clock = 24;

let wins = 0;//total amount of wins tht updates progress image




const init = () => {
    initSocket();
    setup();
    setInterval(shotClock, "1000");
}

//setup functions 
const setup = () => { //executes all setup functions
    setupElements();
    setupEvents();
    setupDialog();
    setupShooting();
    setupSpeed();
    setupXP();
    setupBoards();
    setupUpgrades();
    setupTarget();
}

let socket; // will be assigned a value later
let peerConnection;

const servers = {
    iceServers: [{
        urls: `stun:stun.l.google.com:19302`
    }]
};


const initSocket = () => {
    socket = io.connect('/');
    socket.on('connect', () => {
        console.log(`Connected: ${socket.id}`);
        const url = `${new URL(`/sender.html?id=${socket.id}`, window.location)}`;


        const typeNumber = 4;
        const errorCorrectionLevel = 'L';
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(url);
        qr.make();
        document.getElementById('qr').innerHTML = qr.createImgTag(4);
    });

    socket.on('peerOffer', (myId, offer, peerId) => {
        console.log(`Received peerOffer from ${peerId}`);
        answerPeerOffer(myId, offer, peerId);
    });
    socket.on('peerIce', (myId, candidate, peerId) => {
        console.log(`Received peerIce from ${peerId}`, candidate);
        handlePeerIce(myId, candidate, peerId);
    });
};

const answerPeerOffer = async (myId, offer, peerId) => {
    peerConnection = new RTCPeerConnection(servers);

    // Set up ondataChannel FIRST, before setRemoteDescription
    peerConnection.ondatachannel = (e) => {
        const dataChannel = e.channel;
        console.log('Data channel received:', dataChannel.label);

        // dataChannel.onopen = (e) => {
        //     console.log('Receiver channel OPENED!');
        //     dataChannel.send('hello back');
        // }

        dataChannel.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case 'shot':
                    handleShot(message.data);
                    console.log(`shot: ${message.data}`)
                    break;
                case 'hello':
                    setupDialog()
                    console.log(`hello: ${message.data}`)
                    break;
                default:
                    console.log('Unknown event:', message.type);
            }
        };

        dataChannel.onerror = (error) => {
            console.error('Channel error:', error);
        }
    }

    peerConnection.onicecandidate = (e) => {
        console.log('ice candidate', e.candidate);
        socket.emit('peerIce', peerId, e.candidate);
    };

    // Now set remote description AFTER handlers are ready
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit(`peerAnswer`, peerId, answer);
};

const handlePeerIce = async (myId, candidate, peerId) => {
    if (!candidate) {
        return;
    }
    await peerConnection.addIceCandidate(candidate);
};


const setupElements = () => { //group of all static querySelectors

    $dialog = document.querySelector(".start");
    $btn1 = document.querySelector("#btn1");
    $btn2 = document.querySelector("#btn2");

    $upgradeThree = document.querySelector("#btn3");
    $upgradeTwo = document.querySelector("#btn4");
    $upgradeSpeed = document.querySelector("#btn5");

    $progressBar = document.querySelector(".progress__bar");
    $form = document.querySelector(".form");

    $targetscore = document.querySelector("#target");
    $shotclock = document.querySelector("#clock");
    $scoreboard = document.querySelector("#score")

    $xp = document.querySelector("#earnings__xp");

    $two = document.querySelector("#stats__two");
    $three = document.querySelector("#stats__three");
    $speed = document.querySelector("#stats__speed");

}

const setupEvents = () => { //all eventlisteners on elements
    if ($form) {
        $form.addEventListener("submit", handleSubmit);
    }

    $upgradeThree.addEventListener("click", handleUpgradeThree);
    $upgradeTwo.addEventListener("click", handleUpgradeTwo);
    $upgradeSpeed.addEventListener("click", handleUpgradeSpeed);

    $btn1.addEventListener("click", () => {
        $btn1.disabled = true;
        $btn2.disabled = true;
        setTimeout(handleShot("two"), speed);
    });

    $btn2.addEventListener("click", () => {
        $btn1.disabled = true;
        $btn2.disabled = true;
        setTimeout(handleShot("three"), speed);
    })
}

const setupDialog = () => { //makes form popup when no username exists

    $dialog.classList.toggle("pop");

}

const setupTarget = () => { //sets progress and targetscore after refresh


    if (!localStorage.getItem("wins")) {
        localStorage.setItem("wins", wins);
        wins = 0;

    }
    else {
        wins = localStorage.getItem("wins");
        wins = parseInt(wins);

        switch (wins) {
            case 1:
                target = 36;
                $progressBar.setAttribute("src", "ASSETS/Images/state1.png");
                break;

            case 2:
                target = 46;
                $progressBar.setAttribute("src", "ASSETS/Images/state2.png");
                break;

            case 3:
                wins = 0;
                break;

        }
        localStorage.setItem("wins", wins);
        console.log("wins: " + wins);
        $targetscore.textContent = target;
    }
}

const setupShooting = () => { //sets stats in the navbar after refresh



    if (!localStorage.getItem("two")) {
        localStorage.setItem("two", "rookie");
        two = localStorage.getItem("two");


    }
    else {
        two = localStorage.getItem("two");
        console.log("two: " + two);

    }
    two = localStorage.getItem("two");
    $two.innerHTML = "<span class='bold'> two pointer: </span >" + two;

    if (!localStorage.getItem("three")) {
        localStorage.setItem("three", "rookie");


    }
    else {
        three = localStorage.getItem("three");
        console.log("three: " + three);
    }
    three = localStorage.getItem("three");
    $three.innerHTML = "<span class='bold'> three pointer: </span >" + three;
}

const setupSpeed = () => { //sets speed stat in nav  after refresh


    if (!localStorage.getItem("speed")) {
        localStorage.setItem("speed", 3000);
        speed = localStorage.getItem("speed");
    }
    else {
        speed = localStorage.getItem("speed");
        console.log("speed: " + speed);
    }
    speed = localStorage.getItem("speed");
    $speed.innerHTML = "<span class='bold'> shot speed: </span >" + speed / 1000 + "s";
}

const setupXP = () => { //sets up the xp on refresh


    if (!localStorage.getItem("xp")) {
        xp = 0;
        localStorage.setItem("xp", xp);
    }
    else {
        xp = parseInt(localStorage.getItem("xp"));

    }
    $xp.innerHTML = "<span class='bold'> points: </span > " + xp;
}

const setupBoards = () => { //sets up all the boards
    $scoreboard.textContent = 0;
    $shotclock.textContent = 24;

}

const setupUpgrades = () => { //sets up the possible upgrades on refresh



    if (localStorage.getItem("three") == "pro") {
        const $price = document.querySelector("#price1");
        $price.textContent = "50pts";
    }
    else if (localStorage.getItem("three") == "elite") {
        const $price = document.querySelector("#price1");
        $price.textContent = "maxed";
        $upgradeThree.disabled = true;
    }


    if (localStorage.getItem("two") == "pro") {
        const $price = document.querySelector("#price2");
        $price.textContent = "50pts";
    }
    else if (localStorage.getItem("two") == "elite") {
        const $price = document.querySelector("#price2");
        $price.textContent = "maxed";
        $upgradeTwo.disabled = true;
    }

    if (localStorage.getItem("speed") == "2000") {
        const $price = document.querySelector("#price3");
        $price.textContent = "50pts";
    }
    else if (localStorage.getItem("speed") == "1000") {
        const $price = document.querySelector("#price3");
        $price.textContent = "maxed";
        $upgradeSpeed.disabled = true;
    }
}


//interval functions
const updateTarget = () => { //sets new target score after previous gets beaten, also sets new progressbar status
    wins = parseInt(localStorage.getItem("wins"));
    wins++;
    switch (wins) {
        case 1:
            target = 36;
            $progressBar.setAttribute("src", "ASSETS/Images/state1.png");

            break;

        case 2:
            target = 46;
            $progressBar.setAttribute("src", "ASSETS/Images/state2.png");

            break;

        case 3:
            wins = 0;
            window.location.href = "./end.html";
            break;

    }
    localStorage.setItem("wins", wins);
    console.log("wins: " + wins);
    $targetscore.textContent = target;
}

const shotClock = () => { //resets the shotclock and user's score after 24 
    clock--;
    if (score >= target) {
        clock = 24;
        score = 0;
        $btn1.disabled = false; //user can immediately shoot after the shotclock resets, and target score was not hit.
        $btn2.disabled = false;

        updateTarget();

    }
    else if (clock === 0 && score <= target) {
        clock = 24;
        score = 0;
        $btn1.disabled = false;
        $btn2.disabled = false;

    }

    $shotclock.textContent = clock;
    $scoreboard.textContent = score;

};


//eventListener functions
const handleSubmit = (event) => { //saves username in localStorage after the user submits a name.
    event.preventDefault();
    let username = document.querySelector("#username").value;
    localStorage.setItem("username", username);
    $shotclock.textContent = 24;
    $dialog.classList.remove("pop");

}

const handleShot = (shot) => { //handles shooting after pressing the 2pt btn

    $previousBall = document.querySelector(".ball");
    if ($previousBall) {
        $previousBall.remove();
    }

    $ball = document.createElement("div");
    $ball.classList.add("ball");
    document.querySelector(".grid").appendChild($ball);


    let type = localStorage.getItem(shot);
    const points = shot === "two" ? 2 : 3;

    let percentage = Math.random() * 100;
    console.log(percentage);

    switch (type) {
        case "rookie":
            if (percentage <= 25) {
                console.log("made");
                score = score + points;
                xp = xp + points;
                setTimeout(() => {

                    $ball.style.transform = 'translateY(500%)'; // move down by 100px
                }, 500);



            }
            else {
                console.log("missed");
                setTimeout(() => {

                    dice = Math.floor(Math.random() * 3);

                    switch (dice) {

                        case 0:
                            $ball.style.transform = 'translate(100%,300%)';
                            setTimeout(() => {
                                $ball.style.transform = 'translate(200%,100%)';
                                $ball.style.opacity = '0.5';
                            }, 500)
                            break;



                        case 1:
                            $ball.style.transform = 'translate(-100%,300%)';
                            setTimeout(() => {
                                $ball.style.transform = 'translate(-200%,100%)';
                                $ball.style.opacity = '0.5';
                            }, 500)
                            break;


                        case 2:
                            $ball.style.transform = 'translateY(300%)';
                            setTimeout(() => {
                                $ball.style.transform = 'translateY(100%)';
                                $ball.style.opacity = '0.5';
                            }, 500)
                            break;
                    }

                }, 1);

            }
            break;

        case "pro":
            if (percentage <= 60) {
                console.log("made");
                score = score + points;
                xp = xp + points;
                setTimeout(() => {

                    $ball.style.transform = 'translateY(500%)'; // move down by 100px
                }, 500);



            }
            else {
                console.log("missed");
                setTimeout(() => {

                    dice = Math.floor(Math.random() * 3);

                    switch (dice) {

                        case 0:
                            $ball.style.transform = 'translate(100%,300%)';
                            setTimeout(() => {
                                $ball.style.transform = 'translate(200%,100%)';
                                $ball.style.opacity = '0.5';
                            }, 500)
                            break;



                        case 1:
                            $ball.style.transform = 'translate(-100%,300%)';
                            setTimeout(() => {
                                $ball.style.transform = 'translate(-200%,100%)';
                                $ball.style.opacity = '0.5';
                            }, 500)
                            break;


                        case 2:
                            $ball.style.transform = 'translateY(300%)';
                            setTimeout(() => {
                                $ball.style.transform = 'translateY(100%)';
                                $ball.style.opacity = '0.5';
                            }, 500)
                            break;
                    }

                }, 1);

            }
            break;

        case "elite":
            if (percentage <= 90) {
                console.log("made");
                score = score + points;
                xp = xp + points;
                setTimeout(() => {

                    $ball.style.transform = 'translateY(500%)'; // move down by 100px
                }, 500);



            }
            else {
                console.log("missed");
                setTimeout(() => {

                    dice = Math.floor(Math.random() * 3);

                    switch (dice) {

                        case 0:
                            $ball.style.transform = 'translate(100%,300%)';
                            setTimeout(() => {
                                $ball.style.transform = 'translate(200%,100%)';
                                $ball.style.opacity = '0.5';
                            }, 500)
                            break;



                        case 1:
                            $ball.style.transform = 'translate(-100%,300%)';
                            setTimeout(() => {
                                $ball.style.transform = 'translate(-200%,100%)';
                                $ball.style.opacity = '0.5';
                            }, 500)
                            break;


                        case 2:
                            $ball.style.transform = 'translateY(300%)';
                            setTimeout(() => {
                                $ball.style.transform = 'translateY(100%)';
                                $ball.style.opacity = '0.5';
                            }, 500)
                            break;
                    }

                }, 1);

            }
            break;
    }
    $scoreboard.textContent = score;
    console.log(xp);
    $xp.innerHTML = "<span class='bold'> points: </span > " + xp;
    localStorage.setItem("xp", xp);
    $btn1.disabled = false;
    $btn2.disabled = false;

}

// const handleThree = () => {//handles shooting after pressing the 3pt btn
//     $previousBall = document.querySelector(".ball");
//     if ($previousBall) {
//         $previousBall.remove();
//     }

//     $ball = document.createElement("div");
//     $ball.classList.add("ball");
//     document.querySelector(".grid").appendChild($ball);
//     //console.log("hy");
//     let three = localStorage.getItem("three");
//     //console.log(two);
//     let percentage = Math.random() * 100;
//     console.log(percentage);

//     switch (three) {
//         case "rookie":
//             if (percentage <= 10) {
//                 console.log("3 made");
//                 score = score + 3;
//                 xp = xp + 3;
//                 setTimeout(() => {

//                     $ball.style.transform = 'translateY(500%)'//move the ball do
//                 }, 500);

//             }
//             else {
//                 setTimeout(() => {

//                     dice = Math.floor(Math.random() * 3);

//                     switch (dice) {

//                         case 0:
//                             $ball.style.transform = 'translate(100%,300%)';
//                             setTimeout(() => {
//                                 $ball.style.transform = 'translate(200%,100%)';
//                                 $ball.style.opacity = '0.5';
//                             }, 500)
//                             break;



//                         case 1:
//                             $ball.style.transform = 'translate(-100%,300%)';
//                             setTimeout(() => {
//                                 $ball.style.transform = 'translate(-200%,100%)';
//                                 $ball.style.opacity = '0.5';
//                             }, 500)
//                             break;


//                         case 2:
//                             $ball.style.transform = 'translateY(300%)';
//                             setTimeout(() => {
//                                 $ball.style.transform = 'translateY(100%)';
//                                 $ball.style.opacity = '0.5';
//                             }, 500)
//                             break;
//                     }

//                 }, 1);
//             }
//             break;

//         case "pro":
//             if (percentage <= 40) {
//                 console.log("3 made");
//                 score = score + 3;
//                 xp = xp + 3;
//                 setTimeout(() => {

//                     $ball.style.transform = 'translateY(500%)'; // move down by 100px
//                 }, 500);

//             }
//             else {
//                 setTimeout(() => {

//                     dice = Math.floor(Math.random() * 3);

//                     switch (dice) {

//                         case 0:
//                             $ball.style.transform = 'translate(100%,300%)';
//                             setTimeout(() => {
//                                 $ball.style.transform = 'translate(200%,100%)';
//                                 $ball.style.opacity = '0.5';
//                             }, 500)
//                             break;



//                         case 1:
//                             $ball.style.transform = 'translate(-100%,300%)';
//                             setTimeout(() => {
//                                 $ball.style.transform = 'translate(-200%,100%)';
//                                 $ball.style.opacity = '0.5';
//                             }, 500)
//                             break;


//                         case 2:
//                             $ball.style.transform = 'translateY(300%)';
//                             setTimeout(() => {
//                                 $ball.style.transform = 'translateY(100%)';
//                                 $ball.style.opacity = '0.5';
//                             }, 500)
//                             break;
//                     }

//                 }, 1);
//             }
//             break;

//         case "elite":
//             if (percentage <= 60) {
//                 console.log("3 made");
//                 score = score + 3;
//                 xp = xp + 3;
//                 setTimeout(() => {

//                     $ball.style.transform = 'translateY(500%)'; // move down by 100px
//                 }, 500);

//             }
//             else {
//                 setTimeout(() => {

//                     dice = Math.floor(Math.random() * 3);

//                     switch (dice) {

//                         case 0:
//                             $ball.style.transform = 'translate(100%,300%)';
//                             setTimeout(() => {
//                                 $ball.style.transform = 'translate(200%,100%)';
//                                 $ball.style.opacity = '0.5';
//                             }, 500)
//                             break;



//                         case 1:
//                             $ball.style.transform = 'translate(-100%,300%)';
//                             setTimeout(() => {
//                                 $ball.style.transform = 'translate(-200%,100%)';
//                                 $ball.style.opacity = '0.5';
//                             }, 500)
//                             break;


//                         case 2:
//                             $ball.style.transform = 'translateY(300%)';
//                             setTimeout(() => {
//                                 $ball.style.transform = 'translateY(100%)';
//                                 $ball.style.opacity = '0.5';
//                             }, 500)
//                             break;
//                     }

//                 }, 1);
//             }
//             break;
//     }

//     $scoreboard.textContent = score;
//     $xp.innerHTML = "<span class='bold'> points: </span > " + xp;
//     localStorage.setItem("xp", xp);
//     $btn1.disabled = false;
//     $btn2.disabled = false;
// }

const handleUpgradeThree = () => {//upgrades 3point stat
    three = localStorage.getItem("three");
    let $price;

    switch (three) {
        case "rookie":
            if (xp >= 25) {
                three = "pro";
                localStorage.setItem("three", three);
                xp = xp - 25;
                localStorage.setItem("xp", xp);
                $price = document.querySelector("#price1");
                $price.textContent = "50pts";
            }
            else {
                console.log("skeer");
            }
            break;

        case "pro":
            if (xp >= 50) {
                three = "elite";
                localStorage.setItem("three", three);
                xp = xp - 50;
                $price = document.querySelector("#price1");
                $price.textContent = "maxed out";
                localStorage.setItem("xp", xp);
                $upgradeThree.disabled = true;
            }
            break;
    }
    $three.innerHTML = "<span class='bold'> three pointer: </span >" + three;
    $xp.innerHTML = "<span class='bold'> points: </span > " + xp;
}

const handleUpgradeTwo = () => {//upgrades 2point stat
    two = localStorage.getItem("two");
    let $price;
    switch (two) {
        case "rookie":
            if (xp >= 25) { }
            two = "pro";
            localStorage.setItem("two", two);
            xp = xp - 25;
            localStorage.setItem("xp", xp);
            $price = document.querySelector("#price2");
            $price.textContent = "50pts";
            break;

        case "pro":
            two = "elite";
            localStorage.setItem("two", two);
            $price = document.querySelector("#price2");
            localStorage.setItem("xp", xp);
            $price.textContent = "maxed out";
            $upgradeTwo.disabled = true;
            break;
    }
    $two.innerHTML = "<span class='bold'> two pointer: </span >" + two;
    $xp.innerHTML = "<span class='bold'> points: </span > " + xp;
}

const handleUpgradeSpeed = () => {//upgrades speed stat
    speed = localStorage.getItem("speed");
    let $price;
    switch (speed) {
        case "3000":
            if (xp >= 25) {
                speed = 2000;
                localStorage.setItem("speed", speed);
                xp = xp - 25;
                $price = document.querySelector("#price3");
                $price.textContent = "50pts";
                localStorage.setItem("xp", xp);
            }
            break;
        case "2000":
            if (xp >= 50) {
                speed = 1000;
                localStorage.setItem("speed", speed);
                xp = xp - 50;
                $price = document.querySelector("#price3");
                $price.textContent = "maxed";
                localStorage.setItem("xp", xp);
                $upgradeSpeed.disabled = true;
            }
            break;
    }

    $xp.innerHTML = "<span class='bold'> points: </span > " + xp;
    $speed.innerHTML = "<span class='bold'> shot speed: </span >" + speed / 1000 + "s";
}
init();

