import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { supabase } from "@/lib/supabaseClient"
import type { Database } from "@/types/supabase"
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js"

export interface MessagingUser {
  id: string
  name: string
  role: string
  avatarUrl?: string | null
}

export interface ParticipantProfile {
  id: string
  displayName: string
  avatarUrl?: string | null
  role: string
  isCurrentUser: boolean
}

export interface MessageAttachment {
  id: string
  messageId: string
  name: string
  url: string | null
  contentType: string | null
  size: number | null
  createdAt: string
  status: "pending" | "sent" | "error"
}

export interface ConversationMessage {
  id: string
  conversationId: string
  content: string
  topic: string | null
  createdAt: string
  sender: ParticipantProfile
  attachments: MessageAttachment[]
  status: "pending" | "sent" | "error"
  optimisticKey?: string
}

export interface ConversationPreview {
  id: string
  title: string | null
  updatedAt: string
  participants: ParticipantProfile[]
  lastMessage?: ConversationMessage
}

type Tables = Database["public"]["Tables"]
type MessageRow = Tables["messages"]["Row"]
type AttachmentRow = Tables["attachments"]["Row"]
type ParticipantRow = Tables["participants"]["Row"]
type ConversationRow = Tables["conversations"]["Row"]

type MessageWithAttachments = MessageRow & { attachments?: AttachmentRow[] | null }
type ConversationSelectRow = ConversationRow & {
  participants: ParticipantRow[]
  latest_message?: MessageWithAttachments[] | null
}

export interface UseMessagingOptions {
  currentUser: MessagingUser | null
  initialConversationId?: string | null
}

export interface SendMessageOptions {
  conversationId: string
  content: string
  topic?: string | null
  attachments?: File[]
}

export interface UseMessagingResult {
  conversations: ConversationPreview[]
  messages: ConversationMessage[]
  selectedConversationId: string | null
  loadingConversations: boolean
  loadingMessages: boolean
  sending: boolean
  error: string | null
  selectConversation: (conversationId: string) => void
  clearError: () => void
  sendMessage: (options: SendMessageOptions) => Promise<void>
  refresh: () => Promise<void>
}

const ATTACHMENT_BUCKET = "message-attachments"

const formatParticipant = (
  row: ParticipantRow,
  currentUserId: string | null,
): ParticipantProfile => ({
  id: row.user_id,
  displayName: row.display_name,
  avatarUrl: row.avatar_url ?? undefined,
  role: row.role,
  isCurrentUser: currentUserId === row.user_id,
})

const formatAttachment = (row: AttachmentRow): MessageAttachment => ({
  id: row.id,
  messageId: row.message_id,
  name: row.name,
  url: row.url,
  contentType: row.content_type,
  size: row.size,
  createdAt: row.created_at,
  status: "sent",
})

const formatMessage = (
  row: MessageWithAttachments,
  participants: ParticipantProfile[],
  fallbackSender: ParticipantProfile,
  status: ConversationMessage["status"] = "sent",
  attachmentOverrides?: MessageAttachment[],
): ConversationMessage => {
  const sender =
    participants.find((participant) => participant.id === row.sender_id) ??
    fallbackSender

  return {
    id: row.id,
    conversationId: row.conversation_id,
    content: row.content,
    topic: row.topic,
    createdAt: row.created_at,
    sender,
    attachments:
      attachmentOverrides ?? (row.attachments ?? []).map(formatAttachment),
    status,
  }
}

const mapConversation = (
  row: ConversationSelectRow,
  currentUserId: string | null,
): ConversationPreview => {
  const participants = (row.participants ?? []).map((participant) =>
    formatParticipant(participant, currentUserId),
  )

  const fallbackSender =
    participants.find((participant) => participant.isCurrentUser) ??
    ({
      id: currentUserId ?? "",
      displayName: "You",
      avatarUrl: undefined,
      role: "member",
      isCurrentUser: true,
    } satisfies ParticipantProfile)

  const lastMessageRow = row.latest_message?.[0]
  return {
    id: row.id,
    title: row.title,
    updatedAt: row.updated_at,
    participants,
    lastMessage: lastMessageRow
      ? formatMessage(lastMessageRow, participants, fallbackSender)
      : undefined,
  }
}

