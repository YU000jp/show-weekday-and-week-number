import { AppUserConfigs, PageEntity } from "@logseq/libs/dist/LSPlugin.user";
import { formatRelativeDate, getJournalDayDate, localizeDayOfWeek, titleElementReplaceLocalizeDayOfWeek } from "./lib";

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
