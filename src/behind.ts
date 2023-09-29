import { getWeekOfMonth, isSaturday, isSunday } from "date-fns";
import { openPage, getWeeklyNumberFromDate, formatRelativeDate } from "./lib";
import { t } from "logseq-l10n";

//behind journal title
let processingBehind: boolean = false;

export function behindJournalTitle(
  journalDate: Date,
  titleElement: HTMLElement,
  preferredDateFormat
) {
  if (processingBehind === true) return;
  let dayOfWeekName: string = "";
  if (
    preferredDateFormat.includes("E") === false &&
    logseq.settings?.booleanDayOfWeek === true
  )
    dayOfWeekName = new Intl.DateTimeFormat(
      logseq.settings?.localizeOrEnglish || "default",
      { weekday: logseq.settings?.longOrShort || "long" }
    ).format(journalDate);
  let printWeek: string = "";
  const weekStartsOn: 0 | 1 =
    logseq.settings?.weekNumberFormat === "US format" ? 0 : 1;
  if (logseq.settings?.booleanWeekNumber === true) {
    if (logseq.settings?.weekNumberOfTheYearOrMonth === "Year") {
      const { year, weekString }: { year: number; weekString: string } =
        getWeeklyNumberFromDate(journalDate, weekStartsOn);
      const printWeekNumber =
        logseq.settings!.booleanWeekNumberHideYear === true &&
          weekString !== "53"
          ? `W<strong>${weekString}</strong>`
          : `${year}-W<strong>${weekString}</strong>`;
      const forWeeklyJournal = `${year}-W${weekString}`;
      if (logseq.settings.booleanWeeklyJournal === true) {
        const linkId = "weeklyJournal-" + forWeeklyJournal;
        printWeek = `<span title="Week number"><a id="${linkId}">${printWeekNumber}</a></span>`;
        setTimeout(() => {
          const element = parent.document.getElementById(
            linkId
          ) as HTMLSpanElement;
          if (element) {
            let processing: Boolean = false;
            element.addEventListener("click", ({ shiftKey }): void => {
              if (processing) return;
              processing = true;
              openPage(forWeeklyJournal, shiftKey as boolean);
              processing = false;
            });
          }
        }, 150);
      } else {
        printWeek = `<span title="Week number">${printWeekNumber}</span>`;
      }
    } else {
      // get week numbers of the month
      printWeek =
        logseq.settings?.weekNumberFormat === "Japanese format" &&
          logseq.settings?.localizeOrEnglish === "default"
          ? `<span title="1か月ごとの週番号">第<strong>${getWeekOfMonth(
            journalDate,
            { weekStartsOn }
          )}</strong>週</span>`
          : `<span title="Week number within the month"><strong>W${getWeekOfMonth(
            journalDate,
            { weekStartsOn }
          )}</strong><small>/m</small></span>`;
    }
  }

  //relative time
  let relativeTime: string = "";
  if (logseq.settings?.booleanRelativeTime === true) {
    const formatString: string = formatRelativeDate(journalDate);
    if (formatString !== "")
      relativeTime = `<span><small>(${formatString})</small></span>`;
  }
  // apply styles
  const dateInfoElement: HTMLSpanElement =
    parent.document.createElement("span");
  dateInfoElement.classList.add("showWeekday");
  if (logseq.settings?.booleanDayOfWeek === true) {
    if (
      logseq.settings?.booleanWeekendsColor === true &&
      isSaturday(journalDate) === true
    ) {
      dateInfoElement.innerHTML = `<span style="color:var(--ls-wb-stroke-color-blue)">${dayOfWeekName}</span>${printWeek}${relativeTime}`;
    } else if (
      logseq.settings?.booleanWeekendsColor === true &&
      isSunday(journalDate) === true
    ) {
      dateInfoElement.innerHTML = `<span style="color:var(--ls-wb-stroke-color-red)">${dayOfWeekName}</span>${printWeek}${relativeTime}`;
    } else {
      dateInfoElement.innerHTML = `<span>${dayOfWeekName}</span>${printWeek}${relativeTime}`; //textContent
    }
  } else {
    dateInfoElement.innerHTML = `${printWeek}${relativeTime}`;
  }

  //h1から.blockを削除
  if (titleElement.classList.contains("block"))
    titleElement.classList.remove("block");

  //h1の中にdateInfoElementを挿入
  const aTag = titleElement.parentElement; // 親要素を取得する
  if (aTag && aTag.tagName.toLowerCase() === "a") {
    //For journals
    //<a><h1>日付タイトル</h1></a>の構造になっているが、<h1><a>日付タイトル</a></h1>にしたい
    const titleElementTextContent = titleElement.textContent;
    //titleElementのテキストコンテンツを削除
    titleElement.textContent = "";
    //aタグと同じ階層にtitleElementを移動する
    aTag.insertAdjacentElement("afterend", titleElement);
    //titleElementの中にaTagを移動する
    titleElement.appendChild(aTag);
    //移動したaタグの中身にtitleElementTextContentを戻す
    aTag.textContent = titleElementTextContent;
    //aタグから.initial-colorを削除
    if (aTag.classList.contains("initial-color"))
      aTag.classList.remove("initial-color");
    // titleElementの後ろにdateInfoElementを追加する
    titleElement.insertAdjacentElement("afterend", dateInfoElement);
  } else {
    //For single journal
    titleElement.insertAdjacentElement("afterend", dateInfoElement);
  }

  //設定ボタンを設置
  const settingButton: HTMLButtonElement = document.createElement("button");
  settingButton.textContent = "⚙";
  settingButton.title = t("Open plugin setting");
  settingButton.style.marginLeft = "1em";
  settingButton.addEventListener("click", () => {
    logseq.showSettingsUI();
  });
  dateInfoElement.appendChild(settingButton);
  processingBehind = false;
}
