import { AppUserConfigs, PageEntity } from "@logseq/libs/dist/LSPlugin.user";
import { formatRelativeDate, getJournalDayDate } from "./lib";
import { localizeDayOfWeek } from "./lib";

export async function journalLink(titleElement: HTMLElement): Promise<void> {
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
            titleElement.textContent = `${titleElement.textContent} (${localizeDayOfWeek("short", journalDate, logseq.settings?.localizeOrEnglish)})`;//曜日を追加
            if (logseq.settings!.booleanRelativeTime === true) titleElement.title = formatRelativeDate(journalDate);//相対時間表示
            titleElement.dataset.localize = "true";
        }

    }
}
//titleElementの日付をローカライズする(Element書き換え)


export function titleElementReplaceLocalizeDayOfWeek(journalDate: Date, titleElement: HTMLElement) {
  if (!titleElement.textContent || titleElement.dataset.localize === "true") return;
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
  titleElement.dataset.localize = "true";
}
