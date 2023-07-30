import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { AppUserConfigs, BlockEntity, LSPluginBaseInfo, PageEntity, SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";
import { getISOWeek, getWeek, getWeekOfMonth, format, addDays, isBefore, isToday, isSunday, isSaturday, getISOWeekYear, getWeekYear, startOfWeek, eachDayOfInterval, startOfISOWeek, subDays, addWeeks, isThisWeek, isThisISOWeek, subWeeks, } from 'date-fns';//https://date-fns.org/
import fileMainCSS from "./main.css?inline";



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

  if (logseq.settings!.titleAlign === "space-around") parent.document.body.classList.add('show-justify');
  logseq.provideStyle({ key: "main", style: fileMainCSS });


  (parent.document.getElementById("main-content-container") as HTMLDivElement).onload = async () => {
    //Logseqを開いたときに実行
    if (logseq.settings!.booleanJournalsBoundaries === true) boundaries(false, 'journals');
    await titleQuerySelector();
    setTimeout(() => observerMainRight(), 3000);//スクロール用
  }


  logseq.App.onRouteChanged(({ template }) => {
    if (logseq.settings?.booleanBoundaries === true && template === '/page/:name') {
      //page only
      //div.is-journals
      setTimeout(() => boundaries(false, 'is-journals'), 10);
    } else if (logseq.settings!.booleanJournalsBoundaries === true && template === '/') {
      //journals only
      //div#journals
      setTimeout(() => boundaries(false, 'journals'), 10);
    }
    setTimeout(() => titleQuerySelector(), 50);
  });


  //日付更新時に実行(Journal boundariesのセレクト更新のため)
  logseq.App.onTodayJournalCreated(async () => {
    if (logseq.settings?.booleanBoundaries === true) {
      const weekBoundaries = parent.document.getElementById('weekBoundaries') as HTMLDivElement | null;
      if (weekBoundaries) weekBoundaries.remove();
      if ((await logseq.Editor.getCurrentPage() as PageEntity | null) !== null) {
        //page only
        //div.is-journals
        setTimeout(() => boundaries(false, 'is-journals'), 10);
      } else {
        //journals only
        //div#journals
        setTimeout(() => boundaries(false, 'journals'), 10);
      }
    }
  });


  logseq.App.onSidebarVisibleChanged(({ visible }) => {
    if (visible === true) setTimeout(() => titleQuerySelector(), 100);
  });


  logseq.onSettingsChanged((newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
    if (oldSet.titleAlign === "space-around" && newSet.titleAlign !== "space-around") {
      parent.document.body.classList!.remove('show-justify');
    } else if (oldSet.titleAlign !== "space-around" && newSet.titleAlign === "space-around") {
      parent.document.body.classList!.add('show-justify');
    }
    const changeBoundaries = (oldSet.localizeOrEnglish !== newSet.localizeOrEnglish
      || oldSet.journalBoundariesBeforeToday !== newSet.journalBoundariesBeforeToday
      || oldSet.journalBoundariesAfterToday !== newSet.journalBoundariesAfterToday
      || oldSet.journalsBoundariesWeekOnly !== newSet.journalsBoundariesWeekOnly
      || (
        oldSet.weekNumberFormat !== newSet.weekNumberFormat
        && newSet.journalsBoundariesWeekOnly === true
      )
    ) ? true : false;
    if (changeBoundaries ||
      (oldSet.booleanBoundaries === true && newSet.booleanBoundaries === false)) {
      removeBoundaries();
    }
    if (changeBoundaries ||
      (oldSet.booleanBoundaries === false && newSet.booleanBoundaries === true)) {
      if (parent.document.getElementById("is-journals") as HTMLDivElement) boundaries(false, 'is-journals');
    }
    if ((changeBoundaries || oldSet.booleanJournalsBoundaries === false && newSet.booleanJournalsBoundaries === true)) {
      if (parent.document.getElementById("journals") as HTMLDivElement) boundaries(false, 'journals');
    }
    if ((oldSet.booleanJournalsBoundaries === true && newSet.booleanJournalsBoundaries === false)) {
      //JOurnal boundariesを除去
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
      oldSet.booleanWeeklyJournal !== newSet.booleanWeeklyJournal ||
      oldSet.booleanJournalLinkLocalizeDayOfWeek !== newSet.booleanJournalLinkLocalizeDayOfWeek
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




let processingTitleQuery: boolean = false;
async function titleQuerySelector(): Promise<void> {
  if (processingTitleQuery) return;
  processingTitleQuery = true;
  const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
  parent.document.querySelectorAll("div#main-content-container div:is(.journal,.is-journals,.page) h1.title:not([data-checked])").forEach(async (titleElement) => await JournalPageTitle(titleElement as HTMLElement, preferredDateFormat));
  parent.document.querySelectorAll('div:is(#main-content-container,#right-sidebar) a[data-ref]:not([data-localize]), div#left-sidebar li span.page-title:not([data-localize])').forEach(async (titleElement) => await journalLink(titleElement as HTMLElement));
  processingTitleQuery = false;
}


const observer = new MutationObserver(async (): Promise<void> => {
  observer.disconnect();
  await titleQuerySelector();
  setTimeout(() => observerMainRight(), 2000);
});


function observerMainRight() {
  observer.observe(parent.document.getElementById("main-content-container") as HTMLDivElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  });
  observer.observe(parent.document.getElementById("right-sidebar") as HTMLDivElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  });
}


// function observeElementAppearance(targetElement: HTMLElement, callback: () => void) {
//   if (!targetElement) return;

//   const observer = new MutationObserver(() => {
//     observer.disconnect();
//     callback();
//   });
//   setTimeout(() => {
//     observer.observe(targetElement, { childList: true, subtree: true, attributeFilter: ["class"], });
//   }, 3000);
// }


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

//Credit: ottodevs  https://discuss.logseq.com/t/show-week-day-and-week-number/12685/18
let processingJournalTitlePage: Boolean = false;
async function JournalPageTitle(titleElement: HTMLElement, preferredDateFormat: string) {
  if (!titleElement.textContent
    || processingJournalTitlePage === true
    || titleElement.nextElementSibling?.className === "showWeekday") return;  // check if element already has date info
  processingJournalTitlePage = true;

  //ジャーナルのページタイトルの場合のみ

  //設定項目ですべてのトグルがオフの場合の処理
  if (
    logseq.settings?.booleanWeekNumber === false
    && logseq.settings!.booleanDayOfWeek === false
    && logseq.settings?.booleanRelativeTime === false
    && (titleElement.classList.contains("journal-title") === true || titleElement.classList.contains("title") === true)
  ) {
    const dateInfoElement: HTMLSpanElement = parent.document.createElement("span");
    dateInfoElement.classList.add("showWeekday");
    titleElement.insertAdjacentElement('afterend', dateInfoElement);
    const secondElement: HTMLSpanElement = parent.document.createElement("span");
    secondElement.style.width = "50%";
    titleElement.parentElement!.insertAdjacentElement('afterend', secondElement);
    return;
  }

  //Weekly Journalのページだった場合
  if (titleElement.classList.contains("journal-title") === false
    && titleElement.classList.contains("title") === true
    && logseq.settings!.booleanWeeklyJournal === true
    && titleElement.dataset!.WeeklyJournalChecked as string !== "true") {
    const match = titleElement.textContent.match(/^(\d{4})-W(\d{2})$/) as RegExpMatchArray;
    if (match && match[1] !== "" && match[2] !== "") {
      await currentPageIsWeeklyJournal(titleElement, match);
      processingJournalTitlePage = false;
      return;
    }
  }

  //ジャーナルタイトルから日付を取得し、右側に情報を表示する
  const page = await logseq.Editor.getPage(titleElement.textContent) as PageEntity | null;
  if (page && page.journalDay) {
    const journalDate: Date = getJournalDayDate(String(page.journalDay));
    behindJournalTitle(journalDate, titleElement, preferredDateFormat);

    //日付フォーマットに曜日が含まれている場合
    if (preferredDateFormat.includes("E") === true
      && logseq.settings!.booleanDayOfWeek === false
      && logseq.settings!.booleanJournalLinkLocalizeDayOfWeek === true
      && titleElement.dataset.localize === undefined) titleElementReplaceLocalizeDayOfWeek(journalDate, titleElement);
  }

  titleElement.dataset.checked = "true";
  processingJournalTitlePage = false;
}


//日付からローカライズされた曜日を求める
const localizeDayOfWeek = (weekday, journalDate: Date, locales?: string) => new Intl.DateTimeFormat((locales ? locales : "default"), { weekday }).format(journalDate);


function titleElementReplaceLocalizeDayOfWeek(journalDate: Date, titleElement: HTMLElement) {
  if (!titleElement.textContent || titleElement.dataset.localize === "true") return;
  const dayOfWeek = journalDate.getDay();//journalDateで曜日を取得する
  switch (dayOfWeek) {
    case 0:
      titleElement.textContent = titleElement.textContent!.replace("Sunday", localizeDayOfWeek("long", journalDate));
      titleElement.textContent = titleElement.textContent!.replace("Sun", localizeDayOfWeek("short", journalDate));
      break;
    case 1:
      titleElement.textContent = titleElement.textContent!.replace("Monday", localizeDayOfWeek("long", journalDate));
      titleElement.textContent = titleElement.textContent!.replace("Mon", localizeDayOfWeek("short", journalDate));
      break;
    case 2:
      titleElement.textContent = titleElement.textContent!.replace("Tuesday", localizeDayOfWeek("long", journalDate));
      titleElement.textContent = titleElement.textContent!.replace("Tue", localizeDayOfWeek("short", journalDate));
      break;
    case 3:
      titleElement.textContent = titleElement.textContent!.replace("Wednesday", localizeDayOfWeek("long", journalDate));
      titleElement.textContent = titleElement.textContent!.replace("Wed", localizeDayOfWeek("short", journalDate));
      break;
    case 4:
      titleElement.textContent = titleElement.textContent!.replace("Thursday", localizeDayOfWeek("long", journalDate));
      titleElement.textContent = titleElement.textContent!.replace("Thu", localizeDayOfWeek("short", journalDate));
      break;
    case 5:
      titleElement.textContent = titleElement.textContent!.replace("Friday", localizeDayOfWeek("long", journalDate));
      titleElement.textContent = titleElement.textContent!.replace("Fri", localizeDayOfWeek("short", journalDate));
      break;
    case 6:
      titleElement.textContent = titleElement.textContent!.replace("Saturday", localizeDayOfWeek("long", journalDate));
      titleElement.textContent = titleElement.textContent!.replace("Sat", localizeDayOfWeek("short", journalDate));
      break;
  }
  titleElement.dataset.localize = "true";
}


//behind journal title
function behindJournalTitle(journalDate: Date, titleElement: HTMLElement, preferredDateFormat) {
  let dayOfWeekName: string = "";
  if (preferredDateFormat.includes("E") === false && logseq.settings?.booleanDayOfWeek === true) dayOfWeekName = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish || "default"), { weekday: logseq.settings?.longOrShort || "long" }).format(journalDate);
  let printWeekNumber: string;
  let printWeek: string = "";
  const weekStartsOn = (logseq.settings?.weekNumberFormat === "US format") ? 0 : 1;
  if (logseq.settings?.booleanWeekNumber === true) {
    if (logseq.settings?.weekNumberOfTheYearOrMonth === "Year") {
      let forWeeklyJournal = "";
      let year: number;
      let week: number;
      if (logseq.settings?.weekNumberFormat === "ISO(EU) format") {
        year = getISOWeekYear(journalDate);
        week = getISOWeek(journalDate);
      } else {
        //NOTE: getWeekYear関数は1月1日がその年の第1週の始まりとなる(デフォルト)
        //weekStartsOnは先に指定済み
        year = getWeekYear(journalDate, { weekStartsOn });
        week = getWeek(journalDate, { weekStartsOn });
      }
      const weekString: string = (week < 10) ? String("0" + week) : String(week); //weekを2文字にする
      printWeekNumber = `${year}-W<strong>${weekString}</strong>`;
      forWeeklyJournal = `${year}-W${weekString}`;
      if (logseq.settings.booleanWeeklyJournal === true) {
        const linkId = "weeklyJournal-" + forWeeklyJournal;
        printWeek = `<span title="Week number"><a id="${linkId}">${printWeekNumber}</a></span>`;
        setTimeout(() => {
          const element = parent.document.getElementById(linkId) as HTMLSpanElement;
          if (element) {
            let processing: Boolean = false;
            element.addEventListener("click", ({ shiftKey }): void => {
              if (processing) return;
              processing = true;
              openPage(forWeeklyJournal, shiftKey as boolean);
              processing = false;
              return;
            });
          }
        }, 150);
      } else {
        printWeek = `<span title="Week number">${printWeekNumber}</span>`;
      }
    } else {
      // get week numbers of the month
      printWeek = (logseq.settings?.weekNumberFormat === "Japanese format" && logseq.settings?.localizeOrEnglish === "default")
        ? `<span title="1か月ごとの週番号">第<strong>${getWeekOfMonth(journalDate, { weekStartsOn })}</strong>週</span>`
        : `<span title="Week number within the month"><strong>W${getWeekOfMonth(journalDate, { weekStartsOn })}</strong><small>/m</small></span>`;
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
  dateInfoElement.classList.add("showWeekday");
  if (logseq.settings?.booleanDayOfWeek === true) {
    if (logseq.settings?.booleanWeekendsColor === true &&
      isSaturday(journalDate) === true) {
      dateInfoElement.innerHTML = `<span style="color:var(--ls-wb-stroke-color-blue)">${dayOfWeekName}</span>${printWeek}${relativeTime}`;
    }
    else if (logseq.settings?.booleanWeekendsColor === true &&
      isSunday(journalDate) === true) {
      dateInfoElement.innerHTML = `<span style="color:var(--ls-wb-stroke-color-red)">${dayOfWeekName}</span>${printWeek}${relativeTime}`;
    }
    else {
      dateInfoElement.innerHTML = `<span>${dayOfWeekName}</span>${printWeek}${relativeTime}`; //textContent
    }
  } else {
    dateInfoElement.innerHTML = `${printWeek}${relativeTime}`;
  }

  //h1から.blockを削除
  if (titleElement.classList.contains("block")) titleElement.classList.remove("block");


  //h1の中にdateInfoElementを挿入
  const aTag = titleElement.parentElement; // 親要素を取得する
  if (aTag && aTag.tagName.toLowerCase() === 'a') {
    //For journals
    //<a><h1>日付タイトル</h1></a>の構造になっているが、<h1><a>日付タイトル</a></h1>にしたい
    const titleElementTextContent = titleElement.textContent;
    //titleElementのテキストコンテンツを削除
    titleElement.textContent = '';
    //aタグと同じ階層にtitleElementを移動する
    aTag.insertAdjacentElement('afterend', titleElement);
    //TODO: ジャーナルページの場合
    // if (preferredDateFormat === "yyyy/MM/dd" && logseq.settings!.splitJournalTitle === true) {
    //   //ジャーナルタイトルを分割する

    // }
    //titleElementの中にaTagを移動する
    titleElement.appendChild(aTag);
    //移動したaタグの中身にtitleElementTextContentを戻す
    aTag.textContent = titleElementTextContent;
    //aタグから.initial-colorを削除
    if (aTag.classList.contains("initial-color")) aTag.classList.remove("initial-color");
    // titleElementの後ろにdateInfoElementを追加する
    titleElement.insertAdjacentElement('afterend', dateInfoElement);
  } else {
    if (preferredDateFormat === "yyyy/MM/dd" && logseq.settings!.splitJournalTitle === true) {
      //シングルジャーナルページの場合
      //「yyyy/mm/dd」形式のジャーナルタイトルを/で分割する
      const arrayName = titleElement.textContent;
      const array = titleElement.textContent?.split("/") as string[];
      titleElement.textContent = '';
      titleElement.insertAdjacentHTML('beforeend',
        `<span class="title block"><a id="${arrayName}-0" data-ref="${array[0]}" title="Year">${array[0]}</a> / <a id="${arrayName}-1" data-ref="${array[0]}/${array[1]}" title="Month">${array[1]}</a> / <a data-ref="${array[0]}/${array[1]}/${array[2]}" title="Day">${array[2]}</a></span>`);
      setTimeout(() => {
        const element0 = parent.document.getElementById(`${arrayName}-0`) as HTMLAnchorElement;
        if (element0) {
          element0.addEventListener("click", ({ shiftKey }) => {
            openPage(element0.dataset.ref as string, shiftKey as boolean);
          }, { once: true });
        }
        const element1 = parent.document.getElementById(`${arrayName}-1`) as HTMLAnchorElement;
        if (element1) {
          element1.addEventListener("click", ({ shiftKey }) => {
            openPage(element1.dataset.ref as string, shiftKey as boolean);
          }, { once: true });
        }
      }, 200);
    }
    //For single journal
    titleElement.insertAdjacentElement('afterend', dateInfoElement);
  }
}


async function currentPageIsWeeklyJournal(titleElement: HTMLElement, match: RegExpMatchArray) {
  titleElement.dataset.WeeklyJournalChecked = "true";
  const current = await logseq.Editor.getCurrentPageBlocksTree() as BlockEntity[];
  const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
  if (current[0].content === "" || !current[1]) {

    //ページタグを設定する
    const year = Number(match[1]); //2023
    const weekNumber = Number(match[2]); //27
    let weekDaysLinks: string[] = [];

    const weekStartsOn = (logseq.settings?.weekNumberFormat === "US format") ? 0 : 1;
    const ISO = (logseq.settings?.weekNumberFormat === "ISO(EU) format") ? true : false;

    //その週の日付リンクを作成
    const weekStart: Date = getWeekStartFromWeekNumber(year, weekNumber, weekStartsOn, ISO);
    const weekEnd: Date = addDays(weekStart, 6);
    //曜日リンク
    const weekDays: Date[] = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const weekDaysLinkArray: string[] = weekDays.map((weekDay) => format(weekDay, preferredDateFormat) as string);
    const weekdayArray: string[] = weekDays.map((weekDay) => new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish || "default"), { weekday: logseq.settings?.longOrShort || "long" }).format(weekDay) as string);

    //weekStartの前日から週番号を求める(前の週番号を求める)
    const prevWeekStart: Date = (ISO === true)
      ? subWeeks(weekStart, 1)
      : subDays(weekStart, 1);
    const prevWeekNumber: number = (ISO === true)
      ? getISOWeek(prevWeekStart)
      : getWeek(prevWeekStart, { weekStartsOn });

    //次の週番号を求める
    const nextWeekStart: Date = (ISO === true)
      ? addWeeks(weekStart, 1)
      : addDays(weekEnd, 1);
    const nextWeekNumber: number = (ISO === true)
      ? getISOWeek(nextWeekStart)
      : getWeek(nextWeekStart, { weekStartsOn });

    //年
    const printPrevYear = (ISO === true)
      ? getISOWeekYear(prevWeekStart)
      : getWeekYear(prevWeekStart, { weekStartsOn });
    weekDaysLinks.unshift(`${printPrevYear}-W${(prevWeekNumber < 10)
      ? String("0" + prevWeekNumber)
      : String(prevWeekNumber)}`);
    weekDaysLinks.unshift(String(year));

    //weekDaysLinksの週番号を追加
    const printNextYear = (ISO === true)
      ? getISOWeekYear(nextWeekStart)
      : getWeekYear(nextWeekStart, { weekStartsOn });
    weekDaysLinks.push(`${printNextYear}-W${(nextWeekNumber < 10)
      ? String("0" + nextWeekNumber)
      : String(nextWeekNumber)}`);

    if (preferredDateFormat === "yyyy-MM-dd" || preferredDateFormat === "yyyy/MM/dd") {
      //weekStartをもとに年と月を求め、リンクをつくる
      const printYear = format(weekStart, "yyyy");
      const printMonth = format(weekStart, "MM");
      const printMonthLink = (preferredDateFormat === "yyyy-MM-dd") ? `${printYear}-${printMonth}` : `${printYear}/${printMonth}`;
      weekDaysLinks.unshift(printMonthLink);
      //weekEndをもとに年と月を求め、リンクをつくる
      const printYear2 = format(weekEnd, "yyyy");
      const printMonth2 = format(weekEnd, "MM");
      const printMonthLink2 = (preferredDateFormat === "yyyy-MM-dd") ? `${printYear2}-${printMonth2}` : `${printYear2}/${printMonth2}`;
      if (printMonthLink !== printMonthLink2) weekDaysLinks.push(printMonthLink2);
    }
    //ユーザー設定のページタグを追加
    if (logseq.settings!.weeklyJournalSetPageTag !== "") weekDaysLinks.push(logseq.settings!.weeklyJournalSetPageTag);

    //テンプレートを挿入
    const page = await logseq.Editor.getCurrentPage() as BlockEntity;
    if (page) {

      const block = await logseq.Editor.insertBlock(current[0].uuid, "", { sibling: true }) as BlockEntity;
      if (block) {
        //空白
        const blank = await logseq.Editor.insertBlock(block.uuid, "", { sibling: true });
        if (blank) {
          //テンプレート
          await weeklyJournalInsertTemplate(blank.uuid, logseq.settings!.weeklyJournalTemplateName).finally(async () => {

            const newBlank = await logseq.Editor.insertBlock(blank.uuid, "", { sibling: true }) as BlockEntity;
            if (newBlank) {
              if (logseq.settings!.booleanWeeklyJournalThisWeek === true) {
                //曜日リンク
                const thisWeek = await logseq.Editor.insertBlock(newBlank.uuid, "#### This Week", { sibling: true }) as BlockEntity;
                if (thisWeek) {
                  if (!preferredDateFormat.includes("E")) weekDaysLinkArray.forEach(async (weekDayName, index) => {
                    await logseq.Editor.insertBlock(
                      thisWeek.uuid,
                      `${logseq.settings!.booleanWeeklyJournalThisWeekWeekday === true ?
                        (logseq.settings!.booleanWeeklyJournalThisWeekLinkWeekday === true ?
                          `[[${weekdayArray[index]}]] ` : weekdayArray[index])
                        : ""} [[${weekDayName}]]\n`);
                  });
                }
              }
              //ページタグとして挿入する処理
              await logseq.Editor.upsertBlockProperty(current[0].uuid, "tags", weekDaysLinks);
              await logseq.Editor.editBlock(current[0].uuid);
              setTimeout(() => logseq.Editor.insertAtEditingCursor(","), 200);
            }
          });
        }

      }
    }
  }
}


