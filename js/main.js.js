
var canvas = document.getElementById("webgl-canvas");
var gl = canvas.getContext("webgl2");
if (!gl) console.log("Not ennable to run WebGL2 with this browser");

window.onresize = function() {
    app.resize(window.innerWidth, window.innerHeight);
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var app = PicoGL.createApp(canvas)
.clearColor(0.0, 0.0, 0.0, 1.0)
.clear();


const vert = `
#version 300 es
precision highp float;

in vec2 pos;
uniform float height;
uniform float dx;

void main() {
    if (pos.y != -1.)
        gl_Position = vec4(pos.x + dx, 2. * height - 1., 0, 1);
    else
        gl_Position = vec4(pos.x + dx, pos.y, 0, 1);
}`

const frag = `
#version 300 es
precision highp float;

uniform float height;

out vec4 color;
void main() {
    color = vec4(height, 1.-height, height+0.3, 1.);
}`

let n = 250;

let settings = {
    n: 250
}

webglLessonsUI.setupUI(document.querySelector('#ui'), settings, [
    {type: 'slider', key: 'n',  name: 'n * 10',   min: 2,    max: 1000, step: 1, slide: (event, ui) => {
        settings.n = ui.value;
        console.log(`speed: ${settings.n}`);
    }}
]);

var quadPositions = app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
    -1.0,                   1.0, 
    -1.0 + 2.0/settings.n,  1.0, 
    -1.0,                  -1.0, 
    -1.0,                  -1.0, 
    -1.0 + 2.0/settings.n,  1.0, 
    -1.0 + 2.0/settings.n, -1.0
]));
var vertexArray = app.createVertexArray();
vertexArray.vertexAttributeBuffer(0, quadPositions);

let a = Array.from({length: n}, () => Math.random());

// function partial_Selection_Sort(A, n, drawCall, step) {
function partial_Selection_Sort(A, step) {
    let [min, pos] = [A[step], step];
    for(let i=step; i<A.length; i++) {
        if (A[i] < min)
            [min, pos] = [A[i], i];
    }
    let temp = A[step];
    A[step] = min;
    A[pos] = temp;
}

function reaload(n, program) {
    var quadPositions = app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
        -1.0,  1.0, 
        -1.0 + 2.0/n,  1.0, 
        -1.0, -1.0, 
        -1.0, -1.0, 
        -1.0 + 2.0/n,  1.0, 
        -1.0 + 2.0/n,  -1.0
    ]));
    var vertexArray = app.createVertexArray();
    vertexArray.vertexAttributeBuffer(0, quadPositions);
    let drawCall = app.createDrawCall(program, vertexArray);
    let a = Array.from({length: n}, () => Math.random());

    return [drawCall, a]
}

let update = 0;

app.createPrograms([vert, frag]).then(([program]) => {

    let drawCall = app.createDrawCall(program, vertexArray);

    let step = 0;
    let curr_n = settings.n;
    function draw() {
        if (update == 1) {
            app.clear();
            [drawCall, a] = reaload(settings.n, program);
            curr_n = settings.n
            step = 0;
        }

        if (step < settings.n) {
            partial_Selection_Sort(a, step);
            app.clear();
            for(let i=0; i<curr_n; i++) {
                drawCall.uniform('dx', 2*i/curr_n)
                drawCall.uniform('height', a[i]);
                drawCall.draw();
            }
            step += 1;
        }
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

});

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'Space':
            // if (update == 1) update = 0;
            // else update = 1;
            update = 1;
            console.log(update);
            break;
    }
})

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'Space':
            update = 0;
            console.log(update);
            break;
    }
})