import { BlockUUID, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { addDays, format, isBefore, isFriday, isSameDay, isSaturday, isSunday, isThursday, isToday, isWednesday, startOfISOWeek, startOfWeek, } from 'date-fns' //https://date-fns.org/
import { t } from "logseq-l10n"
import { HolidayUtil, Lunar } from 'lunar-typescript'
import { getConfigPreferredDateFormat, getConfigPreferredLanguage } from '.'
import { formatRelativeDate, getJournalDayDate, getWeekStartOn, getWeeklyNumberFromDate, openPageFromPageName } from './lib'
import { exportHolidaysBundle } from './holidays'

let processingFoundBoundaries: boolean = false
export const boundariesProcess = async (targetElementName: string, remove: boolean, repeat: number, selectStartDate?: Date) => {
  if (repeat >= 3
    || processingFoundBoundaries === true) return
  if (!selectStartDate
    || (targetElementName === "weeklyJournal"
      && remove === true)) { //selectStartDateがある場合はチェックしない
    const checkWeekBoundaries = parent.document.getElementById('boundariesInner') as HTMLDivElement | null
    if (checkWeekBoundaries) {
      if (remove === true) checkWeekBoundaries.remove()
      else return
    }
  }

  let firstElement: HTMLDivElement | null
  switch (targetElementName) {
    case "journals":
      firstElement = parent.document.getElementById("journals") as HTMLDivElement
      break
    case "is-journals":
      firstElement = parent.document.body.querySelector("div#main-content-container div.is-journals.page>div.relative") as HTMLDivElement
      break
    case "weeklyJournal":
      firstElement = parent.document.body.querySelector("div#main-content-container div.page.relative>div.relative") as HTMLDivElement
      break
    default:
      firstElement = null
      break
  }
  if (firstElement === null)
    setTimeout(() => boundariesProcess(targetElementName, false, repeat + 1), 300)
  processingFoundBoundaries = true//ここからreturnする場合は必ずfalseにすること


  const weekStartsOn: 0 | 1 | 6 = getWeekStartOn()

  if (firstElement) {
    const today = new Date()
    //スクロールの場合とそうでない場合でweekBoundariesを作成するかどうかを判定する
    let weekBoundaries: HTMLDivElement
    if (selectStartDate) {
      if (targetElementName === "weeklyJournal") {
        weekBoundaries = parent.document.getElementById("weekBoundaries") as HTMLDivElement | null || document.createElement('div')
        weekBoundaries.id = 'weekBoundaries'
      } else
        weekBoundaries = parent.document.getElementById("weekBoundaries") as HTMLDivElement

    } else {
      weekBoundaries = document.createElement('div')
      weekBoundaries.id = 'weekBoundaries'
    }

    firstElement.insertBefore(weekBoundaries, firstElement.firstChild)

    //weekBoundariesにelementを追加する
    const boundariesInner: HTMLDivElement = document.createElement('div')
    boundariesInner.id = 'boundariesInner'
    weekBoundaries.appendChild(boundariesInner)

    let targetDate: Date//今日の日付もしくはそのページの日付を求める
    if (targetElementName === 'journals')
      targetDate = today
    else
      if (targetElementName === 'is-journals') {
        const { journalDay } = await logseq.Editor.getCurrentPage() as { journalDay: PageEntity["journalDay"] }
        if (!journalDay) {
          console.error('journalDay is undefined')
          processingFoundBoundaries = false
          return
        }
        targetDate = getJournalDayDate(String(journalDay)) as Date
      } else
        if (targetElementName === "weeklyJournal")
          targetDate = selectStartDate as Date
        else {
          console.error('targetElementName is undefined')
          processingFoundBoundaries = false
          return
        }

    //targetDateを週の初めにする
    const startDate: Date = selectStartDate ? selectStartDate :
      weekStartsOn === 1 && logseq.settings?.weekNumberFormat === "ISO(EU) format"
        ? startOfISOWeek(targetDate)
        : startOfWeek(targetDate, { weekStartsOn })

    // 次の週を表示するかどうかの判定
    const isDayThursday: boolean = isThursday(targetDate)
    const isDayFriday: boolean = isFriday(targetDate)
    const isDaySaturday: boolean = isSaturday(targetDate)
    const flagShowNextWeek: boolean =
      //日曜日始まり、木曜、金曜、土曜がtargetDateの場合
      (weekStartsOn === 0 && (isDayThursday || isDayFriday || isDaySaturday))
        //月曜日始まり、金曜、土曜、日曜がtargetDateの場合
        || (weekStartsOn === 1 && (isDayFriday || isDaySaturday || isSunday(targetDate)))
        //土曜日始まり、水曜、木曜、金曜がtargetDateの場合
        || (weekStartsOn === 6 && (isWednesday(targetDate) || isDayThursday || isDayFriday))
        ? true : false
    const days: number[] = flagShowNextWeek === true
      ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] //次の週を表示する場合
      : [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6] //次の週を表示しない場合

    daysForEach(days, startDate, boundariesInner, today, targetDate, targetElementName, flagShowNextWeek)
  }
  processingFoundBoundaries = false
}


