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

module.exports = router