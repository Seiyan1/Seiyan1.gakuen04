"use strict";
// 1行目に記載している "use strict" は削除しないでください

/*document.getElementById("timetable")は
HTMLの中から idが「timetable」の要素（ボタン）を探すという命令*/

/*.onclick=>そのボタンがクリックされたら右の関数が実行されるよ*/

document.getElementById("timetable").onclick = function () {
    window.location.href = "./ジプリ 時間割/schedule.html";
};

document.getElementById("belongings").onclick = function () {
    window.location.href = "./ジプリ テスト順位/ranking.html";
};

document.getElementById("test").onclick = function () {
    window.location.href = "./ジプリ テスト範囲/range.html";
};
