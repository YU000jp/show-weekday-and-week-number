import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { startOfYear } from 'date-fns' //https://date-fns.org/
import { t } from 'logseq-l10n'
import { journalInsertTemplate } from './monthlyJournal'
import { callMiniCalendar } from './weeklyJournal'
import { yearlyJournalCreateNav } from './nav'
let processingYearlyJournal: boolean = false

export const currentPageIsYearlyJournal = async (titleElement: HTMLElement, match: RegExpMatchArray) => {
      const year = Number(match[1]) //2023 

      //プロセスロック
      if (processingYearlyJournal === true
            || (titleElement.dataset!.yearlyJournalChecked as string) === year.toString())
            return//一度だけ処理を行う

      processingYearlyJournal = true//処理中フラグを立てる ここからreturnする場合は必ずfalseにすること
      titleElement.dataset.yearlyJournalChecked = year.toString() //処理済みフラグを立てる
      setTimeout(() => processingYearlyJournal = false, 1000)//1秒後に強制解除する


      const monthStartDay = startOfYear(new Date(year, 0, 1)) //月初の日付

      //Journal Boundariesを表示する
      callMiniCalendar(monthStartDay)


      setTimeout(async () => {
            // ナビゲーションを作成する
            const boolean = await yearlyJournalCreateNav(year)
            if (boolean === false)
                  setTimeout(async () =>
                        await yearlyJournalCreateNav(year) //再度実行
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
                        console.log("yearlyJournal.ts: prepend is null")
                        processingYearlyJournal = false
                        return
                  }
            }
            if (logseq.settings!.yearlyJournalTemplateName !== "") {
                  const newBlockEntity = await logseq.Editor.insertBlock(firstUuid, "", { isPageBlock: true, sibling: true, before: true }) as { uuid: BlockEntity["uuid"] }
                  if (newBlockEntity)
                        setTimeout(async () =>
                              await journalInsertTemplate(newBlockEntity.uuid, logseq.settings!.yearlyJournalTemplateName as string, t("Yearly journal created"))
                              , 100)
            }
      }
      processingYearlyJournal = false
}// end of currentPageIsYearlyJournal
