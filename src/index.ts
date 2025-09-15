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

app.post('/add-integers', async (req: Request, res: Response) => {
    try {
        const {
            "RER-B5tg4WGnbiGaN1DHE077": addendOne, // ATTENTION
            "RER-FAPcNx0TYeGOBJuyACzs": addendTwo // ATTENTION
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

        const timestamp = new Date().toISOString();

        // Store result in GCS
        const outputPath = `calculator/add-integers/sum-${timestamp}.json`;
        await writeToGCS(outputPath, result);

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


app.post('/subtract-integers', async (req: Request, res: Response) => {
    try {
        const { minuend, subtrahend }: SubtractionOperation = req.body;

        if (typeof minuend !== 'string' || typeof subtrahend !== 'string') {
            return res.status(400).json({
                error: 'Both minuend and subtrahend must be file paths (strings).'
            });
        }

        // Read values from GCS files
        const minuendValue = await readFromGCS(minuend);
        const subtrahendValue = await readFromGCS(subtrahend);

        // Perform calculation (minuend - subtrahend)
        const result = minuendValue - subtrahendValue;

        const timestamp = new Date().toISOString();

        // Store result in GCS
        const outputPath = `calculator/subtract-integers/difference-${timestamp}.json`;
        await writeToGCS(outputPath, result);

        res.json({
            outputs: {
                difference: {
                    path: outputPath,
                }
            },
        });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});


app.post('/multiply_integers', async (req: Request, res: Response) => {
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

        const timestamp = new Date().toISOString();

        // Store result in GCS
        const outputPath = `calculator/multiply-integers/product-${timestamp}.json`;
        await writeToGCS(outputPath, result);

        res.json({
            outputs: {
                product: {
                    path: outputPath,
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});


app.post('/divide_integers', async (req: Request, res: Response) => {
    try {
        const { dividend, divisor }: DivisionOperation = req.body;

        if (typeof dividend !== 'string' || typeof divisor !== 'string') {
            return res.status(400).json({
                error: 'Both dividend and divisor must be file paths (strings).'
            });
        }

        // Read values from GCS files
        const dividendValue = await readFromGCS(dividend);
        const divisorValue = await readFromGCS(divisor);

        // Check for division by zero
        if (divisorValue === 0) {
            return res.status(400).json({
                error: 'Division by zero is not allowed'
            });
        }

        // Perform calculation
        const result = dividendValue / divisorValue;

        const timestamp = new Date().toISOString();

        // Store result in GCS
        const outputPath = `calculator/divide_integers/quotient-${timestamp}.json`;
        await writeToGCS(outputPath, result);

        res.json({
            outputs: {
                quotient: {
                    path: outputPath,
                }
            }
        });
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
