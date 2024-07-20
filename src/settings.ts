import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"


/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html


export const settingsTemplate = (userLanguage): SettingSchemaDesc[] => [


  //共通設定
  {
    key: "heading000",
    title: "0. " + t("Common settings"),
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
    title: t("Select language (default)"),
    type: "enum",
    default: "default",
    enumChoices: [
      "default",              // Gregorian calendar (default)
      "en",                   // Gregorian calendar (English)
      "am-ET-u-ca-ethiopic",   // Amharic (Ethiopia) - Ethiopian calendar
      "ar-EG",   // Egypt
      "ar-SA",   // Arabic (Saudi Arabia) - Gregorian calendar (default)
      "ar-SA-u-ca-islamic-umalqura",   // Arabic (Saudi Arabia) - Islamic (Umm al-Qura) calendar
      "bn-BD",   // Bangladesh
      "de-DE",   // Germany
      "en-AU",   // Australia
      "en-CA",   // Canada (English)
      "en-GB",   // English (United Kingdom) - Gregorian calendar (default)
      "en-GB-u-ca-islamic",   // English (United Kingdom) - Islamic calendar
      "en-GB-u-ca-persian",   // English (United Kingdom) - Persian calendar
      "en-US",   // English (United States) - Gregorian calendar (default)
      "en-US-u-ca-islamic",   // English (United States) - Islamic calendar
      "en-US-u-ca-persian",   // English (United States) - Persian calendar
      "es-AR",   // Argentina
      "es-CL",   // Chile
      "es-CO",   // Colombia
      "es-CR",   // Costa Rica
      "es-DO",   // Dominican Republic
      "es-EC",   // Ecuador
      "es-ES",   // Spain
      "es-GT",   // Guatemala
      "es-HN",   // Honduras
      "es-MX",   // Mexico
      "es-NI",   // Nicaragua
      "es-PA",   // Panama
      "es-PE",   // Peru
      "es-PR",   // Puerto Rico
      "es-SV",   // El Salvador
      "es-UY",   // Uruguay
      "es-VE",   // Venezuela
      "fa-IR",   // Persian (Iran) - Gregorian calendar (default)
      "fa-IR-u-ca-persian",    // Persian (Iran) - Persian calendar (Jalali)
      "fr-CA",   // Canada (French)
      "fr-FR",   // France
      "he-IL-u-ca-hebrew",     // Hebrew (Israel) - Hebrew calendar
      "hi-IN",   // India
      "id-ID",   // Indonesia
      "it-IT",   // Italy
      "ja-JP",   // Japanese (Japan) - Gregorian calendar (default)
      "ja-JP-u-ca-japanese",   // Japanese (Japan) - Japanese calendar
      "ko-KR",   // Korean (Korea) - Gregorian calendar (default)
      "ko-KR-u-ca-korean",    // Korean (Korea) - Korean calendar
      "ms-MY",   // Malaysia
      "nl-NL",   // Netherlands
      "pl-PL",   // Poland
      "pt-BR",   // Brazil
      "pt-PT",   // Portugal
      "ru-RU",   // Russia
      "th-TH",   // Thailand
      "th-TH-u-ca-buddhist",   // Thai (Thailand) - Buddhist calendar
      "th-TH-u-nu-thai",       // Thai (Thailand) - Thai digits
      "tr-TR",   // Turkey
      "vi-VN",   // Vietnam
      "zh-CN",   // China
      "zh-CN-u-ca-chinese",    // Chinese (China) - Chinese calendar
      "zh-Hans-CN",            // Chinese (China) - Gregorian calendar (default)
      "zh-Hant-TW-u-ca-taiwan",// Chinese (Taiwan) - Gregorian calendar (default)
      "zh-TW",   // Taiwan
      "zh-TW-u-ca-roc",        // Chinese (Taiwan) - Minguo calendar (Republic of China era)
    ],
    // defaultを選択すると、ブラウザの言語設定に従う(ローカライズ)
    description: t("If default is selected, the browser's language settings are followed (localisation)."),
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
    key: "booleanLunarCalendar",
    title: t("Enable Lunar-calendar based (Chinese only)"),
    type: "boolean",
    default: true,
    description: t("Other language regions are not affected."),
  },
  {
    key: "booleanUnderLunarCalendar",
    title: t("Enable month and day of lunar-calendar (Chinese only)"),
    type: "boolean",
    default: true,
    description: t("Other language regions are not affected."),
  },
  {
    key: "choiceHolidaysColor",
    title: t("Holidays > Highlight Color"),
    type: "enum",
    enumChoices: ["--highlight-bg-color", "--highlight-selected-bg-color", "--ls-wb-stroke-color-default", "--ls-wb-stroke-color-gray", "--ls-wb-stroke-color-red", "--ls-wb-stroke-color-yellow", "--ls-wb-stroke-color-green", "--ls-wb-stroke-color-blue", "--ls-wb-stroke-color-purple", "--ls-wb-stroke-color-pink", "unset"],
    default: "--highlight-bg-color",
    description: "default: `--highlight-bg-color`",
  },
  {//20240120
    key: "booleanBoundariesIndicator",
    title: t("Show indicator of journal entries") + "🆙",
    type: "boolean",
    default: true,
    //ページが存在する場合に、インディケーターを表示する
    description: "",
  },
  {//week start 通常はformatに従う
    key: "boundariesWeekStart",
    title: t("Week start (Unset: by the selected format)"),
    type: "enum",
    enumChoices: ["unset", "Sunday", "Monday", "Saturday"],
    default: "unset",
    description: t("default: `unset`"),
  },
  {
    // 土曜日と日曜日の文字に色を付ける
    key: "booleanWeekendsColor",
    title: t("Colour the letters Saturday and Sunday"),
    type: "boolean",
    default: true,
    description: "",
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
    description: "",
  },
  {//将来のページも開く
    key: "booleanBoundariesFuturePage",
    title: t("Open future page"),
    type: "boolean",
    default: true,
    description: "",
  },


  //Behind journal title
  {
    key: "heading001",
    title: "1. " + t("Daily Journal Details"),
    type: "heading",
    default: "",
    description: "",
  },
  { // 有効トグル
    key: "booleanBesideJournalTitle",
    title: t("Enable feature"),
    type: "boolean",
    default: true,
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
  {// 20240123
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
  {
    key: "weekNumberOfTheYearOrMonth",
    title: t("Show week number of the year or month (unit)"),
    type: "enum",
    default: "Year",
    enumChoices: ["Year", "Month"],
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
    description: "",
  },
  {//Monthly Journalのリンクを作成する
    key: "booleanMonthlyJournalLink",
    title: t("Enable monthly journal link"),
    type: "boolean",
    default: false,
    // [[2023/10]]のような階層のMonthly Journalを開くリンクを設置する
    description: t("Place a link to open the Monthly Journal of the hierarchy like [[2023/10]]"),
  },
  {//設定ボタンを表示する
    key: "booleanSettingsButton",
    title: t("Show settings button"),
    type: "boolean",
    default: true,
    description: "",
  },
  // ここまでトグルの対象



  //Journal Boundaries
  {
    key: "heading002",
    title: "2. " + t("Two-lines mini-Calendar") + t("(Journal Boundaries)"),
    type: "heading",
    default: "",
    description: "",
  },
  { // 有効トグル
    key: "booleanBoundariesAll",
    title: t("Enable feature"),
    type: "boolean",
    default: true,
    description: "",
  },
  { // 有効トグル
    key: "booleanBoundaries",
    title: "",
    type: "boolean",
    default: true,
    description: t("Use on single journal"),
  },
  {
    key: "booleanJournalsBoundaries",
    title: "",
    type: "boolean",
    default: true,
    description: t("Use on journals"),
  },
  {
    key: "booleanBoundariesOnWeeklyJournal",
    title: "",
    type: "boolean",
    default: true,
    description: t("Use on Weekly Journal"),
  },
  {//20240108
    key: "boundariesBottom",
    title: t("Show it on bottom"),
    type: "boolean",
    default: true,
    description: "",
  },
  {//月を表示する
    key: "booleanBoundariesShowMonth",
    title: t("Show month"),
    type: "boolean",
    default: true,
    description: "",
  },
  {//週番号を表示する
    key: "booleanBoundariesShowWeekNumber",
    title: t("Show week number"),
    type: "boolean",
    default: true,
    description: "",
  },
  //20240121
  {
    key: "booleanBoundariesHolidays",
    //休日をハイライトする
    title: t("Highlight holidays"),
    type: "boolean",
    default: true,
    description: "",
  },
  // ここまでトグルの対象



  // Left Calendar 20240714-
  {
    key: "heading003",
    title: "3. " + t("Left Calendar") + t("(Journal Boundaries)") + "🆙",
    type: "heading",
    default: "",
    description: "",
  },
  {// 有効トグル
    key: "booleanLeftCalendar",
    title: t("Enable feature"),
    type: "boolean",
    default: true,
    description: "",
  },
  {//週番号を表示する
    key: "booleanLcWeekNumber",
    title: t("Show week number"),
    type: "boolean",
    default: true,
    description: "",
  },
  {// 祝日をハイライトするかどうか
    key: "booleanLcHolidays",
    title: t("Highlight holidays"),
    type: "boolean",
    default: true,
    description: "",
    //共通設定に、choiceHolidaysColorあり
  },
  {// 祝日のアラートを表示するかどうか
    key: "lcHolidaysAlert",
    title: t("Enable Holidays alert"),
    type: "enum",
    enumChoices: ["none", "Today only", "Monthly"],
    default: "Today only",
    description: "",
  },
  // ここまでトグルの対象
  // {// 特定の日付に色を付けるためのユーザー設定
  //   key: "userColor",
  //   title: t("User color"), //TODO: 翻訳に追加する
  //   type: "string",
  //   default: "",
  //     // yyyy/mm/dd::ライブ参加の日 のような形式でtextareaに複数行で入力する
  // // mm/dd::Birthday のような形式で入力すると、毎年その日に色が付く
  // // textareaに複数行入力する
  // // 
  //   description: `
  //   ${t("Input in the form of yyyy/mm/dd::Event name")}
  //   ${t("If you input in the form of mm/dd::Event name, the color will be applied every year on that day.")}
  //   ${t("Enter multiple lines in the textarea.")}
  //   `,
  // },
  // 共通設定ここまで



  //Weekly Journal
  {
    key: "heading004",
    title: "4. " + t("Weekly Journal"),
    type: "heading",
    default: "",
    description: "",
  },
  { // 有効トグル
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
  {//20240615
    // Headline of each days
    key: "booleanWeeklyJournalHeadline",
    title: t("Enable [headline of each days]") + "🆕",
    type: "boolean",
    default: false,
    // その週のジャーナルにあるプロパティの値を取得して、日付ごとにヘッドラインを表示するクエリーを自動生成する。過去のWeekly Journalには適用されません。
    description: t("Automatically generate a query to display headlines for each day by obtaining the value of the property in the journal for that week. Not applied to past Weekly Journals."),
  },
  {//20240615
    // Headline of each days用 プロパティ名指定
    key: "weeklyJournalHeadlineProperty",
    title: t("headline of each days > Property name for headline of each days") + "🆕",
    type: "string",
    default: "headline",
    // 各ジャーナルのブロックに、このプロパティ名を持つブロックを用意します。ジャーナルテンプレートに取り込むと便利です。変更すると、リネームがおこなわれます。
    description: t("Prepare a block with this property name in each journal block. It is convenient to incorporate it into the journal template. If you change it, the rename will be done."),
  },
  {
    key: "booleanWeeklyJournalThisWeek",
    title: t("Enable \"This Week\" section"),
    type: "boolean",
    default: true,
    // 各曜日へのリンク。マウスオーバーでツールチップ
    description: t("Links to each day. Tooltip on mouseover."),
  },
  {//20240629
    //This Week セクションに、各曜日のページを埋め込む (アナログ手帳のように横並びにする)
    key: "weeklyEmbed",
    title: t("Side opening workspace > Embed each day's page in the \"This Week\" section "),
    type: "boolean",
    default: true,
    // 上の項目が有効の場合のみ有効
    // アナログ手帳のように横並びにする
    // `#.ThisWeek` タグが `This Week` セクションに追加されます。タグが追加されると、ポップアップが表示されます。(過去セクションにはタグが追加されません。)
    // ページに移動することなく、そのまま表示・編集することができます。
    description: `
    ${t("Only effective if the above item is enabled")}
    ${t("Like an analog notebook with side-by-side pages")}
    ${t("The `#.ThisWeek` tag is added to the `This Week` section. If the tag is added, a popup will be displayed. (The tag is not added to the past section.)")}
    ${t("You can view and edit it as it is without moving to that page.")}`,
  },
  {//20240518
    key: "weekNumberOptions",
    title: t("Week number format options") + "🆕",
    type: "enum",
    enumChoices: ["YYYY-Www", "YYYY/qqq/Www", "YYYY/Www"],
    default: "YYYY-Www",
    description: t("This is a breaking change for existing users. Please change the old page name using one of the following toggles.")
  },
  {
    key: "heading011",
    title: t("For compatibility. Replace page titles (Weekly Journals)"),
    type: "heading",
    default: "",
    description: `
      YYYY: ${t("4-digit year")} (e.g. 2023)
      qqq: ${t("Quarter")} (e.g. Q1)
      Www: ${t("Week")} (e.g. W30)
  
      ${t("year range")}: 2022-${new Date().getFullYear() + 1}
      ${t("Click this toggle to run it.")}
      `,
  },
  //20240518
  {
    key: "weekNumberChangeQ",
    title: " YYYY-Www  ->  YYYY/qqq/Www",
    type: "boolean",
    default: true,
    description: "",
  },
  //20240518
  {
    key: "weekNumberChangeQS",
    title: " YYYY/Www  ->  YYYY/qqq/Www",
    type: "boolean",
    default: true,
    description: "",
  },
  //20240518
  {
    key: "weekNumberChangeSlash",
    title: " YYYY-Www  ->  YYYY/Www",
    type: "boolean",
    default: true,
    description: "",
  },
  //20240519
  {
    key: "weekNumberChangeRevert",
    title: " YYYY/qqq/Www  ->  YYYY/Www",
    type: "boolean",
    default: true,
    description: "",
  },
  // ここまでトグルの対象



  //Monthly Journal
  {
    key: "heading005",
    title: "5. " + t("Monthly Journal"),
    type: "heading",
    default: "",
    description: "",
  },
  { // 有効トグル
    key: "booleanMonthlyJournal",
    title: t("Enable feature"),
    type: "boolean",
    default: true,
    description: t("Enable the link and function. If there is no content available on a page with a month number like 2024/05, a template will be inserted."),
  },
  {
    key: "monthlyJournalSetPageTag",
    title: t("Set page tag (Add to tags property)"),
    type: "string",
    default: "",
    description: t("Input a page name (default is blank)"),
  },
  {
    key: "monthlyJournalTemplateName",
    title: t("Template name"),
    type: "string",
    default: "",
    description: t("Input the template name (default is blank)"),
  },
  // ここまでトグルの対象



  //Quarterly Journal
  {
    key: "heading006",
    title: "6. " + t("Quarterly Journal"),
    type: "heading",
    default: "",
    description: "",
  },
  { // 有効トグル
    key: "booleanQuarterlyJournal",
    title: t("Enable feature"),
    type: "boolean",
    default: true,
    description: t("Enable the link and function. If there is no content available on a page with a quarterly number like 2024/Q1, a template will be inserted."),
  },
  {
    key: "quarterlyJournalSetPageTag",
    title: t("Set page tag (Add to tags property)"),
    type: "string",
    default: "",
    description: t("Input a page name (default is blank)"),
  },
  {
    key: "quarterlyJournalTemplateName",
    title: t("Template name"),
    type: "string",
    default: "",
    description: t("Input the template name (default is blank)"),
  },
  // ここまでトグルの対象


]