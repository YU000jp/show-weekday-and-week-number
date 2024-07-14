export const notice = () => {
      // メッセージを表示する
      const notice = "20240519no02"
      if (logseq.settings!.weekNumberFormat !== undefined
            && logseq.settings!.notice !== notice) {
            logseq.updateSettings({ notice })
            setTimeout(() => {
                  // マークダウン形式でメッセージを表示する
                  logseq.UI.showMsg(`
  
      📆"Show weekday and week-number" plugin
      Updated!
      
  
      Feature:
      1. Week-number format options
      2. Monthly Journal (Insert Template)
      3. Quarterly Journal (Insert Template)
      4. (Weekly/M/Q) Journal Nav link
  
      - New setting items have been added in the plugin settings.
  
  
      Bug fix:
      1. Show indicator (dot) of journal entries
        (⚠️Due to changes in the specifications of Logseq app, judgments are made based on the database rather than the file.)
      
      `, "info", { timeout: 8500 })
                  logseq.showSettingsUI() // 設定画面を表示する
            }, 5000)
      }
}