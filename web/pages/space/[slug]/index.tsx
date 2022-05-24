import { Fragment, ReactNode, useEffect, useMemo } from "react";

import { Menu, Transition } from "@headlessui/react";
import { useElementSize } from "@mantine/hooks";
import classNames from "classnames";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

import { InviteLinksList } from "../../../components/admin/InviteLinksList";
import { MembersList } from "../../../components/admin/MembersList";
import { Button, Text } from "../../../components/atomic";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { EditProfileListing } from "../../../components/EditProfileListing";
import { useAllProfilesOfUserQuery } from "../../../generated/graphql";
import {
  BxCaretDown,
  BxLogOut,
  BxTransfer,
} from "../../../generated/icons/regular";
import {
  BxsCaretDownCircle,
  BxsUserAccount,
} from "../../../generated/icons/solid";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { useUserData } from "../../../hooks/useUserData";
import { auth } from "../../../lib/firebase";

interface SidePaddingProps {
  children: ReactNode;
}
function SidePadding({ children }: SidePaddingProps) {
  return (
    <div className="w-full px-2 flex flex-col items-center">
      <div className="max-w-5xl w-full">{children}</div>
    </div>
  );
}

function Dropdown() {
  const { userData } = useUserData();
  const { currentSpace } = useCurrentSpace();

  const router = useRouter();

  const [{ data: allProfilesData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => {
        const caretStyles = classNames({
          "h-7 w-7 transition": true,
          "rotate-180": open,
        });

        return (
          <>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 top-full mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-md border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => {
                    const styles = classNames({
                      "group flex w-full items-center rounded-md px-2 py-3 text-sm":
                        true,
                      "bg-white": !active,
                      "bg-gray-50": active,
                    });
                    return (
                      <button
                        className={styles}
                        onClick={() => {
                          router.push(`/space/${currentSpace?.slug}/account`);
                        }}
                      >
                        <BxsUserAccount className="w-5 h-5 mr-2" />
                        My Account
                      </button>
                    );
                  }}
                </Menu.Item>
                {allProfilesData?.profile.map((profile) => {
                  return (
                    <Menu.Item key={profile.id}>
                      {({ active }) => {
                        const styles = classNames({
                          "group flex w-full items-center rounded-md px-2 py-3 text-sm whitespace-nowrap truncate":
                            true,
                          "bg-white": !active,
                          "bg-gray-50": active,
                        });
                        return (
                          <button
                            className={styles}
                            onClick={() => {
                              router.push(`/space/${profile.space.slug}`);
                            }}
                          >
                            <BxTransfer className="w-5 h-5 mr-2 flex-none" />
                            {profile.space.name}
                          </button>
                        );
                      }}
                    </Menu.Item>
                  );
                })}

                <Menu.Item>
                  {({ active }) => {
                    const styles = classNames({
                      "group flex w-full items-center rounded-md px-2 py-3 text-sm":
                        true,
                      "bg-white": !active,
                      "bg-gray-50": active,
                    });
                    return (
                      <button
                        className={styles}
                        onClick={() => {
                          signOut(auth);
                        }}
                      >
                        <BxLogOut className="h-5 w-5 mr-2" />
                        Log Out
                      </button>
                    );
                  }}
                </Menu.Item>
              </Menu.Items>
            </Transition>

            <div>
              <Menu.Button className="focus:outline-none">
                <div className="flex items-center gap-2">
                  <Text>
                    {userData?.first_name} {userData?.last_name}
                  </Text>
                  <BxCaretDown className={caretStyles} />
                </div>
              </Menu.Button>
            </div>
          </>
        );
      }}
    </Menu>
  );
}
function Navbar() {
  return (
    <div className="flex items-center justify-between mt-12">
      <div></div>
      <Dropdown />
    </div>
  );
}

function SpaceLandingScreen() {
  const { currentSpace } = useCurrentSpace();

  const { ref, width } = useElementSize();

  const desiredHeight = (width * 3) / 4;

  return (
    <div className="flex items-center">
      <div className="flex flex-col flex-1 p-4">
        <Text variant="heading1">{currentSpace?.name}</Text>
        <div className="h-10"></div>
        <Text>Lorem ipsum</Text>
      </div>
      <div className="flex-1 self-stretch p-8">
        <div
          ref={ref}
          className="h-full w-full bg-gray-50"
          style={{ height: desiredHeight }}
        ></div>
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
    <div>
      <SidePadding>
        <Navbar />
        <SpaceLandingScreen />
        <div className="flex gap-2">
          <a href={`${router.asPath}/admin`}>Admin page</a>
          <a href={`${router.asPath}/account`}>Account</a>
        </div>
      </SidePadding>
    </div>
  );
}
