import projects from "virtual:stackanvil-patches";

export const stacks = projects
  .filter(({ patches }) => patches.length > 0)
  .toSorted((a, b) => b.patches.length - a.patches.length);

export const patchCount = stacks.reduce((sum, { patches }) => sum + patches.length, 0);
