const docker = require("../docker")

async function getVMStats(containerId) {

    const container = docker.getContainer(containerId)

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

    const memoryUsed =
        stats.memory_stats.usage / 1024 / 1024

    const memoryLimit =
        stats.memory_stats.limit / 1024 / 1024

    const network = stats.networks.eth0

    return {
        cpu: cpu ? cpu.toFixed(2) : 0,
        ramUsed: memoryUsed.toFixed(2),
        ramLimit: memoryLimit.toFixed(2),
        networkIn: network.rx_bytes,
        networkOut: network.tx_bytes
    }

}

module.exports = { getVMStats }