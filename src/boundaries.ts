import { AppUserConfigs, PageEntity } from '@logseq/libs/dist/LSPlugin.user';
import { format, addDays, isBefore, isToday, isSunday, isSaturday, startOfWeek, startOfISOWeek, isSameDay, isFriday, } from 'date-fns';//https://date-fns.org/
import { getJournalDayDate } from './lib';
import { is } from 'date-fns/locale';


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
      targetDate = today;
    } else {
      const { journalDay } = await logseq.Editor.getCurrentPage() as PageEntity;
      if (!journalDay) {
        console.error('journalDay is undefined');
        processingFoundBoundaries = false;
        return;
      }
      targetDate = getJournalDayDate(String(journalDay)) as Date;
    }

    //targetDateを週の初めにする
    const startDate: Date =
      weekStartsOn === 1 && logseq.settings?.weekNumberFormat === "ISO(EU) format"
        ? startOfISOWeek(targetDate)
        : startOfWeek(targetDate, { weekStartsOn });

    // 次の週を表示するかどうかの判定
    const flagShowNextWeek: Boolean =
      (weekStartsOn === 0 && isSaturday(targetDate)) //日曜日始まり、土曜日がtargetDateの場合
        || (weekStartsOn === 1 && isSunday(targetDate)) //月曜日始まり、日曜日がtargetDateの場合
        || (weekStartsOn === 6 && isFriday(targetDate)) //土曜日始まり、金曜日がtargetDateの場合
        ? true : false;
    const days: number[] = flagShowNextWeek === true
      ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] //次の週を表示する場合
      : [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]; //次の週を表示しない場合

    //ミニカレンダー作成 1日ずつ処理
    days.forEach((numDays, index) => {
      const date: Date = numDays === 0 ? startDate : addDays(startDate, numDays) as Date;
      const dayOfWeek: string = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish as string || "default"), { weekday: "short" }).format(date);
      //日付を取得する
      const dayOfMonth: number = date.getDate();
      const dayElement: HTMLSpanElement = parent.document.createElement('span');
      const isBooleanBeforeToday: boolean = isBefore(date, today);
      try {
        const isBooleanToday: boolean = isToday(date);
        const isBooleanTargetSameDay: boolean = isSameDay(targetDate, date);
        dayElement.classList.add('day');
        const dayOfWeekElement: HTMLSpanElement = parent.document.createElement('span');
        dayOfWeekElement.classList.add('dayOfWeek');
        dayOfWeekElement.innerText = dayOfWeek;
        dayElement.appendChild(dayOfWeekElement);
        const dayOfMonthElement: HTMLSpanElement = parent.document.createElement('span');
        dayOfMonthElement.classList.add('dayOfMonth');
        dayOfMonthElement.innerText = (dayOfMonth === 1 || isBooleanTargetSameDay === true) && logseq.settings!.booleanBoundariesShowMonth === true ? `${format(date, 'M')}/${dayOfMonth}` : `${dayOfMonth}`;
        dayElement.appendChild(dayOfMonthElement);
        dayElement.title = format(date, preferredDateFormat);
        if ((flagShowNextWeek === true && index < 7) || (flagShowNextWeek === false && index > 6)) dayElement.classList.add('thisWeek');

        if (targetElementName !== 'journals' && isBooleanTargetSameDay === true)
          dayElement.style.border = '1px solid var(--ls-wb-stroke-color-yellow)';//シングルページの日付をハイライト
        else
          if (isBooleanToday === true) dayElement.style.border = '1px solid var(--ls-wb-stroke-color-green)';//今日をハイライト

        if (logseq.settings?.booleanWeekendsColor === true) {
          if (isSaturday(date) as boolean) dayElement.style.color = 'var(--ls-wb-stroke-color-blue)';
          else if (isSunday(date) as boolean) dayElement.style.color = 'var(--ls-wb-stroke-color-red)';
        }

        if (logseq.settings!.booleanBoundariesFuturePage === true
          || isBooleanBeforeToday === true || isBooleanToday === true)
          dayElement.addEventListener("click", openPageToSingleDay());
        else
          dayElement.style.cursor = 'unset';
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

          if (event.shiftKey) {//Shiftキーを押しながらクリックした場合は、サイドバーでページを開く
            const page = await logseq.Editor.getPage(journalPageName) as PageEntity | null;
            if (page) logseq.Editor.openInRightSidebar(page.uuid);//ページが存在しない場合は開かない
          } else {
            //Shiftキーを押さずにクリックした場合は、ページを開く

            if (logseq.settings!.booleanNoPageFoundCreatePage === true && isBooleanBeforeToday === true) {//過去の日付の場合はページを作成しない
              //ページが存在しない場合は作成しない
              const page = await logseq.Editor.getPage(journalPageName) as PageEntity | null;
              if (page) logseq.App.pushState('page', { name: journalPageName });//ページが存在する場合は開く
              else logseq.UI.showMsg('Page not found', "warning", { timeout: 3000 });//ページが存在しない場合は警告を表示する
            } else {
              logseq.App.pushState('page', { name: journalPageName });//ページが存在しない場合も作成される
            }
          }
        };
      }
    });
  }
  processingFoundBoundaries = false;
}