/* =============================
   CLEAN CYBER TOPOLOGY BACKGROUND
============================= */

const canvas = document.getElementById("networkCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const particleCount = 45;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#00f2ff";
        ctx.fill();
    }
}

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 180) {
                ctx.strokeStyle = "rgba(0,255,255," + (0.4 - distance / 450) + ")";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // subtle red edge tension
    let gradient = ctx.createLinearGradient(
        canvas.width * 0.75,
        0,
        canvas.width,
        0
    );

    gradient.addColorStop(0, "rgba(255,0,80,0)");
    gradient.addColorStop(1, "rgba(255,0,80,0.15)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let p of particles) {
        p.move();
        p.draw();
    }

    connectParticles();
    requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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