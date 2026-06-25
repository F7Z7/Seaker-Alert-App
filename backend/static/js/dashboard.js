window.addEventListener('load', () => {

    const now = new Date()
    const today = now.toLocaleDateString()
    document.getElementById("date").innerHTML = today
    const hrs = now.getHours()
    const min = now.getMinutes()
    const sec = now.getSeconds()
    document.getElementById("time").innerHTML =
        `${hrs}:${min}:${sec}`;
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
            const response = await fetch('http://127.0.0.1:5000//api/latest');

            if (!response.ok) {
                console.log("HTTP Error:", response.status);
                return;
            }

            const data = await response.json();

            // Uptime
            document.getElementById("uptime").innerText =
                `${data.uptime_hours} h`;

            // CPU
            document.getElementById("cpu-pct").innerText =
                data.cpu_usage;


            document.getElementById("cpu-bar").style.width =
                `${data.cpu_usage}%`;

            document.getElementById("cpu-cores").innerText =
                data.cpu_cores;

            document.getElementById("cpu-threads").innerText =
                data.cpu_threads;
            // Memory
            document.getElementById("mem-pct").innerText =
                data.memory_percentage;


            document.getElementById("mem-total").innerText =
                `${data.memory_total_gb} GB`;

            document.getElementById("mem-used").innerText =
                `${data.memory_used_gb} GB`;

            document.getElementById("mem-avail").innerText =
                `${data.memory_available_gb} GB`;

            // Disk
            document.getElementById("disk-pct").innerText =
                data.disk_percentage;

            document.getElementById("disk-bar").style.width =
                `${data.disk_percentage}%`;

            document.getElementById("disk-total").innerText =
                `${data.disk_total_gb} GB`;

            document.getElementById("disk-used").innerText =
                `${data.disk_used_gb} GB`;

            document.getElementById("disk-free").innerText =
                `${data.disk_free_gb} GB`;

        } catch (error) {
            console.error("Error fetching latest data:", error);
        }
    }

    async function start() {
        await latestData()
        setInterval(latestData, 1000)
    }

    start()

    function updateClock() {
        const now = new Date();

        document.getElementById("date").innerText =
            now.toLocaleDateString();

        document.getElementById("time").innerText =
            now.toLocaleTimeString();
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
            const response = await fetch('http://127.0.0.1:5000//api/history', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({count: defaultCount})
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
})
