/*
  # Supabase Realtime Chat Functions
  
  This file contains functions for real-time messaging using Supabase Realtime.
  It handles chat messages, typing indicators, online presence, and reactions.
*/

import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  reply_to_id?: string;
  attachments: any[];
  is_edited: boolean;
  is_deleted: boolean;
  reactions_count: Record<string, number>;
  created_at: string;
  updated_at: string;
  // Joined data
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    flat_number: string;
  };
  reply_to?: ChatMessage;
}

export interface ChatRoom {
  id: string;
  apartment_id: string;
  name: string;
  description?: string;
  type: 'general' | 'announcements' | 'maintenance' | 'events' | 'marketplace' | 'private';
  is_private: boolean;
  created_by: string;
  avatar_url?: string;
  member_count: number;
  last_message_id?: string;
  last_message_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  last_message?: ChatMessage;
  members?: ChatMember[];
  unread_count?: number;
}

export interface ChatMember {
  id: string;
  chat_room_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  is_muted: boolean;
  last_read_at: string;
  joined_at: string;
  // Joined data
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    flat_number: string;
  };
  is_online?: boolean;
}

export interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen_at: string;
  current_activity?: string;
  device_info: Record<string, any>;
}

export interface TypingIndicator {
  user_id: string;
  user_name: string;
  chat_room_id: string;
  timestamp: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'thumbs_up' | 'thumbs_down';
  created_at: string;
}

// Chat Rooms Management
export const getChatRooms = async (apartmentId: string, userId: string) => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      last_message:chat_messages!chat_rooms_last_message_id_fkey(
        id,
        message,
        created_at,
        sender:user_profiles!chat_messages_sender_id_fkey(
          full_name,
          flat_number
        )
      ),
      members:chat_members!inner(
        user_id,
        role,
        last_read_at
      )
    `)
    .eq('apartment_id', apartmentId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false });
  
  // Calculate unread count for each room
  if (data) {
    for (const room of data) {
      const userMember = room.members?.find((m: any) => m.user_id === userId);
      if (userMember && room.last_message_at) {
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_room_id', room.id)
          .gt('created_at', userMember.last_read_at);
        
        room.unread_count = count || 0;
      } else {
        room.unread_count = 0;
      }
    }
  }
  
  return { data, error };
};

export const createChatRoom = async (roomData: Omit<ChatRoom, 'id' | 'created_at' | 'updated_at' | 'member_count' | 'is_active'>) => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .insert([roomData])
    .select()
    .single();
  
  return { data, error };
};

export const joinChatRoom = async (roomId: string, userId: string, role: 'admin' | 'moderator' | 'member' = 'member') => {
  const { data, error } = await supabase
    .from('chat_members')
    .insert([{
      chat_room_id: roomId,
      user_id: userId,
      role,
    }])
    .select()
    .single();
  
  return { data, error };
};

export const leaveChatRoom = async (roomId: string, userId: string) => {
  const { data, error } = await supabase
    .from('chat_members')
    .delete()
    .eq('chat_room_id', roomId)
    .eq('user_id', userId);
  
  return { data, error };
};

// Messages Management
export const getChatMessages = async (roomId: string, limit: number = 50, offset: number = 0) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      sender:user_profiles!chat_messages_sender_id_fkey(
        id,
        full_name,
        avatar_url,
        flat_number
      ),
      reply_to:chat_messages!chat_messages_reply_to_id_fkey(
        id,
        message,
        sender:user_profiles!chat_messages_sender_id_fkey(
          full_name,
          flat_number
        )
      )
    `)
    .eq('chat_room_id', roomId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  return { data: data?.reverse() || [], error };
};

export const sendMessage = async (messageData: {
  chat_room_id: string;
  sender_id: string;
  message: string;
  message_type?: 'text' | 'image' | 'file' | 'system';
  reply_to_id?: string;
  attachments?: any[];
}) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{
      ...messageData,
      message_type: messageData.message_type || 'text',
      attachments: messageData.attachments || [],
    }])
    .select(`
      *,
      sender:user_profiles!chat_messages_sender_id_fkey(
        id,
        full_name,
        avatar_url,
        flat_number
      )
    `)
    .single();
  
  return { data, error };
};

export const editMessage = async (messageId: string, newMessage: string) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .update({
      message: newMessage,
      is_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .single();
  
  return { data, error };
};

export const deleteMessage = async (messageId: string) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .single();
  
  return { data, error };
};

// Message Reactions
export const addMessageReaction = async (messageId: string, userId: string, reaction: MessageReaction['reaction']) => {
  const { data, error } = await supabase
    .from('message_reactions')
    .insert([{
      message_id: messageId,
      user_id: userId,
      reaction,
    }])
    .select()
    .single();
  
  return { data, error };
};

