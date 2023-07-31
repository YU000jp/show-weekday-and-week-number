import { getISOWeek, getISOWeekYear, getWeek, getWeekOfMonth, getWeekYear, isSaturday, isSunday } from "date-fns";
import { formatRelativeDate, openPage } from "./lib";


//behind journal title
export function behindJournalTitle(journalDate: Date, titleElement: HTMLElement, preferredDateFormat) {
  let dayOfWeekName: string = "";
  if (preferredDateFormat.includes("E") === false && logseq.settings?.booleanDayOfWeek === true) dayOfWeekName = new Intl.DateTimeFormat((logseq.settings?.localizeOrEnglish || "default"), { weekday: logseq.settings?.longOrShort || "long" }).format(journalDate);
  let printWeekNumber: string;
  let printWeek: string = "";
  const weekStartsOn = (logseq.settings?.weekNumberFormat === "US format") ? 0 : 1;
  if (logseq.settings?.booleanWeekNumber === true) {
    if (logseq.settings?.weekNumberOfTheYearOrMonth === "Year") {
      let forWeeklyJournal = "";
      let year: number;
      let week: number;
      if (logseq.settings?.weekNumberFormat === "ISO(EU) format") {
        year = getISOWeekYear(journalDate);
        week = getISOWeek(journalDate);
      } else {
        //NOTE: getWeekYear関数は1月1日がその年の第1週の始まりとなる(デフォルト)
        //weekStartsOnは先に指定済み
        year = getWeekYear(journalDate, { weekStartsOn });
        week = getWeek(journalDate, { weekStartsOn });
      }
      const weekString: string = (week < 10) ? String("0" + week) : String(week); //weekを2文字にする
      printWeekNumber = `${year}-W<strong>${weekString}</strong>`;
      forWeeklyJournal = `${year}-W${weekString}`;
      if (logseq.settings.booleanWeeklyJournal === true) {
        const linkId = "weeklyJournal-" + forWeeklyJournal;
        printWeek = `<span title="Week number"><a id="${linkId}">${printWeekNumber}</a></span>`;
        setTimeout(() => {
          const element = parent.document.getElementById(linkId) as HTMLSpanElement;
          if (element) {
            let processing: Boolean = false;
            element.addEventListener("click", ({ shiftKey }): void => {
              if (processing) return;
              processing = true;
              openPage(forWeeklyJournal, shiftKey as boolean);
              processing = false;
              return;
            });
          }
        }, 150);
      } else {
        printWeek = `<span title="Week number">${printWeekNumber}</span>`;
      }
    } else {
      // get week numbers of the month
      printWeek = (logseq.settings?.weekNumberFormat === "Japanese format" && logseq.settings?.localizeOrEnglish === "default")
        ? `<span title="1か月ごとの週番号">第<strong>${getWeekOfMonth(journalDate, { weekStartsOn })}</strong>週</span>`
        : `<span title="Week number within the month"><strong>W${getWeekOfMonth(journalDate, { weekStartsOn })}</strong><small>/m</small></span>`;
    }
  }

  //relative time
  let relativeTime: string = "";
  if (logseq.settings?.booleanRelativeTime === true) {
    const formatString: string = formatRelativeDate(journalDate);
    if (formatString !== "") relativeTime = `<span><small>(${formatString})</small></span>`;
  }
  // apply styles
  const dateInfoElement: HTMLSpanElement = parent.document.createElement("span");
  dateInfoElement.classList.add("showWeekday");
  if (logseq.settings?.booleanDayOfWeek === true) {
    if (logseq.settings?.booleanWeekendsColor === true &&
      isSaturday(journalDate) === true) {
      dateInfoElement.innerHTML = `<span style="color:var(--ls-wb-stroke-color-blue)">${dayOfWeekName}</span>${printWeek}${relativeTime}`;
    }
    else if (logseq.settings?.booleanWeekendsColor === true &&
      isSunday(journalDate) === true) {
      dateInfoElement.innerHTML = `<span style="color:var(--ls-wb-stroke-color-red)">${dayOfWeekName}</span>${printWeek}${relativeTime}`;
    }
    else {
      dateInfoElement.innerHTML = `<span>${dayOfWeekName}</span>${printWeek}${relativeTime}`; //textContent
    }
  } else {
    dateInfoElement.innerHTML = `${printWeek}${relativeTime}`;
  }

  //h1から.blockを削除
  if (titleElement.classList.contains("block")) titleElement.classList.remove("block");


  //h1の中にdateInfoElementを挿入
  const aTag = titleElement.parentElement; // 親要素を取得する
  if (aTag && aTag.tagName.toLowerCase() === 'a') {
    //For journals
    //<a><h1>日付タイトル</h1></a>の構造になっているが、<h1><a>日付タイトル</a></h1>にしたい
    const titleElementTextContent = titleElement.textContent;
    //titleElementのテキストコンテンツを削除
    titleElement.textContent = '';
    //aタグと同じ階層にtitleElementを移動する
    aTag.insertAdjacentElement('afterend', titleElement);
    //TODO: ジャーナルページの場合
    // if (preferredDateFormat === "yyyy/MM/dd" && logseq.settings!.splitJournalTitle === true) {
    //   //ジャーナルタイトルを分割する

    // }
    //titleElementの中にaTagを移動する
    titleElement.appendChild(aTag);
    //移動したaタグの中身にtitleElementTextContentを戻す
    aTag.textContent = titleElementTextContent;
    //aタグから.initial-colorを削除
    if (aTag.classList.contains("initial-color")) aTag.classList.remove("initial-color");
    // titleElementの後ろにdateInfoElementを追加する
    titleElement.insertAdjacentElement('afterend', dateInfoElement);
  } else {
    if (preferredDateFormat === "yyyy/MM/dd" && logseq.settings!.splitJournalTitle === true) {
      //シングルジャーナルページの場合
      //「yyyy/mm/dd」形式のジャーナルタイトルを/で分割する
      const arrayName = titleElement.textContent;
      const array = titleElement.textContent?.split("/") as string[];
      titleElement.textContent = '';
      titleElement.insertAdjacentHTML('beforeend',
        `<span class="title block"><a id="${arrayName}-0" data-ref="${array[0]}" title="Year">${array[0]}</a> / <a id="${arrayName}-1" data-ref="${array[0]}/${array[1]}" title="Month">${array[1]}</a> / <a data-ref="${array[0]}/${array[1]}/${array[2]}" title="Day">${array[2]}</a></span>`);
      setTimeout(() => {
        const element0 = parent.document.getElementById(`${arrayName}-0`) as HTMLAnchorElement;
        if (element0) {
          element0.addEventListener("click", ({ shiftKey }) => {
            openPage(element0.dataset.ref as string, shiftKey as boolean);
          }, { once: true });
        }
        const element1 = parent.document.getElementById(`${arrayName}-1`) as HTMLAnchorElement;
        if (element1) {
          element1.addEventListener("click", ({ shiftKey }) => {
            openPage(element1.dataset.ref as string, shiftKey as boolean);
          }, { once: true });
        }
      }, 200);
    }
    //For single journal
    titleElement.insertAdjacentElement('afterend', dateInfoElement);
  }
}