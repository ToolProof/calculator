import express from 'express';
import { readFromPersistence, writeToPersistence } from './persistenceInterface.js';
const app = express();
const PORT = Number(process.env.PORT) || 8080;
// Middleware to parse JSON bodies
app.use(express.json());
// Helper function to read two input values from CAFS
async function readTwoInputs(input1, input2) {
    const value1 = await readFromPersistence(input1.path);
    const value2 = await readFromPersistence(input2.path);
    return [value1, value2];
}
// Helper function to write a single output to CAFS and format response
async function writeSingleOutput(output, value, outputName) {
    const resource = await writeToPersistence(output, JSON.stringify({ identity: value }, null, 2));
    return {
        outputMap: {
            [outputName]: resource
        }
    };
}
// Helper function to write an error output to CAFS and format response
async function writeErrorOutput(output, name, description, details) {
    const content = {
        name,
        description,
        ...(details ? { details } : {}),
    };
    const resource = await writeToPersistence(output, JSON.stringify(content, null, 2));
    return {
        outputMap: {
            ErrorOutput: resource,
        }
    };
}
// Helper function to write two outputs to CAFS and format response
async function writeTwoOutputs(output1, value1, outputName1, output2, value2, outputName2) {
    const resource1 = await writeToPersistence(output1, JSON.stringify({ identity: value1 }, null, 2));
    const resource2 = await writeToPersistence(output2, JSON.stringify({ identity: value2 }, null, 2));
    return {
        outputMap: {
            [outputName1]: resource1,
            [outputName2]: resource2
        }
    };
}
app.post('/add', async (req, res) => {
    try {
        const { AddendOne, AddendTwo } = req.body;
        const Sum = req.body['Sum'];
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
        const { Minuend, Subtrahend } = req.body;
        const Difference = req.body['Difference'];
        const ErrorOutput = req.body['ErrorOutput'];
        const [inputOne, inputTwo] = await readTwoInputs(Minuend, Subtrahend);
        if (inputTwo > inputOne) {
            const response = await writeErrorOutput(ErrorOutput, 'SubtractInvalidInput', `Subtrahend (${inputTwo}) is larger than minuend (${inputOne}); subtraction would result in a negative value.`, {
                minuend: inputOne,
                subtrahend: inputTwo,
            });
            res.json(response);
            return;
        }
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
        const { Multiplicand, Multiplier } = req.body;
        const Product = req.body['Product'];
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
        const { Dividend, Divisor } = req.body;
        const Quotient = req.body['Quotient'];
        const Remainder = req.body['Remainder'];
        const ErrorOutput = req.body['ErrorOutput'];
        const [inputOne, inputTwo] = await readTwoInputs(Dividend, Divisor);
        if (inputTwo === 0) {
            const response = await writeErrorOutput(ErrorOutput, 'DivideByZero', `Cannot divide by zero (dividend ${inputOne}, divisor ${inputTwo}).`, {
                dividend: inputOne,
                divisor: inputTwo,
            });
            res.json(response);
            return;
        }
        const quotientResult = Math.floor(inputOne / inputTwo);
        const remainderResult = inputOne % inputTwo;
        const response = await writeTwoOutputs(Quotient, quotientResult, 'Quotient', Remainder, remainderResult, 'Remainder');
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});
app.post('/double', async (req, res) => {
    try {
        const { n } = req.body;
        const doubled = req.body['doubled'];
        const inputValue = await readFromPersistence(n.path);
        const result = inputValue * 2;
        const response = await writeSingleOutput(doubled, result, 'doubled');
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Calculator server is running' });
});
// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Calculator server is running on port ${PORT}`);
});
export default app;
