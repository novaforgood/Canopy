import type { StackScreenProps } from "@react-navigation/stack";
import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Text } from "../components/atomic/Text";
import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import type { RootStackParams } from "../types/navigation";
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { BxCog } from "../generated/icons/regular";
import { SpaceCoverPhoto } from "../components/SpaceCoverPhoto";
import { BxsGroup } from "../generated/icons/solid";
import { useAtom } from "jotai";
import { currentSpaceAtom } from "../lib/jotai";

function HomeScreen({ navigation }: StackScreenProps<RootStackParams, "Home">) {
  const spaces = [{ spaceSlug: "test-space-1", spaceName: "Test Space 1" }];

  const { userData } = useUserData();
  const [{ data: profileData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });

  const [_, setCurrentSpace] = useAtom(currentSpaceAtom);
  return (
    <SafeAreaView>
      <ScrollView style={{ height: "100%" }}>
        <Box p={4}>
          <Text variant="heading4">
            Welcome to Canopy Mobile, {userData?.first_name}!
          </Text>
          {profileData?.profile.map((profile) => {
            return (
              <Box
                // shadowColor="black"
                // shadowOffset={{ width: 10, height: 10 }}
                // shadowOpacity={0.5}
                // shadowRadius={10}
                // elevation={5}
                mt={4}
                borderRadius="sm"
                overflow="hidden"
                key={profile.id}
              >
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Directory");
                    setCurrentSpace({
                      name: profile.space.name,
                      slug: profile.space.slug,
                    });
                  }}
                >
                  <Box>
                    <SpaceCoverPhoto
                      src={profile.space.space_cover_image?.image.url}
                    />
                    <Box
                      padding={2}
                      flexDirection="row"
                      alignItems="center"
                      backgroundColor="white"
                    >
                      <BxsGroup height={20} width={20} />
                      <Text variant="subheading2" ml={2}>
                        {profile.space.name}
                      </Text>
                    </Box>
                  </Box>
                </TouchableOpacity>
              </Box>
            );
          })}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen;