function getWeekStartFromWeekNumber(year: number, weekNumber: number, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined, ISO: boolean): Date {
  let weekStart: Date;
  if (ISO === true) {
    const includeDay = new Date(year, 0, 4, 0, 0, 0, 0); //1/4を含む週
    const firstDayOfWeek = startOfISOWeek(includeDay);
    weekStart = (getISOWeekYear(firstDayOfWeek) === year)
      ? addDays(firstDayOfWeek, (weekNumber - 1) * 7)
      : addWeeks(firstDayOfWeek, weekNumber);
  } else {
    const firstDay = new Date(year, 0, 1, 0, 0, 0, 0);
    const firstDayOfWeek = startOfWeek(firstDay, { weekStartsOn });
    weekStart = addDays(firstDayOfWeek, (weekNumber - 1) * 7);
  }
  return weekStart;
}


async function openPage(pageName: string, shiftKey: boolean) {
  const page = await logseq.Editor.getPage(pageName) as PageEntity | null;
  if (page) {
    if (shiftKey) {
      logseq.Editor.openInRightSidebar(page.uuid);
    } else {
      logseq.App.pushState('page', { name: pageName });
    }
  } else {
    //ページ作成のみ実行し、リダイレクトする
    await logseq.Editor.createPage(pageName, undefined, { redirect: true, createFirstBlock: true }) as PageEntity | null;
  }
}


