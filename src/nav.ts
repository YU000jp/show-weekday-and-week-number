import { addWeeks, addYears, format, getWeeksInMonth, isSameMonth, subYears } from "date-fns"
import { t } from "logseq-l10n"
import { getWeeklyNumberFromDate, localizeMonthString, openPageFromPageName } from "./lib"


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


export const spanFreeSpace = (text: string) => {
      const space = document.createElement("span")
      space.style.marginRight = "1.0em"
      space.textContent = text
      return space
}


// "<-2024/Q2/W19 2024/Q2/W21->" のように週番号のナビゲーションを作成する
export const monthlyJournalCreateNav = (
      prevMonth: Date,
      thisMonth: Date,
      nextMonth: Date,
      year: number
) => {
      // parent.document div.page.relativeの中の先頭に挿入する
      const pageRelative = parent.document.querySelector("div.page.relative") as HTMLDivElement
      if (!pageRelative || pageRelative.dataset.monthlyJournalNav === "true") {
            return
      }

      //ローカライズする
      const localizePrevMonth = localizeMonthString(prevMonth, true)
      const localizeThisMonth = localizeMonthString(thisMonth, true)
      const localizeNextMonth = localizeMonthString(nextMonth, true)
      const prevMonthLink = format(prevMonth, "yyyy/MM") // ひとつ前のyyyy/mm
      const nextMonthLink = format(nextMonth, "yyyy/MM") // ひとつ次のyyyy/mm
      const ISO = logseq.settings!.booleanISOWeek === true ? true : false

      const { quarter, weekString } = getWeeklyNumberFromDate(thisMonth, ISO ? 1 : 0)

      if (pageRelative) {
            const navElement = document.createElement("div")
            navElement.id = "weekNav"
            navElement.className = "flex justify-center items-center text-sm"


            // Year
            // span "<-"
            const putSpanYearPrevMark = spanFreeSpace("<-")
            navElement.appendChild(putSpanYearPrevMark)

            // Prev Year
            const prevYearLink = format(subYears(thisMonth, 1), "yyyy")
            const prevYearNavLink = createNavLink(prevYearLink, prevYearLink)
            navElement.appendChild(prevYearNavLink)

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
            const nextYearNavLink = createNavLink(nextYearLink, nextYearLink)
            navElement.appendChild(nextYearNavLink)

            // span "->"
            const putSpanYearNextMark = spanFreeSpace("->")
            navElement.appendChild(putSpanYearNextMark)


            // Month
            // span "<-"
            const putSpanMonthPrevMark = spanFreeSpace("<-")
            navElement.appendChild(putSpanMonthPrevMark)

            // Prev Month
            const prevMonthNavLink = createNavLink(localizePrevMonth, prevMonthLink)
            navElement.appendChild(prevMonthNavLink)

            // This Month
            const thisMonthLink = spanFreeSpace(localizeThisMonth)
            thisMonthLink.style.textDecoration = "underline"
            navElement.appendChild(thisMonthLink)

            // Next Month
            const nextMonthNavLink = createNavLink(localizeNextMonth, nextMonthLink)
            navElement.appendChild(nextMonthNavLink)

            // span "->"
            const putSpanMonthNextMark = spanFreeSpace("->")
            navElement.appendChild(putSpanMonthNextMark)


            // Week
            // span "<-"  
            const putSpanWeekPrevMark = spanFreeSpace("<-")
            navElement.appendChild(putSpanWeekPrevMark)

            // span "Week"
            const putSpanWeekMark = spanFreeSpace(t("Week"))
            navElement.appendChild(putSpanWeekMark)


            const configWeekNumberFormat = logseq.settings!.weekNumberOptions as string
            const weekOfMonth = getWeeksInMonth(thisMonth, { weekStartsOn: ISO ? 1 : 0 }) // 1:月曜日
            for (let i = 0; i < weekOfMonth; i++) {
                  const week = addWeeks(thisMonth, i)
                  if (isSameMonth(week, thisMonth) === false) break
                  const weekNumberLink = createNavLinkWeekNumber(week, ISO, configWeekNumberFormat)
                  navElement.appendChild(weekNumberLink)
            }

            // span "->"
            const putSpanWeekNextMark = spanFreeSpace("->")
            navElement.appendChild(putSpanWeekNextMark)


            pageRelative.dataset.monthlyJournalNav = "true"
            pageRelative.insertBefore(navElement, pageRelative.firstChild)
      }
}

