import { type RouteConfig, index } from "@react-router/dev/routes";

/**
 * Roteamento config-based: cada rota vive dentro da sua feature.
 * O MVP tem uma única tela: "Plantar e assistir".
 */
export default [index("features/plant/routes/plant.tsx")] satisfies RouteConfig;
