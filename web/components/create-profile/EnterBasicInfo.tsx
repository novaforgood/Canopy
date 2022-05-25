import React, { useEffect, useRef, useState } from "react";

import AvatarEditor from "react-avatar-editor";
import toast from "react-hot-toast";

import {
  useInsertProfileImageMutation,
  useProfileImageQuery,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useUserData } from "../../hooks/useUserData";
import { apiClient } from "../../lib/apiClient";
import { Text } from "../atomic";
import { ImageUploader } from "../ImageUploader";

import { StageDisplayWrapper } from "./StageDisplayWrapper";

async function uploadImage(imageData: string) {
  const blob = await (await fetch(imageData)).blob();
  console.log(imageData);
  const body = new FormData();
  body.append("upload", blob, "profile.png");
  return await apiClient.postForm<{ image: { id: string; url: string } }>(
    "/api/services/uploadImage",
    body
  );
}
interface EnterNameProps {
  onComplete: (data: { profileImageId: string | null }) => void;
  onSkip: () => void;
}

export function EnterBasicInfo(props: EnterNameProps) {
  const { onComplete, onSkip } = props;

  const { userData } = useUserData();
  const { currentProfile } = useCurrentProfile();

  const [{ data: profileImageData }] = useProfileImageQuery({
    variables: { profile_id: currentProfile?.id ?? "" },
  });
  const [_, insertProfileImage] = useInsertProfileImageMutation();
  const profileImageUrl =
    profileImageData?.profile_listing_image[0]?.image.url ?? null;

  const editor = useRef<AvatarEditor | null>(null);

  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (profileImageUrl) {
      setImage(profileImageUrl);
    }
  }, [profileImageUrl]);

  return (
    <StageDisplayWrapper
      title="Basic information"
      onPrimaryAction={async () => {
        if (!currentProfile) {
          toast.error("Current profile not defined");
          return;
        }
        const imageData =
          editor.current?.getImageScaledToCanvas().toDataURL() ?? null;

        // If image exists, upload it
        if (imageData) {
          const res = await uploadImage(imageData).catch((err) => {
            toast.error(err.message);
            return null;
          });
          if (!res) return;

          const imageId = res.data.image.id;
          await insertProfileImage({
            image_id: imageId,
            profile_id: currentProfile.id,
          });
        }

        onComplete({
          profileImageId: "TODO: figure out what to return here",
        });
      }}
      onSecondaryAction={onSkip}
    >
      <div className="flex flex-col items-start">
        <div className="h-8"></div>

        <Text variant="subheading2" className="text-gray-600 font-bold">
          Name
        </Text>
        <div className="h-4"></div>
        <Text bold>
          {userData?.first_name} {userData?.last_name}
        </Text>

        <div className="h-8"></div>

        <Text variant="subheading2" className="text-gray-600 font-bold">
          Profile photo
        </Text>
        <div className="h-4"></div>
        <ImageUploader
          showZoom
          imageSrc={image}
          onImageSrcChange={setImage}
          width={300}
          height={300}
          getRef={(ref) => {
            editor.current = ref;
          }}
        />
      </div>
    </StageDisplayWrapper>
  );
}
