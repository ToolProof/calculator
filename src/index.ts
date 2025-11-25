import { ResourceDataJson } from '@toolproof-npm/schema';
import express, { Request, Response } from 'express';
import { readFromCAFS, writeToCAFS } from './ioInterface.js';


const app: express.Application = express();
const PORT = Number(process.env.PORT) || 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Helper function to read two input values from CAFS
async function readTwoInputs(input1: ResourceDataJson, input2: ResourceDataJson): Promise<[number, number]> {
    const value1 = await readFromCAFS(input1.path);
    const value2 = await readFromCAFS(input2.path);
    return [value1, value2];
}

// Helper function to write a single output to CAFS and format response
async function writeSingleOutput(output: ResourceDataJson, value: number, outputName: string) {
    const storageResult = await writeToCAFS(
        {
            id: output.id,
            typeId: output.typeId,
            creationContext: {
                roleId: output.creationContext.roleId,
                executionId: output.creationContext.executionId
            }
        },
        JSON.stringify({ identity: value })
    );

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
async function writeTwoOutputs(
    output1: ResourceDataJson,
    value1: number,
    outputName1: string,
    output2: ResourceDataJson,
    value2: number,
    outputName2: string
) {
    const storage1 = await writeToCAFS(
        {
            id: output1.id,
            typeId: output1.typeId,
            creationContext: {
                roleId: output1.creationContext.roleId,
                executionId: output1.creationContext.executionId
            }
        },
        JSON.stringify({ identity: value1 })
    );

    const storage2 = await writeToCAFS(
        {
            id: output2.id,
            typeId: output2.typeId,
            creationContext: {
                roleId: output2.creationContext.roleId,
                executionId: output2.creationContext.executionId
            }
        },
        JSON.stringify({ identity: value2 })
    );

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

app.post('/add', async (req: Request, res: Response) => {
    try {
        const { AddendOne, AddendTwo, Sum }: { [key: string]: ResourceDataJson } = req.body;
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
        const { Minuend, Subtrahend, Difference }: { [key: string]: ResourceDataJson } = req.body;
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
        const { Multiplicand, Multiplier, Product }: { [key: string]: ResourceDataJson } = req.body;
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
        const { Dividend, Divisor, Quotient, Remainder }: { [key: string]: ResourceDataJson } = req.body;
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
    res.json({ status: 'OK', message: 'Numerical server is running' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Numerical server is running on port ${PORT}`);
});


export default app;
