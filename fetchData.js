let lat;
let lon;
let bg;
let sunColor
let sunBorder = [];
let sunDrawn = false;
let bgBufferDrawn = false;
let mainPalette = {};
let windPart = [];
let windCol;

let temp;
let humidity;
let group;
let mainWeatherDes;
let windSpeed;
let precipitation;
let clouds;
let snow;
let rainPixel = [];
let snowPixel = [];
let humPixel = [];
let bgBuffer;

let rez1;
let z = 0;

// class rainDrop {
//     constructor(x, y, z, rez1) {
//         this.respawn(x, y, z, rez1);
//     }

//     update() {
//         let n1 = noise(this.x*this.rez1, this.y*this.rez1, this.z*this.rez1);
//         let dx = cos(n1) * 2;
//         let dy = sin(n1) * 2;
//         this.x += dx;
//         this.y += dy;
        
//         if (this.rain.length > 2) {
//             this.rain.splice(0,1);
//         }
//         this.rain.push(createVector(this.x, this.y));

//         if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
//             this.respawn(random(width), random(height), this.rez1);
//         } else { 
//             this.display(); 
//         }
//     }

//     respawn(x, y, z, rez1) {
//         this.x = x;
//         this.y = y;
//         this.z = z;
//         this.rez1 = rez1;
//         this.rain = [];
//     }

//     display() {
//         noStroke();
//         fill(color("green"));
//         for (let i = 0; i < this.rain.length; i++) {
//             let r = this.rain[i];
//             circle(r.x, r.y, 1);
//         }
//     }
// }

class rainDrop {
    constructor(x, y, weight) {
        this.reset(x, y, weight);
        this.dy = random(precipitation/10, (precipitation/10)+10);
    }
    reset(x, y, weight) {
        this.x = x;
        this.y = y;
        this.weight = weight;
    }
    update() {
        // let dy = random(0, height/2);
        // let dx = 0; 
        // if (windSpeed) {
        //     let determinator = random(0,1);
        //     if (determinator > 0.4) {
        //         dx = map(windSpeed, 0,100, 0,20);
        //     }
        // }
        this.y += this.dy;
        // this.x += dx;

        if (this.y > height) {
            this.reset(random(0, width), -100, this.weight);
        }
    }
    display() {
        noFill();
        strokeWeight(this.weight);
        stroke(255, 255, 255, 90);
        line(this.x, this.y, this.x, this.y + random(5, 15));
    }
}

class Snow {
    constructor(x, y, size) {
        this.reset(x, y, size);
        this.dy = random(snow/10, (snow/10)+10);
    }
    reset(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }
    update() {
        // let dy = random(0, 10);
        // let dx = 0; 
        // if (windSpeed) {
        //     let determinator = random(0,1);
        //     if (determinator > 0.4) {
        //         dx = map(windSpeed, 0,100, 0,20);
        //     }
        // }
        this.y += this.dy;
        // this.x += dx;

        if (this.y > height) {
            this.reset(random(0, width), random(-100, -10), this.size);
        }
    }
    display() {
        fill("white");
        noStroke();
        circle(this.x, this.y, this.size);
    }
}


class WindParticles {
    constructor(windLine, windCol) {
        this.reset(windLine, windCol);
    }

    reset(windLine, windCol) {
        this.x = random(width);
        this.y = random(height);
        this.history = [];
        this.maxlen = int(random(50,150));
        this.windLine = windLine;
        this.windCol = windCol;
    }
    update() {
        let angle = noise(this.x*0.001, this.y*0.001) * TWO_PI * 2;
        // let angle = noise(this.x*rez1, this.y*rez1, 0);
        let speed = map(windSpeed, 0,100, 1,2);
        let dx = cos(angle) * speed;
        let dy = sin(angle) * speed;
        this.x += dx;
        this.y += dy;

        this.history.push(createVector(this.x, this.y));
        if (this.history.length > this.maxlen) {
            this.history.splice(0,1);
        }

        if (this.x < -100 || this.x > width+100 || this.y < -100 || this.y > height+100) {
            // this.history.splice(0,1);
            this.reset(this.windLine, this.windCol);
        }
        // if (this.history.length == 0){
        //     this.reset(this.windLine, this.windCol);
        // }
    }

    display() {
        beginShape();
        noFill();
        let w = map(this.windLine, 0, 300, 0.5, 1.2);
        strokeWeight(random(w, w+0.3));
        let len = this.history.length;
        for (let i = 0; i < len; i++) {
            let v = this.history[i];
            let a = map(i, 0,len, 80, 255);
            let r = red(this.windCol);
            let g = green(this.windCol);
            let b = blue(this.windCol);
            stroke(color(r, g, b, a));
            point(v.x, v.y);
        }
        endShape();
    }
}

