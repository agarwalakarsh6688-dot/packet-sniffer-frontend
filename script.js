const canvas = document.getElementById("networkCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let cols = 14;
let rows = 7;
let spacingX = canvas.width / cols;
let spacingY = canvas.height / rows;

let nodes = [];

class Node {
    constructor(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.offset = Math.random() * 1000;
    }

    update(time) {
        this.x = this.baseX + Math.sin(time + this.offset) * 2;
        this.y = this.baseY + Math.cos(time + this.offset) * 2;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#00f2ff";
        ctx.fill();
    }
}

function createGrid() {
    nodes = [];
    for (let i = 1; i < cols; i++) {
        for (let j = 1; j < rows; j++) {
            nodes.push(new Node(i * spacingX, j * spacingY));
        }
    }
}

createGrid();

function drawConnections() {
    ctx.strokeStyle = "rgba(0,255,255,0.3)";
    ctx.lineWidth = 1;

    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        let right = nodes[i + rows - 1];
        let bottom = nodes[i + 1];

        if (right) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(right.x, right.y);
            ctx.stroke();
        }

        if (bottom) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(bottom.x, bottom.y);
            ctx.stroke();
        }
    }
}

function animate(time = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🔥 Red Threat Glow
    let pulse = (Math.sin(time * 0.002) + 1) / 2;
    let gradient = ctx.createRadialGradient(
        canvas.width * 0.85,
        canvas.height * 0.6,
        50,
        canvas.width * 0.85,
        canvas.height * 0.6,
        400
    );

    gradient.addColorStop(0, `rgba(255,0,80,${0.15 + pulse * 0.1})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Nodes
    for (let node of nodes) {
        node.update(time * 0.002);
        node.draw();
    }

    drawConnections();
    requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    spacingX = canvas.width / cols;
    spacingY = canvas.height / rows;
    createGrid();
});

/* =============================
   PACKET MONITOR LOGIC
============================= */

const backendURL = "https://packet-sniffer-backend.onrender.com/packets";

let interval = null;

const landing = document.getElementById("landing");
const dashboard = document.getElementById("dashboard");
const startMonitoring = document.getElementById("startMonitoring");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");
const cleanWebsite = document.getElementById("cleanWebsite");
const apiStatus = document.getElementById("apiStatus");

function checkAPI() {
    fetch(backendURL)
        .then(res => {
            if (res.ok) {
                apiStatus.textContent = "● API Online";
                apiStatus.style.color = "#00ff88";
            }
        })
        .catch(() => {
            apiStatus.textContent = "● API Offline";
            apiStatus.style.color = "#ff4c4c";
        });
}

function addRow(data) {
    const table = document.getElementById("packetTable");
    const row = table.insertRow(0);
    const time = new Date().toLocaleTimeString();

    row.insertCell(0).innerText = data.src_ip;
    row.insertCell(1).innerText = data.src_port;
    row.insertCell(2).innerText = data.dst_ip;
    row.insertCell(3).innerText = data.dst_port;
    row.insertCell(4).innerText = time;

    if (table.rows.length > 50) {
        table.deleteRow(50);
    }
}

startMonitoring.onclick = () => {
    landing.classList.add("hidden");
    dashboard.classList.remove("hidden");

    checkAPI();

    interval = setInterval(() => {
        fetch(backendURL)
            .then(res => res.json())
            .then(data => addRow(data))
            .catch(() => {});
    }, 1000);
};

stopBtn.onclick = () => clearInterval(interval);

clearBtn.onclick = () => {
    document.getElementById("packetTable").innerHTML = "";
};

cleanWebsite.onclick = () => {
    clearInterval(interval);
    document.getElementById("packetTable").innerHTML = "";
    dashboard.classList.add("hidden");
    landing.classList.remove("hidden");
};