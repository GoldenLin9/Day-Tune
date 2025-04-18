﻿# Day Tune

Day Tune is an application designed to help users improve their productivity and manage tasks effectively. This guide explains how to set up and run the application, including the backend and frontend components.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Running the Application](#running-the-application)
- [Additional Information](#additional-information)
  - [Python Dependencies](#python-dependencies)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:

- Python 3.10+ (for the backend)
- Node.js 16+ (for the frontend)
- Redis (for Celery task queue)
- Pip (Python package manager)

---

## Setup Instructions

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Django development server**:
   Open a terminal and execute:
   ```bash
   python3 manage.py runserver
   ```

4. **Start Celery workers**:
   Open another terminal and execute:
   ```bash
   celery -A backend worker --loglevel=info
   ```

5. **Start the Celery beat scheduler**:
   Open another terminal and execute:
   ```bash
   celery -A backend beat --loglevel=info
   ```

6. *(Optional)* **Run Flower** (a web-based monitoring tool for Celery):
   Open another terminal and execute:
   ```bash
   celery -A backend flower
   ```

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## Running the Application

Once both the backend and frontend are running:

- Open your browser and go to the frontend URL (typically `http://localhost:3000`).
- Ensure the backend API is accessible at `http://localhost:8000`.

---

## Additional Information

### Python Dependencies

Here are the key Python dependencies used in this project:

- **Django**: Web framework for the backend.
- **Django REST Framework**: For building APIs.
- **Djoser**: For handling user authentication.
- **Celery**: For asynchronous task management.
- **django-cors-headers**: To enable CORS for frontend-backend communication.

For the full list, refer to the `requirements.txt` file.

## Troubleshooting

- **Redis is not running**: Ensure Redis is installed and running before starting Celery.
- **Dependency issues**: If `pip install` fails, ensure you have the correct Python version and virtual environment activated.
- **Ports already in use**: Stop other processes using ports 3000 (frontend) or 8000 (backend).

---

## Contributing

We welcome contributions to Day Tune! If you find any bugs or have feature suggestions, please open an issue or submit a pull request.

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push to your fork and submit a pull request.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
