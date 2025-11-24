import { ResourceDataJson } from '@toolproof-npm/schema';
import express, { Request, Response } from 'express';
import { readFromCAFS, writeToCAFS } from './ioInterface.js';


const app = express();
const PORT = Number(process.env.PORT) || 8080;

// Middleware to parse JSON bodies
app.use(express.json());

app.post('/add', async (req: Request, res: Response) => {
    try {
        const {
            AddendOne,
            AddendTwo,
            Sum
        }: { [key: string]: ResourceDataJson } = req.body;

        // Read values from GCS files
        const valueOne = await readFromCAFS(AddendOne.path);
        const valueTwo = await readFromCAFS(AddendTwo.path);

        // Perform calculation
        const calculationResult = valueOne + valueTwo;

        // Store result
        const storageResult = await writeToCAFS(
            Sum.id, 
            Sum.typeId, 
            Sum.creationContext.roleId, 
            Sum.creationContext.executionId,
            calculationResult
        );

        res.json({
            outputs: {
                'Sum': {
                    path: storageResult.storagePath,
                    timestamp: storageResult.timestamp
                }
            },
        });
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
