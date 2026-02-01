import { domAnimation, LazyMotion } from "motion/react";
import type { MarkdownRenderChild } from "obsidian";
import { Notice, TFile } from "obsidian";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

import type { OnSubscriptionChange, Refresh, SubscriptionResult } from "@/data";
import type { Task } from "@/data/task";
import { groupBy } from "@/data/transformations/grouping";
import { buildTaskTree, type TaskTree } from "@/data/transformations/relationships";
import { sortTasks } from "@/data/transformations/sorting";
import { t } from "@/i18n";
import type TodoistPlugin from "@/index";
import type { QueryWarning } from "@/query/parser";
import type { TaskQuery } from "@/query/schema/tasks";
import { type Settings, useSettingsStore } from "@/settings";
import { PluginContext, RenderChildContext } from "@/ui/context";
import { QueryHeader } from "@/ui/query/QueryHeader";
import { QueryResponseHandler } from "@/ui/query/QueryResponseHandler";
import { QueryWarnings } from "@/ui/query/QueryWarnings";
import "./styles.scss";

import { secondsToMillis } from "@/infra/time";

const useSubscription = (
  plugin: TodoistPlugin,
  query: TaskQuery,
  callback: OnSubscriptionChange,
): [Refresh, boolean, boolean, Date | undefined] => {
  const [refresher, setRefresher] = useState<Refresh | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [refreshedTimestamp, setRefreshedTimestamp] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const [unsub, refresh] = plugin.services.todoist.subscribe(query.filter, (results) => {
      callback(results);
      setRefreshedTimestamp(new Date());
    });
    setRefresher(() => {
      return refresh;
    });
    return unsub;
  }, [query, plugin, callback]);

  const forceRefresh = useCallback(async () => {
    if (refresher === undefined) {
      return;
    }

    setIsFetching(true);
    await refresher();
    setHasFetchedOnce(true);
    setIsFetching(false);
  }, [refresher]);

  useEffect(() => {
    forceRefresh();
  }, [forceRefresh]);

  return [forceRefresh, isFetching, hasFetchedOnce, refreshedTimestamp];
};

type Props = {
  query: TaskQuery;
  warnings: QueryWarning[];
};

export const QueryRoot: React.FC<Props> = ({ query, warnings }) => {
  const plugin = PluginContext.use();
  const renderChild = RenderChildContext.use();
  const settings = useSettingsStore();
  const [result, setResult] = useState<SubscriptionResult>({
    type: "success",
    tasks: [],
  });
  const [refresh, isFetching, hasFetchedOnce, refreshedTimestamp] = useSubscription(
    plugin,
    query,
    setResult,
  );

  const appendRenderedTasks = useCallback(async () => {
    const i18n = t().query.header.appendRenderedTasks;

    if (result.type !== "success" || result.tasks.length === 0) {
      new Notice(i18n.noTasksNotice);
      return;
    }

    const sourcePath = getSourcePath(renderChild, plugin);
    if (!sourcePath) {
      new Notice(i18n.noFileNotice);
      return;
    }

    const file = plugin.app.vault.getAbstractFileByPath(sourcePath);
    if (!(file instanceof TFile)) {
      new Notice(i18n.noFileNotice);
      return;
    }

    const markdown = buildRenderedTasksMarkdown(result.tasks, query);
    if (markdown.trim().length === 0) {
      new Notice(i18n.noTasksNotice);
      return;
    }

    const markdownWithNewline = markdown.endsWith("\n") ? markdown : `${markdown}\n`;

    try {
      const existing = await plugin.app.vault.read(file);
      const separator = existing.endsWith("\n") ? "" : "\n";
      await plugin.app.vault.modify(file, `${existing}${separator}${markdownWithNewline}`);
      new Notice(i18n.successNotice);
    } catch (error: unknown) {
      console.error("Failed to append rendered tasks", error);
      new Notice(i18n.failedNotice);
    }
  }, [plugin, query, renderChild, result]);

  useEffect(() => {
    const interval = getAutorefreshInterval(query, settings);

    if (interval === undefined) {
      return;
    }

    const id = window.setInterval(async () => {
      await refresh();
    }, secondsToMillis(interval));

    return () => window.clearInterval(id);
  }, [query, settings, refresh]);

  return (
    <LazyMotion features={domAnimation}>
      <QueryHeader
        title={getTitle(query, result)}
        isFetching={isFetching}
        refresh={refresh}
        refreshedTimestamp={refreshedTimestamp}
        appendRenderedTasks={appendRenderedTasks}
      />
      <QueryWarnings warnings={warnings} />
      {hasFetchedOnce && <QueryResponseHandler result={result} query={query} />}
    </LazyMotion>
  );
};

const getAutorefreshInterval = (query: TaskQuery, settings: Settings): number | undefined => {
  if (query.autorefresh !== undefined && query.autorefresh !== 0) {
    return query.autorefresh;
  }

  if (!settings.autoRefreshToggle) {
    return undefined;
  }

  if (settings.autoRefreshInterval !== 0) {
    return settings.autoRefreshInterval;
  }

  return undefined;
};

const getTitle = (query: TaskQuery, result: SubscriptionResult): string => {
  const name = query.name ?? "";
  if (name.length === 0) {
    return "";
  }

  switch (result.type) {
    case "error": {
      const postfix = t().query.header.errorPostfix;
      return `${query.name} ${postfix}`;
    }
    case "success":
      return name.replace("{task_count}", result.tasks.length.toString());
    case "not-ready":
      return "";
    default: {
      const _: never = result;
      throw new Error("Unknown result type");
    }
  }
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

const buildRenderedTasksMarkdown = (tasks: Task[], query: TaskQuery): string => {
  if (query.groupBy !== undefined) {
    const groups = groupBy(tasks, query.groupBy);
    return groups
      .map((group) => {
        const list = buildListMarkdown(group.tasks, query);
        return [formatGroupHeader(group.header), list].filter(Boolean).join("\n");
      })
      .filter((block) => block.trim().length > 0)
      .join("\n\n");
  }

  return buildListMarkdown(tasks, query);
};

const formatGroupHeader = (header: string): string => {
  return `### ${header}`;
};

const buildListMarkdown = (tasks: Task[], query: TaskQuery): string => {
  const trees = getTaskTree(tasks, query.sorting);
  const lines: string[] = [];
  appendTreeLines(lines, trees, 0);
  return lines.join("\n");
};

const getTaskTree = (tasks: Task[], sorting: TaskQuery["sorting"]): TaskTree[] => {
  const copy = [...tasks];
  sortTasks(copy, sorting ?? ["order"]);
  return buildTaskTree(copy);
};

const appendTreeLines = (lines: string[], trees: TaskTree[], depth: number) => {
  for (const tree of trees) {
    const indent = "  ".repeat(depth);
    const content = sanitizeTaskContent(tree.content);
    lines.push(`${indent}- [ ] ${content}`);

    if (tree.children.length > 0) {
      appendTreeLines(lines, tree.children, depth + 1);
    }
  }
};

const sanitizeTaskContent = (content: string): string => {
  if (content.startsWith("*")) {
    return content.substring(1).trimStart();
  }

  return content;
};
