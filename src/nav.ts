import { addWeeks, addYears, eachDayOfInterval, format, getWeeksInMonth, isSameMonth, subMonths, subWeeks, subYears } from "date-fns"
import { t } from "logseq-l10n"
import { getConfigPreferredDateFormat } from "."
import { getWeeklyNumberFromDate, localizeDayOfWeekDayString, localizeMonthString, openPageFromPageName } from "./lib"


export const createNavLink = (text: string, pageName: string) => {
      const link = document.createElement("a")
      link.textContent = text
      link.classList.add("text-sm")
      link.title = pageName
      link.style.marginRight = "1.0em"
      link.addEventListener("click", ({ shiftKey }) => openPageFromPageName(pageName, shiftKey)
      )
      return link
}


export const createNavLinkWeekNumber = (day: Date, ISO: boolean, configWeekNumberFormat: string) => {
      const monthFirstWeekNumber: {
            year: number
            weekString: string
            quarter: number
      } = getWeeklyNumberFromDate(day, ISO ? 1 : 0)
      // weekNumberFormat ["YYYY-Www", "YYYY/qqq/Www", "YYYY/Www"]
      const linkString = configWeekNumberFormat === "YYYY-Www" ?
            `${monthFirstWeekNumber.year}/W${monthFirstWeekNumber.weekString}`
            : configWeekNumberFormat === "YYYY/qqq/Www" ?
                  `${monthFirstWeekNumber.year}/Q${monthFirstWeekNumber.quarter}/W${monthFirstWeekNumber.weekString}`
                  : `${monthFirstWeekNumber.year}/W${monthFirstWeekNumber.weekString}`
      const monthFirstWeekNumberLink = createNavLink(monthFirstWeekNumber.weekString, linkString)
      monthFirstWeekNumberLink.title = linkString
      monthFirstWeekNumberLink.style.marginRight = "1.0em"
      return monthFirstWeekNumberLink
}


export const spanFreeSpace = (text: string, flag?: { sm?: true }) => {
      const space = document.createElement("span")
      space.style.marginRight = "1.0em"
      space.textContent = text
      if (flag && flag.sm)
            space.classList.add("text-sm")
      return space
}


// MonthlyJournal用ナビゲーションを作成する
export const monthlyJournalCreateNav = (
      prevMonth: Date,
      thisMonth: Date,
      nextMonth: Date,
      year: number
) => {
      // parent.document div.page.relativeの中の先頭に挿入する
      const pageRelative = parent.document.querySelector("div.page.relative") as HTMLDivElement | null
      if (!pageRelative
            || pageRelative.dataset.monthlyJournalNav === "true")
            return

      const ISO = logseq.settings!.booleanISOWeek === true ? true : false

      const { quarter, weekString } = getWeeklyNumberFromDate(thisMonth, ISO ? 1 : 0)

      if (pageRelative) {
            pageRelative.dataset.monthlyJournalNav = "true"

            const navElement = document.createElement("div")
            navElement.id = "weekNav"
            navElement.className = "flex justify-center items-center text-sm"


            // Year

            // Prev Year
            const prevYearLink = format(subYears(thisMonth, 1), "yyyy")
            navElement.appendChild(createNavLink(prevYearLink, prevYearLink))

            // This Year
            const thisYearLink = year.toString()
            const thisYearNavLink = createNavLink(thisYearLink, thisYearLink)
            thisYearNavLink.style.textDecoration = "underline"
            navElement.appendChild(thisYearNavLink)

            if (logseq.settings!.weekNumberOptions === "YYYY/qqq/Www") {
                  // Quarter
                  const putSpanQuarterMark = createNavLink(`Q${quarter}`, `${year}/Q${quarter}/W${weekString}`)
                  putSpanQuarterMark.style.textDecoration = "underline"
                  navElement.appendChild(putSpanQuarterMark)
            }

            // Next Year
            const nextYearLink = format(addYears(thisMonth, 1), "yyyy")
            navElement.appendChild(createNavLink(nextYearLink, nextYearLink))

            // span ">",{sm:true}
            navElement.appendChild(spanFreeSpace(">", { sm: true }))


            // Month

            // Prev Month
            navElement.appendChild(createNavLink(localizeMonthString(prevMonth, true), format(prevMonth, "yyyy/MM")))

            // This Month
            const thisMonthLink = spanFreeSpace(localizeMonthString(thisMonth, true))
            thisMonthLink.style.textDecoration = "underline"
            navElement.appendChild(thisMonthLink)

            // Next Month
            navElement.appendChild(createNavLink(localizeMonthString(nextMonth, true), format(nextMonth, "yyyy/MM")))

            // span ">",{sm:true}
            navElement.appendChild(spanFreeSpace(">", { sm: true }))


            // Week

            // span "Week"
            navElement.appendChild(spanFreeSpace(t("Week")))


            const configWeekNumberFormat = logseq.settings!.weekNumberOptions as string
            const weekOfMonth = getWeeksInMonth(thisMonth, { weekStartsOn: ISO ? 1 : 0 }) // 1:月曜日
            for (let i = 0; i < weekOfMonth; i++) {
                  const week = addWeeks(thisMonth, i)
                  if (isSameMonth(week, thisMonth) === false) break
                  navElement.appendChild(createNavLinkWeekNumber(week, ISO, configWeekNumberFormat))
            }

            // span ">",{sm:true}
            navElement.appendChild(spanFreeSpace(">", { sm: true }))


            pageRelative.insertBefore(navElement, pageRelative.firstChild)
      }
}



