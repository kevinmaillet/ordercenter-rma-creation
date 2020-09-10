require("dotenv").config();
const { Builder, By } = require("selenium-webdriver");
const company = process.env.OC_COMPANY;

async function test(order) {
  let driver;

  driver = await new Builder().forBrowser("chrome").build();

  await driver.manage().window().maximize();

  try {
    await driver.get(
      `https://${company}.oc.demandware.net/3.9.7/Administration/login.aspx?ReturnUrl=%2F3.9.7%2FCustomerService%2Fdefault.aspx`
    );
    await driver.findElement(By.id("Domain")).sendKeys(process.env.OC_DOMAIN);
    await driver.findElement(By.id("Username")).sendKeys(process.env.OC_LOGIN);
    await driver
      .findElement(By.id("Password"))
      .sendKeys(process.env.OC_PASSWORD);
    await driver.findElement(By.id("bLogin")).click();

    await driver.get(
      `https://${company}.oc.demandware.net/3.9.7/CustomerService/site/modules/OrderManager/Search.aspx`
    );
    await driver
      .findElement(
        By.xpath(
          '//*[@id="ctl00_BodyContent_OrderSearchForm1_txtSearchString"]'
        )
      )
      .sendKeys(`${order}`);

    await driver
      .findElement(
        By.xpath(
          '//*[@id="ctl00_BodyContent_OrderSearchForm1_btnLocateOrders_AButton"]'
        )
      )
      .click();

    if (
      await driver
        .findElements(By.className("mscMsgBoxWarning"))
        .then((found) => !!found.length)
    ) {
      await driver.quit();
      return "wrong po number";
    }

    await driver
      .findElement(
        By.xpath(
          `//*[@id="ctl00_BodyContent_OrderSearchForm1_GridView1_ctl02_bId_AButton_0"]`
        )
      )
      .click();

    if (
      await driver
        .findElements(By.className("mscTotalReshipped"))
        .then((found) => !!found.length)
    ) {
      await driver.quit();
      return "reship";
    } else {
      const pendingElements = driver.findElements(
        By.xpath(`.//*[@value='return']`)
      );

      const otherPendingElements = driver.findElements(
        By.xpath(`.//*[@value='d59d591c-de01-43dd-bc15-00aedb9ae6cc']`)
      );

      function runClicks(pendingEl) {
        pendingEl.then(function (elements) {
          let pendingHtml = elements.map(function (elem) {
            return elem;
          });

          Promise.all(pendingHtml).then(function (allHtml) {
            allHtml.forEach((thing) => {
              thing.click();
            });
          });
        });
      }

      runClicks(pendingElements);
      runClicks(otherPendingElements);

      await driver
        .findElements(By.className("mscCreditModes"))
        .then((credits) => {
          let creditCount = credits.length / 2;

          for (let i = 2; i < creditCount + 2; i++) {
            driver
              .findElement(
                By.xpath(
                  `//*[@id="ctl00_BodyContent_OrderOperatorForm1_OrderDetailView1_dgItems_ctl0${i}_ddCreditModes"]/option[2]`
                )
              )
              .click();
            driver
              .findElement(
                By.xpath(
                  `//*[@id="ctl00_BodyContent_OrderOperatorForm1_OrderDetailView1_dgItems_ctl0${i}_lineReturnForm_ddReasonCodes"]/option[2]`
                )
              )
              .click();
          }
        });
      await driver
        .findElement(
          By.xpath(
            `//*[@id="ctl00_BodyContent_OrderOperatorForm1_OrderDetailView1_ApplyButton_AButton"]`
          )
        )
        .click();
      if (
        await driver
          .findElements(
            By.xpath(
              `//*[@id="ctl00_BodyContent_OrderCreditMethodsForm1_gvCreditMethodsDetail_ctl02_cbxApplyCredit"]`
            )
          )
          .then((found) => !found.length)
      ) {
        if (
          await driver
            .findElements(
              By.xpath(`//*[@id="ctl00_BodyContent_divLinkedOrders"]/div`)
            )
            .then((found) => !!found.length)
        ) {
          await driver.quit();
          return "exchange";
        } else {
          await driver.quit();
          return "already made";
        }
      }
      await driver
        .findElement(
          By.xpath(
            `//*[@id="ctl00_BodyContent_OrderCreditMethodsForm1_gvCreditMethodsDetail_ctl02_cbxApplyCredit"]`
          )
        )
        .click();
      await driver
        .findElement(
          By.xpath(
            `//*[@id="ctl00_BodyContent_OrderActivityForm1_ddActivityCode"]/option[2]`
          )
        )
        .click();
      await driver
        .findElement(
          By.xpath(
            `//*[@id="ctl00_BodyContent_OrderActivityForm1_ddResultCode"]/option[2]`
          )
        )
        .click();
      await driver
        .findElement(
          By.xpath(`//*[@id="ctl00_BodyContent_OrderActivityForm1_txtSubject"]`)
        )
        .sendKeys("Blind Return");
      await driver
        .findElement(
          By.xpath(`//*[@id="ctl00_BodyContent_SubmitButton_AButton"]`)
        )
        .click();

      await driver.quit();
    }
  } catch (err) {
    console.log(err);
  }
}

exports.test = test;
