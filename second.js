let mainPalette = {};
let lat;
let lon;

let temp;
let humidity;
let group;
let mainWeatherDes;
let windSpeed;
let precipitation;
let clouds;
let snow;
let city;
let bgBuffer;

let stripes = [];
let raindrops = [];
let snowFall = [];
let cloudsArr = [];
let spiralsCircles = [];


class RainDrop {
    constructor(x, y, length){
        this.reset(x, y, length);
        this.dy = random(precipitation/10, (precipitation/10)+10);
    }
    reset(x, y, length){
        this.x = x;
        this.y = y;
        this.length = length;
    }
    update(){
        this.y += this.dy;
        if (this.y > height) {
            this.reset(random(0,width), -100, this.length);
        }
    }
    display(){
        noFill();
        strokeWeight(1);
        stroke("white");
        line(this.x, this.y, this.x, this.y + this.length);
    }
}

class Snow {
    constructor(x, y, size){
        this.reset(x, y, size);
        this.dy = random(snow/10, (snow/10)+10);
    }
    reset(x, y, size){
        this.x = x;
        this.y = y;
        this.size = size;
    }
    update(){
        this.y += this.dy;
        if (this.y > height) {
            this.reset(random(0,width), -100, this.size);
        }
    }
    display(){
        fill("white");
        noStroke();
        circle(this.x, this.y, this.size);
    }
}

class Stripe {
    constructor(w) {
        this.width = w;
        this.buffer = createGraphics(this.width, height);
        this.drawContent();
    }

    getWidth() {
        return this.width;
    }

    drawCircle(col1, col2, col3, x, y, radius, isLight) {
        let num = random(0, 1);
        let f1; 
        if (num < 0.4) {
            f1 = col1;
        } else if (num < 0.6) {
            f1 = col2;
        } else {
            f1 = col3;
        }
        let f2 = color(red(f1), green(f1), blue(f1), 0);
        if (isLight) {
            let n = random(0, 1);
            if (n < 0.3) { 
                this.drawGradientCircle(f1, f2, x, y, radius);
            } else {
                let radiusStep = random(0.4, 0.8);
                let angleStep = random(0.1, 0.7);
                this.drawSpiralCircle(f1, x, y, radius, radiusStep, angleStep);
            }
        } else {
            this.drawBasicCircle(f1, x, y, radius);
        }
    }

    drawBasicCircle(f1, x, y, radius) {
        this.buffer.noStroke();
        this.buffer.fill(color(red(f1), green(f1), blue(f1), random(100, 255)));
        this.buffer.circle(x, y, radius);
    }
    drawGradientCircle(f1, f2, x, y, radius) {
        for (let r = radius; r > 0; r--) {
            let step = map(r, radius,0, 0,1);
            let col = lerpColor(f2, f1, step);
            this.buffer.noFill();
            this.buffer.stroke(col);
            this.buffer.circle(x,y, r*2);
        }
    }
    drawSpiralCircle(f1, x, y, maxRadius, radiusStep, angleStep) {
        this.buffer.noFill();
        this.buffer.stroke(f1);

        let angle = 0;
        this.buffer.beginShape();

        while (angle < TWO_PI * 20) {
            let r = radiusStep*angle;
            if (r > maxRadius) break;
            
            let px = x + r * cos(angle);
            let py = y + r * sin(angle);
            this.buffer.vertex(px, py);

            angle += angleStep;
        }
        this.buffer.endShape();
    }

    drawSnowCircle(f1, x, y, maxRadius) {
        this.buffer.noFill();
        this.buffer.stroke(f1);

        let angle = 0;
        let angleStep = 0.1;
        let radiusStep; 
        this.buffer.beginShape();

        while (angle < TWO_PI * 10) {
            radiusStep = random(0.4, 0.8);
            let r = radiusStep*angle;
            if (r > maxRadius) break;

            let px = x + r * cos(angle);
            let py = y + r * sin(angle);
            this.buffer.vertex(px, py);

            angle += angleStep;
        }
        this.buffer.endShape();
    }
    
