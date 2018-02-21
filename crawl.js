let fetch =  require('node-fetch');
let cheerio = require('cheerio');

let products = [];
let productIds = [];
let productsWithPriceDiff = [];
let productsSorted = [];

const BASE_URL = 'https://www.prisjakt.nu/ajax/server.php?class=Graph_Product&method=price_history&skip_login=1&product_id='

const opts = {
    headers: {
        cookie: 'usersettings=%7B%22sidebar_layout_mode%22%3A%22hidden%22%2C%22active_sidebar_list%22%3A%22MyLists%22%2C%22filter_layout_mode%22%3A%22maximized%22%2C%22category_matrix_layout%22%3A%22img%22%2C%22category_realtime_search%22%3A%221%22%2C%22category_nav_layout%22%3A%22list%22%2C%22products_per_page%22%3A%22100%22%2C%22products_per_page_mixed%22%3A1000%2C%22products_per_page_image%22%3A%221000%22%2C%22mobile_products_per_page%22%3A%221000%22%2C%22mobile_products_per_page_mixed%22%3A%221000%22%2C%22mobile_products_per_page_image%22%3A%2230%22%7D'
    }
};
fetch(`https://www.prisjakt.nu/kategori.php?k=1381`, opts)
.then(res => res.text())
.then(body => {
    let $ = cheerio.load(body);
    $('#div_produktlista li > a').each( (index, value) => {
        productIds.push( value.attribs.href.replace('/produkt.php?p=', ''));
    });
    Promise.all( productIds.map( (id) => {
        fetch(BASE_URL + id)
        .then(res => res.json())
        .then(json => {
            let product = {};
            product.id = id;
            if( parseInt(json.items[0][0].value) < 1 || json.items[0][json.items[0].length-1].value < 1 ) return;
            let pricesSum = json.items[0].reduce(function(a,b){
                return a + b;
            });
            product.avgPrice = pricesSum / json.items[0].length
            product.pricePercentDrop = json.items[0][json.items[0].length-1].value / product.avgPrice; //json.items[0][0].value;
            productsWithPriceDiff.push(product);
            console.log(productsWithPriceDiff.length);
        }).then(() => {
            productsSorted = productsWithPriceDiff.sort(function(a, b) { 
                return a.pricePercentDrop - b.pricePercentDrop;
            });
            let i = 0;
            while(i < productsSorted.length && i < 10) {
                console.log('No: ' + i + ' ' + productsSorted[i].id);
                i++;
            }
            //console.log('No: ' + '1' + ' ' + productsSorted[0].id);
        });
    }))
});