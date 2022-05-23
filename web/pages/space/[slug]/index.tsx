import { useEffect, useMemo } from "react";

import { useRouter } from "next/router";

import { InviteLinksList } from "../../../components/admin/InviteLinksList";
import { MembersList } from "../../../components/admin/MembersList";
import { Button } from "../../../components/atomic";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { EditProfileListing } from "../../../components/EditProfileListing";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";

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
      <Breadcrumbs />

      <div className="flex gap-2">
        <a href={`${router.asPath}/admin`}>Admin page</a>
        <a href={`${router.asPath}/account`}>Account</a>
      </div>
    </div>
  );
}
