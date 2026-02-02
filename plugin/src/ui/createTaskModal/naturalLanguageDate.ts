import * as chrono from "chrono-node";

import { locale } from "@/infra/locale";

export type RecognizedDate = {
  text: string;
  index: number;
  end: number;
  date: Date;
  hasTime: boolean;
};

type ChronoModule = typeof chrono;

type ChronoParseResult = ReturnType<ChronoModule["parse"]>[number];

type ChronoStart = {
  date: () => Date;
  isCertain?: (field: string) => boolean;
  knownValues?: Record<string, number>;
};

const getParser = (): ChronoModule => {
  const lang = locale().toLowerCase();
  const module = chrono as unknown as Record<string, ChronoModule>;

  if (lang.startsWith("zh") && module.zh) {
    return module.zh;
  }

  if (lang.startsWith("nl") && module.nl) {
    return module.nl;
  }

  if (lang.startsWith("en") && module.en) {
    return module.en;
  }

  return chrono;
};

const hasTimeComponent = (result: ChronoParseResult): boolean => {
  const start = result.start as ChronoStart;
  if (start.isCertain?.("hour") || start.isCertain?.("minute")) {
    return true;
  }

  const known = start.knownValues ?? {};
  return typeof known.hour === "number" || typeof known.minute === "number";
};

export const parseNaturalLanguageDates = (input: string): RecognizedDate[] => {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const parser = getParser();
  const results = parser.parse(input, new Date(), {
    forwardDate: true,
  });

  return results.map((result) => {
    const start = result.start as ChronoStart;
    const date = start.date();
    const index = result.index ?? 0;
    const text = result.text ?? "";
    return {
      text,
      index,
      end: index + text.length,
      date,
      hasTime: hasTimeComponent(result),
    };
  });
};
