const express = require("express")
const cors = require("cors")
const http = require("http")

const prisma = require("./prisma")
const docker = require("./docker")
const ws = require("./ws")

const tenantRoutes = require("./routes/tenants")
const nodeRoutes = require("./routes/nodes")
const vmRoutes = require("./routes/vms")
const clusterRoutes = require("./routes/cluster")
const metricsRoutes = require("./routes/metrics")
const app = express()

// проверка Docker
docker.listContainers()
    .then(c => console.log("Docker works:", c))
    .catch(e => console.error("Docker error:", e))

// MIDDLEWARE
app.use(cors())
app.use(express.json())

// ROUTES
app.use("/tenants", tenantRoutes)
app.use("/vms", vmRoutes)
app.use("/nodes", nodeRoutes)
app.use("/cluster", clusterRoutes)
app.use("/metrics", metricsRoutes)
app.get("/", (req, res) => {
    res.send("Cloud IaaS API running")
})

app.get("/debug", (req, res) => {
    res.json(Object.keys(prisma))
})

app.get("/db-test", async (req, res) => {

    const tenants = await prisma.tenant.findMany()

    res.json(tenants)

})

app.post("/test", (req, res) => {
    console.log(req.body)
    res.json(req.body)
})

// ---------- HTTP SERVER ----------
const server = http.createServer(app)

// запуск websocket
ws.init(server)

// запуск realtime метрик
require("./services/metricsCollector")

server.listen(3000, () => {
    console.log("Server running on port 3000")
})