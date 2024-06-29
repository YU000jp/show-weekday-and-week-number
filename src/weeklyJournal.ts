import { AppUserConfigs, BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { getISOWeek, getWeek, format, addDays, getISOWeekYear, getWeekYear, startOfWeek, eachDayOfInterval, startOfISOWeek, subDays, addWeeks, subWeeks, } from 'date-fns'//https://date-fns.org/
import { boundariesProcess } from './boundaries'
import { t } from 'logseq-l10n'
import { getQuarter, openPageFromPageName } from './lib'
let processingFoundBoundaries: boolean = false
let processingWeeklyJournal: boolean = false

export const currentPageIsWeeklyJournal = async (titleElement: HTMLElement, match: RegExpMatchArray) => {
    //yyyy-Wwwのページを開いた状態

    const year = Number(match[1]) //2023
    const weekNumber = Number(match[2]) //27
    const ISO = (logseq.settings?.weekNumberFormat === "ISO(EU) format") ? true : false
    const weekStartsOn = (logseq.settings?.weekNumberFormat === "US format") ? 0 : 1

    //Journal Boundariesを表示する
    if (logseq.settings!.booleanBoundariesOnWeeklyJournal === true
        && !parent.document.getElementById("weekBoundaries")
        && processingFoundBoundaries !== true) {
        processingFoundBoundaries = true
        setTimeout(() => {
            //週番号から週始まりの日付を求める
            const weeklyJournalStartOfWeek: Date = getWeekStartFromWeekNumber(year, weekNumber, weekStartsOn, ISO)
            if (!parent.document.getElementById("weekBoundaries"))
                boundariesProcess("weeklyJournal", false, 0, weeklyJournalStartOfWeek)
            processingFoundBoundaries = false
        }, 200)
    }

    //プロセスロック
    if (processingWeeklyJournal === true
        || (titleElement.dataset!.WeeklyJournalChecked as string) === "true")
        return//一度だけ処理を行う


    //その週の日付リンクを作成
    const weekStart: Date = getWeekStartFromWeekNumber(year, weekNumber, weekStartsOn, ISO)
    const weekEnd: Date = addDays(weekStart, 6)

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


    weeklyJournalCreateNav(ISO, prevWeekStart, weekStartsOn, prevWeekNumber, nextWeekStart, nextWeekNumber)


    const currentBlockTree = await logseq.Editor.getPageBlocksTree(match[0]) as { uuid: BlockEntity["uuid"], content: BlockEntity["content"] }[]//現在開いているページ

    let firstUuid = "" //1行目のuuidを決める
    if (currentBlockTree) {
        //コンテンツがある場合は処理を中断する
        //block.contentが空ではないブロックがひとつでもあったら処理を中断する
        if (currentBlockTree.find((block) => block.content !== null)) return

        processingWeeklyJournal = true//処理中フラグを立てる ここからreturnする場合は必ずfalseにすること
        titleElement.dataset.WeeklyJournalChecked = "true"

        //currentBlockTree[0]!.uuidが存在しなかったら処理を中断する
        if (currentBlockTree[0]
            && currentBlockTree[0].uuid)
            firstUuid = currentBlockTree[0].uuid
        else {
            //ページを作成する
            const prepend = await logseq.Editor.prependBlockInPage(match[0], "", {}) as { uuid: BlockEntity["uuid"] } | null //先頭に空のブロックを追加する
            if (prepend)
                firstUuid = prepend.uuid //uuidを取得する
            else {
                console.log("weeklyJournal.ts: prepend is null")
                processingWeeklyJournal = false
                return
            }
        }
        await weeklyJournalCreateContent(
            // year,
            // weekNumber,
            weekStart,
            weekEnd,
            ISO,
            (await logseq.Editor.insertBlock(firstUuid, "", { isPageBlock: true, sibling: true, before: true }) as BlockEntity))
        processingWeeklyJournal = false
    }
}// end of currentPageIsWeeklyJournal



const weeklyJournalCreateContent = async (
    // year: number,
    // weekNumber: number,
    weekStart: Date,
    weekEnd: Date,
    ISO: boolean,
    firstBlock: BlockEntity,
) => {

    let weekDaysLinks: string[] = []

    //ページタグの設定
    //weekStartをもとに年と月を求め、リンクをつくる
    //変更: 日付フォーマットを限定しない
    const printMonthLink = format(weekStart, "yyyy/MM,")

    //weekEndをもとに年と月を求め、リンクをつくる
    const printMonthLink2 = format(weekEnd, "yyyy/MM,")
    if (printMonthLink !== printMonthLink2)
        weekDaysLinks.unshift(printMonthLink2)
    weekDaysLinks.unshift(printMonthLink)

    //ユーザー設定のページタグを追加
    if (logseq.settings!.weeklyJournalSetPageTag !== "")
        weekDaysLinks.push((logseq.settings!.weeklyJournalSetPageTag) as string)
    //ページタグとして挿入する処理
    await logseq.Editor.upsertBlockProperty(firstBlock.uuid, "tags", weekDaysLinks)
    await logseq.Editor.editBlock(firstBlock.uuid)
    setTimeout(() => {
        logseq.Editor.insertAtEditingCursor(",") //カーソルの位置にカンマを挿入する(ページタグ更新対策)
        setTimeout(() => createPageContent(firstBlock, weekStart, weekEnd), 100)
        if (weekDaysLinks.length === 0)
            setTimeout(() => logseq.Editor.removeBlockProperty(firstBlock.uuid, "tags"), 200)
    }, 200)
}


const getWeekStartFromWeekNumber = (year: number, weekNumber: number, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined, ISO: boolean): Date => {
    let weekStart: Date
    if (ISO === true) {
        const firstDayOfWeek = startOfISOWeek(new Date(year, 0, 4, 0, 0, 0, 0))//1/4を含む週
        weekStart = (getISOWeekYear(firstDayOfWeek) === year)
            ? addDays(firstDayOfWeek, (weekNumber - 1) * 7)
            : addWeeks(firstDayOfWeek, weekNumber)
    } else
        weekStart = addDays(startOfWeek(new Date(year, 0, 1, 0, 0, 0, 0), { weekStartsOn }), (weekNumber - 1) * 7)
    return weekStart
}


const weeklyJournalInsertTemplate = async (uuid: string, templateName: string) => {
    if (templateName === "") return
    if (await logseq.App.existTemplate(templateName) as boolean) {
        await logseq.App.insertTemplate(uuid, templateName)
        logseq.UI.showMsg(t("Weekly journal created"), 'success', { timeout: 2000 })
    } else
        logseq.UI.showMsg(`Template "${templateName}" does not exist.`, 'warning', { timeout: 2000 })
}


const createPageContent = async (firstBlock: BlockEntity, weekStart: Date, weekEnd: Date) => {

    const bottomBlank = await logseq.Editor.insertBlock(firstBlock.uuid, "", { sibling: true, before: false }) as BlockEntity //一番下の空白行
    if (bottomBlank)
        //曜日リンク (This Week section)
        if (logseq.settings!.booleanWeeklyJournalThisWeek === true) {
            //曜日リンク
            const weekDays: Date[] = eachDayOfInterval({ start: weekStart, end: weekEnd })
            const { preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: AppUserConfigs["preferredDateFormat"] }
            const weekDaysLinkArray: string[] = weekDays.map((day) => format(day, preferredDateFormat) as string)
            await insertBlockThisWeekSection(bottomBlank.uuid, weekDaysLinkArray) //一番下の空白行へ挿入
        }

    if (logseq.settings!.booleanWeeklyJournalHeadline === true
        && logseq.settings!.weeklyJournalHeadlineProperty !== "")
        await insertHeadlineOfEachDays(bottomBlank.uuid, weekStart, weekEnd) //一番下の空白行へ挿入

    const secondBottomBlank = await logseq.Editor.insertBlock(firstBlock.uuid, "", { sibling: true, before: false }) as BlockEntity //下から二番目の空白行
    if (secondBottomBlank) { //下から二番目の空白行へ挿入
        await logseq.Editor.insertBlock(secondBottomBlank.uuid, "", { sibling: true, before: false }) //空白行を作成
        if (logseq.settings!.weeklyJournalTemplateName) {
            await weeklyJournalInsertTemplate(secondBottomBlank.uuid, logseq.settings!.weeklyJournalTemplateName as string) //テンプレート挿入
            await logseq.Editor.insertBlock(secondBottomBlank.uuid, "", { sibling: true, before: false }) //空白行を作成
        }
    }
}


const insertHeadlineOfEachDays = async (uuid: string, weekStart: Date, weekEnd: Date) => {
    await logseq.Editor.insertBlock(uuid, `
#+BEGIN_QUERY
{:title [:h4 "${t("Headline")}"]
 :query [:find (pull ?b [{:block/page
     [:block/name :block/journal-day]} :block/properties])
      :where
      [?b :block/properties ?bProps]
      [(get ?bProps :${logseq.settings!.weeklyJournalHeadlineProperty as string} "nil") ?bs]
      [(not= ?bs "nil")]
      [?b :block/page ?p]
      [?p :block/journal-day ?jd]
     [(>= ?jd ${format(weekStart, "yyyyMMdd")})]
     [(<= ?jd ${format(weekEnd, "yyyyMMdd")})]]
:result-transform (fn [result]
                     (sort-by (fn [s]
                        (get-in s [:block/page :block/journal-day])) (fn [a b] (compare b a)) result)) 
:table-view? true
}
#+END_QUERY
    `
        , { sibling: true, before: false })
}

const insertBlockThisWeekSection = async (uuid: string, weekDaysLinkArray: string[]) => {
    const thisWeek = await logseq.Editor.insertBlock(uuid,
        `#### ${t("This Week")}${logseq.settings!.thisWeekPopup === true ? " #.ThisWeek" : ""}`,
        { sibling: true, before: false }
    ) as { uuid: BlockEntity["uuid"] } | null

    if (thisWeek)
        for (const eachJournal of weekDaysLinkArray)
            await logseq.Editor.insertBlock(thisWeek.uuid, `[[${eachJournal}]]\n`)

}


// "<-2024/Q2/W19 2024/Q2/W21->" のように週番号のナビゲーションを作成する
const weeklyJournalCreateNav = (
    ISO: boolean,
    prevWeekStart: Date,
    weekStartsOn: 0 | 1,
    prevWeekNumber: number,
    nextWeekStart: Date,
    nextWeekNumber: number
) => {

    let weekDaysNavLinks: string[] = []


    // parent.document div.page.relativeの中の先頭に挿入する
    const pageRelative = parent.document.querySelector("div.page.relative") as HTMLDivElement
    if (!pageRelative
        || pageRelative.dataset.weeklyJournalNav === "true") return

    //ひとつ前の週番号
    if (logseq.settings!.weekNumberOptions === "YYYY-Www") {
        weekDaysNavLinks.unshift(`${(ISO === true)
            ? getISOWeekYear(prevWeekStart)
            : getWeekYear(prevWeekStart, { weekStartsOn })}-W${(prevWeekNumber < 10)
                ? String("0" + prevWeekNumber)
                : String(prevWeekNumber)}`)

        //ひとつ次の週番号
        weekDaysNavLinks.push(`${(ISO === true)
            ? getISOWeekYear(nextWeekStart)
            : getWeekYear(nextWeekStart, { weekStartsOn })}-W${(nextWeekNumber < 10)
                ? String("0" + nextWeekNumber)
                : String(nextWeekNumber)}`)
    }

    if (logseq.settings!.weekNumberOptions === "YYYY/Www") {
        //ひとつ前の週番号
        weekDaysNavLinks.unshift(`${(ISO === true)
            ? getISOWeekYear(prevWeekStart)
            : getWeekYear(prevWeekStart, { weekStartsOn })}/W${(prevWeekNumber < 10)
                ? String("0" + prevWeekNumber)
                : String(prevWeekNumber)}`)
        //ひとつ次の週番号
        weekDaysNavLinks.push(`${(ISO === true)
            ? getISOWeekYear(nextWeekStart)
            : getWeekYear(nextWeekStart, { weekStartsOn })}/W${(nextWeekNumber < 10)
                ? String("0" + nextWeekNumber)
                : String(nextWeekNumber)}`)
    }

    if (logseq.settings!.weekNumberOptions === "YYYY/qqq/Www") {
        //ひとつ前の週番号
        weekDaysNavLinks.unshift(`${(ISO === true)
            ? getISOWeekYear(prevWeekStart)
            : getWeekYear(prevWeekStart, { weekStartsOn })}/Q${getQuarter(prevWeekNumber)}/W${(prevWeekNumber < 10)
                ? String("0" + prevWeekNumber)
                : String(prevWeekNumber)}`)
        //ひとつ次の週番号
        weekDaysNavLinks.push(`${(ISO === true)
            ? getISOWeekYear(nextWeekStart)
            : getWeekYear(nextWeekStart, { weekStartsOn })}/Q${getQuarter(nextWeekNumber)}/W${(nextWeekNumber < 10)
                ? String("0" + nextWeekNumber)
                : String(nextWeekNumber)}`)
    }

    if (pageRelative) {
        const navElement = document.createElement("div")
        navElement.id = "weekNav"
        //span "<-"
        const prevWeek = document.createElement("span")
        prevWeek.textContent = "<-"
        prevWeek.style.marginRight = "1.0em"
        navElement.appendChild(prevWeek)

        // weekDaysNavLinksのページタグをリンクに変換する
        weekDaysNavLinks.forEach((eachJournal) => {
            const navLink = document.createElement("a")
            navLink.textContent = eachJournal
            navLink.style.marginRight = "1.0em"
            navLink.addEventListener("click", ({ shiftKey }) => openPageFromPageName(eachJournal, shiftKey))
            navElement.appendChild(navLink)
        })
        //span "->"
        const nextWeek = document.createElement("span")
        nextWeek.textContent = "->"
        navElement.appendChild(nextWeek)
        pageRelative.dataset.weeklyJournalNav = "true"
        pageRelative.insertBefore(navElement, pageRelative.firstChild)
    }
}