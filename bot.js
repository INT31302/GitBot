const scriptName = "GitBot";
const root_str = "관리자 : ";
const cnt_str = "인원 수 : ";
const token_str = "Token : ";
let preChat = null;
Date.prototype.yyyymmdd = function() {
  let yyyy = this.getFullYear().toString();
  let mm = (this.getMonth() + 1).toString();
  let dd = this.getDate().toString();
  return (
    yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0])
  );
};

function isExist(room) {
  return Boolean(DataBase.getDataBase(room) + "" !== "null");
}

function checkManager(str, sender) {
  let manager = str.substring(str.indexOf(root_str)).split(":")[1];
  manager = manager.substring(0, manager.indexOf("\n")).trim();
  return Boolean(manager === sender);
}

function getManager(getRoom) {
  let manager = DataBase.getDataBase(getRoom);
  manager = manager.substring(manager.indexOf(root_str)).split(":")[1];
  manager = manager.substring(0, manager.indexOf("\n")).trim();
  return manager;
}

function getToken(getRoom) {
  let temp = DataBase.getDataBase(getRoom);
  temp = temp.substring(temp.indexOf(token_str)).split(":")[1];
  temp = temp.substring(0, temp.indexOf("\n")).trim();
  return temp;
}

function setToken(getRoom, sender, lastToken) {
  const newToken = createToken();
  let result = DataBase.getDataBase(getRoom);
  result = result.replace(getManager(getRoom), sender);
  result = result.replace(lastToken, newToken);
  DataBase.setDataBase(getRoom, result);
  if (
    checkManager(DataBase.getDataBase(getRoom), sender) &&
    getToken(getRoom) === newToken
  ) {
    return true;
  } else {
    return false;
  }
}
function createToken() {
  let array = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 8; i++) {
    let rnum = Math.floor(Math.random() * array.length);
    result += array.substring(rnum, rnum + 1);
  }
  return result;
}

function createGroup(room, sender) {
  DataBase.appendDataBase(
    room,
    root_str + sender + "\n" + token_str + createToken()
  );
  return true;
}

function removeGroup(room) {
  DataBase.removeDataBase(room);
}

function addPeople(room, msg) {
  let num = msg.match(/:/g).length;
  if (!isNaN(num)) {
    DataBase.appendDataBase(room, "\n" + cnt_str + num);
    for (let i = 0; i < num; i++) {
      DataBase.appendDataBase(room, "\n인원 " + i + " : ");
    }
    return true;
  } else {
    return false;
  }
}

function createList(room, msg, count, str) {
  let word = msg.substring(msg.split(" ")[0].length).trim(); // '.명단작성' 이후 msg
  word = word.replace(/ : /gi, ":");
  word = word.replace(/:/gi, " : "); // : 공백 통일화 작업
  let temp_word = word.substring(0, word.indexOf(",")); // ',' 단위로 한명 끊음
  word = word.substring(word.indexOf(",") + 1).trim(); // temp_word 이후 문장으로 저장
  const max = count; // 저장된 인원수 받아옴
  for (i = 0; i < max; i++) {
    str = str.replace("인원 " + i + " : ", temp_word);
    if (temp_word != "null") {
      temp_word = word.substring(0, word.indexOf(","));
      if (word.indexOf(",") === -1) {
        // 마지막 사람일 경우
        temp_word = word;
      } else {
        word = word.substring(word.indexOf(",") + 1).trim();
      }
    }
  }
  DataBase.setDataBase(room, str.trim());
  return true;
}

