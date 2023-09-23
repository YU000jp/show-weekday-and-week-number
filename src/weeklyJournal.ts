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

        //ページタグの設定
        if (logseq.settings!.WeeklyJournalPageTag === "unset") {
            //追加しない
        } else {
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

            //ひとつ前の週番号をページタグに追加
            const printPrevYear = (ISO === true)
                ? getISOWeekYear(prevWeekStart)
                : getWeekYear(prevWeekStart, { weekStartsOn });
            weekDaysLinks.unshift(`${printPrevYear}-W${(prevWeekNumber < 10)
                ? String("0" + prevWeekNumber)
                : String(prevWeekNumber)}`);

            //ひとつ次の週番号をページタグに追加
            const printNextYear = (ISO === true)
                ? getISOWeekYear(nextWeekStart)
                : getWeekYear(nextWeekStart, { weekStartsOn });
            weekDaysLinks.push(`${printNextYear}-W${(nextWeekNumber < 10)
                ? String("0" + nextWeekNumber)
                : String(nextWeekNumber)}`);

            if (logseq.settings!.weeklyJournalPageTag.includes("yyyy/MM,")) {
                //weekStartをもとに年と月を求め、リンクをつくる
                //変更: 日付フォーマットを限定しない
                const printMonthLink = format(weekStart, "yyyy/MM");
                //weekEndをもとに年と月を求め、リンクをつくる
                const printMonthLink2 = format(weekEnd, "yyyy/MM");
                if (printMonthLink !== printMonthLink2) weekDaysLinks.unshift(printMonthLink2);
                weekDaysLinks.unshift(printMonthLink);
            }
            //年をページタグに追加
            if (logseq.settings!.weeklyJournalPageTag.includes("yyyy,")) weekDaysLinks.unshift(String(year));
        }

        //ユーザー設定のページタグを追加
        if (logseq.settings!.weeklyJournalSetPageTag !== "") weekDaysLinks.push(logseq.settings!.weeklyJournalSetPageTag);
        //ページタグとして挿入する処理
        await logseq.Editor.upsertBlockProperty(current[0].uuid, "tags", weekDaysLinks);
        await logseq.Editor.editBlock(current[0].uuid);
        setTimeout(() => {
            logseq.Editor.insertAtEditingCursor(",");//カーソルの位置にカンマを挿入する(ページタグ更新対策)

            setTimeout(async () => {
                if (logseq.settings!.weeklyJournalThisWeekPosition === "bottom") {//曜日リンク (This Week section)が下にくるようにする

                    const bottomBlank = await logseq.Editor.insertBlock(current[0].uuid, "", { sibling: true, before: false }) as BlockEntity; //一番下の空白行
                    if (bottomBlank) {
                        //曜日リンク (This Week section)
                        if (logseq.settings!.booleanWeeklyJournalThisWeek === true) await insertThisWeekSection(bottomBlank.uuid, preferredDateFormat, weekDaysLinkArray, weekdayArray); //一番下の空白行へ挿入
                    }
                    const secondBottomBlank = await logseq.Editor.insertBlock(current[0].uuid, "", { sibling: true, before: false }) as BlockEntity; //下から二番目の空白行
                    if (secondBottomBlank) {//下から二番目の空白行へ挿入
                        await logseq.Editor.insertBlock(secondBottomBlank.uuid, "", { sibling: true, before: false });//空白行を作成
                        if (logseq.settings!.weeklyJournalTemplateName) await weeklyJournalInsertTemplate(secondBottomBlank.uuid, logseq.settings!.weeklyJournalTemplateName);//テンプレート挿入
                        await logseq.Editor.insertBlock(secondBottomBlank.uuid, "", { sibling: true, before: false });//空白行を作成
                    }

                } else if (logseq.settings!.weeklyJournalThisWeekPosition === "top") {//曜日リンク (This Week section)が上にくるようにする

                    if (logseq.settings!.weeklyJournalTemplateName) await weeklyJournalInsertTemplate(current[0].uuid, logseq.settings!.weeklyJournalTemplateName);//テンプレート挿入
                    setTimeout(async () => {
                        await logseq.Editor.insertBlock(current[0].uuid, "", { sibling: true, before: false });//空白行を作成
                        //曜日リンク (This Week section)
                        if (logseq.settings!.booleanWeeklyJournalThisWeek === true) await insertThisWeekSection(current[0].uuid, preferredDateFormat, weekDaysLinkArray, weekdayArray); //上にくるようにする
                    }, 50);
                }
            }, 100);

        }, 200);
    }
}


async function insertThisWeekSection(uuid: string, preferredDateFormat: string, weekDaysLinkArray: string[], weekdayArray: string[]) {
    const thisWeek = await logseq.Editor.insertBlock(uuid, "#### This Week", { sibling: true, before: false }) as BlockEntity | null;
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


async function weeklyJournalInsertTemplate(uuid: string, templateName: string) {
    if (templateName === "") return;
    if (await logseq.App.existTemplate(templateName) as boolean) {
        await logseq.App.insertTemplate(uuid, templateName);
        logseq.UI.showMsg('Weekly journal created', 'success', { timeout: 2000 });
    } else {
        logseq.UI.showMsg(`Template "${templateName}" does not exist.`, 'warning', { timeout: 2000 });
    }

}
