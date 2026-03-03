/* =========================================
   LIVE TCP PACKET SNIFFER - FINAL JS
========================================= */

const canvas = document.getElementById("networkCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* =========================================
   CINEMATIC NETWORK BACKGROUND
========================================= */

class Node {
    constructor(depth = 1) {
        this.depth = depth;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.15 * depth;
        this.vy = (Math.random() - 0.5) * 0.15 * depth;
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2 * this.depth, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,255,255,0.8)";
        ctx.fill();
    }
}

const nodes = [];
const NODE_COUNT = 40;

// Depth layering for cinematic feel
for (let i = 0; i < NODE_COUNT; i++) {
    let depth = Math.random() > 0.5 ? 1 : 0.6;
    nodes.push(new Node(depth));
}

function connectNodes() {
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            let dx = nodes[i].x - nodes[j].x;
            let dy = nodes[i].y - nodes[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 170) {
                ctx.strokeStyle = `rgba(0,255,255,${0.3 - dist / 600})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }
    }
}

function drawEnergyCore() {
    let pulse = (Math.sin(Date.now() * 0.002) + 1) / 2;

    let gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        50,
        canvas.width / 2,
        canvas.height / 2,
        450
    );

    gradient.addColorStop(0, `rgba(255,0,60,${0.07 + pulse * 0.05})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

let scanY = 0;

function drawScanLine() {
    scanY += 0.6;
    if (scanY > canvas.height) scanY = 0;

    let gradient = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
    gradient.addColorStop(0, "rgba(0,255,255,0)");
    gradient.addColorStop(0.5, "rgba(0,255,255,0.1)");
    gradient.addColorStop(1, "rgba(0,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, scanY - 40, canvas.width, 80);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawEnergyCore();

    nodes.forEach(node => {
        node.move();
        node.draw();
    });

    connectNodes();
    drawScanLine();

    requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

/* =========================================
   PACKET SYSTEM LOGIC
========================================= */

const backendURL = "https://packet-sniffer-backend.onrender.com/packets";

let interval = null;

const landing = document.getElementById("landing");
const dashboard = document.getElementById("dashboard");
const startMonitoring = document.getElementById("startMonitoring");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");
const cleanWebsite = document.getElementById("cleanWebsite");
const apiStatus = document.getElementById("apiStatus");
const packetTable = document.getElementById("packetTable");

function checkAPI() {
    fetch(backendURL)
        .then(res => {
            if (res.ok) {
                apiStatus.textContent = "● API ONLINE";
                apiStatus.style.color = "#00ff88";
            }
        })
        .catch(() => {
            apiStatus.textContent = "● API OFFLINE";
            apiStatus.style.color = "#ff4c4c";
        });
}

function addPacketRow(data) {
    const row = packetTable.insertRow(0);
    const time = new Date().toLocaleTimeString();

    row.insertCell(0).innerText = data.src_ip;
    row.insertCell(1).innerText = data.src_port;
    row.insertCell(2).innerText = data.dst_ip;
    row.insertCell(3).innerText = data.dst_port;
    row.insertCell(4).innerText = time;

    if (packetTable.rows.length > 60) {
        packetTable.deleteRow(60);
    }
}

startMonitoring.onclick = () => {
    landing.classList.add("hidden");
    dashboard.classList.remove("hidden");

    checkAPI();

    interval = setInterval(() => {
        fetch(backendURL)
            .then(res => res.json())
            .then(data => addPacketRow(data))
            .catch(() => {});
    }, 1000);
};

stopBtn.onclick = () => {
    clearInterval(interval);
};

clearBtn.onclick = () => {
    packetTable.innerHTML = "";
};

cleanWebsite.onclick = () => {
    clearInterval(interval);
    packetTable.innerHTML = "";
    dashboard.classList.add("hidden");
    landing.classList.remove("hidden");
};