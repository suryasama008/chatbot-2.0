import React from 'react';
import { GeminiClient } from '@google/generative-ai';

const apiKey = process.env.VITE_GOOGLE_API_KEY;
const client = new GeminiClient({ apiKey });

const App = () => {
    // Replacing OpenAI API integration with Google Gemini API usage
    return <div>Your Chatbot App using Google Gemini!</div>;
};

export default App;