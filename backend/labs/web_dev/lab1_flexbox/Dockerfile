# Use a tiny Python image
FROM python:3.9-alpine

# Set the working directory
WORKDIR /app

# Install Flask AND Flask-CORS
RUN pip install flask flask-cors  # <--- CHANGED THIS LINE

# Copy the server code and the html templates
COPY app.py .
COPY templates ./templates

# Expose port 5000
EXPOSE 5000

# Start the app
CMD ["python", "app.py"]