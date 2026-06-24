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


            const response = await fetch('http://localhost:5000/api/latest')
            if (!response.ok) {
                console.log("HTTP Error:", response.status);
                return;
            }

            let data = await response.json()
            document.getElementById("ti")
        }
        catch (error) {
            console.error("Error fetching latest data:", error);
            return 404;
        }
    }

    async function start() {
        while(true) {
            await latestData()
            setInterval(latestData, 1000)
        }

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
