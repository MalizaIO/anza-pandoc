# anza-pandoc

Author: Harmon Amakobe

anza-pandoc is a containerized Pandoc conversion service designed to be deployed on Google Cloud Run. I developed this for use with our Anza application and have open sourced it in case anyone else would like to use it. I had orginally forked the pandoc Github but have since extensively modified it. The project is based on the [pandoc/dockerfiles](https://github.com/pandoc/dockerfiles) repository and uses the `pandoc/extra` image as the base image.

## Test using cURL

Go into your chosen terminal and run the following:

```bash
curl -X POST -F "file=@INPUT_FILENAME" -F "input_format=INPUT_FORMAT" -F "output_format=OUTPUT_FORMAT" https://anza-pandoc-hbm333kvpq-uc.a.run.app
```

Replace INPUT_FILENAME with the path/to/your/input/file and make sure that you include the extension.

NOTE: I changed the code to output a download link to the output file - so you can omit "> OUTPUT_FILENAME" and it will spit out a link.

For input_format and output_format, please follow the [conventions set by pandoc](https://pandoc.org/MANUAL.html).

For example, in my terminal, I navigated to a folder that contains my resume as a docx file, and ran the following:

```bash
curl -F "input_format=docx" -F "output_format=markdown" -F "file=@resume.docx" https://anza-pandoc-hbm333kvpq-uc.a.run.app
```

## Repository structure

```directory
.
├── .dockerignore
├── app.js
├── cloudbuild.yaml
├── Dockerfile
├── package.json
├── package-lock.json
├── README.md
└── node_modules
    └── *dependencies* 
└── python-method
    ├── app.py
    └── Dockerfile
```

### Files

- `README.md`: This file, which provides an overview of the project and its contents.
- `.dockerignore`: A file specifying files and directories to be ignored when building the Docker image.
- `app.js`: The main Node.js application that provides the Pandoc conversion service using the Express framework.
- `cloudbuild.yaml`: The configuration file for Google Cloud Build, specifying the steps required to build, push, and deploy the container to Google Cloud Run.
- `Dockerfile`: The Dockerfile for building the container image based on the `pandoc/extra` image and including the Node.js application.

### Folders

- `python-method`: This folder contains an alternative implementation of the Pandoc conversion service using Python and Flask.
  - `app.py`: The main Python application that provides the Pandoc conversion service using the Flask framework.
  - `Dockerfile`: The Dockerfile for building the container image based on the `pandoc/extra` image and including the Python application.

## Usage

1. Build the Docker image:

```shell
docker build -t pandoc-cloudrun-for-anza .
```

2. Run the container locally:

```shell
docker run -p 8080:8080 --rm pandoc-cloudrun-for-anza
```

3. Access the service at `http://localhost:8080/`

To deploy the application on Google Cloud Run, follow the [Google Cloud Run documentation](https://cloud.google.com/run/docs/quickstarts/build-and-deploy).
