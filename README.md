# Calculator Server with Google Cloud Storage

A TypeScript Express server that performs mathematical operations on numbers stored in Google Cloud Storage files.

## Features

- **File-based Operations**: Numbers are read from and written to JSON files in Google Cloud Storage
- **Four Mathematical Operations**: Addition, subtraction, multiplication, and division
- **Input Validation**: Validates file paths and numeric values
- **Error Handling**: Comprehensive error handling for GCS operations and mathematical errors

## API Endpoints

All endpoints expect JSON requests with file paths and return results stored in GCS.

### POST `/add_numbers`
Adds two numbers from GCS files.

**Request Body:**
```json
{
  "a": "path/to/first/number.json",
  "b": "path/to/second/number.json"
}
```

**Response:**
```json
{
  "result": 15,
  "resultPath": "dummy_path/add_result.json",
  "operation": "addition",
  "inputs": {
    "a": "path/to/first/number.json",
    "b": "path/to/second/number.json"
  }
}
```

### POST `/subtract_numbers`
Subtracts the second number from the first.

### POST `/multiply_numbers`
Multiplies two numbers.

### POST `/divide_numbers`
Divides the first number by the second (with division by zero protection).

### GET `/health`
Health check endpoint.

## File Format

Numbers in GCS should be stored as JSON files with this structure:

```json
{
  "value": 5
}
```

## Environment Variables

- `GCS_BUCKET_NAME`: The name of your Google Cloud Storage bucket (default: "default-calculator-bucket")
- `PORT`: Server port (default: 3002)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to your service account key file (optional if using default credentials)

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure your GCS bucket name:
   ```bash
   cp .env.example .env
   # Edit .env with your bucket name
   ```

3. Set up Google Cloud authentication (one of the following):
   - Use Application Default Credentials (recommended for GCP environments)
   - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
   - Use service account key file

4. Build and run:
   ```bash
   pnpm run build
   pnpm start
   ```

   Or for development:
   ```bash
   pnpm run dev
   ```

## Docker Deployment

### Building the Docker Image

```bash
# Build the image
docker build -t calculator-server:latest .

# Or use the provided script
.\docker-run.bat  # Windows
./docker-run.sh   # Linux/Mac
```

### Running the Container

```bash
# Basic run
docker run -d \
  --name calculator-server \
  -p 3000:3000 \
  -e GCS_BUCKET_NAME=your-bucket-name \
  calculator-server:latest

# With Google Cloud credentials (using service account key)
docker run -d \
  --name calculator-server \
  -p 3000:3000 \
  -e GCS_BUCKET_NAME=your-bucket-name \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
  -v /path/to/your/service-account-key.json:/app/credentials.json:ro \
  calculator-server:latest

# With environment file
docker run -d \
  --name calculator-server \
  -p 3000:3000 \
  --env-file .env \
  calculator-server:latest
```

### Docker Features

- **Multi-stage build**: Optimized production image size
- **Security**: Runs as non-root user (`calculator`)
- **Health check**: Built-in health monitoring
- **Alpine Linux**: Small base image for reduced attack surface
- **Production optimized**: Only production dependencies in final image

### Docker Commands

```bash
# View logs
docker logs -f calculator-server

# Stop container
docker stop calculator-server

# Remove container
docker rm calculator-server

# Remove image
docker rmi calculator-server:latest

# Health check
curl http://localhost:3000/health
```

## Architecture

The server uses two main helper functions:

- `readNumberFromGCS(filePath)`: Reads and parses a number from a GCS file
- `writeNumberToGCS(filePath, value)`: Writes a number result to a GCS file

Each endpoint:
1. Validates input file paths
2. Reads numbers from the specified GCS files
3. Performs the mathematical operation
4. Stores the result in a new GCS file
5. Returns the result along with metadata

## Error Handling

- Invalid file paths return 400 Bad Request
- Missing or malformed files return 500 Internal Server Error with details
- Division by zero returns 400 Bad Request
- GCS connection issues are caught and reported
