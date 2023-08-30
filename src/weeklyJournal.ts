import { AppUserConfigs, BlockEntity } from '@logseq/libs/dist/LSPlugin.user';
import { getISOWeek, getWeek, format, addDays, getISOWeekYear, getWeekYear, startOfWeek, eachDayOfInterval, startOfISOWeek, subDays, addWeeks, subWeeks, } from 'date-fns';//https://date-fns.org/


export async function currentPageIsWeeklyJournal(titleElement: HTMLElement, match: RegExpMatchArray) {
    titleElement.dataset.WeeklyJournalChecked = "true";
    const current = await logseq.Editor.getCurrentPageBlocksTree() as BlockEntity[];
    const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
    if (!current[0].content && !current[1]) {

        //ページタグを設定する
        const year = Number(match[1]); //2023
        const weekNumber = Number(match[2]); //27
        let weekDaysLinks: string[] = [];

        const weekStartsOn = (logseq.settings?.weekNumberFormat === "US format") ? 0 : 1;
        const ISO = (logseq.settings?.weekNumberFormat === "ISO(EU) format") ? true : false;

        //その週の日付リンクを作成
        const weekStart: Date = getWeekStartFromWeekNumber(year, weekNumber, weekStartsOn, ISO);
        const weekEnd: Date = addDays(weekStart, 6);
        //曜日リンク
        const weekDays: Date[] = eachDayOfInterval({ start: weekStart, end: weekEnd });
        const weekDaysLinkArray: string[] = weekDays.map((weekDay) => format(weekDay, preferredDateFormat) as string);
        const weekdayArray: string[] = weekDays.map((weekDay) => new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish || "default"), { weekday: logseq.settings?.longOrShort || "long" }).format(weekDay) as string);

        //weekStartの前日から週番号を求める(前の週番号を求める)
        const prevWeekStart: Date = (ISO === true)
            ? subWeeks(weekStart, 1)
            : subDays(weekStart, 1);
        const prevWeekNumber: number = (ISO === true)
            ? getISOWeek(prevWeekStart)
            : getWeek(prevWeekStart, { weekStartsOn });

        //次の週番号を求める
        const nextWeekStart: Date = (ISO === true)
            ? addWeeks(weekStart, 1)
            : addDays(weekEnd, 1);
        const nextWeekNumber: number = (ISO === true)
            ? getISOWeek(nextWeekStart)
            : getWeek(nextWeekStart, { weekStartsOn });

        //年
        const printPrevYear = (ISO === true)
            ? getISOWeekYear(prevWeekStart)
            : getWeekYear(prevWeekStart, { weekStartsOn });
        weekDaysLinks.unshift(`${printPrevYear}-W${(prevWeekNumber < 10)
            ? String("0" + prevWeekNumber)
            : String(prevWeekNumber)}`);
        weekDaysLinks.unshift(String(year));

        //weekDaysLinksの週番号を追加
        const printNextYear = (ISO === true)
            ? getISOWeekYear(nextWeekStart)
            : getWeekYear(nextWeekStart, { weekStartsOn });
        weekDaysLinks.push(`${printNextYear}-W${(nextWeekNumber < 10)
            ? String("0" + nextWeekNumber)
            : String(nextWeekNumber)}`);

        if (preferredDateFormat === "yyyy-MM-dd" || preferredDateFormat === "yyyy/MM/dd") {
            //weekStartをもとに年と月を求め、リンクをつくる
            const printYear = format(weekStart, "yyyy");
            const printMonth = format(weekStart, "MM");
            const printMonthLink = (preferredDateFormat === "yyyy-MM-dd") ? `${printYear}-${printMonth}` : `${printYear}/${printMonth}`;
            weekDaysLinks.unshift(printMonthLink);
            //weekEndをもとに年と月を求め、リンクをつくる
            const printYear2 = format(weekEnd, "yyyy");
            const printMonth2 = format(weekEnd, "MM");
            const printMonthLink2 = (preferredDateFormat === "yyyy-MM-dd") ? `${printYear2}-${printMonth2}` : `${printYear2}/${printMonth2}`;
            if (printMonthLink !== printMonthLink2) weekDaysLinks.push(printMonthLink2);
        }
        //ユーザー設定のページタグを追加
        if (logseq.settings!.weeklyJournalSetPageTag !== "") weekDaysLinks.push(logseq.settings!.weeklyJournalSetPageTag);

        //テンプレートを挿入

        const block = await logseq.Editor.insertBlock(current[0].uuid, "", { sibling: true }) as BlockEntity;
        if (block) {
            const newBlank = await logseq.Editor.insertBlock(block.uuid, "", { sibling: true, before: false }) as BlockEntity;
            const newBlank2 = await logseq.Editor.insertBlock(block.uuid, "", { sibling: true, before: false }) as BlockEntity;
            if (newBlank) {
                if (logseq.settings!.booleanWeeklyJournalThisWeek === true) {
                    //曜日リンク (This Week section)
                    const thisWeek = await logseq.Editor.insertBlock(newBlank.uuid, "#### This Week", { sibling: true, before: false }) as BlockEntity;
                    if (thisWeek) {
                        if (!preferredDateFormat.includes("E")) weekDaysLinkArray.forEach(async (weekDayName, index) => {
                            await logseq.Editor.insertBlock(
                                thisWeek.uuid,
                                `${logseq.settings!.booleanWeeklyJournalThisWeekWeekday === true ?
                                    (logseq.settings!.booleanWeeklyJournalThisWeekLinkWeekday === true ?
                                        `[[${weekdayArray[index]}]] ` : weekdayArray[index])
                                    : ""} [[${weekDayName}]]\n`);
                        });
                    }
                }
                if (newBlank2) {
                    await logseq.Editor.insertBlock(newBlank2.uuid, "", { sibling: true, before: false });
                    await logseq.Editor.insertBlock(newBlank2.uuid, "", { sibling: true, before: false });
                    await weeklyJournalInsertTemplate(newBlank2.uuid, logseq.settings!.weeklyJournalTemplateName);//テンプレート挿入
                    await logseq.Editor.insertBlock(newBlank2.uuid, "", { sibling: true, before: false });
                }
            }



        }
        //ページタグとして挿入する処理
        await logseq.Editor.upsertBlockProperty(current[0].uuid, "tags", weekDaysLinks);
        await logseq.Editor.editBlock(current[0].uuid);
        setTimeout(() => logseq.Editor.insertAtEditingCursor(","), 200);
    }
}


