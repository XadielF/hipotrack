import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  PaperclipIcon,
  SendIcon,
  UserIcon,
  Users2Icon,
  FilterIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { useMessaging } from "@/hooks/useMessaging";
import type { MessagingUser } from "@/hooks/useMessaging";

interface MessagingSystemProps {
  currentUser: MessagingUser;
}

const MessagingSystem: React.FC<MessagingSystemProps> = ({ currentUser }) => {
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
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
  const auth = useOptionalAuth();

  const defaultUserAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : "unknown-agent";
  const defaultLocation =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : undefined;

  const recordAudit = async (event: AuditEventInput) => {
    try {
      await logAuditEvent({
        userId: auth?.user?.id ?? event.userId ?? currentUser.name,
        userName:
          auth?.user
            ? `${auth.user.firstName} ${auth.user.lastName}`
            : event.userName ?? currentUser.name,
        userRole: auth?.user?.role ?? event.userRole ?? currentUser.role,
        userAgent: event.userAgent ?? defaultUserAgent,
        location: event.location ?? defaultLocation,
        ipAddress: event.ipAddress ?? "unknown",
        ...event,
      });
    } catch (error) {
      console.warn("[audit] Failed to record messaging event", error);
    }
  };

  const topics = useMemo(() => {
    const topicSet = new Set<string>();
    messages.forEach((message) => {
      if (message.topic) {
        topicSet.add(message.topic);
      }
    });
    return Array.from(topicSet);
  }, [messages]);

  const filteredMessages = useMemo(() => {
    return messages
      .filter((message) => {
        if (activeTab === "all") return true;
        if (activeTab === "direct") return !message.sender.isCurrentUser;
        if (activeTab === "topics") return Boolean(message.topic);
        return true;
      })
      .filter((message) => {
        if (selectedTopic === "all") return true;
        return message.topic === selectedTopic;
      });
  }, [messages, activeTab, selectedTopic]);

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
      setPendingAttachments((current) => [...current, ...files]);
    }
    event.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments((current) => current.filter((_, idx) => idx !== index));
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-4 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Mensajes</CardTitle>
            <p className="text-sm text-muted-foreground">
              {loadingConversations
                ? "Cargando conversaciones..."
                : `${conversations.length} conversaciones`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Select
              value={selectedConversationId ?? ""}
              onValueChange={(value) => selectConversation(value)}
              disabled={loadingConversations || conversations.length === 0}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Selecciona una conversación" />
              </SelectTrigger>
              <SelectContent>
                {conversations.map((conversation) => {
                  const participantNames = conversation.participants
                    .filter((participant) => !participant.isCurrentUser)
                    .map((participant) => participant.displayName)
                    .join(", ")

                  const label =
                    conversation.title ??
                    (participantNames ? participantNames : "Conversación")

                  return (
                    <SelectItem key={conversation.id} value={conversation.id}>
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Select
              value={selectedTopic}
              onValueChange={setSelectedTopic}
              disabled={topics.length === 0}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
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
            <Button variant="outline" size="icon">
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users2Icon className="h-4 w-4" /> Todos
            </TabsTrigger>
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> Equipo
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-2">
              # Temas
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
                Entendido
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {currentConversation
              ? (() => {
                  const participantNames = currentConversation.participants
                    .filter((participant) => !participant.isCurrentUser)
                    .map((participant) => participant.displayName)
                    .join(", ")
                  return participantNames || "Conversación"
                })()
              : "Selecciona una conversación"}
          </div>
          {sending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
            </div>
          )}
        </div>
        <ScrollArea className="h-[320px] pr-4">
          <div className="flex flex-col gap-4">
            {loadingMessages ? (
              <div className="flex justify-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex gap-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {message.sender.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {message.sender.displayName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {message.sender.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-line">
                      {message.content}
                    </p>
                    {message.topic && (
                      <Badge variant="secondary" className="mt-2 w-fit">
                        # {message.topic}
                      </Badge>
                    )}
                    {message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-2 bg-muted px-2 py-1 rounded text-xs"
                          >
                            <PaperclipIcon className="h-3 w-3" />
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
                    {message.status !== "sent" && (
                      <Badge
                        variant={
                          message.status === "error"
                            ? "destructive"
                            : "outline"
                        }
                        className="mt-2 w-fit"
                      >
                        {message.status === "pending"
                          ? "Enviando..."
                          : "No se pudo entregar"}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay mensajes para mostrar.
              </div>
            )}
          </div>
        </ScrollArea>
        <Separator />
        <div className="flex flex-col gap-3">
          <Textarea
            placeholder="Escribe tu mensaje aquí..."
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] resize-none"
            disabled={!selectedConversationId}
          />
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pendingAttachments.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 rounded border px-2 py-1 text-xs"
                >
                  <PaperclipIcon className="h-3 w-3" />
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
                <PaperclipIcon className="h-4 w-4 mr-2" />
                Adjuntar
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
                <SendIcon className="h-4 w-4 mr-2" />
              )}
              {sending ? "Enviando" : "Enviar"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagingSystem;