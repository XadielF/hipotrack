import React, { useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageCircle,
  Send,
  Paperclip,
  Search,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useMessaging } from "@/hooks/useMessaging";
import type { MessagingUser } from "@/hooks/useMessaging";

const currentUser: MessagingUser = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Usuario",
  role: "Homebuyer",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=usuario",
};

const Messages: React.FC = () => {
  const [messageText, setMessageText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    conversations,
    messages,
    selectedConversationId,
    selectConversation,
    loadingConversations,
    loadingMessages,
    sending,
    error,
    clearError,
    sendMessage,
  } = useMessaging({ currentUser });

  const currentConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) ?? null,
    [conversations, selectedConversationId],
  );

  const topics = useMemo(() => {
    const topicSet = new Set<string>();
    messages.forEach((message) => {
      if (message.topic) topicSet.add(message.topic);
    });
    return Array.from(topicSet);
  }, [messages]);

  const filteredMessages = useMemo(() => {
    return messages
      .filter((message) =>
        selectedTopic === "all" ? true : message.topic === selectedTopic,
      )
      .filter((message) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          message.content.toLowerCase().includes(query) ||
          message.sender.displayName.toLowerCase().includes(query)
        );
      });
  }, [messages, selectedTopic, searchQuery]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversationId) return;

    await sendMessage({
      conversationId: selectedConversationId,
      content: messageText,
      topic: selectedTopic !== "all" ? selectedTopic : undefined,
      attachments: pendingAttachments,
    });

    setMessageText("");
    setPendingAttachments([]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length) {
      setPendingAttachments((previous) => [...previous, ...files]);
    }
    event.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments((previous) => previous.filter((_, idx) => idx !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mensajes</h1>
          <p className="text-gray-600">
            Gestiona tus conversaciones con el equipo hipotecario en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversaciones</CardTitle>
                <CardDescription>
                  {loadingConversations
                    ? "Cargando..."
                    : `${conversations.length} activas`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={selectedTopic}
                  onValueChange={setSelectedTopic}
                  disabled={topics.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los temas</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ScrollArea className="h-[320px] pr-2">
                  <div className="flex flex-col gap-2">
                    {conversations.map((conversation) => {
                      const participantNames = conversation.participants
                        .filter((participant) => !participant.isCurrentUser)
                        .map((participant) => participant.displayName)
                        .join(", ");

                      return (
                        <Button
                          key={conversation.id}
                          variant={
                            conversation.id === selectedConversationId
                              ? "default"
                              : "outline"
                          }
                          className="w-full justify-start text-left"
                          onClick={() => selectConversation(conversation.id)}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">
                              {conversation.title || participantNames || "Conversación"}
                            </span>
                            {conversation.lastMessage && (
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {conversation.lastMessage.content}
                              </span>
                            )}
                          </div>
                        </Button>
                      );
                    })}
                    {conversations.length === 0 && !loadingConversations && (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No tienes conversaciones activas.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {error && (
              <Alert variant="destructive" className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex-1">
                  {error}
                  <Button
                    variant="link"
                    className="h-auto p-0 ml-2"
                    onClick={clearError}
                  >
                    Cerrar
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Card className="h-[640px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" /> Conversación
                    </CardTitle>
                    <CardDescription>
                      {currentConversation
                        ? currentConversation.participants
                            .filter((participant) => !participant.isCurrentUser)
                            .map((participant) => participant.displayName)
                            .join(", ") || "Conversación"
                        : "Selecciona una conversación"}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {filteredMessages.length} mensajes
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col gap-4">
                <ScrollArea className="flex-1 pr-4">
                  <div className="flex flex-col gap-4">
                    {loadingMessages ? (
                      <div className="flex justify-center py-12 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : filteredMessages.length > 0 ? (
                      filteredMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.sender.isCurrentUser ? "flex-row-reverse" : ""
                          }`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender.avatarUrl ?? undefined} />
                            <AvatarFallback>
                              {message.sender.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex-1 ${
                            message.sender.isCurrentUser ? "text-right" : ""
                          }`}>
                            <div
                              className={`inline-block rounded-lg px-4 py-3 text-left ${
                                message.sender.isCurrentUser
                                  ? "bg-blue-500 text-white"
                                  : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-sm font-semibold">
                                  {message.sender.displayName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-line">
                                {message.content}
                              </p>
                              {message.topic && (
                                <Badge
                                  variant={
                                    message.sender.isCurrentUser
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="mt-2"
                                >
                                  {message.topic}
                                </Badge>
                              )}
                              {message.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {message.attachments.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="flex items-center gap-2 rounded border border-dashed px-2 py-1 text-xs bg-background/70"
                                    >
                                      <Paperclip className="h-3 w-3" />
                                      <span className="max-w-[160px] truncate">
                                        {attachment.name}
                                      </span>
                                      {attachment.status !== "sent" && (
                                        <Badge
                                          variant={
                                            attachment.status === "error"
                                              ? "destructive"
                                              : "outline"
                                          }
                                        >
                                          {attachment.status === "pending"
                                            ? "Subiendo..."
                                            : "Error"}
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {message.status !== "sent" && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {message.status === "pending"
                                  ? "Enviando mensaje..."
                                  : "No se pudo entregar. Intenta nuevamente."}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-12">
                        No hay mensajes en esta conversación.
                      </p>
                    )}
                  </div>
                </ScrollArea>

                <div className="border-t pt-4 space-y-3">
                  <Textarea
                    placeholder="Escribe tu mensaje..."
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!selectedConversationId}
                  />
                  {pendingAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {pendingAttachments.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center gap-2 rounded border px-2 py-1 text-xs"
                        >
                          <Paperclip className="h-3 w-3" />
                          <span className="max-w-[160px] truncate">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1"
                            onClick={() => removeAttachment(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        hidden
                        onChange={handleFileChange}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!selectedConversationId}
                      >
                        <Paperclip className="h-4 w-4 mr-2" /> Adjuntar
                      </Button>
                    </div>
                    <Button
                      onClick={() => void handleSendMessage()}
                      disabled={
                        !messageText.trim() || !selectedConversationId || sending
                      }
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {sending ? "Enviando" : "Enviar"}
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