function getWeekStartFromWeekNumber(year: number, weekNumber: number, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined, ISO: boolean): Date {
    let weekStart: Date;
    if (ISO === true) {
        const includeDay = new Date(year, 0, 4, 0, 0, 0, 0); //1/4を含む週
        const firstDayOfWeek = startOfISOWeek(includeDay);
        weekStart = (getISOWeekYear(firstDayOfWeek) === year)
            ? addDays(firstDayOfWeek, (weekNumber - 1) * 7)
            : addWeeks(firstDayOfWeek, weekNumber);
    } else {
        const firstDay = new Date(year, 0, 1, 0, 0, 0, 0);
        const firstDayOfWeek = startOfWeek(firstDay, { weekStartsOn });
        weekStart = addDays(firstDayOfWeek, (weekNumber - 1) * 7);
    }
    return weekStart;
}


async function weeklyJournalInsertTemplate(uuid: string, templateName: string): Promise<void> {
    if (templateName !== "") {
        const exist = await logseq.App.existTemplate(templateName) as boolean;
        if (exist) {
            await logseq.App.insertTemplate(uuid, templateName);
        } else {
            logseq.UI.showMsg(`Template "${templateName}" does not exist.`, 'warning', { timeout: 2000 });
        }
    }
    logseq.UI.showMsg('Weekly journal created', 'success', { timeout: 2000 });
}
