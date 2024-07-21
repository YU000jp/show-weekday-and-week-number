import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { startOfMonth } from 'date-fns' //https://date-fns.org/
import { t } from 'logseq-l10n'
import { refreshCalendar } from './left-calendar'
import { monthlyJournalCreateNav } from './nav'
import { callMiniCalendar } from './weeklyJournal'
export let processingFoundBoundaries: boolean = false
let processingMonthlyJournal: boolean = false

export const currentPageIsMonthlyJournal = async (titleElement: HTMLElement, match: RegExpMatchArray) => {

      //yyyy-Wwwのページを開いた状態
      const year = Number(match[1]) //2023
      const month = Number(match[2]) //01     

      //プロセスロック
      if (processingMonthlyJournal === true
            || (titleElement.dataset!.monthlyJournalChecked as string) === year + "/" + month)
            return//一度だけ処理を行う

      processingMonthlyJournal = true//処理中フラグを立てる ここからreturnする場合は必ずfalseにすること
      titleElement.dataset.monthlyJournalChecked = year + "/" + month
      setTimeout(() => processingMonthlyJournal = false, 1000)//1秒後に強制解除する

      const monthStartDay = startOfMonth(new Date(year, month - 1, 1)) //月初の日付

      //Journal Boundariesを表示する
      callMiniCalendar(logseq.settings!.booleanBoundariesOnMonthlyJournal as boolean, monthStartDay)

      //Left Calendarの更新
      refreshCalendar(monthStartDay, false, false)

      if (logseq.settings!.booleanMonthlyJournal === false) return
      

      setTimeout(async () => {
            // ナビゲーションを作成する
            const boolean = await monthlyJournalCreateNav(monthStartDay, year)
            if (boolean === false)
                  setTimeout(async () =>
                        await monthlyJournalCreateNav(monthStartDay, year)                  //再度実行
                        , 1200)
      }, 250)

      const currentBlockTree = await logseq.Editor.getPageBlocksTree(match[0]) as BlockEntity[]//現在開いているページ

      let firstUuid = "" //1行目のuuidを決める
      if (currentBlockTree) {
            //コンテンツがある場合は処理を中断する
            //block.contentが空ではないブロックがひとつでもあったら処理を中断する
            if (currentBlockTree.find((block) => block.content !== null)) return


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
                        return
                  }
            }

            if (logseq.settings!.monthlyJournalTemplateName !== "") {
                  const newBlockEntity = await logseq.Editor.insertBlock(firstUuid, "", { isPageBlock: true, sibling: true, before: true }) as { uuid: BlockEntity["uuid"] }
                  if (newBlockEntity)
                        await journalInsertTemplate(newBlockEntity.uuid, logseq.settings!.monthlyJournalTemplateName as string, t("Monthly journal created"))
            }
      }
}// end of currentPageIsMonthlyJournal


export const journalInsertTemplate = async (uuid: string, templateName: string, successMsg: string) => {
      if (templateName === "") return
      if (await logseq.App.existTemplate(templateName) as boolean) {
            await logseq.App.insertTemplate(uuid, templateName)
            if (successMsg !== "")
                  logseq.UI.showMsg(successMsg, 'success', { timeout: 2000 })
      } else
            logseq.UI.showMsg(`Template "${templateName}" does not exist.`, 'warning', { timeout: 2000 })
}
