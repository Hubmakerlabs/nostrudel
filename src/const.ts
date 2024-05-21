import { safeRelayUrl, safeRelayUrls } from "./helpers/relay";

export const SEARCH_RELAYS = safeRelayUrls([
  // "wss://relay.nostr.band",
  // "wss://search.nos.today",
  // "wss://relay.noswhere.com",
  // TODO: requires NIP-42 auth
  // "wss://filter.nostr.wine",
    "wss://mr.mleku.net"
]);
export const COMMON_CONTACT_RELAY = safeRelayUrl("wss://mr.mleku.net") as string;
