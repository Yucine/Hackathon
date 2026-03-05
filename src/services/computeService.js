const docker = require("../docker")

async function startContainer(vm, network) {

    const container = await docker.createContainer({
        Image: "nginx",
        name: vm.name,

        HostConfig: {
            NetworkMode: network,

            Memory: vm.ram * 1024 * 1024 * 1024,
            NanoCPUs: vm.cpu * 1e9
        }
    })

    await container.start()

    return container.id
}

module.exports = { startContainer }