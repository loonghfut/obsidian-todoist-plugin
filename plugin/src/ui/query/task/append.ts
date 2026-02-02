import type { MarkdownRenderChild } from "obsidian";
import { TFile } from "obsidian";

import type { TaskTree } from "@/data/transformations/relationships";
import type TodoistPlugin from "@/index";
import { useSettingsStore } from "@/settings";
import { applyTaskTemplate } from "@/ui/query/task/template";

export const appendTaskToFile = async (
  plugin: TodoistPlugin,
  renderChild: MarkdownRenderChild,
  task: TaskTree,
  template: string,
): Promise<boolean> => {
  const sourcePath = getSourcePath(renderChild, plugin);
  if (!sourcePath) {
    return false;
  }

  const file = plugin.app.vault.getAbstractFileByPath(sourcePath);
  if (!(file instanceof TFile)) {
    return false;
  }

  return await appendTaskToVaultFile(plugin, file, task, template);
};

export const appendTaskToDailyNote = async (
  plugin: TodoistPlugin,
  task: TaskTree,
  template: string,
): Promise<boolean> => {
  const dailyNoteFile = getDailyNoteFile(plugin);
  if (!dailyNoteFile) {
    return false;
  }

  return await appendTaskToVaultFile(plugin, dailyNoteFile, task, template);
};

const getSourcePath = (
  renderChild: MarkdownRenderChild,
  plugin: TodoistPlugin,
): string | undefined => {
  let sourcePath: string | undefined;
  if ("sourcePath" in renderChild) {
    const candidate = (renderChild as { sourcePath?: unknown }).sourcePath;
    if (typeof candidate === "string" && candidate.length > 0) {
      sourcePath = candidate;
    }
  }

  if (sourcePath !== undefined) {
    return sourcePath;
  }

  const activeFile = plugin.app.workspace.getActiveFile();
  return activeFile?.path;
};

const appendTaskToVaultFile = async (
  plugin: TodoistPlugin,
  file: TFile,
  task: TaskTree,
  template: string,
): Promise<boolean> => {
  const rendered = applyTaskTemplate(template, task, new Date());
  if (rendered.trim().length === 0) {
    return false;
  }

  const markdownWithNewline = rendered.endsWith("\n") ? rendered : `${rendered}\n`;

  const existing = await plugin.app.vault.read(file);
  const separator = existing.endsWith("\n") ? "" : "\n";
  await plugin.app.vault.modify(file, `${existing}${separator}${markdownWithNewline}`);
  return true;
};

const getDailyNoteFile = (plugin: TodoistPlugin): TFile | undefined => {
  const settings = useSettingsStore.getState();
  const template = settings.dailyNotePathTemplate?.trim();
  if (template) {
    const resolved = resolveDailyNotePath(template, new Date());
    if (resolved) {
      const normalizedPath = resolved.replace(/\\/g, "/");
      const file = plugin.app.vault.getAbstractFileByPath(normalizedPath);
      return file instanceof TFile ? file : undefined;
    }
  }

  const app = plugin.app as unknown as {
    internalPlugins?: {
      getPluginById: (id: string) => { instance?: unknown } | undefined;
    };
  };
  const dailyNotesPlugin = app.internalPlugins?.getPluginById("daily-notes");
  type DailyNoteResolverResult =
    | TFile
    | string
    | { path?: unknown }
    | null
    | undefined;
  const instance = dailyNotesPlugin?.instance as
    | {
        getDailyNoteFile?: (date: Date) => DailyNoteResolverResult;
        getDailyNote?: (date: Date) => DailyNoteResolverResult;
      }
    | undefined;

  const resolver =
    instance?.getDailyNoteFile?.bind(instance) ??
    instance?.getDailyNote?.bind(instance);
  if (!resolver) {
    return undefined;
  }

  const dailyNote = resolver(new Date());
  if (!dailyNote) {
    return undefined;
  }

  if (dailyNote instanceof TFile) {
    return dailyNote;
  }

  if (typeof dailyNote === "string" && dailyNote.length > 0) {
    const file = plugin.app.vault.getAbstractFileByPath(dailyNote);
    return file instanceof TFile ? file : undefined;
  }

  if (typeof dailyNote === "object" && dailyNote !== null) {
    const candidatePath = (dailyNote as { path?: unknown }).path;
    if (typeof candidatePath === "string" && candidatePath.length > 0) {
      const file = plugin.app.vault.getAbstractFileByPath(candidatePath);
      return file instanceof TFile ? file : undefined;
    }
  }

  return undefined;
};

const resolveDailyNotePath = (template: string, now: Date): string | undefined => {
  const trimmed = template.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed.replace(
    /{{\s*(date|time|datetime)(?::([^}]+))?\s*}}/gi,
    (_match, key: string, format?: string) => {
      const lowerKey = key.toLowerCase() as "date" | "time" | "datetime";
      const pattern = format?.trim();
      if (pattern && pattern.length > 0) {
        return formatDateWithPattern(now, pattern);
      }

      switch (lowerKey) {
        case "date":
          return formatDateWithPattern(now, "YYYY-MM-DD");
        case "time":
          return formatDateWithPattern(now, "HH-mm-ss");
        case "datetime":
          return formatDateWithPattern(now, "YYYY-MM-DD_HH-mm-ss");
        default:
          return "";
      }
    },
  );
};

const formatDateWithPattern = (date: Date, pattern: string): string => {
  const pad = (value: number, length = 2) => value.toString().padStart(length, "0");

  const replacements: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  };

  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (token) => replacements[token] ?? token);
};
