const prisma = require("../src/prisma")
const docker = require("../src/docker")

async function clearDatabase() {

    console.log("Clearing database...")

    await prisma.vMMetric.deleteMany()
    await prisma.vM.deleteMany()
    await prisma.network.deleteMany()
    await prisma.computeNode.deleteMany()
    await prisma.tenant.deleteMany()

}

async function clearContainers() {

    const containers = await docker.listContainers({ all: true })

    for (const c of containers) {

        if (c.Names[0].includes("vm-")) {

            const container = docker.getContainer(c.Id)

            try {
                await container.stop()
            } catch {}

            await container.remove()

        }

    }

}

async function createTenants() {

    const tenants = []

    for (let i = 1; i <= 4; i++) {

        const tenant = await prisma.tenant.create({
            data: {
                name: `Tenant-${i}`,
                cpuQuota: 32,
                ramQuota: 64,
                diskQuota: 500
            }
        })

        tenants.push(tenant)

    }

    return tenants
}

async function createNodes() {

    const nodes = []

    for (let i = 1; i <= 2; i++) {

        const node = await prisma.computeNode.create({
            data: {
                name: `node-${i}`,
                cpuTotal: 16,
                ramTotal: 32
            }
        })

        nodes.push(node)

    }

    return nodes
}

async function startContainer(name) {

    const container = await docker.createContainer({
        Image: "nginx",
        name: name,
        HostConfig: {
            NanoCPUs: 2000000000,
            Memory: 512 * 1024 * 1024
        }
    })

    await container.start()

    return container.id
}

async function simulateLoad(containerId) {

    const container = docker.getContainer(containerId)

    await container.exec({
        Cmd: [
            "sh",
            "-c",
            "while true; do timeout $((RANDOM % 5 + 1)) yes > /dev/null; sleep $((RANDOM % 3 + 1)); done"
        ],
        AttachStdout: false,
        AttachStderr: false
    }).then(exec => exec.start())

}

async function createVMs(tenants, nodes) {

    const vmCount = 6

    for (let i = 1; i <= vmCount; i++) {

        const tenant = tenants[Math.floor(Math.random() * tenants.length)]
        const node = nodes[Math.floor(Math.random() * nodes.length)]

        const name = `vm-${i}`

        const containerId = await startContainer(name)

        const vm = await prisma.vM.create({
            data: {
                name,
                cpu: 2,
                ram: 2,
                disk: 10,
                status: "running",
                tenantId: tenant.id,
                nodeId: node.id,
                containerId: containerId
            }
        })

        await simulateLoad(containerId)

        await prisma.computeNode.update({
            where: { id: node.id },
            data: {
                cpuUsed: node.cpuUsed + 2,
                ramUsed: node.ramUsed + 2
            }
        })

        console.log("VM created:", vm.name)

    }

}

async function main() {
    await clearContainers()
    await clearDatabase()

    console.log("Creating tenants...")
    const tenants = await createTenants()

    console.log("Creating compute nodes...")
    const nodes = await createNodes()

    console.log("Creating VMs...")
    await createVMs(tenants, nodes)

    console.log("Infrastructure ready")

}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())