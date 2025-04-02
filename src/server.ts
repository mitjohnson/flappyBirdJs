import express, { Request, Response } from 'express';
import path from 'path';

const __dirname = import.meta.dirname;
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'src' directory
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

