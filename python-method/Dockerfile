# Base ##################################################################
ARG BASE_IMAGE=pandoc/extra:latest
FROM $BASE_IMAGE AS base
WORKDIR /app

# Install Flask and other dependencies
RUN apk --no-cache add py-pip python3 \
  && pip3 --no-cache-dir install Flask \
  && rm -rf /var/cache/apk/*

# Copy the Flask application
COPY app.py /app.py

# Expose port 8080
EXPOSE 8080

# Set the entry point to run the Flask application
ENTRYPOINT ["python3", "/app.py"]
