import { LSPluginBaseInfo, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { addDays, Day, eachDayOfInterval, getISOWeek, getWeek, isSameDay, isSameISOWeek, isSameMonth, isSameWeek, isToday, startOfISOWeek, startOfMonth, startOfWeek } from "date-fns"
import { format } from "date-fns/format"
import { t } from "logseq-l10n"
import { getConfigPreferredDateFormat, getConfigPreferredLanguage, pluginName } from "."
import { openPageToSingleDay } from "./boundaries"
import { holidaysWorld, lunarString } from "./holidays"
import { getWeeklyNumberFromDate, getWeeklyNumberString, localizeDayOfWeekString, localizeMonthDayString, localizeMonthString, openPageFromPageName, removeElementById } from "./lib"
import { isCommonSettingsChanged } from "./onSettingsChanged"

export const keyLeftCalendarContainer = "left-calendar-container"

export let currentCalendarDate: Date = new Date() //今日の日付を取得


export const loadLeftCalendar = () => {

    //プラグイン設定変更時
    logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
        if (oldSet.booleanLeftCalendar !== newSet.booleanLeftCalendar) {
            if (newSet.booleanLeftCalendar === true)
                main()//表示する
            else
                removeElementById(keyLeftCalendarContainer)//消す
        }
        if (oldSet.booleanLcWeekNumber !== newSet.booleanLcWeekNumber
            || oldSet.booleanLcHolidays !== newSet.booleanLcHolidays
            || oldSet.lcHolidaysAlert !== newSet.lcHolidaysAlert
            || isCommonSettingsChanged(newSet, oldSet) === true //共通処理
        )
            refreshCalendar(currentCalendarDate, false, false)

    })

    if (logseq.settings!.booleanLeftCalendar === true)
        main()

}

const main = () => {
    if (parent.document.getElementById(keyLeftCalendarContainer))
        removeElementById(keyLeftCalendarContainer)//すでに存在する場合は削除する

    setTimeout(async () => {
        //左サイドバーのフッターに追加する
        const footerElement: HTMLElement | null = parent.document.querySelector("div#main-container div#left-sidebar>div.left-sidebar-inner footer.create") as HTMLElement | null
        if (footerElement === null) return //nullの場合はキャンセル

        const containerElement: HTMLDivElement = document.createElement("div")
        containerElement.className = "nav-content-item mt-6 is-expand flex-shrink-0"
        containerElement.id = keyLeftCalendarContainer
        const detailsElement: HTMLDetailsElement = document.createElement("details")
        detailsElement.className = "nav-content-item-inner"
        detailsElement.open = true
        const summaryElement: HTMLElement = document.createElement("summary")
        summaryElement.className = "header items-center pl-4"
        summaryElement.style.cursor = "row-resize"
        summaryElement.style.backgroundColor = "var(--ls-tertiary-background-color)"
        summaryElement.innerText = t("Monthly Calendar")// タイトルを入れる
        summaryElement.title = pluginName //プラグイン名を入れる
        const innerElement: HTMLDivElement = document.createElement("div")
        innerElement.className = "bg"
        innerElement.id = "left-calendar-inner"
        detailsElement.appendChild(summaryElement)
        detailsElement.appendChild(innerElement)
        containerElement.appendChild(detailsElement)
        footerElement.insertAdjacentElement("beforebegin", containerElement)

        //スペースに表示する
        setTimeout(() => {
            const innerElement: HTMLDivElement | null = parent.document.getElementById("left-calendar-inner") as HTMLDivElement | null

            if (innerElement === null) return //nullの場合はキャンセル

            if (innerElement.dataset.flag !== "true")//すでに存在する場合はキャンセル
                createCalendar(new Date(), getConfigPreferredDateFormat(), innerElement)

            innerElement.dataset.flag = "true" //フラグを立てる
        }, 1)

    }, 500)
}



