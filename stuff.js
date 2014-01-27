var autoSwitchToListings = false; //atverot pārdošanas dialogu, vai automātiski pārslēgt uz listingu listi; pārslēdzot manuāli mainīs šo vērtību - lai atcerētos pēdējo lietoto režīmu; saglabājas tikai 1 refreša robežās

$(document).ready(function() { //vajag, jo ir norādīts run_at document_end

    // console.log('kontentskripts sākas');



    chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                //   console.log(request);
                if (request.priceLoadingBefore == true) {
                    // console.log('cenas sāk lādēt, kaut kas jādara');
                    var url = request.details.url;
                    drawListings(url);
                }
                if (request.priceLoadingAfter == true) {
                    //grafika dati ir ielādēti

                    if (autoSwitchToListings) {
                        var interval = setInterval(function() { //pagaidīšu kamēr tiek piestartēts jqplots un tad pārslēgšu uz listingiem [negaidot, pārslēdzot uzreiz, jqplots neieslēdzas un pārslēdzot atpakaļ uz grafiku tas nav uzzīmēts]
                            //poor-mans-callback: gaidīšu kamēr izveidosies jqplots
                            if ($("#pricehistory .jqplot-xaxis").length) {
                                $(".listingswitcher .listings").trigger('click'); //pārslēdz
                                clearInterval(interval);
                                return;
                            }
                        }, 10);
                    }

                    //      console.log('cenas ir ielādētas, kaut kas jādara');
                }
            });


    $(document).on("click", ".listingswitcher a", function(e) {
        e.preventDefault();
        if ($(this).hasClass('listings')) {
            $("#pricehistory_container .market_dialog_content").hide(); //abi
            $("#pricehistory_container .market_dialog_content#listings").show(); //manējais
            autoSwitchToListings = true;
        }
        if ($(this).hasClass('graph')) {
            $("#pricehistory_container .market_dialog_content").show();
            $("#pricehistory_container .market_dialog_content#listings").hide();
            autoSwitchToListings = false;
        }


    });



});


function drawListings(url) {
    /*  
     url -- http://steamcommunity.com/market/pricehistory/?appid=753&market_hash_name=40800-Dr.%20Fetus! 
     cenu grafika urlis; man vajag no tā dabūt preces nosaukumu UN idu
     vajag izveidot listingu urli
     http://steamcommunity.com/market/listings/753/57690-Senator%20Nick%20Richards
     daru to ļoti primitīvā veidā :P
     
     cenu grafiks:
     http://steamcommunity.com/market/pricehistory/?appid=753&market_hash_name=246090-Miner
     
     listinga pilnā lapa:
     http://steamcommunity.com/market/listings/753/246090-Miner
     
     tikai listingi:
     http://steamcommunity.com/market/listings/753/246090-Miner/render/?query=&search_descriptions=0&start=0&count=10
     
     */


    url = url.replace("/pricehistory/?appid=", "/listings/");
    url = url.replace("&market_hash_name=", "/");
    url += "/render/?query=&search_descriptions=0&start=0&count=10";

    $("#pricehistory_container #listings").remove(); //aizvācu iepriekšējo
    $("#pricehistory_container .market_dialog_content").show(); //jāparāda grafiks, jo, iespējams, tas ir paslēpts

    var itemName = $("#market_sell_dialog_item_name").html();



    //blakus grafikam, pievienoju savu HTMLu- kas aizņems grafika vietu        
    $('#pricehistory_container .market_dialog_content').after("<div class='market_dialog_content' id='listings' style='display:none' >" +
            "<div id='pricehistory_throbber' class='loader' style='text-align: center; height: 175px; display: no-ne;'>" +
            "<img src='http://cdn.steamcommunity.com/public/images/login/throbber.gif' style='margin-top: 72px;'>" +
            "</div>" +
            "<br>" +
            "<div style='clear: both'></div>" +
            "</div>");

    //pārslēdzējs, ies gan grafikā, gan listingā
    var switchhtml = "<div class='listingswitcher'>" +
            "Type:" +
            "<a href='#graph' class='graph' >Graph</a>" +
            "<a href='#listings' class='listings'>Listings</a>" +
            "</div>";

    $("#pricehistory_container .market_dialog_content .listingswitcher").remove();//aizvācu pārslēdzēju, jo nezinu vai šī ir pirmā reize, drošs paliek drošs
    $("#pricehistory_container .market_dialog_content br").after(switchhtml); //ievietoju 2 gabalus (grafikā un listingā)

    //ievācu listinga datus
    $.post(url, {
    }, function(data) {
        $('#listings .loader').after(data.results_html);
        $('#listings .loader').remove(); //aizvācu loderīti (pēc tam, kad esmu to izmantojis par punktu, kur ielikt jauno saturiņu)

        //katram pārdevējam novācu bildi (jo nav vietas tik lielām bildēm)
        $(".market_listing_row .market_listing_seller a").each(function() {
            $(this).find("img").remove();
            var name = $(this).attr("href");
            name = name.replace("http://steamcommunity.com/profiles/", "");
            name = name.replace("http://steamcommunity.com/id/", "");

            $(this).attr("target", "_blank");
            $(this).html(name); //linkā ieliek atrasto vārdu; iespējams tas nav īstais vārds, tas ir Steam::id, sliņķiem tas ir ciparisks :\
        });

    });


}





/*
 function switchToListings() {
 $('#pricehistory_container .market_dialog_content').hide();
 $('#pricehistory_container #listings').show();
 }
 */