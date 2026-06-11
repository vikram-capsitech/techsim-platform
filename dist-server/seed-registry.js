"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("./lib/mongodb");
const ToolRegistry_1 = require("./models/ToolRegistry");
const techsim_merged_registry_json_1 = __importDefault(require("../src/data/registry/techsim_merged_registry.json"));
async function seedRegistry() {
    await (0, mongodb_1.connectToDatabase)();
    const registry = techsim_merged_registry_json_1.default.nodeToolRegistry;
    let seeded = 0;
    let errors = 0;
    for (const [nodeId, nodeData] of Object.entries(registry)) {
        try {
            // Flatten tools from toolGroups for easier querying
            const flatTools = nodeData.toolGroups?.flatMap((g) => (g.tools || []).map((t) => ({
                ...t,
                groupId: g.groupId,
                groupName: g.groupName
            }))) || [];
            await ToolRegistry_1.NodeRegistry.findOneAndUpdate({ nodeId }, {
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
            }, { upsert: true, new: true });
            seeded++;
        }
        catch (err) {
            console.error(`Failed to seed ${nodeId}:`, err);
            errors++;
        }
    }
    console.log(`✅ Seeded ${seeded} nodes, ${errors} errors`);
    process.exit(0);
}
seedRegistry();
