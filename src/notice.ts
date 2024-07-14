export const notice = () => {
      // メッセージを表示する
      const notice = "20240519no02"
      if (logseq.settings!.weekNumberFormat !== undefined
            && logseq.settings!.notice !== notice) {
            logseq.updateSettings({ notice })
            setTimeout(() => {
                  // マークダウン形式でメッセージを表示する
                  logseq.UI.showMsg(`
  
      [:h3 📆"Show weekday and week-number" plugin Updated!]
      
      `, "info", { timeout: 8500 })
                  logseq.showSettingsUI() // 設定画面を表示する
            }, 5000)
      }
}