import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { AppUserConfigs, LSPluginBaseInfo, PageEntity, SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";
import { getISOWeek, getWeek, getWeekOfMonth, format, addDays, isBefore, isToday, isSunday, isSaturday, getISOWeekYear, getWeekYear } from 'date-fns';
import { ta } from 'date-fns/locale';


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
  const diffInDays: number = Math.floor((targetDateOnly.getTime() - currentDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  // 相対的な日付差をローカライズした文字列に変換
  return new Intl.RelativeTimeFormat((logseq.settings?.localizeOrEnglish || "default"), { numeric: 'auto' }).format(diffInDays, 'day') as string;
}


const parseDate = (dateString: string): Date => {
  const dateRegex = /(\d+)(st|nd|rd|th)/;
  const modifiedDateString = dateString.replace(dateRegex, "$1").replace(/年|月|日/g, "/");
  return new Date(modifiedDateString);
};

//Credit: ottodevs  https://discuss.logseq.com/t/show-week-day-and-week-number/12685/18
function addExtendedDate(titleElement: HTMLElement) {
  if (logseq.settings?.booleanWeekNumber === false && logseq.settings?.booleanDayOfWeek === false && logseq.settings?.booleanRelativeTime === false) return;
  // check if element already has date info
  const existingSpan = titleElement.querySelector("span");
  if (existingSpan) return;

  // remove ordinal suffixes from date
  const journalDate = parseDate(titleElement.textContent!);
  if (!isFinite(Number(journalDate))) return;

  // calculate dates
  let dayOfWeekName: string = "";
  if (logseq.settings?.booleanDayOfWeek === true) {
    dayOfWeekName = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish || "default"), { weekday: logseq.settings?.longOrShort || "long" }).format(journalDate);
  }
  let weekNumber: string;
  let printWeek: string = "";
  let weekStartsOn;
  if (logseq.settings?.weekNumberFormat === "US format") {
    weekStartsOn = 0;
  } else {
    weekStartsOn = 1;
  }
  if (logseq.settings?.booleanWeekNumber === true) {
    if (logseq.settings?.weekNumberOfTheYearOrMonth === "Year") {
      if (logseq.settings?.weekNumberFormat === "ISO(EU) format") {
        weekNumber = `${getISOWeekYear(journalDate)}-W<strong>${getISOWeek(journalDate)}</strong>`;
      } else {
        //NOTE: getWeekYear関数は1月1日がその年の第1週の始まりとなる(デフォルト)
        //weekStartsOnは先に指定済み
        weekNumber = `${getWeekYear(journalDate, { weekStartsOn })}-W<strong>${getWeek(journalDate, { weekStartsOn })}</strong>`;
      }
      printWeek = `<span title="Week number">${weekNumber}</span>`;
    } else {
      // get week numbers of the month
      if (logseq.settings?.weekNumberFormat === "Japanese format" && logseq.settings?.localizeOrEnglish === "default") {
        printWeek = `<span title="1か月ごとの週番号">第<strong>${getWeekOfMonth(journalDate, { weekStartsOn })}</strong>週</span>`;
      } else {
        printWeek = `<span title="Week number within the month"><strong>W${getWeekOfMonth(journalDate, { weekStartsOn })}</strong><small>/m</small></span>`;
      }
    }
  }

  //relative time
  let relativeTime: string = "";
  if (logseq.settings?.booleanRelativeTime === true) {
    const formatString: string = formatRelativeDate(journalDate);
    if (formatString !== "") {
      relativeTime = `<span><small>(${formatString})</small></span>`;
    }
  }
  // apply styles
  const dateInfoElement: HTMLSpanElement = parent.document.createElement("span");
  dateInfoElement.classList.add("weekday-and-week-number");
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
  titleQuerySelector();
});


function observeElementAppearance(targetElement: HTMLElement, callback: () => void) {

  if (!targetElement) {
    // 監視対象のDOMエレメントが存在しない場合は終了
    return;
  }

  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // 特定のDOMエレメントが追加された場合の処理
        callback();

        // 監視の停止
        observer.disconnect();
      }
    }
  });

  observer.observe(targetElement, { childList: true, subtree: true });
}


