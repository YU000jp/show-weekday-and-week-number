import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";


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


//Credit: ottodevs  https://discuss.logseq.com/t/show-week-day-and-week-number/12685/18
function addExtendedDate(titleElement: HTMLElement) {
  // check if element already has date info
  const existingSpan = titleElement.querySelector("span");
  if (existingSpan) return;

  // remove ordinal suffixes from date
  const journalDate = new Date(Date.parse(titleElement.textContent!.replace(/(\d+)(st|nd|rd|th)/, "$1")));
  if (!isFinite(Number(journalDate))) return;

  // calculate dates
  const dayOfWeekName = new Intl.DateTimeFormat("default", { weekday: "long" }).format(journalDate);
  const days = Math.ceil((journalDate.getTime() - new Date(journalDate.getFullYear(), 0, 1).getTime()) / 86400000);
  // get week number of the year
  let weekNumber;
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
  // apply styles
  const dateInfoElement = parent.document.createElement("span");
  dateInfoElement.classList.add("weekday-and-week-number");

  if (logseq.settings?.booleanWeekendsColor === true &&
    dayOfWeekName === "Saturday" ||
    dayOfWeekName === "Sunday" ||
    dayOfWeekName === "土曜日" ||
    dayOfWeekName === "日曜日") {
    dateInfoElement.innerHTML = ` <span class="weekends">${dayOfWeekName}</span>, Week ${weekNumber}`;
  } else {
    dateInfoElement.textContent = ` ${dayOfWeekName}, Week ${weekNumber}`;
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
    opacity: 0.7;
    font-size: 0.7em;
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
      default: ByLanguage || "US format",
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
  ];
  logseq.useSettingsSchema(settingsTemplate);
}



logseq.ready(main).catch(console.error);