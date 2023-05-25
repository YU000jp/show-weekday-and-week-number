import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";


function formatRelativeDate(targetDate: Date): string {
  const currentDate = new Date();

  // 日付を比較するために年月日の部分だけを取得
  const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  // 比較した結果、同じ日付だった場合は空文字を返す
  // if (targetDateOnly.getTime() === currentDateOnly.getTime()) {
  //   return '';
  // }

  // 相対的な日付差を計算
  const diffInDays = Math.floor((targetDateOnly.getTime() - currentDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  // 相対的な日付差をローカライズした文字列に変換
  const formatter = new Intl.RelativeTimeFormat((logseq.settings?.localizeOrEnglish || "default"), { numeric: 'auto' });
  const formattedString = formatter.format(diffInDays, 'day');

  return formattedString;
}

function getWeekNumbersOfMonth(date: Date, weekNumberFormat: string): number {
  const month = date.getMonth();
  const year = date.getFullYear();
  const firstDayOfMonth = new Date(year, month, 1);
  let weekNumber = 0;
  let currentDate = firstDayOfMonth;
  while (currentDate.getMonth() === month) {
    const dayOfWeek = currentDate.getDay();
    if (
      (weekNumberFormat === "ISO(EU) format" && dayOfWeek === 1) ||
      (weekNumberFormat === "Japanese format" && dayOfWeek === 1) ||
      (weekNumberFormat !== "ISO(EU) format" && weekNumberFormat !== "Japanese format" && dayOfWeek === 0)
    ) {
      weekNumber++;
    }
    if (currentDate.getDate() === date.getDate()) {
      // 指定した日付に到達したらループを終了
      break;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return weekNumber;
}


const parseDate = (dateString: string): Date => {
  const dateRegex = /(\d+)(st|nd|rd|th)/;
  const modifiedDateString = dateString.replace(dateRegex, "$1").replace(/年|月|日/g, "/");
  return new Date(modifiedDateString);
};

//Credit: ottodevs  https://discuss.logseq.com/t/show-week-day-and-week-number/12685/18
function addExtendedDate(titleElement: HTMLElement) {
  // check if element already has date info
  const existingSpan = titleElement.querySelector("span");
  if (existingSpan) return;

  // remove ordinal suffixes from date
  const journalDate = parseDate(titleElement.textContent!);
  if (!isFinite(Number(journalDate))) return;

  // calculate dates
  let dayOfWeekName;
  if (logseq.settings?.booleanDayOfWeek === true) {
    dayOfWeekName = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish || "default"), { weekday: "long" }).format(journalDate);
  }
  let weekNumber;
  // get day of the year
  const days = Math.ceil((journalDate.getTime() - new Date(journalDate.getFullYear(), 0, 1).getTime()) / 86400000);
  // get week number of the year
  if (logseq.settings?.weekNumberOfTheYearOrMonth === "Year") {
    if (logseq.settings?.weekNumberFormat === "ISO(EU) format") {
      // ISO format (Monday is the first day of the week)
      weekNumber = Math.ceil((days + 1 + (journalDate.getDay() || 7)) / 7);
    } else if (logseq.settings?.weekNumberFormat === "Japanese format") {
      // Japanese format (Monday is the first day of the week, but week numbers start from 1 on January 1st)
      weekNumber = Math.ceil((days + (journalDate.getDay() || 7)) / 7);
    } else {
      // US format (Sunday is the first day of the week)
      weekNumber = Math.ceil((days + 1) / 7);
    }
  } else {
    // get week numbers of the month
    weekNumber = getWeekNumbersOfMonth(journalDate, logseq.settings?.weekNumberFormat);
  }

  //relative time
  let relativeTime = "";
  if (logseq.settings?.booleanRelativeTime === true) {
    const formatString: string = formatRelativeDate(journalDate);
    if (formatString !== "") {
      relativeTime = ` , ${formatString}`;
    }
  }
  // apply styles
  const dateInfoElement = parent.document.createElement("span");
  dateInfoElement.classList.add("weekday-and-week-number");
  let printWeek;
  if (logseq.settings?.weekNumberOfTheYearOrMonth === "Year") {
    printWeek = `<span title="week number within the year">week ${weekNumber} /<small>y</small></span>`;
  } else {
    printWeek = `<span title="week number within the month">week ${weekNumber} /<small>m</small></span>`;
  }
  if (logseq.settings?.booleanDayOfWeek === true) {
    if (logseq.settings?.booleanWeekendsColor === true &&
      dayOfWeekName === "Saturday" ||
      dayOfWeekName === "Sunday" ||
      dayOfWeekName === "土曜日" ||
      dayOfWeekName === "日曜日") {
      dateInfoElement.innerHTML = `<span class="weekends">${dayOfWeekName}</span> , ${printWeek}${relativeTime}`;
    } else {
      dateInfoElement.innerHTML = `${dayOfWeekName} , ${printWeek}${relativeTime}`;//textContent
    }
  } else {
    dateInfoElement.innerHTML = `${printWeek}${relativeTime}`;
  }
  titleElement.appendChild(dateInfoElement);
}

const observer = new MutationObserver(() => {
  parent.document.querySelectorAll("span.title, h1.title").forEach((titleElement) => {
    addExtendedDate(titleElement as HTMLElement);
  });
});


/* main */
const main = () => {
  //get user config Language >>> Country
  const ByLanguage = setCountry();
  (async () => {
    try {
      await l10nSetup({ builtinTranslations: { ja } });
    } finally {
      /* user settings */
      userSettings(ByLanguage);
    }
  })();

  logseq.provideStyle({
    key: "main", style: `
  :is(span.title,h1.title) span.weekday-and-week-number {
    opacity: .7;
    font-size: .6em;
    margin-left: .8em;
  }
  :is(span.title,h1.title) span.weekday-and-week-number span.weekends {
    color:var(--ls-wb-stroke-color-red);
  }
  ` });

  observer.observe(parent.document.getElementById("main-content-container") as HTMLElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  });

};/* end_main */



//setCountry
function setCountry() {
  let ByLanguage; //language setting
  if (logseq.settings?.weekNumberFormat === undefined) {
    const convertLanguageCodeToCountryCode = (languageCode: string): string => {
      switch (languageCode) {
        case "ja":
          return "Japanese format";
        default:
          return "ISO(EU) format";
      }
    };
    logseq.App.getUserConfigs().then((configs) => {
      if (configs) {
        ByLanguage = convertLanguageCodeToCountryCode(configs.preferredLanguage);
        logseq.showSettingsUI();
      }
    });
  }
  return ByLanguage;
}
//end

function userSettings(ByLanguage) {
  /* user setting */
  // https://logseq.github.io/plugins/types/SettingSchemaDesc.html

  const settingsTemplate: SettingSchemaDesc[] = [
    {
      key: "booleanWeekendsColor",
      title: t("Coloring red to the word of Saturday or Sunday"),
      type: "boolean",
      default: true,
      description: "",
    },
    {
      key: "weekNumberFormat",
      title: t("Week number format"),
      type: "enum",
      default: ByLanguage || "ISO(EU) format",
      enumChoices: ["US format", "ISO(EU) format", "Japanese format"],
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
      key: "booleanRelativeTime",
      title: t("Turn on/off relative time"),
      type: "boolean",
      default: true,
      description: t("like `3 days ago`"),
    },
    {
      key: "localizeOrEnglish",
      title: t("Select language default(Localize) or en(English)"),
      type: "enum",
      default: "default",
      enumChoices: ["default", "en"],
      description: "",
    },
  ];
  logseq.useSettingsSchema(settingsTemplate);
}



logseq.ready(main).catch(console.error);