const express = require("express")
const prisma = require("../prisma")

const router = express.Router()

router.post("/", async (req, res) => {

    const node = await prisma.computeNode.create({
        data: {
            name: req.body.name,
            cpuTotal: req.body.cpuTotal,
            ramTotal: req.body.ramTotal
        }
    })

    res.json(node)

})

router.get("/", async (req, res) => {

    const nodes = await prisma.computeNode.findMany()

    res.json(nodes)

})

module.exports = router