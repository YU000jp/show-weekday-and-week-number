import "@logseq/libs"; //https://plugins-doc.logseq.com/
import {
  AppUserConfigs,
  LSPluginBaseInfo,
  PageEntity,
} from "@logseq/libs/dist/LSPlugin.user"
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import { behindJournalTitle } from "./behind"
import { boundariesProcess } from "./boundaries"
import { getJournalDayDate, titleElementReplaceLocalizeDayOfWeek } from "./lib"
import fileMainCSS from "./main.css?inline"
import { settingsTemplate } from "./settings"
import { loadShortcutItems, } from "./shortcutItems"
import af from "./translations/af.json"
import de from "./translations/de.json"
import es from "./translations/es.json"
import fr from "./translations/fr.json"
import id from "./translations/id.json"
import it from "./translations/it.json"
import ja from "./translations/ja.json"
import ko from "./translations/ko.json"
import nbNO from "./translations/nb-NO.json"
import nl from "./translations/nl.json"
import pl from "./translations/pl.json"
import ptBR from "./translations/pt-BR.json"
import ptPT from "./translations/pt-PT.json"
import ru from "./translations/ru.json"
import sk from "./translations/sk.json"
import tr from "./translations/tr.json"
import uk from "./translations/uk.json"
import zhCN from "./translations/zh-CN.json"
import zhHant from "./translations/zh-Hant.json"
import { currentPageIsWeeklyJournal } from "./weeklyJournal"

/* main */
const main = async () => {
  await l10nSetup({
    builtinTranslations: {//Full translations
      ja, af, de, es, fr, id, it, ko, "nb-NO": nbNO, nl, pl, "pt-BR": ptBR, "pt-PT": ptPT, ru, sk, tr, uk, "zh-CN": zhCN, "zh-Hant": zhHant
    }
  })

  // メッセージを表示する
  if (logseq.settings && logseq.settings!.notice !== "20231024no01") {
    logseq.UI.showMsg("Show Weekday and Week-number plugin\n\nUpdated\n\nAdd Feature\n\"Embedding for Weekly Journal\"", "info", { timeout: 4000 });
    logseq.updateSettings({ notice: "20231024no01" });
  }

  // 初回起動時に設定を促す
  if (logseq.settings?.weekNumberFormat === undefined) {
    logseq.UI.showMsg("Select either US format or ISO format", "info", { timeout: 3000 })
    setTimeout(() => logseq.showSettingsUI(), 300)
  }

  logseq.useSettingsSchema(settingsTemplate())


  logseq.provideStyle({ key: "main", style: fileMainCSS })

  //Logseqを開いたときに実行
  setTimeout(() => {
    if (logseq.settings!.booleanJournalsBoundaries === true)
      boundaries("journals")
    querySelectorAllTitle()
  }, 200)
  setTimeout(() => observerMain(), 2000) //スクロール用


  logseq.App.onRouteChanged(({ template }) => {
    if (
      logseq.settings?.booleanBoundaries === true &&
      template === "/page/:name"
    ) {
      //page only
      //div.is-journals
      setTimeout(() => boundaries("is-journals"), 20)
    } else if (
      logseq.settings!.booleanJournalsBoundaries === true &&
      template === "/"
    ) {
      //journals only
      //div#journals
      setTimeout(() => boundaries("journals"), 20)
    }
    setTimeout(() => querySelectorAllTitle(), 50)
  })

  //日付更新時に実行(Journal boundariesのセレクト更新のため)
  logseq.App.onTodayJournalCreated(async () => {
    if (logseq.settings?.booleanBoundaries === true) {
      const weekBoundaries = parent.document.getElementById(
        "weekBoundaries"
      ) as HTMLDivElement | null
      if (weekBoundaries) weekBoundaries.remove()
      if (
        ((await logseq.Editor.getCurrentPage()) as PageEntity | null) !== null
      ) {
        //page only
        //div.is-journals
        setTimeout(() => boundaries("is-journals"), 10)
      } else {
        //journals only
        //div#journals
        setTimeout(() => boundaries("journals"), 10)
      }
    }
  })

  logseq.App.onSidebarVisibleChanged(({ visible }) => {
    if (visible === true) setTimeout(() => querySelectorAllTitle(), 100)
  })

  onSettingsChanged()

  logseq.beforeunload(async () => {
    removeTitleQuery()
    removeBoundaries()
    observer.disconnect()
  })

  loadShortcutItems()

} /* end_main */



