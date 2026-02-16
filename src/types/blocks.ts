export interface BlockFaceColors {
  t: number; // top face color (hex)
  s: number; // side face color (hex)
  b: number; // bottom face color (hex)
}

export interface BlockDefinition {
  n: string;           // name
  c: BlockFaceColors;  // colors
  t: boolean;          // transparent
  gl: boolean;         // glass
  f: boolean;          // flora/foliage
  e: boolean;          // emissive
  o: boolean;          // ore
  nb: boolean;         // non-breakable
  food: number;        // food value (0 = not food)
  tool: number;        // tool level (0 = not a tool)
}

export type BlockRegistry = Record<number, BlockDefinition>;
