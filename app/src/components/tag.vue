<template>
    <a v-link="{path: '' + tag.permalink}" v-bind:style="{background: color, borderColor: color}">{{tag.name}}</a>
</template>
<script>
    var colorList = [{
        lineColor: '#7dcfb6',
        barColor: '#33948a'
    }, {
        lineColor: '#9dc6d8',
        barColor: '#658d9f'
    }, {
        lineColor: '#00b2ca',
        barColor: '#106e7b'
    }, {
        lineColor: '#1d4e89',
        barColor: '#0f2a4a'
    }, {
        lineColor: '#d2b29a',
        barColor: '#914242'
    }, {
        lineColor: '#e3868f',
        barColor: '#944f56'
    }, {
        lineColor: '#f79256',
        barColor: '#975a35'
    }, {
        lineColor: '#ead98b',
        barColor: '#aa932a'
    }, {
        lineColor: '#955251',
        barColor: '#5f3231'
    }, {
        lineColor: '#c6cbcc',
        barColor: '#717677'
    }];
    var tagToColor = function (tag) {
        tag = tag || '';
        var length = tag.length;
        var code = 0;
        for (var i = 0; i < length; i ++) {
            code += tag.charCodeAt(i);
        }
        return colorList[code % colorList.length].lineColor;
    };
    export default {
        props: ['tag'],
        computed: {
            color: function () {
                return tagToColor(this.tag.name);
            }
        }
    };
</script>
<style lang="sass" scoped>
    a {
        display: block;
        height: 18px;
        line-height: 14px;
        min-width: 60px;
        text-align: center;
        margin-right: 10px;
        padding: 0px 10px;
        border: 1px solid;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        color: #fff;
    }
</style>
