import { Router } from 'express'
import { NodeRegistry } from '../models/ToolRegistry'

const router = Router()

// GET /api/registry/node/:nodeId — get node with all tools
router.get('/node/:nodeId', async (req, res) => {
  try {
    const node = await NodeRegistry.findOne({ nodeId: req.params.nodeId })
    if (!node) return res.status(404).json({ error: 'Node not found' })
    res.json(node)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/registry/node/:nodeId/tools — get just the tools list
router.get('/node/:nodeId/tools', async (req, res) => {
  try {
    const node = await NodeRegistry.findOne(
      { nodeId: req.params.nodeId },
      { tools: 1, clientTypes: 1, isClientOrigin: 1, nodeName: 1 }
    )
    if (!node) return res.status(404).json({ error: 'Node not found' })
    res.json({
      nodeId: req.params.nodeId,
      nodeName: node.nodeName,
      isClientOrigin: node.isClientOrigin,
      tools: node.tools || [],
      clientTypes: node.clientTypes || []
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/registry/connections/:nodeId — get connection rules
router.get('/connections/:nodeId', async (req, res) => {
  try {
    const node = await NodeRegistry.findOne(
      { nodeId: req.params.nodeId },
      { validConnections: 1, validChaos: 1, invalidChaos: 1 }
    )
    if (!node) return res.status(404).json({ error: 'Node not found' })
    res.json(node)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/registry/chaos — returns all chaos scenarios for frontend
router.get('/chaos', async (req, res) => {
  try {
    const chaosData = require('../../src/data/content/chaosScenarios.json')
    res.json(chaosData.scenarios || chaosData)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/registry/chaos/:chaosId — returns a single chaos scenario
router.get('/chaos/:chaosId', async (req, res) => {
  try {
    const chaosData = require('../../src/data/content/chaosScenarios.json')
    const scenarios = chaosData.scenarios || chaosData
    const scenario = scenarios.find((s: any) => s.id === req.params.chaosId)
    if (!scenario) return res.status(404).json({ error: 'Not found' })
    res.json(scenario)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
