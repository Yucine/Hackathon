const express = require("express")
const router = express.Router()

const clusterService = require("../services/clusterService")

router.get("/stats", async (req, res) => {

    try {

        const stats = await clusterService.getClusterStats()

        res.json(stats)

    } catch (err) {

        res.status(500).json({
            error: err.message
        })

    }

})

module.exports = router