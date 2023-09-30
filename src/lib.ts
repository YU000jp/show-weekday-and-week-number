import { PageEntity } from "@logseq/libs/dist/LSPlugin.user";
import { getISOWeekYear, getISOWeek, getWeekYear, getWeek } from "date-fns";

export async function openPage(pageName: string, shiftKey: boolean) {
  const page = await logseq.Editor.getPage(pageName) as PageEntity | null;
  if (page) {
    if (shiftKey) logseq.Editor.openInRightSidebar(page.uuid);
    else logseq.App.pushState('page', { name: pageName });
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
  const replace = (textContent, long: string, short: string) => {
    textContent = textContent!.replace(long, localizeDayOfWeek("long", journalDate));
    textContent = textContent!.replace(short, localizeDayOfWeek("short", journalDate));
  }
  const dayOfWeek = journalDate.getDay(); //journalDateで曜日を取得する
  switch (dayOfWeek) {
    case 0:
      replace(titleElement.textContent, "Sunday", "Sun");
      break;
    case 1:
      replace(titleElement.textContent, "Monday", "Mon");
      break;
    case 2:
      replace(titleElement.textContent, "Tuesday", "Tue");
      break;
    case 3:
      replace(titleElement.textContent, "Wednesday", "Wed");
      break;
    case 4:
      replace(titleElement.textContent, "Thursday", "Thu");
      break;
    case 5:
      replace(titleElement.textContent, "Friday", "Fri");
      break;
    case 6:
      replace(titleElement.textContent, "Saturday", "Sat");
      break;
  }
}


//相対時間表示
export const formatRelativeDate = (targetDate: Date): string => {
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
  return new Intl.RelativeTimeFormat(("default"), { numeric: 'auto' }).format(diffInDays, 'day') as string;
}; //formatRelativeDate end

export const getWeekStartOn = (): 0 | 1 | 6 => {
  let weekStartsOn: 0 | 1 | 6;
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
  return weekStartsOn;
};


