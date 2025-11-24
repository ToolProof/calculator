import express from 'express';
import { readFromCAFS, writeToCAFS } from './ioInterface.js';
const app = express();
const PORT = Number(process.env.PORT) || 8080;
// Middleware to parse JSON bodies
app.use(express.json());
app.post('/add', async (req, res) => {
    try {
        const { "ROLE-SKHJzzXuPj9d40xE05r7": addendOne, // ATTENTION
        "ROLE-ZO35pYgen6c6byPMIIXn": addendTwo, // ATTENTION
        "ROLE-W1ifaHcjcT0JhqH5AjpO": sum // ATTENTION
         } = req.body;
        // Read values from GCS files
        const valueOne = await readFromCAFS(addendOne.path);
        const valueTwo = await readFromCAFS(addendTwo.path);
        // Perform calculation
        const calculationResult = valueOne + valueTwo;
        // Store result
        const storageResult = await writeToCAFS(sum.id, sum.typeId, sum.creationContext.roleId, sum.creationContext.executionId, calculationResult);
        res.json({
            outputs: {
                'ROLE-W1ifaHcjcT0JhqH5AjpO': {
                    path: storageResult.storagePath,
                    timestamp: storageResult.timestamp
                }
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Numerical server is running' });
});
// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Numerical server is running on port ${PORT}`);
});
export default app;
