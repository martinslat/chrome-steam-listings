/**
 * bekgraundskripts, padod ziņu kontentskriptam, ka notikusi cenas ielāde 
 */

chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id,
                        {priceLoadingBefore: true,details:details}
                );
            });
        },
        {
            urls: [
                "http://steamcommunity.com/market/pricehistory/*"
            ]
        });


chrome.webRequest.onCompleted.addListener(
        function(details) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                //  alert('zinjoju par cenu ielaadi!');
                chrome.tabs.sendMessage(tabs[0].id,
                        {priceLoadingAfter: true,details:details}
                );
            });
        },
        {
            urls: [
                "http://steamcommunity.com/market/pricehistory/*"
            ],
            types: ["xmlhttprequest"]
        });
