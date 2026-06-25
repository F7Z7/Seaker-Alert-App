// import {Chart} from "chart.js";

// import {Chart} from "chart.js";

window.addEventListener('load', () => {

    const now = new Date()
    const today = now.toLocaleDateString()
    document.getElementById("date").innerHTML = today
    const hrs = now.getHours()
    const min = now.getMinutes()
    const sec = now.getSeconds()
    document.getElementById("time").innerHTML = `${hrs}:${min}:${sec}`;
    let logDropdown = document.getElementById("logs")
    if (logDropdown.value === "0") {
        document.getElementById("log-body").innerHTML = `
<tr>
<td colspan="7" class="empty">
No logs selected
</td>
</tr>
`;
    }


    async function latestData() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/latest');

            if (!response.ok) {
                console.log("HTTP Error:", response.status);
                return;
            }

            const data = await response.json();

            // Uptime
            document.getElementById("uptime").innerText = `${data.uptime_hours} h`;
            // CPU
            document.getElementById("cpu-pct").innerText = data.cpu_usage;
            document.getElementById("cpu-cores").innerText = data.cpu_cores;
            document.getElementById("cpu-threads").innerText = data.cpu_threads;

            applyColor(document.getElementById("cpu-pct"), document.getElementById("cpu-bar"), data.cpu_usage);

// Memory
            document.getElementById("mem-pct").innerText = data.memory_percentage;

            document.getElementById("mem-total").innerText = `${data.memory_total_gb} GB`;

            document.getElementById("mem-used").innerText = `${data.memory_used_gb} GB`;

            document.getElementById("mem-avail").innerText = `${data.memory_available_gb} GB`;

            applyColor(document.getElementById("mem-pct"), document.getElementById("mem-bar"), data.memory_percentage);

// Disk
            document.getElementById("disk-pct").innerText = data.disk_percentage;

            document.getElementById("disk-total").innerText = `${data.disk_total_gb} GB`;

            document.getElementById("disk-used").innerText = `${data.disk_used_gb} GB`;

            document.getElementById("disk-free").innerText = `${data.disk_free_gb} GB`;

            applyColor(document.getElementById("disk-pct"), document.getElementById("disk-bar"), data.disk_percentage);

        } catch (error) {
            console.error("Error fetching latest data:", error);
        }
    }

    async function start() {
        await latestData()
        setInterval(latestData, 1000)
    }

    start()
    document.getElementsByClassName("refresh-btn")[0].addEventListener("click", () => {
        latestData()
    })

    function updateClock() {
        const now = new Date();

        document.getElementById("date").innerText = now.toLocaleDateString();

        document.getElementById("time").innerText = now.toLocaleTimeString();
    }

    updateClock();
    setInterval(updateClock, 1000);


    logDropdown.addEventListener("change", () => {
        let count = logDropdown.value
        if (count === "0") {
            document.getElementById("log-body").innerHTML = `
<tr>
<td colspan="7" class="empty">
No logs selected
</td>
</tr>
`;
            return;
        }
        document.getElementById("log-body").innerHTML = "";
        let loadingScreen = `<tr>
                <td colspan="7" class="empty" id="loading-screen">
                    <svg class="loader" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                        <circle fill="#FFEFED" stroke="#FFEFED" stroke-width="2" r="15" cx="40" cy="65">
                            <animate attributeName="cy" calcMode="spline" dur="2"
                                     values="65;135;65;"
                                     keySplines=".5 0 .5 1;.5 0 .5 1"
                                     repeatCount="indefinite" begin="-.4"/>
                        </circle>

                        <circle fill="#FFEFED" stroke="#FFEFED" stroke-width="2" r="15" cx="100" cy="65">
                            <animate attributeName="cy" calcMode="spline" dur="2"
                                     values="65;135;65;"
                                     keySplines=".5 0 .5 1;.5 0 .5 1"
                                     repeatCount="indefinite" begin="-.2"/>
                        </circle>

                        <circle fill="#FFEFED" stroke="#FFEFED" stroke-width="2" r="15" cx="160" cy="65">
                            <animate attributeName="cy" calcMode="spline" dur="2"
                                     values="65;135;65;"
                                     keySplines=".5 0 .5 1;.5 0 .5 1"
                                     repeatCount="indefinite" begin="0"/>
                        </circle>
                    </svg>

                    <span id="loading-text">Loading<span class="dots"></span></span>

                </td>

            </tr>`
        document.getElementById('log-body').innerHTML = loadingScreen

        showRecentlogs(count);
    })

    async function showRecentlogs(defaultCount = 10) {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/history', {
                method: "POST", headers: {
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({count: defaultCount})
            });
            console.log(defaultCount)

            if (!response.ok) {
                console.log("HTTP Error:", response.status);
                return;
            }

            const data = await response.json();

            document.getElementById("loading-screen").remove();
            let row
            let table = document.getElementById("log-body")
            data.forEach((item) => {
                row = `<tr>
    <td>${item.timestamp}</td>
    <td>${item.cpu_usage}</td>
    <td>${item.memory_percentage}</td>
    <td>${item.disk_percentage}</td>
    <td>${item.memory_used_gb}</td>
    <td>${item.disk_free_gb}</td>
    <td>${item.uptime_hours}</td>
</tr>`;

                table.innerHTML += row

            })


        } catch (error) {
            console.error("Error fetching latest data:", error);
        }
    }

    // showRecentlogs() no more needed

    async function setThresholds() {
        const response = await fetch("http://127.0.0.1:5000/api/thresholds");

        const data = await response.json();

        document.getElementById("cpu-threshold").value = data.cpu;

        document.getElementById("memory-threshold").value = data.memory;

        document.getElementById("disk-threshold").value = data.disk;
    }

    setThresholds();

    document.getElementById("save-threshold-btn").addEventListener("click", saveThresholds)

    async function saveThresholds() {
        const cpuThreshold = document.getElementById("cpu-threshold").value;
        const memoryThreshold = document.getElementById("memory-threshold").value;
        const diskThreshold = document.getElementById("disk-threshold").value;

        const response = await fetch("http://127.0.0.1:5000/api/thresholds", {
            method: "POST", headers: {
                'Content-Type': 'application/json'
            }, body: JSON.stringify({
                cpu: cpuThreshold, memory: memoryThreshold, disk: diskThreshold
            })
        })
        const responseData = await response.json();
        console.log(responseData)

        alert("Thresholds saved successfully")
    }

    let cpuChart;

    async function renderCpuChart() {
        const response = await fetch("http://127.0.0.1:5000/api/chart-data");
        const data = await response.json();

        const labels = data.map(item => item.timestamp.slice(11, 19));
        const cpuData = data.map(item => item.cpu_usage);

        const ctx = document.getElementById("cpuChart").getContext("2d");

        cpuChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "CPU Usage (%)",
                    data: cpuData,
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.2)",
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                animation: false
            }
        });
    }

    async function updateCpuChart() {
        const response = await fetch("http://127.0.0.1:5000/api/chart-data");
        const data = await response.json();

        cpuChart.data.labels = data.map(item => item.timestamp.slice(11, 19));
        cpuChart.data.datasets[0].data = data.map(item => item.cpu_usage);
        cpuChart.update();
    }

    renderCpuChart();
    setInterval(updateCpuChart, 5000);

})

