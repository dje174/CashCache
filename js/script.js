/* HEPL RIA 2013 - Test One
 *
 * JS Document - /js/script.js
 *
 * coded by Jérôme Poucet
 * started at 03/01/14
 */
/* jshint boss: true, curly: true, eqeqeq: true, eqnull: true, immed: true, latedef: true, newcap: true, noarg: true, browser: true, jquery: true, noempty: true, sub: true, undef: true, unused: true, white: false */
(function( $ ){
    "use strict";

//variables globales :
    var oMyPosition,
        oDefaultPosition = new google.maps.LatLng( 50.633333, 5.566667 ),
        iDefaultZoom = 14,
        gMap,
        gMarkersBank = [],
        gGeocoder,
        oRadius = 2,
        markerName,
        markerSize,
        aListBanks = [],
        $banksContainer = $(".banques"),
        $numberOfBanks = $(".numberOfBanks"),
        $refresh = $(".refresh");

    var generateGoogleMap = function() {
        var MyMapId = 'custom_style';
        //On change le style de la map
        var featureOpts = [
                {
                    featureType: 'water',
                    stylers: [
                    { color: '#4287cb' }
                    ]
                }
            ];
        //on génère la map en ciblant le div gmap dans le code html
        gMap = new google.maps.Map( document.getElementById( "gmap" ), {
            center: oDefaultPosition,
            zoom: iDefaultZoom,
            scrollwheel: false,//on désactive le zoom au scroll
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, MyMapId]
            },
            mapTypeId: MyMapId
        });
        var styledMapOptions = {
            name: 'Custom Style'
        };
        var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);
        gMap.mapTypes.set(MyMapId, customMapType);
    }; //generate google map

    var getPositionSuccess = function (oPosition) {
        oMyPosition = oPosition.coords;
        updateGoogleMapPosition();
        findBanks();
    };//Si la position a bien été trouvée, alors on update la position de l'user et on trouve les banques

    var getPositionError = function (oError) {
        console.error( oError );
    };//Si la position n'a pas été trouvée, alors on affiche l'erreur dans la console

    var updateGoogleMapPosition = function() {
        //To do: center google map and create marker at current position
        var gMyPosition = new google.maps.LatLng( oMyPosition.latitude, oMyPosition.longitude );//On update sur la position de l'user
        gMap.panTo( gMyPosition );//on centre sa position
        markerName="marker";
        markerSize=new google.maps.Size(30,48);//On précise le nom et la taille du marqueur pour l'user
        generateMapMarkers(gMyPosition, markerName);//On génère un marqueur pour sa position via la fonction ci-dessous
    };//updateGoogleMapPosition


    var generateMapMarkers = function(position, markerName) {
        gMarkersBank.push( new google.maps.Marker({
            position: position,
            map: gMap,
            animation: google.maps.Animation.DROP,
            icon:{
                url: '../img/'+markerName+'.png',
                size: markerSize,
                origin: new google.maps.Point(0,0),
                anchor: new google.maps.Point(0, 32)
            }
        }));
    }//On push dans la variable gMarkersBank un nouveau marqueur avec comme argument position et markerName pour pouvoir générer des marqueurs via d'autres fonctions

    var displayBanks = function(){
        //On affiche les banques
        if( $numberOfBanks.length<2){
            $numberOfBanks.text(aListBanks.length + " banques dans les environs (" + oRadius +"km)");
        }else{
            $numberOfBanks.text(aListBanks.length + " banque dans les environs (" + oRadius +"km)");
        }//s'il y a moins de deux banques on écrit "banque" et s'il y en a plus que deux "banques"
        $banksContainer.children().remove();//On enlève le contenu de l'ul
        for( var i = 0; i<aListBanks.length ; ++i ){//On parcours les tableau avec la liste des banques ajoutées via la position
            $( '<li class="banque"><div class="bankDetails"><a class="panToBank" href=""><img src="" alt="" /><h4 class="name"></h4></a><span class="distance"></span></div><p class="address"><p></li>' )
                .find( ".name" )
                    .text( aListBanks[i].bank.name )
                    .attr("style", "color : #" + aListBanks[i].bank.color + ";")
                    .end()//On récupère le nom de la banque et on lui met la couleur appropriée à la banque
                .find( "img" )
                    .attr("src", aListBanks[i].bank.icon )
                    .end()//On récupère l'icône de la banque
                .find( ".distance" )
                    .text( aListBanks[i].distance + "m" )
                    .end()//On récupère la distance
                .find( ".address" )
                    .text( aListBanks[i].address )
                    .end()//On récupère l'adresse de la banque
                .hide()
                .appendTo($banksContainer)
                .slideDown(500);
        }
    }

    var findBanks = function() {
        //On va chercher les données via Ajax
        $.ajax( {
            url: "http://ccapi.superacid.be/terminals?latitude="+oMyPosition.latitude+"&longitude="+oMyPosition.longitude+"&radius="+oRadius,
            //Requète dans laquelle on ajoute la latitude et longitude de l'auteur avec le radius
            method: "GET",
            dataType: "json",
            success: function( aBanks ){
                //tester si la requète envoie une erreur ou non
                if ( !aBanks.error ) {
                    aListBanks = aBanks.data;//On met les données des banques dans une variable avec un array vide
                    for( var i = 0; i<aListBanks.length ; ++i ){//On parcours l'entiereté de cet array
                        markerName = "markerCash";
                        markerSize=new google.maps.Size(20,32);
                        generateMapMarkers(new google.maps.LatLng( aListBanks[i].latitude, aListBanks[i].longitude), markerName, aListBanks[i].bank.name);
                        //Ensuite on génère un marqueurs pour chaque position de banque trouvée
                    }
                    displayBanks();//et on affiche les banques
                }
                else{
                    aListBanks = null;
                    displayError();
                }
                //Si la requète échoue on affiche les erreurs
            }
        } );
    };  //findBanks

    var refresh = function() {
        displayBanks();
    }

    var linkTroughBank = function() {
        for( var i = 0; i<aListBanks.length ; ++i ){
            bankPosition = new google.maps.LatLng( aListBanks[i].latitude, aListBanks[i].longitude );
            gMap.panTo( bankPosition );
        }
    }

    var displayError = function(){
        //dézoomer et recentrer la map sur 0,0
        gMap.panTo( oDefaultPosition, iDefaultZoom, false );
    }

    //main function :
    $( function() {
        generateGoogleMap();
        gGeocoder = new google.maps.Geocoder();
        if (navigator.geolocation){
            //do the thing
            navigator.geolocation.getCurrentPosition( getPositionSuccess, getPositionSuccess );
        }
        $banksContainer.children().on("click", ".panToBank", linkTroughBank);
        $refresh.on("click", ".refresh", refresh);
    });
}).call(this, jQuery);


    // var contentInfoWindow = function() {
    //     for(var i = 0; i<aListBanks.length ; ++i){ 
    //     $( '<div class="infoBulle"><h3 class="titreInfoBulle"></h3><p class="bodyInfoBulle"></p></div>' )
    //         .find( ".titreInfoBulle" )
    //             .text( aListBanks[i].bank.name )
    //             .attr("style", "color : #" + aListBanks[i].bank.color + ";")
    //             .end()
    //         .find( ".bodyInfoBulle" )
    //             .text( aListBanks[i].address )
    //             .end()
    //     }
    // };

    // var addCircleToPosition = function() {
    //     circleAroundPosition.push( new google.maps.Circle({
    //         strokeColor: '#FF0000',
    //         strokeOpacity: 0.8,
    //         strokeWeight: 2,
    //         fillColor: '#FF0000',
    //         fillOpacity: 0.35,
    //         map: gMap,
    //         center: gMyPosition,
    //         radius: oRadius
    //     }));
    // }