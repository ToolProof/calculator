import express, { Request, Response } from 'express';
import { readFromGCS, writeToGCS } from './gcs-utils';

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

app.post('/add', async (req: Request, res: Response) => {
    try {
        const {
            "RER-456GInRLCbpCes1478hb": addendOne, // ATTENTION
            "RER-KCL5s1QfdSJ7SRUqxlWj": addendTwo // ATTENTION
        } = req.body;

        if (typeof addendOne !== 'string' || typeof addendTwo !== 'string') {
            return res.status(400).json({
                error: 'Both addendOne and addendTwo must be file paths (strings).'
            });
        }

        // Read values from GCS files
        const valueA = await readFromGCS(addendOne);
        const valueB = await readFromGCS(addendTwo);

        // Perform calculation
        const result = valueA + valueB;

        // Store result in GCS
        const outputPath = `${result}.json`;
        await writeToGCS(outputPath, result);

        const timestamp = new Date().toISOString();

        res.json({
            outputs: {
                'RER-0LD9l1uRbrdQLkxGFc6k': { // ATTENTION
                    path: outputPath,
                    timestamp
                }
            },
        });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});

app.post('/multiply', async (req: Request, res: Response) => {
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
        const outputPath = `${result}.json`;
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
