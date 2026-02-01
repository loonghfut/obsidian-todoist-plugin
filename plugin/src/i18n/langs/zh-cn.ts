import type { Translations } from "@/i18n/translation";
import type { DeepPartial } from "@/utils/types";

export const zhCn: DeepPartial<Translations> = {
  settings: {
    general: {
      header: "常规",
      links: {
        label: "链接",
        docsButtonLabel: "文档",
        feedbackButtonLabel: "反馈",
        donateButtonLabel: "捐赠",
      },
      apiToken: {
        label: "API Token",
        description: "用于获取任务的 Todoist API Token",
        buttonLabel: "设置",
      },
    },
    autoRefresh: {
      header: "自动刷新",
      toggle: {
        label: "启用自动刷新",
        description: "是否按固定间隔自动刷新查询",
      },
      interval: {
        label: "自动刷新间隔",
        description: "默认自动刷新的间隔（秒）",
      },
    },
    rendering: {
      header: "渲染",
      taskFadeAnimation: {
        label: "启用任务淡入淡出",
        description: "任务创建或完成时是否淡入淡出",
      },
      dateIcon: {
        label: "启用日期图标",
        description: "渲染日期是否包含图标",
      },
      projectIcon: {
        label: "启用项目与分区图标",
        description: "渲染项目与分区是否包含图标",
      },
      labelsIcon: {
        label: "启用标签图标",
        description: "渲染标签是否包含图标",
      },
      appendRenderedTasksTemplate: {
        label: "追加渲染任务模板",
        description:
          "按任务逐条追加时使用的模板。支持 {{task}}、{{content}}、{{description}}、{{project}}、{{section}}、{{labels}}、{{priority}}、{{due}}、{{deadline}}、{{date}}、{{time}}、{{datetime}} 或 {{date:YYYY-MM-DD}}。",
        placeholder: "{{date:YYYY-MM-DD}} {{task}}",
      },
    },
    taskCreation: {
      header: "任务创建",
      wrapLinksInParens: {
        label: "页面链接加括号",
        description: "启用后，创建任务时会把 Obsidian 页面链接包在括号内",
      },
      addTaskButtonAddsPageLink: {
        label: "添加任务按钮附加页面链接",
        description: "启用后，查询中的添加任务按钮会在指定位置附加页面链接",
        options: {
          off: "关闭",
          description: "任务描述",
          content: "任务名称",
        },
      },
      defaultDueDate: {
        label: "默认截止日期",
        description: "创建新任务时默认设置的截止日期",
        options: {
          none: "不设置",
        },
      },
      defaultProject: {
        label: "默认项目",
        description: "创建新任务时默认设置的项目",
        placeholder: "选择项目",
        noDefault: "收件箱",
        deletedWarning: "该项目已不存在",
        deleted: "已删除",
      },
      defaultLabels: {
        label: "默认标签",
        description: "创建新任务时默认应用的标签",
        buttonAddLabel: "添加标签",
        buttonNoAvailableLabels: "无可用标签",
        noLabels: "未配置标签",
        deletedWarning: "该标签已不存在",
        deleted: "已删除",
      },
      defaultAddTaskAction: {
        label: "默认添加任务行为",
        description: "点击添加任务按钮时的默认行为",
        options: {
          add: "添加任务",
          addCopyApp: "添加任务并复制链接（App）",
          addCopyWeb: "添加任务并复制链接（Web）",
        },
      },
      appendCompletedTasksOnClose: {
        label: "完成任务后自动插入",
        description: "启用后，完成任务时会使用模板追加到当前文件",
      },
    },
    advanced: {
      header: "高级",
      debugLogging: {
        label: "启用调试日志",
        description: "是否启用调试日志",
      },
      buildStamp: {
        label: "构建标记",
        description: "插件构建标记",
      },
    },
    deprecation: {
      warningMessage: "此设置已弃用，将在未来版本移除。",
    },
  },
  createTaskModal: {
    loadingMessage: "正在加载 Todoist 数据...",
    successNotice: "任务创建成功",
    errorNotice: "任务创建失败",
    taskNamePlaceholder: "任务名称",
    descriptionPlaceholder: "描述",
    appendedLinkToContentMessage: "将把当前页面链接追加到任务名称",
    appendedLinkToDescriptionMessage: "将把当前页面链接追加到任务描述",
    cancelButtonLabel: "取消",
    addTaskButtonLabel: "添加任务",
    addTaskAndCopyAppLabel: "添加任务并复制链接（App）",
    addTaskAndCopyWebLabel: "添加任务并复制链接（Web）",
    actionMenuLabel: "添加任务操作菜单",
    linkCopiedNotice: "任务创建成功，链接已复制",
    linkCopyFailedNotice: "任务创建成功，但复制链接失败",
    failedToFindInboxNotice: "错误：未找到收件箱项目",
    dateSelector: {
      buttonLabel: "设置截止日期",
      dialogLabel: "截止日期选择器",
      suggestionsLabel: "建议日期",
      datePickerLabel: "任务日期",
      emptyDate: "截止日期",
      noDate: "无日期",
      timeDialog: {
        timeLabel: "时间",
        saveButtonLabel: "保存",
        cancelButtonLabel: "取消",
        durationLabel: "时长",
        noDuration: "无时长",
        duration: (minutes: number) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;

          if (hours === 0) {
            return `${mins}分钟`;
          }

          return `${hours}小时 ${mins}分钟`;
        },
      },
    },
    deadlineSelector: {
      buttonLabel: "设置截止",
      dialogLabel: "截止日期选择器",
      suggestionsLabel: "建议日期",
      datePickerLabel: "截止日期",
      placeholder: "截止日期",
      noDeadline: "无截止日期",
    },
    labelSelector: {
      buttonLabel: "设置标签",
      buttonText: (num: number) => `标签（${num}）`,
      labelOptionsLabel: "标签选项",
    },
    prioritySelector: {
      buttonLabel: "设置优先级",
      optionsLabel: "优先级选项",
      p1: "优先级 1",
      p2: "优先级 2",
      p3: "优先级 3",
      p4: "优先级 4",
    },
    projectSelector: {
      buttonLabel: "设置项目",
      selectorLabel: "项目选择器",
      optionsLabel: "项目选项",
      search: {
        label: "筛选项目",
        placeholder: "输入项目名称",
      },
    },
    optionsSelector: {
      buttonLabel: "设置选项",
      optionsLabel: "任务选项",
      addLinkToContent: "添加链接到任务名称",
      addLinkToDescription: "添加链接到任务描述",
      doNotAddLink: "不添加链接",
    },
  },
  onboardingModal: {
    failureNoticeMessage: "保存 API Token 失败",
    explainer:
      "要使用此插件，需要提供 Todoist API Token。该 Token 用于读写你的 Todoist 数据。",
    todoistGuideHint: {
      before: "你可以参考 ",
      linkText: "Todoist 指南",
      after: " 获取 API Token。",
    },
    tokenInputLabel: "API Token",
    submitButtonLabel: "保存",
    pasteButtonLabel: "从剪贴板粘贴",
  },
  query: {
    displays: {
      empty: {
        label: "查询未返回任务",
      },
      error: {
        header: "错误",
        badRequest: "Todoist API 拒绝了请求，请检查过滤器是否合法。",
        unauthorized: "Todoist API 凭据缺失或无效，请检查设置中的 API Token。",
        serverError: "Todoist API 返回错误，请稍后再试。",
        unknown: "发生未知错误，请查看开发者工具控制台。",
      },
      parsingError: {
        header: "错误：查询解析失败",
        unknownErrorMessage: "发生未知错误，请查看开发者工具控制台。",
      },
    },
    contextMenu: {
      completeTaskLabel: "完成任务",
      openTaskInAppLabel: "在 Todoist（App）中打开",
      openTaskInBrowserLabel: "在 Todoist（Web）中打开",
    },
    failedCloseMessage: "关闭任务失败",
    header: {
      errorPostfix: "（错误）",
      refreshTooltip: {
        lastRefreshed: (datetime: string) => `上次刷新时间：${datetime}`,
        notRefreshed: "尚未查询",
      },
      appendRenderedTasks: {
        tooltip: "将渲染的任务追加到当前文件末尾",
        successNotice: "已追加渲染任务到当前文件",
        failedNotice: "追加渲染任务失败",
        noTasksNotice: "没有可追加的渲染任务",
        noFileNotice: "无法确定当前文件",
      },
    },
    warning: {
      header: "警告",
      jsonQuery: "该查询使用 JSON 编写，已弃用，将在未来版本移除，请改用 YAML。",
      unknownKey: (key: string) => `发现未知的查询键 '${key}'，是否拼写错误？`,
      dueAndTime: "同时设置了 'due' 和 'time'，将忽略 'time'。",
      projectAndSection: "同时设置了 'project' 和 'section'，将忽略 'section'。",
    },
    groupedHeaders: {
      noDueDate: "无截止日期",
      overdue: "已逾期",
    },
  },
  commands: {
    sync: "同步 Todoist",
    addTask: "添加任务",
    addTaskPageContent: "添加任务并将当前页面放入任务名称",
    addTaskPageDescription: "添加任务并将当前页面放入任务描述",
  },
  tokenValidation: {
    emptyTokenError: "API Token 不能为空",
    invalidTokenError: "Todoist 不识别该 Token，请检查后重试！",
  },
  dates: {
    today: "今天",
    tomorrow: "明天",
    yesterday: "昨天",
    nextWeek: "下周",
    lastWeekday: (weekday: string) => `上周${weekday}`,
    dateTime: (date: string, time: string) => `${date} ${time}`,
    dateTimeDuration: (date: string, startTime: string, endTime: string) =>
      `${date} ${startTime} - ${endTime}`,
    dateTimeDurationDifferentDays: (
      startDate: string,
      startTime: string,
      endDate: string,
      endTime: string,
    ) => `${startDate} ${startTime} - ${endDate} ${endTime}`,
    timeDuration: (startTime: string, endTime: string) => `${startTime} - ${endTime}`,
    timeDurationDifferentDays: (startTime: string, endDate: string, endTime: string) =>
      `${startTime} - ${endDate} ${endTime}`,
  },
};
