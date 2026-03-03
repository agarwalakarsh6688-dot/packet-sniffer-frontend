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
            apiStatus.style.color = "red";
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
            .catch(err => console.error(err));
    }, 1000);
};

stopBtn.onclick = () => {
    clearInterval(interval);
};

clearBtn.onclick = () => {
    document.getElementById("packetTable").innerHTML = "";
};

cleanWebsite.onclick = () => {
    clearInterval(interval);
    document.getElementById("packetTable").innerHTML = "";
    dashboard.classList.add("hidden");
    landing.classList.remove("hidden");
};