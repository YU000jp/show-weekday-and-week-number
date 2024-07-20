import "@logseq/libs" //https://plugins-doc.logseq.com/
import { EntityID, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { dailyJournalDetails, observer, observerMain, removeTitleQuery } from "./dailyJournalDetails"
import { boundariesProcess, removeBoundaries } from "./boundaries"
import { getHolidaysBundle } from "./holidays"
import { keyLeftCalendarContainer, loadLeftCalendar, refreshCalendar, refreshCalendarCheckSameMonth } from "./left-calendar"
import { convertLanguageCodeToCountryCode, getJournalDayDate, getWeekStartFromWeekNumber, removeElementById } from "./lib"
import fileMainCSS from "./main.css?inline"
import { currentPageIsMonthlyJournal } from "./monthlyJournal"
import { notice } from "./notice"
import { onSettingsChanged } from "./onSettingsChanged"
import { currentPageIsQuarterlyJournal } from "./quarterlyJournal"
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
import { currentPageIsWeeklyJournal, weeklyEmbed } from "./weeklyJournal"

// プラグイン名(小文字タイプ)
export const pluginNameCut = "show-weekday-and-week-number"
// プラグイン名の最後に[plugin]を追加
export const pluginName = `${pluginNameCut} ${t("plugin")}`
// コンソールの署名用
export const consoleSignature = ` <----- [${pluginName}]`

let configPreferredLanguage: string
let configPreferredDateFormat: string
export const getConfigPreferredLanguage = (): string => configPreferredLanguage
export const getConfigPreferredDateFormat = (): string => configPreferredDateFormat


export const getUserConfig = async () => {
  const { preferredLanguage, preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: string; preferredLanguage: string }
  configPreferredLanguage = preferredLanguage
  configPreferredDateFormat = preferredDateFormat
  getHolidaysBundle(preferredLanguage)
}



/* main */
const main = async () => {


  // l10nのセットアップ
  await l10nSetup({
    builtinTranslations: {//Full translations
      ja, af, de, es, fr, id, it, ko, "nb-NO": nbNO, nl, pl, "pt-BR": ptBR, "pt-PT": ptPT, ru, sk, tr, uk, "zh-CN": zhCN, "zh-Hant": zhHant
    }
  })


  // 更新メッセージなどを表示する
  notice()


  // 初回起動時に設定を促す
  setTimeout(() => {
    if (logseq.settings!.weekNumberFormat === undefined) {
      logseq.UI.showMsg("Select either \"US format\" or \"ISO format\"", "info", { timeout: 3000 })
      setTimeout(() => logseq.showSettingsUI(), 300)
    }
  }, 3000)


  // CSS適用
  logseq.provideStyle({ key: "main", style: fileMainCSS })


  // ユーザー設定を取得
  await getUserConfig()


  // プラグイン設定のセットアップ
  logseq.useSettingsSchema(
    settingsTemplate(
      logseq.settings!.holidaysCountry === undefined ? // 国名が設定されていない場合は取得
        convertLanguageCodeToCountryCode(configPreferredLanguage)
        : logseq.settings!.holidaysCountry
    ))


  // プラグインが読み込まれたら実行
  setTimeout(() => {

    if (logseq.settings!.booleanJournalsBoundaries === true)
      boundaries("journals")

    querySelectorAllTitle(logseq.settings!.booleanBesideJournalTitle as boolean)

    setTimeout(() => observerMain(), 1800) //スクロール用
  }, 200)


  //ページ遷移時に実行 (Journal boundariesとBehind Journal Titleの更新)
  logseq.App.onRouteChanged(({ template }) => {

    if (logseq.settings!.booleanBoundariesAll === true)
      if (logseq.settings!.booleanBoundaries === true
        && template === "/page/:name")
        //page only
        //div.is-journals
        setTimeout(() => boundaries("is-journals"), 20)
      else
        if (logseq.settings!.booleanJournalsBoundaries === true
          && template === "/")
          //journals only
          //div#journals
          setTimeout(() => boundaries("journals"), 20)

    // 左サイドバーのカレンダーを更新する
    if (logseq.settings!.booleanLeftCalendar === true)
      logseq.Editor.getCurrentPage().then((pageEntity) => {
        if (pageEntity) {
          if (pageEntity.journalDay)
            refreshCalendar(getJournalDayDate(String(pageEntity.journalDay)), true, false)
          else
            if (logseq.settings!.booleanWeeklyJournal === true) {
              const pageName = pageEntity.originalName as PageEntity["originalName"]
              const match = (() => {
                switch (logseq.settings!.weekNumberOptions) {
                  case "YYYY-Www":
                    return pageName.match(/^(\d{4})-[wW](\d{2})$/) // "YYYY-Www"
                  case "YYYY/qqq/Www": // 2023/Q1/W01
                    return pageName.match(/^(\d{4})\/[qQ]\d{1}\/[wW](\d{2})$/) // "YYYY/qqq/Www"
                  default:
                    return pageName.match(/^(\d{4})\/[wW](\d{2})$/) // "YYYY/Www"
                }
              })() as RegExpMatchArray
              if (match
                && match[1] !== ""
                && match[2] !== "") {
                const weekStart: Date = getWeekStartFromWeekNumber(
                  Number(match[1]),
                  Number(match[2]),
                  logseq.settings?.weekNumberFormat === "US format" ? 0 : 1,
                  logseq.settings!.weekNumberFormat === "ISO format" ? true : false)
                refreshCalendar(weekStart, false, true) // 週の最初の日付がハイライトされる
              } else
                refreshCalendarCheckSameMonth()
            } else
              refreshCalendarCheckSameMonth()
        } else
          refreshCalendarCheckSameMonth()
      })
    else
      refreshCalendarCheckSameMonth()

    setTimeout(() => querySelectorAllTitle(logseq.settings!.booleanBesideJournalTitle as boolean), 50)
  })


  // 今日の日記が作成されたときに実行される (Journal boundariesの更新のため)
  // ※ただし、今日以外の日記を作成した場合は実行されないので注意
  logseq.App.onTodayJournalCreated(async () => {
    if (logseq.settings!.booleanBoundaries === true) {
      const weekBoundaries = parent.document.getElementById("weekBoundaries") as HTMLDivElement | null
      if (weekBoundaries) weekBoundaries.remove()
      if ((await logseq.Editor.getCurrentPage() as { id: EntityID } | null) !== null)
        //page only
        //div.is-journals
        setTimeout(() => boundaries("is-journals"), 10)
      else
        //journals only
        //div#journals
        setTimeout(() => boundaries("journals"), 10)
    }
  })


  // サイドバーの表示/非表示が切り替わったときにセレクタークエリを実行
  logseq.App.onSidebarVisibleChanged(({ visible }) => {
    if (visible === true)
      setTimeout(() =>
        querySelectorAllTitle(logseq.settings!.booleanBesideJournalTitle as boolean), 100)
  })


  // CSS適用
  if (logseq.settings!.weeklyEmbed === true)
    weeklyEmbed()

  if (logseq.settings!.boundariesBottom === true)
    parent.document.body.classList!.add("boundaries-bottom")


  loadLeftCalendar()


  // ユーザー設定が変更されたときにチェックを実行
  onSettingsChanged()


  // プラグインオフ時に実行
  logseq.beforeunload(async () => {

    // Beside Journal Titleを取り除く
    removeTitleQuery()

    // Boundariesを取り除く
    removeBoundaries()

    // Observerの解除
    observer.disconnect()

    // Left Calendarのcontainerを取り除く
    removeElementById(keyLeftCalendarContainer)

  })


  // ショートカットキーを登録
  loadShortcutItems()


} /* end_main */



// クエリーセレクターでタイトルを取得する
let processingTitleQuery: boolean = false

export const querySelectorAllTitle = async (enable: boolean): Promise<void> => {
  if (// enable === false ||
    processingTitleQuery) return
  processingTitleQuery = true

  //Journalsの場合は複数
  parent.document.body.querySelectorAll("div#main-content-container div:is(.journal,.is-journals,.page) h1.title:not([data-checked])")
    .forEach(async (titleElement) => await checkJournalTitle(titleElement as HTMLElement))
  processingTitleQuery = false
}


let processingJournalTitlePage: Boolean = false

const checkJournalTitle = async (titleElement: HTMLElement) => {
  if (!titleElement.textContent
    || processingJournalTitlePage === true
    || titleElement.nextElementSibling?.className === "showWeekday") return // check if element already has date info
  processingJournalTitlePage = true

  const title: string = titleElement.dataset.localize === "true" ?
    titleElement.dataset.ref || ""
    : titleElement.dataset.ref || titleElement.textContent
  if (title === "") return //タイトルが空の場合は処理を終了する

  //Weekly(M/Q) Journalのページかどうか
  if (titleElement.classList.contains("journal-title") === false
    && titleElement.classList.contains("title") === true
    // titleの先頭が2024から始まるかどうか
    && title.match(/^(\d{4})/) !== null
  ) {
    // 2024/01にマッチするかどうか
    if (logseq.settings!.booleanMonthlyJournal === true) {
      const match = title.match(/^(\d{4})\/(\d{2})$/) as RegExpMatchArray
      if (match
        && match[1] !== ""
        && match[2] !== "") {
        await currentPageIsMonthlyJournal(titleElement, match)
        titleElement.title = "Monthly Journal"
        titleElement.dataset.checked = "true"
        setTimeout(() =>
          processingJournalTitlePage = false
          , 300)
        return //処理を終了する
      }
    }
    // 2024/Q1にマッチするかどうか
    if (logseq.settings!.booleanQuarterlyJournal === true) {
      const match = title.match(/^(\d{4})\/[qQ](\d{1})$/) as RegExpMatchArray
      if (match
        && match[1] !== ""
        && match[2] !== "") {
        await currentPageIsQuarterlyJournal(titleElement, match)
        titleElement.title = "Quarterly Journal"
        titleElement.dataset.checked = "true"
        setTimeout(() =>
          processingJournalTitlePage = false
          , 300)
        return //処理を終了する
      }
    }
    if (logseq.settings!.booleanWeeklyJournal === true) {
      const match = (() => {
        switch (logseq.settings!.weekNumberOptions) {
          case "YYYY-Www":
            return title.match(/^(\d{4})-[wW](\d{2})$/) // "YYYY-Www"
          case "YYYY/qqq/Www": // 2023/Q1/W01
            return title.match(/^(\d{4})\/[qQ]\d{1}\/[wW](\d{2})$/) // "YYYY/qqq/Www"
          default:
            return title.match(/^(\d{4})\/[wW](\d{2})$/) // "YYYY/Www"
        }
      })() as RegExpMatchArray
      if (match
        && match[1] !== ""
        && match[2] !== "") {
        await currentPageIsWeeklyJournal(titleElement, match)
        titleElement.title = "Weekly Journal"
        titleElement.dataset.checked = "true"
        setTimeout(() =>
          processingJournalTitlePage = false
          , 300)
        return //処理を終了する
      }
    }
  }

  if ((logseq.settings!.booleanBesideJournalTitle === false
    || (logseq.settings!.booleanBesideJournalTitle === true
      && ((logseq.settings!.booleanWeekNumber === false//設定項目ですべてのトグルがオフの場合
        && logseq.settings!.booleanDayOfWeek === false
        && logseq.settings!.booleanRelativeTime === false
        && logseq.settings!.underHolidaysAlert === false
        && logseq.settings!.booleanSettingsButton === false
        && logseq.settings!.booleanMonthlyJournalLink === false
        && logseq.settings!.booleanUnderLunarCalendar === false))))
    // titleElementのクラスにjournal-titleまたはtitleが含まれている場合
    && (titleElement.classList.contains("journal-title") === true
      || titleElement.classList.contains("title") === true)) {

    //titleElementの後ろにdateInfoElementを追加し、スペース確保しておく
    const dateInfoElement: HTMLSpanElement = document.createElement("span")
    dateInfoElement.classList.add("showWeekday")
    titleElement.insertAdjacentElement("afterend", dateInfoElement)
    const secondElement: HTMLSpanElement = document.createElement("span")
    secondElement.style.width = "50%"
    titleElement.parentElement!.insertAdjacentElement("afterend", secondElement)
  } else {
    setTimeout(async () => { // 遅延処理
      const page = (await logseq.Editor.getPage(title)) as { journalDay: number } | null
      if (page
        && page.journalDay)
        dailyJournalDetails(getJournalDayDate(String(page.journalDay)), titleElement)
    }, 10)
  }

  titleElement.dataset.checked = "true"
  processingJournalTitlePage = false //Journalsの場合は複数
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