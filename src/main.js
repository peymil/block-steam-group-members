import fetch from "node-fetch";
import { URLSearchParams } from "url";
import steamGroup from "steam-group-members";

class Steam {
  sessionId = "";
  steamLoginSecure = "";
  constructor(sessionId, steamLoginSecure) {
    this.sessionId = sessionId;
    this.steamLoginSecure = steamLoginSecure;
  }

  async sendPost(url, params) {
    const urlParams = new URLSearchParams({
      ...params,
      sessionID: this.sessionId,
    });

    const res = await fetch(url, {
      body: urlParams.toString(),
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: `sessionid=${this.sessionId};steamLoginSecure=${this.steamLoginSecure}`,
      },
    });
    if (res.status !== 200)
      throw new Error("Error while blocking/unblocking " + params.steamid);
    return res;
  }

  async blockUser(steamId, block) {
    const res = await this.sendPost(
      "https://steamcommunity.com/actions/BlockUserAjax",
      {
        steamid: steamId,
        block: block ? "1" : "0",
      }
    );
    return res;
  }

  async getGroupUsers(url) {
    return await steamGroup.getMembers(url);
  }
}

const blockGroupMembers = async (
  sessionId,
  steamSecureLogin,
  groupUrl,
  block
) => {
  const steam = new Steam(sessionId, steamSecureLogin);
  const groupUsers = await steam.getGroupUsers(groupUrl);
  let errorN = 0;

  const promises = groupUsers.map((user) => {
    return steam.blockUser(user, block).catch((err) => {
      console.error(err.message);
      errorN++;
    });
  });
  await Promise.all(promises);
  return groupUsers.length - errorN;
};

const main = async () => {
  const shouldBlock = process.argv[2];
  let block;
  if (shouldBlock === "block") {
    block = true;
  } else if (shouldBlock === "unblock") {
    block = false;
  } else {
    throw new Error("No block or unblock parameter");
  }

  const sessionId = process.argv[3];
  if (!sessionId) throw new Error("No sessionId");

  const steamSecureLogin = process.argv[4];
  if (!steamSecureLogin) throw new Error("No steam secure login token");

  const groupUrl = process.argv[5];
  if (!groupUrl) throw new Error("No group url");

  const sucessfullCount = await blockGroupMembers(
    sessionId,
    steamSecureLogin,
    groupUrl,
    block
  );

  console.log("Done");
  console.log(`${shouldBlock}ed ${sucessfullCount} accounts`);
};
main();
