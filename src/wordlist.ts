import * as fs from "fs";
let wordlist: Set<string>[] & { ready?: true } = [];
try {
  const ENDic = fs.readFileSync("./dic/EN.bak", {
    encoding: "utf-8",
  });
  const ENSet = new Set(ENDic.split("\n"));
  wordlist.push(ENSet);
  console.log("English loaded", ENSet.size);
  const PLDic = fs.readFileSync("./dic/PL.bak", {
    encoding: "utf-8",
  });
  const PLSet = new Set(PLDic.split("\n"));
  wordlist.push(PLSet);
  console.log("Polish loaded", PLSet.size);
  console.log("Ready");
  wordlist.ready = true;
} catch (e) {
  console.error(e);
}
export default wordlist;
