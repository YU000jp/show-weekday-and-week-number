import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";
import { t } from "logseq-l10n";

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (ByLanguage: string): SettingSchemaDesc[] => [
  {
    key: "weekNumberFormat",
    title: t("Week number format"),
    type: "enum",
    default: ByLanguage || "ISO(EU) format",
    enumChoices: ["US format", "ISO(EU) format", "Japanese format"],
    description: "",
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
    //Journal Boundaries 当日より前の日付を決める
    key: "journalBoundariesBeforeToday",
    title: t(
      "Journal boundaries, Custom day range: before today (Excludes 2 week mode)"
    ),
    type: "enum",
    default: "6",
    enumChoices: ["11", "10", "9", "8", "7", "6", "5", "4", "3"],
    description: t("default: `6`"),
  },
  {
    //Journal Boundaries 当日以降の日付を決める
    key: "journalBoundariesAfterToday",
    title: t(
      "Journal boundaries, Custom day range: after today (Excludes 2 week mode)"
    ),
    type: "enum",
    default: "4",
    enumChoices: ["1", "2", "3", "4", "5", "6"],
    description: t("default: `4`"),
  },
  {
    //Journalsの場合
    key: "journalsBoundariesWeekOnly",
    title: t("Journal boundaries, Enable 2 week mode (only journals)"),
    type: "boolean",
    default: false,
    description: t("default: `false`"),
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
    Slash command: " /Insert week number link "
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
    title: t("Weekly Journal, Enable `This Week` section"),
    type: "boolean",
    default: true,
    description: "default: `true`",
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
      "Localize journal link: If the day of the week is included in user date format, localize the day of the week in the date link"
    ),
    type: "boolean",
    default: true,
    //グラフには影響を与えない
    description: "default: `true` *This setting does not affect the graph*",
  },
  {
    key: "booleanJournalLinkAddLocalizeDayOfWeek",
    title: t(
      "Localize journal link: If the day of the week is not included in user date format, add the localized day of the week to the date link"
    ),
    type: "boolean",
    default: true,
    description: "default: `true` *This setting does not affect the graph*",
  },
  {
    key: "booleanJournalLinkLocalizeDayOfWeek",
    title: t(
      "Localize journal link: If the day of the week is included in user date format, localize the day of the week in the date link"
    ),
    type: "boolean",
    default: true,
    //グラフには影響を与えない
    description: "default: `true` *This setting does not affect the graph*",
  },
  {
    key: "booleanJournalLinkAddLocalizeDayOfWeek",
    title: t(
      "Localize journal link: If the day of the week is not included in user date format, add the localized day of the week to the date link"
    ),
    type: "boolean",
    default: true,
    description: "default: `true` *This setting does not affect the graph*",
  },
  {//Journal links date format
    key: "booleanJournalLinkDateFormat",
    title: t(//強制的に日付フォーマットを変更する
      "Journal link: Force display of date format"
    ),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {//date format
    key: "dateFormat",
    title: t(
      "JOurnal link: Select date format  (if the above option is enabled)"
    ),
    type: "enum",
    //<option>E, MM/dd/yyyy</option><option>E, dd-MM-yyyy</option><option>E, dd.MM.yyyy</option><option>E, yyyy/MM/dd</option><option>EEE, MM/dd/yyyy</option><option>EEE, dd-MM-yyyy</option><option>EEE, dd.MM.yyyy</option><option>EEE, yyyy/MM/dd</option><option>EEEE, MM/dd/yyyy</option><option>EEEE, dd-MM-yyyy</option><option>EEEE, dd.MM.yyyy</option><option>EEEE, yyyy/MM/dd</option><option>MM-dd-yyyy</option><option>MM/dd/yyyy</option><option>MMM do, yyyy</option><option>MMMM do, yyyy</option><option>MM_dd_yyyy</option><option>dd-MM-yyyy</option><option>do MMM yyyy</option><option>do MMMM yyyy</option><option>yyyy-MM-dd</option><option>yyyy-MM-dd EEEE</option><option>yyyy/MM/dd</option><option>yyyyMMdd</option><option>yyyy_MM_dd</option><option>yyyy年MM月dd日</option><
    enumChoices: [
      "Localize",
      "MM/dd/yyyy",
      "dd-MM-yyyy",
      "dd.MM.yyyy",
      "yyyy/MM/dd",
      "MM-dd-yyyy",
      "MM/dd/yyyy",
      "MMM do, yyyy",
      "MMMM do, yyyy",
      "MM_dd_yyyy",
      "dd-MM-yyyy",
      "do MMM yyyy",
      "do MMMM yyyy",
      "yyyy-MM-dd",
      "yyyy-MM-dd EEEE",
      "yyyy/MM/dd",
      "yyyyMMdd",
      "yyyy_MM_dd",
      "yyyy年MM月dd日",
    ],
    default: "Localize",
    description: "",
  }
];
