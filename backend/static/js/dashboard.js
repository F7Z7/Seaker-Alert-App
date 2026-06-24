window.addEventListener('load', () => {

    const now = new Date()
    const today = now.toLocaleDateString()
    document.getElementById("date").innerHTML = today
    const hrs = now.getHours()
    const min = now.getMinutes()
    const sec = now.getSeconds()
    document.getElementById("time").innerHTML =
        `${hrs}:${min}:${sec}`;


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


    let logDropdown = document.getElementById("logs")
    let count=logDropdown.value;
    showRecentlogs(count);
    async function showRecentlogs(defaultCount = 10) {
        try {
            const response = await fetch('http://127.0.0.1:5000//api/history');

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

    showRecentlogs()
})
