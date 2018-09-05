const Page = require('./helpers/page');

let page;

let PORT;
if (process.env.NODE_ENV === 'production') {
  PORT = process.env.PORT || 5000;
} else if (process.env.NODE_ENV === 'ci') {
  PORT = process.env.PORT || 5000;
} else {
  PORT = 8080;
};

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