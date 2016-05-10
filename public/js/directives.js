angular.module('appDirectives', [])
/*So sánh mật khẩu trùng khớp*/
.directive('passwordMatch', [function() {
    return {
        restrict: 'A',
        scope: true,
        require: 'ngModel',
        link: function(scope, elem, attrs, control) {
            var checker = function() {
                /*lấy giá trị của trường mật khẩu*/
                var e1 = scope.$eval(attrs.ngModel);

                /*lấy giá trị của xác nhận mật khẩu*/
                var e2 = scope.$eval(attrs.passwordMatch);
                return e1 == e2;
            };
            scope.$watch(checker, function(n) {
                /*thiết lập form control*/
                control.$setValidity('unique', n);
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
            if ($(element).length > 0) {
                $(element).waypoint(function(direction) {
                    if (direction == 'down') {
                        $('.fixed-menu').fadeIn();
                    } else {
                        $('.fixed-menu').fadeOut('fast');
                    }
                }, {
                    offset: 0
                });
            }
        }
    };
});
