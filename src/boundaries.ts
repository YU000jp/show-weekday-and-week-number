import { AppUserConfigs, PageEntity } from '@logseq/libs/dist/LSPlugin.user';
import { format, addDays, isBefore, isToday, isSunday, isSaturday, startOfWeek, startOfISOWeek, isThisWeek, isThisISOWeek, } from 'date-fns';//https://date-fns.org/
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

  const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
  if (firstElement) {
    const today = new Date();
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
        processingFoundBoundaries = false;
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
  }
  processingFoundBoundaries = false;
}