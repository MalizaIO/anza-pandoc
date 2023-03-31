# Pandoc Cloudrun for Anza

Author: Harmon Amakobe

This project is a containerized Pandoc conversion service designed to be deployed on Google Cloud Run. The project is based on the [pandoc/dockerfiles](https://github.com/pandoc/dockerfiles) repository and uses the `pandoc/extra` image as the base image.

## Repository structure

```directory
.
├── .dockerignore
├── app.js
├── cloudbuild.yaml
├── Dockerfile
├── README.md
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

1. Run the container locally:

```shell
docker run -p 8080:8080 --rm pandoc-cloudrun-for-anza
```

1. Access the service at `http://localhost:8080/`

To deploy the application on Google Cloud Run, follow the [Google Cloud Run documentation](https://cloud.google.com/run/docs/quickstarts/build-and-deploy).
