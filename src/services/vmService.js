const prisma = require("../prisma")
const scheduler = require("./schedulerService")

function generateIP() {
    const last = Math.floor(Math.random() * 200) + 10
    return `10.0.0.${last}`
}
const docker = require("../docker")

async function startContainer(vmName, network, cpu, ram) {

    const container = await docker.createContainer({
        Image: "nginx",
        name: vmName,

        HostConfig: {
            NetworkMode: network,

            // ограничения ресурсов
            Memory: ram * 1024 * 1024 * 1024,
            NanoCPUs: cpu * 1e9
        }
    })

    await container.start()

    return container.id
}
async function createVM(data) {
    if (!data || !data.tenantId) {
        throw new Error("tenantId missing in request")
    }
    const tenant = await prisma.tenant.findUnique({
        where: { id: data.tenantId },
        include: { vms: true }
    })

    if (!tenant) {
        throw new Error("Tenant not found")
    }

    // ---- QUOTA CHECK ----
    const cpuUsed = tenant.vms.reduce((sum, vm) => sum + vm.cpu, 0)
    const ramUsed = tenant.vms.reduce((sum, vm) => sum + vm.ram, 0)
    const diskUsed = tenant.vms.reduce((sum, vm) => sum + vm.disk, 0)

    if (cpuUsed + data.cpu > tenant.cpuQuota)
        throw new Error("CPU quota exceeded")

    if (ramUsed + data.ram > tenant.ramQuota)
        throw new Error("RAM quota exceeded")

    if (diskUsed + data.disk > tenant.diskQuota)
        throw new Error("Disk quota exceeded")

    // ---- SCHEDULER ----
    const node = await scheduler.scheduleVM(data.cpu, data.ram)

    // ---- CREATE VM RECORD ----
    const vm = await prisma.vM.create({
        data: {
            name: data.name,
            cpu: data.cpu,
            ram: data.ram,
            disk: data.disk,
            status: "creating",
            ip: generateIP(),
            tenantId: data.tenantId,
            nodeId: node.id
        }
    })

    // ---- START DOCKER CONTAINER ----
    const containerId = await startContainer(
        vm.name,
        `tenant-${data.tenantId}-net`,
        data.cpu,
        data.ram
    )
    // ---- SAVE CONTAINER ID ----
    await prisma.vM.update({
        where: { id: vm.id },
        data: {
            containerId: containerId,
            status: "running"
        }
    })

    // allocate resources
    await prisma.computeNode.update({
        where: { id: node.id },
        data: {
            cpuUsed: node.cpuUsed + data.cpu,
            ramUsed: node.ramUsed + data.ram
        }
    })

    return vm
}
async function startVM(id) {

    const vm = await prisma.vM.findUnique({
        where: { id }
    })

    if (!vm) {
        throw new Error("VM not found")
    }

    const container = docker.getContainer(vm.containerId)

    const info = await container.inspect()

    // если контейнер уже запущен
    if (info.State.Running) {

        return prisma.vM.update({
            where: { id },
            data: { status: "running" }
        })

    }

    await container.start()

    return prisma.vM.update({
        where: { id },
        data: { status: "running" }
    })

}

async function stopVM(id) {

    const vm = await prisma.vM.findUnique({ where: { id } })

    if (!vm) throw new Error("VM not found")

    const container = docker.getContainer(vm.containerId)

    await container.stop()

    await prisma.vM.update({
        where: { id },
        data: { status: "stopped" }
    })

}
async function deleteVM(id) {

    const vm = await prisma.vM.findUnique({
        where: { id }
    })

    if (!vm) throw new Error("VM not found")

    const container = docker.getContainer(vm.containerId)

    await container.stop()
    await container.remove()

    const node = await prisma.computeNode.findUnique({
        where: { id: vm.nodeId }
    })

    await prisma.computeNode.update({
        where: { id: node.id },
        data: {
            cpuUsed: node.cpuUsed - vm.cpu,
            ramUsed: node.ramUsed - vm.ram
        }
    })

    await prisma.vM.delete({
        where: { id }
    })

}

module.exports = {
    createVM,
    startVM,
    stopVM,
    deleteVM
}