async function weeklyJournalInsertTemplate(uuid: string, templateName: string): Promise<void> {
  if (templateName !== "") {
    const exist = await logseq.App.existTemplate(templateName) as boolean;
    if (exist) {
      await logseq.App.insertTemplate(uuid, templateName);
    } else {
      logseq.UI.showMsg(`Template "${templateName}" does not exist.`, 'warning', { timeout: 2000 });
    }
  }
  logseq.UI.showMsg('Weekly journal created', 'success', { timeout: 2000 });
}


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
  const titleElements = parent.document.querySelectorAll("div#main-content-container div:is(.journal,.is-journals) h1.title+span.showWeekday") as NodeListOf<HTMLElement>;
  titleElements.forEach((titleElement) => titleElement.remove());
}


async function journalLink(titleElement: HTMLElement): Promise<void> {
  if (!titleElement.textContent
    || titleElement.dataset.localize === "true"
    || (logseq.settings!.booleanJournalLinkLocalizeDayOfWeek === false
      && logseq.settings!.booleanJournalLinkAddLocalizeDayOfWeek === false)
  ) return;
  const page = await logseq.Editor.getPage(titleElement.textContent!) as PageEntity | null;
  if (page && page.journalDay) {
    const journalDate: Date = getJournalDayDate(String(page.journalDay));
    const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
    const dateFormatIncludeDayOfWeek = (preferredDateFormat.includes("E")) ? true : false;
    //日付フォーマットに曜日が含まれている場合、ジャーナルリンクから日付を取得し、曜日を置換する
    if (dateFormatIncludeDayOfWeek === true
      && titleElement.dataset.localize !== "true"
      && logseq.settings!.booleanJournalLinkLocalizeDayOfWeek as boolean === true) {
      titleElementReplaceLocalizeDayOfWeek(journalDate, titleElement);
    }
    //日付フォーマットに曜日が含まれていない場合、ジャーナルリンクから日付を取得し、曜日を追加する
    if (dateFormatIncludeDayOfWeek === false
      && titleElement.dataset.localize !== "true"
      && logseq.settings!.booleanJournalLinkAddLocalizeDayOfWeek as boolean === true
      && titleElement.classList.contains("title") === false) {
      titleElement.textContent = `${titleElement.textContent} (${localizeDayOfWeek("short", journalDate, logseq.settings?.localizeOrEnglish)})`;
      if (logseq.settings!.booleanRelativeTime === true) titleElement.title = formatRelativeDate(journalDate);
      titleElement.dataset.localize = "true";
    }

  }
}