// Returns 'green', 'yellow', or 'red' based on threshold
function colorClass(pct) {
    if (pct >= 90) return 'red';
    if (pct >= 70) return 'yellow';
    return 'green';
}

// Apply color to a stat value element and its bar fill
function applyColor(valueEl, barEl, pct) {
    const cls = colorClass(Number(pct));

    valueEl.classList.remove('color-green', 'color-yellow', 'color-red');

    barEl.classList.remove('fill-green', 'fill-yellow', 'fill-red');

    valueEl.classList.add(`color-${cls}`);
    barEl.classList.add(`fill-${cls}`);

    barEl.style.width = `${pct}%`;
}

function fmt(val, unit) {
    return val !== undefined ? val + (unit || '') : '—';
}

function fmtGB(bytes) {
    if (bytes === undefined || bytes === null) return '—';
    return (bytes / 1073741824).toFixed(1) + ' GB';
}

function fmtUptime(seconds) {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h + 'h ' + m + 'm';
}

function fmtUptimeH(seconds) {
    return seconds ? (seconds / 3600).toFixed(1) : '—';
}

function badgeHTML(pct) {
    if (pct === undefined || pct === null) return '—';
    const cls = colorClass(Math.round(pct));
    return '<span class="badge ' + cls + '">' + Math.round(pct) + '</span>';
}
