import { useState, useEffect, useRef } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react'

const API_KEY = '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'
// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = {
  //  Explain things like you're talking to a software professional with 5 years of experience.
  role: 'system',
  content:
    "Explain things like you're talking to a software professional with 2 years of experience.",
}

function App() {
  const [selectedOption, setSelectedOption] = useState('Explain')
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [text, setText] = useState('')
  const [msg, setMsg] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  const messagesContainerRef = useRef(null)

  useEffect(() => {
    if (messagesContainerRef.current) {
      console.log(messagesContainerRef.current.scrollHeigh)
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [msg])

  const closeModal = () => {
    setIsModalOpen(false)
  }

  useEffect(() => {
    setIsModalOpen(false)
  }, [])

  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm your virtual assistant! Ask me anything!",
      sentTime: 'just now',
      sender: 'ChatGPT',
    },
  ])

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: 'user',
    }

    const newMessages = [...messages, newMessage]

    setMessages(newMessages)

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true)
    await processMessageToChatGPT(newMessages)
  }

  async function processMessageToChatGPT(chatMessages) {
    // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat
    setText('')
    let apiMessages = chatMessages.map((messageObject) => {
      let role = ''
      if (messageObject.sender === 'ChatGPT') {
        role = 'assistant'
      } else {
        role = 'user'
      }
      return { role: role, content: messageObject.message }
    })

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

    await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json()
      })
      .then((data) => {
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: 'ChatGPT',
          },
        ])
        setIsTyping(false)
      })
  }

  return (
    <div className='min-h-screen'>
      <Navbar />
      <div className='container mx-auto px-4'>
        <label className='mt-4 mb-2'>Choose Chatbot personality:</label>
        <SelectDropdown
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
        <div className='lg:h-[700px] rounded-t-2xl shadow-2xl'>
          <div className='h-full relative'>
            <div
              className='h-full overflow-y-auto relative pb-16 lg:pb-0'
              ref={messagesContainerRef}
            >
              {messages.map((message, i) => {
                return (
                  <MessageBubble
                    key={i}
                    message={message}
                    isTyping={isTyping}
                    setText={setText}
                    handleSend={handleSend}
                    text={text}
                  />
                )
              })}
            </div>
            {isTyping && (
              <p className='absolute bottom-0 left-0 text-gray-700 m-4 font-semibold'>
                Mr.blue is typing...
              </p>
            )}
            <div className='fixed lg:relative bottom-0 w-full lg:w-auto bg-gray-900 rounded-b-xl lg:rounded-b-none border-t-l-gray-500 py-2 lg:border  max-w-full'>
              <form
                className='flex items-center'
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend(text)
                }}
              >
                <input
                  onChange={(e) => setText(e.target.value)}
                  className='flex-1  bg-transparent border-none text-gray-100 text-xl mr-3 py-2 px-4 leading-tight focus:outline-none'
                  type='text'
                  value={text}
                  placeholder='Search Image Term...'
                />
                <button
                  className='px-4 py-2 text-sm font-medium tracking-wider text-gray-100 uppercase bg-gray-900 rounded-2xl hover:bg-gray-800 focus:outline-none focus:bg-gray-800'
                  type='submit'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-6 h-6'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function splitMessageByCodeSnippet(message) {
  const pattern = /(```[\s\S]*?```)/
  const parts = message.split(pattern)
  return parts.map((part) => ({
    type: pattern.test(part) ? 'code' : 'text',
    content: part,
  }))
}

function MessageBubble({ message, isTyping }) {
  const [copiedStatus, setCopiedStatus] = useState({})

  const copyCodeSnippet = (index) => {
    const codeSnippet = messageParts[index].content
    const codeWithoutBackticks = codeSnippet.slice(3, -3)
    navigator.clipboard.writeText(codeWithoutBackticks)
    setCopiedStatus((prevState) => ({ ...prevState, [index]: true }))
    setTimeout(
      () => setCopiedStatus((prevState) => ({ ...prevState, [index]: false })),
      1500
    )
  }

  const messageParts = splitMessageByCodeSnippet(message.message)

  return (
    <div
      className={`flex flex-col ${
        message.sender === 'ChatGPT'
          ? 'items-start'
          : 'items-end border-t border-b'
      } py-2`}
    >
      {message.sender === 'ChatGPT' ? (
        <p className='text-start text-xl sm:text-md text-green-600 px-4 '>
          Mr.Blue{' '}
        </p>
      ) : (
        <p className='text-end text-xl sm:text-md text-blue-600 px-4'>User</p>
      )}
      {messageParts.map((part, index) => (
        <div key={index} className='px-4 text-xl'>
          {part.type === 'text' ? (
            <pre className='text-start text-gray-800 py-2 inline-block break-words whitespace-pre-wrap'>
              {part.content}
            </pre>
          ) : (
            <div className='relative'>
              <pre className='bg-gray-900 text-white rounded-xl py-2 inline-block break-words whitespace-pre-wrap text-start p-4'>
                {part.content.slice(3, -3)}
              </pre>
              {message.sender === 'ChatGPT' && (
                <button
                  className='absolute top-0 right-0 bg-gray-500 text-white px-4 py-1 rounded text-xs'
                  onClick={() => copyCodeSnippet(index)}
                >
                  {copiedStatus[index] ? (
                    'Copied!'
                  ) : (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='w-6 h-6'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z'
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Navbar() {
  return (
    <header className='bg-blue-500 text-white py-4 text-center'>
      <div className='container mx-auto'>
        <h1 className='text-2xl font-bold'>AI Chatbot</h1>
        <h2 className='text-md'>Powered by GPT-3.5 Turbo</h2>
      </div>
    </header>
  )
}

function SelectDropdown({ selectedOption, setSelectedOption }) {
  const handleChange = (e) => {
    setSelectedOption(e.target.value)
  }
  return (
    <div className='max-w-xs border-2 border-gray-400 rounded-2xl m-4'>
      <select
        className='w-full  bg-transparent py-4 text-gray-800 rounded-sm  px-3' // Add w-full class here
        value={selectedOption}
        style={{ outline: 'none' }}
        onChange={handleChange}
      >
        <option>Explain</option>
        <option>Explain like i am five</option>
        <option>Explain things using analogies or metaphors</option>
        <option>Explain things with a touch of humor</option>
        <option>Explain things in a poetic or creative way</option>
        <option>Explain things from a historical perspective</option>
        <option>Explain things from a scientific perspective</option>
        <option>Explain things from a philosophical perspective</option>
      </select>
    </div>
  )
}

function Footer() {
  return (
    <footer className='bg-gray-200 text-gray-700 '>
      <div className='container mx-auto  '>
        <p>Designed and developed by Surya Sama</p>
        <p>© 2023 All rights reserved</p>
      </div>
    </footer>
  )
}

export default App
