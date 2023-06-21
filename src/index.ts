import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { AppUserConfigs, BlockEntity, LSPluginBaseInfo, PageEntity, SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";
import { getISOWeek, getWeek, getWeekOfMonth, format, addDays, isBefore, isToday, isSunday, isSaturday, getISOWeekYear, getWeekYear, startOfWeek, endOfWeek, eachDayOfInterval, startOfISOWeek, endOfISOWeek, subDays } from 'date-fns';//https://date-fns.org/


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


const parseDate = (dateString: string): Date => new Date(dateString.replace(/(\d+)(st|nd|rd|th)/, "$1").replace(/年|月|日/g, "/") + " 00:00:00");

// 日付オブジェクトが "Invalid Date" でないかを確認します
// また、日付の値がNaN（非数）でないかも確認します
const isValidDate = (date: Date): boolean => !isNaN(date.getTime()) && !isNaN(date.valueOf());



//Credit: ottodevs  https://discuss.logseq.com/t/show-week-day-and-week-number/12685/18

function addExtendedDate(titleElement: HTMLElement) {

  // check if element already has date info
  if (titleElement.nextElementSibling?.className === "weekday-and-week-number") return;

  if (logseq.settings?.booleanWeekNumber === false && logseq.settings?.booleanDayOfWeek === false && logseq.settings?.booleanRelativeTime === false) {
    const dateInfoElement: HTMLSpanElement = parent.document.createElement("span");
    dateInfoElement.classList.add("weekday-and-week-number");
    titleElement.insertAdjacentElement('afterend', dateInfoElement);
    const secondElement: HTMLSpanElement = parent.document.createElement("span");
    secondElement.style.width = "50%";
    titleElement.parentElement!.insertAdjacentElement('afterend', secondElement);
    return;
  }

  // remove ordinal suffixes from date
  let journalDate = parseDate(titleElement.textContent!);
  if (!isValidDate(journalDate)) return;

  // calculate dates
  let dayOfWeekName: string = "";
  if (logseq.settings?.booleanDayOfWeek === true) dayOfWeekName = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish || "default"), { weekday: logseq.settings?.longOrShort || "long" }).format(journalDate);
  let printWeekNumber: string;
  let printWeek: string = "";
  let weekStartsOn;
  if (logseq.settings?.weekNumberFormat === "US format") {
    weekStartsOn = 0;
  } else {
    weekStartsOn = 1;
  }
  if (logseq.settings?.booleanWeekNumber === true) {
    if (logseq.settings?.weekNumberOfTheYearOrMonth === "Year") {
      let forWeeklyJournal = "";
      let year: number;
      let week: number;
      if (logseq.settings?.weekNumberFormat === "ISO(EU) format") {
        year = getISOWeekYear(journalDate);
        week = getISOWeek(journalDate);
        printWeekNumber = `${year}-W<strong>${week}</strong>`;
        forWeeklyJournal = `${year}-W${week}`;
      } else {
        //NOTE: getWeekYear関数は1月1日がその年の第1週の始まりとなる(デフォルト)
        //weekStartsOnは先に指定済み
        year = getWeekYear(journalDate, { weekStartsOn });
        week = getWeek(journalDate, { weekStartsOn });
        printWeekNumber = `${year}-W<strong>${week}</strong>`;
        forWeeklyJournal = `${year}-W${week}`;
      }
      if (logseq.settings.booleanWeeklyJournal === true) {
        printWeek = `<span title="Week number"><a id="weeklyJournal-${journalDate}">${printWeekNumber}</a></span>`;
        setTimeout(() => {
          const element = parent.document.getElementById(`weeklyJournal-${journalDate}`) as HTMLSpanElement;
          if (element) {
            element.addEventListener("click", ({ shiftKey }): void => {
              weeklyJournal(journalDate, forWeeklyJournal, shiftKey as boolean, weekStartsOn, year, week);
              return;
            });
          }
        }, 150);
      } else {
        printWeek = `<span title="Week number">${printWeekNumber}</span>`;
      }
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
    if (formatString !== "") relativeTime = `<span><small>(${formatString})</small></span>`;
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

  //h1から.blockを削除
  if (titleElement.classList.contains("block")) titleElement.classList.remove("block");

  //h1の中にdateInfoElementを挿入
  const aTag = titleElement.parentElement; // 親要素を取得する
  if (aTag && aTag.tagName.toLowerCase() === 'a') {
    const titleElementTextContent = titleElement.textContent;
    //titleElementのテキストコンテンツを削除
    titleElement.textContent = '';
    //For journals
    //<a><h1>日付タイトル</h1></a>の構造になっているが、<h1><a>日付タイトル</h1>にしたい
    //aタグと同じ階層にtitleElementを移動する
    aTag.insertAdjacentElement('afterend', titleElement);
    //titleElementの中にaTagを移動する
    titleElement.appendChild(aTag);
    //移動したaタグの中身にtitleElementTextContentを戻す
    aTag.textContent = titleElementTextContent;
    //aタグから.initial-colorを削除
    if (aTag.classList.contains("initial-color")) aTag.classList.remove("initial-color");
    // titleElementの後ろにdateInfoElementを追加する
    titleElement.insertAdjacentElement('afterend', dateInfoElement);
  } else {
    //For single journal
    titleElement.insertAdjacentElement('afterend', dateInfoElement);
  }
}

async function weeklyJournal(journalDate: Date, weeklyPageName: string, shiftKey: boolean, weekStartsOn, year: number, week: number) {
  const page = await logseq.Editor.getPage(weeklyPageName) as PageEntity | null;
  if (page) {
    if (shiftKey) {
      logseq.Editor.openInRightSidebar(page.uuid);
    } else {
      logseq.App.pushState('page', { name: weeklyPageName });
    }
  } else {
    let weekDaysLinks: string[];
    const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
    //その週の日付リンクを作成
    let weekStart: Date;
    let weekEnd: Date;
    if (logseq.settings?.weekNumberFormat === "ISO(EU) format") {
      //ISO式でjournalDateの週の日付すべてを取得
      weekStart = startOfISOWeek(journalDate);
      weekEnd = endOfISOWeek(journalDate);
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      weekDaysLinks = weekDays.map((weekDay) => format(weekDay, preferredDateFormat));
    } else {
      //journalDateの週の日付すべてを取得
      weekStart = startOfWeek(journalDate, { weekStartsOn });
      weekEnd = endOfWeek(journalDate, { weekStartsOn });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      weekDaysLinks = weekDays.map((weekDay) => format(weekDay, preferredDateFormat));
    }
    //weekStartの前日から週番号を求める(前の週番号を求める)
    const prevWeekStart = subDays(weekStart, 1);
    let prevWeekNumber: number;
    if (logseq.settings?.weekNumberFormat === "ISO(EU) format") {
      prevWeekNumber = getISOWeek(prevWeekStart);
    } else {
      prevWeekNumber = getWeek(prevWeekStart, { weekStartsOn });
    }
    //次の週番号を求める
    const nextWeekStart = addDays(weekEnd, 1);
    let nextWeekNumber: number;
    if (logseq.settings?.weekNumberFormat === "ISO(EU) format") {
      nextWeekNumber = getISOWeek(nextWeekStart);
    } else {
      nextWeekNumber = getWeek(nextWeekStart, { weekStartsOn });
    }
    //年
    weekDaysLinks.unshift(`${year}-W${String(prevWeekNumber)}`);
    weekDaysLinks.unshift(String(year));
    //weekDaysLinksの週番号を追加
    weekDaysLinks.push(`${year}-W${String(nextWeekNumber)}`);

    const create = await logseq.Editor.createPage(weeklyPageName, { tags: weekDaysLinks }, { redirect: true, createFirstBlock: true });
    if (create) {
      const { uuid } = await logseq.Editor.prependBlockInPage(create.uuid, "") as BlockEntity;
      if (logseq.settings!.weeklyJournalTemplateName !== "") {
        const exist = await logseq.App.existTemplate(logseq.settings!.weeklyJournalTemplateName) as boolean;
        if (exist){
          await logseq.App.insertTemplate(uuid, logseq.settings!.weeklyJournalTemplateName);
        }else{
          logseq.UI.showMsg(`Template "${logseq.settings!.weeklyJournalTemplateName}" does not exist.`, 'warning', { timeout: 2000 });
        }
      }
      logseq.UI.showMsg('Weekly journal created', 'success', { timeout: 2000 });
    }
  }
}


const observer = new MutationObserver(() => {
  titleQuerySelector();
});


function observeElementAppearance(targetElement: HTMLElement, callback: () => void) {
  // 監視対象のDOMエレメントが存在しない場合は終了
  if (!targetElement) return;

  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // 特定のDOMエレメントが追加された場合の処理
        callback();
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
        const { preferredLanguage } = await logseq.App.getUserConfigs() as AppUserConfigs;
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
  div.is-journals div.ls-page-title {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center;
  }
  div#journals div.journal>div.flex div.content>div.foldable-title>div.flex.items-center {
  justify-content: space-around;
  }
  div.is-journals div.ls-page-title h1.title {
    width: fit-content;
  }
  h1.title+span.weekday-and-week-number {
    margin-left: 0.75em;
    opacity: .75;
    font-size: 1.3em;
    width: fit-content;
  }
  h1.title+span.weekday-and-week-number>span {
    margin-left: .75em;
  }
  div#weekBoundaries {
    display: flex;
    margin-top: 0.3em;
    padding: 0.3em;
    overflow-x: auto;
    width: fit-content;
  }
  div#weekBoundaries>span.day {
    opacity: .5;
    width: 100px;
    padding: 0.3em;
    margin-left: 0.6em;
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


  logseq.App.onRouteChanged(({ template }) => {
    if (logseq.settings?.booleanBoundaries === true && template === '/page/:name') {
      //page only
      //div.is-journals
      setTimeout(() => boundaries(false, 'is-journals'), 160);
    } else if (logseq.settings!.booleanJournalsBoundaries === true && template === '/') {
      //journals only
      //div#journals
      setTimeout(() => boundaries(false, 'journals'), 160);
    }
    setTimeout(() => titleQuerySelector(), 200);
  });


  //日付更新時に実行(Journal boundariesのセレクト更新のため)
  logseq.App.onTodayJournalCreated(async () => {
    if (logseq.settings?.booleanBoundaries === true) {
      const weekBoundaries = parent.document.getElementById('weekBoundaries') as HTMLDivElement | null;
      if (weekBoundaries) weekBoundaries.remove();
      if ((await logseq.Editor.getCurrentPage() as PageEntity | null) !== null) {
        //page only
        //div.is-journals
        setTimeout(() => boundaries(false, 'is-journals'), 160);
      } else {
        //journals only
        //div#journals
        setTimeout(() => boundaries(false, 'journals'), 160);
      }
    }
  });

  if (logseq.settings!.booleanJournalsBoundaries === true) {
    // 特定の動作を実行するコールバック関数
    const Callback = () => {
      //div#journals
      setTimeout(() => boundaries(false, 'journals'), 200);
    }

    observeElementAppearance(parent.document.getElementById("main-content-container") as HTMLDivElement, Callback);
  }


  logseq.App.onSidebarVisibleChanged(({ visible }) => {
    if (visible === true) setTimeout(() => titleQuerySelector(), 300);
  });


  logseq.onSettingsChanged((newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
    if ((oldSet.booleanBoundaries === true && newSet.booleanBoundaries === false) || oldSet.localizeOrEnglish !== newSet.localizeOrEnglish) {
      removeBoundaries();
    }

    if ((oldSet.booleanBoundaries === false && newSet.booleanBoundaries === true) || oldSet.localizeOrEnglish !== newSet.localizeOrEnglish) {
      boundaries(false, 'is-journals');
    } else
      if ((oldSet.booleanJournalsBoundaries === false && newSet.booleanJournalsBoundaries === true) || oldSet.localizeOrEnglish !== newSet.localizeOrEnglish) {
        boundaries(false, 'journals');
      }
    if ((oldSet.booleanJournalsBoundaries === true && newSet.booleanJournalsBoundaries === false)) {
      if (parent.document.getElementById("journals") as HTMLDivElement) removeBoundaries();
    }
    if (oldSet.localizeOrEnglish !== newSet.localizeOrEnglish ||
      oldSet.booleanDayOfWeek !== newSet.booleanDayOfWeek ||
      oldSet.longOrShort !== newSet.longOrShort ||
      oldSet.booleanWeekNumber !== newSet.booleanWeekNumber ||
      oldSet.weekNumberOfTheYearOrMonth !== newSet.weekNumberOfTheYearOrMonth ||
      oldSet.booleanWeekendsColor !== newSet.booleanWeekendsColor ||
      oldSet.weekNumberFormat !== newSet.weekNumberFormat ||
      oldSet.booleanRelativeTime !== newSet.booleanRelativeTime ||
      oldSet.booleanWeeklyJournal !== newSet.booleanWeeklyJournal
    ) {
      removeTitleQuery();
      setTimeout(() => titleQuerySelector(), 300);
    }
  });

  logseq.beforeunload(async () => {
    removeTitleQuery();
    removeBoundaries();
    observer.disconnect();
  });




};/* end_main */