const getPublicUrl = (path: string) => {
  const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export const useMessaging = ({
  currentUser,
  initialConversationId = null,
}: UseMessagingOptions): UseMessagingResult => {
  const [conversations, setConversations] = useState<ConversationPreview[]>([])
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, ConversationMessage[]>
  >({})
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(initialConversationId)
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const conversationsRef = useRef<ConversationPreview[]>([])
  const messagesRef = useRef<Record<string, ConversationMessage[]>>({})

  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  useEffect(() => {
    messagesRef.current = messagesByConversation
  }, [messagesByConversation])

  const getParticipants = useCallback(
    (conversationId: string): ParticipantProfile[] => {
      return (
        conversationsRef.current.find(
          (conversation) => conversation.id === conversationId,
        )?.participants ?? []
      )
    },
    [],
  )

  const fetchConversations = useCallback(async () => {
    if (!currentUser?.id) return

    setLoadingConversations(true)
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        title,
        updated_at,
        participants:participants!inner (
          user_id,
          role,
          display_name,
          avatar_url
        ),
        latest_message:messages(order=created_at.desc, limit=1) (
          id,
          conversation_id,
          content,
          created_at,
          sender_id,
          sender_role,
          topic,
          attachments (
            id,
            message_id,
            name,
            url,
            content_type,
            storage_path,
            size,
            created_at
          )
        )
      `,
      )
      .eq("participants.user_id", currentUser.id)
      .order("updated_at", { ascending: false })

    if (error) {
      setError(error.message)
      setLoadingConversations(false)
      return
    }

    const formatted = (data as unknown as ConversationSelectRow[]).map((row) =>
      mapConversation(row, currentUser.id),
    )
    setConversations(formatted)
    setLoadingConversations(false)

    if (!selectedConversationId && formatted.length > 0) {
      setSelectedConversationId(formatted[0].id)
    }
  }, [currentUser?.id, selectedConversationId])

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      if (!currentUser?.id) return

      setLoadingMessages(true)
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          id,
          conversation_id,
          content,
          created_at,
          sender_id,
          sender_role,
          topic,
          attachments (
            id,
            message_id,
            name,
            url,
            content_type,
            storage_path,
            size,
            created_at
          )
        `,
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        setError(error.message)
        setLoadingMessages(false)
        return
      }

      const participants = getParticipants(conversationId)
      const fallbackSender =
        participants.find((participant) => participant.isCurrentUser) ??
        ({
          id: currentUser.id,
          displayName: currentUser.name,
          avatarUrl: currentUser.avatarUrl,
          role: currentUser.role,
          isCurrentUser: true,
        } satisfies ParticipantProfile)

      const formatted = (data as MessageWithAttachments[]).map((row) =>
        formatMessage(row, participants, fallbackSender),
      )

      setMessagesByConversation((previous) => ({
        ...previous,
        [conversationId]: formatted,
      }))
      setLoadingMessages(false)
    },
    [currentUser, getParticipants],
  )

  const refresh = useCallback(async () => {
    await fetchConversations()
    if (selectedConversationId) {
      await fetchMessages(selectedConversationId)
    }
  }, [fetchConversations, fetchMessages, selectedConversationId])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId)
    }
  }, [fetchMessages, selectedConversationId])

  useEffect(() => {
    if (!currentUser?.id) return

    const channel = supabase
      .channel(`messaging-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload: RealtimePostgresInsertPayload<MessageRow>) => {
          const messageRow = payload.new
          const participants = getParticipants(messageRow.conversation_id)
          const fallbackSender =
            participants.find((participant) => participant.isCurrentUser) ??
            ({
              id: currentUser.id,
              displayName: currentUser.name,
              avatarUrl: currentUser.avatarUrl,
              role: currentUser.role,
              isCurrentUser: true,
            } satisfies ParticipantProfile)

          const { data: attachmentRows } = await supabase
            .from("attachments")
            .select(
              `
              id,
              message_id,
              name,
              url,
              content_type,
              storage_path,
              size,
              created_at
            `,
            )
            .eq("message_id", messageRow.id)

          const messageWithAttachments: MessageWithAttachments = {
            ...messageRow,
            attachments: attachmentRows ?? [],
          }

          const formattedMessage = formatMessage(
            messageWithAttachments,
            participants,
            fallbackSender,
          )

          setMessagesByConversation((previous) => {
            const existing = previous[messageRow.conversation_id] ?? []
            if (existing.some((message) => message.id === formattedMessage.id)) {
              return previous
            }

            return {
              ...previous,
              [messageRow.conversation_id]: [
                ...existing,
                { ...formattedMessage, status: "sent" },
              ],
            }
          })

          setConversations((previous) => {
            const index = previous.findIndex(
              (conversation) => conversation.id === messageRow.conversation_id,
            )
            if (index === -1) return previous

            const updatedConversation: ConversationPreview = {
              ...previous[index],
              updatedAt: messageRow.created_at,
              lastMessage: { ...formattedMessage, status: "sent" },
            }

            const reordered = [
              updatedConversation,
              ...previous.filter(
                (conversation) =>
                  conversation.id !== messageRow.conversation_id,
              ),
            ]

            return reordered
          })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attachments",
        },
        (payload: RealtimePostgresInsertPayload<AttachmentRow>) => {
          const attachment = formatAttachment(payload.new)
          setMessagesByConversation((previous) => {
            const conversationEntry = Object.entries(previous).find(([, messages]) =>
              messages.some((message) => message.id === attachment.messageId),
            )

            if (!conversationEntry) return previous

            const [conversationId, messages] = conversationEntry

            return {
              ...previous,
              [conversationId]: messages.map((message) =>
                message.id === attachment.messageId
                  ? {
                      ...message,
                      attachments: message.attachments
                        .filter((existing) => existing.id !== attachment.id)
                        .concat({ ...attachment, status: "sent" }),
                    }
                  : message,
              ),
            }
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser, getParticipants])

  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const sendMessage = useCallback(
    async ({
      conversationId,
      content,
      topic,
      attachments = [],
    }: SendMessageOptions) => {
      if (!currentUser) {
        setError("Debes iniciar sesión para enviar mensajes.")
        return
      }

      const trimmedContent = content.trim()
      if (!trimmedContent) return

      const temporaryId = crypto.randomUUID()
      const createdAt = new Date().toISOString()

      const participants = getParticipants(conversationId)
      const senderProfile =
        participants.find((participant) => participant.id === currentUser.id) ??
        ({
          id: currentUser.id,
          displayName: currentUser.name,
          avatarUrl: currentUser.avatarUrl,
          role: currentUser.role,
          isCurrentUser: true,
        } satisfies ParticipantProfile)

      const optimisticAttachments: MessageAttachment[] = attachments.map(
        (file, index) => ({
          id: `${temporaryId}-attachment-${index}`,
          messageId: temporaryId,
          name: file.name,
          url: null,
          contentType: file.type || null,
          size: file.size ?? null,
          createdAt,
          status: "pending",
        }),
      )

      const optimisticMessage: ConversationMessage = {
        id: temporaryId,
        conversationId,
        content: trimmedContent,
        topic: topic ?? null,
        createdAt,
        sender: senderProfile,
        attachments: optimisticAttachments,
        status: "pending",
        optimisticKey: temporaryId,
      }

      setMessagesByConversation((previous) => ({
        ...previous,
        [conversationId]: [...(previous[conversationId] ?? []), optimisticMessage],
      }))

      setConversations((previous) => {
        const index = previous.findIndex((item) => item.id === conversationId)
        if (index === -1) return previous
        const updatedConversation: ConversationPreview = {
          ...previous[index],
          lastMessage: optimisticMessage,
          updatedAt: createdAt,
        }
        return [
          updatedConversation,
          ...previous.filter((item) => item.id !== conversationId),
        ]
      })

      setSending(true)

      const { data: insertedMessage, error: insertError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          sender_role: currentUser.role,
          content: trimmedContent,
          topic: topic ?? null,
        })
        .select(
          `
          id,
          conversation_id,
          content,
          created_at,
          sender_id,
          sender_role,
          topic
        `,
        )
        .single()

      if (insertError || !insertedMessage) {
        setError(insertError?.message ?? "No se pudo enviar el mensaje.")
        setMessagesByConversation((previous) => ({
          ...previous,
          [conversationId]: (previous[conversationId] ?? []).map((message) =>
            message.id === temporaryId
              ? { ...message, status: "error" }
              : message,
          ),
        }))
        setSending(false)
        return
      }

      const uploadedAttachments: MessageAttachment[] = []
      for (const [index, file] of attachments.entries()) {
        const storagePath = `${conversationId}/${insertedMessage.id}/${Date.now()}-${
          index + 1
        }-${file.name}`
          .replace(/\s+/g, "-")
          .toLowerCase()

        const upload = await supabase.storage
          .from(ATTACHMENT_BUCKET)
          .upload(storagePath, file, { upsert: false })

        if (upload.error) {
          uploadedAttachments.push({
            id: `${insertedMessage.id}-attachment-error-${index}`,
            messageId: insertedMessage.id,
            name: file.name,
            url: null,
            contentType: file.type || null,
            size: file.size ?? null,
            createdAt,
            status: "error",
          })
          setError(upload.error.message)
          continue
        }

        const publicUrl = getPublicUrl(upload.data.path)

        const { data: insertedAttachment, error: attachmentError } = await supabase
          .from("attachments")
          .insert({
            message_id: insertedMessage.id,
            name: file.name,
            content_type: file.type || null,
            size: file.size ?? null,
            storage_path: upload.data.path,
            url: publicUrl,
          })
          .select(
            `
            id,
            message_id,
            name,
            url,
            content_type,
            storage_path,
            size,
            created_at
          `,
          )
          .single()

        if (attachmentError || !insertedAttachment) {
          uploadedAttachments.push({
            id: `${insertedMessage.id}-attachment-error-${index}`,
            messageId: insertedMessage.id,
            name: file.name,
            url: publicUrl,
            contentType: file.type || null,
            size: file.size ?? null,
            createdAt,
            status: "error",
          })
          setError(
            attachmentError?.message ??
              "No se pudo guardar la información del archivo adjunto.",
          )
        } else {
          uploadedAttachments.push({
            ...formatAttachment(insertedAttachment),
            status: "sent",
          })
        }
      }

      const deliveredMessage = formatMessage(
        { ...insertedMessage, attachments: [] },
        getParticipants(conversationId),
        senderProfile,
        uploadedAttachments.some((attachment) => attachment.status === "error")
          ? "error"
          : "sent",
        uploadedAttachments.length ? uploadedAttachments : undefined,
      )

      setMessagesByConversation((previous) => ({
        ...previous,
        [conversationId]: (previous[conversationId] ?? []).map((message) =>
          message.id === temporaryId ? deliveredMessage : message,
        ),
      }))

      setConversations((previous) => {
        const index = previous.findIndex((item) => item.id === conversationId)
        if (index === -1) return previous
        const updatedConversation: ConversationPreview = {
          ...previous[index],
          lastMessage: deliveredMessage,
          updatedAt: insertedMessage.created_at,
        }
        return [
          updatedConversation,
          ...previous.filter((item) => item.id !== conversationId),
        ]
      })

      setSending(false)
    },
    [currentUser, getParticipants],
  )

  const messages = useMemo(() => {
    if (!selectedConversationId) return []
    return messagesByConversation[selectedConversationId] ?? []
  }, [messagesByConversation, selectedConversationId])

  return {
    conversations,
    messages,
    selectedConversationId,
    loadingConversations,
    loadingMessages,
    sending,
    error,
    selectConversation,
    clearError,
    sendMessage,
    refresh,
  }
}