const onSettingsChanged = () => logseq.onSettingsChanged((newSet: LSPluginBaseInfo["settings"], oldSet: LSPluginBaseInfo["settings"]) => {

  if ((oldSet.booleanBoundaries === true && newSet.booleanBoundaries === false)
    || (oldSet.booleanJournalsBoundaries === true && newSet.booleanJournalsBoundaries === false && parent.document.getElementById("journals") as HTMLDivElement)
  ) removeBoundaries() //boundariesを削除する
  else
    if (oldSet.booleanBoundaries === false && newSet.booleanBoundaries === true) SettingsChangedJournalBoundariesEnable()//Journal boundariesを表示する
    else
      if (oldSet.booleanJournalsBoundaries === false && newSet.booleanJournalsBoundaries === true
        && parent.document.getElementById("journals") as HTMLDivElement) boundaries("journals")//日誌の場合のみ

  if (oldSet.boundariesWeekStart !== newSet.boundariesWeekStart
    || oldSet.localizeOrEnglish !== newSet.localizeOrEnglish
    || oldSet.weekNumberFormat !== newSet.weekNumberFormat
    || oldSet.booleanBoundariesFuturePage !== newSet.booleanBoundariesFuturePage
    || oldSet.booleanBoundariesShowMonth !== newSet.booleanBoundariesShowMonth
    || oldSet.booleanBoundariesShowWeekNumber !== newSet.booleanBoundariesShowWeekNumber
    || oldSet.booleanWeekendsColor !== newSet.booleanWeekendsColor
    || oldSet.boundariesHighlightColorSinglePage !== newSet.boundariesHighlightColorSinglePage
    || oldSet.boundariesHighlightColorToday !== newSet.boundariesHighlightColorToday
    || oldSet.booleanWeeklyJournal !== newSet.booleanWeeklyJournal
  ) {
    //Journal boundariesを再表示する
    removeBoundaries()
    SettingsChangedJournalBoundariesEnable()
  }

  if (oldSet.localizeOrEnglish !== newSet.localizeOrEnglish
    || oldSet.booleanDayOfWeek !== newSet.booleanDayOfWeek
    || oldSet.longOrShort !== newSet.longOrShort
    || oldSet.booleanWeekNumber !== newSet.booleanWeekNumber
    || oldSet.weekNumberOfTheYearOrMonth !== newSet.weekNumberOfTheYearOrMonth
    || oldSet.booleanWeekendsColor !== newSet.booleanWeekendsColor
    || oldSet.weekNumberFormat !== newSet.weekNumberFormat
    || oldSet.booleanRelativeTime !== newSet.booleanRelativeTime
    || oldSet.booleanWeeklyJournal !== newSet.booleanWeeklyJournal
    || oldSet.booleanWeekNumberHideYear !== newSet.booleanWeekNumberHideYear
    || oldSet.booleanSettingsButton !== newSet.booleanSettingsButton
    || oldSet.booleanMonthlyJournalLink !== newSet.booleanMonthlyJournalLink
  ) {
    //再表示　Behind Journal Title
    removeTitleQuery()
    setTimeout(() => querySelectorAllTitle(), 500)
  }
}
)

//Journal boundariesを表示する
const SettingsChangedJournalBoundariesEnable = () => setTimeout(() => {
  if (parent.document.getElementById("journals") as HTMLDivElement) boundaries("journals")
  else boundaries("is-journals")
}, 100)


let processingTitleQuery: boolean = false
const querySelectorAllTitle = async (enable?: boolean): Promise<void> => {
  if (processingTitleQuery && !enable) return
  processingTitleQuery = true

  //Journalsの場合は複数
  parent.document
    .querySelectorAll(
      "div#main-content-container div:is(.journal,.is-journals,.page) h1.title:not([data-checked])"
    )
    .forEach(
      async (titleElement) =>
        await JournalPageTitle(titleElement as HTMLElement)
    )
  processingTitleQuery = false
}

