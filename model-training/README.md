# Running Model_training of the Project

## Pre-requisites

Before running the model_training, ensure you have:

- [Anaconda](https://www.anaconda.com/) installed to manage your Python environment.
- [Jupyter](https://jupyter.org/) installed for running .ipynb files interactively

## Steps

1\. Verify that Anaconda (conda) is installed by running the following command in your terminal:

```sh
conda --version
```

2\. Create the conda environment using the provided `model-training-env.yml` file:

```sh
conda env create -f model-training-env.yml
```

3\. Activate the newly created environment:

```sh
conda activate model-training-env
```

4\. Launch the Jupyter notebook interface by running:

```sh
jupyter notebook
```

This will open Jupyter Notebook in your web browser. From there, you can locate and open the Template.ipynb file and click "Run All" to execute all cells.
