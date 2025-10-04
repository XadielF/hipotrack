import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, Paperclip, Filter, Search, Users } from 'lucide-react';
import type { Tables } from '@/types/supabase';

type Message = Tables<'messages'>;

const Messages: React.FC = () => {
  const [messageText, setMessageText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const messages: Message[] = [
    {
      id: '1',
      sender: {
        name: 'Sarah Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        role: 'Loan Officer'
      },
      content: 'Hi! I\'ve reviewed your application and we need a few additional documents. Please upload your most recent pay stubs when you have a chance.',
      timestamp: '2024-01-15T10:30:00Z',
      attachments: null,
      topic: 'Documentation',
      participants: ['You', 'Sarah Johnson']
    },
    {
      id: '2',
      sender: {
        name: 'Mike Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        role: 'Real Estate Agent'
      },
      content: 'Great news! The seller has accepted your offer. We can now move forward with the inspection. I\'ll coordinate with the inspector and keep you updated.',
      timestamp: '2024-01-15T09:15:00Z',
      attachments: null,
      topic: 'Property',
      participants: ['You', 'Mike Chen', 'Sarah Johnson']
    },
    {
      id: '3',
      sender: {
        name: 'You',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
        role: 'Homebuyer'
      },
      content: 'Thank you for the update! I\'ll upload the pay stubs today. When do you expect to have the final approval?',
      timestamp: '2024-01-15T11:45:00Z',
      attachments: null,
      topic: 'Documentation',
      participants: ['You', 'Sarah Johnson']
    },
    {
      id: '4',
      sender: {
        name: 'Lisa Rodriguez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
        role: 'Loan Processor'
      },
      content: 'I\'ve processed your income verification documents. Everything looks good! We\'re on track for closing next week.',
      timestamp: '2024-01-14T16:20:00Z',
      attachments: null,
      topic: 'Processing',
      participants: ['You', 'Lisa Rodriguez', 'Sarah Johnson']
    }
  ];

  const topics = ['Documentation', 'Property', 'Processing', 'Closing', 'Insurance'];

  const filteredMessages = messages
    .filter(message => {
      if (selectedTopic === 'all') return true;
      return message.topic === selectedTopic;
    })
    .filter(message => {
      if (!searchQuery) return true;
      return message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
             message.sender.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with your mortgage team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Messages</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Topic</label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Conversation
                  </CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {filteredMessages.length} messages
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender.name === 'You' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender.avatar ?? undefined} />
                        <AvatarFallback>
                          {message.sender.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`flex-1 max-w-md ${
                        message.sender.name === 'You' ? 'text-right' : ''
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{message.sender.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {message.sender.role}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        
                        <div className={`p-3 rounded-lg ${
                          message.sender.name === 'You'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          {message.topic && (
                            <Badge 
                              variant="outline" 
                              className={`mt-2 text-xs ${
                                message.sender.name === 'You' 
                                  ? 'border-blue-200 text-blue-100' 
                                  : ''
                              }`}
                            >
                              {message.topic}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[60px] pr-12"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleSendMessage} className="self-end">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;