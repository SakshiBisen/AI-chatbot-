/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";


const ChatBot = () => {
  const bottomref = useRef();

  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState([]);

  // default to localhost:3000 for local development if env var is missing
  const BackendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const { register, handleSubmit, resetField } = useForm();



  const submitHandler = ({ user_message }) => {
    const userMsg = user_message.trim();
    if (!userMsg) return;


    let usernewMsg = {
      sender: "user",
      text: userMsg,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessage((prev) => [...prev, usernewMsg]);

    if (!socket || (socket && !socket.connected)) {
      console.warn("Socket is not connected yet. Message not sent to backend.");
      return;
    }

    socket.emit("ai-message", user_message);
    resetField("user_message");
  };


  useEffect(() => {
    let socketInstance = io(BackendUrl);
    setSocket(socketInstance);


    socketInstance.on("ai-message-response", (data) => {
      console.log(data, " aa reha h ")
      let botnewMsg = {
        sender: "bot",
        text: data,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setMessage((prev) => [...prev, botnewMsg]);
    });

    return () => {
      socketInstance.disconnect();
    };

  }, []);

  useEffect(() => {
    bottomref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  return (
    <div className="chat-container ">
      <div className="chat-box">
        <h1 className="chat-title">AI Chatbot</h1>
        {/* Messages */}
        <div className="messages">
          {message.length > 0 ? (
            message.map((msg, idx) => (
              <div
                key={idx}
                className={`message-row ${msg.sender === "user" ? "user" : "bot"}`}
              >
                <div className={`message-bubble ${msg.sender}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))
          ) : (
            <h1 className="empty-text">Start a new conversation...</h1>
          )}
          <div ref={bottomref}></div>
        </div>

        {/* Input */}
        <div className="input-box">
          <form onSubmit={handleSubmit(submitHandler)}>
            <input
              {...register("user_message")}
              type="text"
              placeholder="Type your message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ChatBot;

