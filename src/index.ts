import "@logseq/libs" //https://plugins-doc.logseq.com/
import { EntityID, LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { setup as l10nSetup } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { behindJournalTitle } from "./behind"
import { boundariesProcess } from "./boundaries"
import { convertLanguageCodeToCountryCode, getJournalDayDate, removeProvideStyle, titleElementReplaceLocalizeDayOfWeek } from "./lib"
import fileMainCSS from "./main.css?inline"
import { settingsTemplate } from "./settings"
import { loadShortcutItems, } from "./shortcutItems"
import CSSThisWeekPopup from "./thisWeekPopup.css?inline"
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
import { getHolidaysBundle, removeHolidaysBundle } from "./holidays"
const keyThisWeekPopup = "thisWeekPopup"
let configPreferredLanguage: string
let configPreferredDateFormat: string
export const getConfigPreferredLanguage = (): string => configPreferredLanguage
export const getConfigPreferredDateFormat = (): string => configPreferredDateFormat
let processingSettingsChanged: boolean = false

const thisWeekPopup = () => logseq.provideStyle({ key: keyThisWeekPopup, style: CSSThisWeekPopup })

const getUserConfig = async () => {
  const { preferredLanguage, preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: string; preferredLanguage: string }
  configPreferredLanguage = preferredLanguage
  configPreferredDateFormat = preferredDateFormat
  getHolidaysBundle(preferredLanguage)
}


/* main */
const main = async () => {
  await l10nSetup({
    builtinTranslations: {//Full translations
      ja, af, de, es, fr, id, it, ko, "nb-NO": nbNO, nl, pl, "pt-BR": ptBR, "pt-PT": ptPT, ru, sk, tr, uk, "zh-CN": zhCN, "zh-Hant": zhHant
    }
  })

  // メッセージを表示する
  const notice = "20240122no02"
  if (logseq.settings!.weekNumberFormat !== undefined && logseq.settings!.notice !== notice) {
    logseq.updateSettings({ notice })
    setTimeout(() => {
      logseq.UI.showMsg(`

    📆"Show Weekday and Week-number" plugin
    Updated!
    
    Features:
    1. Show holidays for world country
    2. Show indicator (dot) of journal entries


    - New setting items have been added. 
    
    Select your country name in the plugin settings.
    
    `, "info", { timeout: 7000 })
      logseq.showSettingsUI() // 設定画面を表示する
    }, 5000)
  }

  // 初回起動時に設定を促す
  if (logseq.settings?.weekNumberFormat === undefined) {
    logseq.UI.showMsg("Select either \"US format\" or \"ISO format\"", "info", { timeout: 3000 })
    setTimeout(() => logseq.showSettingsUI(), 300)
  }

  logseq.provideStyle({ key: "main", style: fileMainCSS })


  await getUserConfig()

  if (logseq.settings!.holidaysCountry === undefined) {
    logseq.useSettingsSchema(
      settingsTemplate(
        convertLanguageCodeToCountryCode(configPreferredLanguage)
      )
    )
  } else
    logseq.useSettingsSchema(settingsTemplate(logseq.settings!.holidaysCountry))

  //Logseqを開いたときに実行
  setTimeout(() => {
    if (logseq.settings!.booleanJournalsBoundaries === true)
      boundaries("journals")
    querySelectorAllTitle()
  }, 200)
  setTimeout(() => observerMain(), 2000) //スクロール用


  //ページ遷移時に実行 (Journal boundariesとBehind Journal Titleの更新)
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

  // 今日の日記が作成されたときに実行される (Journal boundariesの更新のため) ※ただし、今日以外の日記を作成した場合は実行されないので注意
  logseq.App.onTodayJournalCreated(async () => {
    if (logseq.settings?.booleanBoundaries === true) {
      const weekBoundaries = parent.document.getElementById(
        "weekBoundaries"
      ) as HTMLDivElement | null
      if (weekBoundaries) weekBoundaries.remove()
      if (
        (await logseq.Editor.getCurrentPage() as { id: EntityID } | null) !== null
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

  // サイドバーの表示/非表示が切り替わったときにセレクタークエリを実行
  logseq.App.onSidebarVisibleChanged(({ visible }) => {
    if (visible === true) setTimeout(() => querySelectorAllTitle(), 100)
  })

  // CSS適用
  if (logseq.settings!.thisWeekPopup === true) thisWeekPopup()
  if (logseq.settings!.boundariesBottom === true) parent.document.body.classList!.add("boundaries-bottom")

  // ユーザー設定が変更されたときにチェックを実行
  onSettingsChanged()

  // プラグインオフ時に実行
  logseq.beforeunload(async () => {
    removeTitleQuery()
    removeBoundaries()
    observer.disconnect()
  })

  // ショートカットキーを登録
  loadShortcutItems()

} /* end_main */



// ユーザー設定が変更されたときに実行
const onSettingsChanged = () => logseq.onSettingsChanged((newSet: LSPluginBaseInfo["settings"], oldSet: LSPluginBaseInfo["settings"]) => {

  if ((oldSet.booleanBoundaries === true
    && newSet.booleanBoundaries === false)
    || (oldSet.booleanJournalsBoundaries === true
      && newSet.booleanJournalsBoundaries === false
      && parent.document.getElementById("journals") as Node)
  ) removeBoundaries() //boundariesを削除する
  else
    if (oldSet.booleanBoundaries === false
      && newSet.booleanBoundaries === true)
      SettingsChangedJournalBoundariesEnable()//Journal boundariesを表示する
    else
      if (oldSet.booleanJournalsBoundaries === false
        && newSet.booleanJournalsBoundaries === true
        && parent.document.getElementById("journals") as Node)
        boundaries("journals")//日誌の場合のみ

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
    || oldSet.booleanBoundariesIndicator !== newSet.booleanBoundariesIndicator
    || oldSet.booleanBoundariesHolidays !== newSet.booleanBoundariesHolidays
    || oldSet.holidaysCountry !== newSet.holidaysCountry
    || oldSet.holidaysState !== newSet.holidaysState
    || oldSet.holidaysRegion !== newSet.holidaysRegion
    || oldSet.choiceHolidaysColor !== newSet.choiceHolidaysColor
    || oldSet.booleanLunarCalendar !== newSet.booleanLunarCalendar) {
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
    || oldSet.holidaysCountry !== newSet.holidaysCountry
    || oldSet.holidaysState !== newSet.holidaysState
    || oldSet.holidaysRegion !== newSet.holidaysRegion
    || oldSet.choiceHolidaysColor !== newSet.choiceHolidaysColor
    || oldSet.booleanUnderLunarCalendar !== newSet.booleanUnderLunarCalendar
    || oldSet.underHolidaysAlert !== newSet.underHolidaysAlert) {
    //再表示 Behind Journal Title
    removeTitleQuery()
    setTimeout(() => querySelectorAllTitle(), 500)
  }

  // thisWeekPopup
  if (oldSet.thisWeekPopup !== newSet.thisWeekPopup) {
    if (newSet.thisWeekPopup === true)
      thisWeekPopup()
    else
      removeProvideStyle(keyThisWeekPopup)
  }

  //20240108 boundariesを下側に表示する
  if (oldSet.boundariesBottom !== newSet.boundariesBottom) {
    if (newSet.boundariesBottom === true)
      parent.document.body.classList!.add("boundaries-bottom")
    else
      parent.document.body.classList!.remove("boundaries-bottom")
  }

  // 20240121 祝日表示に関するトグル
  if (oldSet.booleanBoundariesHolidays !== newSet.booleanBoundariesHolidays
    || oldSet.underHolidaysAlert !== newSet.underHolidaysAlert) {
    if (newSet.booleanBoundariesHolidays === true || newSet.underHolidaysAlert === true) //どちらかがオンの場合
      getHolidaysBundle(newSet.holidaysCountry as string, { settingsChanged: true }) //バンドルを取得する
    else
      if (newSet.booleanBoundariesHolidays === false && newSet.underHolidaysAlert === false) //両方オフの場合
        removeHolidaysBundle() //バンドルを削除する
  }
  if (oldSet.holidaysCountry !== newSet.holidaysCountry
    || oldSet.holidaysState !== newSet.holidaysState
    || oldSet.holidaysRegion !== newSet.holidaysRegion) { //国名などが変更された場合
    getHolidaysBundle(newSet.holidaysCountry as string, { settingsChanged: true }) //バンドルを取得する
  }

  //CAUTION: 日付形式が変更された場合は、re-indexをおこなうので、問題ないが、言語設定が変更された場合は、その設定は、すぐには反映されない。プラグインの再読み込みが必要になるが、その頻度がかなり少ないので問題ない。

  if (processingSettingsChanged) return
  processingSettingsChanged = true
  getUserConfig()
  setTimeout(() => processingSettingsChanged === false, 1000)


}) // end_onSettingsChanged


//Journal boundariesを表示する 設定変更時に実行
const SettingsChangedJournalBoundariesEnable = () => setTimeout(() => {
  if (parent.document.getElementById("journals") as Node)
    boundaries("journals")
  else
    boundaries("is-journals")
}, 100)


// クエリーセレクターでタイトルを取得する
let processingTitleQuery: boolean = false
const querySelectorAllTitle = async (enable?: boolean): Promise<void> => {
  if (processingTitleQuery && !enable) return
  processingTitleQuery = true

  //Journalsの場合は複数
  parent.document.body.querySelectorAll("div#main-content-container div:is(.journal,.is-journals,.page) h1.title:not([data-checked])")
    .forEach(async (titleElement) => await JournalPageTitle(titleElement as HTMLElement))
  processingTitleQuery = false
}

// observer
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
  if (logseq.settings?.booleanWeekNumber === false
    && logseq.settings!.booleanDayOfWeek === false
    && logseq.settings?.booleanRelativeTime === false
    && (titleElement.classList.contains("journal-title") === true
      || titleElement.classList.contains("title") === true)) {
    const dateInfoElement: HTMLSpanElement =
      document.createElement("span")
    dateInfoElement.classList.add("showWeekday")
    titleElement.insertAdjacentElement("afterend", dateInfoElement)
    const secondElement: HTMLSpanElement =
      document.createElement("span")
    secondElement.style.width = "50%"
    titleElement.parentElement!.insertAdjacentElement("afterend", secondElement)
    return
  }

  //Weekly Journalのページだった場合
  if (
    titleElement.classList.contains("journal-title") === false &&
    titleElement.classList.contains("title") === true &&
    logseq.settings!.booleanWeeklyJournal === true
  ) {
    const match = titleElement.textContent.match(/^(\d{4})-W(\d{2})$/) as RegExpMatchArray
    if (match
      && match[1] !== ""
      && match[2] !== "") {
      await currentPageIsWeeklyJournal(titleElement, match)
      processingJournalTitlePage = false
      return
    }
  }

  //日誌タイトルから日付を取得し、右側に情報を表示する
  const title: string = titleElement.dataset.localize === "true" ?
    titleElement.dataset.ref || ""
    : titleElement.textContent
  if (title === "") return
  const page = (await logseq.Editor.getPage(title)) as { journalDay: number } | null
  if (page && page.journalDay) {
    const journalDate: Date = getJournalDayDate(String(page.journalDay))

    behindJournalTitle(journalDate, titleElement, configPreferredDateFormat)

    //日付フォーマットに曜日が含まれている場合
    if (configPreferredDateFormat.includes("E") === true
      && logseq.settings!.booleanDayOfWeek === false
      && logseq.settings!.booleanJournalLinkLocalizeDayOfWeek === true
      && titleElement.dataset.localize === undefined)
      titleElementReplaceLocalizeDayOfWeek(journalDate, titleElement)
  }

  titleElement.dataset.checked = "true"
  processingJournalTitlePage = false
}

const removeBoundaries = () => {
  const weekBoundaries = parent.document.getElementById("weekBoundaries") as HTMLDivElement | null
  if (weekBoundaries) weekBoundaries.remove()
}

const removeTitleQuery = () => {
  const titleBehindElements = parent.document.body.querySelectorAll("div#main-content-container div:is(.journal,.is-journals) h1.title+span.showWeekday") as NodeListOf<HTMLElement>
  titleBehindElements.forEach((titleElement) => titleElement.remove())
  const titleElements = parent.document.body.querySelectorAll("div#main-content-container div:is(.journal,.is-journals) h1.title[data-checked]") as NodeListOf<HTMLElement>
  titleElements.forEach((titleElement) => titleElement.removeAttribute("data-checked"))
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