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
        /*  if (typeof addendOne !== 'string' || typeof addendTwo !== 'string') {
             return res.status(400).json({
                 error: 'Both addendOne and addendTwo must be file paths (strings).'
             });
         } */
        // Read values from GCS files
        const valueA = await readFromCAFS(addendOne.path);
        const valueB = await readFromCAFS(addendTwo.path);
        // Perform calculation
        const result = valueA + valueB;
        // Store result
        const result2 = await writeToCAFS(sum.id, sum.typeId, sum.creationContext.roleId, sum.creationContext.executionId, result);
        res.json({
            outputs: {
                'ROLE-W1ifaHcjcT0JhqH5AjpO': {
                    path: result2.storagePath,
                    timestamp: result2.timestamp
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
