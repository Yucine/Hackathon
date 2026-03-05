const express = require("express")
const prisma = require("../prisma")
const vmService = require("../services/vmService")

const router = express.Router()
router.post("/", async (req, res) => {
    console.log("REQ BODY:", req.body)

    try {
        const vm = await vmService.createVM(req.body)
        res.json(vm)
    } catch (err) {

        console.error("VM ERROR:", err)

        res.status(500).json({
            error: err.message,
            stack: err.stack
        })

    }
})
// create VM
router.post("/", async (req, res) => {

    try {

        const vm = await vmService.createVM(req.body)

        res.json(vm)

    } catch (err) {

        res.status(400).json({ error: err.message })

    }

})

// list VMs
router.get("/", async (req, res) => {

    const vms = await prisma.vM.findMany({
        include: {
            tenant: true,
            node: true
        }
    })

    res.json(vms)

})

// start VM
router.post("/:id/start", async (req, res) => {

    const vm = await vmService.startVM(Number(req.params.id))

    res.json(vm)

})

// stop VM
router.post("/:id/stop", async (req, res) => {

    const vm = await vmService.stopVM(Number(req.params.id))

    res.json(vm)

})

// delete VM
router.delete("/:id", async (req, res) => {

    try {

        const result = await vmService.deleteVM(Number(req.params.id))

        res.json(result)

    } catch (err) {

        res.status(400).json({ error: err.message })

    }

})

module.exports = router