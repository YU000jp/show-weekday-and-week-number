import { AppUserConfigs, BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { getISOWeek, getWeek, format, addDays, getISOWeekYear, getWeekYear, startOfWeek, eachDayOfInterval, startOfISOWeek, subDays, addWeeks, subWeeks, } from 'date-fns'//https://date-fns.org/
import { boundariesProcess } from './boundaries'
import { t } from 'logseq-l10n'
let processingFoundBoundaries: boolean = false
let processingWeeklyJournal: boolean = false

export const currentPageIsWeeklyJournal = async (titleElement: HTMLElement, match: RegExpMatchArray) => {
    //yyyy-Wwwのページを開いた状態

    //Journal Boundariesを表示する
    if (logseq.settings!.booleanBoundariesOnWeeklyJournal === true
        && !parent.document.getElementById("weekBoundaries")
        && processingFoundBoundaries !== true) {
        processingFoundBoundaries = true
        setTimeout(() => {
            //週番号から週始まりの日付を求める
            const weeklyJournalStartOfWeek: Date = getWeekStartFromWeekNumber(Number(match[1]), Number(match[2]), (logseq.settings?.weekNumberFormat === "US format") ? 0 : 1, (logseq.settings?.weekNumberFormat === "ISO(EU) format") ? true : false)
            if (!parent.document.getElementById("weekBoundaries")) boundariesProcess("weeklyJournal", false, 0, weeklyJournalStartOfWeek)
            processingFoundBoundaries = false
        }, 200)
    }


    //プロセスロック
    if (processingWeeklyJournal === true || (titleElement.dataset!.WeeklyJournalChecked as string) === "true") return//一度だけ処理を行う  
    const currentBlockTree = await logseq.Editor.getPageBlocksTree(match[0]) as BlockEntity[]//現在開いているページ

    let firstUuid = "" //1行目のuuidを決める
    if (currentBlockTree) {
        //コンテンツがある場合は処理を中断する
        //block.contentが空ではないブロックがひとつでもあったら処理を中断する
        if (currentBlockTree.find((block) => block.content !== "")) return

        processingWeeklyJournal = true//処理中フラグを立てる ここからreturnする場合は必ずfalseにすること
        titleElement.dataset.WeeklyJournalChecked = "true"

        //currentBlockTree[0]!.uuidが存在しなかったら処理を中断する
        if (currentBlockTree[0] && currentBlockTree[0].uuid) {
            firstUuid = currentBlockTree[0].uuid
        } else {
            //ページを作成する
            const prepend = await logseq.Editor.prependBlockInPage(match[0], "", {}) as BlockEntity | null //先頭に空のブロックを追加する
            if (prepend) firstUuid = prepend.uuid //uuidを取得する
            else {
                console.log("weeklyJournal.ts: prepend is null")
                processingWeeklyJournal = false
                return
            }
        }
        await weeklyJournalCreateContent(match, await logseq.Editor.insertBlock(firstUuid, "", { isPageBlock: true, sibling: true, before: true }) as BlockEntity)
        processingWeeklyJournal = false
    }
}// end of currentPageIsWeeklyJournal



const weeklyJournalCreateContent = async (match: RegExpMatchArray, firstBlock: BlockEntity) => {

    //ページタグを設定する
    const year = Number(match[1]) //2023
    const weekNumber = Number(match[2]) //27
    let weekDaysLinks: string[] = []

    const weekStartsOn = (logseq.settings?.weekNumberFormat === "US format") ? 0 : 1
    const ISO = (logseq.settings?.weekNumberFormat === "ISO(EU) format") ? true : false

    //その週の日付リンクを作成
    const weekStart: Date = getWeekStartFromWeekNumber(year, weekNumber, weekStartsOn, ISO)
    const weekEnd: Date = addDays(weekStart, 6)
    //曜日リンク
    const weekDays: Date[] = eachDayOfInterval({ start: weekStart, end: weekEnd })
    const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs
    const weekDaysLinkArray: string[] = weekDays.map((weekDay) => format(weekDay, preferredDateFormat) as string)
    const weekdayArray: string[] = weekDays.map((weekDay) => new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish || "default"), { weekday: logseq.settings?.longOrShort || "long" }).format(weekDay) as string)

    //ページタグの設定
    if (logseq.settings!.weeklyJournalPageTag === "unset") {
        //追加しない
    } else {
        //weekStartの前日から週番号を求める(前の週番号を求める)
        const prevWeekStart: Date = (ISO === true)
            ? subWeeks(weekStart, 1)
            : subDays(weekStart, 1)
        const prevWeekNumber: number = (ISO === true)
            ? getISOWeek(prevWeekStart)
            : getWeek(prevWeekStart, { weekStartsOn })

        //次の週番号を求める
        const nextWeekStart: Date = (ISO === true)
            ? addWeeks(weekStart, 1)
            : addDays(weekEnd, 1)
        const nextWeekNumber: number = (ISO === true)
            ? getISOWeek(nextWeekStart)
            : getWeek(nextWeekStart, { weekStartsOn })

        //ひとつ前の週番号をページタグに追加
        if (logseq.settings!.weeklyJournalPageTag.includes("yyyy-Ww,"))
            weekDaysLinks.unshift(`${(ISO === true)
                ? getISOWeekYear(prevWeekStart)
                : getWeekYear(prevWeekStart, { weekStartsOn })
                }-W${(prevWeekNumber < 10)
                    ? String("0" + prevWeekNumber)
                    : String(prevWeekNumber)}`)

        //ひとつ次の週番号をページタグに追加
        if (logseq.settings!.weeklyJournalPageTag.includes("yyyy-Ww,"))
            weekDaysLinks.push(`${(ISO === true)
                ? getISOWeekYear(nextWeekStart)
                : getWeekYear(nextWeekStart, { weekStartsOn })
                }-W${(nextWeekNumber < 10)
                    ? String("0" + nextWeekNumber)
                    : String(nextWeekNumber)}`)

        if (logseq.settings!.weeklyJournalPageTag.includes("yyyy/MM,")) {
            //weekStartをもとに年と月を求め、リンクをつくる
            //変更: 日付フォーマットを限定しない
            const printMonthLink = format(weekStart, "yyyy/MM")
            //weekEndをもとに年と月を求め、リンクをつくる
            const printMonthLink2 = format(weekEnd, "yyyy/MM")
            if (printMonthLink !== printMonthLink2) weekDaysLinks.unshift(printMonthLink2)
            weekDaysLinks.unshift(printMonthLink)
        }
        //年をページタグに追加
        if (logseq.settings!.weeklyJournalPageTag.includes("yyyy,")) weekDaysLinks.unshift(String(year))
    }

    //ユーザー設定のページタグを追加
    if (logseq.settings!.weeklyJournalSetPageTag !== "") weekDaysLinks.push(logseq.settings!.weeklyJournalSetPageTag)
    //ページタグとして挿入する処理
    await logseq.Editor.upsertBlockProperty(firstBlock.uuid, "tags", weekDaysLinks)
    await logseq.Editor.editBlock(firstBlock.uuid)
    setTimeout(() => {
        logseq.Editor.insertAtEditingCursor(",") //カーソルの位置にカンマを挿入する(ページタグ更新対策)
        setTimeout(() => createPageContent(firstBlock, preferredDateFormat, weekDaysLinkArray, weekdayArray), 100)
        if (weekDaysLinks.length === 0) setTimeout(() => logseq.Editor.removeBlockProperty(firstBlock.uuid, "tags"), 200)
    }, 200)
}