// WeeklyJournal用ナビゲーションを作成する
export const weeklyJournalCreateNav = (
      ISO: boolean,
      yearString: string,
      weekNumberString: string,
      weekStart: Date,
      weekEnd: Date,
      prevWeekStart: Date,
      nextWeekStart: Date,
): Promise<boolean> => {

      // parent.document div.page.relativeの中の先頭に挿入する
      const pageRelative = parent.document.querySelector("div.page") as HTMLDivElement | null

      if (!pageRelative
            || pageRelative.dataset.weeklyJournalNav === "true")
            return Promise.resolve(false)

      pageRelative.dataset.weeklyJournalNav = "true"
      const navElement = document.createElement("div")
      navElement.id = "weekNav"


      // Year

      // This Year
      const thisYearNavLink = createNavLink(yearString, yearString)
      thisYearNavLink.style.textDecoration = "underline"
      navElement.appendChild(thisYearNavLink)

      if (logseq.settings!.weekNumberOptions === "YYYY/qqq/Www") {
            // Quarter
            const { quarter, weekString } = getWeeklyNumberFromDate(weekStart, ISO ? 1 : 0)
            const putSpanQuarterMark = createNavLink(`Q${quarter}`, `${yearString}/Q${quarter}`)
            putSpanQuarterMark.style.textDecoration = "underline"
            navElement.appendChild(putSpanQuarterMark)
      }

      // WeekStartの月
      const thisMonthNavLink = createNavLink(localizeMonthString(weekStart, true), format(weekStart, "yyyy/MM"))
      thisMonthNavLink.style.textDecoration = "underline"
      navElement.appendChild(thisMonthNavLink)

      // WeekEndの月
      if (isSameMonth(weekStart, weekEnd) === false) // 月が異なる場合のみ表示
            navElement.appendChild(createNavLink(localizeMonthString(weekEnd, true), format(weekEnd, "yyyy/MM")))

      // span ">",{sm:true}
      navElement.appendChild(spanFreeSpace(">", { sm: true }))



      // Week

      // span "Week"
      navElement.appendChild(spanFreeSpace(t("Week")))

      // ふたつ前の週番号
      navElement.appendChild(createNavLinkWeekNumber(subWeeks(weekStart, 2), ISO, logseq.settings!.weekNumberOptions as string))

      // ひとつ前の週番号
      navElement.appendChild(createNavLinkWeekNumber(prevWeekStart, ISO, logseq.settings!.weekNumberOptions as string))

      // 今週の週番号
      const thisWeekLink = spanFreeSpace(weekNumberString)
      thisWeekLink.style.textDecoration = "underline"
      navElement.appendChild(thisWeekLink)

      // ひとつ次の週番号
      navElement.appendChild(createNavLinkWeekNumber(nextWeekStart, ISO, logseq.settings!.weekNumberOptions as string))

      // ふたつ次の週番号
      navElement.appendChild(createNavLinkWeekNumber(addWeeks(weekStart, 2), ISO, logseq.settings!.weekNumberOptions as string))

      // span ">",{sm:true}
      navElement.appendChild(spanFreeSpace(">", { sm: true }))


      // day

      for (const day of eachDayOfInterval({ start: weekStart, end: weekEnd }))
            navElement.appendChild(createNavLink(localizeDayOfWeekDayString(day), format(day, getConfigPreferredDateFormat())))


      pageRelative.insertBefore(navElement, pageRelative.firstChild)

      return Promise.resolve(true)
}
