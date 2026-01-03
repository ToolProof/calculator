import { ResourceJson } from '@toolproof-npm/schema';
import express, { Request, Response } from 'express';
import { readFromCAFS, writeToCAFS } from './ioInterface.js';


const app: express.Application = express();
const PORT = Number(process.env.PORT) || 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Helper function to read two input values from CAFS
async function readTwoInputs(input1: ResourceJson, input2: ResourceJson): Promise<[number, number]> {
    const value1 = await readFromCAFS(input1.path);
    const value2 = await readFromCAFS(input2.path);
    return [value1, value2];
}

// Helper function to write a single output to CAFS and format response
async function writeSingleOutput(output: ResourceJson, value: number, outputName: string) {
    const storageResult = await writeToCAFS(
        output as any, // Cast to potential-output (it has all required fields)
        JSON.stringify({ identity: value }, null, 2)
    );

    return {
        outputs: {
            [outputName]: {
                success: storageResult.success,
                path: storageResult.path
            }
        }
    };
}

// Helper function to write two outputs to CAFS and format response
async function writeTwoOutputs(
    output1: ResourceJson,
    value1: number,
    outputName1: string,
    output2: ResourceJson,
    value2: number,
    outputName2: string
) {
    const storage1 = await writeToCAFS(
        output1 as any, // Cast to potential-output (it has all required fields)
        JSON.stringify({ identity: value1 }, null, 2)
    );

    const storage2 = await writeToCAFS(
        output2 as any, // Cast to potential-output (it has all required fields)
        JSON.stringify({ identity: value2 }, null, 2)
    );

    return {
        outputs: {
            [outputName1]: {
                path: storage1.path,
                success: storage1.success
            },
            [outputName2]: {
                path: storage2.path,
                success: storage2.success
            }
        }
    };
}

app.post('/add', async (req: Request, res: Response) => {
    try {
        const { AddendOne, AddendTwo, Sum }: { [key: string]: ResourceJson } = req.body;
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
        const { Minuend, Subtrahend, Difference }: { [key: string]: ResourceJson } = req.body;
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
        const { Multiplicand, Multiplier, Product }: { [key: string]: ResourceJson } = req.body;
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
        const { Dividend, Divisor, Quotient, Remainder }: { [key: string]: ResourceJson } = req.body;
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
