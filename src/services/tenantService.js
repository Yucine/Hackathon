const prisma = require("../prisma")

async function createTenant(data) {

    return prisma.tenant.create({
        data: {
            name: data.name,
            cpuQuota: data.cpuQuota,
            ramQuota: data.ramQuota,
            diskQuota: data.diskQuota
        }
    })

}

async function getTenants() {

    return prisma.tenant.findMany({
        include: { vms: true }
    })

}

module.exports = {
    createTenant,
    getTenants
}