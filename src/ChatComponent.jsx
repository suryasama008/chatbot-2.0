import React, { useState } from 'react'

const ChatComponent = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }])
      setInput('')
    }
  }

  return (
    <div className='h-screen flex flex-col items-center bg-gray-100'>
      <div className='w-full md:w-1/2 lg:w-1/3 xl:w-1/4 h-full lg:h-auto lg:max-h-[600px] flex flex-col p-4'>
        <div className='bg-blue-500 text-white rounded-t-lg shadow p-2 flex items-center'>
          <h2 className='font-semibold text-lg mx-auto'>AI Chatbot-<span className = 'italic text-sm'>powered by GPT 3.5 Turbo</span></h2>
        </div>
        <div className='flex-grow overflow-y-auto bg-white rounded-lg shadow p-4'>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`rounded-md px-4 py-2 mb-2 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white self-end'
                  : 'bg-gray-300 text-black self-start'
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
        <form
          onSubmit={handleSubmit}
          className='bg-gray-200 rounded-b-lg shadow p-2 flex'
        >
          <input
            type='text'
            placeholder='Type your message'
            value={input}
            onChange={handleInputChange}
            className='flex-grow rounded-md p-2 mr-2 border-2 border-gray-300'
          />
          <button
            type='submit'
            className='bg-blue-500 text-white px-4 py-2 rounded-md'
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatComponent
