const puppeteer = require('puppeteer');

const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

if (process.env.NODE_ENV === 'production') {
  const PORT = process.env.PORT || 5000;
} else if (process.env.NODE_ENV === 'ci') {
  const PORT = process.env.PORT || 5000;
} else {
  const PORT = 5000;
}

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        const customPage = new CustomPage(page);
        return new Proxy(customPage, {
            get: function(target, property){
                return customPage[property] || browser[property] || page[property]; 
            }
        });
    }
    constructor(page){
        this.page = page;
    }
    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);
        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto(`http://localhost:${PORT}/blogs`);
        await this.page.waitFor('a[href="/auth/logout"]');
    }
    async getContentsOf(selector){
        return this.page.$eval(selector, el => el.innerHTML); 
    };
    get(path) {
        return this.page.evaluate(_path => {
            return fetch(_path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json());
        }, path);
    }
    post(path, data) {
        return this.page.evaluate((_path,_data) => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_data)
            }).then(res => res.json());
        }, path, data);
    }
    execRequests(actions){
        return Promise.all(actions.map(({ method, path, data }) => {
            return this[method](path, data);
        }));
    }
}

module.exports = CustomPage;