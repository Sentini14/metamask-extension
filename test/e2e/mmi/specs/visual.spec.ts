import { test } from '../helpers/extension-loader';
import { ChromeExtensionPage } from '../pageObjects/mmi-extension-page';
import { MMIMainMenuPage } from '../pageObjects/mmi-mainMenu-page';
import { MMINetworkPage } from '../pageObjects/mmi-network-page';
import { MMISignUpPage } from '../pageObjects/mmi-signup-page';
import { CustodianTestClient } from '../custodian-hooks/hooks';
import { MMIAccountMenuPage } from '../pageObjects/mmi-accountMenu-page';
import { SEPOLIA_DISPLAY_NAME } from '../helpers/utils';

test.describe('MMI visual', () => {
  test('Full visual e2e', async ({ page, context }) => {
    // Getting extension id of MMI
    const extensions = new ChromeExtensionPage(await context.newPage());

    await extensions.goto();
    await extensions.setDevMode();
    const extensionId = await extensions.getExtensionId();
    await extensions.close();

    const signUp = new MMISignUpPage(
      await context.newPage(),
      extensionId as string,
    );
    await signUp.goto();
    await signUp.start();
    await signUp.authentication();
    await signUp.info();

    // Setup testnetwork in settings
    const mainMenuPage = new MMIMainMenuPage(page, extensionId as string);
    await mainMenuPage.goto();
    await mainMenuPage.fillPassword();
    await mainMenuPage.finishOnboarding();
    await mainMenuPage.selectMenuOption('settings');
    await mainMenuPage.selectSettings('Advance');
    await mainMenuPage.switchTestNetwork();
    await mainMenuPage.closeSettings();

    // Check network
    const networkPage = new MMINetworkPage(page);
    await networkPage.open();
    await networkPage.selectNetwork(SEPOLIA_DISPLAY_NAME);

    // get token to access Neptune
    const client = new CustodianTestClient();
    await client.setup();

    const accountsPopup = new MMIAccountMenuPage(page);

    await accountsPopup.accountsMenu();
    await accountsPopup.connectCustodian(
      process.env.MMI_E2E_CUSTODIAN_NAME as string,
      true,
    );

    // Check accounts added from Custodian
    await accountsPopup.accountsMenu();

    // Check remove custodian token screen (aborted before removed)
    await accountsPopup.removeTokenScreenshot('Custody Account A');
  });
});
