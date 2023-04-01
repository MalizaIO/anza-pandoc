const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Replace with your own Google Cloud Storage bucket name
const bucketName = 'anza-maliza.appspot.com';
const storage = new Storage();

app.post('/', upload.single('file'), async (req, res) => {
    const inputFormat = req.body.input_format;
    const outputFormat = req.body.output_format;
    const inputFile = req.file.path;
    const outputFile = path.join('/app/output', `output.${outputFormat}`);

    if (!inputFormat || !outputFormat) {
        res.status(400).send('Both input_format and output_format must be provided.');
        return;
    }

    execFile(
        'pandoc',
        ['-f', inputFormat, '-t', outputFormat, inputFile, '-o', outputFile],
        async (error) => {
            if (error) {
                res.status(500).send(`Pandoc conversion failed: ${error.message}`);
            } else {
                try {
                    const [file] = await storage.bucket(bucketName).upload(outputFile, {
                        destination: path.basename(outputFile),
                        public: true,
                    });
                    const downloadUrl = file.metadata.mediaLink;
                    res.send({ download_url: downloadUrl });
                } catch (uploadError) {
                    console.error(uploadError);
                    res.status(500).send('Error uploading file to Google Cloud Storage');
                } finally {
                    fs.unlink(inputFile, (deleteInputError) => {
                        if (deleteInputError) {
                            console.error(deleteInputError);
                        }
                    });
                    fs.unlink(outputFile, (deleteOutputError) => {
                        if (deleteOutputError) {
                            console.error(deleteOutputError);
                        }
                    });
                }
            }
        }
    );
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
