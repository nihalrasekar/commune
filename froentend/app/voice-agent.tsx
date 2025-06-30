import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView, 
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Send, Bot, MessageCircle, Chrome as Home, Building, MapPin, CreditCard, Bed, Bath, Square, Trees, Briefcase, GraduationCap, Car } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { socketClient } from '@/lib/socket';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export default function VoiceAgentScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: "Hello! I'm your AI real estate assistant. I'm here to help you find the perfect property that matches your lifestyle and preferences. How can I assist you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Scroll reference
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeSocketConnection();
    
    return () => {
      endConversation();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  const initializeSocketConnection = async () => {
    try {
      setIsInitializing(true);
      
      // Set up message listener
      socketClient.addMessageListener(handleAgentResponse);
      socketClient.addConnectedListener(handleConnectionStatus);
      socketClient.addTypingListener(handleTypingIndicator);
      
      // Connect to the Socket.IO server
      const connected = await socketClient.connect();
      
      if (connected) {
        console.log('Socket.IO connected successfully');
      } else {
        console.error('Failed to connect to Socket.IO server');
        addMessage('agent', "I'm having trouble connecting to my knowledge base. Please check your internet connection and try again.");
      }
      
      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
      setIsInitializing(false);
      addMessage('agent', "I'm having trouble connecting to my knowledge base. Please check your internet connection and try again.");
    }
  };

  const endConversation = () => {
    // Clean up socket connection
    socketClient.removeMessageListener(handleAgentResponse);
    socketClient.removeConnectedListener(handleConnectionStatus);
    socketClient.removeTypingListener(handleTypingIndicator);
    socketClient.endSession();
  };

  const handleConnectionStatus = (status: boolean) => {
    setIsConnected(status);
  };

  const handleTypingIndicator = (isTyping: boolean) => {
    setIsTyping(isTyping);
  };

  const handleAgentResponse = (message: string) => {
    addMessage('agent', message);
  };

  const addMessage = (type: 'user' | 'agent', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUserMessage = async (message: string) => {
    if (isProcessing || !message.trim() || !isConnected) return;
    
    addMessage('user', message);
    setInputMessage('');
    
    // Show typing indicator
    setIsTyping(true);
    setIsProcessing(true);
    
    try {
      // Send message to Socket.IO server
      socketClient.sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      addMessage('agent', "I'm having trouble connecting to my knowledge base. Please check your internet connection and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    if (isProcessing) return;
    handleUserMessage(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = (message: Message) => {
    const isAgent = message.type === 'agent';
    
    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isAgent ? styles.agentMessage : styles.userMessage
      ]}>
        {isAgent && (
          <View style={styles.agentAvatar}>
            <Bot size={16} color={Colors.dark.text} />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isAgent ? styles.agentBubble : styles.userBubble
        ]}>
          <Text style={styles.messageText}>{message.content}</Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => {
            endConversation();
            router.back();
          }}
        >
          <X size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Real Estate Assistant</Text>
          <View style={styles.connectionStatus}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: isConnected ? Colors.dark.success : Colors.dark.error }
            ]} />
            <Text style={styles.statusText}>
              {isInitializing ? 'Initializing...' : 
               isTyping ? 'Typing...' : 
               isConnected ? 'Ready' : 'Connecting...'}
            </Text>
          </View>
        </View>
        
        <View style={styles.placeholder} />
      </LinearGradient>

      {isInitializing ? (
        <View style={styles.initializingContainer}>
          <View style={styles.initializingCircle}>
            <Bot size={48} color={Colors.dark.primary} />
          </View>
          <Text style={styles.initializingText}>Initializing AI Assistant...</Text>
          <Text style={styles.initializingSubtext}>Connecting to knowledge base</Text>
        </View>
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.contentContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(renderMessage)}
            
            {isTyping && (
              <View style={[styles.messageContainer, styles.agentMessage]}>
                <View style={styles.agentAvatar}>
                  <Bot size={16} color={Colors.dark.text} />
                </View>
                <View style={[styles.messageBubble, styles.agentBubble, styles.typingBubble]}>
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Questions */}
          <View style={styles.quickQuestionsContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickQuestionsContent}
            >
              <TouchableOpacity 
                style={styles.quickQuestionButton}
                onPress={() => handleQuickQuestion("What areas in Bangalore have the best rental yield?")}
                disabled={isProcessing}
              >
                <CreditCard size={16} color={Colors.dark.primary} />
                <Text style={styles.quickQuestionText}>Best rental yield?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickQuestionButton}
                onPress={() => handleQuickQuestion("Which areas are best for families with children?")}
                disabled={isProcessing}
              >
                <Home size={16} color={Colors.dark.primary} />
                <Text style={styles.quickQuestionText}>Family-friendly areas?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickQuestionButton}
                onPress={() => handleQuickQuestion("What amenities should I look for in a premium apartment?")}
                disabled={isProcessing}
              >
                <Building size={16} color={Colors.dark.primary} />
                <Text style={styles.quickQuestionText}>Premium amenities?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickQuestionButton}
                onPress={() => handleQuickQuestion("Which areas have the best connectivity to IT parks?")}
                disabled={isProcessing}
              >
                <Briefcase size={16} color={Colors.dark.primary} />
                <Text style={styles.quickQuestionText}>IT park connectivity?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickQuestionButton}
                onPress={() => handleQuickQuestion("What's the average price for a 3BHK in Koramangala?")}
                disabled={isProcessing}
              >
                <Bed size={16} color={Colors.dark.primary} />
                <Text style={styles.quickQuestionText}>3BHK pricing?</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your question..."
              placeholderTextColor={Colors.dark.textMuted}
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              maxLength={500}
              editable={!isProcessing && isConnected}
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!inputMessage.trim() || isProcessing || !isConnected) && styles.sendButtonDisabled
              ]}
              onPress={() => handleUserMessage(inputMessage)}
              disabled={!inputMessage.trim() || isProcessing || !isConnected}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={Colors.dark.text} />
              ) : (
                <Send size={20} color={Colors.dark.text} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: Colors.dark.text + '80',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  
  // Initializing Screen
  initializingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  initializingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  initializingText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  initializingSubtext: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  
  // Content Container
  contentContainer: {
    flex: 1,
  },
  
  // Messages
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  agentMessage: {
    alignSelf: 'flex-start',
  },
  userMessage: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  agentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '90%',
  },
  agentBubble: {
    backgroundColor: Colors.dark.surface,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.dark.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.dark.text,
    marginBottom: 6,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  
  // Typing Indicator
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.textMuted,
    opacity: 0.7,
  },
  
  // Quick Questions
  quickQuestionsContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  quickQuestionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 6,
  },
  quickQuestionText: {
    fontSize: 13,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  
  // Input Area
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.surface,
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.dark.text,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
});