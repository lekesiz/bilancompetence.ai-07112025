import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Send, MessageSquare, User } from "lucide-react";
import { useRoute } from "wouter";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";

export default function Messages() {
  const { user } = useAuth();
  const [, params] = useRoute("/bilans/:id/messages");
  const bilanId = params?.id ? parseInt(params.id) : 0;

  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: bilan } = trpc.bilans.getById.useQuery({ id: bilanId }, { enabled: bilanId > 0 });

  const {
    data: messagesList,
    isLoading,
    refetch,
  } = trpc.messages.listByBilan.useQuery({ bilanId }, { enabled: bilanId > 0 });

  const sendMessageMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessageContent("");
      refetch();
      toast.success("Message envoyé");
      scrollToBottom();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const markAsReadMutation = trpc.messages.markBilanAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (messagesList && messagesList.length > 0) {
      // Marquer les messages comme lus
      markAsReadMutation.mutate({ bilanId });
    }
  }, [messagesList]);

  useEffect(() => {
    scrollToBottom();
  }, [messagesList]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!messageContent.trim()) {
      toast.error("Le message ne peut pas être vide");
      return;
    }

    if (!bilan) {
      toast.error("Bilan non trouvé");
      return;
    }

    // Déterminer le destinataire
    const receiverId =
      user?.role === "BENEFICIARY" ? bilan.consultantId : bilan.beneficiaryId;

    if (!receiverId) {
      toast.error("Destinataire non trouvé");
      return;
    }

    sendMessageMutation.mutate({
      bilanId,
      receiverId,
      content: messageContent,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messagerie</h1>
            <p className="text-gray-600 mt-2">
              {bilan ? `Bilan #${bilan.id}` : "Conversation"}
            </p>
          </div>
          <Badge variant="secondary">
            <MessageSquare className="mr-2 h-4 w-4" />
            {messagesList?.length || 0} messages
          </Badge>
        </div>

        {/* Messages Container */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversation
            </CardTitle>
          </CardHeader>

          {/* Messages List */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : messagesList && messagesList.length > 0 ? (
              <>
                {messagesList.map((message) => {
                  const isOwnMessage = message.senderId === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          isOwnMessage
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {isOwnMessage ? "Vous" : "Interlocuteur"}
                          </span>
                          <span
                            className={`text-xs ${
                              isOwnMessage ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageSquare className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Aucun message</p>
                <p className="text-sm">Commencez la conversation</p>
              </div>
            )}
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Écrivez votre message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !messageContent.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