    drawContent() {
        this.buffer.noStroke();
        let determinator = random(0,1);
        let from;
        let to;
        if (determinator < 0.3) {
            from = mainPalette["dark"];
            to = mainPalette["main"];
        } else if(determinator < 0.5) {
            from = mainPalette["main"];
            to = mainPalette["light"];  
        } else if(determinator < 0.8) {
            from = mainPalette["darkest"];
            to = mainPalette["dark"];  
        } 
        
        if (from && to){
            for (let i = 0; i < height; i++) {
                let n = map(i, 0,height, 0,1);
                let newCol = lerpColor(from, to, n);
                this.buffer.stroke(newCol);
                this.buffer.line(0, i, this.width, i);
            }
        } else {
            this.buffer.fill(mainPalette["main"]);
            this.buffer.rect(0,0, this.width, height);
        }
        
        this.buffer.noStroke();
        //draw light circles
        for (let i = 0; i < random(5,15); i++) {
            this.drawCircle(mainPalette["circLight2"], mainPalette["circLight3"], 
                            mainPalette["circLight1"], random(0, this.width), 
                            random(0, 2*(height/3)), random(10, 80), true)
        }
        for (let i = 0; i < random(5,10); i++) {
            this.drawCircle(mainPalette["circLight2"], mainPalette["circLight3"], 
                            mainPalette["circLight1"], random(0, this.width), 
                            random(2*(height/3), height), random(5, 40), true)
        }
        //draw dark circles
        for (let i = 0; i < random(10,30); i++) {
            this.drawCircle(mainPalette["circDark3"], mainPalette["circDark1"], 
                       mainPalette["circDark2"], random(0, this.width), 
                       random(height/2, 7*(height/8)), random(5, 50), false)
        }
        for (let i = 0; i < random(10,30); i++) {
            this.drawCircle(mainPalette["circDark3"], mainPalette["circDark1"], 
                       mainPalette["circDark2"], random(0, this.width), 
                       random(0, height), random(5, 50), false)
        }
    }

    display(x) {
        image(this.buffer, x, 0);
    }
}

class SpiralCircle {
    constructor(cx, cy, col, maxRadius, radiusStep, angleStep) {
        this.cx = cx;
        this.cy = cy;
        this.col = col;
        this.maxRadius = maxRadius;
        this.radiusStep = radiusStep;
        this.angleStep = angleStep;

        this.size = 2*maxRadius;
        this.buffer = createGraphics(width, height);
        this.buffer.translate(this.size / 2, this.size / 2);
        let speed = map(windSpeed, 0, 100, 0,1);
        this.rotationSpeed = random(-speed, speed);
        this.drawSpiralCircle();
    }

    drawSpiralCircle() {
        this.buffer.noFill();
        this.buffer.stroke(this.col);
        this.buffer.strokeWeight(random(1, 1.5));

        let angle = 0;
        this.buffer.beginShape();

        while (angle < TWO_PI * 20) {
            let r = this.radiusStep * angle;
            if (r > this.maxRadius) break;
            let px = r * cos(angle);
            let py = r * sin(angle);
            this.buffer.vertex(px, py);

            angle += this.angleStep;
        }
        this.buffer.endShape();
    }
}


class Cloud {
    constructor(count) {
        this.count = count;
        this.buffer = createGraphics(width, height); //chnage width and height
    }
    drawCloud() {
        for (let i = 0; i < this.count; i++) {
            //implement later qwq im tired rn 
        }
    }

}

function setup() {
    createCanvas(windowWidth, windowHeight);
    navigator.geolocation.getCurrentPosition(success, error);
    rez1 = 0.005; // default 0.002, 0.001 for no cloud, 0.006 for 100% cloud
    bgBuffer = createGraphics(width, height);
    sunDrawn = false;

}

