# Running Front-end of the Project

## Prerequisites

Before you begin, make sure you have the following environments installed on your computer:

- [Node.js](https://nodejs.org/zh-cn) (version 18.x or higher)
- npm package management tool

## Steps

1\. After installation, you can verify that both Node.js and npm have been installed by running the following commands in the terminal:

```sh
node -v
npm -v
#These commands should display the installed versions of Node.js and npm.
```

2\. Navigate to the `client` folder within the project directory:

```sh
cd /checkin-charlie-application/client
```

3\. Install the dependencies:

```sh
npm install
```

4\. Start the front-end:

```sh
npm run dev
```

The frontend will now be running on `http://localhost:5173` by default.

# Running Back-end of the Project

## Pre-requisites

Before running the backend, ensure you have:

- [Anaconda](https://www.anaconda.com/) installed to manage your Python environment.
- [FFmpeg](https://www.ffmpeg.org/) installed on your system.

## Steps

1\. Verify that Anaconda (conda) is installed by running the following command in your terminal:

```sh
conda --version
```

2\. Verify that FFmpeg has been installed by running the following command in your terminal:

```sh
ffmpeg -version
```

3\. Navigate to the `server` folder within the project directory:

```sh
cd /checkin-charlie-application/server
```

4\. Create the conda environment using the provided `checkin-charlie-env.yml` file:

```sh
conda env create -f checkin-charlie-env.yml
```

5\. Activate the newly created environment:

```sh
conda activate checkin-charlie-env
```

6\. Add your OpenAI API key by creating a `.env` file in the `server` directory with the following content:

```sh
OPENAI_API_KEY=your-openai-api-key-here
```

Replace `your-openai-api-key-here` with your actual API key from OpenAI.

7\. Start the Flask backend:

```sh
flask --app main.py run
```

The backend will now be running on `http://localhost:5000` by default.
