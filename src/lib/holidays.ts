import Holidays from "date-holidays"
import { HolidayUtil, Lunar } from 'lunar-typescript'


let holidaysBundle: Holidays | null // バンドルを作成するための変数
let alreadyHolidayBundle: boolean = false // プラグイン設定変更時にバンドルを更新するためのフラグ

// date-holidaysのバンドルを作成する
export const getHolidaysBundle = (userLanguage: string, flag?: { settingsChanged?: boolean, already?: boolean }) => {

  if (flag
    && flag.already === true
    && alreadyHolidayBundle === true)
    return // 既にバンドルを作成している場合は作成しないフラグでキャンセルする

  if ((flag
    && flag.settingsChanged !== true
    && logseq.settings!.booleanBoundariesHolidays === false) // 設定変更時はバンドルを更新する
    || logseq.settings!.booleanLunarCalendar === true // 太陰暦オンの場合はバンドルを作成しない
    && ((userLanguage === "zh-Hant"
      || userLanguage === "zh-CN")) // 中国の祝日はdate-holidaysではなくlunar-typescriptを使用する
  ) return

  userLanguage = (logseq.settings!.holidaysCountry as string || "US: United States of America").split(":")[0] //プラグイン設定で指定された言語を取得する

  if (holidaysBundle === null
    || alreadyHolidayBundle === false)
    holidaysBundle = new Holidays(userLanguage, logseq.settings!.holidaysState as string, logseq.settings!.holidaysRegion as string, { types: ["public"] }) // バンドルを作成する 公共の祝日のみに限定する
  else
    holidaysBundle.init(userLanguage) // プラグイン設定変更時にバンドルを更新する
  alreadyHolidayBundle = true
}

export const exportHolidaysBundle = () => holidaysBundle // バンドルをエクスポートする

export const removeHolidaysBundle = () => {
  holidaysBundle = null
  alreadyHolidayBundle = false
}

// For Chinese lunar-calendar and holidays
export const lunarString = (targetDate: Date, dayElement: HTMLSpanElement, addToElementTip: boolean): string => {
  const getHoliday = HolidayUtil.getHoliday(targetDate.getFullYear(), targetDate.getMonth() + 1, targetDate.getDate()) // year, month, day
  const getHolidayName = getHoliday ? getHoliday.getName() : undefined
  const string = (Lunar.fromDate(targetDate).getDayInChinese() as string)
  if (getHolidayName) {
    if (addToElementTip === true)
      dayElement.title = string + ` (${getHolidayName})` + "\n"// 中国の祝日
    dayElement.style.border = `2px solid var(${logseq.settings!.choiceHolidaysColor as string || "--highlight-bg-color"})`
  } else
    dayElement.title = string + "\n"// 祝日がない場合は、中国の伝統的な暦を表示する(旧暦) 
  return string
}


// For World holidays
export const holidaysWorld = (targetDate: Date, dayElement: HTMLSpanElement, addToElementTip: boolean): string => {

  const holidaysBundle = exportHolidaysBundle()
  if (!holidaysBundle) return ""
  const checkHoliday = holidaysBundle.isHoliday(targetDate)

  if (checkHoliday !== false
    && checkHoliday[0].type === "public") {
    const holidayName = checkHoliday[0].name
    if (holidayName) {
      if (addToElementTip === true)
        dayElement.title = holidayName + "\n"
      dayElement.style.border = `2px solid var(${logseq.settings!.choiceHolidaysColor as string || "--highlight-bg-color"})`
      return holidayName
    }
  }
  return ""
}