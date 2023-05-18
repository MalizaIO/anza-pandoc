const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Replace with your own Google Cloud Storage bucket name
const bucketName = 'anza-maliza.appspot.com';
const storage = new Storage();

// Define the valid output extensions
const validOutputExtensions = {
  asciidoc: 'adoc',
  asciidoctor: 'adoc',
  beamer: 'pdf',
  bibtex: 'bib',
  biblatex: 'bib',
  chunkedhtml: 'html',
  commonmark: 'md',
  commonmark_x: 'md',
  context: 'ctx',
  csljson: 'json',
  docbook: 'xml',
  docbook4: 'xml',
  docbook5: 'xml',
  docx: 'docx',
  dokuwiki: 'txt',
  epub: 'epub',
  epub3: 'epub',
  epub2: 'epub',
  fb2: 'fb2',
  gfm: 'md',
  haddock: 'html',
  html: 'html',
  html5: 'html',
  html4: 'html',
  icml: 'icml',
  ipynb: 'ipynb',
  jats_archiving: 'xml',
  jats_articleauthoring: 'xml',
  jats_publishing: 'xml',
  jats: 'xml',
  jira: 'txt',
  json: 'json',
  latex: 'tex',
  man: 'man',
  markdown: 'md',
  markdown_mmd: 'md',
  markdown_phpextra: 'md',
  markdown_strict: 'md',
  markua: 'md',
  mediawiki: 'txt',
  ms: 'ms',
  muse: 'muse',
  native: 'hs',
  odt: 'odt',
  opml: 'opml',
  opendocument: 'odt',
  org: 'org',
  pdf: 'pdf',
  plain: 'txt',
  pptx: 'pptx',
  rst: 'rst',
  rtf: 'rtf',
  texinfo: 'texinfo',
  textile: 'txt',
  slideous: 'html',
  slidy: 'html',
  dzslides: 'html',
  revealjs: 'html',
  s5: 'html',
  tei: 'xml',
  typst: 'typst',
  xwiki: 'txt',
  zimwiki: 'txt',
};

app.post('/', upload.single('file'), async (req, res) => {
  const userIdentifier = req.body.userIdentifier;
  const inputContent = req.body.content;
  const inputMethod = req.body.inputMethod;
  const inputFormat = req.body.inputFormat || 'markdown';
  const outputFormat = req.body.outputFormat;
  const inputFile = req.file ? req.file.path : null;
  const inputFileNameWithExtension = req.file ? req.file.originalname : null;
  const fileName = inputFileNameWithExtension
    ? path.parse(inputFileNameWithExtension).name
    : null;

    if (
        (inputMethod === 'content' && !inputContent) ||
        (inputMethod === 'file' && !inputFile) ||
        (inputMethod === 'fileUrl' && !req.body.fileUrl) ||
        !inputMethod ||
        !outputFormat ||
        !userIdentifier
      ) {
        res.status(400).send('Invalid request parameters. The required fields for the chosen input method, outputFormat, and userIdentifier must be provided.');
        return;
      }

  const userFolder = `${userIdentifier}/`;
  const folderExists = await storage.bucket(bucketName).file(userFolder).exists();
  if (!folderExists[0]) {
    await storage.bucket(bucketName).file(userFolder).save('');
  }

  // Determine the input source (content, file upload, or file URL)
  let inputSource;
  let inputExtension;

  if (inputMethod === 'content') {
    // Use content as input
    if (!inputContent) {
      res.status(400).send('Invalid request parameters. Content must be provided when using inputMethod: content.');
      return;
    }
    inputSource = inputContent;
    inputExtension = 'md';
  } else if (inputMethod === 'file') {
    // Use uploaded file as input
    if (!inputFile) {
      res.status(400).send('Invalid request parameters. File must be uploaded when using inputMethod: file.');
      return;
    }
    inputSource = inputFile;
    inputExtension = path.extname(inputFileNameWithExtension).toLowerCase().substr(1);
  } else if (inputMethod === 'fileUrl') {
    // Use file URL as input
    if (!req.body.fileUrl) {
      res.status(400).send('Invalid request parameters. File URL must be provided when using inputMethod: fileUrl.');
      return;
    }
    try {
      const response = await axios.get(req.body.fileUrl, { responseType: 'arraybuffer' });
      const tempInputDir = '/app/input';
      const tempInputFile = `${tempInputDir}/input.${inputExtension}`;

      if (!fs.existsSync(tempInputDir)) {
        fs.mkdirSync(tempInputDir);
      }

      fs.writeFileSync(tempInputFile, Buffer.from(response.data));

      inputSource = tempInputFile;
    } catch (error) {
      res.status(500).send(`Error fetching file from URL: ${error.message}`);
      return;
    }
  } else {
    res.status(400).send('Invalid request parameters. Invalid inputMethod provided.');
    return;
  }

  // Determine the output extension based on the valid extensions
  const outputExtension = validOutputExtensions[outputFormat] || outputFormat;
  const outputFileName = `${fileName || 'converted'}.${outputExtension}`;
  const outputFile = path.join('/app/output', outputFileName);

  execFile('pandoc', ['-f', inputFormat, '-t', outputFormat, inputSource, '-o', outputFile], async (error) => {
    if (error) {
      res.status(500).send(`Pandoc conversion failed: ${error.message}`);
    } else {
      try {
        await storage.bucket(bucketName).upload(outputFile, {
          destination: path.join(userFolder, outputFileName),
          public: true,
        });
        const downloadUrl = `https://storage.googleapis.com/${bucketName}/${userFolder}${outputFileName}`;
        res.send({ download_url: downloadUrl });
      } catch (uploadError) {
        console.error(uploadError);
        res.status(500).send('Error uploading file to Google Cloud Storage');
      } finally {
        if (inputFile) {
          fs.unlink(inputFile, (deleteInputError) => {
            if (deleteInputError) {
              console.error(deleteInputError);
            }
          });
        }
        fs.unlink(outputFile, (deleteOutputError) => {
          if (deleteOutputError) {
            console.error(deleteOutputError);
          }
        });
      }
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
