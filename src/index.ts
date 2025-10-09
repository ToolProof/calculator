import express, { Request, Response } from 'express';
import { readFromCAFS, writeToCAFS } from './ioInterface.js';


const app = express();
const PORT = Number(process.env.PORT) || 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Interface for file path operation requests
interface AdditionOperation {
    addendOne: string;
    addendTwo: string;
}

interface SubtractionOperation {
    minuend: string;
    subtrahend: string;
}

interface MultiplicationOperation {
    multiplicand: string;
    multiplier: string;
}

interface DivisionOperation {
    dividend: string;
    divisor: string;
}

app.get('/', (req: Request, res: Response) => {
    // Keep root endpoint side-effect free to avoid edge 503s when storage is unavailable.
    res.json({ status: 'OK', message: 'Numerical service is up', timestamp: new Date().toISOString() });
});

// Safe CAFS debugging endpoint: GET /test-cafs?id=<RER-or-path>
app.get('/test-cafs', async (req: Request, res: Response) => {
    try {
        const id = req.query.id;
        if (typeof id !== 'string' || !id) {
            return res.status(400).json({ error: "Missing required query parameter 'id'" });
        }
        const value = await readFromCAFS(id);
        return res.json({ id, value });
    } catch (error) {
        return res.status(500).json({ error: `CAFS read failed: ${error}` });
    }
});

app.post('/add', async (req: Request, res: Response) => {
    try {
        const {
            "RER-456GInRLCbpCes1478hb": addendOne, // ATTENTION
            "RER-KCL5s1QfdSJ7SRUqxlWj": addendTwo, // ATTENTION
            "RER-0LD9l1uRbrdQLkxGFc6k": resourceId // ATTENTION
        } = req.body;

        if (typeof addendOne !== 'string' || typeof addendTwo !== 'string') {
            return res.status(400).json({
                error: 'Both addendOne and addendTwo must be file paths (strings).'
            });
        }

        // Read values from GCS files
        const valueA = await readFromCAFS(addendOne);
        const valueB = await readFromCAFS(addendTwo);

        // Perform calculation
        const result = valueA + valueB;

        // Store result
        const result2 = await writeToCAFS(resourceId, result);

        const timestamp = new Date().toISOString();

        res.json({
            outputs: {
                'RER-0LD9l1uRbrdQLkxGFc6k': { // ATTENTION
                    path: result2.storagePath,
                    timestamp
                }
            },
        });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});

/* app.post('/multiply', async (req: Request, res: Response) => {
    try {
        const { multiplicand, multiplier }: MultiplicationOperation = req.body;

        if (typeof multiplicand !== 'string' || typeof multiplier !== 'string') {
            return res.status(400).json({
                error: 'Both multiplicand and multiplier must be file paths (strings).'
            });
        }

        // Read values from GCS files
        const multiplicandValue = await readFromGCS(multiplicand);
        const multiplierValue = await readFromGCS(multiplier);

        // Perform calculation
        const result = multiplicandValue * multiplierValue;

        // Store result in GCS
        const outputPath = `integers/${result}.json`;
        await writeToGCS(outputPath, result);

        const timestamp = new Date().toISOString();

        res.json({
            outputs: {
                'RER-13bTni46ZIs6FhqglRQY': { // ATTENTION
                    path: outputPath,
                    timestamp
                }
            },
        });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
}); */

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'Numerical server is running' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Numerical server is running on port ${PORT}`);
});


export default app;