export const removeMessageReaction = async (messageId: string, userId: string, reaction: MessageReaction['reaction']) => {
  const { data, error } = await supabase
    .from('message_reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .eq('reaction', reaction);
  
  return { data, error };
};

// Read Receipts
export const markMessageAsRead = async (messageId: string, userId: string) => {
  const { data, error } = await supabase
    .from('message_read_receipts')
    .upsert([{
      message_id: messageId,
      user_id: userId,
      read_at: new Date().toISOString(),
    }])
    .select()
    .single();
  
  return { data, error };
};

export const markRoomAsRead = async (roomId: string, userId: string) => {
  const { data, error } = await supabase
    .from('chat_members')
    .update({
      last_read_at: new Date().toISOString(),
    })
    .eq('chat_room_id', roomId)
    .eq('user_id', userId)
    .select()
    .single();
  
  return { data, error };
};

// User Presence
export const updateUserPresence = async (userId: string, isOnline: boolean, activity?: string) => {
  const { data, error } = await supabase
    .from('user_presence')
    .upsert([{
      user_id: userId,
      is_online: isOnline,
      last_seen_at: new Date().toISOString(),
      current_activity: activity,
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();
  
  return { data, error };
};

export const getUsersPresence = async (userIds: string[]) => {
  const { data, error } = await supabase
    .from('user_presence')
    .select('*')
    .in('user_id', userIds);
  
  return { data, error };
};

// Real-time Subscriptions Manager
export class ChatRealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  // Subscribe to chat messages in a room
  subscribeToMessages(
    roomId: string,
    onMessage: (message: ChatMessage) => void,
    onMessageUpdate: (message: ChatMessage) => void,
    onMessageDelete: (messageId: string) => void
  ): RealtimeChannel {
    const channelName = `chat_messages:${roomId}`;
    
    // Remove existing subscription if any
    this.unsubscribeFromMessages(roomId);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log('New message received:', payload.new);
          
          // Fetch complete message with sender info
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              sender:user_profiles!chat_messages_sender_id_fkey(
                id,
                full_name,
                avatar_url,
                flat_number
              )
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            onMessage(data as ChatMessage);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log('Message updated:', payload.new);
          
          if (payload.new.is_deleted) {
            onMessageDelete(payload.new.id);
          } else {
            // Fetch complete message with sender info
            const { data } = await supabase
              .from('chat_messages')
              .select(`
                *,
                sender:user_profiles!chat_messages_sender_id_fkey(
                  id,
                  full_name,
                  avatar_url,
                  flat_number
                )
              `)
              .eq('id', payload.new.id)
              .single();
            
            if (data) {
              onMessageUpdate(data as ChatMessage);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`Chat messages subscription status for room ${roomId}:`, status);
      });
    
    this.channels.set(`messages_${roomId}`, channel);
    return channel;
  }
  
  // Subscribe to typing indicators
  subscribeToTyping(
    roomId: string,
    onTypingStart: (indicator: TypingIndicator) => void,
    onTypingStop: (userId: string) => void
  ): RealtimeChannel {
    const channelName = `typing:${roomId}`;
    
    // Remove existing subscription if any
    this.unsubscribeFromTyping(roomId);
    
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'typing_start' }, (payload) => {
        console.log('User started typing:', payload.payload);
        onTypingStart(payload.payload as TypingIndicator);
      })
      .on('broadcast', { event: 'typing_stop' }, (payload) => {
        console.log('User stopped typing:', payload.payload);
        onTypingStop(payload.payload.user_id);
      })
      .subscribe((status) => {
        console.log(`Typing subscription status for room ${roomId}:`, status);
      });
    
    this.channels.set(`typing_${roomId}`, channel);
    return channel;
  }
  
  // Subscribe to online presence
  subscribeToPresence(
    roomId: string,
    userId: string,
    userName: string,
    flatNumber: string,
    onPresenceUpdate: (members: any[]) => void
  ): RealtimeChannel {
    const channelName = `presence:${roomId}`;
    
    // Remove existing subscription if any
    this.unsubscribeFromPresence(roomId);
    
    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const members = Object.values(state).flat();
        console.log('Presence sync:', members);
        onPresenceUpdate(members);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log(`Presence subscription status for room ${roomId}:`, status);
        
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await channel.track({
            user_id: userId,
            user_name: userName,
            flat_number: flatNumber,
            is_online: true,
            last_seen_at: new Date().toISOString(),
          });
          
          // Update database presence
          await updateUserPresence(userId, true, `In chat: ${roomId}`);
        }
      });
    
    this.channels.set(`presence_${roomId}`, channel);
    return channel;
  }
  
  // Subscribe to message reactions
  subscribeToReactions(
    roomId: string,
    onReactionAdd: (reaction: MessageReaction) => void,
    onReactionRemove: (reaction: MessageReaction) => void
  ): RealtimeChannel {
    const channelName = `reactions:${roomId}`;
    
    // Remove existing subscription if any
    this.unsubscribeFromReactions(roomId);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          console.log('Reaction added:', payload.new);
          onReactionAdd(payload.new as MessageReaction);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          console.log('Reaction removed:', payload.old);
          onReactionRemove(payload.old as MessageReaction);
        }
      )
      .subscribe((status) => {
        console.log(`Reactions subscription status for room ${roomId}:`, status);
      });
    
    this.channels.set(`reactions_${roomId}`, channel);
    return channel;
  }
  
  // Send typing indicator
  async sendTypingIndicator(roomId: string, userId: string, userName: string, isTyping: boolean) {
    const channel = this.channels.get(`typing_${roomId}`);
    if (channel) {
      const event = isTyping ? 'typing_start' : 'typing_stop';
      await channel.send({
        type: 'broadcast',
        event,
        payload: {
          user_id: userId,
          user_name: userName,
          chat_room_id: roomId,
          timestamp: new Date().toISOString(),
        },
      });
      
      // Auto-stop typing after 3 seconds
      if (isTyping) {
        const timeoutKey = `${roomId}_${userId}`;
        const existingTimeout = this.typingTimeouts.get(timeoutKey);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
        
        const timeout = setTimeout(() => {
          this.sendTypingIndicator(roomId, userId, userName, false);
          this.typingTimeouts.delete(timeoutKey);
        }, 3000);
        
        this.typingTimeouts.set(timeoutKey, timeout);
      }
    }
  }
  
  // Update user presence
  async updatePresence(roomId: string, userId: string, userName: string, flatNumber: string, isOnline: boolean) {
    const channel = this.channels.get(`presence_${roomId}`);
    if (channel) {
      if (isOnline) {
        await channel.track({
          user_id: userId,
          user_name: userName,
          flat_number: flatNumber,
          is_online: true,
          last_seen_at: new Date().toISOString(),
        });
      } else {
        await channel.untrack();
      }
      
      // Update database presence
      await updateUserPresence(userId, isOnline);
    }
  }
  
  // Unsubscribe methods
  unsubscribeFromMessages(roomId: string) {
    const channel = this.channels.get(`messages_${roomId}`);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(`messages_${roomId}`);
    }
  }
  
  unsubscribeFromTyping(roomId: string) {
    const channel = this.channels.get(`typing_${roomId}`);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(`typing_${roomId}`);
    }
  }
  
  unsubscribeFromPresence(roomId: string) {
    const channel = this.channels.get(`presence_${roomId}`);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(`presence_${roomId}`);
    }
  }
  
  unsubscribeFromReactions(roomId: string) {
    const channel = this.channels.get(`reactions_${roomId}`);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(`reactions_${roomId}`);
    }
  }
  
  // Unsubscribe from all channels for a room
  unsubscribeFromRoom(roomId: string) {
    this.unsubscribeFromMessages(roomId);
    this.unsubscribeFromTyping(roomId);
    this.unsubscribeFromPresence(roomId);
    this.unsubscribeFromReactions(roomId);
    
    // Clear typing timeouts for this room
    const timeoutKeys = Array.from(this.typingTimeouts.keys()).filter(key => key.startsWith(`${roomId}_`));
    timeoutKeys.forEach(key => {
      const timeout = this.typingTimeouts.get(key);
      if (timeout) {
        clearTimeout(timeout);
        this.typingTimeouts.delete(key);
      }
    });
  }
  
  // Cleanup all subscriptions
  cleanup() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    
    // Clear all typing timeouts
    this.typingTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.typingTimeouts.clear();
  }
}

