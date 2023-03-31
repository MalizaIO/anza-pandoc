const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/', upload.single('file'), (req, res) => {
    const inputFormat = req.body.input_format;
    const outputFormat = req.body.output_format;
    const inputFile = req.file.path;
    const outputFile = path.join('output', `output.${outputFormat}`);

    if (!inputFormat || !outputFormat) {
        res.status(400).send('Both input_format and output_format must be provided.');
        return;
    }

    execFile(
        'pandoc',
        ['-f', inputFormat, '-t', outputFormat, inputFile, '-o', outputFile],
        (error) => {
            if (error) {
                res.status(500).send(`Pandoc conversion failed: ${error.message}`);
            } else {
                res.sendFile(path.resolve(outputFile), () => {
                    fs.unlink(inputFile, () => {});
                    fs.unlink(outputFile, () => {});
                });
            }
        }
    );
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
