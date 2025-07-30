import express, { Request, Response } from 'express';
import { readNumberFromGCS, writeNumberToGCS } from './gcs-utils';

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Interface for file path operation requests
interface AdditionOperation {
    addend_1: string;    // First addend file path
    addend_2: string;    // Second addend file path
}

interface SubtractionOperation {
    minuend: string;     // Number being subtracted from
    subtrahend: string;  // Number being subtracted
}

interface MultiplicationOperation {
    multiplicand: string; // Number being multiplied
    multiplier: string;   // Number multiplying by
}

interface DivisionOperation {
    dividend: string;    // Number being divided
    divisor: string;     // Number dividing by
}

// Add numbers endpoint
app.post('/add_numbers', async (req: Request, res: Response) => {
    try {
        const { addend_1, addend_2 }: AdditionOperation = req.body;

        if (typeof addend_1 !== 'string' || typeof addend_2 !== 'string') {
            return res.status(400).json({
                error: 'Both addend_1 and addend_2 must be file paths (strings).'
            });
        }

        // Read values from GCS files
        const valueA = await readNumberFromGCS(addend_1);
        const valueB = await readNumberFromGCS(addend_2);

        // Perform calculation
        const result = valueA + valueB;

        const timestamp = new Date().toISOString();

        // Store result in GCS
        const outputPath = `calculator/add_numbers/sum_${timestamp}.json`;
        await writeNumberToGCS(outputPath, result);

        res.json({
            outputs: {
                sum: {
                    path: outputPath,
                    // ATTENTION_RONAK: Here you can see how add_numbers returns metadata in accordance with the job specification in mocks/calculator.ts in the updohilo-ts repo. You don't need to do anything here. I'm guiding you here just for your understanding.
                    metadata: {
                        result: result,
                    }
                }
            },
        });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});

// Subtract numbers endpoint
app.post('/subtract_numbers', async (req: Request, res: Response) => {
    try {
        const { minuend, subtrahend }: SubtractionOperation = req.body;

        if (typeof minuend !== 'string' || typeof subtrahend !== 'string') {
            return res.status(400).json({
                error: 'Both minuend and subtrahend must be file paths (strings).'
            });
        }

        // Read values from GCS files
        const minuendValue = await readNumberFromGCS(minuend);
        const subtrahendValue = await readNumberFromGCS(subtrahend);

        // Perform calculation (minuend - subtrahend)
        const result = minuendValue - subtrahendValue;

        const timestamp = new Date().toISOString();

        // Store result in GCS
        const outputPath = `calculator/subtract_numbers/difference_${timestamp}.json`;
        await writeNumberToGCS(outputPath, result);

        res.json({
            outputs: {
                difference: {
                    path: outputPath,
                    metadata: {
                        result: result,
                    }
                }
            },
        });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});

// Multiply numbers endpoint
app.post('/multiply_numbers', async (req: Request, res: Response) => {
    try {
        const { multiplicand, multiplier }: MultiplicationOperation = req.body;

        if (typeof multiplicand !== 'string' || typeof multiplier !== 'string') {
            return res.status(400).json({
                error: 'Both multiplicand and multiplier must be file paths (strings).'
            });
        }

        // Read values from GCS files
        const multiplicandValue = await readNumberFromGCS(multiplicand);
        const multiplierValue = await readNumberFromGCS(multiplier);

        // Perform calculation
        const result = multiplicandValue * multiplierValue;

        const timestamp = new Date().toISOString();

        // Store result in GCS
        const outputPath = `calculator/multiply_numbers/product_${timestamp}.json`;
        await writeNumberToGCS(outputPath, result);

        res.json({
            outputs: {
                product: {
                    path: outputPath,
                    metadata: {
                        result: result,
                    }
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});

// Divide numbers endpoint
app.post('/divide_numbers', async (req: Request, res: Response) => {
    try {
        const { dividend, divisor }: DivisionOperation = req.body;

        if (typeof dividend !== 'string' || typeof divisor !== 'string') {
            return res.status(400).json({
                error: 'Both dividend and divisor must be file paths (strings).'
            });
        }

        // Read values from GCS files
        const dividendValue = await readNumberFromGCS(dividend);
        const divisorValue = await readNumberFromGCS(divisor);

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
        const outputPath = `calculator/divide_numbers/quotient_${timestamp}.json`;
        await writeNumberToGCS(outputPath, result);

        res.json({
            outputs: {
                quotient: {
                    path: outputPath,
                    metadata: {
                        result: result,
                    }
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
