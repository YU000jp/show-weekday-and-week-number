import { AppUserConfigs, PageEntity } from '@logseq/libs/dist/LSPlugin.user';
import { format, addDays, isBefore, isToday, isSunday, isSaturday, startOfWeek, startOfISOWeek, isSameDay, isFriday, isThursday, isWednesday, } from 'date-fns';//https://date-fns.org/
import { formatRelativeDate, getJournalDayDate, getWeekStartOn, getWeeklyNumberFromDate } from './lib';
import { openPageFromPageName } from './lib';


let processingFoundBoundaries: boolean = false;
export async function boundariesProcess(targetElementName: string, remove: boolean, repeat: number, selectStartDate?: Date) {
  if (repeat >= 5 || processingFoundBoundaries === true) return;
  //if (targetElementName === 'weeklyJournal' && selectStartDate === undefined) return;//weeklyJournalの場合はselectStartDateが必要
  if (!selectStartDate) { //selectStartDateがある場合はチェックしない
    const checkWeekBoundaries = parent.document.getElementById('weekBoundaries') as HTMLDivElement | null;
    if (checkWeekBoundaries) {
      if (remove === true) checkWeekBoundaries.remove();
      else return;
    }
  }

  let firstElement: HTMLDivElement | null;
  switch (targetElementName) {
    case "is-journals":
      firstElement = parent.document.querySelector("div#main-content-container div.is-journals.relative>div.relative") as HTMLDivElement
      break;
    case "journals":
      firstElement = parent.document.getElementById("journals") as HTMLDivElement;
      break;
    case "weeklyJournal":
      firstElement = parent.document.querySelector("div#main-content-container div.page.relative>div.relative") as HTMLDivElement;
      break;
    default:
      firstElement = null;
      break;
  }
  if (firstElement === null &&
    ((targetElementName === 'journals' && parent.document.getElementById('journals') === null)
      || (targetElementName === 'is-journals' && parent.document.getElementsByClassName('is-journals')[0] === null)
      || (targetElementName === 'weeklyJournal' && parent.document.getElementsByClassName('page')[0] === null)
    )) {
    setTimeout(() => boundariesProcess(targetElementName, false, repeat + 1), 300);
  }
  processingFoundBoundaries = true;


  const weekStartsOn: 0 | 1 | 6 = getWeekStartOn();
  const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;

  if (firstElement) {
    const today = new Date();
    //スクロールの場合とそうでない場合でweekBoundariesを作成するかどうかを判定する
    const weekBoundaries: HTMLDivElement = selectStartDate && targetElementName !== "weeklyJournal" ? parent.document.getElementById("weekBoundaries") as HTMLDivElement : parent.document.createElement('div');
    weekBoundaries.id = 'weekBoundaries';
    firstElement.insertBefore(weekBoundaries, firstElement.firstChild);

    //weekBoundariesにelementを追加する
    const boundariesInner: HTMLDivElement = parent.document.createElement('div');
    boundariesInner.id = 'boundariesInner';
    weekBoundaries.appendChild(boundariesInner);

    let targetDate: Date;//今日の日付もしくはそのページの日付を求める
    if (targetElementName === 'journals') {
      targetDate = today;
    } else
      if (targetElementName === 'is-journals') {
        const { journalDay } = await logseq.Editor.getCurrentPage() as PageEntity;
        if (!journalDay) {
          console.error('journalDay is undefined');
          processingFoundBoundaries = false;
          return;
        }
        targetDate = getJournalDayDate(String(journalDay)) as Date;
      } else
        if (targetElementName === "weeklyJournal") {
          targetDate = selectStartDate as Date;
        } else {
          console.error('targetElementName is undefined');
          processingFoundBoundaries = false;
          return;
        }

    //targetDateを週の初めにする
    const startDate: Date = selectStartDate ? selectStartDate :
      weekStartsOn === 1 && logseq.settings?.weekNumberFormat === "ISO(EU) format"
        ? startOfISOWeek(targetDate)
        : startOfWeek(targetDate, { weekStartsOn });

    // 次の週を表示するかどうかの判定
    const isDayThursday: boolean = isThursday(targetDate);
    const isDayFriday: boolean = isFriday(targetDate);
    const isDaySaturday: boolean = isSaturday(targetDate);
    const flagShowNextWeek: boolean =
      //日曜日始まり、木曜、金曜、土曜がtargetDateの場合
      (weekStartsOn === 0 && (isDayThursday || isDayFriday || isDaySaturday))
        //月曜日始まり、金曜、土曜、日曜がtargetDateの場合
        || (weekStartsOn === 1 && (isDayFriday || isDaySaturday || isSunday(targetDate)))
        //土曜日始まり、水曜、木曜、金曜がtargetDateの場合
        || (weekStartsOn === 6 && (isWednesday(targetDate) || isDayThursday || isDayFriday))
        ? true : false;
    const days: number[] = flagShowNextWeek === true
      ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] //次の週を表示する場合
      : [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]; //次の週を表示しない場合

    let monthDuplicate: Date;
    //ミニカレンダー作成 1日ずつ処理
    days.forEach((numDays, index) => {
      const date: Date = numDays === 0 ? startDate : addDays(startDate, numDays) as Date;
      const dayOfWeek: string = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish as string || "default"), { weekday: "short" }).format(date);
      //日付を取得する
      const dayOfMonth: number = date.getDate();
      const dayElement: HTMLSpanElement = parent.document.createElement('span');
      try {
        if (index === 7) {
          const element = parent.document.createElement('div') as HTMLDivElement;
          element.style.width = "100%";
          boundariesInner.append(element);
        }
        if (index === 0 || index === 7) {
          //daySideElement作成    
          //月を表示する場合
          if (logseq.settings!.booleanBoundariesShowMonth === true) monthDuplicate = daySideMonth(date, boundariesInner, monthDuplicate);//daySideElement作成
        }
        //dayElement作成
        const isBooleanBeforeToday: boolean = isBefore(date, today);
        const isBooleanToday: boolean = isToday(date);
        const isBooleanTargetSameDay: boolean = isSameDay(targetDate, date);
        dayElement.classList.add('day');
        const dayOfWeekElement: HTMLSpanElement = parent.document.createElement('span');
        dayOfWeekElement.classList.add('dayOfWeek');
        dayOfWeekElement.innerText = dayOfWeek;
        dayElement.appendChild(dayOfWeekElement);
        const dayOfMonthElement: HTMLSpanElement = parent.document.createElement('span');
        dayOfMonthElement.classList.add('dayOfMonth');
        dayOfMonthElement.innerText = `${dayOfMonth}`;
        dayElement.appendChild(dayOfMonthElement);
        //日付と相対時間をtitleに追加する
        if (logseq.settings?.booleanRelativeTime === true) { //相対時間を表示する場合
          const formatString: string = formatRelativeDate(date);
          dayElement.title = format(date, preferredDateFormat) + '\n' + formatString;
        } else {
          dayElement.title = format(date, preferredDateFormat);
        }

        if ((flagShowNextWeek === true && index < 7) || (flagShowNextWeek === false && index > 6)) dayElement.classList.add('thisWeek');

        if (targetElementName !== 'journals' && isBooleanTargetSameDay === true)
          dayElement.style.border = `1px solid ${logseq.settings!.boundariesHighlightColorSinglePage}`;//シングルページの日付をハイライト
        else
          if (isBooleanToday === true) dayElement.style.border = `1px solid ${logseq.settings!.boundariesHighlightColorToday}`;//今日をハイライト

        if (logseq.settings?.booleanWeekendsColor === true) {
          if (isSaturday(date) as boolean) dayElement.style.color = 'var(--ls-wb-stroke-color-blue)';
          else if (isSunday(date) as boolean) dayElement.style.color = 'var(--ls-wb-stroke-color-red)';
        }

        if (logseq.settings!.booleanBoundariesFuturePage === true
          || isBooleanBeforeToday === true || isBooleanToday === true)
          dayElement.addEventListener("click", openPageToSingleDay(date, isBooleanBeforeToday, preferredDateFormat));
        else
          dayElement.style.cursor = 'unset';
      } finally {
        boundariesInner.appendChild(dayElement);
        if (index === 6 || index === 13) {
          //daySideElement作成    
          //週番号を表示する場合
          if (logseq.settings!.booleanBoundariesShowWeekNumber === true) daySideWeekNumber(date, boundariesInner);
          daySideScroll(index, boundariesInner, targetElementName, startDate);//スクロール
        }

      }

    });

  }

  processingFoundBoundaries = false;
}