//月間カレンダーを作成する
export const createCalendar = (targetDate: Date, preferredDateFormat: string, innerElement: HTMLDivElement, flag?: { singlePage?: boolean, weekly?: boolean }) => {
    const calendarElement: HTMLElement = document.createElement("div")
    calendarElement.className = "flex items-center"
    calendarElement.id = "left-calendar"


    currentCalendarDate = targetDate // 更新
    const year = targetDate.getFullYear() //年を取得
    const month = targetDate.getMonth() + 1 //0から始まるため+1する
    const localizeMonthLong = localizeMonthString(targetDate, true) //月の文字列を取得
    const startOfMonthDay: Date = startOfMonth(targetDate) //月の最初の日を取得
    const ISO: boolean = logseq.settings!.weekNumberFormat === "ISO(EU) format" ? true : false //ISO(EU) formatかどうか
    const weekStartsOn: Day = logseq.settings!.boundariesWeekStart === "Monday" ? 1 : logseq.settings!.boundariesWeekStart === "Saturday" ? 6 : 0

    //カレンダーは7列x5行。週番号の1列を左に追加して、合計8列にする

    const calendarFirstDay: Date = logseq.settings!.boundariesWeekStart === "unset"
        && ISO ?
        startOfISOWeek(startOfMonthDay)
        : startOfWeek(startOfMonthDay, { weekStartsOn })
    const calendarLastDay: Date = addDays(calendarFirstDay, 34) //35日後の日付を取得
    const eachDays = eachDayOfInterval({ start: calendarFirstDay, end: calendarLastDay })//すべての行の日付を取得

    //一行目は曜日名 (ローカライズ)
    const dayOfWeekArray: string[] = eachDays.slice(0, 7).map(date => localizeDayOfWeekString(date, false))

    const enableWeekNumber = logseq.settings!.booleanLcWeekNumber as boolean //週番号を表示するかどうか
    const formatYearMonthTargetDate: string = format(targetDate, "yyyy/MM")
    const formatYearMonthThisMonth: string = format(new Date(), "yyyy/MM")

    //ここまでのデータを仮で、mainDivElementにすべて出力したい
    //tableで、一行目、二行目、三行目、四行目、五行目、六行目、七行目、八行目を作成する
    // ISO === true ? getISOWeek(date) : getWeek(date)}W
    calendarElement.innerHTML = ""
    const tableElement = document.createElement("table")

    // <thead>を作成
    const theadElement = document.createElement("thead")


    // 1段目のナビゲーションを作成
    const headerNavElement = document.createElement("tr")

    // 前月に戻るボタン
    const prevHeaderCell = document.createElement("th")
    const prevButton = document.createElement("button")
    prevButton.textContent = "<"
    prevButton.className = "cursor"
    prevButton.title = t("Previous month")
    prevButton.addEventListener("click", () => {
        const prevMonth = new Date(targetDate)
        prevMonth.setMonth(prevMonth.getMonth() - 1) //前月の日付を取得
        removeCalendarAndNav()//カレンダーとナビゲーションを削除
        createCalendar(prevMonth, preferredDateFormat, innerElement) //前月のカレンダーを再描画
    }, { once: true })
    prevHeaderCell.appendChild(prevButton)
    headerNavElement.appendChild(prevHeaderCell)

    // 月のセルを作成
    const monthHeaderCell = document.createElement("th")
    monthHeaderCell.textContent = localizeMonthLong

    monthHeaderCell.addEventListener("click", ({ shiftKey }) => openPageFromPageName(formatYearMonthTargetDate, shiftKey))
    monthHeaderCell.classList.add("cursor")
    monthHeaderCell.title = formatYearMonthTargetDate
    monthHeaderCell.style.fontSize = "1.4em"
    monthHeaderCell.colSpan = enableWeekNumber ? 4 : 3
    headerNavElement.appendChild(monthHeaderCell)
    theadElement.appendChild(headerNavElement)

    // 今月に戻るボタン
    const thisMonthHeaderCell = document.createElement("th")
    thisMonthHeaderCell.colSpan = 2
    const thisMonthButton = document.createElement("button")
    thisMonthButton.textContent = formatYearMonthThisMonth
    thisMonthButton.title = t("This month")
    thisMonthButton.className = "cursor lcThisMonthButton"
    thisMonthButton.addEventListener("click", () => {
        removeCalendarAndNav()//カレンダーとナビゲーションを削除
        createCalendar(new Date(), preferredDateFormat, innerElement) //今月のカレンダーを再描画
    }, { once: true })
    thisMonthHeaderCell.appendChild(thisMonthButton)
    headerNavElement.appendChild(thisMonthHeaderCell)

    // 次月に進むボタン
    const nextHeaderCell = document.createElement("th")
    const nextButton = document.createElement("button")
    nextButton.textContent = ">"
    nextButton.className = "cursor"
    nextButton.title = t("Next month")
    nextButton.addEventListener("click", () => {
        const nextMonth = new Date(targetDate)
        nextMonth.setMonth(nextMonth.getMonth() + 1) //次月の日付を取得
        removeCalendarAndNav()//カレンダーとナビゲーションを削除
        createCalendar(nextMonth, preferredDateFormat, innerElement) //次月のカレンダーを再描画
    }, { once: true })
    nextHeaderCell.appendChild(nextButton)
    headerNavElement.appendChild(nextHeaderCell)

    theadElement.appendChild(headerNavElement)


    // 2段目の曜日名を作成
    const headerRowElement = document.createElement("tr")

    // 週番号のセルを作成
    if (enableWeekNumber) {
        const emptyHeaderCell = document.createElement("th")
        emptyHeaderCell.textContent = "W"
        headerRowElement.appendChild(emptyHeaderCell)
    }

    // 曜日名のセルを作成
    for (const day of dayOfWeekArray) {
        const dayHeaderCell = document.createElement("th")
        dayHeaderCell.textContent = day
        // ※曜日名の着色は難しいので省略
        headerRowElement.appendChild(dayHeaderCell)
    }
    theadElement.appendChild(headerRowElement)
    tableElement.appendChild(theadElement)


    // 3段目以降の日付を作成
    const tbodyElement = document.createElement("tbody")
    eachDays.forEach((date, index) => {
        const weekNumber = enableWeekNumber ?
            `${ISO ?
                getISOWeek(date)
                : getWeek(date, { weekStartsOn })}` : ""
        const day = date.getDate().toString()

        // 先頭の日付の場合
        if (index % 7 === 0) {
            const rowElement = document.createElement("tr")


            // 週番号を表示するかどうか
            if (enableWeekNumber) {
                const weekNumberCell = document.createElement("td")// 週番号
                weekNumberCell.textContent = weekNumber
                weekNumberCell.title = t("Week")
                if (weekNumber === "W53")// 53週の場合は透明度を下げる
                    weekNumberCell.style.opacity = "0.5"
                weekNumberCell.style.fontSize = "0.85em"// 週番号のフォントサイズを小さくする
                const { year, weekString, quarter } = getWeeklyNumberFromDate(date, logseq.settings?.weekNumberFormat === "US format" ? 0 : 1) // 週番号を取得する
                const pageName = getWeeklyNumberString(year, weekString, quarter) // 週番号からユーザー指定文字列を取得する
                if (logseq.settings!.booleanWeeklyJournal === true) {
                    weekNumberCell.addEventListener("click", ({ shiftKey }) => openPageFromPageName(pageName, shiftKey))
                    weekNumberCell.classList.add("cursor")
                    logseq.Editor.getPage(pageName, { includeChildren: false })
                        .then((pageEntity: { uuid: PageEntity["uuid"] } | null) => {
                            if (pageEntity)
                                weekNumberCell.style.textDecoration = "underline"
                        })
                    weekNumberCell.title = pageName
                }
                rowElement.appendChild(weekNumberCell)
            }


            const dayCell = document.createElement("td")
            dayCell.textContent = day
            const holiday = checkDay(date, month, dayCell, preferredDateFormat, innerElement)
            const pageName = format(date, preferredDateFormat)
            dayCell.addEventListener("click", openPageToSingleDay(pageName, logseq.settings!.booleanBoundariesFuturePage as boolean))
            dayCell.classList.add("cursor")
            dayCell.title = holiday !== "" ?
                holiday + "\n" + pageName
                : pageName
            if (flag?.singlePage === true
                && isSameDay(date, targetDate))
                dayCell.style.border = `3px solid ${logseq.settings!.boundariesHighlightColorSinglePage}`
            else
                if (flag?.weekly === true
                    && (ISO ?
                        isSameISOWeek(date, targetDate)
                        : isSameWeek(date, targetDate, { weekStartsOn })))
                    dayCell.style.borderBottom = `3px solid ${logseq.settings!.boundariesHighlightColorSinglePage}`
            rowElement.appendChild(dayCell)
            tbodyElement.appendChild(rowElement)
        } else {
            // 2番目以降の日付の場合
            const dayCell = document.createElement("td")
            dayCell.textContent = day
            const holiday = checkDay(date, month, dayCell, preferredDateFormat, innerElement)
            const pageName = format(date, preferredDateFormat)
            dayCell.addEventListener("click", openPageToSingleDay(pageName, logseq.settings!.booleanBoundariesFuturePage as boolean))
            dayCell.classList.add("cursor")
            dayCell.title = holiday !== "" ?
                holiday + "\n" + pageName
                : pageName
            if (flag?.singlePage === true
                && isSameDay(date, targetDate))
                dayCell.style.border = `3px solid ${logseq.settings!.boundariesHighlightColorSinglePage}`
            else
                if (flag?.weekly === true
                    && (ISO ?
                        isSameISOWeek(date, targetDate)
                        : isSameWeek(date, targetDate, { weekStartsOn })))
                    dayCell.style.borderBottom = `3px solid ${logseq.settings!.boundariesHighlightColorSinglePage}`

            const lastRowElement = tbodyElement.lastElementChild as HTMLTableRowElement
            lastRowElement.appendChild(dayCell)
        }
    })

    tableElement.appendChild(tbodyElement)
    calendarElement.appendChild(tableElement)
    innerElement.appendChild(calendarElement)


    //テスト出力用div
    //     const divEle: HTMLDivElement = document.createElement("div")
    //     divEle.innerHTML = `
    // <hr/>
    // <div id="testOutput">
    // <pre>
    // today: ${format(today, preferredDateFormat)}
    // year: ${year}
    // month: ${month}
    // localizeMonthLong: ${localizeMonthLong}
    // startOfMonthDay: ${format(startOfMonthDay, preferredDateFormat)}
    // calendarFirstDay: ${format(calendarFirstDay, preferredDateFormat)}
    // calendarLastDay: ${format(calendarLastDay, preferredDateFormat)}
    // eachDayOfInterval: ${eachDays.length}
    // eachDays: ${eachDays.map(date => format(date, preferredDateFormat)).join(", ")}
    // dayOfWeekArray: ${dayOfWeekArray.join(", ")}
    // </pre>
    // </div>
    // }
    // `
    //     leftCalendarElement.appendChild(divEle)
}

