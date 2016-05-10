angular.module('appFilters', [])

/*Filter để bind dữ liệu , dùng ng-bind-html="variable | unsafe" <=> ng-bind-html-unsafe*/
.filter('unsafe', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
}])

.filter('toDate', function() {
    return function(input) {
        return new Date(input);
    };
})

.filter('fromNow', function() {
    return function(date) {
        return moment(date).fromNow();
    };
})

.filter('startFrom', function() {
    return function(input, start) {
        if (input) {
            start = +start; /*parse to int*/
            return input.slice(start);
        }
        return [];
    };
})

.filter('getBadge', function() {
    return function(items, score) {
        var filtered = [];
        if (items) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.score <= score) {
                    filtered.push(item);
                    break;
                }
            }
        }
        return filtered;
    };
})

.filter('checkOnline', function() {
    return function(items, user) {
        if (items) {
            for (var i = 0; i < items.length; i++) {
                if (items[i] == user) {
                    return true;
                }
            }
            return false;
        }
        return false;
    };
})

.filter('checkFavorite', function() {
    return function(items, question) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.questionId == question) {
                return true;
            }
        }
        return false;
    };
})

.filter('checkVoteUp', function() {
    return function(items, question) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.questionId == question && item.type === true) {
                return true;
            }
        }
        return false;
    };
})

.filter('checkAnswerVoteUp', function() {
    return function(items, answer) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.answerId == answer && item.type === true) {
                return true;
            }
        }
        return false;
    };
})

.filter('countByQuestion', function() {
    return function(items, question) {
        var number = 0;
        if (items) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.questionId == question) {
                    number++;
                }
            }
        }
        return number;
    };
})

.filter('checkVoteDown', function() {
    return function(items, question) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.questionId == question && item.type === false) {
                return true;
            }
        }
        return false;
    };
})

.filter('checkAnswerVoteDown', function() {
    return function(items, answer) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.answerId == answer && item.type === false) {
                return true;
            }
        }
        return false;
    };
})

.filter('checkHaveAcepted', function() {
    return function(items) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.isAcepted === true) {
                return false;
            }
        }
        return true;
    };
})

.filter('friendlyUrl', function() {
    return function(item) {
        if (item) {
            var str = item.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
            str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
            str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
            str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
            str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
            str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
            str = str.replace(/(đ)/g, 'd');
            str = str.replace(/(À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ)/g, 'A');
            str = str.replace(/(È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ)/g, 'E');
            str = str.replace(/(Ì|Í|Ị|Ỉ|Ĩ)/g, 'I');
            str = str.replace(/(Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ)/g, 'O');
            str = str.replace(/(Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ)/g, 'U');
            str = str.replace(/(Ỳ|Ý|Ỵ|Ỷ|Ỹ)/g, 'Y');
            str = str.replace(/(Đ)/g, 'D');
            str = str.replace(/[^A-Za-z0-9 ]/, '');
            str = str.replace(/\s+/g, ' ');
            str = str.trim();
            str = str.toLowerCase();
            str = str.replace(/\s/g, '-');
            return str;
        }
    };
});
