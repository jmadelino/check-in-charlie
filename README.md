# Check-in Charlie

**Check-in Charlie** is a reception assistant system, designed for hotels worldwide. It enhances guest experiences by answering queries about the hotel or local area, managing tasks like guest check-ins and check-outs, and allowing hotel staff to focus on more complex, personalized services.

## Key Features

- **Emotion Recognition**: Uses real-time emotion detection through a camera, enabling the chatbot to provide contextually appropriate responses based on the guest’s emotional state.
- **Multimodal Communication:** Guests can interact with Charlie via speech or text, seamlessly switching between input modes for a flexible and personalized experience.
- **Real-Time Communication:** Utilizes WebSockets for live interaction between the chatbot and guests, ensuring quick and responsive communication.
- **High Accuracy:** Achieved a validation accuracy of 78% on our emotion recognition model.
- **Task Automation:** Supports tasks such as checking guests in and out, freeing up hotel staff for more personalized interactions.

## Project Structure

### 1. check-in-charlie-application

This folder contains the complete application, including:

- **Frontend:** Built with React, providing a user-friendly interface for guests to interact with Charlie.
- **Chatbot:** Powered by ChatGPT with a personalized prompt system that dynamically adapts responses based on detected emotions. This enables context-aware interactions, improving guest satisfaction.
- **Backend:** Built with Flask, handling requests and responses through WebSockets, and utilizing the emotion recognition model to tailor responses based on guest emotions.

### 2. model-training

This folder includes the script used to finetune our emotion detection model:

- **Model:** `convnextv2_nano.fcmae_ft_in22k_in1k_384`, trained on the AffectNet dataset, utilizing Ekman's emotion model.
- **Outputs:** The script provides key performance metrics such as the confusion matrix and classification report, assessing how well the model classifies emotions. The script also saves a checkpoint model at each epoch, from which the best-performing model is selected.

## Setup and Usage

For detailed instructions on setting up and running the application or training the model, refer to the **README files** located within each respective folder (`check-in-charlie-application` and `model-training`).

## License

This project is licensed under the MIT License.