const getWeekStartFromWeekNumber = (year: number, weekNumber: number, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined, ISO: boolean): Date => {
    let weekStart: Date
    if (ISO === true) {
        const includeDay = new Date(year, 0, 4, 0, 0, 0, 0) //1/4を含む週
        const firstDayOfWeek = startOfISOWeek(includeDay)
        weekStart = (getISOWeekYear(firstDayOfWeek) === year)
            ? addDays(firstDayOfWeek, (weekNumber - 1) * 7)
            : addWeeks(firstDayOfWeek, weekNumber)
    } else {
        const firstDay = new Date(year, 0, 1, 0, 0, 0, 0)
        const firstDayOfWeek = startOfWeek(firstDay, { weekStartsOn })
        weekStart = addDays(firstDayOfWeek, (weekNumber - 1) * 7)
    }
    return weekStart
}


const weeklyJournalInsertTemplate = async (uuid: string, templateName: string) => {
    if (templateName === "") return
    if (await logseq.App.existTemplate(templateName) as boolean) {
        await logseq.App.insertTemplate(uuid, templateName)
        logseq.UI.showMsg(t("Weekly journal created"), 'success', { timeout: 2000 })
    } else {
        logseq.UI.showMsg(`Template "${templateName}" does not exist.`, 'warning', { timeout: 2000 })
    }
}


