import {
  Backpack,
  Boxes,
  Camera,
  CloudFog,
  Footprints,
  MessageSquareText,
  Music,
  Shirt,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

interface Feature {
  name: string;
  icon: LucideIcon;
  text: string;
  note?: string;
}

const features: Feature[] = [
  {
    name: "Inventory and crafting",
    icon: Backpack,
    text: "Bedrock's Creative catalog, Survival crafting, recipe book, bundles, and cooking screens work with the server's inventory.",
  },
  {
    name: "Skins",
    icon: Shirt,
    text: "Bedrock skins, persona pieces, costumes, attachables, and patterned shields appear on players.",
  },
  {
    name: "Server content",
    icon: Boxes,
    text: "Custom entities, blocks, particles, sounds, and materials load from the server's resource packs.",
  },
  {
    name: "Forms and dialogs",
    icon: MessageSquareText,
    text: "Server forms, NPC dialogs, chat notifications, and Bedrock fonts render on your Java screen.",
  },
  {
    name: "Camera",
    icon: Camera,
    text: "Server camera commands work, including follow targets, blends, field of view, shake, and fades.",
  },
  {
    name: "Fog and sky",
    icon: CloudFog,
    text: "Fog commands, biome fog, and the server's time of day shape what you see.",
  },
  {
    name: "Movement",
    icon: Footprints,
    text: "Movement runs locally and replays server corrections, the way the Bedrock client does.",
  },
  {
    name: "Friends and Realms",
    icon: Users,
    text: "Join Bedrock Friends, Realms, and LAN worlds from the ViaFabricPlus menu.",
    note: "Fabric setups only",
  },
  {
    name: "World sounds",
    icon: Music,
    text: "Vanilla sounds, music, and textures match the world's Bedrock version before server packs apply.",
  },
];

/** Features as inventory slots. Select a slot to read about it. */
export function FeatureHotbar() {
  const [selected, setSelected] = useState(0);
  const slots = useRef<(HTMLButtonElement | null)[]>([]);
  const feature = features[selected];
  if (!feature) return null;
  const Icon = feature.icon;
  function onKeyDown(event: KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    const target =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? features.length - 1
          : step === undefined
            ? undefined
            : (selected + step + features.length) % features.length;
    if (target === undefined) return;
    event.preventDefault();
    setSelected(target);
    slots.current[target]?.focus();
  }
  return (
    <div className="hotbar-wrap">
      <div className="hotbar" role="tablist" aria-label="Translated features">
        {features.map((item, index) => {
          const SlotIcon = item.icon;
          return (
            <button
              key={item.name}
              ref={(node) => {
                slots.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`feature-tab-${index}`}
              aria-selected={selected === index}
              aria-controls="feature-panel"
              tabIndex={selected === index ? 0 : -1}
              className="slot"
              onClick={() => {
                setSelected(index);
              }}
              onKeyDown={onKeyDown}
            >
              <SlotIcon size={26} strokeWidth={1.8} aria-hidden="true" />
              <span className="slot-key" aria-hidden="true">
                {index + 1}
              </span>
              <span className="sr-only">{item.name}</span>
            </button>
          );
        })}
      </div>
      <div
        className="feature-panel"
        id="feature-panel"
        role="tabpanel"
        aria-labelledby={`feature-tab-${selected}`}
        key={selected}
      >
        <Icon className="feature-panel-icon" size={34} strokeWidth={1.6} aria-hidden="true" />
        <div>
          <h3>
            {feature.name}
            {feature.note && <span className="feature-note">{feature.note}</span>}
          </h3>
          <p>{feature.text}</p>
        </div>
      </div>
    </div>
  );
}