// Singleton instance
export const chatRealtimeManager = new ChatRealtimeManager();

// Utility functions
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
};

export const formatLastSeen = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 5) {
    return 'Online';
  } else if (diffInMinutes < 60) {
    return `Last seen ${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `Last seen ${hours}h ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    if (days === 1) {
      return 'Last seen yesterday';
    } else {
      return `Last seen ${days} days ago`;
    }
  }
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateRoomId = (): string => {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createPrivateRoom = async (user1Id: string, user2Id: string, apartmentId: string): Promise<{ data: ChatRoom | null; error: any }> => {
  // Check if private room already exists between these users
  const { data: existingRoom } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      members:chat_members(user_id)
    `)
    .eq('apartment_id', apartmentId)
    .eq('type', 'private')
    .eq('is_private', true);
  
  if (existingRoom) {
    for (const room of existingRoom) {
      const memberIds = room.members?.map((m: any) => m.user_id) || [];
      if (memberIds.includes(user1Id) && memberIds.includes(user2Id) && memberIds.length === 2) {
        return { data: room, error: null };
      }
    }
  }
  
  // Create new private room
  const { data: newRoom, error: roomError } = await createChatRoom({
    apartment_id: apartmentId,
    name: 'Private Chat',
    type: 'private',
    is_private: true,
    created_by: user1Id,
  });
  
  if (roomError || !newRoom) {
    return { data: null, error: roomError };
  }
  
  // Add both users as members
  await joinChatRoom(newRoom.id, user1Id, 'admin');
  await joinChatRoom(newRoom.id, user2Id, 'member');
  
  return { data: newRoom, error: null };
};