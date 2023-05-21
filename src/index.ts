import '@logseq/libs'; //https://plugins-doc.logseq.com/
//import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
//import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
//import ja from "./translations/ja.json";

function addExtendedDate(titleElement: HTMLElement) {
  // check if element already has date info
  const existingSpan = titleElement.querySelector("span");
  if (existingSpan) return;

  // remove ordinal suffixes from date
  const journalDate = new Date(Date.parse(titleElement.textContent!.replace(/(\d+)(st|nd|rd|th)/, "$1")));
  if (!isFinite(Number(journalDate))) return;

  // calculate dates
  const dayOfWeekName = new Intl.DateTimeFormat("default", { weekday: "long" }).format(journalDate);
  const days = Math.ceil((journalDate.getTime() - new Date(journalDate.getFullYear(), 0, 1).getTime()) / 86400000);
  const weekNumber = Math.ceil(days / 7);

  // apply styles
  const dateInfoElement = parent.document.createElement("span");
  Object.assign(dateInfoElement.style, {
    opacity: "0.5",
    fontSize: "0.7em",
  });
  dateInfoElement.textContent = ` ${dayOfWeekName}, Week ${weekNumber}`;

  titleElement.appendChild(dateInfoElement);
}

const observer = new MutationObserver(() => {
  parent.document.querySelectorAll("span.title, h1.title").forEach((titleElement) => {
    addExtendedDate(titleElement as HTMLElement);
  });
});


/* main */
const main = () => {
  // (async () => {
  //   try {
  //     await l10nSetup({ builtinTranslations: { ja } });
  //   } finally {
  //     /* user settings */
  //     userSettings();
  //   }
  // })();
  
  observer.observe(parent.document.getElementById("main-content-container") as HTMLElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  });

};/* end_main */


// function userSettings() {
//   /* user setting */
//   // https://logseq.github.io/plugins/types/SettingSchemaDesc.html
  
//   const settingsTemplate: SettingSchemaDesc[]  = [

//   ];
//   logseq.useSettingsSchema(settingsTemplate);
//   }



logseq.ready(main).catch(console.error);