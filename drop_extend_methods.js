$.drop.extendDrop = function() {
    var wnd = $(window),
            doc = $(document);
    var addmethods = {
        droppable: function(drop) {
            return (drop || this).each(function() {
                var drop = $(this);
                drop.off('mousedown.' + $.drop.nS).on('mousedown.' + $.drop.nS, function(e) {
                    if (!$(e.target).is(':input')) {
                        doc.on('mouseup.' + $.drop.nS, function(e) {
                            drop.css('cursor', '');
                            doc.off('selectstart.' + $.drop.nS + ' mousemove.' + $.drop.nS + ' mouseup.' + $.drop.nS);
                        });
                        var $this = $(this).css('cursor', 'move'),
                                left = e.pageX - $this.offset().left,
                                top = e.pageY - $this.offset().top,
                                w = $this.outerWidth(),
                                h = $this.outerHeight(),
                                wndW = wnd.width(),
                                wndH = wnd.height();
                        doc.on('selectstart.' + $.drop.nS, function(e) {
                            e.preventDefault();
                        });
                        doc.on('mousemove.' + $.drop.nS, function(e) {
                            drop.data('drp').droppableIn = true;
                            var l = e.pageX - left,
                                    t = e.pageY - top;
                            if (!drop.data('drp').droppableLimit) {
                                l = l < 0 ? 0 : l;
                                t = t < 0 ? 0 : t;

                                l = l + w < wndW ? l : wndW - w;
                                t = t + h < wndH ? t : wndH - h;
                            }
                            $this.css({
                                'left': l,
                                'top': t
                            });
                        });
                    }
                });
            });
        },
        noinherit: function(e) {
            return this.each(function() {
                var drop = $(this),
                        drp = drop.data('drp');
                if (drp && !drp.droppableIn) {
                    var method = drp.animate ? 'animate' : 'css',
                            placement = drp.placement,
                            $this = drp.elrun,
                            t = 0,
                            l = 0,
                            $thisW = $this.width(),
                            $thisH = $this.height(),
                            dropW = +drop.actual('width'),
                            dropH = +drop.actual('height'),
                            $thisT = 0,
                            $thisL = 0;

                    if (drp.context && e !== undefined)
                        drp.placement = placement = {'left': parseInt(e.pageX), 'top': parseInt(e.pageY)};

                    if (typeof placement === 'object') {
                        if (placement.left + dropW > wnd.width())
                            placement.left -= dropW;
                        if (placement.top + dropH > wnd.height()) {
                            placement.top -= dropH;
                        }
                        drop[method](placement, {
                            duration: drp.durationOn,
                            queue: false
                        });
                    }
                    else {
                        var $thisPMT = placement.toLowerCase().split(' ');
                        if ($thisPMT[0] === 'bottom' || $thisPMT[1] === 'bottom')
                            t = -drop.actual('outerHeight');
                        if ($thisPMT[0] === 'top' || $thisPMT[1] === 'top')
                            t = $thisH;
                        if ($thisPMT[0] === 'left' || $thisPMT[1] === 'left')
                            l = 0;
                        if ($thisPMT[0] === 'right' || $thisPMT[1] === 'right')
                            l = -dropW - $thisW;
                        if ($thisPMT[0] === 'center')
                            l = -dropW / 2 + $thisW / 2;
                        if ($thisPMT[1] === 'center')
                            t = -dropH / 2 + $thisH / 2;
                        $thisT = $this.offset().top + t;
                        $thisL = $this.offset().left + l;
                        if ($thisL < 0)
                            $thisL = 0;
                        drop[method]({
                            'bottom': 'auto',
                            'top': $thisT,
                            'left': $thisL
                        }, {
                            duration: drp.durationOn,
                            queue: false
                        });
                    }
                }
            });
        },
        heightContent: function(drop) {
            return (drop || this).each(function() {
                function _setHeight(h) {
                    return this.css('height', h > drp.minHeightContent ? h : drp.minHeightContent);
                }
                var drop = $(this),
                        drp = drop.data('drp');
                if (!drp.limitSize)
                    return false;

                var dropV = drop.is(':visible'),
                        forCenter = drp.forCenter;
                if (!dropV) {
                    drop.show();
                    if (forCenter)
                        forCenter.show();
                }

                if (drp.dropContent) {
                    var el = drop.find($(drp.dropContent)).filter(':visible');
                    if (el.data('jsp'))
                        el.data('jsp').destroy();
                    el = drop.find($(drp.dropContent)).filter(':visible').css({'height': ''});
                    if ($.existsN(el)) {
                        var refer = drp.elrun,
                                api = false,
                                elCH = el.css({'overflow': ''}).outerHeight();

                        try {
                            api = el.jScrollPane(scrollPane).data('jsp');
                            if ($.existsN(el.find('.jspPane')))
                                elCH = el.find('.jspPane').outerHeight();
                        } catch (err) {
                            el.css('overflow', 'auto');
                        }

                        var dropH = drop.outerHeight(),
                                dropHm = drop.height(),
                                footerHeader = drop.find($(drp.dropHeader)).outerHeight() + drop.find($(drp.dropFooter)).outerHeight();

                        if (drp.place === 'noinherit') {
                            var mayHeight = 0,
                                    placement = drp.placement;
                            if (typeof placement === 'object') {
                                if (placement.top !== undefined)
                                    mayHeight = wnd.height() - placement.top - footerHeader - (dropH - dropHm);
                                if (placement.bottom !== undefined)
                                    mayHeight = placement.bottom - footerHeader - (dropH - dropHm);
                            }
                            else {
                                if (placement.search(/top/) >= 0)
                                    mayHeight = wnd.height() - refer.offset().top - footerHeader - refer.outerHeight() - (dropH - dropHm);
                                if (placement.search(/bottom/) >= 0)
                                    mayHeight = refer.offset().top - footerHeader - (dropH - dropHm);
                            }
                            if (mayHeight > elCH)
                                _setHeight.call(el, elCH);
                            else
                                _setHeight.call(el, mayHeight);
                        }
                        else {
                            if (elCH + footerHeader > dropHm)
                                _setHeight.call(el, dropHm - footerHeader);
                            else
                                _setHeight.call(el, elCH);
                        }
                        if (api)
                            api.reinitialise();
                    }
                }
                if (!dropV) {
                    drop.hide();
                    if (forCenter)
                        forCenter.hide();
                }
            });
        },
        limitSize: function(drop) {
            return (drop || this).each(function() {
                var drop = $(this),
                        drp = drop.data('drp');
                if (drp.limitSize && drp.place === 'center') {
                    var dropV = drop.is(':visible');
                    if (!dropV) {
                        drop.show();
                        if (drp.forCenter)
                            drp.forCenter.show();
                    }
                    drop.css({
                        'width': '',
                        'height': ''
                    });
                    if (drp.dropContent) {
                        var el = drop.find($(drp.dropContent)).filter(':visible');
                        if (el.data('jsp'))
                            el.data('jsp').destroy();
                        drop.find($(drp.dropContent)).filter(':visible').css({'height': ''});
                    }
                    var wndW = wnd.width(),
                            wndH = wnd.height(),
                            w = drop.outerWidth(),
                            h = drop.outerHeight(),
                            ws = drop.width(),
                            hs = drop.height();
                    if (w > wndW)
                        drop.css('width', wndW - w + ws);
                    if (h > wndH)
                        drop.css('height', wndH - h + hs);
                    if (!dropV) {
                        drop.hide();
                        if (drp.forCenter)
                            drp.forCenter.hide();
                    }
                }
            });
        },
        galleries: function(drop, opt) {
            var relA = $.drop.drp.galleries[opt.rel],
                    self = this;

            if (!relA)
                return false;

            var relL = relA.length,
                    relP = $.inArray(opt.source ? opt.source : drop.find(opt.placePaste).find('img').attr('src'), relA);
            drop.find(opt.prev).add(drop.find(opt.next)).hide().attr('disabled', 'disabled');
            if (relP === -1)
                return false;
            if (relP !== relL - 1)
                drop.find(opt.next).show().removeAttr('disabled');
            if (relP !== 0)
                drop.find(opt.prev).show().removeAttr('disabled');
            if (opt.cycle)
                drop.find(opt.prev).add(drop.find(opt.next)).show().removeAttr('disabled');

            drop.find(opt.prev).add(drop.find(opt.next)).attr('data-rel', opt.rel).off('click.' + $.drop.nS).on('click.' + $.drop.nS, function(e) {
                e.stopPropagation();
                var $thisB = $(this).attr('disabled', 'disabled'),
                        relNext = relP + ($thisB.is(opt.prev) ? -1 : 1);
                if (opt.cycle) {
                    if (relNext >= relL)
                        relNext = 0;
                    if (relNext < 0)
                        relNext = relL - 1;
                }
                if (relA[relNext]) {
                    var $this = $('[data-source="' + relA[relP] + '"][rel], [href="' + relA[relP] + '"][rel]').filter(':last'),
                            $next = $('[data-source="' + relA[relNext] + '"][rel], [href="' + relA[relNext] + '"][rel]').filter(':last');
                    self.close.call($($this.data('drop')), undefined, function() {
                        self.open.call($next, $.extend(opt, {source: relA[relNext], rel: opt.rel}), undefined);
                    });
                }
            });
            return self;
        },
        placeBeforeShow: function(drop, $this, place, placeBeforeShow, e) {
            var self = this;
            if (!self._isScrollable($('body').get(0)))
                $('body').css('overflow', 'hidden');
            $('body').css('overflow-x', 'hidden')

            if (place === 'inherit')
                return false;
            var pmt = placeBeforeShow.toLowerCase().split(' '),
                    t = -drop.actual('outerHeight'),
                    l = -drop.actual('outerWidth');
            if (pmt[0] === 'center' || pmt[1] === 'center') {
                self._checkMethod(function() {
                    self[place].call(drop, e);
                });
                t = drop.css('top');
                l = drop.css('left');
            }
            if (pmt[0] === 'bottom' || pmt[1] === 'bottom')
                t = wnd.height();
            if (pmt[0] === 'right' || pmt[1] === 'right')
                l = wnd.width();
            if (pmt[0] === 'center' || pmt[1] === 'center') {
                if (pmt[0] === 'left')
                    l = -drop.actual('outerWidth');
                if (pmt[0] === 'right')
                    l = wnd.width();
                if (pmt[1] === 'top')
                    t = -drop.actual('outerHeight');
                if (pmt[1] === 'bottom')
                    t = wnd.height();
            }
            drop.css({
                'left': l, 'top': t
            });
            if (pmt[0] === 'inherit')
                drop.css({
                    'left': $this.offset().left,
                    'top': $this.offset().top
                });
            return this;
        },
        placeAfterClose: function(drop, $this, opt) {
            if (!this._isScrollable($('body').get(0)))
                $('body').css('overflow', 'hidden');
            $('body').css('overflow-x', 'hidden')
            var
                    method = opt.animate ? 'animate' : 'css',
                    pmt = opt.placeAfterClose.toLowerCase().split(' '),
                    t = -drop.actual('outerHeight'),
                    l = -drop.actual('outerWidth');
            if (pmt[0] === 'bottom' || pmt[1] === 'bottom')
                t = wnd.height();
            if (pmt[0] === 'right' || pmt[1] === 'right')
                l = wnd.width();
            if (pmt[0] === 'center' || pmt[1] === 'center') {
                if (pmt[0] === 'left') {
                    l = -drop.actual('outerWidth');
                    t = drop.css('top');
                }
                if (pmt[0] === 'right') {
                    l = wnd.width();
                    t = drop.css('top');
                }
                if (pmt[1] === 'top') {
                    t = -drop.actual('outerHeight');
                    l = drop.css('left');
                }
                if (pmt[1] === 'bottom') {
                    t = wnd.height();
                    l = drop.css('left');
                }
            }
            if (pmt[0] !== 'center' || pmt[1] !== 'center')
                drop.stop()[method]({
                    'top': t,
                    'left': l
                }, {
                    queue: false,
                    duration: opt.durationOff
                });
            if (pmt[0] === 'inherit')
                drop.stop()[method]({
                    'left': $this.offset().left,
                    'top': $this.offset().top
                }, {
                    queue: false,
                    duration: opt.durationOff
                });
            return this;
        },
        confirmPrompt: function(opt, hashChange, _confirmF, e) {
            var self = this;
            if (opt.confirm) {
                if (!$.exists('[data-drop="' + opt.confirmBtnDrop + '"]'))
                    var confirmBtn = $('<div><button></button></div>').appendTo($('body')).hide().children().attr('data-drop', opt.confirmBtnDrop);
                else
                    confirmBtn = $('[data-drop="' + opt.confirmBtnDrop + '"]');
                confirmBtn.data({
                    'drop': opt.confirmBtnDrop,
                    'confirm': true
                });
                if (!$.exists(opt.confirmBtnDrop))
                    var drop = self._pasteDrop($.extend({}, opt, confirmBtn.data()), opt.patternConfirm);
                else
                    drop = self._pasteDrop($.extend({}, opt, confirmBtn.data()), $(opt.confirmBtnDrop));

                self._show.call(confirmBtn, drop, e, opt, hashChange);

                $(opt.confirmActionBtn).off('click.' + $.drop.nS).on('click.' + $.drop.nS, function(e) {
                    e.stopPropagation();
                    self.close.call($(opt.confirmBtnDrop));
                    if (opt.source)
                        _confirmF();
                });
            }
            if (opt.prompt) {
                if (!$.exists('[data-drop="' + opt.promptBtnDrop + '"]'))
                    var promptBtn = $('<div><button></button></div>').appendTo($('body')).hide().children().attr('data-drop', opt.promptBtnDrop);
                else
                    promptBtn = $('[data-drop="' + opt.promptBtnDrop + '"]');
                promptBtn.data({
                    'drop': opt.promptBtnDrop,
                    'prompt': true,
                    'promptInputValue': opt.promptInputValue
                });
                if (!$.exists(opt.promptBtnDrop))
                    var drop = self._pasteDrop($.extend({}, opt, promptBtn.data()), opt.patternPrompt);
                else
                    drop = self._pasteDrop($.extend({}, opt, promptBtn.data()), $(opt.promptBtnDrop));

                self._show.call(promptBtn, drop, e, opt, hashChange);

                $(opt.promptActionBtn).off('click.' + $.drop.nS).on('click.' + $.drop.nS, function(e) {
                    e.stopPropagation();
                    self.close.call($(opt.promptBtnDrop));
                    function getUrlVars(url) {
                        var hash, myJson = {}, hashes = url.slice(url.indexOf('?') + 1).split('&');
                        for (var i = 0; i < hashes.length; i++) {
                            hash = hashes[i].split('=');
                            myJson[hash[0]] = hash[1];
                        }
                        return myJson;
                    }

                    opt.dataPrompt = getUrlVars($(this).closest('form').serialize());
                    if (opt.source)
                        _confirmF();
                });
            }
            return this;
        }
    };
    var newMethods = {};
    for (var i = 0, length = arguments.length; i < length; i++)
        if (arguments[i] in addmethods)
            newMethods[arguments[i]] = addmethods[arguments[i]];
    this.setMethods(newMethods);
    return this;
};