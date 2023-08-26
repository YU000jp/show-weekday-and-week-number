import "@logseq/libs"; //https://plugins-doc.logseq.com/
import {
  AppUserConfigs,
  LSPluginBaseInfo,
  PageEntity,
} from "@logseq/libs/dist/LSPlugin.user";
import { setup as l10nSetup } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";
import fileMainCSS from "./main.css?inline";
import { behindJournalTitle } from "./behind";
import { getJournalDayDate, getWeeklyNumberFromDate } from "./lib";
import { titleElementReplaceLocalizeDayOfWeek } from "./lib";
import { currentPageIsWeeklyJournal } from "./weeklyJournal";
import { settingsTemplate } from "./settings";
import { boundariesProcess } from "./boundaries";
import { loadShortcutItems, } from "./shortcutItems";

/* main */
const main = async () => {
  await l10nSetup({ builtinTranslations: { ja } });
  /* user settings */
  //get user config Language >>> Country
  if (logseq.settings?.weekNumberFormat === undefined) {
    const convertLanguageCodeToCountryCode = (
      languageCode: string
    ): string => {
      switch (languageCode) {
        case "ja":
          return "Japanese format";
        default:
          return "ISO(EU) format";
      }
    };
    const { preferredLanguage } =
      (await logseq.App.getUserConfigs()) as AppUserConfigs;
    logseq.useSettingsSchema(
      settingsTemplate(convertLanguageCodeToCountryCode(preferredLanguage))
    );
    setTimeout(() => {
      logseq.showSettingsUI();
    }, 300);
  } else {
    logseq.useSettingsSchema(settingsTemplate("ISO(EU) format"));
  }

  if (logseq.settings!.notice !== "20230822no01") {
    logseq.UI.showMsg("Remove `localize journal link` feature. Split to `Flex date format` plugin.", "info", { timeout: 4000 });
    logseq.updateSettings({ notice: "20230822no01" });
  }


  logseq.provideStyle({ key: "main", style: fileMainCSS });

  //Logseqを開いたときに実行
  setTimeout(() => {
    if (logseq.settings!.booleanJournalsBoundaries === true)
      boundaries("journals");
    querySelectorAllTitle();
  }, 200);
  setTimeout(() => observerMain(), 2000); //スクロール用


  logseq.App.onRouteChanged(({ template }) => {
    if (
      logseq.settings?.booleanBoundaries === true &&
      template === "/page/:name"
    ) {
      //page only
      //div.is-journals
      setTimeout(() => boundaries("is-journals"), 20);
    } else if (
      logseq.settings!.booleanJournalsBoundaries === true &&
      template === "/"
    ) {
      //journals only
      //div#journals
      setTimeout(() => boundaries("journals"), 20);
    }
    setTimeout(() => querySelectorAllTitle(), 50);
  });

  //日付更新時に実行(Journal boundariesのセレクト更新のため)
  logseq.App.onTodayJournalCreated(async () => {
    if (logseq.settings?.booleanBoundaries === true) {
      const weekBoundaries = parent.document.getElementById(
        "weekBoundaries"
      ) as HTMLDivElement | null;
      if (weekBoundaries) weekBoundaries.remove();
      if (
        ((await logseq.Editor.getCurrentPage()) as PageEntity | null) !== null
      ) {
        //page only
        //div.is-journals
        setTimeout(() => boundaries("is-journals"), 10);
      } else {
        //journals only
        //div#journals
        setTimeout(() => boundaries("journals"), 10);
      }
    }
  });

  logseq.App.onSidebarVisibleChanged(({ visible }) => {
    if (visible === true) setTimeout(() => querySelectorAllTitle(), 100);
  });

  onSettingsChanged();

  logseq.beforeunload(async () => {
    removeTitleQuery();
    removeBoundaries();
    observer.disconnect();
  });

  loadShortcutItems();

}; /* end_main */



