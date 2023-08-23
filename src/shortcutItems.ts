import { AppUserConfigs, BlockEntity, IBatchBlock } from "@logseq/libs/dist/LSPlugin";
import { getWeeklyNumberFromDate } from "./lib";
import { endOfYear, format, } from "date-fns";

export const loadShortcutItems = () => {

    currentWeekNumberLink();

    weekNumberYearAllThisYear();

    weekNumberYearAllNextYear();

    currentDateAndTime();

    currentDayOfWeek();
};


const currentWeekNumberLink = () => logseq.Editor.registerSlashCommand("Current week number link", async () => {
    //Week number linkのスラッシュコマンド
    const { year, weekString }: { year: number; weekString: string } =
        getWeeklyNumberFromDate(
            new Date(),
            logseq.settings?.weekNumberFormat === "US format" ? 0 : 1
        );
    logseq.Editor.insertAtEditingCursor(`[[${year}-W${weekString}]]`);
});


const weekNumberYearAllThisYear = () => logseq.Editor.registerSlashCommand("Create Week number list of this year", async ({ uuid }) => {
    //今年の12月31日のDateオブジェクトを作成
    await weekNumberYearAll(new Date().getFullYear(), uuid);
});

const weekNumberYearAllNextYear = () => logseq.Editor.registerSlashCommand("Create Week number list of next year", async ({ uuid }) => {
    //来年の12月31日のDateオブジェクトを作成
    await weekNumberYearAll(new Date().getFullYear() + 1, uuid);

});

const weekNumberYearAll = async (selectYear: number, uuid: string) => {
    const lastDate = endOfYear(new Date(selectYear, 2));

    //週番号を取得
    let { year, weekString }: { year: number; weekString: string; } = getWeeklyNumberFromDate(
        lastDate,
        logseq.settings?.weekNumberFormat === "US format" ? 0 : 1
    );
    if (year !== selectYear) {
        //今年の12月31日が週番号の最終週の場合、来年の週番号を取得する
        year = selectYear;
        weekString = "52";
    }
    //週番号のリストを作成
    //weekStringが52か53なのでそれを元に、1～52か1～53の配列を作成
    const weekNumberList = [...Array(Number(weekString)).keys()].map((i) => i + 1);
    //週番号のリストを元に、年と週番号を組み合わせたリストを作成
    const weekNumberListWithYear = weekNumberList.map((weekNumber) => `${year}-W${weekNumber.toString().padStart(2, "0")}`);
    let batch: IBatchBlock[];
    batch = weekNumberListWithYear.map((weekNumber) => ({
        content: `[[${weekNumber}]]`,
    }));
    const { uuid: yearUuid } = await logseq.Editor.insertBlock(uuid, `[[${year}]]`, { sibling: true }) as BlockEntity as { uuid: string; };
    if (yearUuid) await logseq.Editor.insertBatchBlock(yearUuid, batch, { sibling: false });
};


const currentDateAndTime = () => logseq.Editor.registerSlashCommand("Current date and time", async () => {
    const { preferredDateFormat }: { preferredDateFormat: string } = (await logseq.App.getUserConfigs()) as AppUserConfigs;
    const date = new Date();
    const journalLink = format(date, preferredDateFormat);
    const time = format(date, "HH:mm");
    logseq.Editor.insertAtEditingCursor(`[[${journalLink}]] *${time}*`);
});

const currentDayOfWeek = () => logseq.Editor.registerSlashCommand("Current day of week", async () => {
    const dayOfWeek = new Intl.DateTimeFormat("default", { weekday: "long" }).format(new Date());
    logseq.Editor.insertAtEditingCursor(`*${dayOfWeek}*`);
});