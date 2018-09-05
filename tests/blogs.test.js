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

describe('when logged in', async () => {
    beforeEach( async () => {
        await page.login();
        await page.click('a.btn-floating');
    });
    test('can get to blog create form', async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });
    describe('and using valid inputs', async () => {
        beforeEach( async () => {
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');
            await page.click('form button');  
        });
        test('submitting takes user to review screen', async () =>{
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });
        test('submitting then saving adds blog to index page', async () => {
            await page.click('button.green');  
            await page.waitFor('.card');
            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');
            expect(title).toEqual('My Title');
            expect(content).toEqual('My Content');
        });
    });
    describe('and using invalid inputs', async () => {
        beforeEach( async () => {
            await page.click('form button');  
        });
        test('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');
            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });
});

describe('when not logged in', async () => {
    const actions = [{
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'Title',
                content: 'Content'
            }
        }
    ];
    test('blog-related actions are prohibited', async() => {
        const results = await page.execRequests(actions);
        for (let result of results){
            expect(result).toEqual({error: 'You must log in!'});
        };
    });
});