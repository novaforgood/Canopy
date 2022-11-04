import { useEffect, useState } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { EmailType } from "../../common/types";
import { useProfileByIdQuery } from "../../generated/graphql";
import { BxSend } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useIsLoggedIn } from "../../hooks/useIsLoggedIn";
import { useQueryParam } from "../../hooks/useQueryParam";
import { useUserData } from "../../hooks/useUserData";
import { apiClient } from "../../lib/apiClient";
import { getTimezoneSelectOptions } from "../../lib/timezone";
import { Text, Textarea } from "../atomic";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { ActionModal } from "../modals/ActionModal";

export const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

export interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent: () => void;
  profileId: string | null;
}

export function MessageModal(props: MessageModalProps) {
  const { isOpen, onClose, profileId, onMessageSent } = props;

  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  const { userData } = useUserData();
  const { currentProfile } = useCurrentProfile();
  const spaceSlug = useQueryParam("slug", "string");
  const [introMsg, setIntroMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIntroMsg("");
    }
  }, [isOpen]);

  const [{ data: profileData }] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "", is_logged_in: isLoggedIn },
  });

  const [createdChatRoomId, setCreatedChatRoomId] = useState<string | null>(
    null
  );

  const sendMessage = async () => {
    if (!currentProfile) {
      toast.error("Please login to send a message");
      return;
    }

    if (!profileId) {
      toast.error("Please select a profile to send a message");
      return;
    }

    await apiClient
      .post<
        {
          senderProfileId: string;
          receiverProfileId: string;
          firstMessage: string;
        },
        { chatRoomId: string }
      >("/api/chat/createChatRoom", {
        senderProfileId: currentProfile.id,
        receiverProfileId: profileId,
        firstMessage: introMsg,
      })
      .then((data) => {
        onMessageSent();
        setCreatedChatRoomId(data.chatRoomId);
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const navigateToChatRoom = async () => {
    if (createdChatRoomId) {
      await router.push(`/space/${spaceSlug}/chat/${createdChatRoomId}`);
    } else {
      toast.error("No chat room id");
    }
  };

  if (!profileData?.profile_by_pk) {
    return null;
  }

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        actionText={
          createdChatRoomId ? (
            "View chats"
          ) : (
            <>
              Send message
              <BxSend className="ml-2 -mr-2 h-4 w-4" />
            </>
          )
        }
        onClose={onClose}
        onAction={createdChatRoomId ? navigateToChatRoom : sendMessage}
        actionDisabled={createdChatRoomId ? false : !introMsg}
        secondaryActionText={createdChatRoomId ? "Close" : "Cancel"}
        onSecondaryAction={onClose}
      >
        <div className="px-16 pt-8">
          <div className="flex w-96 flex-col items-center ">
            <Text variant="heading4">
              {createdChatRoomId
                ? "Message sent!"
                : `Message ${profileData.profile_by_pk.user.first_name}`}
            </Text>

            <div className="h-8"></div>

            <div className="flex w-96 flex-col gap-8">
              {createdChatRoomId ? (
                <Text className="mx-auto max-w-xs text-center">
                  {profileData.profile_by_pk.user.first_name} will receive a
                  notification of your message request.
                </Text>
              ) : (
                <div className="flex w-full flex-col">
                  <Text className="mb-2 text-gray-600">Message</Text>
                  <Textarea
                    minRows={4}
                    value={introMsg}
                    onValueChange={setIntroMsg}
                    placeholder="Example: Hi, I’m Billy! I can’t believe that someone else here is interested in dinosaurs. Maybe we could chat about it sometime? :)"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="h-12"></div>
        </div>
      </ActionModal>
    </>
  );
}
