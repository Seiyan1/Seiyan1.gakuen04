"use strict"  //JavaScriptをより厳しくチェックするモード。ミスを見つけてくれる。


const data = {
  1: {                                                    //　数字は学年を表す　　例：1→1年生
    "前期中間考査": [
      { subject: "国語", range: "ここにテスト範囲を書く" },
      { subject: "数学", range: "ここにテスト範囲を書く" },
      { subject: "英語", range: "ここにテスト範囲を書く" },
      { subject: "電気", range: "ここにテスト範囲を書く" }
    ],
    "前期期末考査": [
      { subject: "国語", range: "ここにテスト範囲を書く" },
      { subject: "数学", range: "ここにテスト範囲を書く" },
      { subject: "英語", range: "ここにテスト範囲を書く" },
      { subject: "電気", range: "ここにテスト範囲を書く" }
    ],
    "後期中間考査": [
      { subject: "国語", range: "ここにテスト範囲を書く" },
      { subject: "数学", range: "ここにテスト範囲を書く" },
      { subject: "英語", range: "ここにテスト範囲を書く" },
      { subject: "電気", range: "ここにテスト範囲を書く" },
      { subject: "工管", range: "ここにテスト範囲を書く" }
    ],
    "後期期末考査": [
      { subject: "国語", range: "ここにテスト範囲を書く" },
      { subject: "数学", range: "ここにテスト範囲を書く" },
      { subject: "英語", range: "ここにテスト範囲を書く" },
      { subject: "電気", range: "ここにテスト範囲を書く" },
      { subject: "工管", range: "ここにテスト範囲を書く" }
    ]
  },
  2: {
    "前期期末考査": [
      { subject: "国語", range: "ここにテスト範囲を書く" },
      { subject: "数学", range: "ここにテスト範囲を書く" },
      { subject: "英語", range: "ここにテスト範囲を書く" },
      { subject: "電気", range: "ここにテスト範囲を書く" },
      { subject: "工管", range: "ここにテスト範囲を書く" },
      { subject: "自動車", range: "ここにテスト範囲を書く" }
    ],
    "後期期末考査": [
      { subject: "国語", range: "ここにテスト範囲を書く" },
      { subject: "数学", range: "ここにテスト範囲を書く" },
      { subject: "英語", range: "ここにテスト範囲を書く" },
      { subject: "電気", range: "ここにテスト範囲を書く" },
      { subject: "工管", range: "ここにテスト範囲を書く" },
      { subject: "自動車", range: "ここにテスト範囲を書く" }
    ]
  },
  3: {
    "前期期末考査": [
      { subject: "国語", range: "ここにテスト範囲を書く" },
      { subject: "工学・力学", range: "ここにテスト範囲を書く" }
    ]
  }
};


function showGrade(grade, clickedButton) {                       //学年ボタンを押した時に動く関数。　gradeはボタンを押した学年。　clickedButtonは押したボタンそのもの。
  const exams = data[grade];                                     //例：grade=>1ならdata[1]　つまり1年の考査データを取り出す。
  let buttonsHtml = "";                                          //考査ボタンのHTMLをここに少しずつ足していく　考査ボタンを文字列として作る為の変数

  // 学年ボタンの active を切り替える

  const gradeButtons = document.querySelectorAll(".grade-btn");  //document=>今開いているHTMLページ全体を表す。　querySelectorAll(".grade-btn")＝＞HTMLの中から.grade-btn というクラス(学年ボタン)を全部持ってきて変数に入れる
  for (let i = 0; i < gradeButtons.length; i++) {                //forループを使う。【i = 0;】で0から数字を繰り返す。【i < gradeButtons.length;】でボタンの個数（3つ）まで繰り返す。
    gradeButtons[i].classList.remove("active");                  //
  }
  
  clickedButton.classList.add("active");                         //押したボタンだけにactiveを付ける。これによって、選択中のボタンだけの色を変えられる（CSS)
  // 考査ボタンを作る

  for (let examName in exams) {
    buttonsHtml += `<button class="exam-btn" onclick="showExam(${grade}, '${examName}', this)">${examName}</button>`;
  }
  document.getElementById("examTabs").innerHTML = buttonsHtml;
  // 最初の考査を自動表示
  const firstExam = Object.keys(exams)[0];
  showExam(grade, firstExam);
}
function showExam(grade, examName, clickedButton) {
  const examData = data[grade][examName];
  let tableRows = "";
  // 考査ボタンの active を切り替える
  const examButtons = document.querySelectorAll(".exam-btn");
  for (let i = 0; i < examButtons.length; i++) {
    examButtons[i].classList.remove("active");
  }
  if (clickedButton) {
    clickedButton.classList.add("active");
  } else {
    for (let i = 0; i < examButtons.length; i++) {
      if (examButtons[i].textContent === examName) {
        examButtons[i].classList.add("active");
      }
    }
  }
  // 教科と範囲の行を作る
  for (let i = 0; i < examData.length; i++) {
    tableRows += `
      <tr>
        <th>${examData[i].subject}</th>
        <td>${examData[i].range}</td>
      </tr>
    `;
  }
  const html = `
    <div class="card fade-in">
      <div class="title">${examName}</div>
      <table class="subject-table">
        ${tableRows}
      </table>
    </div>
  `;
  document.getElementById("content").innerHTML = html;
}
// 最初に1年を表示
window.onload = function() {
  const firstButton = document.querySelector(".grade-btn");
  showGrade(1, firstButton);
};

document.getElementById("back").onclick = function () {
    window.location.href = "../index.html";
};