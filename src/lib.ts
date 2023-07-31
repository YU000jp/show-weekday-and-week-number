import { PageEntity } from "@logseq/libs/dist/LSPlugin.user";

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


export function titleElementReplaceLocalizeDayOfWeek(journalDate: Date, titleElement: HTMLElement) {
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