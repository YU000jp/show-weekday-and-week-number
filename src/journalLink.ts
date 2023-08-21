import { AppUserConfigs, PageEntity } from "@logseq/libs/dist/LSPlugin.user";

import { format } from "date-fns";
import { getJournalDayDate, localizeDayOfWeek, titleElementReplaceLocalizeDayOfWeek } from "./lib";

export async function journalLink(journalLinkElement: HTMLElement): Promise<void> {
  if (!journalLinkElement.textContent
    || journalLinkElement.dataset.localize === "true"
    || (logseq.settings!.booleanJournalLinkLocalizeDayOfWeek === false
      && logseq.settings!.booleanJournalLinkAddLocalizeDayOfWeek === false)
  ) return;
  const page = await logseq.Editor.getPage(journalLinkElement.textContent!) as PageEntity | null;
  if (page && page.journalDay) {
    const journalDate: Date = getJournalDayDate(String(page.journalDay));
    const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;

    //日付フォーマット変更
    if (logseq.settings!.booleanJournalLinkDateFormat === true) {
      if (logseq.settings!.dateFormat === "Localize") {
        journalLinkElement.textContent = journalDate.toLocaleDateString("default", { weekday: "short", year: "numeric", month: "short", day: "numeric" }).replace(/,/g, "");//ローカライズ
      }
      else journalLinkElement.textContent = format(journalDate, logseq.settings!.dateFormat);
    }

    if (logseq.settings!.booleanJournalLinkAddLocalizeDayOfWeek as boolean === true && !(logseq.settings!.booleanJournalLinkDateFormat === true && logseq.settings!.dateFormat === "Localize")) {

      //日付フォーマットに曜日が含まれている場合、ジャーナルリンクから日付を取得し、曜日を置換する
      if (preferredDateFormat.includes("E") === true
        || (logseq.settings!.booleanJournalLinkDateFormat === true && logseq.settings!.dateFormat.includes("E"))
      ) titleElementReplaceLocalizeDayOfWeek(journalDate, journalLinkElement);

      //日付フォーマットに曜日が含まれていない場合、ジャーナルリンクから日付を取得し、曜日を追加する
      else if (journalLinkElement.classList.contains("title") === false) {//ジャーナルページのタイトル以外の場合のみ
        journalLinkElement.textContent = `${journalLinkElement.textContent} (${localizeDayOfWeek("short", journalDate, logseq.settings?.localizeOrEnglish)})`;//曜日を追加
        if (logseq.settings!.booleanRelativeTime === true) journalLinkElement.title = formatRelativeDate(journalDate);//相対時間表示
      }
      journalLinkElement.dataset.localize = "true";
    }
  }
}

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