//boundaries
let processingBoundaries: boolean = false;
function boundaries(lazy: boolean, targetElementName: string) {
  if (processingBoundaries) return;
  processingBoundaries = true;
  boundariesProcess(lazy, targetElementName);
  processingBoundaries = false;
}


async function boundariesProcess(lazy: boolean, targetElementName: string) {
  const today = new Date();
  let firstElement: HTMLDivElement;
  if (targetElementName === 'is-journals') {
    firstElement = parent.document.getElementsByClassName(targetElementName)[0] as HTMLDivElement;
  } else if (targetElementName === 'journals') {
    firstElement = parent.document.getElementById(targetElementName) as HTMLDivElement;
  } else {
    return;
  }
  const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
  if (firstElement) {
    const checkWeekBoundaries = parent.document.getElementById('weekBoundaries') as HTMLDivElement;
    if (checkWeekBoundaries) checkWeekBoundaries.remove();
    const weekBoundaries: HTMLDivElement = parent.document.createElement('div');
    weekBoundaries.id = 'weekBoundaries';
    firstElement.insertBefore(weekBoundaries, firstElement.firstChild);
    let targetDate: Date;
    if (targetElementName === 'journals') {
      if (logseq.settings!.journalsBoundariesWeekOnly === true) {
        const weekStartsOn = (logseq.settings?.weekNumberFormat === "US format") ? 0 : 1;
        if (logseq.settings?.weekNumberFormat === "ISO(EU) format") {
          targetDate = startOfISOWeek(today);
        } else {
          targetDate = startOfWeek(today, { weekStartsOn });
        }
      } else {
        targetDate = today;
      }
    } else {
      const { journalDay } = await logseq.Editor.getCurrentPage() as PageEntity;
      if (!journalDay) {
        console.error('journalDay is undefined');
        return;
      }
      targetDate = getJournalDayDate(String(journalDay)) as Date;
    }
    let days: number[] = [];
    const weekDoubles: Boolean = ((logseq.settings?.weekNumberFormat === "US format" && isSaturday(today))
      || (logseq.settings?.weekNumberFormat !== "US format" && isSunday(today))) ? true : false;
    if (targetElementName === 'journals' && logseq.settings!.journalsBoundariesWeekOnly === true) {
      if (weekDoubles === true) {
        days = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      } else {
        days = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
      }
    } else {
      //logseq.settings!.journalBoundariesBeforeTodayをもとに数字をdaysの配列の先頭に追加していく
      for (let i = 0; i < Number(logseq.settings!.journalBoundariesBeforeToday) + 1; i++)  days.unshift(-i);

      //logseq.settings!.journalBoundariesAfterTodayをもとに数字をdaysの配列の末尾に追加していく
      for (let i = 1; i <= Number(logseq.settings!.journalBoundariesAfterToday); i++)  days.push(i);
    }
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
        if ((logseq.settings?.weekNumberFormat === "ISO(EU) format" && isThisISOWeek(date))
          || (isThisWeek(date, { weekStartsOn: ((logseq.settings?.weekNumberFormat === "US format") ? 0 : 1) }))
        ) dayElement.classList.add('thisWeek');
        if (booleanToday === true) {
          dayElement.style.color = 'var(--ls-wb-stroke-color-green)';
          dayElement.style.borderBottom = '3px solid var(--ls-wb-stroke-color-green)';
          dayElement.style.opacity = "1.0";
        } else
          if (targetElementName !== 'journals' && numDays === 0) {
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
        if (isBefore(date, today) as boolean || booleanToday === true) {
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
        if (
          (numDays === 7 && weekDoubles === true)
          || (numDays === 0
            && targetElementName === 'journals'
            && logseq.settings!.journalsBoundariesWeekOnly === true
          )) {
          const element = parent.document.createElement('div') as HTMLDivElement;
          element.style.width = "95%";
          weekBoundaries!.appendChild(element);
          weekBoundaries!.style.flexWrap = "wrap";
        }
        weekBoundaries!.appendChild(dayElement);
      }
    });
  } else {
    if (lazy === true) return;
    setTimeout(() => boundaries(true, targetElementName), 100);
  }
}

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
const settingsTemplate = (ByLanguage: string): SettingSchemaDesc[] => [
  {
    key: "weekNumberFormat",
    title: t("Week number format"),
    type: "enum",
    default: ByLanguage || "ISO(EU) format",
    enumChoices: ["US format", "ISO(EU) format", "Japanese format"],
    description: "",
  },
  {
    key: "titleAlign",
    title: t("Journal title, Alignment of journal page title"),
    type: "enum",
    default: "left",
    enumChoices: ["left", "space-around"],
    description: "",
  },
  {
    key: "localizeOrEnglish",
    title: t("Day of the week, Select language Localize(:default) or English(:en)"),
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
    description: t("If user date format includes day of the week, this setting is ignored."),
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
    key: "weekNumberOfTheYearOrMonth",
    title: t("Behind journal title, Show week number of the year or month (unit)"),
    type: "enum",
    default: "Year",
    enumChoices: ["Year", "Month"],
    description: "",
  },
  {
    key: "booleanWeekendsColor",
    title: t("Behind journal title, Coloring to the word of Saturday or Sunday"),
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "booleanRelativeTime",
    title: t("Behind journal title / Localize journal link, Enable relative time"),
    type: "boolean",
    default: true,
    description: t("like `3 days ago`"),
  },
  {
    key: "booleanBoundaries",
    title: t("Journal boundaries, Enable feature"),
    type: "boolean",
    default: true,
    description: t("Show the boundaries of days before and after the day on the single journal page"),
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
    title: t("Journal boundaries, Custom day range: before today (Excludes 2 week mode)"),
    type: "enum",
    default: "6",
    enumChoices: ["11", "10", "9", "8", "7", "6", "5", "4", "3"],
    description: t("default: `6`"),
  },
  {
    //Journal Boundaries 当日以降の日付を決める
    key: "journalBoundariesAfterToday",
    title: t("Journal boundaries, Custom day range: after today (Excludes 2 week mode)"),
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
    description: t("Enable the link and function. If there is no content available on a page with a week number like 2023-W25, a template will be inserted."),
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
    title: t("Weekly Journal, Enable the day of the week in the `This Week` section"),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    key: "booleanWeeklyJournalThisWeekLinkWeekday",
    title: t("Weekly Journal, Convert the day of the week in the `This Week` section into links."),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {//日付フォーマットに曜日が含まれていた場合に、曜日をローカライズするかどうか
    key: "booleanJournalLinkLocalizeDayOfWeek",
    title: t("Localize journal link: If the day of the week is included in user date format, localize the day of the week in the date link"),
    type: "boolean",
    default: true,
    //グラフには影響を与えない
    description: "default: `true` *This setting does not affect the graph*",
  },
  {//日付フォーマットに曜日が含まれていない場合に、日付リンクに、ローカライズされた日付を追加する
    key: "booleanJournalLinkAddLocalizeDayOfWeek",
    title: t("Localize journal link: If the day of the week is not included in user date format, add the localized day of the week to the date link"),
    type: "boolean",
    default: true,
    description: "default: `true` *This setting does not affect the graph*",
  },
  {
    key: "splitJournalTitle",
    title: t("Journal title, If user date format is yyyy/mm/dd, Enable hierarchy link (split to 3 journal link) on single journal page: toggle"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
];


logseq.ready(main).catch(console.error);