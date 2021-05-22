---
title: JS开发datepicker
date: 2017-05-21 10:14:49
tags:
- JS
- 组件
---

### 基础知识

首先，需要知道new Date()这个参数的基本使用：

- 传入new Date(2017, 4, 20)，的时候，由于月份的索引是从0-11的，所以，传入2017, 4, 20的时候，实际的显示的月份是2017年5月20日
- 月份和日期位会自动进位和退位，例如月份位小于0大于11，日期位等于小于0和大于本月日期数
- 拿到当月第一天是这样写的：new Date(year, month-1, 1)
- 拿到当月最后一天是这样写的：new Date(year, month, 0)
- .getDay()获取的的是这个日期的星期几，星期一~星期天对应[1, 2, 3, 4, 5, 6, 0]

其次，需要知道js的一些新的API：

- document.querySelector()获取的是CSS选择器，即传入的参数是'.exampleClass'或'.#exampleID'，需要将字符串传进去，获取的就是第一个匹配的class
- 如果想获取多个同class的CSS选择器，使用document.querySelectorAll
- $element.classList.add()可以添加class
- $element.classList.remove()可以移除特定class
- $element.dataset.xx可以访问到dom元素里自定义属性data-xx，返回的值就是xx
- 注意好编码习惯，例如一个dom元素起名就用$开头，如$wrapper


### 开发思路

<!--more-->

日历中，首先需要知道这个月的第一天是星期几，这个月的最后一天的日期，上个月最后一天的日期。

这个日历中，是7*6行，用i做遍历。分析图如下图：

![image](/images/datepicker.jpg)

首先要分析上个月的日期，在这个月的日历中会显示多少个。这个月的1号是星期四，那么前面就有3个上个月的。所以上个月日期的数量是这个月第一天的星期-1

其次要计算出真实日期date（1是这个月第一天，那么0就是上个月的最后一天，-1就是上个月的倒数第二天）。公式：i - 上个月日期数 + 1

算完真实日期，那么要计算显示的日期，由于date等于0小于0就是说明上个月的，假设上个月最后一天是31号，date为0，倒数第二天是30号，date为-1，那么上个月显示的日期就是利用上个月的最后一天加上date的值（这里date为负数）

算完上个月的，就要算下个月的日期在这个月日历中显示的。可以看出，当真实日期date大于本月的最后一天的日期时，就说明后面的都是下个月的日期，那么显示的日期就是date减去这个月最后一天的日期

### 计算日期的代码：

> datepicker.js