/* main */
const main = () => {
  (async () => {
    try {
      await l10nSetup({ builtinTranslations: { ja } });
    } finally {
      /* user settings */
      //get user config Language >>> Country
      if (logseq.settings?.weekNumberFormat === undefined) {
        const convertLanguageCodeToCountryCode = (languageCode: string): string => {
          switch (languageCode) {
            case "ja":
              return "Japanese format";
            default:
              return "ISO(EU) format";
          }
        };
        const { preferredLanguage } = await logseq.App.getUserConfigs();
        logseq.useSettingsSchema(settingsTemplate(convertLanguageCodeToCountryCode(preferredLanguage)));
        setTimeout(() => {
          logseq.showSettingsUI();
        }, 300);
      } else {
        logseq.useSettingsSchema(settingsTemplate("ISO(EU) format"));
      }
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
    margin-top: 0.3em;
    padding: 0.85em;
    overflow-x: auto;
    width: fit-content;
  }
  div#weekBoundaries>span.day {
    opacity: .5;
    width: 100px;
    padding: 0.4em;
    margin-left: 0.8em;
    outline: 1px solid var(--ls-guideline-color);
    outline-offset: 2px;
    border-radius: 0.7em;
    background: var(--color-level-1);
  }
  div#weekBoundaries>span.day:hover {
    opacity: 1;
    background: var(--color-level-2);
    box-shadow: 0 0 0 1px var(--ls-guideline-color);
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
    if (logseq.settings?.booleanBoundaries === true && template === '/page/:name') {
      //page only
      setTimeout(() => {
        //div.is-journals
        boundaries(false, 'is-journals');
      }, 160);
    } else if (logseq.settings!.booleanJournalsBoundaries === true && template === '/') {
      //journals only
      setTimeout(() => {
        //div#journals
        boundaries(false, 'journals');
      }, 160);
    }
    setTimeout(() => {
      titleQuerySelector();
    }, 200);
  });

  if (logseq.settings!.booleanJournalsBoundaries === true) {
    // 特定の動作を実行するコールバック関数
    const Callback = () => {
      //div#journals
      setTimeout(() => {
        boundaries(false, 'journals');
      }, 200);
    }

    observeElementAppearance(parent.document.getElementById("main-content-container") as HTMLDivElement, Callback);
  }



  logseq.App.onSidebarVisibleChanged(async ({ visible }) => {
    if (visible === true) {
      setTimeout(() => {
        titleQuerySelector();
      }, 300);
    }
  });

  logseq.onSettingsChanged((newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
    if (oldSet.booleanBoundaries === false && newSet.booleanBoundaries === true) {
      boundaries(false, 'is-journals');
    } else
      if (oldSet.booleanBoundaries === true && newSet.booleanBoundaries === false) {
        const weekBoundaries = parent.document.getElementById('weekBoundaries');
        if (weekBoundaries) weekBoundaries.remove();
      }
    if (oldSet.booleanJournalsBoundaries === false && newSet.booleanJournalsBoundaries === true) {
      boundaries(false, 'journals');
    }
    else
      if (oldSet.booleanJournalsBoundaries === true && newSet.booleanJournalsBoundaries === false) {
        if (parent.document.getElementById("journals")) {
          const weekBoundaries = parent.document.getElementById('weekBoundaries');
          if (weekBoundaries) weekBoundaries.remove();
        }
      }
  });

  logseq.beforeunload(async () => {
    const titleElements = parent.document.querySelectorAll("span.weekday-and-week-number") as NodeListOf<HTMLElement>;
    titleElements.forEach((titleElement) => {
      titleElement.remove();
    });
    const weekBoundaries = parent.document.getElementById('weekBoundaries') as HTMLDivElement;
    if (weekBoundaries) weekBoundaries.remove();
    observer.disconnect();
  });

};/* end_main */


const getJournalDayFormat = (journalDayInNumber: number): string => {
  const journalDay: string = journalDayInNumber.toString();
  return (
    journalDay.slice(0, 4) +
    "-" +
    journalDay.slice(4, 6) +
    "-" +
    journalDay.slice(6)
  );
};


function titleQuerySelector() {
  parent.document.querySelectorAll("span.title, h1.title, a.page-title").forEach((titleElement) => {
    addExtendedDate(titleElement as HTMLElement);
  });
}