// ------------------------------------------------------

function setup() {
    createCanvas(windowWidth, windowHeight);
    navigator.geolocation.getCurrentPosition(success, error);
    rez1 = 0.005; // default 0.002, 0.001 for no cloud, 0.006 for 100% cloud
    bgBuffer = createGraphics(width, height);
    sunDrawn = false;
}

function success(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&&units=imperial&appid=13b9f84998168627846a51bb3a9dfb10`;    
    loadJSON(apiUrl, retreiveWeather);
}

function error() {
    console.log("Unable to retrieve your location. Permission denied?");
}

function retreiveWeather(data) {
    temp = data.main.temp;
    // temp = 50;
    humidity = data.main.humidity;
    group = data.weather[0].main;
    // group = "Thunderstorm";
    // mainWeatherDes = data.weather[0].description;
    windSpeed = data.wind.speed;
    // windSpeed = 100;
    precipitation = data.rain ? data.rain['1h'] : 0;
    // precipitation = 50;
    clouds = data.clouds.all;
    snow = data.snow ? data.snow['1h'] : 0;
    // snow = 100;

    if (group == "Thunderstorm") { 
        mainPalette["main"] = color(55, 122, 140); 
        mainPalette["sec"] = color(23, 63, 87);
        mainPalette["trd"] = color(90, 103, 107);
        windCol = color(235, 249, 252);
    }
    else if (group == "Drizzle") { 
        mainPalette["main"] = color(136, 219, 196); 
        mainPalette["sec"] = color(82, 158, 125);
        mainPalette["trd"] = color(154, 173, 171);
        windCol = color(11, 92, 57);
    }
    else if (group == "Rain") { 
        mainPalette["main"] = color(123, 209, 131); 
        mainPalette["sec"] = color(48, 117, 34);
        mainPalette["trd"] = color(134, 140, 112);
        windCol = color(224, 255, 217);
    }
    else if (group == "Snow") { 
        mainPalette["main"] = color(193, 239, 245);
        mainPalette["sec"] = color(174, 194, 192);
        mainPalette["trd"] = color(255, 253, 247);
        windCol = color(29, 147, 194);
    }
    else if (group == "Atmosphere") { 
        mainPalette["main"] = color(245, 212, 174);
        mainPalette["sec"] = color(130, 117, 101); 
        mainPalette["trd"] = color(255, 140, 173);
        windCol = color(255, 246, 230);
    }
    else if (group == "Clouds") {
        mainPalette["main"] = color(235, 251, 255); 
        mainPalette["sec"] = color(111, 133, 126);
        mainPalette["trd"] = color(159, 224, 199);
        sunColor = color(232, 193, 51);
        sunBorder.push(color(194, 116, 39));
        sunBorder.push(color(255, 246, 207));
        windCol = color(255, 246, 230);
    }
    else if (group == "Clear") { 
        mainPalette["main"] = color(0, 200, 255); 
        mainPalette["sec"] = color(0, 96, 214);
        mainPalette["trd"] = color(135, 237, 207);
        sunColor = color(255, 208, 40);
        sunBorder.push(color(219, 146, 0));
        sunBorder.push(color(255, 246, 207));
        windCol = color(255, 246, 230);
    }

    rez1 = map(clouds, 0,100, 0.001,0.005);
    let g = map(temp, -50, 150, 230, 20);
    let b = map(temp, -50, 150, 100, 20);
    mainPalette["temp"] = color(220, g, b); 
    mainPalette["humidity"] = color(175, 237, 237);

    let windLine = floor(map(windSpeed, 0, 50, 0, 300));
    for (let i = 0; i < windLine; i++) {
        windPart.push(new WindParticles(windLine, windCol));
    }

    if (precipitation) {
        let startY = random(-height*2, -50);
        pCount = map(precipitation, 0,100, 100,200);
        for (let i = 0; i < pCount; i++) {
            rainPixel.push(new rainDrop(random(0, width), startY, random(0.8, 2)));
        }
    }

    if (snow) {
        let startY = random(-height*2, -50);
        sCount = map(snow, 0,100, 0,200);
        for (let i = 0; i < sCount; i++) {
            snowPixel.push(new Snow(random(0, width), startY, random(5, 15)));
        }
    }
    

    drawBg();

    redraw();
    // loop();
}

function draw() {
    if (bgBuffer) {
        image(bgBuffer, 0, 0);
    } else {
        console.log("No buffer");
    }
    drawDynamicElements();
    
    z += 0.01;
}

function drawBg() {
    bgBuffer.noStroke();
    let humidityRate = map(humidity, 0,100, 0,0.1);
    for (x=0; x<width; x++) {
        for (y=0; y<height; y++){
            let n1 = noise(x*rez1, y*rez1, 0);
            let col;
            if (n1 < 0.25){
                col = mainPalette["trd"]; 
            }else if (n1 < 0.26){
                col = mainPalette["temp"];
            }else if (n1 < 0.27){
                col = mainPalette["sec"];
            } else if (n1 < 0.3){
                col = mainPalette["main"];
            } else if (n1 < 0.3+humidityRate) {
                col = mainPalette["humidity"];
                if (precipitation) {
                    humPixel.push(createVector(x,y));
                }
            } else if (n1 < 0.43){
                col = mainPalette["temp"];
            } else if (n1 < 0.50){
                col = mainPalette["trd"]; 
            } else if (n1 < 0.60){
                col = mainPalette["sec"]; 
            } else {
                col = mainPalette["main"]; 
            }

            bgBuffer.fill(col);
            bgBuffer.rect(x,y, 1,1);
        }
    }

    console.log(group);
    if (group == "Clear" || group == "Clouds") {
        drawSun();
    }
}

function drawDynamicElements() {
    for (let w = 0; w < windPart.length; w++) {
        windPart[w].update();
        windPart[w].display();
    }
    for (let r = 0; r < rainPixel.length; r++) {
        rainPixel[r].update();
        rainPixel[r].display();
    }
    for (let r = 0; r < snowPixel.length; r++) {
        snowPixel[r].update();
        snowPixel[r].display();
    }
    for (let vector = 0; vector < humPixel.length; vector++) {
        let n = noise(x*rez1, y*rez1, 0);
        drawRain(vector.x, vector.y, n);
    }
}


function drawSun() {
    bgBuffer.push();
    
    let r = random(width/14, width/10);
    let cx = random(r, width-r);
    let cy = random(r, height/2 - r)
    let spikes = floor(random(20,30));
    bgBuffer/strokeWeight(5);
    bgBuffer.translate(cx, cy);
    bgBuffer.fill(sunColor);

    for (s = 0; s < spikes; s++) {
        bgBuffer.strokeWeight(random(1,3));
        let ran = random(0,1);
        if (ran < 0.4) { 
            bgBuffer.stroke(sunBorder[0]); 
        }
        else if (ran < 0.7) {
            bgBuffer.stroke(sunBorder[1]);
        } else {
            bgBuffer.stroke(sunColor);
        }
        //edge of the sun
        let angle1 = map(s, 0, spikes, 0, TWO_PI);
        let angle2 = map(s+0.6, 0, spikes, 0, TWO_PI);
        let angleMid = (angle1+angle2)/2;

        let x1 = cos(angle1) * r;           
        let y1 = sin(angle1) * r;

        let x2 = cos(angle2) * r;           
        let y2 = sin(angle2) * r;

        let tipLen = map(clouds, 0,100, 200, 20)
        let tipR = r + random(tipLen, tipLen+150);
        let tipX = cos(angleMid) * tipR;
        let tipY = sin(angleMid) * tipR;

        //spikes 
        bgBuffer.beginShape();
        let segment = random(12, 20);
        for (c = 0; c <= segment; c++){
            let l = c/segment;
            let xLeft = lerp(x1, tipX, l);
            let yLeft = lerp(y1, tipY, l);
            let n = noise(s*0.4, l*5);
            let offset = map(n, 0, 1, -10, 10);
            let perpAngle = angleMid + HALF_PI;
            xLeft += cos(perpAngle) * offset;
            yLeft += sin(perpAngle) * offset;
            bgBuffer.curveVertex(xLeft, yLeft);
        }

        for (c = segment; c >= 0; c--) {
            let l = c/segment;
            let xRight = lerp(tipX, x2, l);
            let yRight = lerp(tipY, y2, l);
            let n = noise(s*0.4, l*5);
            let offset = map(n, 0, 1, -10, 10);
            let perpAngle = angleMid + HALF_PI;
            xRight += cos(perpAngle) * offset;
            yRight += sin(perpAngle) * offset;
            bgBuffer.curveVertex(xRight, yRight);
        }
        bgBuffer.endShape(CLOSE);
    }

    bgBuffer.beginShape();
    bgBuffer.stroke(sunBorder[0]);
    bgBuffer.strokeWeight(3,5);
    bgBuffer.rotate(random(0, PI));
    for (i = 0; i <= PI*2; i += 0.3) { 
        let n = noise(cos(i), sin(i));
        let rOffset = map(n, 0,1, -18,18);
        let thisR = r + rOffset; 
        
        let x = cos(i) * thisR;
        let y = sin(i) * thisR;
        bgBuffer.curveVertex(x,y);
    }
    bgBuffer.endShape(CLOSE);
    bgBuffer.pop();
}

function drawRain(x, y, noise) {
    
}
