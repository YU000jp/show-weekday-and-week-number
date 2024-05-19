import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { format, subMonths, addMonths, startOfMonth } from 'date-fns' //https://date-fns.org/
import { boundariesProcess } from './boundaries'
import { t } from 'logseq-l10n'
import { openPageFromPageName } from './lib'
let processingFoundBoundaries: boolean = false
let processingQuarterlyJournal: boolean = false

export const currentPageIsQuarterlyJournal = async (titleElement: HTMLElement, match: RegExpMatchArray) => {
      //yyyy-Wwwのページを開いた状態
      const year = Number(match[1]) //2023
      const quarterly = Number(match[2]) //Q1
      const month = quarterly * 3 - 2 //1月

      const monthStartDay = startOfMonth(new Date(year, month - 1, 1)) //月初の日付

      //Journal Boundariesを表示する
      if (logseq.settings!.booleanBoundariesOnWeeklyJournal === true
            && !parent.document.getElementById("weekBoundaries")
            && processingFoundBoundaries !== true) {
            processingFoundBoundaries = true
            setTimeout(() => {
                  boundariesProcess("weeklyJournal", false, 0, monthStartDay)
                  processingFoundBoundaries = false
            }, 200)
      }

      //プロセスロック
      if (processingQuarterlyJournal === true
            || (titleElement.dataset!.quarterlyJournalChecked as string) === year + "/" + month)
            return//一度だけ処理を行う

      // ナビゲーションを作成する
      quarterlyJournalCreateNav(
            subMonths(monthStartDay, 3),
            addMonths(monthStartDay, 3)
      )

      const currentBlockTree = await logseq.Editor.getPageBlocksTree(match[0]) as BlockEntity[]//現在開いているページ

      let firstUuid = "" //1行目のuuidを決める
      if (currentBlockTree) {
            //コンテンツがある場合は処理を中断する
            //block.contentが空ではないブロックがひとつでもあったら処理を中断する
            if (currentBlockTree.find((block) => block.content !== null)) return

            processingQuarterlyJournal = true//処理中フラグを立てる ここからreturnする場合は必ずfalseにすること
            titleElement.dataset.quarterlyJournalChecked = year + "/" + month

            //currentBlockTree[0]!.uuidが存在しなかったら処理を中断する
            if (currentBlockTree[0] && currentBlockTree[0].uuid)
                  firstUuid = currentBlockTree[0].uuid
            else {
                  //ページを作成する
                  const prepend = await logseq.Editor.prependBlockInPage(match[0], "", {}) as { uuid: BlockEntity["uuid"] } | null //先頭に空のブロックを追加する
                  if (prepend)
                        firstUuid = prepend.uuid //uuidを取得する
                  else {
                        console.log("quarterlyJournal.ts: prepend is null")
                        processingQuarterlyJournal = false
                        return
                  }
            }
            await quarterlyJournalCreateContent(
                  (await logseq.Editor.insertBlock(firstUuid, "", { isPageBlock: true, sibling: true, before: true }) as { uuid: BlockEntity["uuid"] }))
            processingQuarterlyJournal = false
      }
}// end of currentPageIsQuarterlyJournal



const quarterlyJournalCreateContent = async (firstBlock: { uuid: BlockEntity["uuid"] },) => {
      let weekDaysLinks: string[] = []

      //ユーザー設定のページタグを追加
      if (logseq.settings!.quarterlyJournalSetPageTag)
            weekDaysLinks.push((logseq.settings!.quarterlyJournalSetPageTag) as string)

      if (weekDaysLinks.length >= 1) {
            //ページタグとして挿入する処理
            await logseq.Editor.upsertBlockProperty(firstBlock.uuid, "tags", weekDaysLinks)
            await logseq.Editor.editBlock(firstBlock.uuid)
            setTimeout(() => {
                  logseq.Editor.insertAtEditingCursor(",") //カーソルの位置にカンマを挿入する(ページタグ更新対策)
                  setTimeout(async () => {
                        if (logseq.settings!.quarterlyJournalTemplateName)
                              await quarterlyJournalInsertTemplate(firstBlock.uuid, logseq.settings!.quarterlyJournalTemplateName as string)
                  }, 100)
                  if (weekDaysLinks.length === 0)
                        setTimeout(() => logseq.Editor.removeBlockProperty(firstBlock.uuid, "tags"), 200)
            }, 200)
      }
}


const quarterlyJournalInsertTemplate = async (uuid: string, templateName: string) => {
      if (templateName === "") return
      if (await logseq.App.existTemplate(templateName) as boolean) {
            await logseq.App.insertTemplate(uuid, templateName)
            logseq.UI.showMsg(t("Quarterly journal created"), 'success', { timeout: 2000 })
      } else
            logseq.UI.showMsg(`Template "${templateName}" does not exist.`, 'warning', { timeout: 2000 })
}


// "<-2024/Q2/W19 2024/Q2/W21->" のように週番号のナビゲーションを作成する
const quarterlyJournalCreateNav = (
      prevMonth: Date,
      nextMonth: Date
) => {
      let weekDaysNavLinks: string[] = []

      // parent.document div.page.relativeの中の先頭に挿入する
      const pageRelative = parent.document.querySelector("div.page.relative") as HTMLDivElement
      if (!pageRelative || pageRelative.dataset.quarterlyJournalNav === "true") return

      //ひとつ前のyyyy/mm
      weekDaysNavLinks.push(format(prevMonth, "yyyy/qqq"))
      //ひとつ次のyyyy/mm
      weekDaysNavLinks.push(format(nextMonth, "yyyy/qqq"))

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
            pageRelative.dataset.quarterlyJournalNav = "true"

            pageRelative.insertBefore(navElement, pageRelative.firstChild)
      }
}

