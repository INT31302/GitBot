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

function createGroup(room, sender) {
  DataBase.appendDataBase(room, root + sender);
  return true;
}

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

function checkDate(msg, room) {
  let month = Number(msg.split(" ").reverse()[0]);
  let results = null;
  if (!isNaN(month)) {
    if (month >= 1 && month <= 12) {
      if (month < 10) {
        month = "0" + month.toString();
      } else {
        month = month.toString();
      }
    } else {
      return (results = "0");
    }
    const data = DataBase.getDataBase(room);
    if (data.indexOf(msg.split(" ")[1]) != -1) {
      const context = data
        .substring(data.indexOf(msg.split(" ")[1]))
        .split("\n")[0];
      const name = context.split(":")[0].trim();
      const id = context.split(":")[1].trim();
      let doc = Utils.parse("https://ghchart.rshah.org/" + id).select(
        "rect[data-date*=2019-" + month + "]"
      );
      let element = doc.toString();
      let checkcount = element.match(/>/g).length;
      var myArray = [];
      var datecnt = 0;
      for (let i = 0; i < checkcount; i++) {
        let temp = element.substring(0, element.indexOf(">") + 1);
        element = element.substring(element.indexOf(">") + 1).trim();
        let date = temp.split(" ")[3];
        let cnt = temp.split(" ")[2];
        if (cnt === 'data-score="0"') {
          myArray[datecnt] = date.substring(11, 21);
          datecnt++;
        }
      }
      myArray.sort(function(a, b) {
        let dateA = a.split("-")[2];
        let dateB = b.split("-")[2];
        return dateA > dateB ? 1 : -1;
      });
      results = name + "(" + id + ")님이\n커밋 안한 날짜\n총 횟수 : " + datecnt;
      for (let i = 0; i < datecnt; i++) {
        results += "\n" + myArray[i];
      }
      return results;
    } else {
      return (results = "1");
    }
  } else {
    return (results = "0");
  }
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
        "\n명단 추가는 한번에 해주세요.\n[.기간체크 이름 달]"
    );
  } else if (msg.indexOf(".테스트") === 0) {
    const data = DataBase.getDataBase(room);
    const context = data
      .substring(data.indexOf(msg.split(" ")[1]))
      .split("\n")[0];
    const name = context.split(":")[0].trim();
    const id = context.split(":")[1].trim();
    replier.reply(name);
    replier.reply(id);
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
  } else if (msg.indexOf(".기간체크") === 0) {
    replier.reply("잠시만 기다려주세요!");
    let result = checkDate(msg, room);
    switch (result) {
      case "0":
        replier.reply("올바른 달을 입력해주세요.");
        break;
      case "1":
        replier.reply("등록되지 않은 이름입니다,");
        break;
      default:
        replier.reply(result);
        break;
    }
    preChat = null;
  }
}
