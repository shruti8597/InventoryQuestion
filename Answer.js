function calculateSellingPrice(country, otherCountry, transport, discount, quantity) {
    let sellingPrice = 0;
    let quantityCountry = country.quantity;
    let quantityOtherCountry = otherCountry.quantity;
    //nothing to order
    if (quantity == 0)
        return [sellingPrice, quantityCountry, quantityOtherCountry];
    let discountedTransport = transport - (transport * discount) / 100;
    if (country.price <= otherCountry.price) {
        //serve from same country
        let serveFromCountry = quantityCountry <= quantity ? quantityCountry : quantity;
        sellingPrice += serveFromCountry * country.price;
        quantityCountry -= serveFromCountry;
        let serveFromOther = quantity - serveFromCountry;
        sellingPrice += otherCountry.price * serveFromOther + (Math.ceil(serveFromOther / 10) * discountedTransport)
        quantityOtherCountry -= serveFromOther;
        return [sellingPrice, quantityCountry, quantityOtherCountry];
    }
    else {
        //point where other country is cheaper from own country
        let turningPoint = Math.ceil(discountedTransport / (country.price - otherCountry.price))
        if (turningPoint > 10) {
            //Never cheaper bring from own country
            if (quantityCountry < quantity) {
                let willGiveFromCountry = Math.floor(quantityCountry / 10) * 10;
                let balance = quantity - willGiveFromCountry;

                let giveFromOtherCountry = Math.floor(balance / 10) * 10;
                sellingPrice += Math.floor(balance / 10) * discountedTransport + giveFromOtherCountry * otherCountry.price;
                quantityOtherCountry -= giveFromOtherCountry;
                balance = quantity - giveFromOtherCountry;

                if (balance + willGiveFromCountry <= quantityCountry) {
                    sellingPrice += (balance + willGiveFromCountry) * country.price;
                    quantityCountry -= (balance + willGiveFromCountry);
                    return [sellingPrice, quantityCountry, quantityOtherCountry]
                }
                else {
                    if (willGiveFromCountry >= 10) {
                        let serveFromOtherOne = quantityOtherCountry >= 10 ? 10 : quantityOtherCountry
                        sellingPrice += serveFromOtherOne * otherCountry.price + discountedTransport;
                        quantityOtherCountry -= serveFromOtherOne;
                        let remaining = quantity - (giveFromOtherCountry + serveFromOtherOne);
                        sellingPrice += remaining * country.price;
                        quantityCountry -= remaining;
                        return [sellingPrice, quantityCountry, quantityOtherCountry]
                    }
                    else {
                        sellingPrice += balance * otherCountry.price + discountedTransport;
                        quantityOtherCountry -= balance;
                        return [sellingPrice, quantityCountry, quantityOtherCountry]
                    }
                }
            }
            else {
                sellingPrice += quantity * country.price;
                quantityCountry -= quantity;
                return [sellingPrice, quantityCountry, quantityOtherCountry];
            }
        }
        else {
            //serve 10 multiples from other country since it is cheaper
            let tenBatchFromOther = Math.floor(quantity / 10);
            let serveFromOtherCountryBatch = tenBatchFromOther * 10 > quantityOtherCountry ? Math.floor(quantityOtherCountry / 10) : tenBatchFromOther
            sellingPrice += serveFromOtherCountryBatch * discountedTransport + serveFromOtherCountryBatch * 10 * otherCountry.price;
            quantityOtherCountry -= serveFromOtherCountryBatch * 10;
            let sold = serveFromOtherCountryBatch * 10;
            let remained = (quantity - sold);
            if (remained < 10) {
                //Serve fractional part depending upon
                if (remained >= turningPoint || remained > quantityCountry) {
                    //serve from other country -> remaining is not available other country\
                    //turning point available
                    if (remained <= quantityOtherCountry) {
                        sellingPrice += discountedTransport + remained * otherCountry.price;
                        quantityOtherCountry -= remained;
                        return [sellingPrice, quantityCountry, quantityOtherCountry]
                    }
                    else if (quantityOtherCountry >= turningPoint || remained > quantityCountry) {
                        //quantity is less thsn required but greater than turning point bring all valble from other cpuntry
                        sellingPrice += discountedTransport + quantityOtherCountry * otherCountry.price;
                        remained -= quantityOtherCountry;
                        quantityOtherCountry = 0;
                        sellingPrice += country.price * remained;
                        quantityCountry -= remained
                        return [sellingPrice, quantityCountry, quantityOtherCountry]
                    }
                    else {
                        //bring from own country
                        sellingPrice += remained * country.price;
                        quantityCountry -= remained;
                        return [sellingPrice, quantityCountry, quantityOtherCountry]
                    }
                }
                else {
                    //serve from other country -> cheaper in own 
                    sellingPrice += remained * country.price;
                    quantityCountry -= remained;
                    return [sellingPrice, quantityCountry, quantityOtherCountry]
                }
            }
            else {
                //Other country ran out of stock
                if (remained >= turningPoint || remained > quantityCountry) {
                    sellingPrice += discountedTransport + quantityOtherCountry * otherCountry.price;
                    remained -= quantityOtherCountry;
                    quantityOtherCountry = 0;
                    sellingPrice += country.price * remained;
                    quantityCountry -= remained
                    return [sellingPrice, quantityCountry, quantityOtherCountry]
                }
                else {
                    sellingPrice += remained * country.price;
                    quantityCountry -= remained;
                    return [sellingPrice, quantityCountry, quantityOtherCountry]
                }
            }
        }
    }
}

