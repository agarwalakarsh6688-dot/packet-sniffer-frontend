const backendURL = "https://packet-sniffer-backend.onrender.com/packets";

let interval = null;

function addRow(data) {
    const table = document.getElementById("packetTable");
    const row = table.insertRow(0);

    row.insertCell(0).innerText = data.src_ip;
    row.insertCell(1).innerText = data.src_port;
    row.insertCell(2).innerText = data.dst_ip;
    row.insertCell(3).innerText = data.dst_port;
}

document.getElementById("startBtn").onclick = function () {
    if (!interval) {
        interval = setInterval(() => {
            fetch(backendURL)
                .then(res => res.json())
                .then(data => addRow(data))
                .catch(err => console.error(err));
        }, 1000);
    }
};

document.getElementById("stopBtn").onclick = function () {
    clearInterval(interval);
    interval = null;
};

document.getElementById("clearBtn").onclick = function () {
    document.getElementById("packetTable").innerHTML = "";
};