const createPageContent = async (firstBlock: BlockEntity, preferredDateFormat: string, weekDaysLinkArray: string[], weekdayArray: string[]) => {
    if (logseq.settings!.weeklyJournalThisWeekPosition === "bottom") { //曜日リンク (This Week section)が下にくるようにする

        const bottomBlank = await logseq.Editor.insertBlock(firstBlock.uuid, "", { sibling: true, before: false }) as BlockEntity //一番下の空白行
        if (bottomBlank) {
            //曜日リンク (This Week section)
            if (logseq.settings!.booleanWeeklyJournalThisWeek === true) await insertBlockThisWeekSection(bottomBlank.uuid, preferredDateFormat, weekDaysLinkArray, weekdayArray) //一番下の空白行へ挿入
        }
        const secondBottomBlank = await logseq.Editor.insertBlock(firstBlock.uuid, "", { sibling: true, before: false }) as BlockEntity //下から二番目の空白行
        if (secondBottomBlank) { //下から二番目の空白行へ挿入
            await logseq.Editor.insertBlock(secondBottomBlank.uuid, "", { sibling: true, before: false }) //空白行を作成
            if (logseq.settings!.weeklyJournalTemplateName) await weeklyJournalInsertTemplate(secondBottomBlank.uuid, logseq.settings!.weeklyJournalTemplateName) //テンプレート挿入
            await logseq.Editor.insertBlock(secondBottomBlank.uuid, "", { sibling: true, before: false }) //空白行を作成
        }

    } else if (logseq.settings!.weeklyJournalThisWeekPosition === "top") { //曜日リンク (This Week section)が上にくるようにする

        if (logseq.settings!.weeklyJournalTemplateName) await weeklyJournalInsertTemplate(firstBlock.uuid, logseq.settings!.weeklyJournalTemplateName) //テンプレート挿入
        setTimeout(async () => {
            await logseq.Editor.insertBlock(firstBlock.uuid, "", { sibling: true, before: false }) //空白行を作成
            //曜日リンク (This Week section)
            if (logseq.settings!.booleanWeeklyJournalThisWeek === true) await insertBlockThisWeekSection(firstBlock.uuid, preferredDateFormat, weekDaysLinkArray, weekdayArray) //上にくるようにする
        }, 50)
    }
}


const insertBlockThisWeekSection = async (uuid: string, preferredDateFormat: string, weekDaysLinkArray: string[], weekdayArray: string[]) => {
    const thisWeek = await logseq.Editor.insertBlock(uuid, `#### ${t("This Week")}`, { sibling: true, before: false }) as BlockEntity | null
    if (thisWeek) weekDaysLinkArray.forEach(async (eachJournal, index) => {
        const eachDayBlock = await logseq.Editor.insertBlock(
            thisWeek.uuid,
            `${!preferredDateFormat.includes("E") //日付フォーマットに曜日がない場合
                && logseq.settings!.booleanWeeklyJournalThisWeekWeekday === true ? // 曜日を有効にする
                (logseq.settings!.booleanWeeklyJournalThisWeekLinkWeekday === true ? // 曜日リンクを有効にする
                    `[[${weekdayArray[index]}]] ` : weekdayArray[index])
                : ""} [[${eachJournal}]]\n`)
        // 曜日ごとに、埋込を入れる
        if (eachDayBlock && logseq.settings!.booleanWeeklyJournalThisWeekEmbedding === true) {
            await logseq.Editor.insertBlock(eachDayBlock.uuid, `{{embed [[${eachJournal}]]}}`, { sibling: false, focus: false })
            await logseq.Editor.setBlockCollapsed(eachDayBlock.uuid, true)
        }
    })
}