function success(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&&units=imperial&appid=13b9f84998168627846a51bb3a9dfb10`;    
    loadJSON(apiUrl, retreiveWeather);
}

function error() {
    console.log("Unable to retrieve your location. Permission denied?");
}

function retreiveWeather(data) {
    temp = data.main.temp;
    // temp = 30;
    humidity = data.main.humidity;
    group = data.weather[0].main;
    // group = "Atmosphere"; 
    des = data.weather[0].description;
    // des = "raining very hard"
    windSpeed = data.wind.speed;
    // windSpeed = 30;
    precipitation = data.rain ? data.rain['1h'] : 0; 
    // precipitation = 60;
    clouds = data.clouds.all;
    // clouds = 25;
    snow = data.snow ? data.snow['1h'] : 0; 
    // snow = 50;
    city = data.name; 

    let tempG = map(temp, -30,150, 230,70);
    let tempB = map(temp, -30,150, 210,0);
    // console.log(tempR, tempG, tempB);
    mainPalette["temp"] = color(255, tempG, tempB);

    if (group == "Thunderstorm") { 
        mainPalette["main"] = color(14, 75, 173);
        mainPalette["light"] = color(123, 116, 227); 
        mainPalette["dark"] = color(26, 26, 97);
        mainPalette["darkest"] = color(4, 4, 46);
        mainPalette["circDark1"] = color(4, 41, 222);
        mainPalette["circDark2"] = color(0, 0, 105);
        mainPalette["circDark3"] = color(0, 0, 28);
        mainPalette["circLight1"] = color(255, 243, 148);
        mainPalette["circLight2"] = color(255, 183, 15);
        mainPalette["circLight3"] = color(199, 133, 0);
        mainPalette["des"] = color(255, 252, 227);

        windCol = color(235, 249, 252);
    }
    else if (group == "Drizzle") { 
        mainPalette["main"] = color(166, 161, 94); 
        mainPalette["light"] = color(240, 250, 175);
        mainPalette["dark"] = color(9, 133, 63);
        mainPalette["darkest"] = color(3, 76, 60);
        mainPalette["circDark1"] = color(242, 41, 115);
        mainPalette["circDark2"] = color(194, 6, 62);
        mainPalette["circDark3"] = color(89, 7, 32);
        mainPalette["circLight1"] = color(245, 222, 208);
        mainPalette["circLight2"] = color(191, 112, 67);
        mainPalette["circLight3"] = color(237, 160, 114);
        mainPalette["des"] = color(232, 255, 227);

        windCol = color(11, 92, 57);
    }
    else if (group == "Rain") { 
        mainPalette["main"] = color(112, 128, 36); 
        mainPalette["dark"] = color(39, 59, 9);
        mainPalette["light"] = color(163, 191, 98);
        mainPalette["darkest"] = color(0, 36, 0);
        mainPalette["circDark1"] = color(72, 120, 0);
        mainPalette["circDark2"] = color(65, 71, 16);
        mainPalette["circDark3"] = color(48, 54, 5);
        mainPalette["circLight1"] = color(230, 208, 245);
        mainPalette["circLight2"] = color(125, 93, 201);
        mainPalette["circLight3"] = color(190, 143, 255);
        mainPalette["des"] = color(232, 255, 227);

        windCol = color(224, 255, 217);
    }
    else if (group == "Snow") { 
        mainPalette["main"] = color(206, 249, 242);
        mainPalette["dark"] = color(155, 181, 212);
        mainPalette["light"] = color(240, 253, 255);
        mainPalette["darkest"] = color(134, 121, 176);
        mainPalette["circDark1"] = color(214, 202, 152);
        mainPalette["circDark2"] = color(109, 149, 168);
        mainPalette["circDark3"] = color(78, 93, 145);
        mainPalette["circLight1"] = color(230, 208, 245);
        mainPalette["circLight2"] = color(179, 171, 255);
        mainPalette["circLight3"] = color(248, 247, 255);
        mainPalette["des"] = color(64, 60, 128);

        windCol = color(29, 147, 194);
    }
    else if (group == "Atmosphere") { 
        mainPalette["main"] = color(219, 173, 106);
        mainPalette["dark"] = color(188, 138, 85); 
        mainPalette["darkest"] = color(135, 95, 53); 
        mainPalette["light"] = color(240, 223, 146);
        mainPalette["circDark1"] = color(98, 131, 149);
        mainPalette["circDark2"] = color(52, 87, 115);
        mainPalette["circDark3"] = color(37, 49, 59);
        mainPalette["circLight1"] = color(255, 243, 191);
        mainPalette["circLight2"] = color(179, 171, 255);
        mainPalette["circLight3"] = color(248, 247, 255);
        mainPalette["des"] = color(255, 252, 227);

        windCol = color(255, 246, 230);
    }
    else if (group == "Clouds") {
        mainPalette["main"] = color(138, 160, 218); 
        mainPalette["dark"] = color(113, 122, 175);
        mainPalette["light"] = color(187, 213, 246);
        mainPalette["darkest"] = color(114, 109, 128); 
        mainPalette["circDark1"] = color(98, 95, 99);
        mainPalette["circDark2"] = color(100, 72, 135);
        mainPalette["circDark3"] = color(26, 17, 69);
        mainPalette["circLight1"] = color(194, 237, 235);
        mainPalette["circLight2"] = color(255, 209, 145);
        mainPalette["circLight3"] = color(248, 247, 255);
        mainPalette["des"] = color(219, 217, 255);

        windCol = color(255, 246, 230);
    }
    else if (group == "Clear") { 
        mainPalette["main"] = color(68, 229, 231); 
        mainPalette["dark"] = color(74, 143, 231);
        mainPalette["darkest"] = color(74, 109, 231); 
        mainPalette["light"] = color(115, 251, 211);
        mainPalette["circDark1"] = color(113, 88, 214);
        mainPalette["circDark2"] = color(72, 52, 153);
        mainPalette["circDark3"] = color(23, 23, 117);
        mainPalette["circLight1"] = color(255, 254, 173);
        mainPalette["circLight2"] = color(255, 191, 64);
        mainPalette["circLight3"] = color(255, 249, 237);
        mainPalette["des"] = color(219, 255, 254);

        windCol = color(255, 246, 230);
    }

    if (precipitation) {
        let startY = random(-2*height, -100);
        let rainCount = map(precipitation, 0,100, 0,300);
        for (let i = 0; i < rainCount; i++) {
            raindrops.push(new RainDrop(random(0, width), startY, random(5,20)));
        }
    }

    if (snow) {
        let startY = random(-2*height, -100);
        let snowCount = map(snow, 0,100, 0,200);
        let size = map(snow, 0,100, 0,15);
        for (let i = 0; i < snowCount; i++) {
            snowFall.push(new Snow(random(0, width), startY, random(size-10,size+10)));
        }
    }

    if (clouds) {
        let count = floor(map(clouds, 0,100, 0,10));
        for (let c = 0; c < count; c++) {
            let circC = random(3,6);
            let newCloud = new Cloud(circC);
            cloudsArr.push(newCloud);
        }
    }

    for (let c = 0; c < random(6,10); c++) {
        let x = random(100, width - 100);
        let y = random(100, height - 100);
        let d = random(0,1); 
        let col;
        if (d < 0.3) {
            col = mainPalette["circLight1"];
        } else if (d < 0.6) {
            col = mainPalette["circLight2"];
        } else {
            col = mainPalette["circLight3"];
        }

        let maxRadius = random(80,170);
        let radiusStep = random(0.4, 1);
        let angleStep = random(0.1, 0.7);
        let newSpiral = new SpiralCircle(x, y, col, maxRadius, radiusStep, angleStep);
        newSpiral.drawSpiralCircle();
        spiralsCircles.push(newSpiral);
    }

    drawBg();
}

function draw() {
    if (bgBuffer) {
        image(bgBuffer, 0,0);
    } else {
        console.log("no bg found");
    }
    if (precipitation) {
        for (let i = 0; i < raindrops.length; i++) {
            raindrops[i].update();
            raindrops[i].display();
        }
    }
    if (snow) {
        for (let i = 0; i < snowFall.length; i++) {
            snowFall[i].update();
            snowFall[i].display();
        }
    }
    // drawTempLines();

    for (let i = 0; i < spiralsCircles.length; i++) {
        let spiral = spiralsCircles[i];
        push();
        translate(spiral.cx, spiral.cy);
        rotate(frameCount * spiral.rotationSpeed);
        image(spiral.buffer, -spiral.size/2, -spiral.size/2); //offset for centered rotation
        pop();
    }
}

function drawBg() {
    let lastX = 0;
    let max = 15;
    for (let count = 0; count < 15; count++) {
        let w;
        if (count == max-2) {
            w = width - lastX;
        } else {
            w = random(width/18, width/10);
        }
        let stripe = new Stripe(w);
        stripes.push(stripe);
        bgBuffer.image(stripe.buffer, lastX, 0);
        lastX += stripe.getWidth(); 
    }

    for (let count = 0; count < cloudsArr.length; count++) {
        bgBuffer.image(cloudsArr[count].buffer, random(0,width), random(height/4, height/2));
    }

    push();
    bgBuffer.noStroke();
    bgBuffer.fill(mainPalette["des"]);
    bgBuffer.textSize(width/60);
    bgBuffer.textFont('Verdana');
    let textwidth = textWidth(des + ", " + city);
    bgBuffer.text(des + ", " + city, width-textwidth*3, height-50);
    pop();
    drawTempLines();
}


function drawTempLines() {
    if (!mainPalette["temp"] || typeof mainPalette["temp"] !== 'object') {
        console.log("Temperature color not available, using default");
        bgBuffer.stroke(255);
    } else {
        let r = red(mainPalette["temp"]);
        let g = green(mainPalette["temp"]);
        let b = blue(mainPalette["temp"]);
        bgBuffer.stroke(color(r, g, b, 200));
    }

    bgBuffer.noFill();
    let y = random(2*(height/3), 3*(height/4));
    
    for (let i = 0; i < 10; i++) {
        let baseY = y+(i*10);
        bgBuffer.strokeWeight(random(0.8, 4));
        bgBuffer.beginShape();
        //duplicate the first point
        bgBuffer.curveVertex(0, baseY);
        bgBuffer.curveVertex(0, baseY);
        //midpoint
        bgBuffer.curveVertex(width / 5, baseY + random(-50, 50));
        bgBuffer.curveVertex(2*width / 5, baseY + random(-50, 50));
        bgBuffer.curveVertex(3*width / 5, baseY + random(-50, 50));
        bgBuffer.curveVertex(4*width / 5, baseY + random(-50, 50));
        //duplicate the last point
        bgBuffer.curveVertex(width, baseY);
        bgBuffer.curveVertex(width, baseY);
        bgBuffer.endShape();
    }
}


// function drawCloud() {
//     bgBuffer.noStroke();
//     // let cloudCount = floor(map(clouds, 0,100, 0,10));
//     // for (let i = 0; i < cloudCount; i++) {
//     //     // bgBuffer.circle(0,0,100);
//     //     let x = random(0, width);
//     //     let y = random(height/4, height/2);
//     //     for (let circ = 0; circ < random(3,6); circ++) {
//     //         console.log("circle");
//     //         bgBuffer.circle(x+random(0,100), y+random(-50,50), 80);
//     //     }
//     // }


//     for (let i = 0; i < cloudsArr.length; i++) {
//         let curr = cloudsArr[i];
//         let x = random(0, width);
//         let y = random(height/4, height/2);
//         bgBuffer.image()
//     }
// }