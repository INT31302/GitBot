const scriptName = "GitBot";
const root = "관리자 : ";
const cnt = "인원 수 : ";
Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth() + 1).toString();
  var dd = this.getDate().toString();
  return (
    yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0])
  );
};
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
  const isExist = Boolean(DataBase.getDataBase(room) + "" !== "null");

  let date = new Date().yyyymmdd();

  let str = DataBase.getDataBase(room);

  const count = function(room) {
    const findIndex = str.indexOf(cnt);
    return str.substring(findIndex + cnt.length, findIndex + cnt.length + 1);
  };
  const senderName = function(room) {
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
    var doc = Utils.getWebText(url);
    var element = doc.indexOf(date);
    return doc.substring(element - 13, element - 14);
  };
  if (msg === ".도움말") {
    replier.reply(
      "등록된 명령어\n[.그룹생성], [.인원추가 n],\n[.명단작성 이름 : git닉네임],\n[.인증]\n\n상세 명령어\n[.인원추가 2]\n[.명단추가 홍길동 : hgd123, 변사또 : bsd234]\n[.그룹삭제]" +
        "\n명단 추가는 한번에 해주세요."
    );
  } else if (msg === ".테스트") {
    replier.reply(msg.substring(msg.indexOf(",")).trim());
  } else if (msg === ".그룹생성") {
    if (!isExist) {
      DataBase.appendDataBase(room, root + sender);
      replier.reply(room + " 그룹을(를) 생성하였습니다.");
    } else {
      replier.reply("이미 그룹을 생성하였습니다.");
    }
  } else if (msg.indexOf(".인원추가") === 0) {
    if (senderName(room) !== sender) {
      replier.reply("관리자가 아닙니다.");
    } else {
      if (!isExist) {
        replier.reply("그룹 생성을 먼저 해주세요.");
      } else {
        let temp = ".인원추가";
        const num = msg.substring(msg.indexOf(temp) + temp.length + 1);
        if (typeof num === "number") {
          DataBase.appendDataBase(room, "\n" + cnt + num);
          for (let i = 0; i < num; i++) {
            DataBase.appendDataBase(room, "\n인원 " + i + " : ");
          }
          replier.reply("그룹 인원 수가 추가되었습니다.");
        } else {
          replier.reply("숫자를 입력해주시기 바랍니다.");
        }
      }
    }
  } else if (msg.indexOf(".명단작성") === 0) {
    if (senderName(room) !== sender) {
      replier.reply("관리자가 아닙니다.");
    } else {
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
      replier.reply("명단 작성을 완료하였습니다.");
      replier.reply(DataBase.setDataBase(room, str));
    }
  } else if (msg === ".그룹삭제") {
    if (isExist) {
      if (sender === senderName(room)) {
        DataBase.removeDataBase(room);
        replier.reply(room + " 그룹을 삭제하였습니다..");
      } else {
        replier.reply("관리자가 아닙니다!");
      }
    } else {
      replier.reply("그룹생성을 먼저해주세요!");
    }
  } else if (msg === ".인증") {
    replier.reply("잠시만 기다려주세요!");
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
    replier.reply(result.trim());
  }
}
