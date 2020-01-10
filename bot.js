const scriptName = "GitBot";
const root = "관리자 : ";
const cnt = "인원 수 : ";
let preChat = null;
Date.prototype.yyyymmdd = function() {
  let yyyy = this.getFullYear().toString();
  let mm = (this.getMonth() + 1).toString();
  let dd = this.getDate().toString();
  return (
    yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0])
  );
};

function removeGroup(room) {
  DataBase.removeDataBase(room);
}

function addPeople(room, msg) {
  let temp = ".인원추가";
  let num = msg.substring(msg.indexOf(temp) + temp.length + 1);
  num = Number(num);
  if (!isNaN(num)) {
    DataBase.appendDataBase(room, "\n" + cnt + num);
    for (let i = 0; i < num; i++) {
      DataBase.appendDataBase(room, "\n인원 " + i + " : ");
    }
    return true;
  } else {
    return false;
  }
}

function checkCommit(date, room, Doc, str, count) {
  let result = date + "일자\n" + room + " 그룹 커밋 수\n";
  let name;
  let id;
  let word = str.substring(str.indexOf(count(room)) + 2);
  for (i = 0; i < count(room); i++) {
    let temp_word = word.substring(0, word.indexOf("\n"));
    if (word.indexOf("\n") == -1) {
      name = word.substring(0, word.indexOf(" :"));
      id = word.substring(word.indexOf(" : ") + 3);
    } else {
      name = temp_word.substring(0, temp_word.indexOf(" :"));
      id = temp_word.substring(temp_word.indexOf(" : ") + 3);
    }
    result =
      result + name + " : " + Doc("https://ghchart.rshah.org/" + id) + "\n";
    word = word.substring(word.indexOf("\n") + 1);
  }
  return result;
}
function createGroup(room, sender) {
  DataBase.appendDataBase(room, root + sender);
  return true;
}

function createList(room, msg, count, str) {
  temp = ".명단작성";
  let word = msg.substring(temp.length + 1);
  let temp_word = word.substring(0, word.indexOf(","));
  word = word.substring(word.indexOf(",") + 2);
  for (i = 0; i < count(room); i++) {
    str = str.replace("인원 " + i + " : ", temp_word);
    if (temp_word != "null") {
      temp_word = word.substring(0, word.indexOf(","));
      if (word.indexOf(",") === -1) {
        temp_word = word;
      } else {
        word = word.substring(word.indexOf(",") + 2);
      }
    }
  }
  DataBase.setDataBase(room, str);
  return true;
}

function response(
  room,
  msg,
  sender,
  isGroupChat,
  replier,
  imageDB,
  packageName
) {
  /*
   *(string) room
   *(string) sender
   *(boolean) isGroupChat
   *(function) replier.reply(message)
   *(function) replier.reply(room, message, hideErrorToast = false)
   *(function) imageDB.getProfileBase64()
   *(string) packageName
   */

  if (preChat === msg) return;
  preChat = msg;

  const isExist = Boolean(DataBase.getDataBase(room) + "" !== "null");

  let date = new Date().yyyymmdd();

  let str = DataBase.getDataBase(room);

  const count = function(room) {
    const findIndex = str.indexOf(cnt);
    return str.substring(findIndex + cnt.length, findIndex + cnt.length + 1);
  };
  const checkManager = function(room) {
    if (isExist) {
      const findIndex = str.indexOf(root);
      const lastIndex = str.indexOf(cnt);
      if (lastIndex != -1) {
        return str.substring(findIndex + root.length, lastIndex - 1);
      } else {
        return str.substring(findIndex + root.length);
      }
    } else {
      return null;
    }
  };
  const Doc = function(url) {
    let doc = Utils.parse(url).select("rect[data-date=" + date + "]");
    let element = doc.attr("data-score");
    return element;
  };
  if (msg === ".스트레스") {
    replier.reply("발전의 계기!");
  }
  if (msg === ".도움말") {
    replier.reply(
      "등록된 명령어\n[.그룹생성], [.인원추가 n],\n[.명단작성 이름 : git닉네임],\n[.인증]\n\n상세 명령어\n[.인원추가 2]\n[.명단추가 홍길동 : hgd123, 변사또 : bsd234]\n[.그룹삭제]" +
        "\n명단 추가는 한번에 해주세요."
    );
  } else if (msg.indexOf(".테스트") === 0) {
    let test = Utils.parse("https://ghchart.rshah.org/INT31302").select(
      "rect[data-date*=2019-" + msg.split(" ").reverse()[0] + "]"
    );
    let test2 = test.toString();
    let checkcount = test2.match(/>/g).length;
    var myArray = [];
    var myArray2 = [];
    var testcnt = 0;
    for (let i = 0; i < checkcount; i++) {
      myArray[i] = test2.substring(0, test2.indexOf(">") + 1);
      test2 = test2.substring(test2.indexOf(">") + 1).trim();
      let date = myArray[i].split(" ")[3];
      let cnt = myArray[i].split(" ")[2];
      if (cnt === 'data-score="0"') {
        myArray2[testcnt] = date.substring(11, 21);
        testcnt++;
      }
    }
    myArray2.sort(function(a, b) {
      let dateA = a.split("-")[2];
      let dateB = b.split("-")[2];
      return dateA > dateB ? 1 : -1;
    });
    var str = sender + "님이 커밋 안한 날짜";
    for (let i = 0; i < testcnt; i++) {
      str += "\n" + myArray2[i];
    }
    replier.reply(str);
    preChat = null;
  } else if (msg === ".그룹생성") {
    if (!isExist) {
      if (createGroup(room, sender))
        replier.reply(room + " 그룹을(를) 생성하였습니다.");
    } else {
      replier.reply("이미 그룹을 생성하였습니다.");
    }
  } else if (msg.indexOf(".인원추가") === 0) {
    if (checkManager(room) !== sender) {
      replier.reply("관리자가 아닙니다.");
    } else {
      if (!isExist) {
        replier.reply("그룹 생성을 먼저 해주세요.");
      } else {
        if (addPeople(room, msg))
          replier.reply("그룹 인원 수가 추가되었습니다.");
        else replier.reply("숫자를 입력해주시기 바랍니다.");
      }
    }
  } else if (msg.indexOf(".명단작성") === 0) {
    if (checkManager(room) !== sender) {
      replier.reply("관리자가 아닙니다.");
    } else {
      if (createList(room, msg, count, str)) {
        replier.reply("명단 작성을 완료하였습니다.");
        replier.reply(DataBase.getDataBase(room));
      }
    }
  } else if (msg === ".그룹삭제") {
    if (isExist) {
      if (sender === checkManager(room)) {
        removeGroup(room);
        replier.reply(room + " 그룹을 삭제하였습니다.");
      } else {
        replier.reply("관리자가 아닙니다!");
      }
    } else {
      replier.reply("그룹생성을 먼저해주세요!");
    }
  } else if (msg === ".인증") {
    replier.reply("잠시만 기다려주세요!");
    let result = checkCommit(date, room, Doc, str, count);
    replier.reply(result.trim());
    preChat = null;
  }
}
