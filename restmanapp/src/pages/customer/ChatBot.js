import React, { useState } from "react";
import {
  Button,
  Card,
  Form,
  InputGroup,
  FormControl,
  Spinner,
} from "react-bootstrap";
import { ChatDots, Send, X } from "react-bootstrap-icons";
import Apis, { endpoints } from "../../configs/Apis";

const styles = {
  widgetContainer: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
  },
  chatWindow: {
    width: "360px",
    height: "520px",
    display: "flex",
    flexDirection: "column",
    border: "none",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
  },
  chatBody: {
    flexGrow: 1,
    overflowY: "auto",
    padding: "12px",
    background: "linear-gradient(180deg, #ffffff 0%, #fff8dc 100%)", 
  },
  message: {
    marginBottom: "10px",
    padding: "10px 14px",
    borderRadius: "20px",
    maxWidth: "75%",
    lineHeight: 1.4,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  userMessage: {
    backgroundColor: "#8B0000", 
    color: "white",
    alignSelf: "flex-end",
    marginLeft: "auto",
    borderBottomRightRadius: "5px",
  },
  aiMessage: {
    backgroundColor: "#FFF3B0", 
    color: "#333",
    alignSelf: "flex-start",
    borderBottomLeftRadius: "5px",
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    color: "#6c757d",
    fontSize: "0.9rem",
  },
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Xin chào 👋 Tôi là trợ lý ảo của nhà hàng. Tôi có thể giúp bạn chọn món ăn hôm nay!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === "" || isLoading) return;

    const userMessage = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await Apis.post(endpoints["chatbot-ask"], {
        message: inputValue,
      });
      const aiMessage = { sender: "ai", text: res.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Lỗi khi gọi chatbot:", err);
      const errorMessage = {
        sender: "ai",
        text: "Xin lỗi, tôi đang gặp sự cố nhỏ. Vui lòng thử lại sau.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.widgetContainer}>
      {isOpen ? (
        <Card style={styles.chatWindow}>
          <Card.Header
            className="d-flex justify-content-between align-items-center text-white"
            style={{
              background: "linear-gradient(135deg, #FFD700, #8B0000)",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            Trợ lý Ẩm thực
            <Button
              variant="light"
              size="sm"
              onClick={() => setIsOpen(false)}
              style={{ borderRadius: "50%", padding: "4px 6px" }}
            >
              <X size={20} color="#8B0000" />
            </Button>
          </Card.Header>

          <Card.Body style={styles.chatBody}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  ...(msg.sender === "user"
                    ? styles.userMessage
                    : styles.aiMessage),
                }}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div style={styles.typingIndicator}>
                <Spinner animation="grow" size="sm" className="me-2" />
                Trợ lý đang nhập...
              </div>
            )}
          </Card.Body>

          <Card.Footer style={{ background: "#fff" }}>
            <Form onSubmit={handleSendMessage}>
              <InputGroup>
                <FormControl
                  placeholder="Nhập tin nhắn..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  style={{ borderRadius: "20px 0 0 20px" }}
                />
                <Button
                  type="submit"
                  style={{
                    backgroundColor: "#FFD700",
                    borderColor: "#FFD700",
                    borderRadius: "0 20px 20px 0",
                    padding: "0 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  disabled={isLoading}
                >
                  <Send size={18} color="#8B0000" />
                </Button>
              </InputGroup>
            </Form>
          </Card.Footer>
        </Card>
      ) : (
        <Button
          size="lg"
          className="shadow-lg"
          style={{
            background: "linear-gradient(135deg, #FFD700, #8B0000)",
            border: "none",
            width: "65px",
            height: "65px",
            borderRadius: "50%", 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onClick={() => setIsOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
          }}
        >
          <ChatDots size={28} color="white" />
        </Button>

      )}
    </div>
  );
};

export default ChatbotWidget;
