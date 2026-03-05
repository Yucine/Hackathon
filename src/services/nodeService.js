const prisma = require("../prisma")

async function createNode(data) {

    return prisma.computeNode.create({
        data: {
            name: data.name,
            cpuTotal: data.cpuTotal,
            ramTotal: data.ramTotal
        }
    })

}

async function getNodes() {

    return prisma.computeNode.findMany({
        include: { vms: true }
    })

}

module.exports = {
    createNode,
    getNodes
}