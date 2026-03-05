const prisma = require("../prisma")
const docker = require("../docker")
const ws = require("../ws")
const clusterService = require("./clusterService")

async function collectMetrics() {

    const vms = await prisma.vM.findMany({
        where: { status: "running" }
    })

    const metrics = []

    for (const vm of vms) {

        try {

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
                stats.memory_stats.usage /
                1024 /
                1024

            metrics.push({
                vmId: vm.id,
                name: vm.name,
                cpu: cpu.toFixed(2),
                ram: memory.toFixed(2)
            })

        } catch (e) {
            console.log("Metrics error", e.message)
        }

    }

    ws.broadcast({
        type: "metrics",
        data: metrics
    })
    const clusterStats = await clusterService.getClusterStats()

    ws.broadcast({
        type: "cluster",
        data: clusterStats
    })
}

setInterval(collectMetrics, 1000)

module.exports = {}