```javascript
(() => {
    var datepicker = {};

    datepicker.getMonthData = function (year, month) {
        // 用于返回数据
        var ret = [];

        // 用于显示哪天高亮
        var todayShow = new Date().getDate();
        // 获得这个月的第一天
        var firstDay = new Date(year, month - 1, 1);
        // 获得这个月的第一天是星期几，用于判断前面的数
        var firstDayWeekDay = firstDay.getDay();
        // 如果获得这个是星期天，将getDay的0重置为7
        if (firstDayWeekDay === 0)
            firstDayWeekDay = 7;

        // 用于日历头部的显示
        HeadYear = firstDay.getFullYear();
        HeadMonth = firstDay.getMonth() + 1;

        // 获得这个月的最后一天和日期
        var lastDay = new Date(year, month, 0);
        var lastDate = lastDay.getDate();

        // 获得上个月的最后一天
        var lastDayOfLastMonth = new Date(year, month - 1, 0);
        var lastDateOfLastMonth = lastDayOfLastMonth.getDate();

        // 用于判断第一行显示多少个上一个月的日期。
        // 如果这个月的第一天是星期一，那么上一个月就没有日期显示
        // 如果这个月的第一天是星期二，那么上一个月就显示一个日期在星期一的位置
        // 因此，上一个月需要显示日期的数量是这个月的第一天的星期几 -1.
        var preMonthDayCount = firstDayWeekDay - 1;

        for (var i = 0; i < 7 * 6; i++) {
            // 利用i获取每一天的真实日期
            // 假设上个月有2天在这个日历内，那么这个月的2号就是星期四
            // 当i等于3的时候，就是星期四
            // 3 - 2 = 1，再加1才是真实日期
            // 所以利用i拿到真实日期公式：i - 上个月日期显示的数量 + 1.
            var date = i - preMonthDayCount + 1;
            // showDate用于修正真实日期，用于显示
            var showDate = date;
            // showMonth用于统计该日期真实月份
            var thisMonth = month;

            // 统计哪些不是本月的日期，设置实际月份和现实日期（最好将日期写下来研究）
            if (date <= 0) {
                // 当这个data数值等于零或小于零时，就说明遍历的这个日期是上一个月的
                thisMonth = month - 1;
                showDate = lastDateOfLastMonth + date;
            } else if (date > lastDate) {
                //下个月的，比如这个月有30日，多出2日，date显示是31，32，则是下月的1、2号
                thisMonth = month + 1;
                showDate = showDate - lastDate;
            }

            //如果-1的时候变成0，说明上月份是上年12月
            if (thisMonth === 0)
                thisMonth = 12;
            //如果+1的时候变成13，说下月份是下年1月
            if (thisMonth === 13)
                thisMonth = 1;

            ret.push(
                {
                    month: thisMonth,  // 每个日期的实际月份
                    date: date, // 真实日期，有负数情况，date为1时作为本月的1号
                    showDate: showDate // 显示日期
                }
            );
        }

        console.log(ret);

        return {
            year: HeadYear,
            month: HeadMonth,
            lastDate,  // 传入最后一天的日期，用来判断渲染颜色
            days: ret
        };

    };

    window.datepicker = datepicker;
})();
```

### 渲染和事件行为代码：

> main.js


