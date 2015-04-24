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