const daySideWeekNumber = (date: Date, boundariesInner: HTMLDivElement) => {
  const weekStartsOn: 0 | 1 = logseq.settings?.weekNumberFormat === "US format" ? 0 : 1
  //dateAddOneDayの週番号を取得する
  const { year, weekString }: { year: number; weekString: string } = getWeeklyNumberFromDate(date, weekStartsOn)
  const weekNumberElement: HTMLSpanElement = document.createElement('span')
  weekNumberElement.classList.add('daySide', 'daySideWeekNumber')
  weekNumberElement.innerText = "W" + weekString
  weekNumberElement.title = t("Week number: ") + year + "-W" + weekString
  if (logseq.settings!.booleanWeeklyJournal === true)
    weekNumberElement.addEventListener("click", ({ shiftKey }) => openPageFromPageName(`${year}-W${weekString}`, shiftKey))
  else weekNumberElement.style.cursor = 'unset'
  boundariesInner.appendChild(weekNumberElement)
}

const daySideMonth = (date: Date, boundariesInner: HTMLDivElement, monthDuplicate: Date): Date => {
  const sideMonthElement: HTMLSpanElement = document.createElement('span')
  sideMonthElement.classList.add('daySide')
  //monthDuplicateが存在したら、dateの6日後を代入する
  const dateShowMonth: Date = monthDuplicate ? addDays(date, 6) as Date : date

  //ローカライズされた月の名前を取得する
  const monthString: string = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish as string || "default"), { month: "short" }).format(dateShowMonth)
  sideMonthElement.innerText = monthString

  if (monthDuplicate //上下の月が一致する場合は、非表示にする
    && dateShowMonth.getMonth() === monthDuplicate.getMonth()
    && dateShowMonth.getFullYear() === monthDuplicate.getFullYear()) {
    sideMonthElement.style.visibility = 'hidden'
  } else {
    const monthString: string = format(dateShowMonth, "yyyy/MM")
    sideMonthElement.title = monthString
    sideMonthElement.addEventListener("click", ({ shiftKey }) => openPageFromPageName(monthString, shiftKey))// 2023/10のようなページを開く
  }
  boundariesInner.appendChild(sideMonthElement)
  return dateShowMonth
}

// 週のスクロール
const daySideScroll = (index: number, boundariesInner: HTMLDivElement, targetElementName: string, startDate: Date) => {
  const sideScrollElement: HTMLSpanElement = document.createElement('span')
  sideScrollElement.classList.add('daySide', 'daySideScroll')
  sideScrollElement.innerText = index === 6 ? '↑' : '↓'
  sideScrollElement.title = index === 6 ? t("Previous week") : t("Next week")
  boundariesInner.appendChild(sideScrollElement)
  sideScrollElement.addEventListener('click', () => {
    //boundariesInnerを削除する
    boundariesInner.remove()
    //startDateを1週間ずらす
    boundariesProcess(targetElementName, true, 0, addDays(startDate, index === 6 ? -7 : 7) as Date)
  }, { once: true })
}

