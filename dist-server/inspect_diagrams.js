"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_1 = require("./lib/mongodb");
const Diagram_1 = __importDefault(require("./models/Diagram"));
async function run() {
    await (0, mongodb_1.connectToDatabase)();
    console.log('Connected to DB. Fetching all diagrams...');
    const diagrams = await Diagram_1.default.find({});
    console.log('Found diagrams:', JSON.stringify(diagrams, null, 2));
    await mongoose_1.default.connection.close();
    process.exit(0);
}
run();
