import { PageEntity } from "@logseq/libs/dist/LSPlugin.user";
import { getISOWeekYear, getISOWeek, getWeekYear, getWeek } from "date-fns";

export async function openPage(pageName: string, shiftKey: boolean) {
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

export const getJournalDayDate = (str: string): Date => new Date(
  Number(str.slice(0, 4)), //year
  Number(str.slice(4, 6)) - 1, //month 0-11
  Number(str.slice(6)) //day
);


//日付から週番号を求める
export function getWeeklyNumberFromDate(journalDate: Date, weekStartsOn: 0 | 1): { year: number, weekString: string } {
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
  return { year, weekString };//weekを2文字にする
}

//日付からローカライズされた曜日を求める
export const localizeDayOfWeek = (weekday, journalDate: Date, locales?: string) => new Intl.DateTimeFormat((locales ? locales : "default"), { weekday }).format(journalDate);

//titleElementの日付をローカライズする(Element書き換え)
export function titleElementReplaceLocalizeDayOfWeek(journalDate: Date, titleElement: HTMLElement) {
  const dayOfWeek = journalDate.getDay(); //journalDateで曜日を取得する
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
}


