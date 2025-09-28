import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { uploadFile } from '../firebase/firebase';

const API_URL = 'http://localhost:5000/api';

export default function MockIVR({ recipient, onClose }) {
  const [step, setStep] = useState('idle');

  useEffect(() => {
    if (step === 'idle') {
      axios.post(`${API_URL}/ivr/call`, { mobile: recipient.Mobile })
        .then(() => setStep('connected'))
        .catch(() => setStep('failed'));
    }
  }, [step, recipient.Mobile]);

  async function submitRecording() {
    // Create a mock audio file
    const mockAudio = new Blob(['mock audio content'], { type: 'audio/wav' });
    const fileName = `${recipient.Name}_${recipient.City}_${new Date().toISOString()}.wav`;
    try {
      await uploadFile(mockAudio, `recordings/${fileName}`);
      alert('Recording submitted and uploaded to Firebase Storage');
      onClose();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload recording');
    }
  }

  function handleKeyPress(key) {
    switch (step) {
      case 'connected':
        if (key === '1') setStep('recording');
        if (key === '2') alert('Instructions repeated (mock)');
        if (key === '3') {
          alert('Call rescheduled (mock)');
          onClose();
        }
        break;
      case 'recording':
        if (key === '#') setStep('preview');
        break;
      case 'preview':
        if (key === '1') alert('Playing recording (mock)');
        if (key === '2') setStep('recording');
        if (key === '3') {
          submitRecording();
        }
        break;
      default:
        break;
    }
  }

  return (
    <div className="mock-ivr-popup">
      <div className="mock-ivr-content">
        <h4>Mock IVR Call</h4>
        <p>Calling {recipient.Name} at {recipient.Mobile}</p>
        <hr />
        {step === 'idle' && <p>Connecting...</p>}
        {step === 'failed' && <p>Call failed.</p>}
        {step === 'connected' && (
          <div>
            <p>"Dear {recipient.Name}, ... Press 1 to start, 2 for instructions, 3 to reschedule."</p>
            <div className="keypad">
              <button onClick={() => handleKeyPress('1')}>1</button>
              <button onClick={() => handleKeyPress('2')}>2</button>
              <button onClick={() => handleKeyPress('3')}>3</button>
            </div>
          </div>
        )}
        {step === 'recording' && (
          <div>
            <p>Recording... Press # to stop.</p>
            <div className="keypad">
              <button onClick={() => handleKeyPress('#')}>#</button>
            </div>
          </div>
        )}
        {step === 'preview' && (
          <div>
            <p>Preview recording. Press 1 to listen, 2 to re-record, 3 to submit.</p>
            <div className="keypad">
              <button onClick={() => handleKeyPress('1')}>1</button>
              <button onClick={() => handleKeyPress('2')}>2</button>
              <button onClick={() => handleKeyPress('3')}>3</button>
            </div>
          </div>
        )}
        <hr />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}