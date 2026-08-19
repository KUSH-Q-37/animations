// Twitter/X reads its own `twitter-image` file convention rather than
// falling back to `opengraph-image` — reuse the same generated image so we
// don't maintain two near-identical designs.
export { alt, size, contentType, default } from "./opengraph-image";
