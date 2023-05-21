import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { logseq as PL } from "../package.json";
const pluginId = PL.id; //set plugin id from package.json
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";


/* main */
const main = () => {
  console.info(`#${pluginId}: MAIN`); //console
  (async () => {
    try {
      await l10nSetup({ builtinTranslations: { ja } });
    } finally {
      /* user settings */
      userSettings();
    }
  })();
  



  /* toolbar-item sample */
  //for open_toolbar
  logseq.App.registerUIItem("toolbar", {
    key: pluginId,
    template: `<div data-on-click="open_toolbar" style="font-size:20px">🔥</div>`,
  });

  logseq.provideModel({
    //for open_toolbar
  async open_toolbar() {
    logseq.showSettingsUI();
  },
  });

  console.info(`#${pluginId}: loaded`);//console
};/* end_main */


function userSettings() {
  /* user setting */
  // https://logseq.github.io/plugins/types/SettingSchemaDesc.html
  
  const settingsTemplate: SettingSchemaDesc[]  = [

  ];
  logseq.useSettingsSchema(settingsTemplate);
  }



logseq.ready(main).catch(console.error);