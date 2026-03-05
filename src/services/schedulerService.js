const prisma = require("../prisma")

async function scheduleVM(cpu, ram) {

    const nodes = await prisma.computeNode.findMany()

    for (const node of nodes) {

        const cpuFree = node.cpuTotal - node.cpuUsed
        const ramFree = node.ramTotal - node.ramUsed

        if (cpuFree >= cpu && ramFree >= ram) {
            return node
        }

    }

    throw new Error("No compute nodes available")
}

module.exports = { scheduleVM }