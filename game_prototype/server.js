const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('.'));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.get('/list-files/:dir', (req, res) => {
    const dir = req.params.dir;
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${dir}:`, err);
            res.status(500).send('Error reading directory');
            return;
        }
        const txtFiles = files.filter(file => file.endsWith('.txt'));
        console.log(`Files in ${dir}:`, txtFiles);
        res.json(txtFiles);
    });
});

app.get('/read-file/:dir/:file', (req, res) => {
    const filePath = path.join(req.params.dir, req.params.file);
    const maxChars = 10000; // Adjust this number to control how many characters to read

    fs.open(filePath, 'r', (err, fd) => {
        if (err) {
            console.error(`Error opening file ${filePath}:`, err);
            res.status(500).send('Error opening file');
            return;
        }

        const buffer = Buffer.alloc(maxChars);
        fs.read(fd, buffer, 0, maxChars, 0, (err, bytesRead, buffer) => {
            if (err) {
                console.error(`Error reading file ${filePath}:`, err);
                res.status(500).send('Error reading file');
                return;
            }

            const data = buffer.toString('utf8', 0, bytesRead);
            console.log(`Read ${bytesRead} characters from ${filePath}`);
            res.send(data);

            fs.close(fd, (err) => {
                if (err) console.error(`Error closing file ${filePath}:`, err);
            });
        });
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});