import { reverseGeocode, searchCity } from './src/services/geocoding.js';
import { loadWeather } from './src/services/weather.js';
import { spawn } from 'child_process';
import http from 'http';

async function runTests() {
  console.log('=== TEST 1: reverseGeocode for SP, RJ, Curitiba ===');
  const sp = await reverseGeocode({ latitude: -23.5505, longitude: -46.6333 });
  console.log('SP:', sp?.name, sp?.admin1, sp?.country);
  if (!sp?.name?.includes('São Paulo')) throw new Error('SP reverse geocode failed');

  const rj = await reverseGeocode({ latitude: -22.9068, longitude: -43.1729 });
  console.log('RJ:', rj?.name, rj?.admin1, rj?.country);
  if (!rj?.name?.includes('Rio de Janeiro')) throw new Error('RJ reverse geocode failed');

  console.log('=== TEST 2: reverseGeocode invalid inputs ===');
  const invalid1 = await reverseGeocode({ latitude: 'abc', longitude: 10 });
  const invalid2 = await reverseGeocode({ latitude: 100, longitude: 10 });
  if (invalid1 !== null || invalid2 !== null) throw new Error('Invalid coords should return null');
  console.log('Invalid coords safely returned null');

  console.log('=== TEST 3: loadWeather with empty location.name (reverse geocode trigger) ===');
  const weather1 = await loadWeather({
    city: '',
    location: {
      name: '',
      latitude: -23.5505,
      longitude: -46.6333,
      source: 'url'
    }
  });
  console.log('Enriched location:', weather1.data?.location?.name, weather1.data?.location?.country);
  if (!weather1.data?.location?.name?.includes('São Paulo')) {
    throw new Error('loadWeather failed to enrich empty location name via reverse geocode');
  }

  console.log('=== TEST 4: loadWeather with "Minha localização" ===');
  const weather2 = await loadWeather({
    city: 'Minha localização',
    location: {
      name: 'Minha localização',
      latitude: -22.9068,
      longitude: -43.1729,
      source: 'geolocation'
    }
  });
  console.log('Enriched RJ location:', weather2.data?.location?.name, weather2.data?.location?.country);
  if (!weather2.data?.location?.name?.includes('Rio de Janeiro')) {
    throw new Error('loadWeather failed to enrich "Minha localização"');
  }

  console.log('=== TEST 5: E2E in real Headless Chrome ===');
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--remote-debugging-port=9337',
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=/tmp/chrome-test-suite-' + Date.now(),
    'http://localhost:5173'
  ]);

  try {
    await new Promise(r => setTimeout(r, 1200));

    const list = await new Promise((resolve, reject) => {
      http.get('http://localhost:9337/json/list', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    const page = list.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 1;
    const pending = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg.result);
        pending.delete(msg.id);
      }
    };

    const send = (method, params = {}) => new Promise((resolve) => {
      const msgId = id++;
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await new Promise(r => ws.onopen = r);

    // Set geolocation to São Paulo
    await send('Emulation.setGeolocationOverride', {
      latitude: -23.5505,
      longitude: -46.6333,
      accuracy: 50
    });

    await send('Browser.grantPermissions', {
      permissions: ['geolocation'],
      origin: 'http://localhost:5173'
    });

    await new Promise(r => setTimeout(r, 1500));

    // Click locator button
    await send('Runtime.evaluate', {
      expression: 'document.querySelector(".location-search__geo").click()'
    });

    // Wait 3.5s for resolution
    await new Promise(r => setTimeout(r, 3500));

    const state = await send('Runtime.evaluate', {
      expression: `({
        url: window.location.href,
        inputVal: document.querySelector('#citySearchInput')?.value,
        cityName: document.querySelector('.city-header__name')?.textContent
      })`,
      returnByValue: true
    });
    console.log('E2E after click:', state.result.value);

    const { url, inputVal, cityName } = state.result.value;
    if (!url.includes('lat=-23.5505') || !url.includes('lon=-46.6333')) {
      throw new Error('URL does not contain coordinates: ' + url);
    }
    if (inputVal !== 'São Paulo') {
      throw new Error('Input value is not São Paulo: ' + inputVal);
    }
    if (!cityName.includes('São Paulo')) {
      throw new Error('City header does not display São Paulo: ' + cityName);
    }

    // Now test page reload persistence
    console.log('Testing page reload...');
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 3000));

    const stateAfterReload = await send('Runtime.evaluate', {
      expression: `({
        url: window.location.href,
        inputVal: document.querySelector('#citySearchInput')?.value,
        cityName: document.querySelector('.city-header__name')?.textContent
      })`,
      returnByValue: true
    });
    console.log('E2E after reload:', stateAfterReload.result.value);

    if (!stateAfterReload.result.value.cityName.includes('São Paulo')) {
      throw new Error('Failed to persist location on reload! Got: ' + stateAfterReload.result.value.cityName);
    }

    ws.close();
    console.log('\n ALL TESTS PASSED SUCCESSFULLY! ');
  } finally {
    chrome.kill();
  }
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
