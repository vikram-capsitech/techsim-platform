"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY,
});
const SYSTEM_PROMPT = `You are a system architecture expert for TechSim, an IT learning platform.
When given a system description, return ONLY valid raw JSON — absolutely no explanation,
no markdown, no code blocks, no backticks. Just the raw JSON object.

Return this exact structure:
{
  "nodes": [
    {
      "id": "node_1",
      "type": "techsimNode",
      "position": { "x": number, "y": number },
      "data": {
        "label": string,
        "category": "network"|"compute"|"data"|"messaging"|"infrastructure"|"monitoring",
        "nodeType": "loadBalancer"|"apiGateway"|"database"|"cache"|"queue"|"microservice"|"cdn"|"waf"|"router"|"firewall"|"dns",
        "status": "healthy",
        "replicas": number,
        "capacity": number,
        "latency": number,
        "region": string
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_1",
      "target": "node_2",
      "data": {
        "protocol": "HTTP"|"gRPC"|"TCP"|"async",
        "bandwidth": number
      }
    }
  ]
}

Layout positioning rules — follow these x positions exactly:
- Client browser/mobile: x=80, y=300
- CDN: x=80, y=150
- WAF: x=280, y=300
- DNS: x=280, y=150
- Load Balancer: x=480, y=300
- API Gateway: x=680, y=300
- Microservices: x=880, spread y: first=150, second=300, third=450, fourth=550
- Cache (Redis): x=1080, y=200
- Database: x=1080, y=350
- Message Queue: x=1080, y=500
- Monitoring: x=1280, y=300

Architecture rules:
- ALWAYS include a WAF for any internet-facing system
- ALWAYS include Load Balancer before multiple microservices
- ALWAYS include Cache before Database for read-heavy systems
- ALWAYS include API Gateway for microservices architecture
- Minimum 8 nodes, maximum 16 nodes
- Every node must have at least one edge connecting it
- Never leave isolated nodes`;
router.post('/generate', auth_1.authMiddleware, async (req, res, next) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 4096,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt },
            ],
        });
        const raw = completion.choices[0].message.content ?? '';
        // Strip accidental markdown fences
        const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
        const diagram = JSON.parse(cleaned);
        if (!diagram.nodes || !diagram.edges) {
            return res.status(500).json({ error: 'Invalid diagram structure returned' });
        }
        res.json(diagram);
    }
    catch (err) {
        if (err instanceof SyntaxError) {
            res.status(500).json({ error: 'Failed to parse diagram from AI response' });
        }
        else {
            next(err);
        }
    }
});
exports.default = router;
