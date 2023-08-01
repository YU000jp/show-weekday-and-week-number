import { PageEntity } from "@logseq/libs/dist/LSPlugin.user";
import { getISOWeekYear, getISOWeek, getWeekYear, getWeek } from "date-fns";

export function formatRelativeDate(targetDate: Date): string {
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


//日付からローカライズされた曜日を求める
export const localizeDayOfWeek = (weekday, journalDate: Date, locales?: string) => new Intl.DateTimeFormat((locales ? locales : "default"), { weekday }).format(journalDate);


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


