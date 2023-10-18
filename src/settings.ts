import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";
import { t } from "logseq-l10n";

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [
  {
    key: "weekNumberFormat",
    title: t("Week number calculation (across years)"),
    type: "enum",
    default: "ISO(EU) format",
    enumChoices: ["US format", "ISO(EU) format", "Japanese format"],
    description: t("`US format`: Sunday, `ISO(EU) format`: Monday, [>> document here](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Week-number-format)"),
  },
  {
    key: "localizeOrEnglish",
    title: t(
      "Day of the week, Select language Localize(:default) or English(:en)"
    ),
    type: "enum",
    default: "default",
    enumChoices: ["default", "en"],
    description: "",
  },

  //Behind journal title
  {
    key: "heading001",
    title: t("Behind Journal Title"),
    type: "heading",
    default: "",
    description: "",
  },
  {
    key: "longOrShort",
    title: t("Day of the week long or short"),
    type: "enum",
    default: "long",
    enumChoices: ["long", "short"],
    description: "",
  },
  {
    key: "booleanWeekNumber",
    title: t("Enable week number"),
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "booleanWeekNumberHideYear",
    title: t("Hide the year of week number"),
    type: "boolean",
    default: true,
    description: t(
      "Enabling this setting conceals the year representation in the date format. For instance, 2023-W30 displays as W30. Typically, the notation of week numbers follows the rules based on ISO 8601. The reason for distinguishing the year is that the first week of a year might be included in the last week of the previous year. Only in such cases does it display as 2023-W53."
    ),
  },
  {//設定ボタンを表示する
    key: "booleanSettingsButton",
    title: t("Show settings button"),
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "weekNumberOfTheYearOrMonth",
    title: t("Show week number of the year or month (unit)"),
    type: "enum",
    default: "Year",
    enumChoices: ["Year", "Month"],
    description: "",
  },
  {
    key: "booleanWeekendsColor",
    title: t("Coloring to the word of Saturday or Sunday"),
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "booleanRelativeTime",
    title: t("Enable relative time"),
    type: "boolean",
    default: true,
    description: t("like `3 days ago`"),
  },
  {
    key: "booleanDayOfWeek",
    title: t("Enable day of the week"),
    type: "boolean",
    default: true,
    description: t("If user date format includes day of the week, this setting is ignored."),
  },
  {//Monthly Journalのリンクを作成する
    key: "booleanMonthlyJournalLink",
    title: t("Enable monthly journal link"),
    type: "boolean",
    default: false,
    // [[2023/10]]のような階層のMonthly Journalを開くリンクを設置する
    description: t("Place a link to open the Monthly Journal of the hierarchy like [[2023/10]]"),
  },
  {
    key: "booleanJournalLinkLocalizeDayOfWeek",
    title: t(
      "If the day of the week is included in user date format, localize the day of the week in the date link"
    ),
    type: "boolean",
    default: true,
    description: t("*This setting does not affect the graph"),
  },

  //Journal Boundaries
  {
    key: "heading002",
    title: t("Journal boundaries"),
    type: "heading",
    default: "",
    description: "",
  },
  {
    key: "booleanBoundaries",
    title: t("Enable feature"),
    type: "boolean",
    default: true,
    description: t(
      "Show the boundaries of days before and after the day on the single journal page"
    ),
  },
  {
    key: "booleanJournalsBoundaries",
    title: t("Use also on journals"),
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "booleanBoundariesOnWeeklyJournal",
    title: t("Use also on Weekly Journal"),
    type: "boolean",
    default: true,
    description: "",
  },
  {//Journal Boundaries, week start 通常はformatに従う
    key: "boundariesWeekStart",
    title: t("Mini calendar only, Week start (Unset: by the selected format)"),
    type: "enum",
    enumChoices: ["unset", "Sunday", "Monday", "Saturday"],
    default: "unset",
    description: t("default: `unset`"),
  },
  {//ハイライトカラーの指定(シングルページ)
    key: "boundariesHighlightColorSinglePage",
    title: t("Highlight color (single page)"),
    type: "string",
    inputAs: "color",
    default: "#f59e0b",
    description: "default-color: `#f59e0b`",
  },
  {//ハイライトカラーの指定(今日の日付)
    key: "boundariesHighlightColorToday",
    title: t("Highlight color (today)"),
    type: "string",
    inputAs: "color",
    default: "#22c55e",
    description: "default-color: `#22c55e`",
  },
  {//今日以前のページを開こうとして、それが見つからない場合は、ページを作成する
    key: "booleanNoPageFoundCreatePage",
    title: t("If no page found, not create page (before today)"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {//将来のページも開く
    key: "booleanBoundariesFuturePage",
    title: t("Open future page"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {//月を表示する
    key: "booleanBoundariesShowMonth",
    title: t("Show month"),
    type: "boolean",
    default: true,
    description: "",
  },
  {//週番号を表示する (月曜日の日付から計算した週番号)
    key: "booleanBoundariesShowWeekNumber",
    title: t("Show week number (calculate from the date of Monday)"),
    type: "boolean",
    default: true,
    description: "",
  },

  //Weekly Journal
  {
    key: "heading003",
    title: t("Weekly Journal"),
    type: "heading",
    default: "",
    description: "",
  },
  {
    key: "booleanWeeklyJournal",
    title: t("Enable feature"),
    type: "boolean",
    default: true,
    description: t("Enable the link and function. If there is no content available on a page with a week number like 2023-W25, a template will be inserted."),
  },
  {
    key: "weeklyJournalTemplateName",
    title: t("Template name"),
    type: "string",
    default: "",
    description: t("Input the template name (default is blank)"),
  },
  {
    key: "weeklyJournalSetPageTag",
    title: t("Set page tag (Add to tags property)"),
    type: "string",
    default: "",
    description: t("Input a page name (default is blank)"),
  },
  {
    key: "booleanWeeklyJournalThisWeek",
    title: t("Enable \"This Week\" section"),
    type: "boolean",
    default: true,
    description: "",
  },
  {//"This Week" セクションの位置を選択する(上か下か)
    key: "weeklyJournalThisWeekPosition",
    title: t("\"This Week\" section position"),
    type: "enum",
    enumChoices: ["top", "bottom"],
    default: "top",
    description: "",
  },
  {//ージタグの種類を選択する
    key: "weeklyJournalPageTag",
    title: t("Page-tags type"),
    type: "enum",
    enumChoices: [
      "yyyy, yyyy/MM, yyyy-Ww, yyyy-Ww",
      "yyyy, yyyy-Ww, yyyy-Ww",
      "yyyy-Ww, yyyy-Ww",
      "yyyy, yyyy/MM,",
      "yyyy,",
      "unset"
    ],
    default: "yyyy, yyyy/MM, yyyy-Ww, yyyy-Ww",
    description: t("default: `yyyy(: year), yyyy/MM(: month), yyyy-Www(: previous), yyyy-Www(: next)`"),
  },
  {
    key: "booleanWeeklyJournalThisWeekWeekday",
    title: t(
      "Enable the day of the week in the `This Week` section"
    ),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    key: "booleanWeeklyJournalThisWeekLinkWeekday",
    title: t(
      "Convert the day of the week in the `This Week` section into links."
    ),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
];
