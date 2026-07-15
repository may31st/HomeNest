FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for compilation (needed for FAISS, ChromaDB, Underthesea, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./

# Flask and Flask-Cors are missing from requirements.txt but needed by app.py
RUN pip install --no-cache-dir flask flask-cors

# Install remaining Python requirements
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["python", "app.py"]
