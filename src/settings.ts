import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";
import { t } from "logseq-l10n";

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (ByLanguage: string): SettingSchemaDesc[] => [
  {
    key: "weekNumberFormat",
    title: t("Week number calculation (across years)"),
    type: "enum",
    default: ByLanguage || "ISO(EU) format",
    enumChoices: ["US format", "ISO(EU) format", "Japanese format"],
    description: t("[document](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Week-number-format)"),
  },
  {//Journal Boundaries, week start 通常はformatに従う
    key: "boundariesWeekStart",
    title: t("Journal boundaries, week start (Unset: by the selected format)"),
    type: "enum",
    enumChoices: ["unset", "Sunday", "Monday", "Saturday"],
    default: "unset",
    description: t("default: `unset`"),
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
  {
    key: "booleanDayOfWeek",
    title: t("Behind journal title, Enable day of the week"),
    type: "boolean",
    default: true,
    description: t(
      "If user date format includes day of the week, this setting is ignored."
    ),
  },
  {
    key: "longOrShort",
    title: t("Behind journal title, Day of the week long or short"),
    type: "enum",
    default: "long",
    enumChoices: ["long", "short"],
    description: "",
  },
  {
    key: "booleanWeekNumber",
    title: t("Behind journal title, Enable week number"),
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "booleanWeekNumberHideYear",
    title: t("Behind journal title, Hide the year of week number"),
    type: "boolean",
    default: false,
    description: t(
      "Enabling this setting conceals the year representation in the date format. For instance, 2023-W30 displays as W30. Typically, the notation of week numbers follows the rules based on ISO 8601. The reason for distinguishing the year is that the first week of a year might be included in the last week of the previous year. Only in such cases does it display as 2023-W53."
    ),
  },
  {
    key: "weekNumberOfTheYearOrMonth",
    title: t(
      "Behind journal title, Show week number of the year or month (unit)"
    ),
    type: "enum",
    default: "Year",
    enumChoices: ["Year", "Month"],
    description: "",
  },
  {
    key: "booleanWeekendsColor",
    title: t(
      "Behind journal title, Coloring to the word of Saturday or Sunday"
    ),
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "booleanRelativeTime",
    title: t(
      "Behind journal title / Localize journal link, Enable relative time"
    ),
    type: "boolean",
    default: true,
    description: t("like `3 days ago`"),
  },
  {
    key: "booleanBoundaries",
    title: t("Journal boundaries, Enable feature"),
    type: "boolean",
    default: true,
    description: t(
      "Show the boundaries of days before and after the day on the single journal page"
    ),
  },
  {
    key: "booleanJournalsBoundaries",
    title: t("Journal boundaries, Use also on journals"),
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "noPageFoundCreatePage",
    title: t("On Journal boundaries if no page found, create the journal page"),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    key: "booleanWeeklyJournal",
    title: t("Weekly Journal, Enable feature"),
    type: "boolean",
    default: true,
    description: t(
      "Enable the link and function. If there is no content available on a page with a week number like 2023-W25, a template will be inserted."
    ),
  },
  {
    key: "descriptionWeeklyJournalSlashCommand",
    //Weekly Journalのリンクを作成する
    title: t(
      "Weekly Journal, the slash command to create a link to the weekly journal page"
    ),
    type: "heading",
    default: "",
    description: `
    Slash command: " /current week number link "
    like [[2023-W32]]
    `,
  },
  {
    key: "weeklyJournalTemplateName",
    title: t("Weekly Journal, Template name"),
    type: "string",
    default: "",
    description: t("Input the template name (default is blank)"),
  },
  {
    key: "weeklyJournalSetPageTag",
    title: t("Weekly Journal, Set page tag (Add to tags property)"),
    type: "string",
    default: "",
    description: t("Input a page name (default is blank)"),
  },
  {
    key: "booleanWeeklyJournalThisWeek",
    title: t("Weekly Journal, Enable \"This Week\" section"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {//"This Week" セクションの位置を選択する(上か下か)
    key: "weeklyJournalThisWeekPosition",
    title: t("Weekly Journal, \"This Week\" section position"),
    type: "enum",
    enumChoices: ["top", "bottom"],
    default: "top",
    description: "default: `top`",
  },
  {//Weekly Journalのページタグの種類を選択する
    key: "weeklyJournalPageTag",
    title: t("Weekly Journal, Page-tags type"),
    type: "enum",
    enumChoices: ["yyyy, yyyy/MM, yyyy-Ww, yyyy-Ww", "yyyy, yyyy-Ww, yyyy-Ww", "yyyy-Ww, yyyy-Ww", "unset"],
    default: "yyyy, yyyy/MM, yyyy-Ww, yyyy-Ww",
    description: t("default: `yyyy(: year), yyyy/MM(: month), yyyy-Www(: previous), yyyy-Www(: next)`"),
  },
  {
    key: "booleanWeeklyJournalThisWeekWeekday",
    title: t(
      "Weekly Journal, Enable the day of the week in the `This Week` section"
    ),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    key: "booleanWeeklyJournalThisWeekLinkWeekday",
    title: t(
      "Weekly Journal, Convert the day of the week in the `This Week` section into links."
    ),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    key: "booleanJournalLinkLocalizeDayOfWeek",
    title: t(
      "Localize journal title: If the day of the week is included in user date format, localize the day of the week in the date link"
    ),
    type: "boolean",
    default: true,
    //グラフには影響を与えない
    description: "default: `true` *This setting does not affect the graph*",
  },
];
