const express = require("express")
const prisma = require("../prisma")

const router = express.Router()

router.post("/", async (req, res) => {

    const node = await prisma.computeNode.create({
        data: {
            name: req.body.name,
            cpuTotal: req.body.cpuTotal,
            ramTotal: req.body.ramTotal
        }
    })

    res.json(node)

})

router.get("/", async (req, res) => {

    const nodes = await prisma.computeNode.findMany()

    res.json(nodes)

})

router.get("/:id/stats", async (req, res) => {

    const nodeId = Number(req.params.id)

    const vms = await prisma.vM.findMany({
        where: { nodeId }
    })

    const metrics = await prisma.vMMetric.findMany({
        where: { nodeId },
        orderBy: { createdAt: "desc" },
        take: 50
    })

    const cpuAvg =
        metrics.reduce((s, m) => s + m.cpuUsage, 0) / metrics.length

    const ramAvg =
        metrics.reduce((s, m) => s + m.ramUsage, 0) / metrics.length

    res.json({
        nodeId,
        vmCount: vms.length,
        cpuAvg,
        ramAvg
    })

})

module.exports = router