const getJournalDayDate = (str: string): Date => new Date(
  Number(str.slice(0, 4)), //year
  Number(str.slice(4, 6)) - 1, //month 0-11
  Number(str.slice(6)) //day
);


function removeBoundaries() {
  const weekBoundaries = parent.document.getElementById('weekBoundaries') as HTMLDivElement;
  if (weekBoundaries) weekBoundaries.remove();
}

function removeTitleQuery() {
  const titleElements = parent.document.querySelectorAll("span.weekday-and-week-number") as NodeListOf<HTMLElement>;
  titleElements.forEach((titleElement) => titleElement.remove());
}

function titleQuerySelector() {
  parent.document.querySelectorAll("h1.title").forEach((titleElement) => addExtendedDate(titleElement as HTMLElement));
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
    const checkWeekBoundaries = parent.document.getElementById('weekBoundaries') as HTMLDivElement;
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
      targetDate = getJournalDayDate(String(journalDay)) as Date;
    }
    const days: number[] = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4];
    const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
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
            const page = await logseq.Editor.getPage(journalPageName) as PageEntity | null;
            if (page && page.journalDay) {
              if (event.shiftKey) {
                logseq.Editor.openInRightSidebar(page.uuid);
              } else {
                logseq.App.pushState('page', { name: journalPageName });
              }
            } else {
              if (logseq.settings!.noPageFoundCreatePage === true) {
                logseq.Editor.createPage(journalPageName, undefined, { redirect: true, journal: true });
              } else {
                logseq.UI.showMsg('No page found', 'warming');
              }
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
    title: t("Select language Localize(:default) or English(:en)"),
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
    title: t("Use the boundaries also on journals"),
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "noPageFoundCreatePage",
    title: t("On the journal boundaries if no page found, create the journal page"),
    type: "boolean",
    default: false,
    description: "",
  },
  {
    key: "booleanWeeklyJournal",
    title: t("Use Weekly Journal feature"),
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "weeklyJournalTemplateName",
    title: t("Weekly Journal template name"),
    type: "string",
    default: "",
    description: t("Input the template name (default is blank)"),
  },
];


logseq.ready(main).catch(console.error);