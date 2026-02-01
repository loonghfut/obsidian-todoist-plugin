import type { MarkdownRenderChild } from "obsidian";
import { TFile } from "obsidian";

import type { TaskTree } from "@/data/transformations/relationships";
import type TodoistPlugin from "@/index";
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