// For Chinese lunar-calendar and holidays
const lunarString = (targetDate: Date, dayElement: HTMLSpanElement): string => {
  const getHoliday = HolidayUtil.getHoliday(targetDate.getFullYear(), targetDate.getMonth() + 1, targetDate.getDate()) // year, month, day
  const getHolidayName = getHoliday ? getHoliday.getName() : undefined
  const string = (Lunar.fromDate(targetDate).getDayInChinese() as string)
  if (getHolidayName) {
    dayElement.title = string + ` (${getHolidayName})` + "\n"// 中国の祝日
    dayElement.style.outline = `2px solid var(${logseq.settings!.choiceHolidaysColor as string || "--highlight-bg-color"})`
  } else
    dayElement.title = string + "\n"// 祝日がない場合は、中国の伝統的な暦を表示する(旧暦) 
  return string
}


// For World holidays
const holidaysWorld = (targetDate: Date, dayElement: HTMLSpanElement): string | undefined => {

  const holidaysBundle = exportHolidaysBundle()
  if (!holidaysBundle) return undefined
  const checkHoliday = holidaysBundle.isHoliday(targetDate)

  if (checkHoliday !== false
    && checkHoliday[0].type === "public") {
    const holidayName = checkHoliday[0].name
    if (holidayName) {
      dayElement.title = holidayName + "\n"
      dayElement.style.outline = `2px solid var(${logseq.settings!.choiceHolidaysColor as string || "--highlight-bg-color"})`
      return holidayName
    }
  } else
    return undefined
}

// 1日ずつの処理
const daysForEach = (days: number[], startDate: Date, boundariesInner: HTMLDivElement, today: Date, targetDate: Date, targetElementName: string, flagShowNextWeek: boolean) => {
  let monthDuplicate: Date
  const preferredDateFormat = getConfigPreferredDateFormat()
  //ミニカレンダー作成 1日ずつ処理
  days.forEach((numDays, index) => {
    const date: Date = numDays === 0 ? startDate : addDays(startDate, numDays) as Date // dateを取得する
    const dateFormat: string = format(date, preferredDateFormat) //日付をフォーマットする
    const dayOfWeek: string = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish as string || "default"), { weekday: "short" }).format(date) // 曜日を取得する
    //日付を取得する
    const dayOfMonth: number = date.getDate() // 日付の数字を取得する
    const dayElement: HTMLSpanElement = document.createElement('span')
    try {
      if (index === 7) {
        const element: HTMLDivElement = document.createElement('div')
        element.style.width = "100%"
        boundariesInner.append(element)
      }
      if (index === 0
        || index === 7) {
        //daySideElement作成    
        //月を表示する場合
        if (logseq.settings!.booleanBoundariesShowMonth === true) monthDuplicate = daySideMonth(date, boundariesInner, monthDuplicate) //daySideElement作成
      }
      //dayElement作成
      const isBooleanBeforeToday: boolean = isBefore(date, today)
      const isBooleanToday: boolean = isToday(date)
      const isBooleanTargetSameDay: boolean = isSameDay(targetDate, date)
      dayElement.classList.add('day')
      const dayOfWeekElement: HTMLSpanElement = document.createElement('span')
      dayOfWeekElement.classList.add('dayOfWeek')
      dayOfWeekElement.innerText = dayOfWeek

      // 20240121
      // 祝日のカラーリング機能
      const configPreferredLanguage = getConfigPreferredLanguage()
      // Chinese lunar-calendar and holidays
      if (logseq.settings!.booleanLunarCalendar === true // プラグイン設定で太陰暦オンの場合
        && (configPreferredLanguage === "zh-Hant" //中国語の場合
          || configPreferredLanguage === "zh-CN")) {
        const chinese = ` <smaLl>${lunarString(date, dayElement)}</small>` //文字数が少ないため、小さく祝日名を表示する
        dayOfWeekElement.style.fontSize = ".88em"
        dayOfWeekElement.innerHTML += chinese
      } else {
        // World holidays
        const displayNameOfHoliday = holidaysWorld(date, dayElement)
        if (displayNameOfHoliday
          && (configPreferredLanguage === "ja" //日本語の場合
            || configPreferredLanguage === "ko" // 韓国語の場合
          )) dayOfWeekElement.innerHTML += ` <smaLl>${displayNameOfHoliday}</small>` //文字数が少ないため、小さく祝日名を表示する
      }
      dayElement.appendChild(dayOfWeekElement)
      const dayOfMonthElement: HTMLSpanElement = document.createElement('span')
      dayOfMonthElement.classList.add('dayOfMonth')
      dayOfMonthElement.innerText = `${dayOfMonth}`
      dayElement.appendChild(dayOfMonthElement)
      //日付と相対時間をtitleに追加する
      if (logseq.settings?.booleanRelativeTime === true) { //相対時間を表示する場合
        const formatString: string = formatRelativeDate(date)
        dayElement.title += dateFormat + '\n' + formatString
      } else {
        dayElement.title += dateFormat
      }

      //indexが0~6
      if (targetElementName === 'weeklyJournal') {
        if (index >= 7
          && index <= 14) dayElement.classList.add('thisWeek')
      } else {
        if ((flagShowNextWeek === true
          && index < 7)
          || (flagShowNextWeek === false
            && index > 6))
          dayElement.classList.add('thisWeek')
      }
      if (targetElementName !== 'journals'
        && targetElementName !== "weeklyJournal"
        && isBooleanTargetSameDay === true)
        dayElement.style.border = `1px solid ${logseq.settings!.boundariesHighlightColorSinglePage}` //シングルページの日付をハイライト

      else
        if (isBooleanToday === true)
          dayElement.style.border = `1px solid ${logseq.settings!.boundariesHighlightColorToday}` //今日をハイライト

      if (logseq.settings?.booleanWeekendsColor === true) {
        if (isSaturday(date) as boolean) dayElement.style.color = 'var(--ls-wb-stroke-color-blue)'
        else
          if (isSunday(date) as boolean) dayElement.style.color = 'var(--ls-wb-stroke-color-red)'
      }

      //日付をクリックできるようにするかどうか
      if (logseq.settings!.booleanBoundariesFuturePage === true
        || isBooleanBeforeToday === true || isBooleanToday === true)
        dayElement.addEventListener("click", openPageToSingleDay(dateFormat, isBooleanBeforeToday))
      else
        dayElement.style.cursor = 'unset'

      //20240115
      //エントリーが存在するかどうかのインディケーターを表示する
      if (logseq.settings!.booleanBoundariesIndicator === true) indicator(dateFormat, dayOfMonthElement)

    } finally {
      boundariesInner.appendChild(dayElement)
      if (index === 6
        || index === 13) {
        //daySideElement作成    
        //週番号を表示する場合
        if (logseq.settings!.booleanBoundariesShowWeekNumber === true) daySideWeekNumber(date, boundariesInner)
        daySideScroll(index, boundariesInner, targetElementName, startDate)
      }
    }
  })
}