function checkCommit(date, room, Doc, str, count) {
  let result = date + "일자\n" + room + " 그룹 커밋 수\n";
  let name;
  let id;
  const max = count(room);
  str = DataBase.getDataBase(room);
  let word = str.substring(str.indexOf(max) + 1).trim();
  for (let i = 0; i < max; i++) {
    let temp_word = word.substring(0, word.indexOf("\n"));
    if (temp_word == "") {
      name = word.substring(0, word.indexOf(":")).trim();
      id = word.substring(word.indexOf(":") + 1).trim();
    } else {
      name = temp_word.substring(0, temp_word.indexOf(":")).trim();
      id = temp_word.substring(temp_word.indexOf(":") + 1).trim();
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
      month = month < 10 ? "0" + month.toString() : month.toString();
    } else {
      return (results = "0");
    }
    const data = DataBase.getDataBase(room);
    if (data.indexOf(msg.split(" ")[1]) != -1) {
      // '.기간체크' 다음 msg
      let context = data.substring(data.indexOf(cnt_str));
      context = context.substring(context.indexOf("\n") + 1);
      context = context
        .substring(context.indexOf(msg.split(":")[1]))
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

  if (msg.indexOf(".") === 0) {
    if (preChat === msg) return;
    preChat = msg;

    let date = new Date().yyyymmdd();

    let str = DataBase.getDataBase(room);

    let count = function(room) {
      let temp = str.substring(str.indexOf(cnt_str)).split(":")[1];
      return Number(temp.substring(0, temp.indexOf("\n")).trim());
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
        "등록된 명령어\n[.그룹생성],\n[.명단작성 이름 : git닉네임],\n[.인증]\n[.관리자인계 그룹명]\n[.관리자인수 그룹명, 토큰값]\n\n상세 명령어\n[.명단추가 홍길동 : hgd123, 변사또 : bsd234]\n명단 추가는 한번에 해주세요." +
          "\n[.그룹삭제]\n[.기간체크 이름 달]\n[.관리자인계 깃방]\n[.관리자인수 깃방, a1b2c3d4]\n\n버그 및 오류 문의 : tkdwo287"
      );
    } else if (msg.indexOf(".테스트") === 0) {
      preChat = null;
    }

    if (msg.indexOf(".관리자인계") === 0) {
      if (!isGroupChat) {
        let getRoom = msg.substring(String(".관리자인계").length).trim();
        if (isExist(getRoom)) {
          if (checkManager(DataBase.getDataBase(getRoom), sender)) {
            let result = getToken(getRoom);
            replier.reply(
              "Token : " + result + "\n인계할 관리자에게\n토큰을 전달해주세요!"
            );
          } else {
            replier.reply("관리자가 아닙니다.");
          }
        } else {
          replier.reply("등록되지 않은 그룹입니다.");
        }
      } else {
        replier.reply("개인채팅 기능입니다.");
      }
      return;
    }
    if (msg.indexOf(".관리자인수") === 0) {
      if (!isGroupChat) {
        let getRoom;
        let lastToken;
        try {
          getRoom = msg
            .substring(String(".관리자인수").length)
            .split(",")[0]
            .trim();

          lastToken = msg
            .substring(String(".관리자인수").length)
            .split(",")[1]
            .trim();
        } catch (e) {
          replier.reply("양식에 맞추어 입력해주시기 바랍니다.");
        }
        if (isExist(getRoom)) {
          if (lastToken === getToken(getRoom)) {
            setToken(getRoom, sender, lastToken)
              ? replier.reply("관리자가 인계되었습니다!")
              : replier.reply("오류! 관리자가 인계되지 않았습니다.");
          }
        } else {
          replier.reply("등록되지 않은 그룹입니다.");
        }
      } else {
        replier.reply("개인채팅 기능입니다.");
      }
      return;
    }

    if (msg === ".그룹생성") {
      if (!isExist(room)) {
        if (createGroup(room, sender))
          replier.reply(room + " 그룹을(를) 생성하였습니다.");
      } else {
        replier.reply("이미 그룹을 생성하였습니다.");
      }
      return;
    }

    if (isExist(room)) {
      try {
        if (msg === ".인증") {
          replier.reply("잠시만 기다려주세요!");
          let result = checkCommit(date, room, Doc, str, count);
          replier.reply(result.trim());
          preChat = null;
          return;
        }

        if (msg.indexOf(".기간체크") === 0) {
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
          return;
        }
      } catch (e) {
        replier.reply(
          "예상치 못한 오류가 발생하였습니다.\n오류 내용 제보 바랍니다."
        );
        replier.reply(e);
        return;
      }

      if (checkManager(str, sender)) {
        if (msg.indexOf(".명단작성") === 0) {
          addPeople(room, msg);
          str = DataBase.getDataBase(room);
          if (createList(room, msg, count(room), str)) {
            replier.reply("명단 작성을 완료하였습니다.");
            let result = DataBase.getDataBase(room);
            let result1 = result.substring(0, result.indexOf(token_str) - 1);
            let result2 = result
              .substring(result.indexOf(token_str))
              .split("\n")[0];
            result2 = result.substring(
              result.indexOf(result2) + result2.length
            );
            result = result1 + result2;
            replier.reply(result);
          }
          return;
        } else if (msg === ".그룹삭제") {
          removeGroup(room);
          replier.reply(room + " 그룹을 삭제하였습니다.");
          return;
        }
      } else {
        replier.reply("관리자가 아닙니다.");
      }
    } else {
      replier.reply("그룹 생성을 먼저 해주세요.");
    }
  }
}
