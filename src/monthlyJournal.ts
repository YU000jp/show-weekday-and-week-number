import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { addMonths, startOfMonth, subMonths } from 'date-fns'; //https://date-fns.org/
import { t } from 'logseq-l10n'
import { boundariesProcess } from './boundaries'
import { monthlyJournalCreateNav } from './nav'
let processingFoundBoundaries: boolean = false
let processingMonthlyJournal: boolean = false

export const currentPageIsMonthlyJournal = async (titleElement: HTMLElement, match: RegExpMatchArray) => {
      //yyyy-Wwwのページを開いた状態
      const year = Number(match[1]) //2023
      const month = Number(match[2]) //01
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
      if (processingMonthlyJournal === true
            || (titleElement.dataset!.monthlyJournalChecked as string) === year + "/" + month)
            return//一度だけ処理を行う

      // ナビゲーションを作成する
      monthlyJournalCreateNav(
            subMonths(monthStartDay, 1),
            monthStartDay,
            addMonths(monthStartDay, 1),
            year
      )

      const currentBlockTree = await logseq.Editor.getPageBlocksTree(match[0]) as BlockEntity[]//現在開いているページ

      let firstUuid = "" //1行目のuuidを決める
      if (currentBlockTree) {
            //コンテンツがある場合は処理を中断する
            //block.contentが空ではないブロックがひとつでもあったら処理を中断する
            if (currentBlockTree.find((block) => block.content !== null)) return

            processingMonthlyJournal = true//処理中フラグを立てる ここからreturnする場合は必ずfalseにすること
            titleElement.dataset.monthlyJournalChecked = year + "/" + month

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
                        console.log("monthlyJournal.ts: prepend is null")
                        processingMonthlyJournal = false
                        return
                  }
            }
            await monthlyJournalCreateContent(
                  (await logseq.Editor.insertBlock(firstUuid, "", { isPageBlock: true, sibling: true, before: true }) as { uuid: BlockEntity["uuid"] }))
            processingMonthlyJournal = false
      }
}// end of currentPageIsMonthlyJournal



const monthlyJournalCreateContent = async (firstBlock: { uuid: BlockEntity["uuid"] },) => {
      let weekDaysLinks: string[] = []

      //ユーザー設定のページタグを追加
      if (logseq.settings!.monthlyJournalSetPageTag)
            weekDaysLinks.push((logseq.settings!.monthlyJournalSetPageTag) as string)

      if (weekDaysLinks.length >= 1) {
            //ページタグとして挿入する処理
            await logseq.Editor.upsertBlockProperty(firstBlock.uuid, "tags", weekDaysLinks)
            await logseq.Editor.editBlock(firstBlock.uuid)
            setTimeout(() => {
                  logseq.Editor.insertAtEditingCursor(",") //カーソルの位置にカンマを挿入する(ページタグ更新対策)
                  setTimeout(async () => {
                        if (logseq.settings!.monthlyJournalTemplateName)
                              await monthlyJournalInsertTemplate(firstBlock.uuid, logseq.settings!.monthlyJournalTemplateName as string)
                  }, 100)
                  if (weekDaysLinks.length === 0)
                        setTimeout(() => logseq.Editor.removeBlockProperty(firstBlock.uuid, "tags"), 200)
            }, 200)
      }
}


const monthlyJournalInsertTemplate = async (uuid: string, templateName: string) => {
      if (templateName === "") return
      if (await logseq.App.existTemplate(templateName) as boolean) {
            await logseq.App.insertTemplate(uuid, templateName)
            logseq.UI.showMsg(t("Monthly journal created"), 'success', { timeout: 2000 })
      } else
            logseq.UI.showMsg(`Template "${templateName}" does not exist.`, 'warning', { timeout: 2000 })
}
