import { LSPluginBaseInfo, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { boundaries, querySelectorAllTitle, getUserConfig } from "."
import { removeBoundaries } from "./boundaries"
import { removeTitleQuery } from "./dailyJournalDetails"
import { getHolidaysBundle, removeHolidaysBundle } from "./holidays"
import { removeElementById, removeProvideStyle } from "./lib"
import { keyThisWeekPopup, weeklyEmbed } from "./weeklyJournal"

let processingSettingsChanged: boolean = false
let processingRenamePage: boolean = false


export const isCommonSettingsChanged = (oldSet: LSPluginBaseInfo["settings"], newSet: LSPluginBaseInfo["settings"]): boolean => {
  if (
    //共通設定
    oldSet.weekNumberFormat !== newSet.weekNumberFormat
    || oldSet.localizeOrEnglish !== newSet.localizeOrEnglish
    || oldSet.holidaysCountry !== newSet.holidaysCountry
    || oldSet.holidaysState !== newSet.holidaysState
    || oldSet.holidaysRegion !== newSet.holidaysRegion
    || oldSet.booleanLunarCalendar !== newSet.booleanLunarCalendar
    || oldSet.booleanUnderLunarCalendar !== newSet.booleanUnderLunarCalendar
    || oldSet.choiceHolidaysColor !== newSet.choiceHolidaysColor
    || oldSet.booleanBoundariesIndicator !== newSet.booleanBoundariesIndicator
    || oldSet.boundariesWeekStart !== newSet.boundariesWeekStart
    || oldSet.booleanWeekendsColor !== newSet.booleanWeekendsColor
    || oldSet.boundariesHighlightColorSinglePage !== newSet.boundariesHighlightColorSinglePage
    || oldSet.boundariesHighlightColorToday !== newSet.boundariesHighlightColorToday
    || oldSet.userColorList !== newSet.userColorList
    || oldSet.choiceUserColor !== newSet.choiceUserColor
    || oldSet.userWeekendMon !== newSet.userWeekendMon
    || oldSet.userWeekendTue !== newSet.userWeekendTue
    || oldSet.userWeekendWed !== newSet.userWeekendWed
    || oldSet.userWeekendThu !== newSet.userWeekendThu
    || oldSet.userWeekendFri !== newSet.userWeekendFri
    || oldSet.userWeekendSat !== newSet.userWeekendSat
    || oldSet.userWeekendSun !== newSet.userWeekendSun
    //booleanNoPageFoundCreatePageは反映不要
    || oldSet.weekNumberOptions !== newSet.weekNumberOptions //Weekly Journalの設定
  )
    return true
  else
    return false
}


// ユーザー設定が変更されたときに実行

export const onSettingsChanged = () => {
  logseq.onSettingsChanged((newSet: LSPluginBaseInfo["settings"], oldSet: LSPluginBaseInfo["settings"]) => {

    if (
      (oldSet.booleanBoundariesAll === true
        && newSet.booleanBoundariesAll === false)
      || (oldSet.booleanBoundaries === true
        && newSet.booleanBoundaries === false)
      || (oldSet.booleanJournalsBoundaries === true
        && newSet.booleanJournalsBoundaries === false)
      || (oldSet.booleanBoundariesOnWeeklyJournal === true
        && newSet.booleanBoundariesOnWeeklyJournal === false)
    )
      removeBoundaries() //boundariesを削除する
    else
      if (
        (oldSet.booleanBoundariesAll === false
          && newSet.booleanBoundariesAll === true)
        || (oldSet.booleanBoundaries === false
          && newSet.booleanBoundaries === true)
        || (oldSet.booleanJournalsBoundaries === false
          && newSet.booleanJournalsBoundaries === true)
        || (oldSet.booleanBoundariesOnWeeklyJournal === false
          && newSet.booleanBoundariesOnWeeklyJournal === true)
      )
        SettingsChangedJournalBoundariesEnable(newSet)

    if (
      isCommonSettingsChanged(oldSet, newSet) === true
      || oldSet.booleanWeeklyJournal !== newSet.booleanWeeklyJournal
      || oldSet.boundariesBottom !== newSet.boundariesBottom
      || oldSet.booleanBoundariesShowMonth !== newSet.booleanBoundariesShowMonth
      || oldSet.booleanBoundariesShowWeekNumber !== newSet.booleanBoundariesShowWeekNumber
      || oldSet.booleanBoundariesHolidays !== newSet.booleanBoundariesHolidays
    ) {
      //再表示 Boundaries
      removeBoundaries()
      SettingsChangedJournalBoundariesEnable(newSet)
    }

    if (
      isCommonSettingsChanged(oldSet, newSet) === true
      || oldSet.booleanDayOfWeek !== newSet.booleanDayOfWeek
      || oldSet.longOrShort !== newSet.longOrShort
      || oldSet.booleanWeekNumber !== newSet.booleanWeekNumber
      || oldSet.weekNumberOfTheYearOrMonth !== newSet.weekNumberOfTheYearOrMonth
      || oldSet.booleanRelativeTime !== newSet.booleanRelativeTime
      || oldSet.booleanWeeklyJournal !== newSet.booleanWeeklyJournal
      || oldSet.booleanWeekNumberHideYear !== newSet.booleanWeekNumberHideYear
      || oldSet.booleanSettingsButton !== newSet.booleanSettingsButton
      || oldSet.booleanMonthlyJournalLink !== newSet.booleanMonthlyJournalLink
      || oldSet.underHolidaysAlert !== newSet.underHolidaysAlert
      || oldSet.booleanBesideJournalTitle !== newSet.booleanBesideJournalTitle
    ) {
      //再表示 Behind Journal Title
      removeTitleQuery()
      setTimeout(() => querySelectorAllTitle(newSet.booleanBesideJournalTitle as boolean), 500)
    }


    // weeklyEmbed
    if (oldSet.weeklyEmbed !== newSet.weeklyEmbed)
      if (newSet.weeklyEmbed === true)
        weeklyEmbed() //styleを追加する
      else
        removeProvideStyle(keyThisWeekPopup) //styleを削除する


    //weeklyJournalHeadlineProperty
    if (
      oldSet.weeklyJournalHeadlineProperty !== newSet.weeklyJournalHeadlineProperty
      && oldSet.weeklyJournalHeadlineProperty !== ""
      && newSet.weeklyJournalHeadlineProperty !== ""
    ) //空白の場合は実行しない
      logseq.Editor.renamePage(oldSet.weeklyJournalHeadlineProperty as string, newSet.weeklyJournalHeadlineProperty as string) //ページ名を変更する


    //20240108 boundariesを下側に表示する
    if (oldSet.boundariesBottom !== newSet.boundariesBottom)
      if (newSet.boundariesBottom === true)
        parent.document.body.classList!.add("boundaries-bottom")
      else
        parent.document.body.classList!.remove("boundaries-bottom")


    // 20240121 祝日表示に関するトグル
    if (oldSet.booleanBoundariesHolidays !== newSet.booleanBoundariesHolidays
      || oldSet.underHolidaysAlert !== newSet.underHolidaysAlert)
      if (newSet.booleanBoundariesHolidays === true
        || newSet.underHolidaysAlert === true) //どちらかがオンの場合
        getHolidaysBundle(newSet.holidaysCountry as string, { settingsChanged: true }) //バンドルを取得する
      else
        if (newSet.booleanBoundariesHolidays === false
          && newSet.underHolidaysAlert === false) //両方オフの場合
          removeHolidaysBundle() //バンドルを削除する

    if (oldSet.holidaysCountry !== newSet.holidaysCountry
      || oldSet.holidaysState !== newSet.holidaysState
      || oldSet.holidaysRegion !== newSet.holidaysRegion) //国名などが変更された場合
      getHolidaysBundle(newSet.holidaysCountry as string, { settingsChanged: true }) //バンドルを取得する


    // 週番号のフォーマットを変更する
    if (oldSet.weekNumberChangeQ === false
      && newSet.weekNumberChangeQ === true)
      changeWeekNumberToQuarterly("-", false) //2023-W01からW53までと2024-W01からW53まで。
    else
      if (oldSet.weekNumberChangeQS === false
        && newSet.weekNumberChangeQS === true)
        changeWeekNumberToQuarterly("/", false) //2023/W01からW53までと2024/W01からW53まで。
      else
        if (oldSet.weekNumberChangeRevert === false
          && newSet.weekNumberChangeRevert === true)
          changeWeekNumberToQuarterly("/", true) //2023/Q1/W01からQ4/W53までと2024/Q1/W01からQ4/W53まで。
        else
          if (oldSet.weekNumberChangeSlash === false
            && newSet.weekNumberChangeSlash === true)
            changeWeekNumberForSlash()

    if (oldSet.booleanWeeklyJournal === true
      && newSet.booleanWeeklyJournal === false)
      //#weeklyJournalNavを削除する
      removeElementById("weeklyJournalNav")
    //else trueになったときの実装はまだなし
    else
      if (oldSet.booleanMonthlyJournal === true
        && newSet.booleanMonthlyJournal === false)
        //#monthlyJournalNavを削除する
        removeElementById("monthlyJournalNav")
      else
        if (oldSet.booleanQuarterlyJournal === true
          && newSet.booleanQuarterlyJournal === false)
          //#quarterlyJournalNavを削除する
          removeElementById("quarterlyJournalNav")
        else
          if (oldSet.booleanYearlyJournal === true
            && newSet.booleanYearlyJournal === false)
            //#yearlyJournalNavを削除する
            removeElementById("yearlyJournalNav")


    //CAUTION: 日付形式が変更された場合は、re-indexをおこなうので、問題ないが、言語設定が変更された場合は、その設定は、すぐには反映されない。プラグインの再読み込みが必要になるが、その頻度がかなり少ないので問題ない。
    if (processingSettingsChanged) return
    processingSettingsChanged = true
    getUserConfig()
    setTimeout(() => processingSettingsChanged === false, 1000)


  })
}  // end_onSettingsChanged



//Journal boundariesを表示する 設定変更時に実行
export const SettingsChangedJournalBoundariesEnable = (newSet: LSPluginBaseInfo["settings"]) => {
  if (newSet.booleanBoundariesAll === true)
    setTimeout(() => {
      if (newSet.booleanJournalsBoundaries === true
        && parent.document.getElementById("journals") as Node)
        boundaries("journals")
      else
        if (newSet.booleanBoundaries === true
          && parent.document.body.querySelector("div#main-content-container div.is-journals.page>div.relative") as Node)
          boundaries("is-journals")
        else
          if (newSet.booleanBoundariesOnWeeklyJournal === true
            && parent.document.body.querySelector("div#main-content-container div.page.relative>div.relative") as Node)
            boundaries("weeklyJournal")
    },
      100)
}


// 年間のすべての週番号の配列を用意する
const getWeekList = () => Array.from({ length: 53 }, (_, i) => i + 1)

// 2022年から現在の年+1年までの週番号の配列を用意する
const getTargetList = () => Array.from({ length: (new Date().getFullYear()) - 2022 + 2 }, (_, i) => (2022 + i).toString())


// 週番号のフォーマットを変更する - から/に変更する
const changeWeekNumberForSlash = () => {
  if (processingRenamePage) return
  processingRenamePage = true
  const weekList: number[] = getWeekList()
  const targetList: string[] = getTargetList()
  for (const year of targetList)
    for (const week of weekList) {
      const weekNumber = week.toString().padStart(2, "0")
      logseq.Editor.getPage(`${year}-W${weekNumber}`).then((page: { uuid: PageEntity["uuid"] } | null) => {
        if (page) {
          logseq.Editor.renamePage(`${year}-W${weekNumber}`, `${year}/W${weekNumber}`)
          console.log(`Page ${year}-W${weekNumber} has been renamed to ${year}/W${weekNumber}.`)
        }
        else
          console.log(`Page ${year}-W${weekNumber} does not exist.`)
      })
    }
  logseq.UI.showMsg("Week number has been changed to the quarterly format.", "info", { timeout: 5000 })
  setTimeout(() => {
    processingRenamePage = false
    logseq.updateSettings({ weekNumberChangeSlash: false })
  }, 2000)
}


// 週番号のフォーマットを変更する 四半期との変換
const changeWeekNumberToQuarterly = async (separateString: string, revert: boolean) => {
  if (processingRenamePage) return
  processingRenamePage = true

  const targetList: string[] = getTargetList()
  const targetList2 = ["Q1", "Q2", "Q3", "Q4"]
  const weekList = getWeekList()
  for (const year of targetList)
    for (const week of weekList) {
      const weekNumber = week.toString().padStart(2, "0")
      if (revert === true) {
        const weekNumberQuarter = targetList2[Math.floor((week - 1) / 13)]
        logseq.Editor.getPage(`${year}/${weekNumberQuarter}/W${weekNumber}`).then((page: { uuid: PageEntity["uuid"] } | null) => {
          if (page) {
            logseq.Editor.renamePage(`${year}/${weekNumberQuarter}/W${weekNumber}`, `${year}${separateString}W${weekNumber}`)
            console.log(`Page ${year}/${weekNumberQuarter}/W${weekNumber} has been renamed to ${year}${separateString}W${weekNumber}.`)
          }
          else
            console.log(`Page ${year}/${weekNumberQuarter}/W${weekNumber} does not exist.`)
        })
      } else {
        logseq.Editor.getPage(`${year}${separateString}W${weekNumber}`).then((page: { uuid: PageEntity["uuid"] } | null) => {
          if (page) {
            //四半世紀を入れる
            const weekNumberQuarter = targetList2[Math.floor((week - 1) / 13)]
            logseq.Editor.renamePage(`${year}${separateString}W${weekNumber}`, `${year}/${weekNumberQuarter}/W${weekNumber}`)
            console.log(`Page ${year}${separateString}W${weekNumber} has been renamed to ${year}/${weekNumberQuarter}/W${weekNumber}.`)
          }
          else
            console.log(`Page ${year}${separateString}W${weekNumber} does not exist.`)
        })
      }
    }
  logseq.UI.showMsg("Week number has been changed to the quarterly format.", "info", { timeout: 5000 })
  setTimeout(() => {
    processingRenamePage = false
    logseq.updateSettings({ weekNumberChangeQ: false })
  }, 2000)
}
