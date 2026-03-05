const WebSocket = require("ws")

let wss

function init(server) {

    wss = new WebSocket.Server({ server })

    wss.on("connection", ws => {
        console.log("Dashboard connected")
    })

}

function broadcast(data) {

    if (!wss) return

    const payload = JSON.stringify(data)

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload)
        }
    })

}

module.exports = { init, broadcast }