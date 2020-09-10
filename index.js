const { test } = require("./blindReturns.js");

const orders = [
  //Add list of orders here.
];

(runLoop = async () => {
  let reships = [];
  let exchanges = [];
  let alreadyMadeReturn = [];
  let wrongOrderNumber = [];
  const startDate = new Date();

  for (let i = 0; i < orders.length; i++) {
    try {
      let result = await test(orders[i]);
      if (result === "reship") {
        reships.push(orders[i]);
      } else if (result === "exchange") {
        exchanges.push(orders[i]);
      } else if (result === "already made") {
        alreadyMadeReturn.push(orders[i]);
      } else if (result === "wrong po number") {
        wrongOrderNumber.push(orders[i]);
      }
    } catch (err) {
      console.log(err);
    }
  }
  const endDate = new Date();
  let diff = endDate - startDate;
  let minutes = Math.round(diff / 1000 / 60);

  console.log({ reships, exchanges, alreadyMadeReturn, wrongOrderNumber });
  console.log(
    `Program ran with ${orders.length} returns and took ${minutes} minutes`
  );
})();
