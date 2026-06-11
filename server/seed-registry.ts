import { connectToDatabase } from './lib/mongodb'
import { NodeRegistry } from './models/ToolRegistry'
import registryData from '../src/data/registry/techsim_merged_registry.json'

async function seedRegistry() {
  await connectToDatabase()

  const registry = registryData.nodeToolRegistry as Record<string, any>
  let seeded = 0
  let errors = 0

  for (const [nodeId, nodeData] of Object.entries(registry)) {
    try {
      // Flatten tools from toolGroups for easier querying
      const flatTools = nodeData.toolGroups?.flatMap((g: any) =>
        (g.tools || []).map((t: any) => ({
          ...t,
          groupId: g.groupId,
          groupName: g.groupName
        }))
      ) || []

      await NodeRegistry.findOneAndUpdate(
        { nodeId },
        {
          nodeId,
          nodeName: nodeData.nodeName,
          category: nodeData.category,
          subcategory: nodeData.subcategory,
          description: nodeData.description,
          isClientOrigin: nodeData.isClientOrigin || false,
          validChaos: nodeData.validChaos || [],
          invalidChaos: nodeData.invalidChaos || {},
          validConnections: nodeData.validConnections || {},
          commonMistakes: nodeData.commonMistakes || [],
          realWorldUsage: nodeData.realWorldUsage || [],
          tools: flatTools,
          clientTypes: nodeData.clientTypes || []
        },
        { upsert: true, new: true }
      )
      seeded++
    } catch (err) {
      console.error(`Failed to seed ${nodeId}:`, err)
      errors++
    }
  }

  console.log(`✅ Seeded ${seeded} nodes, ${errors} errors`)
  process.exit(0)
}

seedRegistry()
