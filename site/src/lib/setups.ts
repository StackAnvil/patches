import type { Setup } from "./releases";

export interface SetupGuide {
  id: Setup;
  name: string;
  short: string;
  /** What the client becomes in the connection scene. */
  client: string;
  title: string;
  description: string;
  guideHash: string;
  steps: (minecraft?: string) => string[];
}

export const setupGuides: Record<Setup, SetupGuide> = {
  proxy: {
    id: "proxy",
    name: "ViaProxy",
    short: "Your regular Java client",
    client: "Your Java client",
    title: "Your regular client. One proxy.",
    description:
      "Run the StackAnvil ViaProxy JAR beside Minecraft when you cannot install client mods. Your Java client connects to ViaProxy, which connects to the Bedrock server. The in-game Bedrock Friends, Realms, and LAN menus need a Fabric setup.",
    guideHash: "use-viaproxy",
    steps: () => [
      "Put the JAR in its own folder and run it.",
      "Enter the Bedrock server address, choose the server's Bedrock version, and select Start.",
      "In Java Edition, open Multiplayer and join the address that ViaProxy shows.",
    ],
  },
  fabric: {
    id: "fabric",
    name: "Fabric mods",
    short: "ViaFabricPlus + add-on",
    client: "Fabric client with the add-on",
    title: "Two matching mods. One tested setup.",
    description:
      "Use ViaFabricPlus and the Bedrock add-on from the same StackAnvil release. The add-on includes the patched ViaBedrock and CubeConverter libraries.",
    guideHash: "use-viafabricplus-and-the-bedrock-add-on",
    steps: (minecraft) => [
      `Install Fabric Loader for Minecraft${minecraft ? ` ${minecraft}` : " Java Edition"}.`,
      "Put both JARs in the mods folder. Keep only one ViaFabricPlus JAR there.",
      "In Multiplayer, add the Bedrock server and set its ViaFabricPlus version to Bedrock.",
    ],
  },
  modpack: {
    id: "modpack",
    name: "Client modpack",
    short: "Prepared Fabric client",
    client: "Modpack instance",
    title: "A Fabric client, ready to import.",
    description:
      "The client modpack includes the tested ViaFabricPlus and Bedrock add-on JARs. It also selects Minecraft and Fabric Loader for you.",
    guideHash: "import-the-client-modpack",
    steps: () => [
      "Import the .mrpack into Modrinth App, Prism Launcher, or ATLauncher.",
      "Launch the new instance and sign in with your Java Edition account.",
      "In Multiplayer, add the Bedrock server and set its ViaFabricPlus version to Bedrock.",
    ],
  },
};

export const setupOrder = ["fabric", "modpack", "proxy"] as const satisfies readonly Setup[];

/** The setup most players should start with. */
export const defaultSetup: Setup = "fabric";

export function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}
