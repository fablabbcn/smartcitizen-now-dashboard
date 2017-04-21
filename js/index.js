$(document).ready(function() {

    var tag = location.hash.substring(1) || 'Plaça del sol',
        offlineTime = 120;

    document.title = 'Smart Citizen @ ' + tag;

    $('body').append($('<h1>').text(tag)).append('<h3>').append($('<div>', {
        'class': 'devices'
    }).html('<div class="loader"><div class = "l l-1"></div><div class="l l-2"></div><div class="l l-3"></div></div>'));

    io.connect('wss://smartcitizen.xyz').on('data-received', function(device) {
        if (device.data.user_tags.includes(tag)) {
            $('*[data-device="' + device.device_id + '"]')
                .data('lastUpdate', device.data.last_reading_at)
                .data('batteryStatus', {
                    last: device.readings.bat[1],
                    prev: device.readings.bat[2]
                })
                .removeClass('offline')
                .addClass('online')
                .animateCss('flipInY');
        }
    });

    $.getJSON('https://api.smartcitizen.me/v0/devices/world_map', function(devices) {

        $('.devices').empty();

        devices.filter(function(device) {
            return device && device.user_tags && device.user_tags.includes(tag);
        }).sort(function(a, b) {
            return a.owner_id - b.owner_id;
        }).forEach(function(device) {
            $('.devices').append(
                $('<div>', {
                    'class': 'device offline',
                    'data-device': device.id
                })
                .data('lastUpdate', device.data[''])
                .data('batteryStatus', {
                    last: device.data['10']
                })
                .click(function() {
                    window.open('https://smartcitizen.me/kits/' + device.id, '_blank');
                })
                .html(device.name + ' <span> de ' + device.owner_username + '</span>').append(
                    $('<div>', {'class': 'status'}) 
                    .text(sentences['HAS_NOT_PUBLISHED']))
            );
        });
    });

    var update = function () {

        $('.device').each(function(device) {
            var lastDeviceUpdate = $(this).data('lastUpdate');

            if (lastDeviceUpdate) {

                var batteryStatus = $(this).data('batteryStatus');
                var $status = $(this).find('.status');

                $status.html(sentences['LAST_UPDATE'] + moment(lastDeviceUpdate).fromNow());

                var isOnline = true;

                if (new Date() - new Date(lastDeviceUpdate) > 1000 * offlineTime) {
                    isOnline = false;
                }

                if (batteryStatus && (batteryStatus.last || batteryStatus.last == 0)) {
                    if (batteryStatus.last == 0) {
                        if (isOnline) {
                            $status.append(sentences['DISCHARGED']);
                        } else {
                            $status.append(sentences['WAS_DISCHARGED']);
                        }
                    } else if (batteryStatus.last >= 100) {
                        if (isOnline) {
                            $status.append(sentences['CHARGED']);
                        } else {
                            $status.append(sentences['WAS_CHARGED']);
                        }
                    } else {
                        if (isOnline) {
                            $status.append(sentences['CHARGING'] + batteryStatus.last + '%');
                        } else {
                            $status.append(sentences['WAS_CHARGING'] + batteryStatus.last + '%');
                        }
                    }
                }

                if (isOnline) {
                    $(this).removeClass('offline').addClass('online');
                } else {
                    $(this).removeClass('online').addClass('offline');
                }

            }
        });

        var online = Math.ceil(($('.online').length / $('.device').length) * 100);

        online = (isNaN(online)) ? '' : ' (' + online + ' %)';

        $('h3').text($('.online').length + sentences['INTRO'] + $('.device').length + ' ' + online);

    }

    $.fn.extend({
        animateCss: function(animationName) {
            var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
            this.addClass('animated ' + animationName).one(animationEnd, function() {
                $(this).removeClass('animated ' + animationName);
            });
        }
    });

    moment.updateLocale('en', {
        relativeTime: {
            future: 'en %s',
            past: 'fa %s',
            s: function(number, withoutSuffix, key, isFuture) {
                return (number > 1) ? number + ' segons' : number + ' segon';
            },
            m: '1 minut',
            mm: function(number, withoutSuffix, key, isFuture) {
                return (number > 1) ? number + ' minuts' : number + ' minuts';
            },
            h: 'una hora',
            hh: '%d hores',
            d: 'un dia',
            dd: '%d dies',
            M: 'un mes',
            MM: '%d mesos',
            y: 'un any',
            yy: '%d anys'
        }
    });

    var sentences = {
        "INTRO": " Kits connectats d'un total de ",
        "HAS_NOT_PUBLISHED": "Esperant a que publiqui dades...",
        "LAST_UPDATE": "Última publicació ",
        "DISCHARGED": ", la bateria està descarregada",
        "WAS_DISCHARGED": ", la bateria estava descarregada",
        "CHARGED": ", la bateria està totalment carregada",
        "WAS_CHARGED": ", la bateria estava totalment carregada",
        "CHARGING": ", la bateria està al ",
        "WAS_CHARGING": ", la bateria estava al "
    };

    update();

    setInterval(function() {
        update();
    }, 500);

});