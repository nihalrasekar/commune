import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Search, Plus, Users, Clock, MapPin, Send, ArrowLeft, Smile, Paperclip, Mic, X, Heart, ThumbsUp, MoveVertical as MoreVertical, Reply, CreditCard as Edit3, Trash2, RotateCcw } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { 
  chatRealtimeManager,
  getChatRooms,
  getChatMessages,
  sendMessage,
  markRoomAsRead,
  addMessageReaction,
  removeMessageReaction,
  editMessage,
  deleteMessage,
  createPrivateRoom,
  formatMessageTime,
  formatLastSeen,
  getInitials,
  type ChatRoom,
  type ChatMessage,
  type ChatMember,
  type TypingIndicator,
  type MessageReaction
} from '@/lib/supabase-realtime';

interface TypingUser {
  user_id: string;
  user_name: string;
  timestamp: string;
}

export default function CommunityScreen() {
  const { userProfile } = useAuth();
  const { snackbar, showError, showSuccess, showInfo, hideSnackbar } = useSnackbar();
  
  // State management
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Modal states
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [createRoomModalVisible, setCreateRoomModalVisible] = useState(false);
  const [userListModalVisible, setUserListModalVisible] = useState(false);
  const [chatOptionsModalVisible, setChatOptionsModalVisible] = useState(false);
  
  // Real-time states
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Message interaction states
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [editText, setEditText] = useState('');
  
  // Refs
  const messagesScrollRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load chat rooms on component mount
  useEffect(() => {
    if (userProfile?.apartment_id) {
      loadChatRooms();
    }
  }, [userProfile]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      chatRealtimeManager.cleanup();
    };
  }, []);

  const loadChatRooms = async () => {
    if (!userProfile?.apartment_id || !userProfile?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await getChatRooms(userProfile.apartment_id, userProfile.id);
      
      if (error) {
        console.error('Error loading chat rooms:', error);
        showError('Failed to load chat rooms');
        return;
      }
      
      if (data) {
        setChatRooms(data);
        console.log('Loaded chat rooms:', data.length);
      }
    } catch (error) {
      console.error('Error in loadChatRooms:', error);
      showError('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await getChatMessages(roomId, 50, 0);
      
      if (error) {
        console.error('Error loading messages:', error);
        showError('Failed to load messages');
        return;
      }
      
      if (data) {
        setMessages(data);
        console.log('Loaded messages:', data.length);
        
        // Scroll to bottom
        setTimeout(() => {
          messagesScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
      showError('Failed to load messages');
    }
  };

  const handleRoomSelect = async (room: ChatRoom) => {
    if (!userProfile?.id) return;
    
    setSelectedRoom(room);
    setChatModalVisible(true);
    setMessages([]);
    
    // Load messages
    await loadMessages(room.id);
    
    // Mark room as read
    await markRoomAsRead(room.id, userProfile.id);
    
    // Subscribe to real-time updates
    subscribeToRoom(room);
  };

  const subscribeToRoom = (room: ChatRoom) => {
    if (!userProfile?.id || !userProfile?.full_name || !userProfile?.flat_number) return;
    
    // Subscribe to messages
    chatRealtimeManager.subscribeToMessages(
      room.id,
      (message) => {
        console.log('New message received:', message);
        setMessages(prev => [...prev, message]);
        setTimeout(() => {
          messagesScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (message) => {
        console.log('Message updated:', message);
        setMessages(prev => prev.map(m => m.id === message.id ? message : m));
      },
      (messageId) => {
        console.log('Message deleted:', messageId);
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
    );
    
    // Subscribe to typing indicators
    chatRealtimeManager.subscribeToTyping(
      room.id,
      (indicator) => {
        if (indicator.user_id !== userProfile.id) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.user_id !== indicator.user_id);
            return [...filtered, {
              user_id: indicator.user_id,
              user_name: indicator.user_name,
              timestamp: indicator.timestamp,
            }];
          });
          
          // Remove typing indicator after 5 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u.user_id !== indicator.user_id));
          }, 5000);
        }
      },
      (userId) => {
        if (userId !== userProfile.id) {
          setTypingUsers(prev => prev.filter(u => u.user_id !== userId));
        }
      }
    );
    
    // Subscribe to presence
    chatRealtimeManager.subscribeToPresence(
      room.id,
      userProfile.id,
      userProfile.full_name,
      userProfile.flat_number,
      (members) => {
        console.log('Presence updated:', members);
        setOnlineMembers(members);
      }
    );
    
    // Subscribe to reactions
    chatRealtimeManager.subscribeToReactions(
      room.id,
      (reaction) => {
        console.log('Reaction added:', reaction);
        // Update message reactions count
        setMessages(prev => prev.map(m => {
          if (m.id === reaction.message_id) {
            const newReactionsCount = { ...m.reactions_count };
            newReactionsCount[reaction.reaction] = (newReactionsCount[reaction.reaction] || 0) + 1;
            return { ...m, reactions_count: newReactionsCount };
          }
          return m;
        }));
      },
      (reaction) => {
        console.log('Reaction removed:', reaction);
        // Update message reactions count
        setMessages(prev => prev.map(m => {
          if (m.id === reaction.message_id) {
            const newReactionsCount = { ...m.reactions_count };
            if (newReactionsCount[reaction.reaction]) {
              newReactionsCount[reaction.reaction] = Math.max(0, newReactionsCount[reaction.reaction] - 1);
              if (newReactionsCount[reaction.reaction] === 0) {
                delete newReactionsCount[reaction.reaction];
              }
            }
            return { ...m, reactions_count: newReactionsCount };
          }
          return m;
        }));
      }
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !userProfile?.id || sendingMessage) return;
    
    try {
      setSendingMessage(true);
      
      const messageData = {
        chat_room_id: selectedRoom.id,
        sender_id: userProfile.id,
        message: newMessage.trim(),
        reply_to_id: replyToMessage?.id,
      };
      
      const { data, error } = await sendMessage(messageData);
      
      if (error) {
        console.error('Error sending message:', error);
        showError('Failed to send message');
        return;
      }
      
      if (data) {
        console.log('Message sent successfully:', data);
        setNewMessage('');
        setReplyToMessage(null);
        
        // Stop typing indicator
        if (isTyping) {
          setIsTyping(false);
          chatRealtimeManager.sendTypingIndicator(
            selectedRoom.id,
            userProfile.id,
            userProfile.full_name || 'User',
            false
          );
        }
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      showError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    
    if (!selectedRoom || !userProfile?.id || !userProfile?.full_name) return;
    
    // Send typing indicator
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      chatRealtimeManager.sendTypingIndicator(
        selectedRoom.id,
        userProfile.id,
        userProfile.full_name,
        true
      );
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        chatRealtimeManager.sendTypingIndicator(
          selectedRoom.id,
          userProfile.id,
          userProfile.full_name,
          false
        );
      }
    }, 2000);
  };

  const handleMessageReaction = async (message: ChatMessage, reaction: MessageReaction['reaction']) => {
    if (!userProfile?.id) return;
    
    try {
      // Check if user already reacted with this reaction
      const hasReacted = false; // You would check this from the database
      
      if (hasReacted) {
        await removeMessageReaction(message.id, userProfile.id, reaction);
      } else {
        await addMessageReaction(message.id, userProfile.id, reaction);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      showError('Failed to add reaction');
    }
  };

  const handleEditMessage = async () => {
    if (!editingMessage || !editText.trim()) return;
    
    try {
      const { data, error } = await editMessage(editingMessage.id, editText.trim());
      
      if (error) {
        console.error('Error editing message:', error);
        showError('Failed to edit message');
        return;
      }
      
      setEditingMessage(null);
      setEditText('');
      showSuccess('Message edited successfully');
    } catch (error) {
      console.error('Error in handleEditMessage:', error);
      showError('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (message: ChatMessage) => {
    if (!userProfile?.id || message.sender_id !== userProfile.id) return;
    
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await deleteMessage(message.id);
              
              if (error) {
                console.error('Error deleting message:', error);
                showError('Failed to delete message');
                return;
              }
              
              showSuccess('Message deleted successfully');
            } catch (error) {
              console.error('Error in handleDeleteMessage:', error);
              showError('Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const handleClearChatHistory = () => {
    Alert.alert(
      'Clear Chat History',
      'This will clear all messages from your view. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            setChatOptionsModalVisible(false);
            showSuccess('Chat history cleared from your view');
          },
        },
      ]
    );
  };

  const handleCloseChat = () => {
    if (selectedRoom) {
      chatRealtimeManager.unsubscribeFromRoom(selectedRoom.id);
    }
    
    setChatModalVisible(false);
    setSelectedRoom(null);
    setMessages([]);
    setTypingUsers([]);
    setOnlineMembers([]);
    setReplyToMessage(null);
    setEditingMessage(null);
    setNewMessage('');
    setEditText('');
    setChatOptionsModalVisible(false);
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatRoom = ({ item: room }: { item: ChatRoom }) => {
    const unreadCount = room.unread_count || 0;
    const lastMessageTime = room.last_message_at ? formatMessageTime(room.last_message_at) : '';
    
    return (
      <TouchableOpacity
        style={styles.chatRoomItem}
        onPress={() => handleRoomSelect(room)}
      >
        <View style={styles.roomAvatar}>
          <Text style={styles.roomAvatarText}>
            {room.type === 'private' ? '💬' : getInitials(room.name)}
          </Text>
          {room.type !== 'private' && (
            <View style={styles.roomTypeIndicator}>
              <Text style={styles.roomTypeText}>
                {room.type === 'general' ? '🏠' :
                 room.type === 'announcements' ? '📢' :
                 room.type === 'maintenance' ? '🔧' :
                 room.type === 'events' ? '🎉' :
                 room.type === 'marketplace' ? '🛒' : '💬'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.roomContent}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={styles.roomMeta}>
              {lastMessageTime && (
                <Text style={styles.roomTime}>{lastMessageTime}</Text>
              )}
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.roomDetails}>
            <Text style={styles.roomDescription} numberOfLines={1}>
              {room.last_message?.message || room.description || 'No messages yet'}
            </Text>
            <View style={styles.roomStats}>
              <Users size={12} color={Colors.dark.textMuted} />
              <Text style={styles.memberCount}>{room.member_count}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item: message, index }: { item: ChatMessage; index: number }) => {
    const isOwn = message.sender_id === userProfile?.id;
    const showSender = !isOwn && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);
    const hasReactions = Object.keys(message.reactions_count || {}).length > 0;
    
    return (
      <View style={[styles.messageContainer, isOwn ? styles.ownMessageContainer : styles.otherMessageContainer]}>
        {showSender && (
          <Text style={styles.messageSender}>
            {message.sender?.full_name} • {message.sender?.flat_number}
          </Text>
        )}
        
        {message.reply_to_id && message.reply_to && (
          <View style={styles.replyContainer}>
            <View style={styles.replyIndicator} />
            <View style={styles.replyContent}>
              <Text style={styles.replyAuthor}>{message.reply_to.sender?.full_name}</Text>
              <Text style={styles.replyText} numberOfLines={2}>
                {message.reply_to.message}
              </Text>
            </View>
          </View>
        )}
        
        <TouchableOpacity
          style={[
            styles.messageBubble,
            isOwn ? styles.ownMessageBubble : styles.otherMessageBubble
          ]}
          onLongPress={() => setSelectedMessage(message)}
        >
          <Text style={[
            styles.messageText,
            isOwn ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.message}
          </Text>
          
          {message.is_edited && (
            <Text style={styles.editedIndicator}>edited</Text>
          )}
        </TouchableOpacity>
        
        {hasReactions && (
          <View style={styles.reactionsContainer}>
            {Object.entries(message.reactions_count).map(([reaction, count]) => (
              <TouchableOpacity
                key={reaction}
                style={styles.reactionBubble}
                onPress={() => handleMessageReaction(message, reaction as MessageReaction['reaction'])}
              >
                <Text style={styles.reactionEmoji}>
                  {reaction === 'like' ? '👍' :
                   reaction === 'love' ? '❤️' :
                   reaction === 'laugh' ? '😂' :
                   reaction === 'angry' ? '😠' :
                   reaction === 'sad' ? '😢' :
                   reaction === 'thumbs_up' ? '👍' :
                   reaction === 'thumbs_down' ? '👎' : '👍'}
                </Text>
                <Text style={styles.reactionCount}>{count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <Text style={[
          styles.messageTime,
          isOwn ? styles.ownMessageTime : styles.otherMessageTime
        ]}>
          {formatMessageTime(message.created_at)}
        </Text>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    
    const typingText = typingUsers.length === 1
      ? `${typingUsers[0].user_name} is typing...`
      : `${typingUsers.length} people are typing...`;
    
    return (
      <View style={styles.typingContainer}>
        <Text style={styles.typingText}>{typingText}</Text>
      </View>
    );
  };

  const renderChatModal = () => {
    if (!selectedRoom) return null;

    return (
      <Modal
        visible={chatModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseChat}
      >
        <SafeAreaView style={styles.chatModalContainer}>
          {/* Chat Header */}
          <View style={styles.chatModalHeader}>
            <TouchableOpacity onPress={handleCloseChat} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatModalName}>{selectedRoom.name}</Text>
              <Text style={styles.chatModalStatus}>
                {selectedRoom.type === 'private' 
                  ? `${onlineMembers.length} online`
                  : `${selectedRoom.member_count} members • ${onlineMembers.length} online`
                }
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.chatOptionsButton}
              onPress={() => setChatOptionsModalVisible(true)}
            >
              <MoreVertical size={20} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            ref={messagesScrollRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => messagesScrollRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyMessagesContainer}>
                <MessageCircle size={48} color={Colors.dark.textMuted} />
                <Text style={styles.emptyMessagesText}>No messages yet</Text>
                <Text style={styles.emptyMessagesSubtext}>Start the conversation!</Text>
              </View>
            }
          />

          {/* Typing Indicator */}
          {renderTypingIndicator()}

          {/* Reply Preview */}
          {replyToMessage && (
            <View style={styles.replyPreview}>
              <View style={styles.replyPreviewContent}>
                <Text style={styles.replyPreviewAuthor}>
                  Replying to {replyToMessage.sender?.full_name}
                </Text>
                <Text style={styles.replyPreviewText} numberOfLines={1}>
                  {replyToMessage.message}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReplyToMessage(null)}>
                <X size={20} color={Colors.dark.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Edit Preview */}
          {editingMessage && (
            <View style={styles.editPreview}>
              <View style={styles.editPreviewContent}>
                <Text style={styles.editPreviewTitle}>Edit Message</Text>
                <TextInput
                  style={styles.editInput}
                  value={editText}
                  onChangeText={setEditText}
                  placeholder="Edit your message..."
                  placeholderTextColor={Colors.dark.textMuted}
                  multiline
                  autoFocus
                />
              </View>
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => setEditingMessage(null)}>
                  <X size={20} color={Colors.dark.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEditMessage}>
                  <Send size={20} color={Colors.dark.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Message Input */}
          {!editingMessage && (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.messageInputContainer}
            >
              <View style={styles.messageInputWrapper}>
                <TouchableOpacity style={styles.attachButton}>
                  <Paperclip size={20} color={Colors.dark.textMuted} />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.messageInput}
                  value={newMessage}
                  onChangeText={handleTyping}
                  placeholder="Type a message..."
                  placeholderTextColor={Colors.dark.textMuted}
                  multiline
                  maxLength={1000}
                  editable={!sendingMessage}
                />
                
                <TouchableOpacity style={styles.emojiButton}>
                  <Smile size={20} color={Colors.dark.textMuted} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  (newMessage.trim() && !sendingMessage) ? styles.sendButtonActive : styles.sendButtonInactive
                ]}
                onPress={handleSendMessage}
                disabled={!newMessage.trim() || sendingMessage}
              >
                {(newMessage.trim() && !sendingMessage) ? (
                  <Send size={20} color={Colors.dark.text} />
                ) : (
                  <Mic size={20} color={Colors.dark.textMuted} />
                )}
              </TouchableOpacity>
            </KeyboardAvoidingView>
          )}
        </SafeAreaView>
      </Modal>
    );
  };

  // Chat Options Modal
  const renderChatOptionsModal = () => {
    return (
      <Modal
        visible={chatOptionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChatOptionsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setChatOptionsModalVisible(false)}
        >
          <View style={styles.chatOptionsModal}>
            <View style={styles.chatOptionsHeader}>
              <Text style={styles.chatOptionsTitle}>Chat Options</Text>
              <TouchableOpacity onPress={() => setChatOptionsModalVisible(false)}>
                <X size={20} color={Colors.dark.textMuted} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.chatOptionsButtons}>
              <TouchableOpacity
                style={styles.chatOptionButton}
                onPress={() => {
                  setChatOptionsModalVisible(false);
                  setUserListModalVisible(true);
                }}
              >
                <Users size={20} color={Colors.dark.primary} />
                <Text style={styles.chatOptionText}>View Members</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.chatOptionButton}
                onPress={handleClearChatHistory}
              >
                <RotateCcw size={20} color={Colors.dark.warning} />
                <Text style={styles.chatOptionText}>Clear Chat History</Text>
              </TouchableOpacity>
              
              {selectedRoom?.type === 'private' && (
                <TouchableOpacity
                  style={styles.chatOptionButton}
                  onPress={() => {
                    setChatOptionsModalVisible(false);
                    // Handle leave chat
                  }}
                >
                  <X size={20} color={Colors.dark.error} />
                  <Text style={styles.chatOptionText}>Leave Chat</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Message Action Modal
  const renderMessageActionModal = () => {
    if (!selectedMessage) return null;
    
    const isOwn = selectedMessage.sender_id === userProfile?.id;
    
    return (
      <Modal
        visible={!!selectedMessage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedMessage(null)}
        >
          <View style={styles.messageActionModal}>
            <View style={styles.messageActionHeader}>
              <Text style={styles.messageActionTitle}>Message Actions</Text>
            </View>
            
            <View style={styles.messageActionButtons}>
              <TouchableOpacity
                style={styles.messageActionButton}
                onPress={() => {
                  setReplyToMessage(selectedMessage);
                  setSelectedMessage(null);
                }}
              >
                <Reply size={20} color={Colors.dark.primary} />
                <Text style={styles.messageActionText}>Reply</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.messageActionButton}
                onPress={() => handleMessageReaction(selectedMessage, 'like')}
              >
                <ThumbsUp size={20} color={Colors.dark.primary} />
                <Text style={styles.messageActionText}>Like</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.messageActionButton}
                onPress={() => handleMessageReaction(selectedMessage, 'love')}
              >
                <Heart size={20} color={Colors.dark.error} />
                <Text style={styles.messageActionText}>Love</Text>
              </TouchableOpacity>
              
              {isOwn && (
                <>
                  <TouchableOpacity
                    style={styles.messageActionButton}
                    onPress={() => {
                      setEditingMessage(selectedMessage);
                      setEditText(selectedMessage.message);
                      setSelectedMessage(null);
                    }}
                  >
                    <Edit3 size={20} color={Colors.dark.warning} />
                    <Text style={styles.messageActionText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.messageActionButton}
                    onPress={() => {
                      handleDeleteMessage(selectedMessage);
                      setSelectedMessage(null);
                    }}
                  >
                    <Trash2 size={20} color={Colors.dark.error} />
                    <Text style={styles.messageActionText}>Delete</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading community chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Community Chat</Text>
            <Text style={styles.headerSubtitle}>Connect with neighbors in real-time</Text>
          </View>
          <TouchableOpacity style={styles.createButton}>
            <Plus size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.dark.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search chat rooms..."
              placeholderTextColor={Colors.dark.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={Colors.dark.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Chat Statistics */}
        <View style={styles.chatStats}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{chatRooms.length}</Text>
            <Text style={styles.statLabel}>Chat Rooms</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{onlineMembers.length}</Text>
            <Text style={styles.statLabel}>Online Now</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {chatRooms.reduce((sum, room) => sum + (room.unread_count || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Unread</Text>
          </Card>
        </View>

        {/* Chat Rooms List */}
        <Card style={styles.chatListCard} elevated>
          <View style={styles.chatListHeader}>
            <Text style={styles.chatListTitle}>Chat Rooms</Text>
            <TouchableOpacity style={styles.newChatButton}>
              <MessageCircle size={16} color={Colors.dark.primary} />
              <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredRooms}
            renderItem={renderChatRoom}
            keyExtractor={(item) => item.id}
            style={styles.chatRoomsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No chat rooms found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? 'Try different search terms' : 'Create a new chat room to get started'}
                </Text>
              </View>
            }
          />
        </Card>
      </View>

      {/* Chat Modal */}
      {renderChatModal()}

      {/* Chat Options Modal */}
      {renderChatOptionsModal()}

      {/* Message Action Modal */}
      {renderMessageActionModal()}

      {/* Snackbar */}
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onHide={hideSnackbar}
        duration={snackbar.duration}
        action={snackbar.action}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.dark.text + '80',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
  },
  chatStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  chatListCard: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  chatListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  chatListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.dark.primary + '20',
  },
  newChatText: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: '500',
  },
  chatRoomsList: {
    flex: 1,
  },
  chatRoomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border + '50',
  },
  roomAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  roomAvatarText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  roomTypeIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  roomTypeText: {
    fontSize: 8,
  },
  roomContent: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    flex: 1,
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomTime: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  unreadBadge: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 11,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  roomDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomDescription: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  roomStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    textAlign: 'center',
  },

  // Chat Modal Styles
  chatModalContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatModalName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  chatModalStatus: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  chatOptionsButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyMessagesText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessagesSubtext: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageSender: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  replyIndicator: {
    width: 3,
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
    backgroundColor: Colors.dark.surface + '80',
    borderRadius: 8,
    padding: 8,
  },
  replyAuthor: {
    fontSize: 11,
    color: Colors.dark.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 4,
  },
  ownMessageBubble: {
    backgroundColor: Colors.dark.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: Colors.dark.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ownMessageText: {
    color: Colors.dark.text,
  },
  otherMessageText: {
    color: Colors.dark.text,
  },
  editedIndicator: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  ownMessageTime: {
    color: Colors.dark.textMuted,
    textAlign: 'right',
  },
  otherMessageTime: {
    color: Colors.dark.textMuted,
    textAlign: 'left',
  },
  typingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontStyle: 'italic',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    gap: 12,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewAuthor: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  editPreview: {
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  editPreviewContent: {
    marginBottom: 8,
  },
  editPreviewTitle: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Colors.dark.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minHeight: 40,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    gap: 12,
  },
  messageInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.dark.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 8,
  },
  attachButton: {
    padding: 8,
  },
  messageInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  emojiButton: {
    padding: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  sendButtonInactive: {
    backgroundColor: Colors.dark.surface,
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Chat Options Modal
  chatOptionsModal: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    margin: 20,
    maxWidth: 300,
    width: '80%',
  },
  chatOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  chatOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  chatOptionsButtons: {
    padding: 8,
  },
  chatOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  chatOptionText: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },

  // Message Action Modal
  messageActionModal: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    margin: 20,
    maxWidth: 300,
    width: '80%',
  },
  messageActionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  messageActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  messageActionButtons: {
    padding: 8,
  },
  messageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  messageActionText: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },
});