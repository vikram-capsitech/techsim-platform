"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeRegistry = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ToolSchema = new mongoose_1.default.Schema({
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
    resources: mongoose_1.default.Schema.Types.Mixed,
    realWorldUsage: mongoose_1.default.Schema.Types.Mixed,
    groupId: String,
    groupName: String
}, { _id: false });
const NodeRegistrySchema = new mongoose_1.default.Schema({
    nodeId: { type: String, required: true, unique: true, index: true },
    nodeName: String,
    category: String,
    subcategory: String,
    description: String,
    isClientOrigin: { type: Boolean, default: false },
    validChaos: [String],
    invalidChaos: mongoose_1.default.Schema.Types.Mixed,
    validConnections: {
        canReceiveFrom: [String],
        canSendTo: [String],
        cannotConnectTo: [String],
        cannotConnectToReason: mongoose_1.default.Schema.Types.Mixed
    },
    commonMistakes: [mongoose_1.default.Schema.Types.Mixed],
    realWorldUsage: [mongoose_1.default.Schema.Types.Mixed],
    tools: [ToolSchema],
    clientTypes: [mongoose_1.default.Schema.Types.Mixed]
});
exports.NodeRegistry = mongoose_1.default.model('NodeRegistry', NodeRegistrySchema);
