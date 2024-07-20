import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { startOfMonth } from 'date-fns' //https://date-fns.org/
import { t } from 'logseq-l10n'
import { journalInsertTemplate } from './monthlyJournal'
import { callMiniCalendar } from './weeklyJournal'
import { quarterlyJournalCreateNav } from './nav'

let processingQuarterlyJournal: boolean = false

export const currentPageIsQuarterlyJournal = async (titleElement: HTMLElement, match: RegExpMatchArray) => {
      //yyyy-Wwwのページを開いた状態
      const year = Number(match[1]) //2023
      const quarterly = Number(match[2]) //Q1
      const month = quarterly * 3 - 2 //1月

      const monthStartDay = startOfMonth(new Date(year, month - 1, 1)) //月初の日付

      //Journal Boundariesを表示する
      callMiniCalendar(monthStartDay)

      //プロセスロック
      if (processingQuarterlyJournal === true
            || (titleElement.dataset!.quarterlyJournalChecked as string) === year + "/" + month)
            return//一度だけ処理を行う

      processingQuarterlyJournal = true//処理中フラグを立てる ここからreturnする場合は必ずfalseにすること
      titleElement.dataset.quarterlyJournalChecked = year + "/" + month
      setTimeout(() => processingQuarterlyJournal = false, 1000)//1秒後に強制解除する


      setTimeout(async () => {
            // ナビゲーションを作成する
            const boolean = await quarterlyJournalCreateNav(year, quarterly)
            if (boolean === false)
                  setTimeout(async () =>
                        await quarterlyJournalCreateNav(year, quarterly) //再度実行
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
                        console.log("quarterlyJournal.ts: prepend is null")
                        return
                  }
            }
            if (logseq.settings!.quarterlyJournalSetPageTag === ""
                  && logseq.settings!.quarterlyJournalTemplateName === "") {
                  console.log("quarterlyJournal.ts: quarterlyJournalSetPageTag and quarterlyJournalTemplateName are empty")
            } else {
                  const newBlockEntity = await logseq.Editor.insertBlock(firstUuid, "", { isPageBlock: true, sibling: true, before: true }) as { uuid: BlockEntity["uuid"] } | null
                  if (newBlockEntity)
                        setTimeout(async () =>
                              await quarterlyJournalCreateContent(newBlockEntity)
                              , 100)
            }
      }
}// end of currentPageIsQuarterlyJournal


// Quarterly Journalのみタグを追加する処理が必要。
const quarterlyJournalCreateContent = async (
      firstBlock: { uuid: BlockEntity["uuid"] },
) => {

      let weekDaysLinks: string[] = []

      //ユーザー設定のページタグを追加
      if (logseq.settings!.quarterlyJournalSetPageTag !== "")
            weekDaysLinks.push(logseq.settings!.quarterlyJournalSetPageTag as string)

      if (weekDaysLinks.length >= 1) {
            //ページタグとして挿入する処理
            await logseq.Editor.upsertBlockProperty(firstBlock.uuid, "tags", weekDaysLinks)
            await logseq.Editor.editBlock(firstBlock.uuid)
            setTimeout(() => {
                  logseq.Editor.insertAtEditingCursor(",") //カーソルの位置にカンマを挿入する(ページタグ更新対策)
                  if (logseq.settings!.quarterlyJournalTemplateName !== "")
                        setTimeout(async () =>
                              await journalInsertTemplate(firstBlock.uuid, logseq.settings!.quarterlyJournalTemplateName as string, t("Quarterly journal created"))
                              , 100)
                  if (weekDaysLinks.length === 0)
                        setTimeout(() => logseq.Editor.removeBlockProperty(firstBlock.uuid, "tags"), 200)
            }, 200)
      }
}