const daySideWeekNumber = (date: Date, boundariesInner: HTMLDivElement) => {
  //dateに1日足した日付を取得する
  const dateAddOneDay: Date = addDays(date, 1) as Date;
  const weekStartsOn: 0 | 1 = logseq.settings?.weekNumberFormat === "US format" ? 0 : 1;
  //dateAddOneDayの週番号を取得する
  const { year, weekString }: { year: number; weekString: string } = getWeeklyNumberFromDate(dateAddOneDay, weekStartsOn);
  const weekNumberElement: HTMLSpanElement = parent.document.createElement('span');
  weekNumberElement.classList.add('daySide', 'daySideWeekNumber');
  weekNumberElement.innerText = "W" + weekString;
  weekNumberElement.title = year + "-W" + weekString;
  weekNumberElement.addEventListener("click", ({ shiftKey }) => openPageFromPageName(`${year}-W${weekString}`, shiftKey));
  boundariesInner.appendChild(weekNumberElement);
};

const daySideMonth = (date: Date, boundariesInner: HTMLDivElement, monthDuplicate: Date): Date => {
  const sideMonthElement: HTMLSpanElement = parent.document.createElement('span');
  sideMonthElement.classList.add('daySide');
  //monthDuplicateが存在したら、dateの6日後を代入する
  const dateShowMonth: Date = monthDuplicate ? addDays(date, 6) as Date : date;

  //ローカライズされた月の名前を取得する
  const monthString: string = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish as string || "default"), { month: "short" }).format(dateShowMonth);
  sideMonthElement.innerText = monthString;

  if (//monthDuplicateとdateShowMonthの月が一致する場合
    monthDuplicate &&
    dateShowMonth.getMonth() === monthDuplicate.getMonth() &&
    dateShowMonth.getFullYear() === monthDuplicate.getFullYear()
  ) {
    sideMonthElement.style.visibility = 'hidden';
  } else {
    const monthString: string = format(dateShowMonth, "yyyy/MM");
    sideMonthElement.title = monthString;
    sideMonthElement.addEventListener("click", ({ shiftKey }) => openPageFromPageName(monthString, shiftKey));// 2023/10のようなページを開く
  }
  boundariesInner.appendChild(sideMonthElement);
  return dateShowMonth;
}

const daySideScroll = (index: number, boundariesInner: HTMLDivElement, targetElementName: string, startDate: Date) => {
  const sideScrollElement: HTMLSpanElement = parent.document.createElement('span');
  sideScrollElement.classList.add('daySide', 'daySideScroll');
  sideScrollElement.innerText = index === 6 ? '↑' : '↓';
  boundariesInner.appendChild(sideScrollElement);
  sideScrollElement.addEventListener('click', () => {
    //boundariesInnerを削除する
    boundariesInner.remove();
    //startDateを1週間ずらす
    boundariesProcess(targetElementName, false, 0, addDays(startDate, index === 6 ? -7 : 7) as Date);
  }, { once: true });
}

function openPageToSingleDay(date: Date, isBooleanBeforeToday: boolean, preferredDateFormat: string): (this: HTMLSpanElement, ev: MouseEvent) => any {
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