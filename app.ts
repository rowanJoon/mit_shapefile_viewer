import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '')));

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
