import React, { useState, useEffect } from "react";
import axios from "axios";
import "./IVR.css"; // We'll create this file for styling

export default function IVR() {
  const [sessionId, setSessionId] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Use a ref to hold the MediaRecorder instance
  const mediaRecorderRef = React.useRef(null);

  useEffect(() => {
    startIVR();
  }, []);

  const startIVR = async () => {
    setIsLoading(true);
    setLastMessage("Connecting to IVR...");
    try {
      const response = await axios.post("http://localhost:5000/ivr/start");
      setSessionId(response.data.sessionId);
      if (response.data.audioUrl) {
        // Ensure audioUrl state is always an object with an action
        const initialAudioData = { audioUrl: response.data.audioUrl, action: 'PLAY' };
        setAudioUrl(initialAudioData);
      }
      setLastMessage("Welcome to Lean IVR. Press 1 for Sales, 2 for Support.");
    } catch (error) {
      console.error("Error starting IVR:", error);
      setLastMessage("Failed to connect to IVR. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob);
        formData.append("sessionId", sessionId);

        // Stop microphone tracks
        stream.getTracks().forEach(track => track.stop());

        // Send the recording to the backend
        setLastMessage("Processing your response...");
        const response = await axios.post("http://localhost:5000/ivr/record", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Play the confirmation message from the backend
        if (response.data.audioUrl) {
            setAudioUrl(response.data); // Set the entire object, not just the URL
            setLastMessage("Thank you. Your response has been recorded.");
        }
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      setLastMessage("Listening... Please speak now.");

      // Stop recording after 5 seconds
      setTimeout(() => {
        mediaRecorderRef.current.stop();
        setIsListening(false);
      }, 5000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setLastMessage("Could not access microphone. Please check permissions.");
    }
  };

  const handleOptionClick = async (option) => {
    if (isProcessing || !sessionId) return;
    setIsProcessing(true);
    setLastMessage(`Sending input: ${option}...`);
    try {
      const response = await axios.post("http://localhost:5000/ivr/options", {
        sessionId: sessionId,
        option: option,
      });

      // Update message based on option
      let nextMessage = "Invalid option. Please try again.";
      if (option === "1") {
        nextMessage = "Connecting you to Sales...";
      } else if (option === "2") {
        nextMessage = "Connecting you to Support...";
      }

      if (response.data.audioUrl) {
        // Set the message first, then the audio to ensure autoplay isn't interrupted
        setLastMessage(nextMessage);
        setAudioUrl(response.data);
      }
    } catch (error) {
      console.error("Error selecting option:", error);
      setLastMessage("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // This function is called when the audio finishes playing
  const handleAudioEnded = () => {
    // If the last action was to record, start recording now.
    if (audioUrl?.action === 'RECORD') {
      startRecording();
    }
  };

  return (
    <div className="ivr-container">
      <h2>IVR Simulation</h2>
      <div className="ivr-phone">
        <div className="ivr-screen">
          {isListening && <div className="listening-indicator"></div>}
          <p>{isLoading ? "Connecting..." : lastMessage}</p>
        </div>

        {audioUrl && !isLoading && (
          <audio
            key={audioUrl.audioUrl} // Force re-render to autoplay new audio
            autoPlay
            controls
            className="ivr-audio-player"
            onEnded={handleAudioEnded} // Add onEnded event handler
          >
            <source src={audioUrl.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}

        <div className="ivr-keypad">
          <button onClick={() => handleOptionClick("1")} disabled={isProcessing || isLoading}>1</button>
          <button onClick={() => handleOptionClick("2")} disabled={isProcessing || isLoading}>2</button>
          <button onClick={() => handleOptionClick("3")} disabled={isProcessing || isLoading}>3</button>
          <button onClick={() => handleOptionClick("4")} disabled={isProcessing || isLoading}>4</button>
          <button onClick={() => handleOptionClick("5")} disabled={isProcessing || isLoading}>5</button>
          <button onClick={() => handleOptionClick("6")} disabled={isProcessing || isLoading}>6</button>
          <button onClick={() => handleOptionClick("7")} disabled={isProcessing || isLoading}>7</button>
          <button onClick={() => handleOptionClick("8")} disabled={isProcessing || isLoading}>8</button>
          <button onClick={() => handleOptionClick("9")} disabled={isProcessing || isLoading}>9</button>
          <button disabled className="disabled-key">*</button>
          <button onClick={() => handleOptionClick("0")} disabled={isProcessing || isLoading}>0</button>
          <button disabled className="disabled-key">#</button>
        </div>
        <div className="ivr-actions">
            <button className="btn-hangup" onClick={startIVR} disabled={isListening}>Restart Call</button>
        </div>
      </div>
      {sessionId && (
        <p className="session-id-display">Session ID: {sessionId}</p>
      )}
    </div>
  );
}