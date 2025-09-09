import React, { useState } from 'react';
import { Button, Card, Form, InputGroup, FormControl, Spinner } from 'react-bootstrap';
import Apis, { endpoints } from '../../configs/Apis';

const styles = {
    widgetContainer: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
    },
    chatWindow: {
        width: '350px',
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        borderRadius: '15px',
    },
    chatBody: {
        flexGrow: 1,
        overflowY: 'auto',
        padding: '10px',
    },
    message: {
        marginBottom: '10px',
        padding: '8px 12px',
        borderRadius: '18px',
        maxWidth: '80%',
    },
    userMessage: {
        backgroundColor: '#007bff',
        color: 'white',
        alignSelf: 'flex-end',
        marginLeft: 'auto',
    },
    aiMessage: {
        backgroundColor: '#f1f1f1',
        color: 'black',
        alignSelf: 'flex-start',
    },
    typingIndicator: {
        display: 'flex',
        alignItems: 'center',
        color: '#6c757d',
        fontSize: '0.9rem',
    }
};

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Chào bạn, tôi là trợ lý ảo của nhà hàng. Tôi có thể giúp bạn chọn món ăn không?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const res = await Apis.post(endpoints['chatbot-ask'], {
                message: inputValue
            });
            const aiMessage = { sender: 'ai', text: res.data.reply };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error("Lỗi khi gọi chatbot:", err);
            const errorMessage = { sender: 'ai', text: 'Xin lỗi, tôi đang gặp sự cố nhỏ. Vui lòng thử lại sau.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.widgetContainer}>
            {isOpen ? (
                <Card style={styles.chatWindow}>
                    <Card.Header className="d-flex justify-content-between align-items-center bg-success text-white">
                        Trợ lý Tư vấn Món ăn
                        <Button variant="close" onClick={() => setIsOpen(false)} />
                    </Card.Header>
                    <Card.Body style={styles.chatBody}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    ...styles.message,
                                    ...(msg.sender === 'user' ? styles.userMessage : styles.aiMessage)
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
                    <Card.Footer>
                        <Form onSubmit={handleSendMessage}>
                            <InputGroup>
                                <FormControl
                                    placeholder="Nhập câu hỏi của bạn..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    disabled={isLoading}
                                />
                                <Button type="submit" variant="success" disabled={isLoading}>Gửi</Button>
                            </InputGroup>
                        </Form>
                    </Card.Footer>
                </Card>
            ) : (
                <Button
                    variant="success"
                    size="lg"
                    className="rounded-circle"
                    style={{ width: '60px', height: '60px' }}
                    onClick={() => setIsOpen(true)}
                >
                    💬
                </Button>
            )}
        </div>
    );
};

export default ChatbotWidget;
