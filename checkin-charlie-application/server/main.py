from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from faster_whisper import WhisperModel
import io
import cv2 as cv
import torch
import torchvision.transforms as transforms
import torch.nn.functional as F
from ultralytics import YOLO
from PIL import Image
import base64
import logging
from collections import deque, Counter
from OpenAIChat import OpenAIChat
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app and SocketIO
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
logging.getLogger("ultralytics").setLevel(logging.ERROR)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Initialize Faster Whisper model
whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
# Initialize emotion queue to store the last 20 emotions
emotion_queue = deque(maxlen=20)

# Define image transform
transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

# Load emotion recognizer
emotion_recognizer = torch.load("emotion-recognition-model.pt", map_location=device)
emotion_recognizer.eval()
# Emotion labels
emotion_labels = ["anger", "disgust", "fear", "happy", "sad", "surprise"]
# Load face detector
face_detector = YOLO("yolov8n-face.pt")

# Initialize OpenAI
# set OpenAi API key
openai_api_key = os.getenv("OPENAI_API_KEY")
# Initialize OpenAiChat object
chat = OpenAIChat(openai_api_key)


@socketio.on("connect")
def handle_connect():
    global chat

    # Reset the chat history when a client connects (i.e., on app refresh)
    chat.reset_messages()

    # Add initial system message
    chat.add_system_message(
        """You are a virtual hotel check-in assistant named Check-in Charlie (or simply Charlie).
        Your primary role is to facilitate a smooth and welcoming check-in experience for guests. You will handle inquiries and guide guests through the process of checking in with clarity, politeness, and professionalism.
        regarding room availability, booking status, check-in time, questions about the general area and hotel policies. 
        Your responsibilities include:
        - Assisting with room availability, booking status, check-in time, local area information, and hotel policies.
        - Verifying booking details by requesting essential information like ID or a confirmation number.
        - Providing clear instructions on how to complete the check-in process.
        - Ensuring the check-in experience is as seamless and pleasant as possible.

        The messages from the user will be formatted as follows:
        - The main message from the user will be followed by an indication of their current emotional state in this format:
        'The user's current emotion is [emotion].'
        
        Emotion Sensitivity:
        - Be attentive to guests' emotions and tailor your tone accordingly.
        - Always strive to turn negative experiences into positive ones by being supportive and helpful.
        - Use informal, friendly language when appropriate but maintain professionalism to inspire trust.

        Remember:
        - Always enquire what the problem is and how it can address it when the guest's emotion is sadness, disgust, or anger. NEVER ask them about their details or their booking in the same reply.
        - Always aim to make the check-in experience as smooth and pleasant as possible.
        - After the guest gives you their booking ID, you are able to immediately check them in and reply to them in the same reply. If the guest claims there was an error on the part of the hotel such as a mix-up, offer the option for an
        upgrade or to contact the hotel staff to resolve the issue.
        - Your goal is to make guests feel comfortable, heard, and valued. The more personal and adaptive you are, the better their experience will be.
    """
    )

    chat.add_assistant_message(
        "Hello, I am Check-in Charlie! How can I help you today?"
    )

    print("Client connected")


@socketio.on("disconnect")
def handle_disconnect():
    # Remove the user's state when they disconnect
    print("Client disconnected")


@socketio.on("request_frame")
def generate_emotion():
    global transform, emotion_recognizer, emotion_labels, face_detector

    # Initialize webcam
    cap = cv.VideoCapture(0)

    # While streaming
    while True:
        # Read a frame from the webcam
        ret, frame = cap.read()
        if not ret:
            break

        # Perform face detection
        results = face_detector(frame)

        for result in results:
            boxes = result.boxes.xyxy.cpu().numpy().astype(int)

            for box in boxes:
                x1, y1, x2, y2 = box

                # Extract the face region
                face = frame[y1:y2, x1:x2]

                # Preprocess the face for emotion recognition
                face = cv.cvtColor(face, cv.COLOR_BGR2RGB)
                face = Image.fromarray(face)
                face_tensor = transform(face).unsqueeze(0).to(device)

                # Perform emotion recognition
                with torch.no_grad():
                    emotion_pred = emotion_recognizer(face_tensor)
                    emotion_idx = torch.argmax(emotion_pred).item()
                    emotion = emotion_labels[emotion_idx]
                    emotion_confidence = F.softmax(emotion_pred, dim=1)[0][
                        emotion_idx
                    ].item()

                # Add emotion to the emotion queue
                emotion_queue.append(emotion)

                # Draw bounding box
                cv.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)

                # Put emotion label on the bounding box
                label = f"{emotion}: {emotion_confidence:.2f}"
                cv.putText(
                    frame,
                    label,
                    (x1, y1 - 10),
                    cv.FONT_HERSHEY_SIMPLEX,
                    0.9,
                    (0, 255, 0),
                    2,
                )

            # Encode the frame in JPEG format
            ret, encoded_image = cv.imencode(".jpg", frame)
            if not ret:
                continue

            # Send the output frame in byte format
            emit("frame", base64.b64encode(encoded_image).decode("utf-8"))
    # Release the camera
    cap.release()


def generate_chatgpt_response(message, most_common_emotion):
    """Call ChatGPT API to generate a response for the Check-in bot."""
    global chat

    try:
        # Modify the input message with the most common emotion
        modified_text = (
            f"{message}. The user's current emotion is {most_common_emotion}."
        )
        print(modified_text)
        chat.add_user_message(modified_text)
        response = chat.request()
        return response
    except Exception as e:
        logging.error(f"Error in generate_chatgpt_response: {str(e)}")
        return f"Sorry, something went wrong with Charlie. Please try again."


@socketio.on("chat_message")
def handle_chat_message(message):
    global emotion_queue

    # Determine the most common emotion in the queue
    if len(emotion_queue) > 0:
        emotion_counter = Counter(emotion_queue)
        most_common_emotion = emotion_counter.most_common(1)[0][0]
    else:
        most_common_emotion = "neutral"

    # Generate the response from chatbot
    response_text = generate_chatgpt_response(message.rstrip(), most_common_emotion)

    # Send the generated response back to the client
    emit("chat_response", response_text)


@socketio.on("transcribe")
def handle_transcribe(audio_data):
    try:
        # Convert the audio data to acceptable format for Whisper model
        audio_io = io.BytesIO(audio_data)
        segments, _ = whisper_model.transcribe(audio_io, beam_size=5)

        # Get the transcribed text
        transcription = " ".join(segment.text for segment in segments)

        emit("transcription_result", {"transcription": transcription})
    except Exception as e:
        logging.error(f"Error in transcribe: {str(e)}")
        emit("transcription_error", {"error": str(e)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