const onSettingsChanged = () => logseq.onSettingsChanged((newSet: LSPluginBaseInfo["settings"], oldSet: LSPluginBaseInfo["settings"]) => {
  const changeBoundaries = oldSet.localizeOrEnglish !== newSet.localizeOrEnglish ||
    oldSet.journalBoundariesBeforeToday !==
    newSet.journalBoundariesBeforeToday ||
    oldSet.journalBoundariesAfterToday !==
    newSet.journalBoundariesAfterToday ||
    oldSet.journalsBoundariesWeekOnly !==
    newSet.journalsBoundariesWeekOnly ||
    (oldSet.weekNumberFormat !== newSet.weekNumberFormat &&
      newSet.journalsBoundariesWeekOnly === true)
    ? true
    : false;
  if (changeBoundaries ||
    (oldSet.booleanBoundaries === true &&
      newSet.booleanBoundaries === false) ||
    (oldSet.booleanJournalsBoundaries === true &&
      newSet.booleanJournalsBoundaries === false)) {
    removeBoundaries();
  }
  if (changeBoundaries ||
    (oldSet.booleanBoundaries === false &&
      newSet.booleanBoundaries === true)) {
    if (parent.document.getElementById("is-journals") as HTMLDivElement)
      boundaries("is-journals");
    if (parent.document.getElementById("journals") as HTMLDivElement)
      boundaries("journals");
  }
  if (changeBoundaries ||
    (oldSet.booleanJournalsBoundaries === false &&
      newSet.booleanJournalsBoundaries === true)) {
    if (parent.document.getElementById("journals") as HTMLDivElement)
      boundaries("journals");
  }
  if (oldSet.localizeOrEnglish !== newSet.localizeOrEnglish ||
    oldSet.booleanDayOfWeek !== newSet.booleanDayOfWeek ||
    oldSet.longOrShort !== newSet.longOrShort ||
    oldSet.booleanWeekNumber !== newSet.booleanWeekNumber ||
    oldSet.weekNumberOfTheYearOrMonth !==
    newSet.weekNumberOfTheYearOrMonth ||
    oldSet.booleanWeekendsColor !== newSet.booleanWeekendsColor ||
    oldSet.weekNumberFormat !== newSet.weekNumberFormat ||
    oldSet.booleanRelativeTime !== newSet.booleanRelativeTime ||
    oldSet.booleanWeeklyJournal !== newSet.booleanWeeklyJournal ||
    oldSet.booleanWeekNumberHideYear !== newSet.booleanWeekNumberHideYear) {
    removeTitleQuery();
    setTimeout(() => querySelectorAllTitle(), 500);
  }
}
);


let processingTitleQuery: boolean = false;
async function querySelectorAllTitle(): Promise<void> {
  if (processingTitleQuery) return;
  processingTitleQuery = true;
  const { preferredDateFormat } =
    (await logseq.App.getUserConfigs()) as AppUserConfigs;

  //Journalsの場合は複数
  parent.document
    .querySelectorAll(
      "div#main-content-container div:is(.journal,.is-journals,.page) h1.title:not([data-checked])"
    )
    .forEach(
      async (titleElement) =>
        await JournalPageTitle(titleElement as HTMLElement, preferredDateFormat)
    );
  processingTitleQuery = false;
}

const observer = new MutationObserver(async (): Promise<void> => {
  observer.disconnect();
  await querySelectorAllTitle();
  setTimeout(() => observerMain(), 800);
});

const observerMain = () => observer.observe(
  parent.document.getElementById("main-content-container") as HTMLDivElement,
  {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  }
);

// function observeElementAppearance(targetElement: HTMLElement, callback: () => void) {
//   if (!targetElement) return;

//   const observer = new MutationObserver(() => {
//     observer.disconnect();
//     callback();
//   });
//   setTimeout(() => {
//     observer.observe(targetElement, { childList: true, subtree: true, attributeFilter: ["class"], });
//   }, 3000);
// }

