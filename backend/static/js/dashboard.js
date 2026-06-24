async function latestData() {
    const response = await fetch('http://localhost:5000/api/latest')
    if (!response.ok) {
        console.log("HTTP Error:", response.status);
        return;
    }

    let data=await response.json()
    console.log(data)
}

async function start() {
    await latestData()
    setInterval(latestData, 500)
}

start()
