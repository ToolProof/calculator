import { ResourceJson, ResourcePotentialOutputJson } from '@toolproof-npm/schema';
import express, { Request, Response } from 'express';
import { readFromPersistence, writeToPersistence } from './persistenceInterface.js';


const app: express.Application = express();
const PORT = Number(process.env.PORT) || 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Helper function to read two input values from CAFS
async function readTwoInputs(input1: ResourceJson, input2: ResourceJson): Promise<[number, number]> {
    const value1 = await readFromPersistence(input1.path);
    const value2 = await readFromPersistence(input2.path);
    return [value1, value2];
}

// Helper function to write a single output to CAFS and format response
async function writeSingleOutput(output: ResourcePotentialOutputJson, value: number, outputName: string) {
    const resource = await writeToPersistence(
        output,
        JSON.stringify({ identity: value }, null, 2)
    );

    return {
        outputMap: {
            [outputName]: resource
        }
    };
}

// Helper function to write two outputs to CAFS and format response
async function writeTwoOutputs(
    output1: ResourcePotentialOutputJson,
    value1: number,
    outputName1: string,
    output2: ResourcePotentialOutputJson,
    value2: number,
    outputName2: string
) {
    const resource1 = await writeToPersistence(
        output1,
        JSON.stringify({ identity: value1 }, null, 2)
    );

    const resource2 = await writeToPersistence(
        output2,
        JSON.stringify({ identity: value2 }, null, 2)
    );

    return {
        outputMap: {
            [outputName1]: resource1,
            [outputName2]: resource2
        }
    };
}

app.post('/add', async (req: Request, res: Response) => {
    try {
        const { AddendOne, AddendTwo }: { [key: string]: ResourceJson } = req.body;
        const Sum: ResourcePotentialOutputJson = req.body['Sum'];
        const [inputOne, inputTwo] = await readTwoInputs(AddendOne, AddendTwo);
        const result = inputOne + inputTwo;
        const response = await writeSingleOutput(Sum, result, 'Sum');
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});


app.post('/subtract', async (req: Request, res: Response) => {
    try {
        const { Minuend, Subtrahend }: { [key: string]: ResourceJson } = req.body;
        const Difference: ResourcePotentialOutputJson = req.body['Difference'];
        const [inputOne, inputTwo] = await readTwoInputs(Minuend, Subtrahend);
        const result = inputOne - inputTwo;
        const response = await writeSingleOutput(Difference, result, 'Difference');
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});


app.post('/multiply', async (req: Request, res: Response) => {
    try {
        const { Multiplicand, Multiplier }: { [key: string]: ResourceJson } = req.body;
        const Product: ResourcePotentialOutputJson = req.body['Product'];
        const [inputOne, inputTwo] = await readTwoInputs(Multiplicand, Multiplier);
        const result = inputOne * inputTwo;
        const response = await writeSingleOutput(Product, result, 'Product');
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});


app.post('/divide', async (req: Request, res: Response) => {
    try {
        const { Dividend, Divisor }: { [key: string]: ResourceJson } = req.body;
        const Quotient: ResourcePotentialOutputJson = req.body['Quotient'];
        const Remainder: ResourcePotentialOutputJson = req.body['Remainder'];
        const [inputOne, inputTwo] = await readTwoInputs(Dividend, Divisor);
        const quotientResult = Math.floor(inputOne / inputTwo);
        const remainderResult = inputOne % inputTwo;
        const response = await writeTwoOutputs(Quotient, quotientResult, 'Quotient', Remainder, remainderResult, 'Remainder');
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'Calculator server is running' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Calculator server is running on port ${PORT}`);
});


export default app;
