import { useState, useEffect, useMemo } from "react";

import { BxSend } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { usePrevious } from "../../hooks/usePrevious";
import { Button, Text, Textarea } from "../atomic";
import { IconButton } from "../buttons/IconButton";
import { ProfileImage } from "../common/ProfileImage";

import { RenderMessage } from "./RenderMessage";
import { SendMessageInput } from "./SendMessageInput";
import { useChatRoom } from "./useChatRoom";
import { useMessages } from "./useMessages";

interface RenderChatRoomMessagesProps {
  chatRoomId: string;
}

export function RenderChatRoomMessages(props: RenderChatRoomMessagesProps) {
  const { chatRoomId } = props;

  const { chatParticipants } = useChatRoom(chatRoomId ?? "");

  const { currentProfile } = useCurrentProfile();
  const {
    messagesList,
    fetchMore,
    fetchingMessages,
    markMessageAsRead,
    noMoreMessages,
  } = useMessages(chatRoomId ?? "");
  const [newMessage, setNewMessage] = useState("");
  useEffect(() => {
    setNewMessage("");
  }, [chatRoomId]);

  const lastMessageIdByOther: number | null = useMemo(() => {
    return (
      messagesList.find(
        (m) =>
          currentProfile &&
          m.sender_profile_id &&
          m.sender_profile_id !== currentProfile.id
      )?.id ?? null
    );
  }, [messagesList, currentProfile]);

  const prevLastMessageIdByOther = usePrevious(lastMessageIdByOther);

  useEffect(() => {
    if (document.hidden) {
      return;
    }
    if (
      lastMessageIdByOther &&
      lastMessageIdByOther !== prevLastMessageIdByOther
    ) {
      const newMessage = messagesList.find(
        (m) => m.id === lastMessageIdByOther
      );
      markMessageAsRead(newMessage);
    }
  }, [
    lastMessageIdByOther,
    markMessageAsRead,
    messagesList,
    prevLastMessageIdByOther,
  ]);

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col-reverse overflow-y-scroll overscroll-contain p-4">
        {currentProfile &&
          messagesList.map((message, idx) => {
            // Note: Messages are ordered by created_at DESC
            const prevMessage = messagesList[idx + 1] ?? null;
            const nextMessage = messagesList[idx - 1] ?? null;
            let nextMessageSentByMe = null;
            for (let j = idx - 1; j >= 0; j--) {
              const msg = messagesList[j];
              if (msg.sender_profile_id === currentProfile.id) {
                nextMessageSentByMe = msg;
                break;
              }
            }

            return (
              <RenderMessage
                key={message.id}
                message={message}
                prevMessage={prevMessage}
                nextMessage={nextMessage}
                nextMessageByMe={nextMessageSentByMe}
                chatParticipants={chatParticipants}
              />
            );
          })}
        {currentProfile && !noMoreMessages && (
          <div className="my-4 flex w-full justify-center">
            <Button
              variant="secondary"
              loading={fetchingMessages}
              size="small"
              onClick={() => {
                fetchMore();
              }}
            >
              Load more...
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
