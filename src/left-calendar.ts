import { AppUserConfigs, LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { format } from "date-fns/format"
import { t } from "logseq-l10n"
import { removeContainer } from "./lib"
import { pluginName } from "."

export const keyLeftCalendarContainer = "left-calendar-container"
export const loadLeftCalendar = () => {

    //プラグイン設定変更時
    logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
        if (oldSet.booleanLeftCalendar !== newSet.booleanLeftCalendar) {
            if (newSet.booleanLeftCalendar === true)
                main()//表示する
            else
                removeContainer(keyLeftCalendarContainer)//消す
        }

    })

    if (logseq.settings!.booleanLeftCalendar === true)
        main()

    logseq.provideStyle(`
    div#left-sidebar div#left-calendar-inner>div {
            margin-left: 1em;
            white-space: nowrap;
            overflow: visible;

            &>button:hover {
                text-decoration: underline;
            }
    }
    `)
}

const main = () => {
    if (parent.document.getElementById(keyLeftCalendarContainer))
        removeContainer(keyLeftCalendarContainer)//すでに存在する場合は削除する

    setTimeout(async () => {
        //左サイドバーのフッターに追加する
        const footerEle: HTMLElement | null = parent.document.querySelector("div#main-container div#left-sidebar>div.left-sidebar-inner footer.create") as HTMLElement | null
        if (footerEle === null) return //nullの場合はキャンセル

        const divAsItemEle: HTMLDivElement = document.createElement("div")
        divAsItemEle.className = "nav-content-item mt-3 is-expand flex-shrink-0"
        divAsItemEle.id = keyLeftCalendarContainer
        const detailsEle: HTMLDetailsElement = document.createElement("details")
        detailsEle.className = "nav-content-item-inner"
        detailsEle.open = true
        const summaryEle: HTMLElement = document.createElement("summary")
        summaryEle.className = "header items-center"
        summaryEle.style.cursor = "row-resize"
        summaryEle.style.backgroundColor = "var(--ls-tertiary-background-color)"
        summaryEle.innerText = t("Monthly Calendar")// タイトルを入れる
        summaryEle.title = pluginName //プラグイン名を入れる
        const containerEle: HTMLDivElement = document.createElement("div")
        containerEle.className = "bg"
        containerEle.id = "left-calendar-inner"
        detailsEle.appendChild(summaryEle)
        detailsEle.appendChild(containerEle)
        divAsItemEle.appendChild(detailsEle)
        footerEle.insertAdjacentElement("beforebegin", divAsItemEle)

        const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs

        //スペースに表示する
        setTimeout(() => {
            const containerEle: HTMLDivElement | null = parent.document.getElementById("left-calendar-inner") as HTMLDivElement | null

            if (containerEle === null) return //nullの場合はキャンセル

            if (containerEle.dataset.flag !== "true")//すでに存在する場合はキャンセル
                createCalendar(preferredDateFormat, containerEle)

            containerEle.dataset.flag = "true" //フラグを立てる
        }, 1)

    }, 500)
}

const createCalendar = (preferredDateFormat: string, LeftCalendarElement: HTMLDivElement) => {
    const mainDivElement: HTMLElement = document.createElement("div")
    mainDivElement.className = "flex items-center"
    //テストメッセージ
    const date = new Date()
    const formattedDate = format(date, preferredDateFormat)
    mainDivElement.innerHTML = `<p>${formattedDate}</p>`
    LeftCalendarElement.appendChild(mainDivElement)
}

