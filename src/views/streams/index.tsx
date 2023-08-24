import { useCallback, useState } from "react";
import { Code, Flex, Select, SimpleGrid } from "@chakra-ui/react";
import useTimelineLoader from "../../hooks/use-timeline-loader";
import IntersectionObserverProvider from "../../providers/intersection-observer";
import { useTimelineCurserIntersectionCallback } from "../../hooks/use-timeline-cursor-intersection-callback";
import useSubject from "../../hooks/use-subject";
import StreamCard from "./components/stream-card";
import { STREAM_KIND, parseStreamEvent } from "../../helpers/nostr/stream";
import { NostrEvent } from "../../types/nostr-event";
import RelaySelectionButton from "../../components/relay-selection/relay-selection-button";
import RelaySelectionProvider, { useRelaySelectionRelays } from "../../providers/relay-selection-provider";
import useRelaysChanged from "../../hooks/use-relays-changed";
import PeopleListSelection from "../../components/people-list-selection/people-list-selection";
import PeopleListProvider, { usePeopleListContext } from "../../components/people-list-selection/people-list-provider";
import TimelineActionAndStatus from "../../components/timeline-page/timeline-action-and-status";
import useParsedStreams from "../../hooks/use-parsed-streams";

function StreamsPage() {
  const relays = useRelaySelectionRelays();
  const [filterStatus, setFilterStatus] = useState<string>("live");

  const eventFilter = useCallback(
    (event: NostrEvent) => {
      try {
        const parsed = parseStreamEvent(event);
        return parsed.status === filterStatus;
      } catch (e) {}
      return false;
    },
    [filterStatus],
  );

  const { people, list } = usePeopleListContext();
  const query =
    people && people.length > 0
      ? [
          { authors: people.map((p) => p.pubkey), kinds: [STREAM_KIND] },
          { "#p": people.map((p) => p.pubkey), kinds: [STREAM_KIND] },
        ]
      : { kinds: [STREAM_KIND] };

  const timeline = useTimelineLoader(`${list}-streams`, relays, query, { eventFilter });

  useRelaysChanged(relays, () => timeline.reset());

  const callback = useTimelineCurserIntersectionCallback(timeline);

  const events = useSubject(timeline.timeline);
  const streams = useParsedStreams(events);

  return (
    <Flex p="2" gap="2" overflow="hidden" direction="column">
      <Flex gap="2" wrap="wrap">
        <PeopleListSelection w={["full", "xs"]} />
        <Select w={["full", "xs"]} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="live">Live</option>
          <option value="ended">Ended</option>
        </Select>
        <RelaySelectionButton ml="auto" />
      </Flex>
      <IntersectionObserverProvider callback={callback}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing="2">
          {streams.map((stream) => (
            <StreamCard key={stream.event.id} stream={stream} />
          ))}
        </SimpleGrid>
        <TimelineActionAndStatus timeline={timeline} />
      </IntersectionObserverProvider>
    </Flex>
  );
}
export default function StreamsView() {
  return (
    <RelaySelectionProvider
      additionalDefaults={["wss://nos.lol", "wss://relay.damus.io", "wss://relay.snort.social", "wss://nostr.wine"]}
    >
      <PeopleListProvider>
        <StreamsPage />
      </PeopleListProvider>
    </RelaySelectionProvider>
  );
}
