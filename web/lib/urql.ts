import { devtoolsExchange } from "@urql/devtools";
import { cacheExchange } from "@urql/exchange-graphcache";
import {
  createClient,
  dedupExchange,
  fetchExchange,
  makeOperation,
} from "urql";

import schema, {
  Profile_To_Profile_Role_Flattened,
} from "../generated/graphql";

import { requireEnv } from "./env";

export function getUrqlClient(jwt: string) {
  console.log("getUrqlClient. Jwt length:", jwt.length);
  return createClient({
    url: requireEnv("NEXT_PUBLIC_GRAPHQL_ENDPOINT"),
    requestPolicy: "cache-and-network",
    fetchOptions: () => {
      return {
        headers: {
          authorization: `Bearer ${jwt}`,
        },
      };
    },
    exchanges: [
      devtoolsExchange,
      dedupExchange,
      cacheExchange({
        schema,
        keys: {
          profile_to_profile_role_flattened: (data) =>
            `${data.profile_id}-${data.profile_role}`,
          profile_listing_to_space_tag: (data) =>
            `${data.profile_listing_id}-${data.space_tag_id}`,
        },
      }),
      fetchExchange,
    ],
  });
}