```javascript
(() => {
    var datepicker = window.datepicker;

    var monthData;

    var $wrapper;

    var $input;

    var isOpen;

    // 渲染函数
    datepicker.buildUi = function (year, month) {
        // 需要加载完datepicker.js才加载本js
        monthData = datepicker.getMonthData(year, month);

        // 拼接<td></td>中的内容
        var html =
            '<div class="ui-datepicker-header">' +
            '<a href="javascript:;" class="ui-datepicker-btn ui-datepicker-prev-btn">&lt</a>' +
            '<a href="javascript:;" class="ui-datepicker-btn ui-datepicker-next-btn">&gt</a>' +
            '<span class="ui-datepicker-curr-month">' + monthData.year + '-' + monthData.month + '</span>' +
            '</div>' +
            '<div class="ui-datepicker-body">' +
            '<table>' +
            '<thead>' +
            '<tr>' +
            '<th>一</th>' +
            '<th>二</th>' +
            '<th>三</th>' +
            '<th>四</th>' +
            '<th>五</th>' +
            '<th>六</th>' +
            '<th>日</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

        for (var i = 0; i < monthData.days.length; i++) {
            // 用于高亮当天的日期
            var todayEqual = new Date().getDate();
            var monthEqual = new Date().getMonth() + 1;
            var yearEqual = new Date().getFullYear();

            var date = monthData.days[i];
            // 一周的第一天
            if (i % 7 === 0)
                html += '<tr>';

            // 渲染<tr></tr>里的内容，利用data-date保存真实日期
            if (date.date <= 0) {
                // 上个月的日期
                html += '<td style="color: #ccc" data-date="' + date.date + '">' + date.showDate + '</td>';
            } else if (date.date > monthData.lastDate) {
                // 下个月的日期
                html += '<td style="color: #ccc" data-date="' + date.date + '">' + date.showDate + '</td>';
            } else if (date.date === todayEqual && monthData.month === monthEqual && monthData.year === yearEqual) {
                // 等于今天的日期
                html += '<td style="background: rgba(0, 0, 0, 0.1)" data-date="' + date.date + '">' + date.showDate + '</td>';
            } else {
                // 普通的日期
                html += '<td data-date="' + date.date + '">' + date.showDate + '</td>';
            }

            // 一周的最后一天
            if (i % 7 === 6)
                html += '</tr>';
        }

        html += '</tbody>' +
            '</table>' +
            '</div>';

        return html;

    };

    // 开始渲染
    datepicker.render = function (direction, year, month) {

        // 如果没有传值，证明需要重新获取时间的值
        if (!year && !month) {
            year = monthData.year;
            month = monthData.month;
        }

        // 判断是否上下页渲染
        if (direction === 'prev')
            month--
        if (direction === 'next')
            month++
        // 超页调整
        if (month === 0) {
            month = 12;
            year--;
        }

        var html = datepicker.buildUi(year, month);

        // 如果这个元素已经被添加，则直接改变innerHTML
        if (!$wrapper) {
            $wrapper = document.createElement('div');
            $wrapper.className = 'ui-datepicker-wrapper';
            // 将wrapper注入到body内
            document.body.appendChild($wrapper);
        }

        // 将渲染结果插入进去，结合了上一页和下一页功能
        $wrapper.innerHTML = html;

    }

    // datepicker初始化，传入函数
    datepicker.init = function (inputClass, year, month) {
        // 如果没有传入数据，那么就用现在的时间
        if (!year || !month) {
            var today = new Date();
            year = today.getFullYear();
            month = today.getMonth() + 1;
        }

        // 由于是初始渲染而不是上下页渲染，传入一个无用值
        datepicker.render('no-direction', year, month);

        // inputClass = '.example';
        $input = document.querySelector(inputClass);
        isOpen = false;

        $input.addEventListener('click', function () {
            if (isOpen) {
                $wrapper.classList.remove('ui-datepicker-wrapper-show');
                isOpen = false;
            } else {
                // 定位到目标元素下方
                var left = $input.offsetLeft;
                var top = $input.offsetTop;
                var height = $input.offsetHeight;
                $wrapper.style.top = top + height + 2 + 'px';
                $wrapper.style.left = left + 'px';

                $wrapper.classList.add('ui-datepicker-wrapper-show');
                isOpen = true;
            }
        }, false);

        // 使用时间冒泡触发点击事件
        $wrapper.addEventListener('click', function (e) {
            var $target = e.target;

            if ($target.classList.contains('ui-datepicker-prev-btn')) {
                // 上个月
                datepicker.render('prev');
            } else if ($target.classList.contains('ui-datepicker-next-btn')) {
                // 下个月
                datepicker.render('next');
            } else if ($target.tagName.toLowerCase() === 'td') {
                // 点击日期，利用最后一个参数可以通过自我判断负数或超过当月日期数，可以自己进退
                var date = new Date(monthData.year, monthData.month - 1, $target.dataset.date);
                $input.value = format(date);

                $wrapper.classList.remove('ui-datepicker-wrapper-show');
                isOpen = false;
            }

        }, false);

        // toolTip悬浮提示今天星期几，日期
        $wrapper.addEventListener('mouseover', function (e) {
            var $target = e.target;

            if ($target.tagName.toLowerCase() === 'td') {
                var date = new Date(monthData.year, monthData.month - 1, $target.dataset.date);
                var datefix = format(date);

                var day = new Date(monthData.year, monthData.month - 1, $target.dataset.date).getDay();
                var dayfix;

                switch (day) {
                    case 1:
                        dayfix = '星期一';
                        break;
                    case 2:
                        dayfix = '星期二';
                        break;
                    case 3:
                        dayfix = '星期三';
                        break;
                    case 4:
                        dayfix = '星期四';
                        break;
                    case 5:
                        dayfix = '星期五';
                        break;
                    case 6:
                        dayfix = '星期六';
                        break;
                    case 0:
                        dayfix = '星期日';
                        break;
                }

                // 创建悬浮元素
                var toolTipBox;
                toolTipBox = document.createElement("div");
                toolTipBox.className = "tooltip-box";

                // 添加独有id，用于删去
                toolTipBox.id = datefix;

                // 渲染悬浮层内容
                html = '<p>' + datefix + '</p>' + '<p>' + dayfix + '</p>';
                toolTipBox.innerHTML = html;

                // 渲染
                $target.appendChild(toolTipBox);

            }

        }, false);

        // 鼠标离开时移除悬浮层
        $wrapper.addEventListener('mouseout', function (e) {
            var $target = e.target;

            var date = new Date(monthData.year, monthData.month - 1, $target.dataset.date);
            var datefix = format(date);

            var child = document.getElementById(datefix);

            if ($target.tagName.toLowerCase() === 'td') {
                $target.removeChild(child);
            }

        }, false)

    };

    // 对传出来的时间格式进行格式化
    function format(date) {
        ret = '';

        // 小于9的时候加0
        var padding = function (num) {
            if (num <= 9) {
                return '0' + num;
            }
            return num;
        }

        ret += date.getFullYear() + '-';
        ret += padding(date.getMonth() + 1) + '-';
        ret += padding(date.getDate());

        return ret;

    }

    // 点击外部收起日历
    document.addEventListener('click', (e) => {
        var target = e.target;
        if (!$input.contains(target) && !$wrapper.contains(target) && target.tagName.toLowerCase() !== 'a') {
            $wrapper.classList.remove('ui-datepicker-wrapper-show');
            isOpen = false;
        }
    }, false);

})();
```

