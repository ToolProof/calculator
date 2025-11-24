import express from 'express';
import { readFromCAFS, writeToCAFS } from './ioInterface.js';
const app = express();
const PORT = Number(process.env.PORT) || 8080;
// Middleware to parse JSON bodies
app.use(express.json());
// Helper function to read two input values from CAFS
async function readTwoInputs(input1, input2) {
    const value1 = await readFromCAFS(input1.path);
    const value2 = await readFromCAFS(input2.path);
    return [value1, value2];
}
// Helper function to write a single output to CAFS and format response
async function writeSingleOutput(output, value, outputName) {
    const storageResult = await writeToCAFS(output.id, output.typeId, output.creationContext.roleId, output.creationContext.executionId, value);
    return {
        outputs: {
            [outputName]: {
                path: storageResult.storagePath,
                timestamp: storageResult.timestamp
            }
        }
    };
}
// Helper function to write two outputs to CAFS and format response
async function writeTwoOutputs(output1, value1, outputName1, output2, value2, outputName2) {
    const storage1 = await writeToCAFS(output1.id, output1.typeId, output1.creationContext.roleId, output1.creationContext.executionId, value1);
    const storage2 = await writeToCAFS(output2.id, output2.typeId, output2.creationContext.roleId, output2.creationContext.executionId, value2);
    return {
        outputs: {
            [outputName1]: {
                path: storage1.storagePath,
                timestamp: storage1.timestamp
            },
            [outputName2]: {
                path: storage2.storagePath,
                timestamp: storage2.timestamp
            }
        }
    };
}
app.post('/add', async (req, res) => {
    try {
        const { AddendOne, AddendTwo, Sum } = req.body;
        const [inputOne, inputTwo] = await readTwoInputs(AddendOne, AddendTwo);
        const result = inputOne + inputTwo;
        const response = await writeSingleOutput(Sum, result, 'Sum');
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});
app.post('/subtract', async (req, res) => {
    try {
        const { Minuend, Subtrahend, Difference } = req.body;
        const [inputOne, inputTwo] = await readTwoInputs(Minuend, Subtrahend);
        const result = inputOne - inputTwo;
        const response = await writeSingleOutput(Difference, result, 'Difference');
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});
app.post('/multiply', async (req, res) => {
    try {
        const { Multiplicand, Multiplier, Product } = req.body;
        const [inputOne, inputTwo] = await readTwoInputs(Multiplicand, Multiplier);
        const result = inputOne * inputTwo;
        const response = await writeSingleOutput(Product, result, 'Product');
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});
app.post('/divide', async (req, res) => {
    try {
        const { Dividend, Divisor, Quotient, Remainder } = req.body;
        const [inputOne, inputTwo] = await readTwoInputs(Dividend, Divisor);
        const quotientResult = Math.floor(inputOne / inputTwo);
        const remainderResult = inputOne % inputTwo;
        const response = await writeTwoOutputs(Quotient, quotientResult, 'Quotient', Remainder, remainderResult, 'Remainder');
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Numerical server is running' });
});
// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Numerical server is running on port ${PORT}`);
});
export default app;
