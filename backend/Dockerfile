FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Set environment variables
ENV HF_HOME=/tmp/huggingface
ENV HF_HUB_DISABLE_PROGRESS_BARS=1
ENV TOKENIZERS_PARALLELISM=false
ENV PYTHONUNBUFFERED=1

# Expose port 7860 (HuggingFace Spaces default)
EXPOSE 7860

# Start the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]