### CSS代码：

> style.css


```css
.ui-datepicker-wrapper {
    width: 240px;
    font-size: 16px;
    color: #666;
    box-shadow: 2px 2px 8px 2px rgba(128, 128, 128, .3);
    display: none;
    position: absolute;
}

.ui-datepicker-wrapper-show {
    display: block;
}

.ui-datepicker-wrapper .ui-datepicker-header {
    padding: 0 20px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    background: #F0F0F0;
    border-bottom: 1px solid #CCC;
    font-weight: bold;
}

.ui-datepicker-wrapper .ui-datepicker-btn {
    font-family: serif;
    font-size: 20px;
    width: 20px;
    height: 50px;
    line-height: 50px;
    color: #1abc9c;
    text-align: center;
    cursor: pointer;
    text-decoration: none;
}

.ui-datepicker-wrapper .ui-datepicker-prev-btn {
    float: left;
}

.ui-datepicker-wrapper .ui-datepicker-next-btn {
    float: right;
}

.ui-datepicker-wrapper .ui-datepicker-body table {
    width: 100%;
    border-collapse: collapse;
}

.ui-datepicker-wrapper .ui-datepicker-body th,
.ui-datepicker-wrapper .ui-datepicker-body td {
    height: 30px;
    text-align: center;
}

.ui-datepicker-wrapper .ui-datepicker-body th {
    font-size: 12px;
    height: 40px;
    line-height: 40px;
}

.ui-datepicker-wrapper .ui-datepicker-body td {
    border: 1px solid #F0F0F0;
    font-size: 10px;
    width: 14%;
    cursor: pointer;
}

.ui-datepicker-wrapper .ui-datepicker-body td:hover {
    background: rgba(0, 0, 0, 0.1);
}

.tooltip-box {
    display: block;
    background: #fff;
    line-height: 1.6;
    border: 1px solid #1abc9c;
    color: #333;
    padding: 20px;
    font-size: 12px;
    border-radius: 5px;
    overflow: auto;
    width: 80px;
    height: 80px;
    top: 40px;
    position: absolute;
    z-index: 10;
}
```

### html使用方法：

先加载datepicker.js，然后加载main.js，在html里创建一个input元素，给这个input元素设置一个classname，然后传入这个css选择器：


```
datepicker.init('.datepicker', 2017, 5);
```

可以传入年月，这个是真实日期，不用修正，也可以不传

### 主要实现功能

- 点击元素打开datepicker
- 日历渲染
- 上下月切换
- 区分本月和不是本月的日期
- 高亮当天日期
- toolTip显示日期具体信息
- 点击日期输入
- 点击document收起datepicker







