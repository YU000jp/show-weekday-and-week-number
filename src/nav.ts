import { addMonths, addWeeks, addYears, eachDayOfInterval, format, getWeeksInMonth, isSameMonth, subMonths, subWeeks, subYears } from "date-fns"
import { t } from "logseq-l10n"
import { getConfigPreferredDateFormat } from "."
import { getWeeklyNumberFromDate, localizeDayOfWeekDayString, localizeMonthString, openPageFromPageName } from "./lib"
import { create } from "domain"


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
      space.style.paddingRight = "0.88em"
      space.textContent = text
      if (flag && flag.sm)
            space.classList.add("text-sm")
      return space
}


// MonthlyJournal用ナビゲーションを作成する
export const monthlyJournalCreateNav = async (
      monthStartDay: Date,
      year: number
): Promise<boolean> => {

      // parent.document div.page.relative div.relativeの中の先頭に挿入する
      const pageRelative = parent.document.querySelector("div.page.relative div.relative") as HTMLDivElement | null
      if (!pageRelative
            || pageRelative.dataset.monthlyJournalNav === "true")
            return Promise.resolve(false)

      pageRelative.dataset.monthlyJournalNav = "true" // 作成済みフラグ
      const navElement = createNavElement("journalNav") // navElementを作成

      const ISO = logseq.settings!.booleanISOWeek === true ? true : false
      const { quarter, weekString } = getWeeklyNumberFromDate(monthStartDay, ISO ? 1 : 0)
      const prevMonth = subMonths(monthStartDay, 1)
      const nextMonth = addMonths(monthStartDay, 1)


      // Year

      // Prev Year
      const prevYearLink = format(subYears(monthStartDay, 1), "yyyy")
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
      const nextYearLink = format(addYears(monthStartDay, 1), "yyyy")
      navElement.appendChild(createNavLink(nextYearLink, nextYearLink))

      // span ">",{sm:true}
      navElement.appendChild(spanFreeSpace(">", { sm: true }))


      // Month

      // Prev Month
      navElement.appendChild(createNavLink(localizeMonthString(prevMonth, true), format(prevMonth, "yyyy/MM")))

      // This Month
      const thisMonthLink = spanFreeSpace(localizeMonthString(monthStartDay, true))
      thisMonthLink.style.textDecoration = "underline"
      navElement.appendChild(thisMonthLink)

      // Next Month
      navElement.appendChild(createNavLink(localizeMonthString(nextMonth, true), format(nextMonth, "yyyy/MM")))

      // span ">",{sm:true}
      navElement.appendChild(spanFreeSpace(">", { sm: true }))


      // Week

      // span "Week"
      navElement.appendChild(spanFreeSpace(t("Week")))


      for (let i = 0; i < getWeeksInMonth(monthStartDay, { weekStartsOn: ISO ? 1 : 0 }); i++) {
            const week = addWeeks(monthStartDay, i)
            if (isSameMonth(week, monthStartDay) === false) break
            navElement.appendChild(createNavLinkWeekNumber(week, ISO, logseq.settings!.weekNumberOptions as string))
      }


      pageRelative.insertBefore(navElement, pageRelative.firstChild)

      return Promise.resolve(true)
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
      const pageRelative = parent.document.querySelector("div.page.relative div.relative") as HTMLDivElement | null
      if (!pageRelative
            || pageRelative.dataset.weeklyJournalNav === "true")
            return Promise.resolve(false)

      pageRelative.dataset.weeklyJournalNav = "true" // 作成済みフラグ
      const navElement = createNavElement("journalNav") // navElementを作成


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



// QuarterlyJournal用ナビゲーションを作成する
export const quarterlyJournalCreateNav = async (
      year: number,
      quarterly: number,
      // month: number,
      // monthStartDay: Date,
): Promise<boolean> => {

      // parent.document div.page.relative div.relativeの中の先頭に挿入する
      const pageRelative = parent.document.querySelector("div.page.relative div.relative") as HTMLDivElement | null
      if (!pageRelative
            || pageRelative.dataset.quarterlyJournalNav === "true")
            return Promise.resolve(false)

      pageRelative.dataset.quarterlyJournalNav = "true" // 作成済みフラグ
      const navElement = createNavElement("journalNav") // navElementを作成


      // Year

      // Prev Year
      navElement.appendChild(createNavLink((year - 1).toString(), (year - 1).toString()))
      // This Year
      const thisYearLink = createNavLink(year.toString(), year.toString())
      thisYearLink.style.textDecoration = "underline"
      navElement.appendChild(thisYearLink)
      // Next Year
      navElement.appendChild(createNavLink((year + 1).toString(), (year + 1).toString()))

      // span ">",{sm:true}
      navElement.appendChild(spanFreeSpace(">", { sm: true }))

      // Quarter Q1-Q4
      for (let i = 1; i <= 4; i++)
            if (quarterly === i) {
                  const quarterLink = spanFreeSpace(`Q${i}`)
                  quarterLink.style.textDecoration = "underline"
                  navElement.appendChild(quarterLink)
            } else
                  navElement.appendChild(createNavLink(`Q${i}`, `${year}/Q${i}`))


      // span ">",{sm:true}
      navElement.appendChild(spanFreeSpace(">", { sm: true }))

      // Month Quarterに含まれる月のみ表示
      for (let i = 1; i <= 12; i++)
            if (quarterly * 3 - 2 <= i && i <= quarterly * 3) {
                  const monthLink = createNavLink(localizeMonthString(new Date(year, i - 1, 1), false), `${year}/${i.toString().padStart(2, "0")}`)
                  monthLink.style.fontWeight = "bold"
                  navElement.appendChild(monthLink)
            }


      pageRelative.insertBefore(navElement, pageRelative.firstChild)
      return Promise.resolve(true)
}



// YearlyJournal用ナビゲーションを作成する
export const yearlyJournalCreateNav = async (
      year: number,
): Promise<boolean> => {

      // parent.document div.page.relative div.relativeの中の先頭に挿入する
      const pageRelative = parent.document.querySelector("div.page.relative div.relative") as HTMLDivElement | null
      if (!pageRelative
            || pageRelative.dataset.yearlyJournalNav === "true")
            return Promise.resolve(false)

      pageRelative.dataset.yearlyJournalNav = "true" // 作成済みフラグ
      const navElement = createNavElement("journalNav") // navElementを作成


      // 3 years 
      navElement.appendChild(createNavLink((year - 3).toString(), (year - 3).toString()))
      // 2 years
      navElement.appendChild(createNavLink((year - 2).toString(), (year - 2).toString()))
      // Prev Year
      navElement.appendChild(createNavLink((year - 1).toString(), (year - 1).toString()))
      // This Year
      const thisYearLink = spanFreeSpace(year.toString())
      thisYearLink.style.textDecoration = "underline"
      navElement.appendChild(thisYearLink)
      // Next Year
      navElement.appendChild(createNavLink((year + 1).toString(), (year + 1).toString()))
      // 2 years later
      navElement.appendChild(createNavLink((year + 2).toString(), (year + 2).toString()))
      // 3 years later
      navElement.appendChild(createNavLink((year + 3).toString(), (year + 3).toString()))
      // span ">",{sm:true}
      navElement.appendChild(spanFreeSpace(">", { sm: true }))

      if (logseq.settings!.weekNumberOptions === "YYYY/qqq/Www") {
            // Quarter
            for (let i = 1; i <= 4; i++)
                  navElement.appendChild(createNavLink(`Q${i}`, `${year}/Q${i}`))
            // span ">",{sm:true}
            navElement.appendChild(spanFreeSpace(">", { sm: true }))
      }

      // Month
      for (let i = 1; i <= 12; i++)
            navElement.appendChild(createNavLink(localizeMonthString(new Date(year, i - 1, 1), false), `${year}/${i.toString().padStart(2, "0")}`))


      pageRelative.insertBefore(navElement, pageRelative.firstChild)
      return Promise.resolve(true)
}

const createNavElement = (id: string) =>
      Object.assign(document.createElement("div"), {
            id,
            className: "flex justify-center items-center text-sm",
            // style: {
            // }
      })
