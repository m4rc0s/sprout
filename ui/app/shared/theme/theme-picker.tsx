import { HStack } from "@astryxdesign/core/HStack";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Selector } from "@astryxdesign/core/Selector";
import {
  isDarkOnly,
  isThemeMode,
  isThemeSlug,
  THEME_SLUGS,
  useThemeSettings,
} from "~/shared/theme/theme-settings";

/** Nome e descrição de cada tema oficial do Astryx (descrições resumidas da documentação). */
const THEME_INFO: Record<string, { label: string; description: string }> = {
  neutral: { label: "Neutral", description: "Mínimo e discreto. O ponto de partida." },
  butter: { label: "Butter", description: "Amarelos cremosos com azul de destaque." },
  chocolate: { label: "Chocolate", description: "Marrons quentes e bege aconchegante." },
  gothic: { label: "Gothic", description: "Só escuro: superfícies azul-acinzentadas." },
  matcha: { label: "Matcha", description: "Verdes terrosos." },
  stone: { label: "Stone", description: "Pedra quente e ardósia." },
  y2k: { label: "Y2K", description: "Pop dos anos 2000, com tons de lavanda." },
};

const OPTIONS = THEME_SLUGS.map((slug) => ({
  value: slug,
  label: THEME_INFO[slug]?.label ?? slug,
  description: THEME_INFO[slug]?.description,
}));

/** Escolha do tema do Astryx e do modo (sistema, claro, escuro). */
export function ThemePicker() {
  const { slug, mode, setSlug, setMode } = useThemeSettings();
  const darkOnly = isDarkOnly(slug);

  return (
    <HStack gap={2} align="center">
      <Selector
        label="Tema"
        isLabelHidden
        variant="secondary"
        size="sm"
        options={OPTIONS}
        value={slug}
        onChange={(value) => {
          if (isThemeSlug(value)) setSlug(value);
        }}
      />
      <SegmentedControl
        label="Modo de cor"
        size="sm"
        value={darkOnly ? "dark" : mode}
        isDisabled={darkOnly}
        disabledMessage={darkOnly ? "Este tema é sempre escuro." : undefined}
        onChange={(value) => {
          if (isThemeMode(value)) setMode(value);
        }}
      >
        <SegmentedControlItem value="system" label="Sistema" />
        <SegmentedControlItem value="light" label="Claro" />
        <SegmentedControlItem value="dark" label="Escuro" />
      </SegmentedControl>
    </HStack>
  );
}
