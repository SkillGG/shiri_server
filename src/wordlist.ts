import * as fs from "fs";
let wordlist: Set<string>[] & { ready?: true } = [];
try {
  const ENDic = fs.readFileSync("./dic/EN.bak", {
    encoding: "utf-8",
  });
  wordlist.push(new Set(ENDic.split("\n")));
  console.log("English loaded");
  const PLDic = fs.readFileSync("./dic/PL.bak", {
    encoding: "utf-8",
  });
  wordlist.push(new Set(PLDic.split("\n")));
  console.log("Polish loaded");
  console.log("Ready");
  wordlist.ready = true;
} catch (e) {
  console.error(e);
}
export default wordlist;
