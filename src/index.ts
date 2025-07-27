import express, { Request, Response } from 'express';
import { readNumberFromGCS, writeNumberToGCS } from './gcs-utils';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Interface for file path operation requests
interface FilePathOperation {
    a: string;    // First operand file path
    b: string;    // Second operand file path
}

// Add numbers endpoint
app.post('/add_numbers', async (req: Request, res: Response) => {
    try {
        const { a, b }: FilePathOperation = req.body;
        
        // Alias to proper mathematical terms
        const addend_1 = a;
        const addend_2 = b;

        if (typeof addend_1 !== 'string' || typeof addend_2 !== 'string') {
            return res.status(400).json({
                error: 'Both a and b must be file paths (strings).'
            });
        }

        // Read values from GCS files
        const valueA = await readNumberFromGCS(addend_1);
        const valueB = await readNumberFromGCS(addend_2);

        // Perform calculation
        const result = valueA + valueB;

        const timestamp = new Date().toISOString();

        // Store result in GCS
        const resultPath = `calculator/add_numbers/sum_${timestamp}.json`;
        await writeNumberToGCS(resultPath, result);

        res.json({
            result,
            resultPath,
            operation: 'addition',
            inputs: { addend_1, addend_2 }
        });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});

// Subtract numbers endpoint
app.post('/subtract_numbers', async (req: Request, res: Response) => {
    try {
        const { a, b }: FilePathOperation = req.body;
        
        // Alias to proper mathematical terms
        const minuend = a;      // Number being subtracted from
        const subtrahend = b;   // Number being subtracted

        if (typeof minuend !== 'string' || typeof subtrahend !== 'string') {
            return res.status(400).json({
                error: 'Both a and b must be file paths (strings).'
            });
        }

        // Read values from GCS files
        const minuendValue = await readNumberFromGCS(minuend);
        const subtrahendValue = await readNumberFromGCS(subtrahend);

        // Perform calculation (minuend - subtrahend)
        const result = minuendValue - subtrahendValue;

        const timestamp = new Date().toISOString();

        // Store result in GCS
        const resultPath = `calculator/subtract_numbers/difference_${timestamp}.json`;
        await writeNumberToGCS(resultPath, result);

        res.json({
            result,
            resultPath,
            operation: 'subtraction',
            inputs: { minuend, subtrahend }
        });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});

// Multiply numbers endpoint
app.post('/multiply_numbers', async (req: Request, res: Response) => {
    try {
        const { a, b }: FilePathOperation = req.body;
        
        // Alias to proper mathematical terms
        const multiplicand = a;  // Number being multiplied
        const multiplier = b;    // Number multiplying by

        if (typeof multiplicand !== 'string' || typeof multiplier !== 'string') {
            return res.status(400).json({
                error: 'Both a and b must be file paths (strings).'
            });
        }

        // Read values from GCS files
        const multiplicandValue = await readNumberFromGCS(multiplicand);
        const multiplierValue = await readNumberFromGCS(multiplier);

        // Perform calculation
        const result = multiplicandValue * multiplierValue;

        const timestamp = new Date().toISOString();

        // Store result in GCS
        const resultPath = `calculator/multiply_numbers/product_${timestamp}.json`;
        await writeNumberToGCS(resultPath, result);

        res.json({
            result,
            resultPath,
            operation: 'multiplication',
            inputs: { multiplicand, multiplier }
        });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});

// Divide numbers endpoint
app.post('/divide_numbers', async (req: Request, res: Response) => {
    try {
        const { a, b }: FilePathOperation = req.body;
        
        // Alias to proper mathematical terms
        const dividend = a;   // Number being divided
        const divisor = b;    // Number dividing by

        if (typeof dividend !== 'string' || typeof divisor !== 'string') {
            return res.status(400).json({
                error: 'Both a and b must be file paths (strings).'
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
        const resultPath = `calculator/divide_numbers/quotient_${timestamp}.json`;
        await writeNumberToGCS(resultPath, result);

        res.json({
            result,
            resultPath,
            operation: 'division',
            inputs: { dividend, divisor }
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
app.listen(PORT, () => {
    console.log(`Calculator server is running on port ${PORT}`);
});

export default app;