const observer = new MutationObserver(async (): Promise<void> => {
  observer.disconnect()
  await querySelectorAllTitle(true)
  setTimeout(() => observerMain(), 800)
})

const observerMain = () => observer.observe(
  parent.document.getElementById("main-content-container") as HTMLDivElement,
  {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  }
)

//Credit: ottodevs  https://discuss.logseq.com/t/show-week-day-and-week-number/12685/18
let processingJournalTitlePage: Boolean = false

const JournalPageTitle = async (titleElement: HTMLElement) => {
  if (!titleElement.textContent
    || processingJournalTitlePage === true
    || titleElement.nextElementSibling?.className === "showWeekday") return // check if element already has date info
  processingJournalTitlePage = true

  //日誌のページ名の場合のみ

  //設定項目ですべてのトグルがオフの場合の処理
  if (
    logseq.settings?.booleanWeekNumber === false &&
    logseq.settings!.booleanDayOfWeek === false &&
    logseq.settings?.booleanRelativeTime === false &&
    (titleElement.classList.contains("journal-title") === true ||
      titleElement.classList.contains("title") === true)
  ) {
    const dateInfoElement: HTMLSpanElement =
      document.createElement("span")
    dateInfoElement.classList.add("showWeekday")
    titleElement.insertAdjacentElement("afterend", dateInfoElement)
    const secondElement: HTMLSpanElement =
      document.createElement("span")
    secondElement.style.width = "50%"
    titleElement.parentElement!.insertAdjacentElement(
      "afterend",
      secondElement
    )
    return
  }

  //Weekly Journalのページだった場合
  if (
    titleElement.classList.contains("journal-title") === false &&
    titleElement.classList.contains("title") === true &&
    logseq.settings!.booleanWeeklyJournal === true
  ) {
    const match = titleElement.textContent.match(
      /^(\d{4})-W(\d{2})$/
    ) as RegExpMatchArray
    if (match && match[1] !== "" && match[2] !== "") {
      await currentPageIsWeeklyJournal(titleElement, match)
      processingJournalTitlePage = false
      return
    }
  }

  //日誌タイトルから日付を取得し、右側に情報を表示する
  const title: string = titleElement.dataset.localize === "true" ? titleElement.dataset.ref || "" : titleElement.textContent
  if (title === "") return
  const page = (await logseq.Editor.getPage(title)) as PageEntity | null
  if (page && page.journalDay) {
    const journalDate: Date = getJournalDayDate(String(page.journalDay))
    const { preferredDateFormat } = (await logseq.App.getUserConfigs()) as AppUserConfigs
    behindJournalTitle(journalDate, titleElement, preferredDateFormat)

    //日付フォーマットに曜日が含まれている場合
    if (
      preferredDateFormat.includes("E") === true &&
      logseq.settings!.booleanDayOfWeek === false &&
      logseq.settings!.booleanJournalLinkLocalizeDayOfWeek === true &&
      titleElement.dataset.localize === undefined
    )
      titleElementReplaceLocalizeDayOfWeek(journalDate, titleElement)
  }

  titleElement.dataset.checked = "true"
  processingJournalTitlePage = false
}

const removeBoundaries = () => {
  const weekBoundaries = parent.document.getElementById(
    "weekBoundaries"
  ) as HTMLDivElement
  if (weekBoundaries) weekBoundaries.remove()
}

const removeTitleQuery = () => {
  const titleBehindElements = parent.document.querySelectorAll(
    "div#main-content-container div:is(.journal,.is-journals) h1.title+span.showWeekday"
  ) as NodeListOf<HTMLElement>
  titleBehindElements.forEach((titleElement) => titleElement.remove())
  const titleElements = parent.document.querySelectorAll(
    "div#main-content-container div:is(.journal,.is-journals) h1.title[data-checked]"
  ) as NodeListOf<HTMLElement>
  titleElements.forEach((titleElement) =>
    titleElement.removeAttribute("data-checked")
  )
}

//boundaries
let processingBoundaries: boolean = false
export const boundaries = (targetElementName: string, remove?: boolean) => {
  if (processingBoundaries) return
  processingBoundaries = true
  boundariesProcess(targetElementName, remove ? remove : false, 0)
  processingBoundaries = false
}

logseq.ready(main).catch(console.error)