//boundaries
async function boundaries(lazy: boolean, targetElementName: string) {

  let firstElement: HTMLDivElement;
  if (targetElementName === 'is-journals') {
    firstElement = parent.document.getElementsByClassName(targetElementName)[0] as HTMLDivElement;
  } else if (targetElementName === 'journals') {
    firstElement = parent.document.getElementById(targetElementName) as HTMLDivElement;
  } else {
    return;
  }
  if (firstElement) {
    let checkWeekBoundaries = parent.document.getElementById('weekBoundaries');
    if (checkWeekBoundaries) checkWeekBoundaries.remove();
    const weekBoundaries: HTMLDivElement = parent.document.createElement('div');
    weekBoundaries.id = 'weekBoundaries';
    firstElement.insertBefore(weekBoundaries, firstElement.firstChild);
    let targetDate: Date;
    if (targetElementName === 'journals') {
      targetDate = new Date();
    } else {
      const { journalDay } = await logseq.Editor.getCurrentPage() as PageEntity;
      if (!journalDay) {
        console.error('journalDay is undefined');
        return;
      }
      targetDate = parseDate(getJournalDayFormat(journalDay)) as Date;
    }
    const days: number[] = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4];
    let { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
    days.forEach((numDays, index) => {
      let date: Date;
      if (numDays === 0) {
        date = targetDate;
      } else {
        date = addDays(targetDate, numDays) as Date;
      }
      const dayOfWeek: string = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish as string || "default"), { weekday: "short" }).format(date);
      const dayOfMonth: string = format(date, 'd');
      const dayElement: HTMLSpanElement = parent.document.createElement('span');
      try {
        dayElement.classList.add('day');
        dayElement.innerHTML = `<span class="dayOfWeek">${dayOfWeek}</span><span class="dayOfMonth">${dayOfMonth}</span>`;
        const booleanToday = isToday(date) as boolean;
        dayElement.title = format(date, preferredDateFormat);
        if (booleanToday === true) {
          dayElement.style.color = 'var(--ls-wb-stroke-color-green)';
          dayElement.style.borderBottom = '3px solid var(--ls-wb-stroke-color-green)';
          dayElement.style.opacity = "1.0";
        } else
          if (numDays === 0) {
            dayElement.style.color = 'var(--ls-wb-stroke-color-yellow)';
            dayElement.style.borderBottom = '3px solid var(--ls-wb-stroke-color-yellow)';
            dayElement.style.cursor = 'pointer';
            dayElement.style.opacity = "1.0";
          }
        if (logseq.settings?.booleanWeekendsColor === true && isSaturday(date) as boolean) {
          dayElement.style.color = 'var(--ls-wb-stroke-color-blue)';
        } else
          if (logseq.settings?.booleanWeekendsColor === true && isSunday(date) as boolean) {
            dayElement.style.color = 'var(--ls-wb-stroke-color-red)';
          }
        if (isBefore(date, new Date()) as boolean || booleanToday === true) {
          dayElement.style.cursor = 'pointer';
          dayElement.addEventListener("click", async (event) => {
            const journalPageName: string = format(date, preferredDateFormat);
            const { journalDay, uuid } = await logseq.Editor.getPage(journalPageName) as PageEntity;
            if (journalDay) {
              if (event.shiftKey) {
                logseq.Editor.openInRightSidebar(uuid);
              } else {
                logseq.App.pushState('page', { name: journalPageName });
              }
            } else {
              logseq.UI.showMsg('No page found', 'warming');
            }
          });
        }
      } finally {
        weekBoundaries!.appendChild(dayElement);
      }
    });
  } else {
    if (lazy === true) return;
    setTimeout(() => {
      boundaries(true, targetElementName);
    }
      , 100);
  }
}


/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
const settingsTemplate = (ByLanguage: string): SettingSchemaDesc[] => [
  {
    key: "localizeOrEnglish",
    title: t("Select language default(Localize) or en(English)"),
    type: "enum",
    default: "default",
    enumChoices: ["default", "en"],
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
    key: "longOrShort",
    title: t("weekday long or short"),
    type: "enum",
    default: "long",
    enumChoices: ["long", "short"],
    description: "",
  },
  {
    key: "booleanWeekNumber",
    title: t("Turn on/off week number"),
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
    key: "weekNumberFormat",
    title: t("Week number format"),
    type: "enum",
    default: ByLanguage || "ISO(EU) format",
    enumChoices: ["US format", "ISO(EU) format", "Japanese format"],
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
    key: "booleanBoundaries",
    title: t("Show the boundaries of 10 days before and after the day on the single journal page"),
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "booleanJournalsBoundaries",
    title: t("Use the boundaries also on the journals page"),
    type: "boolean",
    default: true,
    description: "",
  },
];


logseq.ready(main).catch(console.error);