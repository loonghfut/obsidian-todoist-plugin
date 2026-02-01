import type { TaskTree } from "@/data/transformations/relationships";

export const buildTaskText = (task: TaskTree): string => {
  const content = sanitizeTaskContent(task.content).trim();
  const description = sanitizeTaskDescription(task.description);

  if (description.length === 0) {
    return content;
  }

  return `${content} - ${description}`;
};

export const applyTaskTemplate = (template: string, task: TaskTree, now: Date): string => {
  const taskText = buildTaskText(task);
  const hasTaskPlaceholder = /{{\s*task\s*}}/i.test(template);

  const rendered = template.replace(
    /{{\s*(task|content|description|project|section|labels|priority|id|due|deadline|date|time|datetime)(?::([^}]+))?\s*}}/gi,
    (_match, key: string, format?: string) => {
      const lowerKey = key.toLowerCase();
      switch (lowerKey) {
        case "task":
          return taskText;
        case "content":
          return sanitizeTaskContent(task.content).trim();
        case "description":
          return sanitizeTaskDescription(task.description);
        case "project":
          return task.project?.name ?? "";
        case "section":
          return task.section?.name ?? "";
        case "labels":
          return task.labels.map((label) => label.name).join(", ");
        case "priority":
          return task.priority.toString();
        case "id":
          return task.id;
        case "due":
          return formatTaskDateToken(task.due?.date, format);
        case "deadline":
          return formatTaskDateToken(task.deadline?.date, format);
        case "date":
        case "time":
        case "datetime":
          return formatDateToken(now, lowerKey as "date" | "time" | "datetime", format);
        default:
          return "";
      }
    },
  );

  if (hasTaskPlaceholder) {
    return rendered;
  }

  const trimmed = rendered.trim();
  if (trimmed.length === 0) {
    return taskText;
  }

  return `${rendered} ${taskText}`;
};

export const sanitizeTaskContent = (content: string): string => {
  if (content.startsWith("*")) {
    return content.substring(1).trimStart();
  }

  return content;
};

export const sanitizeTaskDescription = (description: string): string => {
  return description.replace(/\s+/g, " ").trim();
};

const formatDateToken = (
  now: Date,
  type: "date" | "time" | "datetime",
  format?: string,
): string => {
  if (!format || format.trim().length === 0) {
    switch (type) {
      case "date":
        return now.toLocaleDateString();
      case "time":
        return now.toLocaleTimeString();
      case "datetime":
        return now.toLocaleString();
    }
  }

  return formatDateWithPattern(now, format.trim());
};

const formatTaskDateToken = (value: string | undefined, format?: string): string => {
  if (!value || value.trim().length === 0) {
    return "";
  }

  if (!format || format.trim().length === 0) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return formatDateWithPattern(parsed, format.trim());
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
