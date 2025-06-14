# ProdMon

The app which can help you to monitor the productivity of your devices.
The public version of this app you can find here: [prodmon.me](https://prodmon.me).

## Table of Contents

* [Introduction](#introduction)
* [Project Structure](#project-structure)
* [Installation](#installation)
* [Usage](#usage)
* [Dependencies](#dependencies)
* [Configuration](#configuration)
* [Troubleshooting](#troubleshooting)
* [Contributors](#contributors)

## Introduction

This project can help you to monitor the performance of CPU, RAM and get a list of processes. You can also change
metrics update time and terminate processes It's a multiservice web application comprising several components developed
in different programming languages, including TypeScript, Python and Go.

## Project Structure

```
.
├── agent
├── backend
│   ├── api
│   ├── crud
│   ├── models
│   ├── schemas
│   └── utils
└── web
    ├── public
    └── src
        ├── app
        │   ├── (auth)
        │   │   ├── components
        │   │   ├── login
        │   │   └── register
        │   ├── (main)
        │   │   └── components
        │   └── metrics
        │       └── [id]
        │           └── components
        ├── components
        │   ├── layout
        │   │   └── header
        │   └── ui
        ├── hooks
        └── lib
            ├── api
            ├── dtos
            └── responses

30 directories
```

The repository is organized into the following directories:

* `agent`: Contains the agent implemented in Go.
* `api`: Houses the API service developed in Python.
* `web`: Includes the frontend application built with NextJS.
* `.github/workflows`: Contains GitHub Actions workflows for CI/CD.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/bohdanbulakh/prodmon.git
   cd prodmon
   ```

2. **Set up each component:**
    * **API Service (Python):**

      ```bash
      cd backend
      python3 -m venv venv
      source venv/bin/activate
      pip install -r requirements.txt
      ```

    * **Agent Service (Go):**

      ```bash
      cd agent
      go build
      ```

    * **Web Frontend (TypeScript):**

      ```bash
      cd web
      corepack enable
      yarn install
      ```

## Configuration

Set environment variables up for each component:

* **Agent:**

    * API_URL

* **Web Frontend:**

    * [Development](./web/.env.development)
    * [Production](./web/.env.production)

## Usage

After setting up all components:

1. Run the API service.
    ```bash
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. Start the agent service on your devices.
    ```bash
   cd agent
   ./Agent
   ```

3. Launch the web frontend.
    ```bash
   cd web
   yarn dev
    ```

> [!TIP]
> You can also use a containerized version of *api* and *agent* by running `docker compose up` in corresponding
> directories.

## Dependencies

* **Agent:**

    * Go 1.24

* **API Service:**

    * Python 3.12
    * Flask
    * Other dependencies are listed in [requirements.txt](backend/requirements.txt)

* **Web Frontend:**

    * Node.js 15
    * yarn
    * React
    * Other dependencies are listed in [package.json](./web/package.json)

## Troubleshooting

* Ensure all dependencies are installed correctly.
* Verify that each service is running on the correct port.
* Check environment variable configurations.
* Consult the logs for each service for error messages.

## Contributors

* [bohdanbulakh](https://github.com/bohdanbulakh)
* [VaL2111](https://github.com/VaL2111)
* [vladosadchuk](https://github.com/vladosadchuk)