// 日誌のページが存在するかどうかのインディケーターを表示する
const indicator = async (targetPageName: string, dayOfMonthElement: HTMLSpanElement) => {
  const existsPage = await logseq.Editor.getPage(targetPageName, { includeChildren: false }) as { uuid: PageEntity["uuid"] } | null
  if (!existsPage
    || !existsPage.uuid) return
  const indicatorElement: HTMLSpanElement = document.createElement('span')
  indicatorElement.classList.add('indicator')
  indicatorElement.innerText = "●"
  indicatorElement.title = t("Page exists")
  dayOfMonthElement.appendChild(indicatorElement)
}

// 日誌のページを開く
function openPageToSingleDay(journalPageName: string, isBooleanBeforeToday: boolean): (this: HTMLSpanElement, ev: MouseEvent) => any {
  return async (event) => {
    if (event.shiftKey) {//Shiftキーを押しながらクリックした場合は、サイドバーでページを開く
      const page = await logseq.Editor.getPage(journalPageName, { includeChildren: false }) as { uuid: BlockUUID } | null
      if (page) logseq.Editor.openInRightSidebar(page.uuid)//ページが存在しない場合は開かない
    } else {
      //Shiftキーを押さずにクリックした場合は、ページを開く
      if (logseq.settings!.booleanNoPageFoundCreatePage === true
        && isBooleanBeforeToday === true) {//過去の日付の場合はページを作成しない
        //ページが存在しない場合は作成しない
        if (await logseq.Editor.getPage(journalPageName) as { name: string } | null)
          logseq.App.pushState('page', { name: journalPageName })//ページが存在する場合は開く
        else
          logseq.UI.showMsg(t("Page not found"), "warning", { timeout: 3000 })//ページが存在しない場合は警告を表示する
      } else
        logseq.App.pushState('page', { name: journalPageName })//ページが存在しない場合も作成される
    }
  }
}