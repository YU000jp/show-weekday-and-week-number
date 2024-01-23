import Holidays from "date-holidays"

let holidaysBundle: Holidays | null // バンドルを作成するための変数
let alreadyHolidayBundle: boolean = false // プラグイン設定変更時にバンドルを更新するためのフラグ

// date-holidaysのバンドルを作成する
export const getHolidaysBundle = (userLanguage: string, flag?: { settingsChanged?: boolean, already?: boolean }) => {

  if (flag && flag.already === true
    && alreadyHolidayBundle === true)
    return // 既にバンドルを作成している場合は作成しないフラグでキャンセルする

  if ((flag && flag.settingsChanged !== true
    && logseq.settings!.booleanBoundariesHolidays === false) // 設定変更時はバンドルを更新する
    || logseq.settings!.booleanLunarCalendar === true // 太陰暦オンの場合はバンドルを作成しない
    && ((userLanguage === "zh-Hant"
      || userLanguage === "zh-CN")) // 中国の祝日はdate-holidaysではなくlunar-typescriptを使用する
  ) return

  userLanguage = (logseq.settings!.holidaysCountry as string || "US: United States of America").split(":")[0] //プラグイン設定で指定された言語を取得する

  if (holidaysBundle === null || alreadyHolidayBundle === false)
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
