import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/auth";

export type ServerEvent =
  | { type: "history"; events: HistoryEvent[] }
  | { type: "action"; speaker: string; content: string; created_at: string }
  | {
      type: "narration";
      speaker: "dm";
      content: string;
      suggested_roll: { sides: number; reason: string; dc?: number } | null;
      created_at: string;
    }
  | {
      type: "roll";
      speaker: string;
      sides: number;
      modifier: number;
      result: number;
      total: number;
      reason: string;
      created_at: string;
    }
  | { type: "presence"; users: string[] }
  | { type: "pong" };

export interface HistoryEvent {
  type: "narration" | "action";
  speaker: string;
  content: string;
  id: number;
  created_at: string;
}

export type ChatEntry =
  | { kind: "action"; id: string; speaker: string; content: string; at: string }
  | {
      kind: "narration";
      id: string;
      speaker: "dm";
      content: string;
      suggestedRoll?: { sides: number; reason: string; dc?: number } | null;
      at: string;
    }
  | {
      kind: "roll";
      id: string;
      speaker: string;
      sides: number;
      modifier: number;
      result: number;
      total: number;
      reason: string;
      at: string;
    };

export type ConnState = "connecting" | "open" | "closed";

interface UseCampaignSocketOpts {
  campaignId: number | null;
}

export function useCampaignSocket({ campaignId }: UseCampaignSocketOpts) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [state, setState] = useState<ConnState>("closed");
  const [presence, setPresence] = useState<string[]>([]);
  const [log, setLog] = useState<ChatEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const append = useCallback((entry: ChatEntry) => {
    setLog((l) => [...l, entry]);
  }, []);

  useEffect(() => {
    if (!campaignId || !accessToken) return;

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${proto}://${window.location.host}/api/ws/campaigns/${campaignId}?token=${encodeURIComponent(
      accessToken
    )}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setState("connecting");

    ws.onopen = () => setState("open");
    ws.onclose = () => setState("closed");
    ws.onerror = () => setState("closed");

    ws.onmessage = (e) => {
      let msg: ServerEvent;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      switch (msg.type) {
        case "history":
          setLog(
            msg.events.map((ev) => ({
              kind: ev.type,
              id: `h-${ev.id}`,
              speaker: ev.speaker as "dm",
              content: ev.content,
              at: ev.created_at,
            }))
          );
          break;
        case "action":
          append({
            kind: "action",
            id: crypto.randomUUID(),
            speaker: msg.speaker,
            content: msg.content,
            at: msg.created_at,
          });
          break;
        case "narration":
          append({
            kind: "narration",
            id: crypto.randomUUID(),
            speaker: "dm",
            content: msg.content,
            suggestedRoll: msg.suggested_roll,
            at: msg.created_at,
          });
          break;
        case "roll":
          append({
            kind: "roll",
            id: crypto.randomUUID(),
            speaker: msg.speaker,
            sides: msg.sides,
            modifier: msg.modifier,
            result: msg.result,
            total: msg.total,
            reason: msg.reason,
            at: msg.created_at,
          });
          break;
        case "presence":
          setPresence(msg.users);
          break;
      }
    };

    const heartbeat = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
    }, 25000);

    return () => {
      window.clearInterval(heartbeat);
      ws.close();
    };
  }, [campaignId, accessToken, append]);

  const sendAction = useCallback((content: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "action", content }));
  }, []);

  const sendRoll = useCallback((sides: number, modifier: number, reason: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "roll", sides, modifier, reason }));
  }, []);

  return { state, presence, log, sendAction, sendRoll };
}
