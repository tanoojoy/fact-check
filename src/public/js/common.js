'use strict';
import { get, isArray } from 'lodash';
const axios = require('axios');

var commonModule = (function() {
    const self = this;

    if (typeof window !== 'undefined') {
        var $ = window.$;
    }
    function initSidebar() {
        var sidebar = function() {
            var $sidebar = $('.sidebar');

            var init = function() {
                // negotiate button in add-edit

                // desktop sidebar button
                $('.sidebar-action').on('click', function(e) {
                    e.stopImmediatePropagation();
                    $sidebar.toggleClass('o-collapse');
                    $('body').toggleClass('sidebar-collapse');
                });

                // mobile sidebar button
                $('#toggle-mobile-menu').click(function(e) {
                    e.stopImmediatePropagation();
                    $sidebar.toggleClass('o-collapse');
                    $('body').toggleClass('sidebar-collapse');

                    $('.header.mod li.h-extramenus ').slideUp();
                    $('.mobile_top_toggler > span').removeClass('_menu');
                    $('.mobile_top_toggler > span .fa-angle-down').removeClass('rotate');
                });

                $('.sidebar-nav > li.has-sub > a').on('click', function(e) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    var $this = $(this);
                    var $li = $(this).parent();

                    if ($li.hasClass('active')) {
                        $li.find('ul').slideUp();
                        $li.removeClass('active');
                    } else {
                        $('.sidebar-nav > li.has-sub ul').slideUp();
                        $li.find('ul').slideDown();
                        $('.sidebar-nav > li.has-sub').removeClass('active');
                        $li.addClass('active');
                    }
                });
            };

            return {
                init: init
            };
        };

        function isMobile() {
            if ($(window).width() <= 767) {
                return true;
            }

            return false;
        }

        if ($('.page-sidebar').length) {
            sidebar().init();
        }
    }


    function initFilterSidebar() {
        if ($(window).width() > 767) {
            $(window).on("scroll", function () {
                var $getHeightFooter = $(".footer").innerHeight();
                var $getHeightHeader = $(".header").innerHeight();
                var $totalHeight = $getHeightFooter + $getHeightHeader;

                var scrollHeight = $(document).height();
                var scrollPosition = $(window).height() + $(window).scrollTop();
                if ((scrollHeight - scrollPosition) / scrollHeight <= 0.001) {
                    $(".fsc-container.fsc-buttons").css("padding-bottom", "30px");
                    $(".fixed-sidebar .fs-scroll").addClass("bottom-scroll");
                    $(".fixed-sidebar .fs-scroll").css("bottom", $totalHeight + "px");
                    $(".fixed-sidebar .fs-scroll").css("position", "absolute");
                    $(".fixed-sidebar .fs-scroll > .fsc-container:first-child()").css("margin-top", $totalHeight + "px");
                } else {
                    $(".fsc-container.fsc-buttons").css("padding-top", "30px");
                    $(".fsc-container.fsc-buttons").css("padding-bottom", "135px");
                    //$(".fixed-sidebar").css("bottom", "auto");
                    $(".fixed-sidebar .fs-scroll").removeClass("bottom-scroll");
                    $(".fixed-sidebar .fs-scroll").css("bottom", "auto");
                    $(".fixed-sidebar .fs-scroll").css("position", "relative");
                    $(".fixed-sidebar .fs-scroll > .fsc-container:first-child()").css("margin-top", "auto");
                }
            });
        }

        var $filterWidth = $(".fs-content").innerWidth();
        $(".fs-content").css("margin-left", -$filterWidth + "px");
        $(".fs-content").niceScroll({
            cursorcolor: "#9D9D9C",
            cursorwidth: "6px",
            cursorborderradius: "5px",
            cursorborder: "1px solid transparent",
            touchbehavior: true,
            preventmultitouchscrolling: true,
            enablekeyboard: true
        });

        $('.fs-scroll').niceScroll({ cursorcolor: "#b3b3b3", zindex: "99999999", cursorwidth: "6px", cursorborderradius: "5px", cursorborder: "1px solid transparent", touchbehavior: true });
        var beforeLastItemheight = $(".fs-scroll .fsc-container:last").prev("div").outerHeight();
        $(".fs-scroll .fsc-container:last").prev("div").attr("style", `padding-bottom: `+(beforeLastItemheight+beforeLastItemheight)+`px;`);
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function initSelectLanguages() {
        /* language menu */
        $(function() {
            var ddlData = [
                { text: 'EN', value: 1, imageSrc: getAppPrefix() + '/assets/images/gb.svg' },
                { text: 'CN', value: 2, imageSrc: getAppPrefix() + '/assets/images/cn.svg' },
                { text: 'FR', value: 3, imageSrc: getAppPrefix() + '/assets/images/fr.svg' }
            ];

            // $('#SelectLanguage').ddslick({ data: ddlData, width: "auto", imagePosition: "left", onSelected: function (selectedData) { } });
        });

        /* auto scroll */
        $('#SelectLanguage .dd-options, .header ul.st-parent, .header .st-subcat, .fs-scroll, .fsc-ul-cat, ul.h-dd-menu').niceScroll({ cursorcolor: '#000', zindex: '99999999', cursorwidth: '6px', cursorborderradius: '5px', cursorborder: '1px solid transparent', touchbehavior: true });

        $('ul.st-parent li').each(function() {
            var $this = $(this);
            $this.find('a').on('click', function() {
                event.preventDefault();
                $(this).siblings('.st-subcat').show();
            });
            if ($this.hasClass('back')) {
                $(this).find('i').on('click', function() {
                    event.preventDefault();
                    $(this).closest('.st-subcat').hide();
                });
            }
        });

        /* search sidebar category */
        var $parentCatHeight = $('.fsc-categories .st-parent').innerHeight();
        $('.fsc-categories .st-subcat').css('min-height', $parentCatHeight + 'px');
    }

    /* number only */
    function isNumberKey(evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode != 46 && charCode > 31 &&
            (charCode < 48 || charCode > 57)) { return false; }

        return true;
    }

    /* validate fields */
    function validateFields(selector) {
        var error = false;
        if (!selector) {
            selector = '.required';
        }

        $(selector).each(function() {
            var $this = $(this);
            if ($this.val().trim() == '') {
                $this.addClass('error-con');
                error = true;
            } else {
                $this.removeClass('error-con');
            }
        });
        return error;
    }

    function validateBlurFields() {
        $('.required').each(function() {
            var $this = $(this);
            $this.blur(function() {
                if ($this.val() == '') {
                    $this.addClass('error-con');
                } else {
                    $this.removeClass('error-con');
                }
            });
        });
    }
    function splitDate(date) {
        var parts = date.split('-');
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    function validateDateComparison(dateRange) {
        if (splitDate(dateRange) > splitDate(dateRange)) {
            return false;
        } else if (!dateRange || !dateRange) {
            return false;
        } else { return true; }
    }

    function adjustMainPaddingTop() {
        /* add padding-top on main class */
        var $headerHeight = $('.header').innerHeight();
        $('.main').css('padding-top', $headerHeight + 'px');
        var $hheaderHeight = $('.header').innerHeight() - 30;
        $('.page-home .main').css('padding-top', $hheaderHeight + 'px');

        if($("body").hasClass("upgrade")){
            var $headerHeight = $(".header").innerHeight();
            var $freemiumHeaderBannerHeight = $(".freemium-header-banner").innerHeight();
            var $computerHeight = $headerHeight + $freemiumHeaderBannerHeight
            $(".main").css("padding-top", $computerHeight  + "px");
        }
    }

    function windowsOnLoad() {
        $(window).on('load', function() {
            alignVertical();
            onSizefixed();
            $(window).on('scroll', function() {
                alignVertical();
                onSizefixed();
            });

            adjustMainPaddingTop();

            $(window).on('resize', adjustMainPaddingTop);

            /* search page */
            if ($(window).width() <= 768) {
                if ($('body').hasClass('page-search')) {
                    $('.fixed-sidebar').removeClass('open');
                    $('.search-container').removeClass('open-sidebar');
                }
            }

            // seller pages mobile menu
            $('#toggle-mobile-menu').click(function() {
                $('.header-top ul.header-menus.tog').slideToggle();
            });

            $('.percentCheckerCustom').on('keyup', function() {
                $(this).removeClass('error-con');
                this.value = this.value.replace(/[^0-9\.\,]/g, '');
                //  var parseValue = parseFloat(this.value);
                //  this.value = parseValue.toFixed(2);
                if (isNaN(this.value)) {
                    $(this).addClass('error-con');
                    return;
                }
                if (parseInt(this.value) > 100) {
                    toastr.error('Maximum percentage value is 100%', 'Invalid Value');
                    $(this).addClass('error-con');
                }
            });

            $('.numbersOnly').on('keyup', function() { this.value = this.value.replace(/[^0-9\.|/]/g, ''); });

            $('.numbersOnlyd').on('keyup', function() {
                $(this).removeClass('error-con');
                this.value = this.value.replace(/[^0-9]/g, '');
                if (isNaN(this.value)) {
                    $(this).addClass('error-con');
                    return;
                }
                if (parseInt($(this).attr('data-max'))) {
                    if (parseInt($(this).attr('data-max')) < parseInt(this.value)) {
                        toastr.error('Maximum value is ' + $(this).attr('data-max'), 'Invalid Value');
                        $(this).addClass('error-con');
                        return;
                    }
                }
                if (parseInt($(this).attr('data-min'))) {
                    if (parseInt($(this).attr('data-min')) > parseInt(this.value)) {
                        toastr.error('Minimum value is ' + $(this).attr('data-min'), 'Invalid Value');
                        $(this).addClass('error-con');
                    }
                }
            });
            $('.numbersOnlyD').on('keyup', function() {
                $(this).removeClass('error-con');
                this.value = this.value.replace(/[^0-9\.\,]/g, '');
                if (isNaN(this.value)) {
                    $(this).addClass('error-con');
                    return;
                }
                if (parseFloat($(this).attr('data-max'))) {
                    if (parseFloat($(this).attr('data-max')) < parseFloat(this.value)) {
                        toastr.error('Maximum value is ' + $(this).attr('data-max'), 'Invalid Value');
                        $(this).addClass('error-con');
                        return;
                    }
                }
                if (parseFloat($(this).attr('data-min'))) {
                    if (parseFloat($(this).attr('data-min')) > parseFloat(this.value)) {
                        toastr.error('Minimum value is ' + $(this).attr('data-min'), 'Invalid Value');
                        $(this).addClass('error-con');
                    }
                }
            });
            $('.numberDecimalOnly').on('keyup', function() { this.value = this.value.replace(/[^0-9\.]/g, ''); });

            $('.phoneNumber').on('keyup', function() { this.value = this.value.replace(/[\+]?[0-9 ]/g, ''); });

            $('.phoneOnly').on('keyup', function() { this.value = this.value.replace(/[^0-9.+() ]/g, ''); });

            $('.charOnly').on('keyup', function() { this.value = this.value.replace(/[^A-Za-z]/g, ''); });

            $('.alphanumericOnly').on('keyup', function() { this.value = this.value.replace(/[^A-Za-z0-9]/g, ''); });

            $('.alphanumericAndSpaceOnly').on('keyup', function() { this.value = this.value.replace(/[^A-Za-z0-9 ]/g, ''); });

            $('.currencyOnly').on('keyup', function() { this.value = this.value.replace(/[^0-9.]/g, ''); });

            $('.charspaceOnly').on('keyup', function() { this.value = this.value.replace(/[^A-Za-z ]/g, ''); });

            $('.domainChars').on('keyup', function() { this.value = this.value.replace(/[^A-Za-z0-9\.-]/g, ''); });

            // $('.emailOnly').on('focusout', function () {

            //    $(this).removeClass('error-con');

            //    if ($(this).val() == "" && !$(this).hasClass('required') && $(this).find('[data-is-mandatory="true"]').length <= 0) {
            //        return false;
            //    }
            //    var regex = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((?!-))((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(\[IPv(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))+[0-1]])|(([a-zA-Z\-0-9]((?!-\.).)+\.)+[a-zA-Z]{2,}))$/;
            //    if (!regex.test($(this).val())) {
            //        $(this).addClass('error-con');
            //    }
            // });

            // Story ARC7190
            $('.emailOnlyForContactUsAdmin').on('focusout', function() {
                $(this).removeClass('error-con');

                if ($(this).val() == '' && !$(this).hasClass('required') && $(this).find('[data-is-mandatory="true"]').length <= 0) {
                    return false;
                }
                var regex = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((?!-))((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(\[IPv(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))+[0-1]])|(([a-zA-Z\-0-9]((?!-\.).)+\.)+[a-zA-Z]{2,}))$/;
                if (!regex.test($(this).val())) {
                    $(this).addClass('error-con');
                    if ($(this).val() == '') {
                        $(this).removeClass('error-con');
                    }
                }
            });

            $(document).on('keypress', '.numbersOnly', function(e) {
                if ((e.which < 48 || e.which > 57)) {
                    e.preventDefault();
                }
            });

            $(document).on('keypress', '.numberDecimalOnly', function(e) {
                var input = this.value;
                if ((e.which < 48 || e.which > 57) && (e.which != 46 || (e.which == 46 && input.indexOf('.') > -1))) {
                    e.preventDefault();
                }
            });

            $(document).on('keypress', '.numberDecimalOnly100Percent', function(e) {
                var input = this.value;
                if ((e.which < 48 || e.which > 57) && (e.which != 46 || (e.which == 46 && input.indexOf('.') > -1))) {
                    e.preventDefault();
                }
            });

            $(document).on('keydown', '.numberDecimalOnly100Percent', function(e) {
                var input = this.value;
                const total = e.target.value + e.key;

                if (parseFloat(total) > 100) {
                    e.preventDefault();
                }
            });

            $(document).on('keypress', '.number2DecimalOnly', function(e) {
                var input = this.value;
                if ((e.which < 48 || e.which > 57) && (e.which != 46 || (e.which == 46 && input.indexOf('.') > -1))) {
                    e.preventDefault();
                } else {
                    if (e.which == 46 && input === '') {
                        e.target.value = '0.';
                    }
                }
            });

            $(document).on('keyup', '.number2DecimalOnly', function(e) {
                var input = this.value.replace(/[^0-9\.]/g, '');
                var arr = input.split('.');
                if (arr.length > 2) {
                    input = arr[0] + '.' + arr[1];
                    arr = input.split('.');
                }
                if (input === '.') {
                    input = '';
                } else {
                    if (typeof arr[1] !== 'undefined' && arr[1].length > 2) {
                        arr[1] = arr[1].substr(0, 2);
                    }
                    input = arr[0];
                    if (typeof arr[1] !== 'undefined') {
                        input = input + '.' + arr[1];
                    }
                }
                this.value = input;
            });

            $(document).on('focusout', '.number2DecimalOnly', function(e) {
                var input = this.value;
                var pattern = new RegExp(/^(?=.*[0-9])\d*.$/i);
                if (pattern.test(input)) {
                    this.value = input.replace('.', '');
                }
            });

            function setGoogleMap(sender) {
                var txtLocation = $(sender);
                var ifMap = $(txtLocation.parent()).find('#embed-map-display').children('iframe');
                var ifMapSrc = ifMap.attr('src');
                if (txtLocation.val().trim() !== '') {
                    var newSrc = ifMapSrc.substr(0, ifMapSrc.indexOf('?q=') + 3) + txtLocation.val() + ifMapSrc.substr(ifMapSrc.indexOf('&'));
                    if (ifMapSrc != newSrc) {
                        ifMap.attr('src', newSrc);
                    }
                }
            }

            $(document).on('onBlur', '.location-value', function(sender) {
                var txtLocation = $(sender);
                var ifMap = $(txtLocation.parent()).find('#embed-map-display').children('iframe');
                var ifMapSrc = ifMap.attr('src');
                if (txtLocation.val().trim() !== '') {
                    var newSrc = ifMapSrc.substr(0, ifMapSrc.indexOf('?q=') + 3) + txtLocation.val() + ifMapSrc.substr(ifMapSrc.indexOf('&'));
                    if (ifMapSrc != newSrc) {
                        ifMap.attr('src', newSrc);
                    }
                }
            });

            function location_onKeyDown(e, sender) {
                var key = e.keyCode || e.which;
                if (key == 13) {
                    setGoogleMap(sender);
                }
            }
        });

        $('.sc-upper ul.st-parent li').each(function() {
            var $this = $(this);
            $this.find('a').click(function() {
                $(this).siblings('.st-subcat').show();
                $(this).siblings('.st-subcat').toggleClass('active');

                $(this).parents('ul:eq(0)').css('height', $(this).next('ul').height());
                /* $(".h-st-menus ul.st-parent:eq(0)").css('height' , $(this).next('ul').height() ); */
                // $(".st-subcat.active").each(function(){
                // 	var sibHeight = $(this).height();
                // 	$("ul.st-parent").css('height' , sibHeight);
                // });
            });

            if ($this.hasClass('back')) {
                $(this).find('i').click(function(e) {
                    e.preventDefault();
                    $('.sc-upper ul.st-parent , .sc-upper .st-subcat').css('height', 'auto');
                    $(this).closest('.st-subcat').hide();
                    if ($(this).parents('ul:eq(0)').parents('ul:eq(0)').length) {
                        $('.sc-upper .h-st-menus ul.st-parent:eq(0)').css('height', $(this).parents('ul:eq(0)').parents('ul:eq(0)').height() + 'px');
                    }
                });
            }
        });

        $('#itemNewPrice').on('change', function() {
            this.value = parseFloat(this.value).toFixed(2);
        });

        $('#itemNewPrice').blur(function() {
            this.value = parseFloat(this.value).toFixed(2);
        });
    }

    function alignVertical() {
        $('.align-vertical').each(function() {
            var that = $(this);
            var height = that.height();
            var parentHeight = that.parent().height();
            var padAmount = (parentHeight / 2) - (height / 2);
            that.css('padding-top', padAmount);
        });
    }

    function onSizefixed() {
        var maxHeight = $(window).height();
        var minHeight = $(document).height();
        // if (maxHeight >= minHeight) {
        if (maxHeight > minHeight) {
            $('.footer').addClass('fixed');
        } else {
            // $(".footer").removeClass("fixed");
        }
    }

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function AsciiToText(text) {
        var parser = new DOMParser();
        var dom = parser.parseFromString(text, 'text/html');
        var decodedString = dom.body.textContent;
        return (decodedString);
    }

    function getCookie2(name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function getCookie(name) {
        var value = '; ' + document.cookie;
        var parts = value.split(';');
        var hadCookie = 0;
        // if (parts.length === 2) return parts.pop().split(';').shift();
        if (parts) {
            if (name === 'acceptCookiePolicy') {
                parts.forEach(function(c) {
                    if (c.includes('acceptCookiePolicy')) {
                        hadCookie = 1;
                    }
                });
            }
            if (name === 'guestUserID') {
                parts.forEach(function(c) {
                    if (c.includes('guestUserID')) {
                        if (c.length > 1) {
                            const disect = c.split('=');
                            disect.forEach(function(d) {
                                hadCookie = d;
                            });
                        }
                    }
                });
            }
        }
        return hadCookie;
    }

    function createCookie(name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        } else {
            expires = '';
        }
        document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expires + '; path=/';
    }

    function eraseCookie(name) {
        createCookie(name, '', -1);
    }

    function changeFavicon(src) {
        var link = document.createElement('link');
        var oldLink = document.getElementById('dynamic-favicon');
        link.id = 'dynamic-favicon';
        link.rel = 'shortcut icon';
        link.href = src;
        if (oldLink) {
            document.head.removeChild(oldLink);
        }
        document.head.appendChild(link);
    }

    function getAppPrefix() {
        //        return process.env.APP_PREFIX || '';
        //      Solution above is not working with ajax requests in redux folder, for example:
        //      horizon-frontend/src/redux/accountAction.js
        //      value process.env.APP_PREFIX resolved as undefined
        //
        return '/arcadier_supplychain';
    }

    function getTemplateEnv() {
        //        return process.env.TEMPLATE;
        //      Solution above is not working
        return 'trillia';
    }

    function getServiceAddress(serviceName) {
        console.log('serviceName', serviceName);
        const envAddress = process.env['SERVICE_' + serviceName + '_ADDRESS'];
        console.log('From local config:', serviceName, envAddress);
        const eurekaUrl = process.env.EUREKA_URL;
        if (!eurekaUrl) {
            console.log('EUREKA_URL is missed, using address from local config ');
            return Promise.resolve(envAddress);
        }
        console.log('EUREKA_URL is presented', eurekaUrl + '/' + serviceName);
        return axios.get(eurekaUrl + '/' + serviceName).then(response => {
            const application = get(response, 'data.application');
            const instances = isArray(application.instance) ? application.instance : [application.instance]; // {key:value} || undefined
            const availableInstances = instances.filter(instance => instance.status === 'UP' && instance.vipAddress === envAddress);
            const serviceAddress = availableInstances.length > 0 ? `http://${availableInstances[0].ipAddr}:${availableInstances[0].port.$}` : null;
            console.log('Service ', serviceName, ' url from Eureka ', serviceAddress);
            return serviceAddress;
        });
    }

    return {
        init: function() {
            unbindEvents();
            windowsOnLoad();
            // initSelectLanguages();
        },
        initSidebar: initSidebar,
        validateFields: validateFields,
        validateBlurFields: validateBlurFields,
        isNumberKey: isNumberKey,
        numberWithCommas: numberWithCommas,
        validateDateComparison: validateDateComparison,
        validateEmail: validateEmail,
        splitDate: splitDate,
        getCookie: getCookie,
        createCookie: createCookie,
        eraseCookie: eraseCookie,
        changeFavicon: changeFavicon,
        getAppPrefix: getAppPrefix,
        getTemplateEnv: getTemplateEnv,
        getServiceAddress: getServiceAddress,
        initFilterSidebar: initFilterSidebar,
        initAutoSuggestScroll: function () {
            $(".autocom-box-list").niceScroll({ cursorcolor: "#646363", cursorwidth: "6px", cursorborderradius: "5px", cursorborder: "1px solid transparent", touchbehavior: true });
        },
        initHeaderMenuScroll: function() {
            $('ul.h-dd-menu').niceScroll({ cursorcolor: '#b3b3b3', zindex: '99999999', cursorwidth: '6px', cursorborderradius: '5px', cursorborder: '1px solid transparent', touchbehavior: true });
        }
    };

    function unbindEvents() {
        $('.percentCheckerCustom').off('keyup');
        $('.numbersOnly').off('keyup');
        $('.numbersOnlyd').off('keyup');
        $('.numbersOnlyD').off('keyup');
        $('.numberDecimalOnly').off('keyup');
        $('.phoneNumber').off('keyup');
        $('.phoneOnly').off('keyup');
        $('.charOnly').off('keyup');
        $('.alphanumericOnly').off('keyup');
        $('.alphanumericAndSpaceOnly').off('keyup');
        $('.currencyOnly').off('keyup');
        $('.charspaceOnly').off('keyup');
        $('.domainChars').off('keyup');
        $('.emailOnly').off('keyup');
    }
})();

module.exports = commonModule;
