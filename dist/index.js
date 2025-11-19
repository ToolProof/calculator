import express from 'express';
import { readFromCAFS, writeToCAFS } from './ioInterface.js';
const app = express();
const PORT = Number(process.env.PORT) || 8080;
// Middleware to parse JSON bodies
app.use(express.json());
app.get('/', (req, res) => {
    // Keep root endpoint side-effect free to avoid edge 503s when storage is unavailable.
    res.json({ status: 'OK', message: 'Numerical service is up and running.', timestamp: new Date().toISOString() });
});
// Safe CAFS debugging endpoint: GET /test-cafs?id=<RER-or-path>
app.get('/test-cafs', async (req, res) => {
    try {
        const id = req.query.id;
        if (typeof id !== 'string' || !id) {
            return res.status(400).json({ error: "Missing required query parameter 'id'" });
        }
        const value = await readFromCAFS(id);
        return res.json({ id, value });
    }
    catch (error) {
        return res.status(500).json({ error: `CAFS read failed: ${error}` });
    }
});
app.post('/add', async (req, res) => {
    try {
        const { "ROLE-EdqLSRLtD3a6jx3ZnLc7": addendOne, // ATTENTION
        "ROLE-vp306rfl9kJefQglzKsw": addendTwo, // ATTENTION
        "ROLE-U6VmyXU9oWlths6i0cJL": sum // ATTENTION
         } = req.body;
        /*  if (typeof addendOne !== 'string' || typeof addendTwo !== 'string') {
             return res.status(400).json({
                 error: 'Both addendOne and addendTwo must be file paths (strings).'
             });
         } */
        // Read values from GCS files
        console.log("addendOne -> ", addendOne);
        const valueA = await readFromCAFS(addendOne.path);
        console.log("value A -> ", valueA);
        const valueB = await readFromCAFS(addendTwo.path);
        console.log("valueB -> ", valueB);
        // Perform calculation
        const result = valueA + valueB;
        console.log("result -> ", result);
        // Store result
        const result2 = await writeToCAFS(sum.id, sum.typeId, sum.roleId, sum.executionId, result);
        console.log("result2 -> ", result2);
        res.json({
            outputs: {
                'ROLE-U6VmyXU9oWlths6i0cJL': {
                    path: result2.storagePath,
                }
            },
        });
    }
    catch (error) {
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
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Numerical server is running' });
});
// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Numerical server is running on port ${PORT}`);
});
export default app;
