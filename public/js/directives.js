angular.module('appDirectives', [])
/*So sánh mật khẩu trùng khớp*/
.directive('passwordMatch', [function () {
    return {
        restrict: 'A',
        scope:true,
        require: 'ngModel',
        link: function (scope, elem , attrs,control) {
            var checker = function () {

                /*lấy giá trị của trường mật khẩu*/
                var e1 = scope.$eval(attrs.ngModel);

                /*lấy giá trị của xác nhận mật khẩu*/
                var e2 = scope.$eval(attrs.passwordMatch);
                return e1 == e2;
            };
            scope.$watch(checker, function (n) {

                /*thiết lập form control*/
                control.$setValidity("unique", n);
            });
        }
    };
}])
.directive('enforceMaxTags', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngCtrl) {
      var maxTags = attrs.maxTags ? parseInt(attrs.maxTags, '10') : null;

      ngCtrl.$parsers.push(function(value) {
        if (value && maxTags && value.length > maxTags) {
          value.splice(value.length - 1, 1);
        }
        return value;
      });
    }
  };
})
/*Cố định menu trượt dọc*/
.directive('wayPoints', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            if( $(element).length > 0 ){
                    $(element).waypoint(function(direction) {
                       if(direction == "down")
                          $('.fixed-menu').fadeIn();
                       else
                          $('.fixed-menu').fadeOut('fast');

                  }, { offset: 0 });
            }
        }
    };
})
.directive('fbLike', ['$window', '$rootScope', function ($window, $rootScope) {
        return {
            restrict: 'A',
            scope: {
                fbLike: '=?'
            },
            link: function (scope, element, attrs) {
                if (!$window.FB) {
                    /*Load Facebook SDK if not already loaded*/
                    $.getScript('//connect.facebook.net/en_US/sdk.js', function () {
                        $window.FB.init({
                            appId: $rootScope.facebookAppId,
                            xfbml: true,
                            version: 'v2.1'
                        });
                        renderLikeButton();
                    });
                } else {
                    renderLikeButton();
                }

      var watchAdded = false;
                function renderLikeButton() {
                    if (!!attrs.fbLike && !scope.fbLike && !watchAdded) {
                        /*wait for data if it hasn't loaded yet*/
          watchAdded = true;
                        var unbindWatch = scope.$watch('fbLike', function (newValue, oldValue) {
              if (newValue) {
                renderLikeButton();

              /*only need to run once*/
              unbindWatch();
            }

                        });
                        return;
                    } else {
                        element.html('<div class="fb-like"' +(!!scope.fbLike ? ' data-href="' + scope.fbLike + '"' : '') + ' data-layout="standard" data-action="like" data-show-faces="true" data-share="true"></div>');
                        $window.FB.XFBML.parse(element.parent()[0]);
                    }
                }
            }
        };
    }
]);
/*
.directive('googlePlus', [
    '$window', function ($window) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if (!$window.gapi) {
                    // Load Google SDK if not already loaded
                    $.getScript('//apis.google.com/js/platform.js', function () {
                        renderPlusButton();
                    });
                } else {
                    renderPlusButton();
                }

                function renderPlusButton() {
                    element.html('<div class="g-plusone" data-size="medium"></div>');
                    $window.gapi.plusone.go(element.parent()[0]);
                }
            }
        };
    }
])

.directive('tweet', [
    '$window', function ($window) {
        return {
            restrict: 'A',
            scope: {
                tweet: '='
            },
            link: function (scope, element, attrs) {
                if (!$window.twttr) {
                    // Load Twitter SDK if not already loaded
                    $.getScript('//platform.twitter.com/widgets.js', function () {
                        renderTweetButton();
                    });
                } else {
                    renderTweetButton();
                }

      var watchAdded = false;
                function renderTweetButton() {
                    if (!scope.tweet && !watchAdded) {
                        // wait for data if it hasn't loaded yet
          watchAdded = true;
                        var unbindWatch = scope.$watch('tweet', function (newValue, oldValue) {
              if (newValue) {
                                renderTweetButton();

                // only need to run once
                unbindWatch();
            }
                        });
                        return;
                    } else {
                        element.html('<a href="https://twitter.com/share" class="twitter-share-button" data-text="' + scope.tweet + '">Tweet</a>');
                        $window.twttr.widgets.load(element.parent()[0]);
                    }
                }
            }
        };
    }
]);*/