function implementation(input, items, transport, discount) {
    if (!input)
        return 'No input recieved';
    let split = input.split(":")
    if (split.length < 2)
        return 'Invalid input';
    if (split.length == 2)
        return items.reduce((acc, _) => {
            return acc + ':' + (_.uk.quantity + ':' + _.germany.quantity)
        }, '0');
    let country = split[0];
    if (country != 'UK' && country != 'Germany')
        return 'Invalid Country'
    let passportRecieved = split[1];
    let passport = 'Invalid'
    if (/^B\d{3}[A-Za-z]{2}[A-Za-z0-9]{7}$/.test(passportRecieved))
        passport = 'UK';
    else if (/^A[A-Za-z]{2}[A-Za-z0-9]{9}$/.test(passportRecieved))
        passport = 'Germany'
    let sellingPrice = 0;
    for (let i = 2; i < split.length; i += 2) {
        let item = items.find(_ => _.label == split[i]);
        if (!item)
            return 'Can not fullfil item not in inventory';
        let requiredNo = parseInt(split[i + 1]);
        if (isNaN(requiredNo) || requiredNo < 0)
            return 'Invalid Input';
        if (requiredNo > item.uk.quantity + item.germany.quantity)
            return 'Can not fulfil';
        let discountTransport = 0;
        let countryInventory = item.uk;
        let otherCountryInventory = item.germany
        if (
            (passport.toLowerCase() == 'uk' && country.toLowerCase() == 'germany') ||
            (passport.toLowerCase() == 'germany' && country.toLowerCase() == 'uk')
        ) {
            discountTransport = discount
        }
        let statusAfterServing = null;
        if (country.toLowerCase() == 'germany') {
            statusAfterServing = calculateSellingPrice(otherCountryInventory, countryInventory, transport, discountTransport, requiredNo)
            item.uk.quantity = statusAfterServing[2];
            item.germany.quantity = statusAfterServing[1];
        }
        else {
            statusAfterServing = calculateSellingPrice(countryInventory, otherCountryInventory, transport, discountTransport, requiredNo)
            item.uk.quantity = statusAfterServing[1];
            item.germany.quantity = statusAfterServing[2];
        }
        sellingPrice += statusAfterServing[0];
    }
    return items.reduce((acc, _) => {
        return acc + ':' + (_.uk.quantity + ':' + _.germany.quantity);
    }, sellingPrice.toString());
}

function main() {
    let items = [
        {
            label: 'Gloves',
            uk: { price: 100, quantity: 100 },
            germany: { price: 150, quantity: 50 }
        },
        {
            label: 'Mask',
            uk: { price: 65, quantity: 100 },
            germany: { price: 100, quantity: 100 }
        }
    ];
    let input = 'UK::Gloves:250:Mask: 150';
    let transport = 400;
    let discount = 20;
    console.log(implementation(input, items, transport, discount))
}

main();
