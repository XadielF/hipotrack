import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
} from "lucide-react";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Message {
  id: string;
  sender: {
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  timestamp: string;
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  topic?: string;
}

interface MessagingSystemProps {
  messages?: Message[];
  currentUser?: {
    name: string;
    avatar?: string;
    role: string;
  };
  topics?: string[];
}

const MessagingSystem: React.FC<MessagingSystemProps> = ({
  messages = defaultMessages,
  currentUser = defaultCurrentUser,
  topics = defaultTopics,
}) => {
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(
    undefined,
  );

  const filteredMessages = messages
    .filter((message) => {
      if (activeTab === "all") return true;
      if (activeTab === "direct" && message.sender.role !== currentUser.role)
        return true;
      if (activeTab === "topics" && message.topic) return true;
      return false;
    })
    .filter((message) => {
      if (!selectedTopic || selectedTopic === "all") return true;
      return message.topic === selectedTopic;
    });

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message to a backend
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Mensajes</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-[180px]">
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
          defaultValue="all"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users2Icon className="h-4 w-4" /> Todos
            </TabsTrigger>
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> Directos
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-2">
              # Temas
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="flex flex-col gap-4">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={message.sender.avatar}
                      alt={message.sender.name}
                    />
                    <AvatarFallback>
                      {message.sender.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{message.sender.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {message.sender.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {message.timestamp}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{message.content}</p>
                    {message.topic && (
                      <Badge variant="secondary" className="mt-1 w-fit">
                        # {message.topic}
                      </Badge>
                    )}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {message.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs"
                          >
                            <PaperclipIcon className="h-3 w-3" />
                            <span>{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay mensajes para mostrar en esta categoría.
              </div>
            )}
          </div>
        </ScrollArea>
        <Separator className="my-4" />
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Escribe tu mensaje aquí..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-between">
            <Button variant="outline" size="sm">
              <PaperclipIcon className="h-4 w-4 mr-2" />
              Adjuntar
            </Button>
            <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
              <SendIcon className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Default mock data
const defaultCurrentUser = {
  name: "Juan Pérez",
  role: "Comprador",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan",
};

const defaultTopics = [
  "Documentos",
  "Tasación",
  "Aprobación",
  "Cierre",
  "General",
];

const defaultMessages: Message[] = [
  {
    id: "1",
    sender: {
      name: "María López",
      role: "Agente",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    },
    content:
      "Hola Juan, necesito que subas los documentos de ingresos actualizados para continuar con el proceso de aprobación.",
    timestamp: "Hoy, 10:30 AM",
    topic: "Documentos",
  },
  {
    id: "2",
    sender: {
      name: "Carlos Rodríguez",
      role: "Prestamista",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    },
    content:
      "La tasación está programada para el próximo martes a las 2:00 PM. Por favor asegúrate de estar presente.",
    timestamp: "Ayer, 3:45 PM",
    topic: "Tasación",
    attachments: [
      {
        name: "Detalles_Tasacion.pdf",
        type: "pdf",
        url: "#",
      },
    ],
  },
  {
    id: "3",
    sender: {
      name: "Juan Pérez",
      role: "Comprador",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan",
    },
    content: "Ya subí los documentos solicitados. ¿Hay algo más que necesiten?",
    timestamp: "Ayer, 4:20 PM",
    topic: "Documentos",
  },
  {
    id: "4",
    sender: {
      name: "Ana Martínez",
      role: "Procesador",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    },
    content:
      "Hemos recibido tus documentos y están siendo revisados. Te notificaremos cuando estén aprobados.",
    timestamp: "Ayer, 5:15 PM",
    topic: "Aprobación",
  },
  {
    id: "5",
    sender: {
      name: "María López",
      role: "Agente",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    },
    content:
      "Recuerda que necesitamos los estados de cuenta bancarios de los últimos 3 meses.",
    timestamp: "Hoy, 9:00 AM",
    topic: "Documentos",
  },
];

export default MessagingSystem;