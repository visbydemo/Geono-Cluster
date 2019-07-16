(function () {

    Util = {};

    Util.getUniqueArray = function (arr) {
        let uniqueArray = arr.filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        })
        return uniqueArray;

    }


    Util.getPositiveMoveWithOpacity = function (opacity) {
        return 'rgba(44, 160, 44, ' + opacity + ')';
    }

    Util.getNegativeMoveWithOpacity = function (opacity) {
        return 'rgba(214, 39, 40, ' + opacity + ')';
    }


   Util.deepCopyData = function (dataGiven) {
        //copy an origData oc
        // console.log('data slice is a ', dataGiven)
        var dataOut = dataGiven.slice();
        for (var i = 0; i < dataGiven.length; i++) {
            dataOut[i] = Object.assign({}, dataGiven[i]);
        }
        return dataOut;
    };

    Util.getNumberFromText = function (txt) {
        try {
            return txt.replace(/^\D+/g, '');
        } catch (err) {
            return txt;
        }
    }



    Util.shuffleArray = function(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    //removes the common elem of the smallArr from the biArr
    //only keeps the uncommon elem from the bigArr and returns a new array
    Util.getUncommonElemArr = function (bgArr, smallArr) {
        var finalArr = bgArr.filter(function (el) {
            return !smallArr.includes(el);
        });
        return finalArr;
    }

    Util.getRandomNumberBetween = function (maxA, minA) {
        return Math.random() * (maxA - minA) + minA;
    }

    Util.transposeArray = function (a) {
        return a[0].map(function (_, c) { return a.map(function (r) { return r[c]; }); });
    }



    Util.objToArray = function(obj){
        return Object.keys(obj).map(function (key) { return obj[key]; });
    }
    Util.roundPlaces = function (num, place = 2) {
        return Number(num).toFixed(place)
    }

    Util.getIndicesfromSortArr = function (test, ascending = true) {
        // make list with indices and values
        var indexedTest = test.map(function (e, i) { return { ind: i, val: e } });
        // sort index/value couples, based on values
        if (ascending) {
            indexedTest.sort(function (x, y) { return x.val > y.val ? 1 : x.val == y.val ? 0 : -1 });
        } else {
            indexedTest.sort(function (x, y) { return x.val < y.val ? 1 : x.val == y.val ? 0 : -1 });
        }
        // make list keeping only indices
        indices = indexedTest.map(function (e) { return e.ind });
        return indices;
    }

})();