import { useClipboard } from "@mantine/hooks";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "../../../components/atomic/Button";
import {
  Profile_Types_Enum,
  Space_Invite_Link_Types_Enum,
  useCreateInviteLinkMutation,
  useInviteLinksQuery,
  useProfilesBySpaceIdQuery,
} from "../../../generated/graphql";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";

function CopyLink({ link }: { link: string }) {
  const clipboard = useClipboard({ timeout: 500 });

  return (
    <div className="flex gap-4">
      <button
        onClick={() => {
          clipboard.copy(link);
        }}
      >
        {clipboard.copied ? "Copied!" : "Copy"}
      </button>
      <a href={link}>{link}</a>
    </div>
  );
}

function CreateInviteLink() {
  const { currentSpace } = useCurrentSpace();

  const [_, createInviteLink] = useCreateInviteLinkMutation();
  const [{ data: inviteLinksData }, refetchInviteLinks] = useInviteLinksQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  return (
    <div className="">
      <div className="text-xl font-bold">Invite Links</div>
      <div>
        {inviteLinksData?.space_invite_links?.map((inviteLink) => {
          const link = `${window.location.origin}/space/${currentSpace.slug}/join/${inviteLink.id}`;
          return <CopyLink key={inviteLink.id} link={link} />;
        })}
      </div>
      <Button
        onClick={async () => {
          await createInviteLink({
            space_id: currentSpace.id,
            type: Space_Invite_Link_Types_Enum.Member,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // One week
          });

          refetchInviteLinks();
        }}
      >
        Create Invite Link
      </Button>
    </div>
  );
}

function ShowAllUsers() {
  const { currentSpace } = useCurrentSpace();

  const [{ data: profilesData }] = useProfilesBySpaceIdQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  return (
    <div className="">
      <div className="text-xl font-bold">Users</div>
      <div className="grid grid-cols-2">
        {profilesData?.profiles?.map((profile) => {
          return (
            <>
              <div key={profile.id}>{profile.user.email}</div>
              <div key={profile.id}>{profile.type}</div>
            </>
          );
        })}
      </div>
    </div>
  );
}

export default function SpaceHomepage() {
  const router = useRouter();

  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  if (!currentProfile) {
    return <div>Ur not in this space lol</div>;
  }

  return (
    <div className="p-4">
      <div className="text-2xl">
        Welcome to <b>{currentSpace.name}</b>!
      </div>
      <div>There is nothing here lol</div>
      <Button
        onClick={() => {
          router.push("/");
        }}
      >
        Go back to home
      </Button>
      <div className="h-8"></div>
      {currentProfile.type === Profile_Types_Enum.Admin && <CreateInviteLink />}
      <div className="h-8"></div>

      <ShowAllUsers />
    </div>
  );
}
