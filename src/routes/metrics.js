const express = require("express")
const router = express.Router()

const prisma = require("../prisma")
const docker = require("../docker")

router.get("/vm/:id", async (req, res) => {

    try {

        const vm = await prisma.vM.findUnique({
            where: { id: Number(req.params.id) }
        })

        if (!vm) {
            return res.status(404).json({ error: "VM not found" })
        }

        const container = docker.getContainer(vm.containerId)

        const stats = await container.stats({ stream: false })

        const cpuDelta =
            stats.cpu_stats.cpu_usage.total_usage -
            stats.precpu_stats.cpu_usage.total_usage

        const systemDelta =
            stats.cpu_stats.system_cpu_usage -
            stats.precpu_stats.system_cpu_usage

        const cpu =
            (cpuDelta / systemDelta) *
            stats.cpu_stats.online_cpus *
            100

        const memory =
            stats.memory_stats.usage / 1024 / 1024

        res.json({
            vmId: vm.id,
            name: vm.name,
            cpu: cpu ? cpu.toFixed(2) : 0,
            ram: memory.toFixed(2)
        })

    } catch (err) {

        res.status(500).json({
            error: err.message
        })

    }

})

router.get("/vm/:id/history", async (req, res) => {

    const metrics = await prisma.vMMetric.findMany({
        where: {
            vmId: Number(req.params.id)
        },
        orderBy: {
            createdAt: "asc"
        },
        take: 60
    })

    res.json(metrics)

})

module.exports = router