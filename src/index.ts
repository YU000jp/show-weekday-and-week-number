import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { LSPluginBaseInfo, SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";
import { getISOWeek, getWeek, getWeekOfMonth, format, addDays, isBefore, isToday, isSunday, isSaturday } from 'date-fns';

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
  if (weekNumberFormat === "ISO(EU) format" || weekNumberFormat === "Japanese format") {
    //dayOfWeek === 1
    return getWeekOfMonth(date, { weekStartsOn: 1 })
  } else {//US式
    // dayOfWeek === 0
    return getWeekOfMonth(date, { weekStartsOn: 0 })
  }
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
    dayOfWeekName = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish || "default"), { weekday: logseq.settings?.longOrShort || "long" }).format(journalDate);
  }
  let weekNumber;

  if (logseq.settings?.weekNumberOfTheYearOrMonth === "Year") {
    if (logseq.settings?.weekNumberFormat === "ISO(EU) format") {
      weekNumber = getISOWeek(journalDate);
    } else if (logseq.settings?.weekNumberFormat === "Japanese format") {
      weekNumber = getWeek(journalDate, { weekStartsOn: 1 });
    } else {
      weekNumber = getWeek(journalDate, { weekStartsOn: 0 });
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
      relativeTime = `<span><small>(${formatString})</small></span>`;
    }
  }
  // apply styles
  const dateInfoElement = parent.document.createElement("span");
  dateInfoElement.classList.add("weekday-and-week-number");
  let printWeekString = "";
  if (logseq.settings?.longOrShort === "long") {
    printWeekString = "week ";
  } else {
    printWeekString = "W";
  }
  let printWeek;
  if (logseq.settings?.weekNumberOfTheYearOrMonth === "Year") {
    printWeek = `<span title="week number within the year">${printWeekString}<strong>${weekNumber}</strong><small>/y</small></span>`;
  } else {
    printWeek = `<span title="week number within the month">${printWeekString}<strong>${weekNumber}</strong><small>/m</small></span>`;
  }
  if (logseq.settings?.booleanDayOfWeek === true) {
    if (logseq.settings?.booleanWeekendsColor === true &&
      isSaturday(journalDate) === true) {
      dateInfoElement.innerHTML = `<span style="color:var(--ls-wb-stroke-color-blue)">${dayOfWeekName}</span>${printWeek}${relativeTime}`;
    } else
      if (logseq.settings?.booleanWeekendsColor === true &&
        isSunday(journalDate) === true) {
        dateInfoElement.innerHTML = `<span style="color:var(--ls-wb-stroke-color-red)">${dayOfWeekName}</span>${printWeek}${relativeTime}`;
      }
      else {
        dateInfoElement.innerHTML = `<span>${dayOfWeekName}</span>${printWeek}${relativeTime}`;//textContent
      }
  } else {
    dateInfoElement.innerHTML = `${printWeek}${relativeTime}`;
  }
  titleElement.appendChild(dateInfoElement);
}

const observer = new MutationObserver(() => {
  parent.document.querySelectorAll("span.title, h1.title, a.page-title").forEach((titleElement) => {
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
      logseq.useSettingsSchema(settingsTemplate(ByLanguage));
    }
  })();

  logseq.provideStyle({
    key: "main", style: `
  :is(span.title,h1.title) span.weekday-and-week-number {
    opacity: .7;
    font-size: .6em;
  }
  :is(span.title,h1.title,a.page-title) span.weekday-and-week-number>span {
    margin-left: .75em;
  }
  div#weekBoundaries {
    display: flex;
    margin-top: 1.0em;
    padding: 0.85em;
    overflow-x: scroll;
    width: fit-content;
  }
  div#weekBoundaries>span.day {
    opacity: .7;
    width: 100px;
    padding: 0.4em;
    margin-left: 0.8em;
    outline: 1px solid var(--ls-guideline-color);
    outline-offset: 2px;
    border-radius: 0.7em;
    background: var(--color-level-1);
  }
  div#weekBoundaries>span.day span.dayOfWeek {
    font-size: .9em;
    font-weight: 600;
  }
  div#weekBoundaries>span.day span.dayOfMonth {
    margin-left: .4em;
    font-size: 1.5em;
    font-weight: 900;
  }
  ` });

  observer.observe(parent.document.getElementById("main-content-container") as HTMLDivElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  });

  logseq.App.onRouteChanged(async ({ template }) => {
    if (logseq.settings?.booleanBoundaries === true && template === '/page/:name') { //journal '/'
      //page only
      boundaries();
    }
  });

  logseq.onSettingsChanged((newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
    if (oldSet.booleanBoundaries === false && newSet.booleanBoundaries === true) {
      boundaries();
    } else
      if (oldSet.booleanBoundaries === true && newSet.booleanBoundaries === false) {
        const weekBoundaries = parent.document.getElementById('weekBoundaries');
        if (weekBoundaries) weekBoundaries.remove();
      }
  });

  logseq.beforeunload(async () => {
    const titleElements = parent.document.querySelectorAll("span.weekday-and-week-number");
    titleElements.forEach((titleElement) => {
      titleElement.remove();
    });
    const weekBoundaries = parent.document.getElementById('weekBoundaries') as HTMLDivElement;
    if (weekBoundaries) weekBoundaries.remove();
    observer.disconnect();
  });

};/* end_main */


