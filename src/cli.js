import blockGroupMembers from "./blockSteamGroupMembers";

const cli = async () => {
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
cli();
