const bms = {};
const BMSparse = {
    loadFromFile: (result) => {
        // パース処理
        const res = result;
        const line_regex_g = /#(\d{3})(\d{2}):((\d|[A-Z])+)/g;

        bms.bpm = Number(res.match(/#BPM ([\d.]+)/)[1]); //初期bpm
        const origin = res.match(line_regex_g);
        const notes = origin.filter(BMSparse.isKey);
        const bar_mSec = Math.round(1000 * 60 / bms.bpm * 4); // 丸め込みについては迷う
        bms.notes = BMSparse.parseNotes(notes, bar_mSec);
        bms.keys = 8;
        bms.od = Number(res.match(/#RANK ([\d.]+)/)[1]); // osu換算とは異なるので相対的な値で考える
        bms.rank = bms.od; // 使ってないけど念の為

        // const bar_late = origin.filter(BMSparse.isBarLate); //変拍子チェック 
        return bms;
    },
    // ノーツ情報をパース
    parseNotes:  (notelines, bar_mSec) => {
        const line_regex = /#(\d{3})(\d{2}):((\d|[A-Z])+)/;
        // pp用の配置に変更
        const notes = [];
        notelines.forEach((noteline) => {
            const mached = noteline.match(line_regex);
            const bar = Math.floor(mached[1]);
            const key = BMSparse.keyMap(mached[2]);
            const noteStr = mached[3].match(/.{2}/g);
            noteStr.forEach((note, i) => {
                if (note == '00') return ;
                // TODO 本当はミリ秒はStackする必要がある,ソフランに対応してから考える
                const start_t = (bar * bar_mSec) + bar_mSec * (i/noteStr.length);
                notes.push({
                    key: key,
                    start_t: Math.round(start_t),
                    end_t: Math.round(start_t), // TODO LN未考慮
                    overall_strain: 1,
                    individual_strain: new Array(8).fill(0) 
                });
            });
        });
        notes.sort((x, y) => {return x.start_t - y.start_t});
        return notes;
    },
    // キーマッピング情報
    keyMap:  (bmsKey) => {
        return bmsKey == '11' ? 1 : //1鍵
            bmsKey == '12' ? 2 : //2鍵
            bmsKey == '13' ? 3 : //...
            bmsKey == '14' ? 4 :
            bmsKey == '15' ? 5 :
            bmsKey == '18' ? 6 :
            bmsKey == '19' ? 7 :
            0; //bmsKey == '16' 皿
    },
    // キー入力行取得
    isKey:  (element) => {
        const keys = /(1[1-68-9])/; 
        return (element.substr(4,2).match(keys));
    },
    // 小節線情報
    isBarLate:  (element) => {
        const keys = /02/; 
        return (element.substr(4,2).match(keys));
    },
};
