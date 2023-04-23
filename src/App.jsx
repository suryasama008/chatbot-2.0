import { useState, useEffect } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import Modal from 'react-modal'

const API_KEY = process.env.REACT_APP_API_KEY
// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
}

function App() {
  const [selectedOption, setSelectedOption] = useState(
    "Explain things like you're talking to a software professional with 2 years of experience."
  )
  const [isModalOpen, setIsModalOpen] = useState(true)

  const closeModal = () => {
    setIsModalOpen(false)
  }

useEffect(() => {
  setIsModalOpen(false)
}, [])

  
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm your virtual assistant! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });
console.log({ role: 'system', content: selectedOption })

    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: selectedOption }, // The system message DEFINES the logic of our chatGPT
        ...apiMessages, // The messages from our chat with ChatGPT
      ],
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
      }).then((data) => {
      // console.log(data)
      return data.json();
    }).then((data) => {
      // console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

    return (
      <div className='App'>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel='Example Modal'
        >
          <h2>Modal Title</h2>
          <p>Modal Content</p>
        </Modal>
        <Navbar />
        <div className='chat-container'>
          <label className='select-label'>Choose your Chatbot personality:</label>
          <SelectDropdown
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
          <MainContainer>
            <ChatContainer
              className='chat-container'
              style={{ backgroundColor: '#2c2c2e' }}
            >
              <MessageList
                scrollBehavior='smooth'
                typingIndicator={
                  isTyping ? (
                    <TypingIndicator content='ChatGPT is typing' />
                  ) : null
                }
              >
                {messages.map((message, i) => {
                  return (
                    <Message
                      key={i}
                      model={message}
                      style={{
                        color: message.sender === 'ChatGPT' ? 'white' : 'black',
                      }}
                    />
                  )
                })}
              </MessageList>
              <MessageInput
                placeholder='Type message here'
                onSend={handleSend}
              />
            </ChatContainer>
          </MainContainer>
        </div>
        <Footer />
      </div>
    )
}
function Navbar() {
  return (
    <header className='navbar'>
      <div>
        <h1 className='navbar-heading'>AI Chatbot</h1>
        <h2 className='navbar-subheading'>Powered by GPT-3.5 Turbo</h2>
      </div>
    </header>
  )
}

function SelectDropdown({ selectedOption, setSelectedOption }) {
  const handleChange = (e) => {
    setSelectedOption(e.target.value)
  }
  return (
    <div className='dropdown-container'>
        <select
          className='select-dropdown'
          value={selectedOption}
          onChange={handleChange}
        >
          <option>
            Explain things like you're talking to a software professional with 2
            years of experience
          </option>
          <option>
            Explain things like you're talking to a software professional with 5
            years of experience
          </option>
          <option>Explain things like you're talking to a 5 year old</option>
          <option>Explain things using analogies or metaphors</option>
          <option>Explain things with a touch of humor</option>
          <option>Explain things in a poetic or creative way</option>
          <option>Explain things from a historical perspective</option>
          <option>
            Explain things like you're talking to someone with no technical
            background
          </option>
          <option>
            Explain things like you're talking to a high school student
          </option>
          <option>
            Explain things like you're talking to a busy entrepreneur
          </option>
        </select>
    </div>
  )
}

function Footer() {
  return (
    <footer className='footer-container'>
      <p>Designed and developed by [name]</p>
      <p>© 2023 All rights reserved</p>
    </footer>
  )
}

export default App