//boundaries
async function boundaries() {
  const firstElement = (parent.document.getElementsByClassName('is-journals') as HTMLCollectionOf<HTMLDivElement>)[0];
  if (firstElement) {
    let weekBoundaries = parent.document.getElementById('weekBoundaries');
    if (weekBoundaries) return;
    weekBoundaries = parent.document.createElement('div');
    weekBoundaries.id = 'weekBoundaries';
    firstElement.insertBefore(weekBoundaries, firstElement.firstChild);
    const titleElement = parent.document.querySelector("span.title");
    if (!titleElement) return;
    const targetDate: Date = parseDate(titleElement.textContent!);
    if (!isFinite(Number(targetDate))) return;
    const days = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4];
    let { preferredDateFormat } = await logseq.App.getUserConfigs();
    preferredDateFormat = preferredDateFormat.replace(/E{1,3}/, "EEE");//handle same E, EE, or EEE bug
    days.forEach((numDays, index) => {
      const date: Date = addDays(targetDate, numDays);
      const dayOfWeek = format(date, 'EEE');
      const dayOfMonth = format(date, 'd');
      const dayElement = parent.document.createElement('span');
      dayElement.classList.add('day');
      dayElement.innerHTML = `<span class="dayOfWeek">${dayOfWeek}</span><span class="dayOfMonth">${dayOfMonth}</span>`;
      if (logseq.settings?.booleanWeekendsColor === true && isSaturday(date) as boolean) {
        dayElement.style.color = 'var(--ls-wb-stroke-color-blue)';
      } else
        if (logseq.settings?.booleanWeekendsColor === true && isSunday(date) as boolean) {
          dayElement.style.color = 'var(--ls-wb-stroke-color-red)';
        }
      if (isToday(date)) {
        dayElement.style.borderBottom = '3px solid var(--ls-wb-stroke-color-green)';
        dayElement.style.cursor = 'pointer';
        dayElement.style.opacity = "1.0";
        dayElement.title = 'Today';
      }
      if (isBefore(date, new Date())) {
        dayElement.style.cursor = 'pointer';
        dayElement.addEventListener("click", async () => {
          const journalPageName = format(date, preferredDateFormat);
          const page = await logseq.Editor.getPage(journalPageName);
          if (page) {
            logseq.UI.showMsg('Jumping to the journal page', 'success');
            logseq.App.pushState('page', { name: journalPageName });
          } else {
            logseq.UI.showMsg('No page found', 'warming');
          }
        });
      }
      weekBoundaries!.appendChild(dayElement);
    });
  }
}


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


/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
const settingsTemplate = (ByLanguage): SettingSchemaDesc[] => [
  {
    key: "booleanWeekendsColor",
    title: t("Coloring to the word of Saturday or Sunday"),
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
    key: "booleanDayOfWeek",
    title: t("Turn on/off day of the week"),
    type: "boolean",
    default: true,
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
  {
    key: "longOrShort",
    title: t("weekday long or short"),
    type: "enum",
    default: "long",
    enumChoices: ["long", "short"],
    description: "",
  },
  {
    key: "booleanBoundaries",
    title: t("Show the boundaries of 8 days before and after the day on the single journal page."),
    type: "boolean",
    default: true,
    description: "",
  },
];


logseq.ready(main).catch(console.error);