import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (userLanguage): SettingSchemaDesc[] => [

  //Common
  {
    key: "heading000",
    title: t("Common settings"),
    type: "heading",
    default: "",
    description: "",
  },
  {
    key: "weekNumberFormat",
    title: t("Week number calculation (across years)"),
    type: "enum",
    default: "ISO(EU) format",
    enumChoices: ["US format", "ISO(EU) format"],
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

  {
    key: "holidaysCountry",
    title: t("Holidays > Select your country name"),
    type: "enum",
    enumPicker: "select",
    enumChoices: ["AD: Andorra", "AE: دولة الإمارات العربية المتحدة", "AG: Antigua & Barbuda", "AI: Anguilla", "AL: Shqipëri", "AM: Հայաստան", "AO: Angola", "AR: Argentina", "AS: American Samoa", "AT: Österreich", "AU: Australia", "AW: Aruba", "AX: Landskapet Åland", "AZ: Azərbaycan Respublikası", "BA: Bosna i Hercegovina", "BB: Barbados", "BD: গণপ্রজাতন্ত্রী বাংলাদেশ", "BE: Belgique", "BF: Burkina Faso", "BG: България", "BH: مملكة البحرين", "BI: République du Burundi", "BJ: République du Bénin", "BL: St. Barthélemy", "BM: Bermuda", "BN: Negara Brunei Darussalam", "BO: Bolivia", "BQ: Caribisch Nederland", "BR: Brasil", "BS: Bahamas", "BW: Botswana", "BY: Рэспубліка Беларусь", "BZ: Belize", "CA: Canada", "CC: Cocos (Keeling) Islands", "CD: République démocratique du Congo", "CF: République centrafricaine", "CG: République du Congo", "CH: Schweiz", "CI: République de Côte d'Ivoire", "CK: Cook Islands", "CL: Chile", "CM: Cameroun", "CN: 中华人民共和国", "CO: Colombia", "CR: Costa Rica", "CU: Cuba", "CV: República de Cabo Verde", "CW: Curaçao", "CX: Christmas Island", "CY: Κύπρος", "CZ: Česká republika", "DE: Deutschland", "DJ: République de Djibouti", "DK: Danmark", "DM: Dominica", "DO: República Dominicana", "DZ: الجمهورية الجزائرية الديمقراطية الشعبية", "EC: Ecuador", "EE: Eesti", "EG: جمهورية مصر العربية", "EH: الجمهورية العربية الصحراوية الديمقراطية", "ER: Eritrea", "ES: España", "ET: ኢትዮጵያ", "FI: Suomi", "FJ: Matanitu Tugalala o Viti", "FO: Føroyar", "FR: France", "GA: Gabon", "GB: United Kingdom", "GD: Grenada", "GE: საქართველო", "GF: Guyane", "GG: Guernsey", "GH: Ghana", "GI: Gibraltar", "GL: Kalaallit Nunaat", "GM: The Gambia", "GN: Guinée", "GP: Guadeloupe", "GQ: República de Guinea Ecuatorial", "GR: Ελλάδα", "GT: Guatemala", "GU: Guam", "GW: Guiné-Bissau", "GY: Guyana", "HK: 香港", "HN: Honduras", "HR: Hrvatska", "HT: Haïti", "HU: Magyarország", "IC: Islas Canarias", "ID: Indonesia", "IE: Ireland", "IL: מְדִינַת יִשְׂרָאֵל", "IM: Isle of Man", "IR: جمهوری اسلامی ایران", "IS: Ísland", "IT: Italia", "JE: Jersey", "JM: Jamaica", "JP: 日本", "KE: Kenya", "KM: Union des Comores", "KN: St. Kitts & Nevis", "KR: 대한민국", "KY: Cayman Islands", "LC: St. Lucia", "LI: Lichtenstein", "LR: Liberia", "LS: \'Muso oa Lesotho", "LT: Lietuva", "LU: Luxembourg", "LV: Latvija", "LY: دولة ليبيا", "MA: المملكة المغربية", "MC: Monaco", "MD: Republica Moldova", "ME: Crna Gora", "MF: Saint Martin", "MG: Repoblikan'i Madagasikara", "MK: Република Македонија", "ML: République du Mali", "MQ: Martinique", "MR: الجمهورية الإسلامية الموريتانية", "MS: Montserrat", "MT: Malta", "MW: Malawi", "MX: México", "MY: Malaysia", "MZ: Moçambique", "NA: Namibia", "NC: Nouvelle-Calédonie", "NE: République du Niger", "NG: Nigeria", "NI: Nicaragua", "NL: Nederland", "NO: Norge", "NZ: New Zealand", "PA: Panamá", "PE: Perú", "PH: Philippines", "PL: Polska", "PM: St. Pierre & Miquelon", "PR: Puerto Rico", "PT: Portugal", "PY: Paraguay", "RE: Réunion", "RO: Romania", "RS: Република Србија", "RU: Россия", "RW: Rwanda", "SC: Seychelles", "SD: جمهورية السودان", "SE: Sverige", "SG: Singapore", "SH: St. Helena", "SI: Republika Slovenija", "SJ: Svalbard & Jan Mayen", "SK: Slovenská republika", "SL: Sierra Leone", "SM: San Marino", "SN: République du Sénégal", "SO: Jamhuuriyadda Federaalka Soomaaliya", "SR: Suriname", "SS: South Sudan", "ST: São Tomé & Príncipe", "SV: El Salvador", "SX: Sint Maarten", "SZ: Eswatini", "TC: Turks & Caicos Islands", "TD: جمهورية تشاد", "TG: République togolaise", "TH: Thailand", "TN: الجمهورية التونسية", "TO: Puleʻanga Fakatuʻi ʻo Tonga", "TR: Türkiye", "TT: Trinidad & Tobago", "TW: 中華民國", "TZ: Tanzania", "UA: Україна", "UG: Uganda", "US: United States of America", "UY: Uruguay", "VA: Stato della Città del Vaticano", "VC: St. Vincent & Grenadines", "VE: Venezuela", "VG: British Virgin Islands", "VI: U.S. Virgin Islands", "VN: Cộng hòa Xã hội chủ nghĩa Việt Nam", "VU: République de Vanuatu", "XK: Republika e Kosovës", "YT: Mayotte", "ZA: South Africa", "ZM: Zambia", "ZW: Zimbabwe"],
    description: t("If possible to set the State and Region, do so individually.") + 'https://github.com/commenthol/date-holidays#supported-countries-states-regions',
    default: userLanguage,
  },
  {
    key: "holidaysState",
    title: t("Holidays > Select your state of the country (:additional option)"),
    type: "string",
    description: t("2-character alphanumeric code (ex, NY) or blank (default)"),
    default: "",
  },
  {
    key: "holidaysRegion",
    title: t("Holidays > Select your region of the country (:additional option)"),
    type: "string",
    description: t("2 or 3 character alphanumeric code or blank (default)"),
    default: "",
  },
  {
    key: "choiceHolidaysColor",
    title: t("Holidays > Highlight Color (background)"),
    type: "enum",
    enumChoices: ["--highlight-bg-color", "--highlight-selected-bg-color", "--ls-wb-stroke-color-default", "--ls-wb-stroke-color-gray", "--ls-wb-stroke-color-red", "--ls-wb-stroke-color-yellow", "--ls-wb-stroke-color-green", "--ls-wb-stroke-color-blue", "--ls-wb-stroke-color-purple", "--ls-wb-stroke-color-pink", "unset"],
    default: "--highlight-bg-color",
    description: "default: `--highlight-bg-color`",
  },
  {
    key: "booleanLunarCalendar",
    title: t("Enable Lunar-calendar based (Chinese only)"),
    type: "boolean",
    default: true,
    description: t("Other language regions are not affected."),
  },

  //20240518
  {
    key: "weekNumberOptions",
    title: t("Week number format options") + "🆕",
    type: "enum",
    enumChoices: ["YYYY-Www", "YYYY/qqq/Www", "YYYY/Www"],
    default: "YYYY-Www",
    description: t("This is a breaking change for existing users. Please change the old page name using one of the following toggles.")
  },
  {
    key: "heading011",
    title: t("For compatibility. Replace page titles"),
    type: "heading",
    default: "",
    description: "",
  },
  //20240518
  {
    key: "weekNumberChangeQ",
    title: " YYYY-Www -> YYYY/qqq/Www [2022-2025] 🆕",
    type: "boolean",
    default: true,
    description: t("Click this toggle to run it.")
  },
  //20240518
  {
    key: "weekNumberChangeQS",
    title: " YYYY/Www -> YYYY/qqq/Www [2022-2025] 🆕",
    type: "boolean",
    default: true,
    description: t("Click this toggle to run it.")
  },
  //20240518
  {
    key: "weekNumberChangeSlash",
    title: " YYYY-Www -> YYYY/Www [2022-2025] 🆕",
    type: "boolean",
    default: true,
    description: t("Click this toggle to run it.")
  },
  //20240519
  {
    key: "weekNumberChangeRevert",
    title: " YYYY/qqq/Www -> YYYY/Www [2022-2025] 🆕",
    type: "boolean",
    default: true,
    description: t("Click this toggle to run it.")
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

  // 20240123
  {
    key: "underHolidaysAlert",
    title: t("Enable Holidays alert"),
    type: "boolean",
    default: true,
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
  {
    key: "booleanUnderLunarCalendar",
    title: t("Enable month and day of lunar-calendar (Chinese only)"),
    type: "boolean",
    default: true,
    description: t("Other language regions are not affected."),
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
    description: t("Show the boundaries of days before and after the day on the single journal page"),
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
  {//20240108
    key: "boundariesBottom",
    title: t("Show boundaries on bottom"),
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
  //20240120
  {
    key: "booleanBoundariesIndicator",
    title: t("Show indicator (dot) of journal entries") + "🆙",
    type: "boolean",
    default: true,
    //ページが存在する場合に、インディケーターを表示する
    description: "",
  },
  //20240121
  {
    key: "booleanBoundariesHolidays",
    title: t("Support holidays"),
    type: "boolean",
    default: true,
    description: t("Add color to holidays and display the content on mouseover")
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
    key: "weeklyJournalSetPageTag",
    title: t("Set page tag (Add to tags property)"),
    type: "string",
    default: "",
    description: t("Input a page name (default is blank)"),
  },
  {
    key: "weeklyJournalTemplateName",
    title: t("Template name"),
    type: "string",
    default: "",
    description: t("Input the template name (default is blank)"),
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
  {
    key: "booleanWeeklyJournalThisWeekWeekday",
    title: t("Enable the day of the week in the `This Week` section"),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {//Enable embedding for each journal
    key: "booleanWeeklyJournalThisWeekEmbedding",
    title: t("Enable embedding for each journal"),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {//Enable embedding for each journal ("Linked References"が重複するのを防ぐため、日付リンクを解除する。参照を使わない場合)
    key: "booleanWJThisWeekEmbeddingUnlink",
    title: t("\"This Week\" section > Embed feature > Unlink date links for each journal (to avoid duplication of \"Linked References\" if references are not used)"),
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
  {
    key: "thisWeekPopup",
    title: t("Pin the “This Week” section to the bottom right"),
    type: "boolean",
    default: true, //trueの場合に、ThisWeek セクションにタグが付与されます。そのタグが付与されている場合、ポップアップが表示されます。(過去のセクションにはタグが付与されません。)
    description: t("default: `true` | The `#.ThisWeek` tag is added to the `This Week` section. If the tag is added, a popup will be displayed. (The tag is not added to the past section.)"),
  }
]
