import type { CSSProperties } from "react";
import type { Setup } from "../lib/releases";
import { setupGuides } from "../lib/setups";
import { bedrockVersion } from "../lib/site";

/** Faces of an isometric box whose top face is centered on (x, y). */
function box(x: number, y: number, half: number, height: number) {
  const q = half / 2;
  return {
    top: `${x},${y - q} ${x + half},${y} ${x},${y + q} ${x - half},${y}`,
    left: `${x - half},${y} ${x},${y + q} ${x},${y + q + height} ${x - half},${y + height}`,
    right: `${x},${y + q} ${x + half},${y} ${x + half},${y + height} ${x},${y + q + height}`,
  };
}

function Box({
  x,
  y,
  half,
  height,
  tone,
}: {
  x: number;
  y: number;
  half: number;
  height: number;
  tone: string;
}) {
  const faces = box(x, y, half, height);
  return (
    <g className={`iso ${tone}`}>
      <polygon className="face-left" points={faces.left} />
      <polygon className="face-right" points={faces.right} />
      <polygon className="face-top" points={faces.top} />
    </g>
  );
}

const CLIENT = 170;
const SERVER = 830;
const LANE_OUT = 286;
const LANE_IN = 312;

type Lane = { from: number; to: number; y: number; tone: "java" | "bedrock" };

function Packets({ lane, hidden }: { lane: Lane; hidden?: boolean }) {
  return (
    <g className="lane" data-hidden={hidden}>
      <line className="lane-track" x1={lane.from} x2={lane.to} y1={lane.y + 6} y2={lane.y + 6} />
      {[0, 1, 2].map((index) => (
        <g
          key={index}
          className="packet"
          style={
            {
              "--from": `${lane.from}px`,
              "--to": `${lane.to}px`,
              "--rest": `${lane.from + ((lane.to - lane.from) * (index + 0.5)) / 3}px`,
              animationDelay: `${(-index * 2.4) / 3}s`,
            } as CSSProperties
          }
        >
          <Box x={0} y={lane.y} half={9} height={8} tone={lane.tone} />
        </g>
      ))}
    </g>
  );
}

/**
 * The route a connection takes. ViaProxy sits between the client and the
 * server; the Fabric setups move the same translation inside the client.
 */
export function ForgeScene({ setup, minecraft }: { setup: Setup; minecraft?: string }) {
  const docked = setup !== "proxy";
  const anvil = docked ? 318 : 500;
  const lanes: Lane[] = [
    { from: CLIENT + 72, to: anvil - 76, y: LANE_OUT, tone: "java" },
    { from: anvil + 76, to: SERVER - 66, y: LANE_OUT, tone: "bedrock" },
    { from: SERVER - 66, to: anvil + 76, y: LANE_IN, tone: "bedrock" },
    { from: anvil - 76, to: CLIENT + 72, y: LANE_IN, tone: "java" },
  ];
  return (
    <figure className="forge-scene" data-setup={setup}>
      <svg viewBox="60 64 880 300" aria-hidden="true" focusable="false">
        <defs>
          <pattern
            id="iso-floor"
            width="56"
            height="28"
            patternUnits="userSpaceOnUse"
            patternTransform="translate(0 6)"
          >
            <path d="M0 14L28 0L56 14L28 28Z" fill="none" className="floor-line" />
          </pattern>
          <radialGradient id="floor-fade" cx="50%" cy="78%" r="60%">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="floor-mask">
            <rect y="64" width="1000" height="300" fill="url(#floor-fade)" />
          </mask>
          <radialGradient id="forge-glow">
            <stop offset="0" className="glow-stop" stopOpacity="0.55" />
            <stop offset="1" className="glow-stop" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect y="64" width="1000" height="300" fill="url(#iso-floor)" mask="url(#floor-mask)" />

        <g className="modpack-frame">
          <rect x="70" y="84" width="352" height="272" rx="22" />
        </g>

        {lanes.map((lane, index) => (
          <Packets key={index} lane={lane} hidden={docked && lane.tone === "java"} />
        ))}

        <g className="client">
          <Box x={CLIENT} y={238} half={64} height={60} tone="java" />
          <Box x={CLIENT} y={178} half={64} height={60} tone="java" />
          <polygon
            className="screen"
            points={`${CLIENT + 10},${178 + 32 + 10} ${CLIENT + 56},${178 + 10} ${CLIENT + 56},${178 + 48} ${CLIENT + 10},${178 + 32 + 48}`}
          />
          <polygon
            className="screen-scan"
            points={`${CLIENT + 10},${178 + 32 + 10} ${CLIENT + 56},${178 + 10} ${CLIENT + 56},${178 + 16} ${CLIENT + 10},${178 + 32 + 16}`}
          />
        </g>

        <g className="server">
          <Box x={SERVER} y={246} half={58} height={50} tone="bedrock" />
          <Box x={SERVER} y={196} half={58} height={50} tone="bedrock" />
          <Box x={SERVER} y={146} half={58} height={50} tone="bedrock" />
          {[0, 1, 2].map((row) => (
            <g key={row}>
              {[0, 1, 2].map((led) => (
                <rect
                  key={led}
                  className="led"
                  x={SERVER + 12 + led * 13}
                  y={146 + row * 50 + 28 - led * 6.5}
                  width="7"
                  height="4"
                  style={{ animationDelay: `${(row * 3 + led) * 0.37}s` }}
                />
              ))}
            </g>
          ))}
        </g>

        <g className="anvil" style={{ transform: `translateX(${anvil}px)` }}>
          <ellipse cx="0" cy="192" rx="120" ry="70" fill="url(#forge-glow)" className="glow" />
          <Box x={0} y={248} half={74} height={16} tone="copper" />
          <Box x={0} y={232} half={52} height={16} tone="slab" />
          <Box x={0} y={216} half={60} height={16} tone="slab" />
          <Box x={0} y={200} half={68} height={16} tone="slab" />
          <polygon className="molten" points={box(0, 200, 50, 0).top} />
          <g className="sparks">
            {Array.from({ length: 10 }, (_, index) => (
              <rect
                key={index}
                className="spark"
                x="-2.5"
                y="192"
                width="5"
                height="5"
                style={
                  {
                    "--dx": `${(index % 2 ? 1 : -1) * (18 + ((index * 23) % 60))}px`,
                    "--dy": `${-60 - ((index * 37) % 70)}px`,
                    animationDelay: `${index * 0.19}s`,
                  } as CSSProperties
                }
              />
            ))}
          </g>
        </g>
      </svg>
      <figcaption className="scene-labels">
        <span className="scene-label label-client">
          <strong>{setupGuides[setup].client}</strong>
          <span>Java Edition{minecraft && docked ? ` ${minecraft}` : ""}</span>
        </span>
        <span className="scene-label label-anvil" data-hidden={docked}>
          <strong>ViaProxy</strong>
          <span>Runs beside your game</span>
        </span>
        <span className="scene-label label-server">
          <strong>Bedrock server</strong>
          <span>Bedrock {bedrockVersion}</span>
        </span>
        <span className="modpack-tag" data-hidden={setup !== "modpack"}>
          One .mrpack import
        </span>
      </figcaption>
    </figure>
  );
}
