const prisma = require("../prisma")

async function getClusterStats() {

    const nodes = await prisma.computeNode.findMany()
    const vms = await prisma.vM.findMany()

    const nodeCount = nodes.length
    const vmCount = vms.length

    const totalCPU = nodes.reduce((sum, n) => sum + n.cpuTotal, 0)
    const usedCPU = nodes.reduce((sum, n) => sum + n.cpuUsed, 0)

    const totalRAM = nodes.reduce((sum, n) => sum + n.ramTotal, 0)
    const usedRAM = nodes.reduce((sum, n) => sum + n.ramUsed, 0)

    return {
        nodes: nodeCount,
        vms: vmCount,

        cpu: {
            total: totalCPU,
            used: usedCPU,
            free: totalCPU - usedCPU
        },

        ram: {
            total: totalRAM,
            used: usedRAM,
            free: totalRAM - usedRAM
        }
    }

}

module.exports = { getClusterStats }