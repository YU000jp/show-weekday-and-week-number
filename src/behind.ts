import { format, getWeekOfMonth, isSaturday, isSunday } from "date-fns"
import { createLinkMonthlyLink, createSettingButton, formatRelativeDate, getWeeklyNumberFromDate, openPageFromPageName } from "./lib"

// プロセス中かどうかを判定するフラグ
let processingBehind: boolean = false


//behind journal title
export const behindJournalTitle = async (journalDate: Date, titleElement: HTMLElement, preferredDateFormat) => {

  if (processingBehind === true) return // プロセス中の場合は処理をキャンセルする

  let dayOfWeekName: string = (preferredDateFormat.includes("E") === false // "E"は曜日の省略形 日付形式の中にそれが含まれていない場合は曜日を表示する
    && logseq.settings!.booleanDayOfWeek === true) // プラグイン設定でtrueになっている場合

    ? new Intl.DateTimeFormat(
      logseq.settings!.localizeOrEnglish as string || "default", // プラグイン設定でローカライズか英語か選択されている
      { weekday: logseq.settings!.longOrShort as "short" | "long" || "long" } // プラグイン設定でlongかshortか選択されている
    ).format(journalDate) // フォーマットして曜日の文字列を取得する

    : "" // プラグイン設定でfalseになっている場合

  const weekStartsOn: 0 | 1 = logseq.settings!.weekNumberFormat === "US format" ? 0 : 1 // 0: Sunday, 1: Monday

  //week number
  const printHtmlWeekNumber: string = logseq.settings!.booleanWeekNumber === true ? enableWeekNumber(journalDate, weekStartsOn) : "" //week numberの表示用の変数

  //relative time
  const printRelativeTime: string = logseq.settings!.booleanRelativeTime === true ? enableRelativeTime(journalDate) : "" //relative timeの表示用の変数

  // 反映する
  const baseLineElement: HTMLSpanElement = createBaseLineElement(journalDate, dayOfWeekName, printHtmlWeekNumber, printRelativeTime)

  // h1を移動する
  moveTitleElement(titleElement)

  // titleElementの後ろにdateInfoElementを追加する
  titleElement.insertAdjacentElement("afterend", baseLineElement)

  //Monthly Journalのリンクを作成する
  if (logseq.settings!.booleanMonthlyJournalLink === true) enableMonthlyJournalLink(journalDate, baseLineElement)

  //設定ボタンを設置
  if (logseq.settings!.booleanSettingsButton === true) enableSettingsButton(baseLineElement)

  setTimeout(() => processingBehind = false, 300)

}// end of behindJournalTitle



const moveTitleElement = (titleElement: HTMLElement) => {
  //h1から.blockを削除
  if (titleElement.classList.contains("block")) titleElement.classList.remove("block")


  //h1の中にdateInfoElementを挿入
  const aTag = titleElement.parentElement // 親要素を取得する

  if (aTag && aTag.tagName.toLowerCase() === "a") {

    //For journals
    //<a><h1>日付タイトル</h1></a>の構造になっているが、<h1><a>日付タイトル</a></h1>にしたい
    const titleElementTextContent = titleElement.textContent
    //titleElementのテキストコンテンツを削除
    titleElement.textContent = ""
    //aタグと同じ階層にtitleElementを移動する
    aTag.insertAdjacentElement("afterend", titleElement)
    //titleElementの中にaTagを移動する
    titleElement.appendChild(aTag)
    //移動したaタグの中身にtitleElementTextContentを戻す
    aTag.textContent = titleElementTextContent
    //aタグから.initial-colorを削除
    if (aTag.classList.contains("initial-color")) aTag.classList.remove("initial-color")

  }
}


const createBaseLineElement = (journalDate: Date, dayOfWeekName: string, printHtmlWeekNumber: string, relativeTime: string) => {

  const dateInfoElement: HTMLSpanElement = document.createElement("span")
  dateInfoElement.classList.add("showWeekday")

  if (logseq.settings!.booleanDayOfWeek === true) {

    if (logseq.settings!.booleanWeekendsColor === true)
      dateInfoElement.innerHTML = `<span style="color:var(${isSaturday(journalDate) === true ? "--ls-wb-stroke-color-blue"
        : isSunday(journalDate) === true ? "--ls-wb-stroke-color-red"
          : ""})">${dayOfWeekName}</span>${printHtmlWeekNumber}${relativeTime}`
    else
      dateInfoElement.innerHTML = `<span>${dayOfWeekName}</span>${printHtmlWeekNumber}${relativeTime}` //textContent

  } else
    dateInfoElement.innerHTML = `${printHtmlWeekNumber}${relativeTime}`

  return dateInfoElement
}


const enableRelativeTime = (journalDate: Date): string => {
  const formatString: string = formatRelativeDate(journalDate)
  if (formatString !== "") return `<span><small>(${formatString})</small></span>`
  else return ""
}


const enableWeekNumber = (journalDate: Date, weekStartsOn: 0 | 1): string => {

  let printHtmlWeekNumber: string = ""
  if (logseq.settings!.weekNumberOfTheYearOrMonth === "Year") {

    const { year, weekString }: { year: number; weekString: string } = getWeeklyNumberFromDate(journalDate, weekStartsOn as 0 | 1)

    const printWeekNumber = logseq.settings!.booleanWeekNumberHideYear === true && weekString !== "53"
      ? `W<strong>${weekString}</strong>`
      : `${year}-W<strong>${weekString}</strong>`

    const forWeeklyJournal = `${year}-W${weekString}`

    if (logseq.settings!.booleanWeeklyJournal === true) {

      const linkId = "weeklyJournal-" + forWeeklyJournal
      printHtmlWeekNumber = `<span title="Week number: ${forWeeklyJournal}"><a id="${linkId}">${printWeekNumber}</a></span>`

      setTimeout(() => {
        const element = parent.document.getElementById(linkId) as HTMLSpanElement
        if (element) element.addEventListener("click", ({ shiftKey }) => openPageFromPageName(forWeeklyJournal, shiftKey))
      }, 150)

    }
    else
      printHtmlWeekNumber = `<span title="${forWeeklyJournal}">${printWeekNumber}</span>`

  } else {

    // get week numbers of the month
    printHtmlWeekNumber = logseq.settings!.weekNumberFormat === "Japanese format"
      && logseq.settings!.localizeOrEnglish === "default"
      ? `<span title="1か月ごとの週番号">第<strong>${getWeekOfMonth(journalDate, { weekStartsOn })}</strong>週</span>`
      : `<span title="Week number within the month"><strong>W${getWeekOfMonth(journalDate, { weekStartsOn })}</strong><small>/m</small></span>`

  }

  return printHtmlWeekNumber
}


const enableMonthlyJournalLink = (journalDate: Date, dateInfoElement: HTMLSpanElement) => {
  const formatDateString: string = format(journalDate, "yyyy/MM")
  //ローカライズされた月名を取得する
  const localizedMonthName: string = new Intl.DateTimeFormat(logseq.settings!.localizeOrEnglish as string || "default", { month: "short" }).format(journalDate)
  const monthlyJournalLinkButton = createLinkMonthlyLink(localizedMonthName, formatDateString, "Monthly Journal [[" + formatDateString + "]]")
  dateInfoElement.appendChild(monthlyJournalLinkButton)
}


const enableSettingsButton = (dateInfoElement: HTMLSpanElement) => {
  const settingButton: HTMLButtonElement = createSettingButton()
  dateInfoElement.appendChild(settingButton)
}

