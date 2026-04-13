import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

/**
 * Smoke tests — verifies the app launches and the main screen is visible.
 * These run on every CI build to catch critical regressions.
 */
describe('Smoke tests', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should show the world map screen on launch', async () => {
    // Wait up to 10s for the world map to appear
    await waitFor(element(by.id('world-map-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should display at least one world card', async () => {
    await waitFor(element(by.id('world-card-1')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should show the energy bar', async () => {
    await detoxExpect(element(by.id('energy-bar'))).toBeVisible();
  });
});
