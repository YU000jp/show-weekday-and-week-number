import { AppUserConfigs, PageEntity } from '@logseq/libs/dist/LSPlugin.user';
import { format, addDays, isBefore, isToday, isSunday, isSaturday, startOfWeek, startOfISOWeek, isThisISOWeek, isSameDay, isFriday, } from 'date-fns';//https://date-fns.org/
import { getJournalDayDate } from './lib';


let processingFoundBoundaries: boolean = false;
export async function boundariesProcess(targetElementName: string, remove: boolean, repeat: number) {
  if (repeat >= 20 || processingFoundBoundaries === true) return;
  const checkWeekBoundaries = parent.document.getElementById('weekBoundaries') as HTMLDivElement | null;
  if (checkWeekBoundaries) {
    if (remove === true) checkWeekBoundaries.remove();
    else return;
  }

  const firstElement = (targetElementName === 'is-journals')
    ? (parent.document.getElementsByClassName(targetElementName)[0] as HTMLDivElement)?.getElementsByClassName("relative")[0] as HTMLDivElement//Hierarchy linksのために階層を変更
    : (targetElementName === 'journals') ? parent.document.getElementById(targetElementName) as HTMLDivElement : null;
  if (firstElement === null &&
    ((targetElementName === 'journals' && parent.document.getElementById('journals') === null)
      || (targetElementName === 'is-journals' && parent.document.getElementsByClassName('is-journals')[0] === null)
    )) {
    setTimeout(() => boundariesProcess(targetElementName, false, repeat + 1), 300);
  }
  processingFoundBoundaries = true;
  let weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  switch (logseq.settings!.boundariesWeekStart) {
    case "Sunday":
      weekStartsOn = 0;
      break;
    case "Monday":
      weekStartsOn = 1;
      break;
    case "Saturday":
      weekStartsOn = 6;
      break;
    default: //"unset"
      weekStartsOn = (logseq.settings?.weekNumberFormat === "US format") ? 0 : 1;
      break;
  }


  const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
  if (firstElement) {
    const today = new Date();
    const weekBoundaries: HTMLDivElement = parent.document.createElement('div');
    weekBoundaries.id = 'weekBoundaries';
    firstElement.insertBefore(weekBoundaries, firstElement.firstChild);

    let targetDate: Date;//今日の日付もしくはそのページの日付を求める
    if (targetElementName === 'journals') {
      if (weekStartsOn === 1 && logseq.settings?.weekNumberFormat === "ISO(EU) format") targetDate = startOfISOWeek(today);
      else targetDate = startOfWeek(today, { weekStartsOn });
    } else {
      const { journalDay } = await logseq.Editor.getCurrentPage() as PageEntity;
      if (!journalDay) {
        console.error('journalDay is undefined');
        processingFoundBoundaries = false;
        return;
      }
      targetDate = getJournalDayDate(String(journalDay)) as Date;
    }
    let days: number[] = [];

    //targetDateを週の初めにする
    const startDate = weekStartsOn === 1 && logseq.settings?.weekNumberFormat === "ISO(EU) format" ? startOfISOWeek(targetDate) : startOfWeek(targetDate, { weekStartsOn });

    // 次の週を表示するかどうかの判定
    const flagShowNextWeek: Boolean =
      (weekStartsOn === 0 && isSaturday(targetDate)) //日曜日始まり、土曜日がtargetDateの場合
        || (weekStartsOn === 1 && isSunday(targetDate)) //月曜日始まり、日曜日がtargetDateの場合
        || (weekStartsOn === 6 && isFriday(targetDate)) //土曜日始まり、金曜日がtargetDateの場合
        ? true : false;
    if (flagShowNextWeek === true) {
      days = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; //次の週を表示する場合
    } else {
      days = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]; //次の週を表示しない場合
    }

    //ミニカレンダー作成 1日ずつ処理
    days.forEach((numDays, index) => {
      const date: Date = numDays === 0 ? startDate : addDays(startDate, numDays) as Date;
      const dayOfWeek: string = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish as string || "default"), { weekday: "short" }).format(date);
      const dayOfMonth: string = format(date, 'd');
      const dayElement: HTMLSpanElement = parent.document.createElement('span');
      try {
        dayElement.classList.add('day');
        dayElement.innerHTML = `<span class="dayOfWeek">${dayOfWeek}</span><span class="dayOfMonth">${dayOfMonth}</span>`;
        const booleanToday = isToday(date) as boolean;
        dayElement.title = format(date, preferredDateFormat);
        if ((logseq.settings?.weekNumberFormat === "ISO(EU) format" && isThisISOWeek(date))
          || ((flagShowNextWeek === true && index < 7) || (flagShowNextWeek === false && index > 6))
        ) dayElement.classList.add('thisWeek');
        if (targetElementName !== 'journals' && isSameDay(targetDate, date) === true) {
          dayElement.style.border = '1px solid var(--ls-wb-stroke-color-yellow)';
          dayElement.style.cursor = 'pointer';
          dayElement.style.opacity = "1.0";
        } else
          if (booleanToday === true) {
            dayElement.style.border = '1px solid var(--ls-wb-stroke-color-green)';
            dayElement.style.opacity = "1.0";
          }
        if (logseq.settings?.booleanWeekendsColor === true) {
          if (isSaturday(date) as boolean) dayElement.style.color = 'var(--ls-wb-stroke-color-blue)';
          else if (isSunday(date) as boolean) dayElement.style.color = 'var(--ls-wb-stroke-color-red)';
        }
        if (isBefore(date, today) as boolean || booleanToday === true) {
          dayElement.style.cursor = 'pointer';
          dayElement.addEventListener("click", openPageToSingleDay());
        }
      } finally {
        if (index === 7) {
          const element = parent.document.createElement('div') as HTMLDivElement;
          element.style.width = "95%";
          weekBoundaries!.appendChild(element);
          weekBoundaries!.style.flexWrap = "wrap";
        }
        weekBoundaries!.appendChild(dayElement);
      }

      function openPageToSingleDay(): (this: HTMLSpanElement, ev: MouseEvent) => any {
        return async (event) => {
          const journalPageName: string = format(date, preferredDateFormat);
          const page = await logseq.Editor.getPage(journalPageName) as PageEntity | null;
          if (page && page.journalDay) {
            if (event.shiftKey) logseq.Editor.openInRightSidebar(page.uuid);
            else logseq.App.pushState('page', { name: journalPageName });
          } else {
            if (logseq.settings!.noPageFoundCreatePage === true) logseq.Editor.createPage(journalPageName, undefined, { redirect: true, journal: true });
            else logseq.UI.showMsg('No page found', 'warming');
          }
        };
      }
    });
  }
  processingFoundBoundaries = false;
}