//カレンダーとナビゲーションを削除 (再描画時に使用)
export const removeCalendarAndNav = () => {

    //.leftCalendarHolidayAlertを削除
    const leftCalendarHolidayAlerts = parent.document.querySelectorAll(".leftCalendarHolidayAlert") as NodeListOf<HTMLDivElement>
    if (leftCalendarHolidayAlerts)
        for (const leftCalendarHolidayAlert of leftCalendarHolidayAlerts)
            leftCalendarHolidayAlert.remove()

    // #left-calendarを削除
    removeElementById("left-calendar")
}


const checkDay = (date: Date, month: number, dayCell: HTMLElement, preferredDateFormat: string, parentElementForHolidays: HTMLElement): string => {

    // 土日の色を変える
    if (logseq.settings!.booleanWeekendsColor === true)
        if (date.getDay() === 6) { //土曜日
            dayCell.style.color = 'var(--ls-wb-stroke-color-blue)'
            dayCell.style.fontWeight = "1500"
        } else
            if (date.getDay() === 0) { //日曜日
                dayCell.style.color = 'var(--ls-wb-stroke-color-red)'
                dayCell.style.fontWeight = "1500"
            }

    // 月が異なる場合はopacityを下げる
    if (date.getMonth() !== month - 1) {
        dayCell.style.opacity = "0.4"
        dayCell.style.fontSize = "0.9em"
    }

    // 今日の日付の場合は背景色を変える
    const checkIsToday: boolean = isToday(date)
    if (checkIsToday === true) {
        dayCell.style.border = `2px solid ${logseq.settings!.boundariesHighlightColorToday}`
        dayCell.style.borderRadius = "50%"
    }

    if (logseq.settings!.booleanBoundariesIndicator === true) {
        logseq.Editor.getPage(format(date, preferredDateFormat)).then((pageEntity: { uuid: PageEntity["uuid"] } | null) => {
            if (pageEntity)
                dayCell.style.textDecoration = "underline"
        })
    }

    if (logseq.settings!.booleanLcHolidays === true) {
        const configPreferredLanguage = getConfigPreferredLanguage()
        // Chinese lunar-calendar and holidays
        const holiday: string = logseq.settings!.booleanLunarCalendar === true // プラグイン設定で太陰暦オンの場合
            && (configPreferredLanguage === "zh-Hant" //中国語の場合
                || configPreferredLanguage === "zh-CN") ?
            lunarString(date, dayCell, false)
            :
            holidaysWorld(date, dayCell, false) // World holidays
        if (
            holiday !== "" //祝日がある場合
            && ((logseq.settings!.lcHolidaysAlert === "Today only"
                && checkIsToday === true) //今日にマッチする場合
                || logseq.settings!.lcHolidaysAlert === "Monthly") //すべて
        ) {
            //leftCalendarElementに、祝日の情報を追加する
            const holidayEle: HTMLDivElement = document.createElement("div")
            holidayEle.className = "text-sm text-gray-500 ml-4 leftCalendarHolidayAlert"
            holidayEle.textContent = `${checkIsToday === true ?
                t("Today")
                : localizeMonthDayString(date)} >> ${holiday}`
            parentElementForHolidays.insertAdjacentElement("afterend", holidayEle)
        }
        return holiday
    }
    return ""
}
export const refreshCalendar = (targetDate: Date, singlePage: boolean, weekly: boolean) => {
    const innerElement: HTMLDivElement | null = parent.document.getElementById("left-calendar-inner") as HTMLDivElement | null
    if (innerElement) {
        removeCalendarAndNav()
        createCalendar(
            targetDate,
            getConfigPreferredDateFormat(),
            innerElement,
            { singlePage, weekly })
    }
}
export const refreshCalendarCheckSameMonth = () => {
    const today = new Date()
    if (isSameMonth(currentCalendarDate, today) === false)
        refreshCalendar(today, false, false)
}
