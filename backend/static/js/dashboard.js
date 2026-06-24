window.addEventListener('load', () => {

    const now=new Date()
    const today=now.toLocaleDateString()
    document.getElementById("date").innerHTML = today
    const hrs=now.getHours()
    const min=now.getMinutes()
    const sec=now.getSeconds()
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
                `${data.uptime_hours.toFixed(1)} h`;

            // CPU
            document.getElementById("cpu-pct").innerText =
                data.cpu_usage.toFixed(1);

            document.getElementById("cpu-bar").style.width =
                `${data.cpu_usage}%`;

            document.getElementById("cpu-cores").innerText =
                data.cpu_cores;

            document.getElementById("cpu-threads").innerText =
                data.cpu_threads;

            // Memory
            document.getElementById("mem-pct").innerText =
                data.percentage.toFixed(1);

            document.getElementById("mem-bar").style.width =
                `${data.percentage}%`;

            document.getElementById("mem-total").innerText =
                `${data.total_gb.toFixed(1)} GB`;

            document.getElementById("mem-used").innerText =
                `${data.used_gb.toFixed(1)} GB`;

            document.getElementById("mem-avail").innerText =
                `${data.available_gb.toFixed(1)} GB`;

            // Disk
            document.getElementById("disk-pct").innerText =
                data.disk_percent.toFixed(1);

            document.getElementById("disk-bar").style.width =
                `${data.disk_percent}%`;

            document.getElementById("disk-total").innerText =
                `${data.disk_total_gb.toFixed(1)} GB`;

            document.getElementById("disk-used").innerText =
                `${data.disk_used_gb.toFixed(1)} GB`;

            document.getElementById("disk-free").innerText =
                `${data.disk_free_gb.toFixed(1)} GB`;

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

})
