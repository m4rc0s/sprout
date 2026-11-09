import { type RouteConfig, index, route } from "@react-router/dev/routes";

/**
 * Roteamento config-based: cada rota vive dentro da sua feature.
 * O MVP tem uma única tela: "Plantar e assistir".
 */
export default [
  index("features/plant/routes/plant.tsx"),
  // Mesma tela montada com o design system Astryx (protótipo comparável).
  route("astryx", "features/plant/routes/plant-astryx.tsx"),
] satisfies RouteConfig;
