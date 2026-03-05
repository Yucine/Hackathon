const express = require("express")
const prisma = require("../prisma")

const router = express.Router()

router.post("/", async (req, res) => {

    if (!req.body) {
        return res.status(400).json({ error: "Request body missing" })
    }

    const { name, cpuQuota, ramQuota, diskQuota } = req.body

    const tenant = await prisma.tenant.create({
        data: {
            name,
            cpuQuota,
            ramQuota,
            diskQuota
        }
    })

    res.json(tenant)

})

router.get("/", async (req, res) => {

    const tenants = await prisma.tenant.findMany()

    res.json(tenants)

})

router.get("/:id/usage", async (req, res) => {

    const tenantId = Number(req.params.id)

    const vms = await prisma.vM.findMany({
        where: { tenantId }
    })

    const vmIds = vms.map(v => v.id)

    const metrics = await prisma.vMMetric.findMany({
        where: {
            vmId: { in: vmIds }
        }
    })

    const cpu =
        metrics.reduce((s, m) => s + m.cpuUsage, 0)

    const ram =
        metrics.reduce((s, m) => s + m.ramUsage, 0)

    res.json({
        tenantId,
        vmCount: vms.length,
        cpuUsage: cpu,
        ramUsage: ram
    })

})

module.exports = router