const docker = require("../docker")
const prisma = require("../prisma")

async function createNetwork(data) {

    const networkName = `tenant-${data.tenantId}-net`

    await docker.createNetwork({
        Name: networkName,
        Driver: "bridge"
    })

    const network = await prisma.network.create({
        data: {
            name: data.name,
            cidr: data.cidr,
            tenantId: data.tenantId
        }
    })

    return network
}

module.exports = { createNetwork }