//Credit: ottodevs  https://discuss.logseq.com/t/show-week-day-and-week-number/12685/18
let processingJournalTitlePage: Boolean = false;
async function JournalPageTitle(
  titleElement: HTMLElement,
  preferredDateFormat: string
) {
  if (
    !titleElement.textContent ||
    processingJournalTitlePage === true ||
    titleElement.nextElementSibling?.className === "showWeekday"
  )
    return; // check if element already has date info
  processingJournalTitlePage = true;

  //ジャーナルのページタイトルの場合のみ

  //設定項目ですべてのトグルがオフの場合の処理
  if (
    logseq.settings?.booleanWeekNumber === false &&
    logseq.settings!.booleanDayOfWeek === false &&
    logseq.settings?.booleanRelativeTime === false &&
    (titleElement.classList.contains("journal-title") === true ||
      titleElement.classList.contains("title") === true)
  ) {
    const dateInfoElement: HTMLSpanElement =
      parent.document.createElement("span");
    dateInfoElement.classList.add("showWeekday");
    titleElement.insertAdjacentElement("afterend", dateInfoElement);
    const secondElement: HTMLSpanElement =
      parent.document.createElement("span");
    secondElement.style.width = "50%";
    titleElement.parentElement!.insertAdjacentElement(
      "afterend",
      secondElement
    );
    return;
  }

  //Weekly Journalのページだった場合
  if (
    titleElement.classList.contains("journal-title") === false &&
    titleElement.classList.contains("title") === true &&
    logseq.settings!.booleanWeeklyJournal === true &&
    (titleElement.dataset!.WeeklyJournalChecked as string) !== "true"
  ) {
    const match = titleElement.textContent.match(
      /^(\d{4})-W(\d{2})$/
    ) as RegExpMatchArray;
    if (match && match[1] !== "" && match[2] !== "") {
      await currentPageIsWeeklyJournal(titleElement, match);
      processingJournalTitlePage = false;
      return;
    }
  }

  //ジャーナルタイトルから日付を取得し、右側に情報を表示する
  const title: string = titleElement.dataset.localize === "true" ? titleElement.dataset.ref || "" : titleElement.textContent;
  const page = (await logseq.Editor.getPage(title)) as PageEntity | null;
  if (page && page.journalDay) {
    const journalDate: Date = getJournalDayDate(String(page.journalDay));
    behindJournalTitle(journalDate, titleElement, preferredDateFormat);

    //日付フォーマットに曜日が含まれている場合
    if (
      preferredDateFormat.includes("E") === true &&
      logseq.settings!.booleanDayOfWeek === false &&
      logseq.settings!.booleanJournalLinkLocalizeDayOfWeek === true &&
      titleElement.dataset.localize === undefined
    )
      titleElementReplaceLocalizeDayOfWeek(journalDate, titleElement);
  }

  titleElement.dataset.checked = "true";
  processingJournalTitlePage = false;
}

function removeBoundaries() {
  const weekBoundaries = parent.document.getElementById(
    "weekBoundaries"
  ) as HTMLDivElement;
  if (weekBoundaries) weekBoundaries.remove();
}

function removeTitleQuery() {
  const titleBehindElements = parent.document.querySelectorAll(
    "div#main-content-container div:is(.journal,.is-journals) h1.title+span.showWeekday"
  ) as NodeListOf<HTMLElement>;
  titleBehindElements.forEach((titleElement) => titleElement.remove());
  const titleElements = parent.document.querySelectorAll(
    "div#main-content-container div:is(.journal,.is-journals) h1.title[data-checked]"
  ) as NodeListOf<HTMLElement>;
  titleElements.forEach((titleElement) =>
    titleElement.removeAttribute("data-checked")
  );
}

//boundaries
let processingBoundaries: boolean = false;
export function boundaries(targetElementName: string, remove?: boolean) {
  if (processingBoundaries) return;
  processingBoundaries = true;
  boundariesProcess(targetElementName, remove ? remove : false, 0);
  processingBoundaries = false;
}

logseq.ready(main).catch(console.error);
