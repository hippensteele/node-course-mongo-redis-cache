const Page = require('./helpers/page');
const {PORT} = require('./helpers/port');

let page;

beforeEach( async () => {
    page = await Page.build();
    await page.goto(`http://localhost:${PORT}`);
});

afterEach( async () => {
    await page.close();
});

test('the header has the correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
});

test('clicking login starts the oauth flow', async () => {
    await page.click('.right a'); 
    const url = await page.url();
    expect(url).toMatch('/accounts\.google\.com');
});

test('when signed in, shows logout button', async () => {
    await page.login();
    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout');
});