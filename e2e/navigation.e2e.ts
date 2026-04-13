import { device, element, by, waitFor } from 'detox';

/**
 * Navigation tests — verifies tab navigation and key screen transitions.
 */
describe('Tab navigation', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // Wait for app to fully load
    await waitFor(element(by.id('world-map-screen')))
      .toBeVisible()
      .withTimeout(15000);
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should navigate to the Leaderboard tab', async () => {
    await element(by.id('tab-leaderboard')).tap();
    await waitFor(element(by.id('leaderboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate to the Profile tab', async () => {
    await element(by.id('tab-profile')).tap();
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate back to the World Map tab', async () => {
    await element(by.id('tab-world-map')).tap();
    await waitFor(element(by.id('world-map-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });
});

describe('World Map → Level Map flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitFor(element(by.id('world-map-screen')))
      .toBeVisible()
      .withTimeout(15000);
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should open the level map when a world card is tapped', async () => {
    await element(by.id('world-card-1')).tap();
    await waitFor(element(by.id('level-map-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should return to world map when back is pressed', async () => {
    await device.pressBack(); // Android hardware back
    await waitFor(element(by.id('world-map-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
