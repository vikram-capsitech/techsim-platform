import mongoose from 'mongoose'

const ToolSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: String,
  description: String,
  openSource: Boolean,
  cloudManaged: Boolean,
  provider: String,
  bestFor: [String],
  notGoodFor: [String],
  pros: [String],
  cons: [String],
  costEstimate: String,
  canvasLabel: String,
  resources: mongoose.Schema.Types.Mixed,
  realWorldUsage: mongoose.Schema.Types.Mixed,
  groupId: String,
  groupName: String
}, { _id: false })

const NodeRegistrySchema = new mongoose.Schema({
  nodeId: { type: String, required: true, unique: true, index: true },
  nodeName: String,
  category: String,
  subcategory: String,
  description: String,
  isClientOrigin: { type: Boolean, default: false },
  validChaos: [String],
  invalidChaos: mongoose.Schema.Types.Mixed,
  validConnections: {
    canReceiveFrom: [String],
    canSendTo: [String],
    cannotConnectTo: [String],
    cannotConnectToReason: mongoose.Schema.Types.Mixed
  },
  commonMistakes: [mongoose.Schema.Types.Mixed],
  realWorldUsage: [mongoose.Schema.Types.Mixed],
  tools: [ToolSchema],
  clientTypes: [mongoose.Schema.Types.Mixed]
})

export const NodeRegistry = mongoose.model('NodeRegistry', NodeRegistrySchema)
